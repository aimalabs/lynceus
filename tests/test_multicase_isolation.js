const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');
const http = require('http');
const fs = require('fs');

(async () => {
  console.log('🧪 Testing Multi-Smear Case Isolation & Independent State Retention...');

  const rootDir = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(rootDir, reqPath);
    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }
    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });

  const testPort = 3926;
  await new Promise(r => server.listen(testPort, r));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: '/tmp/lynceus_test_multicase_isolation',
    headless: true,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    await page.goto(`http://localhost:${testPort}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 15000 });

    // Step 1: Customize Case 1 (smear-02)
    // Add a custom annotation, set specific filter, and update clinical notes
    await page.evaluate(() => {
      // Add custom cell
      window.__CYTO_APP__.addCellAnnotation(400, 400, 100, 100, 'box');
      // Set custom filters
      window.__CYTO_APP__.setCanvasFilters(['clahe', 'green_contrast']);
      // Set custom notes & calibration
      window.__CYTO_APP__.state.metadata.notes = "CASE 1 SPECIFIC CLINICAL NOTE: Severe blast predominance.";
      window.__CYTO_APP__.setCalibration(0.250);
    });

    const case1Custom = await page.evaluate(() => ({
      activeId: window.__CYTO_APP__.state.activeCaseId,
      annotationCount: window.__CYTO_APP__.state.annotations.length,
      filters: window.__CYTO_APP__.state.activeFilters,
      notes: window.__CYTO_APP__.state.metadata.notes,
      mpp: window.__CYTO_APP__.state.micronsPerPixel
    }));

    console.log(`✓ Case 1 modified: ${case1Custom.annotationCount} cells, mpp=${case1Custom.mpp}, filters=[${case1Custom.filters.join(', ')}]`);
    assert.strictEqual(case1Custom.annotationCount, 41, 'Case 1 should now have 41 cells');
    assert.strictEqual(case1Custom.mpp, 0.250, 'Case 1 calibration should be 0.250');
    assert.ok(case1Custom.filters.includes('green_contrast'), 'Case 1 filters include green_contrast');

    // Step 2: Switch to Case 2 (smear-field) and verify clean independent state
    await page.evaluate(() => {
      window.__CYTO_APP__.switchActiveCase('smear-field');
    });

    const case2Initial = await page.evaluate(() => ({
      activeId: window.__CYTO_APP__.state.activeCaseId,
      annotationCount: window.__CYTO_APP__.state.annotations.length,
      filters: window.__CYTO_APP__.state.activeFilters,
      notes: window.__CYTO_APP__.state.metadata.notes,
      mpp: window.__CYTO_APP__.state.micronsPerPixel
    }));

    console.log(`✓ Case 2 clean state: ${case2Initial.annotationCount} cells, mpp=${case2Initial.mpp}, filters=[${case2Initial.filters.join(', ')}]`);
    assert.strictEqual(case2Initial.activeId, 'smear-field');
    assert.strictEqual(case2Initial.annotationCount, 58, 'Case 2 must retain its original 58 cells');
    assert.strictEqual(case2Initial.mpp, 0.125, 'Case 2 should maintain its independent calibration 0.125');
    assert.ok(!case2Initial.notes.includes('Severe blast predominance'), 'Case 2 notes must not contain Case 1 text');

    // Step 3: Modify Case 2 (delete 2 cells, add different note)
    await page.evaluate(() => {
      const cell1 = window.__CYTO_APP__.state.annotations[0];
      const cell2 = window.__CYTO_APP__.state.annotations[1];
      window.__CYTO_APP__.deleteCell(cell1.id);
      window.__CYTO_APP__.deleteCell(cell2.id);
      window.__CYTO_APP__.state.metadata.notes = "CASE 2 SPECIFIC CLINICAL NOTE: Reactive leukocytosis verified.";
    });

    const case2Modified = await page.evaluate(() => ({
      annotationCount: window.__CYTO_APP__.state.annotations.length,
      notes: window.__CYTO_APP__.state.metadata.notes
    }));
    console.log(`✓ Case 2 modified: ${case2Modified.annotationCount} cells (2 deleted)`);
    assert.strictEqual(case2Modified.annotationCount, 56, 'Case 2 should now have 56 cells');

    // Step 4: Switch back to Case 1 and verify all its customized state was perfectly preserved
    await page.evaluate(() => {
      window.__CYTO_APP__.switchActiveCase('smear-02');
    });

    const case1Restored = await page.evaluate(() => ({
      activeId: window.__CYTO_APP__.state.activeCaseId,
      annotationCount: window.__CYTO_APP__.state.annotations.length,
      filters: window.__CYTO_APP__.state.activeFilters,
      notes: window.__CYTO_APP__.state.metadata.notes,
      mpp: window.__CYTO_APP__.state.micronsPerPixel
    }));

    console.log(`✓ Case 1 restored state: ${case1Restored.annotationCount} cells, mpp=${case1Restored.mpp}, filters=[${case1Restored.filters.join(', ')}]`);
    assert.strictEqual(case1Restored.activeId, 'smear-02');
    assert.strictEqual(case1Restored.annotationCount, 41, 'Case 1 must still have 41 cells');
    assert.strictEqual(case1Restored.mpp, 0.250, 'Case 1 must retain its 0.250 calibration');
    assert.ok(case1Restored.notes.includes('Severe blast predominance'), 'Case 1 notes must be intact');

    // Step 5: Export dataset payload and ensure strict case isolation
    const exportPayload = await page.evaluate(() => window.__CYTO_APP__.buildDatasetExportPayload());
    console.log(`✓ Exported payload for active case: ${exportPayload.image.smearId} (${exportPayload.annotations.length} cells)`);
    assert.strictEqual(exportPayload.image.smearId, 'smear-02');
    assert.strictEqual(exportPayload.annotations.length, 41);

    console.log('🎉 Multi-Smear Case Isolation & Independent State Retention passed successfully!');
  } finally {
    await browser.close();
    server.close();
  }
})();
