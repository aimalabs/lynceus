# Architectural Plan: Flash Mode (Cellpose Cyto3 + Swin-T 20-Class) WebGPU Integration in AIMALABS Lynceus

## Executive Summary
This document defines the architectural implementation plan for **Flash Mode** in **AIMALABS Lynceus (`../aimalabs-lynceus/`)**, powered by a high-performance **two-stage deep learning model pair** accelerated by **WebGPU** via `onnxruntime-web`:

1. **Stage 1 — Cell Segmentation & Morphometry**: **Cellpose Cyto3 UNet** (`cellpose_cyto3_unet_int8.onnx` / `cellpose_cyto3_unet_fp16.onnx`, 6.5–13 MB) for automated instance segmentation, boundary tracing, and morphometrics (area $\mu\text{m}^2$, circularity, NC ratio).
2. **Stage 2 — Cell Classification**: **Swin Transformer Tiny** (`swin_classifier_int8.onnx` / `swin_classifier_fp16.onnx`, 29.5–54.2 MB) for fine-grained 20-class cytomorphological identification.

**Core Directives**:
- **Ground Truth 20 Classes**: The previous 8-class taxonomy in Lynceus was placeholder mockup code. The platform's native taxonomy, clinical rules, reference ranges, and counters will be driven directly by the **20 ground-truth classes** from `Twin_tiny_20_classes_train_val_test_set.ipynb`.
- **WebGPU Acceleration**: Both models execute client-side on the user's GPU using WebGPU (`executionProviders: ['webgpu', 'wasm']`) with automatic graceful fallback to multi-threaded SIMD WASM.
- **Asynchronous Pipelined Overlap**: The download and WebGPU session compilation of the Stage 2 Swin classifier runs **concurrently in parallel with the Stage 1 Cellpose segmentation execution**, eliminating cold-start stalls.
- **Flash Mode Pipeline**: Flash Mode ("Telesphorus") performs full-slide automated detection and classification end-to-end in $<350\text{ ms}$, while interactive ROI tools provide instantaneous ($<5\text{ ms}$) single-cell re-classification.

---

## 1. Flash Mode Model Pair & Hardware Acceleration

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               AIMALABS LYNCEUS DIGITAL PATHOLOGY CANVAS                                │
└───────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                    │
                                       smear-02.jpg (1500 × 1125 px)
                                                    │
                                                    ▼
            ┌───────────────────────────────────────────────────────────────────────────────┐
            │                 FLASH MODE PARALLEL PIPELINE INITIALIZATION                   │
            └───────────────────────┬───────────────────────────────┬───────────────────────┘
                                    │                               │
        [THREAD A: SEGMENTATION]    │                               │  [THREAD B: BACKGROUND FETCH]
                                    ▼                               ▼
  ┌──────────────────────────────────────────────────┐ ┌─────────────────────────────────────────┐
  │      STAGE 1: SEGMENTATION & MORPHOMETRY         │ │  CLASSIFIER DOWNLOAD & WEBGPU WARMUP    │
  │         Cellpose Cyto3 UNet (WebGPU)             │ │       (OVERLAPPED IN BACKGROUND)        │
  │     [cellpose_cyto3_unet_int8.onnx (6.5 MB)]     │ │  [swin_classifier_int8.onnx (29.5 MB)]   │
  └─────────────────────────┬────────────────────────┘ └────────────────────┬────────────────────┘
                            │                                               │
             Vector Flow Field (dP_Y, dP_X)                                 │
             + Cell Probability (Cellprob)                                  │
                            │                                               │
             Euler Dynamics & Moore Contours                                │
                            │                                               │
             ROI Extraction & SquarePad (224x224)                           │
                            │                                               │
                            ▼                                               ▼
  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
  │               STAGE 2: ZERO-WAIT BATCHED 20-CLASS CELL CLASSIFICATION                        │
  │                  Swin Transformer Tiny (WebGPU Pre-Warmed Session)                           │
  └─────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                │
                              20 Ground-Truth Class Logits & Softmax
                                                │
                                                ▼
  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
  │                              CLINICAL INFERENCE & TELEMETRY                                  │
  │  - 20-Class Cell Taxonomy Assignment (WBCs, PLTs, RBC Variants)                              │
  │  - Automated WBC Differential & Critical Alarms (Blasts >0%, Schistocytes >1%, IGs >2%)       │
  │  - Interactive Morphometrics, Heatmaps, Inspector, and Gallery Filters                      │
  └──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Model Artifact Specifications

| Pipeline Stage | Model Architecture | ONNX Model File | Size | Execution Provider | Latency (Flash) |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Stage 1 (Seg)** | Cellpose Cyto3 UNet | `cellpose_cyto3_unet_int8.onnx` | 6.5 MB | **WebGPU** (fallback WASM) | ~180 ms |
| **Stage 2 (Clf)** | Swin-Tiny Patch4 W7 | `swin_classifier_int8.onnx` | 29.5 MB | **WebGPU** (fallback WASM) | ~45 ms (batch 32) |
| **Combined** | **Flash Mode Pair** | Both loaded on-demand | **36.0 MB** | **WebGPU** | **< 300 ms (pipelined)** |

---

## 2. Pipelined Overlap Architecture: Concurrent Download & Segmentation

### 2.1 Execution Timeline Comparison

#### Naive Sequential Execution (High Latency & Stalls):
```
Time (ms)  0         100        200        300        400        500        600        700
Timeline   [--- Download Seg ---][--- Run Seg ---][--- Download Clf ---][--- Run Clf ---]
Total Latency: ~750 ms (Long cold-start stall)
```

#### Optimized Overlapped Execution (AIMALABS Flash Mode):
```
Time (ms)  0         100        200        300        400
Seg Track  [--- Seg Download & WebGPU Run ---][ Batch SquarePad ]
Clf Track  [======= Overlapped Clf Download & WebGPU Compilation ======] -> [ Run Clf WebGPU ] -> Done
Total Latency: ~290 ms (61% Latency Reduction)
```

### 2.2 Pipelined Promise Chaining Implementation

```javascript
// lynceus_gpu_engine.js

let segSessionPromise = null;
let clfSessionPromise = null;

export function preloadClassifierSession() {
  if (!clfSessionPromise) {
    clfSessionPromise = initWebGPUSession('assets/swin_classifier_int8.onnx', 'Swin-T Classifier');
  }
  return clfSessionPromise;
}

export function preloadSegmentationSession() {
  if (!segSessionPromise) {
    segSessionPromise = initWebGPUSession('assets/cellpose_cyto3_unet_int8.onnx', 'Cellpose Cyto3');
  }
  return segSessionPromise;
}

/**
 * End-to-end Flash Mode analysis pipeline with overlapped download/execution.
 */
export async function runFlashPipeline(slideCanvas, onProgress) {
  // 1. Kick off Stage 2 Classifier download & WebGPU compilation immediately in the background
  const classifierWarmupPromise = preloadClassifierSession();
  onProgress?.({ stage: 'seg_init', text: 'Initializing Flash WebGPU pipeline...', percent: 10 });

  // 2. Concurrently load segmentation model and run Stage 1
  const segSession = await preloadSegmentationSession();
  onProgress?.({ stage: 'segmenting', text: 'Segmenting cells (Cellpose Cyto3 WebGPU)...', percent: 35 });

  const segmentationResults = await runCellposeSegmentation(segSession, slideCanvas);
  onProgress?.({ stage: 'morphometry', text: 'Extracting contours & morphometrics...', percent: 65 });

  const cellBoxes = segmentationResults.boxes; // Array of { id, x, y, width, height, contour, morphology }
  if (cellBoxes.length === 0) {
    return [];
  }

  // 3. Prepare SquarePadded 224x224 batch tensor on CPU/canvas
  const batchTensor = prepareBatchSquarePadTensor(slideCanvas, cellBoxes);
  onProgress?.({ stage: 'classifying', text: 'Classifying 20 lineages (Swin-T WebGPU)...', percent: 80 });

  // 4. Await pre-warmed classifier session (download was overlapped with segmentation!)
  const clfSession = await classifierWarmupPromise;

  // 5. Execute Stage 2 Batched Forward Pass on WebGPU
  const logitsTensor = await clfSession.run({ input: batchTensor });
  const classifiedCells = postprocessClassifierOutput(logitsTensor, cellBoxes);

  onProgress?.({ stage: 'complete', text: 'Analysis Complete', percent: 100 });
  return classifiedCells;
}
```

---

## 3. Ground Truth 20 Classes & Lynceus Clinical Taxonomy

The 20 ground-truth classes trained in `Twin_tiny_20_classes_train_val_test_set.ipynb` are mapped to the Lynceus UI taxonomy:

```javascript
export const MASTER_CLASSES = [
  'Plt',           // 0: Platelets / Thrombocytes
  'Eosinophils',   // 1: Eosinophils
  'Igs',           // 2: Immature Granulocytes (Metamyelocytes, Myelocytes, Promyelocytes)
  'Lymphocytes',   // 3: Lymphocytes
  'Blasts',        // 4: Blasts / Atypical Leukocytes
  'Monocytes',     // 5: Monocytes
  'Neutrophils',   // 6: Neutrophils (Segmented / Band)
  'Erythroblasts', // 7: Nucleated Red Blood Cells (NRBCs / Normoblasts)
  'Baseophils',    // 8: Basophils
  'Acanthocytes',  // 9: Acanthocytes (Spur Cells)
  'Normal_cells',  // 10: Normal Erythrocytes (Discocytes)
  'Target_cells',  // 11: Target Cells (Codocytes)
  'Ovalocytes',    // 12: Ovalocytes
  'Elliptocytes',  // 13: Elliptocytes (Pencil Cells)
  'Teardrops',     // 14: Teardrop Cells (Dacrocytes)
  'Spherocyters',  // 15: Spherocytes
  'Schistocytes',  // 16: Schistocytes (Fragmented RBCs / Helmet Cells)
  'Stomatocytes',  // 17: Stomatocytes (Mouth Cells)
  'Echinocytes',   // 18: Echinocytes (Burr Cells)
  'Hypochromic',   // 19: Hypochromic Red Blood Cells
];
```

### 3.1 Complete Taxonomy Definition (`CELL_TAXONOMY_20`)

```javascript
export const CELL_TAXONOMY_20 = [
  // --- Leukocyte & Thrombocyte Lineages ---
  { id: 'Neutrophils', name: 'Neutrophil', short: 'Neutrophil', code: 'NEU', category: 'wbc', color: '#38bdf8', lightBg: 'rgba(56, 189, 248, 0.15)', border: '#0284c7', range: [40, 70], hotkey: '1', desc: 'Segmented/band neutrophil with lilac granules' },
  { id: 'Lymphocytes', name: 'Lymphocyte', short: 'Lymphocyte', code: 'LYM', category: 'wbc', color: '#10b981', lightBg: 'rgba(16, 185, 129, 0.15)', border: '#059669', range: [20, 40], hotkey: '2', desc: 'Dense spherical nucleus with narrow pale rim' },
  { id: 'Monocytes', name: 'Monocyte', short: 'Monocyte', code: 'MON', category: 'wbc', color: '#a855f7', lightBg: 'rgba(168, 85, 247, 0.15)', border: '#7e22ce', range: [2, 8], hotkey: '3', desc: 'Folded/kidney nucleus with grayish-blue cytoplasm' },
  { id: 'Eosinophils', name: 'Eosinophil', short: 'Eosinophil', code: 'EOS', category: 'wbc', color: '#f97316', lightBg: 'rgba(249, 115, 22, 0.15)', border: '#c2410c', range: [1, 4], hotkey: '4', desc: 'Prominent spherical orange-red granules' },
  { id: 'Baseophils', name: 'Basophil', short: 'Basophil', code: 'BAS', category: 'wbc', color: '#06b6d4', lightBg: 'rgba(6, 182, 212, 0.15)', border: '#0891b2', range: [0.5, 1], hotkey: '5', desc: 'Dense coarse dark-purple granules' },
  { id: 'Igs', name: 'Immature Granulocyte (IG)', short: 'IG', code: 'IG', category: 'wbc', color: '#6366f1', lightBg: 'rgba(99, 102, 241, 0.15)', border: '#4f46e5', range: [0, 1], hotkey: '6', desc: 'Metamyelocyte, myelocyte, or promyelocyte precursor' },
  { id: 'Blasts', name: 'Blast / Atypical Cell', short: 'Blast', code: 'BLA', category: 'wbc', color: '#e52246', lightBg: 'rgba(229, 34, 70, 0.18)', border: '#be123c', range: [0, 0], hotkey: '7', desc: 'Immature cell with fine chromatin and prominent nucleoli (Critical)' },
  { id: 'Erythroblasts', name: 'Erythroblast (NRBC)', short: 'NRBC', code: 'NRBC', category: 'wbc', color: '#d946ef', lightBg: 'rgba(217, 70, 239, 0.15)', border: '#c026d3', range: [0, 0], hotkey: '8', desc: 'Nucleated red blood cell precursor' },
  { id: 'Plt', name: 'Platelet / Thrombocyte', short: 'Platelet', code: 'PLT', category: 'plt', color: '#eab308', lightBg: 'rgba(234, 179, 8, 0.15)', border: '#ca8a04', range: [150, 450], hotkey: '9', desc: 'Anucleate cell fragment with central granules' },

  // --- Erythrocyte Morphologies & Variants ---
  { id: 'Normal_cells', name: 'Normal RBC (Discocyte)', short: 'Normal RBC', code: 'RBC', category: 'rbc', color: '#64748b', lightBg: 'rgba(100, 116, 139, 0.15)', border: '#475569', range: [85, 100], hotkey: '0', desc: 'Biconcave round erythrocyte with central pallor' },
  { id: 'Target_cells', name: 'Target Cell (Codocyte)', short: 'Target Cell', code: 'TGT', category: 'rbc', color: '#ec4899', lightBg: 'rgba(236, 72, 153, 0.15)', border: '#db2777', range: [0, 2], hotkey: 'q', desc: 'Bullseye target-like hemoglobin distribution' },
  { id: 'Ovalocytes', name: 'Ovalocyte', short: 'Ovalocyte', code: 'OVA', category: 'rbc', color: '#14b8a6', lightBg: 'rgba(20, 184, 166, 0.15)', border: '#0d9488', range: [0, 2], hotkey: 'w', desc: 'Oval-shaped mature erythrocyte' },
  { id: 'Elliptocytes', name: 'Elliptocyte (Pencil Cell)', short: 'Elliptocyte', code: 'ELP', category: 'rbc', color: '#8b5cf6', lightBg: 'rgba(139, 92, 246, 0.15)', border: '#7c3aed', range: [0, 1], hotkey: 'e', desc: 'Elongated rod/cigar-shaped red cell' },
  { id: 'Teardrops', name: 'Teardrop Cell (Dacrocyte)', short: 'Teardrop', code: 'DAC', category: 'rbc', color: '#0284c7', lightBg: 'rgba(2, 132, 199, 0.15)', border: '#0369a1', range: [0, 1], hotkey: 'r', desc: 'Tear-shaped or pear-shaped erythrocyte' },
  { id: 'Spherocyters', name: 'Spherocyte', short: 'Spherocyte', code: 'SPH', category: 'rbc', color: '#f43f5e', lightBg: 'rgba(244, 63, 94, 0.15)', border: '#e11d48', range: [0, 1], hotkey: 't', desc: 'Dense spherical erythrocyte lacking central pallor' },
  { id: 'Schistocytes', name: 'Schistocyte (Fragment)', short: 'Schistocyte', code: 'SCH', category: 'rbc', color: '#ef4444', lightBg: 'rgba(239, 68, 68, 0.18)', border: '#dc2626', range: [0, 0.5], hotkey: 'y', desc: 'Fragmented helmet or triangle erythrocyte (Critical)' },
  { id: 'Acanthocytes', name: 'Acanthocyte (Spur Cell)', short: 'Acanthocyte', code: 'ACA', category: 'rbc', color: '#d97706', lightBg: 'rgba(217, 119, 6, 0.15)', border: '#b45309', range: [0, 0.5], hotkey: 'u', desc: 'Spiculated cell with irregular projecting thorns' },
  { id: 'Echinocytes', name: 'Echinocyte (Burr Cell)', short: 'Echinocyte', code: 'ECH', category: 'rbc', color: '#84cc16', lightBg: 'rgba(132, 204, 22, 0.15)', border: '#65a30d', range: [0, 2], hotkey: 'i', desc: 'Uniform small blunt projections around circumference' },
  { id: 'Stomatocytes', name: 'Stomatocyte', short: 'Stomatocyte', code: 'STM', category: 'rbc', color: '#06b6d4', lightBg: 'rgba(6, 182, 212, 0.15)', border: '#0891b2', range: [0, 1], hotkey: 'o', desc: 'Slit-like or mouth-shaped central pallor' },
  { id: 'Hypochromic', name: 'Hypochromic Cell', short: 'Hypochromic', code: 'HYP', category: 'rbc', color: '#94a3b8', lightBg: 'rgba(148, 163, 184, 0.15)', border: '#64748b', range: [0, 5], hotkey: 'p', desc: 'Enlarged area of central pallor (>1/3 diameter)' }
];
```

---

## 4. Mathematical Preprocessing Pipeline

### 4.1 Square-Padding (`SquarePad`) Matching Training Transforms
To maintain fidelity with `Twin_tiny_20_classes_train_val_test_set.ipynb`:
1. Extract bounding box $(x, y, w, h)$.
2. Calculate target square side length $s = \max(w, h)$.
3. Symmetric padding:
   $$p_l = \lfloor (s - w) / 2 \rfloor, \quad p_r = s - w - p_l$$
   $$p_t = \lfloor (s - h) / 2 \rfloor, \quad p_b = s - h - p_t$$
4. Draw zero-padded patch into an offscreen $224 \times 224$ canvas using bilinear sampling.
5. ImageNet normalization:
   $$\text{tensor}[c, y, x] = \frac{\text{pixel}[c, y, x] / 255.0 - \text{mean}[c]}{\text{std}[c]}$$
   where $\text{mean} = [0.485, 0.456, 0.406]$, $\text{std} = [0.229, 0.224, 0.225]$.

---

## 5. WebGPU Session Initialization & Fallback

```javascript
export async function initWebGPUSession(modelPath, modelLabel) {
  const webgpuOptions = {
    executionProviders: [
      {
        name: 'webgpu',
        deviceType: 'gpu',
        powerPreference: 'high-performance',
      },
      'wasm'
    ],
    graphOptimizationLevel: 'all',
  };

  try {
    const session = await ort.InferenceSession.create(modelPath, webgpuOptions);
    console.log(`[Lynceus GPU] Successfully compiled ${modelLabel} on WebGPU EP`);
    return session;
  } catch (err) {
    console.warn(`[Lynceus GPU] WebGPU compilation failed for ${modelLabel}, falling back to WASM:`, err);
    return await ort.InferenceSession.create(modelPath, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });
  }
}
```

---

## 6. Testing & Quality Verification Checklist

1. [x] **Lynceus Test Suite Verification**: All 16 Puppeteer E2E tests passing with 100% success rate (`npm test`).
2. [x] **Cellpose Pytest Suite Verification**: All 16 pytest suites passing (`pytest -v`).
3. [x] **Mobile / Touch Resizer Handling**: Verified seamless touch drag and immediate sidebars folding on mobile viewports.
4. [ ] **WebGPU Session Compilation & Overlapped Preloading**: Validate concurrent fetch and inference in Chromium with `--enable-unsafe-webgpu`.
5. [ ] **Differential & Alert Accuracy**: Assert that 20-class Swin-T predictions accurately compute WBC percentages and trigger critical alerts for blast cells ($>0\%$) and schistocytes ($>1\%$).
