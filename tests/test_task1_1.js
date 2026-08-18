const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('🧪 Running Test Suite: Task 1.1 - Standalone Environment & Asset Integration');
  
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Listen to console messages and errors
    page.on('console', msg => console.log('  [Browser Log]:', msg.text()));
    page.on('pageerror', err => console.error('  [Browser Error]:', err));

    // Open index.html directly from file system
    await page.goto(indexPath, { waitUntil: 'load' });

    // 1. Verify Page Title
    const title = await page.title();
    console.log('  ✓ Title:', title);
    assert(title.includes('CytoVision'), 'Title should contain CytoVision');

    // 2. Verify Slide Info Header
    const slideTitle = await page.$eval('#slide-title', el => el.textContent.trim());
    console.log('  ✓ Slide Title Pill:', slideTitle);
    assert(slideTitle.includes('smear-02'), 'Slide title should mention smear-02');

    // 3. Verify Taxonomy Rendered
    const taxonomyCount = await page.$$eval('#taxonomy-list > div', els => els.length);
    console.log('  ✓ Taxonomy Count in Sidebar:', taxonomyCount);
    assert.strictEqual(taxonomyCount, 8, 'There should be 8 cell classes rendered in taxonomy');

    // 4. Verify __CYTO_APP__ Global State
    const appState = await page.evaluate(() => {
      return {
        hasImage: !!window.__CYTO_APP__.state.image,
        taxonomyLength: window.__CYTO_APP__.state.taxonomy.length,
        annotationsLength: window.__CYTO_APP__.state.annotations.length
      };
    });
    console.log('  ✓ App State Check:', appState);
    assert.strictEqual(appState.taxonomyLength, 8, 'State taxonomy should have 8 classes');
    assert(appState.annotationsLength > 0, 'Should have initial annotations');

    // 5. Verify Canvas
    const canvasExists = await page.$eval('#microscope-canvas', el => !!el);
    assert(canvasExists, 'Microscope canvas must exist');
    console.log('  ✓ Canvas initialized successfully');

    console.log('🎉 Task 1.1 Test PASSED successfully!\n');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
