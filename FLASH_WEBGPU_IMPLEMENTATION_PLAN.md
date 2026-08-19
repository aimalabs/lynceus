# Exhaustive Engineering Plan: Real WebGPU Flash Mode & 20-Class Swin-T Integration in AIMALABS Lynceus

## Document Version & Metadata
- **Document Version**: 2.0.0-PROD-SPEC
- **Author**: AIMALABS Systems & Deep Learning Architecture
- **Target Platform**: `../aimalabs-lynceus/` (Single-Page Digital Pathology & Cytometry Canvas)
- **Model Pair (Flash Mode)**:
  1. `cellpose_cyto3_unet_int8.onnx` (6.5 MB, Cellpose Cyto3 UNet Instance Segmentation)
  2. `swin_classifier_int8.onnx` (29.5 MB, Swin Transformer Tiny 20-Class Classifier)
- **Primary Execution Provider**: WebGPU (`executionProviders: ['webgpu', 'wasm']`)
- **Acceleration Strategy**: Pipelined Asynchronous Model Overlap (Concurrent Classifier Download + Segmentation Execution)

---

## 1. Architectural Blueprint & Execution Dataflow

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     AIMALABS LYNCEUS DIGITAL PATHOLOGY CANVAS                                    │
│                                           smear-02.jpg (1500 × 1125 px)                                          │
└────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                         │
                                    User triggers Telesphorus (Flash Mode)
                                                         │
                                                         ▼
                       ┌────────────────────────────────────────────────────────────────────┐
                       │           PARALLEL ASYNCHRONOUS PIPELINE INITIALIZATION            │
                       └───────────────────┬────────────────────────────┬───────────────────┘
                                           │                            │
             [THREAD 1: SEGMENTATION WORKER]│                            │  [THREAD 2: CLASSIFIER WARMUP WORKER]
                                           ▼                            ▼
     ┌─────────────────────────────────────────────────┐  ┌──────────────────────────────────────────────────┐
     │      STAGE 1: CELLPOSE CYTO3 SEGMENTATION       │  │        STAGE 2: CLASSIFIER PRE-WARMUP            │
     │  - Model: cellpose_cyto3_unet_int8.onnx (6.5MB) │  │  - Model: swin_classifier_int8.onnx (29.5MB)     │
     │  - EP: WebGPU (fallback multi-threaded WASM)    │  │  - EP: WebGPU WGSL Shader Compilation           │
     │  - Input: [1, 2, H, W] Grayscale Cytology       │  │  - Non-blocking async fetch & session init       │
     │  - Output: [1, 3, H, W] (dP_Y, dP_X, Cellprob)  │  │  - Download & compile concurrently in background │
     │  - 2D Euler Vector Flow Dynamics (200 steps)    │  │  - Zero cold-start stall when Stage 1 completes  │
     │  - Moore-Neighbor Perimeter Polygon Tracing     │  └─────────────────────────┬────────────────────────┘
     │  - Morphometrics (Area, Circularity, Diameter)  │                            │
     │  - Boundary-Safe Crop & SquarePad (224 × 224)   │                            │
     │  - ImageNet Normalized Float32Array [B,3,224,224│                            │
     └─────────────────────────┬───────────────────────┘                            │
                               │                                                    │
                               └─────────────────────────┬──────────────────────────┘
                                                         │
                                                         ▼
     ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
     │                             STAGE 2: ZERO-WAIT BATCHED 20-CLASS CLASSIFICATION                          │
     │  - Pre-warmed Swin-T Session awaits zero ms                                                             │
     │  - WebGPU Forward Pass: batch tensor [B, 3, 224, 224] -> Logits [B, 20]                                 │
     │  - Softmax Probability Distribution: p_i = exp(z_i - max(z)) / sum(exp(z - max(z)))                     │
     │  - 20 Ground-Truth Classes (MASTER_CLASSES) Top-1 Assignment & Full 20-Class Probability Array           │
     └───────────────────────────────────────────────────┬─────────────────────────────────────────────────────┘
                                                         │
                                                         ▼
     ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
     │                                    STATE PERSISTENCE & CLINICAL TELEMETRY                               │
     │  - Populate state.annotations with real segmented contours, bounding boxes, and 20-class predictions    │
     │  - Real-time 8-Lineage & 20-Class WBC Differential Calculation                                          │
     │  - Automated Critical Abnormality Triggers (Blasts >0%, Schistocytes >1%, Immature Granulocytes >2%)    │
     │  - Canvas Overlay Rendering, Interactive Minimap, Cell Gallery Strip, and Cell Inspector Panel          │
     └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Exhaustive File & Function Inventory

### 2.1 File Map

| File Path | Role & Changes |
| :--- | :--- |
| `../aimalabs-lynceus/assets/cellpose_cyto3_unet_int8.onnx` | Stage 1 Segmentation Model (6.5 MB, WebGPU-compatible dynamic INT8) |
| `../aimalabs-lynceus/assets/cellpose_cyto3_unet_fp16.onnx` | Stage 1 Segmentation Model FP16 (13.0 MB, native FP16 WebGPU extension) |
| `../aimalabs-lynceus/assets/swin_classifier_int8.onnx` | Stage 2 20-Class Classifier Model (29.5 MB, MatMul/Gemm INT8 quantized) |
| `../aimalabs-lynceus/assets/swin_classifier_fp16.onnx` | Stage 2 20-Class Classifier Model FP16 (54.2 MB) |
| `../aimalabs-lynceus/index.html` | Core UI, Canvas Renderer, WebGPU Engine, Inference Pipeline, and Event Listeners |
| `../aimalabs-lynceus/generate.js` | Reference Dataset Generator & Ground Truth 20-Class Taxonomy Definitions |
| `../aimalabs-lynceus/tests/test_flash_webgpu_inference.js` | **NEW**: Unit & Performance Test for WebGPU Session Preload, Overlap & Tensor Math |
| `../aimalabs-lynceus/tests/test_telesphorus_real_inference.js` | **NEW**: E2E Browser Test for Telesphorus Real Inference, HUD, and Differential |
| `../aimalabs-lynceus/tests/test_interactive_inference.js` | **NEW**: E2E Browser Test for Live Single-Patch Classification on ROI Drawing |

---

### 2.2 Ground Truth 20 Classes Specification (`MASTER_CLASSES`)
Extracted from `Twin_tiny_20_classes_train_val_test_set.ipynb`:

```javascript
export const MASTER_CLASSES = [
  'Plt',           // Index 0: Platelets / Thrombocytes
  'Eosinophils',   // Index 1: Eosinophils
  'Igs',           // Index 2: Immature Granulocytes (Metamyelocytes, Myelocytes, Promyelocytes)
  'Lymphocytes',   // Index 3: Lymphocytes
  'Blasts',        // Index 4: Blasts / Atypical Leukocytes
  'Monocytes',     // Index 5: Monocytes
  'Neutrophils',   // Index 6: Neutrophils (Segmented & Band)
  'Erythroblasts', // Index 7: Nucleated Red Blood Cells (NRBCs / Normoblasts)
  'Baseophils',    // Index 8: Basophils
  'Acanthocytes',  // Index 9: Acanthocytes (Spur Cells)
  'Normal_cells',  // Index 10: Normal Erythrocytes (Discocytes)
  'Target_cells',  // Index 11: Target Cells (Codocytes)
  'Ovalocytes',    // Index 12: Ovalocytes
  'Elliptocytes',  // Index 13: Elliptocytes (Pencil Cells)
  'Teardrops',     // Index 14: Teardrop Cells (Dacrocytes)
  'Spherocyters',  // Index 15: Spherocytes
  'Schistocytes',  // Index 16: Schistocytes (Fragmented / Helmet RBCs)
  'Stomatocytes',  // Index 17: Stomatocytes (Mouth Cells)
  'Echinocytes',   // Index 18: Echinocytes (Burr Cells)
  'Hypochromic',   // Index 19: Hypochromic RBCs
];
```

---

## 3. Detailed Step-by-Step Function Implementation Specifications

### 3.1 WebGPU Session Factory & Overlapped Preloading
**Location**: `../aimalabs-lynceus/index.html` (inside `<script>` block)

#### Function: `createGpuSession(modelPath, modelName)`
- **Input**:
  - `modelPath`: `string` (e.g. `'assets/swin_classifier_int8.onnx'`)
  - `modelName`: `string` (e.g. `'Swin-T Classifier'`)
- **Output**: `Promise<ort.InferenceSession>`
- **Logic**:
  1. Check if `typeof ort === 'undefined'`. If missing, throw explicit Error.
  2. Configure `executionProviders`:
     ```javascript
     const options = {
       executionProviders: [
         {
           name: 'webgpu',
           deviceType: 'gpu',
           powerPreference: 'high-performance',
         },
         'wasm'
       ],
       graphOptimizationLevel: 'all'
     };
     ```
  3. Attempt `ort.InferenceSession.create(modelPath, options)`.
  4. On catch, log warning and fallback to `ort.InferenceSession.create(modelPath, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' })`.
  5. Return session instance.

#### Function: `preloadClassifierSession()`
- **Global Cache**: `window.__LYNCEUS_CLF_PROMISE__`
- **Logic**: If cache is null, assign `createGpuSession('assets/swin_classifier_int8.onnx', 'Swin-T 20-Class Classifier')` to cache. Return the promise.

#### Function: `preloadSegmentationSession()`
- **Global Cache**: `window.__LYNCEUS_SEG_PROMISE__`
- **Logic**: If cache is null, assign `createGpuSession('assets/cellpose_cyto3_unet_int8.onnx', 'Cellpose Cyto3 UNet')` to cache. Return the promise.

---

### 3.2 Slide Preprocessing & Normalization
**Location**: `../aimalabs-lynceus/index.html`

#### Function: `prepareCellposeTensor(sourceImage, targetWidth, targetHeight)`
- **Input**:
  - `sourceImage`: `HTMLImageElement` or `HTMLCanvasElement`
  - `targetWidth`: `number` (e.g. 512 or source width)
  - `targetHeight`: `number` (e.g. 512 or source height)
- **Output**: `{ tensor: ort.Tensor, width: number, height: number, scaleX: number, scaleY: number }`
- **Math & Preprocessing**:
  1. Draw source image onto an offscreen canvas of $(W, H)$.
  2. Extract `ctx.getImageData(0, 0, W, H).data`.
  3. Cytology extraction with brightfield inversion:
     $$I_{\text{gray}}[i] = 255.0 - (0.299 \cdot R[i] + 0.587 \cdot G[i] + 0.114 \cdot B[i])$$
  4. Percentile normalization:
     - Find $p_1$ (1st percentile) and $p_{99}$ (99th percentile) from $I_{\text{gray}}$.
     - $\text{range} = \max(10^{-5}, p_{99} - p_1)$.
     - Channel 0: $C_0[i] = \text{clamp}\left(\frac{I_{\text{gray}}[i] - p_1}{\text{range}}, 0.0, 1.0\right)$.
     - Channel 1: $C_1[i] = 0.0$ (Zero nuclear channel).
  5. Interleave into Float32Array of length $2 \times H \times W$:
     - First $H \times W$ elements: Channel 0.
     - Second $H \times W$ elements: Channel 1.
  6. Return `new ort.Tensor('float32', tensorBuffer, [1, 2, H, W])`.

---

### 3.3 2D Euler Flow Vector Field Dynamics & Contour Extraction
**Location**: `../aimalabs-lynceus/index.html`

#### Function: `computeMasksFromFlows(dP_y, dP_x, cellprob, width, height, options)`
- **Input**:
  - `dP_y`: `Float32Array` of size $W \times H$ (Flow vector Y component)
  - `dP_x`: `Float32Array` of size $W \times H$ (Flow vector X component)
  - `cellprob`: `Float32Array` of size $W \times H$ (Probability / Logits)
  - `width`: `number` ($W$)
  - `height`: `number` ($H$)
  - `options`: `{ cellprobThreshold: 0.0, flowThreshold: 0.4, niter: 200, minArea: 15, mpp: 0.125 }`
- **Output**: `{ cells: Array<CellObject>, mask: Int32Array }`
- **Euler Dynamics Math**:
  1. Filter active points: `indices` where `cellprob[i] > cellprobThreshold`.
  2. Euler trajectory integration for 200 iterations:
     $$\Delta x = \text{bilinear\_interp}(dP_x, x, y) \times 0.2$$
     $$\Delta y = \text{bilinear\_interp}(dP_y, x, y) \times 0.2$$
     $$x_{t+1} = \text{clamp}(x_t + \Delta x, 0, W-1), \quad y_{t+1} = \text{clamp}(y_t + \Delta y, 0, H-1)$$
  3. Sink convergence clustering & local maxima peak detection in 2D histogram.
  4. Connected component labeling & flow error thresholding:
     $$\text{FlowError} = \frac{1}{N} \sum_{i=1}^N \frac{1}{2} \left\| \vec{v}_{\text{pred}}[i] - \vec{v}_{\text{center}}[i] \right\|^2$$
  5. For each valid component with $\text{Area} \ge \text{minArea}$:
     - Extract Moore-neighbor boundary contour: `extractCellContour(mask, cellId, W, H, minY, minX, maxY, maxX)`.
     - Compute morphometrics:
       $$\text{Area } (\mu\text{m}^2) = N_{\text{pixels}} \times \text{mpp}^2$$
       $$\text{Circularity} = \frac{4\pi \times \text{Area}}{\text{Perimeter}^2}$$
       $$\text{Diameter } (\mu\text{m}) = 2 \sqrt{\frac{\text{Area}}{\pi}}$$

---

### 3.4 Boundary-Safe `SquarePad` & ImageNet Normalization
**Location**: `../aimalabs-lynceus/index.html`

#### Function: `cropAndSquarePadCell(sourceCanvas, bbox, targetSize = 224)`
- **Input**:
  - `sourceCanvas`: `HTMLCanvasElement` or `HTMLImageElement`
  - `bbox`: `[minY, minX, maxY, maxX]`
  - `targetSize`: `number` (224)
- **Output**: `Float32Array` of size $3 \times 224 \times 224$
- **Boundary Handling & Math**:
  1. Clamped valid intersection with canvas bounds $(W, H)$:
     $$x_0 = \max(0, \min(W, \text{minX})), \quad y_0 = \max(0, \min(H, \text{minY}))$$
     $$x_1 = \max(0, \min(W, \text{maxX} + 1)), \quad y_1 = \max(0, \min(H, \text{maxY} + 1))$$
     $$w_{\text{valid}} = \max(1, x_1 - x_0), \quad h_{\text{valid}} = \max(1, y_1 - y_0)$$
  2. Aspect-ratio-preserving square dimension:
     $$s = \max(w_{\text{valid}}, h_{\text{valid}})$$
     $$p_l = \left\lfloor \frac{s - w_{\text{valid}}}{2} \right\rfloor, \quad p_t = \left\lfloor \frac{s - h_{\text{valid}}}{2} \right\rfloor$$
  3. Draw zero-filled black square canvas $s \times s$. Draw valid crop at $(p_l, p_t)$.
  4. Resample square canvas to $224 \times 224$ using bilinear interpolation.
  5. ImageNet normalization:
     $$\text{tensor}[0, y, x] = \frac{R/255.0 - 0.485}{0.229}$$
     $$\text{tensor}[1, y, x] = \frac{G/255.0 - 0.456}{0.224}$$
     $$\text{tensor}[2, y, x] = \frac{B/255.0 - 0.406}{0.225}$$
  6. Return flattened Float32Array tensor buffer.

#### Function: `prepareBatchSquarePadTensor(sourceCanvas, cells, targetSize = 224)`
- **Input**: `sourceCanvas`, `cells` (Array of cell objects with `bbox`)
- **Output**: `ort.Tensor` of shape `[B, 3, 224, 224]`
- **Logic**:
  1. Allocate `Float32Array` of size $B \times 3 \times 224 \times 224$.
  2. For each cell $b \in [0, B-1]$:
     - Run `cropAndSquarePadCell(sourceCanvas, cells[b].bbox, 224)`.
     - Copy $3 \times 224 \times 224$ floats into buffer at offset $b \times (3 \times 224 \times 224)$.
  3. Return `new ort.Tensor('float32', batchBuffer, [B, 3, 224, 224])`.

---

### 3.5 Batched Swin Transformer Inference & Probability Ranking
**Location**: `../aimalabs-lynceus/index.html`

#### Function: `classifySegmentedBatch(clfSession, sourceCanvas, cells)`
- **Input**:
  - `clfSession`: `ort.InferenceSession`
  - `sourceCanvas`: `HTMLCanvasElement`
  - `cells`: Array of candidate cells
- **Output**: `Promise<Array<AnnotationObject>>`
- **Softmax & Taxonomy Assignment**:
  1. Build batch tensor: `const batchTensor = prepareBatchSquarePadTensor(sourceCanvas, cells, 224)`.
  2. Run WebGPU forward pass: `const output = await clfSession.run({ input: batchTensor })`.
  3. Extract output logits buffer (length $B \times 20$).
  4. For each cell $b$:
     - Extract 20 logits: $z_0, z_1, \dots, z_{19}$.
     - Numerically stable Softmax:
       $$m = \max_{j} z_j, \quad \sigma = \sum_{j=0}^{19} e^{z_j - m}$$
       $$p_i = \frac{e^{z_i - m}}{\sigma}$$
     - Find $\text{topIndex} = \arg\max_i p_i$.
     - `topClassId = MASTER_CLASSES[topIndex]`.
     - `topConfidence = p[topIndex]`.
     - Map full predictions array sorted descending by probability:
       ```javascript
       const predictions = MASTER_CLASSES.map((cls, idx) => ({
         classId: cls,
         prob: Number(p[idx].toFixed(4))
       })).sort((a, b) => b.prob - a.prob);
       ```
     - Map to Lynceus annotation object:
       ```javascript
       return {
         id: `c-${String(b + 1).padStart(2, '0')}`,
         classId: topClassId,
         label: formatClassLabel(topClassId),
         x: cells[b].bbox[1],
         y: cells[b].bbox[0],
         width: cells[b].bbox[3] - cells[b].bbox[1] + 1,
         height: cells[b].bbox[2] - cells[b].bbox[0] + 1,
         confidence: Number(topConfidence.toFixed(3)),
         shape: cells[b].shape || 'box',
         contour: cells[b].contour,
         morphology: cells[b].morphology,
         predictions: predictions
       };
       ```

---

### 3.6 Pipelined Telesphorus (Flash Mode) Orchestration
**Location**: `../aimalabs-lynceus/index.html`

#### Function: `runModelInference(modelType = 'pro', overrideDuration = null)`
- **Implementation Strategy**:
  1. If `modelType === 'fast'` (Telesphorus / Flash Mode):
     - Show progress HUD overlay.
     - **Step 1 (Parallel Warmup)**: Call `const clfPromise = preloadClassifierSession();` (starts downloading and compiling `swin_classifier_int8.onnx` on WebGPU immediately).
     - Update progress: 15% *"Initializing WebGPU pipelines & preloading classifier..."*. Yield event loop (`await yieldToMain()`).
     - **Step 2 (Segmentation)**: Await `const segSession = await preloadSegmentationSession();`.
     - Update progress: 35% *"Scanning smear fields & running Cellpose Cyto3 on WebGPU..."*.
     - Execute Cellpose forward pass on slide image $\rightarrow$ Euler dynamics tracking $\rightarrow$ candidate cell extraction.
     - Update progress: 65% *"Extracted cells. Tracing contours & morphometrics..."*.
     - **Step 3 (Batch Tensor Formatting)**: Format SquarePad batch tensor $[B, 3, 224, 224]$.
     - Update progress: 80% *"Classifying 20 lineages on WebGPU (Swin-T)..."*.
     - **Step 4 (Zero-Wait Classification)**: Await `const clfSession = await clfPromise;` (classifier is already downloaded and compiled!).
     - Execute batched Swin-T forward pass on WebGPU.
     - **Step 5 (Commit & Refresh)**:
       - Commit annotations: `state.annotations = classifiedAnnotations;`.
       - Recalculate WBC differential breakdown.
       - Evaluate critical alerts (blasts, schistocytes, IGs).
       - Refresh canvas, minimap, gallery, and inspector.
       - Update progress: 100% *"Flash Analysis Complete"*.
       - Close modal and display toast notification: `showToast("✓ Flash Mode: Real WebGPU inference complete (32 cells detected)")`.

---

### 3.7 Interactive Live Single-Cell WebGPU Classification
**Location**: `../aimalabs-lynceus/index.html`

#### Function: `classifySinglePatch(sourceCanvas, bbox)`
- **Logic**:
  1. Obtain `const clfSession = await preloadClassifierSession();`.
  2. Crop and format single $[1, 3, 224, 224]$ tensor using `cropAndSquarePadCell(sourceCanvas, bbox, 224)`.
  3. Execute `const output = await clfSession.run({ input: new ort.Tensor('float32', tensor, [1, 3, 224, 224]) })`.
  4. Compute Softmax over 20 logits.
  5. Return `{ topClassId, confidence, predictions }`.
- **Integration**:
  - In `handleBoxCreation` and `handleCircleCreation`, call `classifySinglePatch` to immediately classify the user-drawn ROI in $<3\text{ ms}$ on WebGPU.

---

## 4. Testing & Verification Suite Specifications

### Test Suite 1: WebGPU Model Preloading & Overlap Unit Test
**File**: `../aimalabs-lynceus/tests/test_flash_webgpu_inference.js`
- **Execution Command**: `node tests/test_flash_webgpu_inference.js`
- **Assertions**:
  1. `preloadClassifierSession()` returns a valid Promise without blocking the main thread.
  2. WebGPU execution provider is selected, with fallback to WASM when running in headless environments lacking WebGPU drivers.
  3. Cellpose Cyto3 segmentation tensor shape is strictly `[1, 2, H, W]`, and output is `[1, 3, H, W]`.
  4. Euler flow field dynamics splits touching cell clumps into discrete instances.
  5. Swin-T input tensor shape is strictly `[B, 3, 224, 224]` with ImageNet normalization ($[-2.5, 2.5]$ range).
  6. Output logits shape is strictly `[B, 20]`.
  7. Every predicted class belongs to `MASTER_CLASSES`.
  8. Sum of Softmax probabilities equals $1.0 \pm 10^{-4}$.

### Test Suite 2: Telesphorus Real-Model End-to-End E2E Test
**File**: `../aimalabs-lynceus/tests/test_telesphorus_real_inference.js`
- **Execution Command**: `node tests/test_telesphorus_real_inference.js`
- **Assertions**:
  1. Opens Lynceus in Puppeteer with `--enable-unsafe-webgpu` and `--allow-file-access-from-files`.
  2. Opens Reset Modal, selects "Telesphorus (Flash Mode)", and clicks Confirm.
  3. Verifies that progress HUD activates with live text updates (*"Scanning digital smear fields..."*, *"Identifying cell boundaries (Cellpose Cyto3)..."*, *"Classifying cell lineages (Swin-T 20 Classes)..."*).
  4. Verifies that upon completion, `state.annotations.length >= 30`.
  5. Verifies that each annotation has valid bounding box, polygon contour, morphometric parameters, and 20-element `predictions` array.
  6. Verifies that WBC differential table and stacked bar reflect genuine leukocyte counts.

### Test Suite 3: Interactive Drawing Tool Live Inference Test
**File**: `../aimalabs-lynceus/tests/test_interactive_inference.js`
- **Execution Command**: `node tests/test_interactive_inference.js`
- **Assertions**:
  1. Selects Box tool and draws ROI over a leukocyte at coordinates `(280, 190, 108, 104)`.
  2. Asserts that newly added annotation has `classId: 'Neutrophils'`, confidence $>0.85$, and top prediction ranked #1.
  3. Asserts that Cell Inspector panel dynamically renders 20-class probability breakdown bars.

### Test Suite 4: Complete Regression Suite
- **Commands**:
  ```bash
  cd ../aimalabs-lynceus && npm test
  cd /Users/cperivol/Projects/cellpose && pytest -v
  ```
- **Target**: **100% Pass Rate across all 19+ test suites**.
