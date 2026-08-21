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

server.listen(3966, async () => {
  console.log('🧪 Testing User-Created Cell Lineage & 100% Active Class Distribution...');
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
    await page.goto('http://localhost:3966', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 15000 });

    const result = await page.evaluate(() => {
      // 1. Set active class to 'eosinophils'
      window.__CYTO_APP__.setActiveLineage('eosinophils');

      // 2. Add cell
      window.__CYTO_APP__.addCellAnnotation(200, 200, 80, 80, 'box');
      const state = window.__CYTO_APP__.state;
      const addedCell = state.annotations[0];
      const addedCellSnapshot = {
        id: addedCell.id,
        classId: addedCell.classId,
        confidence: addedCell.confidence,
        predictions: JSON.parse(JSON.stringify(addedCell.predictions)),
        origin: addedCell.origin
      };

      // 3. Reclassify cell to 'monocytes'
      window.__CYTO_APP__.reclassifyCell(addedCell.id, 'monocytes');
      const reclassifiedCell = state.annotations.find(a => a.id === addedCell.id);

      return {
        activeClassSet: state.activeClassId,
        addedCell: addedCellSnapshot,
        reclassifiedCell: {
          id: reclassifiedCell.id,
          classId: reclassifiedCell.classId,
          confidence: reclassifiedCell.confidence,
          predictions: reclassifiedCell.predictions,
          origin: reclassifiedCell.origin
        }
      };
    });

    console.log('✓ Created Cell Verification:', JSON.stringify(result.addedCell, null, 2));
    console.log('✓ Reclassified Cell Verification:', JSON.stringify(result.reclassifiedCell, null, 2));

    if (result.addedCell.confidence !== 1.0) {
      throw new Error(`Expected confidence 1.0, got ${result.addedCell.confidence}`);
    }
    if (!result.addedCell.predictions || result.addedCell.predictions[0].prob !== 1.0) {
      throw new Error(`Expected 100% distribution on active class, got ${JSON.stringify(result.addedCell.predictions)}`);
    }
    if (result.reclassifiedCell.classId !== 'monocytes' || result.reclassifiedCell.predictions[0].prob !== 1.0) {
      throw new Error(`Expected 100% distribution on reclassified class, got ${JSON.stringify(result.reclassifiedCell.predictions)}`);
    }

    console.log('🎉 User-Created Cell Lineage & 100% Distribution Test PASSED!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
