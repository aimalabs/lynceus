const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');
const http = require('http');
const fs = require('fs');

(async () => {
  console.log('\n🧪 Running Test Suite: Cellpose SAM-v2 End-to-End Pipeline (100–140 Cells Target)');

  const rootDir = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(rootDir, reqPath);
    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }
    const stat = fs.statSync(filePath);
    res.writeHead(200, { 'Content-Length': stat.size });
    fs.createReadStream(filePath).pipe(res);
  });

  const testPort = 3895;
  await new Promise(r => server.listen(testPort, r));
  console.log(`  ✓ Local test HTTP server started on port ${testPort}`);

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: '/tmp/lynceus_test_user_profile',
    protocolTimeout: 60000,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-unsafe-webgpu'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    if (text.includes('[Flash Mode]') || text.includes('[Lynceus Pipeline]') || text.includes('[Stage 2 Swin-T]') || text.includes('Euler')) {
      console.log(`  [Browser Inference Log]: ${text}`);
    }
  });

  await page.goto(`http://localhost:${testPort}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__CYTO_APP__ !== undefined, { timeout: 10000 });

  console.log('  ✓ Triggering Telesphorus Live AI Inference (Cellpose SAM-v2 ViT + Swin-T)...');

  const inferenceResult = await page.evaluate(async () => {
    const t0 = performance.now();
    await window.__CYTO_APP__.runModelInference('fast');
    const elapsed = performance.now() - t0;

    const totalCells = window.__CYTO_APP__.state.annotations.length;
    const leukocytes = window.__CYTO_APP__.state.annotations.filter(a => a.classId !== 'platelet' && a.classId !== 'rbc_variant');
    const platelets = window.__CYTO_APP__.state.annotations.filter(a => a.classId === 'platelet');
    const rbcVariants = window.__CYTO_APP__.state.annotations.filter(a => a.classId === 'rbc_variant');

    return {
      elapsedMs: parseFloat(elapsed.toFixed(1)),
      totalCells,
      leukocytesCount: leukocytes.length,
      plateletsCount: platelets.length,
      rbcVariantsCount: rbcVariants.length,
      sampleCell: window.__CYTO_APP__.state.annotations[0] || null
    };
  });

  console.log(`  ✓ Inference completed in ${inferenceResult.elapsedMs}ms`);
  console.log(`  ✓ Total Detected Cell Instances: ${inferenceResult.totalCells} cells`);
  console.log(`  ✓ Lineage Breakdown: ${inferenceResult.leukocytesCount} WBCs, ${inferenceResult.plateletsCount} Platelets, ${inferenceResult.rbcVariantsCount} RBCs`);

  // Assertion: Stage 1 + Postprocessing must detect cleanly segmented smear cells (strictly between 100 and 140 cells)
  assert(
    inferenceResult.totalCells >= 100 && inferenceResult.totalCells <= 140,
    `Expected SAM-v2 ViT + Postprocessing to detect between 100 and 140 cells, but found ${inferenceResult.totalCells}`
  );

  assert(inferenceResult.sampleCell !== null, 'Should have valid segmented sample cell');
  assert(inferenceResult.sampleCell.morphology.area_um2 > 0, 'Cell should have valid morphometric area');

  await browser.close();
  server.close();
  console.log(`🎉 Cellpose SAM-v2 Cell Count & Postprocessing Test PASSED successfully (${inferenceResult.totalCells} cells detected)!\n`);
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
