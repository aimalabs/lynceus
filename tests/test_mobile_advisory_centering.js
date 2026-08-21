const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');
const http = require('http');
const fs = require('fs');

(async () => {
  console.log('🧪 Testing Mobile Advisory Modal Centering on Mobile Screen...');

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

  const testPort = 3930;
  await new Promise(r => server.listen(testPort, r));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: '/tmp/lynceus_test_mobile_advisory',
    headless: true,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    // Simulate iPhone 13 / 14 Viewport
    const mobileWidth = 390;
    const mobileHeight = 844;
    await page.setViewport({ width: mobileWidth, height: mobileHeight, isMobile: true, hasTouch: true });
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1');
    
    await page.goto(`http://localhost:${testPort}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 15000 });

    // Ensure the mobile advisory modal is opened
    await page.evaluate(() => {
      const modal = document.getElementById('mobile-advisory-modal');
      if (modal) modal.classList.remove('hidden');
    });

    await page.waitForSelector('#mobile-advisory-modal:not(.hidden)', { visible: true });

    const geometry = await page.evaluate(() => {
      const modal = document.getElementById('mobile-advisory-modal');
      const dialog = modal.querySelector('div');
      const dRect = dialog.getBoundingClientRect();
      const mRect = modal.getBoundingClientRect();
      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        modal: { top: mRect.top, left: mRect.left, width: mRect.width, height: mRect.height },
        dialog: {
          top: dRect.top,
          left: dRect.left,
          width: dRect.width,
          height: dRect.height,
          centerX: dRect.left + (dRect.width / 2),
          centerY: dRect.top + (dRect.height / 2)
        }
      };
    });

    console.log('✓ Geometry on mobile screen:', geometry);

    const expectedCenterX = mobileWidth / 2;
    const expectedCenterY = mobileHeight / 2;

    const xDiff = Math.abs(geometry.dialog.centerX - expectedCenterX);
    const yDiff = Math.abs(geometry.dialog.centerY - expectedCenterY);

    console.log(`✓ Horizontal Center Delta: ${xDiff.toFixed(2)}px (Expected: ${expectedCenterX}px)`);
    console.log(`✓ Vertical Center Delta: ${yDiff.toFixed(2)}px (Expected: ${expectedCenterY}px)`);

    assert.ok(xDiff < 5, `Dialog must be horizontally centered (diff was ${xDiff})`);
    assert.ok(yDiff < 30, `Dialog must be vertically centered (diff was ${yDiff})`);

    // Test dismiss button works
    await page.click('#btn-dismiss-mobile-modal');
    const isHidden = await page.evaluate(() => {
      const modal = document.getElementById('mobile-advisory-modal');
      return modal.classList.contains('hidden');
    });
    assert.strictEqual(isHidden, true, 'Modal should be dismissed when clicking Continue on Mobile');

    console.log('🎉 Mobile Advisory Modal Centering tests passed successfully!');
  } finally {
    await browser.close();
    server.close();
  }
})();
