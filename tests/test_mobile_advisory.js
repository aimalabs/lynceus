const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('🧪 Running Test Suite: Mobile Advisory Modal & Desktop Workstation Notice');
  
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  try {
    // 1. Desktop viewport (no modal should appear)
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(indexPath, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded);

    const isHiddenOnDesktop = await page.$eval('#mobile-advisory-modal', el => el.classList.contains('hidden'));
    console.log('  ✓ Modal is hidden on standard desktop display:', isHiddenOnDesktop);
    assert.strictEqual(isHiddenOnDesktop, true, 'Advisory modal should be hidden on desktop');

    // 2. Mobile User-Agent / Touch Device Simulation
    const mobilePage = await browser.newPage();
    await mobilePage.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1');
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await mobilePage.goto(indexPath, { waitUntil: 'load' });
    await mobilePage.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded);

    const isVisibleOnMobile = await mobilePage.$eval('#mobile-advisory-modal', el => !el.classList.contains('hidden'));
    console.log('  ✓ Advisory modal automatically opens on mobile device:', isVisibleOnMobile);
    assert.strictEqual(isVisibleOnMobile, true, 'Advisory modal should appear on mobile');

    // 3. Dismiss on mobile ("Continue on Mobile Anyway")
    await mobilePage.click('#btn-dismiss-mobile-modal');
    const isHiddenAfterDismiss = await mobilePage.$eval('#mobile-advisory-modal', el => el.classList.contains('hidden'));
    console.log('  ✓ Advisory modal dismissed when continuing on mobile:', isHiddenAfterDismiss);
    assert.strictEqual(isHiddenAfterDismiss, true, 'Modal should close on dismiss');

    // 4. Verify right click is not prevented / hijacked anywhere on the canvas
    const rightClickHandledNaturally = await page.evaluate(() => {
      const canvas = document.getElementById('microscope-canvas');
      let defaultPrevented = false;
      const event = new MouseEvent('contextmenu', {
        clientX: 200,
        clientY: 200,
        bubbles: true,
        cancelable: true
      });
      canvas.dispatchEvent(event);
      return !event.defaultPrevented;
    });
    console.log('  ✓ Right click is native (not hijacked or prevented):', rightClickHandledNaturally);
    assert.strictEqual(rightClickHandledNaturally, true, 'Right click should not be prevented');

    console.log('🎉 Mobile Advisory & Right-Click tests PASSED successfully!\n');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
