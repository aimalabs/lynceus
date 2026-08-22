const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');
const http = require('http');
const fs = require('fs');

(async () => {
  console.log('🧪 Testing Dropdown Mutual Exclusion & Minimalist Add Smear Button...');

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

  const testPort = 3928;
  await new Promise(r => server.listen(testPort, r));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: '/tmp/lynceus_test_dropdown_mutual_exclusion',
    headless: true,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    const sampleDoeHash = 'a0e23d8c95e1a4af32b58edcf84e3442242231bb37a4cfd51298ebcd8ff653c3';
    await page.goto(`http://localhost:${testPort}/index.html?hash=${sampleDoeHash}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 15000 });

    const getOpenDropdowns = async () => {
      return page.evaluate(() => {
        const ids = [
          'filter-dropdown-menu',
          'tool-dropdown-menu',
          'obj-dropdown-menu',
          'draw-class-menu'
        ];
        return ids.filter(id => {
          const el = document.getElementById(id);
          return el && !el.classList.contains('hidden');
        });
      });
    };

    // Step 1: Open Filter Dropdown
    await page.click('#filter-dropdown-trigger');
    let openList = await getOpenDropdowns();
    console.log('✓ Opened filter-dropdown-menu:', openList);
    assert.deepStrictEqual(openList, ['filter-dropdown-menu'], 'Only filter dropdown should be open');

    // Step 4: Open Tool Dropdown -> Filter Dropdown must fold!
    await page.click('#tool-dropdown-trigger');
    openList = await getOpenDropdowns();
    console.log('✓ Opened tool-dropdown-menu:', openList);
    assert.deepStrictEqual(openList, ['tool-dropdown-menu'], 'Only tool dropdown should be open');

    // Step 5: Open Objective Dropdown -> Tool Dropdown must fold!
    await page.click('#obj-dropdown-trigger');
    openList = await getOpenDropdowns();
    console.log('✓ Opened obj-dropdown-menu:', openList);
    assert.deepStrictEqual(openList, ['obj-dropdown-menu'], 'Only objective dropdown should be open');

    // Step 6: Switch to drawing tool and open Draw Class Menu -> Objective Dropdown must fold!
    await page.evaluate(() => {
      window.__CYTO_APP__.setTool('box');
    });
    await page.click('#draw-class-trigger');
    openList = await getOpenDropdowns();
    console.log('✓ Opened draw-class-menu:', openList);
    assert.deepStrictEqual(openList, ['draw-class-menu'], 'Only draw class dropdown should be open');

    // Step 7: Click outside (on canvas) -> All dropdowns must fold!
    await page.click('#microscope-canvas');
    openList = await getOpenDropdowns();
    console.log('✓ Clicked outside, open dropdowns:', openList);
    assert.strictEqual(openList.length, 0, 'All dropdowns should be closed after clicking outside');

    console.log('🎉 Dropdown Mutual Exclusion & Minimalist Add Smear Button tests passed successfully!');
  } finally {
    await browser.close();
    server.close();
  }
})();
