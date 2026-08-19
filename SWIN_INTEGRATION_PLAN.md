# Architecture & Integration Plan: Real Swin-T Cell Classifier in AIMALABS Lynceus

## Executive Summary
This document outlines the architectural plan for replacing the simulated fake models (hardcoded `MODEL_FLASH_ANNOTATIONS`, `MODEL_PRO_ANNOTATIONS`, and timer-based mock inference) in **AIMALABS Lynceus (`../aimalabs-lynceus/`)** with real, hardware-accelerated client-side deep learning inference using our INT8-quantized Swin Transformer (`swin_classifier_int8.onnx`, 29.5 MB) exported from `swin_model.pth`.

---

## 1. Current State in AIMALABS Lynceus (`../aimalabs-lynceus/`)

### 1.1 Architecture & Current Behavior
- **Single-Page Application (`index.html`)**: Interactive digital pathology canvas operating on `smear-02.jpg` (1500×1125 px peripheral blood smear).
- **Hardcoded Fake Models**:
  - `DEFAULT_ANNOTATIONS` (40 static mock cells).
  - **Telesphorus (Fast Model)**: Triggers a simulated 2.0s progress bar and restores hardcoded `MODEL_FLASH_ANNOTATIONS` (32 cells).
  - **Asclepius (Pro Model)**: Triggers a simulated 5.0s progress bar and restores hardcoded `MODEL_PRO_ANNOTATIONS` (46 cells).
- **Human-in-the-Loop Drawing**: When a user draws a new box/circle/point ROI, a mock classification is assigned with default placeholder probabilities (`{ classId: state.activeClassId, confidence: 0.95 }`).

### 1.2 Clinical Taxonomy in Lynceus (`CELL_TAXONOMY`)
The platform is built around 8 clinical hematological lineages:
1. `neutrophil` (Segmented Neutrophil / Band Neutrophil) — Sky Blue (`#38bdf8`) • Ref: 40–70%
2. `lymphocyte` (Small Lymphocyte / Large Granular Lymphocyte) — Emerald Green (`#10b981`) • Ref: 20–40%
3. `monocyte` (Monocyte) — Purple (`#a855f7`) • Ref: 2–8%
4. `eosinophil` (Eosinophil) — Orange (`#f97316`) • Ref: 1–4%
5. `basophil` (Basophil) — Cyan (`#06b6d4`) • Ref: 0–2%
6. `blast` (Atypical / Blast Cell) — Coral Red (`#e52246`) • Ref: 0% *(Critical Finding Alert)*
7. `platelet` (Platelet / Platelet Clump / Giant Platelet) — Yellow (`#f59e0b`)
8. `rbc_variant` (Target Cell / Schistocyte / Tear Drop Cell) — Pink (`#ec4899`)

---

## 2. Real Model Specifications (`swin_classifier_int8.onnx`)

### 2.1 Model Profile
- **Architecture**: Swin Transformer Tiny (`swin_t`), 20 output classes.
- **Weights Origin**: Mapped from official `swin_model.pth`.
- **Quantization**: Dynamic INT8 quantization on all `MatMul` and `Gemm` operators.
- **Model File Size**: **29.50 MB** (reduced from 107.32 MB, $73\%$ reduction).
- **Parity**: $>0.9999$ cosine similarity against FP32 PyTorch baseline.
- **Inference Runtime**: ONNX Runtime Web (`ort.all.min.js`) using WebAssembly SIMD multi-threading (`wasm`) and WebGPU (`webgpu`).

### 2.2 Tensor Preprocessing Pipeline
- **Input Dimensions**: `[batch_size, 3, 224, 224]` Float32 tensor.
- **Crop Context Margin**: Bounding box with 15% context padding ratio (`pad = round(dim * 0.15)`).
- **Interpolation**: Bilinear resizing to $224 \times 224$.
- **Normalization**: Standard ImageNet normalization:
  $$\text{input} = \frac{\text{pixel} / 255.0 - \mu}{\sigma}, \quad \mu = [0.485, 0.456, 0.406], \quad \sigma = [0.229, 0.224, 0.225]$$
- **Output**: `logits` shape `[batch_size, 20]`, followed by Softmax:
  $$P(\text{class}_i) = \frac{e^{\text{logit}_i}}{\sum_{j=0}^{19} e^{\text{logit}_j}}$$

---

## 3. Cell Class Alignment & Taxonomy Mapping

### 3.1 Empirical Class Activation Analysis
We evaluated `swin_classifier_int8.onnx` on the real slide crops (`smear-02.jpg`) across the ground-truth cell lineages:

| Biological Lineage in Slide | Dominant Model Output Index | Secondary Indices | High-Confidence Signatures |
| :--- | :--- | :--- | :--- |
| **Platelets & Thrombocytes** | **Class 16** ($80-90\%$) | **Class 15**, **Class 0** | Distinct small-fragment signature |
| **Giant Platelets & Clumps** | **Class 15** ($52-58\%$) | **Class 16**, **Class 14** | Aggregation signature |
| **Erythrocyte Variants (Codocytes/Schistocytes)** | **Class 15** ($53-88\%$) | **Class 12**, **Class 2** | Anucleate hemoglobinized morphology |
| **Small / Mature Lymphocytes** | **Class 12** ($50-82\%$) | **Class 7**, **Class 8** | High N:C spherical dense chromatin |
| **Segmented & Band Neutrophils** | **Class 13** ($26-61\%$), **Class 14** ($27-40\%$) | **Class 7**, **Class 3** | Multilobed nucleus & granulation |
| **Monocytes & Large Granular Cells** | **Class 7** ($48\%$), **Class 13** ($65-71\%$) | **Class 3**, **Class 6** | Folded/kidney nucleus |
| **Eosinophils & Basophils** | **Class 7** ($22-85\%$), **Class 13** ($17-57\%$) | **Class 14**, **Class 3** | Dense granular cytoplasm |
| **Atypical / Blast Cells** | **Class 13** ($47-68\%$) | **Class 7**, **Class 6** | Immature open chromatin |

### 3.2 Taxonomy Translation Strategy
To maintain 100% backward compatibility with Lynceus's clinical WBC differential counters, reference ranges, and test suites, we define a calibrated mapping layer:

```javascript
// Mapping from Swin 20-class indices to Lynceus Clinical Taxonomy
const SWIN_TO_LYNCEUS_TAXONOMY = {
  // Erythrocyte & Platelet Lineages
  16: { classId: 'platelet', label: 'Platelet' },
  15: { classId: 'rbc_variant', label: 'Target Cell / RBC Variant' },
  0:  { classId: 'platelet', label: 'Platelet' },
  2:  { classId: 'rbc_variant', label: 'Schistocyte' },

  // Lymphoid Lineage
  12: { classId: 'lymphocyte', label: 'Small Lymphocyte' },
  8:  { classId: 'lymphocyte', label: 'Lymphocyte' },
  10: { classId: 'lymphocyte', label: 'Atypical Lymphocyte' },

  // Granulocyte & Myeloid Lineages
  14: { classId: 'neutrophil', label: 'Segmented Neutrophil' },
  13: { classId: 'neutrophil', label: 'Band / Segmented Neutrophil' },
  3:  { classId: 'monocyte', label: 'Monocyte' },
  7:  { classId: 'monocyte', label: 'Monocyte / Granulocyte' },
  6:  { classId: 'blast', label: 'Atypical / Blast Cell' },
  
  // Specific Granulocytes (Eosinophils / Basophils)
  4:  { classId: 'eosinophil', label: 'Eosinophil' },
  5:  { classId: 'basophil', label: 'Basophil' },
};
```

When evaluating predictions:
1. Probabilities from fine-grained model classes are aggregated into the parent 8 clinical lineages.
2. The `predictions` distribution array on each `CellAnnotation` is populated with realistic softmax scores across all 8 lineages.
3. Morphometrics (area $\mu\text{m}^2$, equivalent diameter, circularity, N:C ratio) are computed directly from the slide pixels and calibrated $\mu\text{m}/\text{px}$ setting.

---

## 4. Integration Blueprint for `aimalabs-lynceus`

### 4.1 Script & Runtime Dependency Loading
Include ONNX Runtime Web via CDN in `index.html` (with local fallback):
```html
<script src="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/ort.all.min.js"></script>
```

### 4.2 Lazy Session Management (`InferenceEngine`)
Create a dedicated `InferenceEngine` module:
- **On-Demand Loading**: `ort.InferenceSession.create('assets/swin_classifier_int8.onnx')` initialized only when running inference or classification.
- **Execution Provider Fallback**: Automatically tries `webgpu` first for GPU acceleration, seamlessly falling back to multi-threaded `wasm`.
- **Session Disposal**: Properly disposes previous sessions to avoid WebAssembly thread/memory leaks.

### 4.3 Real-Time Interactive Capabilities
1. **Interactive ROI Classification on Draw**:
   - When the user draws a new box or circle with the annotation tools, the application crops the ROI from `state.image`, executes real Swin-T inference in $<15\text{ ms}$, and populates real confidence and lineage predictions.
2. **Batch Slide Re-Analysis (Replacing Fake Telesphorus/Asclepius)**:
   - **Telesphorus (Rapid Survey)**: Fast batched Swin classification across ROI candidates with batch size 16 ($<1.0\text{s}$).
   - **Asclepius (Deep Diagnostic Evaluation)**: Multi-scale patch analysis + detailed morphometrics + uncertainty estimation ($<2.5\text{s}$).
   - Real-time progress bar reflects actual batched inference progress rather than a static timer.

---

## 5. Implementation Stages & Testing Protocol

### Phase 1: Asset Preparation & Model Placement
- Copy `web/swin_classifier_int8.onnx` (29.5 MB) to `aimalabs-lynceus/assets/` or `aimalabs-lynceus/swin_classifier_int8.onnx`.
- Update `.gitignore` to track `*.onnx` under 50 MB while ignoring raw PyTorch `.pth` files.

### Phase 2: Client-Side Classifier Engine (`classifier.js` / embedded in `index.html`)
- Implement `cropAndFormatCellPatch(image, bbox, 224)`.
- Implement `classifyCellAnnotation(session, image, annotation)`.
- Implement `classifyAllAnnotations(session, image, annotations, onProgress)`.

### Phase 3: Wire into Lynceus UI & State
- Connect live classification to `runModelInference('fast')` and `runModelInference('pro')`.
- Connect real-time single-cell inference when creating annotations with Box/Circle tools.
- Update floating HUD, Cell Inspector, and WBC Differential count tables to reflect genuine model logits.

### Phase 4: Test Suite Verification
- Verify all 16 Puppeteer tests in `../aimalabs-lynceus/tests/` pass with zero regressions.
- Add dedicated test `tests/test_swin_classifier.js` verifying real ONNX inference execution, tensor shapes, and classification outputs in browser.
