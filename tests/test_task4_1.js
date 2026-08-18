const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('🧪 Running Test Suite: Task 4.1 - Human-in-the-Loop Annotation & Editing Suite (aimalabs Theme)');
  
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

    // 1. Verify "aimalabs" brand title & header
    const brandText = await page.evaluate(() => document.querySelector('header').textContent);
    console.log('  ✓ Header content:', brandText.trim().slice(0, 40));
    assert(brandText.toLowerCase().includes('aimalabs'), 'Header must contain "aimalabs" platform name');

    // 2. Test Tool Selection via Hotkeys and Buttons
    await page.keyboard.press('KeyB'); // Box tool
    let activeTool = await page.evaluate(() => window.__CYTO_APP__.state.tool);
    assert.strictEqual(activeTool, 'box', 'Hotkey B should switch to Box tool');

    await page.keyboard.press('KeyC'); // Circle tool
    activeTool = await page.evaluate(() => window.__CYTO_APP__.state.tool);
    assert.strictEqual(activeTool, 'circle', 'Hotkey C should switch to Circle tool');

    await page.keyboard.press('KeyM'); // Caliper tool
    activeTool = await page.evaluate(() => window.__CYTO_APP__.state.tool);
    assert.strictEqual(activeTool, 'measure', 'Hotkey M should switch to Caliper tool');

    await page.keyboard.press('KeyV'); // Select tool
    activeTool = await page.evaluate(() => window.__CYTO_APP__.state.tool);
    assert.strictEqual(activeTool, 'select', 'Hotkey V should switch back to Select tool');
    console.log('  ✓ Tool hotkey switching verified');

    // 3. Test Drawing a New Bounding Box on Canvas
    const initialCount = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    await page.click('#tool-dropdown-trigger');
    await page.click('button[data-tool="box"]');

    // Draw a box from (300, 300) to (400, 400)
    await page.mouse.move(300, 300);
    await page.mouse.down();
    await page.mouse.move(400, 400, { steps: 5 });
    await page.mouse.up();

    const countAfterBox = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    console.log('  ✓ Annotations after drawing Box:', { before: initialCount, after: countAfterBox });
    assert.strictEqual(countAfterBox, initialCount + 1, 'Drawing box should add a new annotation');

    // 4. Test Drawing a Caliper Measurement
    await page.click('#tool-dropdown-trigger');
    await page.click('button[data-tool="measure"]');
    await page.mouse.move(500, 300);
    await page.mouse.down();
    await page.mouse.move(600, 300, { steps: 5 });
    await page.mouse.up();

    const measurementsCount = await page.evaluate(() => window.__CYTO_APP__.state.measurements.length);
    console.log('  ✓ Caliper measurements count:', measurementsCount);
    assert.strictEqual(measurementsCount, 1, 'Should record caliper measurement');

    // 5. Test Quick Point Placement
    await page.click('#tool-dropdown-trigger');
    await page.click('button[data-tool="point"]');
    await page.mouse.click(700, 400);

    const countAfterPoint = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    console.log('  ✓ Annotations after Point placement:', countAfterPoint);
    assert.strictEqual(countAfterPoint, countAfterBox + 1, 'Point placement should add another cell');

    // 6. Test Eraser Tool
    await page.click('#tool-dropdown-trigger');
    await page.click('button[data-tool="erase"]');
    await page.mouse.click(700, 400); // Erase the placed point cell

    const countAfterErase = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    console.log('  ✓ Annotations after Eraser click:', countAfterErase);
    assert.strictEqual(countAfterErase, countAfterBox, 'Eraser should delete the clicked cell');

    console.log('🎉 Task 4.1 Test PASSED successfully!\n');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
