const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sampleDoeHash = 'a0e23d8c95e1a4af32b58edcf84e3442242231bb37a4cfd51298ebcd8ff653c3';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html') + '?hash=' + sampleDoeHash;

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

    // 4. Verify sidebars start off folded on mobile
    const mobileLeftWidth = await mobilePage.$eval('#left-sidebar', el => el.getBoundingClientRect().width);
    const mobileRightWidth = await mobilePage.$eval('#right-sidebar', el => el.getBoundingClientRect().width);
    const isExpandLeftShown = await mobilePage.$eval('#btn-expand-left', el => !el.classList.contains('hidden'));
    const isExpandRightShown = await mobilePage.$eval('#btn-expand-right', el => !el.classList.contains('hidden'));

    console.log('  ✓ Sidebars start folded on mobile:', {
      leftWidth: mobileLeftWidth,
      rightWidth: mobileRightWidth,
      expandLeft: isExpandLeftShown,
      expandRight: isExpandRightShown
    });
    assert.strictEqual(mobileLeftWidth, 0, 'Left sidebar should start folded (0px) on mobile');
    assert.strictEqual(mobileRightWidth, 0, 'Right sidebar should start folded (0px) on mobile');
    assert.strictEqual(isExpandLeftShown, true, 'Left expand button should be visible on mobile');
    assert.strictEqual(isExpandRightShown, true, 'Right expand button should be visible on mobile');

    // 5. Verify tapping expand on mobile unfolds sidebar
    await mobilePage.click('#btn-expand-left');
    await new Promise(r => setTimeout(r, 400));
    const unfoldedLeftWidth = await mobilePage.$eval('#left-sidebar', el => el.getBoundingClientRect().width);
    console.log('  ✓ Left sidebar unfolded on mobile via tap:', unfoldedLeftWidth);
    assert(unfoldedLeftWidth >= 180, 'Left sidebar should unfold when tapping expand handle');

    // 6. Verify touch dragging resizer border works on mobile
    const resizerBox = await mobilePage.$eval('#left-resizer', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    
    // Simulate touch drag
    await mobilePage.evaluate((box) => {
      const resizer = document.getElementById('left-resizer');
      const createTouch = (x, y) => new Touch({
        identifier: 1,
        target: resizer,
        clientX: x,
        clientY: y,
        screenX: x,
        screenY: y,
        pageX: x,
        pageY: y
      });

      const tStart = createTouch(box.x, box.y);
      resizer.dispatchEvent(new TouchEvent('touchstart', {
        touches: [tStart],
        targetTouches: [tStart],
        changedTouches: [tStart],
        bubbles: true,
        cancelable: true
      }));

      const tMove = createTouch(280, box.y);
      window.dispatchEvent(new TouchEvent('touchmove', {
        touches: [tMove],
        targetTouches: [tMove],
        changedTouches: [tMove],
        bubbles: true,
        cancelable: true
      }));

      const tEnd = createTouch(280, box.y);
      window.dispatchEvent(new TouchEvent('touchend', {
        touches: [],
        targetTouches: [],
        changedTouches: [tEnd],
        bubbles: true,
        cancelable: true
      }));
    }, resizerBox);
    await new Promise(r => setTimeout(r, 350));

    const resizedTouchWidth = await mobilePage.$eval('#left-sidebar', el => el.getBoundingClientRect().width);
    console.log('  ✓ Sidebar resized via mobile touch drag:', resizedTouchWidth);
    assert(resizedTouchWidth >= 250, 'Sidebar should be draggable/resizable via touch events on mobile');

    // 7. Verify right click is not prevented / hijacked anywhere on the canvas
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
