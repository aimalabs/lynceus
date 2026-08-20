const puppeteer = require('puppeteer-core');
const assert = require('assert');
const http = require('http');
const path = require('path');
const fs = require('fs');

(async () => {
  const rootDir = path.resolve('.');
  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(rootDir, reqPath);
    if (!fs.existsSync(filePath)) { res.statusCode = 404; res.end(); return; }
    res.writeHead(200);
    fs.createReadStream(filePath).pipe(res);
  });
  await new Promise(r => server.listen(3892, r));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3892/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__CYTO_APP__ !== undefined);

  console.log('Testing presets & verifying inversion removal...');

  // Open dropdown
  await page.click('#filter-dropdown-trigger');

  // Verify cellpose_invert is removed
  const hasInvert = await page.$('button[data-filter="cellpose_invert"]');
  assert.strictEqual(hasInvert, null);
  console.log('✓ Cellpose Invert filter option successfully removed from UI');

  // Test May-Giemsa preset button click
  await page.click('#btn-preset-ai-filters');
  let filters = await page.evaluate(() => window.__CYTO_APP__.state.activeFilters);
  assert.deepStrictEqual(filters, ['clahe', 'fov_crop', 'reinhard_lab']);
  console.log('✓ May-Giemsa AI Preset active: [clahe, fov_crop, reinhard_lab]');

  // Test Romanowski preset button click
  await page.click('#btn-preset-romanowski-filters');
  filters = await page.evaluate(() => window.__CYTO_APP__.state.activeFilters);
  assert.deepStrictEqual(filters, ['clahe', 'fov_crop', 'two_tone', 'reinhard_lab']);
  console.log('✓ Romanowski AI Preset active: [clahe, fov_crop, two_tone, reinhard_lab]');

  await browser.close();
  server.close();
  console.log('🎉 All updated preset and rationale tests PASSED!');
})();
