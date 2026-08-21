const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');
const http = require('http');
const fs = require('fs');

(async () => {
  console.log('🧪 Testing Filter Dropdown Side Tooltips & Clean Header UI...');

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

  const testPort = 3929;
  await new Promise(r => server.listen(testPort, r));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: '/tmp/lynceus_test_filter_side_tooltip',
    headless: true,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    await page.goto(`http://localhost:${testPort}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 15000 });

    // Step 1: Verify Import Dropdown is NOT visible in the header
    const isImportDropdownVisible = await page.evaluate(() => {
      const container = document.getElementById('import-dropdown-container');
      if (!container) return false;
      const rect = container.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && window.getComputedStyle(container).display !== 'none';
    });
    console.log(`✓ Import dropdown visible in UI: ${isImportDropdownVisible}`);
    assert.strictEqual(isImportDropdownVisible, false, 'Import dropdown container must not be visible in header');

    // Step 2: Verify Export JSON button is NOT visible in the header
    const isExportJsonVisible = await page.evaluate(() => {
      const btn = document.getElementById('btn-export-json');
      if (!btn) return false;
      const rect = btn.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && window.getComputedStyle(btn).display !== 'none';
    });
    console.log(`✓ Export JSON button visible in UI: ${isExportJsonVisible}`);
    assert.strictEqual(isExportJsonVisible, false, 'Export JSON button must not be visible in header');

    // Step 3: Verify Export .aimalabs button is visible
    const isExportAimaVisible = await page.evaluate(() => {
      const btn = document.getElementById('btn-export-aimalabs');
      if (!btn) return false;
      const rect = btn.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && window.getComputedStyle(btn).display !== 'none';
    });
    console.log(`✓ Export .aimalabs button visible in UI: ${isExportAimaVisible}`);
    assert.strictEqual(isExportAimaVisible, true, 'Export .aimalabs button must be visible in header');

    // Step 4: Verify the single '+' button in case dropdown has data-help and title for .aimalabs / images
    const plusBtnInfo = await page.evaluate(() => {
      const btn = document.getElementById('btn-add-new-case-trigger');
      return {
        text: btn ? btn.textContent.trim() : null,
        title: btn ? btn.getAttribute('title') : null,
        help: btn ? btn.getAttribute('data-help') : null
      };
    });
    console.log('✓ Plus button info:', plusBtnInfo);
    assert.strictEqual(plusBtnInfo.text, '+');
    assert.match(plusBtnInfo.help, /aimalabs/i);
    assert.match(plusBtnInfo.help, /image/i);

    // Step 5: Open filter dropdown and hover over a filter item (e.g. CLAHE filter button)
    await page.click('#filter-dropdown-trigger');
    const filterBtn = await page.$('.filter-btn[data-filter="clahe"]');
    assert.ok(filterBtn, 'CLAHE filter button should exist');

    await filterBtn.hover();
    await page.waitForFunction(() => {
      const tt = document.getElementById('app-help-tooltip');
      return tt && window.getComputedStyle(tt).opacity === '1';
    });

    // Step 6: Verify tooltip is placed on the side of the dropdown, not overlapping over the dropdown content
    const positions = await page.evaluate(() => {
      const menu = document.getElementById('filter-dropdown-menu');
      const tt = document.getElementById('app-help-tooltip');
      const menuRect = menu.getBoundingClientRect();
      const ttRect = tt.getBoundingClientRect();
      return {
        menu: { left: menuRect.left, right: menuRect.right, top: menuRect.top, bottom: menuRect.bottom },
        tooltip: { left: ttRect.left, right: ttRect.right, top: ttRect.top, bottom: ttRect.bottom }
      };
    });

    console.log('✓ Filter menu & Tooltip positions:', positions);
    // Tooltip should be to the right of menu or to the left of menu
    const isToTheRight = positions.tooltip.left >= positions.menu.right - 2;
    const isToTheLeft = positions.tooltip.right <= positions.menu.left + 2;
    assert.ok(isToTheRight || isToTheLeft, `Tooltip (${positions.tooltip.left}..${positions.tooltip.right}) must be on the side of filter menu (${positions.menu.left}..${positions.menu.right})`);

    console.log('🎉 Filter Dropdown Side Tooltips & Clean Header UI tests passed successfully!');
  } finally {
    await browser.close();
    server.close();
  }
})();
