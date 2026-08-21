const puppeteer = require('puppeteer-core');
const path = require('path');
const http = require('http');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.onnx': 'application/octet-stream',
  '.bin': 'application/octet-stream'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(rootDir, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    });
    res.end(data);
  });
});

server.listen(3977, async () => {
  console.log('🧪 Testing Quick AI Patch Classification Button (#btn-classify-patch)...');
  let browser;
  try {
    const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--enable-unsafe-webgpu', '--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3977', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 15000 });

    // Verify button exists in DOM and matches design
    const btnInfo = await page.evaluate(() => {
      const btn = document.getElementById('btn-classify-patch');
      const resetBtn = document.getElementById('btn-reset-detections');
      return {
        exists: !!btn,
        hasSvg: btn && !!btn.querySelector('svg'),
        title: btn && btn.getAttribute('title'),
        classes: btn ? btn.className : '',
        resetClasses: resetBtn ? resetBtn.className : ''
      };
    });

    console.log('✓ Button Presence & Design Info:', JSON.stringify(btnInfo, null, 2));
    if (!btnInfo.exists || !btnInfo.hasSvg) {
      throw new Error('Quick AI Classify button (#btn-classify-patch) is missing or lacks SVG icon!');
    }

    // Add a manual cell
    await page.evaluate(() => {
      window.__CYTO_APP__.setActiveLineage('eosinophils');
      window.__CYTO_APP__.addCellAnnotation(300, 300, 90, 90, 'box');
    });

    // Check that the cell starts with 100% active lineage
    const preClassifyState = await page.evaluate(() => {
      const state = window.__CYTO_APP__.state;
      const cell = state.annotations[0];
      return {
        id: cell.id,
        classId: cell.classId,
        confidence: cell.confidence,
        predsCount: cell.predictions.length
      };
    });

    console.log('✓ Pre-classification cell state (Human Ground Truth):', preClassifyState);
    if (preClassifyState.classId !== 'eosinophils' || preClassifyState.predsCount !== 1) {
      throw new Error(`Unexpected initial state: ${JSON.stringify(preClassifyState)}`);
    }

    // Click the Quick Classify button on the patch
    await page.click('#btn-classify-patch');

    // Wait for async patch classification to settle
    await page.waitForFunction(() => {
      const state = window.__CYTO_APP__.state;
      const cell = state.annotations[0];
      return cell.predictions && cell.predictions.length > 1;
    }, { timeout: 10000 });

    const postClassifyState = await page.evaluate(() => {
      const state = window.__CYTO_APP__.state;
      const cell = state.annotations[0];
      return {
        id: cell.id,
        classId: cell.classId,
        label: cell.label,
        confidence: cell.confidence,
        topPredictions: cell.predictions.slice(0, 3)
      };
    });

    console.log('✓ Post-classification AI state (from #btn-classify-patch click):', JSON.stringify(postClassifyState, null, 2));
    if (postClassifyState.topPredictions.length < 2) {
      throw new Error('Expected full multi-class prediction distribution from Swin-T patch classification');
    }

    console.log('🎉 Quick AI Patch Classification Button test passed successfully!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
