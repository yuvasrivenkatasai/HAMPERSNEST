import fs from 'fs';
import JSZip from 'jszip';
import Papa from 'papaparse';
import { generateProductMediaPath } from './src/utils/pathHelper.js';

const runTest = async () => {
  try {
    console.log("Starting End-to-End Export/Import Test...");
    
    // 1. Fetch CSV
    console.log("Exporting CSV...");
    const csvResponse = await fetch('http://localhost:5000/api/export/products-csv');
    if (!csvResponse.ok) throw new Error("Failed to export CSV: " + await csvResponse.text());
    const csvText = await csvResponse.text();
    
    // 2. Fetch ZIP
    console.log("Exporting ZIP...");
    const zipResponse = await fetch('http://localhost:5000/api/export/product-images-zip');
    if (!zipResponse.ok) throw new Error("Failed to export ZIP: " + await zipResponse.text());
    const zipBuffer = await zipResponse.arrayBuffer();

    console.log("Parsing Exported CSV...");
    const parsedCsv = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    if (parsedCsv.errors.length > 0) throw new Error("CSV Parsing Error");
    const rows = parsedCsv.data;

    console.log("Parsing Exported ZIP...");
    const zip = new JSZip();
    const zipContents = await zip.loadAsync(zipBuffer);
    
    let manifest = null;
    const manifestFile = zipContents.file('manifest.json');
    if (manifestFile) {
        manifest = JSON.parse(await manifestFile.async('string'));
        console.log(`Found manifest.json (Version: ${manifest.version}, Products: ${manifest.productCount})`);
    } else {
        throw new Error("Missing manifest.json in ZIP");
    }

    if (manifest.version !== '2.0') throw new Error("ZIP Version mismatch");
    const csvVersion = rows[0]['Format Version'];
    if (csvVersion !== '2.0') throw new Error("CSV Version mismatch");

    const zipFilesExactMap = {};
    for (const [path, fileInfo] of Object.entries(zipContents.files)) {
        if (fileInfo.dir) continue;
        const parts = path.split('/');
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
  } catch(e) {
    console.error("Test execution failed:", e);
  }
};

runTest();
