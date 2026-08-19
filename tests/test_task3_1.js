const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('🧪 Running Test Suite: Task 3.1 - Layer & Visibility Controls');
  
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

    // 1. Test Master Overlay Toggle (Button & Hotkey H)
    const initialVisible = await page.evaluate(() => window.__CYTO_APP__.getVisibleAnnotations().length);
    console.log('  ✓ Initial Visible Annotations:', initialVisible);
    assert(initialVisible > 0, 'Should have visible annotations initially');

    // Click toggle button
    await page.click('#btn-toggle-overlay');
    const visibleAfterToggle = await page.evaluate(() => window.__CYTO_APP__.getVisibleAnnotations().length);
    console.log('  ✓ Visible Annotations after Master Toggle OFF:', visibleAfterToggle);
    assert.strictEqual(visibleAfterToggle, 0, 'Overlays should be 0 when toggled OFF');

    // Press H key to toggle back ON
    await page.keyboard.press('KeyH');
    const visibleAfterH = await page.evaluate(() => window.__CYTO_APP__.getVisibleAnnotations().length);
    console.log('  ✓ Visible Annotations after hotkey H (ON):', visibleAfterH);
    assert.strictEqual(visibleAfterH, initialVisible, 'Overlays should restore to original count');

    // 2. Test Per-Class Filter (Deselecting Neutrophils)
    await page.click('[data-class="neutrophil"]');
    const visibleAfterUncheck = await page.evaluate(() => window.__CYTO_APP__.getVisibleAnnotations().length);
    console.log('  ✓ Visible after unchecking Neutrophils:', visibleAfterUncheck);
    assert(visibleAfterUncheck < initialVisible, 'Visible count should decrease when Neutrophils unchecked');

    // 3. Test Solo Filter
    await page.click('button[data-solo="lymphocyte"]');
    const soloVisible = await page.evaluate(() => {
      const anns = window.__CYTO_APP__.getVisibleAnnotations();
      return {
        count: anns.length,
        allAreLymphocytes: anns.every(a => a.classId === 'lymphocyte')
      };
    });
    console.log('  ✓ After Solo Lymphocyte:', soloVisible);
    assert(soloVisible.count > 0, 'Should have lymphocytes visible');
    assert(soloVisible.allAreLymphocytes, 'All visible annotations must be lymphocytes in solo mode');

    // 4. Test "All" Reset Filter Button
    await page.click('#btn-filter-all');
    const allRestored = await page.evaluate(() => window.__CYTO_APP__.getVisibleAnnotations().length);
    console.log('  ✓ After Filter All:', allRestored);
    assert.strictEqual(allRestored, initialVisible, 'All filters should be restored');

    // 5. Test Confidence Threshold Slider
    await page.evaluate(() => {
      const slider = document.getElementById('conf-slider');
      slider.value = '0.98';
      slider.dispatchEvent(new Event('input'));
    });
    const highConfCount = await page.evaluate(() => window.__CYTO_APP__.getVisibleAnnotations().length);
    console.log('  ✓ Visible Annotations at 98% min confidence:', highConfCount);
    assert(highConfCount < initialVisible, 'Count should be filtered down at high confidence threshold');
    assert(highConfCount > 0, 'Should still have high confidence cells');

    console.log('🎉 Task 3.1 Test PASSED successfully!\n');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
