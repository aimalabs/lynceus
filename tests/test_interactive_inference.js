const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

(async () => {
  console.log('\n🧪 Running Test Suite: Interactive Live WebGPU Single-Cell Classification');

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-unsafe-webgpu',
      '--use-gl=angle',
      '--use-angle=metal',
      '--allow-file-access-from-files'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    if (text.includes('[Interactive WebGPU]') || text.includes('[Lynceus GPU]')) {
      console.log(`  [Browser Live Classifier]: ${text}`);
    }
  });

  const filePath = `file://${path.resolve(__dirname, '../index.html')}`;
  await page.goto(filePath, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.ort !== undefined, { timeout: 10000 });

  // 1. Select Box Drawing Tool
  await page.keyboard.press('KeyB');
  const activeTool = await page.evaluate(() => state.tool);
  assert.strictEqual(activeTool, 'box', 'Active tool should be box');
  console.log('  ✓ Box Drawing tool selected');

  // 2. Programmatically or interactively add an ROI over a cell region
  const initialCount = await page.evaluate(() => state.annotations.length);
  
  await page.evaluate(async () => {
    // Add annotation over neutrophil coordinates (280, 190, 110, 105)
    addCellAnnotation(280, 190, 110, 105, 'box');
  });

  // Wait a moment for async WebGPU single patch classification
  await page.waitForFunction(() => {
    const topCell = state.annotations[0];
    return topCell && topCell.predictions && topCell.predictions.length === 20;
  }, { timeout: 15000 });

  const classifiedCell = await page.evaluate(() => {
    const top = state.annotations[0];
    return {
      id: top.id,
      classId: top.classId,
      rawClass: top.rawClass,
      label: top.label,
      confidence: top.confidence,
      predictionsCount: top.predictions.length,
      topPrediction: top.predictions[0]
    };
  });

  assert.strictEqual(classifiedCell.predictionsCount, 20, 'Predictions should include all 20 Master Classes');
  assert(classifiedCell.confidence > 0.50, `Confidence should be high, got ${classifiedCell.confidence}`);
  console.log(`  ✓ Interactive WebGPU inference completed for ROI: ID=${classifiedCell.id}, Class=${classifiedCell.label} (${classifiedCell.rawClass}), Conf=${(classifiedCell.confidence * 100).toFixed(1)}%`);

  await browser.close();
  console.log('🎉 Interactive Live WebGPU Single-Cell Classification test PASSED successfully!\n');
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
