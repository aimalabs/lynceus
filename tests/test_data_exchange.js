const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('🧪 Running Test Suite: Data Exchange, LocalStorage & State Persistence');
  
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

    // 1. Mutate state: Add a new custom cell and delete an existing cell
    const initialCount = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    await page.evaluate(() => {
      window.__CYTO_APP__.addCellAnnotation(200, 200, 80, 80, 'circle');
      window.__CYTO_APP__.deleteCell('c-01');
    });

    const countAfterMutations = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    console.log('  ✓ Annotations after manual edits:', countAfterMutations);
    assert.strictEqual(countAfterMutations, initialCount, 'Added 1 and deleted 1 (same net total count)');

    // 2. Verify LocalStorage payload saved
    const stored = await page.evaluate(() => localStorage.getItem('aimalabs_hemapath_annotations_v1'));
    console.log('  ✓ LocalStorage payload present:', !!stored);
    assert(stored && stored.includes('annotations'), 'LocalStorage should store annotations');

    // 3. Test In-App Reset Confirmation Modal
    await page.click('#btn-reset-detections');
    const isResetModalVisible = await page.$eval('#reset-confirm-modal', el => !el.classList.contains('hidden'));
    console.log('  ✓ In-App Reset Modal Opened:', isResetModalVisible);
    assert.strictEqual(isResetModalVisible, true, 'Reset confirmation modal must open');

    await page.click('#btn-confirm-reset');
    const isResetModalClosed = await page.$eval('#reset-confirm-modal', el => el.classList.contains('hidden'));
    assert.strictEqual(isResetModalClosed, true, 'Reset modal should close upon confirmation');

    const resetCount = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    console.log('  ✓ Annotations after Confirm Reset:', resetCount);
    assert.strictEqual(resetCount, 40, 'Reset should restore exact 40 default annotations');

    // Verify Toast Notification appeared
    const toastText = await page.$eval('#toast-message', el => el.textContent.trim());
    console.log('  ✓ Toast Notification Text:', toastText);
    assert(toastText.includes('reset') || toastText.includes('default'), 'Toast should confirm reset');

    // 4. Test Export Dropdown (JSON, CSV, Snapshot)
    await page.click('#btn-export-dropdown-trigger');
    const isExportMenuVisible = await page.$eval('#export-dropdown-menu', el => !el.classList.contains('hidden'));
    console.log('  ✓ Export Dropdown Opened:', isExportMenuVisible);
    assert.strictEqual(isExportMenuVisible, true, 'Export dropdown must be open');

    await page.click('#btn-export-json');
    const toastExportJson = await page.$eval('#toast-message', el => el.textContent.trim());
    console.log('  ✓ Toast after Export JSON:', toastExportJson);
    assert(toastExportJson.includes('JSON'), 'Toast should confirm JSON export');

    await page.click('#btn-export-dropdown-trigger');
    await page.click('#btn-export-csv');
    const toastExportCsv = await page.$eval('#toast-message', el => el.textContent.trim());
    console.log('  ✓ Toast after Export CSV:', toastExportCsv);
    assert(toastExportCsv.includes('CSV'), 'Toast should confirm CSV report export');

    // 5. Test Keyboard Shortcuts Modal (?)
    await page.keyboard.type('?');
    const isShortcutsOpen = await page.$eval('#shortcuts-modal', el => !el.classList.contains('hidden'));
    console.log('  ✓ Shortcuts Modal opened with (?):', isShortcutsOpen);
    assert.strictEqual(isShortcutsOpen, true, 'Shortcuts modal should open when pressing ?');

    await page.click('#btn-close-shortcuts');
    const isShortcutsClosed = await page.$eval('#shortcuts-modal', el => el.classList.contains('hidden'));
    console.log('  ✓ Shortcuts Modal closed:', isShortcutsClosed);
    assert.strictEqual(isShortcutsClosed, true, 'Shortcuts modal should close on click');

    console.log('🎉 Data Exchange & State Persistence tests PASSED successfully!\n');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
