# Lynceus Hematology Platform — Implementation & Testing Plan

## Core Architecture: Single-Smear / Zero-Smear Workspace
Each page view contains either a single active blood smear or no smear (empty state workspace). All file selection dropdowns and tabs have been eliminated in favor of a clean, focused workflow.

---

## 📋 Task Breakdown

### 1. Header & Case Navigation
- [x] Remove the case dropdown selector (`#case-selector-dropdown`) and dropdown trigger arrow (`#btn-case-dropdown-trigger`).
- [x] Remove case tabs from header (`#case-tabs-container`).
- [x] Retain only the patient & smear clinical metadata chip (`#btn-case-meta`) which opens the Case Metadata Dialog to modify patient demographics, collection date, slide ID, and clinical impression.
- [x] Ensure single-smear state architecture across the application.

### 2. Case Metadata Dialog
- [x] Remove the deletion button (`#btn-delete-case`) from the Case Metadata dialog.
- [ ] Ensure the "Save & Apply" button persists changes to state and saves/updates the smear record in the local IndexedDB history.

### 3. Redesigned Empty / No-Smear Screen (`#empty-workspace-hud`)
- [ ] Prominent **Upload Smear** button (`#btn-empty-upload-image`) accepting `.aimalabs`, `.zip`, `.json`, `.png`, `.jpg`, `.tiff`.
- [ ] **Sample Smears Section**: Interactive ground truth benchmark smears (`smear-02`, `smear-field`, `Image_104`, `Image_105`) with 1-click loading.
- [ ] **Local Upload History Section**:
  - Clear disclosure notice: `🔒 Stored locally in your browser DB on your computer`.
  - Display saved smears with patient name, slide ID, date, cell count, and SHA-256 hash preview.
  - "Open" button to load historical smear into workspace.
  - Individual delete button (`🗑️`) to remove specific smear from IndexedDB history.
  - "Clear All History" button (`#btn-clear-all-history`) with confirmation prompt.

### 4. Local IndexedDB History Engine
- [ ] Database `lynceus_smear_history_db` with store `smear_history`.
- [ ] Primary key: SHA-256 hex hash string.
- [ ] **Strict Deduplication**: Saving an existing hash updates the record timestamp and metadata rather than creating duplicate entries.
- [ ] Individual deletion and clear-all operations.

### 5. URL GET Query Hash Routing (`?hash=<sha256>`)
- [ ] When a smear is loaded, uploaded, or saved, synchronize its SHA-256 hash into the URL query string (`window.history.replaceState(null, '', '?hash=' + hash)`).
- [ ] On initial page load:
  - Extract `hash` parameter from `window.location.search`.
  - Search both **Ground Truth Samples** and **IndexedDB Local History**.
  - **If Found**: Load that smear immediately into the single-smear workspace.
  - **If Not Found**: Display a polite notification banner (*"Specimen not found: We couldn't find a blood smear matching hash `<hash>`. Please choose from available ground truth samples below or upload a file."*) and render the redesigned empty workspace screen.
  - **If No Hash Provided**: Load default smear (`smear-02`) and set `?hash=<smear02_hash>`.

---

## 🧪 Rigorous Testing Requirements (CRUCIAL)

Automated end-to-end and unit testing must verify all aspects with zero regression:

1. **`tests/test_single_smear_history_and_hash_routing.js`**:
   - [ ] Verify header has only the chip `#btn-case-meta` (no dropdown, no tabs).
   - [ ] Verify clicking chip opens Case Metadata modal without a delete button.
   - [ ] Verify "Save & Apply" in modal writes to IndexedDB history with SHA-256 hash.
   - [ ] Verify IndexedDB deduplication: saving the same smear/hash multiple times yields exactly 1 record.
   - [ ] Verify deleting an individual entry from history via the delete trash button.
   - [ ] Verify clearing all history via "Clear All History".
   - [ ] Verify loading a ground truth sample smear (`smear-field`, `Image_104`, etc.) in 1-click.
   - [ ] Verify URL GET query parameter hash synchronization (`?hash=<sha256>`).
   - [ ] Verify page load with valid sample hash immediately activates that smear.
   - [ ] Verify page load with non-existent hash shows polite warning alert and renders the redesigned empty workspace screen.

2. **Full Regression Suite (`npm test`)**:
   - [ ] Execute all 25+ test suites across AI model inference (Cellpose SAM-v2 + Swin-T WebGPU), differential counting, pixel calibration, UI tools, and export/import.
   - [ ] Ensure 100% pass rate with zero tolerance for errors or regressions.
