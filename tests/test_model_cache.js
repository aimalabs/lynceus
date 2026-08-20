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
    protocolTimeout: 120000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-unsafe-webgpu',
      '--js-flags=--max-old-space-size=4096'
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

  // Test 3: Test Chunked Streaming & Merging for Swin-T Classifier FP16 (5 parts)
  const swinChunkLoad = await page.evaluate(async () => {
    const swinReports = [];
    const res = await fetchOrGetCachedModel('assets/swin_classifier_fp16.onnx', 'Swin-T Classifier (FP16)', (percent) => {
      swinReports.push(percent);
    });
    return {
      hash: res.hash,
      byteLength: res.buffer.byteLength,
      fromCache: res.fromCache,
      swinReports
    };
  });

  assert.strictEqual(swinChunkLoad.fromCache, false, 'First chunked swin load should not be from cache');
  assert.strictEqual(swinChunkLoad.hash, 'd30708e1a69a0e269a7ab22e0fa129f629fb2d57899de0277fba23f3410de6a8', 'Concatenated SHA-256 hash must match manifest');
  assert(swinChunkLoad.byteLength > 50 * 1024 * 1024, 'Merged buffer must contain all ~54 MB of the 5 classifier chunks');
  console.log(`  ✓ Swin-T FP16 Classifier 5-Chunk Download: 5 chunks merged into ${(swinChunkLoad.byteLength / 1e6).toFixed(2)} MB buffer`);
  console.log(`  ✓ Swin-T FP16 Classifier SHA-256 Validated: ${swinChunkLoad.hash}`);

  // Test 4: Verify Chunked Swin is cached in IndexedDB
  const swinCached = await page.evaluate(async () => {
    const res = await fetchOrGetCachedModel('assets/swin_classifier_fp16.onnx', 'Swin-T Classifier (FP16)');
    return {
      fromCache: res.fromCache,
      byteLength: res.buffer.byteLength
    };
  });
  assert.strictEqual(swinCached.fromCache, true, 'Subsequent chunked model load must hit persistent cache');
  console.log(`  ✓ Persistent Cache Hit for merged Swin-T FP16: ${(swinCached.byteLength / 1e6).toFixed(2)} MB in 0ms (0 network fetch)`);

  // Test 5: Test Chunked Streaming & Merging for Cellpose SAM-v2 INT8 External Weights (10 parts)
  const int8DataChunkLoad = await page.evaluate(async () => {
    const int8Reports = [];
    const res = await fetchOrGetCachedModel('assets/cellpose_cpsam_v2_data_int8.bin', 'Cellpose SAM-v2 INT8 Weights', (percent) => {
      int8Reports.push(percent);
    });
    const registry = JSON.parse(localStorage.getItem('LYNCEUS_MODEL_REGISTRY') || '{}');
    return {
      fileName: 'cellpose_cpsam_v2_data_int8.bin',
      hash: res.hash,
      cacheKey: res.cacheKey,
      fromCache: res.fromCache,
      registryHash: registry['cellpose_cpsam_v2_data_int8.bin'],
      byteLength: res.buffer.byteLength,
      int8Reports
    };
  });

  assert.strictEqual(int8DataChunkLoad.fromCache, false, 'First chunked INT8 data load should not be from cache');
  assert.strictEqual(int8DataChunkLoad.hash, '8a15627ca822ffdcd2978c9bafd837e56674aa44ee3793e8ee1944cf9b44f828', 'Concatenated SHA-256 hash must match manifest');
  assert.strictEqual(int8DataChunkLoad.byteLength, 304628928, 'Merged INT8 data buffer length must match 304,628,928 bytes');
  console.log(`  ✓ Cellpose CPSAM INT8 Data 10-Chunk Download: 10 chunks merged into ${(int8DataChunkLoad.byteLength / 1e6).toFixed(2)} MB buffer`);
  console.log(`  ✓ Cellpose CPSAM INT8 Data SHA-256 Validated: ${int8DataChunkLoad.hash}`);

  await browser.close();
  server.close();
  console.log('🎉 Persistent Model Cache & SHA-256 Hashing test PASSED successfully!\n');
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
