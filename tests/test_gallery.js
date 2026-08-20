const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('🧪 Running Test Suite: Cell Gallery Strip & Click-to-Navigate');
  
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

    // 1. Switch to Gallery Tab
    await page.click('#tab-btn-gallery');
    const isGalleryVisible = await page.$eval('#gallery-tab-content', el => !el.classList.contains('hidden'));
    const isInspectorHidden = await page.$eval('#inspector-tab-content', el => el.classList.contains('hidden'));
    console.log('  ✓ Gallery Tab Active:', isGalleryVisible && isInspectorHidden);
    assert.strictEqual(isGalleryVisible, true, 'Gallery tab content should be visible');

    // 2. Verify Initial Gallery Thumbnails Count (40 cells)
    const initialThumbnails = await page.$$eval('#gallery-grid > div', els => els.length);
    console.log('  ✓ Total Gallery Thumbnails rendered:', initialThumbnails);
    assert.strictEqual(initialThumbnails, 40, 'Gallery should render 40 thumbnail cards');

    // 3. Test Gallery Lineage Filtering (Filter by NEU)
    await page.click('button[data-gallery-filter="neutrophils"]');
    const neuThumbnails = await page.$$eval('#gallery-grid > div', els => els.length);
    console.log('  ✓ Filtered NEU Thumbnails Count:', neuThumbnails);
    assert.strictEqual(neuThumbnails, 10, 'There should be 10 Neutrophil thumbnails');

    // 4. Test Filter by BLA (Blasts)
    await page.click('button[data-gallery-filter="blasts"]');
    const blastThumbnails = await page.$$eval('#gallery-grid > div', els => els.length);
    console.log('  ✓ Filtered Blast Thumbnails Count:', blastThumbnails);
    assert.strictEqual(blastThumbnails, 2, 'There should be 2 Blast thumbnails');

    // Verify card height is tightly packed (< 130px) and not stretched across sidebar height
    const cardHeight = await page.$eval('#gallery-grid > div:first-child', el => el.offsetHeight);
    console.log('  ✓ Gallery Card Height (Packed):', `${cardHeight}px`);
    assert(cardHeight >= 100 && cardHeight <= 135, 'Gallery card height should be tightly packed without vertical stretching');

    // 5. Test Real-time MON tab live synchronization when adding/modifying cells
    await page.click('button[data-gallery-filter="monocytes"]');
    const initialMonCount = await page.$$eval('#gallery-grid > div', els => els.length);
    console.log('  ✓ Initial Monocyte Gallery Count:', initialMonCount);
    assert.strictEqual(initialMonCount, 3, 'Should start with 3 Monocytes');

    // Set active lineage to monocyte and add a new Monocyte bounding box
    await page.evaluate(() => {
      window.__CYTO_APP__.state.activeClassId = 'monocytes';
      window.__CYTO_APP__.addCellAnnotation(700, 500, 60, 60, 'box');
    });

    const updatedMonCount = await page.$$eval('#gallery-grid > div', els => els.length);
    const badgeText = await page.$eval('#gallery-count-badge', el => el.textContent);
    console.log('  ✓ Gallery count immediately updated after adding MON cell:', { count: updatedMonCount, badge: badgeText });
    assert.strictEqual(updatedMonCount, 4, 'Gallery grid should immediately show 4 Monocytes');
    assert.strictEqual(badgeText, '4', 'Gallery badge should immediately show 4');

    // Undo addition and verify instant decrement
    await page.evaluate(() => window.__CYTO_APP__.undo());
    const revertedMonCount = await page.$$eval('#gallery-grid > div', els => els.length);
    console.log('  ✓ Gallery count immediately reverted after undo:', revertedMonCount);
    assert.strictEqual(revertedMonCount, 3, 'Gallery grid should revert to 3 Monocytes on undo');

    // 6. Test Click on Thumbnail to Focus and Navigate Viewport
    const viewBefore = await page.evaluate(() => ({ ...window.__CYTO_APP__.state.view }));
    await page.click('#gallery-grid > div:first-child');

    const selectedId = await page.evaluate(() => window.__CYTO_APP__.state.selectedCellId);
    const viewAfter = await page.evaluate(() => ({ ...window.__CYTO_APP__.state.view }));
    console.log('  ✓ Selected Cell ID from Gallery click:', selectedId);
    console.log('  ✓ Viewport updated:', { before: { x: viewBefore.x, y: viewBefore.y }, after: { x: viewAfter.x, y: viewAfter.y } });
    assert(selectedId !== null, 'Cell should be selected on gallery thumbnail click');
    assert(viewAfter.x !== viewBefore.x || viewAfter.y !== viewBefore.y || viewAfter.zoom !== viewBefore.zoom, 'Viewport should have navigated to cell');

    // 6. Switch back to Inspector Tab
    await page.click('#tab-btn-inspector');
    const inspActive = await page.$eval('#inspector-active', el => !el.classList.contains('hidden'));
    console.log('  ✓ Inspector Tab shows selected cell details:', inspActive);
    assert.strictEqual(inspActive, true, 'Inspector should display details for the selected cell');

    console.log('🎉 Cell Gallery tests PASSED successfully!\n');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
