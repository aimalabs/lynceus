const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');
const http = require('http');
const fs = require('fs');

(async () => {
  console.log('🧪 Testing Single Smear Architecture, IndexedDB History & URL Hash Routing...');

  const rootDir = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(rootDir, reqPath);
    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }
    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });

  const testPort = 3942;
  await new Promise(r => server.listen(testPort, r));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: '/tmp/lynceus_test_single_smear_history',
    headless: true,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    page.on('console', msg => console.log('  [Browser Log]:', msg.text()));
    page.on('pageerror', err => console.error('  [Browser Error]:', err));
    await page.setViewport({ width: 1440, height: 900 });

    // =========================================================================
    // SECTION 1: Standard Page Load, Chip Metadata & URL Hash Sync
    // =========================================================================
    await page.goto(`http://localhost:${testPort}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 15000 });

    // Verify header UI: only the chip exists (no dropdowns, no tabs)
    const headerInfo = await page.evaluate(() => {
      const chip = document.getElementById('btn-case-meta');
      const dropdownTrigger = document.getElementById('btn-case-dropdown-trigger');
      const dropdownMenu = document.getElementById('case-selector-dropdown');
      const tabs = document.getElementById('case-tabs-container');
      const url = window.location.href;
      return {
        hasChip: !!chip,
        hasDropdownTrigger: !!dropdownTrigger,
        hasDropdownMenu: !!dropdownMenu,
        hasTabs: !!tabs,
        url,
        activeCaseId: window.__CYTO_APP__.state.activeCaseId,
        patientName: document.getElementById('patient-name-display')?.textContent
      };
    });

    console.log(`✓ Header UI: Chip=${headerInfo.hasChip}, DropdownTrigger=${headerInfo.hasDropdownTrigger}, Tabs=${headerInfo.hasTabs}`);
    console.log(`✓ Active Smear: ${headerInfo.activeCaseId} (${headerInfo.patientName})`);
    console.log(`✓ URL Hash Synced: ${headerInfo.url}`);

    assert.ok(headerInfo.hasChip, 'Header must have case metadata chip');
    assert.strictEqual(headerInfo.hasDropdownTrigger, false, 'No dropdown trigger button should exist');
    assert.strictEqual(headerInfo.hasDropdownMenu, false, 'No dropdown menu should exist');
    assert.strictEqual(headerInfo.hasTabs, false, 'No tabs container should exist');
    assert.ok(headerInfo.url.includes('hash='), 'URL must contain ?hash= parameter');

    // =========================================================================
    // SECTION 2: Case Metadata Dialog: No Deletion Button & Save to History
    // =========================================================================
    await page.click('#btn-case-meta');

    const modalCheck = await page.evaluate(() => {
      const modal = document.getElementById('case-modal');
      const deleteBtn = document.getElementById('btn-delete-case');
      const saveBtn = document.getElementById('btn-save-case-modal');
      return {
        isOpen: modal && !modal.classList.contains('hidden'),
        hasDeleteBtn: !!deleteBtn,
        hasSaveBtn: !!saveBtn
      };
    });

    console.log(`✓ Case Modal: isOpen=${modalCheck.isOpen}, hasDeleteBtn=${modalCheck.hasDeleteBtn}, hasSaveBtn=${modalCheck.hasSaveBtn}`);
    assert.ok(modalCheck.isOpen, 'Clicking chip must open Case Metadata modal');
    assert.strictEqual(modalCheck.hasDeleteBtn, false, 'Deletion button must be removed from dialog');
    assert.ok(modalCheck.hasSaveBtn, 'Save button must exist in dialog');

    // Modify metadata and save to history
    await page.evaluate(() => {
      document.getElementById('input-patient-lastname').value = 'HISTPATIENT';
      document.getElementById('input-doctor-notes').value = 'Saved to local browser database';
    });
    await page.click('#btn-save-case-modal');

    // Wait for async IndexedDB save
    await new Promise(r => setTimeout(r, 400));

    const historyAfterSave = await page.evaluate(async () => {
      return await window.__CYTO_APP__.getAllSmearsFromHistory();
    });
    console.log(`✓ Saved to IndexedDB History: ${historyAfterSave.length} total entries`);
    assert.ok(historyAfterSave.length > 0, 'IndexedDB history should contain saved entry');
    const matchedHistory = historyAfterSave.find(e => e.patientLastName === 'HISTPATIENT');
    assert.ok(matchedHistory, 'History entry for HISTPATIENT must exist');

    // =========================================================================
    // SECTION 3: Unload Smear to View Redesigned Empty Workspace HUD
    // =========================================================================
    await page.evaluate(() => {
      window.__CYTO_APP__.deleteActiveCase();
    });

    const emptyHudState = await page.evaluate(() => {
      const hud = document.getElementById('empty-workspace-hud');
      const isVisible = hud && !hud.classList.contains('hidden');
      const sampleCards = document.querySelectorAll('#sample-smears-list .btn-load-sample-card');
      const historyCards = document.querySelectorAll('#history-smears-list .btn-load-history-card');
      const uploadBtn = document.getElementById('btn-empty-upload-image');
      const clearHistBtn = document.getElementById('btn-clear-all-history');
      return {
        isVisible,
        sampleCount: sampleCards.length,
        historyCount: historyCards.length,
        hasUploadBtn: !!uploadBtn,
        hasClearHistBtn: !!clearHistBtn,
        casesCount: window.__CYTO_APP__.state.cases.length
      };
    });

    console.log(`✓ Redesigned Empty Workspace HUD: isVisible=${emptyHudState.isVisible}, Samples=${emptyHudState.sampleCount}, History=${emptyHudState.historyCount}`);
    assert.ok(emptyHudState.isVisible, 'Empty workspace HUD must be visible when no smear is loaded');
    assert.strictEqual(emptyHudState.casesCount, 0, '0 cases active');
    assert.strictEqual(emptyHudState.sampleCount, 4, 'Should list 4 ground truth benchmark samples');
    assert.ok(emptyHudState.hasUploadBtn, 'Upload button must be present in empty state');
    assert.ok(emptyHudState.hasClearHistBtn, 'Clear history button must be present');

    // =========================================================================
    // SECTION 4: 1-Click Load from Ground Truth Sample List
    // =========================================================================
    await page.evaluate(() => {
      window.__CYTO_APP__.loadSampleSmear('Image_104');
    });

    const loadedSample = await page.evaluate(() => {
      const hud = document.getElementById('empty-workspace-hud');
      return {
        activeCaseId: window.__CYTO_APP__.state.activeCaseId,
        lastName: window.__CYTO_APP__.state.metadata?.patientLastName,
        cellCount: window.__CYTO_APP__.state.annotations.length,
        isHudHidden: hud ? hud.classList.contains('hidden') : true,
        casesCount: window.__CYTO_APP__.state.cases.length
      };
    });

    console.log(`✓ 1-Click Sample Loaded: ID=${loadedSample.activeCaseId}, Name=${loadedSample.lastName}, Cells=${loadedSample.cellCount}`);
    assert.strictEqual(loadedSample.activeCaseId, 'Image_104', 'Loaded sample Image_104');
    assert.strictEqual(loadedSample.lastName, 'KOWALSKI');
    assert.ok(loadedSample.isHudHidden, 'HUD hidden after loading sample');
    assert.strictEqual(loadedSample.casesCount, 1, 'Single active smear');

    // =========================================================================
    // SECTION 5: URL GET Query Routing with Valid Sample Hash
    // =========================================================================
    const sampleFieldHash = '9f8b05a598fdd22246ae8aa8b626a30f789687b6f907eaa3f5c68b3c5cbccb63';
    await page.goto(`http://localhost:${testPort}/index.html?hash=${sampleFieldHash}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP_ROUTING_READY__ && window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 15000 });

    const hashResolvedState = await page.evaluate(() => {
      return {
        activeCaseId: window.__CYTO_APP__.state.activeCaseId,
        patientLastName: window.__CYTO_APP__.state.metadata?.patientLastName,
        cellCount: window.__CYTO_APP__.state.annotations.length,
        casesCount: window.__CYTO_APP__.state.cases.length,
        url: window.location.href
      };
    });
    console.log(`✓ URL Hash Resolution (Valid Hash): Loaded ${hashResolvedState.activeCaseId} (${hashResolvedState.patientLastName})`);
    assert.strictEqual(hashResolvedState.activeCaseId, 'smear-field', 'Loaded smear-field matching GET hash');
    assert.strictEqual(hashResolvedState.patientLastName, 'SMITH');
    assert.strictEqual(hashResolvedState.casesCount, 1, 'Single active smear');

    // =========================================================================
    // SECTION 6: URL GET Query Routing with Invalid Hash (Polite Alert & Empty HUD)
    // =========================================================================
    const invalidHash = 'deadbeef00000000111122223333444455556666777788889999aaaabbbbcccc';
    await page.goto(`http://localhost:${testPort}/index.html?hash=${invalidHash}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP_ROUTING_READY__ && window.__CYTO_APP__, { timeout: 15000 });
    await new Promise(r => setTimeout(r, 400));

    const invalidHashState = await page.evaluate(() => {
      const hud = document.getElementById('empty-workspace-hud');
      const alertEl = document.getElementById('empty-state-alert');
      const alertText = document.getElementById('empty-state-alert-text')?.textContent;
      return {
        isHudVisible: hud && !hud.classList.contains('hidden'),
        isAlertVisible: alertEl && !alertEl.classList.contains('hidden'),
        alertText: alertText || '',
        casesCount: window.__CYTO_APP__.state.cases.length
      };
    });

    console.log(`✓ Invalid Hash Alert Displayed: isAlertVisible=${invalidHashState.isAlertVisible}, Text="${invalidHashState.alertText}"`);
    assert.ok(invalidHashState.isHudVisible, 'Empty workspace HUD must display on non-existent hash');
    assert.ok(invalidHashState.isAlertVisible, 'Polite alert banner must be visible');
    assert.ok(invalidHashState.alertText.includes('Specimen not found') || invalidHashState.alertText.includes('couldn\'t find'), 'Alert message should inform user politely');
    assert.strictEqual(invalidHashState.casesCount, 0, 'No smear cases loaded for invalid hash');

    // =========================================================================
    // SECTION 7: IndexedDB History Deduplication & Deletion
    // =========================================================================
    // Save multiple times with same hash and verify count stays 1 (no duplicates)
    const dedupTestResult = await page.evaluate(async () => {
      await window.__CYTO_APP__.clearAllSmearHistory();
      const mockCase = {
        id: 'test-dedup-case',
        hash: 'aaaa1111bbbb2222cccc3333dddd4444eeee5555ffff66667777888899990000',
        metadata: { patientLastName: 'DEDUP', patientFirstName: 'Test', collectionDate: '2026-08-20' },
        annotations: []
      };
      await window.__CYTO_APP__.saveSmearToHistory(mockCase, null, mockCase.hash);
      await window.__CYTO_APP__.saveSmearToHistory(mockCase, null, mockCase.hash);
      await window.__CYTO_APP__.saveSmearToHistory(mockCase, null, mockCase.hash);
      const allHist = await window.__CYTO_APP__.getAllSmearsFromHistory();
      return {
        count: allHist.length,
        hash: allHist[0]?.hash
      };
    });

    console.log(`✓ IndexedDB Hash Deduplication: Saved 3 times -> Result count = ${dedupTestResult.count}`);
    assert.strictEqual(dedupTestResult.count, 1, 'History must deduplicate by hash with zero duplicates');

    // Individual deletion
    const afterSingleDelete = await page.evaluate(async () => {
      await window.__CYTO_APP__.deleteSmearFromHistory('aaaa1111bbbb2222cccc3333dddd4444eeee5555ffff66667777888899990000');
      const allHist = await window.__CYTO_APP__.getAllSmearsFromHistory();
      return allHist.length;
    });
    console.log(`✓ Individual Entry Deleted from History: Remaining count = ${afterSingleDelete}`);
    assert.strictEqual(afterSingleDelete, 0, 'Entry deleted from history');

    console.log('🎉 Single Smear Architecture, Local History & URL Hash Routing tests PASSED successfully!');
  } finally {
    await browser.close();
    server.close();
  }
})();
