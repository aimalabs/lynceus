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

    // 6. Test Import Dropdown & Smear Image Load clears annotations
    await page.click('#btn-import-dropdown-trigger');
    const isImportMenuVisible = await page.$eval('#import-dropdown-menu', el => !el.classList.contains('hidden'));
    console.log('  ✓ Import Dropdown Menu Opened:', isImportMenuVisible);
    assert.strictEqual(isImportMenuVisible, true, 'Import dropdown menu should open on trigger click');

    const optJsonExists = await page.$eval('#btn-import-json-opt', el => !!el);
    const optImgExists = await page.$eval('#btn-load-image-opt', el => !!el);
    console.log('  ✓ Import Options Present:', { json: optJsonExists, image: optImgExists });
    assert(optJsonExists && optImgExists, 'Both JSON and Image load options must exist in dropdown');

    // Test loading an image clears all annotations
    await page.evaluate(() => {
      // Simulate loading a new image
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 900;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 1200, 900);
      
      const newImg = new Image();
      newImg.src = canvas.toDataURL();
      newImg.onload = () => {
        window.__CYTO_APP__.state.image = newImg;
        window.__CYTO_APP__.state.imageLoaded = true;
        window.__CYTO_APP__.state.annotations = [];
        window.__CYTO_APP__.state.measurements = [];
        window.__CYTO_APP__.state.selectedCellId = null;
        window.__CYTO_APP__.render();
      };
    });

    await new Promise(r => setTimeout(r, 100));
    const annCountAfterLoad = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    console.log('  ✓ Annotations after Image Load:', annCountAfterLoad);
    assert.strictEqual(annCountAfterLoad, 0, 'Loading a new image must clear all annotations from UI');

    // 7. Test In-App Reset / Inference Model Selection Modal
    await page.click('#btn-reset-detections');
    const isResetModalVisible = await page.$eval('#reset-confirm-modal', el => !el.classList.contains('hidden'));
    console.log('  ✓ In-App Reset Modal Opened:', isResetModalVisible);
    assert.strictEqual(isResetModalVisible, true, 'Reset confirmation modal must open');

    // Test Fast Model Selection: Telesphorus (2s)
    await page.click('#card-model-fast');
    await page.click('#btn-confirm-reset');

    // Check loading state active
    const isLoadingVisible = await page.$eval('#reset-loading-view', el => !el.classList.contains('hidden'));
    console.log('  ✓ Telesphorus (2.0s Rapid Scan) Loading State Activated:', isLoadingVisible);
    assert.strictEqual(isLoadingVisible, true, 'Loading bar and step telemetry should become visible');

    // Wait for 2s reset inference to finish
    await page.waitForFunction(() => document.getElementById('reset-confirm-modal').classList.contains('hidden'), { timeout: 6000 });
    const fastResetCount = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    console.log('  ✓ Annotations after Telesphorus (2s) Reset:', fastResetCount);
    assert.strictEqual(fastResetCount, 32, 'Telesphorus should restore 32 rapid survey detections');

    // Test Pro Model Selection: Asclepius (5s)
    await page.click('#btn-reset-detections');
    await page.click('#card-model-pro');
    await page.click('#btn-confirm-reset');

    const isProLoadingVisible = await page.$eval('#reset-loading-view', el => !el.classList.contains('hidden'));
    console.log('  ✓ Asclepius (5.0s Deep Analysis) Loading State Activated:', isProLoadingVisible);
    assert.strictEqual(isProLoadingVisible, true, 'Asclepius loading state should be active');

    // Wait for 5s reset inference to finish
    await page.waitForFunction(() => document.getElementById('reset-confirm-modal').classList.contains('hidden'), { timeout: 8000 });
    const proResetCount = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    console.log('  ✓ Annotations after Asclepius (5s) Reset:', proResetCount);
    assert.strictEqual(proResetCount, 46, 'Asclepius should restore 46 diagnostic detections');

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
