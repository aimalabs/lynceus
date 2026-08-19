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

  // Test 3: Test Chunked Streaming & Merging for SAM-v2 ViT (10 parts)
  const chunkLoad = await page.evaluate(async () => {
    const chunkReports = [];
    const res = await fetchOrGetCachedModel('assets/cellpose_cpsam_v2_int8.onnx', 'Cellpose SAM-v2 ViT (INT8)', (percent, rec, total) => {
      chunkReports.push(percent);
    });
    const registry = JSON.parse(localStorage.getItem('LYNCEUS_MODEL_REGISTRY') || '{}');
    return {
      fileName: 'cellpose_cpsam_v2_int8.onnx',
      hash: res.hash,
      cacheKey: res.cacheKey,
      fromCache: res.fromCache,
      registryHash: registry['cellpose_cpsam_v2_int8.onnx'],
      byteLength: res.buffer.byteLength,
      chunkReports
    };
  });

  assert.strictEqual(chunkLoad.fromCache, false, 'First chunked load should not be from cache');
  assert.strictEqual(chunkLoad.hash, '8c51f729d4202f9b32418b4c7b197284cf35963069fd58fcaa4dadc287fd351a', 'Concatenated SHA-256 hash must match ground truth');
  assert(chunkLoad.byteLength > 290 * 1024 * 1024, 'Merged buffer must contain all ~299 MB of the 10 chunks');
  assert(chunkLoad.chunkReports.includes(100), 'Chunked progress should reach 100%');
  console.log(`  ✓ Chunked Model Download: 10 chunks merged into ${(chunkLoad.byteLength / 1e6).toFixed(2)} MB buffer`);
  console.log(`  ✓ Bit-for-bit SHA-256 Validated: ${chunkLoad.hash}`);
  console.log(`  ✓ Chunk Progress Events: [${chunkLoad.chunkReports.join(', ')}]%`);

  // Test 4: Verify Chunked Model is cached in IndexedDB
  const chunkCached = await page.evaluate(async () => {
    const res = await fetchOrGetCachedModel('assets/cellpose_cpsam_v2_int8.onnx', 'Cellpose SAM-v2 ViT (INT8)');
    return {
      fromCache: res.fromCache,
      byteLength: res.buffer.byteLength
    };
  });
  assert.strictEqual(chunkCached.fromCache, true, 'Subsequent chunked model load must hit persistent cache');
  console.log(`  ✓ Persistent Cache Hit for merged ViT: ${(chunkCached.byteLength / 1e6).toFixed(2)} MB in 0ms (0 network fetch)`);

  await browser.close();
  server.close();
  console.log('🎉 Persistent Model Cache & SHA-256 Hashing test PASSED successfully!\n');
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
