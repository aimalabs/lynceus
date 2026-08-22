const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('🧪 Running Test Suite: Task 3.2 - Floating Hover HUD & Cell Inspector');
  
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(indexPath, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded);

    // 1. Test Hover HUD on Cell 'c-01' (Neutrophil at 280, 190)
    const targetCell = await page.evaluate(() => {
      const ann = window.__CYTO_APP__.state.annotations.find(a => a.id === 'c-01');
      const screenPos = window.__CYTO_APP__.worldToScreen(ann.x + ann.width / 2, ann.y + ann.height / 2);
      return { ann, screenPos };
    });

    console.log('  ✓ Hovering over target cell at:', targetCell.screenPos);
    await page.mouse.move(targetCell.screenPos.x, targetCell.screenPos.y);

    // Verify hover HUD is visible and populated
    const hudInfo = await page.evaluate(() => {
      const hud = document.getElementById('hover-hud');
      return {
        hasOpacity: !hud.classList.contains('opacity-0'),
        className: document.getElementById('hud-class-name').textContent,
        conf: document.getElementById('hud-conf-badge').textContent,
        area: document.getElementById('hud-area').textContent,
        diam: document.getElementById('hud-diam').textContent
      };
    });
    console.log('  ✓ Hover HUD Info:', hudInfo);
    assert.strictEqual(hudInfo.hasOpacity, true, 'Hover HUD should be visible');
    assert(hudInfo.className.includes('Neutrophil'), 'HUD should show Neutrophil');
    assert(hudInfo.conf.includes('98.4%'), 'HUD should show 98.4% confidence');

    // 2. Test Cell Selection via Click
    await page.mouse.click(targetCell.screenPos.x, targetCell.screenPos.y);

    const selectedCellId = await page.evaluate(() => window.__CYTO_APP__.state.selectedCellId);
    console.log('  ✓ Selected Cell ID:', selectedCellId);
    assert.strictEqual(selectedCellId, 'c-01', 'Cell c-01 should be selected');

    // Verify Right Sidebar Inspector updated
    const inspInfo = await page.evaluate(() => {
      const activeEl = document.getElementById('inspector-active');
      return {
        isActiveVisible: !activeEl.classList.contains('hidden'),
        className: document.getElementById('insp-class-name').textContent,
        conf: document.getElementById('insp-conf').textContent,
        area: document.getElementById('insp-area').textContent,
        diam: document.getElementById('insp-diam').textContent,
        circ: document.getElementById('insp-circ').textContent
      };
    });
    console.log('  ✓ Inspector Panel Data:', inspInfo);
    assert.strictEqual(inspInfo.isActiveVisible, true, 'Inspector active view should be visible');
    assert(inspInfo.className.includes('Neutrophil'), 'Inspector should show Segmented Neutrophil');
    assert.strictEqual(inspInfo.area, '180.5 µm²', 'Inspector area should match mock data');

    // 3. Test Reclassification in Inspector (Reclassify c-01 to Monocyte)
    await page.click('button[data-reclass="monocytes"]');

    const afterReclass = await page.evaluate(() => {
      const ann = window.__CYTO_APP__.state.annotations.find(a => a.id === 'c-01');
      return {
        classId: ann.classId,
        label: ann.label,
        inspName: document.getElementById('insp-class-name').textContent
      };
    });
    console.log('  ✓ After Reclassifying to Monocyte:', afterReclass);
    assert.strictEqual(afterReclass.classId, 'monocytes', 'Annotation classId should now be monocytes');
    assert(afterReclass.inspName.includes('Monocyte'), 'Inspector should update to Monocyte');

    // 4. Test Cell Selection & Deletion via Keyboard (Delete selected cell c-01)
    const countBeforeDel = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    await page.keyboard.press('Delete');
    const countAfterDel = await page.evaluate(() => window.__CYTO_APP__.state.annotations.length);
    console.log('  ✓ Annotations count after delete:', { before: countBeforeDel, after: countAfterDel });
    assert.strictEqual(countAfterDel, countBeforeDel - 1, 'Annotation count should decrement by 1');

    console.log('🎉 Task 3.2 Test PASSED successfully!\n');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
