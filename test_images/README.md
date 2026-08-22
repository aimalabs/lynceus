# Cytology Test Images & Ground Truth Fixtures

This directory contains benchmark cytology smear images and corresponding ground truth `.aimalabs` packages generated directly by the Python cytology pipeline faithful to `app.py`.

## Directory Layout

```
test_images/
├── Image_104.png                 # Specimen Image_104 (1920 × 1440 px)
├── Image_105.png                 # Specimen Image_105 (1920 × 1440 px)
├── smear-02.png                  # Benchmark Smear 02 (1500 × 1125 px)
├── smear-02.jpg                  # Standard optical brightfield JPEG
├── smear-field.jpg               # Full-field smear fixture
├── manifest.json                 # Image metadata & test specifications
├── README.md                     # Documentation
└── aimalabs/                     # Ground Truth .aimalabs Packages
    ├── Image_104.aimalabs        # 151 cells ground truth package
    ├── Image_104.annotations.json
    ├── Image_105.aimalabs        # 153 cells ground truth package
    ├── Image_105.annotations.json
    ├── smear-02.aimalabs         # 102 cells ground truth package
    ├── smear-02.annotations.json
    ├── smear-field.aimalabs      # 103 cells ground truth package
    └── smear-field.annotations.json
```

## Packages in `test_images/aimalabs/`

| Package | Resolution | Ground Truth Cell Count | Active Preprocessing Filters |
|---------|------------|-------------------------|------------------------------|
| `Image_104.aimalabs` | 1920 × 1440 px | 151 cells | `clahe`, `fov_crop`, `reinhard_lab` |
| `Image_105.aimalabs` | 1920 × 1440 px | 153 cells | `clahe`, `fov_crop`, `reinhard_lab` |
| `smear-02.aimalabs`  | 1500 × 1125 px | 102 cells | `clahe`, `fov_crop`, `reinhard_lab` |
| `smear-field.aimalabs` | 1500 × 1125 px | 103 cells | `clahe`, `fov_crop`, `reinhard_lab` |

Each `.aimalabs` package is a valid ZIP archive containing:
1. `image.png`: Full-resolution raw optical image.
2. `annotations.json`: Formatted cytology annotations, 20-class Swin-T prediction vectors, biophysical morphometrics, and patient metadata conforming to the Lynceus v1.2 specification.

## Regenerating Ground Truth Packages

To batch generate or update all `.aimalabs` files in `test_images/aimalabs/`:

```bash
python3 python/generate_annotations.py \
  --image test_images/Image_104.png \
  --output-json test_images/aimalabs/Image_104.annotations.json \
  --output-aimalabs test_images/aimalabs/Image_104.aimalabs
```
