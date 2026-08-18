const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('🧪 Running Test Suite: Task 1.2 - Base Microscope Canvas & Transforms');
  
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(indexPath, { waitUntil: 'load' });

    // Wait for image/canvas initialization
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded);

    // 1. Verify Initial Zoom and Fit
    const initialView = await page.evaluate(() => ({ ...window.__CYTO_APP__.state.view }));
    console.log('  ✓ Initial View State:', initialView);
    assert(initialView.zoom > 0.2 && initialView.zoom < 2.0, 'Initial zoom should be reasonable');

    // 2. Test Zoom In via Keyboard (+)
    await page.keyboard.press('Equal'); // '+'
    const zoomInView = await page.evaluate(() => window.__CYTO_APP__.state.view.zoom);
    console.log('  ✓ Zoom After Keyboard +:', zoomInView);
    assert(zoomInView > initialView.zoom, 'Zoom should have increased');

    // 3. Test Zoom Out via Keyboard (-)
    await page.keyboard.press('Minus'); // '-'
    const zoomOutView = await page.evaluate(() => window.__CYTO_APP__.state.view.zoom);
    console.log('  ✓ Zoom After Keyboard -:', zoomOutView);
    assert(zoomOutView < zoomInView, 'Zoom should have decreased');

    // 4. Test Fit via Reset Button (0)
    await page.click('#btn-zoom-reset');
    const resetZoom = await page.evaluate(() => window.__CYTO_APP__.state.view.zoom);
    console.log('  ✓ Reset Zoom (Fit):', resetZoom);
    assert(Math.abs(resetZoom - initialView.zoom) < 0.05, 'Reset zoom should return close to initial fit');

    // 5. Test Mouse Wheel Zoom
    const canvasCenter = await page.$eval('#microscope-canvas', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.mouse.move(canvasCenter.x, canvasCenter.y);
    await page.mouse.wheel({ deltaY: -100 }); // Zoom in
    const wheelZoom = await page.evaluate(() => window.__CYTO_APP__.state.view.zoom);
    console.log('  ✓ Mouse Wheel Zoom In:', wheelZoom);
    assert(wheelZoom > resetZoom, 'Mouse wheel should zoom in');

    await page.keyboard.press('Digit0'); // '0'
    const kbZoomReset = await page.evaluate(() => window.__CYTO_APP__.state.view.zoom);
    assert(Math.abs(kbZoomReset - initialView.zoom) < 0.05, 'Keyboard 0 should reset fit');
    console.log('  ✓ Keyboard zoom shortcuts (+, -, 0) working');

    // 6. Test Mouse Drag Pan
    const canvasBox = await page.$eval('#microscope-canvas', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });

    const beforePan = await page.evaluate(() => ({ ...window.__CYTO_APP__.state.view }));
    await page.mouse.move(canvasBox.x, canvasBox.y);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 80, canvasBox.y + 60, { steps: 5 });
    await page.mouse.up();

    const afterPan = await page.evaluate(() => ({ ...window.__CYTO_APP__.state.view }));
    console.log('  ✓ Panned View:', { before: { x: beforePan.x, y: beforePan.y }, after: { x: afterPan.x, y: afterPan.y } });
    assert(afterPan.x > beforePan.x, 'View X should have shifted to the right');
    assert(afterPan.y > beforePan.y, 'View Y should have shifted down');

    // 7. Test Coordinate Conversions (World <-> Screen)
    const coordTest = await page.evaluate(() => {
      const world = { x: 500, y: 400 };
      const screen = window.__CYTO_APP__.worldToScreen(world.x, world.y);
      const backToWorld = window.__CYTO_APP__.screenToWorld(screen.x, screen.y);
      return {
        diffX: Math.abs(world.x - backToWorld.x),
        diffY: Math.abs(world.y - backToWorld.y)
      };
    });
    console.log('  ✓ Coordinate conversion precision delta:', coordTest);
    assert(coordTest.diffX < 0.001 && coordTest.diffY < 0.001, 'Coordinate transform must invert accurately');

    // 8. Verify Annotations Count (40 cells)
    const annotationsCount = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    console.log('  ✓ Total Mock Annotations:', annotationsCount);
    assert.strictEqual(annotationsCount, 40, 'Should have exactly 40 mock annotations loaded');

    console.log('🎉 Task 1.2 Test PASSED successfully!\n');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
