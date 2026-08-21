const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');
const http = require('http');
const fs = require('fs');

(async () => {
  console.log('🧪 Running E2E Integration Test: "Run Inference and Reset" Timing Benchmark...\n');

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

  const testPort = 3948;
  await new Promise(r => server.listen(testPort, r));

  const testProfileDir = fs.mkdtempSync(path.join('/tmp', 'lynceus_timing_'));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: testProfileDir,
    protocolTimeout: 120000,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-unsafe-webgpu'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const timingBreakdowns = [];
    page.on('console', msg => {
      const text = msg.text();
      if (!text.includes('Tailwind') && !text.includes('404')) {
        console.log(`  [Browser]: ${text}`);
      }
      if (text.includes('⏱️') || text.includes('🏁') || text.includes('[Lynceus Pipeline]')) {
        timingBreakdowns.push(text);
      }
    });
    page.on('pageerror', err => {
      console.error(`  [Browser Error]: ${err.message}`);
    });

    console.log(`📡 Connecting to http://localhost:${testPort}...`);
    await page.goto(`http://localhost:${testPort}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 15000 });

    console.log('✓ Slide workspace loaded.');

    async function measureE2EInferenceClick(runLabel, modelType = 'fast') {
      console.log(`\n============================================================`);
      console.log(`🚀 Triggering UI Click Benchmark: ${runLabel}`);
      console.log(`============================================================`);

      timingBreakdowns.length = 0;

      // 1. Physically click the "Re-Run AI Inference / Reset Models" button in header
      const t0HeaderClick = performance.now();
      await page.click('#btn-reset-detections');

      // 2. Wait for modal to display
      await page.waitForSelector('#reset-confirm-modal:not(.hidden)', { visible: true });
      const tModalVisible = performance.now();

      // 3. Select model architecture (fast / Telesphorus)
      if (modelType === 'fast') {
        await page.click('#card-model-fast');
      } else {
        await page.click('#card-model-pro');
      }

      // 4. Click the confirmation button to start AI analysis
      const tConfirmClick = performance.now();
      await page.click('#btn-confirm-reset');

      // 5. Wait for progress HUD to complete and modal to fold back to hidden
      await page.waitForFunction(() => {
        const m = document.getElementById('reset-confirm-modal');
        return m && m.classList.contains('hidden');
      }, { timeout: 45000 });
      const tModalClosed = performance.now();

      // 6. Wait for canvas render to settle
      await page.evaluate(async () => {
        return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      });
      const tRenderSettled = performance.now();

      const totalE2EMs = tRenderSettled - t0HeaderClick;
      const inferenceExecutionMs = tModalClosed - tConfirmClick;
      const modalOpenMs = tModalVisible - t0HeaderClick;

      // 7. Verify committed cell count in application state
      const stateSummary = await page.evaluate(() => {
        const annotations = window.__CYTO_APP__.state.annotations;
        const count = annotations.length;
        const leukocytes = annotations.filter(a => !['plt', 'platelet'].includes(a.classId) && !a.classId.includes('rbc')).length;
        const platelets = annotations.filter(a => ['plt', 'platelet'].includes(a.classId)).length;
        const rbcVariants = annotations.filter(a => a.classId.includes('rbc') || a.classId.includes('cells')).length;
        return { count, leukocytes, platelets, rbcVariants };
      });

      console.log(`\n⏱️ Performance Breakdown for ${runLabel}:`);
      console.log(`   • Modal Trigger & Open Latency:       ${modalOpenMs.toFixed(1)} ms`);
      console.log(`   • Active Pipeline Execution Time:     ${(inferenceExecutionMs / 1000).toFixed(2)} s (${inferenceExecutionMs.toFixed(1)} ms)`);
      console.log(`   • Total End-to-End Time (Click -> Screen): ${(totalE2EMs / 1000).toFixed(2)} s (${totalE2EMs.toFixed(1)} ms)`);
      console.log(`   • Committed Cells Detected:           ${stateSummary.count} cells (${stateSummary.leukocytes} WBCs, ${stateSummary.platelets} PLTs)`);

      return {
        runLabel,
        totalE2EMs,
        inferenceExecutionMs,
        modalOpenMs,
        stateSummary
      };
    }

    // Benchmark Run 1 (Cold / Initial Model Load)
    const run1 = await measureE2EInferenceClick('Run 1: Cold Start (Initial Load & Cache Check)', 'fast');

    // Benchmark Run 2 (Warm / In-Memory Cached Execution)
    const run2 = await measureE2EInferenceClick('Run 2: Warm Start (In-Memory WebGPU Session)', 'fast');

    console.log(`\n============================================================`);
    console.log(`📊 FINAL BENCHMARK COMPARISON SUMMARY`);
    console.log(`============================================================`);
    console.log(`• Cold-Start Total E2E: ${(run1.totalE2EMs / 1000).toFixed(2)}s | Pipeline: ${(run1.inferenceExecutionMs / 1000).toFixed(2)}s | Cells: ${run1.stateSummary.count}`);
    console.log(`• Warm-Start Total E2E: ${(run2.totalE2EMs / 1000).toFixed(2)}s | Pipeline: ${(run2.inferenceExecutionMs / 1000).toFixed(2)}s | Cells: ${run2.stateSummary.count}`);
    console.log(`============================================================\n`);

    // Verify cell count is within expected range [100, 140]
    assert.ok(
      run1.stateSummary.count >= 100 && run1.stateSummary.count <= 140,
      `Expected Run 1 cell count to be between 100 and 140, but found ${run1.stateSummary.count}`
    );
    assert.ok(
      run2.stateSummary.count >= 100 && run2.stateSummary.count <= 140,
      `Expected Run 2 cell count to be between 100 and 140, but found ${run2.stateSummary.count}`
    );

    console.log(`✓ Cell Count Verified: ${run2.stateSummary.count} cells (within acceptable [100, 140] range)`);
    console.log('🎉 E2E "Run Inference and Reset" timing integration test completed successfully!\n');
  } finally {
    await browser.close();
    server.close();
    try {
      fs.rmSync(testProfileDir, { recursive: true, force: true });
    } catch (_) {}
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
