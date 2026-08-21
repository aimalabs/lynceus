const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');
const http = require('http');
const fs = require('fs');

(async () => {
  console.log('🧪 Testing Case Deletion & Zero-Case Empty State HUD...');

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

  const testPort = 3927;
  await new Promise(r => server.listen(testPort, r));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: '/tmp/lynceus_test_case_deletion_empty_state',
    headless: true,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    await page.goto(`http://localhost:${testPort}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 15000 });

    // Step 1: Open Case Modal on smear-02 and click Delete Case (Garbage Can)
    await page.evaluate(() => {
      window.__CYTO_APP__.openCaseModal();
    });

    const isModalOpen = await page.evaluate(() => {
      const m = document.getElementById('case-modal');
      return m && !m.classList.contains('hidden');
    });
    assert.ok(isModalOpen, 'Case modal should be open');

    // Click Delete Case Button
    await page.click('#btn-delete-case');

    // Verify modal is closed and active case transitioned to smear-field
    const afterDelete1 = await page.evaluate(() => {
      const modal = document.getElementById('case-modal');
      return {
        isModalHidden: modal.classList.contains('hidden'),
        casesCount: window.__CYTO_APP__.state.cases.length,
        activeCaseId: window.__CYTO_APP__.state.activeCaseId,
        patientLastName: window.__CYTO_APP__.state.metadata?.patientLastName
      };
    });

    console.log(`✓ Case deleted: 1 case remaining (${afterDelete1.activeCaseId} - ${afterDelete1.patientLastName})`);
    assert.ok(afterDelete1.isModalHidden, 'Modal should close after deletion');
    assert.strictEqual(afterDelete1.casesCount, 1, '1 case should remain');
    assert.strictEqual(afterDelete1.activeCaseId, 'smear-field', 'Active case should switch to remaining smear-field');
    assert.strictEqual(afterDelete1.patientLastName, 'SMITH');

    // Step 2: Delete the last remaining case (smear-field) to enter Zero-Case State
    await page.evaluate(() => {
      window.__CYTO_APP__.openCaseModal();
    });
    await page.click('#btn-delete-case');

    const zeroCaseState = await page.evaluate(() => {
      const hud = document.getElementById('empty-workspace-hud');
      const pName = document.getElementById('patient-name-display')?.textContent;
      const sTitle = document.getElementById('slide-title')?.textContent;
      return {
        casesCount: window.__CYTO_APP__.state.cases.length,
        activeCaseId: window.__CYTO_APP__.state.activeCaseId,
        isHudVisible: hud && !hud.classList.contains('hidden'),
        pNameText: pName,
        sTitleText: sTitle,
        docTitle: document.title,
        annotationsCount: window.__CYTO_APP__.state.annotations.length
      };
    });

    console.log(`✓ Zero-cases state reached: HUD visible = ${zeroCaseState.isHudVisible}, Title = "${zeroCaseState.docTitle}"`);
    assert.strictEqual(zeroCaseState.casesCount, 0, 'No cases remaining');
    assert.strictEqual(zeroCaseState.activeCaseId, null, 'Active case ID should be null');
    assert.ok(zeroCaseState.isHudVisible, 'Empty workspace HUD overlay must be visible');
    assert.ok(zeroCaseState.pNameText.includes('No Smear Loaded'), 'Header pill should indicate No Smear Loaded');
    assert.ok(zeroCaseState.docTitle.includes('No Smear Loaded'), 'Document title should indicate No Smear Loaded');
    assert.strictEqual(zeroCaseState.annotationsCount, 0, 'Annotations should be empty');

    // Step 3: Click Restore Sample Cases Button on HUD
    await page.click('#btn-empty-load-sample');

    const restoredState = await page.evaluate(() => {
      const hud = document.getElementById('empty-workspace-hud');
      return {
        casesCount: window.__CYTO_APP__.state.cases.length,
        activeCaseId: window.__CYTO_APP__.state.activeCaseId,
        patientLastName: window.__CYTO_APP__.state.metadata?.patientLastName,
        isHudHidden: hud && hud.classList.contains('hidden'),
        annotationsCount: window.__CYTO_APP__.state.annotations.length
      };
    });

    console.log(`✓ Restored sample cases: ${restoredState.casesCount} cases loaded, active = ${restoredState.activeCaseId} (${restoredState.patientLastName})`);
    assert.strictEqual(restoredState.casesCount, 2, 'Should restore 2 sample cases');
    assert.strictEqual(restoredState.activeCaseId, 'smear-02');
    assert.strictEqual(restoredState.patientLastName, 'DOE');
    assert.ok(restoredState.isHudHidden, 'Empty workspace HUD should be hidden');
    assert.strictEqual(restoredState.annotationsCount, 40);

    console.log('🎉 Case Deletion & Zero-Case Empty State HUD tests passed successfully!');
  } finally {
    await browser.close();
    server.close();
  }
})();
