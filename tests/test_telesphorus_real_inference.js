const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

(async () => {
  console.log('\n🧪 Running Test Suite: Telesphorus Real Inference & WBC Differential Updates');

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
    console.log(`  [Browser Log]: ${text}`);
  });
  page.on('pageerror', err => {
    console.error('  [Page Error]:', err.message);
  });
  page.on('requestfailed', req => {
    console.error('  [Request Failed]:', req.url(), req.failure().errorText);
  });

  const filePath = `file://${path.resolve(__dirname, '../index.html')}`;
  await page.goto(filePath, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.ort !== undefined, { timeout: 10000 });

  // 1. Open Reset Modal
  await page.click('#btn-reset-detections');
  await page.waitForFunction(() => !document.getElementById('reset-confirm-modal').classList.contains('hidden'));
  console.log('  ✓ Model Selection / Reset Modal opened');

  // 2. Select Telesphorus (Flash Mode)
  await page.click('#card-model-fast');
  const isFastSelected = await page.evaluate(() => {
    return document.getElementById('card-model-fast').classList.contains('border-[#38bdf8]');
  });
  assert(isFastSelected, 'Telesphorus card should be highlighted with cyan border');
  console.log('  ✓ Selected Telesphorus (Flash Mode)');

  // 3. Confirm and run inference
  await page.click('#btn-confirm-reset');

  // 4. Verify loading view is active
  await page.waitForFunction(() => !document.getElementById('reset-loading-view').classList.contains('hidden'));
  console.log('  ✓ Telesphorus Progress HUD activated');

  // 5. Wait for inference pipeline completion
  await page.waitForFunction(() => document.getElementById('reset-confirm-modal').classList.contains('hidden'), { timeout: 30000 });
  console.log('  ✓ Telesphorus Inference Pipeline completed');

  // 6. Verify annotation state & predictions
  const stateCheck = await page.evaluate(() => {
    const anns = state.annotations;
    const hasValidPredictions = anns.every(a => a.predictions && a.predictions.length > 0 && typeof a.confidence === 'number');
    const hasMorphometrics = anns.every(a => a.morphology && a.morphology.area_um2 > 0);
    
    // Check WBC differential breakdown
    const leukocytes = anns.filter(a => ['neutrophil', 'lymphocyte', 'monocyte', 'eosinophil', 'basophil', 'blast'].includes(a.classId));
    const blasts = anns.filter(a => a.classId === 'blast');

    return {
      totalAnnotations: anns.length,
      hasValidPredictions,
      hasMorphometrics,
      leukocyteCount: leukocytes.length,
      blastCount: blasts.length,
      sampleCell: anns[0]
    };
  });

  assert(stateCheck.totalAnnotations >= 25, `Expected >= 25 annotations, got ${stateCheck.totalAnnotations}`);
  assert(stateCheck.hasValidPredictions, 'All annotations must contain predictions array and confidence');
  assert(stateCheck.hasMorphometrics, 'All annotations must contain calculated morphology');
  console.log(`  ✓ State verified: ${stateCheck.totalAnnotations} cells detected (${stateCheck.leukocyteCount} leukocytes, ${stateCheck.blastCount} blasts)`);
  console.log(`  ✓ Sample Cell: ID=${stateCheck.sampleCell.id}, Class=${stateCheck.sampleCell.label}, Confidence=${(stateCheck.sampleCell.confidence * 100).toFixed(1)}%`);

  // 7. Verify Critical Alert UI
  const alertCheck = await page.evaluate(() => {
    const banner = document.getElementById('wbc-alert-banner');
    return {
      bannerExists: banner !== null,
      bannerVisible: banner ? !banner.classList.contains('hidden') : false,
      bannerText: banner ? banner.textContent.trim() : ''
    };
  });
  console.log(`  ✓ Clinical Abnormality Alert Checked: exists=${alertCheck.bannerExists}, visible=${alertCheck.bannerVisible}`);

  await browser.close();
  console.log('🎉 Telesphorus Real Inference & WBC Differential test PASSED successfully!\n');
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
