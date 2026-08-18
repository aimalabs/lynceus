# AIMALABS Lynceus (Λυγκεύς) — Technical Specification & Architecture Manual

**AIMALABS Lynceus (Λυγκεύς)** is a standalone, high-performance, single-file interactive digital pathology and hematology cell-review prototype (`index.html`). Named after the legendary mythological Argonaut with piercing optical vision, Lynceus provides a tactile, microscope-grade digital review environment with human-in-the-loop AI annotation editing, live WBC differential reporting, real-time cell gallery navigation, and optical pixel calibration.

---

## 1. High-Level Architecture & Principles

- **Zero-Backend Standalone Operation**: The complete application is contained in a single `index.html` file that runs directly from `file://` or any static web server without requiring node servers, bundlers, or remote databases.
- **Embedded Base64 Assets**: Slide tile image (`smear-02.jpg`, 1500×1125 px Wright-Giemsa peripheral blood smear) and brand logo (`aima-logo.png`) are embedded directly as base64 data URIs to avoid `file://` CORS restrictions and eliminate network latency.
- **Hardware-Accelerated 2D Canvas Engine**: Rendering is driven by standard HTML5 2D Canvas with sub-pixel world-to-screen transform mathematics, batched via `requestAnimationFrame` (`scheduleRender()`) to maintain 60+ FPS during pan and zoom.
- **AIMALABS Brand Identity**: Deep dark laboratory aesthetic specified in `branding.md`:
  - **Coral Accent**: `--coral: #EC3B57` / `rgb(229, 34, 70)` / `#e52246`
  - **Dark Glass Hierarchy**: `--black: #131215`, `--black-2: #1B191E`, `--black-3: #0E0D10`, border `#272527` / `#373437`
  - **Typography Stack**: `Sora` (headings/brand), `IBM Plex Sans` (body/UI), `IBM Plex Mono` (metrics/hotkeys)

---

## 2. Global State Schema (`state`)

All application state is maintained in a centralized reactive state object exposed on `window.__CYTO_APP__.state`:

```typescript
interface AppState {
  image: HTMLImageElement;
  imageLoaded: boolean;
  view: {
    x: number;          // Viewport X pan offset (screen pixels)
    y: number;          // Viewport Y pan offset (screen pixels)
    zoom: number;       // Virtual magnification scale (0.10x - 16.0x)
    minZoom: number;    // 0.10
    maxZoom: number;    // 16.0
  };
  tool: 'select' | 'box' | 'circle' | 'point' | 'measure' | 'erase';
  activeClassId: string;           // Currently selected lineage for drawing (default 'neutrophil')
  overlaysVisible: boolean;        // Master AI overlay toggle (hotkey 'H')
  minConfidence: number;          // AI confidence threshold filter (0.50 - 0.99)
  classFilter: Record<string, boolean>; // Per-class visibility map
  selectedCellId: string | null;   // Active selected annotation ID (e.g. 'c-01')
  selectedMeasurementId: string | null;
  hoveredCellId: string | null;    // Cell under mouse cursor for floating HUD
  showReticle: boolean;            // Optical crosshair reticle toggle (hotkey 'R')
  isDragging: boolean;             // Canvas drag pan flag
  isMinimapDragging: boolean;      // Minimap click-to-pan flag
  isDrawing: boolean;              // In-progress ROI drawing flag
  drawStartWorld: { x: number; y: number };
  drawCurrentWorld: { x: number; y: number };
  dragStart: { x: number; y: number };
  micronsPerPixel: number;         // Physical scale calibration (default 0.125 µm/px)
  measurements: CaliperMeasurement[];
  undoStack: string[];             // JSON snapshots for Undo (Ctrl+Z / Cmd+Z)
  redoStack: string[];             // JSON snapshots for Redo (Ctrl+Y / Cmd+Shift+Z)
  annotations: CellAnnotation[];    // 40 initial default detected cells
  taxonomy: TaxonomyClass[];       // 8 hematological lineages
  galleryFilter: string;           // 'all' | 'neutrophil' | 'lymphocyte' | 'monocyte' | etc.
}
```

### Cell Annotation Data Model (`CellAnnotation`)
```typescript
interface CellAnnotation {
  id: string;                      // e.g. 'c-01'
  classId: string;                 // 'neutrophil' | 'lymphocyte' | 'monocyte' | 'eosinophil' | 'basophil' | 'blast' | 'platelet' | 'rbc_variant'
  label: string;                   // Clinical display name (e.g. 'Segmented Neutrophil')
  x: number;                       // Slide world coordinates (top-left X in px)
  y: number;                       // Slide world coordinates (top-left Y in px)
  width: number;                   // Bounding box width in slide px
  height: number;                  // Bounding box height in slide px
  confidence: number;              // Model certainty (0.00 - 1.00)
  shape: 'box' | 'circle';         // ROI geometry
  morphology: {
    area_um2: number;              // Calculated physical area in µm²
    diameter_um: number;          // Calculated physical diameter in µm
    circularity: number;          // Circularity index (0.00 - 1.00)
    nc_ratio: number;             // Nuclear-to-Cytoplasmic ratio (0.00 - 1.00)
  };
  predictions: Array<{ classId: string; prob: number }>; // Multiclass probability distribution
}
```

### Hematological Taxonomy (`CELL_TAXONOMY`)
1. **Segmented Neutrophil (`neutrophil` / `NEU`)**: `#38bdf8` (Sky Blue) • Ref: `40-70%`
2. **Lymphocyte (`lymphocyte` / `LYM`)**: `#10b981` (Emerald Green) • Ref: `20-40%`
3. **Monocyte (`monocyte` / `MON`)**: `#a855f7` (Purple) • Ref: `2-8%`
4. **Eosinophil (`eosinophil` / `EOS`)**: `#f97316` (Orange) • Ref: `1-4%`
5. **Basophil (`basophil` / `BAS`)**: `#06b6d4` (Cyan) • Ref: `0-2%`
6. **Blast / Atypical (`blast` / `BLA`)**: `#e52246` (Coral Red) • Ref: `0%` *(Critical Finding Alert)*
7. **Platelet / Thrombocyte (`platelet` / `PLT`)**: `#eab308` (Yellow)
8. **Erythrocyte Variant (`rbc_variant` / `RBC-V`)**: `#ec4899` (Pink)

---

## 3. UI Component Subsystems

### 3.1 Microscope Canvas & Viewport Transform Engine
- **Coordinate Conversion**:
  - `screenToWorld(sx, sy)`: Transforms canvas screen coordinates to slide image pixels.
  - `worldToScreen(wx, wy)`: Transforms slide image pixels to canvas screen coordinates.
- **Cursor-Centered Zoom**: Zooming with mouse wheel or keyboard shortcuts scales around the exact mouse cursor point (`setZoom(newZoom, mouseX, mouseY)`).
- **Smooth Panning**: Middle-click or left-click dragging pans the viewport.

### 3.2 Slide Navigator (Minimap)
- Pinned in the **bottom-right** corner (`#minimap-card`).
- Renders slide thumbnail with color-coded cell dots and dynamic viewport viewing box.
- Click-and-drag navigation allows instant fly-to panning across the slide.
- Features a minimize/expand toggle button (`#btn-close-minimap`).

### 3.3 Optical Telemetry & Magnification Badge
- Positioned discreetly in the **bottom-left** corner (`#optical-telemetry-badge`).
- Shows real-time calibrated scale bar (e.g. `50 µm`), stage FOV coordinates (`XY: x, y µm`), reticle toggle (`R`), and objective magnification dropdown (`10× Scan`, `20× Low`, `40× Dry`, `60× High`, `100× Oil Immersion`).
- Clicking the scale bar triggers the **Optical Pixel Size Calibrator Dialog**.

### 3.4 Top Bar Controls
- **Branding Anchor**: `<a class="brand" href="index.html"><img src="assets/aima-logo.png" alt="AIMALABS"/><b>AIMALABS</b></a>` with `Lynceus` version badge.
- **Annotation Tool Dropdown** (`#tool-dropdown-trigger`): Select (`V`), Bounding Box (`B`), Circle ROI (`C`), Point Centroid (`P`), Caliper (`M`), Eraser (`E`).
- **Active Lineage Dropdown** (`#draw-class-trigger`): Custom dark dropdown displaying active cell class dot, code badge (`NEU`, `BLA`, etc.), and hotkeys (`1-8`).
- **Master Overlay Toggle** (`#btn-toggle-overlay` / `H`): Instant toggle for AI bounding boxes.
- **Data Exchange Menu** (`#btn-export-dropdown-trigger`): Export JSON (`annotations.json`), Export CSV WBC Differential Report (`wbc_differential_report.csv`), Viewport Snapshot PNG (`aimalabs_viewport_snapshot.png`).
- **Reset Detections Modal Trigger** (`#btn-reset-detections`) with modal confirmation.
- **Keyboard Shortcuts Cheat Sheet Modal Trigger** (`#btn-shortcuts` / `?`).

### 3.5 Left Sidebar (Taxonomy & WBC Differential)
- **Class Filters**: Per-class visibility checkboxes, Solo filter buttons, and All/None bulk toggles.
- **Live WBC Differential Summary**:
  - Absolute count of WBCs.
  - Stacked proportion progress bar (`#wbc-stacked-bar`) with hover tooltips showing lineage name, count, percentage, and clinical reference ranges.
  - Abnormality alert banner (`#wbc-alert-banner`) highlighting critical findings (e.g. *⚠️ 2 Blast(s) Detected (8.0%)* or *Neutrophilia*).
- **AI Confidence Threshold Slider**: Range slider ($0.50 - 0.99$) dynamically filtering visible annotations.
- **Resizable Gutter** (`#left-resizer`): Draggable resize handle clamped between 180px and 400px.

### 3.6 Right Sidebar (Cell Inspector & Packed Gallery)
- **Tab Switcher**:
  - `[ Cell Inspector ]`: Shows selected cell's cropped ROI preview canvas, class label, confidence badge, morphometrics (Area, Diameter, Circularity, N:C ratio), top prediction probabilities, and quick reclassification chips ($1-8$).
  - `[ Cell Gallery ]`: Filterable thumbnail strip (`All`, `NEU`, `LYM`, `MON`, `EOS`, `BAS`, `BLA`, `PLT`).
- **Gallery Layout Packing**: Gallery grid uses `content-start auto-rows-max` and `h-fit` cards with constant $88\text{px}$ ROI preview heights to ensure cards are always tightly packed and never stretch vertically.
- **One-Click Fly-to Navigation**: Clicking any gallery card instantly animates and centers the microscope viewport on that cell.
- **Resizable Gutter** (`#right-resizer`): Draggable resize handle clamped between 200px and 460px.

### 3.7 Anchor-Based Help Tooltip Engine
- Help tooltips (`#app-help-tooltip`) are statically anchored to the hovered widget target (`data-help="Title|Description|KEY"`).
- For items inside dropdown menus (`#tool-dropdown-menu`, `#obj-dropdown-menu`, `#draw-class-menu`), tooltips appear **on the side** (to the right/left) to prevent blocking menu options.
- Dynamic color styling (`data-tooltip-color="cls.color"`) matches the lineage color on tooltip borders and indicator dots.
- Tooltips dismiss immediately upon mouse click or mousedown interaction.

---

## 4. Reactive Update Pipeline (`refreshAppViews`)

Whenever annotations are added, reclassified, deleted, resized, calibrated, or undo/redo is triggered, the centralized `refreshAppViews()` function is invoked:
1. `updateInspector()` — Refreshes selected cell readouts and cropped canvas.
2. `renderTaxonomyList()` — Recalculates WBC differential counts, percentages, stacked bar, and abnormality alert banners.
3. `updateUI()` — Updates scale bar, coordinates, and visible counts.
4. `render()` — Redraws microscope canvas overlays, active calipers, and selection rings.
5. `renderMinimap()` — Redraws slide navigator dots and viewport frame.
6. `renderGallery()` — Re-renders packed gallery cards and updates `#gallery-count-badge` if gallery tab is open.
7. `autoSaveToLocalStorage()` — Persists current state to `localStorage.getItem('CYTO_REVIEWER_STATE_V1')`.

---

## 5. Automated Puppeteer Test Suite

All features are covered by **14 automated end-to-end Puppeteer test suites** executed directly against the single-file `index.html`:

```bash
node tests/test_task1_1.js && \
node tests/test_task1_2.js && \
node tests/test_task2_1.js && \
node tests/test_task2_2.js && \
node tests/test_task3_1.js && \
node tests/test_task3_2.js && \
node tests/test_task4_1.js && \
node tests/test_task5_layout.js && \
node tests/test_tools_undo_redo.js && \
node tests/test_pixel_calibrator.js && \
node tests/test_differential.js && \
node tests/test_gallery.js && \
node tests/test_data_exchange.js && \
node tests/test_tooltips_anchor_and_differential_color.js
```

### Test Suite Directory
- `test_task1_1.js`: Standalone environment, base64 assets, taxonomy initialization, canvas mounting.
- `test_task1_2.js`: Viewport pan, cursor zoom, keyboard zoom (`+`, `-`, `0`), coordinate precision transforms.
- `test_task2_1.js`: Minimap rendering, click-to-pan, minimize/expand toggle.
- `test_task2_2.js`: Optical scale bar, objective presets (`10x`, `40x`, `100x Oil`), reticle toggle (`R`).
- `test_task3_1.js`: Master overlay toggle (`H`), per-class filtering, Solo filter, confidence threshold slider.
- `test_task3_2.js`: Floating hover HUD, cell inspector crop canvas, context menu, deletion, reclassification.
- `test_task4_1.js`: Annotation suite (Select `V`, Box `B`, Circle `C`, Point `P`, Caliper `M`, Erase `E`).
- `test_task5_layout.js`: Brand markup, resizable sidebar gutters, unblocked discrete telemetry triggers.
- `test_tools_undo_redo.js`: Add/delete/modify undo and redo stack integrity.
- `test_pixel_calibrator.js`: Dynamic microns/pixel recalculation of cell areas, diameters, and caliper lengths.
- `test_differential.js`: WBC differential count table, stacked proportion bar, blast abnormality alerts.
- `test_gallery.js`: Packed gallery grid, lineage filter tabs, click-to-navigate fly-to, live reactivity on addition/undo.
- `test_data_exchange.js`: LocalStorage persistence, JSON export, CSV clinical report export, Reset modal, Shortcuts modal.
- `test_tooltips_anchor_and_differential_color.js`: Anchor positioning, side-dropdown tooltips, differential bar color matching.
