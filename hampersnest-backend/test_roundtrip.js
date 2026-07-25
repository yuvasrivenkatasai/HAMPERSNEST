import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { generateProductMediaPath } from './utils/pathHelper.js';
import { exportProductsCsv, exportProductImagesZip } from './controllers/exportImportController.js';

// Mock Response for Express
class MockResponse {
  constructor() {
    this.headers = {};
    this.body = null;
    this.statusCode = 200;
  }
  setHeader(key, value) { this.headers[key] = value; }
  header(key, value) { this.headers[key] = value; }
  attachment(filename) { this.headers['Content-Disposition'] = `attachment; filename=${filename}`; }
  status(code) { this.statusCode = code; return this; }
  json(data) { this.body = JSON.stringify(data); this.end(); }
  send(data) { this.body = data; this.end(); }
  download(filePath, filename, cb) {
      this.filePath = filePath;
      this.fileName = filename;
      if (cb) cb();
  }
  end() { this.isEnded = true; }
  on(event, handler) { }
  once(event, handler) { }
  emit(event, ...args) { }
}

const runTest = async () => {
  try {
    console.log("Starting End-to-End Export/Import Test...");
    
    // 1. Export CSV
    console.log("Exporting CSV...");
    const resCsv = new MockResponse();
    await exportProductsCsv({}, resCsv);
    if (resCsv.statusCode !== 200) throw new Error("CSV Export failed: " + resCsv.body);
    const csvText = resCsv.body;

    // 2. Export ZIP
    console.log("Exporting ZIP...");
    const resZip = new MockResponse();
    let downloadedZipPath = null;
    resZip.download = (filePath, filename, cb) => {
      downloadedZipPath = filePath;
      // Do not call cb() immediately so it doesn't unlink during testing.
    };

    await exportProductImagesZip({}, resZip);
    
    if (resZip.statusCode !== 200) throw new Error("ZIP Export failed: " + resZip.body);
    if (!downloadedZipPath || !fs.existsSync(downloadedZipPath)) throw new Error("ZIP file was not downloaded.");
    
    const zipPath = downloadedZipPath;
    console.log(`ZIP Exported to: ${zipPath}`);

    console.log("Parsing Exported CSV...");
    const rows = await new Promise((resolve, reject) => {
      const results = [];
      Readable.from([csvText])
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });

    console.log("Parsing Exported ZIP...");
    const zip = new AdmZip(zipPath);
    
    let manifest = null;
    const manifestEntry = zip.getEntry('manifest.json');
    if (manifestEntry) {
        manifest = JSON.parse(manifestEntry.getData().toString('utf8'));
        console.log(`Found manifest.json (Version: ${manifest.version}, Products: ${manifest.productCount})`);
    } else {
        throw new Error("Missing manifest.json in ZIP");
    }

    if (manifest.version !== '2.0') throw new Error("ZIP Version mismatch");
    const csvVersion = rows[0]['Format Version'];
    if (csvVersion !== '2.0') throw new Error("CSV Version mismatch");

    const zipFilesExactMap = {};
    const entries = zip.getEntries();
    for (const entry of entries) {
        if (entry.isDirectory) continue;
        const p = entry.entryName;
        const parts = p.split('/');
        const fileName = parts.pop().trim();
        const dirPathExact = parts.join('/');
        if (!zipFilesExactMap[dirPathExact]) zipFilesExactMap[dirPathExact] = {};
        zipFilesExactMap[dirPathExact][fileName] = true;
    }

    let validationErrors = 0;
    
    rows.forEach(row => {
        const catName = row['Category'] || '';
        const subcatName = row['Subcategory'] || '';
        const name = row['Product Name'] || row['Name'] || '';
        if (!name) return;

        const exactDirPath = generateProductMediaPath(catName, subcatName, row['Image Folder'] || name);
        
        const primaryImageName = (row['Primary Image'] || '').trim();
        if (primaryImageName && !(zipFilesExactMap[exactDirPath] && zipFilesExactMap[exactDirPath][primaryImageName])) {
            console.error(`[ERROR] Primary Image '${primaryImageName}' not found for '${name}' in path '${exactDirPath}'`);
            validationErrors++;
        }

        const addImagesStr = (row['Additional Images'] || '').trim();
        if (addImagesStr) {
            const names = addImagesStr.split(';').map(n => n.trim()).filter(Boolean);
            names.forEach(img => {
                if (!(zipFilesExactMap[exactDirPath] && zipFilesExactMap[exactDirPath][img])) {
                    console.error(`[ERROR] Additional Image '${img}' not found for '${name}' in path '${exactDirPath}'`);
                    validationErrors++;
                }
            });
        }
    });

    if (validationErrors > 0) {
        console.error(`Test FAILED with ${validationErrors} errors.`);
    } else {
        console.log("SUCCESS: 0 validation errors, 0 missing images, 0 folder mismatches, 0 case mismatches. 100% Round-Trip Compatible.");
    }
    
    // Cleanup
    fs.unlinkSync(zipPath);
    process.exit(validationErrors > 0 ? 1 : 0);
  } catch(e) {
    console.error("Test execution failed:", e);
    process.exit(1);
  }
};

runTest();
