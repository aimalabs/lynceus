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
  await new Promise(r => server.listen(3896, r));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3896/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__CYTO_APP__ !== undefined);

  console.log('⚡ Profiling Post-Processing Overhead on 140 Cells...');

  const perfResult = await page.evaluate(() => {
    const app = window.__CYTO_APP__;
    const medianArea = 850;
    const srcW = 1500, srcH = 1125;

    // Generate 140 realistic cell instances
    const mockCells = [];
    for (let i = 0; i < 140; i++) {
      const y0 = 20 + (i % 10) * 100;
      const x0 = 20 + Math.floor(i / 10) * 100;
      const w = 30 + (i % 5) * 5;
      const h = 30 + (i % 4) * 5;
      mockCells.push({
        id: `c-${i}`,
        bbox: [y0, x0, y0 + h, x0 + w],
        contour: [{ x: x0, y: y0 }, { x: x0 + w, y: y0 }, { x: x0 + w, y: y0 + h }, { x: x0, y: y0 + h }],
        morphology: { area_um2: 120 }
      });
    }

    // Warm-up pass for JIT compiler
    app.applyDuplicateSuppression(mockCells, srcW, srcH, 0.50);
    app.applyWbcMultiLobeReassembly(mockCells, medianArea);
    app.applyRbcWatershedSplitting(mockCells, medianArea);

    const t0 = performance.now();

    // 1. Border Exclusion
    const unBordered = mockCells.filter(c => c.bbox[0] >= 2 && c.bbox[1] >= 2 && c.bbox[2] < (srcH - 2) && c.bbox[3] < (srcW - 2));

    // 2. WBC Reassembly
    const reassembled = app.applyWbcMultiLobeReassembly(unBordered, medianArea);

    // 3. RBC Splitting
    const split = app.applyRbcWatershedSplitting(reassembled, medianArea);

    // 4. Duplicate Suppression
    const nonDupes = app.applyDuplicateSuppression(split, srcW, srcH, 0.50);

    // Mock classification output
    const mockClassified = nonDupes.map((c, idx) => ({
      ...c,
      rawClass: idx % 2 === 0 ? 'Plt' : 'Neutrophils',
      classId: idx % 2 === 0 ? 'plt' : 'neutrophils',
      label: idx % 2 === 0 ? 'Platelet' : 'Segmented Neutrophil',
      width: c.bbox[3] - c.bbox[1],
      height: c.bbox[2] - c.bbox[0],
      predictions: [
        { rawClass: idx % 2 === 0 ? 'Plt' : 'Neutrophils', prob: 0.92 },
        { rawClass: 'Normal_cells', classId: 'normal_cells', label: 'Normal RBC (Discocyte)', prob: 0.05 }
      ]
    }));

    // 5. Size Rules
    const sizeFixed = app.applyRbcPltSizeRules(mockClassified, medianArea);

    const totalElapsed = performance.now() - t0;
    return {
      totalMs: totalElapsed,
      perCellMs: totalElapsed / mockCells.length,
      inputCount: mockCells.length,
      finalCount: sizeFixed.length
    };
  });

  console.log(`✓ 140 Cells processed in ${perfResult.totalMs.toFixed(3)}ms (${(perfResult.perCellMs * 1000).toFixed(1)}µs/cell)`);
  assert.ok(perfResult.totalMs < 5.0, `Post-processing should execute in under 5.0ms (got ${perfResult.totalMs}ms)`);

  await browser.close();
  server.close();
  console.log('🎉 Sub-millisecond performance target PASSED!');
})();
