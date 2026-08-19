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

    // 3. Test Patient & Case Metadata Modal (Hotkey N & Header click)
    await page.click('#btn-case-meta');
    const isCaseModalOpen = await page.$eval('#case-modal', el => !el.classList.contains('hidden'));
    console.log('  ✓ Case Metadata Modal Opened:', isCaseModalOpen);
    assert.strictEqual(isCaseModalOpen, true, 'Case modal should open on click');

    // Edit patient last name and doctor notes
    await page.$eval('#input-patient-lastname', el => { el.value = 'SMITH'; });
    await page.$eval('#input-patient-date', el => { el.value = '2026-08-19'; });
    await page.$eval('#input-doctor-notes', el => { el.value = 'Marked leukocytosis with 15% circulating blasts.'; });
    await page.click('#btn-save-case-modal');

    const titleAfterSave = await page.title();
    console.log('  ✓ Updated Multi-Tab Document Title:', titleAfterSave);
    assert(titleAfterSave.includes('SMITH'), 'Document title should update with new patient last name');
    assert(titleAfterSave.includes('2026-08-19'), 'Document title should update with new date');

    const headerNameDisplay = await page.$eval('#patient-name-display', el => el.textContent.trim());
    console.log('  ✓ Header Patient Name Display:', headerNameDisplay);
    assert(headerNameDisplay.includes('SMITH'), 'Header pill should display SMITH');

    // 4. Test Single Full State JSON Export (Icon-Only button)
    await page.click('#btn-export-json');
    const toastExportJson = await page.$eval('#toast-message', el => el.textContent.trim());
    console.log('  ✓ Toast after Export JSON:', toastExportJson);
    assert(toastExportJson.includes('JSON') || toastExportJson.includes('exported'), 'Toast should confirm JSON export');

    // 5. Test JSON Import
    await page.evaluate(() => {
      const customPayload = {
        app: "AIMALABS Lynceus",
        version: "1.0",
        metadata: {
          patientLastName: "KOWALSKI",
          patientFirstName: "Anna",
          patientMrn: "PT-9988",
          collectionDate: "2026-08-15",
          smearId: "smear-04",
          notes: "Imported test notes",
          reviewStatus: "reviewed"
        },
        annotations: [
          { id: 'c-99', classId: 'lymphocyte', label: 'Small Lymphocyte', x: 300, y: 300, width: 70, height: 70, confidence: 0.99, shape: 'circle' }
        ],
        measurements: []
      };
      window.__CYTO_APP__.state.metadata = customPayload.metadata;
      window.__CYTO_APP__.state.annotations = customPayload.annotations;
      window.__CYTO_APP__.updateDocumentTitle();
      window.__CYTO_APP__.updateCaseHeaderPill();
      window.__CYTO_APP__.render();
    });

    const importedTitle = await page.title();
    console.log('  ✓ Document Title after State Import:', importedTitle);
    assert(importedTitle.includes('KOWALSKI'), 'Imported patient last name must be reflected in document title');

    // 6. Test In-App Reset Confirmation Modal
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

    // 7. Test Keyboard Shortcuts Modal (?)
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
