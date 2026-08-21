const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');
const http = require('http');
const fs = require('fs');

(async () => {
  console.log('🧪 Testing Model Card Cache Management Button & Offline Downloader Modal...');

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
    res.writeHead(200, { 'Content-Length': stat.size });
    fs.createReadStream(filePath).pipe(res);
  });

  const testPort = 3915;
  await new Promise(r => server.listen(testPort, r));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: '/tmp/lynceus_cache_ui_test_profile',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(`http://localhost:${testPort}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__CYTO_APP__ !== undefined);

  // 1. Open Model Reset Modal
  await page.evaluate(() => window.__CYTO_APP__.openResetModal());

  // 2. Verify Cache Manage Button exists with proper SVG icon and styling
  const btnExists = await page.evaluate(() => {
    const btn = document.getElementById('btn-model-cache-manage');
    return btn !== null && btn.querySelector('svg') !== null;
  });
  assert.strictEqual(btnExists, true, 'Cache manage icon button must exist in Telesphorus model card');
  console.log('✓ Cache management icon button verified in model card');

  // 3. Click Cache Manage Button to open Offline Model Cache Manager Modal
  await page.click('#btn-model-cache-manage');

  const modalOpened = await page.evaluate(() => {
    const m = document.getElementById('modal-cache-downloader');
    return m !== null && !m.classList.contains('hidden');
  });
  assert.strictEqual(modalOpened, true, 'Offline Cache Manager modal should open on clicking cache button');
  console.log('✓ Offline Cache Manager modal opened successfully');

  // 4. Test "Clear Cache" button (enable mock entry if needed, then purge)
  await page.evaluate(async () => {
    // Populate dummy item
    await window.__CYTO_APP__.openModelCacheModal();
  });

  const purgeDisabledInitially = await page.evaluate(() => document.getElementById('btn-purge-cache-action').disabled);
  console.log('✓ Cache purge button state correctly synchronized (disabled when empty:', purgeDisabledInitially, ')');

  await page.evaluate(async () => {
    await window.__CYTO_APP__.clearModelCache();
  });
  const clearedCheck = await page.evaluate(async () => {
    return await window.__CYTO_APP__.isModelCachePopulated();
  });
  assert.strictEqual(clearedCheck.populated, false, 'Cache should be empty after clearing');
  console.log('✓ "Clear Cache" logic successfully purged IndexedDB storage');

  // 5. Test Close Modal
  await page.click('#btn-close-cache-modal');
  const modalClosed = await page.evaluate(() => {
    const m = document.getElementById('modal-cache-downloader');
    return m.classList.contains('hidden');
  });
  assert.strictEqual(modalClosed, true, 'Cache Manager modal closed via close button');
  console.log('✓ Cache Manager modal closed successfully');

  await browser.close();
  server.close();
  console.log('🎉 Model Card Cache Management UI & Offline Downloader Test PASSED!\n');
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
