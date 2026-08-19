const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('🧪 Running Test Suite: Collapsible Sidebars (Tolerance, Collapse & Reveal Animations)');
  
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

    // 1. Verify initial sidebar widths
    const initialLeftWidth = await page.$eval('#left-sidebar', el => el.getBoundingClientRect().width);
    const initialRightWidth = await page.$eval('#right-sidebar', el => el.getBoundingClientRect().width);
    console.log('  ✓ Initial sidebars:', { left: initialLeftWidth, right: initialRightWidth });
    assert(initialLeftWidth >= 200, 'Left sidebar should start around 240px');
    assert(initialRightWidth >= 240, 'Right sidebar should start around 280px');

    // 2. Test Tolerance Zone: Drag left sidebar to 140px (below min 180px, but above collapse threshold 90px)
    const leftResizerBox = await page.$eval('#left-resizer', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });

    await page.mouse.move(leftResizerBox.x, leftResizerBox.y);
    await page.mouse.down();
    await page.mouse.move(140, leftResizerBox.y, { steps: 5 });
    await page.mouse.up();
    await new Promise(r => setTimeout(r, 400)); // wait for animation

    const toleranceWidth = await page.$eval('#left-sidebar', el => el.getBoundingClientRect().width);
    console.log('  ✓ Left sidebar in tolerance zone (held minimum visible size):', toleranceWidth);
    assert(toleranceWidth >= 170, 'Sidebar should hold minimum visible size in tolerance zone without hair-trigger collapsing');

    // 3. Test Collapse Left Sidebar: Drag past tolerance to 50px (<= 90px threshold)
    const leftResizerBox2 = await page.$eval('#left-resizer', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });

    await page.mouse.move(leftResizerBox2.x, leftResizerBox2.y);
    await page.mouse.down();
    await page.mouse.move(50, leftResizerBox2.y, { steps: 5 });
    await page.mouse.up();
    await new Promise(r => setTimeout(r, 450)); // wait for smooth collapse animation

    const collapsedLeftWidth = await page.$eval('#left-sidebar', el => el.getBoundingClientRect().width);
    const isExpandLeftVisible = await page.$eval('#btn-expand-left', el => !el.classList.contains('hidden'));
    console.log('  ✓ Left sidebar collapsed to 0px:', { width: collapsedLeftWidth, expandBtnVisible: isExpandLeftVisible });
    assert.strictEqual(collapsedLeftWidth, 0, 'Left sidebar should be collapsed to 0px');
    assert.strictEqual(isExpandLeftVisible, true, 'Expand button on left edge should appear');

    // 4. Test Reveal Left Sidebar: Click expand button
    await page.click('#btn-expand-left');
    await new Promise(r => setTimeout(r, 450)); // wait for smooth reveal animation

    const restoredLeftWidth = await page.$eval('#left-sidebar', el => el.getBoundingClientRect().width);
    const isExpandLeftHidden = await page.$eval('#btn-expand-left', el => el.classList.contains('hidden'));
    console.log('  ✓ Left sidebar restored via expand button:', { width: restoredLeftWidth, expandBtnHidden: isExpandLeftHidden });
    assert(restoredLeftWidth >= 180, 'Left sidebar should restore to visible width');
    assert.strictEqual(isExpandLeftHidden, true, 'Expand button should hide when sidebar is open');

    // 5. Test Collapse Right Sidebar: Drag all the way to right edge (x = 1360px, distance from right = 40px <= 110px threshold)
    const rightResizerBox = await page.$eval('#right-resizer', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });

    await page.mouse.move(rightResizerBox.x, rightResizerBox.y);
    await page.mouse.down();
    await page.mouse.move(1360, rightResizerBox.y, { steps: 5 });
    await page.mouse.up();
    await new Promise(r => setTimeout(r, 450)); // wait for smooth collapse animation

    const collapsedRightWidth = await page.$eval('#right-sidebar', el => el.getBoundingClientRect().width);
    const isExpandRightVisible = await page.$eval('#btn-expand-right', el => !el.classList.contains('hidden'));
    console.log('  ✓ Right sidebar collapsed to 0px:', { width: collapsedRightWidth, expandBtnVisible: isExpandRightVisible });
    assert.strictEqual(collapsedRightWidth, 0, 'Right sidebar should be collapsed to 0px');
    assert.strictEqual(isExpandRightVisible, true, 'Expand button on right edge should appear');

    // 6. Test Reveal Right Sidebar: Click expand button
    await page.click('#btn-expand-right');
    await new Promise(r => setTimeout(r, 450)); // wait for smooth reveal animation

    const restoredRightWidth = await page.$eval('#right-sidebar', el => el.getBoundingClientRect().width);
    const isExpandRightHidden = await page.$eval('#btn-expand-right', el => el.classList.contains('hidden'));
    console.log('  ✓ Right sidebar restored via expand button:', { width: restoredRightWidth, expandBtnHidden: isExpandRightHidden });
    assert(restoredRightWidth >= 220, 'Right sidebar should restore to visible width');
    assert.strictEqual(isExpandRightHidden, true, 'Expand button should hide when sidebar is open');

    console.log('🎉 Collapsible Sidebars tests PASSED successfully!\n');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
