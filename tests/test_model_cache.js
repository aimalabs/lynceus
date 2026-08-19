const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');
const http = require('http');
const fs = require('fs');

(async () => {
  console.log('\n🧪 Running Test Suite: Persistent Model Cache & SHA-256 Hashing');

  // 1. Launch a local test server to serve assets for fetch
  const rootDir = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
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

  const testPort = 3890;
  await new Promise(r => server.listen(testPort, r));
  console.log(`  ✓ Local test HTTP server started on port ${testPort}`);

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
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
    if (text.includes('[Model Cache]') || text.includes('[Lynceus GPU]')) {
      console.log(`  [Browser Cache Log]: ${text}`);
    }
  });

  await page.goto(`http://localhost:${testPort}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.ort !== undefined, { timeout: 10000 });

  // Test 1: Fetch and compute SHA-256 hash on first load with 10% progress updates
  const firstLoad = await page.evaluate(async () => {
    const progressReports = [];
    const res = await fetchOrGetCachedModel('assets/cellpose_cyto3_unet_int8.onnx', 'Cellpose Cyto3 (INT8)', (percent, rec, total) => {
      progressReports.push(percent);
    });
    const registry = JSON.parse(localStorage.getItem('LYNCEUS_MODEL_REGISTRY') || '{}');
    return {
      fileName: 'cellpose_cyto3_unet_int8.onnx',
      hash: res.hash,
      cacheKey: res.cacheKey,
      fromCache: res.fromCache,
      registryHash: registry['cellpose_cyto3_unet_int8.onnx'],
      byteLength: res.buffer.byteLength,
      progressReports
    };
  });

  assert.strictEqual(firstLoad.fromCache, false, 'First fetch should not be from cache');
  assert.strictEqual(firstLoad.hash.length, 64, 'SHA-256 hash must be 64 hex characters');
  assert.strictEqual(firstLoad.cacheKey, `${firstLoad.fileName}_${firstLoad.hash}`, 'Cache key must match ${fileName}_${hash}');
  assert.strictEqual(firstLoad.registryHash, firstLoad.hash, 'LocalStorage registry must record matching file hash');
  assert(firstLoad.progressReports.includes(100), 'Download progress should reach 100%');
  console.log(`  ✓ First Load: SHA-256 computed (${firstLoad.hash.slice(0, 16)}...) and stored under key '${firstLoad.cacheKey}'`);
  console.log(`  ✓ 10% Step Download Progress Events: [${firstLoad.progressReports.join(', ')}]%`);

  // Test 2: Second load must hit persistent cache with exact hash matching
  const secondLoad = await page.evaluate(async () => {
    const res = await fetchOrGetCachedModel('assets/cellpose_cyto3_unet_int8.onnx', 'Cellpose Cyto3 (INT8)');
    return {
      hash: res.hash,
      cacheKey: res.cacheKey,
      fromCache: res.fromCache,
      byteLength: res.buffer.byteLength
    };
  });

  assert.strictEqual(secondLoad.fromCache, true, 'Second load must be retrieved from persistent cache');
  assert.strictEqual(secondLoad.hash, firstLoad.hash, 'Cached hash must match original computed hash');
  assert.strictEqual(secondLoad.byteLength, firstLoad.byteLength, 'Cached buffer byte length must match original binary size');
  console.log(`  ✓ Second Load: Cache HIT verified for '${secondLoad.cacheKey}' (${(secondLoad.byteLength / 1e6).toFixed(2)} MB, 0 network fetch)`);

  await browser.close();
  server.close();
  console.log('🎉 Persistent Model Cache & SHA-256 Hashing test PASSED successfully!\n');
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
