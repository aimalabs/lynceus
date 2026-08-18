# AIMALABS • Brand Identity & Design System Specification

## 1. Overview & Visual Philosophy
**AIMALABS** develops next-generation AI foundation models and clinical diagnostic software for hematology, cytopathology, and laboratory medicine.

The design language balances **clinical precision, scientific clarity, and computational sophistication**:
- **Tactile & Ergonomic:** Desktop microscopy review requires distraction-free, low-fatigue interfaces.
- **Deep Slate/Dark Laboratory Aesthetics:** High-contrast dark backgrounds ensure cytological stains (Wright-Giemsa, Pap, H&E) and fluorescence signals stand out naturally.
- **Signature Coral-Red Accent (`#EC3B57` / `rgb(229, 34, 70)`):** Signifies AI attention, detection boundaries, and high-priority cellular alerts while preserving clinical objectivity.

---

## 2. Logo & Brand Anchor Specification

The official header brand anchor must follow the exact structure from the AIMALABS platform:

```html
<a class="brand" href="index.html">
  <img src="assets/aima-logo.png" alt="AIMALABS"/>
  <b>AIMALABS</b>
</a>
```

### Brand Element Styles:
- **Image Asset:** `assets/aima-logo.png`
- **Logo Size:** `38px × 38px` with rounded circular profile (`border-radius: 50%` or subtle rounded squircle `10px`).
- **Typography:** `font-family: 'Sora', sans-serif; font-weight: 800; font-size: 18px; letter-spacing: 0.02em; color: #FFFFFF;`
- **Sub-badge / Domain Tag:** `HEMAPATH REVIEW` / `AI CYTOMETRY` in `font-family: 'IBM Plex Mono'; font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--coral); background: rgba(236, 59, 87, 0.12); border: 1px solid rgba(236, 59, 87, 0.30); border-radius: 4px; padding: 2px 6px;`

---

## 3. Typography Stack

AIMALABS utilizes a three-tier typographic hierarchy:

| Role | Font Family | Weights | Usage |
| :--- | :--- | :--- | :--- |
| **Display / Headings** | `'Sora', system-ui, sans-serif` | 600, 700, 800 | Brand name, major panel headings, modal titles, summary numerals |
| **Body & UI** | `'IBM Plex Sans', system-ui, sans-serif` | 400, 500, 600 | General navigation, labels, tooltips, dialogs, button copy |
| **Mono & Telemetry** | `'IBM Plex Mono', ui-monospace, monospace` | 400, 500, 600 | Cell coordinates, scale bars, µm measurements, AI confidence scores, hotkeys |

```css
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
```

---

## 4. Color Palette & CSS Variables

```css
:root {
  /* Brand Coral Accents */
  --coral: #EC3B57;         /* rgb(236, 59, 87) / rgb(229, 34, 70) primary brand accent */
  --coral-2: #F0506A;       /* Hover state coral */
  --coral-dim: rgba(236, 59, 87, 0.15); /* Translucent fill / selection tint */
  --crimson: #B21E3C;       /* Deep clinical alert crimson */

  /* Dark Background & Surface Palette */
  --black: #131215;         /* Deep canvas black */
  --black-2: #1B191E;       /* Sidebar & header surface dark */
  --black-3: #0E0D10;       /* Dropdown / modal darkest surface */
  
  /* Neutral Surfaces & Lines */
  --grey-surface: #272527;  /* Secondary cards & toolbar surface */
  --grey-border: #373437;   /* Element borders */
  --line-d: rgba(255, 255, 255, 0.10); /* Subtle hair lines */
  
  /* Text & Inks */
  --paper: #FFFFFF;         /* Pure white text */
  --ink: #18161B;           /* Deep black text for light backgrounds */
  --muted: #6C6770;         /* Secondary muted text */
  --muted-d: #B4AFBA;       /* Dark mode readable secondary text */
}
```

---

## 5. Cell Classification Color Spectrum

To ensure rapid clinical differentiation under Wright-Giemsa staining, each cell lineage is assigned an unambiguous, high-contrast palette:

| Cell Type | Code | Color Hex | Sample Role | Normal Reference |
| :--- | :--- | :--- | :--- | :--- |
| **Segmented Neutrophil** | `NEU` | `#38bdf8` (Sky Blue) | Multi-lobed granulocyte | 40% – 70% |
| **Small Lymphocyte** | `LYM` | `#10b981` (Emerald Green) | Mononuclear immune cell | 20% – 40% |
| **Monocyte** | `MON` | `#a855f7` (Purple) | Large folded nucleus phagocyte | 2% – 8% |
| **Eosinophil** | `EOS` | `#f97316` (Warm Orange) | Bilobed reddish-orange granules | 1% – 4% |
| **Basophil** | `BAS` | `#06b6d4` (Cyan Teal) | Coarse dark-purple granules | 0.5% – 1% |
| **Atypical / Blast Cell** | `BLA` | `#EC3B57` (Aima Coral) | Immature blast / critical finding | **0% (Critical Alert)** |
| **Platelet / Thrombocyte** | `PLT` | `#f59e0b` (Amber Gold) | Discoid clotting fragment | 150k – 450k / µL |
| **RBC Variant / Inclusions** | `RBC-V`| `#ec4899` (Fuchsia Pink) | Target cells, schistocytes | 0% – 2% |

---

## 6. Microscopy Overlay & Layout Ergonomics

### Anti-Crowding Design Principles:
1. **Zero Overlapping Floating Bars:** Rather than stacking separate floating zoom bars, coordinate pills, scale bars, and minimaps, all optical telemetry is unified into a sleek, docked bottom bar.
2. **Resizable & Collapsible Sidebars:**
   - Both Left (Classification & Differential) and Right (Inspector & Gallery) sidebars feature interactive, low-profile drag handles (`col-resize`) with minimum (200px / 240px) and maximum (500px / 560px) width clamps.
   - One-click collapse toggles (`<` and `>`) allow full-screen slide immersion.
3. **Smart Label Placement:**
   - Canvas bounding box labels dynamically adjust font size according to camera zoom level ($9\text{px} - 13\text{px}$).
   - Labels automatically render inside or below the bounding box if the box touches the top viewport boundary, preventing label clipping.
4. **Interactive Minimap:**
   - Docked discreetly in the bottom-right corner without overlapping the central objective magnification controls.
   - Supports minimize/expand toggle.

---

## 7. Component Library Guidelines

### Primary Action Buttons:
- Rounded pill buttons (`border-radius: 100px` or `border-radius: 8px`).
- Coral accent button: `background: var(--coral); color: #FFF; border: 1px solid var(--coral);` with subtle hover lift and coral drop-shadow `rgba(236, 59, 87, 0.4)`.

### Cell Inspector Card:
- Top circular high-res crop ROI with glowing lineage border ring.
- Top 3 probability distribution bars with animated fill percentages.
- Clean 2×2 morphometrics grid (Area $\mu\text{m}^2$, Diameter $\mu\text{m}$, Circularity Index, N:C Ratio).
- Reclassification matrix with immediate single-click update chips.

### Live 100-WBC Differential Table:
- Proportional stacked bar graph showing total WBC distribution.
- Real-time row highlights with status indicator (Normal, Elevated, Decreased, or Critical Alert).
