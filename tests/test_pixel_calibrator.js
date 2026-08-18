const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('🧪 Running Test Suite: Optical Pixel Size Calibrator & Dynamic Scaling');
  
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    await page.goto(indexPath, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded);

    // 1. Verify Initial Calibration (0.125 um/px)
    const initialMpp = await page.evaluate(() => window.__CYTO_APP__.state.micronsPerPixel);
    console.log('  ✓ Initial Microns/Pixel:', initialMpp);
    assert.strictEqual(initialMpp, 0.125, 'Initial calibration should default to 0.125 um/px');

    // 2. Select first cell and check initial morphometrics
    await page.evaluate(() => window.__CYTO_APP__.selectCell('c-01'));
    let cellArea = await page.$eval('#insp-area', el => el.textContent.trim());
    let cellDiam = await page.$eval('#insp-diam', el => el.textContent.trim());
    console.log('  ✓ Initial Cell Morphometrics (40x Standard):', { area: cellArea, diam: cellDiam });
    assert(cellArea.includes('154.2') || cellArea.includes('154'), 'Initial area should be ~154 um2');

    // 3. Click on Scale Legend to Open Calibrator Modal
    const isModalHiddenBefore = await page.$eval('#calibrator-modal', el => el.classList.contains('hidden'));
    assert.strictEqual(isModalHiddenBefore, true, 'Modal should initially be hidden');

    await page.click('#btn-scale-calibrator');
    const isModalVisibleAfter = await page.$eval('#calibrator-modal', el => !el.classList.contains('hidden'));
    console.log('  ✓ Calibrator Modal Opened by clicking scale legend:', isModalVisibleAfter);
    assert.strictEqual(isModalVisibleAfter, true, 'Calibrator modal must open upon clicking scale legend');

    // 4. Select 100x Oil Preset (0.065 um/px)
    await page.click('button[data-mpp="0.065"]');
    const updatedMpp = await page.evaluate(() => window.__CYTO_APP__.state.micronsPerPixel);
    console.log('  ✓ Updated Microns/Pixel after preset:', updatedMpp);
    assert.strictEqual(updatedMpp, 0.065, 'Microns/pixel should update to 0.065');

    // 5. Verify ALL Cell Morphometrics updated dynamically
    cellArea = await page.$eval('#insp-area', el => el.textContent.trim());
    cellDiam = await page.$eval('#insp-diam', el => el.textContent.trim());
    console.log('  ✓ Recalculated Cell Morphometrics at 0.065 um/px:', { area: cellArea, diam: cellDiam });
    assert(parseFloat(cellArea) < 60, 'Area should have decreased with higher magnification calibration');
    assert(parseFloat(cellDiam) < 10, 'Diameter should have decreased with higher magnification calibration');

    // 6. Test Custom Calibration Input (e.g. 0.250 um/px)
    await page.click('#btn-scale-calibrator');
    await page.$eval('#input-mpp', el => el.value = '');
    await page.type('#input-mpp', '0.250');
    await page.click('#btn-apply-calibration');

    const customMpp = await page.evaluate(() => window.__CYTO_APP__.state.micronsPerPixel);
    console.log('  ✓ Custom Microns/Pixel applied:', customMpp);
    assert.strictEqual(customMpp, 0.25, 'Microns/pixel should update to 0.25');

    cellArea = await page.$eval('#insp-area', el => el.textContent.trim());
    console.log('  ✓ Recalculated Cell Area at 0.250 um/px:', cellArea);
    assert(parseFloat(cellArea) > 500, 'Area should be > 500 um2 at 0.25 um/px');

    // 7. Verify Caliper Ruler uses updated calibration
    await page.keyboard.press('KeyM'); // Caliper tool
    await page.mouse.move(500, 200);
    await page.mouse.down();
    await page.mouse.move(600, 200, { steps: 5 });
    await page.mouse.up();

    const caliperDist = await page.evaluate(() => window.__CYTO_APP__.state.measurements[0].distUm);
    console.log('  ✓ Caliper 100px length at 0.25 um/px:', caliperDist, 'µm');
    assert(Math.abs(parseFloat(caliperDist) - 25.0) < 2.0, '100px at 0.25 um/px should be ~25 um');

    // 8. Restore default 0.125 um/px
    await page.evaluate(() => window.__CYTO_APP__.setCalibration(0.125));

    console.log('🎉 Optical Pixel Size Calibrator tests PASSED successfully!\n');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
