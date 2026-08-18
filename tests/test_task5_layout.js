const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('🧪 Running Test Suite: Task 5 - AIMALABS Visual Layout & Resizable Sidebars');
  
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

    // 1. Verify Brand Anchor and Logo
    const brandElement = await page.$('.brand');
    assert(brandElement, 'Brand element must exist');
    const brandText = await page.$eval('.brand b', el => el.textContent.trim());
    assert.strictEqual(brandText, 'AIMALABS', 'Brand header text must be AIMALABS');
    console.log('  ✓ Official AIMALABS brand markup verified');

    // 2. Test Left Sidebar Resizing
    const leftResizerBox = await page.$eval('#left-resizer', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    const initialLeftWidth = await page.$eval('#left-sidebar', el => el.getBoundingClientRect().width);

    await page.mouse.move(leftResizerBox.x, leftResizerBox.y);
    await page.mouse.down();
    await page.mouse.move(leftResizerBox.x + 60, leftResizerBox.y, { steps: 5 });
    await page.mouse.up();

    const newLeftWidth = await page.$eval('#left-sidebar', el => el.getBoundingClientRect().width);
    console.log('  ✓ Left sidebar width resized:', { before: initialLeftWidth, after: newLeftWidth });
    assert(newLeftWidth > initialLeftWidth, 'Left sidebar should expand on drag');

    // 3. Test Right Sidebar Resizing
    const rightResizerBox = await page.$eval('#right-resizer', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    const initialRightWidth = await page.$eval('#right-sidebar', el => el.getBoundingClientRect().width);

    await page.mouse.move(rightResizerBox.x, rightResizerBox.y);
    await page.mouse.down();
    await page.mouse.move(rightResizerBox.x - 50, rightResizerBox.y, { steps: 5 });
    await page.mouse.up();

    const newRightWidth = await page.$eval('#right-sidebar', el => el.getBoundingClientRect().width);
    console.log('  ✓ Right sidebar width resized:', { before: initialRightWidth, after: newRightWidth });
    assert(newRightWidth > initialRightWidth, 'Right sidebar should expand when dragged left');

    // 4. Test Key Controls Clickability & No Element Overlaps
    const buttons = ['#btn-zoom-reset', '#btn-close-minimap', '#btn-toggle-reticle', '#obj-dropdown-trigger', '#tool-dropdown-trigger'];
    for (const selector of buttons) {
      const isClickable = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        const topEl = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return topEl === el || el.contains(topEl);
      }, selector);
      console.log(`  ✓ Button ${selector} directly clickable (no overlap):`, isClickable);
      assert.strictEqual(isClickable, true, `Button ${selector} must not be covered by other elements`);
    }

    console.log('🎉 Task 5 Test PASSED successfully!\n');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
