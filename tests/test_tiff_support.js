const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');
const UTIF = require('utif');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const indexPath = 'file://' + path.resolve(__dirname, '../index.html');

(async () => {
  console.log('🧪 Running Test Suite: TIFF/TIF Image Upload & Decoding Support');

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

    // Verify UTIF and pako are loaded in window scope
    const librariesLoaded = await page.evaluate(() => {
      return {
        utif: typeof window.UTIF !== 'undefined',
        pako: typeof window.pako !== 'undefined'
      };
    });
    console.log('  ✓ Client-side TIFF decoders ready:', librariesLoaded);
    assert.strictEqual(librariesLoaded.utif, true, 'UTIF must be loaded in the page');

    // Create a synthetic 300x200 TIFF image
    const imgWidth = 300;
    const imgHeight = 200;
    const rgba = new Uint8Array(imgWidth * imgHeight * 4);
    for (let y = 0; y < imgHeight; y++) {
      for (let x = 0; x < imgWidth; x++) {
        const idx = (y * imgWidth + x) * 4;
        rgba[idx] = Math.round((x / imgWidth) * 255);      // R
        rgba[idx + 1] = Math.round((y / imgHeight) * 255);  // G
        rgba[idx + 2] = 180;                                // B
        rgba[idx + 3] = 255;                                // A
      }
    }
    const tiffBuffer = UTIF.encodeImage(rgba, imgWidth, imgHeight);
    const tiffBase64 = Buffer.from(tiffBuffer).toString('base64');

    // 1. Test loading TIFF via loadSmearImage()
    await page.evaluate(async (b64) => {
      const binaryString = atob(b64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const file = new File([bytes.buffer], 'patient_specimen_001.tif', { type: 'image/tiff' });
      
      const input = document.getElementById('input-load-image-file');
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, tiffBase64);

    // Wait for image load
    await page.waitForFunction(() => {
      const img = window.__CYTO_APP__.state.image;
      return img && img.naturalWidth === 300 && img.naturalHeight === 200;
    }, { timeout: 4000 });

    const stateAfterTiff = await page.evaluate(() => {
      const img = window.__CYTO_APP__.state.image;
      const resReadout = document.getElementById('meta-res-readout')?.textContent;
      const smearId = window.__CYTO_APP__.state.metadata.smearId;
      const annCount = window.__CYTO_APP__.state.annotations.length;
      return {
        width: img.naturalWidth,
        height: img.naturalHeight,
        resReadout,
        smearId,
        annCount
      };
    });

    console.log('  ✓ TIFF Decoded & Loaded Successfully:', stateAfterTiff);
    assert.strictEqual(stateAfterTiff.width, 300, 'Image naturalWidth should be 300px');
    assert.strictEqual(stateAfterTiff.height, 200, 'Image naturalHeight should be 200px');
    assert.strictEqual(stateAfterTiff.smearId, 'patient_specimen_001', 'Smear ID metadata updated');
    assert.strictEqual(stateAfterTiff.annCount, 0, 'Annotations cleared on image load');
    assert(stateAfterTiff.resReadout.includes('300 × 200'), 'Resolution readout updated to 300 × 200 px');

    // 2. Test Drag & Drop with a .tiff file
    const tiff2Width = 160;
    const tiff2Height = 120;
    const rgba2 = new Uint8Array(tiff2Width * tiff2Height * 4).fill(128);
    const tiff2Buffer = UTIF.encodeImage(rgba2, tiff2Width, tiff2Height);
    const tiff2Base64 = Buffer.from(tiff2Buffer).toString('base64');

    await page.evaluate(async (b64) => {
      const binaryString = atob(b64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const file = new File([bytes.buffer], 'specimen_drag_drop.tiff', { type: 'image/tiff' });
      
      const dt = new DataTransfer();
      dt.items.add(file);
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt
      });
      window.dispatchEvent(dropEvent);
    }, tiff2Base64);

    await page.waitForFunction(() => {
      const img = window.__CYTO_APP__.state.image;
      return img && img.naturalWidth === 160 && img.naturalHeight === 120;
    }, { timeout: 4000 });

    const smearIdAfterDrop = await page.evaluate(() => window.__CYTO_APP__.state.metadata.smearId);
    console.log('  ✓ Drag & Drop .tiff File Loaded:', smearIdAfterDrop);
    assert.strictEqual(smearIdAfterDrop, 'specimen_drag_drop', 'Drag & dropped TIFF file loaded');

    console.log('🎉 TIFF/TIF Image Upload & Decoding tests PASSED successfully!');
  } catch (err) {
    console.error('❌ TIFF Test Failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
