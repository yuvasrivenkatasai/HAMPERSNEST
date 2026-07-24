import React, { useState, useEffect, useRef } from 'react';
import { apiRequest, API_BASE } from '../utils/api';
import Papa from 'papaparse';
import JSZip from 'jszip';

export default function BulkImportWizard({ isOpen, onClose, categories, setCategories, products, setProducts }) {
  const [step, setStep] = useState(1);
  const [importMode, setImportMode] = useState('CREATE_UPDATE');
  const [duplicateHandling, setDuplicateHandling] = useState('UPDATE');
  
  const [csvFile, setCsvFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  
  const [dryRunData, setDryRunData] = useState(null);
  const [finalReport, setFinalReport] = useState(null);

  // We store the parsed data and media manifest here
  const parsedProductsRef = useRef([]);
  const mediaManifestRef = useRef({}); 
  const categoriesToCreateRef = useRef([]);
  const subcategoriesToCreateRef = useRef([]);

  if (!isOpen) return null;

  const resetState = () => {
    setStep(1);
    setCsvFile(null);
    setZipFile(null);
    setDryRunData(null);
    setFinalReport(null);
    parsedProductsRef.current = [];
    mediaManifestRef.current = {};
    categoriesToCreateRef.current = [];
    subcategoriesToCreateRef.current = [];
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // --- UTILS ---
  const generateUUID = () => {
    return (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID)
      ? window.crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
  };

  const getSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  // --- STEP 2: PARSE & MATCH ---
  const startValidation = async () => {
    if (!csvFile) {
      alert("Please select a CSV file.");
      return;
    }
    setStep(2);
    setProgressMsg('Reading CSV File...');
    setProgressPercent(10);

    try {
      // 1. Read CSV
      const csvText = await csvFile.text();
      const parsedCsv = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      if (parsedCsv.errors.length > 0) {
        throw new Error(`CSV Parsing Error: ${parsedCsv.errors[0].message}`);
      }

      const rows = parsedCsv.data;
      
      setProgressMsg('Extracting ZIP Archive...');
      setProgressPercent(30);

      // 2. Read ZIP
      const zip = new JSZip();
      let zipContents = null;
      if (zipFile) {
        zipContents = await zip.loadAsync(zipFile);
      }

      setProgressMsg('Building Media Manifest...');
      setProgressPercent(50);

      // 3. Build Media Manifest
      // Map: FullPath -> { filename: File }
      const zipFilesMap = {};
      
      if (zipContents) {
        for (const [path, fileInfo] of Object.entries(zipContents.files)) {
          if (fileInfo.dir) continue;
          
          const parts = path.split('/');
          const fileName = parts.pop().trim().toLowerCase();
          const dirPath = parts.join('/').toLowerCase();
          
          if (!zipFilesMap[dirPath]) zipFilesMap[dirPath] = {};
          
          zipFilesMap[dirPath][fileName] = { fileInfo, fileName, type: getMimeType(fileName) };
        }
      }
      
      setProgressMsg('Validating Categories & Products...');
      setProgressPercent(70);

      // 4. Validate Products & Categories
      let categoriesNeeded = new Set();
      let subcatsNeeded = new Set();
      
      let errors = [];
      let warnings = [];
      let processed = [];
      let skuCounter = 1;

      const toBool = (val) => {
        if (!val) return false;
        const str = String(val).trim().toLowerCase();
        return str === 'true' || str === 'yes' || str === '1';
      };

      const safeName = (name) => name ? name.replace(/[/\\?%*:|"<>]/g, '-') : '';

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const name = (row['Product Name'] || row['Name'] || '').trim();
        if (!name) continue;

        let status = 'SUCCESS';
        let rowErrors = [];

        // Validate Required
        const price = parseFloat(row['Offer Price'] || row['Price'] || 0);
        if (isNaN(price)) {
          rowErrors.push('Missing or invalid price');
          status = 'FAILED';
        }

        const catName = (row['Category'] || '').trim();
        const subcatName = (row['Subcategory'] || '').trim();
        
        if (!catName) {
          rowErrors.push('Missing Category');
          status = 'FAILED';
        } else {
          categoriesNeeded.add(catName);
          if (subcatName) {
            subcatsNeeded.add(`${catName}||${subcatName}`);
          }
        }

        // Media matching using Strict Hierarchy
        const catFolder = safeName(catName).toLowerCase();
        const subcatFolder = safeName(subcatName).toLowerCase();
        const prodFolder = safeName(row['Image Folder'] || name).toLowerCase();
        
        const expectedDirPath = subcatFolder ? `${catFolder}/${subcatFolder}/${prodFolder}` : `${catFolder}/${prodFolder}`;
        const folderFiles = zipFilesMap[expectedDirPath] || {};
        const media = { cover: null, gallery: [], videos: [] };

        const primaryImageName = (row['Primary Image'] || '').trim().toLowerCase();
        if (primaryImageName) {
           if (folderFiles[primaryImageName]) {
             media.cover = folderFiles[primaryImageName];
           } else {
             rowErrors.push(`Primary Image '${primaryImageName}' not found in ZIP folder '${expectedDirPath}'`);
             status = 'FAILED';
           }
        } else {
           warnings.push(`[${name}] No Primary Image specified.`);
        }

        const addImagesStr = (row['Additional Images'] || '').trim();
        if (addImagesStr) {
           const names = addImagesStr.split(';').map(n => n.trim().toLowerCase()).filter(n => n);
           names.forEach(imgName => {
             if (folderFiles[imgName]) {
                media.gallery.push(folderFiles[imgName]);
             } else {
                rowErrors.push(`Additional Image '${imgName}' not found in ZIP folder '${expectedDirPath}'`);
                status = 'FAILED';
             }
           });
        }

        const videoFileName = (row['Video File'] || '').trim().toLowerCase();
        if (videoFileName) {
           if (folderFiles[videoFileName]) {
             media.videos.push(folderFiles[videoFileName]);
           } else {
             rowErrors.push(`Video File '${videoFileName}' not found in ZIP folder '${expectedDirPath}'`);
             status = 'FAILED';
           }
        }

        // Duplicate Detection & SKU Auto-gen
        let sku = (row['SKU'] || '').trim();
        if (!sku) {
           sku = `HN-${String(skuCounter).padStart(6, '0')}`;
           skuCounter++;
        }
        
        const slug = getSlug(name);
        
        const existingBySku = products.find(p => p.sku === sku);
        const existingBySlug = products.find(p => p.slug === slug);
        const existingByName = products.find(p => p.name.toLowerCase() === name.toLowerCase());
        
        const existingProd = existingBySku || existingBySlug || existingByName;
        
        let action = 'CREATE';
        if (existingProd) {
          if (duplicateHandling === 'SKIP') {
            action = 'SKIP';
          } else if (duplicateHandling === 'UPDATE') {
            action = 'UPDATE';
          } else {
            action = 'CREATE_COPY';
          }
        }

        if (importMode === 'CREATE_ONLY' && action === 'UPDATE') {
           action = 'SKIP';
           warnings.push(`[${name}] Skipped because product already exists.`);
        }
        if (importMode === 'UPDATE_ONLY' && action === 'CREATE') {
           action = 'SKIP';
           warnings.push(`[${name}] Skipped because product does not exist.`);
        }

        if (rowErrors.length > 0) errors.push(`[${name}] ${rowErrors.join(', ')}`);

        // Parse Variants (Format: Small|299|SKU001|50|Default; Medium|399|SKU002|20)
        let parsedVariants = [];
        const variantStr = row['Variants'] || '';
        if (variantStr) {
          const vParts = variantStr.split(';');
          vParts.forEach(v => {
            const props = v.split('|');
            if (props.length >= 2) {
              parsedVariants.push({
                name: props[0].trim(),
                price: parseFloat(props[1]) || 0,
                sku: props[2] ? props[2].trim() : '',
                stock: props[3] ? parseInt(props[3]) : 0,
                isActive: true,
                isDefault: (props[4] || '').trim().toLowerCase() === 'default'
              });
            }
          });
        }

        // Parse Addons (Format: Chocolate|149; Wax Candle|99)
        let parsedAddons = [];
        const addonStr = row['Add-ons'] || row['Addons'] || '';
        if (addonStr) {
          const aParts = addonStr.split(';');
          aParts.forEach(a => {
            const props = a.split('|');
            if (props.length >= 2) {
              parsedAddons.push({
                name: props[0].trim(),
                price: parseFloat(props[1]) || 0,
                isActive: true
              });
            }
          });
        }

        const stockQuantity = parseInt(row['Stock Quantity'] || row['Stock'] || 0);

        // Build Payload
        const prodData = {
          name: name,
          sku: sku,
          price: price,
          originalPrice: parseFloat(row['Original Price']) || 0,
          description: row['Full Description'] || '',
          shortDescription: row['Short Description'] || '',
          rating: parseFloat(row['Product Rating'] || row['Rating']) || 4.5,
          moq: parseInt(row['Minimum Order Quantity (MOQ)'] || row['MOQ']) || 1,
          stock: stockQuantity,
          isActive: row['Show In Storefront'] !== undefined ? toBool(row['Show In Storefront']) : (row['Status'] || '').toLowerCase() === 'active',
          isFeatured: toBool(row['Featured']),
          customGiftTagEnabled: toBool(row['Gift Tag Enabled']),
          customizationText: row['Customization Section Text'] || '',
          deliveryInfoText: row['Delivery Information Text'] || '',
          
          variantsEnabled: parsedVariants.length > 0 || toBool(row['Variants Enabled']),
          variants: parsedVariants,
          addonsEnabled: parsedAddons.length > 0 || toBool(row['Add-ons Enabled']),
          customAddons: parsedAddons,

          // Metadata for engine
          _categoryName: catName,
          _subcategoryName: subcatName,
          _action: action,
          _status: status,
          _existingId: action === 'UPDATE' ? existingProd.id : null,
          _media: media
        };

        processed.push(prodData);
      }

      // Check which categories actually need creation
      const catsToCreate = [];
      const subcatsToCreate = [];

      categoriesNeeded.forEach(cName => {
        const existing = categories.find(c => c.name.toLowerCase() === cName.toLowerCase() && !c.parentId);
        if (!existing) catsToCreate.push(cName);
      });

      subcatsNeeded.forEach(combo => {
        const [cName, scName] = combo.split('||');
        let parentCat = categories.find(c => c.name.toLowerCase() === cName.toLowerCase() && !c.parentId);
        let exists = false;
        if (parentCat) {
           exists = categories.some(c => c.parentId === parentCat.id && c.name.toLowerCase() === scName.toLowerCase());
        }
        if (!exists) subcatsToCreate.push({ parentName: cName, name: scName });
      });

      categoriesToCreateRef.current = catsToCreate;
      subcategoriesToCreateRef.current = subcatsToCreate;
      parsedProductsRef.current = processed;

      setProgressPercent(100);
      
      setDryRunData({
        total: rows.length,
        createCount: processed.filter(p => p._action === 'CREATE' || p._action === 'CREATE_COPY').length,
        updateCount: processed.filter(p => p._action === 'UPDATE').length,
        skipCount: processed.filter(p => p._action === 'SKIP').length,
        errorCount: processed.filter(p => p._status === 'FAILED').length,
        catsToCreate: catsToCreate.length,
        subcatsToCreate: subcatsToCreate.length,
        errors,
        warnings
      });

      setStep(3); // Go to Preview
    } catch (error) {
      alert(error.message);
      setStep(1);
    }
  };

  // --- STEP 4: IMPORT EXECUTION ---
  const startImport = async () => {
    setStep(4);
    setProgressMsg('Initializing Import...');
    setProgressPercent(5);

    let createdCount = 0;
    let updatedCount = 0;
    let skipCount = 0;
    let errCount = 0;
    let currentErrors = [];
    
    // We will update the categories state locally so products can reference IDs immediately
    let localCategories = [...categories];

    try {
      const token = localStorage.getItem('adminToken');

      // 1. Create Categories
      setProgressMsg('Creating missing Categories...');
      for (const catName of categoriesToCreateRef.current) {
        try {
          const created = await apiRequest('/api/categories', {
            method: 'POST',
            body: { name: catName, parentId: null }
          });
          localCategories.push(created);
        } catch (e) {
          currentErrors.push(`[Category] Failed to create ${catName}`);
        }
      }
      setProgressPercent(15);

      // 2. Create Subcategories
      setProgressMsg('Creating missing Subcategories...');
      for (const scObj of subcategoriesToCreateRef.current) {
        try {
          const parent = localCategories.find(c => c.name.toLowerCase() === scObj.parentName.toLowerCase() && !c.parentId);
          if (parent) {
             const created = await apiRequest('/api/categories', {
               method: 'POST',
               body: { name: scObj.name, parentId: parent.id }
             });
             localCategories.push(created);
          }
        } catch (e) {
          currentErrors.push(`[Subcategory] Failed to create ${scObj.name}`);
        }
      }
      setProgressPercent(25);

      // 3. Import Products (Stream & Batch Architecture)
      const totalProds = parsedProductsRef.current.length;
      const batchSize = 100; // Batch size to optimize database locking & memory
      
      for (let batchStart = 0; batchStart < totalProds; batchStart += batchSize) {
        const batchEnd = Math.min(batchStart + batchSize, totalProds);
        const batchItems = parsedProductsRef.current.slice(batchStart, batchEnd);
        
        setProgressMsg(`Processing Batch ${Math.floor(batchStart/batchSize) + 1}... (${batchStart} to ${batchEnd} of ${totalProds})`);
        setProgressPercent(25 + Math.round((batchStart / totalProds) * 70));

        let batchPayloadsToCreate = [];
        
        for (const pData of batchItems) {
          if (pData._action === 'SKIP' || pData._status === 'FAILED') {
            if (pData._status === 'FAILED') errCount++;
            else skipCount++;
            continue;
          }

          try {
            // Resolve Category IDs
            const pCat = localCategories.find(c => c.name.toLowerCase() === pData._categoryName.toLowerCase() && !c.parentId);
            const pSubcat = pData._subcategoryName ? localCategories.find(c => c.parentId === pCat?.id && c.name.toLowerCase() === pData._subcategoryName.toLowerCase()) : null;

            if (!pCat) throw new Error(`Category ${pData._categoryName} not found.`);

            // Upload Media (Lazy Blob Extraction)
            let coverUrl = '';
            let galleryUrls = [];
            let videoUrls = [];

            const media = pData._media;
            
            if (media) {
               const uploadPromises = [];

               const uploadFile = async (fileObj, type) => {
                 let file = fileObj;
                 // Perform lazy extraction directly before upload
                 if (fileObj && fileObj.fileInfo) {
                     const blob = await fileObj.fileInfo.async("blob");
                     file = new File([blob], fileObj.fileName, { type: fileObj.type });
                 }

                 const formDataObj = new FormData();
                 formDataObj.append(type === 'video' ? 'video' : 'image', file);
                 
                 let uploadUrl = type === 'video' 
                   ? `${API_BASE}/api/upload/video?folder=products` 
                   : `${API_BASE}/api/upload?folder=products&watermarkEnabled=true`; // Auto watermark
                   
                 const res = await fetch(uploadUrl, {
                   method: 'POST',
                   headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
                   body: formDataObj
                 });
                 if (!res.ok) throw new Error('Upload failed');
                 const data = await res.json();
                 return data.watermarkedUrl || data.url;
               };

               if (media.cover) uploadPromises.push(uploadFile(media.cover, 'image').then(url => coverUrl = url));
               media.gallery.forEach(g => uploadPromises.push(uploadFile(g, 'image').then(url => galleryUrls.push(url))));
               media.videos.forEach(v => uploadPromises.push(uploadFile(v, 'video').then(url => videoUrls.push(url))));

               await Promise.allSettled(uploadPromises);
            }

            const payload = {
              id: pData._action === 'UPDATE' ? pData._existingId : generateUUID(),
              name: pData.name,
              sku: pData.sku,
              price: pData.price,
              originalPrice: pData.originalPrice,
              category: pCat.id,
              subCategory: pSubcat ? pSubcat.id : '',
              description: pData.description,
              shortDescription: pData.shortDescription,
              rating: pData.rating,
              moq: pData.moq,
              stock: pData.stock,
              isActive: pData.isActive,
              isFeatured: pData.isFeatured,
              customGiftTagEnabled: pData.customGiftTagEnabled,
              customizationText: pData.customizationText,
              deliveryInfoText: pData.deliveryInfoText,
              variantsEnabled: pData.variantsEnabled,
              variants: pData.variants,
              addonsEnabled: pData.addonsEnabled,
              customAddons: pData.customAddons,
            };
            
            if (coverUrl || galleryUrls.length > 0) {
               payload.image = coverUrl || (galleryUrls.length > 0 ? galleryUrls[0] : '/assets/hero_banner.png');
               payload.images = galleryUrls;
            }
            if (videoUrls.length > 0) {
               payload.videoUrls = videoUrls;
            }

            if (pData._action === 'UPDATE') {
               await apiRequest(`/api/products/${pData._existingId}`, {
                 method: 'PUT',
                 body: payload
               });
               updatedCount++;
            } else {
               batchPayloadsToCreate.push(payload);
            }
          } catch (err) {
             errCount++;
             currentErrors.push(`[${pData.name}] ${err.message}`);
          }
        } // End of inner batch loop

        if (batchPayloadsToCreate.length > 0) {
          try {
            await apiRequest('/api/products/bulk', {
              method: 'POST',
              body: batchPayloadsToCreate
            });
            createdCount += batchPayloadsToCreate.length;
          } catch (bulkErr) {
            errCount += batchPayloadsToCreate.length;
            currentErrors.push(`Bulk Insert Failed for ${batchPayloadsToCreate.length} items: ${bulkErr.message}`);
          }
        }
      }

      setCategories(localCategories); // Sync categories globally

      setFinalReport({
        createdCount,
        updatedCount,
        skipCount,
        errCount,
        errors: currentErrors
      });

      setStep(5); // Complete
    } catch (e) {
      alert(`Fatal Error during import: ${e.message}`);
      setStep(1);
    }
  };

  const downloadReport = () => {
    if (!finalReport) return;
    let content = `Hampers Nest Bulk Import Report\n\n`;
    content += `Products Created: ${finalReport.createdCount}\n`;
    content += `Products Updated: ${finalReport.updatedCount}\n`;
    content += `Products Skipped: ${finalReport.skipCount}\n`;
    content += `Errors: ${finalReport.errCount}\n\n`;
    if (finalReport.errors.length > 0) {
      content += `Error Details:\n`;
      finalReport.errors.forEach(e => content += `- ${e}\n`);
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Import_Report_${new Date().getTime()}.txt`;
    a.click();
  };

  const getMimeType = (filename) => {
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
    if (filename.endsWith('.png')) return 'image/png';
    if (filename.endsWith('.webp')) return 'image/webp';
    if (filename.endsWith('.mp4')) return 'video/mp4';
    if (filename.endsWith('.webm')) return 'video/webm';
    return 'application/octet-stream';
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && step !== 4 && handleClose()}>
      <div className="modal-content" style={{ maxWidth: '800px', width: '100%' }}>
        
        <div className="modal-header">
          <h3><i className="fa-solid fa-boxes-packing" style={{ color: 'var(--color-gold)', marginRight: '10px' }}></i> Enterprise Bulk Import</h3>
          {step !== 4 && (
            <button className="modal-close" onClick={handleClose}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>

        <div className="modal-body" style={{ minHeight: '350px' }}>
          
          {/* STEP 1: CONFIGURATION */}
          {step === 1 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="dashboard-panel" style={{ margin: 0, padding: '20px', border: '1px solid var(--color-gray-border)' }}>
                  <h4 style={{ marginBottom: '15px' }}><i className="fa-solid fa-file-csv" style={{color: '#16A34A', marginRight: '8px'}}></i>1. CSV Data File</h4>
                  <input type="file" accept=".csv" className="form-input" onChange={e => setCsvFile(e.target.files[0])} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-text)', marginTop: '8px' }}>Contains product details, prices, variants, etc.</p>
                </div>
                
                <div className="dashboard-panel" style={{ margin: 0, padding: '20px', border: '1px solid var(--color-gray-border)' }}>
                  <h4 style={{ marginBottom: '15px' }}><i className="fa-solid fa-file-zipper" style={{color: '#EAB308', marginRight: '8px'}}></i>2. Media Archive (ZIP)</h4>
                  <input type="file" accept=".zip" className="form-input" onChange={e => setZipFile(e.target.files[0])} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-text)', marginTop: '8px' }}>Structured folder: Category / Subcategory / Product / cover.jpg</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Import Mode</label>
                  <select className="form-select" value={importMode} onChange={e => setImportMode(e.target.value)}>
                    <option value="CREATE_UPDATE">Create New & Update Existing</option>
                    <option value="CREATE_ONLY">Create New Products Only</option>
                    <option value="UPDATE_ONLY">Update Existing Products Only</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duplicate Handling (SKU/Name)</label>
                  <select className="form-select" value={duplicateHandling} onChange={e => setDuplicateHandling(e.target.value)}>
                    <option value="UPDATE">Update Existing Record</option>
                    <option value="SKIP">Skip Document</option>
                    <option value="COPY">Create Copy (New ID)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* STEP 2 & 4: LOADING / PROGRESS */}
          {(step === 2 || step === 4) && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '3rem', color: 'var(--color-purple)', marginBottom: '20px' }}></i>
              <h4 style={{ marginBottom: '10px' }}>{step === 2 ? 'Parsing & Validating...' : 'Importing Data...'}</h4>
              <p style={{ color: 'var(--color-gray-text)', marginBottom: '20px' }}>{progressMsg}</p>
              
              <div style={{ width: '100%', height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--color-gold)', transition: 'width 0.3s ease' }}></div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-text)', marginTop: '10px', fontWeight: 'bold' }}>{progressPercent}% Complete</p>
            </div>
          )}

          {/* STEP 3: DRY RUN PREVIEW */}
          {step === 3 && dryRunData && (
            <div>
              <div style={{ background: '#F8FAFC', padding: '15px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#334155' }}>Validation Summary (Dry Run)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                  <div style={{ background: '#fff', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16A34A' }}>{dryRunData.createCount}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>To Create</div>
                  </div>
                  <div style={{ background: '#fff', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563EB' }}>{dryRunData.updateCount}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>To Update</div>
                  </div>
                  <div style={{ background: '#fff', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#94A3B8' }}>{dryRunData.skipCount}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>To Skip</div>
                  </div>
                  <div style={{ background: '#fff', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#DC2626' }}>{dryRunData.errorCount}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Errors</div>
                  </div>
                </div>
                <div style={{ marginTop: '15px', display: 'flex', gap: '20px', fontSize: '0.9rem', color: '#475569' }}>
                  <span><i className="fa-solid fa-folder-plus" style={{marginRight: '5px'}}></i> Categories to Create: {dryRunData.catsToCreate}</span>
                  <span><i className="fa-solid fa-folder-tree" style={{marginRight: '5px'}}></i> Subcategories to Create: {dryRunData.subcatsToCreate}</span>
                </div>
              </div>

              {dryRunData.errors.length > 0 && (
                <div style={{ background: '#FEF2F2', padding: '15px', borderRadius: '8px', border: '1px solid #FCA5A5', marginBottom: '20px', maxHeight: '150px', overflowY: 'auto' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#991B1B' }}><i className="fa-solid fa-triangle-exclamation"></i> Blocking Errors</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#7F1D1D' }}>
                    {dryRunData.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
              
              {dryRunData.warnings.length > 0 && (
                <div style={{ background: '#FFFBEB', padding: '15px', borderRadius: '8px', border: '1px solid #FDE68A', maxHeight: '150px', overflowY: 'auto' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#92400E' }}><i className="fa-solid fa-circle-info"></i> Warnings (Will Import)</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#92400E' }}>
                    {dryRunData.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: FINAL REPORT */}
          {step === 5 && finalReport && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: '4rem', color: 'var(--color-gold)', marginBottom: '20px' }}></i>
              <h3 style={{ marginBottom: '20px', color: 'var(--color-purple)' }}>Import Completed Successfully</h3>
              
              <div style={{ display: 'inline-grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left', background: '#F8FAFC', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '1.1rem' }}><strong style={{color: '#16A34A'}}>{finalReport.createdCount}</strong> Created</div>
                <div style={{ fontSize: '1.1rem' }}><strong style={{color: '#2563EB'}}>{finalReport.updatedCount}</strong> Updated</div>
                <div style={{ fontSize: '1.1rem' }}><strong style={{color: '#94A3B8'}}>{finalReport.skipCount}</strong> Skipped</div>
                <div style={{ fontSize: '1.1rem' }}><strong style={{color: '#DC2626'}}>{finalReport.errCount}</strong> Failed</div>
              </div>

              {finalReport.errors.length > 0 && (
                <div style={{ marginTop: '20px', textAlign: 'left', background: '#FEF2F2', padding: '15px', borderRadius: '8px', border: '1px solid #FCA5A5', maxHeight: '150px', overflowY: 'auto' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#991B1B' }}>Failures during Import:</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#7F1D1D' }}>
                    {finalReport.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>
        
        <div className="modal-footer">
          {step === 1 && (
            <>
              <button className="btn-admin-secondary" onClick={handleClose}>Cancel</button>
              <button className="btn-admin" onClick={startValidation}>Validate & Preview</button>
            </>
          )}
          {step === 3 && (
            <>
              <button className="btn-admin-secondary" onClick={() => setStep(1)}>Back to Settings</button>
              <button className="btn-admin" onClick={startImport} disabled={dryRunData?.errorCount > 0 && dryRunData?.createCount === 0 && dryRunData?.updateCount === 0}>
                Confirm & Start Import
              </button>
            </>
          )}
          {step === 5 && (
            <>
              <button className="btn-admin-secondary" onClick={downloadReport}><i className="fa-solid fa-download"></i> Download Report</button>
              <button className="btn-admin" onClick={() => { handleClose(); window.location.reload(); }}>Done</button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
