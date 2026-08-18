Create a complete, single-file HTML/CSS/JS interactive prototype (`index.html`) for a modern digital pathology and hematology cell-review interface (similar to a clinical web microscope viewer).

The goal is to provide a smooth, tactile desktop experience that mimics and improves upon a traditional optical microscope, including human-in-the-loop AI annotation editing.

---

### Key Requirements & Features

1. **Architecture & Tech Stack:**
   - Standalone single-file HTML (use Tailwind CSS via CDN and Lucide Icons via CDN or inline SVGs).
   - Vanilla JS or Canvas/SVG rendering for performance.
   - Self-contained mock data (embed a high-resolution blood smear / cytological sample image via SVG/Canvas or placeholder URL, along with a preloaded list of ~30-50 detected cells).

2. **Viewport & Navigation (Microscope Canvas):**
   - **Smooth Pan & Zoom:** Mouse wheel zoom (centered at cursor), click-and-drag panning, and keyboard shortcuts (`+`, `-`, `Space + Drag`, `0` to reset).
   - **Minimap / Slide Navigator:** A small overview map in the corner showing the current viewport rectangle over the entire slide tile.
   - **Scale Bar & Magnification Indicator:** Show virtual magnification level (e.g., 10x, 40x, 100x Oil Immersion).

3. **Cell Overlays & Visualization:**
   - **Multi-Class Coloring:** Distinct, high-contrast color bounding boxes / centroid markers for different cell classes (e.g., *Neutrophils [Blue]*, *Lymphocytes [Green]*, *Monocytes [Purple]*, *Eosinophils [Orange]*, *Atypical/Blasts [Red]*, *Platelets [Yellow]*).
   - **Overlay Toggle:** Master toggle (`H` hotkey) to instantaneously hide/show all AI bounding boxes and labels to inspect raw morphology.
   - **Per-Class Filtering:** Checkbox list in the sidebar to toggle visibility for specific cell classes.

4. **Inspection & Hover Tooltips:**
   - **Hover Card:** Hovering over an annotated cell displays a floating HUD with:
     - Predicted Class & AI Confidence (e.g., `Neutrophil - 96.4%`)
     - Morphological measurements (Area in µm², Diameter, Circularity index)
     - Quick action buttons (Delete, Reclassify).

5. **Human-in-the-Loop Annotation & Editing Tools:**
   - **Inspection Mode (Default):** Pan, zoom, click to inspect.
   - **Draw / Add Cell Tool:** Ability to draw a bounding circle/box or click-to-place a cell annotation, selecting its class from a dropdown or hotkey (1-6).
   - **Delete Tool / Quick Delete:** Click a detected cell or press `Backspace`/`Delete` on selection to remove false positives.
   - **Reclassify:** Right-click context menu or modal on an existing cell to correct its classification.

6. **Summary Metrics & State Persistence:**
   - **Live Differential Count Sidebar:** Real-time summary table of total counts and percentages per cell category that updates immediately when cells are added, deleted, or reclassified.
   - **State Persistence:** Automatically sync all annotations and manual edits to `localStorage` so changes persist across page reloads.
   - **Export / Import:** "Export Annotations (JSON)" button and "Reset to Default AI Detections" button.

7. **UI / Styling:**
   - Clean, professional dark/slate laboratory theme (`#0f172a` palette).
   - Floating top toolbar (Tool selection: Pan, Draw, Erase; Toggle Overlays; Zoom Controls; Undo/Redo).
   - Collapsible left/right sidebars (Slide Info, Differential Count, Annotation History).

Ensure the interface is snappy, visually polished, and fully functional without requiring any external backend server.

---

### Hierarchy of Tasks & Implementation Plan

#### Phase 1: Core Foundation & Simple Case (MVP)
- [x] **Task 1.1: Standalone Environment & Asset Integration**
  - [x] 1.1.1 Embed high-resolution blood smear image (`smear-02.jpeg` / `smear-02.jpg`) with inline base64 fallback.
  - [x] 1.1.2 Set up single-file HTML layout with dark laboratory theme (`#0b0f19` / `#0f172a`), Tailwind CSS, and vector icons.
  - [x] 1.1.3 Define foundational cell taxonomy (Neutrophil, Lymphocyte, Monocyte, Eosinophil, Basophil, Blast, Platelet, RBC Variant) with distinct high-contrast color palettes.
- [x] **Task 1.2: Base Microscope Canvas & Transforms**
  - [x] 1.2.1 Implement hardware-accelerated 2D canvas with world-to-screen coordinate mapping.
  - [x] 1.2.2 Implement smooth cursor-centered mouse wheel zoom ($0.1\times - 16\times$) and drag-to-pan.
  - [x] 1.2.3 Render initial mock cell detection bounding boxes and centroid badges.

#### Phase 2: Viewport Navigation, Minimap & Optical HUD
- [x] **Task 2.1: Interactive Minimap (Slide Navigator)**
  - [x] 2.1.1 Render complete slide overview thumbnail with color-coded cell dots.
  - [x] 2.1.2 Draw synchronized dynamic viewport rectangle showing current field of view.
  - [x] 2.1.3 Enable interactive click & drag on minimap to smoothly pan microscope view.
- [x] **Task 2.2: Optical Scale & Magnification Controls**
  - [x] 2.2.1 Render dynamic micron scale bar ($10\,\mu\text{m}, 25\,\mu\text{m}, 50\,\mu\text{m}, 100\,\mu\text{m}$) adjusting to zoom level.
  - [x] 2.2.2 Implement discrete objective magnification buttons ($10\times, 20\times, 40\times, 60\times, 100\times\text{ Oil Immersion}$) and zoom slider.
  - [x] 2.2.3 Display real-time FOV stage coordinates ($X, Y$ in $\mu\text{m}$) and optional center reticle.

#### Phase 3: Cell Visualization, Filtering & Inspection
- [x] **Task 3.1: Layer & Visibility Controls**
  - [x] 3.1.1 Implement Master Overlay toggle (`H` hotkey) to instantaneously hide/show all AI bounding boxes.
  - [x] 3.1.2 Add Per-Class visibility filter checkboxes with "Solo" view toggles.
  - [x] 3.1.3 Implement AI confidence threshold filter slider ($0\% - 100\%$).
- [x] **Task 3.2: Floating Hover HUD & Cell Inspector**
  - [x] 3.2.1 Build floating hover card displaying predicted class, confidence %, diameter ($\mu\text{m}$), area ($\mu\text{m}^2$), and circularity.
  - [x] 3.2.2 Build right-sidebar Cell Inspector with cropped cell thumbnail preview, top-3 AI prediction bars, and morphometric readout.
  - [x] 3.2.3 Add right-click context menu for instant reclassification, deletion, and FOV centering.

#### Phase 4: Human-in-the-Loop Annotation & Editing Suite
- [x] **Task 4.1: Annotation Editing Tools**
  - [x] 4.1.1 Select & Transform Tool (`V` / `1`): Select, move, and drag handles to resize bounding boxes.
  - [x] 4.1.2 Draw Bounding Box Tool (`B` / `2`): Click-and-drag to create custom rectangular annotations.
  - [x] 4.1.3 Draw Circle Tool (`C` / `3`): Click-and-drag circular cell markers.
  - [x] 4.1.4 Quick Point / Auto-Detect Tool (`P` / `4`): Click to place standard cell annotation with active class.
  - [x] 4.1.5 Eraser Tool (`E` / `5`): Direct click-to-delete cell tool.
  - [x] 4.1.6 Caliper / Measurement Tool (`M` / `6`): Point-to-point micron distance measurement with clinical ruler lines.
- [x] **Task 4.2: Classification & History Management**
  - [x] 4.2.1 Implement quick reclassification modal and keyboard shortcuts ($1-8$).
  - [x] 4.2.2 Implement Undo / Redo history stack (`Ctrl+Z`, `Ctrl+Y` / `Cmd+Z`, `Cmd+Shift+Z`) for all mutations.
  - [x] 4.2.3 Support keyboard deletion (`Delete` / `Backspace`) of selected cells.

#### Phase 5: AIMALABS Design System & Spatial Layout De-cluttering
- [x] **Task 5.1: AIMALABS Brand Identity & Visual Guidelines Documentation**
  - [x] 5.1.1 Copy official logo asset (`assets/aima-logo.png`) and format header anchor `<a class="brand" href="index.html"><img src="assets/aima-logo.png" alt="AIMALABS"/><b>AIMALABS</b></a>`.
  - [x] 5.1.2 Author comprehensive `branding.md` documenting color variables, typography stack (`Sora`, `IBM Plex Sans`, `IBM Plex Mono`), microscopy overlays, and component design patterns.
  - [x] 5.1.3 Integrate AIMALABS dark aesthetic (`--coral: #EC3B57` / `rgb(229,34,70)`, `--black: #131215`, `--black-2: #1B191E`, `--black-3: #0E0D10`, `--muted: #6C6770`, `--muted-d: #B4AFBA`).
- [x] **Task 5.2: Layout De-cluttering & Resizable Sidebars**
  - [x] 5.2.1 Eliminate floating HUD element collisions by unifying the bottom status & optical control bar.
  - [x] 5.2.2 Implement smooth draggable column resizer handles for both Left and Right sidebars with min/max clamps.
  - [x] 5.2.3 Ensure canvas auto-refits without clipping labels or morphometric overlays during dynamic sidebar resizing.

#### Phase 6: Metrics, Persistence, Gallery & Workflow Polish
- [ ] **Task 6.1: Live WBC Differential Count Engine**
  - [ ] 6.1.1 Calculate real-time 100-WBC differential percentages, counts, and clinical reference ranges.
  - [ ] 6.1.2 Render stacked visual WBC composition bar and abnormality status flags (e.g., Neutrophilia, Blasts Present).
- [ ] **Task 6.2: Cell Gallery & Review Strip**
  - [ ] 6.2.1 Build filterable thumbnail gallery grid of all detected cells.
  - [ ] 6.2.2 Implement one-click smooth fly-to navigation from gallery thumbnail to canvas.
- [ ] **Task 6.3: State Persistence & Data Exchange**
  - [ ] 6.3.1 Automatically persist all edits, filters, and custom cells to `localStorage`.
  - [ ] 6.3.2 Implement Export Annotations (JSON), Import Annotations (JSON), and Export Report (CSV).
  - [ ] 6.3.3 Implement high-res Viewport Snapshot capture (PNG) with/without overlays.
  - [ ] 6.3.4 Add "Reset to Default AI Detections" action.
- [ ] **Task 6.4: User Experience & Keyboard Cheat Sheet**
  - [ ] 6.4.1 Keyboard shortcuts modal (`?` key) with full shortcut list.
  - [ ] 6.4.2 Image adjustments (brightness, contrast, saturation) for slide inspection.

#### Phase 7: Automated Testing & Verification
- [ ] **Task 7.1: Comprehensive End-to-End Automated Test Suite**
  - [x] 7.1.1 Test file loading and direct `file://` / standalone execution.
  - [x] 7.1.2 Test pan, zoom, preset magnification, and minimap viewport sync.
  - [x] 7.1.3 Test overlay toggling, confidence filtering, and per-class visibility.
  - [x] 7.1.4 Test cell selection, hover HUD, morphometrics, and right sidebar inspector.
  - [x] 7.1.5 Test drawing new boxes, circles, calipers, deleting cells, and reclassifying.
  - [x] 7.1.6 Test resizable sidebars and canvas layout responsiveness.
  - [ ] 7.1.7 Test undo/redo operations.
  - [ ] 7.1.8 Test live differential count calculations and abnormality banners.
  - [ ] 7.1.9 Test thumbnail gallery click-to-navigate.
  - [ ] 7.1.10 Test `localStorage` persistence across reloads.
  - [ ] 7.1.11 Test JSON import/export and CSV report generation.
