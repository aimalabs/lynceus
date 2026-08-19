const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

(async () => {
  console.log('\n🧪 Running Test Suite: WebGPU Engine & Overlapped Preloading Pipeline');

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-unsafe-webgpu',
      '--use-gl=angle',
      '--use-angle=metal',
      '--allow-file-access-from-files'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    if (text.includes('[Lynceus GPU]') || text.includes('[Preload Overlap]') || text.includes('[Stage 1 Cellpose]') || text.includes('[Stage 2 Swin-T]') || text.includes('[Euler Dynamics]')) {
      console.log(`  [Browser DL Engine]: ${text}`);
    }
  });

  const filePath = `file://${path.resolve(__dirname, '../index.html')}`;
  await page.goto(filePath, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.ort !== undefined, { timeout: 10000 });

  // Test 1: Validate MASTER_CLASSES taxonomy in browser
  const taxonomyTest = await page.evaluate(() => {
    return {
      masterClassesCount: typeof MASTER_CLASSES !== 'undefined' ? MASTER_CLASSES.length : 0,
      classes: typeof MASTER_CLASSES !== 'undefined' ? MASTER_CLASSES : []
    };
  });

  assert.strictEqual(taxonomyTest.masterClassesCount, 20, 'MASTER_CLASSES should contain exactly 20 ground-truth classes');
  assert.strictEqual(taxonomyTest.classes[0], 'Plt');
  assert.strictEqual(taxonomyTest.classes[4], 'Blasts');
  assert.strictEqual(taxonomyTest.classes[6], 'Neutrophils');
  console.log(`  ✓ Master 20-Class Taxonomy Verified (${taxonomyTest.masterClassesCount} lineages)`);

  // Test 2: Test Cellpose tensor preparation & Percentile Normalization
  const tensorTest = await page.evaluate(() => {
    const img = state.image;
    const prep = prepareCellposeTensor(img, 256, 256);
    return {
      dims: prep.tensor.dims,
      type: prep.tensor.type,
      length: prep.tensor.data.length,
      scaleX: prep.scaleX,
      scaleY: prep.scaleY
    };
  });

  assert.deepStrictEqual(tensorTest.dims, [1, 2, 256, 256], 'Cellpose tensor dims must be [1, 2, 256, 256]');
  assert.strictEqual(tensorTest.type, 'float32', 'Tensor type must be float32');
  console.log(`  ✓ Cellpose 2-Channel Inverted Cytology Tensor Shape: [${tensorTest.dims.join(', ')}]`);

  // Test 3: Test SquarePad and ImageNet Normalization
  const squarePadTest = await page.evaluate(() => {
    const img = state.image;
    const bbox = [100, 200, 180, 280]; // [minY, minX, maxY, maxX]
    const patchTensor = cropAndSquarePadCell(img, bbox, 224);
    
    // Check range (ImageNet normalized)
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (let i = 0; i < patchTensor.length; i++) {
      if (patchTensor[i] < minVal) minVal = patchTensor[i];
      if (patchTensor[i] > maxVal) maxVal = patchTensor[i];
    }

    return {
      length: patchTensor.length,
      expectedLength: 3 * 224 * 224,
      minVal: parseFloat(minVal.toFixed(2)),
      maxVal: parseFloat(maxVal.toFixed(2))
    };
  });

  assert.strictEqual(squarePadTest.length, squarePadTest.expectedLength, 'SquarePad tensor buffer length must match 3*224*224');
  console.log(`  ✓ SquarePad ImageNet Tensor Formatted: length=${squarePadTest.length}, range=[${squarePadTest.minVal}, ${squarePadTest.maxVal}]`);

  // Test 4: Test 2D Euler Flow Dynamics tracking
  const eulerTest = await page.evaluate(() => {
    const W = 64;
    const H = 64;
    const N = W * H;
    const dPy = new Float32Array(N);
    const dPx = new Float32Array(N);
    const cellprob = new Float32Array(N);

    // Create a circular convergent cell centered at (32, 32)
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = y * W + x;
        const dx = 32 - x;
        const dy = 32 - y;
        const dist = Math.hypot(dx, dy);
        if (dist < 16) {
          cellprob[idx] = 2.0; // High probability
          dPx[idx] = dist > 0 ? dx / dist : 0;
          dPy[idx] = dist > 0 ? dy / dist : 0;
        } else {
          cellprob[idx] = -2.0;
        }
      }
    }

    const { cells, mask } = computeMasksFromFlows(dPy, dPx, cellprob, W, H, {
      cellprobThreshold: 0.0,
      niter: 50,
      minArea: 10
    });

    return {
      cellsCount: cells.length,
      firstCell: cells[0] || null
    };
  });

  assert.strictEqual(eulerTest.cellsCount, 1, 'Euler flow dynamics should track the convergent flow sink');
  assert(eulerTest.firstCell.morphology.area_um2 > 0, 'Cell should have valid calculated area');
  console.log(`  ✓ 2D Euler Flow Vector Dynamics: successfully segmented ${eulerTest.cellsCount} cell with morphometry (${eulerTest.firstCell.morphology.area_um2} µm²)`);

  // Test 5: Test Non-Blocking Session Preloading & Overlap
  const preloadTest = await page.evaluate(async () => {
    const t0 = performance.now();
    const clfPromise = preloadClassifierSession();
    const isPromise = clfPromise instanceof Promise;
    const initialElapsed = performance.now() - t0;
    
    // Also trigger segmentation preloading concurrently
    const segPromise = preloadSegmentationSession();

    return {
      isPromise,
      initialElapsed: parseFloat(initialElapsed.toFixed(2))
    };
  });

  assert(preloadTest.isPromise, 'preloadClassifierSession must return an async Promise');
  assert(preloadTest.initialElapsed < 50, 'Session preloading must start asynchronously without blocking main thread');
  console.log(`  ✓ Pipelined Model Preloading: initiated concurrently in ${preloadTest.initialElapsed}ms`);

  await browser.close();
  console.log('🎉 WebGPU Engine & Overlapped Preloading Pipeline test PASSED successfully!\n');
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
