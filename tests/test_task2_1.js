const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('🧪 Running Test Suite: Task 2.1 - Interactive Minimap (Slide Navigator)');
  
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

    // 1. Verify Minimap Canvas exists and has dimensions
    const minimapCanvas = await page.$eval('#minimap-canvas', el => ({
      width: el.width,
      height: el.height,
      clientWidth: el.clientWidth,
      clientHeight: el.clientHeight
    }));
    console.log('  ✓ Minimap Canvas Size:', minimapCanvas);
    assert.strictEqual(minimapCanvas.width, 160, 'Minimap width should be 160');
    assert.strictEqual(minimapCanvas.height, 120, 'Minimap height should be 120');

    // 2. Test Minimap Click to Pan
    const initialView = await page.evaluate(() => ({ ...window.__CYTO_APP__.state.view }));
    console.log('  ✓ Initial View Center Before Minimap Jump:', initialView);

    // Click near top-left of minimap (e.g. x: 30, y: 30)
    const minimapBox = await page.$eval('#minimap-canvas', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + 30, y: r.top + 30 };
    });

    await page.mouse.click(minimapBox.x, minimapBox.y);
    const viewAfterMinimapClick = await page.evaluate(() => ({ ...window.__CYTO_APP__.state.view }));
    console.log('  ✓ View After Minimap Click:', viewAfterMinimapClick);

    // Verify view shifted
    assert(Math.abs(viewAfterMinimapClick.x - initialView.x) > 10 || Math.abs(viewAfterMinimapClick.y - initialView.y) > 10, 'View should have updated from minimap navigation');

    // 3. Test Minimap Toggle (Collapse / Expand)
    await page.click('#btn-close-minimap');
    const isHidden = await page.$eval('#minimap-container', el => el.style.display === 'none');
    console.log('  ✓ Minimap collapsed:', isHidden);
    assert.strictEqual(isHidden, true, 'Minimap should be hidden after collapse toggle');

    await page.click('#btn-close-minimap');
    const isRestored = await page.$eval('#minimap-container', el => el.style.display === 'block');
    console.log('  ✓ Minimap restored:', isRestored);
    assert.strictEqual(isRestored, true, 'Minimap should be restored after expand toggle');

    console.log('🎉 Task 2.1 Test PASSED successfully!\n');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
