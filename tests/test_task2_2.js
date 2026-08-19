const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('🧪 Running Test Suite: Task 2.2 - Optical Scale & Magnification Controls');
  
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(indexPath, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded);

    // 1. Verify Scale Bar Element
    const scaleText = await page.$eval('#scale-value-text', el => el.textContent.trim());
    const objectiveTag = await page.$eval('#active-obj-label', el => el.textContent.trim());
    console.log('  ✓ Initial Scale Bar:', { scale: scaleText, objective: objectiveTag });
    assert(scaleText.includes('µm'), 'Scale bar should display micron units');

    // 2. Test Objective Preset Buttons (e.g. 100x Oil Immersion via Objective Dropdown)
    await page.click('#obj-dropdown-trigger');
    const oilBtn = await page.$('button[data-zoom="1.00"]');
    assert(oilBtn, '100x Oil button should exist');
    await oilBtn.click();

    const zoom100 = await page.evaluate(() => window.__CYTO_APP__.state.view.zoom);
    const objTag100 = await page.$eval('#active-obj-label', el => el.textContent.trim());
    console.log('  ✓ After clicking 100x Oil Immersion:', { zoom: zoom100, tag: objTag100 });
    assert.strictEqual(zoom100, 1.0, 'Zoom should be 1.0 for 100x Oil');
    assert(objTag100.includes('100× Oil'), 'Objective tag should indicate 100x Oil Immersion');

    // 3. Test 10x Preset
    await page.click('#obj-dropdown-trigger');
    const lowBtn = await page.$('button[data-zoom="0.10"]');
    await lowBtn.click();
    const zoom10 = await page.evaluate(() => window.__CYTO_APP__.state.view.zoom);
    console.log('  ✓ After clicking 10x Overview:', { zoom: zoom10 });
    assert.strictEqual(zoom10, 0.1, 'Zoom should be 0.1 for 10x');

    // 4. Test Viewport Fit Action
    await page.click('#btn-zoom-reset');
    const fitZoom = await page.evaluate(() => window.__CYTO_APP__.state.view.zoom);
    console.log('  ✓ Zoom after Fit action:', fitZoom);
    assert(fitZoom > 0, 'Fit zoom should be positive');

    console.log('🎉 Task 2.2 Test PASSED successfully!\n');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
