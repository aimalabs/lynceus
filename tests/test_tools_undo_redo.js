const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sampleDoeHash = 'a0e23d8c95e1a4af32b58edcf84e3442242231bb37a4cfd51298ebcd8ff653c3';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html') + '?hash=' + sampleDoeHash;

(async () => {
  console.log('🧪 Running Test Suite: Tools Creation, Deletion & Undo/Redo Engine');
  
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

    const initialAnnCount = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    const initialMeasCount = await page.evaluate(() => window.__CYTO_APP__.state.measurements.length);
    console.log('  ✓ Initial state:', { annotations: initialAnnCount, measurements: initialMeasCount });

    // 1. Test Bounding Box: Add -> Delete -> Undo -> Redo
    await page.keyboard.press('KeyB'); // Box tool
    await page.mouse.move(300, 300);
    await page.mouse.down();
    await page.mouse.move(380, 380, { steps: 5 });
    await page.mouse.up();

    let count = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    assert.strictEqual(count, initialAnnCount + 1, 'Adding box should increment annotations');
    console.log('  ✓ Box created successfully');

    // Undo box addition
    await page.keyboard.down('Meta');
    await page.keyboard.press('KeyZ');
    await page.keyboard.up('Meta');
    count = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    assert.strictEqual(count, initialAnnCount, 'Undo should remove created box');
    console.log('  ✓ Undo Box creation verified');

    // Redo box addition
    await page.keyboard.down('Meta');
    await page.keyboard.press('KeyY');
    await page.keyboard.up('Meta');
    count = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    assert.strictEqual(count, initialAnnCount + 1, 'Redo should restore created box');
    console.log('  ✓ Redo Box creation verified');

    // 2. Test Circle ROI: Add -> Undo -> Redo
    await page.keyboard.press('KeyC'); // Circle tool
    await page.mouse.move(500, 300);
    await page.mouse.down();
    await page.mouse.move(560, 360, { steps: 5 });
    await page.mouse.up();

    count = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    assert.strictEqual(count, initialAnnCount + 2, 'Adding circle should increment annotations');
    console.log('  ✓ Circle created successfully');

    await page.evaluate(() => window.__CYTO_APP__.undo());
    count = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    assert.strictEqual(count, initialAnnCount + 1, 'Undo circle verified');

    await page.evaluate(() => window.__CYTO_APP__.redo());
    count = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    assert.strictEqual(count, initialAnnCount + 2, 'Redo circle verified');

    // 3. Test Point Centroid: Add -> Undo -> Redo
    await page.keyboard.press('KeyP'); // Point tool
    await page.mouse.click(650, 350);

    count = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    assert.strictEqual(count, initialAnnCount + 3, 'Point placement should increment annotations');
    console.log('  ✓ Point created successfully');

    await page.evaluate(() => window.__CYTO_APP__.undo());
    count = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    assert.strictEqual(count, initialAnnCount + 2, 'Undo point verified');

    await page.evaluate(() => window.__CYTO_APP__.redo());
    count = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    assert.strictEqual(count, initialAnnCount + 3, 'Redo point verified');

    // 4. Test Caliper Measurement: Add -> Delete with Eraser Tool -> Undo -> Redo
    await page.keyboard.press('KeyM'); // Caliper tool
    await page.mouse.move(700, 200);
    await page.mouse.down();
    await page.mouse.move(820, 200, { steps: 5 });
    await page.mouse.up();

    let measCount = await page.evaluate(() => window.__CYTO_APP__.state.measurements.length);
    assert.strictEqual(measCount, 1, 'Should have 1 caliper measurement created');
    console.log('  ✓ Caliper created successfully');

    // Delete Caliper with Eraser Tool (E)
    await page.keyboard.press('KeyE'); // Eraser tool
    await page.mouse.click(760, 200); // Click the midpoint of the caliper line

    measCount = await page.evaluate(() => window.__CYTO_APP__.state.measurements.length);
    assert.strictEqual(measCount, 0, 'Clicking caliper with Eraser tool must delete it');
    console.log('  ✓ Caliper deleted with Eraser tool');

    // Undo caliper deletion
    await page.evaluate(() => window.__CYTO_APP__.undo());
    measCount = await page.evaluate(() => window.__CYTO_APP__.state.measurements.length);
    assert.strictEqual(measCount, 1, 'Undo should restore deleted caliper');
    console.log('  ✓ Undo caliper deletion verified');

    // Redo caliper deletion
    await page.evaluate(() => window.__CYTO_APP__.redo());
    measCount = await page.evaluate(() => window.__CYTO_APP__.state.measurements.length);
    assert.strictEqual(measCount, 0, 'Redo should re-delete caliper');
    console.log('  ✓ Redo caliper deletion verified');

    // 5. Test Quick Reclassification + Undo/Redo
    await page.keyboard.press('KeyV'); // Select tool
    const firstCell = await page.evaluate(() => window.__CYTO_APP__.state.annotations[0]);
    await page.evaluate(id => window.__CYTO_APP__.selectCell(id), firstCell.id);

    const originalClass = firstCell.classId;
    await page.evaluate((id) => window.__CYTO_APP__.reclassifyCell(id, 'monocytes'), firstCell.id);

    let reclassedClass = await page.evaluate(id => window.__CYTO_APP__.state.annotations.find(a => a.id === id).classId, firstCell.id);
    assert.strictEqual(reclassedClass, 'monocytes', 'Cell should be reclassified to monocyte');
    console.log('  ✓ Cell reclassified to monocyte');

    await page.evaluate(() => window.__CYTO_APP__.undo());
    reclassedClass = await page.evaluate(id => window.__CYTO_APP__.state.annotations.find(a => a.id === id).classId, firstCell.id);
    assert.strictEqual(reclassedClass, originalClass, 'Undo should restore original cell classification');
    console.log('  ✓ Undo reclassification verified');

    await page.evaluate(() => window.__CYTO_APP__.redo());
    reclassedClass = await page.evaluate(id => window.__CYTO_APP__.state.annotations.find(a => a.id === id).classId, firstCell.id);
    assert.strictEqual(reclassedClass, 'monocytes', 'Redo should restore reclassification');
    console.log('  ✓ Redo reclassification verified');

    console.log('🎉 All Tool Add / Delete / Undo / Redo tests PASSED successfully!\n');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
