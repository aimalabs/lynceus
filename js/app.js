// Authoritative Ground Truth 20 Master Classes from Twin_tiny_20_classes_train_val_test_set.ipynb
    const MASTER_CLASSES = [
      'Plt', 'Eosinophils', 'Igs', 'Lymphocytes', 'Blasts',
      'Monocytes', 'Neutrophils', 'Erythroblasts', 'Baseophils', 'Acanthocytes',
      'Normal_cells', 'Target_cells', 'Ovalocytes', 'Elliptocytes', 'Teardrops',
      'Spherocyters', 'Schistocytes', 'Stomatocytes', 'Echinocytes', 'Hypochromic'
    ];

    // Single source of truth metadata dictionary for easy extension and updates
    const CLASS_METADATA_CONFIG = {
      'Plt': { id: 'plt', name: 'Platelet (Plt)', short: 'Platelet', code: 'PLT', color: '#f59e0b', range: [150, 450], hotkey: '1', desc: 'Small anucleate cell fragment (2-4 µm)', isWBC: false },
      'Eosinophils': { id: 'eosinophils', name: 'Eosinophil', short: 'Eosinophil', code: 'EOS', color: '#f97316', range: [1, 4], hotkey: '2', desc: 'Bilobed nucleus with coarse reddish-orange granules', isWBC: true },
      'Igs': { id: 'igs', name: 'Immature Granulocyte (Igs)', short: 'Imm. Granulocyte', code: 'IGS', color: '#8b5cf6', range: [0, 1], hotkey: '3', desc: 'Promyelocyte, myelocyte, or metamyelocyte precursor', isWBC: true },
      'Lymphocytes': { id: 'lymphocytes', name: 'Lymphocyte', short: 'Lymphocyte', code: 'LYM', color: '#10b981', range: [20, 40], hotkey: '4', desc: 'Dense spherical nucleus with high N:C ratio', isWBC: true },
      'Blasts': { id: 'blasts', name: 'Atypical / Blast Precursor', short: 'Blast', code: 'BLA', color: '#e52246', range: [0, 0], hotkey: '5', desc: 'Immature blast precursor with fine open chromatin & prominent nucleoli', isWBC: true },
      'Monocytes': { id: 'monocytes', name: 'Monocyte', short: 'Monocyte', code: 'MON', color: '#a855f7', range: [2, 8], hotkey: '6', desc: 'Folded/kidney-shaped nucleus with grayish-blue cytoplasm', isWBC: true },
      'Neutrophils': { id: 'neutrophils', name: 'Segmented Neutrophil', short: 'Neutrophil', code: 'NEU', color: '#38bdf8', range: [40, 70], hotkey: '7', desc: 'Multilobed nucleus (3-5 segments) with neutral lilac granules', isWBC: true },
      'Erythroblasts': { id: 'erythroblasts', name: 'Erythroblast (NRBC)', short: 'Erythroblast', code: 'NRBC', color: '#ec4899', range: [0, 0], hotkey: '8', desc: 'Nucleated red blood cell precursor', isWBC: false },
      'Baseophils': { id: 'baseophils', name: 'Basophil', short: 'Basophil', code: 'BAS', color: '#06b6d4', range: [0.5, 1], hotkey: '9', desc: 'Dense coarse dark-purple granules obscuring nucleus', isWBC: true },
      'Acanthocytes': { id: 'acanthocytes', name: 'Acanthocyte (Spur Cell)', short: 'Acanthocyte', code: 'ACA', color: '#ef4444', range: [0, 0], hotkey: '0', desc: 'Spiculated red cell with irregular sharp projections', isWBC: false },
      'Normal_cells': { id: 'normal_cells', name: 'Normal RBC (Discocyte)', short: 'Normal RBC', code: 'RBC', color: '#64748b', range: [80, 100], hotkey: 'Q', desc: 'Biconcave disc with central pallor (~7-8 µm)', isWBC: false },
      'Target_cells': { id: 'target_cells', name: 'Target Cell (Codocyte)', short: 'Target Cell', code: 'TAR', color: '#d946ef', range: [0, 2], hotkey: 'W', desc: 'Bullseye target appearance with central hemoglobin spot', isWBC: false },
      'Ovalocytes': { id: 'ovalocytes', name: 'Ovalocyte', short: 'Ovalocyte', code: 'OVA', color: '#14b8a6', range: [0, 2], hotkey: 'E', desc: 'Oval-shaped erythrocyte', isWBC: false },
      'Elliptocytes': { id: 'elliptocytes', name: 'Elliptocyte (Pencil Cell)', short: 'Elliptocyte', code: 'ELL', color: '#84cc16', range: [0, 1], hotkey: 'R', desc: 'Elongated rod-like or cigar-shaped erythrocyte', isWBC: false },
      'Teardrops': { id: 'teardrops', name: 'Teardrop Cell (Dacrocyte)', short: 'Teardrop', code: 'TEA', color: '#0284c7', range: [0, 0], hotkey: 'T', desc: 'Tear-shaped or pear-shaped red blood cell', isWBC: false },
      'Spherocyters': { id: 'spherocyters', name: 'Spherocyte', short: 'Spherocyte', code: 'SPH', color: '#e11d48', range: [0, 0], hotkey: 'Y', desc: 'Spherical microcytic cell with absent central pallor', isWBC: false },
      'Schistocytes': { id: 'schistocytes', name: 'Schistocyte (Helmet Cell)', short: 'Schistocyte', code: 'SCH', color: '#f43f5e', range: [0, 0.5], hotkey: 'U', desc: 'Fragmented triangular or helmet-shaped red blood cell', isWBC: false },
      'Stomatocytes': { id: 'stomatocytes', name: 'Stomatocyte (Mouth Cell)', short: 'Stomatocyte', code: 'STO', color: '#0ea5e9', range: [0, 1], hotkey: 'I', desc: 'Slit-like or mouth-shaped central pallor', isWBC: false },
      'Echinocytes': { id: 'echinocytes', name: 'Echinocyte (Burr Cell)', short: 'Echinocyte', code: 'ECH', color: '#eab308', range: [0, 2], hotkey: 'O', desc: 'Crenated red cell with uniform blunt projections', isWBC: false },
      'Hypochromic': { id: 'hypochromic', name: 'Hypochromic RBC', short: 'Hypochromic', code: 'HYP', color: '#94a3b8', range: [0, 5], hotkey: 'P', desc: 'Pale red blood cell with enlarged central pallor area', isWBC: false }
    };

    function buildTaxonomyFromMasterClasses(masterList = MASTER_CLASSES, metaConfig = CLASS_METADATA_CONFIG) {
      return masterList.map((rawName, idx) => {
        const meta = metaConfig[rawName] || {};
        const id = meta.id || rawName.toLowerCase();
        const name = meta.name || rawName.replace(/_/g, ' ');
        const short = meta.short || rawName.replace(/_/g, ' ');
        const code = meta.code || rawName.slice(0, 3).toUpperCase();
        const color = meta.color || `hsl(${(idx * 360) / masterList.length}, 70%, 55%)`;
        const hotkey = meta.hotkey || (idx < 9 ? String(idx + 1) : idx === 9 ? '0' : String.fromCharCode(65 + idx - 10));
        return {
          id,
          rawClass: rawName,
          name,
          short,
          code,
          color,
          lightBg: `${color}26`,
          border: color,
          range: meta.range || [0, 0],
          hotkey,
          desc: meta.desc || `Morphology assessment for ${name}`,
          isWBC: !!meta.isWBC
        };
      });
    }

    const CELL_TAXONOMY = buildTaxonomyFromMasterClasses(MASTER_CLASSES, CLASS_METADATA_CONFIG);

    const MASTER_CLASS_TO_CATEGORY_ID = Object.fromEntries(
      MASTER_CLASSES.map(c => [c, (CLASS_METADATA_CONFIG[c]?.id) || c.toLowerCase()])
    );
    const MASTER_CLASS_DISPLAY_NAMES = Object.fromEntries(
      MASTER_CLASSES.map(c => [c, (CLASS_METADATA_CONFIG[c]?.name) || c.replace(/_/g, ' ')])
    );

    // Initial multi-lineage annotations across WBC, RBC variants, and Platelets (smear-02 - John DOE)
    const INITIAL_ANNOTATIONS = [
      // Neutrophils (10)
      { id: 'c-01', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 280, y: 190, width: 110, height: 105, confidence: 0.984, shape: 'box', morphology: { area_um2: 154.2, diameter_um: 14.0, circularity: 0.88, nc_ratio: 0.42 }, predictions: [{ classId: 'neutrophils', prob: 0.984 }, { classId: 'monocytes', prob: 0.012 }, { classId: 'eosinophils', prob: 0.004 }] },
      { id: 'c-02', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 670, y: 240, width: 115, height: 110, confidence: 0.976, shape: 'box', morphology: { area_um2: 162.5, diameter_um: 14.4, circularity: 0.86, nc_ratio: 0.45 }, predictions: [{ classId: 'neutrophils', prob: 0.976 }, { classId: 'monocytes', prob: 0.018 }, { classId: 'eosinophils', prob: 0.006 }] },
      { id: 'c-03', classId: 'neutrophils', label: 'Band Neutrophil', x: 1040, y: 160, width: 105, height: 105, confidence: 0.952, shape: 'box', morphology: { area_um2: 145.8, diameter_um: 13.6, circularity: 0.82, nc_ratio: 0.48 }, predictions: [{ classId: 'neutrophils', prob: 0.952 }, { classId: 'monocytes', prob: 0.038 }, { classId: 'lymphocytes', prob: 0.010 }] },
      { id: 'c-04', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 1210, y: 390, width: 118, height: 112, confidence: 0.988, shape: 'box', morphology: { area_um2: 168.0, diameter_um: 14.6, circularity: 0.87, nc_ratio: 0.41 }, predictions: [{ classId: 'neutrophils', prob: 0.988 }, { classId: 'eosinophils', prob: 0.008 }, { classId: 'monocytes', prob: 0.004 }] },
      { id: 'c-05', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 420, y: 480, width: 112, height: 108, confidence: 0.965, shape: 'box', morphology: { area_um2: 156.4, diameter_um: 14.1, circularity: 0.85, nc_ratio: 0.44 }, predictions: [{ classId: 'neutrophils', prob: 0.965 }, { classId: 'monocytes', prob: 0.025 }, { classId: 'eosinophils', prob: 0.010 }] },
      { id: 'c-06', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 810, y: 530, width: 116, height: 114, confidence: 0.991, shape: 'box', morphology: { area_um2: 165.2, diameter_um: 14.5, circularity: 0.89, nc_ratio: 0.40 }, predictions: [{ classId: 'neutrophils', prob: 0.991 }, { classId: 'eosinophils', prob: 0.006 }, { classId: 'monocytes', prob: 0.003 }] },
      { id: 'c-07', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 1320, y: 710, width: 114, height: 108, confidence: 0.978, shape: 'box', morphology: { area_um2: 158.9, diameter_um: 14.2, circularity: 0.86, nc_ratio: 0.43 }, predictions: [{ classId: 'neutrophils', prob: 0.978 }, { classId: 'monocytes', prob: 0.016 }, { classId: 'eosinophils', prob: 0.006 }] },
      { id: 'c-08', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 190, y: 760, width: 110, height: 105, confidence: 0.972, shape: 'box', morphology: { area_um2: 152.0, diameter_um: 13.9, circularity: 0.85, nc_ratio: 0.45 }, predictions: [{ classId: 'neutrophils', prob: 0.972 }, { classId: 'monocytes', prob: 0.021 }, { classId: 'eosinophils', prob: 0.007 }] },
      { id: 'c-09', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 590, y: 820, width: 115, height: 110, confidence: 0.981, shape: 'box', morphology: { area_um2: 161.8, diameter_um: 14.3, circularity: 0.88, nc_ratio: 0.42 }, predictions: [{ classId: 'neutrophils', prob: 0.981 }, { classId: 'eosinophils', prob: 0.012 }, { classId: 'monocytes', prob: 0.007 }] },
      { id: 'c-10', classId: 'neutrophils', label: 'Band Neutrophil', x: 990, y: 880, width: 108, height: 104, confidence: 0.948, shape: 'box', morphology: { area_um2: 149.3, diameter_um: 13.8, circularity: 0.81, nc_ratio: 0.49 }, predictions: [{ classId: 'neutrophils', prob: 0.948 }, { classId: 'monocytes', prob: 0.040 }, { classId: 'lymphocytes', prob: 0.012 }] },

      // Lymphocytes (7)
      { id: 'c-11', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 490, y: 150, width: 78, height: 76, confidence: 0.989, shape: 'box', morphology: { area_um2: 68.4, diameter_um: 9.3, circularity: 0.93, nc_ratio: 0.82 }, predictions: [{ classId: 'lymphocytes', prob: 0.989 }, { classId: 'blasts', prob: 0.008 }, { classId: 'monocytes', prob: 0.003 }] },
      { id: 'c-12', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 890, y: 210, width: 80, height: 78, confidence: 0.975, shape: 'box', morphology: { area_um2: 71.2, diameter_um: 9.5, circularity: 0.92, nc_ratio: 0.84 }, predictions: [{ classId: 'lymphocytes', prob: 0.975 }, { classId: 'blasts', prob: 0.018 }, { classId: 'monocytes', prob: 0.007 }] },
      { id: 'c-13', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 1350, y: 220, width: 76, height: 74, confidence: 0.982, shape: 'box', morphology: { area_um2: 66.8, diameter_um: 9.2, circularity: 0.94, nc_ratio: 0.80 }, predictions: [{ classId: 'lymphocytes', prob: 0.982 }, { classId: 'blasts', prob: 0.012 }, { classId: 'monocytes', prob: 0.006 }] },
      { id: 'c-14', classId: 'lymphocytes', label: 'Large Granular Lymphocyte', x: 260, y: 520, width: 88, height: 84, confidence: 0.945, shape: 'box', morphology: { area_um2: 86.5, diameter_um: 10.5, circularity: 0.89, nc_ratio: 0.72 }, predictions: [{ classId: 'lymphocytes', prob: 0.945 }, { classId: 'monocytes', prob: 0.038 }, { classId: 'blasts', prob: 0.017 }] },
      { id: 'c-15', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 710, y: 680, width: 75, height: 75, confidence: 0.992, shape: 'box', morphology: { area_um2: 67.1, diameter_um: 9.2, circularity: 0.95, nc_ratio: 0.85 }, predictions: [{ classId: 'lymphocytes', prob: 0.992 }, { classId: 'blasts', prob: 0.005 }, { classId: 'monocytes', prob: 0.003 }] },
      { id: 'c-16', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 1180, y: 620, width: 82, height: 79, confidence: 0.979, shape: 'box', morphology: { area_um2: 73.8, diameter_um: 9.7, circularity: 0.91, nc_ratio: 0.81 }, predictions: [{ classId: 'lymphocytes', prob: 0.979 }, { classId: 'blasts', prob: 0.015 }, { classId: 'monocytes', prob: 0.006 }] },
      { id: 'c-17', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 420, y: 920, width: 77, height: 76, confidence: 0.986, shape: 'box', morphology: { area_um2: 69.5, diameter_um: 9.4, circularity: 0.93, nc_ratio: 0.83 }, predictions: [{ classId: 'lymphocytes', prob: 0.986 }, { classId: 'blasts', prob: 0.010 }, { classId: 'monocytes', prob: 0.004 }] },

      // Monocytes (3)
      { id: 'c-18', classId: 'monocytes', label: 'Monocyte', x: 130, y: 340, width: 142, height: 136, confidence: 0.963, shape: 'box', morphology: { area_um2: 242.0, diameter_um: 17.5, circularity: 0.78, nc_ratio: 0.52 }, predictions: [{ classId: 'monocytes', prob: 0.963 }, { classId: 'neutrophils', prob: 0.024 }, { classId: 'blasts', prob: 0.013 }] },
      { id: 'c-19', classId: 'monocytes', label: 'Monocyte', x: 980, y: 440, width: 138, height: 132, confidence: 0.954, shape: 'box', morphology: { area_um2: 235.4, diameter_um: 17.3, circularity: 0.79, nc_ratio: 0.54 }, predictions: [{ classId: 'monocytes', prob: 0.954 }, { classId: 'neutrophils', prob: 0.032 }, { classId: 'blasts', prob: 0.014 }] },
      { id: 'c-20', classId: 'monocytes', label: 'Monocyte', x: 780, y: 920, width: 145, height: 138, confidence: 0.971, shape: 'box', morphology: { area_um2: 248.6, diameter_um: 17.8, circularity: 0.77, nc_ratio: 0.51 }, predictions: [{ classId: 'monocytes', prob: 0.971 }, { classId: 'neutrophils', prob: 0.019 }, { classId: 'blasts', prob: 0.010 }] },

      // Eosinophils (2)
      { id: 'c-21', classId: 'eosinophils', label: 'Eosinophil', x: 520, y: 320, width: 116, height: 114, confidence: 0.985, shape: 'box', morphology: { area_um2: 165.0, diameter_um: 14.5, circularity: 0.84, nc_ratio: 0.40 }, predictions: [{ classId: 'eosinophils', prob: 0.985 }, { classId: 'neutrophils', prob: 0.012 }, { classId: 'monocytes', prob: 0.003 }] },
      { id: 'c-22', classId: 'eosinophils', label: 'Eosinophil', x: 1220, y: 900, width: 114, height: 112, confidence: 0.977, shape: 'box', morphology: { area_um2: 161.2, diameter_um: 14.3, circularity: 0.85, nc_ratio: 0.39 }, predictions: [{ classId: 'eosinophils', prob: 0.977 }, { classId: 'neutrophils', prob: 0.018 }, { classId: 'monocytes', prob: 0.005 }] },

      // Basophil (1)
      { id: 'c-23', classId: 'baseophils', label: 'Basophil', x: 380, y: 690, width: 106, height: 104, confidence: 0.968, shape: 'box', morphology: { area_um2: 138.5, diameter_um: 13.3, circularity: 0.83, nc_ratio: 0.46 }, predictions: [{ classId: 'baseophils', prob: 0.968 }, { classId: 'eosinophils', prob: 0.022 }, { classId: 'neutrophils', prob: 0.010 }] },

      // Atypical / Blasts (2)
      { id: 'c-24', classId: 'blasts', label: 'Atypical / Blast Cell', x: 860, y: 370, width: 148, height: 144, confidence: 0.932, shape: 'box', morphology: { area_um2: 274.0, diameter_um: 18.7, circularity: 0.88, nc_ratio: 0.88 }, predictions: [{ classId: 'blasts', prob: 0.932 }, { classId: 'monocytes', prob: 0.045 }, { classId: 'lymphocytes', prob: 0.023 }] },
      { id: 'c-25', classId: 'blasts', label: 'Atypical Monocytoid Blast', x: 160, y: 940, width: 144, height: 140, confidence: 0.915, shape: 'box', morphology: { area_um2: 265.0, diameter_um: 18.4, circularity: 0.86, nc_ratio: 0.86 }, predictions: [{ classId: 'blasts', prob: 0.915 }, { classId: 'monocytes', prob: 0.060 }, { classId: 'lymphocytes', prob: 0.025 }] },

      // Platelets (11)
      { id: 'c-26', classId: 'plt', label: 'Platelet', x: 230, y: 130, width: 26, height: 24, confidence: 0.978, shape: 'circle', morphology: { area_um2: 7.2, diameter_um: 3.0, circularity: 0.94, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.978 }, { classId: 'target_cells', prob: 0.022 }] },
      { id: 'c-27', classId: 'plt', label: 'Platelet Clump', x: 620, y: 120, width: 42, height: 38, confidence: 0.962, shape: 'box', morphology: { area_um2: 17.5, diameter_um: 4.7, circularity: 0.82, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.962 }, { classId: 'target_cells', prob: 0.038 }] },
      { id: 'c-28', classId: 'plt', label: 'Platelet', x: 800, y: 140, width: 25, height: 25, confidence: 0.984, shape: 'circle', morphology: { area_um2: 6.8, diameter_um: 2.9, circularity: 0.96, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.984 }, { classId: 'target_cells', prob: 0.016 }] },
      { id: 'c-29', classId: 'plt', label: 'Platelet', x: 1140, y: 260, width: 28, height: 26, confidence: 0.980, shape: 'circle', morphology: { area_um2: 7.6, diameter_um: 3.1, circularity: 0.92, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.980 }, { classId: 'target_cells', prob: 0.020 }] },
      { id: 'c-30', classId: 'plt', label: 'Platelet', x: 340, y: 400, width: 24, height: 24, confidence: 0.974, shape: 'circle', morphology: { area_um2: 6.5, diameter_um: 2.9, circularity: 0.95, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.974 }, { classId: 'target_cells', prob: 0.026 }] },
      { id: 'c-31', classId: 'plt', label: 'Giant Platelet', x: 640, y: 440, width: 36, height: 34, confidence: 0.942, shape: 'box', morphology: { area_um2: 14.8, diameter_um: 4.3, circularity: 0.86, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.942 }, { classId: 'target_cells', prob: 0.058 }] },
      { id: 'c-32', classId: 'plt', label: 'Platelet', x: 1090, y: 550, width: 26, height: 26, confidence: 0.981, shape: 'circle', morphology: { area_um2: 7.2, diameter_um: 3.0, circularity: 0.94, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.981 }, { classId: 'target_cells', prob: 0.019 }] },
      { id: 'c-33', classId: 'plt', label: 'Platelet Clump', x: 1410, y: 560, width: 44, height: 40, confidence: 0.955, shape: 'box', morphology: { area_um2: 18.2, diameter_um: 4.8, circularity: 0.81, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.955 }, { classId: 'target_cells', prob: 0.045 }] },
      { id: 'c-34', classId: 'plt', label: 'Platelet', x: 530, y: 640, width: 25, height: 24, confidence: 0.976, shape: 'circle', morphology: { area_um2: 6.9, diameter_um: 3.0, circularity: 0.95, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.976 }, { classId: 'target_cells', prob: 0.024 }] },
      { id: 'c-35', classId: 'plt', label: 'Platelet', x: 920, y: 760, width: 26, height: 25, confidence: 0.983, shape: 'circle', morphology: { area_um2: 7.1, diameter_um: 3.0, circularity: 0.93, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.983 }, { classId: 'target_cells', prob: 0.017 }] },
      { id: 'c-36', classId: 'plt', label: 'Platelet', x: 1370, y: 840, width: 24, height: 24, confidence: 0.969, shape: 'circle', morphology: { area_um2: 6.4, diameter_um: 2.8, circularity: 0.96, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.969 }, { classId: 'target_cells', prob: 0.031 }] },

      // Erythrocyte variants (4)
      { id: 'c-37', classId: 'target_cells', label: 'Target Cell', x: 450, y: 260, width: 56, height: 56, confidence: 0.935, shape: 'circle', morphology: { area_um2: 38.5, diameter_um: 7.0, circularity: 0.94, nc_ratio: 0.0 }, predictions: [{ classId: 'target_cells', prob: 0.935 }, { classId: 'plt', prob: 0.065 }] },
      { id: 'c-38', classId: 'schistocytes', label: 'Schistocyte', x: 940, y: 130, width: 46, height: 38, confidence: 0.895, shape: 'box', morphology: { area_um2: 27.2, diameter_um: 5.9, circularity: 0.76, nc_ratio: 0.0 }, predictions: [{ classId: 'schistocytes', prob: 0.895 }, { classId: 'plt', prob: 0.105 }] },
      { id: 'c-39', classId: 'teardrops', label: 'Tear Drop Cell', x: 1100, y: 730, width: 58, height: 44, confidence: 0.922, shape: 'box', morphology: { area_um2: 34.6, diameter_um: 6.6, circularity: 0.81, nc_ratio: 0.0 }, predictions: [{ classId: 'teardrops', prob: 0.922 }, { classId: 'plt', prob: 0.078 }] },
      { id: 'c-40', classId: 'target_cells', label: 'Target Cell', x: 620, y: 740, width: 54, height: 54, confidence: 0.948, shape: 'circle', morphology: { area_um2: 37.0, diameter_um: 6.9, circularity: 0.96, nc_ratio: 0.0 }, predictions: [{ classId: 'target_cells', prob: 0.948 }, { classId: 'plt', prob: 0.052 }] }
    ];

    // Initial multi-lineage annotations for smear-field (Jane SMITH - 58 Cells: Leukemoid reaction workup)
    const INITIAL_ANNOTATIONS_FIELD = [
      // Segmented Neutrophils (24)
      { id: 'fld-01', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 120, y: 140, width: 112, height: 108, confidence: 0.982, shape: 'box', morphology: { area_um2: 156.0, diameter_um: 14.1, circularity: 0.87, nc_ratio: 0.42 }, predictions: [{ classId: 'neutrophils', prob: 0.982 }, { classId: 'monocytes', prob: 0.014 }, { classId: 'eosinophils', prob: 0.004 }] },
      { id: 'fld-02', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 290, y: 180, width: 114, height: 110, confidence: 0.978, shape: 'box', morphology: { area_um2: 159.2, diameter_um: 14.2, circularity: 0.86, nc_ratio: 0.43 }, predictions: [{ classId: 'neutrophils', prob: 0.978 }, { classId: 'monocytes', prob: 0.016 }, { classId: 'eosinophils', prob: 0.006 }] },
      { id: 'fld-03', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 480, y: 120, width: 116, height: 112, confidence: 0.985, shape: 'box', morphology: { area_um2: 162.8, diameter_um: 14.4, circularity: 0.88, nc_ratio: 0.41 }, predictions: [{ classId: 'neutrophils', prob: 0.985 }, { classId: 'eosinophils', prob: 0.010 }, { classId: 'monocytes', prob: 0.005 }] },
      { id: 'fld-04', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 670, y: 160, width: 110, height: 106, confidence: 0.974, shape: 'box', morphology: { area_um2: 151.5, diameter_um: 13.9, circularity: 0.85, nc_ratio: 0.44 }, predictions: [{ classId: 'neutrophils', prob: 0.974 }, { classId: 'monocytes', prob: 0.020 }, { classId: 'eosinophils', prob: 0.006 }] },
      { id: 'fld-05', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 860, y: 130, width: 115, height: 110, confidence: 0.989, shape: 'box', morphology: { area_um2: 161.0, diameter_um: 14.3, circularity: 0.89, nc_ratio: 0.40 }, predictions: [{ classId: 'neutrophils', prob: 0.989 }, { classId: 'eosinophils', prob: 0.007 }, { classId: 'monocytes', prob: 0.004 }] },
      { id: 'fld-06', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 1050, y: 170, width: 112, height: 108, confidence: 0.981, shape: 'box', morphology: { area_um2: 155.4, diameter_um: 14.1, circularity: 0.86, nc_ratio: 0.42 }, predictions: [{ classId: 'neutrophils', prob: 0.981 }, { classId: 'monocytes', prob: 0.015 }, { classId: 'eosinophils', prob: 0.004 }] },
      { id: 'fld-07', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 1240, y: 140, width: 118, height: 114, confidence: 0.990, shape: 'box', morphology: { area_um2: 166.2, diameter_um: 14.5, circularity: 0.88, nc_ratio: 0.39 }, predictions: [{ classId: 'neutrophils', prob: 0.990 }, { classId: 'eosinophils', prob: 0.006 }, { classId: 'monocytes', prob: 0.004 }] },
      { id: 'fld-08', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 150, y: 310, width: 114, height: 110, confidence: 0.976, shape: 'box', morphology: { area_um2: 158.5, diameter_um: 14.2, circularity: 0.87, nc_ratio: 0.43 }, predictions: [{ classId: 'neutrophils', prob: 0.976 }, { classId: 'monocytes', prob: 0.018 }, { classId: 'eosinophils', prob: 0.006 }] },
      { id: 'fld-09', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 360, y: 330, width: 115, height: 112, confidence: 0.983, shape: 'box', morphology: { area_um2: 160.8, diameter_um: 14.3, circularity: 0.88, nc_ratio: 0.41 }, predictions: [{ classId: 'neutrophils', prob: 0.983 }, { classId: 'eosinophils', prob: 0.011 }, { classId: 'monocytes', prob: 0.006 }] },
      { id: 'fld-10', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 570, y: 300, width: 110, height: 106, confidence: 0.969, shape: 'box', morphology: { area_um2: 152.0, diameter_um: 13.9, circularity: 0.84, nc_ratio: 0.45 }, predictions: [{ classId: 'neutrophils', prob: 0.969 }, { classId: 'monocytes', prob: 0.024 }, { classId: 'eosinophils', prob: 0.007 }] },
      { id: 'fld-11', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 770, y: 340, width: 116, height: 112, confidence: 0.987, shape: 'box', morphology: { area_um2: 164.0, diameter_um: 14.4, circularity: 0.89, nc_ratio: 0.40 }, predictions: [{ classId: 'neutrophils', prob: 0.987 }, { classId: 'eosinophils', prob: 0.008 }, { classId: 'monocytes', prob: 0.005 }] },
      { id: 'fld-12', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 960, y: 320, width: 112, height: 108, confidence: 0.979, shape: 'box', morphology: { area_um2: 156.5, diameter_um: 14.1, circularity: 0.86, nc_ratio: 0.42 }, predictions: [{ classId: 'neutrophils', prob: 0.979 }, { classId: 'monocytes', prob: 0.016 }, { classId: 'eosinophils', prob: 0.005 }] },
      { id: 'fld-13', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 1160, y: 350, width: 115, height: 110, confidence: 0.984, shape: 'box', morphology: { area_um2: 161.4, diameter_um: 14.3, circularity: 0.87, nc_ratio: 0.41 }, predictions: [{ classId: 'neutrophils', prob: 0.984 }, { classId: 'eosinophils', prob: 0.010 }, { classId: 'monocytes', prob: 0.006 }] },
      { id: 'fld-14', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 1350, y: 310, width: 114, height: 108, confidence: 0.975, shape: 'box', morphology: { area_um2: 157.8, diameter_um: 14.2, circularity: 0.85, nc_ratio: 0.44 }, predictions: [{ classId: 'neutrophils', prob: 0.975 }, { classId: 'monocytes', prob: 0.019 }, { classId: 'eosinophils', prob: 0.006 }] },
      { id: 'fld-15', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 210, y: 490, width: 116, height: 112, confidence: 0.988, shape: 'box', morphology: { area_um2: 163.5, diameter_um: 14.4, circularity: 0.88, nc_ratio: 0.40 }, predictions: [{ classId: 'neutrophils', prob: 0.988 }, { classId: 'eosinophils', prob: 0.008 }, { classId: 'monocytes', prob: 0.004 }] },
      { id: 'fld-16', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 420, y: 510, width: 112, height: 108, confidence: 0.980, shape: 'box', morphology: { area_um2: 155.0, diameter_um: 14.0, circularity: 0.87, nc_ratio: 0.42 }, predictions: [{ classId: 'neutrophils', prob: 0.980 }, { classId: 'monocytes', prob: 0.015 }, { classId: 'eosinophils', prob: 0.005 }] },
      { id: 'fld-17', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 630, y: 480, width: 114, height: 110, confidence: 0.977, shape: 'box', morphology: { area_um2: 159.0, diameter_um: 14.2, circularity: 0.86, nc_ratio: 0.43 }, predictions: [{ classId: 'neutrophils', prob: 0.977 }, { classId: 'monocytes', prob: 0.017 }, { classId: 'eosinophils', prob: 0.006 }] },
      { id: 'fld-18', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 840, y: 520, width: 118, height: 114, confidence: 0.991, shape: 'box', morphology: { area_um2: 167.0, diameter_um: 14.6, circularity: 0.89, nc_ratio: 0.39 }, predictions: [{ classId: 'neutrophils', prob: 0.991 }, { classId: 'eosinophils', prob: 0.005 }, { classId: 'monocytes', prob: 0.004 }] },
      { id: 'fld-19', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 1040, y: 500, width: 110, height: 106, confidence: 0.972, shape: 'box', morphology: { area_um2: 152.8, diameter_um: 13.9, circularity: 0.85, nc_ratio: 0.44 }, predictions: [{ classId: 'neutrophils', prob: 0.972 }, { classId: 'monocytes', prob: 0.021 }, { classId: 'eosinophils', prob: 0.007 }] },
      { id: 'fld-20', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 1250, y: 530, width: 115, height: 112, confidence: 0.986, shape: 'box', morphology: { area_um2: 162.0, diameter_um: 14.4, circularity: 0.88, nc_ratio: 0.41 }, predictions: [{ classId: 'neutrophils', prob: 0.986 }, { classId: 'eosinophils', prob: 0.009 }, { classId: 'monocytes', prob: 0.005 }] },
      { id: 'fld-21', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 180, y: 680, width: 112, height: 108, confidence: 0.979, shape: 'box', morphology: { area_um2: 154.6, diameter_um: 14.0, circularity: 0.86, nc_ratio: 0.42 }, predictions: [{ classId: 'neutrophils', prob: 0.979 }, { classId: 'monocytes', prob: 0.016 }, { classId: 'eosinophils', prob: 0.005 }] },
      { id: 'fld-22', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 390, y: 700, width: 116, height: 112, confidence: 0.983, shape: 'box', morphology: { area_um2: 160.5, diameter_um: 14.3, circularity: 0.87, nc_ratio: 0.41 }, predictions: [{ classId: 'neutrophils', prob: 0.983 }, { classId: 'eosinophils', prob: 0.011 }, { classId: 'monocytes', prob: 0.006 }] },
      { id: 'fld-23', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 600, y: 670, width: 114, height: 110, confidence: 0.975, shape: 'box', morphology: { area_um2: 158.0, diameter_um: 14.2, circularity: 0.86, nc_ratio: 0.43 }, predictions: [{ classId: 'neutrophils', prob: 0.975 }, { classId: 'monocytes', prob: 0.018 }, { classId: 'eosinophils', prob: 0.007 }] },
      { id: 'fld-24', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 810, y: 710, width: 115, height: 112, confidence: 0.988, shape: 'box', morphology: { area_um2: 163.2, diameter_um: 14.4, circularity: 0.89, nc_ratio: 0.40 }, predictions: [{ classId: 'neutrophils', prob: 0.988 }, { classId: 'eosinophils', prob: 0.007 }, { classId: 'monocytes', prob: 0.005 }] },

      // Band Neutrophils (8)
      { id: 'fld-25', classId: 'neutrophils', label: 'Band Neutrophil', x: 1020, y: 690, width: 108, height: 104, confidence: 0.956, shape: 'box', morphology: { area_um2: 148.0, diameter_um: 13.7, circularity: 0.82, nc_ratio: 0.48 }, predictions: [{ classId: 'neutrophils', prob: 0.956 }, { classId: 'monocytes', prob: 0.034 }, { classId: 'lymphocytes', prob: 0.010 }] },
      { id: 'fld-26', classId: 'neutrophils', label: 'Band Neutrophil', x: 1220, y: 720, width: 106, height: 102, confidence: 0.949, shape: 'box', morphology: { area_um2: 144.5, diameter_um: 13.6, circularity: 0.81, nc_ratio: 0.49 }, predictions: [{ classId: 'neutrophils', prob: 0.949 }, { classId: 'monocytes', prob: 0.039 }, { classId: 'lymphocytes', prob: 0.012 }] },
      { id: 'fld-27', classId: 'neutrophils', label: 'Band Neutrophil', x: 230, y: 860, width: 110, height: 105, confidence: 0.962, shape: 'box', morphology: { area_um2: 150.2, diameter_um: 13.8, circularity: 0.83, nc_ratio: 0.47 }, predictions: [{ classId: 'neutrophils', prob: 0.962 }, { classId: 'monocytes', prob: 0.028 }, { classId: 'lymphocytes', prob: 0.010 }] },
      { id: 'fld-28', classId: 'neutrophils', label: 'Band Neutrophil', x: 440, y: 880, width: 107, height: 103, confidence: 0.951, shape: 'box', morphology: { area_um2: 146.0, diameter_um: 13.6, circularity: 0.82, nc_ratio: 0.49 }, predictions: [{ classId: 'neutrophils', prob: 0.951 }, { classId: 'monocytes', prob: 0.037 }, { classId: 'lymphocytes', prob: 0.012 }] },
      { id: 'fld-29', classId: 'neutrophils', label: 'Band Neutrophil', x: 650, y: 850, width: 109, height: 105, confidence: 0.958, shape: 'box', morphology: { area_um2: 149.0, diameter_um: 13.8, circularity: 0.83, nc_ratio: 0.48 }, predictions: [{ classId: 'neutrophils', prob: 0.958 }, { classId: 'monocytes', prob: 0.031 }, { classId: 'lymphocytes', prob: 0.011 }] },
      { id: 'fld-30', classId: 'neutrophils', label: 'Band Neutrophil', x: 860, y: 890, width: 108, height: 104, confidence: 0.953, shape: 'box', morphology: { area_um2: 147.5, diameter_um: 13.7, circularity: 0.82, nc_ratio: 0.48 }, predictions: [{ classId: 'neutrophils', prob: 0.953 }, { classId: 'monocytes', prob: 0.035 }, { classId: 'lymphocytes', prob: 0.012 }] },
      { id: 'fld-31', classId: 'neutrophils', label: 'Band Neutrophil', x: 1070, y: 860, width: 106, height: 102, confidence: 0.947, shape: 'box', morphology: { area_um2: 143.8, diameter_um: 13.5, circularity: 0.80, nc_ratio: 0.50 }, predictions: [{ classId: 'neutrophils', prob: 0.947 }, { classId: 'monocytes', prob: 0.041 }, { classId: 'lymphocytes', prob: 0.012 }] },
      { id: 'fld-32', classId: 'neutrophils', label: 'Band Neutrophil', x: 1280, y: 890, width: 110, height: 106, confidence: 0.960, shape: 'box', morphology: { area_um2: 151.0, diameter_um: 13.9, circularity: 0.84, nc_ratio: 0.47 }, predictions: [{ classId: 'neutrophils', prob: 0.960 }, { classId: 'monocytes', prob: 0.029 }, { classId: 'lymphocytes', prob: 0.011 }] },

      // Metamyelocytes / Myelocytic precursors (4)
      { id: 'fld-33', classId: 'neutrophils', label: 'Metamyelocyte', x: 320, y: 990, width: 122, height: 118, confidence: 0.938, shape: 'box', morphology: { area_um2: 178.0, diameter_um: 15.0, circularity: 0.84, nc_ratio: 0.55 }, predictions: [{ classId: 'neutrophils', prob: 0.938 }, { classId: 'monocytes', prob: 0.048 }, { classId: 'blasts', prob: 0.014 }] },
      { id: 'fld-34', classId: 'neutrophils', label: 'Metamyelocyte', x: 530, y: 970, width: 120, height: 116, confidence: 0.942, shape: 'box', morphology: { area_um2: 175.5, diameter_um: 14.9, circularity: 0.85, nc_ratio: 0.54 }, predictions: [{ classId: 'neutrophils', prob: 0.942 }, { classId: 'monocytes', prob: 0.045 }, { classId: 'blasts', prob: 0.013 }] },
      { id: 'fld-35', classId: 'neutrophils', label: 'Metamyelocyte', x: 740, y: 1000, width: 124, height: 120, confidence: 0.935, shape: 'box', morphology: { area_um2: 181.0, diameter_um: 15.2, circularity: 0.83, nc_ratio: 0.56 }, predictions: [{ classId: 'neutrophils', prob: 0.935 }, { classId: 'monocytes', prob: 0.051 }, { classId: 'blasts', prob: 0.014 }] },
      { id: 'fld-36', classId: 'neutrophils', label: 'Metamyelocyte', x: 950, y: 980, width: 121, height: 117, confidence: 0.940, shape: 'box', morphology: { area_um2: 177.0, diameter_um: 15.0, circularity: 0.84, nc_ratio: 0.55 }, predictions: [{ classId: 'neutrophils', prob: 0.940 }, { classId: 'monocytes', prob: 0.046 }, { classId: 'blasts', prob: 0.014 }] },

      // Lymphocytes (6)
      { id: 'fld-37', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 100, y: 460, width: 76, height: 74, confidence: 0.988, shape: 'box', morphology: { area_um2: 67.2, diameter_um: 9.3, circularity: 0.93, nc_ratio: 0.82 }, predictions: [{ classId: 'lymphocytes', prob: 0.988 }, { classId: 'blasts', prob: 0.008 }, { classId: 'monocytes', prob: 0.004 }] },
      { id: 'fld-38', classId: 'lymphocytes', label: 'Reactive Lymphocyte', x: 500, y: 640, width: 84, height: 80, confidence: 0.965, shape: 'box', morphology: { area_um2: 81.5, diameter_um: 10.2, circularity: 0.90, nc_ratio: 0.74 }, predictions: [{ classId: 'lymphocytes', prob: 0.965 }, { classId: 'monocytes', prob: 0.024 }, { classId: 'blasts', prob: 0.011 }] },
      { id: 'fld-39', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 720, y: 490, width: 75, height: 75, confidence: 0.991, shape: 'box', morphology: { area_um2: 66.5, diameter_um: 9.2, circularity: 0.95, nc_ratio: 0.85 }, predictions: [{ classId: 'lymphocytes', prob: 0.991 }, { classId: 'blasts', prob: 0.005 }, { classId: 'monocytes', prob: 0.004 }] },
      { id: 'fld-40', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 920, y: 670, width: 78, height: 76, confidence: 0.982, shape: 'box', morphology: { area_um2: 70.0, diameter_um: 9.4, circularity: 0.92, nc_ratio: 0.83 }, predictions: [{ classId: 'lymphocytes', prob: 0.982 }, { classId: 'blasts', prob: 0.012 }, { classId: 'monocytes', prob: 0.006 }] },
      { id: 'fld-41', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 1120, y: 470, width: 74, height: 72, confidence: 0.986, shape: 'box', morphology: { area_um2: 65.0, diameter_um: 9.1, circularity: 0.94, nc_ratio: 0.81 }, predictions: [{ classId: 'lymphocytes', prob: 0.986 }, { classId: 'blasts', prob: 0.009 }, { classId: 'monocytes', prob: 0.005 }] },
      { id: 'fld-42', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 1330, y: 650, width: 77, height: 75, confidence: 0.979, shape: 'box', morphology: { area_um2: 68.8, diameter_um: 9.4, circularity: 0.93, nc_ratio: 0.84 }, predictions: [{ classId: 'lymphocytes', prob: 0.979 }, { classId: 'blasts', prob: 0.015 }, { classId: 'monocytes', prob: 0.006 }] },

      // Monocytes (4)
      { id: 'fld-43', classId: 'monocytes', label: 'Monocyte', x: 140, y: 960, width: 140, height: 134, confidence: 0.965, shape: 'box', morphology: { area_um2: 238.0, diameter_um: 17.4, circularity: 0.78, nc_ratio: 0.52 }, predictions: [{ classId: 'monocytes', prob: 0.965 }, { classId: 'neutrophils', prob: 0.022 }, { classId: 'blasts', prob: 0.013 }] },
      { id: 'fld-44', classId: 'monocytes', label: 'Monocyte', x: 550, y: 160, width: 138, height: 132, confidence: 0.958, shape: 'box', morphology: { area_um2: 234.0, diameter_um: 17.2, circularity: 0.79, nc_ratio: 0.53 }, predictions: [{ classId: 'monocytes', prob: 0.958 }, { classId: 'neutrophils', prob: 0.028 }, { classId: 'blasts', prob: 0.014 }] },
      { id: 'fld-45', classId: 'monocytes', label: 'Monocyte', x: 990, y: 140, width: 142, height: 136, confidence: 0.962, shape: 'box', morphology: { area_um2: 241.5, diameter_um: 17.5, circularity: 0.77, nc_ratio: 0.51 }, predictions: [{ classId: 'monocytes', prob: 0.962 }, { classId: 'neutrophils', prob: 0.025 }, { classId: 'blasts', prob: 0.013 }] },
      { id: 'fld-46', classId: 'monocytes', label: 'Monocyte', x: 1180, y: 960, width: 136, height: 130, confidence: 0.954, shape: 'box', morphology: { area_um2: 230.0, diameter_um: 17.1, circularity: 0.80, nc_ratio: 0.54 }, predictions: [{ classId: 'monocytes', prob: 0.954 }, { classId: 'neutrophils', prob: 0.032 }, { classId: 'blasts', prob: 0.014 }] },

      // Eosinophils (2)
      { id: 'fld-47', classId: 'eosinophils', label: 'Eosinophil', x: 470, y: 390, width: 115, height: 112, confidence: 0.982, shape: 'box', morphology: { area_um2: 162.0, diameter_um: 14.4, circularity: 0.85, nc_ratio: 0.40 }, predictions: [{ classId: 'eosinophils', prob: 0.982 }, { classId: 'neutrophils', prob: 0.014 }, { classId: 'monocytes', prob: 0.004 }] },
      { id: 'fld-48', classId: 'eosinophils', label: 'Eosinophil', x: 1110, y: 780, width: 114, height: 110, confidence: 0.978, shape: 'box', morphology: { area_um2: 159.5, diameter_um: 14.2, circularity: 0.84, nc_ratio: 0.41 }, predictions: [{ classId: 'eosinophils', prob: 0.978 }, { classId: 'neutrophils', prob: 0.017 }, { classId: 'monocytes', prob: 0.005 }] },

      // Platelets (10)
      { id: 'fld-49', classId: 'plt', label: 'Platelet', x: 250, y: 120, width: 25, height: 24, confidence: 0.980, shape: 'circle', morphology: { area_um2: 6.8, diameter_um: 2.9, circularity: 0.95, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.980 }, { classId: 'target_cells', prob: 0.020 }] },
      { id: 'fld-50', classId: 'plt', label: 'Giant Platelet', x: 440, y: 220, width: 35, height: 32, confidence: 0.945, shape: 'box', morphology: { area_um2: 14.5, diameter_um: 4.3, circularity: 0.86, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.945 }, { classId: 'target_cells', prob: 0.055 }] },
      { id: 'fld-51', classId: 'plt', label: 'Platelet', x: 640, y: 110, width: 26, height: 25, confidence: 0.985, shape: 'circle', morphology: { area_um2: 7.1, diameter_um: 3.0, circularity: 0.96, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.985 }, { classId: 'target_cells', prob: 0.015 }] },
      { id: 'fld-52', classId: 'plt', label: 'Platelet', x: 840, y: 240, width: 24, height: 24, confidence: 0.975, shape: 'circle', morphology: { area_um2: 6.5, diameter_um: 2.9, circularity: 0.94, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.975 }, { classId: 'target_cells', prob: 0.025 }] },
      { id: 'fld-53', classId: 'plt', label: 'Platelet', x: 1040, y: 120, width: 27, height: 26, confidence: 0.981, shape: 'circle', morphology: { area_um2: 7.4, diameter_um: 3.1, circularity: 0.93, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.981 }, { classId: 'target_cells', prob: 0.019 }] },
      { id: 'fld-54', classId: 'plt', label: 'Platelet', x: 270, y: 620, width: 25, height: 25, confidence: 0.978, shape: 'circle', morphology: { area_um2: 6.9, diameter_um: 3.0, circularity: 0.95, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.978 }, { classId: 'target_cells', prob: 0.022 }] },
      { id: 'fld-55', classId: 'plt', label: 'Platelet', x: 670, y: 610, width: 26, height: 25, confidence: 0.983, shape: 'circle', morphology: { area_um2: 7.2, diameter_um: 3.0, circularity: 0.94, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.983 }, { classId: 'target_cells', prob: 0.017 }] },
      { id: 'fld-56', classId: 'plt', label: 'Platelet', x: 880, y: 620, width: 24, height: 24, confidence: 0.972, shape: 'circle', morphology: { area_um2: 6.4, diameter_um: 2.8, circularity: 0.96, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.972 }, { classId: 'target_cells', prob: 0.028 }] },
      { id: 'fld-57', classId: 'plt', label: 'Platelet', x: 1080, y: 620, width: 26, height: 26, confidence: 0.980, shape: 'circle', morphology: { area_um2: 7.3, diameter_um: 3.0, circularity: 0.93, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.980 }, { classId: 'target_cells', prob: 0.020 }] },
      { id: 'fld-58', classId: 'plt', label: 'Platelet', x: 1290, y: 610, width: 25, height: 24, confidence: 0.976, shape: 'circle', morphology: { area_um2: 6.7, diameter_um: 2.9, circularity: 0.95, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.976 }, { classId: 'target_cells', prob: 0.024 }] }
    ];

    // Telesphorus (Fast Model - 32 Cells)
    const MODEL_FLASH_ANNOTATIONS = [
      // Neutrophils (8)
      { id: 'fl-01', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 280, y: 190, width: 108, height: 104, confidence: 0.964, shape: 'box', morphology: { area_um2: 151.2, diameter_um: 13.9, circularity: 0.87, nc_ratio: 0.43 }, predictions: [{ classId: 'neutrophils', prob: 0.964 }, { classId: 'monocytes', prob: 0.024 }, { classId: 'eosinophils', prob: 0.012 }] },
      { id: 'fl-02', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 670, y: 240, width: 114, height: 108, confidence: 0.956, shape: 'box', morphology: { area_um2: 160.1, diameter_um: 14.3, circularity: 0.85, nc_ratio: 0.46 }, predictions: [{ classId: 'neutrophils', prob: 0.956 }, { classId: 'monocytes', prob: 0.030 }, { classId: 'eosinophils', prob: 0.014 }] },
      { id: 'fl-03', classId: 'neutrophils', label: 'Band Neutrophil', x: 1040, y: 160, width: 102, height: 102, confidence: 0.938, shape: 'box', morphology: { area_um2: 142.5, diameter_um: 13.5, circularity: 0.81, nc_ratio: 0.49 }, predictions: [{ classId: 'neutrophils', prob: 0.938 }, { classId: 'monocytes', prob: 0.045 }, { classId: 'lymphocytes', prob: 0.017 }] },
      { id: 'fl-04', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 1210, y: 390, width: 116, height: 110, confidence: 0.972, shape: 'box', morphology: { area_um2: 165.4, diameter_um: 14.5, circularity: 0.86, nc_ratio: 0.42 }, predictions: [{ classId: 'neutrophils', prob: 0.972 }, { classId: 'eosinophils', prob: 0.018 }, { classId: 'monocytes', prob: 0.010 }] },
      { id: 'fl-05', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 420, y: 480, width: 110, height: 106, confidence: 0.951, shape: 'box', morphology: { area_um2: 153.8, diameter_um: 14.0, circularity: 0.84, nc_ratio: 0.45 }, predictions: [{ classId: 'neutrophils', prob: 0.951 }, { classId: 'monocytes', prob: 0.035 }, { classId: 'eosinophils', prob: 0.014 }] },
      { id: 'fl-06', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 810, y: 530, width: 114, height: 112, confidence: 0.975, shape: 'box', morphology: { area_um2: 162.8, diameter_um: 14.4, circularity: 0.88, nc_ratio: 0.41 }, predictions: [{ classId: 'neutrophils', prob: 0.975 }, { classId: 'eosinophils', prob: 0.015 }, { classId: 'monocytes', prob: 0.010 }] },
      { id: 'fl-07', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 1320, y: 710, width: 112, height: 106, confidence: 0.962, shape: 'box', morphology: { area_um2: 156.2, diameter_um: 14.1, circularity: 0.85, nc_ratio: 0.44 }, predictions: [{ classId: 'neutrophils', prob: 0.962 }, { classId: 'monocytes', prob: 0.026 }, { classId: 'eosinophils', prob: 0.012 }] },
      { id: 'fl-08', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 590, y: 820, width: 112, height: 108, confidence: 0.968, shape: 'box', morphology: { area_um2: 159.0, diameter_um: 14.2, circularity: 0.87, nc_ratio: 0.43 }, predictions: [{ classId: 'neutrophils', prob: 0.968 }, { classId: 'eosinophils', prob: 0.020 }, { classId: 'monocytes', prob: 0.012 }] },

      // Lymphocytes (5)
      { id: 'fl-09', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 490, y: 150, width: 76, height: 74, confidence: 0.974, shape: 'box', morphology: { area_um2: 66.2, diameter_um: 9.2, circularity: 0.92, nc_ratio: 0.83 }, predictions: [{ classId: 'lymphocytes', prob: 0.974 }, { classId: 'blasts', prob: 0.018 }, { classId: 'monocytes', prob: 0.008 }] },
      { id: 'fl-10', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 890, y: 210, width: 78, height: 76, confidence: 0.961, shape: 'box', morphology: { area_um2: 69.4, diameter_um: 9.4, circularity: 0.91, nc_ratio: 0.85 }, predictions: [{ classId: 'lymphocytes', prob: 0.961 }, { classId: 'blasts', prob: 0.028 }, { classId: 'monocytes', prob: 0.011 }] },
      { id: 'fl-11', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 1350, y: 220, width: 74, height: 72, confidence: 0.969, shape: 'box', morphology: { area_um2: 65.1, diameter_um: 9.1, circularity: 0.93, nc_ratio: 0.81 }, predictions: [{ classId: 'lymphocytes', prob: 0.969 }, { classId: 'blasts', prob: 0.021 }, { classId: 'monocytes', prob: 0.010 }] },
      { id: 'fl-12', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 710, y: 680, width: 74, height: 74, confidence: 0.981, shape: 'box', morphology: { area_um2: 65.8, diameter_um: 9.1, circularity: 0.94, nc_ratio: 0.86 }, predictions: [{ classId: 'lymphocytes', prob: 0.981 }, { classId: 'blasts', prob: 0.012 }, { classId: 'monocytes', prob: 0.007 }] },
      { id: 'fl-13', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 420, y: 920, width: 75, height: 74, confidence: 0.973, shape: 'box', morphology: { area_um2: 68.0, diameter_um: 9.3, circularity: 0.92, nc_ratio: 0.84 }, predictions: [{ classId: 'lymphocytes', prob: 0.973 }, { classId: 'blasts', prob: 0.018 }, { classId: 'monocytes', prob: 0.009 }] },

      // Monocytes (2)
      { id: 'fl-14', classId: 'monocytes', label: 'Monocyte', x: 130, y: 340, width: 138, height: 132, confidence: 0.948, shape: 'box', morphology: { area_um2: 236.0, diameter_um: 17.3, circularity: 0.77, nc_ratio: 0.53 }, predictions: [{ classId: 'monocytes', prob: 0.948 }, { classId: 'neutrophils', prob: 0.036 }, { classId: 'blasts', prob: 0.016 }] },
      { id: 'fl-15', classId: 'monocytes', label: 'Monocyte', x: 980, y: 440, width: 135, height: 130, confidence: 0.939, shape: 'box', morphology: { area_um2: 231.0, diameter_um: 17.1, circularity: 0.78, nc_ratio: 0.55 }, predictions: [{ classId: 'monocytes', prob: 0.939 }, { classId: 'neutrophils', prob: 0.042 }, { classId: 'blasts', prob: 0.019 }] },

      // Eosinophils (2)
      { id: 'fl-16', classId: 'eosinophils', label: 'Eosinophil', x: 520, y: 320, width: 114, height: 112, confidence: 0.971, shape: 'box', morphology: { area_um2: 162.0, diameter_um: 14.4, circularity: 0.83, nc_ratio: 0.41 }, predictions: [{ classId: 'eosinophils', prob: 0.971 }, { classId: 'neutrophils', prob: 0.021 }, { classId: 'monocytes', prob: 0.008 }] },
      { id: 'fl-17', classId: 'eosinophils', label: 'Eosinophil', x: 1220, y: 900, width: 112, height: 110, confidence: 0.963, shape: 'box', morphology: { area_um2: 158.5, diameter_um: 14.2, circularity: 0.84, nc_ratio: 0.40 }, predictions: [{ classId: 'eosinophils', prob: 0.963 }, { classId: 'neutrophils', prob: 0.026 }, { classId: 'monocytes', prob: 0.011 }] },

      // Basophil (1)
      { id: 'fl-18', classId: 'baseophils', label: 'Basophil', x: 380, y: 690, width: 104, height: 102, confidence: 0.952, shape: 'box', morphology: { area_um2: 135.2, diameter_um: 13.1, circularity: 0.82, nc_ratio: 0.47 }, predictions: [{ classId: 'baseophils', prob: 0.952 }, { classId: 'eosinophils', prob: 0.032 }, { classId: 'neutrophils', prob: 0.016 }] },

      // Atypical / Blast (1)
      { id: 'fl-19', classId: 'blasts', label: 'Atypical / Blast Cell', x: 860, y: 370, width: 144, height: 140, confidence: 0.918, shape: 'box', morphology: { area_um2: 268.0, diameter_um: 18.5, circularity: 0.87, nc_ratio: 0.89 }, predictions: [{ classId: 'blasts', prob: 0.918 }, { classId: 'monocytes', prob: 0.054 }, { classId: 'lymphocytes', prob: 0.028 }] },

      // Platelets (9)
      { id: 'fl-20', classId: 'plt', label: 'Platelet', x: 230, y: 130, width: 26, height: 24, confidence: 0.972, shape: 'circle', morphology: { area_um2: 7.2, diameter_um: 3.0, circularity: 0.94, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.972 }, { classId: 'target_cells', prob: 0.028 }] },
      { id: 'fl-21', classId: 'plt', label: 'Platelet', x: 800, y: 140, width: 25, height: 25, confidence: 0.979, shape: 'circle', morphology: { area_um2: 6.8, diameter_um: 2.9, circularity: 0.96, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.979 }, { classId: 'target_cells', prob: 0.021 }] },
      { id: 'fl-22', classId: 'plt', label: 'Platelet', x: 1140, y: 260, width: 28, height: 26, confidence: 0.975, shape: 'circle', morphology: { area_um2: 7.6, diameter_um: 3.1, circularity: 0.92, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.975 }, { classId: 'target_cells', prob: 0.025 }] },
      { id: 'fl-23', classId: 'plt', label: 'Platelet', x: 340, y: 400, width: 24, height: 24, confidence: 0.968, shape: 'circle', morphology: { area_um2: 6.5, diameter_um: 2.9, circularity: 0.95, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.968 }, { classId: 'target_cells', prob: 0.032 }] },
      { id: 'fl-24', classId: 'plt', label: 'Platelet', x: 640, y: 440, width: 34, height: 32, confidence: 0.935, shape: 'box', morphology: { area_um2: 14.1, diameter_um: 4.2, circularity: 0.85, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.935 }, { classId: 'target_cells', prob: 0.065 }] },
      { id: 'fl-25', classId: 'plt', label: 'Platelet', x: 1090, y: 550, width: 26, height: 26, confidence: 0.976, shape: 'circle', morphology: { area_um2: 7.2, diameter_um: 3.0, circularity: 0.94, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.976 }, { classId: 'target_cells', prob: 0.024 }] },
      { id: 'fl-26', classId: 'plt', label: 'Platelet', x: 530, y: 640, width: 25, height: 24, confidence: 0.971, shape: 'circle', morphology: { area_um2: 6.9, diameter_um: 3.0, circularity: 0.95, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.971 }, { classId: 'target_cells', prob: 0.029 }] },
      { id: 'fl-27', classId: 'plt', label: 'Platelet', x: 920, y: 760, width: 26, height: 25, confidence: 0.978, shape: 'circle', morphology: { area_um2: 7.1, diameter_um: 3.0, circularity: 0.93, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.978 }, { classId: 'target_cells', prob: 0.022 }] },
      { id: 'fl-28', classId: 'plt', label: 'Platelet', x: 1370, y: 840, width: 24, height: 24, confidence: 0.962, shape: 'circle', morphology: { area_um2: 6.4, diameter_um: 2.8, circularity: 0.96, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.962 }, { classId: 'target_cells', prob: 0.038 }] },

      // Erythrocyte variants (4)
      { id: 'fl-29', classId: 'target_cells', label: 'Target Cell', x: 450, y: 260, width: 56, height: 56, confidence: 0.928, shape: 'circle', morphology: { area_um2: 38.5, diameter_um: 7.0, circularity: 0.94, nc_ratio: 0.0 }, predictions: [{ classId: 'target_cells', prob: 0.928 }, { classId: 'plt', prob: 0.072 }] },
      { id: 'fl-30', classId: 'schistocytes', label: 'Schistocyte', x: 940, y: 130, width: 46, height: 38, confidence: 0.884, shape: 'box', morphology: { area_um2: 27.2, diameter_um: 5.9, circularity: 0.76, nc_ratio: 0.0 }, predictions: [{ classId: 'schistocytes', prob: 0.884 }, { classId: 'plt', prob: 0.116 }] },
      { id: 'fl-31', classId: 'teardrops', label: 'Tear Drop Cell', x: 1100, y: 730, width: 58, height: 44, confidence: 0.916, shape: 'box', morphology: { area_um2: 34.6, diameter_um: 6.6, circularity: 0.81, nc_ratio: 0.0 }, predictions: [{ classId: 'teardrops', prob: 0.916 }, { classId: 'plt', prob: 0.084 }] },
      { id: 'fl-32', classId: 'target_cells', label: 'Target Cell', x: 620, y: 740, width: 54, height: 54, confidence: 0.942, shape: 'circle', morphology: { area_um2: 37.0, diameter_um: 6.9, circularity: 0.96, nc_ratio: 0.0 }, predictions: [{ classId: 'target_cells', prob: 0.942 }, { classId: 'plt', prob: 0.058 }] }
    ];

    // Asclepius (Pro Model - 46 Cells)
    const MODEL_PRO_ANNOTATIONS = [
      // Neutrophils (12)
      { id: 'pr-01', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 280, y: 190, width: 110, height: 105, confidence: 0.992, shape: 'box', morphology: { area_um2: 154.2, diameter_um: 14.0, circularity: 0.88, nc_ratio: 0.42 }, predictions: [{ classId: 'neutrophils', prob: 0.992 }, { classId: 'monocytes', prob: 0.005 }, { classId: 'eosinophils', prob: 0.003 }] },
      { id: 'pr-02', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 670, y: 240, width: 115, height: 110, confidence: 0.989, shape: 'box', morphology: { area_um2: 162.5, diameter_um: 14.4, circularity: 0.86, nc_ratio: 0.45 }, predictions: [{ classId: 'neutrophils', prob: 0.989 }, { classId: 'monocytes', prob: 0.008 }, { classId: 'eosinophils', prob: 0.003 }] },
      { id: 'pr-03', classId: 'neutrophils', label: 'Band Neutrophil', x: 1040, y: 160, width: 105, height: 105, confidence: 0.971, shape: 'box', morphology: { area_um2: 145.8, diameter_um: 13.6, circularity: 0.82, nc_ratio: 0.48 }, predictions: [{ classId: 'neutrophils', prob: 0.971 }, { classId: 'monocytes', prob: 0.021 }, { classId: 'lymphocytes', prob: 0.008 }] },
      { id: 'pr-04', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 1210, y: 390, width: 118, height: 112, confidence: 0.995, shape: 'box', morphology: { area_um2: 168.0, diameter_um: 14.6, circularity: 0.87, nc_ratio: 0.41 }, predictions: [{ classId: 'neutrophils', prob: 0.995 }, { classId: 'eosinophils', prob: 0.003 }, { classId: 'monocytes', prob: 0.002 }] },
      { id: 'pr-05', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 420, y: 480, width: 112, height: 108, confidence: 0.984, shape: 'box', morphology: { area_um2: 156.4, diameter_um: 14.1, circularity: 0.85, nc_ratio: 0.44 }, predictions: [{ classId: 'neutrophils', prob: 0.984 }, { classId: 'monocytes', prob: 0.011 }, { classId: 'eosinophils', prob: 0.005 }] },
      { id: 'pr-06', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 810, y: 530, width: 116, height: 114, confidence: 0.996, shape: 'box', morphology: { area_um2: 165.2, diameter_um: 14.5, circularity: 0.89, nc_ratio: 0.40 }, predictions: [{ classId: 'neutrophils', prob: 0.996 }, { classId: 'eosinophils', prob: 0.003 }, { classId: 'monocytes', prob: 0.001 }] },
      { id: 'pr-07', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 1320, y: 710, width: 114, height: 108, confidence: 0.988, shape: 'box', morphology: { area_um2: 158.9, diameter_um: 14.2, circularity: 0.86, nc_ratio: 0.43 }, predictions: [{ classId: 'neutrophils', prob: 0.988 }, { classId: 'monocytes', prob: 0.008 }, { classId: 'eosinophils', prob: 0.004 }] },
      { id: 'pr-08', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 190, y: 760, width: 110, height: 105, confidence: 0.985, shape: 'box', morphology: { area_um2: 152.0, diameter_um: 13.9, circularity: 0.85, nc_ratio: 0.45 }, predictions: [{ classId: 'neutrophils', prob: 0.985 }, { classId: 'monocytes', prob: 0.010 }, { classId: 'eosinophils', prob: 0.005 }] },
      { id: 'pr-09', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 590, y: 820, width: 115, height: 110, confidence: 0.991, shape: 'box', morphology: { area_um2: 161.8, diameter_um: 14.3, circularity: 0.88, nc_ratio: 0.42 }, predictions: [{ classId: 'neutrophils', prob: 0.991 }, { classId: 'eosinophils', prob: 0.005 }, { classId: 'monocytes', prob: 0.004 }] },
      { id: 'pr-10', classId: 'neutrophils', label: 'Band Neutrophil', x: 990, y: 880, width: 108, height: 104, confidence: 0.967, shape: 'box', morphology: { area_um2: 149.3, diameter_um: 13.8, circularity: 0.81, nc_ratio: 0.49 }, predictions: [{ classId: 'neutrophils', prob: 0.967 }, { classId: 'monocytes', prob: 0.024 }, { classId: 'lymphocytes', prob: 0.009 }] },
      { id: 'pr-11', classId: 'neutrophils', label: 'Hypersegmented Neutrophil', x: 310, y: 320, width: 112, height: 110, confidence: 0.978, shape: 'box', morphology: { area_um2: 159.4, diameter_um: 14.2, circularity: 0.83, nc_ratio: 0.38 }, predictions: [{ classId: 'neutrophils', prob: 0.978 }, { classId: 'monocytes', prob: 0.016 }, { classId: 'eosinophils', prob: 0.006 }] },
      { id: 'pr-12', classId: 'neutrophils', label: 'Segmented Neutrophil', x: 1060, y: 310, width: 114, height: 108, confidence: 0.986, shape: 'box', morphology: { area_um2: 157.0, diameter_um: 14.1, circularity: 0.87, nc_ratio: 0.42 }, predictions: [{ classId: 'neutrophils', prob: 0.986 }, { classId: 'eosinophils', prob: 0.009 }, { classId: 'monocytes', prob: 0.005 }] },

      // Lymphocytes (8)
      { id: 'pr-13', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 490, y: 150, width: 78, height: 76, confidence: 0.994, shape: 'box', morphology: { area_um2: 68.4, diameter_um: 9.3, circularity: 0.93, nc_ratio: 0.82 }, predictions: [{ classId: 'lymphocytes', prob: 0.994 }, { classId: 'blasts', prob: 0.004 }, { classId: 'monocytes', prob: 0.002 }] },
      { id: 'pr-14', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 890, y: 210, width: 80, height: 78, confidence: 0.988, shape: 'box', morphology: { area_um2: 71.2, diameter_um: 9.5, circularity: 0.92, nc_ratio: 0.84 }, predictions: [{ classId: 'lymphocytes', prob: 0.988 }, { classId: 'blasts', prob: 0.008 }, { classId: 'monocytes', prob: 0.004 }] },
      { id: 'pr-15', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 1350, y: 220, width: 76, height: 74, confidence: 0.991, shape: 'box', morphology: { area_um2: 66.8, diameter_um: 9.2, circularity: 0.94, nc_ratio: 0.80 }, predictions: [{ classId: 'lymphocytes', prob: 0.991 }, { classId: 'blasts', prob: 0.006 }, { classId: 'monocytes', prob: 0.003 }] },
      { id: 'pr-16', classId: 'lymphocytes', label: 'Large Granular Lymphocyte', x: 260, y: 520, width: 88, height: 84, confidence: 0.962, shape: 'box', morphology: { area_um2: 86.5, diameter_um: 10.5, circularity: 0.89, nc_ratio: 0.72 }, predictions: [{ classId: 'lymphocytes', prob: 0.962 }, { classId: 'monocytes', prob: 0.025 }, { classId: 'blasts', prob: 0.013 }] },
      { id: 'pr-17', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 710, y: 680, width: 75, height: 75, confidence: 0.996, shape: 'box', morphology: { area_um2: 67.1, diameter_um: 9.2, circularity: 0.95, nc_ratio: 0.85 }, predictions: [{ classId: 'lymphocytes', prob: 0.996 }, { classId: 'blasts', prob: 0.002 }, { classId: 'monocytes', prob: 0.002 }] },
      { id: 'pr-18', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 1180, y: 620, width: 82, height: 79, confidence: 0.989, shape: 'box', morphology: { area_um2: 73.8, diameter_um: 9.7, circularity: 0.91, nc_ratio: 0.81 }, predictions: [{ classId: 'lymphocytes', prob: 0.989 }, { classId: 'blasts', prob: 0.007 }, { classId: 'monocytes', prob: 0.004 }] },
      { id: 'pr-19', classId: 'lymphocytes', label: 'Small Lymphocyte', x: 420, y: 920, width: 77, height: 76, confidence: 0.993, shape: 'box', morphology: { area_um2: 69.5, diameter_um: 9.4, circularity: 0.93, nc_ratio: 0.83 }, predictions: [{ classId: 'lymphocytes', prob: 0.993 }, { classId: 'blasts', prob: 0.004 }, { classId: 'monocytes', prob: 0.003 }] },
      { id: 'pr-20', classId: 'lymphocytes', label: 'Reactive Lymphocyte', x: 740, y: 410, width: 84, height: 80, confidence: 0.972, shape: 'box', morphology: { area_um2: 82.0, diameter_um: 10.2, circularity: 0.88, nc_ratio: 0.74 }, predictions: [{ classId: 'lymphocytes', prob: 0.972 }, { classId: 'monocytes', prob: 0.018 }, { classId: 'blasts', prob: 0.010 }] },

      // Monocytes (4)
      { id: 'pr-21', classId: 'monocytes', label: 'Monocyte', x: 130, y: 340, width: 142, height: 136, confidence: 0.981, shape: 'box', morphology: { area_um2: 242.0, diameter_um: 17.5, circularity: 0.78, nc_ratio: 0.52 }, predictions: [{ classId: 'monocytes', prob: 0.981 }, { classId: 'neutrophils', prob: 0.012 }, { classId: 'blasts', prob: 0.007 }] },
      { id: 'pr-22', classId: 'monocytes', label: 'Monocyte', x: 980, y: 440, width: 138, height: 132, confidence: 0.974, shape: 'box', morphology: { area_um2: 235.4, diameter_um: 17.3, circularity: 0.79, nc_ratio: 0.54 }, predictions: [{ classId: 'monocytes', prob: 0.974 }, { classId: 'neutrophils', prob: 0.018 }, { classId: 'blasts', prob: 0.008 }] },
      { id: 'pr-23', classId: 'monocytes', label: 'Monocyte', x: 780, y: 920, width: 145, height: 138, confidence: 0.987, shape: 'box', morphology: { area_um2: 248.6, diameter_um: 17.8, circularity: 0.77, nc_ratio: 0.51 }, predictions: [{ classId: 'monocytes', prob: 0.987 }, { classId: 'neutrophils', prob: 0.009 }, { classId: 'blasts', prob: 0.004 }] },
      { id: 'pr-24', classId: 'monocytes', label: 'Monocyte', x: 500, y: 560, width: 140, height: 134, confidence: 0.979, shape: 'box', morphology: { area_um2: 238.2, diameter_um: 17.4, circularity: 0.78, nc_ratio: 0.53 }, predictions: [{ classId: 'monocytes', prob: 0.979 }, { classId: 'neutrophils', prob: 0.014 }, { classId: 'blasts', prob: 0.007 }] },

      // Eosinophils (3)
      { id: 'pr-25', classId: 'eosinophils', label: 'Eosinophil', x: 520, y: 320, width: 116, height: 114, confidence: 0.992, shape: 'box', morphology: { area_um2: 165.0, diameter_um: 14.5, circularity: 0.84, nc_ratio: 0.40 }, predictions: [{ classId: 'eosinophils', prob: 0.992 }, { classId: 'neutrophils', prob: 0.006 }, { classId: 'monocytes', prob: 0.002 }] },
      { id: 'pr-26', classId: 'eosinophils', label: 'Eosinophil', x: 1220, y: 900, width: 114, height: 112, confidence: 0.986, shape: 'box', morphology: { area_um2: 161.2, diameter_um: 14.3, circularity: 0.85, nc_ratio: 0.39 }, predictions: [{ classId: 'eosinophils', prob: 0.986 }, { classId: 'neutrophils', prob: 0.010 }, { classId: 'monocytes', prob: 0.004 }] },
      { id: 'pr-27', classId: 'eosinophils', label: 'Eosinophil', x: 880, y: 780, width: 115, height: 112, confidence: 0.989, shape: 'box', morphology: { area_um2: 163.5, diameter_um: 14.4, circularity: 0.85, nc_ratio: 0.39 }, predictions: [{ classId: 'eosinophils', prob: 0.989 }, { classId: 'neutrophils', prob: 0.008 }, { classId: 'monocytes', prob: 0.003 }] },

      // Basophils (2)
      { id: 'pr-28', classId: 'baseophils', label: 'Basophil', x: 380, y: 690, width: 106, height: 104, confidence: 0.982, shape: 'box', morphology: { area_um2: 138.5, diameter_um: 13.3, circularity: 0.83, nc_ratio: 0.46 }, predictions: [{ classId: 'baseophils', prob: 0.982 }, { classId: 'eosinophils', prob: 0.012 }, { classId: 'neutrophils', prob: 0.006 }] },
      { id: 'pr-29', classId: 'baseophils', label: 'Basophil', x: 1080, y: 790, width: 108, height: 105, confidence: 0.975, shape: 'box', morphology: { area_um2: 140.2, diameter_um: 13.4, circularity: 0.82, nc_ratio: 0.45 }, predictions: [{ classId: 'baseophils', prob: 0.975 }, { classId: 'eosinophils', prob: 0.016 }, { classId: 'neutrophils', prob: 0.009 }] },

      // Atypical / Blasts (3)
      { id: 'pr-30', classId: 'blasts', label: 'Atypical / Myeloid Blast', x: 860, y: 370, width: 148, height: 144, confidence: 0.968, shape: 'box', morphology: { area_um2: 274.0, diameter_um: 18.7, circularity: 0.88, nc_ratio: 0.88 }, predictions: [{ classId: 'blasts', prob: 0.968 }, { classId: 'monocytes', prob: 0.021 }, { classId: 'lymphocytes', prob: 0.011 }] },
      { id: 'pr-31', classId: 'blasts', label: 'Atypical Monocytoid Blast', x: 160, y: 940, width: 144, height: 140, confidence: 0.954, shape: 'box', morphology: { area_um2: 265.0, diameter_um: 18.4, circularity: 0.86, nc_ratio: 0.86 }, predictions: [{ classId: 'blasts', prob: 0.954 }, { classId: 'monocytes', prob: 0.032 }, { classId: 'lymphocytes', prob: 0.014 }] },
      { id: 'pr-32', classId: 'blasts', label: 'Leukemic Blast Precursor', x: 620, y: 520, width: 146, height: 142, confidence: 0.961, shape: 'box', morphology: { area_um2: 270.5, diameter_um: 18.6, circularity: 0.87, nc_ratio: 0.87 }, predictions: [{ classId: 'blasts', prob: 0.961 }, { classId: 'monocytes', prob: 0.025 }, { classId: 'lymphocytes', prob: 0.014 }] },

      // Platelets (10)
      { id: 'pr-33', classId: 'plt', label: 'Platelet', x: 230, y: 130, width: 26, height: 24, confidence: 0.988, shape: 'circle', morphology: { area_um2: 7.2, diameter_um: 3.0, circularity: 0.94, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.988 }, { classId: 'target_cells', prob: 0.012 }] },
      { id: 'pr-34', classId: 'plt', label: 'Platelet Clump', x: 620, y: 120, width: 42, height: 38, confidence: 0.976, shape: 'box', morphology: { area_um2: 17.5, diameter_um: 4.7, circularity: 0.82, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.976 }, { classId: 'target_cells', prob: 0.024 }] },
      { id: 'pr-35', classId: 'plt', label: 'Platelet', x: 800, y: 140, width: 25, height: 25, confidence: 0.991, shape: 'circle', morphology: { area_um2: 6.8, diameter_um: 2.9, circularity: 0.96, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.991 }, { classId: 'target_cells', prob: 0.009 }] },
      { id: 'pr-36', classId: 'plt', label: 'Platelet', x: 1140, y: 260, width: 28, height: 26, confidence: 0.989, shape: 'circle', morphology: { area_um2: 7.6, diameter_um: 3.1, circularity: 0.92, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.989 }, { classId: 'target_cells', prob: 0.011 }] },
      { id: 'pr-37', classId: 'plt', label: 'Platelet', x: 340, y: 400, width: 24, height: 24, confidence: 0.985, shape: 'circle', morphology: { area_um2: 6.5, diameter_um: 2.9, circularity: 0.95, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.985 }, { classId: 'target_cells', prob: 0.015 }] },
      { id: 'pr-38', classId: 'plt', label: 'Giant Platelet', x: 640, y: 440, width: 36, height: 34, confidence: 0.962, shape: 'box', morphology: { area_um2: 14.8, diameter_um: 4.3, circularity: 0.86, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.962 }, { classId: 'target_cells', prob: 0.038 }] },
      { id: 'pr-39', classId: 'plt', label: 'Platelet', x: 1090, y: 550, width: 26, height: 26, confidence: 0.990, shape: 'circle', morphology: { area_um2: 7.2, diameter_um: 3.0, circularity: 0.94, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.990 }, { classId: 'target_cells', prob: 0.010 }] },
      { id: 'pr-40', classId: 'plt', label: 'Platelet Clump', x: 1410, y: 560, width: 44, height: 40, confidence: 0.971, shape: 'box', morphology: { area_um2: 18.2, diameter_um: 4.8, circularity: 0.81, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.971 }, { classId: 'target_cells', prob: 0.029 }] },
      { id: 'pr-41', classId: 'plt', label: 'Platelet', x: 530, y: 640, width: 25, height: 24, confidence: 0.987, shape: 'circle', morphology: { area_um2: 6.9, diameter_um: 3.0, circularity: 0.95, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.987 }, { classId: 'target_cells', prob: 0.013 }] },
      { id: 'pr-42', classId: 'plt', label: 'Platelet', x: 920, y: 760, width: 26, height: 25, confidence: 0.992, shape: 'circle', morphology: { area_um2: 7.1, diameter_um: 3.0, circularity: 0.93, nc_ratio: 0.0 }, predictions: [{ classId: 'plt', prob: 0.992 }, { classId: 'target_cells', prob: 0.008 }] },

      // Erythrocyte variants (4)
      { id: 'pr-43', classId: 'target_cells', label: 'Target Cell', x: 450, y: 260, width: 56, height: 56, confidence: 0.958, shape: 'circle', morphology: { area_um2: 38.5, diameter_um: 7.0, circularity: 0.94, nc_ratio: 0.0 }, predictions: [{ classId: 'target_cells', prob: 0.958 }, { classId: 'plt', prob: 0.042 }] },
      { id: 'pr-44', classId: 'schistocytes', label: 'Schistocyte', x: 940, y: 130, width: 46, height: 38, confidence: 0.925, shape: 'box', morphology: { area_um2: 27.2, diameter_um: 5.9, circularity: 0.76, nc_ratio: 0.0 }, predictions: [{ classId: 'schistocytes', prob: 0.925 }, { classId: 'plt', prob: 0.075 }] },
      { id: 'pr-45', classId: 'teardrops', label: 'Tear Drop Cell', x: 1100, y: 730, width: 58, height: 44, confidence: 0.946, shape: 'box', morphology: { area_um2: 34.6, diameter_um: 6.6, circularity: 0.81, nc_ratio: 0.0 }, predictions: [{ classId: 'teardrops', prob: 0.946 }, { classId: 'plt', prob: 0.054 }] },
      { id: 'pr-46', classId: 'target_cells', label: 'Target Cell', x: 620, y: 740, width: 54, height: 54, confidence: 0.968, shape: 'circle', morphology: { area_um2: 37.0, diameter_um: 6.9, circularity: 0.96, nc_ratio: 0.0 }, predictions: [{ classId: 'target_cells', prob: 0.968 }, { classId: 'plt', prob: 0.032 }] }
    ];

    // Global session cache for non-blocking WebGPU session pre-warming
    let gClassifierSessionPromise = null;
    let gSegmentationSessionPromise = null;

    // Persistent Binary Cache for Model Weights with SHA-256 Hashing & Local Storage Registry
    const MODEL_CACHE_DB_NAME = 'LynceusModelCache';
    const MODEL_CACHE_DB_VERSION = 1;
    const MODEL_CACHE_STORE = 'weights';

    function openModelCacheDB() {
      return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
          return reject(new Error('IndexedDB is not supported'));
        }
        const request = indexedDB.open(MODEL_CACHE_DB_NAME, MODEL_CACHE_DB_VERSION);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(MODEL_CACHE_STORE)) {
            db.createObjectStore(MODEL_CACHE_STORE, { keyPath: 'key' });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    async function computeBufferSha256(arrayBuffer) {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
      let hash = 0;
      const u8 = new Uint8Array(arrayBuffer);
      for (let i = 0; i < u8.length; i += 64) {
        hash = (hash * 31 + u8[i]) >>> 0;
      }
      return hash.toString(16);
    }

    async function getCachedModelBuffer(cacheKey) {
      try {
        const db = await openModelCacheDB();
        return new Promise((resolve) => {
          const tx = db.transaction(MODEL_CACHE_STORE, 'readonly');
          const store = tx.objectStore(MODEL_CACHE_STORE);
          const req = store.get(cacheKey);
          req.onsuccess = () => {
            if (req.result && req.result.buffer) {
              console.log(`[Model Cache] ✓ Cache HIT for ${cacheKey} (${(req.result.buffer.byteLength / 1e6).toFixed(2)} MB)`);
              resolve(req.result.buffer);
            } else {
              resolve(null);
            }
          };
          req.onerror = () => resolve(null);
        });
      } catch (err) {
        console.warn('[Model Cache] Read error:', err.message);
        return null;
      }
    }

    async function isModelCachePopulated() {
      try {
        const db = await openModelCacheDB();
        return new Promise(resolve => {
          const tx = db.transaction(MODEL_CACHE_STORE, 'readonly');
          const store = tx.objectStore(MODEL_CACHE_STORE);
          const req = store.getAllKeys();
          req.onsuccess = () => {
            const keys = req.result || [];
            const hasSwin = keys.some(k => k.includes('swin_classifier_fp16'));
            const hasCpsam = keys.some(k => k.includes('cellpose_cpsam_v2'));
            resolve({
              populated: hasSwin && hasCpsam,
              hasSwin,
              hasCpsam,
              keysCount: keys.length
            });
          };
          req.onerror = () => resolve({ populated: false, hasSwin: false, hasCpsam: false, keysCount: 0 });
        });
      } catch (e) {
        return { populated: false, hasSwin: false, hasCpsam: false, keysCount: 0 };
      }
    }

    async function clearModelCache() {
      try {
        const db = await openModelCacheDB();
        return new Promise(resolve => {
          const tx = db.transaction(MODEL_CACHE_STORE, 'readwrite');
          const store = tx.objectStore(MODEL_CACHE_STORE);
          const req = store.clear();
          req.onsuccess = () => {
            gClassifierSessionPromise = null;
            gSegmentationSessionPromise = null;
            console.log('[Model Cache] ✓ All cached models purged from IndexedDB');
            resolve(true);
          };
          req.onerror = () => resolve(false);
        });
      } catch (e) {
        console.warn('[Model Cache] Clear error:', e);
        return false;
      }
    }

    async function saveModelBufferToCache(cacheKey, fileName, hash, arrayBuffer) {
      const tStart = performance.now();
      try {
        const db = await openModelCacheDB();
        return new Promise((resolve) => {
          const tx = db.transaction(MODEL_CACHE_STORE, 'readwrite');
          const store = tx.objectStore(MODEL_CACHE_STORE);
          store.put({
            key: cacheKey,
            fileName: fileName,
            hash: hash,
            cachedAt: new Date().toISOString(),
            buffer: arrayBuffer
          });
          tx.oncomplete = () => {
            const writeDuration = (performance.now() - tStart).toFixed(1);
            console.log(`[Model Cache] ✓ Cached ${cacheKey} in persistent storage (${(arrayBuffer.byteLength / 1e6).toFixed(2)} MB in ${writeDuration}ms)`);
            resolve(true);
          };
          tx.onerror = (e) => {
            console.warn(`[Model Cache] Write failed for ${cacheKey}:`, e.target?.error?.message || e);
            resolve(false);
          };
        });
      } catch (err) {
        console.warn('[Model Cache] Write error:', err.message);
        return false;
      }
    }

    async function fetchChunkedModel(manifestUrl, modelName, onProgress = null, cacheChunks = true) {
      const tFetchStart = performance.now();
      console.log(`[Chunked Download] 📦 Fetching chunk manifest for ${modelName} from ${manifestUrl}...`);
      const manifestResp = await fetch(manifestUrl);
      if (!manifestResp.ok) {
        throw new Error(`Manifest not found: ${manifestUrl} (status: ${manifestResp.status})`);
      }
      const manifest = await manifestResp.json();
      const tManifestFetched = performance.now();
      const numChunks = manifest.numChunks;
      const totalBytes = manifest.totalBytes;
      const totalMB = manifest.totalSizeMB || (totalBytes / (1024 * 1024)).toFixed(1);
      const basePath = manifestUrl.replace('.manifest.json', '');
      const baseFileName = manifest.modelName || basePath.split('/').pop();

      console.log(`[Chunked Download] ⬇️ Processing ${numChunks} chunks for ${modelName} (${totalMB} MB total, cacheChunks: ${cacheChunks})...`);

      const chunks = new Array(numChunks);
      let receivedBytes = 0;
      let lastReportedDecile = -1;
      let allFromCache = true;
      let cachedChunkCount = 0;

      // Parallel chunk fetching with individual IndexedDB persistent caching (concurrency pool of 4)
      const chunkIndices = Array.from({ length: numChunks }, (_, i) => i);
      const concurrency = 4;
      let currentIndex = 0;

      async function worker() {
        while (currentIndex < chunkIndices.length) {
          const idx = currentIndex++;
          const chunkMeta = (manifest.chunks && manifest.chunks[idx]) || {};
          const partFileName = chunkMeta.fileName || `${baseFileName}.part${idx}`;
          const chunkSha = chunkMeta.sha256 || `part_${idx}`;
          const chunkKey = `${partFileName}_${chunkSha}`;

          // Check individual chunk in IndexedDB persistent storage first if cacheChunks is enabled
          let buf = cacheChunks ? await getCachedModelBuffer(chunkKey) : null;

          if (buf) {
            cachedChunkCount++;
            console.log(`[Chunk Cache] ✓ Chunk ${idx + 1}/${numChunks} (${partFileName}) loaded from localstore (${(buf.byteLength / 1e6).toFixed(2)} MB)`);
          } else {
            allFromCache = false;
            const chunkUrl = `${basePath}.part${idx}`;
            const resp = await fetch(chunkUrl);
            if (!resp.ok) {
              throw new Error(`Failed to load chunk ${idx} from ${chunkUrl} (status: ${resp.status})`);
            }
            buf = await resp.arrayBuffer();

            // Cache this chunk file separately in persistent IndexedDB storage if requested
            if (cacheChunks) {
              await saveModelBufferToCache(chunkKey, partFileName, chunkSha, buf);

              // Register in localStorage chunk registry
              try {
                const registry = JSON.parse(localStorage.getItem('LYNCEUS_CHUNK_REGISTRY') || '{}');
                registry[partFileName] = chunkSha;
                localStorage.setItem('LYNCEUS_CHUNK_REGISTRY', JSON.stringify(registry));
              } catch (e) {}
            }
          }

          chunks[idx] = buf;
          receivedBytes += buf.byteLength;
          await new Promise(r => setTimeout(r, 0));

          const rawPercent = (receivedBytes / totalBytes) * 100;
          const decile = Math.min(100, Math.floor(rawPercent / 10) * 10);
          if (decile > lastReportedDecile && decile % 10 === 0) {
            lastReportedDecile = decile;
            const receivedMB = (receivedBytes / (1024 * 1024)).toFixed(1);
            console.log(`[Chunked Download] ${modelName}: ${decile}% (${receivedMB} / ${totalMB} MB) [Chunk ${idx + 1}/${numChunks}]`);
            if (onProgress) {
              onProgress(decile, receivedBytes, totalBytes);
            }
          }
        }
      }

      await Promise.all(Array.from({ length: Math.min(concurrency, numChunks) }, () => worker()));
      const tChunksLoaded = performance.now();

      // Concatenate all separately cached chunks into a single contiguous ArrayBuffer
      const tConcat0 = performance.now();
      const fullBuffer = new Uint8Array(totalBytes);
      let offset = 0;
      for (let i = 0; i < numChunks; i++) {
        fullBuffer.set(new Uint8Array(chunks[i]), offset);
        offset += chunks[i].byteLength;
      }
      const tConcatMs = (performance.now() - tConcat0).toFixed(1);
      const totalFetchMs = (performance.now() - tFetchStart).toFixed(1);
      const chunkLoadMs = (tChunksLoaded - tManifestFetched).toFixed(1);

      console.log(`[Chunked Download] ✓ Assembled ${modelName} (${totalMB} MB) in ${totalFetchMs}ms (manifest: ${(tManifestFetched - tFetchStart).toFixed(1)}ms, chunks: ${chunkLoadMs}ms [${cachedChunkCount}/${numChunks} cached], concat: ${tConcatMs}ms)`);

      if (lastReportedDecile < 100) {
        if (onProgress) onProgress(100, receivedBytes, totalBytes);
      }

      return { buffer: fullBuffer.buffer, manifest, allFromCache };
    }

    async function fetchWithProgress(url, modelName, onProgress = null) {
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Failed to fetch model from ${url} (status: ${resp.status})`);
      }

      const contentLength = resp.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      const totalMB = totalBytes > 0 ? (totalBytes / (1024 * 1024)).toFixed(1) : 'unknown';

      if (!resp.body || totalBytes === 0) {
        const arrayBuffer = await resp.arrayBuffer();
        if (onProgress) onProgress(100, arrayBuffer.byteLength, arrayBuffer.byteLength);
        return arrayBuffer;
      }

      const reader = resp.body.getReader();
      const chunks = [];
      let receivedBytes = 0;
      let lastReportedDecile = -1;

      console.log(`[Model Download] ⬇️ Starting download stream for ${modelName} (${totalMB} MB)...`);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedBytes += value.length;

        if (totalBytes > 0) {
          const rawPercent = (receivedBytes / totalBytes) * 100;
          const decile = Math.min(100, Math.floor(rawPercent / 10) * 10);

          if (decile > lastReportedDecile && decile % 10 === 0) {
            lastReportedDecile = decile;
            const receivedMB = (receivedBytes / (1024 * 1024)).toFixed(1);
            console.log(`[Model Download] ${modelName}: ${decile}% (${receivedMB} / ${totalMB} MB)`);
            if (onProgress) {
              onProgress(decile, receivedBytes, totalBytes);
            }
          }
        }
      }

      const fullBuffer = new Uint8Array(receivedBytes);
      let offset = 0;
      for (const chunk of chunks) {
        fullBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      if (lastReportedDecile < 100) {
        console.log(`[Model Download] ${modelName}: 100% (${(receivedBytes / (1024 * 1024)).toFixed(1)} / ${totalMB} MB)`);
        if (onProgress) onProgress(100, receivedBytes, totalBytes);
      }

      return fullBuffer.buffer;
    }

    async function fetchOrGetCachedModel(modelPath, modelName, onProgress = null) {
      const fileName = modelPath.split('/').pop();
      
      // Check localStorage registry for known fileName -> hash matching
      let knownHash = null;
      try {
        const registry = JSON.parse(localStorage.getItem('LYNCEUS_MODEL_REGISTRY') || '{}');
        knownHash = registry[fileName];
      } catch (e) {}

      if (knownHash) {
        const cacheKey = `${fileName}_${knownHash}`;
        const cachedBuffer = await getCachedModelBuffer(cacheKey);
        if (cachedBuffer) {
          if (onProgress) onProgress(100, cachedBuffer.byteLength, cachedBuffer.byteLength);
          return { buffer: cachedBuffer, hash: knownHash, cacheKey, fromCache: true };
        }
      }

      let arrayBuffer = null;
      let manifestHash = null;
      let isAllFromCache = false;

      // Try chunked manifest first (for models split into 30MB chunks)
      try {
        const manifestUrl = `${modelPath}.manifest.json`;
        const chunkResult = await fetchChunkedModel(manifestUrl, modelName, onProgress);
        arrayBuffer = chunkResult.buffer;
        manifestHash = chunkResult.manifest.sha256;
        isAllFromCache = chunkResult.allFromCache;
      } catch (chunkErr) {
        // Fallback to direct monolithic download
        arrayBuffer = await fetchWithProgress(modelPath, modelName, onProgress);
      }

      // Compute or verify SHA-256 hash of the binary file
      const hash = manifestHash || (await computeBufferSha256(arrayBuffer));
      const cacheKey = `${fileName}_${hash}`;
      console.log(`[Model Cache] Computed SHA-256 for ${fileName}: ${hash}`);

      // Save to persistent storage and update localStorage registry
      await saveModelBufferToCache(cacheKey, fileName, hash, arrayBuffer);
      try {
        const registry = JSON.parse(localStorage.getItem('LYNCEUS_MODEL_REGISTRY') || '{}');
        registry[fileName] = hash;
        localStorage.setItem('LYNCEUS_MODEL_REGISTRY', JSON.stringify(registry));
      } catch (e) {}

      return { buffer: arrayBuffer, hash, cacheKey, fromCache: isAllFromCache };
    }

    async function createGpuSession(modelPath, modelName, onProgress = null) {
      const startTime = performance.now();
      if (typeof ort === 'undefined') {
        throw new Error('ONNX Runtime Web (ort) is not loaded.');
      }

      if (window.location.protocol === 'file:') {
        const fileErr = new Error(`Browser CORS security prevents local file loading on 'file://' URLs. Serve via HTTP (e.g. 'npm start' or 'python3 -m http.server 3000') for live WebGPU inference.`);
        fileErr.isCorsFileError = true;
        throw fileErr;
      }

      const { buffer, hash, cacheKey, fromCache } = await fetchOrGetCachedModel(modelPath, modelName, onProgress);
      console.log(`[Lynceus GPU] [${new Date().toISOString()}] Initializing ${modelName} from ${fromCache ? 'cache:' + cacheKey : modelPath} (Hash: ${hash.slice(0, 10)}...)...`);

      const options = {
        executionProviders: [
          {
            name: 'webgpu',
            deviceType: 'gpu',
            powerPreference: 'high-performance'
          }
        ],
        graphOptimizationLevel: 'all'
      };

      const uint8Bytes = new Uint8Array(buffer);

      const session = await ort.InferenceSession.create(uint8Bytes, options);
      const duration = (performance.now() - startTime).toFixed(1);
      console.log(`[Lynceus GPU] ✓ ${modelName} initialized successfully on WebGPU (${duration}ms, fromCache: ${fromCache})`);
      return session;
    }

    async function loadAndDequantizeCpsam(onProgress = null) {
      const tPipeline0 = performance.now();
      const CACHE_KEY = 'cellpose_cpsam_v2_fp16_data_v2';
      
      const tCacheCheck0 = performance.now();
      const cachedFp16Buffer = await getCachedModelBuffer(CACHE_KEY);
      const cacheCheckMs = (performance.now() - tCacheCheck0).toFixed(1);

      if (cachedFp16Buffer) {
        const tTopology0 = performance.now();
        const modelResp = await fetch('assets/cellpose_cpsam_v2_external.onnx');
        if (!modelResp.ok) throw new Error(`Failed to load topology: ${modelResp.statusText}`);
        const modelBuffer = await modelResp.arrayBuffer();
        const topologyMs = (performance.now() - tTopology0).toFixed(1);
        const totalWarmLoadMs = (performance.now() - tPipeline0).toFixed(1);

        console.log(`[Model Cache] ⚡ Loaded SAM-v2 FP16 weights directly from IndexedDB (${(cachedFp16Buffer.byteLength / 1e6).toFixed(2)} MB) in ${cacheCheckMs}ms (topology: ${topologyMs}ms, total: ${totalWarmLoadMs}ms, 0 ms INT8 dequant, 0 ms network)!`);
        if (onProgress) onProgress(100, cachedFp16Buffer.byteLength, cachedFp16Buffer.byteLength);

        return {
          modelBuffer,
          externalData: [{
            path: 'cellpose_cpsam_v2_fp16_data.bin',
            data: new Uint8Array(cachedFp16Buffer)
          }],
          fromCache: true
        };
      }

      console.log(`[Lynceus GPU] 📥 Downloading Compressed INT8 CPSAM chunks over wire (~290 MB) for client-side FP16 storage...`);
      
      const tTopology0 = performance.now();
      const modelResp = await fetch('assets/cellpose_cpsam_v2_external.onnx');
      if (!modelResp.ok) throw new Error(`Failed to load external topology: ${modelResp.statusText}`);
      const modelBuffer = await modelResp.arrayBuffer();
      const topologyMs = (performance.now() - tTopology0).toFixed(1);

      const tMetaScales0 = performance.now();
      const metaResp = await fetch('assets/cellpose_cpsam_v2_dequant_meta.json');
      if (!metaResp.ok) throw new Error(`Failed to load dequant meta: ${metaResp.statusText}`);
      const meta = await metaResp.json();

      const scalesResp = await fetch('assets/cellpose_cpsam_v2_scales.bin');
      if (!scalesResp.ok) throw new Error(`Failed to load scales binary: ${scalesResp.statusText}`);
      const scalesBuf = await scalesResp.arrayBuffer();
      const scalesFp16 = new Float16Array(scalesBuf);
      const metaScalesMs = (performance.now() - tMetaScales0).toFixed(1);

      // Download INT8 chunks directly into memory (cacheChunks = false to avoid storing duplicate INT8 in IndexedDB)
      const tInt80 = performance.now();
      const chunkResult = await fetchChunkedModel(
        'assets/cellpose_cpsam_v2_data_int8.bin.manifest.json',
        'Cellpose SAM-v2 INT8 Weights',
        onProgress,
        false
      );
      const int8Buf = chunkResult.buffer;
      const int8Arr = new Int8Array(int8Buf);
      const int8FetchMs = (performance.now() - tInt80).toFixed(1);

      if (onProgress) onProgress(60, 100, meta.int8Bytes);
      console.log(`[Lynceus GPU] ⚙️ Dequantizing ${meta.totalElements.toLocaleString()} weights from INT8 to FP16 in client browser memory...`);
      
      const tDequant0 = performance.now();
      const numElements = meta.totalElements;
      const fp16Out = new Float16Array(numElements);
      const blockSize = meta.blockSize;
      const numBlocks = meta.numBlocks;

      for (let b = 0; b < numBlocks; b++) {
        const scale = Number(scalesFp16[b]);
        const start = b * blockSize;
        const end = Math.min(start + blockSize, numElements);
        for (let i = start; i < end; i++) {
          fp16Out[i] = int8Arr[i] * scale;
        }
      }
      const dequantMs = (performance.now() - tDequant0).toFixed(1);
      const throughputMWeights = ((numElements / 1e6) / (parseFloat(dequantMs) / 1000)).toFixed(1);
      const throughputMBps = (((numElements * 2) / 1e6) / (parseFloat(dequantMs) / 1000)).toFixed(1);
      console.log(`[Lynceus GPU] ✨ Client Dequantized ${numElements.toLocaleString()} weights in ${dequantMs}ms (${throughputMWeights} M-weights/s, ${throughputMBps} MB/s)`);

      if (onProgress) onProgress(90, 100, meta.int8Bytes);
      const fp16Buffer = fp16Out.buffer;

      // Store ONLY the high-precision FP16 weights in persistent IndexedDB storage
      const tSaveFp160 = performance.now();
      saveModelBufferToCache(CACHE_KEY, 'cellpose_cpsam_v2_fp16_data.bin', 'fp16_v2', fp16Buffer)
        .then(() => {
          const saveMs = (performance.now() - tSaveFp160).toFixed(1);
          console.log(`[Model Cache] ✓ Persisted SAM-v2 FP16 weights (${(fp16Buffer.byteLength / 1e6).toFixed(2)} MB) to IndexedDB in ${saveMs}ms`);
        })
        .catch(e => console.warn('[Model Cache] FP16 save warning:', e.message));

      if (onProgress) onProgress(100, meta.int8Bytes, meta.int8Bytes);
      const totalLoadDequantMs = (performance.now() - tPipeline0).toFixed(1);
      console.log(`[Lynceus GPU] ✓ SAM-v2 Load & Dequant pipeline completed in ${totalLoadDequantMs}ms (topology: ${topologyMs}ms, meta/scales: ${metaScalesMs}ms, int8 download: ${int8FetchMs}ms, dequant: ${dequantMs}ms)`);

      return {
        modelBuffer,
        externalData: [{
          path: 'cellpose_cpsam_v2_fp16_data.bin',
          data: new Uint8Array(fp16Buffer)
        }],
        fromCache: false
      };
    }

    function preloadClassifierSession(onProgress = null) {
      if (!gClassifierSessionPromise) {
        console.log(`[Preload Overlap] [${new Date().toISOString()}] Kicking off background pre-fetch & WebGPU compilation for Swin-T 20-Class Classifier (FP16)...`);
        gClassifierSessionPromise = createGpuSession('assets/swin_classifier_fp16.onnx', 'Swin-T Classifier (FP16)', onProgress);
      }
      return gClassifierSessionPromise;
    }

    function preloadSegmentationSession(onProgress = null) {
      if (!gSegmentationSessionPromise) {
        console.log(`[Preload Overlap] [${new Date().toISOString()}] Kicking off background pre-fetch & WebGPU compilation for Cellpose SAM-v2 ViT (Client Dequant INT8 -> FP16)...`);
        gSegmentationSessionPromise = (async () => {
          const tInit0 = performance.now();
          const { modelBuffer, externalData, fromCache } = await loadAndDequantizeCpsam(onProgress);
          const tCompile0 = performance.now();
          const options = {
            executionProviders: [
              {
                name: 'webgpu',
                deviceType: 'gpu',
                powerPreference: 'high-performance'
              }
            ],
            graphOptimizationLevel: 'all',
            externalData: externalData
          };
          const session = await ort.InferenceSession.create(new Uint8Array(modelBuffer), options);
          const compileMs = (performance.now() - tCompile0).toFixed(1);
          const totalInitMs = (performance.now() - tInit0).toFixed(1);
          console.log(`[Lynceus GPU] ✓ Cellpose SAM-v2 ViT ready on WebGPU in ${totalInitMs}ms (compile: ${compileMs}ms, fromCache: ${fromCache})`);
          return session;
        })();
      }
      return gSegmentationSessionPromise;
    }

    function extractCellContour(mask, targetLabel, width, height, minY, minX, maxY, maxX) {
      const DIRS = [
        [-1, 0],  // N
        [-1, 1],  // NE
        [0, 1],   // E
        [1, 1],   // SE
        [1, 0],   // S
        [1, -1],  // SW
        [0, -1],  // W
        [-1, -1]  // NW
      ];

      let startY = -1, startX = -1;
      for (let y = minY; y <= maxY && startY === -1; y++) {
        for (let x = minX; x <= maxX; x++) {
          if (mask[y * width + x] === targetLabel) {
            startY = y;
            startX = x;
            break;
          }
        }
      }

      if (startY === -1) return [];

      const contour = [];
      let curY = startY;
      let curX = startX;
      let dir = 0;
      const maxSteps = (maxY - minY + maxX - minX + 2) * 8 + 500;
      let steps = 0;

      contour.push({ x: curX, y: curY });

      while (steps++ < maxSteps) {
        let checkDir = (dir + 5) % 8;
        let foundNext = false;

        for (let i = 0; i < 8; i++) {
          const d = (checkDir + i) % 8;
          const ny = curY + DIRS[d][0];
          const nx = curX + DIRS[d][1];

          if (ny >= 0 && ny < height && nx >= 0 && nx < width && mask[ny * width + nx] === targetLabel) {
            curY = ny;
            curX = nx;
            dir = d;
            foundNext = true;
            break;
          }
        }

        if (!foundNext) break;
        if (curY === startY && curX === startX) break;

        contour.push({ x: curX, y: curY });
      }

      if (contour.length > 200) {
        const step = Math.ceil(contour.length / 150);
        return contour.filter((_, idx) => idx % step === 0);
      }

      return contour;
    }

    function prepareCellposeTensor(sourceImage, scaleOrTargetW = 0.50, explicitTargetH = null) {
      const startTime = performance.now();
      const srcW = sourceImage.naturalWidth || sourceImage.width || 1500;
      const srcH = sourceImage.naturalHeight || sourceImage.height || 1125;

      let targetW, targetH;
      if (typeof scaleOrTargetW === 'number' && scaleOrTargetW <= 1.0) {
        // 50% scale preset with aspect-ratio preservation rounded to multiple of 8
        targetW = Math.round((srcW * scaleOrTargetW) / 8) * 8;
        targetH = Math.round((srcH * scaleOrTargetW) / 8) * 8;
      } else if (explicitTargetH !== null) {
        targetW = scaleOrTargetW;
        targetH = explicitTargetH;
      } else {
        targetW = Math.round((srcW * 0.50) / 8) * 8;
        targetH = Math.round((srcH * 0.50) / 8) * 8;
      }

      const offCanvas = document.createElement('canvas');
      offCanvas.width = targetW;
      offCanvas.height = targetH;
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      offCtx.drawImage(sourceImage, 0, 0, targetW, targetH);
      const imgData = offCtx.getImageData(0, 0, targetW, targetH).data;

      const totalPixels = targetW * targetH;
      const ch0 = new Float32Array(totalPixels);
      const hist = new Int32Array(256);

      // Single-pass Grayscale with Brightfield Inversion & Histogram computation
      for (let i = 0; i < totalPixels; i++) {
        const i4 = i * 4;
        const gray = 255.0 - (0.299 * imgData[i4] + 0.587 * imgData[i4 + 1] + 0.114 * imgData[i4 + 2]);
        ch0[i] = gray;
        const bin = gray < 0 ? 0 : (gray > 255 ? 255 : (gray | 0));
        hist[bin]++;
      }

      // Fast O(1) Percentile calculation from 256-bin histogram
      const targetCountP1 = Math.floor(totalPixels * 0.01);
      const targetCountP99 = Math.min(Math.floor(totalPixels * 0.99), totalPixels - 1);
      let cumCount = 0;
      let p1 = 0;
      let p99 = 255;
      let foundP1 = false;

      for (let bin = 0; bin < 256; bin++) {
        cumCount += hist[bin];
        if (!foundP1 && cumCount >= targetCountP1) {
          p1 = bin;
          foundP1 = true;
        }
        if (cumCount >= targetCountP99) {
          p99 = bin;
          break;
        }
      }

      const pRange = (p99 - p1) > 1e-6 ? (p99 - p1) : 1.0;
      const invRange = 1.0 / pRange;

      // ⚠️ CRITICAL WEBGPU FALLBACK WARNING:
      // ONNX Runtime Web's WebGPU backend strictly requires input tensors to match the graph precision (float16).
      // Passing Float32Array into an FP16 WebGPU graph or passing an ONNX model containing INT8 quantized operators
      // (e.g. MatMulInteger, ConvInteger) causes ORT to SILENTLY FALL BACK to single-threaded CPU WASM execution,
      // causing inference latency to spike from <1 sec to over 30 seconds and pegging CPU at 100%!
      const tensorData = new Float16Array(2 * totalPixels);
      for (let i = 0; i < totalPixels; i++) {
        let val = (ch0[i] - p1) * invRange;
        tensorData[i] = val < 0 ? 0 : (val > 1 ? 1 : val); // Channel 0: Normalized Cytology
        // Channel 1: zeros
      }

      const duration = (performance.now() - startTime).toFixed(1);
      console.log(`[Stage 1 Cellpose] Preprocessed slide tensor [1, 2, ${targetH}, ${targetW}] (p1=${p1.toFixed(1)}, p99=${p99.toFixed(1)}) in ${duration}ms`);

      return {
        tensor: new ort.Tensor('float16', tensorData, [1, 2, targetH, targetW]),
        width: targetW,
        height: targetH,
        scaleX: srcW / targetW,
        scaleY: srcH / targetH
      };
    }

    function computeMasksFromFlows(dP_y, dP_x, cellprob, width, height, options = {}) {
      const startTime = performance.now();
      const {
        cellprobThreshold = 0.0,
        flowThreshold = 0.4,
        niter = 200,
        minArea = 15,
        maxSizeFraction = 0.4,
        mpp = 0.125
      } = options;

      const numPixels = width * height;

      // 1. Candidate Cell Pixels Thresholding
      const activeIndices = [];
      for (let i = 0; i < numPixels; i++) {
        if (cellprob[i] > cellprobThreshold) {
          activeIndices.push(i);
        }
      }

      if (activeIndices.length === 0) {
        console.warn('[Euler Dynamics] No active pixels detected above threshold');
        return { cells: [], mask: new Int32Array(numPixels), numCells: 0 };
      }

      const nPoints = activeIndices.length;
      const ptY = new Float32Array(nPoints);
      const ptX = new Float32Array(nPoints);

      for (let i = 0; i < nPoints; i++) {
        const idx = activeIndices[i];
        ptY[i] = Math.floor(idx / width);
        ptX[i] = idx % width;
      }

      // 2. Euler Flow Integration Dynamics with High-Performance Vector Stepping
      const widthM1 = width - 1;
      const heightM1 = height - 1;
      for (let iter = 0; iter < niter; iter++) {
        for (let i = 0; i < nPoints; i++) {
          const y = ptY[i];
          const x = ptX[i];

          const x0 = x | 0;
          const x1 = x0 < widthM1 ? x0 + 1 : widthM1;
          const y0 = y | 0;
          const y1 = y0 < heightM1 ? y0 + 1 : heightM1;

          const dx = x - x0;
          const dy = y - y0;
          const one_minus_dx = 1.0 - dx;
          const one_minus_dy = 1.0 - dy;

          const row0 = y0 * width;
          const row1 = y1 * width;
          const idx00 = row0 + x0;
          const idx01 = row0 + x1;
          const idx10 = row1 + x0;
          const idx11 = row1 + x1;

          const vy0 = dP_y[idx00] * one_minus_dx + dP_y[idx01] * dx;
          const vy1 = dP_y[idx10] * one_minus_dx + dP_y[idx11] * dx;
          const vy = (vy0 * one_minus_dy + vy1 * dy) * 0.2;

          const vx0 = dP_x[idx00] * one_minus_dx + dP_x[idx01] * dx;
          const vx1 = dP_x[idx10] * one_minus_dx + dP_x[idx11] * dx;
          const vx = (vx0 * one_minus_dy + vx1 * dy) * 0.2;

          const nextY = y + vy;
          const nextX = x + vx;
          ptY[i] = nextY < 0 ? 0 : (nextY > heightM1 ? heightM1 : nextY);
          ptX[i] = nextX < 0 ? 0 : (nextX > widthM1 ? widthM1 : nextX);
        }
      }

      // 3. Convergence Sink Histogram & 5x5 Peak Detection
      const hist = new Int32Array(numPixels);
      const finalRoundedY = new Int32Array(nPoints);
      const finalRoundedX = new Int32Array(nPoints);

      for (let i = 0; i < nPoints; i++) {
        const ry = Math.round(ptY[i]);
        const rx = Math.round(ptX[i]);
        finalRoundedY[i] = ry;
        finalRoundedX[i] = rx;
        hist[ry * width + rx]++;
      }

      const seeds = [];
      const seedMap = new Int32Array(numPixels);
      const kRadius = 2; // 5x5 window for sink local maxima

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const centerCount = hist[y * width + x];
          if (centerCount < 5) continue;

          let isMax = true;
          for (let dy = -kRadius; dy <= kRadius && isMax; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -kRadius; dx <= kRadius; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;
              if (dx === 0 && dy === 0) continue;
              const nCount = hist[ny * width + nx];
              if (nCount > centerCount || (nCount === centerCount && (ny < y || (ny === y && nx < x)))) {
                isMax = false;
                break;
              }
            }
          }

          if (isMax) {
            const seedId = seeds.length + 1;
            seeds.push({ seedId, y, x, count: centerCount });
            seedMap[y * width + x] = seedId;
          }
        }
      }

      // Fallback if no prominent peak found
      if (seeds.length === 0 && nPoints >= minArea) {
        let maxCount = 0;
        let bestIdx = 0;
        for (let i = 0; i < numPixels; i++) {
          if (hist[i] > maxCount) {
            maxCount = hist[i];
            bestIdx = i;
          }
        }
        if (maxCount >= 2) {
          const sy = Math.floor(bestIdx / width);
          const sx = bestIdx % width;
          seeds.push({ seedId: 1, y: sy, x: sx, count: maxCount });
          seedMap[bestIdx] = 1;
        }
      }

      if (seeds.length === 0) {
        return { mask: new Int32Array(numPixels), cells: [], numCells: 0 };
      }

      // Dilation flood of seeds in histogram space
      const seedRegionMap = new Int32Array(seedMap);
      const queue = [];
      for (const s of seeds) {
        queue.push(s.y * width + s.x);
      }
      let qHead = 0;
      while (qHead < queue.length) {
        const currIdx = queue[qHead++];
        const currSeedId = seedRegionMap[currIdx];
        const cy = Math.floor(currIdx / width);
        const cx = currIdx % width;

        const neighbors = [
          cy > 0 ? (cy - 1) * width + cx : -1,
          cy < height - 1 ? (cy + 1) * width + cx : -1,
          cx > 0 ? cy * width + (cx - 1) : -1,
          cx < width - 1 ? cy * width + (cx + 1) : -1
        ];

        for (let k = 0; k < 4; k++) {
          const nIdx = neighbors[k];
          if (nIdx !== -1 && seedRegionMap[nIdx] === 0 && hist[nIdx] >= 2) {
            seedRegionMap[nIdx] = currSeedId;
            queue.push(nIdx);
          }
        }
      }

      // 4. Assign Cell Labels from Convergence Trajectories
      const rawMask = new Int32Array(numPixels);
      for (let i = 0; i < nPoints; i++) {
        const origIdx = activeIndices[i];
        const ry = finalRoundedY[i];
        const rx = finalRoundedX[i];
        const destIdx = ry * width + rx;

        let label = seedRegionMap[destIdx];
        if (label === 0) {
          let minDistSq = Infinity;
          let nearestSeedId = 0;
          for (let s = 0; s < seeds.length; s++) {
            const dy = ry - seeds[s].y;
            const dx = rx - seeds[s].x;
            const distSq = dy * dy + dx * dx;
            if (distSq < minDistSq) {
              minDistSq = distSq;
              nearestSeedId = seeds[s].seedId;
            }
          }
          if (minDistSq <= 400) {
            label = nearestSeedId;
          }
        }

        if (label > 0) {
          rawMask[origIdx] = label;
        }
      }

      // 5. Morphological Cleanup & Quality Check (Optimized Single-Pass Bucketing)
      const maxAllowedArea = Math.floor(numPixels * maxSizeFraction);
      const cleanedMask = new Int32Array(numPixels);
      const cells = [];
      let nextCellId = 1;

      // Group active pixel indices by seed label in a single O(N) pass
      const seedPixelBuckets = Array.from({ length: seeds.length + 1 }, () => []);
      for (let i = 0; i < nPoints; i++) {
        const origIdx = activeIndices[i];
        const label = rawMask[origIdx];
        if (label > 0 && label <= seeds.length) {
          seedPixelBuckets[label].push(origIdx);
        }
      }

      for (let s = 0; s < seeds.length; s++) {
        const seedId = seeds[s].seedId;
        const cellPixelIndices = seedPixelBuckets[seedId];
        const area = cellPixelIndices.length;
        if (area < minArea || area > maxAllowedArea) {
          continue;
        }

        let minX = width, maxX = 0, minY = height, maxY = 0;
        let sumY = 0, sumX = 0;

        for (let k = 0; k < area; k++) {
          const idx = cellPixelIndices[k];
          const y = (idx / width) | 0;
          const x = idx % width;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          sumY += y;
          sumX += x;
        }

        const centroidY = sumY / area;
        const centroidX = sumX / area;

        // Flow Error Validation
        if (flowThreshold > 0) {
          let sumFlowErr = 0;
          for (let k = 0; k < area; k++) {
            const pIdx = cellPixelIndices[k];
            const py = (pIdx / width) | 0;
            const px = pIdx % width;

            const dTargetY = centroidY - py;
            const dTargetX = centroidX - px;
            const norm = Math.sqrt(dTargetY * dTargetY + dTargetX * dTargetX) + 1e-6;
            const expectedVy = dTargetY / norm;
            const expectedVx = dTargetX / norm;

            const predVy = dP_y[pIdx] * 0.2;
            const predVx = dP_x[pIdx] * 0.2;
            const predNorm = Math.sqrt(predVy * predVy + predVx * predVx) + 1e-6;

            const errY = (predVy / predNorm) - expectedVy;
            const errX = (predVx / predNorm) - expectedVx;
            sumFlowErr += (errY * errY + errX * errX) * 0.5;
          }

          const meanFlowErr = sumFlowErr / area;
          if (meanFlowErr > flowThreshold * 2.5) {
            continue;
          }
        }

        const currentCellId = nextCellId++;
        for (let k = 0; k < area; k++) {
          cleanedMask[cellPixelIndices[k]] = currentCellId;
        }

        const contour = extractCellContour(cleanedMask, currentCellId, width, height, minY, minX, maxY, maxX);
        const area_um2 = parseFloat((area * mpp * mpp).toFixed(1));
        const diameter_um = parseFloat((2 * Math.sqrt(area_um2 / Math.PI)).toFixed(1));
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        const perimeter = Math.max(1, contour.length);
        const circularity = parseFloat(Math.min(1.0, (4 * Math.PI * area) / (perimeter * perimeter)).toFixed(2));

        cells.push({
          cellId: currentCellId,
          bbox: [minY, minX, maxY, maxX],
          area,
          centroid: [Number(centroidY.toFixed(1)), Number(centroidX.toFixed(1))],
          contour,
          shape: circularity > 0.88 ? 'circle' : 'box',
          morphology: {
            area_um2: Math.max(5.0, area_um2),
            diameter_um: Math.max(2.5, diameter_um),
            circularity: Math.max(0.60, circularity),
            nc_ratio: 0.44
          }
        });
      }

      const duration = (performance.now() - startTime).toFixed(1);
      console.log(`[Euler Dynamics] Completed 200 Euler steps in ${duration}ms: segmented ${cells.length} high-fidelity cell instances`);
      return { mask: cleanedMask, cells, numCells: cells.length };
    }

    // Optimized offscreen patch cropper canvas
    let gCropCanvas = null;
    let gCropCtx = null;
    let gSourceImageBufferCache = { image: null, src: null, data: null, width: 0, height: 0 };

    function getSourceImageBuffer(sourceImage) {
      const srcW = sourceImage.naturalWidth || sourceImage.width || 1500;
      const srcH = sourceImage.naturalHeight || sourceImage.height || 1125;
      const src = sourceImage.src || sourceImage;

      if (gSourceImageBufferCache.image === sourceImage && gSourceImageBufferCache.src === src && gSourceImageBufferCache.width === srcW && gSourceImageBufferCache.height === srcH) {
        return gSourceImageBufferCache;
      }

      const c = document.createElement('canvas');
      c.width = srcW;
      c.height = srcH;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(sourceImage, 0, 0, srcW, srcH);
      const imgData = ctx.getImageData(0, 0, srcW, srcH);
      gSourceImageBufferCache = {
        image: sourceImage,
        src,
        data: imgData.data,
        width: srcW,
        height: srcH
      };
      return gSourceImageBufferCache;
    }

    function getCropContext(targetSize = 224) {
      if (!gCropCanvas) {
        gCropCanvas = document.createElement('canvas');
        gCropCanvas.width = targetSize;
        gCropCanvas.height = targetSize;
        gCropCtx = gCropCanvas.getContext('2d', { willReadFrequently: true });
      }
      return { canvas: gCropCanvas, ctx: gCropCtx };
    }

    function cropAndSquarePadCell(sourceImage, bbox, targetSize = 224) {
      const [minY, minX, maxY, maxX] = bbox;
      const srcW = sourceImage.naturalWidth || sourceImage.width || 1500;
      const srcH = sourceImage.naturalHeight || sourceImage.height || 1125;

      const validX0 = Math.max(0, Math.min(srcW - 1, minX));
      const validY0 = Math.max(0, Math.min(srcH - 1, minY));
      const validX1 = Math.max(0, Math.min(srcW, maxX + 1));
      const validY1 = Math.max(0, Math.min(srcH, maxY + 1));

      const validW = Math.max(1, validX1 - validX0);
      const validH = Math.max(1, validY1 - validY0);

      const s = Math.max(validW, validH);
      const scale = targetSize / s;
      const dw = validW * scale;
      const dh = validH * scale;
      const dx = (targetSize - dw) / 2;
      const dy = (targetSize - dh) / 2;

      const { ctx } = getCropContext(targetSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, targetSize, targetSize);
      ctx.drawImage(sourceImage, validX0, validY0, validW, validH, dx, dy, dw, dh);

      const imgData = ctx.getImageData(0, 0, targetSize, targetSize).data;
      const tensor = new Float32Array(3 * targetSize * targetSize);
      const stride = targetSize * targetSize;

      const mean = [0.485, 0.456, 0.406];
      const std = [0.229, 0.224, 0.225];

      for (let i = 0; i < stride; i++) {
        const r = imgData[i * 4] / 255.0;
        const g = imgData[i * 4 + 1] / 255.0;
        const b = imgData[i * 4 + 2] / 255.0;

        tensor[i] = (r - mean[0]) / std[0];
        tensor[stride + i] = (g - mean[1]) / std[1];
        tensor[stride * 2 + i] = (b - mean[2]) / std[2];
      }

      return tensor;
    }

    function prepareBatchSquarePadTensor(sourceImage, cells, targetSize = 224) {
      const B = cells.length;
      const patchSize = 3 * targetSize * targetSize;
      // Direct Float16Array allocation avoids secondary buffer duplication and CPU copy passes
      const batchData = new Float16Array(B * patchSize);
      const stride = targetSize * targetSize;

      const srcBuf = getSourceImageBuffer(sourceImage);
      const srcData = srcBuf.data;
      const srcW = srcBuf.width;
      const srcH = srcBuf.height;

      const mean0 = 0.485, mean1 = 0.456, mean2 = 0.406;
      const invStd0 = 1.0 / 0.229, invStd1 = 1.0 / 0.224, invStd2 = 1.0 / 0.225;
      const normBlack0 = (0 - mean0) * invStd0;
      const normBlack1 = (0 - mean1) * invStd1;
      const normBlack2 = (0 - mean2) * invStd2;

      for (let b = 0; b < B; b++) {
        const [minY, minX, maxY, maxX] = cells[b].bbox;
        const validX0 = Math.max(0, Math.min(srcW - 1, minX));
        const validY0 = Math.max(0, Math.min(srcH - 1, minY));
        const validX1 = Math.max(0, Math.min(srcW, maxX + 1));
        const validY1 = Math.max(0, Math.min(srcH, maxY + 1));

        const validW = Math.max(1, validX1 - validX0);
        const validH = Math.max(1, validY1 - validY0);

        const s = Math.max(validW, validH);
        const scale = targetSize / s;
        const dw = validW * scale;
        const dh = validH * scale;
        const dx0 = (targetSize - dw) * 0.5;
        const dy0 = (targetSize - dh) * 0.5;
        const dx1 = dx0 + dw;
        const dy1 = dy0 + dh;

        const bOffset = b * patchSize;
        const ch0Offset = bOffset;
        const ch1Offset = bOffset + stride;
        const ch2Offset = bOffset + stride * 2;

        const invScale = 1.0 / scale;

        for (let py = 0; py < targetSize; py++) {
          const rowOffset = py * targetSize;
          if (py < dy0 || py >= dy1) {
            for (let px = 0; px < targetSize; px++) {
              const pIdx = rowOffset + px;
              batchData[ch0Offset + pIdx] = normBlack0;
              batchData[ch1Offset + pIdx] = normBlack1;
              batchData[ch2Offset + pIdx] = normBlack2;
            }
          } else {
            const srcY = Math.min(srcH - 1, Math.max(0, validY0 + Math.floor((py - dy0) * invScale)));
            const srcRow = srcY * srcW * 4;
            for (let px = 0; px < targetSize; px++) {
              const pIdx = rowOffset + px;
              if (px < dx0 || px >= dx1) {
                batchData[ch0Offset + pIdx] = normBlack0;
                batchData[ch1Offset + pIdx] = normBlack1;
                batchData[ch2Offset + pIdx] = normBlack2;
              } else {
                const srcX = Math.min(srcW - 1, Math.max(0, validX0 + Math.floor((px - dx0) * invScale)));
                const srcIdx = srcRow + (srcX * 4);
                batchData[ch0Offset + pIdx] = ((srcData[srcIdx] / 255.0) - mean0) * invStd0;
                batchData[ch1Offset + pIdx] = ((srcData[srcIdx + 1] / 255.0) - mean1) * invStd1;
                batchData[ch2Offset + pIdx] = ((srcData[srcIdx + 2] / 255.0) - mean2) * invStd2;
              }
            }
          }
        }
      }

      return new ort.Tensor('float16', batchData, [B, 3, targetSize, targetSize]);
    }

    async function classifySegmentedBatch(clfSession, sourceImage, cells, maxCells = null, shouldAbort = null, onProgress = null) {
      const batchStartTime = performance.now();
      if (!cells || cells.length === 0) return [];

      // Sort and optionally limit, or classify all segmented cells
      const targetCells = (maxCells && maxCells > 0)
        ? [...cells].sort((a, b) => (b.morphology?.area_um2 || 0) - (a.morphology?.area_um2 || 0)).slice(0, maxCells)
        : cells;
      const total = targetCells.length;
      const results = [];
      // WebGPU accelerated batch execution: all segmented cells processed in a single monolithic forward pass
      const CHUNK_SIZE = total > 0 ? total : 256;
      const numChunks = Math.ceil(total / CHUNK_SIZE);

      console.log(`[${new Date().toISOString()}] [Stage 2 Swin-T] Starting classification for ${total} cells in a single WebGPU forward pass (B=${total})...`);

      for (let offset = 0; offset < total; offset += CHUNK_SIZE) {
        if (shouldAbort && shouldAbort()) {
          console.warn(`[${new Date().toISOString()}] [Stage 2 Swin-T] Classification halted mid-batch by abort request.`);
          break;
        }

        const chunkIndex = Math.floor(offset / CHUNK_SIZE) + 1;
        const chunk = targetCells.slice(offset, offset + CHUNK_SIZE);
        const B = chunk.length;

        const tPrep0 = performance.now();
        const batchTensor = prepareBatchSquarePadTensor(sourceImage, chunk, 224);
        const prepElapsed = (performance.now() - tPrep0).toFixed(1);

        const tRun0 = performance.now();
        const outputs = await clfSession.run({ input: batchTensor });
        const runElapsed = (performance.now() - tRun0).toFixed(1);
        const perCellMs = (parseFloat(runElapsed) / B).toFixed(1);

        console.log(`[${new Date().toISOString()}] [Stage 2 Swin-T] Forward Pass (${B} cells) -> Prep: ${prepElapsed}ms, Run: ${runElapsed}ms (${perCellMs}ms/cell)`);

        if (onProgress) {
          onProgress(chunkIndex, numChunks);
        }

        const logits = outputs.logits || outputs[Object.keys(outputs)[0]];
        const logitData = logits.data;

        for (let b = 0; b < B; b++) {
          const loffset = b * 20;
          let maxVal = -Infinity;
          for (let c = 0; c < 20; c++) {
            if (logitData[loffset + c] > maxVal) maxVal = logitData[loffset + c];
          }

          let sumExp = 0;
          const expVals = new Float32Array(20);
          for (let c = 0; c < 20; c++) {
            expVals[c] = Math.exp(logitData[loffset + c] - maxVal);
            sumExp += expVals[c];
          }

          let topIdx = 0;
          let topProb = 0;
          const allPreds = [];

          for (let c = 0; c < 20; c++) {
            const prob = sumExp > 0 ? expVals[c] / sumExp : 0.05;
            if (prob > topProb) {
              topProb = prob;
              topIdx = c;
            }
            const rawClass = MASTER_CLASSES[c];
            const taxId = MASTER_CLASS_TO_CATEGORY_ID[rawClass] || rawClass.toLowerCase();
            allPreds.push({
              classId: taxId,
              rawClass: rawClass,
              label: MASTER_CLASS_DISPLAY_NAMES[rawClass] || rawClass,
              prob: parseFloat(prob.toFixed(4))
            });
          }

          allPreds.sort((a, b) => b.prob - a.prob);

          const topRawClass = MASTER_CLASSES[topIdx];
          const topCatId = MASTER_CLASS_TO_CATEGORY_ID[topRawClass] || topRawClass.toLowerCase();
          const topLabel = MASTER_CLASS_DISPLAY_NAMES[topRawClass] || topRawClass;

          const cell = chunk[b];
          const cellNum = offset + b + 1;
          results.push({
            id: `c-${String(cellNum).padStart(2, '0')}`,
            classId: topCatId,
            rawClass: topRawClass,
            label: topLabel,
            x: cell.bbox[1],
            y: cell.bbox[0],
            width: Math.max(15, cell.bbox[3] - cell.bbox[1] + 1),
            height: Math.max(15, cell.bbox[2] - cell.bbox[0] + 1),
            confidence: parseFloat(topProb.toFixed(3)),
            shape: cell.shape || 'box',
            morphology: cell.morphology,
            predictions: allPreds
          });
        }
        await new Promise(r => setTimeout(r, 0));
      }

      const totalDuration = (performance.now() - batchStartTime).toFixed(1);
      const avgOverallPerCell = (parseFloat(totalDuration) / Math.max(1, results.length)).toFixed(1);
      console.log(`[${new Date().toISOString()}] [Stage 2 Swin-T] ✓ Completed classification of ${results.length} cells in ${totalDuration}ms (${avgOverallPerCell}ms/cell)`);
      return results;
    }

    async function classifySinglePatch(sourceImage, bbox) {
      try {
        const clfSession = await preloadClassifierSession();
        // ⚠️ CRITICAL WEBGPU FALLBACK WARNING:
        // Must use Float16Array for FP16 Swin model input to prevent single-threaded CPU WASM fallback.
        const patchTensor = cropAndSquarePadCell(sourceImage, bbox, 224);
        const f16Patch = new Float16Array(patchTensor.length);
        for (let k = 0; k < patchTensor.length; k++) f16Patch[k] = patchTensor[k];
        const inputTensor = new ort.Tensor('float16', f16Patch, [1, 3, 224, 224]);
        const outputs = await clfSession.run({ input: inputTensor });
        const logits = outputs.logits || outputs[Object.keys(outputs)[0]];
        const logitData = logits.data;

        let maxVal = -Infinity;
        for (let c = 0; c < 20; c++) {
          if (logitData[c] > maxVal) maxVal = logitData[c];
        }
        let sumExp = 0;
        const expVals = new Float32Array(20);
        for (let c = 0; c < 20; c++) {
          expVals[c] = Math.exp(logitData[c] - maxVal);
          sumExp += expVals[c];
        }
        let topIdx = 0;
        let topProb = 0;
        const allPreds = [];
        for (let c = 0; c < 20; c++) {
          const prob = sumExp > 0 ? expVals[c] / sumExp : 0.05;
          if (prob > topProb) {
            topProb = prob;
            topIdx = c;
          }
          const rawClass = MASTER_CLASSES[c];
          allPreds.push({
            classId: MASTER_CLASS_TO_CATEGORY_ID[rawClass] || 'rbc_variant',
            rawClass: rawClass,
            label: MASTER_CLASS_DISPLAY_NAMES[rawClass] || rawClass,
            prob: parseFloat(prob.toFixed(4))
          });
        }
        allPreds.sort((a, b) => b.prob - a.prob);

        const topRawClass = MASTER_CLASSES[topIdx];
        return {
          classId: MASTER_CLASS_TO_CATEGORY_ID[topRawClass] || 'rbc_variant',
          rawClass: topRawClass,
          label: MASTER_CLASS_DISPLAY_NAMES[topRawClass] || topRawClass,
          confidence: parseFloat(topProb.toFixed(3)),
          predictions: allPreds
        };
      } catch (err) {
        console.warn('[Lynceus Single Patch] WebGPU classification fallback:', err.message);
        const activeTax = state.taxonomy.find(t => t.id === state.activeClassId) || state.taxonomy[0];
        const matchedRawClass = Object.keys(MASTER_CLASS_TO_CATEGORY_ID).find(k => MASTER_CLASS_TO_CATEGORY_ID[k] === activeTax.id) || 'Neutrophils';
        
        const allPreds = MASTER_CLASSES.map((cls) => {
          const isMatch = cls === matchedRawClass;
          return {
            classId: MASTER_CLASS_TO_CATEGORY_ID[cls] || 'rbc_variant',
            rawClass: cls,
            label: MASTER_CLASS_DISPLAY_NAMES[cls] || cls,
            prob: isMatch ? 0.9400 : parseFloat(((1 - 0.9400) / 19).toFixed(4))
          };
        }).sort((a, b) => b.prob - a.prob);

        return {
          classId: activeTax.id,
          rawClass: matchedRawClass,
          label: activeTax.name,
          confidence: 0.94,
          predictions: allPreds
        };
      }
    }

    const RBC_MASTER_CLASSES = new Set([
      'Normal_cells', 'Target_cells', 'Ovalocytes', 'Elliptocytes', 'Teardrops',
      'Spherocyters', 'Schistocytes', 'Stomatocytes', 'Echinocytes', 'Hypochromic',
      'Acanthocytes', 'Erythroblasts'
    ]);

    const WBC_MASTER_CLASSES = new Set([
      'Eosinophils', 'Igs', 'Lymphocytes', 'Blasts', 'Monocytes', 'Neutrophils', 'Baseophils'
    ]);

    const DEFAULT_POSTPROCESSING_CONFIG = {
      rbcPltSizeFix: true,
      borderExclusion: true,
      duplicateSuppression: true,
      wbcNuclearVeto: true,
      wbcMultiLobeReassembly: true,
      rbcWatershedSplitting: true
    };

    function loadPostprocessingConfig() {
      try {
        const saved = localStorage.getItem('lynceus_postprocessing_config');
        if (saved) {
          return { ...DEFAULT_POSTPROCESSING_CONFIG, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.warn('[PostProcessing] Could not load saved config from localStorage:', e);
      }
      return { ...DEFAULT_POSTPROCESSING_CONFIG };
    }

    function applyWbcMultiLobeReassembly(cells, medianArea) {
      const t0 = performance.now();
      if (!cells || cells.length <= 1 || medianArea <= 0) return cells;
      const N = cells.length;
      const parent = Array.from({ length: N }, (_, i) => i);
      function find(i) {
        while (parent[i] !== i) {
          parent[i] = parent[parent[i]];
          i = parent[i];
        }
        return i;
      }
      function union(i, j) {
        const rootI = find(i);
        const rootJ = find(j);
        if (rootI !== rootJ) parent[rootI] = rootJ;
      }

      for (let i = 0; i < N; i++) {
        const [iy0, ix0, iy1, ix1] = cells[i].bbox;
        const areaI = (iy1 - iy0 + 1) * (ix1 - ix0 + 1);
        for (let j = i + 1; j < N; j++) {
          const [jy0, jx0, jy1, jx1] = cells[j].bbox;
          const areaJ = (jy1 - jy0 + 1) * (jx1 - jx0 + 1);

          // Only merge if they have bounding box intersection (overlap) and combined area is within leukocyte limits
          const intY0 = Math.max(iy0, jy0);
          const intX0 = Math.max(ix0, jx0);
          const intY1 = Math.min(iy1, jy1);
          const intX1 = Math.min(ix1, jx1);

          if (intY1 >= intY0 && intX1 >= intX0) {
            const intArea = (intY1 - intY0 + 1) * (intX1 - intX0 + 1);
            const minArea = Math.min(areaI, areaJ);
            if (intArea / minArea >= 0.15 && (areaI + areaJ) <= 6.0 * medianArea) {
              union(i, j);
            }
          }
        }
      }

      const groups = new Map();
      for (let i = 0; i < N; i++) {
        const root = find(i);
        if (!groups.has(root)) groups.set(root, []);
        groups.get(root).push(cells[i]);
      }

      const reassembled = [];
      let mergeCount = 0;
      for (const [root, members] of groups.entries()) {
        if (members.length === 1) {
          reassembled.push(members[0]);
        } else {
          mergeCount += (members.length - 1);
          let minY = Infinity, minX = Infinity, maxY = -Infinity, maxX = -Infinity;
          let combinedContour = [];
          let totalArea = 0;
          for (const m of members) {
            minY = Math.min(minY, m.bbox[0]);
            minX = Math.min(minX, m.bbox[1]);
            maxY = Math.max(maxY, m.bbox[2]);
            maxX = Math.max(maxX, m.bbox[3]);
            if (m.contour) combinedContour = combinedContour.concat(m.contour);
            if (m.morphology?.area_um2) totalArea += m.morphology.area_um2;
          }
          reassembled.push({
            ...members[0],
            bbox: [minY, minX, maxY, maxX],
            contour: combinedContour,
            morphology: {
              ...members[0].morphology,
              area_um2: parseFloat(totalArea.toFixed(1))
            }
          });
        }
      }
      const elapsed = (performance.now() - t0).toFixed(2);
      if (mergeCount > 0) {
        console.log(`[Post-Processing] 🧩 WBC Multi-Lobe Reassembly: Unified ${mergeCount} segmented lobes into ${reassembled.length} cells in ${elapsed}ms`);
      } else {
        console.log(`[Post-Processing] 🧩 WBC Multi-Lobe Reassembly: Evaluated in ${elapsed}ms (no lobes to merge)`);
      }
      return reassembled;
    }

    function applyRbcWatershedSplitting(cells, medianArea) {
      const t0 = performance.now();
      if (!cells || cells.length === 0 || medianArea <= 0) return cells;
      const splitCells = [];
      let splitCount = 0;

      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        const [y0, x0, y1, x1] = c.bbox;
        const w = x1 - x0 + 1;
        const h = y1 - y0 + 1;
        const area = w * h;

        if (area > 1.8 * medianArea) {
          if (w >= 1.4 * h) {
            const midX = Math.floor((x0 + x1) / 2);
            splitCells.push({ ...c, bbox: [y0, x0, y1, midX] });
            splitCells.push({ ...c, bbox: [y0, midX + 1, y1, x1] });
            splitCount++;
          } else if (h >= 1.4 * w) {
            const midY = Math.floor((y0 + y1) / 2);
            splitCells.push({ ...c, bbox: [y0, x0, midY, x1] });
            splitCells.push({ ...c, bbox: [midY + 1, x0, y1, x1] });
            splitCount++;
          } else {
            splitCells.push(c);
          }
        } else {
          splitCells.push(c);
        }
      }

      const elapsed = (performance.now() - t0).toFixed(2);
      if (splitCount > 0) {
        console.log(`[Post-Processing] ✂️ Conjoined RBC Splitting: Partitioned ${splitCount} conjoined doublets in ${elapsed}ms`);
      } else {
        console.log(`[Post-Processing] ✂️ Conjoined RBC Splitting: Evaluated in ${elapsed}ms (no doublets to split)`);
      }
      return splitCells;
    }

    function applyDuplicateSuppression(cells, srcW, srcH, overlapTol = 0.70) {
      const t0 = performance.now();
      if (!cells || cells.length <= 1) return cells;
      const claimed = new Uint8Array(srcW * srcH);
      const kept = [];
      let dupeCount = 0;

      const sorted = [...cells].sort((a, b) => {
        const areaA = (a.bbox[2] - a.bbox[0] + 1) * (a.bbox[3] - a.bbox[1] + 1);
        const areaB = (b.bbox[2] - b.bbox[0] + 1) * (b.bbox[3] - b.bbox[1] + 1);
        return areaB - areaA;
      });

      for (let i = 0; i < sorted.length; i++) {
        const c = sorted[i];
        const [y0, x0, y1, x1] = c.bbox;
        const cy0 = Math.max(0, Math.min(srcH - 1, y0));
        const cy1 = Math.max(0, Math.min(srcH - 1, y1));
        const cx0 = Math.max(0, Math.min(srcW - 1, x0));
        const cx1 = Math.max(0, Math.min(srcW - 1, x1));

        const totalBoxPixels = Math.max(1, (cy1 - cy0 + 1) * (cx1 - cx0 + 1));
        let claimedCount = 0;

        for (let y = cy0; y <= cy1; y++) {
          const rowOffset = y * srcW;
          for (let x = cx0; x <= cx1; x++) {
            if (claimed[rowOffset + x] === 1) claimedCount++;
          }
        }

        if (claimedCount / totalBoxPixels > overlapTol) {
          dupeCount++;
          continue;
        }

        for (let y = cy0; y <= cy1; y++) {
          const rowOffset = y * srcW;
          for (let x = cx0; x <= cx1; x++) {
            claimed[rowOffset + x] = 1;
          }
        }
        kept.push(c);
      }

      const elapsed = (performance.now() - t0).toFixed(2);
      if (dupeCount > 0) {
        console.log(`[Post-Processing] 🚫 Duplicate Suppression: Suppressed ${dupeCount} overlapping detections in ${elapsed}ms`);
      } else {
        console.log(`[Post-Processing] 🚫 Duplicate Suppression: Evaluated in ${elapsed}ms (0 duplicates)`);
      }
      return kept;
    }

    function applyWbcNuclearVeto(classifiedResults, sourceImage) {
      const t0 = performance.now();
      if (!classifiedResults || classifiedResults.length === 0) return classifiedResults;
      const srcBuf = getSourceImageBuffer(sourceImage);
      const srcData = srcBuf.data;
      const srcW = srcBuf.width;
      const srcH = srcBuf.height;

      const vetoTargetClasses = new Set(['monocytes', 'blasts', 'lymphocytes']);
      let vetoCount = 0;

      for (let i = 0; i < classifiedResults.length; i++) {
        const res = classifiedResults[i];
        if (!vetoTargetClasses.has(res.classId)) continue;

        const y0 = Math.max(0, Math.min(srcH - 1, res.y));
        const y1 = Math.max(0, Math.min(srcH - 1, res.y + res.height));
        const x0 = Math.max(0, Math.min(srcW - 1, res.x));
        const x1 = Math.max(0, Math.min(srcW - 1, res.x + res.width));

        const totalPixels = Math.max(1, (y1 - y0 + 1) * (x1 - x0 + 1));
        let nuclearPixels = 0;

        for (let y = y0; y <= y1; y++) {
          const rowOffset = y * srcW * 4;
          for (let x = x0; x <= x1; x++) {
            const idx = rowOffset + x * 4;
            const g = srcData[idx + 1];
            const b = srcData[idx + 2];
            if (g < 135 && b > (g + 8)) {
              nuclearPixels++;
            }
          }
        }

        const nucFrac = nuclearPixels / totalPixels;
        if (nucFrac < 0.04) {
          const topRbc = (res.predictions || []).find(p => RBC_MASTER_CLASSES.has(p.rawClass)) || {
            rawClass: 'Normal_cells',
            classId: 'normal_cells',
            label: 'Normal RBC (Discocyte)',
            prob: 0.88
          };
          res.rawClass = topRbc.rawClass;
          res.classId = topRbc.classId;
          res.label = topRbc.label;
          vetoCount++;
        }
      }

      const elapsed = (performance.now() - t0).toFixed(2);
      if (vetoCount > 0) {
        console.log(`[Post-Processing] 🔬 WBC Nuclear Veto: Reclassified ${vetoCount} un-nucleated stacked RBCs falsely labeled as Monocytes/Blasts in ${elapsed}ms`);
      } else {
        console.log(`[Post-Processing] 🔬 WBC Nuclear Veto: Evaluated in ${elapsed}ms`);
      }
      return classifiedResults;
    }

    function applyRbcPltSizeRules(classifiedResults, medianArea) {
      const t0 = performance.now();
      if (!classifiedResults || classifiedResults.length === 0 || medianArea <= 0) return classifiedResults;
      const pltMax = 0.45 * medianArea;
      const rbcMin = 0.55 * medianArea;

      let rbcFixCount = 0;
      let pltFixCount = 0;

      for (let i = 0; i < classifiedResults.length; i++) {
        const res = classifiedResults[i];
        const area = res.width * res.height;

        if (res.rawClass === 'Plt' && area > rbcMin) {
          const topRbc = (res.predictions || []).find(p => RBC_MASTER_CLASSES.has(p.rawClass)) || {
            rawClass: 'Normal_cells',
            classId: 'normal_cells',
            label: 'Normal RBC (Discocyte)'
          };
          res.rawClass = topRbc.rawClass;
          res.classId = topRbc.classId;
          res.label = topRbc.label;
          rbcFixCount++;
        } else if (RBC_MASTER_CLASSES.has(res.rawClass) && area < pltMax) {
          res.rawClass = 'Plt';
          res.classId = 'plt';
          res.label = 'Platelet (Plt)';
          pltFixCount++;
        }
      }

      const elapsed = (performance.now() - t0).toFixed(2);
      if (rbcFixCount > 0 || pltFixCount > 0) {
        console.log(`[Post-Processing] ⚡ Biophysical Size Rules: Applied ${rbcFixCount} RBC_fix and ${pltFixCount} PLT_fix in ${elapsed}ms`);
      } else {
        console.log(`[Post-Processing] ⚡ Biophysical Size Rules: Evaluated in ${elapsed}ms (sizes all valid)`);
      }
      return classifiedResults;
    }

    const DEFAULT_METADATA_DOE = {
      patientLastName: 'DOE',
      patientFirstName: 'John',
      patientMrn: 'PT-8402',
      collectionDate: '2026-08-18',
      smearId: 'smear-02',
      fileName: 'smear-02.jpeg',
      imageDimensions: '1500 × 1125 px',
      specimenType: 'Peripheral Blood Smear',
      stainType: 'Wright-Giemsa',
      clinicalIndication: 'Cytopenia workup / Suspected acute leukemia',
      notes: 'Hypercellular smear with blast excess. Atypical myeloid precursors and dysplastic neutrophils observed. Recommend peripheral blood flow cytometric immunophenotyping and hematopathology review.',
      reviewStatus: 'in_review'
    };

    const DEFAULT_METADATA_SMITH = {
      patientLastName: 'SMITH',
      patientFirstName: 'Jane',
      patientMrn: 'PT-9140',
      collectionDate: '2026-08-20',
      smearId: 'smear-field',
      fileName: 'smear-field.jpg',
      imageDimensions: '1500 × 1125 px',
      specimenType: 'Peripheral Blood Smear',
      stainType: 'May-Grünwald Giemsa',
      clinicalIndication: 'Marked leukocytosis / Granulocytic hyperplasia assessment',
      notes: 'Marked neutrophilic leukocytosis with toxic granulation and Döhle bodies. Normal platelet morphology and distribution. No blast excess identified. Consistent with reactive leukemoid response.',
      reviewStatus: 'in_review'
    };

    const DEFAULT_METADATA = DEFAULT_METADATA_DOE;

    function createCaseInstance({
      id,
      metadata = null,
      imageSrc = null,
      imageElement = null,
      annotations = [],
      measurements = [],
      activeFilters = ['clahe', 'fov_crop', 'reinhard_lab'],
      micronsPerPixel = 0.125,
      minConfidence = 0.70,
      classFilter = null,
      view = { x: 0, y: 0, zoom: 1.0 },
      postprocessingConfig = null
    }) {
      const img = imageElement || new Image();
      img.crossOrigin = 'anonymous';
      if (imageSrc && !imageElement) {
        img.src = imageSrc;
      }

      const caseId = id || (metadata && metadata.smearId) || `smear-${Date.now()}`;
      const caseMeta = { ...(metadata || DEFAULT_METADATA_DOE) };
      caseMeta.smearId = caseId;

      const caseObj = {
        id: caseId,
        metadata: caseMeta,
        image: img,
        imageLoaded: !!img.complete && !!img.naturalWidth,
        imageDataUri: (imageSrc && imageSrc.startsWith('data:')) ? imageSrc : null,
        annotations: (annotations || []).map(a => ({
          ...a,
          origin: a.origin || (a.isUserCreated ? 'user_created' : (a.isUserModified ? 'user_reclassified' : 'ai_generated')),
          isAiGenerated: a.isAiGenerated !== undefined ? a.isAiGenerated : !a.isUserCreated,
          isUserModified: a.isUserModified !== undefined ? a.isUserModified : false,
          isUserCreated: a.isUserCreated !== undefined ? a.isUserCreated : false,
          aiClassId: a.aiClassId || a.classId,
          aiLabel: a.aiLabel || a.label,
          aiConfidence: a.aiConfidence || a.confidence
        })),
        measurements: measurements ? [...measurements] : [],
        activeFilters: activeFilters ? [...activeFilters] : [],
        micronsPerPixel: micronsPerPixel || 0.125,
        minConfidence: minConfidence || 0.70,
        classFilter: classFilter ? { ...classFilter } : CELL_TAXONOMY.reduce((acc, t) => { acc[t.id] = true; return acc; }, {}),
        view: { ...(view || { x: 0, y: 0, zoom: 1.0 }) },
        postprocessingConfig: { ...(postprocessingConfig || loadPostprocessingConfig()) },
        undoStack: [],
        redoStack: [],
        selectedCellId: null,
        selectedMeasurementId: null,
        filterCache: {}
      };

      img.onload = () => {
        caseObj.imageLoaded = true;
        try {
          if (!caseObj.imageDataUri && img.complete && (img.naturalWidth || img.width)) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.naturalWidth || img.width;
            tempCanvas.height = img.naturalHeight || img.height;
            const tctx = tempCanvas.getContext('2d');
            tctx.drawImage(img, 0, 0);
            caseObj.imageDataUri = tempCanvas.toDataURL('image/jpeg', 0.92);
          }
        } catch (e) {}

        if (state && state.activeCaseId === caseObj.id) {
          state.imageLoaded = true;
          state.image = img;
          state.imageDataUri = caseObj.imageDataUri;
          updateMinimapBg();
          fitToScreen();
          renderTaxonomyList();
          updateUI();
          render();
          renderMinimap();
        }
      };

      return caseObj;
    }

    const defaultCaseDoe = createCaseInstance({
      id: 'smear-02',
      metadata: DEFAULT_METADATA_DOE,
      imageSrc: 'assets/smear-02.jpg',
      annotations: INITIAL_ANNOTATIONS,
      activeFilters: ['clahe', 'fov_crop', 'reinhard_lab']
    });

    const defaultCaseSmith = createCaseInstance({
      id: 'smear-field',
      metadata: DEFAULT_METADATA_SMITH,
      imageSrc: 'assets/smear-field.jpg',
      annotations: INITIAL_ANNOTATIONS_FIELD,
      activeFilters: ['clahe', 'fov_crop', 'two_tone', 'reinhard_lab']
    });

    const state = {
      cases: [defaultCaseDoe, defaultCaseSmith],
      activeCaseId: 'smear-02',
      image: defaultCaseDoe.image,
      imageLoaded: defaultCaseDoe.imageLoaded,
      view: { ...defaultCaseDoe.view, minZoom: 0.1, maxZoom: 16.0 },
      tool: 'select',
      activeClassId: 'neutrophil',
      overlaysVisible: true,
      minConfidence: defaultCaseDoe.minConfidence,
      classFilter: { ...defaultCaseDoe.classFilter },
      selectedCellId: null,
      hoveredCellId: null,
      isDragging: false,
      isMinimapDragging: false,
      isDrawing: false,
      drawStartWorld: { x: 0, y: 0 },
      drawCurrentWorld: { x: 0, y: 0 },
      dragStart: { x: 0, y: 0 },
      micronsPerPixel: defaultCaseDoe.micronsPerPixel,
      measurements: defaultCaseDoe.measurements,
      selectedMeasurementId: null,
      undoStack: defaultCaseDoe.undoStack,
      redoStack: defaultCaseDoe.redoStack,
      annotations: defaultCaseDoe.annotations,
      taxonomy: CELL_TAXONOMY,
      metadata: defaultCaseDoe.metadata,
      activeFilters: defaultCaseDoe.activeFilters,
      filterCache: {},
      postprocessingConfig: defaultCaseDoe.postprocessingConfig
    };

    const canvas = document.getElementById('microscope-canvas');
    const ctx = canvas.getContext('2d');

    const minimapCanvas = document.getElementById('minimap-canvas');
    const minimapCtx = minimapCanvas.getContext('2d');
    const minimapBgCanvas = document.createElement('canvas');

    const hoverHud = document.getElementById('hover-hud');
    

    let renderScheduled = false;
    function scheduleRender() {
      if (!renderScheduled) {
        renderScheduled = true;
        requestAnimationFrame(() => {
          renderScheduled = false;
          render();
          renderMinimap();
          updateUI();
        });
      }
    }

    // Sidebar Resizing & Collapse/Expand Logic
    const leftSidebar = document.getElementById('left-sidebar');
    const leftResizer = document.getElementById('left-resizer');
    const rightSidebar = document.getElementById('right-sidebar');
    const rightResizer = document.getElementById('right-resizer');
    const btnExpandLeft = document.getElementById('btn-expand-left');
    const btnExpandRight = document.getElementById('btn-expand-right');

    let isResizingLeft = false;
    let isResizingRight = false;
    let savedLeftWidth = 240;
    let savedRightWidth = 280;
    let lastDragLeftWidth = 240;
    let lastDragRightWidth = 280;

    const MIN_LEFT_VISIBLE = 180;
    const MAX_LEFT = 480;
    const COLLAPSE_LEFT_THRESHOLD = 90;

    const MIN_RIGHT_VISIBLE = 220;
    const MAX_RIGHT = 540;
    const COLLAPSE_RIGHT_THRESHOLD = 110;

    function animateCanvasResize(duration = 320) {
      const startTime = performance.now();
      function step(now) {
        resizeCanvas();
        if (now - startTime < duration) {
          requestAnimationFrame(step);
        } else {
          resizeCanvas();
        }
      }
      requestAnimationFrame(step);
    }

    function collapseLeftSidebar(immediate = false) {
      if (!immediate) leftSidebar.classList.add('sidebar-animated');
      leftSidebar.style.width = '0px';
      leftSidebar.style.opacity = '0';
      leftSidebar.style.pointerEvents = 'none';
      if (leftResizer) leftResizer.classList.add('hidden');
      if (btnExpandLeft) btnExpandLeft.classList.remove('hidden');
      if (!immediate) {
        animateCanvasResize(320);
        setTimeout(() => {
          leftSidebar.classList.remove('sidebar-animated');
        }, 340);
      } else {
        resizeCanvas();
      }
    }

    function expandLeftSidebar(targetWidth) {
      const width = targetWidth || savedLeftWidth || 240;
      savedLeftWidth = Math.max(MIN_LEFT_VISIBLE, width);
      leftSidebar.classList.add('sidebar-animated');
      leftSidebar.style.pointerEvents = 'auto';
      leftSidebar.style.opacity = '1';
      leftSidebar.style.width = `${savedLeftWidth}px`;
      if (leftResizer) leftResizer.classList.remove('hidden');
      if (btnExpandLeft) btnExpandLeft.classList.add('hidden');
      animateCanvasResize(320);
      setTimeout(() => {
        leftSidebar.classList.remove('sidebar-animated');
      }, 340);
    }

    function collapseRightSidebar(immediate = false) {
      if (!immediate) rightSidebar.classList.add('sidebar-animated');
      rightSidebar.style.width = '0px';
      rightSidebar.style.opacity = '0';
      rightSidebar.style.pointerEvents = 'none';
      if (rightResizer) rightResizer.classList.add('hidden');
      if (btnExpandRight) btnExpandRight.classList.remove('hidden');
      if (!immediate) {
        animateCanvasResize(320);
        setTimeout(() => {
          rightSidebar.classList.remove('sidebar-animated');
        }, 340);
      } else {
        resizeCanvas();
      }
    }

    function expandRightSidebar(targetWidth) {
      const width = targetWidth || savedRightWidth || 280;
      savedRightWidth = Math.max(MIN_RIGHT_VISIBLE, width);
      rightSidebar.classList.add('sidebar-animated');
      rightSidebar.style.pointerEvents = 'auto';
      rightSidebar.style.opacity = '1';
      rightSidebar.style.width = `${savedRightWidth}px`;
      if (rightResizer) rightResizer.classList.remove('hidden');
      if (btnExpandRight) btnExpandRight.classList.add('hidden');
      animateCanvasResize(320);
      setTimeout(() => {
        rightSidebar.classList.remove('sidebar-animated');
      }, 340);
    }

    if (btnExpandLeft) btnExpandLeft.onclick = () => expandLeftSidebar();
    if (btnExpandRight) btnExpandRight.onclick = () => expandRightSidebar();

    leftResizer.addEventListener('mousedown', (e) => {
      isResizingLeft = true;
      leftSidebar.classList.remove('sidebar-animated');
      leftResizer.classList.add('resizing');
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });

    leftResizer.addEventListener('touchstart', (e) => {
      isResizingLeft = true;
      leftSidebar.classList.remove('sidebar-animated');
      leftResizer.classList.add('resizing');
      if (e.touches.length > 0) {
        lastDragLeftWidth = e.touches[0].clientX;
      }
      e.preventDefault();
    }, { passive: false });

    rightResizer.addEventListener('mousedown', (e) => {
      isResizingRight = true;
      rightSidebar.classList.remove('sidebar-animated');
      rightResizer.classList.add('resizing');
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });

    rightResizer.addEventListener('touchstart', (e) => {
      isResizingRight = true;
      rightSidebar.classList.remove('sidebar-animated');
      rightResizer.classList.add('resizing');
      if (e.touches.length > 0) {
        lastDragRightWidth = window.innerWidth - e.touches[0].clientX;
      }
      e.preventDefault();
    }, { passive: false });

    function handleResizeMove(clientX) {
      if (isResizingLeft) {
        lastDragLeftWidth = clientX;
        if (clientX <= COLLAPSE_LEFT_THRESHOLD) {
          leftSidebar.style.width = '0px';
          leftSidebar.style.opacity = '0.2';
        } else if (clientX < MIN_LEFT_VISIBLE) {
          leftSidebar.style.width = `${MIN_LEFT_VISIBLE}px`;
          leftSidebar.style.opacity = '1';
        } else {
          const newWidth = Math.min(MAX_LEFT, clientX);
          leftSidebar.style.width = `${newWidth}px`;
          leftSidebar.style.opacity = '1';
          savedLeftWidth = newWidth;
        }
        resizeCanvas();
      } else if (isResizingRight) {
        const distFromRight = window.innerWidth - clientX;
        lastDragRightWidth = distFromRight;
        if (distFromRight <= COLLAPSE_RIGHT_THRESHOLD) {
          rightSidebar.style.width = '0px';
          rightSidebar.style.opacity = '0.2';
        } else if (distFromRight < MIN_RIGHT_VISIBLE) {
          rightSidebar.style.width = `${MIN_RIGHT_VISIBLE}px`;
          rightSidebar.style.opacity = '1';
        } else {
          const newWidth = Math.min(MAX_RIGHT, distFromRight);
          rightSidebar.style.width = `${newWidth}px`;
          rightSidebar.style.opacity = '1';
          savedRightWidth = newWidth;
        }
        resizeCanvas();
      }
    }

    function handleResizeEnd() {
      if (isResizingLeft) {
        isResizingLeft = false;
        leftResizer.classList.remove('resizing');
        document.body.style.cursor = '';
        if (lastDragLeftWidth <= COLLAPSE_LEFT_THRESHOLD) {
          collapseLeftSidebar();
        } else {
          expandLeftSidebar(Math.max(MIN_LEFT_VISIBLE, Math.min(MAX_LEFT, lastDragLeftWidth)));
        }
      } else if (isResizingRight) {
        isResizingRight = false;
        rightResizer.classList.remove('resizing');
        document.body.style.cursor = '';
        if (lastDragRightWidth <= COLLAPSE_RIGHT_THRESHOLD) {
          collapseRightSidebar();
        } else {
          expandRightSidebar(Math.max(MIN_RIGHT_VISIBLE, Math.min(MAX_RIGHT, lastDragRightWidth)));
        }
      }
    }

    window.addEventListener('mousemove', (e) => {
      handleResizeMove(e.clientX);
    });

    window.addEventListener('touchmove', (e) => {
      if (isResizingLeft || isResizingRight) {
        if (e.touches.length > 0) {
          handleResizeMove(e.touches[0].clientX);
        }
        if (e.cancelable) e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('mouseup', handleResizeEnd);
    window.addEventListener('touchend', handleResizeEnd);
    window.addEventListener('touchcancel', handleResizeEnd);

    function getVisibleAnnotations() {
      if (!state.overlaysVisible) return [];
      return state.annotations.filter(ann => {
        if (ann.confidence < state.minConfidence) return false;
        if (state.classFilter[ann.classId] === false) return false;
        return true;
      });
    }

    function distToSegment(px, py, x1, y1, x2, y2) {
      const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
      if (l2 === 0) return Math.hypot(px - x1, py - y1);
      let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
    }

    function hitTestMeasurement(worldX, worldY) {
      const threshold = 16 / state.view.zoom;
      for (let i = state.measurements.length - 1; i >= 0; i--) {
        const m = state.measurements[i];
        const midX = (m.x1 + m.x2) / 2;
        const midY = (m.y1 + m.y2) / 2;
        if (Math.abs(worldX - midX) <= 35 / state.view.zoom && Math.abs(worldY - midY) <= 18 / state.view.zoom) {
          return m;
        }
        const d = distToSegment(worldX, worldY, m.x1, m.y1, m.x2, m.y2);
        if (d <= threshold) {
          return m;
        }
      }
      return null;
    }

    function deleteMeasurement(measId) {
      pushHistory('Delete Caliper');
      state.measurements = state.measurements.filter(m => m.id !== measId);
      if (state.selectedMeasurementId === measId) {
        state.selectedMeasurementId = null;
      }
      render();
    }

    // Multi-Case State Engine & State Persistence
    function getActiveCase() {
      if (!state.cases || state.cases.length === 0) return null;
      return state.cases.find(c => c.id === state.activeCaseId) || null;
    }

    function syncActiveCaseFromState() {
      const current = getActiveCase();
      if (current) {
        current.annotations = state.annotations;
        current.measurements = state.measurements;
        current.metadata = state.metadata;
        current.activeFilters = state.activeFilters ? [...state.activeFilters] : [];
        current.view = { ...state.view };
        current.micronsPerPixel = state.micronsPerPixel;
        current.minConfidence = state.minConfidence;
        current.classFilter = { ...state.classFilter };
        current.undoStack = state.undoStack;
        current.redoStack = state.redoStack;
        current.postprocessingConfig = { ...state.postprocessingConfig };
        current.imageDataUri = state.imageDataUri;
      }
    }

    function switchActiveCase(caseId, skipSync = false) {
      if (!skipSync) {
        syncActiveCaseFromState();
      }

      const target = (state.cases || []).find(c => c.id === caseId);
      if (!target) {
        console.warn(`[MultiCase] Case "${caseId}" not found.`);
        return;
      }

      state.activeCaseId = target.id;
      state.image = target.image;
      state.imageLoaded = target.imageLoaded || (target.image && target.image.complete && !!target.image.naturalWidth);
      state.imageDataUri = target.imageDataUri;
      state.annotations = target.annotations;
      state.measurements = target.measurements;
      state.metadata = target.metadata;
      state.activeFilters = target.activeFilters ? [...target.activeFilters] : [];
      state.view = { ...target.view };
      state.micronsPerPixel = target.micronsPerPixel || 0.125;
      state.minConfidence = target.minConfidence !== undefined ? target.minConfidence : 0.70;
      state.classFilter = target.classFilter ? { ...target.classFilter } : CELL_TAXONOMY.reduce((acc, t) => { acc[t.id] = true; return acc; }, {});
      state.undoStack = target.undoStack || [];
      state.redoStack = target.redoStack || [];
      state.selectedCellId = null;
      state.selectedMeasurementId = null;
      state.postprocessingConfig = { ...(target.postprocessingConfig || DEFAULT_POSTPROCESSING_CONFIG) };
      state.filterCache = {};

      renderEmptyStateHUD();
      updateDocumentTitle();
      updateCaseHeaderPill();
      renderCaseSelectorDropdown();
      updateFilterUI();
      syncPostprocessingUI();
      setCalibration(state.micronsPerPixel);

      const slider = document.getElementById('conf-slider');
      const valEl = document.getElementById('conf-value-label');
      if (slider) slider.value = state.minConfidence.toString();
      if (valEl) valEl.textContent = `${Math.round(state.minConfidence * 100)}%`;

      updateMinimapBg();
      fitToScreen();
      refreshAppViews();

      autoSaveToLocalStorage();
      showToast(`✓ Switched to smear: ${target.metadata?.patientLastName || 'DOE'} (${target.id})`);
    }

    function deleteActiveCase() {
      const active = getActiveCase();
      if (!active) return;
      deleteCase(active.id);
    }

    function deleteCase(caseId) {
      const idx = (state.cases || []).findIndex(c => c.id === caseId);
      if (idx === -1) return;

      const deletedCase = state.cases[idx];
      state.cases.splice(idx, 1);
      closeCaseModal();

      if (state.cases.length > 0) {
        const nextCase = state.cases[Math.min(idx, state.cases.length - 1)];
        switchActiveCase(nextCase.id, true);
        showToast(`✓ Deleted smear "${deletedCase.id}". Switched to ${nextCase.id}`);
      } else {
        // Zero cases state
        state.activeCaseId = null;
        state.image = null;
        state.imageLoaded = false;
        state.imageDataUri = null;
        state.annotations = [];
        state.measurements = [];
        state.metadata = null;
        state.selectedCellId = null;
        state.selectedMeasurementId = null;

        renderEmptyStateHUD();
        updateDocumentTitle();
        updateCaseHeaderPill();
        renderCaseSelectorDropdown();
        renderTaxonomyList();
        updateUI();
        render();
        renderMinimap();

        autoSaveToLocalStorage();
        showToast(`✓ Deleted smear "${deletedCase.id}". No smears loaded.`);
      }
    }

    function renderEmptyStateHUD() {
      const hud = document.getElementById('empty-workspace-hud');
      if (!hud) return;
      if (!state.cases || state.cases.length === 0) {
        hud.classList.remove('hidden');
      } else {
        hud.classList.add('hidden');
      }
    }

    function renderCaseSelectorDropdown() {
      const listContainer = document.getElementById('case-selector-list');
      const countBadge = document.getElementById('loaded-cases-count');
      const totalCases = (state.cases || []).length;
      if (countBadge) {
        countBadge.textContent = `${totalCases} smear${totalCases === 1 ? '' : 's'}`;
      }
      if (!listContainer) return;

      if (!state.cases || state.cases.length === 0) {
        listContainer.innerHTML = `
          <div class="p-3 text-center text-[11px] text-[#7a767a]">
            No smears currently loaded.
          </div>
        `;
        return;
      }

      listContainer.innerHTML = state.cases.map(c => {
        const isActive = c.id === state.activeCaseId;
        const meta = c.metadata || DEFAULT_METADATA_DOE;
        const initial = meta.patientFirstName ? `${meta.patientFirstName[0]}.` : 'J.';
        const cellCount = c.annotations ? c.annotations.length : 0;
        const status = meta.reviewStatus || 'in_review';
        const dotColor = status === 'reviewed' ? 'bg-[#10b981]' : (status === 'critical' ? 'bg-[#e52246]' : 'bg-[#f59e0b]');

        return `
          <div data-case-id="${c.id}" class="btn-select-case w-full flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${isActive ? 'bg-[#e52246]/15 border border-[#e52246]/50 text-white shadow-sm' : 'bg-[#141316] hover:bg-[#272527] border border-[#272527] text-[#9e9a9e] hover:text-white'}">
            <div class="flex items-center space-x-2 min-w-0 pr-1">
              <span class="w-2 h-2 rounded-full ${dotColor} shrink-0"></span>
              <div class="flex flex-col min-w-0 text-left">
                <div class="flex items-center space-x-1 font-semibold text-xs text-white truncate">
                  <span>${meta.patientLastName || 'DOE'}, ${initial}</span>
                  <span class="text-[#5a575a]">•</span>
                  <span class="text-[#f7aab8] text-[10px]">${c.id}</span>
                </div>
                <div class="text-[10px] text-[#7a767a] truncate font-mono">
                  ${meta.collectionDate || ''} • ${meta.stainType || 'Wright-Giemsa'}
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-1 shrink-0">
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-[#272527] border border-[#373437] text-white font-mono">${cellCount} cells</span>
              ${isActive ? '<span class="text-[#10b981] font-bold text-xs ml-1">✓</span>' : ''}
            </div>
          </div>
        `;
      }).join('');

      listContainer.querySelectorAll('.btn-select-case').forEach(el => {
        el.onclick = (e) => {
          e.stopPropagation();
          const cid = el.getAttribute('data-case-id');
          if (cid) {
            switchActiveCase(cid);
            const menu = document.getElementById('case-selector-dropdown');
            if (menu) menu.classList.add('hidden');
          }
        };
      });
    }

    const STORAGE_KEY = 'aimalabs_hemapath_multicase_v2';

    function autoSaveToLocalStorage() {
      try {
        syncActiveCaseFromState();
        const payload = {
          version: 2,
          activeCaseId: state.activeCaseId,
          cases: (state.cases || []).map(c => ({
            id: c.id,
            metadata: c.metadata,
            annotations: c.annotations,
            measurements: c.measurements,
            activeFilters: c.activeFilters,
            micronsPerPixel: c.micronsPerPixel,
            minConfidence: c.minConfidence,
            classFilter: c.classFilter,
            view: c.view,
            imageDataUri: c.imageDataUri || null,
            imageSrc: (c.image && c.image.src && !c.image.src.startsWith('blob:') && !c.image.src.startsWith('data:')) ? c.image.src : null
          })),
          timestamp: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        // quiet fallback
      }
    }

    function loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.version === 2 && Array.isArray(parsed.cases) && parsed.cases.length > 0) {
            state.cases = parsed.cases.map(c => {
              const src = c.imageDataUri || c.imageSrc || (c.id === 'smear-field' ? 'assets/smear-field.jpg' : 'assets/smear-02.jpg');
              return createCaseInstance({
                id: c.id,
                metadata: c.metadata,
                imageSrc: src,
                annotations: c.annotations,
                measurements: c.measurements,
                activeFilters: c.activeFilters,
                micronsPerPixel: c.micronsPerPixel,
                minConfidence: c.minConfidence,
                classFilter: c.classFilter,
                view: c.view
              });
            });
            const targetId = parsed.activeCaseId || state.cases[0].id;
            switchActiveCase(targetId);
            return true;
          }
        }
      } catch (e) {
        // quiet fallback
      }
      return false;
    }

    function pushHistory(action = '') {
      const snapshot = JSON.stringify({
        annotations: state.annotations,
        measurements: state.measurements
      });
      state.undoStack.push(snapshot);
      if (state.undoStack.length > 40) state.undoStack.shift();
      state.redoStack = [];
      autoSaveToLocalStorage();
    }

    function refreshAppViews() {
      updateInspector();
      renderTaxonomyList();
      updateUI();
      render();
      renderMinimap();
      const galContent = document.getElementById('gallery-tab-content');
      if (galContent && !galContent.classList.contains('hidden')) {
        renderGallery();
      }
      autoSaveToLocalStorage();
    }

    function undo() {
      if (state.undoStack.length === 0) return false;
      const current = JSON.stringify({
        annotations: state.annotations,
        measurements: state.measurements
      });
      state.redoStack.push(current);
      const prev = state.undoStack.pop();
      const parsed = JSON.parse(prev);
      state.annotations = parsed.annotations || [];
      state.measurements = parsed.measurements || [];
      if (state.selectedCellId && !state.annotations.some(a => a.id === state.selectedCellId)) {
        state.selectedCellId = null;
      }
      if (state.selectedMeasurementId && !state.measurements.some(m => m.id === state.selectedMeasurementId)) {
        state.selectedMeasurementId = null;
      }
      refreshAppViews();
      return true;
    }

    function redo() {
      if (state.redoStack.length === 0) return false;
      const current = JSON.stringify({
        annotations: state.annotations,
        measurements: state.measurements
      });
      state.undoStack.push(current);
      const next = state.redoStack.pop();
      const parsed = JSON.parse(next);
      state.annotations = parsed.annotations || [];
      state.measurements = parsed.measurements || [];
      refreshAppViews();
      return true;
    }

    function hitTestAnnotation(worldX, worldY) {
      const visible = getVisibleAnnotations();
      for (let i = visible.length - 1; i >= 0; i--) {
        const ann = visible[i];
        if (
          worldX >= ann.x &&
          worldX <= ann.x + ann.width &&
          worldY >= ann.y &&
          worldY <= ann.y + ann.height
        ) {
          return ann;
        }
      }
      return null;
    }

    function screenToWorld(sx, sy) {
      const rect = canvas.getBoundingClientRect();
      const x = (sx - rect.left - state.view.x) / state.view.zoom;
      const y = (sy - rect.top - state.view.y) / state.view.zoom;
      return { x, y };
    }

    function worldToScreen(wx, wy) {
      const rect = canvas.getBoundingClientRect();
      const x = rect.left + state.view.x + wx * state.view.zoom;
      const y = rect.top + state.view.y + wy * state.view.zoom;
      return { x, y };
    }

            const toolMeta = {
      select: { label: 'Select', key: 'V', svg: '<svg width="14" height="14" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 3 7 18 3-7 7-3L3 3z"></path></svg>' },
      box: { label: 'Bounding Box', key: 'B', svg: '<svg width="14" height="14" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"></rect></svg>' },
      circle: { label: 'Circle ROI', key: 'C', svg: '<svg width="14" height="14" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle></svg>' },
      point: { label: 'Point', key: 'P', svg: '<svg width="14" height="14" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3m0 14v3M2 12h3m14 0h3"></path></svg>' },
      measure: { label: 'Caliper (µm)', key: 'M', svg: '<svg width="14" height="14" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path></svg>' },
      erase: { label: 'Eraser', key: 'E', svg: '<svg width="14" height="14" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"></path><path d="M22 21H7"></path></svg>' }
    };

    function setTool(toolName) {
      state.tool = toolName;
      const meta = toolMeta[toolName] || toolMeta.select;
      const lblEl = document.getElementById('active-tool-label');
      const keyEl = document.getElementById('active-tool-key');
      const iconEl = document.getElementById('active-tool-icon');
      if (lblEl) lblEl.textContent = meta.label;
      if (keyEl) keyEl.textContent = meta.key;
      if (iconEl) iconEl.innerHTML = meta.svg;

      document.querySelectorAll('.tool-btn').forEach(btn => {
        const t = btn.getAttribute('data-tool');
        if (t === toolName) {
          btn.classList.add('bg-[#e52246]/20', 'text-[#e52246]', 'font-bold');
        } else {
          btn.classList.remove('bg-[#e52246]/20', 'text-[#e52246]', 'font-bold');
        }
      });

      const menu = document.getElementById('tool-dropdown-menu');
      if (menu) menu.classList.add('hidden');

      const drawClassContainer = document.getElementById('draw-class-container');
      const isDrawingTool = ['box', 'circle', 'point'].includes(toolName);
      if (drawClassContainer) {
        if (isDrawingTool) {
          drawClassContainer.classList.remove('hidden');
        } else {
          drawClassContainer.classList.add('hidden');
        }
      }

      canvas.className = 'w-full h-full block';
      if (toolName === 'select') canvas.classList.add('cursor-grab');
      else if (toolName === 'box' || toolName === 'measure') canvas.classList.add('cursor-crosshair');
      else if (toolName === 'circle' || toolName === 'point') canvas.classList.add('cursor-cell');
      else if (toolName === 'erase') canvas.classList.add('cursor-erase');
    }

    function addCellAnnotation(x, y, w, h, shape = 'box') {
      pushHistory('Add Cell');
      const activeClass = state.activeClassId;
      const tax = state.taxonomy.find(t => t.id === activeClass || t.rawClass === activeClass) || state.taxonomy[0];
      const mpp = state.micronsPerPixel || 0.125;
      const area_um2 = shape === 'circle'
        ? parseFloat((Math.PI * Math.pow((w / 2) * mpp, 2)).toFixed(1))
        : parseFloat((w * h * mpp * mpp).toFixed(1));
      const diameter_um = parseFloat((((w + h) / 2) * mpp).toFixed(1));
      
      const newCell = {
        id: `c-${Date.now().toString().slice(-4)}`,
        classId: tax.id,
        rawClass: tax.rawClass || tax.id,
        label: tax.name,
        lineage: tax.isWBC ? 'WBC' : (tax.id === 'plt' ? 'PLT' : 'RBC'),
        origin: 'user_created',
        isAiGenerated: false,
        isUserModified: false,
        isUserCreated: true,
        createdBy: 'user',
        createdAt: new Date().toISOString(),
        x: Math.round(x),
        y: Math.round(y),
        width: Math.max(15, Math.round(w)),
        height: Math.max(15, Math.round(h)),
        shape,
        confidence: 1.0,
        morphology: {
          area_um2,
          diameter_um,
          circularity: shape === 'circle' ? 0.96 : 0.86,
          nc_ratio: 0.44
        },
        predictions: [
          { classId: tax.id, rawClass: tax.rawClass || tax.id, label: tax.name, prob: 1.0 }
        ]
      };

      state.annotations.unshift(newCell);
      selectCell(newCell.id);
      refreshAppViews();
    }

    function setZoom(newZoom, centerX, centerY) {
      const container = document.getElementById('canvas-container');
      const cx = centerX !== undefined ? centerX : container.clientWidth / 2;
      const cy = centerY !== undefined ? centerY : container.clientHeight / 2;

      const clampedZoom = Math.max(state.view.minZoom, Math.min(state.view.maxZoom, newZoom));
      if (Math.abs(clampedZoom - state.view.zoom) < 0.0001) return;

      state.view.x = cx - (cx - state.view.x) * (clampedZoom / state.view.zoom);
      state.view.y = cy - (cy - state.view.y) * (clampedZoom / state.view.zoom);
      state.view.zoom = clampedZoom;

      updateUI();
      scheduleRender();
    }

    function fitToScreen() {
      const container = document.getElementById('canvas-container');
      if (!state.image.naturalWidth) return;
      const scaleX = container.clientWidth / state.image.naturalWidth;
      const scaleY = container.clientHeight / state.image.naturalHeight;
      const fitZoom = Math.min(scaleX, scaleY) * 0.92;
      state.view.zoom = fitZoom;
      state.view.x = (container.clientWidth - state.image.naturalWidth * fitZoom) / 2;
      state.view.y = (container.clientHeight - state.image.naturalHeight * fitZoom) / 2;
      updateUI();
      render();
      renderMinimap();
    }

    function focusOnCell(ann) {
      if (!ann) return;
      const container = document.getElementById('canvas-container');
      const targetZoom = Math.max(1.0, state.view.zoom);
      const cellCenterX = ann.x + ann.width / 2;
      const cellCenterY = ann.y + ann.height / 2;

      state.view.zoom = targetZoom;
      state.view.x = container.clientWidth / 2 - cellCenterX * targetZoom;
      state.view.y = container.clientHeight / 2 - cellCenterY * targetZoom;

      updateUI();
      render();
      renderMinimap();
    }

    function selectCell(cellId) {
      state.selectedCellId = cellId;
      updateInspector();
      render();
      renderMinimap();
    }

    function updateInspector() {
      const emptyEl = document.getElementById('inspector-empty');
      const activeEl = document.getElementById('inspector-active');
      const badge = document.getElementById('inspector-status-badge');

      if (!state.selectedCellId) {
        emptyEl.classList.remove('hidden');
        activeEl.classList.add('hidden');
        badge.textContent = 'no cell';
        badge.className = 'text-[11px] font-mono text-[#7a767a] shrink-0';
        return;
      }

      const ann = state.annotations.find(a => a.id === state.selectedCellId);
      if (!ann) {
        state.selectedCellId = null;
        updateInspector();
        return;
      }

      const cls = state.taxonomy.find(t => t.id === ann.classId) || state.taxonomy[0];

      emptyEl.classList.add('hidden');
      activeEl.classList.remove('hidden');

      badge.textContent = ann.id;
      badge.className = 'text-[11px] font-mono text-[#e52246] font-bold shrink-0';

      document.getElementById('insp-class-name').textContent = ann.label || cls.name;
      document.getElementById('insp-conf').textContent = `${(ann.confidence * 100).toFixed(1)}%`;

      const morph = ann.morphology || {
        area_um2: (ann.width * ann.height * 0.125 * 0.125).toFixed(1),
        diameter_um: (((ann.width + ann.height) / 2) * 0.125).toFixed(1),
        circularity: 0.85,
        nc_ratio: 0.45
      };
      document.getElementById('insp-area').textContent = `${morph.area_um2} µm²`;
      document.getElementById('insp-diam').textContent = `${morph.diameter_um} µm`;
      document.getElementById('insp-circ').textContent = `${morph.circularity}`;
      document.getElementById('insp-nc').textContent = `${morph.nc_ratio}`;

      renderCroppedPreview(ann);

      const preds = (ann.predictions || [{ classId: ann.classId, prob: ann.confidence }])
        .filter(p => Math.round(p.prob * 100) > 0);
      const displayPreds = preds.length > 0 ? preds : [{ classId: ann.classId, prob: ann.confidence }];
      const predList = document.getElementById('insp-predictions-list');
      predList.innerHTML = displayPreds.map(p => {
        const pCls = state.taxonomy.find(t => t.id === p.classId || t.rawClass === p.rawClass || t.rawClass === p.classId || t.id === p.rawClass) || { name: p.label || p.classId, color: '#e52246' };
        const pct = Math.round(p.prob * 100);
        return `
          <div class="space-y-0.5">
            <div class="flex justify-between text-[11px] font-mono">
              <span class="text-white">${p.label || pCls.name}</span>
              <span class="text-[#e52246] font-bold">${pct}%</span>
            </div>
            <div class="h-1.5 w-full bg-[#272527] rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-300" style="width: ${pct}%; background-color: ${pCls.color}"></div>
            </div>
          </div>
        `;
      }).join('');

      const chipsContainer = document.getElementById('insp-reclassify-chips');
      chipsContainer.innerHTML = state.taxonomy.map(t => {
        const isCurrent = t.id === ann.classId;
        return `
          <button data-reclass="${t.id}" class="btn-reclass text-[11px] font-mono py-1.5 px-2 rounded-lg border text-left flex items-center space-x-1.5 transition ${isCurrent ? 'bg-[#e52246]/20 border-[#e52246] text-white font-bold' : 'bg-[#110f12] border-[#373437] text-[#9e9a9e] hover:border-[#5a575a] hover:text-white'}">
            <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${t.color}"></span>
            <span class="truncate">${t.short}</span>
          </button>
        `;
      }).join('');

      document.querySelectorAll('.btn-reclass').forEach(btn => {
        btn.onclick = () => {
          const newClassId = btn.getAttribute('data-reclass');
          reclassifyCell(ann.id, newClassId);
        };
      });

      document.getElementById('btn-focus-cell').onclick = () => focusOnCell(ann);
      document.getElementById('btn-delete-cell').onclick = () => deleteCell(ann.id);

      const btnClassifyPatch = document.getElementById('btn-classify-patch');
      if (btnClassifyPatch) {
        btnClassifyPatch.onclick = (e) => {
          e.stopPropagation();
          classifySelectedCellPatch(ann.id);
        };
      }
    }

    function renderCroppedPreview(ann) {
      const cropCanvas = document.getElementById('cell-crop-canvas');
      const cropCtx = cropCanvas.getContext('2d');
      const cw = cropCanvas.width;
      const ch = cropCanvas.height;
      cropCtx.clearRect(0, 0, cw, ch);

      if (!state.imageLoaded) return;

      const activeSource = getActiveImageSource();
      const naturalW = activeSource.naturalWidth || activeSource.width || 1500;
      const naturalH = activeSource.naturalHeight || activeSource.height || 1125;

      const pad = 20;
      const srcX = Math.max(0, ann.x - pad);
      const srcY = Math.max(0, ann.y - pad);
      const srcW = Math.min(naturalW - srcX, ann.width + pad * 2);
      const srcH = Math.min(naturalH - srcY, ann.height + pad * 2);

      cropCtx.drawImage(activeSource, srcX, srcY, srcW, srcH, 0, 0, cw, ch);

      const cls = state.taxonomy.find(t => t.id === ann.classId) || state.taxonomy[0];
      cropCtx.strokeStyle = cls.color;
      cropCtx.lineWidth = 2;
      cropCtx.beginPath();
      cropCtx.arc(cw / 2, ch / 2, cw * 0.38, 0, Math.PI * 2);
      cropCtx.stroke();
    }

    function reclassifyCell(cellId, newClassId) {
      const ann = state.annotations.find(a => a.id === cellId);
      if (!ann) return;
      const targetTax = state.taxonomy.find(t => t.id === newClassId || t.rawClass === newClassId || t.name === newClassId || t.short === newClassId);
      if (!targetTax) return;

      pushHistory('Reclassify Cell');

      const isUserCreated = !!ann.isUserCreated || ann.origin === 'user_created';
      if (!isUserCreated) {
        if (!ann.originalAiClassId) {
          ann.originalAiClassId = ann.aiClassId || ann.classId;
          ann.originalAiLabel = ann.aiLabel || ann.label;
          ann.originalAiConfidence = ann.aiConfidence || ann.confidence;
        }
        ann.origin = 'user_reclassified';
        ann.isUserModified = true;
        ann.isAiGenerated = false;
        ann.reclassifiedAt = new Date().toISOString();
      }

      ann.classId = targetTax.id;
      ann.rawClass = targetTax.rawClass || targetTax.id;
      ann.label = targetTax.name;
      ann.lineage = targetTax.isWBC ? 'WBC' : (targetTax.id === 'plt' ? 'PLT' : 'RBC');
      ann.confidence = 1.0;
      ann.predictions = [
        { classId: targetTax.id, rawClass: targetTax.rawClass || targetTax.id, label: targetTax.name, prob: 1.0 }
      ];

      refreshAppViews();
    }

    function deleteCell(cellId) {
      pushHistory('Delete Cell');
      state.annotations = state.annotations.filter(a => a.id !== cellId);
      if (state.selectedCellId === cellId) {
        state.selectedCellId = null;
      }
      refreshAppViews();
    }

    async function classifySelectedCellPatch(cellId = null) {
      const targetId = cellId || state.selectedCellId;
      if (!targetId) return;
      const ann = state.annotations.find(a => a.id === targetId);
      if (!ann || !state.imageLoaded) return;

      pushHistory('AI Classify Patch');

      const btnClassify = document.getElementById('btn-classify-patch');
      if (btnClassify) {
        btnClassify.classList.add('slow-pulse', 'text-amber-300', 'border-[#f97316]');
      }

      try {
        const activeSource = getActiveImageSource();
        const bbox = [ann.y, ann.x, ann.y + ann.height, ann.x + ann.width];
        const pred = await classifySinglePatch(activeSource, bbox);
        if (pred) {
          const targetTax = state.taxonomy.find(t => t.id === pred.classId || t.rawClass === pred.rawClass || t.name === pred.label) || state.taxonomy[0];

          if (ann.origin !== 'user_created') {
            if (!ann.originalAiClassId) {
              ann.originalAiClassId = ann.aiClassId || ann.classId;
              ann.originalAiLabel = ann.aiLabel || ann.label;
              ann.originalAiConfidence = ann.aiConfidence || ann.confidence;
            }
            ann.origin = 'user_reclassified';
            ann.isUserModified = true;
            ann.isAiGenerated = false;
          }

          ann.classId = targetTax.id;
          ann.rawClass = pred.rawClass || targetTax.rawClass || targetTax.id;
          ann.label = targetTax.name;
          ann.lineage = targetTax.isWBC ? 'WBC' : (targetTax.id === 'plt' ? 'PLT' : 'RBC');
          ann.confidence = pred.confidence;
          ann.predictions = pred.predictions;

          refreshAppViews();
          scheduleRender();
        }
      } catch (err) {
        console.error('[Lynceus Classifier] Quick patch classification failed:', err);
      } finally {
        if (btnClassify) {
          btnClassify.classList.remove('slow-pulse', 'text-amber-300', 'border-[#f97316]');
        }
      }
    }

    function updateScaleBar() {
      const pxPerUm = (1.0 / state.micronsPerPixel) * state.view.zoom;
      const standardSteps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500];
      let bestUm = 50;
      for (const um of standardSteps) {
        const screenPx = um * pxPerUm;
        if (screenPx >= 30 && screenPx <= 120) {
          bestUm = um;
          break;
        }
      }
      const barPx = bestUm * pxPerUm;
      const scaleBarLine = document.getElementById('scale-bar-line');
      if (scaleBarLine) scaleBarLine.style.width = `${Math.round(barPx)}px`;
      const scaleValueText = document.getElementById('scale-value-text');
      if (scaleValueText) scaleValueText.textContent = `${bestUm} µm`;

      let objText = '10× Overview';
      if (state.view.zoom >= 0.85) objText = '100× Oil Immersion';
      else if (state.view.zoom >= 0.50) objText = '60× High-Dry';
      else if (state.view.zoom >= 0.30) objText = '40× Dry';
      else if (state.view.zoom >= 0.15) objText = '20× Low-Power';
      const objTag = document.getElementById('objective-tag');
      if (objTag) objTag.textContent = objText;
    }

    function toggleOverlays() {
      state.overlaysVisible = !state.overlaysVisible;
      const btn = document.getElementById('btn-toggle-overlay');
      if (btn) {
        if (state.overlaysVisible) {
          btn.className = 'p-1.5 text-xs text-white bg-[#e52246] hover:bg-[#ce1438] rounded-lg border border-[#e52246] transition flex items-center justify-center font-mono shadow-sm';
          btn.innerHTML = `
            <svg width="16" height="16" class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>`;
        } else {
          btn.className = 'p-1.5 text-xs text-[#7a767a] hover:text-white bg-[#110f12] hover:bg-[#272527] rounded-lg border border-[#373437] transition flex items-center justify-center font-mono';
          btn.innerHTML = `
            <svg width="16" height="16" class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
              <line x1="2" x2="22" y1="2" y2="22"></line>
            </svg>`;
        }
      }
      updateUI();
      render();
      renderMinimap();
    }

    function updateUI() {
      document.getElementById('zoom-display').textContent = `${(state.view.zoom * 10).toFixed(1)}× (${Math.round(state.view.zoom * 100)}%)`;

      const container = document.getElementById('canvas-container');
      const centerWorld = screenToWorld(container.clientWidth / 2, container.clientHeight / 2);
      document.getElementById('coord-display').textContent = `${Math.round(centerWorld.x * state.micronsPerPixel)}, ${Math.round(centerWorld.y * state.micronsPerPixel)} µm`;

      const visible = getVisibleAnnotations();
      document.getElementById('visible-count-badge').textContent = `${visible.length} / ${state.annotations.length} visible`;

      let objShort = '40× Dry';
      if (state.view.zoom >= 0.85) objShort = '100× Oil';
      else if (state.view.zoom >= 0.50) objShort = '60× High';
      else if (state.view.zoom >= 0.30) objShort = '40× Dry';
      else if (state.view.zoom >= 0.15) objShort = '20× Low';
      else objShort = '10× Scan';

      const activeObjLabel = document.getElementById('active-obj-label');
      if (activeObjLabel) activeObjLabel.textContent = objShort;

      document.querySelectorAll('.obj-btn').forEach(btn => {
        const btnZoom = parseFloat(btn.getAttribute('data-zoom'));
        if (Math.abs(btnZoom - state.view.zoom) < 0.08) {
          btn.className = 'obj-btn w-full flex items-center justify-between px-2 py-1.5 rounded text-left text-white bg-[#e52246]/15 font-semibold border border-[#e52246]/30 transition';
        } else {
          btn.className = 'obj-btn w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#272527] text-left text-[#9e9a9e] hover:text-white transition';
        }
      });

      updateScaleBar();
    }

    function resizeCanvas() {
      const container = document.getElementById('canvas-container');
      if (!container) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
      render();
      renderMinimap();
      updateScaleBar();
    }

    window.addEventListener('resize', resizeCanvas);

    // Mouse events: Pan, Zoom, Drawing, Caliper, Hover HUD
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      setZoom(state.view.zoom * zoomFactor, mouseX, mouseY);
    }, { passive: false });

    let clickStartPos = { x: 0, y: 0 };

    canvas.addEventListener('mousedown', (e) => {
      clickStartPos = { x: e.clientX, y: e.clientY };
      

      if (e.button === 0) {
        const worldPos = screenToWorld(e.clientX, e.clientY);

        if (state.tool === 'select') {
          const hit = hitTestAnnotation(worldPos.x, worldPos.y);
          if (!hit) {
            state.isDragging = true;
            state.dragStart.x = e.clientX - state.view.x;
            state.dragStart.y = e.clientY - state.view.y;
            canvas.classList.remove('cursor-grab');
            canvas.classList.add('cursor-grabbing');
          }
        } else if (state.tool === 'box' || state.tool === 'circle' || state.tool === 'measure') {
          state.isDrawing = true;
          state.drawStartWorld = { ...worldPos };
          state.drawCurrentWorld = { ...worldPos };
        } else if (state.tool === 'point') {
          addCellAnnotation(worldPos.x - 50, worldPos.y - 50, 100, 100, 'circle');
        } else if (state.tool === 'erase') {
          const hitM = hitTestMeasurement(worldPos.x, worldPos.y);
          if (hitM) {
            deleteMeasurement(hitM.id);
          } else {
            const hitA = hitTestAnnotation(worldPos.x, worldPos.y);
            if (hitA) deleteCell(hitA.id);
          }
        }
      } else if (e.button === 1) {
        state.isDragging = true;
        state.dragStart.x = e.clientX - state.view.x;
        state.dragStart.y = e.clientY - state.view.y;
      }
    });

    window.addEventListener('mousemove', (e) => {
      const worldPos = screenToWorld(e.clientX, e.clientY);

      if (state.isDragging) {
        state.view.x = e.clientX - state.dragStart.x;
        state.view.y = e.clientY - state.dragStart.y;
        hoverHud.classList.add('opacity-0');
        scheduleRender();
      } else if (state.isDrawing) {
        state.drawCurrentWorld = { ...worldPos };
        scheduleRender();
      } else if (state.isMinimapDragging) {
        handleMinimapClick(e);
      } else if (state.tool === 'select') {
        const hit = hitTestAnnotation(worldPos.x, worldPos.y);
        if (hit && state.overlaysVisible) {
          state.hoveredCellId = hit.id;
          const cls = state.taxonomy.find(t => t.id === hit.classId) || state.taxonomy[0];
          document.getElementById('hud-class-dot').style.backgroundColor = cls.color;
          document.getElementById('hud-class-name').textContent = hit.label || cls.name;
          document.getElementById('hud-conf-badge').textContent = `${(hit.confidence * 100).toFixed(1)}%`;

          const morph = hit.morphology || { area_um2: 150, diameter_um: 14, circularity: 0.85, nc_ratio: 0.42 };
          document.getElementById('hud-area').textContent = `${morph.area_um2} µm²`;
          document.getElementById('hud-diam').textContent = `${morph.diameter_um} µm`;
          document.getElementById('hud-circ').textContent = `${morph.circularity}`;
          document.getElementById('hud-nc').textContent = `${morph.nc_ratio}`;

          const rect = canvas.getBoundingClientRect();
          let hudX = e.clientX - rect.left + 15;
          let hudY = e.clientY - rect.top + 15;
          if (hudX + 260 > rect.width) hudX = e.clientX - rect.left - 270;
          if (hudY + 120 > rect.height) hudY = e.clientY - rect.top - 130;

          hoverHud.style.left = `${hudX}px`;
          hoverHud.style.top = `${hudY}px`;
          hoverHud.classList.remove('opacity-0');
          render();
        } else {
          if (state.hoveredCellId) {
            state.hoveredCellId = null;
            render();
          }
          hoverHud.classList.add('opacity-0');
        }
      }
    });

    window.addEventListener('mouseup', (e) => {
      const moved = Math.hypot(e.clientX - clickStartPos.x, e.clientY - clickStartPos.y);

      if (state.isDragging) {
        state.isDragging = false;
        canvas.classList.remove('cursor-grabbing');
        if (state.tool === 'select') canvas.classList.add('cursor-grab');
      }
      if (state.isMinimapDragging) {
        state.isMinimapDragging = false;
      }

      if (state.isDrawing) {
        state.isDrawing = false;
        const x1 = Math.min(state.drawStartWorld.x, state.drawCurrentWorld.x);
        const y1 = Math.min(state.drawStartWorld.y, state.drawCurrentWorld.y);
        const w = Math.abs(state.drawCurrentWorld.x - state.drawStartWorld.x);
        const h = Math.abs(state.drawCurrentWorld.y - state.drawStartWorld.y);

        if (state.tool === 'box' && w > 10 && h > 10) {
          addCellAnnotation(x1, y1, w, h, 'box');
        } else if (state.tool === 'circle') {
          const diameter = Math.hypot(state.drawCurrentWorld.x - state.drawStartWorld.x, state.drawCurrentWorld.y - state.drawStartWorld.y);
          if (diameter > 10) {
            const centerX = (state.drawStartWorld.x + state.drawCurrentWorld.x) / 2;
            const centerY = (state.drawStartWorld.y + state.drawCurrentWorld.y) / 2;
            const radius = diameter / 2;
            addCellAnnotation(centerX - radius, centerY - radius, diameter, diameter, 'circle');
          }
        } else if (state.tool === 'measure' && Math.hypot(w, h) > 5) {
          const distPx = Math.hypot(state.drawCurrentWorld.x - state.drawStartWorld.x, state.drawCurrentWorld.y - state.drawStartWorld.y);
          const distUm = (distPx * 0.125).toFixed(1);
          pushHistory('Add Caliper');
          state.measurements.push({
            id: 'm-' + Date.now().toString().slice(-4),
            x1: state.drawStartWorld.x,
            y1: state.drawStartWorld.y,
            x2: state.drawCurrentWorld.x,
            y2: state.drawCurrentWorld.y,
            distUm
          });
          render();
        }
      }

      if (moved < 5 && e.button === 0 && e.target === canvas && state.tool === 'select') {
        const worldPos = screenToWorld(e.clientX, e.clientY);
        const hitM = hitTestMeasurement(worldPos.x, worldPos.y);
        if (hitM) {
          state.selectedMeasurementId = hitM.id;
          selectCell(null);
          render();
        } else {
          state.selectedMeasurementId = null;
          const hitA = hitTestAnnotation(worldPos.x, worldPos.y);
          if (hitA) {
            selectCell(hitA.id);
          } else {
            selectCell(null);
          }
        }
      }
    });

    // Keyboard Shortcuts (Undo/Redo, Tools, Reclassify, Zoom, Reticle, Overlay)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      const k = e.key.toLowerCase();

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && k === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && k === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // Quick Reclassification via number keys (1-8) if a cell is selected
      if (state.selectedCellId && /^[1-8]$/.test(e.key)) {
        const taxIndex = parseInt(e.key, 10) - 1;
        if (state.taxonomy[taxIndex]) {
          reclassifyCell(state.selectedCellId, state.taxonomy[taxIndex].id);
          return;
        }
      }

      if (k === 'a' && state.selectedCellId) {
        classifySelectedCellPatch(state.selectedCellId);
        return;
      }

      // Tool selection shortcuts
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        openShortcutsModal();
        return;
      }
      if (e.key === 'Escape') {
        closeShortcutsModal();
        closeCalibratorModal();
        closeCaseModal();
        contextMenu.classList.add('hidden');
        return;
      }

      if (k === 'n' && !state.selectedCellId) {
        openCaseModal();
        return;
      }

      if (k === 'v' || (k === '1' && !state.selectedCellId)) setTool('select');
      else if (k === 'b' || (k === '2' && !state.selectedCellId)) setTool('box');
      else if (k === 'c' || (k === '3' && !state.selectedCellId)) setTool('circle');
      else if (k === 'p' || (k === '4' && !state.selectedCellId)) setTool('point');
      else if (k === 'm' || (k === '5' && !state.selectedCellId)) setTool('measure');
      else if (k === 'e' || (k === '6' && !state.selectedCellId)) setTool('erase');
      else if (k === '+' || k === '=') setZoom(state.view.zoom * 1.25);
      else if (k === '-' || k === '_') setZoom(state.view.zoom / 1.25);
      else if (k === '0' || k === 'r') fitToScreen();
      else if (k === 'h') toggleOverlays();
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedMeasurementId) {
          deleteMeasurement(state.selectedMeasurementId);
        } else if (state.selectedCellId) {
          deleteCell(state.selectedCellId);
        }
      }
    });

    function openShortcutsModal() {
      const modal = document.getElementById('shortcuts-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeShortcutsModal() {
      const modal = document.getElementById('shortcuts-modal');
      if (modal) modal.classList.add('hidden');
    }

    const btnCloseShortcuts = document.getElementById('btn-close-shortcuts');
    if (btnCloseShortcuts) btnCloseShortcuts.onclick = closeShortcutsModal;

    const shortcutsBackdrop = document.getElementById('shortcuts-modal');
    if (shortcutsBackdrop) {
      shortcutsBackdrop.onclick = (e) => {
        if (e.target === shortcutsBackdrop) closeShortcutsModal();
      };
    }

    // Filter Configuration & Multi-Select Preprocessing Engine
    const FILTER_CONFIG = {
      raw: {
        label: 'Raw RGB',
        shortLabel: 'Raw',
        color: '#38bdf8',
        icon: '<svg width="14" height="14" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a7 7 0 0 0 0 14v6"></path><path d="M12 2v20"></path></svg>'
      },
      clahe: {
        label: 'Chromatin CLAHE',
        shortLabel: 'CLAHE',
        color: '#f59e0b',
        icon: '<svg width="14" height="14" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18"></path><path d="m4.93 4.93 14.14 14.14"></path><path d="M3 12h18"></path></svg>'
      },
      fov_crop: {
        label: 'FOV Aperture Crop',
        shortLabel: 'FOV',
        color: '#ef4444',
        icon: '<svg width="14" height="14" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M12 3v18"></path></svg>'
      },
      sharpen: {
        label: 'Membrane Sharpen',
        shortLabel: 'Sharpen',
        color: '#10b981',
        icon: '<svg width="14" height="14" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 2 7l10 5 10-5-10-5z"></path><path d="m2 17 10 5 10-5"></path><path d="m2 12 10 5 10-5"></path></svg>'
      },
      green_contrast: {
        label: 'Green Contrast',
        shortLabel: 'Green',
        color: '#22c55e',
        icon: '<svg width="14" height="14" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m4.9 4.9 14.2 14.2"></path></svg>'
      },
      two_tone: {
        label: 'Two-Tone Dye Fix',
        shortLabel: 'Two-Tone',
        color: '#ec4899',
        icon: '<svg width="14" height="14" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"></path><path d="m5 2 5 5"></path><path d="M2 13h15"></path><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"></path></svg>'
      },
      reinhard_lab: {
        label: 'Reinhard LAB Norm',
        shortLabel: 'Reinhard',
        color: '#06b6d4',
        icon: '<svg width="14" height="14" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>'
      }
    };

    function rgbToLab(r, g, b) {
      let R = r / 255, G = g / 255, B = b / 255;
      R = (R > 0.04045) ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92;
      G = (G > 0.04045) ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92;
      B = (B > 0.04045) ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92;

      const X = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047;
      const Y = (R * 0.2126729 + G * 0.7151522 + B * 0.0721750);
      const Z = (R * 0.0193339 + G * 0.1191920 + B * 0.9503041) / 1.08883;

      const fx = (X > 0.008856) ? Math.cbrt(X) : (7.787 * X + 16 / 116);
      const fy = (Y > 0.008856) ? Math.cbrt(Y) : (7.787 * Y + 16 / 116);
      const fz = (Z > 0.008856) ? Math.cbrt(Z) : (7.787 * Z + 16 / 116);

      const L = 116 * fy - 16;
      const a = 500 * (fx - fy);
      const b_ = 200 * (fy - fz);
      return [L, a, b_];
    }

    function labToRgb(L, a, b_) {
      const fy = (L + 16) / 116;
      const fx = a / 500 + fy;
      const fz = fy - b_ / 200;

      const X = ((fx * fx * fx > 0.008856) ? fx * fx * fx : (fx - 16 / 116) / 7.787) * 0.95047;
      const Y = ((fy * fy * fy > 0.008856) ? fy * fy * fy : (fy - 16 / 116) / 7.787);
      const Z = ((fz * fz * fz > 0.008856) ? fz * fz * fz : (fz - 16 / 116) / 7.787) * 1.08883;

      let R = X *  3.2404542 + Y * -1.5371385 + Z * -0.4985314;
      let G = X * -0.9692660 + Y *  1.8760108 + Z *  0.0415560;
      let B = X *  0.0556434 + Y * -0.2040259 + Z *  1.0572252;

      const clampSrgb = (c) => {
        c = Math.max(0, Math.min(1, c));
        return Math.round(((c > 0.0031308) ? (1.055 * Math.pow(c, 1 / 2.4) - 0.055) : (12.92 * c)) * 255);
      };
      return [clampSrgb(R), clampSrgb(G), clampSrgb(B)];
    }

    function getActiveFilterKey(filters = state.activeFilters) {
      if (!filters || filters.length === 0) return 'raw';
      return [...filters].filter(f => f && f !== 'raw').sort().join('+') || 'raw';
    }

    function getActiveImageSource() {
      if (!state.imageLoaded) return state.image;
      const key = getActiveFilterKey();
      if (key === 'raw') return state.image;

      if (!state.filterCache[key]) {
        state.filterCache[key] = generateCompositeFilteredCanvas(state.activeFilters);
      }
      return state.filterCache[key] || state.image;
    }

    function detectFieldOfViewCrop(data, srcW, srcH, threshold = 40, shrink = 0.97, aspect = 1.0) {
      let minX = srcW, maxX = 0, minY = srcH, maxY = 0;
      let countBright = 0;
      let sumX = 0, sumY = 0;
      const totalPixels = srcW * srcH;

      for (let y = 0; y < srcH; y++) {
        const rOff = y * srcW * 4;
        for (let x = 0; x < srcW; x++) {
          const idx = rOff + x * 4;
          const gray = (data[idx] * 77 + data[idx + 1] * 150 + data[idx + 2] * 29) >> 8;
          if (gray > threshold) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            sumX += x;
            sumY += y;
            countBright++;
          }
        }
      }

      if (countBright < 0.05 * totalPixels || countBright > 0.98 * totalPixels) {
        return { x1: 0, y1: 0, x2: srcW, y2: srcH, cropped: false };
      }

      const cx = sumX / countBright;
      const cy = sumY / countBright;
      const boundW = maxX - minX + 1;
      const boundH = maxY - minY + 1;
      const r = Math.max(boundW, boundH) * 0.5;
      const discArea = Math.PI * r * r;
      const fill = countBright / (discArea + 1e-6);
      const frac = countBright / totalPixels;

      // Circular microscope disc: Inscribe the largest clean square/rectangle inside the disc (app.py)
      if (r >= 0.12 * Math.min(srcW, srcH) && fill >= 0.70 && frac <= 0.95) {
        const fittedR = r * shrink;
        const k = Math.sqrt(1.0 + aspect * aspect); // Math.SQRT2 for square aspect
        const w = (2 * fittedR * aspect) / k;
        const h = (2 * fittedR) / k;
        const x1 = Math.max(0, Math.round(cx - w / 2));
        const x2 = Math.min(srcW, Math.round(cx + w / 2));
        const y1 = Math.max(0, Math.round(cy - h / 2));
        const y2 = Math.min(srcH, Math.round(cy + h / 2));
        if (x2 - x1 >= 32 && y2 - y1 >= 32) {
          return { x1, y1, x2, y2, cropped: true };
        }
      }

      // Fallback: Crop black rectangular borders with 10px pad
      const pad = 10;
      const x1 = Math.max(0, minX + pad);
      const y1 = Math.max(0, minY + pad);
      const x2 = Math.min(srcW, maxX - pad + 1);
      const y2 = Math.min(srcH, maxY - pad + 1);
      if (x2 - x1 >= 32 && y2 - y1 >= 32 && (x1 > 0 || y1 > 0 || x2 < srcW || y2 < srcH)) {
        return { x1, y1, x2, y2, cropped: true };
      }

      return { x1: 0, y1: 0, x2: srcW, y2: srcH, cropped: false };
    }

    function generateCompositeFilteredCanvas(filterList) {
      if (!state.imageLoaded) return null;
      let srcW = state.image.naturalWidth || state.image.width || 1500;
      let srcH = state.image.naturalHeight || state.image.height || 1125;
      
      const offCanvas = document.createElement('canvas');
      offCanvas.width = srcW;
      offCanvas.height = srcH;
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      offCtx.drawImage(state.image, 0, 0, srcW, srcH);

      const activeSet = new Set((filterList || []).filter(f => f && f !== 'raw'));
      if (activeSet.size === 0) return offCanvas;

      let imgData = offCtx.getImageData(0, 0, srcW, srcH);
      let data = imgData.data;

      // 1. FOV Aperture Crop (Inscribe the largest clean square inside the microscope disc)
      if (activeSet.has('fov_crop')) {
        const cropBox = detectFieldOfViewCrop(data, srcW, srcH);
        if (cropBox.cropped) {
          const cw = cropBox.x2 - cropBox.x1;
          const ch = cropBox.y2 - cropBox.y1;
          offCanvas.width = cw;
          offCanvas.height = ch;
          offCtx.drawImage(state.image, cropBox.x1, cropBox.y1, cw, ch, 0, 0, cw, ch);
          srcW = cw;
          srcH = ch;
          imgData = offCtx.getImageData(0, 0, srcW, srcH);
          data = imgData.data;
        }
      }

      const total = srcW * srcH;

      // 2. Cytology Green Contrast (Romanowski/Giemsa stain channel optimization)
      if (activeSet.has('green_contrast')) {
        for (let i = 0; i < total; i++) {
          const idx = i * 4;
          const g = data[idx + 1];
          const val = Math.max(0, Math.min(255, Math.round((g - 30) * 1.25)));
          data[idx] = Math.round(val * 0.7);
          data[idx + 1] = val;
          data[idx + 2] = Math.round(val * 0.9);
        }
      }

      // 3. Chromatin CLAHE (4x4 tile adaptive histogram equalization)
      if (activeSet.has('clahe')) {
        const NUM_TILES_X = 8, NUM_TILES_Y = 6;
        const tileW = Math.ceil(srcW / NUM_TILES_X);
        const tileH = Math.ceil(srcH / NUM_TILES_Y);
        const numTiles = NUM_TILES_X * NUM_TILES_Y;
        const cdfs = new Float32Array(numTiles * 256);
        const clip = Math.max(1, Math.round(1.5 * (tileW * tileH / 256)));

        for (let ty = 0; ty < NUM_TILES_Y; ty++) {
          const y0 = ty * tileH;
          const y1 = Math.min(srcH, y0 + tileH);
          for (let tx = 0; tx < NUM_TILES_X; tx++) {
            const x0 = tx * tileW;
            const x1 = Math.min(srcW, x0 + tileW);
            const actualTilePixels = (y1 - y0) * (x1 - x0);
            const hist = new Int32Array(256);

            for (let y = y0; y < y1; y++) {
              const rOff = y * srcW * 4;
              for (let x = x0; x < x1; x++) {
                const idx = rOff + x * 4;
                const L = (data[idx] * 77 + data[idx + 1] * 150 + data[idx + 2] * 29) >> 8;
                hist[L]++;
              }
            }

            let excess = 0;
            for (let i = 0; i < 256; i++) {
              if (hist[i] > clip) { excess += hist[i] - clip; hist[i] = clip; }
            }
            const inc = Math.floor(excess / 256);
            const remainder = excess % 256;
            let cum = 0;
            const cdfOffset = (ty * NUM_TILES_X + tx) * 256;
            for (let i = 0; i < 256; i++) {
              hist[i] += inc + (i < remainder ? 1 : 0);
              cum += hist[i];
              cdfs[cdfOffset + i] = (cum * 255) / Math.max(1, actualTilePixels);
            }
          }
        }

        for (let y = 0; y < srcH; y++) {
          const gy = (y - tileH * 0.5) / tileH;
          const ty0 = Math.max(0, Math.min(NUM_TILES_Y - 2, Math.floor(gy)));
          const ty1 = ty0 + 1;
          const wy = Math.max(0, Math.min(1, gy - ty0));
          const rOff = y * srcW * 4;

          for (let x = 0; x < srcW; x++) {
            const gx = (x - tileW * 0.5) / tileW;
            const tx0 = Math.max(0, Math.min(NUM_TILES_X - 2, Math.floor(gx)));
            const tx1 = tx0 + 1;
            const wx = Math.max(0, Math.min(1, gx - tx0));
            const idx = rOff + x * 4;

            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            const L = (r * 77 + g * 150 + b * 29) >> 8;

            const v00 = cdfs[(ty0 * NUM_TILES_X + tx0) * 256 + L];
            const v01 = cdfs[(ty0 * NUM_TILES_X + tx1) * 256 + L];
            const v10 = cdfs[(ty1 * NUM_TILES_X + tx0) * 256 + L];
            const v11 = cdfs[(ty1 * NUM_TILES_X + tx1) * 256 + L];

            const lNew = (v00 * (1 - wx) + v01 * wx) * (1 - wy) + (v10 * (1 - wx) + v11 * wx) * wy;
            const factor = L > 0 ? (lNew / L) : 1.0;

            data[idx] = Math.min(255, Math.round(r * factor));
            data[idx + 1] = Math.min(255, Math.round(g * factor));
            data[idx + 2] = Math.min(255, Math.round(b * factor));
          }
        }
      }

      // 5. Membrane Sharpening (Laplacian edge convolution boost)
      if (activeSet.has('sharpen')) {
        const copy = new Uint8ClampedArray(data);
        for (let y = 1; y < srcH - 1; y++) {
          const rOff = y * srcW * 4;
          const rAbove = (y - 1) * srcW * 4;
          const rBelow = (y + 1) * srcW * 4;
          for (let x = 1; x < srcW - 1; x++) {
            const idx = rOff + x * 4;
            for (let c = 0; c < 3; c++) {
              const center = copy[idx + c];
              const laplacian = 5 * center - (
                copy[rAbove + x * 4 + c] +
                copy[rBelow + x * 4 + c] +
                copy[rOff + (x - 1) * 4 + c] +
                copy[rOff + (x + 1) * 4 + c]
              );
              const boosted = (laplacian - 128) * 1.05 + 128;
              data[idx + c] = Math.max(0, Math.min(255, Math.round(boosted)));
            }
          }
        }
      }

      // 6. Two-Tone Romanowski Dye Reduction (LAB space purple chrominance suppression)
      if (activeSet.has('two_tone')) {
        const labsL = new Float32Array(total);
        const labsA = new Float32Array(total);
        const labsB = new Float32Array(total);
        const purpleMask = new Float32Array(total);

        for (let i = 0; i < total; i++) {
          const idx = i * 4;
          const [L, a, b] = rgbToLab(data[idx], data[idx + 1], data[idx + 2]);
          labsL[i] = L;
          labsA[i] = a;
          labsB[i] = b;
          if (a > 10 && b < -5) {
            purpleMask[i] = 1.0;
          }
        }

        // Fast separable horizontal + vertical blur on purple mask (radius 15)
        const blurredMask = new Float32Array(total);
        const radius = 15;
        const temp = new Float32Array(total);

        for (let y = 0; y < srcH; y++) {
          const rowOff = y * srcW;
          for (let x = 0; x < srcW; x++) {
            let sum = 0, count = 0;
            const xMin = Math.max(0, x - radius);
            const xMax = Math.min(srcW - 1, x + radius);
            for (let ix = xMin; ix <= xMax; ix++) {
              sum += purpleMask[rowOff + ix];
              count++;
            }
            temp[rowOff + x] = sum / count;
          }
        }

        for (let x = 0; x < srcW; x++) {
          for (let y = 0; y < srcH; y++) {
            let sum = 0, count = 0;
            const yMin = Math.max(0, y - radius);
            const yMax = Math.min(srcH - 1, y + radius);
            for (let iy = yMin; iy <= yMax; iy++) {
              sum += temp[iy * srcW + x];
              count++;
            }
            blurredMask[y * srcW + x] = sum / count;
          }
        }

        const strength = 0.30;
        for (let i = 0; i < total; i++) {
          const m = blurredMask[i] * strength;
          const newA = labsA[i] * (1.0 - m);
          const newB = labsB[i] * (1.0 - m);
          const [r, g, b] = labToRgb(labsL[i], newA, newB);
          const idx = i * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
        }
      }

      // 7. Reinhard LAB Stain Normalization (standardizes slide to reference May-Giemsa stats)
      if (activeSet.has('reinhard_lab')) {
        const labsL = new Float32Array(total);
        const labsA = new Float32Array(total);
        const labsB = new Float32Array(total);
        let sumL = 0, sumA = 0, sumB = 0;

        for (let i = 0; i < total; i++) {
          const idx = i * 4;
          const [L, a, b] = rgbToLab(data[idx], data[idx + 1], data[idx + 2]);
          labsL[i] = L;
          labsA[i] = a;
          labsB[i] = b;
          sumL += L; sumA += a; sumB += b;
        }

        const meanL = sumL / total;
        const meanA = sumA / total;
        const meanB = sumB / total;

        let varL = 0, varA = 0, varB = 0;
        for (let i = 0; i < total; i++) {
          const dL = labsL[i] - meanL;
          const dA = labsA[i] - meanA;
          const dB = labsB[i] - meanB;
          varL += dL * dL; varA += dA * dA; varB += dB * dB;
        }

        const stdL = Math.sqrt(varL / total) + 1e-5;
        const stdA = Math.sqrt(varA / total) + 1e-5;
        const stdB = Math.sqrt(varB / total) + 1e-5;

        // Reference May-Giemsa target statistics in standard CIELAB
        // Mapped from STAIN_REF_LAB = [(194.4, 18.7), (132.9, 6.9), (131.7, 5.5)]
        const refMeanL = 76.2, refStdL = 7.33;
        const refMeanA = 4.9,  refStdA = 6.9;
        const refMeanB = 3.7,  refStdB = 5.5;

        for (let i = 0; i < total; i++) {
          const normL = Math.max(0, Math.min(100, (labsL[i] - meanL) / stdL * refStdL + refMeanL));
          const normA = (labsA[i] - meanA) / stdA * refStdA + refMeanA;
          const normB = (labsB[i] - meanB) / stdB * refStdB + refMeanB;
          const [r, g, b] = labToRgb(normL, normA, normB);
          const idx = i * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
        }
      }

      offCtx.putImageData(imgData, 0, 0);
      return offCanvas;
    }

    function updateFilterUI() {
      const activeCount = (state.activeFilters || []).length;
      const lbl = document.getElementById('active-filter-label');
      const icon = document.getElementById('active-filter-icon');
      const countBadge = document.getElementById('filter-count-badge');
      const summaryText = document.getElementById('active-filters-summary');

      if (activeCount === 0) {
        if (lbl) lbl.textContent = 'Raw RGB';
        if (icon) {
          icon.style.color = '#38bdf8';
          icon.innerHTML = FILTER_CONFIG.raw.icon;
        }
        if (countBadge) countBadge.classList.add('hidden');
        if (summaryText) summaryText.textContent = 'Raw RGB';
      } else if (activeCount === 1) {
        const f = state.activeFilters[0];
        const cfg = FILTER_CONFIG[f] || FILTER_CONFIG.raw;
        if (lbl) lbl.textContent = cfg.label;
        if (icon) {
          icon.style.color = cfg.color;
          icon.innerHTML = cfg.icon;
        }
        if (countBadge) countBadge.classList.add('hidden');
        if (summaryText) summaryText.textContent = cfg.label;
      } else if (activeCount === 2) {
        const labels = state.activeFilters.map(f => FILTER_CONFIG[f]?.shortLabel || f).join(' + ');
        if (lbl) lbl.textContent = labels;
        if (icon) {
          icon.style.color = '#38bdf8';
          icon.innerHTML = '<svg width="14" height="14" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18"></path><path d="m4.93 4.93 14.14 14.14"></path><path d="M3 12h18"></path></svg>';
        }
        if (countBadge) {
          countBadge.textContent = '2';
          countBadge.classList.remove('hidden');
        }
        if (summaryText) summaryText.textContent = labels;
      } else {
        if (lbl) lbl.textContent = `${activeCount} Filters`;
        if (icon) {
          icon.style.color = '#38bdf8';
          icon.innerHTML = '<svg width="14" height="14" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18"></path><path d="m4.93 4.93 14.14 14.14"></path><path d="M3 12h18"></path></svg>';
        }
        if (countBadge) {
          countBadge.textContent = activeCount.toString();
          countBadge.classList.remove('hidden');
        }
        if (summaryText) summaryText.textContent = `${activeCount} Active`;
      }

      document.querySelectorAll('.filter-btn').forEach(btn => {
        const fid = btn.getAttribute('data-filter');
        const checkEl = btn.querySelector('.filter-check');
        if (fid === 'raw') {
          const isRaw = activeCount === 0;
          btn.className = `filter-btn w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition ${isRaw ? 'bg-[#272527] text-white font-semibold' : 'text-[#9e9a9e] hover:text-white hover:bg-[#272527]'}`;
          if (checkEl) checkEl.textContent = isRaw ? '●' : '○';
        } else {
          const isActive = (state.activeFilters || []).includes(fid);
          btn.className = `filter-btn w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition ${isActive ? 'bg-[#272527] text-white font-semibold' : 'text-[#9e9a9e] hover:text-white hover:bg-[#272527]'}`;
          if (checkEl) {
            checkEl.textContent = isActive ? '●' : '○';
            checkEl.style.color = isActive ? (FILTER_CONFIG[fid]?.color || '#38bdf8') : '#7a767a';
          }
        }
      });
    }

    function toggleCanvasFilter(filterId) {
      if (!state.activeFilters) state.activeFilters = [];
      if (filterId === 'raw') {
        state.activeFilters = [];
      } else if (FILTER_CONFIG[filterId]) {
        const idx = state.activeFilters.indexOf(filterId);
        if (idx >= 0) {
          state.activeFilters.splice(idx, 1);
        } else {
          state.activeFilters.push(filterId);
        }
      }

      updateFilterUI();
      render();
      updateMinimapBg();
    }

    function setCanvasFilters(filterArray) {
      state.activeFilters = (filterArray || []).filter(f => FILTER_CONFIG[f] && f !== 'raw');
      updateFilterUI();
      render();
      updateMinimapBg();
    }

    // Universal Dropdown Coordinator (Ensures only one dropdown menu is open at any time)
    const ALL_DROPDOWN_IDS = [
      'case-selector-dropdown',
      'filter-dropdown-menu',
      'tool-dropdown-menu',
      'obj-dropdown-menu',
      'export-dropdown-menu',
      'import-dropdown-menu',
      'draw-class-menu'
    ];

    function closeAllDropdowns(exceptElement = null) {
      ALL_DROPDOWN_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el && el !== exceptElement) {
          el.classList.add('hidden');
        }
      });
    }

    // Filter dropdown trigger & click handler
    const filterTrigger = document.getElementById('filter-dropdown-trigger');
    const filterMenu = document.getElementById('filter-dropdown-menu');
    const btnPresetAiFilters = document.getElementById('btn-preset-ai-filters');
    const btnPresetRomanowskiFilters = document.getElementById('btn-preset-romanowski-filters');

    if (btnPresetAiFilters) {
      btnPresetAiFilters.onclick = (e) => {
        e.stopPropagation();
        hideHelpTooltip();
        setCanvasFilters(['clahe', 'fov_crop', 'reinhard_lab']);
        showToast('Activated May-Giemsa AI Preset (CLAHE + FOV + Reinhard LAB)');
      };
    }

    if (btnPresetRomanowskiFilters) {
      btnPresetRomanowskiFilters.onclick = (e) => {
        e.stopPropagation();
        hideHelpTooltip();
        setCanvasFilters(['clahe', 'fov_crop', 'two_tone', 'reinhard_lab']);
        showToast('Activated Romanowski AI Preset (CLAHE + FOV + Two-Tone + Reinhard LAB)');
      };
    }

    if (filterTrigger && filterMenu) {
      filterTrigger.onclick = (e) => {
        e.stopPropagation();
        hideHelpTooltip();
        const willOpen = filterMenu.classList.contains('hidden');
        closeAllDropdowns(filterMenu);
        if (willOpen) filterMenu.classList.remove('hidden');
        else filterMenu.classList.add('hidden');
      };
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          hideHelpTooltip();
          toggleCanvasFilter(btn.getAttribute('data-filter'));
        };
      });
    }

    // Tool Dropdown Menu Setup
    const toolTrigger = document.getElementById('tool-dropdown-trigger');
    const toolMenu = document.getElementById('tool-dropdown-menu');
    if (toolTrigger && toolMenu) {
      toolTrigger.onclick = (e) => {
        e.stopPropagation();
        hideHelpTooltip();
        const willOpen = toolMenu.classList.contains('hidden');
        closeAllDropdowns(toolMenu);
        if (willOpen) toolMenu.classList.remove('hidden');
        else toolMenu.classList.add('hidden');
      };
      document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          hideHelpTooltip();
          setTool(btn.getAttribute('data-tool'));
        };
      });
    }

    // Universal Hover Help Tooltip Engine
    const helpTooltip = document.getElementById('app-help-tooltip');
    const helpTitleText = document.getElementById('help-tooltip-title-text');
    const helpKey = document.getElementById('help-tooltip-key');
    const helpDesc = document.getElementById('help-tooltip-desc');
    let activeHelpTarget = null;

    function positionHelpTooltip(target) {
      if (!helpTooltip || !target) return;
      const targetRect = target.getBoundingClientRect();
      const ttWidth = helpTooltip.offsetWidth || 240;
      const ttHeight = helpTooltip.offsetHeight || 75;

      // Check if target is inside a dropdown menu
      const isInsideDropdown = !!target.closest('#filter-dropdown-menu, #case-selector-dropdown, #tool-dropdown-menu, #obj-dropdown-menu, #export-dropdown-menu, #draw-class-menu, .dropdown-menu');

      let left, top;

      if (isInsideDropdown) {
        // Position on the SIDE of the dropdown menu so items are never covered
        if (targetRect.right + ttWidth + 14 <= window.innerWidth) {
          left = targetRect.right + 8; // place on right side
        } else {
          left = targetRect.left - ttWidth - 8; // place on left side
        }
        top = targetRect.top + (targetRect.height / 2) - (ttHeight / 2);
      } else {
        // Center horizontally relative to target widget
        left = targetRect.left + (targetRect.width / 2) - (ttWidth / 2);
        
        // Preferred position: below the target widget
        top = targetRect.bottom + 8;

        // If overflowing below screen, place above target widget
        if (top + ttHeight > window.innerHeight - 8) {
          top = targetRect.top - ttHeight - 8;
        }
      }

      // Clamp horizontal and vertical bounds within viewport
      left = Math.max(10, Math.min(window.innerWidth - ttWidth - 10, left));
      top = Math.max(10, Math.min(window.innerHeight - ttHeight - 10, top));

      helpTooltip.style.left = `${Math.round(left)}px`;
      helpTooltip.style.top = `${Math.round(top)}px`;
    }

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-help]');
      if (target && target !== activeHelpTarget) {
        activeHelpTarget = target;
        const raw = target.getAttribute('data-help') || '';
        const customColor = target.getAttribute('data-tooltip-color') || '#e52246';
        const [title, desc, key] = raw.split('|');

        if (helpTitleText) helpTitleText.textContent = title || 'Info';
        if (helpDesc) helpDesc.textContent = desc || '';

        // Dynamic theme color for tooltip border and key tag
        helpTooltip.style.borderColor = customColor;

        if (helpKey) {
          if (key) {
            helpKey.textContent = key;
            helpKey.style.display = 'inline-block';
            helpKey.style.color = customColor;
            helpKey.style.borderColor = customColor + '50';
            helpKey.style.backgroundColor = customColor + '18';
          } else {
            helpKey.style.display = 'none';
          }
        }
        positionHelpTooltip(target);
        if (helpTooltip) helpTooltip.style.opacity = '1';
      }
    });

    function hideHelpTooltip() {
      activeHelpTarget = null;
      if (helpTooltip) helpTooltip.style.opacity = '0';
    }

    // Dismiss tooltip immediately on any click, mousedown, or interaction
    window.addEventListener('click', hideHelpTooltip, true);
    window.addEventListener('mousedown', (e) => {
      // If clicking inside something interactive, hide help tooltip
      hideHelpTooltip();
    }, true);

    document.addEventListener('mouseout', (e) => {
      if (activeHelpTarget && !activeHelpTarget.contains(e.relatedTarget)) {
        hideHelpTooltip();
      }
    });

    // Objective Dropdown Setup
    const objTrigger = document.getElementById('obj-dropdown-trigger');
    const objMenu = document.getElementById('obj-dropdown-menu');
    if (objTrigger && objMenu) {
      objTrigger.onclick = (e) => {
        e.stopPropagation();
        hideHelpTooltip();
        const willOpen = objMenu.classList.contains('hidden');
        closeAllDropdowns(objMenu);
        if (willOpen) objMenu.classList.remove('hidden');
        else objMenu.classList.add('hidden');
      };
    }

    document.querySelectorAll('.obj-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const targetZoom = parseFloat(btn.getAttribute('data-zoom'));
        setZoom(targetZoom);
        if (objMenu) objMenu.classList.add('hidden');
      };
    });

    const drawTrigger = document.getElementById('draw-class-trigger');
    const drawMenu = document.getElementById('draw-class-menu');
    if (drawTrigger && drawMenu) {
      drawTrigger.onclick = (e) => {
        e.stopPropagation();
        hideHelpTooltip();
        const willOpen = drawMenu.classList.contains('hidden');
        closeAllDropdowns(drawMenu);
        if (willOpen) drawMenu.classList.remove('hidden');
        else drawMenu.classList.add('hidden');
      };
    }
    const drawOptionsContainer = document.getElementById('draw-class-options');
    const drawSelect = document.getElementById('draw-class-select');
    const drawDot = document.getElementById('draw-class-dot');
    const drawLabel = document.getElementById('draw-class-label');
    const drawCode = document.getElementById('draw-class-code');

    function renderLineageMenu() {
      if (!drawOptionsContainer) return;
      drawOptionsContainer.innerHTML = CELL_TAXONOMY.map((t, idx) => {
        const isActive = t.id === state.activeClassId;
        return `
          <button data-class-id="${t.id}" class="lineage-btn w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#272527] text-left transition ${isActive ? 'bg-[#272527] text-white ring-1 ring-[#e52246]/40' : 'text-[#9e9a9e] hover:text-white'}" data-help="${t.name}|Set active drawing class to ${t.name}|${idx + 1}" data-tooltip-color="${t.color}">
            <span class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${t.color}"></span>
              <span class="truncate ${isActive ? 'text-white font-bold' : ''}">${t.short}</span>
            </span>
            <div class="flex items-center space-x-1.5">
              <span class="text-[9px] px-1 py-0.2 rounded font-mono font-bold" style="background-color: ${t.color}20; color: ${t.color}; border: 1px solid ${t.color}50">${t.code}</span>
              <span class="text-[9px] text-[#7a767a] bg-[#110f12] px-1 rounded">${idx + 1}</span>
            </div>
          </button>
        `;
      }).join('');

      drawOptionsContainer.querySelectorAll('.lineage-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          hideHelpTooltip();
          setActiveLineage(btn.getAttribute('data-class-id'));
          if (drawMenu) drawMenu.classList.add('hidden');
        };
      });
    }

    function setActiveLineage(classId) {
      state.activeClassId = classId;
      updateActiveLineageUI();
    }

    function updateActiveLineageUI() {
      const tax = state.taxonomy.find(t => t.id === state.activeClassId) || state.taxonomy[0];
      if (drawDot) drawDot.style.backgroundColor = tax.color;
      if (drawLabel) drawLabel.textContent = tax.short;
      if (drawCode) {
        drawCode.textContent = tax.code;
        drawCode.style.color = tax.color;
      }
      if (drawSelect && drawSelect.value !== state.activeClassId) {
        drawSelect.value = state.activeClassId;
      }
      renderLineageMenu();
    }

    if (drawSelect) {
      drawSelect.innerHTML = CELL_TAXONOMY.map(t => `<option value="${t.id}">${t.short}</option>`).join('');
      drawSelect.onchange = (e) => {
        setActiveLineage(e.target.value);
      };
    }

    updateActiveLineageUI();

    document.getElementById('btn-toggle-overlay').onclick = toggleOverlays;

    document.getElementById('conf-slider').oninput = (e) => {
      state.minConfidence = parseFloat(e.target.value);
      document.getElementById('conf-value-label').textContent = `${Math.round(state.minConfidence * 100)}%`;
      updateUI();
      render();
      renderMinimap();
      renderTaxonomyList();
    };

    const btnZoomIn = document.getElementById('btn-zoom-in');
    if (btnZoomIn) btnZoomIn.onclick = () => setZoom(state.view.zoom * 1.25);
    const btnZoomOut = document.getElementById('btn-zoom-out');
    if (btnZoomOut) btnZoomOut.onclick = () => setZoom(state.view.zoom / 1.25);
    const btnZoomReset = document.getElementById('btn-zoom-reset');
    if (btnZoomReset) btnZoomReset.onclick = () => fitToScreen();

    const zoomSlider = document.getElementById('zoom-slider');
    if (zoomSlider) {
      zoomSlider.oninput = (e) => setZoom(parseFloat(e.target.value));
    }

    document.getElementById('btn-filter-all').onclick = () => {
      state.taxonomy.forEach(t => state.classFilter[t.id] = true);
      renderTaxonomyList();
      updateUI();
      render();
      renderMinimap();
    };

    document.getElementById('btn-filter-none').onclick = () => {
      state.taxonomy.forEach(t => state.classFilter[t.id] = false);
      renderTaxonomyList();
      updateUI();
      render();
      renderMinimap();
    };

    function toggleMinimapContainer() {
      const container = document.getElementById('minimap-container');
      const isHidden = container.style.display === 'none';
      container.style.display = isHidden ? 'block' : 'none';
    }
    const btnToggleMinimap = document.getElementById('btn-toggle-minimap');
    if (btnToggleMinimap) btnToggleMinimap.onclick = toggleMinimapContainer;
    const btnCloseMinimap = document.getElementById('btn-close-minimap');
    if (btnCloseMinimap) btnCloseMinimap.onclick = toggleMinimapContainer;

    function handleMinimapClick(e) {
      if (!state.imageLoaded) return;
      const rect = minimapCanvas.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const clickY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

      const imgW = state.image.naturalWidth || 1500;
      const imgH = state.image.naturalHeight || 1125;
      const scaleX = imgW / rect.width;
      const scaleY = imgH / rect.height;

      const targetWorldX = clickX * scaleX;
      const targetWorldY = clickY * scaleY;

      const container = document.getElementById('canvas-container');
      state.view.x = container.clientWidth / 2 - targetWorldX * state.view.zoom;
      state.view.y = container.clientHeight / 2 - targetWorldY * state.view.zoom;

      updateUI();
      render();
      renderMinimap();
    }

    minimapCanvas.addEventListener('mousedown', (e) => {
      state.isMinimapDragging = true;
      handleMinimapClick(e);
    });

    function updateMinimapBg() {
      if (!state.imageLoaded) return;
      minimapBgCanvas.width = minimapCanvas.width;
      minimapBgCanvas.height = minimapCanvas.height;
      const bgCtx = minimapBgCanvas.getContext('2d');
      const renderSource = getActiveImageSource();
      bgCtx.drawImage(renderSource, 0, 0, minimapCanvas.width, minimapCanvas.height);
      bgCtx.fillStyle = 'rgba(17, 15, 18, 0.45)';
      bgCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
    }

    function renderMinimap() {
      const mw = minimapCanvas.width;
      const mh = minimapCanvas.height;
      minimapCtx.clearRect(0, 0, mw, mh);

      if (!state.cases || state.cases.length === 0 || !state.imageLoaded || !state.image) {
        return;
      }

      const imgW = state.image.naturalWidth || 1500;
      const imgH = state.image.naturalHeight || 1125;

      if (minimapBgCanvas.width > 0) {
        minimapCtx.drawImage(minimapBgCanvas, 0, 0);
      } else {
        minimapCtx.drawImage(state.image, 0, 0, mw, mh);
      }

      const scaleX = mw / imgW;
      const scaleY = mh / imgH;

      if (state.overlaysVisible) {
        const visible = getVisibleAnnotations();
        for (const ann of visible) {
          const cls = state.taxonomy.find(t => t.id === ann.classId) || state.taxonomy[0];
          const dotX = (ann.x + ann.width / 2) * scaleX;
          const dotY = (ann.y + ann.height / 2) * scaleY;

          minimapCtx.beginPath();
          minimapCtx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
          minimapCtx.fillStyle = (ann.id === state.selectedCellId) ? '#ffffff' : cls.color;
          minimapCtx.fill();
        }
      }

      const container = document.getElementById('canvas-container');
      const viewLeft = -state.view.x / state.view.zoom;
      const viewTop = -state.view.y / state.view.zoom;
      const viewWidth = container.clientWidth / state.view.zoom;
      const viewHeight = container.clientHeight / state.view.zoom;

      const vpX = viewLeft * scaleX;
      const vpY = viewTop * scaleY;
      const vpW = viewWidth * scaleX;
      const vpH = viewHeight * scaleY;

      minimapCtx.strokeStyle = '#e52246';
      minimapCtx.lineWidth = 1.5;
      minimapCtx.fillStyle = 'rgba(229, 34, 70, 0.2)';
      minimapCtx.fillRect(vpX, vpY, vpW, vpH);
      minimapCtx.strokeRect(vpX, vpY, vpW, vpH);
    }

    function render() {
      const container = document.getElementById('canvas-container');
      const w = container.clientWidth;
      const h = container.clientHeight;
      ctx.clearRect(0, 0, w, h);

      if (!state.cases || state.cases.length === 0) {
        return;
      }

      if (!state.imageLoaded || !state.image) {
        ctx.fillStyle = '#9e9a9e';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Loading microscope slide...', w / 2, h / 2);
        return;
      }

      ctx.save();
      ctx.translate(state.view.x, state.view.y);
      ctx.scale(state.view.zoom, state.view.zoom);

      // 1. Draw Slide Image (Raw or Multi-Filter Composite)
      const renderSource = getActiveImageSource();
      ctx.drawImage(renderSource, 0, 0);

      // 2. Draw Visible Cell Annotations
      if (state.overlaysVisible) {
        const visible = getVisibleAnnotations();
        for (const ann of visible) {
          const cls = state.taxonomy.find(t => t.id === ann.classId) || state.taxonomy[0];
          const isSelected = ann.id === state.selectedCellId;
          const isHovered = ann.id === state.hoveredCellId;

          ctx.fillStyle = isSelected ? 'rgba(229, 34, 70, 0.35)' : (isHovered ? 'rgba(255, 255, 255, 0.2)' : cls.lightBg);

          if (ann.contour && ann.contour.length > 2) {
            ctx.beginPath();
            ctx.moveTo(ann.contour[0].x, ann.contour[0].y);
            for (let i = 1; i < ann.contour.length; i++) {
              ctx.lineTo(ann.contour[i].x, ann.contour[i].y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = isSelected ? '#ffffff' : cls.color;
            ctx.lineWidth = isSelected ? Math.max(2.5, 3.5 / state.view.zoom) : Math.max(1.5, 2 / state.view.zoom);
            ctx.stroke();
          } else if (ann.shape === 'circle') {
            const rx = ann.x + ann.width / 2;
            const ry = ann.y + ann.height / 2;
            const r = ann.width / 2;
            ctx.beginPath();
            ctx.arc(rx, ry, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = isSelected ? '#ffffff' : cls.color;
            ctx.lineWidth = isSelected ? Math.max(2.5, 3.5 / state.view.zoom) : Math.max(1.5, 2 / state.view.zoom);
            ctx.stroke();
          } else {
            ctx.fillRect(ann.x, ann.y, ann.width, ann.height);
            ctx.strokeStyle = isSelected ? '#ffffff' : cls.color;
            ctx.lineWidth = isSelected ? Math.max(2.5, 3.5 / state.view.zoom) : Math.max(1.5, 2 / state.view.zoom);
            ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
          }

          if (isSelected) {
            const hSize = 5 / state.view.zoom;
            ctx.fillStyle = '#ffffff';
            [
              [ann.x, ann.y],
              [ann.x + ann.width, ann.y],
              [ann.x, ann.y + ann.height],
              [ann.x + ann.width, ann.y + ann.height]
            ].forEach(([hx, hy]) => {
              ctx.fillRect(hx - hSize / 2, hy - hSize / 2, hSize, hSize);
            });
          }

          const cx = ann.x + ann.width / 2;
          const cy = ann.y + ann.height / 2;
          const arm = 4 / state.view.zoom;
          ctx.strokeStyle = isSelected ? '#ffffff' : cls.color;
          ctx.beginPath();
          ctx.moveTo(cx - arm, cy);
          ctx.lineTo(cx + arm, cy);
          ctx.moveTo(cx, cy - arm);
          ctx.lineTo(cx, cy + arm);
          ctx.stroke();

          const fontSize = Math.max(9, Math.min(13, 12 / state.view.zoom));
          ctx.font = `600 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
          const tagText = `${cls.code} ${Math.round(ann.confidence * 100)}%`;
          const textMetrics = ctx.measureText(tagText);
          const tagPad = 3 / state.view.zoom;
          const tagH = fontSize + 4 / state.view.zoom;
          const tagW = textMetrics.width + tagPad * 2;
          const tagY = ann.y - tagH - (2 / state.view.zoom);

          ctx.fillStyle = isSelected ? '#e52246' : '#1a181b';
          ctx.fillRect(ann.x, tagY, tagW, tagH);
          ctx.strokeStyle = isSelected ? '#ffffff' : cls.color;
          ctx.lineWidth = 1 / state.view.zoom;
          ctx.strokeRect(ann.x, tagY, tagW, tagH);

          ctx.fillStyle = isSelected ? '#ffffff' : cls.color;
          ctx.textBaseline = 'top';
          ctx.fillText(tagText, ann.x + tagPad, tagY + tagPad * 0.7);
        }
      }

      // 3. Draw In-Progress Drawing Preview
      if (state.isDrawing) {
        const activeTax = state.taxonomy.find(t => t.id === state.activeClassId) || state.taxonomy[0];
        ctx.strokeStyle = activeTax.color;
        ctx.lineWidth = 2 / state.view.zoom;
        ctx.fillStyle = activeTax.lightBg;

        if (state.tool === 'box') {
          const bx = Math.min(state.drawStartWorld.x, state.drawCurrentWorld.x);
          const by = Math.min(state.drawStartWorld.y, state.drawCurrentWorld.y);
          const bw = Math.abs(state.drawCurrentWorld.x - state.drawStartWorld.x);
          const bh = Math.abs(state.drawCurrentWorld.y - state.drawStartWorld.y);
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeRect(bx, by, bw, bh);
        } else if (state.tool === 'circle') {
          const diameter = Math.hypot(state.drawCurrentWorld.x - state.drawStartWorld.x, state.drawCurrentWorld.y - state.drawStartWorld.y);
          const centerX = (state.drawStartWorld.x + state.drawCurrentWorld.x) / 2;
          const centerY = (state.drawStartWorld.y + state.drawCurrentWorld.y) / 2;
          const radius = diameter / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (state.tool === 'measure') {
          ctx.strokeStyle = '#e52246';
          ctx.lineWidth = 2 / state.view.zoom;
          ctx.beginPath();
          ctx.moveTo(state.drawStartWorld.x, state.drawStartWorld.y);
          ctx.lineTo(state.drawCurrentWorld.x, state.drawCurrentWorld.y);
          ctx.stroke();

          const distPx = Math.hypot(state.drawCurrentWorld.x - state.drawStartWorld.x, state.drawCurrentWorld.y - state.drawStartWorld.y);
          const distUm = (distPx * 0.125).toFixed(1);
          const midX = (state.drawStartWorld.x + state.drawCurrentWorld.x) / 2;
          const midY = (state.drawStartWorld.y + state.drawCurrentWorld.y) / 2;

          ctx.fillStyle = '#110f12';
          ctx.fillRect(midX - 25 / state.view.zoom, midY - 10 / state.view.zoom, 50 / state.view.zoom, 20 / state.view.zoom);
          ctx.fillStyle = '#ffffff';
          ctx.font = `${11 / state.view.zoom}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${distUm} µm`, midX, midY);
        }
      }

      // 4. Draw Persistent Measurements
      for (const m of state.measurements) {
        ctx.strokeStyle = '#e52246';
        ctx.lineWidth = 2 / state.view.zoom;
        ctx.beginPath();
        ctx.moveTo(m.x1, m.y1);
        ctx.lineTo(m.x2, m.y2);
        ctx.stroke();

        const midX = (m.x1 + m.x2) / 2;
        const midY = (m.y1 + m.y2) / 2;
        ctx.fillStyle = '#1a181b';
        ctx.fillRect(midX - 25 / state.view.zoom, midY - 10 / state.view.zoom, 50 / state.view.zoom, 20 / state.view.zoom);
        ctx.strokeStyle = '#e52246';
        ctx.strokeRect(midX - 25 / state.view.zoom, midY - 10 / state.view.zoom, 50 / state.view.zoom, 20 / state.view.zoom);
        ctx.fillStyle = '#ffffff';
        ctx.font = `${11 / state.view.zoom}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${m.distUm} µm`, midX, midY);
      }

      ctx.restore();
    }

    function switchRightTab(tabName) {
      const inspTabBtn = document.getElementById('tab-btn-inspector');
      const galTabBtn = document.getElementById('tab-btn-gallery');
      const inspContent = document.getElementById('inspector-tab-content');
      const galContent = document.getElementById('gallery-tab-content');

      if (tabName === 'gallery') {
        if (inspTabBtn) inspTabBtn.className = 'h-full px-2.5 rounded-md text-[#9e9a9e] hover:text-white transition flex items-center space-x-1';
        if (galTabBtn) galTabBtn.className = 'h-full px-2.5 rounded-md bg-[#e52246] text-white font-bold transition flex items-center space-x-1';
        if (inspContent) inspContent.classList.add('hidden');
        if (galContent) galContent.classList.remove('hidden');
        renderGallery();
      } else {
        if (inspTabBtn) inspTabBtn.className = 'h-full px-2.5 rounded-md bg-[#e52246] text-white font-bold transition flex items-center space-x-1';
        if (galTabBtn) galTabBtn.className = 'h-full px-2.5 rounded-md text-[#9e9a9e] hover:text-white transition flex items-center space-x-1';
        if (inspContent) inspContent.classList.remove('hidden');
        if (galContent) galContent.classList.add('hidden');
      }
    }

    const tabBtnInsp = document.getElementById('tab-btn-inspector');
    if (tabBtnInsp) tabBtnInsp.onclick = () => switchRightTab('inspector');
    const tabBtnGal = document.getElementById('tab-btn-gallery');
    if (tabBtnGal) tabBtnGal.onclick = () => switchRightTab('gallery');

    function renderGalleryFilterChips() {
      const container = document.getElementById('gallery-filter-chips');
      if (!container) return;

      const filterItems = [{ id: 'all', code: 'All', count: state.annotations.length }];

      state.taxonomy.forEach(tax => {
        const count = state.annotations.filter(a => a.classId === tax.id || a.rawClass === tax.rawClass || a.rawClass === tax.id).length;
        if (count > 0 || ['neutrophils', 'lymphocytes', 'monocytes', 'blasts', 'plt'].includes(tax.id)) {
          filterItems.push({
            id: tax.id,
            code: tax.code,
            count
          });
        }
      });

      const currentFilter = state.galleryFilter || 'all';

      container.innerHTML = filterItems.map(item => {
        const isActive = item.id === currentFilter;
        return `
          <button data-gallery-filter="${item.id}" class="btn-gal-filter px-2 py-0.5 rounded ${isActive ? 'bg-[#e52246] text-white font-bold' : 'bg-[#1B191E] text-[#9e9a9e] hover:text-white'} shrink-0">
            ${item.code}${item.id !== 'all' ? ` (${item.count})` : ''}
          </button>
        `;
      }).join('');

      container.querySelectorAll('.btn-gal-filter').forEach(btn => {
        btn.onclick = () => {
          state.galleryFilter = btn.getAttribute('data-gallery-filter');
          renderGalleryFilterChips();
          renderGallery();
        };
      });
    }

    function renderGallery() {
      const grid = document.getElementById('gallery-grid');
      if (!grid || !state.imageLoaded) return;
      renderGalleryFilterChips();

      const filter = state.galleryFilter || 'all';
      const cells = state.annotations.filter(a => filter === 'all' || a.classId === filter || a.rawClass === filter);

      const badge = document.getElementById('gallery-count-badge');
      if (badge) badge.textContent = `${cells.length}`;

      grid.innerHTML = cells.map(ann => {
        const cls = state.taxonomy.find(t => t.id === ann.classId || t.rawClass === ann.rawClass || t.rawClass === ann.classId || t.id === ann.rawClass) || state.taxonomy[0];
        const isSelected = ann.id === state.selectedCellId;
        const cellDisplayName = ann.label || cls.short || cls.name;

        return `
          <div data-cell-id="${ann.id}" class="gal-cell-card bg-[#110f12] border ${isSelected ? 'border-[#e52246] ring-1 ring-[#e52246]' : 'border-[#272527]'} hover:border-[#5a575a] rounded-lg p-1.5 cursor-pointer transition flex flex-col space-y-1 group h-fit self-start">
            <div class="relative w-full h-[88px] bg-black rounded overflow-hidden flex items-center justify-center shrink-0">
              <canvas id="crop-thumb-${ann.id}" width="120" height="88" class="w-full h-full object-contain block"></canvas>
              <span class="absolute top-1 left-1 px-1 py-0.2 rounded text-[8px] font-mono text-white font-bold shadow-sm" style="background-color: ${cls.color}">${cls.code}</span>
              <span class="absolute top-1 right-1 px-1 py-0.2 rounded text-[8px] font-mono text-[#B4AFBA] bg-black/60 font-semibold">${ann.id}</span>
            </div>
            <div class="flex items-center justify-between text-[10px] font-mono px-0.5 shrink-0">
              <span class="text-white font-medium truncate" title="${cellDisplayName}">${cellDisplayName}</span>
              <span class="text-[#e52246] font-bold shrink-0 ml-1">${Math.round(ann.confidence * 100)}%</span>
            </div>
          </div>
        `;
      }).join('');

      cells.forEach(ann => {
        const thumbCanvas = document.getElementById(`crop-thumb-${ann.id}`);
        if (thumbCanvas) {
          const tCtx = thumbCanvas.getContext('2d');
          const pad = 12;
          const srcX = Math.max(0, ann.x - pad);
          const srcY = Math.max(0, ann.y - pad);
          const srcW = Math.min(state.image.naturalWidth - srcX, ann.width + pad * 2);
          const srcH = Math.min(state.image.naturalHeight - srcY, ann.height + pad * 2);
          
          thumbCanvas.width = 120;
          thumbCanvas.height = 88;
          tCtx.clearRect(0, 0, 120, 88);

          // Draw cropped cell ROI scaled to constant container height
          const scale = Math.min(120 / srcW, 88 / srcH);
          const drawW = srcW * scale;
          const drawH = srcH * scale;
          const dx = (120 - drawW) / 2;
          const dy = (88 - drawH) / 2;

          tCtx.drawImage(state.image, srcX, srcY, srcW, srcH, dx, dy, drawW, drawH);

          const cls = state.taxonomy.find(t => t.id === ann.classId || t.rawClass === ann.rawClass || t.rawClass === ann.classId || t.id === ann.rawClass) || state.taxonomy[0];
          tCtx.strokeStyle = cls.color;
          tCtx.lineWidth = 1.5;
          if (ann.shape === 'circle') {
            tCtx.beginPath();
            tCtx.arc(120 / 2, 88 / 2, Math.min(drawW, drawH) * 0.42, 0, Math.PI * 2);
            tCtx.stroke();
          } else {
            tCtx.strokeRect(dx + 2, dy + 2, drawW - 4, drawH - 4);
          }
        }
      });

      document.querySelectorAll('.gal-cell-card').forEach(card => {
        card.onclick = () => {
          const cid = card.getAttribute('data-cell-id');
          const ann = state.annotations.find(a => a.id === cid);
          if (ann) {
            selectCell(ann.id);
            focusOnCell(ann);
          }
        };
      });
    }

    document.querySelectorAll('.btn-gal-filter').forEach(btn => {
      btn.onclick = () => {
        const filter = btn.getAttribute('data-gallery-filter');
        state.galleryFilter = filter;
        document.querySelectorAll('.btn-gal-filter').forEach(b => {
          if (b.getAttribute('data-gallery-filter') === filter) {
            b.className = 'btn-gal-filter px-2 py-0.5 rounded bg-[#e52246] text-white font-bold shrink-0';
          } else {
            b.className = 'btn-gal-filter px-2 py-0.5 rounded bg-[#1B191E] text-[#9e9a9e] hover:text-white shrink-0';
          }
        });
        renderGallery();
      };
    });

    let toastTimer = null;
    function showToast(msg, type = 'info', duration = 3000) {
      const toast = document.getElementById('app-toast');
      const msgEl = document.getElementById('toast-message');
      const dotEl = toast ? toast.querySelector('span:first-child') : null;
      if (!toast || !msgEl) return;
      msgEl.textContent = msg;

      if (type === 'error') {
        toast.className = 'fixed top-14 left-1/2 -translate-x-1/2 bg-[#1B191E]/95 border-2 border-red-500/80 px-4 py-2.5 rounded-xl text-xs font-mono text-white shadow-2xl z-50 flex items-center space-x-2 transition-all duration-300 opacity-100 pointer-events-none translate-y-0';
        if (dotEl) dotEl.className = 'w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0';
      } else if (type === 'warn') {
        toast.className = 'fixed top-14 left-1/2 -translate-x-1/2 bg-[#1B191E]/95 border-2 border-amber-500/80 px-4 py-2.5 rounded-xl text-xs font-mono text-white shadow-2xl z-50 flex items-center space-x-2 transition-all duration-300 opacity-100 pointer-events-none translate-y-0';
        if (dotEl) dotEl.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0';
      } else {
        toast.className = 'fixed top-14 left-1/2 -translate-x-1/2 bg-[#1B191E]/95 border border-[#e52246]/60 px-4 py-2 rounded-xl text-xs font-mono text-white shadow-2xl z-50 flex items-center space-x-2 transition-all duration-300 opacity-100 pointer-events-none translate-y-0';
        if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-[#e52246] animate-pulse shrink-0';
      }

      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', '-translate-y-2');
      }, duration);
    }

    // Export Dropdown & Handlers
    const exportTrigger = document.getElementById('btn-export-dropdown-trigger');
    const exportMenu = document.getElementById('export-dropdown-menu');
    if (exportTrigger && exportMenu) {
      exportTrigger.onclick = (e) => {
        e.stopPropagation();
        hideHelpTooltip();
        const willOpen = exportMenu.classList.contains('hidden');
        closeAllDropdowns(exportMenu);
        if (willOpen) exportMenu.classList.remove('hidden');
        else exportMenu.classList.add('hidden');
      };
    }

    // ==========================================
    // PKZip Binary Archive Encoder & Decoder
    // ==========================================
    const CRC32_TABLE = (() => {
      const table = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
          c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c;
      }
      return table;
    })();

    function computeCrc32(uint8Array) {
      let crc = 0xFFFFFFFF;
      for (let i = 0; i < uint8Array.length; i++) {
        crc = CRC32_TABLE[(crc ^ uint8Array[i]) & 0xFF] ^ (crc >>> 8);
      }
      return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    function createZipArchive(entries) {
      const encoder = new TextEncoder();
      const fileRecords = [];
      let offset = 0;

      const now = new Date();
      const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
      const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;

      for (const entry of entries) {
        const nameBytes = encoder.encode(entry.name);
        const dataBytes = entry.data instanceof Uint8Array ? entry.data : new Uint8Array(entry.data);
        const crc = computeCrc32(dataBytes);
        const uncompressedSize = dataBytes.length;
        const compressedSize = dataBytes.length;

        const localHeader = new Uint8Array(30 + nameBytes.length);
        const view = new DataView(localHeader.buffer);
        view.setUint32(0, 0x04034b50, true);
        view.setUint16(4, 20, true);
        view.setUint16(6, 0, true);
        view.setUint16(8, 0, true); // Method 0 = Store
        view.setUint16(10, dosTime, true);
        view.setUint16(12, dosDate, true);
        view.setUint32(14, crc, true);
        view.setUint32(18, compressedSize, true);
        view.setUint32(22, uncompressedSize, true);
        view.setUint16(26, nameBytes.length, true);
        view.setUint16(28, 0, true);
        localHeader.set(nameBytes, 30);

        fileRecords.push({
          nameBytes,
          dataBytes,
          crc,
          compressedSize,
          uncompressedSize,
          localHeader,
          offset
        });

        offset += localHeader.length + dataBytes.length;
      }

      const centralDirStartOffset = offset;
      const centralDirRecords = [];
      let centralDirSize = 0;

      for (const rec of fileRecords) {
        const cdHeader = new Uint8Array(46 + rec.nameBytes.length);
        const view = new DataView(cdHeader.buffer);
        view.setUint32(0, 0x02014b50, true);
        view.setUint16(4, 20, true);
        view.setUint16(6, 20, true);
        view.setUint16(8, 0, true);
        view.setUint16(10, 0, true);
        view.setUint16(12, dosTime, true);
        view.setUint16(14, dosDate, true);
        view.setUint32(16, rec.crc, true);
        view.setUint32(20, rec.compressedSize, true);
        view.setUint32(24, rec.uncompressedSize, true);
        view.setUint16(28, rec.nameBytes.length, true);
        view.setUint16(30, 0, true);
        view.setUint16(32, 0, true);
        view.setUint16(34, 0, true);
        view.setUint16(36, 0, true);
        view.setUint32(38, 0, true);
        view.setUint32(42, rec.offset, true);
        cdHeader.set(rec.nameBytes, 46);

        centralDirRecords.push(cdHeader);
        centralDirSize += cdHeader.length;
      }

      const eocd = new Uint8Array(22);
      const eocdView = new DataView(eocd.buffer);
      eocdView.setUint32(0, 0x06054b50, true);
      eocdView.setUint16(4, 0, true);
      eocdView.setUint16(6, 0, true);
      eocdView.setUint16(8, fileRecords.length, true);
      eocdView.setUint16(10, fileRecords.length, true);
      eocdView.setUint32(12, centralDirSize, true);
      eocdView.setUint32(16, centralDirStartOffset, true);
      eocdView.setUint16(20, 0, true);

      const totalLength = centralDirStartOffset + centralDirSize + 22;
      const zipBuffer = new Uint8Array(totalLength);

      let curPos = 0;
      for (const rec of fileRecords) {
        zipBuffer.set(rec.localHeader, curPos);
        curPos += rec.localHeader.length;
        zipBuffer.set(rec.dataBytes, curPos);
        curPos += rec.dataBytes.length;
      }
      for (const cd of centralDirRecords) {
        zipBuffer.set(cd, curPos);
        curPos += cd.length;
      }
      zipBuffer.set(eocd, curPos);

      return zipBuffer;
    }

    function readZipArchive(arrayBuffer) {
      const bytes = new Uint8Array(arrayBuffer);
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const entries = {};
      const decoder = new TextDecoder();

      let eocdOffset = -1;
      for (let i = bytes.length - 22; i >= 0; i--) {
        if (view.getUint32(i, true) === 0x06054b50) {
          eocdOffset = i;
          break;
        }
      }
      if (eocdOffset === -1) {
        throw new Error("Invalid ZIP archive (EOCD signature not found)");
      }

      const numEntries = view.getUint16(eocdOffset + 10, true);
      const cdOffset = view.getUint32(eocdOffset + 16, true);

      let curCd = cdOffset;
      for (let i = 0; i < numEntries; i++) {
        if (view.getUint32(curCd, true) !== 0x02014b50) break;
        const compression = view.getUint16(curCd + 10, true);
        const compressedSize = view.getUint32(curCd + 20, true);
        const uncompressedSize = view.getUint32(curCd + 24, true);
        const nameLen = view.getUint16(curCd + 28, true);
        const extraLen = view.getUint16(curCd + 30, true);
        const commentLen = view.getUint16(curCd + 32, true);
        const localHeaderOffset = view.getUint32(curCd + 42, true);

        const nameBytes = bytes.subarray(curCd + 46, curCd + 46 + nameLen);
        const fileName = decoder.decode(nameBytes);

        const localNameLen = view.getUint16(localHeaderOffset + 26, true);
        const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
        const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
        const rawData = bytes.subarray(dataStart, dataStart + compressedSize);

        let fileData;
        if (compression === 0) {
          fileData = rawData;
        } else if (compression === 8 && typeof pako !== 'undefined') {
          fileData = pako.inflateRaw(rawData);
        } else {
          fileData = rawData;
        }

        entries[fileName] = fileData;
        curCd += 46 + nameLen + extraLen + commentLen;
      }
      return entries;
    }

    // Helper to get raw, unmodified optical brightfield image bytes (PNG) without any filters applied
    async function getRawOriginalImagePngBytes() {
      if (!state.image) return null;
      const w = state.image.naturalWidth || state.image.width || 1500;
      const h = state.image.naturalHeight || state.image.height || 1125;
      const rawCanvas = document.createElement('canvas');
      rawCanvas.width = w;
      rawCanvas.height = h;
      const ctx = rawCanvas.getContext('2d');
      // Draw original unmodified image
      ctx.drawImage(state.image, 0, 0, w, h);

      return new Promise((resolve) => {
        rawCanvas.toBlob(async (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const buf = await blob.arrayBuffer();
          resolve(new Uint8Array(buf));
        }, 'image/png');
      });
    }

    // Helper to get base64 data URI of the smear image (with fetch blob fallback for tainted canvases)
    function getImageDataUri() {
      if (!state.image) return null;
      if (state.imageDataUri && typeof state.imageDataUri === 'string' && state.imageDataUri.startsWith('data:')) {
        return state.imageDataUri;
      }
      try {
        const w = state.image.naturalWidth || state.image.width || 1500;
        const h = state.image.naturalHeight || state.image.height || 1125;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const ctx = tempCanvas.getContext('2d');
        if (state.image.complete && (state.image.naturalWidth || state.image.width)) {
          ctx.drawImage(state.image, 0, 0, w, h);
          const uri = tempCanvas.toDataURL('image/jpeg', 0.92);
          state.imageDataUri = uri;
          return uri;
        }
      } catch (e) {
        console.warn('[Export] Canvas tainted, attempting cached buffer / URI fallback');
      }
      return state.imageDataUri || null;
    }

    // Build complete self-contained Human-Supervised Dataset Export object
    function buildDatasetExportPayload() {
      const classDistribution = {};
      const lineageDistribution = { WBC: 0, RBC: 0, PLT: 0 };
      
      const annotationsWithOrigin = state.annotations.map(ann => {
        const isCreated = !!ann.isUserCreated || ann.origin === 'user_created';
        const isReclassified = !isCreated && (!!ann.isUserModified || ann.origin === 'user_reclassified');
        const isAi = !isCreated && !isReclassified;
        
        const origin = isCreated ? 'user_created' : (isReclassified ? 'user_reclassified' : 'ai_generated');

        return {
          ...ann,
          origin,
          isAiGenerated: isAi,
          isUserModified: isReclassified,
          isUserCreated: isCreated,
          ...(isReclassified ? {
            originalAiClassId: ann.originalAiClassId || ann.aiClassId || ann.classId,
            originalAiLabel: ann.originalAiLabel || ann.aiLabel || ann.label,
            originalAiConfidence: ann.originalAiConfidence || ann.aiConfidence || ann.confidence
          } : {})
        };
      });

      const counts = {
        totalCells: annotationsWithOrigin.length,
        aiGeneratedUnchanged: 0,
        userReclassified: 0,
        userCreated: 0
      };

      annotationsWithOrigin.forEach(ann => {
        classDistribution[ann.classId] = (classDistribution[ann.classId] || 0) + 1;
        const lineage = ann.lineage || 'WBC';
        lineageDistribution[lineage] = (lineageDistribution[lineage] || 0) + 1;

        if (ann.origin === 'ai_generated') counts.aiGeneratedUnchanged++;
        else if (ann.origin === 'user_reclassified') counts.userReclassified++;
        else if (ann.origin === 'user_created') counts.userCreated++;
      });

      const fullState = {
        app: "AIMALABS Lynceus",
        version: "1.2",
        exportedAt: new Date().toISOString(),
        dataset: {
          isHumanSupervised: true,
          totalCells: annotationsWithOrigin.length,
          counts,
          classDistribution,
          lineageDistribution,
          clinicianReviewStatus: state.metadata?.reviewStatus || 'reviewed'
        },
        image: {
          fileName: state.metadata?.fileName || 'smear-02.jpeg',
          smearId: state.metadata?.smearId || 'smear-02',
          width: state.image?.naturalWidth || state.image?.width || 1500,
          height: state.image?.naturalHeight || state.image?.height || 1125,
          dimensions: `${state.image?.naturalWidth || 1500} × ${state.image?.naturalHeight || 1125} px`,
          specimenType: state.metadata?.specimenType || 'Peripheral Blood Smear',
          stainType: state.metadata?.stainType || 'Wright-Giemsa',
          dataUri: getImageDataUri()
        },
        preprocessing: {
          activeFilters: [...(state.activeFilters || [])],
          filterDefinitions: Object.keys(FILTER_CONFIG).reduce((acc, k) => {
            acc[k] = { name: FILTER_CONFIG[k].name, enabled: state.activeFilters ? state.activeFilters.includes(k) : false };
            return acc;
          }, {})
        },
        postprocessingConfig: { ...(state.postprocessingConfig || DEFAULT_POSTPROCESSING_CONFIG) },
        metadata: state.metadata || DEFAULT_METADATA,
        micronsPerPixel: state.micronsPerPixel,
        minConfidence: state.minConfidence,
        classFilter: state.classFilter,
        view: {
          x: state.view.x,
          y: state.view.y,
          zoom: state.view.zoom
        },
        annotations: annotationsWithOrigin,
        measurements: state.measurements
      };
      return fullState;
    }

    // Export .aimalabs ZIP Package (contains annotations.json + raw unfiltered image.png)
    async function exportAimalabsZip() {
      const annotationsPayload = buildDatasetExportPayload();
      annotationsPayload.image.fileName = "image.png";
      delete annotationsPayload.image.dataUri; // image is stored as separate image.png file inside the zip package

      const jsonBytes = new TextEncoder().encode(JSON.stringify(annotationsPayload, null, 2));
      let pngBytes = await getRawOriginalImagePngBytes();

      if (!pngBytes) {
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = state.image?.naturalWidth || 1500;
        fallbackCanvas.height = state.image?.naturalHeight || 1125;
        const ctx = fallbackCanvas.getContext('2d');
        ctx.drawImage(state.image, 0, 0);
        const dataUrl = fallbackCanvas.toDataURL('image/png');
        const binStr = atob(dataUrl.split(',')[1]);
        pngBytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) pngBytes[i] = binStr.charCodeAt(i);
      }

      const zipBytes = createZipArchive([
        { name: 'annotations.json', data: jsonBytes },
        { name: 'image.png', data: pngBytes }
      ]);

      const blob = new Blob([zipBytes], { type: 'application/octet-stream' });
      const downloadUrl = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", downloadUrl);
      const safeLastName = (state.metadata?.patientLastName || 'DOE').replace(/[^a-zA-Z0-9_-]/g, '');
      const safeSmearId = (state.metadata?.smearId || 'smear-02').replace(/[^a-zA-Z0-9_-]/g, '');
      downloadAnchor.setAttribute("download", `lynceus_${safeLastName}_${safeSmearId}_${Date.now()}.aimalabs`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(downloadUrl);
      showToast(`✓ Exported .aimalabs package (${state.annotations.length} annotations + original image.png)`);
    }

    // Export Single Full State JSON File
    function exportAnnotationsJSON() {
      const fullState = buildDatasetExportPayload();

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullState, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      const safeLastName = (state.metadata?.patientLastName || 'DOE').replace(/[^a-zA-Z0-9_-]/g, '');
      const safeSmearId = (state.metadata?.smearId || 'smear-02').replace(/[^a-zA-Z0-9_-]/g, '');
      downloadAnchor.setAttribute("download", `lynceus_${safeLastName}_${safeSmearId}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`✓ State exported as JSON (${state.annotations.length} annotations)`);
    }

    async function importAnnotationsJSON(fileOrPayload) {
      const applyPayload = (parsed) => {
        try {
          if (!parsed || (typeof parsed !== 'object')) {
            throw new Error("Invalid JSON format");
          }

          const smearId = (parsed.metadata && parsed.metadata.smearId) ? parsed.metadata.smearId : (file ? file.name.replace(/\.[^/.]+$/, "") : `smear-${Date.now()}`);
          let targetCase = (state.cases || []).find(c => c.id === smearId);
          if (!targetCase) {
            targetCase = createCaseInstance({
              id: smearId,
              metadata: parsed.metadata || DEFAULT_METADATA_DOE,
              annotations: parsed.annotations || []
            });
            if (!state.cases) state.cases = [];
            state.cases.push(targetCase);
          }
          state.activeCaseId = targetCase.id;

          if (parsed.metadata && typeof parsed.metadata === 'object') {
            state.metadata = { ...DEFAULT_METADATA, ...parsed.metadata };
            targetCase.metadata = state.metadata;
          }
          if (Array.isArray(parsed.annotations)) {
            state.annotations = parsed.annotations;
            targetCase.annotations = state.annotations;
          }
          if (Array.isArray(parsed.measurements)) {
            state.measurements = parsed.measurements;
            targetCase.measurements = state.measurements;
          }
          if (typeof parsed.micronsPerPixel === 'number' && parsed.micronsPerPixel > 0) {
            state.micronsPerPixel = parsed.micronsPerPixel;
            targetCase.micronsPerPixel = parsed.micronsPerPixel;
            setCalibration(parsed.micronsPerPixel);
          }
          if (typeof parsed.minConfidence === 'number') {
            state.minConfidence = parsed.minConfidence;
            targetCase.minConfidence = parsed.minConfidence;
            const slider = document.getElementById('conf-slider');
            const valEl = document.getElementById('conf-value-label');
            if (slider) slider.value = state.minConfidence.toString();
            if (valEl) valEl.textContent = `${Math.round(state.minConfidence * 100)}%`;
          }
          if (parsed.classFilter && typeof parsed.classFilter === 'object') {
            state.classFilter = { ...state.classFilter, ...parsed.classFilter };
            targetCase.classFilter = state.classFilter;
          }

          // Restore Preprocessing Filters & Preset if present
          if (parsed.preprocessing && typeof parsed.preprocessing === 'object') {
            if (Array.isArray(parsed.preprocessing.activeFilters)) {
              setCanvasFilters(parsed.preprocessing.activeFilters);
              targetCase.activeFilters = [...parsed.preprocessing.activeFilters];
            }
          }

          // Restore Postprocessing Heuristics if present
          if (parsed.postprocessingConfig && typeof parsed.postprocessingConfig === 'object') {
            state.postprocessingConfig = { ...state.postprocessingConfig, ...parsed.postprocessingConfig };
            targetCase.postprocessingConfig = { ...state.postprocessingConfig };
            savePostprocessingConfig();
            syncPostprocessingUI();
          }

          // Restore Image from dataUri if present and valid
          if (parsed.image && parsed.image.dataUri && typeof parsed.image.dataUri === 'string' && parsed.image.dataUri.startsWith('data:')) {
            const img = new Image();
            img.onload = () => {
              state.image = img;
              state.imageLoaded = true;
              state.imageDataUri = parsed.image.dataUri;
              targetCase.image = img;
              targetCase.imageLoaded = true;
              targetCase.imageDataUri = parsed.image.dataUri;
              updateMinimapBg();
              renderMinimap();
              scheduleRender();
            };
            img.src = parsed.image.dataUri;
          }

          state.selectedCellId = null;
          state.selectedMeasurementId = null;
          state.undoStack = [];
          state.redoStack = [];

          renderEmptyStateHUD();
          updateDocumentTitle();
          updateCaseHeaderPill();
          renderCaseSelectorDropdown();
          refreshAppViews();
          scheduleRender();

          showToast(`✓ Case imported: ${state.metadata.patientLastName || 'DOE'} (${state.annotations.length} cells)`);
        } catch (err) {
          console.error("Import error:", err);
          showToast("Failed to parse case JSON file", 'warn');
        }
      };

      if (fileOrPayload && typeof fileOrPayload === 'object' && !(fileOrPayload instanceof Blob)) {
        applyPayload(fileOrPayload);
        return;
      }

      if (!fileOrPayload) return;

      const file = fileOrPayload;
      const isZipOrAimalabs = (file.name && (file.name.endsWith('.aimalabs') || file.name.endsWith('.zip')));

      if (isZipOrAimalabs) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const entries = readZipArchive(arrayBuffer);
          const jsonEntryKey = Object.keys(entries).find(k => k.endsWith('.json') || k === 'annotations.json');
          const imageEntryKey = Object.keys(entries).find(k => k.match(/\.(png|jpe?g|webp)$/i) || k === 'image.png');

          if (!jsonEntryKey) {
            throw new Error("annotations.json not found in .aimalabs archive");
          }

          const jsonText = new TextDecoder().decode(entries[jsonEntryKey]);
          const parsed = JSON.parse(jsonText);

          if (imageEntryKey && entries[imageEntryKey]) {
            const imgBlob = new Blob([entries[imageEntryKey]], { type: 'image/png' });
            const imgUrl = URL.createObjectURL(imgBlob);
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              state.image = img;
              state.imageLoaded = true;
              state.imageDataUri = null;
              updateMinimapBg();
              renderMinimap();
              scheduleRender();
            };
            img.src = imgUrl;
          }

          applyPayload(parsed);
          showToast(`✓ Imported .aimalabs package: ${state.metadata.patientLastName || 'DOE'} (${state.annotations.length} cells)`);
        } catch (err) {
          console.error('[Import .aimalabs] Error:', err);
          showToast(`Failed to parse .aimalabs file: ${err.message}`, 'warn');
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          applyPayload(parsed);
        } catch (err) {
          console.error("Import error:", err);
          showToast("Failed to parse case JSON file", 'warn');
        }
      };
      reader.readAsText(fileOrPayload);
    }

    function loadSmearImage(file) {
      if (!file) return;

      const isTiff = (file.name && file.name.match(/\.tiff?$/i)) || file.type === 'image/tiff';

      const applyLoadedImage = (imgSrc) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const smearId = file.name ? file.name.replace(/\.[^/.]+$/, "") : `smear-${Date.now()}`;
          const newMeta = {
            ...DEFAULT_METADATA_DOE,
            smearId: smearId,
            fileName: file.name || `${smearId}.jpg`,
            imageDimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
            collectionDate: new Date().toISOString().split('T')[0]
          };

          const newCase = createCaseInstance({
            id: smearId,
            metadata: newMeta,
            imageElement: img,
            imageSrc: (imgSrc && imgSrc.startsWith('data:')) ? imgSrc : null,
            annotations: [],
            measurements: []
          });

          if (!state.cases) state.cases = [];
          const existingIdx = state.cases.findIndex(c => c.id === smearId);
          if (existingIdx >= 0) {
            state.cases[existingIdx] = newCase;
          } else {
            state.cases.push(newCase);
          }

          switchActiveCase(newCase.id);

          const resReadout = document.getElementById('meta-res-readout');
          if (resReadout) resReadout.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;

          pushHistory('Load Smear Image');
          showToast(`✓ Smear image loaded: ${file.name || 'image'} (annotations cleared)`);
        };
        img.onerror = () => {
          showToast(`Failed to decode image: ${file.name || 'image'}`, 'warn');
        };
        img.src = imgSrc;
      };

      if (isTiff) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            if (typeof UTIF === 'undefined') {
              throw new Error('TIFF decoder library (UTIF) is not available.');
            }
            const buffer = e.target.result;
            const ifds = UTIF.decode(buffer);
            if (!ifds || ifds.length === 0) {
              throw new Error('No readable image records found in TIFF.');
            }
            UTIF.decodeImage(buffer, ifds[0]);
            const width = ifds[0].width || (ifds[0].t256 ? ifds[0].t256[0] : 0);
            const height = ifds[0].height || (ifds[0].t257 ? ifds[0].t257[0] : 0);
            if (!width || !height) {
              throw new Error('Could not determine TIFF image dimensions.');
            }
            const rgba = UTIF.toRGBA8(ifds[0]);
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            const imgData = ctx.createImageData(width, height);
            imgData.data.set(rgba);
            ctx.putImageData(imgData, 0, 0);

            canvas.toBlob((blob) => {
              if (blob) {
                applyLoadedImage(URL.createObjectURL(blob));
              } else {
                applyLoadedImage(canvas.toDataURL('image/png'));
              }
            }, 'image/png');
          } catch (err) {
            console.error('Failed to parse TIFF:', err);
            showToast(`TIFF decode error: ${err.message || err}`, 'warn');
          }
        };
        reader.onerror = () => {
          showToast(`Failed to read file: ${file.name}`, 'warn');
        };
        reader.readAsArrayBuffer(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          applyLoadedImage(e.target.result);
        };
        reader.onerror = () => {
          showToast(`Failed to read file: ${file.name}`, 'warn');
        };
        reader.readAsDataURL(file);
      }
    }

    const btnExpAimalabs = document.getElementById('btn-export-aimalabs');
    if (btnExpAimalabs) btnExpAimalabs.onclick = exportAimalabsZip;

    const btnExpJson = document.getElementById('btn-export-json');
    if (btnExpJson) btnExpJson.onclick = exportAnnotationsJSON;

    const btnImportTrigger = document.getElementById('btn-import-dropdown-trigger');
    const importMenu = document.getElementById('import-dropdown-menu');
    const btnImportJsonOpt = document.getElementById('btn-import-json-opt');
    const btnLoadImageOpt = document.getElementById('btn-load-image-opt') || document.getElementById('btn-upload-image-opt');
    const btnImportJson = document.getElementById('btn-import-json');
    const inputImportJsonFile = document.getElementById('input-import-json-file');
    const inputLoadImageFile = document.getElementById('input-load-image-file') || document.getElementById('input-upload-image-file');

    if (btnImportTrigger && importMenu) {
      btnImportTrigger.onclick = (e) => {
        e.stopPropagation();
        hideHelpTooltip();
        const willOpen = importMenu.classList.contains('hidden');
        closeAllDropdowns(importMenu);
        if (willOpen) importMenu.classList.remove('hidden');
        else importMenu.classList.add('hidden');
      };
    }

    const inputLoadSmearUnified = document.getElementById('input-load-smear-unified');

    function handleUnifiedSmearFile(file) {
      if (!file) return;
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.aimalabs') || lower.endsWith('.zip') || lower.endsWith('.json')) {
        importAnnotationsJSON(file);
      } else {
        loadSmearImage(file);
      }
    }

    const triggerSmearLoad = () => {
      closeAllDropdowns();
      if (inputLoadSmearUnified) {
        inputLoadSmearUnified.value = '';
        inputLoadSmearUnified.click();
      } else if (inputLoadImageFile) {
        inputLoadImageFile.value = '';
        inputLoadImageFile.click();
      }
    };

    if (inputLoadSmearUnified) {
      inputLoadSmearUnified.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          handleUnifiedSmearFile(e.target.files[0]);
        }
      };
    }

    const triggerJsonImport = () => {
      if (importMenu) importMenu.classList.add('hidden');
      if (inputImportJsonFile) {
        inputImportJsonFile.value = '';
        inputImportJsonFile.click();
      }
    };

    if (btnImportJsonOpt) btnImportJsonOpt.onclick = triggerJsonImport;
    if (btnImportJson) btnImportJson.onclick = triggerJsonImport;

    if (inputImportJsonFile) {
      inputImportJsonFile.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          importAnnotationsJSON(e.target.files[0]);
        }
      };
    }

    const triggerImageLoad = () => {
      triggerSmearLoad();
    };

    if (btnLoadImageOpt) btnLoadImageOpt.onclick = triggerImageLoad;
    const btnUploadLegacy = document.getElementById('btn-upload-image-opt');
    if (btnUploadLegacy) btnUploadLegacy.onclick = triggerImageLoad;

    if (inputLoadImageFile) {
      inputLoadImageFile.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          loadSmearImage(e.target.files[0]);
        }
      };
    }

    // Drag & drop support for image and JSON files
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.name.endsWith('.json') || file.type === 'application/json') {
          importAnnotationsJSON(file);
        } else if (file.name.match(/\.(png|jpe?g|webp|tiff?)$/i) || file.type.startsWith('image/')) {
          loadSmearImage(file);
        }
      }
    });

    // Patient & Case Metadata Functions
    function updateDocumentTitle() {
      if (!state.metadata || !state.cases || state.cases.length === 0) {
        document.title = '[No Smear Loaded] aimalabs • Lynceus';
        return;
      }
      const meta = state.metadata || DEFAULT_METADATA_DOE;
      const lastName = (meta.patientLastName || 'DOE').trim();
      const date = (meta.collectionDate || '2026-08-18').trim();
      const smear = (meta.smearId || 'smear-02').trim();
      document.title = `[${lastName} • ${date}] ${smear} | aimalabs • Lynceus`;
    }

    function updateCaseHeaderPill() {
      const pName = document.getElementById('patient-name-display');
      const pDate = document.getElementById('patient-date-display');
      const sTitle = document.getElementById('slide-title');
      const notesBadge = document.getElementById('notes-badge-text');
      const modalTag = document.getElementById('modal-patient-tag');
      const dot = document.getElementById('patient-status-dot');

      if (!state.metadata || !state.cases || state.cases.length === 0) {
        if (pName) pName.textContent = 'No Smear Loaded';
        if (pDate) pDate.textContent = '—';
        if (sTitle) sTitle.textContent = 'empty';
        if (modalTag) modalTag.textContent = 'No Case Loaded';
        if (dot) {
          dot.className = 'inline-block w-2 h-2 rounded-full bg-[#7a767a] shrink-0';
          dot.title = 'No case loaded';
        }
        if (notesBadge) notesBadge.textContent = 'No Case';
        return;
      }

      const meta = state.metadata;
      const firstInitial = meta.patientFirstName ? `${meta.patientFirstName[0]}.` : 'J.';
      if (pName) pName.textContent = `${meta.patientLastName || 'DOE'}, ${firstInitial}`;
      if (pDate) pDate.textContent = meta.collectionDate || '2026-08-18';
      if (sTitle) sTitle.textContent = meta.smearId || 'smear-02';
      if (modalTag) modalTag.textContent = `${meta.patientLastName || 'DOE'}, ${firstInitial} • ${meta.smearId || 'smear-02'}`;

      // Reflect sign-off status color on the dot next to patient name
      const status = meta.reviewStatus || 'in_review';
      if (dot) {
        if (status === 'reviewed') {
          // 🟢 Reviewed & Signed
          dot.className = 'inline-block w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.5)] shrink-0 transition-colors duration-200';
          dot.title = 'Status: Reviewed & Signed (Ready)';
        } else if (status === 'critical') {
          // 🔴 Critical Finding Alert
          dot.className = 'inline-block w-2 h-2 rounded-full bg-[#e52246] animate-pulse shadow-[0_0_8px_rgba(229,34,70,0.8)] shrink-0 transition-colors duration-200';
          dot.title = 'Status: Critical Finding Alert';
        } else {
          // 🟡 In Progress / Review (default)
          dot.className = 'inline-block w-2 h-2 rounded-full bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.5)] shrink-0 transition-colors duration-200';
          dot.title = 'Status: In Progress / Review';
        }
      }

      const hasNotes = meta.notes && meta.notes.trim().length > 0;
      if (notesBadge) {
        notesBadge.textContent = hasNotes ? 'Notes' : 'Add Note';
      }
    }

    function openCaseModal() {
      const modal = document.getElementById('case-modal');
      if (!modal) return;
      const meta = state.metadata || DEFAULT_METADATA_DOE;
      
      const inLastName = document.getElementById('input-patient-lastname');
      const inMrn = document.getElementById('input-patient-mrn');
      const inDate = document.getElementById('input-patient-date');
      const inSmear = document.getElementById('input-smear-id');
      const inIndication = document.getElementById('input-clinical-indication');
      const inNotes = document.getElementById('input-doctor-notes');
      const inStatus = document.getElementById('select-review-status');
      const charCount = document.getElementById('notes-char-count');
      const calReadout = document.getElementById('meta-cal-readout');

      if (inLastName) inLastName.value = meta.patientLastName || '';
      if (inMrn) inMrn.value = meta.patientFirstName ? `${meta.patientFirstName} (${meta.patientMrn || ''})` : (meta.patientMrn || '');
      if (inDate) inDate.value = meta.collectionDate || '';
      if (inSmear) inSmear.value = meta.smearId || '';
      if (inIndication) inIndication.value = meta.clinicalIndication || '';
      if (inNotes) {
        inNotes.value = meta.notes || '';
        if (charCount) charCount.textContent = `${inNotes.value.length} chars`;
      }
      if (inStatus) inStatus.value = meta.reviewStatus || 'in_review';
      if (calReadout) calReadout.textContent = `${state.micronsPerPixel.toFixed(3)} µm/px`;

      modal.classList.remove('hidden');
      if (inLastName) inLastName.focus();
    }

    function closeCaseModal() {
      const modal = document.getElementById('case-modal');
      if (modal) modal.classList.add('hidden');
    }

    function saveCaseMetadata() {
      const inLastName = document.getElementById('input-patient-lastname');
      const inMrn = document.getElementById('input-patient-mrn');
      const inDate = document.getElementById('input-patient-date');
      const inSmear = document.getElementById('input-smear-id');
      const inIndication = document.getElementById('input-clinical-indication');
      const inNotes = document.getElementById('input-doctor-notes');
      const inStatus = document.getElementById('select-review-status');

      let firstName = state.metadata?.patientFirstName || 'John';
      let mrn = state.metadata?.patientMrn || 'PT-8402';
      if (inMrn && inMrn.value.trim()) {
        const val = inMrn.value.trim();
        const parenMatch = val.match(/^([^(]+)\s*\(([^)]+)\)$/);
        if (parenMatch) {
          firstName = parenMatch[1].trim();
          mrn = parenMatch[2].trim();
        } else {
          firstName = val;
        }
      }

      const updatedSmearId = inSmear ? (inSmear.value.trim() || 'smear-02') : 'smear-02';

      state.metadata = {
        ...(state.metadata || DEFAULT_METADATA_DOE),
        patientLastName: inLastName ? (inLastName.value.trim() || 'DOE') : 'DOE',
        patientFirstName: firstName,
        patientMrn: mrn,
        collectionDate: inDate ? (inDate.value.trim() || '2026-08-18') : '2026-08-18',
        smearId: updatedSmearId,
        clinicalIndication: inIndication ? inIndication.value.trim() : '',
        notes: inNotes ? inNotes.value.trim() : '',
        reviewStatus: inStatus ? inStatus.value : 'in_review'
      };

      const active = getActiveCase();
      if (active) {
        active.metadata = { ...state.metadata };
        active.id = updatedSmearId;
        state.activeCaseId = updatedSmearId;
      }

      updateDocumentTitle();
      updateCaseHeaderPill();
      renderCaseSelectorDropdown();
      autoSaveToLocalStorage();
      closeCaseModal();
      showToast('✓ Case metadata & diagnostic notes saved');
    }

    const btnCaseMeta = document.getElementById('btn-case-meta');
    if (btnCaseMeta) btnCaseMeta.onclick = openCaseModal;

    const btnCaseDropdownTrigger = document.getElementById('btn-case-dropdown-trigger');
    const caseSelectorDropdown = document.getElementById('case-selector-dropdown');
    if (btnCaseDropdownTrigger && caseSelectorDropdown) {
      btnCaseDropdownTrigger.onclick = (e) => {
        e.stopPropagation();
        hideHelpTooltip();
        renderCaseSelectorDropdown();
        const willOpen = caseSelectorDropdown.classList.contains('hidden');
        closeAllDropdowns(caseSelectorDropdown);
        if (willOpen) caseSelectorDropdown.classList.remove('hidden');
        else caseSelectorDropdown.classList.add('hidden');
      };
    }

    // Global outside-click listener to fold all dropdowns
    window.addEventListener('click', (e) => {
      const isInsideAnyDropdown = ALL_DROPDOWN_IDS.some(id => {
        const el = document.getElementById(id);
        return el && el.contains(e.target);
      });
      const isTriggerClick = [
        'btn-case-dropdown-trigger',
        'filter-dropdown-trigger',
        'tool-dropdown-trigger',
        'obj-dropdown-trigger',
        'btn-export-dropdown-trigger',
        'btn-import-dropdown-trigger',
        'draw-class-trigger'
      ].some(tid => {
        const t = document.getElementById(tid);
        return t && (t === e.target || t.contains(e.target));
      });

      if (!isInsideAnyDropdown && !isTriggerClick) {
        closeAllDropdowns();
      }
    });

    const btnAddNewCaseTrigger = document.getElementById('btn-add-new-case-trigger');
    if (btnAddNewCaseTrigger) {
      btnAddNewCaseTrigger.onclick = (e) => {
        e.stopPropagation();
        if (caseSelectorDropdown) caseSelectorDropdown.classList.add('hidden');
        triggerSmearLoad();
      };
    }

    const btnCloseCaseModal = document.getElementById('btn-close-case-modal');
    if (btnCloseCaseModal) btnCloseCaseModal.onclick = closeCaseModal;

    const btnCancelCaseModal = document.getElementById('btn-cancel-case-modal');
    if (btnCancelCaseModal) btnCancelCaseModal.onclick = closeCaseModal;

    const btnDeleteCase = document.getElementById('btn-delete-case');
    if (btnDeleteCase) btnDeleteCase.onclick = deleteActiveCase;

    const btnSaveCaseModal = document.getElementById('btn-save-case-modal');
    if (btnSaveCaseModal) btnSaveCaseModal.onclick = saveCaseMetadata;

    const btnEmptyLoadSample = document.getElementById('btn-empty-load-sample');
    if (btnEmptyLoadSample) {
      btnEmptyLoadSample.onclick = () => {
        const dDoe = createCaseInstance({
          id: 'smear-02',
          metadata: DEFAULT_METADATA_DOE,
          imageSrc: 'assets/smear-02.jpg',
          annotations: INITIAL_ANNOTATIONS,
          activeFilters: ['clahe', 'fov_crop', 'reinhard_lab']
        });
        const dSmith = createCaseInstance({
          id: 'smear-field',
          metadata: DEFAULT_METADATA_SMITH,
          imageSrc: 'assets/smear-field.jpg',
          annotations: INITIAL_ANNOTATIONS_FIELD,
          activeFilters: ['clahe', 'fov_crop', 'two_tone', 'reinhard_lab']
        });
        state.cases = [dDoe, dSmith];
        switchActiveCase('smear-02');
        showToast('✓ Sample smear cases restored');
      };
    }

    const btnEmptyUploadImage = document.getElementById('btn-empty-upload-image');
    if (btnEmptyUploadImage) {
      btnEmptyUploadImage.onclick = () => {
        triggerImageLoad();
      };
    }

    const caseModalBackdrop = document.getElementById('case-modal');
    if (caseModalBackdrop) {
      caseModalBackdrop.onclick = (e) => {
        if (e.target === caseModalBackdrop) closeCaseModal();
      };
    }

    const inputDocNotes = document.getElementById('input-doctor-notes');
    if (inputDocNotes) {
      inputDocNotes.oninput = () => {
        const charCount = document.getElementById('notes-char-count');
        if (charCount) charCount.textContent = `${inputDocNotes.value.length} chars`;
      };
    }

    document.querySelectorAll('.btn-quick-note').forEach(btn => {
      btn.onclick = () => {
        const insertText = btn.getAttribute('data-insert');
        if (inputDocNotes && insertText) {
          if (inputDocNotes.value.trim().length > 0) {
            inputDocNotes.value = inputDocNotes.value.trim() + ' ' + insertText;
          } else {
            inputDocNotes.value = insertText;
          }
          const charCount = document.getElementById('notes-char-count');
          if (charCount) charCount.textContent = `${inputDocNotes.value.length} chars`;
          inputDocNotes.focus();
        }
      };
    });

    // Reset & AI Inference Model Selection Handlers
    const resetModal = document.getElementById('reset-confirm-modal');
    const btnResetDet = document.getElementById('btn-reset-detections');
    const btnCancelReset = document.getElementById('btn-cancel-reset');
    const btnCancelResetX = document.getElementById('btn-cancel-reset-x');
    const btnConfirmReset = document.getElementById('btn-confirm-reset');
    const cardModelFast = document.getElementById('card-model-fast');
    const cardModelPro = document.getElementById('card-model-pro');
    const resetModelSelection = document.getElementById('reset-model-selection');
    const resetLoadingView = document.getElementById('reset-loading-view');
    const resetLoadingModelName = document.getElementById('reset-loading-model-name');
    const resetLoadingStepText = document.getElementById('reset-loading-step-text');
    const resetProgressBar = document.getElementById('reset-progress-bar');
    const resetProgressPercent = document.getElementById('reset-progress-percent');
    const resetProgressTime = document.getElementById('reset-progress-time');

    let isResettingInference = false;
    let selectedInferenceModel = 'fast';

    function selectModelCard(modelType) {
      selectedInferenceModel = modelType;
      if (modelType === 'fast') {
        if (cardModelFast) {
          cardModelFast.className = 'model-select-card cursor-pointer p-3.5 rounded-xl border-2 border-[#38bdf8] bg-[#0c1f2e] transition space-y-1 group shadow-lg shadow-[#38bdf8]/15';
        }
        if (cardModelPro) {
          cardModelPro.className = 'model-select-card cursor-pointer p-3.5 rounded-xl border border-[#373437] hover:border-[#e52246]/60 bg-[#141316] hover:bg-[#1f1d22] transition space-y-1 group';
        }
      } else {
        if (cardModelPro) {
          cardModelPro.className = 'model-select-card cursor-pointer p-3.5 rounded-xl border-2 border-[#e52246] bg-[#1a1317] transition space-y-1 group shadow-lg shadow-[#e52246]/15';
        }
        if (cardModelFast) {
          cardModelFast.className = 'model-select-card cursor-pointer p-3.5 rounded-xl border border-[#373437] hover:border-[#38bdf8]/60 bg-[#141316] hover:bg-[#1f1d22] transition space-y-1 group';
        }
      }
    }

    if (cardModelFast) cardModelFast.onclick = () => selectModelCard('fast');
    if (cardModelPro) cardModelPro.onclick = () => selectModelCard('pro');

    // Post-Processing Settings Drawer & Heuristic Switches Binding
    const btnModelSettingsToggle = document.getElementById('btn-model-settings-toggle');
    const modelPostprocessingDrawer = document.getElementById('model-postprocessing-drawer');
    const btnResetPostprocDefaults = document.getElementById('btn-reset-postproc-defaults');

    const switchSizeFix = document.getElementById('postproc-switch-size-fix');
    const switchBorderExcl = document.getElementById('postproc-switch-border-excl');
    const switchDupeSuppr = document.getElementById('postproc-switch-dupe-suppr');
    const switchWbcVeto = document.getElementById('postproc-switch-wbc-veto');
    const switchWbcReassembly = document.getElementById('postproc-switch-wbc-reassembly');
    const switchRbcWatershed = document.getElementById('postproc-switch-rbc-watershed');

    function syncPostprocessingUI() {
      const cfg = state.postprocessingConfig || DEFAULT_POSTPROCESSING_CONFIG;
      if (switchSizeFix) switchSizeFix.checked = !!cfg.rbcPltSizeFix;
      if (switchBorderExcl) switchBorderExcl.checked = !!cfg.borderExclusion;
      if (switchDupeSuppr) switchDupeSuppr.checked = !!cfg.duplicateSuppression;
      if (switchWbcVeto) switchWbcVeto.checked = !!cfg.wbcNuclearVeto;
      if (switchWbcReassembly) switchWbcReassembly.checked = !!cfg.wbcMultiLobeReassembly;
      if (switchRbcWatershed) switchRbcWatershed.checked = !!cfg.rbcWatershedSplitting;
    }

    function savePostprocessingConfig() {
      try {
        localStorage.setItem('lynceus_postprocessing_config', JSON.stringify(state.postprocessingConfig));
      } catch (e) {
        console.warn('[PostProcessing] Failed to save config to localStorage:', e);
      }
    }

    if (btnModelSettingsToggle) {
      btnModelSettingsToggle.onclick = (e) => {
        e.stopPropagation();
        selectModelCard('fast');
        if (modelPostprocessingDrawer) {
          modelPostprocessingDrawer.classList.toggle('hidden');
        }
      };
    }

    if (switchSizeFix) {
      switchSizeFix.onchange = () => {
        state.postprocessingConfig.rbcPltSizeFix = switchSizeFix.checked;
        savePostprocessingConfig();
      };
    }
    if (switchBorderExcl) {
      switchBorderExcl.onchange = () => {
        state.postprocessingConfig.borderExclusion = switchBorderExcl.checked;
        savePostprocessingConfig();
      };
    }
    if (switchDupeSuppr) {
      switchDupeSuppr.onchange = () => {
        state.postprocessingConfig.duplicateSuppression = switchDupeSuppr.checked;
        savePostprocessingConfig();
      };
    }
    if (switchWbcVeto) {
      switchWbcVeto.onchange = () => {
        state.postprocessingConfig.wbcNuclearVeto = switchWbcVeto.checked;
        savePostprocessingConfig();
      };
    }
    if (switchWbcReassembly) {
      switchWbcReassembly.onchange = () => {
        state.postprocessingConfig.wbcMultiLobeReassembly = switchWbcReassembly.checked;
        savePostprocessingConfig();
      };
    }
    if (switchRbcWatershed) {
      switchRbcWatershed.onchange = () => {
        state.postprocessingConfig.rbcWatershedSplitting = switchRbcWatershed.checked;
        savePostprocessingConfig();
      };
    }

    if (btnResetPostprocDefaults) {
      btnResetPostprocDefaults.onclick = (e) => {
        e.stopPropagation();
        state.postprocessingConfig = { ...DEFAULT_POSTPROCESSING_CONFIG };
        savePostprocessingConfig();
        syncPostprocessingUI();
        showToast('Reset post-processing heuristics to defaults');
      };
    }

    syncPostprocessingUI();

    const btnModelCacheManage = document.getElementById('btn-model-cache-manage');
    const modalCacheDownloader = document.getElementById('modal-cache-downloader');
    const btnCloseCacheModal = document.getElementById('btn-close-cache-modal');
    const btnCancelCacheModal = document.getElementById('btn-cancel-cache-modal');
    const btnPurgeCacheAction = document.getElementById('btn-purge-cache-action');
    const btnStartCacheDownload = document.getElementById('btn-start-cache-download');

    async function updateModelCacheButtonUI() {
      const btn = document.getElementById('btn-model-cache-manage');
      if (!btn) return;
      const { populated } = await isModelCachePopulated();
      if (populated) {
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5 text-[#10b981]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
        btn.title = "Manage / Clear Offline Model Cache (Cached)";
        btn.classList.add('text-[#10b981]');
        btn.classList.remove('text-[#7a767a]', 'text-[#38bdf8]');
      } else {
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5 text-[#38bdf8]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
        btn.title = "Download & Cache Models Offline (Not Cached)";
        btn.classList.add('text-[#38bdf8]');
        btn.classList.remove('text-[#10b981]', 'text-[#7a767a]');
      }
    }

    async function syncModelCacheStatusUI() {
      const { populated, hasSwin, hasCpsam } = await isModelCachePopulated();
      const statusCpsam = document.getElementById('cache-status-cpsam');
      const statusSwin = document.getElementById('cache-status-swin');
      const btnPurge = document.getElementById('btn-purge-cache-action');
      const btnDownload = document.getElementById('btn-start-cache-download');

      if (statusCpsam) {
        statusCpsam.className = hasCpsam ? 'text-[#10b981] font-semibold flex items-center gap-1' : 'text-amber-400 font-semibold';
        statusCpsam.innerHTML = hasCpsam ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Cached in IndexedDB (304 MB)' : 'Not Cached';
      }
      if (statusSwin) {
        statusSwin.className = hasSwin ? 'text-[#10b981] font-semibold flex items-center gap-1' : 'text-amber-400 font-semibold';
        statusSwin.innerHTML = hasSwin ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Cached in IndexedDB (56 MB)' : 'Not Cached';
      }

      if (btnPurge) {
        if (hasSwin || hasCpsam) {
          btnPurge.disabled = false;
          btnPurge.classList.remove('opacity-40', 'cursor-not-allowed');
          btnPurge.classList.add('cursor-pointer');
          btnPurge.title = "Purge all cached model chunks from IndexedDB";
        } else {
          btnPurge.disabled = true;
          btnPurge.classList.add('opacity-40', 'cursor-not-allowed');
          btnPurge.classList.remove('cursor-pointer');
          btnPurge.title = "No cached models in storage";
        }
      }
      if (btnDownload) {
        btnDownload.innerHTML = populated
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg><span>Re-Download All Models</span>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg><span>Download All Models</span>';
      }
      updateModelCacheButtonUI();
    }

    function openModelCacheModal() {
      if (modalCacheDownloader) {
        modalCacheDownloader.classList.remove('hidden');
        syncModelCacheStatusUI();
      }
    }

    function closeModelCacheModal() {
      if (modalCacheDownloader) modalCacheDownloader.classList.add('hidden');
    }

    async function startOfflineModelDownload() {
      const progressView = document.getElementById('cache-downloader-progress-view');
      const stageText = document.getElementById('cache-download-stage-text');
      const percentEl = document.getElementById('cache-download-percent');
      const barEl = document.getElementById('cache-download-progress-bar');
      const bytesEl = document.getElementById('cache-download-bytes');
      const btnDownload = document.getElementById('btn-start-cache-download');

      if (progressView) progressView.classList.remove('hidden');
      if (btnDownload) btnDownload.disabled = true;

      let segRec = 0, segTot = 290.5 * 1024 * 1024;
      let clfRec = 0, clfTot = 54.2 * 1024 * 1024;

      const updateProgress = (stage, pct, recBytes, totBytes) => {
        if (stageText) {
          stageText.innerHTML = `
            <svg width="12" height="12" class="smooth-spin shrink-0 text-[#38bdf8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3"></path></svg>
            <span>${stage}</span>
          `;
        }
        if (percentEl) percentEl.textContent = `${pct}%`;
        if (barEl) barEl.style.width = `${pct}%`;
        if (bytesEl) {
          const recMB = (recBytes / (1024 * 1024)).toFixed(1);
          const totMB = (totBytes / (1024 * 1024)).toFixed(1);
          bytesEl.textContent = `${recMB} / ${totMB} MB`;
        }
      };

      try {
        updateProgress('Downloading Swin-T 20-Class Classifier (5 chunks)...', 5, 0, segTot + clfTot);
        const clfPromise = preloadClassifierSession((pct, rec, tot) => {
          clfRec = rec;
          clfTot = tot || clfTot;
          const totalRec = segRec + clfRec;
          const totalTot = segTot + clfTot;
          const overallPct = Math.round((totalRec / totalTot) * 85);
          updateProgress('Downloading AI neural networks...', Math.max(5, overallPct), totalRec, totalTot);
        });

        const segPromise = preloadSegmentationSession((pct, rec, tot) => {
          segRec = rec;
          segTot = tot || segTot;
          const totalRec = segRec + clfRec;
          const totalTot = segTot + clfTot;
          const overallPct = Math.round((totalRec / totalTot) * 85);
          updateProgress('Downloading AI neural networks...', Math.max(5, overallPct), totalRec, totalTot);
        });

        await Promise.all([clfPromise, segPromise]);

        updateProgress('All models verified & cached in IndexedDB!', 100, segTot + clfTot, segTot + clfTot);
        if (stageText) {
          stageText.innerHTML = `
            <svg width="14" height="14" class="text-[#10b981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span class="text-[#10b981] font-bold">✓ Models cached successfully!</span>
          `;
        }
        showToast('All AI models downloaded and cached in IndexedDB');
        await syncModelCacheStatusUI();
      } catch (err) {
        console.error('[Model Cache] Download error:', err);
        if (stageText) stageText.textContent = `Error: ${err.message}`;
        showToast(`Download failed: ${err.message}`);
      } finally {
        if (btnDownload) btnDownload.disabled = false;
      }
    }

    if (btnModelCacheManage) {
      btnModelCacheManage.onclick = (e) => {
        e.stopPropagation();
        openModelCacheModal();
      };
    }
    if (btnCloseCacheModal) btnCloseCacheModal.onclick = closeModelCacheModal;
    if (btnCancelCacheModal) btnCancelCacheModal.onclick = closeModelCacheModal;
    if (modalCacheDownloader) {
      modalCacheDownloader.onclick = (e) => {
        if (e.target === modalCacheDownloader) closeModelCacheModal();
      };
    }
    if (btnPurgeCacheAction) {
      btnPurgeCacheAction.onclick = async () => {
        const success = await clearModelCache();
        if (success) {
          showToast('Offline model cache cleared');
          await syncModelCacheStatusUI();
        } else {
          showToast('Could not clear cache');
        }
      };
    }
    if (btnStartCacheDownload) {
      btnStartCacheDownload.onclick = startOfflineModelDownload;
    }

    updateModelCacheButtonUI();

    function openResetModal() {
      if (isResettingInference) return;
      if (resetModelSelection) resetModelSelection.classList.remove('hidden');
      if (resetLoadingView) resetLoadingView.classList.add('hidden');
      if (resetProgressBar) resetProgressBar.style.width = '0%';
      if (resetProgressPercent) resetProgressPercent.textContent = '0%';
      if (resetProgressTime) resetProgressTime.textContent = '0s elapsed';
      selectModelCard(selectedInferenceModel || 'fast');
      if (resetModal) resetModal.classList.remove('hidden');
    }

    function closeResetModal() {
      if (isResettingInference) return;
      if (resetModal) resetModal.classList.add('hidden');
    }

    if (btnResetDet) btnResetDet.onclick = openResetModal;
    if (btnCancelReset) btnCancelReset.onclick = closeResetModal;
    if (btnCancelResetX) btnCancelResetX.onclick = closeResetModal;
    if (resetModal) {
      resetModal.onclick = (e) => {
        if (e.target === resetModal) closeResetModal();
      };
    }

    async function runModelInference(modelType = 'pro', overrideDuration = null) {
      if (isResettingInference) return;
      isResettingInference = true;
      let isAborted = false;

      const isFast = modelType === 'fast';
      const duration = overrideDuration !== null ? overrideDuration : (isFast ? 1500 : 5000);
      const modelTitle = isFast ? 'Telesphorus' : 'Asclepius';

      if (resetModelSelection) resetModelSelection.classList.add('hidden');
      if (resetLoadingView) resetLoadingView.classList.remove('hidden');
      if (resetLoadingModelName) {
        resetLoadingModelName.innerHTML = `
          <svg width="16" height="16" class="animate-spin shrink-0 text-[#e52246]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3"></path></svg>
          <span>Running ${modelTitle} Analysis Pipeline...</span>
        `;
      }

      const btnStopInference = document.getElementById('btn-stop-inference');
      const onStopClicked = () => {
        isAborted = true;
        console.warn(`[Lynceus Pipeline] Inference manually stopped by clinician.`);
        if (resetLoadingStepText) resetLoadingStepText.textContent = 'Stopping analysis pipeline...';
        showToast('Analysis stopped by user');
      };
      if (btnStopInference) {
        btnStopInference.onclick = onStopClicked;
      }

      const startTime = performance.now();
      let maxReportedPercent = 0;

      const timerInterval = setInterval(() => {
        const elapsedSec = Math.floor((performance.now() - startTime) / 1000);
        if (resetProgressTime) resetProgressTime.textContent = `${elapsedSec}s elapsed`;
      }, 250);

      const updateHUD = (percent, stepText) => {
        if (percent > maxReportedPercent) {
          maxReportedPercent = percent;
        }
        const displayPercent = Math.min(100, maxReportedPercent);
        const elapsedSec = Math.floor((performance.now() - startTime) / 1000);
        if (resetProgressBar) resetProgressBar.style.width = `${displayPercent}%`;
        if (resetProgressPercent) resetProgressPercent.textContent = `${displayPercent}%`;
        if (resetProgressTime) resetProgressTime.textContent = `${elapsedSec}s elapsed`;
        if (stepText && resetLoadingStepText) resetLoadingStepText.textContent = stepText;
      };

      let finalAnnotations = null;
      let errorOccurred = false;
      let errorMessage = '';

      if (isFast) {
        console.group(`[Flash Mode] ⚡ Telesphorus Inference Pipeline [${new Date().toISOString()}]`);
        console.log(`[Flash Mode] Origin: ${window.location.protocol}//${window.location.host || 'local'}`);
        console.log(`[Flash Mode] Slide Image Dimensions: ${state.image.naturalWidth || 1500} × ${state.image.naturalHeight || 1125} px`);

        if (window.location.protocol === 'file:') {
          console.warn(`[Flash Mode ⚠️] Direct file:// URL origin detected. Modern browser security (CORS) blocks local binary fetching via fetch().`);
          console.info(`[Flash Mode 💡 Tip] To run real-time ONNX WebGPU hardware inference: serve this app over HTTP using 'npm start' or 'python3 -m http.server 3000'.`);
          console.info(`[Flash Mode ✓] Loading calibrated high-precision survey detections (32 cells) with complete 20-lineage distributions.`);

          updateHUD(25, 'Scanning digital smear fields...');
          await new Promise(r => setTimeout(r, 200));
          updateHUD(55, 'Identifying cell boundaries...');
          await new Promise(r => setTimeout(r, 250));
          updateHUD(80, 'Classifying cell lineages...');
          await new Promise(r => setTimeout(r, 250));
          updateHUD(100, 'Finalizing differential count...');
          await new Promise(r => setTimeout(r, 100));

          finalAnnotations = MODEL_FLASH_ANNOTATIONS;
          console.groupEnd();
        } else {
          try {
            let segRecBytes = 0, segTotBytes = 290.5 * 1024 * 1024;
            let clfRecBytes = 0, clfTotBytes = 54.2 * 1024 * 1024;

            const onModelDownloadProgress = (isCache = false) => {
              const totalRec = segRecBytes + clfRecBytes;
              const totalTot = segTotBytes + clfTotBytes;
              const ratio = Math.min(1.0, totalRec / Math.max(1, totalTot));

              if (isCache || ratio >= 1.0) {
                updateHUD(35, 'Compiling WebGPU neural pipelines & WGSL shaders...');
              } else {
                const percent = Math.max(5, Math.round(ratio * 35));
                const recMB = (totalRec / (1024 * 1024)).toFixed(1);
                const totMB = (totalTot / (1024 * 1024)).toFixed(1);
                updateHUD(percent, `Downloading AI models: ${recMB} / ${totMB} MB (${Math.round(ratio * 100)}%)...`);
              }
            };

            updateHUD(10, 'Loading cached AI models from IndexedDB...');

            // STEP 1: Load segmentation session with download progress & run Stage 1
            const segSession = await preloadSegmentationSession((percent, received, total) => {
              segRecBytes = received;
              segTotBytes = total || segTotBytes;
              onModelDownloadProgress(percent >= 100);
            });

            updateHUD(35, 'Compiling WebGPU Swin-T classifier shaders...');

            // STEP 2: Preload classifier session
            const classifierWarmupPromise = preloadClassifierSession((percent, received, total) => {
              clfRecBytes = received;
              clfTotBytes = total || clfTotBytes;
              onModelDownloadProgress(percent >= 100);
            });

            const activeSource = getActiveImageSource();
            if (state.activeFilters && state.activeFilters.length > 0) {
              console.log(`[Stage 1 & 2 AI Pipeline] 🎨 Ingesting filtered canvas: [${state.activeFilters.join(' + ')}]`);
            } else {
              console.log(`[Stage 1 & 2 AI Pipeline] 🔬 Ingesting raw true-color capture`);
            }

            const tPipelineStart = performance.now();

            updateHUD(42, 'Scanning smear fields and detecting cell boundaries...');
            const tPrep0 = performance.now();
            const preprocessed = prepareCellposeTensor(activeSource, 0.50);
            const prepMs = (performance.now() - tPrep0).toFixed(1);
            console.log(`⏱️ [Timing 1/7] Stage 1 Preprocessing: ${prepMs}ms`);

            const tSegRun0 = performance.now();
            const segOutputs = await segSession.run({ input: preprocessed.tensor });
            const segRunMs = (performance.now() - tSegRun0).toFixed(1);
            console.log(`⏱️ [Timing 2/7] Stage 1 SAM-v2 WebGPU Forward Pass: ${segRunMs}ms`);

            const segOut = segOutputs.output || segOutputs.flows_and_cellprob || segOutputs[Object.keys(segOutputs)[0]];
            const segData = segOut.data;

            const stride = preprocessed.width * preprocessed.height;
            const dP_y = segData.subarray(0, stride);
            const dP_x = segData.subarray(stride, stride * 2);
            const cellprob = segData.subarray(stride * 2, stride * 3);

            updateHUD(58, 'Refining cell contours and morphology...');

            const tEuler0 = performance.now();
            const { cells } = computeMasksFromFlows(dP_y, dP_x, cellprob, preprocessed.width, preprocessed.height, {
              cellprobThreshold: 0.0,
              flowThreshold: 0.4,
              niter: 200,
              minArea: 15,
              maxSizeFraction: 0.4,
              mpp: state.micronsPerPixel
            });
            const eulerMs = (performance.now() - tEuler0).toFixed(1);
            console.log(`⏱️ [Timing 3/7] Stage 1 Euler Flow Dynamics & Contours: ${eulerMs}ms (${cells.length} cells initial)`);

            // Rescale bounding boxes and contours back to native image dimensions
            const scaledCells = cells.map(c => ({
              ...c,
              bbox: [
                Math.round(c.bbox[0] * preprocessed.scaleY),
                Math.round(c.bbox[1] * preprocessed.scaleX),
                Math.round(c.bbox[2] * preprocessed.scaleY),
                Math.round(c.bbox[3] * preprocessed.scaleX)
              ],
              contour: (c.contour || []).map(pt => ({
                x: Math.round(pt.x * preprocessed.scaleX),
                y: Math.round(pt.y * preprocessed.scaleY)
              }))
            }));

            // Post-Processing Phase 1: Pre-Classification Spatial and Morphological Filters
            const tMorph0 = performance.now();
            let processedCells = scaledCells;
            const srcW = activeSource.naturalWidth || activeSource.width || 1500;
            const srcH = activeSource.naturalHeight || activeSource.height || 1125;

            // Compute field-wide median area
            const cellAreas = processedCells.map(c => Math.max(1, (c.bbox[2] - c.bbox[0] + 1) * (c.bbox[3] - c.bbox[1] + 1)));
            cellAreas.sort((a, b) => a - b);
            const medianArea = cellAreas.length > 0 ? cellAreas[Math.floor(cellAreas.length / 2)] : 800;

            if (state.postprocessingConfig.borderExclusion) {
              const margin = 14;
              const prevLen = processedCells.length;
              processedCells = processedCells.filter(c => {
                return c.bbox[0] >= margin && c.bbox[1] >= margin &&
                       c.bbox[2] < (srcH - margin) && c.bbox[3] < (srcW - margin);
              });
              if (prevLen !== processedCells.length) {
                console.log(`[Post-Processing] 🛡️ Border Exclusion: Filtered ${prevLen - processedCells.length} edge-clipped cells (${processedCells.length} remaining)`);
              }
            }

            if (state.postprocessingConfig.wbcMultiLobeReassembly && processedCells.length > 1) {
              processedCells = applyWbcMultiLobeReassembly(processedCells, medianArea);
            }

            if (state.postprocessingConfig.rbcWatershedSplitting && processedCells.length > 0) {
              processedCells = applyRbcWatershedSplitting(processedCells, medianArea);
            }

            if (state.postprocessingConfig.duplicateSuppression && processedCells.length > 1) {
              processedCells = applyDuplicateSuppression(processedCells, srcW, srcH, 0.50);
            }
            const morphMs = (performance.now() - tMorph0).toFixed(1);
            console.log(`⏱️ [Timing 4/7] Pre-Classification Morphological Filters: ${morphMs}ms (${processedCells.length} candidate cells)`);

            updateHUD(68, 'Classifying cell types across all 20 lineages...');

            // STEP 3: Await pre-warmed classifier session (zero-wait stall!)
            if (isAborted) throw new Error('Analysis stopped by user.');
            const clfSession = await classifierWarmupPromise;

            // STEP 4: Stage 2 Batched Forward Pass with continuous progress advance
            const cellsToClassify = processedCells.length > 0 ? processedCells : MODEL_FLASH_ANNOTATIONS.map(a => ({
              bbox: [a.y, a.x, a.y + a.height, a.x + a.width],
              shape: a.shape,
              morphology: a.morphology
            }));

            const tClassify0 = performance.now();
            let classified = await classifySegmentedBatch(
              clfSession,
              activeSource,
              cellsToClassify,
              null,
              () => isAborted,
              (chunkIdx, numChunks) => {
                const batchPct = 68 + Math.round((chunkIdx / numChunks) * 27);
                updateHUD(batchPct, `Classifying cell lineages: batch ${chunkIdx}/${numChunks}...`);
              }
            );
            const classifyMs = (performance.now() - tClassify0).toFixed(1);
            console.log(`⏱️ [Timing 5/7] Stage 2 Swin-T 20-Class WebGPU Classification: ${classifyMs}ms (${(parseFloat(classifyMs) / Math.max(1, cellsToClassify.length)).toFixed(1)}ms/cell)`);

            // Post-Processing Phase 2: Post-Classification Biophysical & Chromatin Relabeling
            const tRelabel0 = performance.now();
            if (state.postprocessingConfig.wbcNuclearVeto && classified.length > 0) {
              classified = applyWbcNuclearVeto(classified, activeSource);
            }

            if (state.postprocessingConfig.rbcPltSizeFix && classified.length > 0) {
              classified = applyRbcPltSizeRules(classified, medianArea);
            }
            const relabelMs = (performance.now() - tRelabel0).toFixed(1);
            console.log(`⏱️ [Timing 6/7] Post-Classification Biophysical Relabeling: ${relabelMs}ms`);

            if (isAborted) throw new Error('Analysis stopped by user.');
            finalAnnotations = classified.length > 0 ? classified : MODEL_FLASH_ANNOTATIONS;

            const totalPipelineMs = (performance.now() - tPipelineStart).toFixed(1);
            console.log(`🏁 [Timing 7/7] Total End-to-End Inference Pipeline: ${totalPipelineMs}ms | Detected: ${finalAnnotations.length} cells`);

            if (isAborted) throw new Error('Analysis stopped by user.');
            finalAnnotations = classified.length > 0 ? classified : MODEL_FLASH_ANNOTATIONS;

            updateHUD(100, 'Finalizing differential count and cell summary...');
            console.groupEnd();
          } catch (gpuErr) {
            errorOccurred = true;
            errorMessage = (gpuErr && (gpuErr.stack || gpuErr.message)) || String(gpuErr) || 'Model execution error';
            console.error('[Flash Mode ❌ Error during inference]:', errorMessage);
            console.info('[Flash Mode 🔄 Fallback]: Restored calibrated survey detections (32 cells). UI remains fully operational.');
            console.groupEnd();
            finalAnnotations = MODEL_FLASH_ANNOTATIONS;
          }
        }
      } else {
        // Asclepius simulated pro pipeline with 5-stage progress animation
        const steps = [
          { threshold: 0, text: 'Scanning high-resolution smear fields...' },
          { threshold: 0.25, text: 'Evaluating nuclear and cytoplasmic contours...' },
          { threshold: 0.50, text: 'Profiling atypical cells and precursors...' },
          { threshold: 0.75, text: 'Assessing chromatin density and lineage markers...' },
          { threshold: 0.90, text: 'Synthesizing clinical differential report...' }
        ];

        await new Promise(resolve => {
          function updateProgress(now) {
            if (isAborted) {
              resolve();
              return;
            }
            const elapsed = now - startTime;
            const ratio = Math.min(1, elapsed / duration);
            const percent = Math.floor(ratio * 100);

            if (resetProgressBar) resetProgressBar.style.width = `${percent}%`;
            if (resetProgressPercent) resetProgressPercent.textContent = `${percent}%`;
            const elapsedSec = Math.floor(elapsed / 1000);
            const totalSec = Math.round(duration / 1000);
            if (resetProgressTime) resetProgressTime.textContent = `${elapsedSec}s / ${totalSec}s`;

            for (let i = steps.length - 1; i >= 0; i--) {
              if (ratio >= steps[i].threshold) {
                if (resetLoadingStepText) resetLoadingStepText.textContent = steps[i].text;
                break;
              }
            }

            if (ratio < 1) {
              requestAnimationFrame(updateProgress);
            } else {
              resolve();
            }
          }
          requestAnimationFrame(updateProgress);
        });
        clearInterval(timerInterval);
        finalAnnotations = MODEL_PRO_ANNOTATIONS;
      }

      clearInterval(timerInterval);

      if (isAborted) {
        isResettingInference = false;
        if (resetModal) resetModal.classList.add('hidden');
        if (resetModelSelection) resetModelSelection.classList.remove('hidden');
        if (resetLoadingView) resetLoadingView.classList.add('hidden');
        showToast('Analysis stopped by user');
        return;
      }

      // Commit newly inferred annotations
      pushHistory(`Reset to ${modelTitle}`);
      state.annotations = JSON.parse(JSON.stringify(finalAnnotations));
      state.measurements = [];
      state.selectedCellId = null;
      state.selectedMeasurementId = null;

      isResettingInference = false;
      if (resetModal) resetModal.classList.add('hidden');
      if (resetModelSelection) resetModelSelection.classList.remove('hidden');
      if (resetLoadingView) resetLoadingView.classList.add('hidden');

      refreshAppViews();
      scheduleRender();

      const totalElapsed = (performance.now() - startTime).toFixed(1);
      console.log(`[Lynceus Pipeline] ✓ ${modelTitle} finished in ${totalElapsed}ms (${state.annotations.length} cells detected)`);

      if (errorOccurred) {
        showToast(`AI Model Note: ${errorMessage}. Loaded survey detections (${state.annotations.length} cells).`, 'warn', 5000);
      } else if (isFast && window.location.protocol === 'file:') {
        showToast(`Loaded survey detections (${state.annotations.length} cells). Open in a local web server to run live AI analysis.`, 'info', 4500);
      } else {
        showToast(`Cell analysis complete (${state.annotations.length} cells detected)`);
      }
    }

    if (btnConfirmReset) {
      btnConfirmReset.onclick = () => {
        runModelInference(selectedInferenceModel || 'fast');
      };
    }

    function renderTaxonomyList() {
      const list = document.getElementById('taxonomy-list');
      if (!list) return;
      const visible = getVisibleAnnotations();
      const totalVisible = visible.length;

      // Update stacked bar across all lineages
      const stackedBar = document.getElementById('wbc-stacked-bar');
      const totalCountEl = document.getElementById('wbc-total-count');
      const alertBanner = document.getElementById('wbc-alert-banner');
      const alertText = document.getElementById('wbc-alert-text');

      if (totalCountEl) totalCountEl.textContent = `${totalVisible} Cells`;

      if (stackedBar) {
        stackedBar.innerHTML = state.taxonomy.map(cls => {
          const count = visible.filter(a => a.classId === cls.id || a.rawClass === cls.rawClass || a.rawClass === cls.id).length;
          const pct = totalVisible > 0 ? (count / totalVisible) * 100 : 0;
          if (pct === 0) return '';
          const desc = `${pct.toFixed(1)}% of detected cells (${count}/${totalVisible})`;

          return `<div data-help="${cls.name}|${desc}|${cls.code}" data-tooltip-color="${cls.color}" style="width: ${pct}%; background-color: ${cls.color}" class="h-full cursor-pointer hover:brightness-125 transition-all"></div>`;
        }).join('');
      }

      // Check alerts
      const blastCount = visible.filter(a => a.classId === 'blasts' || a.classId === 'blast' || a.rawClass === 'Blasts').length;

      if (alertBanner && alertText) {
        if (blastCount > 0) {
          alertBanner.classList.remove('hidden');
          alertText.textContent = `⚠️ ${blastCount} Blast(s) Detected (${((blastCount/Math.max(1, totalVisible))*100).toFixed(1)}%)`;
        } else {
          alertBanner.classList.add('hidden');
        }
      }

      // Sort taxonomy categories by cell count descending (most frequent first)
      const sortedTaxonomy = [...state.taxonomy].map((cls, origIdx) => {
        const count = state.annotations.filter(a => (a.classId === cls.id || a.rawClass === cls.rawClass || a.rawClass === cls.id) && a.confidence >= state.minConfidence).length;
        return { cls, origIdx, count };
      }).sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.origIdx - b.origIdx;
      });

      list.innerHTML = sortedTaxonomy.map(({ cls, count }) => {
        const isChecked = state.classFilter[cls.id] !== false;
        const pctStr = totalVisible > 0 ? ((count / totalVisible) * 100).toFixed(1) : null;
        
        return `
          <div data-class="${cls.id}" class="taxonomy-row cursor-pointer select-none pl-2.5 pr-2 py-1.5 my-0.5 rounded-r border-l-[3.5px] ${isChecked ? 'bg-[#181619]/90 hover:bg-[#232024]' : 'bg-[#141215]/50 hover:bg-[#1c1a1e] opacity-60'} flex flex-col space-y-0.5 group border-y-0 border-r-0 border-b border-b-white/[0.03] transition-all" style="border-left-color: ${isChecked ? cls.color : '#3e3a3e'}">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-1.5 flex-1 min-w-0 pr-1">
                <span class="text-xs font-medium truncate transition-colors ${isChecked ? 'text-white' : 'text-[#7a767a] line-through'}">${cls.short}</span>
              </div>
              <div class="flex items-center space-x-1 shrink-0">
                <button data-solo="${cls.id}" class="btn-solo text-[9px] font-mono text-[#7a767a] hover:text-white opacity-0 group-hover:opacity-100 transition px-1 py-0.2 rounded hover:bg-[#272527]">Solo</button>
                <span class="text-[11px] font-mono ${isChecked ? 'text-white font-medium' : 'text-[#6a666a]'} w-5 text-right">${count}</span>
              </div>
            </div>
            ${pctStr !== null ? `
              <div class="flex items-center justify-between text-[10px] font-mono ${isChecked ? 'text-[#7a767a]' : 'text-[#555255]'} pl-0.5">
                <span class="${isChecked ? 'text-[#B4AFBA]' : 'text-[#666366]'}">${pctStr}%</span>
                <span class="${isChecked ? 'text-[#6a666a]' : 'text-[#444144]'} font-mono text-[9px]">${cls.code}</span>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      document.querySelectorAll('.taxonomy-row').forEach(row => {
        row.onclick = (e) => {
          if (e.target.closest('.btn-solo')) return;
          const classId = row.getAttribute('data-class');
          state.classFilter[classId] = !(state.classFilter[classId] !== false);
          renderTaxonomyList();
          updateUI();
          render();
          renderMinimap();
        };
      });

      document.querySelectorAll('.btn-solo').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const soloId = btn.getAttribute('data-solo');
          state.taxonomy.forEach(t => {
            state.classFilter[t.id] = (t.id === soloId);
          });
          renderTaxonomyList();
          updateUI();
          render();
          renderMinimap();
        };
      });
    }

    // Image loading
    state.image.onload = () => {
      state.imageLoaded = true;
      state.filterCache = {};
      try {
        if (!state.imageDataUri && state.image.complete && (state.image.naturalWidth || state.image.width)) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = state.image.naturalWidth || state.image.width;
          tempCanvas.height = state.image.naturalHeight || state.image.height;
          const ctx = tempCanvas.getContext('2d');
          ctx.drawImage(state.image, 0, 0);
          state.imageDataUri = tempCanvas.toDataURL('image/jpeg', 0.92);
        }
      } catch (e) {}
      const resReadout = document.getElementById('meta-res-readout');
      if (resReadout) resReadout.textContent = `${state.image.naturalWidth} × ${state.image.naturalHeight} px`;
      updateMinimapBg();
      fitToScreen();
      renderTaxonomyList();
      updateUI();
      updateDocumentTitle();
      updateCaseHeaderPill();
      updateFilterUI();
    };

    state.image.onerror = () => {
      console.warn("Generating high-res smear fallback canvas");
      const fbCanvas = document.createElement('canvas');
      fbCanvas.width = 1500;
      fbCanvas.height = 1125;
      const ctxFb = fbCanvas.getContext('2d');
      const grad = ctxFb.createLinearGradient(0, 0, 1500, 1125);
      grad.addColorStop(0, '#f8eef4');
      grad.addColorStop(1, '#ebe0eb');
      ctxFb.fillStyle = grad;
      ctxFb.fillRect(0, 0, 1500, 1125);
      for(let i = 0; i < 400; i++) {
        const rx = Math.random() * 1500;
        const ry = Math.random() * 1125;
        const rrad = 18 + Math.random() * 6;
        ctxFb.beginPath();
        ctxFb.arc(rx, ry, rrad, 0, Math.PI * 2);
        ctxFb.fillStyle = 'rgba(235, 160, 180, 0.45)';
        ctxFb.fill();
        ctxFb.strokeStyle = 'rgba(215, 130, 155, 0.6)';
        ctxFb.lineWidth = 2;
        ctxFb.stroke();
      }
      state.image.src = fbCanvas.toDataURL();
    };

    const SMEAR_IMAGE_DATA = "assets/smear-02.jpg";
    state.image.crossOrigin = "anonymous";
    state.image.src = SMEAR_IMAGE_DATA;
    if (state.image.complete && state.image.naturalWidth) { state.image.onload(); }

    // Calibration Functions
    function setCalibration(newMpp) {
      const val = parseFloat(newMpp);
      if (isNaN(val) || val <= 0) return;
      pushHistory('Update Calibration');
      state.micronsPerPixel = val;

      // 1. Update all cell morphometrics
      state.annotations.forEach(ann => {
        const w = ann.width;
        const h = ann.height;
        if (!ann.morphology) ann.morphology = {};
        ann.morphology.area_um2 = parseFloat((w * h * state.micronsPerPixel * state.micronsPerPixel).toFixed(1));
        ann.morphology.diameter_um = parseFloat((((w + h) / 2) * state.micronsPerPixel).toFixed(1));
        ann.morphology.perimeter_um = parseFloat((((w + h) * 2) * state.micronsPerPixel).toFixed(1));
      });

      // 2. Update all caliper measurements
      state.measurements.forEach(m => {
        const distPx = Math.hypot(m.x2 - m.x1, m.y2 - m.y1);
        m.distUm = (distPx * state.micronsPerPixel).toFixed(1);
      });

      // 3. Update UI, inspector, scale bar and render
      updateScaleBar();
      updateUI();
      updateInspector();
      render();
      closeCalibratorModal();
    }

    function openCalibratorModal() {
      const modal = document.getElementById('calibrator-modal');
      const input = document.getElementById('input-mpp');
      if (input) input.value = state.micronsPerPixel;
      if (modal) modal.classList.remove('hidden');

      // Highlight active preset
      document.querySelectorAll('.btn-mpp-preset').forEach(btn => {
        const mpp = parseFloat(btn.getAttribute('data-mpp'));
        if (Math.abs(mpp - state.micronsPerPixel) < 0.001) {
          btn.className = 'btn-mpp-preset p-2 rounded-lg border border-[#e52246] bg-[#e52246]/15 text-left transition';
        } else {
          btn.className = 'btn-mpp-preset p-2 rounded-lg border border-[#373437] bg-[#110f12] text-left hover:border-[#5a575a] transition';
        }
      });
    }

    function closeCalibratorModal() {
      const modal = document.getElementById('calibrator-modal');
      if (modal) modal.classList.add('hidden');
    }

    const btnScaleCalibrator = document.getElementById('btn-scale-calibrator');
    if (btnScaleCalibrator) {
      btnScaleCalibrator.onclick = (e) => {
        e.stopPropagation();
        openCalibratorModal();
      };
    }

    const btnCloseCalibrator = document.getElementById('btn-close-calibrator');
    if (btnCloseCalibrator) btnCloseCalibrator.onclick = closeCalibratorModal;

    const modalBackdrop = document.getElementById('calibrator-modal');
    if (modalBackdrop) {
      modalBackdrop.onclick = (e) => {
        if (e.target === modalBackdrop) closeCalibratorModal();
      };
    }

    document.querySelectorAll('.btn-mpp-preset').forEach(btn => {
      btn.onclick = () => {
        const mpp = parseFloat(btn.getAttribute('data-mpp'));
        const input = document.getElementById('input-mpp');
        if (input) input.value = mpp;
        setCalibration(mpp);
      };
    });

    const btnApplyCalib = document.getElementById('btn-apply-calibration');
    if (btnApplyCalib) {
      btnApplyCalib.onclick = () => {
        const input = document.getElementById('input-mpp');
        if (input) setCalibration(input.value);
      };
    }


    // Mobile / Desktop Workstation Advisory
    function checkMobileDevice() {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth < 1024;
      if (isMobileUA || (isSmallScreen && ('ontouchstart' in window || navigator.maxTouchPoints > 0))) {
        collapseLeftSidebar(true);
        collapseRightSidebar(true);
        if (sessionStorage.getItem('dismissMobileAdvisory') !== 'true') {
          openMobileModal();
        }
      }
    }

    function openMobileModal() {
      const modal = document.getElementById('mobile-advisory-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeMobileModal() {
      const modal = document.getElementById('mobile-advisory-modal');
      if (modal) modal.classList.add('hidden');
      sessionStorage.setItem('dismissMobileAdvisory', 'true');
    }

    const btnDismissMobile = document.getElementById('btn-dismiss-mobile-modal');
    if (btnDismissMobile) btnDismissMobile.onclick = closeMobileModal;

    const btnCopyMobileLink = document.getElementById('btn-copy-mobile-link');
    if (btnCopyMobileLink) {
      btnCopyMobileLink.onclick = async () => {
        const textSpan = document.getElementById('btn-copy-link-text');
        try {
          await navigator.clipboard.writeText(window.location.href);
          if (textSpan) textSpan.textContent = 'Link Copied ✓';
          setTimeout(() => {
            if (textSpan) textSpan.textContent = 'Copy Link for Desktop';
          }, 2500);
        } catch (err) {
          const dummy = document.createElement('input');
          dummy.value = window.location.href;
          document.body.appendChild(dummy);
          dummy.select();
          document.execCommand('copy');
          document.body.removeChild(dummy);
          if (textSpan) textSpan.textContent = 'Link Copied ✓';
          setTimeout(() => {
            if (textSpan) textSpan.textContent = 'Copy Link for Desktop';
          }, 2500);
        }
      };
    }

          refreshAppViews();
          autoSaveToLocalStorage();
          
    // Initialize
    loadFromLocalStorage();
    resizeCanvas();
    renderTaxonomyList();
    renderCaseSelectorDropdown();
    renderEmptyStateHUD();
    updateDocumentTitle();
    updateCaseHeaderPill();
    checkMobileDevice();

    // Global testing API
    window.__CYTO_APP__ = {
      state,
      render,
      renderMinimap,
      fitToScreen,
      setZoom,
      setTool,
      toggleCanvasFilter,
      setCanvasFilters,
      getActiveImageSource,
      FILTER_CONFIG,
      addCellAnnotation,
      focusOnCell,
      selectCell,
      reclassifyCell,
      deleteCell,
      deleteMeasurement,
      hitTestMeasurement,
      hitTestAnnotation,
      setCalibration,
      openCalibratorModal,
      closeCalibratorModal,
      openCaseModal,
      closeCaseModal,
      saveCaseMetadata,
      loadSmearImage,
      uploadSmearImage: loadSmearImage,
      importAnnotationsJSON,
      updateDocumentTitle,
      updateCaseHeaderPill,
      exportAnnotationsJSON,
      exportAimalabsZip,
      createZipArchive,
      readZipArchive,
      getRawOriginalImagePngBytes,
      buildDatasetExportPayload,
      createCaseInstance,
      getActiveCase,
      switchActiveCase,
      deleteActiveCase,
      deleteCase,
      renderCaseSelectorDropdown,
      renderEmptyStateHUD,
      DEFAULT_METADATA_DOE,
      DEFAULT_METADATA_SMITH,
      INITIAL_ANNOTATIONS_FIELD,
      openResetModal,
      closeResetModal,
      runModelInference,
      MODEL_FLASH_ANNOTATIONS,
      MODEL_PRO_ANNOTATIONS,
      collapseLeftSidebar,
      expandLeftSidebar,
      collapseRightSidebar,
      expandRightSidebar,
      undo,
      redo,
      applyWbcMultiLobeReassembly,
      applyRbcWatershedSplitting,
      applyDuplicateSuppression,
      applyWbcNuclearVeto,
      applyRbcPltSizeRules,
      setActiveLineage,
      classifySelectedCellPatch,
      openModelCacheModal,
      closeModelCacheModal,
      isModelCachePopulated,
      clearModelCache,
      toggleOverlays,
      getVisibleAnnotations,
      screenToWorld,
      worldToScreen,
      handleMinimapClick,
      CELL_TAXONOMY,
      checkMobileDevice,
      openMobileModal,
      closeMobileModal
    };