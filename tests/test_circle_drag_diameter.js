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

server.listen(3988, async () => {
  console.log('🧪 Testing Circle Drag Diameter Definition Geometry...');
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
    await page.goto('http://localhost:3988', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 15000 });

    // Set tool to circle and simulate drag
    const circleData = await page.evaluate(() => {
      window.__CYTO_APP__.setTool('circle');
      const canvas = document.getElementById('microscope-canvas');

      // Dispatch mousedown at (100, 100) and mouseup at (200, 100) (drag distance = 100px diameter)
      const p1 = window.__CYTO_APP__.state.view;
      // World coordinates: let's test via direct world drag simulation
      const startX = 200, startY = 200;
      const endX = 300, endY = 200; // Drag length = 100px

      // Trigger mousedown
      const startScreen = {
        clientX: canvas.getBoundingClientRect().left + p1.x + startX * p1.zoom,
        clientY: canvas.getBoundingClientRect().top + p1.y + startY * p1.zoom
      };
      const endScreen = {
        clientX: canvas.getBoundingClientRect().left + p1.x + endX * p1.zoom,
        clientY: canvas.getBoundingClientRect().top + p1.y + endY * p1.zoom
      };

      canvas.dispatchEvent(new MouseEvent('mousedown', {
        button: 0,
        clientX: startScreen.clientX,
        clientY: startScreen.clientY,
        bubbles: true
      }));

      window.dispatchEvent(new MouseEvent('mousemove', {
        clientX: endScreen.clientX,
        clientY: endScreen.clientY,
        bubbles: true
      }));

      window.dispatchEvent(new MouseEvent('mouseup', {
        button: 0,
        clientX: endScreen.clientX,
        clientY: endScreen.clientY,
        bubbles: true
      }));

      const added = window.__CYTO_APP__.state.annotations[0];
      return {
        shape: added.shape,
        x: added.x,
        y: added.y,
        width: added.width,
        height: added.height,
        centerX: added.x + added.width / 2,
        centerY: added.y + added.height / 2,
        morphology: added.morphology
      };
    });

    console.log('✓ Drawn Circle Properties:', JSON.stringify(circleData, null, 2));

    // Diameter should be ~100px (not 200px)
    if (Math.abs(circleData.width - 100) > 2) {
      throw new Error(`Expected circle diameter width ~100, got ${circleData.width}`);
    }
    if (Math.abs(circleData.height - 100) > 2) {
      throw new Error(`Expected circle diameter height ~100, got ${circleData.height}`);
    }
    // Center should be midpoint of (200, 200) and (300, 200) -> (250, 200)
    if (Math.abs(circleData.centerX - 250) > 2) {
      throw new Error(`Expected center X ~250, got ${circleData.centerX}`);
    }
    if (Math.abs(circleData.centerY - 200) > 2) {
      throw new Error(`Expected center Y ~200, got ${circleData.centerY}`);
    }

    console.log('🎉 Circle Drag Diameter Definition Test PASSED successfully!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
