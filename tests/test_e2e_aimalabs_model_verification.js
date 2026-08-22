const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');
const http = require('http');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

(async () => {
  console.log('\n🧪 Running E2E Verification Test: Live Model Inference vs .aimalabs Ground Truth Package\n');

  // Step 1: Find the most recent .aimalabs file in ~/Downloads/ and copy into project
  const downloadsDir = path.join(os.homedir(), 'Downloads');
  const projectFixtureDir = path.resolve(__dirname, 'fixtures');
  if (!fs.existsSync(projectFixtureDir)) {
    fs.mkdirSync(projectFixtureDir, { recursive: true });
  }

  let sourceAimalabsPath = null;
  let latestFileName = null;

  if (fs.existsSync(downloadsDir)) {
    const downloadFiles = fs.readdirSync(downloadsDir)
      .filter(f => f.endsWith('.aimalabs') && (f.includes('smear-02') || !f.includes('Image_104')))
      .map(f => {
        const fullPath = path.join(downloadsDir, f);
        return { name: f, fullPath, mtimeMs: fs.statSync(fullPath).mtimeMs };
      })
      .sort((a, b) => b.mtimeMs - a.mtimeMs);

    if (downloadFiles.length > 0) {
      sourceAimalabsPath = downloadFiles[0].fullPath;
      latestFileName = downloadFiles[0].name;
      console.log(`📁 Found most recent .aimalabs file in ~/Downloads/: ${latestFileName}`);
    }
  }

  // Copy into project fixture directory
  let fixturePath;
  if (sourceAimalabsPath && latestFileName) {
    fixturePath = path.join(projectFixtureDir, latestFileName);
    fs.copyFileSync(sourceAimalabsPath, fixturePath);
    console.log(`📋 Copied fixture to project: ${path.relative(process.cwd(), fixturePath)}`);
  } else {
    // Fallback to existing project fixtures if ~/Downloads/ has no .aimalabs
    const localFixtures = fs.readdirSync(projectFixtureDir)
      .filter(f => f.endsWith('.aimalabs'))
      .map(f => {
        const fullPath = path.join(projectFixtureDir, f);
        return { name: f, fullPath, mtimeMs: fs.statSync(fullPath).mtimeMs };
      })
      .sort((a, b) => b.mtimeMs - a.mtimeMs);

    if (localFixtures.length === 0) {
      throw new Error('No .aimalabs file found in ~/Downloads/ or tests/fixtures/');
    }
    fixturePath = localFixtures[0].fullPath;
    console.log(`📁 Using existing project fixture: ${path.relative(process.cwd(), fixturePath)}`);
  }

  // Step 2: Unpack and read ground truth annotations and image from the .aimalabs ZIP
  console.log('\n📦 Inspecting .aimalabs package contents...');
  const tmpExtractDir = path.join('/tmp', `aimalabs_e2e_${Date.now()}`);
  fs.mkdirSync(tmpExtractDir, { recursive: true });
  execSync(`unzip -o "${fixturePath}" -d "${tmpExtractDir}"`);

  const annotationsJsonRaw = fs.readFileSync(path.join(tmpExtractDir, 'annotations.json'), 'utf-8');
  const gtData = JSON.parse(annotationsJsonRaw);
  const imagePngBase64 = fs.readFileSync(path.join(tmpExtractDir, 'image.png')).toString('base64');
  const imageDataUri = `data:image/png;base64,${imagePngBase64}`;

  const gtAnnotations = gtData.annotations || [];
  const gtCellCount = gtAnnotations.length;
  const gtActiveFilters = (gtData.preprocessing && gtData.preprocessing.activeFilters) || [];
  const gtPostprocessingConfig = gtData.postprocessingConfig || {};
  const gtMetadata = gtData.metadata || {};

  console.log(`  ✓ Target Specimen: ${gtMetadata.smearId || gtData.image.smearId || 'Smear'}`);
  console.log(`  ✓ Ground Truth Total Cells: ${gtCellCount} cells (Zero tolerance for count mismatch)`);
  console.log(`  ✓ Active Preprocessing Filters: [${gtActiveFilters.join(', ')}]`);
  console.log(`  ✓ Postprocessing Rules:`, JSON.stringify(gtPostprocessingConfig));

  assert(gtCellCount > 0, 'Ground truth .aimalabs must contain at least 1 cell annotation');

  // Step 3: Start local HTTP server with COOP/COEP headers for WebGPU acceleration
  const rootDir = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(rootDir, reqPath);
    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }
    const stat = fs.statSync(filePath);
    res.writeHead(200, { 'Content-Length': stat.size });
    fs.createReadStream(filePath).pipe(res);
  });

  const testPort = 3985;
  await new Promise(r => server.listen(testPort, r));
  console.log(`\n🌐 Test server listening at http://localhost:${testPort}`);

  // Step 4: Launch Chrome with WebGPU enabled
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: '/tmp/lynceus_test_e2e_aimalabs_profile',
    protocolTimeout: 90000,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-unsafe-webgpu'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Stage') || text.includes('Euler') || text.includes('Timing') || text.includes('Lynceus') || text.includes('Flash')) {
        console.log(`  [Browser Inference Engine]: ${text}`);
      }
    });

    console.log('📡 Navigating to application workspace...');
    await page.goto(`http://localhost:${testPort}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__CYTO_APP__ && window.__CYTO_APP__.state.imageLoaded, { timeout: 20000 });

    // Step 5: Synchronize smear image, pipeline filters, and postprocessing heuristics with .aimalabs metadata
    console.log('⚙️ Synchronizing smear image, pipeline filters, and postprocessing heuristics with .aimalabs metadata...');
    await page.evaluate(async (dataUri, meta, filters, postCfg) => {
      // Load raw image from .aimalabs package
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        img.onload = () => {
          window.__CYTO_APP__.state.image = img;
          window.__CYTO_APP__.state.imageLoaded = true;
          window.__CYTO_APP__.state.filterCache = {};
          if (window.__CYTO_APP__.state.cases && window.__CYTO_APP__.state.cases.length > 0) {
            const activeCase = window.__CYTO_APP__.state.cases.find(c => c.id === window.__CYTO_APP__.state.activeCaseId) || window.__CYTO_APP__.state.cases[0];
            activeCase.image = img;
            activeCase.imageLoaded = true;
          }
          resolve();
        };
        img.src = dataUri;
      });

      if (filters && filters.length > 0) {
        window.__CYTO_APP__.setCanvasFilters(filters);
      }
      if (postCfg && Object.keys(postCfg).length > 0) {
        window.__CYTO_APP__.state.postprocessingConfig = { ...window.__CYTO_APP__.state.postprocessingConfig, ...postCfg };
      }
    }, imageDataUri, gtMetadata, gtActiveFilters, gtPostprocessingConfig);

    // Step 6: Execute Live End-to-End AI Model Pipeline (Telesphorus / SAM-v2 + Swin-T)
    console.log('\n🚀 Executing End-to-End WebGPU AI Inference Pipeline...');
    const t0 = performance.now();
    await page.evaluate(async () => {
      await window.__CYTO_APP__.runModelInference('fast');
    });
    const elapsedMs = (performance.now() - t0).toFixed(1);
    console.log(`⏱️ Model inference completed in ${elapsedMs}ms`);

    // Step 7: Retrieve all live model output annotations
    const liveAnnotations = await page.evaluate(() => {
      return window.__CYTO_APP__.state.annotations.map(a => ({
        id: a.id,
        x: a.x,
        y: a.y,
        width: a.width,
        height: a.height,
        classId: a.classId,
        rawClass: a.rawClass,
        label: a.label,
        confidence: a.confidence,
        morphology: a.morphology,
        predictions: a.predictions ? a.predictions.map(p => ({
          classId: p.classId,
          rawClass: p.rawClass,
          label: p.label,
          prob: p.prob
        })) : []
      }));
    });

    console.log(`\n🔍 Analyzing Model Output vs Ground Truth:`);
    console.log(`  • Live Model Detected: ${liveAnnotations.length} cells`);
    console.log(`  • Ground Truth Expected: ${gtCellCount} cells`);

    // =========================================================================
    // Check A: Cell Count Verification (STRICT - NO TOLERANCE)
    // =========================================================================
    assert.strictEqual(
      liveAnnotations.length,
      gtCellCount,
      `Cell count mismatch! Expected exactly ${gtCellCount} cells from .aimalabs ground truth, but model produced ${liveAnnotations.length} cells.`
    );
    console.log(`  ✓ [Check 1/5] Cell Count Match: EXACT (${liveAnnotations.length} === ${gtCellCount}) [0 tolerance]`);

    // =========================================================================
    // Check B: Spatial Location & Bounding Box Verification (SMALL TOLERANCE)
    // Allowed tolerance: centroid distance <= 10.0 px, box dimensions <= 10.0 px
    // =========================================================================
    const LOCATION_TOLERANCE_PX = 10.0;
    const matchedPairs = [];
    const unmatchedGt = [];
    const centroidDeltas = [];
    const widthDeltas = [];
    const heightDeltas = [];

    const availableLive = [...liveAnnotations];

    for (const gtCell of gtAnnotations) {
      const gtCx = gtCell.x + gtCell.width / 2;
      const gtCy = gtCell.y + gtCell.height / 2;

      let bestIdx = -1;
      let minDistance = Infinity;

      for (let i = 0; i < availableLive.length; i++) {
        const liveCell = availableLive[i];
        const liveCx = liveCell.x + liveCell.width / 2;
        const liveCy = liveCell.y + liveCell.height / 2;
        const dist = Math.hypot(gtCx - liveCx, gtCy - liveCy);

        if (dist < minDistance) {
          minDistance = dist;
          bestIdx = i;
        }
      }

      if (bestIdx !== -1 && minDistance <= LOCATION_TOLERANCE_PX) {
        const matchedLive = availableLive.splice(bestIdx, 1)[0];
        matchedPairs.push({ gt: gtCell, live: matchedLive, distance: minDistance });
        centroidDeltas.push(minDistance);
        widthDeltas.push(Math.abs(gtCell.width - matchedLive.width));
        heightDeltas.push(Math.abs(gtCell.height - matchedLive.height));
      } else {
        unmatchedGt.push({ gt: gtCell, closestDist: minDistance });
      }
    }

    assert.strictEqual(
      unmatchedGt.length,
      0,
      `Failed spatial matching: ${unmatchedGt.length} ground truth cell(s) could not be matched within ${LOCATION_TOLERANCE_PX}px tolerance.`
    );

    const maxCentroidDist = Math.max(...centroidDeltas);
    const avgCentroidDist = centroidDeltas.reduce((a, b) => a + b, 0) / centroidDeltas.length;
    const maxWidthDelta = Math.max(...widthDeltas);
    const maxHeightDelta = Math.max(...heightDeltas);

    console.log(`  ✓ [Check 2/5] Spatial Locations: All ${matchedPairs.length} cells matched (avg delta: ${avgCentroidDist.toFixed(2)}px, max delta: ${maxCentroidDist.toFixed(2)}px, max box delta: ${Math.max(maxWidthDelta, maxHeightDelta).toFixed(2)}px <= ${LOCATION_TOLERANCE_PX}px tolerance)`);

    // =========================================================================
    // Check C: Confidence & Probability Distribution Verification (SMALL TOLERANCE)
    // Allowed tolerance: confidence score delta <= 0.25 (25%), top-5 prediction delta <= 0.25
    // =========================================================================
    const CONFIDENCE_TOLERANCE = 0.25;
    const confidenceDeltas = [];
    const distributionDeltas = [];
    let classAgreementCount = 0;

    for (const pair of matchedPairs) {
      const gtCell = pair.gt;
      const liveCell = pair.live;

      // 1. Primary confidence delta
      const confDelta = Math.abs(gtCell.confidence - liveCell.confidence);
      confidenceDeltas.push(confDelta);
      assert(
        confDelta <= CONFIDENCE_TOLERANCE,
        `Confidence delta for cell (${gtCell.id}) exceeds tolerance: |${gtCell.confidence} - ${liveCell.confidence}| = ${confDelta.toFixed(4)} > ${CONFIDENCE_TOLERANCE}`
      );

      // 2. Class label agreement
      if (gtCell.classId === liveCell.classId || gtCell.rawClass === liveCell.rawClass) {
        classAgreementCount++;
      }

      // 3. Full 20-lineage probability distribution check
      if (Array.isArray(gtCell.predictions) && Array.isArray(liveCell.predictions)) {
        for (const gtPred of gtCell.predictions) {
          const livePred = liveCell.predictions.find(p => p.classId === gtPred.classId || p.rawClass === gtPred.rawClass);
          if (livePred) {
            const probDelta = Math.abs(gtPred.prob - livePred.prob);
            distributionDeltas.push(probDelta);
            assert(
              probDelta <= CONFIDENCE_TOLERANCE,
              `Probability distribution delta for class ${gtPred.rawClass} on cell ${gtCell.id} exceeds tolerance: ${probDelta.toFixed(4)} > ${CONFIDENCE_TOLERANCE}`
            );
          }
        }
      }
    }

    const maxConfDelta = Math.max(...confidenceDeltas);
    const avgConfDelta = confidenceDeltas.reduce((a, b) => a + b, 0) / confidenceDeltas.length;
    const maxDistDelta = distributionDeltas.length > 0 ? Math.max(...distributionDeltas) : 0;
    const avgDistDelta = distributionDeltas.length > 0 ? (distributionDeltas.reduce((a, b) => a + b, 0) / distributionDeltas.length) : 0;

    console.log(`  ✓ [Check 3/5] Confidence Distribution: All ${matchedPairs.length} cells within ${(CONFIDENCE_TOLERANCE * 100).toFixed(1)}% tolerance (avg delta: ${(avgConfDelta * 100).toFixed(2)}%, max delta: ${(maxConfDelta * 100).toFixed(2)}%)`);
    console.log(`  ✓ [Check 4/5] Multi-Class Probabilities: avg distribution delta: ${(avgDistDelta * 100).toFixed(2)}%, max distribution delta: ${(maxDistDelta * 100).toFixed(2)}%`);
    console.log(`  ✓ [Check 5/5] Lineage Classification Agreement: ${classAgreementCount} / ${matchedPairs.length} (${((classAgreementCount / matchedPairs.length) * 100).toFixed(1)}%)`);

    // Verify cell lineage classification consistency
    assert(
      classAgreementCount >= matchedPairs.length * 0.95,
      `Class agreement (${classAgreementCount}/${matchedPairs.length}) is below acceptable threshold of 95%`
    );

    // Verify morphometrics are computed and present
    const allHaveMorphology = liveAnnotations.every(a => a.morphology && a.morphology.area_um2 > 0);
    assert.strictEqual(allHaveMorphology, true, 'All segmented cells must include valid biophysical morphometrics');

    console.log('\n📊 Summary Evaluation Metrics:');
    console.log(`  -------------------------------------------------------------`);
    console.log(`  • Specimen File:             ${path.basename(fixturePath)}`);
    console.log(`  • Total Cells Tested:        ${liveAnnotations.length} (Expected: ${gtCellCount}) [EXACT MATCH]`);
    console.log(`  • Spatial Location Accuracy: 100% matched within <= ${LOCATION_TOLERANCE_PX}px (Avg offset: ${avgCentroidDist.toFixed(2)}px)`);
    console.log(`  • Confidence Delta:          Avg ${(avgConfDelta * 100).toFixed(2)}% | Max ${(maxConfDelta * 100).toFixed(2)}% (Tolerance <= ${(CONFIDENCE_TOLERANCE * 100).toFixed(1)}%)`);
    console.log(`  • Class Concordance:         ${classAgreementCount} / ${matchedPairs.length} (${((classAgreementCount / matchedPairs.length) * 100).toFixed(1)}%)`);
    console.log(`  • Pipeline Duration:         ${elapsedMs}ms`);
    console.log(`  -------------------------------------------------------------\n`);

    console.log('🎉 E2E .aimalabs Model Verification Test PASSED successfully!\n');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(err => {
  console.error('\n❌ E2E .aimalabs Model Verification Test FAILED:', err);
  process.exit(1);
});
