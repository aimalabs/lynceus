const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const http = require('http');
const fs = require('fs');

(async () => {
  console.log('\n🧪 Running Test Suite: Interactive Live WebGPU Single-Cell Classification');

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

  const testPort = 3986;
  await new Promise(r => server.listen(testPort, r));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: '/tmp/lynceus_test_interactive_profile',
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
    if (text.includes('[Interactive WebGPU]') || text.includes('[Lynceus GPU]')) {
      console.log(`  [Browser Live Classifier]: ${text}`);
    }
  });

  await page.goto(`http://localhost:${testPort}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.ort !== undefined && window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 15000 });

  // 1. Select Box Drawing Tool
  await page.keyboard.press('KeyB');
  const activeTool = await page.evaluate(() => state.tool);
  assert.strictEqual(activeTool, 'box', 'Active tool should be box');
  console.log('  ✓ Box Drawing tool selected');

  // 2. Programmatically or interactively add an ROI over a cell region
  const initialCount = await page.evaluate(() => state.annotations.length);
  
  await page.evaluate(async () => {
    // Add annotation over neutrophil coordinates (280, 190, 110, 105)
    window.__CYTO_APP__.addCellAnnotation(280, 190, 110, 105, 'box');
    const topCell = window.__CYTO_APP__.state.annotations[0];
    await window.__CYTO_APP__.classifySelectedCellPatch(topCell.id);
  });

  // Wait a moment for async WebGPU single patch classification
  await page.waitForFunction(() => {
    const topCell = state.annotations[0];
    return topCell && topCell.predictions && topCell.predictions.length === 20;
  }, { timeout: 15000 });

  const classifiedCell = await page.evaluate(() => {
    const top = state.annotations[0];
    return {
      id: top.id,
      classId: top.classId,
      rawClass: top.rawClass,
      label: top.label,
      confidence: top.confidence,
      predictionsCount: top.predictions.length,
      topPrediction: top.predictions[0]
    };
  });

  assert.strictEqual(classifiedCell.predictionsCount, 20, 'Predictions should include all 20 Master Classes');
  assert(classifiedCell.confidence > 0.50, `Confidence should be high, got ${classifiedCell.confidence}`);
  console.log(`  ✓ Interactive WebGPU inference completed for ROI: ID=${classifiedCell.id}, Class=${classifiedCell.label} (${classifiedCell.rawClass}), Conf=${(classifiedCell.confidence * 100).toFixed(1)}%`);

  await browser.close();
  server.close();
  console.log('🎉 Interactive Live WebGPU Single-Cell Classification test PASSED successfully!\n');
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
