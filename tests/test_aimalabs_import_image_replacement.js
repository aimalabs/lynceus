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

server.listen(3999, async () => {
  console.log('🧪 Testing .aimalabs Import Image Canvas Replacement & Error Handling...');
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
    await page.goto('http://localhost:3999', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 15000 });

    // Test 1: Generate a valid .aimalabs archive with a distinctive synthetic test image
    const validImportResult = await page.evaluate(async () => {
      // Create a distinctive 400x300 canvas filled with bright cyan
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 400;
      testCanvas.height = 300;
      const ctx = testCanvas.getContext('2d');
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(50, 50, 100, 100);

      const pngBlob = await new Promise(r => testCanvas.toBlob(r, 'image/png'));
      const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());

      const annotationsData = {
        metadata: {
          smearId: 'test-cyan-smear',
          patientLastName: 'CYAN-PATIENT',
          imageDimensions: '400 × 300 px'
        },
        annotations: [
          { id: 'c-test-01', classId: 'eosinophils', x: 50, y: 50, width: 100, height: 100, shape: 'box', confidence: 1.0 }
        ],
        preprocessing: { activeFilters: ['clahe'] }
      };
      const jsonBytes = new TextEncoder().encode(JSON.stringify(annotationsData));

      // Build .aimalabs zip package
      const zipBytes = window.__CYTO_APP__.createZipArchive([
        { name: 'annotations.json', data: jsonBytes },
        { name: 'image.png', data: pngBytes }
      ]);

      const aimaFile = new File([zipBytes], 'test-cyan-smear.aimalabs', { type: 'application/zip' });
      await window.__CYTO_APP__.importAnnotationsJSON(aimaFile);

      const state = window.__CYTO_APP__.state;
      return {
        activeCaseId: state.activeCaseId,
        patientLastName: state.metadata.patientLastName,
        imageWidth: state.image ? (state.image.naturalWidth || state.image.width) : 0,
        imageHeight: state.image ? (state.image.naturalHeight || state.image.height) : 0,
        imageLoaded: state.imageLoaded,
        annotationsCount: state.annotations.length
      };
    });

    console.log('✓ Valid .aimalabs Import Verification:', JSON.stringify(validImportResult, null, 2));
    if (validImportResult.imageWidth !== 400 || validImportResult.imageHeight !== 300) {
      throw new Error(`Expected canvas image dimensions 400x300, got ${validImportResult.imageWidth}x${validImportResult.imageHeight}`);
    }
    if (validImportResult.patientLastName !== 'CYAN-PATIENT') {
      throw new Error(`Expected patient lastName CYAN-PATIENT, got ${validImportResult.patientLastName}`);
    }

    // Test 2: Verify error thrown when an archive has no image
    const errorHandlingResult = await page.evaluate(async () => {
      const annotationsData = {
        metadata: { smearId: 'corrupt-smear', patientLastName: 'CORRUPT' },
        annotations: []
      };
      const jsonBytes = new TextEncoder().encode(JSON.stringify(annotationsData));

      // Build .aimalabs zip package WITHOUT any image file
      const zipBytes = window.__CYTO_APP__.createZipArchive([
        { name: 'annotations.json', data: jsonBytes }
      ]);

      const badFile = new File([zipBytes], 'corrupt-no-image.aimalabs', { type: 'application/zip' });
      let caughtError = null;
      try {
        await window.__CYTO_APP__.importAnnotationsJSON(badFile);
      } catch (err) {
        caughtError = err.message;
      }

      const toastEl = document.getElementById('toast-message');
      return {
        caughtError,
        toastMessage: toastEl ? toastEl.textContent : ''
      };
    });

    console.log('✓ Missing Image Error Handling Verification:', JSON.stringify(errorHandlingResult, null, 2));
    if (!errorHandlingResult.caughtError || !errorHandlingResult.caughtError.includes('No image file')) {
      throw new Error(`Expected explicit missing image error, got ${errorHandlingResult.caughtError}`);
    }

    console.log('🎉 .aimalabs Import Image Replacement & Error Handling Test PASSED!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
