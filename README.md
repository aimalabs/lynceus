# AIMALABS • Lynceus (Λυγκεύς)

> **Digital Pathology & Hematology Cell Reviewer**  
> *Next-generation human-in-the-loop AI microscopy platform for cytopathology and laboratory medicine.*

---

## 🔬 The Name: Lynceus (Λυγκεύς)

In Greek mythology, **Lynceus** was an Argonaut celebrated for his superhuman, piercing vision—capable of seeing through darkness, trees, dense fog, and even beneath the earth. 

In this platform, **Lynceus** represents optical clarity and diagnostic acuity. It augments the clinician's trained eye with foundation-model AI detections, allowing hematopathologists and laboratory scientists to rapidly navigate whole slide fields of view (FOV), interrogate subtle cellular morphology, and verify critical hematological diagnoses.

---

## 🎯 Purpose & Capabilities

Lynceus is an interactive, standalone digital pathology workstation prototype designed to replicate and elevate the optical microscope experience in a modern web environment.

### Key Highlights
- **Microscope-Grade Canvas Engine:** Smooth 60+ FPS cursor-centered pan and zoom ($0.10\times$ overview to $16.0\times$ oil immersion magnification) with optical stage telemetry and calibrated scale bars.
- **Human-in-the-Loop AI Annotation:** Direct editing suite allowing clinicians to add bounding boxes, circles, centroid points, caliper distance measurements, delete false positives, and reclassify cells using clinical hotkeys (`1`–`8`).
- **Live 100-WBC Differential Engine:** Real-time differential calculation, interactive stacked lineage proportion bar, and clinical abnormality alerts (e.g., *Blasts Present / Critical Finding*, *Neutrophilia*).
- **Sub-Cellular Morphometrics:** Automatic real-time physical telemetry per cell, including nuclear-to-cytoplasmic (N:C) ratio, calibrated diameter ($\mu\text{m}$), surface area ($\mu\text{m}^2$), and circularity index.
- **Cell Gallery & One-Click Navigation:** Fast-filtering gallery grid with instant fly-to viewport centering.
- **Optical Pixel Calibrator:** Interactive physical calibration dialog to customize $\mu\text{m}/\text{px}$ ratios across varying camera sensors and objective lenses.
- **Zero-Backend Standalone Architecture:** Completely self-contained in a single responsive interface with embedded high-resolution Wright-Giemsa blood smear imagery.

---

## 🌐 Deployment on Pages (`aimalabs.net/lynceus/`)

This repository is configured to be hosted on **GitHub Pages** under the AIMALABS domain:

**URL:** [https://aimalabs.net/lynceus/](https://aimalabs.net/lynceus/)

### Prototype Visibility Note
This project is an active research prototype. To ensure it remains unlisted and hidden from search engine crawlers:
- `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">` is embedded in the application header.
- A restrictive `robots.txt` is included.
- Direct URL access only; unlinked from public sitemaps and site navigation.

---

## ⌨️ Quick Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space + Drag` / `Click + Drag` | Pan slide canvas |
| `Mouse Wheel` / `+` / `-` | Zoom in / out (cursor-centered) |
| `0` | Reset viewport to slide overview |
| `H` | Master AI overlay toggle (hide/show bounding boxes) |
| `R` | Toggle optical center reticle |
| `V` / `B` / `C` / `P` / `M` / `E` | Select, Box, Circle, Point, Caliper, Eraser tools |
| `1` – `8` | Switch lineage / Quick reclassify selected cell |
| `Ctrl + Z` / `Cmd + Z` | Undo last action |
| `Ctrl + Y` / `Cmd + Shift + Z` | Redo |
| `Backspace` / `Delete` | Remove selected cell or measurement |
| `?` | Open keyboard shortcuts modal |

---

## 🧠 In-Browser AI Engine (WebGPU & ONNX Runtime)

Lynceus executes a two-stage deep learning pipeline purely on-device via **WebGPU**:
1. **Stage 1 (Cell Detection & Segmentation):** Quantized **Cellpose SAM-v2 ViT** (`cellpose_cpsam_v2_int8.onnx`) or **Cyto3 UNet** (`cellpose_cyto3_unet_int8.onnx`) predicts horizontal/vertical flow dynamics and cell probability maps. 2D Euler vector integration resolves touching and overlapping cell boundaries.
2. **Stage 2 (Cell Classification):** Pure WebGPU FP32 **Swin Transformer** (`swin_classifier.onnx`) classifies each cropped cell patch into 20 ground-truth hematological lineages.

---

## 🛠️ Exporting & Chunking ONNX Models for WebGPU

The `scripts/` directory contains Python tools to export PyTorch weights into WebGPU-compatible ONNX models, dynamically quantize them, and split them into 10-chunk manifests for resilient web streaming.

### 1. Requirements

Ensure PyTorch, Torchvision, and ONNX Runtime are installed:
```bash
pip install torch torchvision onnx onnxruntime
```

### 2. Exporting Models to ONNX (`scripts/export_onnx.py`)

Run the master export script to convert pre-trained weights into WebGPU-compatible ONNX models:

```bash
python scripts/export_onnx.py --output-dir assets/
```

#### What `export_onnx.py` produces:
- **`swin_classifier.onnx` (FP32)**: Pure WebGPU Swin Transformer for 20-lineage classification with dynamic batching. *(Note: INT8 DynamicQuantizeMatMul causes ORT-Web WebGPU to fall back to CPU/WASM; FP32 executes natively on WebGPU shaders at ~54ms/cell)*.
- **`cellpose_cpsam_v2_int8.onnx` (INT8)**: Dynamically quantized SAM-v2 ViT segmentation model (~299 MB from 1.16 GB FP32).
- **`cellpose_cyto3_unet_int8.onnx` (INT8)**: Lightweight Cyto3 UNet segmentation model (~6.8 MB).

```bash
# Export only the Swin-T classifier:
python -c "from scripts.export_onnx import export_swin_classifier; export_swin_classifier('swin_model.pth', 'assets/')"

# Export only the Cellpose SAM-v2 model:
python -c "from scripts.export_onnx import export_cellpose_sam_vit; export_cellpose_sam_vit('assets/')"
```

---

### 3. Chunking Models for Web Streaming (`scripts/split_model.py`)

Large ONNX models (>30 MB) exceed GitHub's standard single-file limits and can fail on unstable network connections. `scripts/split_model.py` splits large ONNX files into 10 smaller parts (`.part0`–`.part9`) and generates an accompanying SHA-256 `.manifest.json`.

```bash
# Split Swin Classifier into 10 chunks (~10.7 MB each)
python scripts/split_model.py assets/swin_classifier.onnx assets/ --chunks 10

# Split Cellpose SAM-v2 into 10 chunks (~30 MB each)
python scripts/split_model.py assets/cellpose_cpsam_v2_int8.onnx assets/ --chunks 10
```

#### Browser Streaming & Caching Flow:
- When the browser loads the model, `fetchOrGetCachedModel()` reads `assets/<model>.onnx.manifest.json`.
- Chunks are fetched concurrently (concurrency pool of 4) and cached individually in browser `IndexedDB`.
- Chunks are concatenated into a contiguous binary `ArrayBuffer` and validated bit-for-bit against the manifest's SHA-256 hash before initializing the `ort.InferenceSession`.

---

### 4. Benchmarking & Parity Verification (`scripts/benchmark_models.py`)

To verify numerical parity and measure inference latency across CPU, MPS (Apple Silicon), and ONNX Runtime:

```bash
python scripts/benchmark_models.py
```

---

## 🧪 Automated Testing

The repository includes a comprehensive 14-suite Puppeteer end-to-end verification suite:

```bash
npm test
```

Or run individual suites:
```bash
node tests/test_task1_1.js      # Environment & base64 asset integration
node tests/test_task1_2.js      # Microscope canvas & transform precision
node tests/test_task2_1.js      # Slide navigator minimap
node tests/test_task2_2.js      # Optical scale & magnification presets
node tests/test_task3_1.js      # Layer filtering & confidence thresholds
node tests/test_task3_2.js      # Cell inspector & hover HUD
node tests/test_task4_1.js      # Drawing tools & reclassification
node tests/test_task5_layout.js # Brand identity & resizable sidebars
node tests/test_tools_undo_redo.js # Undo / Redo engine
node tests/test_pixel_calibrator.js # Optical pixel size calibrator
node tests/test_differential.js # Live WBC differential count table
node tests/test_gallery.js      # Cell gallery thumbnail navigation
node tests/test_data_exchange.js # JSON/CSV export & persistence
node tests/test_tooltips_anchor_and_differential_color.js # Telemetry tooltips
```

---

## 🏢 Brand & Copyright

© 2026 **AIMALABS** — Precision AI Foundation Models for Pathology & Laboratory Medicine. All rights reserved.
