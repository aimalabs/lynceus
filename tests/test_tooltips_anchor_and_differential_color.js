const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('🧪 Running Test Suite: Anchor-Based Tooltips & Color-Coded WBC Differential Hover');
  
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

    // 1. Hover over the first segment (Neutrophil) of the WBC stacked bar
    const firstSegment = await page.$('#wbc-stacked-bar > div:first-child');
    assert(firstSegment, 'First stacked bar segment must exist');

    const segBox = await page.$eval('#wbc-stacked-bar > div:first-child', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width };
    });

    await page.mouse.move(segBox.x, segBox.y);
    await new Promise(r => setTimeout(r, 120));

    const tooltipInfo = await page.evaluate(() => {
      const tt = document.getElementById('app-help-tooltip');
      const title = document.getElementById('help-tooltip-title-text').textContent;
      const desc = document.getElementById('help-tooltip-desc').textContent;
      const opacity = window.getComputedStyle(tt).opacity;
      const borderColor = tt.style.borderColor;
      const rect = tt.getBoundingClientRect();
      return { opacity, title, desc, borderColor, rect };
    });

    console.log('  ✓ Neutrophil Segment Tooltip:', {
      title: tooltipInfo.title,
      opacity: tooltipInfo.opacity,
      borderColor: tooltipInfo.borderColor
    });

    assert.strictEqual(tooltipInfo.opacity, '1', 'Tooltip should be visible');
    assert(tooltipInfo.title.includes('Neutrophil'), 'Title should reflect Neutrophil lineage');
    assert(tooltipInfo.borderColor.includes('56, 189, 248') || tooltipInfo.borderColor.includes('#38bdf8'), 'Tooltip border must match Neutrophil blue color');

    // 2. Verify Tooltip is Anchored (does not jitter on mousemove within widget)
    const initialTooltipPos = { ...tooltipInfo.rect };
    await page.mouse.move(segBox.x + 2, segBox.y + 1); // small sub-pixel mousemove within segment

    const movedTooltipPos = await page.evaluate(() => {
      const tt = document.getElementById('app-help-tooltip');
      const r = tt.getBoundingClientRect();
      return { left: r.left, top: r.top };
    });

    assert.strictEqual(movedTooltipPos.left, initialTooltipPos.left, 'Tooltip position must remain statically anchored to widget');
    assert.strictEqual(movedTooltipPos.top, initialTooltipPos.top, 'Tooltip position must remain statically anchored to widget');
    console.log('  ✓ Tooltip is cleanly anchored relative to widget (no mouse-following jitter)');

    // 3. Hover over Blast segment (coral red)
    const blastSegment = await page.$('#wbc-stacked-bar > div:last-child');
    if (blastSegment) {
      const bBox = await page.$eval('#wbc-stacked-bar > div:last-child', el => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
      await page.mouse.move(bBox.x, bBox.y);
      await new Promise(r => setTimeout(r, 120));

      const blastTtInfo = await page.evaluate(() => {
        const tt = document.getElementById('app-help-tooltip');
        const title = document.getElementById('help-tooltip-title-text').textContent;
        const borderColor = tt.style.borderColor;
        return { title, borderColor };
      });
      console.log('  ✓ Blast Segment Tooltip:', blastTtInfo);
      assert(blastTtInfo.title.includes('Blast') || blastTtInfo.title.includes('Atypical'), 'Title should reflect Blast cell');
    }

    // 4. Click anywhere to dismiss tooltip
    await page.mouse.click(200, 200);
    const isDismissed = await page.evaluate(() => {
      const tt = document.getElementById('app-help-tooltip');
      return window.getComputedStyle(tt).opacity === '0';
    });
    console.log('  ✓ Tooltip dismissed on click:', isDismissed);
    assert.strictEqual(isDismissed, true, 'Tooltip should dismiss on click');

    console.log('🎉 Anchor-Based Tooltip & Color-Coded Differential tests PASSED successfully!\n');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
