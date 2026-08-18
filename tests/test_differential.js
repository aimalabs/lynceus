const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('🧪 Running Test Suite: Live WBC Differential Count Table & Clinical Alerts');
  
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

    // 1. Verify WBC Total Count Display
    const wbcTotalText = await page.$eval('#wbc-total-count', el => el.textContent.trim());
    console.log('  ✓ Initial WBC Total Count:', wbcTotalText);
    assert(wbcTotalText.includes('WBC'), 'WBC total count should be displayed');

    // 2. Verify Stacked WBC Progress Bar Rendered
    const stackedBarSegments = await page.$$eval('#wbc-stacked-bar > div', els => els.length);
    console.log('  ✓ WBC Stacked Bar Segments:', stackedBarSegments);
    assert(stackedBarSegments >= 3, 'WBC stacked bar should have proportional segments for visible lineages');

    // 3. Verify Clinical Alert Banner (2 Blasts initially present)
    const isAlertVisible = await page.$eval('#wbc-alert-banner', el => !el.classList.contains('hidden'));
    const alertText = await page.$eval('#wbc-alert-text', el => el.textContent.trim());
    console.log('  ✓ Initial Abnormality Banner:', { visible: isAlertVisible, text: alertText });
    assert.strictEqual(isAlertVisible, true, 'Alert banner should be visible when blasts are detected');
    assert(alertText.includes('Blast'), 'Alert banner text should indicate Blast cells');

    // 4. Test Differential Updates upon Reclassification
    // Select both blasts and reclassify them to neutrophils
    const blastCells = await page.evaluate(() => 
      window.__CYTO_APP__.state.annotations.filter(a => a.classId === 'blast').map(a => a.id)
    );
    for (const bId of blastCells) {
      await page.evaluate(id => window.__CYTO_APP__.reclassifyCell(id, 'neutrophil'), bId);
    }

    const isAlertHiddenAfterReclass = await page.$eval('#wbc-alert-banner', el => el.classList.contains('hidden'));
    console.log('  ✓ Alert Banner state after clearing blasts:', isAlertHiddenAfterReclass ? 'Hidden' : 'Visible');
    
    // 5. Test Undo restores Blast alert
    await page.evaluate(() => window.__CYTO_APP__.undo());
    const isAlertRestored = await page.$eval('#wbc-alert-banner', el => !el.classList.contains('hidden'));
    console.log('  ✓ Alert Banner restored after undo:', isAlertRestored);
    assert.strictEqual(isAlertRestored, true, 'Undo should restore Blast alert banner');

    console.log('🎉 Live WBC Differential tests PASSED successfully!\n');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
