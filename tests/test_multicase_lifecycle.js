const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');
const http = require('http');
const fs = require('fs');

(async () => {
  console.log('🧪 Testing Multi-Smear Case Management Lifecycle...');

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

  const testPort = 3923;
  await new Promise(r => server.listen(testPort, r));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: '/tmp/lynceus_test_multicase_lifecycle',
    headless: true,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    await page.goto(`http://localhost:${testPort}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 15000 });

    // Step 1: Verify Initial Multi-Case State
    const initialCases = await page.evaluate(() => {
      return {
        casesCount: window.__CYTO_APP__.state.cases.length,
        activeCaseId: window.__CYTO_APP__.state.activeCaseId,
        caseIds: window.__CYTO_APP__.state.cases.map(c => c.id),
        activePatientName: window.__CYTO_APP__.state.metadata.patientLastName,
        annotationCount: window.__CYTO_APP__.state.annotations.length
      };
    });

    console.log(`✓ Initial cases loaded: ${initialCases.casesCount} cases (${initialCases.caseIds.join(', ')})`);
    assert.strictEqual(initialCases.casesCount, 2, 'Should initialize with 2 default smear cases');
    assert.strictEqual(initialCases.activeCaseId, 'smear-02', 'Active case should default to smear-02');
    assert.strictEqual(initialCases.activePatientName, 'DOE', 'Default patient is John DOE');
    assert.strictEqual(initialCases.annotationCount, 40, 'Default smear-02 has 40 cell annotations');

    // Step 2: Open and Verify Smear Dropdown Popover
    await page.click('#btn-case-dropdown-trigger');
    const isDropdownVisible = await page.evaluate(() => {
      const dd = document.getElementById('case-selector-dropdown');
      return dd && !dd.classList.contains('hidden');
    });
    assert.ok(isDropdownVisible, 'Case dropdown should open when clicking chevron');

    const dropdownSmearItems = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('#case-selector-list .btn-select-case'));
      return items.map(el => ({
        id: el.getAttribute('data-case-id'),
        text: el.innerText
      }));
    });
    console.log(`✓ Dropdown shows ${dropdownSmearItems.length} smears:`, dropdownSmearItems.map(i => i.id));
    assert.strictEqual(dropdownSmearItems.length, 2, 'Dropdown list must show 2 smears');

    // Step 3: Switch to Second Smear (smear-field - Jane SMITH)
    await page.evaluate(() => {
      window.__CYTO_APP__.switchActiveCase('smear-field');
    });

    const switchedState = await page.evaluate(() => {
      const pName = document.getElementById('patient-name-display')?.textContent;
      const sTitle = document.getElementById('slide-title')?.textContent;
      return {
        activeCaseId: window.__CYTO_APP__.state.activeCaseId,
        patientLastName: window.__CYTO_APP__.state.metadata?.patientLastName,
        patientFirstName: window.__CYTO_APP__.state.metadata?.patientFirstName,
        pNameText: pName,
        sTitleText: sTitle,
        docTitle: document.title,
        annotationsCount: window.__CYTO_APP__.state.annotations.length
      };
    });

    console.log(`✓ Switched to smear-field: Patient is ${switchedState.patientLastName}, ${switchedState.patientFirstName} (${switchedState.annotationsCount} cells)`);
    assert.strictEqual(switchedState.activeCaseId, 'smear-field', 'Active case should be smear-field');
    assert.strictEqual(switchedState.patientLastName, 'SMITH', 'Patient last name should be SMITH');
    assert.strictEqual(switchedState.annotationsCount, 58, 'Jane SMITH smear-field case should have 58 cells');
    assert.ok(switchedState.pNameText.includes('SMITH'), 'Header pill should display SMITH');
    assert.ok(switchedState.sTitleText.includes('smear-field'), 'Header pill should display smear-field');
    assert.ok(switchedState.docTitle.includes('SMITH'), 'Document title should update with patient name');

    // Step 4: Switch back to First Smear (smear-02 - John DOE)
    await page.evaluate(() => {
      window.__CYTO_APP__.switchActiveCase('smear-02');
    });

    const switchedBackState = await page.evaluate(() => {
      return {
        activeCaseId: window.__CYTO_APP__.state.activeCaseId,
        patientLastName: window.__CYTO_APP__.state.metadata?.patientLastName,
        annotationsCount: window.__CYTO_APP__.state.annotations.length
      };
    });

    console.log(`✓ Switched back to smear-02: Patient is ${switchedBackState.patientLastName} (${switchedBackState.annotationsCount} cells)`);
    assert.strictEqual(switchedBackState.activeCaseId, 'smear-02');
    assert.strictEqual(switchedBackState.patientLastName, 'DOE');
    assert.strictEqual(switchedBackState.annotationsCount, 40);

    console.log('🎉 Multi-Smear Case Management Lifecycle tests passed successfully!');
  } finally {
    await browser.close();
    server.close();
  }
})();
