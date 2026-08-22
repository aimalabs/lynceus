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

    // Step 1: Delete active smear to enter Zero-Smear State
    await page.evaluate(() => {
      window.__CYTO_APP__.deleteActiveCase();
    });

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

    // Step 2: Load Sample Case from HUD
    await page.evaluate(() => {
      window.__CYTO_APP__.loadSampleSmear('smear-02');
    });

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

    console.log(`✓ Restored sample case: ${restoredState.casesCount} case loaded, active = ${restoredState.activeCaseId} (${restoredState.patientLastName})`);
    assert.strictEqual(restoredState.casesCount, 1, 'Should load 1 sample smear');
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
