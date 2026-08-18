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
