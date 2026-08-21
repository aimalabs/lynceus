const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');
const http = require('http');
const fs = require('fs');

(async () => {
  console.log('🧪 Testing .aimalabs ZIP Package Format & Origin Tagging Verification...');

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

  const testPort = 3922;
  await new Promise(r => server.listen(testPort, r));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: '/tmp/lynceus_test_aimalabs_zip_profile',
    headless: true,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    await page.goto(`http://localhost:${testPort}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 15000 });

    // 1. Activate multi-filter preset (May-Giemsa: clahe + fov_crop + reinhard_lab)
    await page.evaluate(() => {
      window.__CYTO_APP__.setCanvasFilters(['clahe', 'fov_crop', 'reinhard_lab']);
    });

    // 2. Clinician Supervision Actions:
    // a) Untouched AI cells exist in initial annotations
    // b) User reclassifies an AI-generated cell
    // c) User creates a new cell annotation from scratch
    await page.evaluate(() => {
      // User creates a cell from scratch
      window.__CYTO_APP__.addCellAnnotation(500, 500, 90, 90, 'box');
      
      // User reclassifies an existing AI-generated cell
      const aiCell = window.__CYTO_APP__.state.annotations.find(a => a.id === 'c-01');
      if (aiCell) {
        window.__CYTO_APP__.reclassifyCell(aiCell.id, 'eosinophils');
      }
    });

    // 3. Build & Inspect the Dataset Payload
    const payload = await page.evaluate(() => window.__CYTO_APP__.buildDatasetExportPayload());

    console.log('✓ Checking Annotation Origin Markers:');
    
    // Check 1: AI Generated unchanged cells
    const aiCells = payload.annotations.filter(a => a.origin === 'ai_generated');
    assert(aiCells.length > 0, 'Must contain ai_generated annotations');
    assert.strictEqual(aiCells[0].isAiGenerated, true, 'isAiGenerated must be true');
    assert.strictEqual(aiCells[0].isUserModified, false, 'isUserModified must be false');
    assert.strictEqual(aiCells[0].isUserCreated, false, 'isUserCreated must be false');
    console.log(`  ✓ AI-Generated Annotations: ${aiCells.length} cells correctly marked [origin="ai_generated"]`);

    // Check 2: User Reclassified cells
    const reclassifiedCells = payload.annotations.filter(a => a.origin === 'user_reclassified');
    assert(reclassifiedCells.length >= 1, 'Must contain user_reclassified annotations');
    assert.strictEqual(reclassifiedCells[0].isUserModified, true, 'isUserModified must be true');
    assert.strictEqual(reclassifiedCells[0].isUserCreated, false, 'isUserCreated must be false');
    assert(reclassifiedCells[0].originalAiClassId, 'Must preserve originalAiClassId');
    console.log(`  ✓ User-Reclassified Annotations: ${reclassifiedCells.length} cell(s) marked [origin="user_reclassified", originalAiClass="${reclassifiedCells[0].originalAiClassId}"]`);

    // Check 3: User Created from scratch cells
    const createdCells = payload.annotations.filter(a => a.origin === 'user_created');
    assert(createdCells.length >= 1, 'Must contain user_created annotations');
    assert.strictEqual(createdCells[0].isUserCreated, true, 'isUserCreated must be true');
    assert.strictEqual(createdCells[0].isAiGenerated, false, 'isAiGenerated must be false');
    console.log(`  ✓ User-Created Annotations: ${createdCells.length} cell(s) marked [origin="user_created", createdBy="user"]`);

    // Check 4: Dataset summary counts
    assert.strictEqual(payload.dataset.counts.userReclassified, reclassifiedCells.length);
    assert.strictEqual(payload.dataset.counts.userCreated, createdCells.length);
    assert.strictEqual(payload.dataset.counts.aiGeneratedUnchanged, aiCells.length);
    console.log(`  ✓ Dataset Counts: total=${payload.dataset.counts.totalCells}, ai=${payload.dataset.counts.aiGeneratedUnchanged}, reclassified=${payload.dataset.counts.userReclassified}, created=${payload.dataset.counts.userCreated}`);

    // Check 5: Filter configuration is part of annotations.json
    assert.deepStrictEqual(payload.preprocessing.activeFilters, ['clahe', 'fov_crop', 'reinhard_lab'], 'Filters must be recorded in annotations.json');
    console.log('  ✓ Filters recorded in annotations.json metadata:', payload.preprocessing.activeFilters);

    // 4. Test .aimalabs ZIP creation and unpacking
    const zipArchiveBytes = await page.evaluate(async () => {
      const annotationsPayload = window.__CYTO_APP__.buildDatasetExportPayload();
      annotationsPayload.image.fileName = "image.png";
      delete annotationsPayload.image.dataUri;

      const jsonBytes = new TextEncoder().encode(JSON.stringify(annotationsPayload, null, 2));
      const pngBytes = await window.__CYTO_APP__.getRawOriginalImagePngBytes();

      const zip = window.__CYTO_APP__.createZipArchive([
        { name: 'annotations.json', data: jsonBytes },
        { name: 'image.png', data: pngBytes }
      ]);
      return Array.from(zip);
    });

    const zipBuffer = Buffer.from(zipArchiveBytes);
    fs.writeFileSync('/tmp/test_output.aimalabs', zipBuffer);
    console.log(`✓ .aimalabs ZIP archive generated (${(zipBuffer.length / 1024).toFixed(1)} KB)`);

    // Unpack ZIP archive in browser via readZipArchive
    const unpacked = await page.evaluate((bytesArray) => {
      const uint8 = new Uint8Array(bytesArray);
      const entries = window.__CYTO_APP__.readZipArchive(uint8.buffer);
      const jsonText = new TextDecoder().decode(entries['annotations.json']);
      return {
        fileList: Object.keys(entries),
        jsonParsed: JSON.parse(jsonText),
        pngByteLength: entries['image.png'] ? entries['image.png'].length : 0
      };
    }, zipArchiveBytes);

    assert(unpacked.fileList.includes('annotations.json'), 'ZIP must contain annotations.json');
    assert(unpacked.fileList.includes('image.png'), 'ZIP must contain image.png');
    assert(unpacked.pngByteLength > 1000, 'image.png must be a non-empty image file');
    assert.strictEqual(unpacked.jsonParsed.dataset.counts.userReclassified, 1);
    console.log('✓ .aimalabs ZIP Unpacking verified: contains [annotations.json, image.png]');

    // 5. Test Export Button presence in UI
    const exportBtnExists = await page.evaluate(() => {
      const btn = document.getElementById('btn-export-aimalabs');
      return btn !== null;
    });
    assert.strictEqual(exportBtnExists, true, '#btn-export-aimalabs button must exist in header');
    console.log('✓ #btn-export-aimalabs button verified in application header');

    console.log('🎉 .aimalabs ZIP Package Format & Origin Tagging Test PASSED!\n');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
