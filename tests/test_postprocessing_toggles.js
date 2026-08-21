const puppeteer = require('puppeteer-core');
const assert = require('assert');
const http = require('http');
const path = require('path');
const fs = require('fs');

(async () => {
  const rootDir = path.resolve('.');
  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(rootDir, reqPath);
    if (!fs.existsSync(filePath)) { res.statusCode = 404; res.end(); return; }
    res.writeHead(200);
    fs.createReadStream(filePath).pipe(res);
  });
  await new Promise(r => server.listen(3893, r));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3893/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__CYTO_APP__ !== undefined);

  console.log('🧪 Testing Model Card Settings Gear & Post-Processing Toggles...');

  // 1. Open the Reset / Inference Model Modal
  await page.click('#btn-reset-detections');
  const modalVisible = await page.evaluate(() => !document.getElementById('reset-confirm-modal').classList.contains('hidden'));
  assert.strictEqual(modalVisible, true, 'Reset modal should be open');
  console.log('✓ Model Reset modal opened');

  // 2. Verify settings gear button exists
  const gearBtn = await page.$('#btn-model-settings-toggle');
  assert.ok(gearBtn, 'Settings gear button exists');

  // 3. Click settings gear button to expand drawer
  const drawerInitiallyHidden = await page.evaluate(() => document.getElementById('model-postprocessing-drawer').classList.contains('hidden'));
  assert.strictEqual(drawerInitiallyHidden, true, 'Post-processing drawer is initially hidden');

  await page.click('#btn-model-settings-toggle');
  const drawerExpanded = await page.evaluate(() => !document.getElementById('model-postprocessing-drawer').classList.contains('hidden'));
  assert.strictEqual(drawerExpanded, true, 'Post-processing drawer is expanded after clicking gear');
  console.log('✓ Post-processing settings drawer expanded via gear icon');

  // 4. Verify all 6 toggle switches exist and are checked by default
  const switchIds = [
    'postproc-switch-size-fix',
    'postproc-switch-border-excl',
    'postproc-switch-dupe-suppr',
    'postproc-switch-wbc-veto',
    'postproc-switch-wbc-reassembly',
    'postproc-switch-rbc-watershed'
  ];

  for (const id of switchIds) {
    const isChecked = await page.evaluate((elemId) => document.getElementById(elemId).checked, id);
    assert.strictEqual(isChecked, true, `Switch ${id} should be checked by default`);
  }
  console.log('✓ All 6 post-processing heuristic switches verified (default = true)');

  // 5. Test toggling switches and verifying application state and localStorage
  await page.click('#postproc-switch-size-fix');
  await page.click('#postproc-switch-border-excl');

  const configState = await page.evaluate(() => window.__CYTO_APP__.state.postprocessingConfig);
  assert.strictEqual(configState.rbcPltSizeFix, false, 'rbcPltSizeFix should be false');
  assert.strictEqual(configState.borderExclusion, false, 'borderExclusion should be false');
  assert.strictEqual(configState.duplicateSuppression, true, 'duplicateSuppression should remain true');

  const localSaved = await page.evaluate(() => JSON.parse(localStorage.getItem('lynceus_postprocessing_config')));
  assert.strictEqual(localSaved.rbcPltSizeFix, false, 'localStorage should persist rbcPltSizeFix=false');
  assert.strictEqual(localSaved.borderExclusion, false, 'localStorage should persist borderExclusion=false');
  console.log('✓ Switch state mutations correctly update state and localStorage');

  // 6. Test "Reset Defaults" button
  await page.click('#btn-reset-postproc-defaults');
  const resetConfig = await page.evaluate(() => window.__CYTO_APP__.state.postprocessingConfig);
  assert.strictEqual(resetConfig.rbcPltSizeFix, true, 'rbcPltSizeFix should be reset to true');
  assert.strictEqual(resetConfig.borderExclusion, true, 'borderExclusion should be reset to true');
  const resetSwitch1 = await page.evaluate(() => document.getElementById('postproc-switch-size-fix').checked);
  const resetSwitch2 = await page.evaluate(() => document.getElementById('postproc-switch-border-excl').checked);
  assert.strictEqual(resetSwitch1, true, 'Switch UI should reflect true');
  assert.strictEqual(resetSwitch2, true, 'Switch UI should reflect true');
  console.log('✓ "Reset Defaults" resets all switches and config to true');

  await browser.close();
  server.close();
  console.log('🎉 All Model Card Gear Icon & Post-Processing Toggle Tests PASSED!');
})();
