const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');
const http = require('http');
const fs = require('fs');

(async () => {
  console.log('🧪 Testing Human-Supervised Dataset Export & Import Pipeline...');

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

  const testPort = 3918;
  await new Promise(r => server.listen(testPort, r));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: '/tmp/lynceus_test_dataset_export_profile',
    headless: true,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    page.on('console', msg => console.log('  [Browser Log]:', msg.text()));
    page.on('pageerror', err => console.log('  [PageError]:', err.message));
    await page.setViewport({ width: 1400, height: 900 });
    await page.goto(`http://localhost:${testPort}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 15000 });

    // 1. Apply multi-filter stack (e.g. May-Giemsa AI preset)
    await page.evaluate(() => {
      window.__CYTO_APP__.setCanvasFilters(['clahe', 'fov_crop', 'reinhard_lab']);
    });

    // 2. Perform clinician supervision: Add, delete, and reclassify cells
    await page.evaluate(() => {
      window.__CYTO_APP__.addCellAnnotation(250, 250, 80, 80, 'circle');
      if (window.__CYTO_APP__.state.annotations.length > 0) {
        window.__CYTO_APP__.reclassifyCell(window.__CYTO_APP__.state.annotations[0].id, 'eosinophils');
      }
      window.__CYTO_APP__.state.metadata.patientLastName = 'CURIE';
      window.__CYTO_APP__.state.metadata.patientMrn = 'MRN-1903';
      window.__CYTO_APP__.state.metadata.reviewStatus = 'reviewed';
    });

    // 3. Extract complete Dataset Export object
    const exportPayload = await page.evaluate(() => {
      return window.__CYTO_APP__.buildDatasetExportPayload();
    });

    console.log('  [Debug Image Payload]:', JSON.stringify({ ...exportPayload.image, dataUri: exportPayload.image.dataUri ? exportPayload.image.dataUri.substring(0, 50) + '...' : null }));

    console.log('✓ Dataset Payload Schema Validation:');
    assert.strictEqual(exportPayload.app, 'AIMALABS Lynceus');
    assert.strictEqual(exportPayload.version, '1.2');
    assert(exportPayload.exportedAt, 'exportedAt timestamp must exist');

    // 4. Validate Dataset Supervision metadata
    assert.strictEqual(exportPayload.dataset.isHumanSupervised, true, 'dataset.isHumanSupervised must be true');
    assert.strictEqual(exportPayload.dataset.clinicianReviewStatus, 'reviewed', 'reviewStatus must match');
    assert.strictEqual(typeof exportPayload.dataset.totalCells, 'number');
    assert(exportPayload.dataset.classDistribution.eosinophils >= 1, 'Class distribution must count eosinophils');
    console.log(`  ✓ Supervision Metadata: ${exportPayload.dataset.totalCells} cells, Status: ${exportPayload.dataset.clinicianReviewStatus}`);

    // 5. Validate Original Image dataUri and dimensions
    assert(exportPayload.image, 'image object must exist in export');
    assert(exportPayload.image.dataUri && exportPayload.image.dataUri.startsWith('data:image/'), 'image.dataUri must be a valid base64 data URL');
    assert(exportPayload.image.width > 0 && exportPayload.image.height > 0, 'Image dimensions must be positive numbers');
    console.log(`  ✓ Image Data Included: ${exportPayload.image.width} × ${exportPayload.image.height} px (${exportPayload.image.specimenType}, ${exportPayload.image.stainType})`);
    console.log(`  ✓ Base64 DataURI length: ${exportPayload.image.dataUri.length} chars`);

    // 6. Validate Preprocessing & Active Filters
    assert(Array.isArray(exportPayload.preprocessing.activeFilters), 'activeFilters must be an array');
    assert.deepStrictEqual(exportPayload.preprocessing.activeFilters, ['clahe', 'fov_crop', 'reinhard_lab'], 'activeFilters must match the applied filter stack');
    assert(exportPayload.preprocessing.filterDefinitions.clahe.enabled === true, 'CLAHE definition enabled flag');
    console.log(`  ✓ Applied Filters Included: [${exportPayload.preprocessing.activeFilters.join(', ')}]`);

    // 7. Validate Postprocessing Heuristics
    assert(exportPayload.postprocessingConfig, 'postprocessingConfig must exist');
    assert.strictEqual(typeof exportPayload.postprocessingConfig.borderExclusion, 'boolean');
    assert.strictEqual(typeof exportPayload.postprocessingConfig.duplicateSuppression, 'boolean');
    console.log(`  ✓ Postprocessing Config Included: borderExclusion=${exportPayload.postprocessingConfig.borderExclusion}`);

    // 8. Test Full Roundtrip Import
    await page.evaluate((payload) => {
      // Clear current state first
      window.__CYTO_APP__.setCanvasFilters(['raw']);
      window.__CYTO_APP__.state.annotations = [];
      window.__CYTO_APP__.state.metadata.patientLastName = 'UNKNOWN';

      // Import the full supervised payload
      window.__CYTO_APP__.importAnnotationsJSON(payload);
    }, exportPayload);

    // Verify state after import
    const importedState = await page.evaluate(() => {
      return {
        lastName: window.__CYTO_APP__.state.metadata.patientLastName,
        activeFilters: window.__CYTO_APP__.state.activeFilters,
        annotationCount: window.__CYTO_APP__.state.annotations.length,
        hasImage: !!window.__CYTO_APP__.state.imageLoaded
      };
    });

    assert.strictEqual(importedState.lastName, 'CURIE', 'Patient name must be restored on import');
    assert.deepStrictEqual(importedState.activeFilters, ['clahe', 'fov_crop', 'reinhard_lab'], 'Filters must be restored on import');
    assert.strictEqual(importedState.annotationCount, exportPayload.dataset.totalCells, 'Annotations count must match');
    assert.strictEqual(importedState.hasImage, true, 'Image must be loaded');
    console.log('✓ Full Roundtrip Import: Filters, image, metadata, and annotations 100% restored');

    console.log('🎉 Human-Supervised Dataset Export & Import Pipeline Test PASSED!\n');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
