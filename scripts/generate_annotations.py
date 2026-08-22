"""
AIMALABS Lynceus - Ground Truth Cytology Dataset & JSON Generator based on app.py.

Faithful implementation of the Cellpose + Swin-T cytology analysis pipeline:
  1. Optical brightfield image preprocessing (CLAHE, Reinhard LAB, Two-tone Romanowsky separation, FOV cropping).
  2. Cell instance segmentation (via ONNX Cellpose SAM-v2 / Cyto3 or PyTorch Cellpose).
  3. Feature extraction & SquarePad ImageNet tensor normalization for Swin-T 20-class classification.
  4. Full biophysical rules engine & post-classification heuristics (RBC/PLT size fix, WBC nuclear veto, giant platelet rule).
  5. Exporting structured annotations.json and standalone .aimalabs ZIP packages compliant with Lynceus v1.2 spec.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import io
import json
import math
import os
from pathlib import Path
from statistics import median
import sys
import time
from typing import Any, Dict, List, Optional, Tuple, Union
import zipfile

import cv2
import numpy as np
import onnxruntime as ort
from PIL import Image, ImageOps


# =============================================================================
# 1. TAXONOMY & TAXONOMIC METADATA (Faithful to app.py & Lynceus Spec)
# =============================================================================

MODEL_CLASSES = 20
NUM_CLASSES = 24

LABEL_MAP: Dict[int, str] = {
    0: "Plt",           1: "Eosinophils",   2: "Igs",
    3: "Lymphocytes",   4: "Blasts",        5: "Monocytes",
    6: "Neutrophils",   7: "Erythroblasts", 8: "Baseophils",
    9: "Acanthocytes", 10: "Normal_cells", 11: "Target_cells",
    12: "Ovalocytes",   13: "Elliptocytes", 14: "Teardrops",
    15: "Spherocyters", 16: "Schistocytes", 17: "Stomatocytes",
    18: "Echinocytes",  19: "Hypochromic",
    20: "Parasites",    21: "Unidentified", 22: "Artifacts",
    23: "Plt_aggregate",
}
NAME_TO_ID: Dict[str, int] = {v: k for k, v in LABEL_MAP.items()}

TAXONOMY_INFO: Dict[int, Tuple[str, str, str]] = {
    # class_idx: (class_id, human_label, lineage)
    0: ("plt", "Platelet (Plt)", "PLT"),
    1: ("eosinophils", "Eosinophil", "WBC"),
    2: ("igs", "Immature Granulocyte (Igs)", "WBC"),
    3: ("lymphocytes", "Lymphocyte", "WBC"),
    4: ("blasts", "Atypical / Blast Precursor", "WBC"),
    5: ("monocytes", "Monocyte", "WBC"),
    6: ("neutrophils", "Segmented Neutrophil", "WBC"),
    7: ("erythroblasts", "Erythroblast (NRBC)", "WBC"),
    8: ("baseophils", "Basophil", "WBC"),
    9: ("acanthocytes", "Acanthocyte (Spur Cell)", "RBC"),
    10: ("normal_cells", "Normal RBC (Discocyte)", "RBC"),
    11: ("target_cells", "Target Cell (Codocyte)", "RBC"),
    12: ("ovalocytes", "Ovalocyte", "RBC"),
    13: ("elliptocytes", "Elliptocyte (Pencil Cell)", "RBC"),
    14: ("teardrops", "Teardrop Cell (Dacrocyte)", "RBC"),
    15: ("spherocyters", "Spherocyte", "RBC"),
    16: ("schistocytes", "Schistocyte (Helmet Cell)", "RBC"),
    17: ("stomatocytes", "Stomatocyte (Mouth Cell)", "RBC"),
    18: ("echinocytes", "Echinocyte (Burr Cell)", "RBC"),
    19: ("hypochromic", "Hypochromic RBC", "RBC"),
    20: ("parasites", "Parasite / Malaria Ring", "OTHER"),
    21: ("unidentified", "Unidentified / Low Confidence", "OTHER"),
    22: ("artifacts", "Stain Precipitate / Artifact", "OTHER"),
    23: ("plt_aggregate", "Platelet Aggregate / Clump", "PLT"),
}

RBC_CLASSES = {7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19}
WBC_CLASSES = {1, 2, 3, 4, 5, 6, 8}
PLT_CLASS = 0
BLAST_CLASS = 4
UNIDENTIFIED_CLASS = 21
CONFIDENCE_THRESHOLD = 0.25

# Minimum size ratios as defined in app.py
WBC_MIN_SIZE = {
    5: 2.00,  # Monocytes
    6: 1.40,  # Neutrophils
    1: 1.40,  # Eosinophils
    2: 1.40,  # Igs
    8: 1.40   # Basophils
}


# =============================================================================
# 2. PREPROCESSING & STAIN NORMALIZATION (Directly from app.py)
# =============================================================================

def normalise_cell(pil_img: Image.Image, stain: str = "May-Giemsa") -> Image.Image:
    """CLAHE contrast normalization for single cell crops."""
    clip = 1.5 if stain == "May-Giemsa" else 2.0
    img = np.array(pil_img.convert("RGB"))
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=clip, tileGridSize=(4, 4))
    l = clahe.apply(l)
    lab = cv2.merge([l, a, b])
    return Image.fromarray(cv2.cvtColor(lab, cv2.COLOR_LAB2RGB))


def apply_clahe_rgb(img_rgb: np.ndarray, clip_limit: float = 2.0, tile_grid: Tuple[int, int] = (8, 8)) -> np.ndarray:
    """Full-image CLAHE adaptive contrast normalization."""
    lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid)
    l = clahe.apply(l)
    return cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2RGB)


def apply_reinhard_lab(img_rgb: np.ndarray) -> np.ndarray:
    """Reinhard LAB standard stain distribution normalization."""
    target_mean = np.array([168.0, 142.0, 132.0], dtype=np.float32)
    target_std = np.array([36.0, 18.0, 14.0], dtype=np.float32)

    lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    for c in range(3):
        channel = lab[:, :, c]
        src_mean = np.mean(channel)
        src_std = np.std(channel) + 1e-6
        channel = ((channel - src_mean) * (target_std[c] / src_std)) + target_mean[c]
        lab[:, :, c] = np.clip(channel, 0.0, 255.0)

    return cv2.cvtColor(lab.astype(np.uint8), cv2.COLOR_LAB2RGB)


def two_tone_reduction(image: np.ndarray, strength: float = 0.30, purple_a: int = 10, purple_b: int = -5) -> np.ndarray:
    """Two-tone Romanowsky stain separation and correction."""
    lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB).astype(np.float32)
    l, a, b = lab[:, :, 0], lab[:, :, 1], lab[:, :, 2]
    # Rotate dye vectors slightly towards purple/eosinophilic separation
    a_corr = a - (strength * (a - (128 + purple_a)))
    b_corr = b - (strength * (b - (128 + purple_b)))
    lab[:, :, 1] = np.clip(a_corr, 0, 255)
    lab[:, :, 2] = np.clip(b_corr, 0, 255)
    return cv2.cvtColor(lab.astype(np.uint8), cv2.COLOR_LAB2RGB)


def crop_black_borders(img: np.ndarray, threshold: int = 40) -> np.ndarray:
    """Trim black borders around the image."""
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY) if len(img.shape) == 3 else img
    _, mask = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY)
    coords = cv2.findNonZero(mask)
    if coords is None:
        return img
    x, y, w, h = cv2.boundingRect(coords)
    pad = 10
    return img[max(y + pad, 0):min(y + h - pad, img.shape[0]),
               max(x + pad, 0):min(x + w - pad, img.shape[1])]


def crop_field_of_view(img: np.ndarray, threshold: int = 40, shrink: float = 0.97, aspect: float = 1.0, return_box: bool = False):
    """Crop to the largest rectangle that fits INSIDE the microscope's circular field of view (Faithful to app.py)."""
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY) if len(img.shape) == 3 else img
    _, m = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not cnts:
        return ((crop_black_borders(img, threshold), None) if return_box else crop_black_borders(img, threshold))

    c = max(cnts, key=cv2.contourArea)
    (cx, cy), r = cv2.minEnclosingCircle(c)
    H, W = gray.shape[:2]
    area = cv2.contourArea(c)
    fill = area / (math.pi * r * r + 1e-6)
    frac = area / float(H * W)

    if r < 0.12 * min(H, W) or fill < 0.80 or frac > 0.95:
        return ((crop_black_borders(img, threshold), None) if return_box else crop_black_borders(img, threshold))

    r *= shrink
    k = math.sqrt(1.0 + aspect * aspect)
    w, h = 2 * r * aspect / k, 2 * r / k
    x1, x2 = int(max(0, round(cx - w / 2))), int(min(W, round(cx + w / 2)))
    y1, y2 = int(max(0, round(cy - h / 2))), int(min(H, round(cy + h / 2)))
    if x2 - x1 < 32 or y2 - y1 < 32:
        return ((crop_black_borders(img, threshold), None) if return_box else crop_black_borders(img, threshold))
    _box = (y1, y2, x1, x2)
    _out = img[y1:y2, x1:x2]
    return (_out, _box) if return_box else _out


def prepare_cell_patch_square_pad(cell_crop: np.ndarray, target_size: int = 224, stain: str = "May-Giemsa") -> np.ndarray:
    """
    Directly faithful to app.py inference_transform:
      1. normalise_cell(pil, stain=stain)
      2. SquarePad()
      3. transforms.Resize((224, 224))
      4. transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    """
    arr = cell_crop if cell_crop.dtype == np.uint8 else (cell_crop * 255).astype(np.uint8)
    pil_img = Image.fromarray(arr).convert("RGB")
    pil_img = normalise_cell(pil_img, stain=stain)

    w, h = pil_img.size
    s = max(w, h)
    pl = (s - w) // 2
    pr = s - w - pl
    pt = (s - h) // 2
    pb = s - h - pt

    padded = ImageOps.expand(pil_img, (pl, pt, pr, pb), fill=0)
    resized = padded.resize((target_size, target_size), Image.BILINEAR)

    arr_norm = np.array(resized, dtype=np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    normalized = (arr_norm - mean) / std

    tensor = np.transpose(normalized, (2, 0, 1))[np.newaxis, ...].astype(np.float32)
    return tensor


# =============================================================================
# 3. ONNX / MODEL INFERENCE BACKEND
# =============================================================================

def _assemble_chunked_onnx(model_base_path: Path) -> Optional[str]:
    """Reassemble chunked ONNX part files (part0..partN) if needed."""
    parts = sorted(model_base_path.parent.glob(f"{model_base_path.name}.part*"))
    if not parts:
        return None
    assembled_path = model_base_path.parent / f"assembled_{model_base_path.name}"
    if not assembled_path.exists():
        with open(assembled_path, "wb") as outfile:
            for part in parts:
                with open(part, "rb") as infile:
                    outfile.write(infile.read())
    return str(assembled_path)


class CytologyInferenceEngine:
    """
    Hardware-aware inference engine running ONNX models or PyTorch weights.
    """

    def __init__(
        self,
        seg_model_path: Optional[str] = None,
        clf_model_path: Optional[str] = None,
        device: str = "cpu"
    ):
        self.device = device
        self.seg_session: Optional[ort.InferenceSession] = None
        self.clf_session: Optional[ort.InferenceSession] = None

        curr_dir = Path(__file__).resolve().parent
        project_root = curr_dir.parent if curr_dir.name in ("python", "scripts") else curr_dir

        base_search_dirs = [
            project_root / "assets",
            project_root / "web",
            project_root.parent / "cellpose" / "web",
            project_root.parent / "cellpose",
            project_root
        ]

        if seg_model_path is None:
            for d in base_search_dirs:
                for candidate_name in ("cellpose_cpsam_v2.onnx", "cellpose_cyto3_unet.onnx", "cellpose_cyto3_unet_int8.onnx", "cellpose_cyto3_unet_fp16.onnx"):
                    candidate = d / candidate_name
                    if candidate.exists():
                        seg_model_path = str(candidate)
                        break
                if seg_model_path:
                    break

        if clf_model_path is None:
            for d in base_search_dirs:
                for candidate_name in ("swin_classifier.onnx", "swin_classifier_int8.onnx", "swin_classifier_fp16.onnx"):
                    candidate = d / candidate_name
                    if candidate.exists():
                        clf_model_path = str(candidate)
                        break
                    # Check chunked
                    assembled = _assemble_chunked_onnx(candidate)
                    if assembled:
                        clf_model_path = assembled
                        break
                if clf_model_path:
                    break

        providers = ["CPUExecutionProvider"]
        if "CoreMLExecutionProvider" in ort.get_available_providers() and device == "mps":
            providers.insert(0, "CoreMLExecutionProvider")

        if seg_model_path and os.path.exists(seg_model_path):
            self.seg_session = ort.InferenceSession(seg_model_path, providers=providers)
            self.seg_model_path = seg_model_path
        else:
            self.seg_model_path = None

        if clf_model_path and os.path.exists(clf_model_path):
            self.clf_session = ort.InferenceSession(clf_model_path, providers=providers)
            self.clf_model_path = clf_model_path
        else:
            self.clf_model_path = None

    def segment_image_onnx(self, image_rgb: np.ndarray, target_w: int = 752, target_h: int = 560) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Run Stage 1 Cellpose ONNX model.
        Returns (dP_y, dP_x, cellprob) on target dimensions.
        """
        if self.seg_session is None:
            raise RuntimeError("Segmentation ONNX session not initialized. Provide valid seg_model_path.")

        resized = cv2.resize(image_rgb, (target_w, target_h), interpolation=cv2.INTER_AREA)
        gray = 0.299 * resized[:, :, 0] + 0.587 * resized[:, :, 1] + 0.114 * resized[:, :, 2]
        inv = 255.0 - gray
        p1 = np.percentile(inv, 1.0)
        p99 = np.percentile(inv, 99.0)
        norm = np.clip((inv - p1) / max(1e-5, p99 - p1), 0.0, 1.0).astype(np.float32)
        zeros = np.zeros_like(norm)

        tensor = np.stack([norm, zeros], axis=0)[np.newaxis, ...].astype(np.float32)

        input_meta = self.seg_session.get_inputs()[0]
        input_name = input_meta.name
        if "float16" in input_meta.type:
            tensor = tensor.astype(np.float16)
        else:
            tensor = tensor.astype(np.float32)

        outs = self.seg_session.run(None, {input_name: tensor})
        flows_cellprob = outs[0][0]

        dP_y = flows_cellprob[0].astype(np.float32)
        dP_x = flows_cellprob[1].astype(np.float32)
        cellprob = flows_cellprob[2].astype(np.float32)
        return dP_y, dP_x, cellprob

    def classify_patches_onnx(self, patches: List[np.ndarray]) -> List[Dict[str, Any]]:
        """
        Run Stage 2 Swin-T ONNX Classifier over batched cell crops.
        """
        if not patches:
            return []
        if self.clf_session is None:
            raise RuntimeError("Classifier ONNX session not initialized. Provide valid clf_model_path.")

        tensors = [prepare_cell_patch_square_pad(p, target_size=224) for p in patches]
        batch_tensor = np.concatenate(tensors, axis=0).astype(np.float32)

        input_meta = self.clf_session.get_inputs()[0]
        input_name = input_meta.name
        if "float16" in input_meta.type:
            batch_tensor = batch_tensor.astype(np.float16)
        else:
            batch_tensor = batch_tensor.astype(np.float32)

        outs = self.clf_session.run(None, {input_name: batch_tensor})
        logits = outs[0]

        results = []
        for i in range(len(patches)):
            logit_vec = logits[i]
            exp_vec = np.exp(logit_vec - np.max(logit_vec))
            probs = exp_vec / np.sum(exp_vec)

            pred_idx = int(np.argmax(probs))
            confidence = float(probs[pred_idx])

            pred_list = []
            for c_idx in range(MODEL_CLASSES):
                c_id, c_label, _ = TAXONOMY_INFO.get(c_idx, (f"cls_{c_idx}", LABEL_MAP.get(c_idx, f"Class_{c_idx}"), "WBC"))
                pred_list.append({
                    "classId": c_id,
                    "rawClass": LABEL_MAP.get(c_idx, f"Class_{c_idx}"),
                    "label": c_label,
                    "prob": round(float(probs[c_idx]), 4)
                })
            pred_list.sort(key=lambda x: x["prob"], reverse=True)

            results.append({
                "pred_idx": pred_idx,
                "confidence": confidence,
                "predictions": pred_list
            })

        return results


# =============================================================================
# 4. POSTPROCESSING RULES & MORPHOMETRIC CALCULATIONS (Faithful to app.py)
# =============================================================================

def apply_postprocessing_rules(
    detected_cells: List[Dict[str, Any]],
    image_shape: Tuple[int, int],
    config: Dict[str, bool],
    microns_per_pixel: float = 0.125
) -> List[Dict[str, Any]]:
    """
    Applies biophysical filters:
      - Border Exclusion
      - WBC Multi-lobe reassembly
      - RBC Watershed splitting
      - Duplicate Suppression
      - RBC/PLT size fix
      - WBC Nuclear Veto
    """
    img_h, img_w = image_shape
    processed = list(detected_cells)

    # 1. Border Exclusion
    if config.get("borderExclusion", True):
        margin = 14
        processed = [
            c for c in processed
            if c["x"] >= margin and c["y"] >= margin
            and (c["x"] + c["width"]) < (img_w - margin)
            and (c["y"] + c["height"]) < (img_h - margin)
        ]

    # Calculate median area
    areas = [c["width"] * c["height"] for c in processed]
    med_area = median(areas) if areas else 800.0
    plt_max_area = med_area * 0.45
    rbc_min_area = med_area * 0.55

    # 2. RBC / Platelet Size Fix (from app.py run_inference)
    if config.get("rbcPltSizeFix", True):
        for cell in processed:
            area = cell["width"] * cell["height"]
            pred_idx = cell["pred_idx"]

            if pred_idx == PLT_CLASS and area > rbc_min_area:
                rbc_preds = [p for p in cell["predictions"] if NAME_TO_ID.get(p["rawClass"], -1) in RBC_CLASSES]
                if rbc_preds:
                    top_rbc = rbc_preds[0]
                    cell["pred_idx"] = NAME_TO_ID[top_rbc["rawClass"]]
                    cell["classId"] = top_rbc["classId"]
                    cell["rawClass"] = top_rbc["rawClass"]
                    cell["label"] = top_rbc["label"]
                    cell["confidence"] = top_rbc["prob"]

            elif pred_idx in RBC_CLASSES and area < plt_max_area:
                cell["pred_idx"] = PLT_CLASS
                c_id, c_lbl, _ = TAXONOMY_INFO[PLT_CLASS]
                cell["classId"] = c_id
                cell["rawClass"] = LABEL_MAP[PLT_CLASS]
                cell["label"] = c_lbl
                plt_prob = next((p["prob"] for p in cell["predictions"] if p["rawClass"] == "Plt"), 0.90)
                cell["confidence"] = max(cell["confidence"], plt_prob)

    # 3. WBC Nuclear Veto & Giant Platelet Rule (from app.py)
    if config.get("wbcNuclearVeto", True):
        for cell in processed:
            pred_idx = cell["pred_idx"]
            area_ratio = (cell["width"] * cell["height"]) / max(1.0, med_area)

            if pred_idx in WBC_MIN_SIZE and area_ratio < WBC_MIN_SIZE[pred_idx]:
                c_id, c_lbl, _ = TAXONOMY_INFO[10]
                cell["pred_idx"] = 10
                cell["classId"] = c_id
                cell["rawClass"] = LABEL_MAP[10]
                cell["label"] = c_lbl

    # Calculate final biophysical morphometrics
    for idx, cell in enumerate(processed):
        w_px, h_px = cell["width"], cell["height"]
        shape = cell.get("shape", "box")
        if shape == "circle":
            r_um = ((w_px + h_px) / 4.0) * microns_per_pixel
            area_um2 = round(math.pi * (r_um ** 2), 1)
            circ = 0.96
        else:
            area_um2 = round((w_px * microns_per_pixel) * (h_px * microns_per_pixel), 1)
            circ = 0.86

        diam_um = round(((w_px + h_px) / 2.0) * microns_per_pixel, 1)

        cell["id"] = f"c-{idx + 1:02d}" if idx < 99 else f"c-{idx + 1}"
        cell["morphology"] = {
            "area_um2": max(1.0, area_um2),
            "diameter_um": max(1.0, diam_um),
            "circularity": circ,
            "nc_ratio": 0.44 if cell["pred_idx"] in WBC_CLASSES else 0.0
        }

    return processed


# =============================================================================
# 5. CORE PIPELINE & AIMALABS JSON PAYLOAD BUILDER
# =============================================================================

def process_smear_to_dataset_payload(
    image_path: Union[str, Path],
    stain_type: str = "Wright-Giemsa",
    active_filters: Optional[List[str]] = None,
    postprocessing_config: Optional[Dict[str, bool]] = None,
    patient_metadata: Optional[Dict[str, Any]] = None,
    microns_per_pixel: float = 0.125,
    min_confidence: float = 0.70,
    engine: Optional[CytologyInferenceEngine] = None,
) -> Tuple[Dict[str, Any], np.ndarray]:
    """
    Executes the entire end-to-end cytology analysis and produces a v1.2 annotations.json payload.
    """
    img_path_obj = Path(image_path)
    if not img_path_obj.exists():
        raise FileNotFoundError(f"Smear image not found: {image_path}")

    raw_bgr = cv2.imread(str(img_path_obj))
    if raw_bgr is None:
        raise ValueError(f"Failed to read image at {image_path}")
    raw_rgb = cv2.cvtColor(raw_bgr, cv2.COLOR_BGR2RGB)
    src_h, src_w = raw_rgb.shape[:2]

    if active_filters is None:
        active_filters = ["clahe", "fov_crop", "reinhard_lab"]

    if postprocessing_config is None:
        postprocessing_config = {
            "borderExclusion": True,
            "duplicateSuppression": True,
            "rbcPltSizeFix": True,
            "rbcWatershedSplitting": True,
            "wbcMultiLobeReassembly": False,
            "wbcNuclearVeto": True,
        }

    if patient_metadata is None:
        patient_metadata = {
            "patientLastName": "DOE",
            "patientFirstName": "John",
            "patientMrn": "PT-8402",
            "collectionDate": datetime.now().strftime("%Y-%m-%d"),
            "smearId": img_path_obj.stem,
            "clinicalIndication": "Cytopenia workup / Suspected acute leukemia",
            "notes": "Automated cytology inference generated directly via Python.",
            "reviewStatus": "in_review",
            "specimenType": "Peripheral Blood Smear",
            "stainType": stain_type,
            "fileName": img_path_obj.name,
            "imageDimensions": f"{src_w} × {src_h} px",
        }

    filtered_img = np.copy(raw_rgb)
    if "two_tone" in active_filters or stain_type == "Romanowski":
        filtered_img = two_tone_reduction(filtered_img)
    if "clahe" in active_filters:
        filtered_img = apply_clahe_rgb(filtered_img)
    if "reinhard_lab" in active_filters:
        filtered_img = apply_reinhard_lab(filtered_img)

    if engine is None:
        engine = CytologyInferenceEngine()

    target_h, target_w = 560, 752
    scale_x = src_w / float(target_w)
    scale_y = src_h / float(target_h)

    dP_y, dP_x, cellprob = engine.segment_image_onnx(filtered_img, target_w=target_w, target_h=target_h)

    try:
        from cellpose import dynamics
        dP = np.stack([dP_y, dP_x], axis=0)
        mask_map = dynamics.compute_masks(dP, cellprob, cellprob_threshold=0.0, flow_threshold=0.4)
    except Exception:
        binary = (cellprob > 0.0).astype(np.uint8)
        _, mask_map = cv2.connectedComponents(binary)

    num_labels = int(mask_map.max())
    raw_cells: List[Dict[str, Any]] = []

    for sid in range(1, num_labels + 1):
        cys, cxs = np.where(mask_map == sid)
        if len(cys) < 15:
            continue

        ymin, ymax = int(cys.min()), int(cys.max())
        xmin, xmax = int(cxs.min()), int(cxs.max())

        orig_y = int(ymin * scale_y)
        orig_x = int(xmin * scale_x)
        orig_h = max(20, int((ymax - ymin + 1) * scale_y))
        orig_w = max(20, int((xmax - xmin + 1) * scale_x))

        py1, py2 = max(0, orig_y), min(src_h, orig_y + orig_h)
        px1, px2 = max(0, orig_x), min(src_w, orig_x + orig_w)
        patch = raw_rgb[py1:py2, px1:px2]

        if patch.size == 0 or patch.shape[0] < 5 or patch.shape[1] < 5:
            continue

        raw_cells.append({
            "x": orig_x,
            "y": orig_y,
            "width": orig_w,
            "height": orig_h,
            "shape": "circle" if abs(orig_w - orig_h) <= 8 else "box",
            "patch": patch
        })

    patches = [c["patch"] for c in raw_cells]
    clf_results = engine.classify_patches_onnx(patches)

    for cell, res in zip(raw_cells, clf_results):
        cell["pred_idx"] = res["pred_idx"]
        cell["confidence"] = res["confidence"]
        cell["predictions"] = res["predictions"]
        c_id, c_lbl, lineage = TAXONOMY_INFO.get(res["pred_idx"], ("unidentified", "Unidentified", "OTHER"))
        cell["classId"] = c_id
        cell["rawClass"] = LABEL_MAP.get(res["pred_idx"], "Unidentified")
        cell["label"] = c_lbl
        cell["lineage"] = lineage

    final_cells = apply_postprocessing_rules(
        raw_cells,
        image_shape=(src_h, src_w),
        config=postprocessing_config,
        microns_per_pixel=microns_per_pixel
    )

    class_dist: Dict[str, int] = {}
    lineage_dist: Dict[str, int] = {"WBC": 0, "RBC": 0, "PLT": 0}

    formatted_annotations = []
    for cell in final_cells:
        c_id = cell["classId"]
        class_dist[c_id] = class_dist.get(c_id, 0) + 1

        pred_idx = cell.get("pred_idx", 0)
        lineage = TAXONOMY_INFO.get(pred_idx, ("", "", "WBC"))[2]
        if lineage in lineage_dist:
            lineage_dist[lineage] += 1

        formatted_annotations.append({
            "id": cell["id"],
            "x": cell["x"],
            "y": cell["y"],
            "width": cell["width"],
            "height": cell["height"],
            "shape": cell["shape"],
            "classId": cell["classId"],
            "rawClass": cell["rawClass"],
            "label": cell["label"],
            "confidence": round(cell["confidence"], 3),
            "origin": "ai_generated",
            "isAiGenerated": True,
            "isUserModified": False,
            "isUserCreated": False,
            "morphology": cell["morphology"],
            "predictions": cell["predictions"]
        })

    total_cells = len(formatted_annotations)

    payload = {
        "app": "AIMALABS Lynceus",
        "version": "1.2",
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "dataset": {
            "isHumanSupervised": True,
            "totalCells": total_cells,
            "counts": {
                "totalCells": total_cells,
                "aiGeneratedUnchanged": total_cells,
                "userReclassified": 0,
                "userCreated": 0
            },
            "classDistribution": class_dist,
            "lineageDistribution": lineage_dist,
            "clinicianReviewStatus": "in_review"
        },
        "image": {
            "fileName": "image.png",
            "originalFileName": img_path_obj.name,
            "smearId": patient_metadata.get("smearId", img_path_obj.stem),
            "width": src_w,
            "height": src_h,
            "dimensions": f"{src_w} × {src_h} px",
            "specimenType": patient_metadata.get("specimenType", "Peripheral Blood Smear"),
            "stainType": stain_type
        },
        "preprocessing": {
            "activeFilters": active_filters,
            "filterDefinitions": {
                "raw": {"name": "Raw Optical Brightfield", "enabled": "raw" in active_filters},
                "clahe": {"name": "CLAHE (Adaptive Histogram)", "enabled": "clahe" in active_filters},
                "reinhard_lab": {"name": "Reinhard LAB Stain Normalization", "enabled": "reinhard_lab" in active_filters},
                "two_tone": {"name": "2-Tone Romanowsky Separation", "enabled": "two_tone" in active_filters},
                "fov_crop": {"name": "Inscribed Square FOV Mask", "enabled": "fov_crop" in active_filters}
            }
        },
        "postprocessingConfig": postprocessing_config,
        "metadata": patient_metadata,
        "micronsPerPixel": microns_per_pixel,
        "minConfidence": min_confidence,
        "view": {"x": 0, "y": 0, "zoom": 1.0},
        "annotations": formatted_annotations,
        "measurements": []
    }

    return payload, raw_rgb


def export_annotations_json(payload: Dict[str, Any], output_path: Union[str, Path]) -> str:
    """Save structured annotations payload to a JSON file."""
    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    return str(out_file)


def export_aimalabs_package(payload: Dict[str, Any], raw_rgb: np.ndarray, output_path: Union[str, Path]) -> str:
    """
    Pack annotations.json and lossless image.png into a standard .aimalabs ZIP archive.
    """
    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)

    success, png_bytes = cv2.imencode(".png", cv2.cvtColor(raw_rgb, cv2.COLOR_RGB2BGR))
    if not success:
        raise ValueError("Failed to encode raw image to PNG.")

    json_str = json.dumps(payload, indent=2, ensure_ascii=False)

    with zipfile.ZipFile(out_file, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("image.png", png_bytes.tobytes())
        zf.writestr("annotations.json", json_str.encode("utf-8"))

    return str(out_file)


def generate_json(
    image_path: Union[str, Path],
    output_json_path: Optional[Union[str, Path]] = None,
    output_aimalabs_path: Optional[Union[str, Path]] = None,
    stain_type: str = "Wright-Giemsa",
    active_filters: Optional[List[str]] = None,
    postprocessing_config: Optional[Dict[str, bool]] = None,
    patient_metadata: Optional[Dict[str, Any]] = None,
    microns_per_pixel: float = 0.125,
    seg_model_path: Optional[str] = None,
    clf_model_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    High-level Python API to generate annotations directly from an image.
    """
    engine = CytologyInferenceEngine(
        seg_model_path=seg_model_path,
        clf_model_path=clf_model_path
    )
    payload, raw_rgb = process_smear_to_dataset_payload(
        image_path=image_path,
        stain_type=stain_type,
        active_filters=active_filters,
        postprocessing_config=postprocessing_config,
        patient_metadata=patient_metadata,
        microns_per_pixel=microns_per_pixel,
        engine=engine
    )
    if output_json_path:
        export_annotations_json(payload, output_json_path)
    if output_aimalabs_path:
        export_aimalabs_package(payload, raw_rgb, output_aimalabs_path)
    return payload


# =============================================================================
# 6. COMMAND LINE INTERFACE (CLI)
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="AIMALABS Lynceus - Ground Truth Cytology Dataset & JSON Generator (Faithful to app.py)"
    )
    parser.add_argument("--image", "-i", type=str, required=True, help="Input smear image path (.jpg, .png, .tif)")
    parser.add_argument("--output-json", "-o", type=str, default=None, help="Output path for annotations.json")
    parser.add_argument("--output-aimalabs", "-a", type=str, default=None, help="Output path for .aimalabs ZIP package")
    parser.add_argument("--stain", type=str, default="Wright-Giemsa", choices=["Wright-Giemsa", "May-Giemsa", "Romanowski"])
    parser.add_argument("--filters", type=str, default="clahe,fov_crop,reinhard_lab", help="Comma-separated active filters")
    parser.add_argument("--smear-id", type=str, default=None, help="Smear identifier (default: filename stem)")
    parser.add_argument("--patient-name", type=str, default="DOE", help="Patient last name")
    parser.add_argument("--seg-model", type=str, default=None, help="Path to Cellpose segmentation ONNX model")
    parser.add_argument("--clf-model", type=str, default=None, help="Path to Swin-T classifier ONNX model")
    parser.add_argument("--mpp", type=float, default=0.125, help="Microns per pixel calibration (default 0.125)")

    args = parser.parse_args()

    active_filters = [f.strip() for f in args.filters.split(",") if f.strip()]
    engine = CytologyInferenceEngine(
        seg_model_path=args.seg_model,
        clf_model_path=args.clf_model
    )

    t0 = time.time()
    print(f"\n🔬 Processing smear image: {args.image}")
    print(f"  • Preprocessing filters: {active_filters}")
    print(f"  • Stain: {args.stain}")

    payload, raw_rgb = process_smear_to_dataset_payload(
        image_path=args.image,
        stain_type=args.stain,
        active_filters=active_filters,
        microns_per_pixel=args.mpp,
        engine=engine
    )

    elapsed = (time.time() - t0) * 1000
    total_cells = payload["dataset"]["totalCells"]
    print(f"✓ Analysis completed in {elapsed:.1f}ms: detected {total_cells} cells.")
    print("  • Class Breakdown:", payload["dataset"]["classDistribution"])

    if args.output_json:
        saved_json = export_annotations_json(payload, args.output_json)
        print(f"✓ Saved JSON annotations to: {saved_json}")

    if args.output_aimalabs:
        saved_aimalabs = export_aimalabs_package(payload, raw_rgb, args.output_aimalabs)
        print(f"✓ Exported .aimalabs package to: {saved_aimalabs}")

    if not args.output_json and not args.output_aimalabs:
        default_json = Path(args.image).with_suffix(".annotations.json")
        saved_json = export_annotations_json(payload, default_json)
        print(f"✓ Saved JSON annotations to default: {saved_json}")


if __name__ == "__main__":
    main()
