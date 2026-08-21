# `.aimalabs` Dataset Archive Format Specification (v1.2)

The **`.aimalabs`** format is a standardized, self-contained container designed for **Human-in-the-Loop (HITL) supervised training datasets**, cytology foundation model benchmarking, and clinical audit trails.

---

## 1. Archive Architecture

A `.aimalabs` file is a standard **PKZip binary archive** containing two primary assets:

```
lynceus_<patientLastName>_<smearId>_<timestamp>.aimalabs
├── image.png             # Raw optical brightfield image (lossless, unfiltered)
└── annotations.json      # Structured clinical metadata, filter state, and tagged annotations
```

| Member File | MIME Type | Description |
| :--- | :--- | :--- |
| `image.png` | `image/png` | Unmodified, raw brightfield smear image in original optical colors (no filters applied). |
| `annotations.json` | `application/json` | JSON UTF-8 payload containing all instance boundaries, provenance tags, active filter settings, biophysical measurements, and clinical metadata. |

---

## 2. Image Asset Specification (`image.png`)

- **Color Space**: 24-bit RGB / 32-bit RGBA lossless PNG.
- **Color Fidelity**: Always saved in its **original optical brightfield state**. Filters enabled during clinician review (such as CLAHE, Reinhard LAB Stain Normalization, Two-Tone Separation, or Inscribed FOV cropping) are **never baked into `image.png`**.
- **Coordinate System**: All pixel coordinates $(x, y, \text{width}, \text{height})$ in `annotations.json` reference this raw image matrix directly $(0, 0 \to W, H)$.

---

## 3. JSON Schema Specification (`annotations.json`)

### Root Structure

```json
{
  "app": "AIMALABS Lynceus",
  "version": "1.2",
  "exportedAt": "2026-08-21T00:58:43.660Z",
  "dataset": { ... },
  "image": { ... },
  "preprocessing": { ... },
  "postprocessingConfig": { ... },
  "metadata": { ... },
  "micronsPerPixel": 0.125,
  "minConfidence": 0.70,
  "view": { "x": 0, "y": 0, "zoom": 1.0 },
  "annotations": [ ... ],
  "measurements": [ ... ]
}
```

---

### Section 3.1: Dataset & Human Supervision (`dataset`)

Tracks clinician validation metrics, cell instance lineage breakdowns, and human supervision counters.

```json
"dataset": {
  "isHumanSupervised": true,
  "totalCells": 108,
  "counts": {
    "totalCells": 108,
    "aiGeneratedUnchanged": 102,
    "userReclassified": 4,
    "userCreated": 2
  },
  "classDistribution": {
    "neutrophils": 52,
    "lymphocytes": 28,
    "monocytes": 12,
    "eosinophils": 8,
    "basophils": 6,
    "blasts": 2
  },
  "lineageDistribution": {
    "WBC": 108,
    "RBC": 0,
    "PLT": 0
  },
  "clinicianReviewStatus": "reviewed"
}
```

---

### Section 3.2: Image Metadata (`image`)

```json
"image": {
  "fileName": "image.png",
  "originalFileName": "smear-02.jpeg",
  "smearId": "smear-02",
  "width": 1500,
  "height": 1125,
  "dimensions": "1500 × 1125 px",
  "specimenType": "Peripheral Blood Smear",
  "stainType": "Wright-Giemsa"
}
```

---

### Section 3.3: Preprocessing & Active Filters (`preprocessing`)

Preserves the complete computational filter configuration applied during visualization so downstream models can reconstruct the exact view without altering the raw `image.png`.

```json
"preprocessing": {
  "activeFilters": ["clahe", "fov_crop", "reinhard_lab"],
  "filterDefinitions": {
    "raw": { "name": "Raw Optical Brightfield", "enabled": false },
    "clahe": { "name": "CLAHE (Adaptive Histogram)", "enabled": true },
    "reinhard_lab": { "name": "Reinhard LAB Stain Normalization", "enabled": true },
    "two_tone": { "name": "2-Tone Romanowsky Separation", "enabled": false },
    "fov_crop": { "name": "Inscribed Square FOV Mask", "enabled": true }
  }
}
```

---

### Section 3.4: Biophysical Post-Processing Rules (`postprocessingConfig`)

Records the heuristic flags active during segmentation:

```json
"postprocessingConfig": {
  "rbcPltRules": true,
  "borderExclusion": true,
  "duplicateSuppression": true,
  "wbcNuclearVeto": true,
  "wbcMultiLobeReassembly": true,
  "rbcWatershedSplitting": true
}
```

---

### Section 3.5: Cell Annotations (`annotations[]`)

Every cell instance explicitly records its provenance through one of three origin states:

#### Case A: AI-Generated Annotation (Untouched by Clinician)
```json
{
  "id": "c-wbc-001",
  "origin": "ai_generated",
  "isAiGenerated": true,
  "isUserModified": false,
  "isUserCreated": false,
  "classId": "neutrophils",
  "label": "Segmented Neutrophil",
  "lineage": "WBC",
  "confidence": 0.984,
  "shape": "box",
  "x": 280,
  "y": 190,
  "width": 110,
  "height": 105,
  "morphology": {
    "area_um2": 154.2,
    "diameter_um": 14.0,
    "perimeter_um": 53.8,
    "circularity": 0.88,
    "nc_ratio": 0.42
  },
  "predictions": [
    { "classId": "neutrophils", "prob": 0.984 },
    { "classId": "monocytes", "prob": 0.012 },
    { "classId": "eosinophils", "prob": 0.004 }
  ]
}
```

#### Case B: User-Reclassified Annotation (Clinician Modified Type)
```json
{
  "id": "c-wbc-007",
  "origin": "user_reclassified",
  "isAiGenerated": false,
  "isUserModified": true,
  "isUserCreated": false,
  "classId": "blasts",
  "label": "Atypical / Blast Cell",
  "lineage": "WBC",
  "confidence": 0.99,
  "shape": "box",
  "x": 860,
  "y": 370,
  "width": 148,
  "height": 144,
  "originalAiClassId": "monocytes",
  "originalAiLabel": "Monocyte",
  "originalAiConfidence": 0.742,
  "reclassifiedAt": "2026-08-21T00:58:43.660Z",
  "morphology": {
    "area_um2": 274.0,
    "diameter_um": 18.7,
    "perimeter_um": 73.0,
    "circularity": 0.88,
    "nc_ratio": 0.88
  }
}
```

#### Case C: User-Created Annotation (Clinician Drawn from Scratch)
```json
{
  "id": "c-9402",
  "origin": "user_created",
  "isAiGenerated": false,
  "isUserModified": false,
  "isUserCreated": true,
  "createdBy": "user",
  "createdAt": "2026-08-21T00:58:43.660Z",
  "classId": "promyelocyte",
  "label": "Promyelocyte",
  "lineage": "WBC",
  "confidence": 0.99,
  "shape": "box",
  "x": 500,
  "y": 500,
  "width": 90,
  "height": 90,
  "morphology": {
    "area_um2": 126.6,
    "diameter_um": 11.3,
    "perimeter_um": 45.0,
    "circularity": 0.86,
    "nc_ratio": 0.50
  }
}
```

---

## 4. Python PyTorch / OpenCV Data Loading Example

Researchers can read `.aimalabs` files in training pipelines using standard Python libraries:

```python
import io
import json
import zipfile
import cv2
import numpy as np
from PIL import Image

def load_aimalabs_dataset(aimalabs_path: str):
    """Loads a .aimalabs archive into an OpenCV image and structured annotations."""
    with zipfile.ZipFile(aimalabs_path, 'r') as archive:
        # 1. Load annotations JSON
        with archive.open('annotations.json') as f:
            data = json.load(f)

        # 2. Decode raw unfiltered image
        with archive.open('image.png') as f:
            image_bytes = f.read()
            image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)

    # 3. Filter annotations by supervision origin
    annotations = data['annotations']
    ai_annotations = [a for a in annotations if a['origin'] == 'ai_generated']
    user_corrected = [a for a in annotations if a['origin'] == 'user_reclassified']
    user_created = [a for a in annotations if a['origin'] == 'user_created']

    print(f"Loaded: {data['metadata']['patientLastName']} ({image.shape[1]}x{image.shape[0]} px)")
    print(f"Total: {len(annotations)} | AI: {len(ai_annotations)} | Corrected: {len(user_corrected)} | Manual: {len(user_created)}")

    return image, annotations, data['preprocessing']['activeFilters']

# Usage
# img, annots, filters = load_aimalabs_dataset("lynceus_DOE_smear-02_1771635562000.aimalabs")
```

---

## 5. Provenance Matrix Summary

| Origin Marker | `origin` Value | `isAiGenerated` | `isUserModified` | `isUserCreated` | Preserves `originalAiClassId` |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **AI Output** | `"ai_generated"` | `true` | `false` | `false` | N/A |
| **Reclassified** | `"user_reclassified"` | `false` | `true` | `false` | **Yes** |
| **Manual Draw** | `"user_created"` | `false` | `false` | `true` | N/A |
