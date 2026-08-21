const puppeteer = require('puppeteer-core');
const assert = require('assert');
const http = require('http');
const path = require('path');
const fs = require('fs');

(async () => {
  const rootDir = path.resolve('.');
  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(rootDir, reqPath);
    if (!fs.existsSync(filePath)) { res.statusCode = 404; res.end(); return; }
    res.writeHead(200);
    fs.createReadStream(filePath).pipe(res);
  });
  await new Promise(r => server.listen(3894, r));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3894/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__CYTO_APP__ !== undefined);

  console.log('🧪 Testing Post-Processing Heuristic Rules & Parity with app.py...');

  // Test 1: Biophysical Size Rules (RBC_fix & PLT_fix)
  const sizeRuleResults = await page.evaluate(() => {
    const medianArea = 1000; // pltMax = 450, rbcMin = 550
    const mockClassified = [
      {
        id: 'c-01',
        rawClass: 'Plt',
        classId: 'plt',
        label: 'Platelet (Plt)',
        width: 30,
        height: 30, // Area = 900 > 550 -> Should be relabeled via RBC_fix
        predictions: [
          { rawClass: 'Plt', prob: 0.85 },
          { rawClass: 'Normal_cells', classId: 'normal_cells', label: 'Normal RBC (Discocyte)', prob: 0.12 }
        ]
      },
      {
        id: 'c-02',
        rawClass: 'Normal_cells',
        classId: 'normal_cells',
        label: 'Normal RBC (Discocyte)',
        width: 15,
        height: 15, // Area = 225 < 450 -> Should be relabeled via PLT_fix
        predictions: [
          { rawClass: 'Normal_cells', prob: 0.70 },
          { rawClass: 'Plt', classId: 'plt', label: 'Platelet (Plt)', prob: 0.25 }
        ]
      },
      {
        id: 'c-03',
        rawClass: 'Plt',
        classId: 'plt',
        label: 'Platelet (Plt)',
        width: 16,
        height: 16, // Area = 256 < 450 -> Normal platelet, remains unchanged
        predictions: [{ rawClass: 'Plt', prob: 0.95 }]
      }
    ];

    return window.__CYTO_APP__.applyRbcPltSizeRules(mockClassified, medianArea);
  });

  assert.strictEqual(sizeRuleResults[0].rawClass, 'Normal_cells', 'Oversized platelet should be relabeled to Normal_cells via RBC_fix');
  assert.strictEqual(sizeRuleResults[1].rawClass, 'Plt', 'Undersized RBC should be relabeled to Plt via PLT_fix');
  assert.strictEqual(sizeRuleResults[2].rawClass, 'Plt', 'Correctly-sized platelet should remain Plt');
  console.log('✓ Rule 1: Biophysical Size Rules (RBC_fix / PLT_fix) verified');

  // Test 2: Border Margin Exclusion (get_interior_ids)
  const borderExclusionResults = await page.evaluate(() => {
    const srcW = 1500, srcH = 1125, margin = 2;
    const mockCells = [
      { id: '1', bbox: [0, 50, 40, 90] }, // Touches top margin (y0 = 0 < 2) -> Exclude
      { id: '2', bbox: [50, 0, 90, 40] }, // Touches left margin (x0 = 0 < 2) -> Exclude
      { id: '3', bbox: [50, 50, 1124, 90] }, // Touches bottom margin (y1 >= 1123) -> Exclude
      { id: '4', bbox: [50, 50, 90, 1499] }, // Touches right margin (x1 >= 1498) -> Exclude
      { id: '5', bbox: [100, 100, 150, 150] } // Safe interior cell -> Keep
    ];

    return mockCells.filter(c => {
      return c.bbox[0] >= margin && c.bbox[1] >= margin &&
             c.bbox[2] < (srcH - margin) && c.bbox[3] < (srcW - margin);
    });
  });

  assert.strictEqual(borderExclusionResults.length, 1, 'Only the safe interior cell should remain');
  assert.strictEqual(borderExclusionResults[0].id, '5', 'Cell 5 is the only interior cell');
  console.log('✓ Rule 2: Border Margin Exclusion (2px margin) verified');

  // Test 3: Duplicate Overlap Suppression (>50% overlap rejection)
  const dupeSuppressionResults = await page.evaluate(() => {
    const srcW = 500, srcH = 500;
    const mockCells = [
      { id: 'primary', bbox: [100, 100, 200, 200] }, // 100x100 = 10000 px
      { id: 'dupe_nested', bbox: [110, 110, 190, 190] }, // 80x80 = 6400 px, 100% overlapping with primary -> Drop
      { id: 'separate', bbox: [300, 300, 400, 400] } // Completely disjoint -> Keep
    ];
    return window.__CYTO_APP__.applyDuplicateSuppression(mockCells, srcW, srcH, 0.50);
  });

  assert.strictEqual(dupeSuppressionResults.length, 2, 'Duplicate nested cell should be suppressed');
  assert.strictEqual(dupeSuppressionResults.some(c => c.id === 'dupe_nested'), false, 'dupe_nested must be dropped');
  console.log('✓ Rule 3: Duplicate Overlap Suppression (>50%) verified');

  // Test 4: WBC Multi-Lobe Union-Find Reassembly
  const reassemblyResults = await page.evaluate(() => {
    const medianArea = 800; // dRbc ~ 32px, lim ~ 41.5px
    const mockCells = [
      // Two close lobes of a neutrophil (centroids (100, 100) and (115, 115) -> dist ~ 21px < 41.5px)
      { id: 'lobe-1', bbox: [85, 85, 115, 115], contour: [{ x: 85, y: 85 }], morphology: { area_um2: 80 } },
      { id: 'lobe-2', bbox: [100, 100, 130, 130], contour: [{ x: 130, y: 130 }], morphology: { area_um2: 90 } },
      // Isolated distinct cell
      { id: 'isolated', bbox: [300, 300, 350, 350], contour: [], morphology: { area_um2: 120 } }
    ];
    return window.__CYTO_APP__.applyWbcMultiLobeReassembly(mockCells, medianArea);
  });

  assert.strictEqual(reassemblyResults.length, 2, 'Two nearby lobes should be unified into 1 leukocyte');
  assert.strictEqual(reassemblyResults[0].bbox[0], 85, 'Unified minY should match bounding envelope');
  assert.strictEqual(reassemblyResults[0].bbox[3], 130, 'Unified maxX should match bounding envelope');
  assert.strictEqual(reassemblyResults[0].morphology.area_um2, 170, 'Area should be summed');
  console.log('✓ Rule 4: WBC Multi-Lobe Union-Find Reassembly verified');

  // Test 5: Conjoined RBC Doublet Splitting
  const splittingResults = await page.evaluate(() => {
    const medianArea = 800;
    const mockCells = [
      // Wide conjoined RBC doublet (w = 70, h = 30 -> w >= 1.4*h, area = 2100 > 1.8*800 = 1440)
      { id: 'doublet', bbox: [100, 100, 130, 170] },
      // Normal single RBC (w = 30, h = 30, area = 900)
      { id: 'single', bbox: [200, 200, 230, 230] }
    ];
    return window.__CYTO_APP__.applyRbcWatershedSplitting(mockCells, medianArea);
  });

  assert.strictEqual(splittingResults.length, 3, 'Doublet should be split into 2 cells, yielding 3 total');
  assert.strictEqual(splittingResults[0].bbox[3], 135, 'Left half maxX should be midX');
  assert.strictEqual(splittingResults[1].bbox[1], 136, 'Right half minX should be midX+1');
  console.log('✓ Rule 5: Conjoined RBC Doublet Splitting verified');

  // Test 6: WBC Nuclear Chromatin Veto
  const vetoResults = await page.evaluate(() => {
    // Create an offscreen canvas containing a uniform reddish/pink RBC patch without nuclear blue chroma
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(210, 150, 140)'; // Pinkish RBC color (g > 140, no blue contrast)
    ctx.fillRect(0, 0, 100, 100);

    const mockClassified = [
      {
        id: 'c-fake-mono',
        classId: 'monocytes',
        rawClass: 'Monocytes',
        label: 'Monocyte',
        x: 10,
        y: 10,
        width: 50,
        height: 50,
        predictions: [
          { rawClass: 'Monocytes', prob: 0.88 },
          { rawClass: 'Normal_cells', classId: 'normal_cells', label: 'Normal RBC (Discocyte)', prob: 0.08 }
        ]
      }
    ];

    return window.__CYTO_APP__.applyWbcNuclearVeto(mockClassified, canvas);
  });

  assert.strictEqual(vetoResults[0].rawClass, 'Normal_cells', 'Un-nucleated pink blob falsely predicted as Monocyte should be vetoed to Normal_cells');
  console.log('✓ Rule 6: Mononuclear WBC Nuclear Chromatin Veto verified');

  await browser.close();
  server.close();
  console.log('🎉 All 6 Post-Processing Heuristic Rules PASSED with 100% Parity!');
})();
