const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

(async () => {
  console.log('\n🧪 Running Test Suite: Inference Loading Spinner & Stop Button');

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

  const sampleDoeHash = 'a0e23d8c95e1a4af32b58edcf84e3442242231bb37a4cfd51298ebcd8ff653c3';
  const filePath = `file://${path.resolve(__dirname, '../index.html')}?hash=${sampleDoeHash}`;
  await page.goto(filePath, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.ort !== undefined, { timeout: 10000 });

  // 1. Open the inference / reset modal
  await page.click('#btn-reset-detections');
  await page.waitForSelector('#reset-confirm-modal:not(.hidden)');

  // 2. Click "Run Inference & Reset" to start Asclepius (5.0s run)
  await page.click('#btn-confirm-reset');
  await page.waitForSelector('#reset-loading-view:not(.hidden)');

  // 3. Verify spinning circle SVG
  const isSpinning = await page.evaluate(() => {
    const svg = document.querySelector('#reset-loading-model-name svg');
    return svg ? svg.classList.contains('animate-spin') : false;
  });
  console.log(`  ✓ Loading Icon Spinner Active (animate-spin): ${isSpinning}`);
  assert.strictEqual(isSpinning, true, 'Circle next to loading title must have animate-spin class');

  // 4. Verify Stop Button exists and is visible
  const hasStopButton = await page.evaluate(() => {
    const btn = document.getElementById('btn-stop-inference');
    return btn !== null && btn.offsetParent !== null;
  });
  console.log(`  ✓ Stop Analysis Button Visible: ${hasStopButton}`);
  assert.strictEqual(hasStopButton, true, 'Stop Analysis button should be visible in loading HUD');

  // 5. Click the Stop Analysis Button
  await page.click('#btn-stop-inference');
  console.log('  ✓ Clicked #btn-stop-inference');

  // Wait a moment for abort handling and modal close
  await page.waitForFunction(() => document.getElementById('reset-confirm-modal').classList.contains('hidden'), { timeout: 3000 });
  console.log('  ✓ Inference successfully aborted and modal closed');

  // Verify toast notification
  const toastText = await page.evaluate(() => document.getElementById('toast-message').textContent);
  console.log(`  ✓ Toast Notification: "${toastText}"`);
  assert(toastText.includes('stopped') || toastText.includes('Restored'), 'Should display abort/stop toast message');

  await browser.close();
  console.log('🎉 Inference Loading Spinner & Stop Button Test PASSED successfully!\n');
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
