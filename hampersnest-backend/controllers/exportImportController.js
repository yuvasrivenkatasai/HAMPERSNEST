import { Op } from 'sequelize';
import crypto from 'crypto';
import fs from 'fs';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import csvParser from 'csv-parser';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const archiver = require('archiver');
// archiver v8 ships as pure ESM with no callable default export; import the
// ZipArchive class directly for new code paths.
import { ZipArchive } from 'archiver';
import path from 'path';
import { Product, Order, Inquiry, Category, ProductCategory, ExportJob } from '../database/models.js';
import { generateProductMediaPath } from '../utils/pathHelper.js';
import { enqueue, ensureExportsDir } from '../jobs/jobRunner.js';
import { fetchImageBuffer } from '../services/imageFetcher.js';

export const exportProductsExcel = async (req, res) => {
  try {
    const products = await Product.findAll({ raw: true });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 20 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Price', key: 'price', width: 10 },
      { header: 'Original Price', key: 'originalPrice', width: 15 },
      { header: 'Stock Qty', key: 'stockQuantity', width: 10 },
      { header: 'Reserved Qty', key: 'reservedQuantity', width: 15 },
      { header: 'Low Stock Threshold', key: 'lowStockThreshold', width: 20 },
      { header: 'Active', key: 'isActive', width: 10 },
      { header: 'Featured', key: 'isFeatured', width: 10 },
      { header: 'Description', key: 'description', width: 30 }
    ];
    worksheet.addRows(products);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const PRODUCT_CSV_FIELDS = [
  'Schema Version',
  'Product Name', 'Offer Price', 'Original Price', 'Product Rating', 'Category', 'Subcategory', 'Categories & Collections', 'Status', 'Featured', 'Show In Storefront', 'SKU',
  'Stock Quantity', 'Reserved Quantity', 'Available Quantity', 'Low Stock Threshold', 'Minimum Order Quantity (MOQ)', 'Inventory Status',
  'Primary Image', 'Additional Images', 'Video File', 'Image Folder', 'Image Count',
  'Short Description', 'Full Description',
  'Gift Tag Enabled', 'Gift Tag Placeholder', 'Customization Section Text',
  'Add-ons Enabled', 'Add-ons',
  'Delivery Information Text',
  'Variants Enabled', 'Variants',
  'Homepage Featured', 'Visibility Status',
  'Product ID', 'Created Date', 'Updated Date', 'Created By', 'Last Modified By'
];

/**
 * Build the products CSV string from product + category rows.
 * `imageRewriter` (optional): (url, product) => string | null — returned value
 * replaces the plain basename in the CSV cell. Return null/undefined to keep
 * the default basename behavior.
 */
export const buildProductsCsv = (products, categories, { imageRewriter } = {}) => {
  const catMap = {};
  categories.forEach(c => { catMap[c.id] = c.name; });

  const toBool = (val) => (val === true || val === 'true' || val === 1) ? 'TRUE' : 'FALSE';
  const rewriteOrBasename = (url, product) => {
    if (!url) return '';
    if (imageRewriter) {
      const r = imageRewriter(url, product);
      if (r) return r;
    }
    return url.split('/').pop().split('?')[0];
  };

  const formattedData = products.map(p => {
    const prod = typeof p.toJSON === 'function' ? p.toJSON() : p;

    const catName = catMap[prod.category] || prod.category || '';
    const subcatName = catMap[prod.subCategory] || prod.subCategory || '';

    const allAssignments = Array.isArray(prod.categoryAssignments) && prod.categoryAssignments.length > 0
      ? prod.categoryAssignments.map(a => `${catMap[a.categoryId] || a.categoryId}${a.subCategoryId ? ` > ${catMap[a.subCategoryId] || a.subCategoryId}` : ''}`).join('; ')
      : (catName ? `${catName}${subcatName ? ` > ${subcatName}` : ''}` : '');

    let variantsStr = '';
    if (prod.variantsEnabled && Array.isArray(prod.variants)) {
      variantsStr = prod.variants.map(v => {
        return `${v.name}|${v.price}|${v.sku || ''}|${v.stock || 0}${v.isDefault ? '|Default' : ''}`;
      }).join(';');
    }

    let addonsStr = '';
    if (prod.addonsEnabled && Array.isArray(prod.customAddons)) {
      addonsStr = prod.customAddons.map(a => `${a.name}|${a.price}`).join(';');
    }

    const coverImage = prod.image ? rewriteOrBasename(prod.image, prod) : '';
    const additionalImages = Array.isArray(prod.images) && prod.images.length > 0
      ? prod.images.map(img => rewriteOrBasename(img, prod)).join(';')
      : '';
    const videoFile = Array.isArray(prod.videoUrls) && prod.videoUrls.length > 0 && prod.videoUrls[0]
      ? rewriteOrBasename(prod.videoUrls[0], prod)
      : '';

    const status = prod.isActive ? 'Active' : 'Inactive';
    const stockQty = prod.stockQuantity || 0;
    const reservedQty = prod.reservedQuantity || 0;
    const availableQty = stockQty - reservedQty;

    return {
      'Schema Version': '1.0',
      'Product Name': prod.name || '',
      'Offer Price': prod.price || 0,
      'Original Price': prod.originalPrice || 0,
      'Product Rating': prod.rating || 4.5,
      'Category': catName,
      'Subcategory': subcatName,
      'Categories & Collections': allAssignments,
      'Status': status,
      'Featured': toBool(prod.isFeatured),
      'Show In Storefront': toBool(prod.isActive),
      'SKU': prod.sku || '',
      'Stock Quantity': stockQty,
      'Reserved Quantity': reservedQty,
      'Available Quantity': availableQty,
      'Low Stock Threshold': prod.lowStockThreshold || 5,
      'Minimum Order Quantity (MOQ)': prod.moq || 1,
      'Inventory Status': availableQty > 0 ? 'In Stock' : 'Out of Stock',
      'Primary Image': coverImage,
      'Additional Images': additionalImages,
      'Video File': videoFile,
      'Image Folder': prod.name || '',
      'Image Count': (coverImage ? 1 : 0) + (Array.isArray(prod.images) ? prod.images.length : 0),
      'Short Description': prod.shortDescription || '',
      'Full Description': prod.description || '',
      'Gift Tag Enabled': toBool(prod.customGiftTagEnabled),
      'Gift Tag Placeholder': '',
      'Customization Section Text': prod.customizationText || '',
      'Add-ons Enabled': toBool(prod.addonsEnabled),
      'Add-ons': addonsStr,
      'Delivery Information Text': prod.deliveryInfoText || '',
      'Variants Enabled': toBool(prod.variantsEnabled),
      'Variants': variantsStr,
      'Homepage Featured': toBool(prod.isFeatured),
      'Visibility Status': status,
      'Product ID': prod.id,
      'Created Date': prod.createdAt ? new Date(prod.createdAt).toISOString() : '',
      'Updated Date': prod.updatedAt ? new Date(prod.updatedAt).toISOString() : '',
      'Created By': 'System',
      'Last Modified By': 'System'
    };
  });

  const parser = new Parser({ fields: PRODUCT_CSV_FIELDS });
  return parser.parse(formattedData);
};

export const exportProductsCsv = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: ProductCategory,
          as: 'categoryAssignments',
          required: false
        }
      ]
    });
    const categories = await Category.findAll({ raw: true });

    const catMap = {};
    categories.forEach(c => {
      catMap[c.id] = c.name;
    });

    const toBool = (val) => (val === true || val === 'true' || val === 1) ? 'TRUE' : 'FALSE';

    const formattedData = products.map(p => {
      const prod = p.toJSON();

      const catName = catMap[prod.category] || prod.category || '';
      const subcatName = catMap[prod.subCategory] || prod.subCategory || '';

      const allAssignments = Array.isArray(prod.categoryAssignments) && prod.categoryAssignments.length > 0
        ? prod.categoryAssignments.map(a => `${catMap[a.categoryId] || a.categoryId}${a.subCategoryId ? ` > ${catMap[a.subCategoryId] || a.subCategoryId}` : ''}`).join('; ')
        : (catName ? `${catName}${subcatName ? ` > ${subcatName}` : ''}` : '');

      let variantsStr = '';
      if (prod.variantsEnabled && Array.isArray(prod.variants)) {
        variantsStr = prod.variants.map(v => {
          return `${v.name}|${v.price}|${v.sku || ''}|${v.stock || 0}${v.isDefault ? '|Default' : ''}`;
        }).join(';');
      }

      let addonsStr = '';
      if (prod.addonsEnabled && Array.isArray(prod.customAddons)) {
        addonsStr = prod.customAddons.map(a => {
          return `${a.name}|${a.price}`;
        }).join(';');
      }

      let coverImage = '';
      if (prod.image) {
        coverImage = prod.image.split('/').pop().split('?')[0];
      }

      let additionalImages = '';
      if (Array.isArray(prod.images) && prod.images.length > 0) {
        additionalImages = prod.images.map(img => {
          return img.split('/').pop().split('?')[0];
        }).join(';');
      }

      let videoFile = '';
      if (Array.isArray(prod.videoUrls) && prod.videoUrls.length > 0) {
         const firstVid = prod.videoUrls[0];
         if (firstVid) {
           videoFile = firstVid.split('/').pop().split('?')[0];
         }
      }

      let status = 'Inactive';
      if (prod.isActive) status = 'Active';

      const stockQty = prod.stockQuantity || 0;
      const reservedQty = prod.reservedQuantity || 0;
      const availableQty = stockQty - reservedQty;

      return {
        'Schema Version': '1.0',
        'Product Name': prod.name || '',
        'Offer Price': prod.price || 0,
        'Original Price': prod.originalPrice || 0,
        'Product Rating': prod.rating || 4.5,
        'Category': catName,
        'Subcategory': subcatName,
        'Categories & Collections': allAssignments,
        'Status': status,
        'Featured': toBool(prod.isFeatured),
        'Show In Storefront': toBool(prod.isActive),
        'SKU': prod.sku || '',
        'Stock Quantity': stockQty,
        'Reserved Quantity': reservedQty,
        'Available Quantity': availableQty,
        'Low Stock Threshold': prod.lowStockThreshold || 5,
        'Minimum Order Quantity (MOQ)': prod.moq || 1,
        'Inventory Status': availableQty > 0 ? 'In Stock' : 'Out of Stock',
        'Primary Image': coverImage,
        'Additional Images': additionalImages,
        'Video File': videoFile,
        'Image Folder': prod.name || '',
        'Image Count': (coverImage ? 1 : 0) + (Array.isArray(prod.images) ? prod.images.length : 0),
        'Short Description': prod.shortDescription || '',
        'Full Description': prod.description || '',
        'Gift Tag Enabled': toBool(prod.customGiftTagEnabled),
        'Gift Tag Placeholder': '',
        'Customization Section Text': prod.customizationText || '',
        'Add-ons Enabled': toBool(prod.addonsEnabled),
        'Add-ons': addonsStr,
        'Delivery Information Text': prod.deliveryInfoText || '',
        'Variants Enabled': toBool(prod.variantsEnabled),
        'Variants': variantsStr,
        'Homepage Featured': toBool(prod.isFeatured),
        'Visibility Status': status,
        'Product ID': prod.id,
        'Created Date': prod.createdAt ? new Date(prod.createdAt).toISOString() : '',
        'Updated Date': prod.updatedAt ? new Date(prod.updatedAt).toISOString() : '',
        'Created By': 'System',
        'Last Modified By': 'System'
      };
    });

    const fields = [
      'Schema Version',
      'Product Name', 'Offer Price', 'Original Price', 'Product Rating', 'Category', 'Subcategory', 'Categories & Collections', 'Status', 'Featured', 'Show In Storefront', 'SKU',
      'Stock Quantity', 'Reserved Quantity', 'Available Quantity', 'Low Stock Threshold', 'Minimum Order Quantity (MOQ)', 'Inventory Status',
      'Primary Image', 'Additional Images', 'Video File', 'Image Folder', 'Image Count',
      'Short Description', 'Full Description',
      'Gift Tag Enabled', 'Gift Tag Placeholder', 'Customization Section Text',
      'Add-ons Enabled', 'Add-ons',
      'Delivery Information Text',
      'Variants Enabled', 'Variants',
      'Homepage Featured', 'Visibility Status',
      'Product ID', 'Created Date', 'Updated Date', 'Created By', 'Last Modified By'
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(formattedData);
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('products.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadProductsCsvTemplate = (req, res) => {
  const fields = ['name', 'sku', 'category', 'price', 'originalPrice', 'stockQuantity', 'lowStockThreshold', 'description'];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse([{
    name: 'Sample Product',
    sku: 'SMP-001',
    category: 'Wedding',
    price: 999,
    originalPrice: 1299,
    stockQuantity: 50,
    lowStockThreshold: 5,
    description: 'A beautiful sample product'
  }]);
  res.header('Content-Type', 'text/csv');
  res.attachment('products_template.csv');
  return res.send(csv);
};

export const importProductsCsv = async (req, res) => {
  const { mode } = req.body; // 'CREATE_ONLY', 'UPDATE_ONLY', 'CREATE_UPDATE'
  
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a CSV file' });
  }

  const results = [];
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      for (const row of results) {
        try {
          if (!row.sku || !row.name) {
            errorCount++;
            continue;
          }

          const existingProduct = await Product.findOne({ where: { sku: row.sku } });

          if (existingProduct) {
            if (mode === 'CREATE_ONLY') {
              skippedCount++;
            } else if (mode === 'UPDATE_ONLY' || mode === 'CREATE_UPDATE') {
              await existingProduct.update({
                name: row.name || existingProduct.name,
                price: row.price ? Number(row.price) : existingProduct.price,
                originalPrice: row.originalPrice ? Number(row.originalPrice) : existingProduct.originalPrice,
                stockQuantity: row.stockQuantity ? Number(row.stockQuantity) : existingProduct.stockQuantity,
                lowStockThreshold: row.lowStockThreshold ? Number(row.lowStockThreshold) : existingProduct.lowStockThreshold,
                description: row.description || existingProduct.description,
                category: row.category || existingProduct.category
              });

              if (row.category) {
                const assignExists = await ProductCategory.findOne({
                  where: { productId: existingProduct.id, categoryId: row.category }
                });
                if (!assignExists) {
                  await ProductCategory.create({
                    productId: existingProduct.id,
                    categoryId: row.category,
                    subCategoryId: null,
                    isPrimary: true
                  });
                }
              }
              updatedCount++;
            }
          } else {
            if (mode === 'UPDATE_ONLY') {
              skippedCount++;
            } else if (mode === 'CREATE_ONLY' || mode === 'CREATE_UPDATE') {
              
              // Verify category exists
              let catId = row.category;
              if (catId) {
                const catExists = await Category.findByPk(catId);
                if (!catExists) {
                  // Fallback category if not valid
                  catId = 'Customized'; 
                }
              } else {
                catId = 'Customized';
              }

              const newId = crypto.randomUUID();
              await Product.create({
                id: newId,
                name: row.name,
                sku: row.sku,
                category: catId,
                price: row.price ? Number(row.price) : 0,
                originalPrice: row.originalPrice ? Number(row.originalPrice) : 0,
                stockQuantity: row.stockQuantity ? Number(row.stockQuantity) : 0,
                lowStockThreshold: row.lowStockThreshold ? Number(row.lowStockThreshold) : 5,
                description: row.description || '',
                image: '/assets/hero_banner.png' // default image
              });

              await ProductCategory.create({
                productId: newId,
                categoryId: catId,
                subCategoryId: null,
                isPrimary: true
              });

              createdCount++;
            }
          }
        } catch (err) {
          errorCount++;
        }
      }

      res.json({
        createdCount,
        updatedCount,
        skippedCount,
        errorCount,
        totalRows: results.length
      });
    });
};

export const exportOrdersCsv = async (req, res) => {
  try {
    const orders = await Order.findAll({ raw: true });
    const formatted = orders.map(o => ({
      orderId: o.orderId,
      status: o.status,
      totalAmount: o.totalAmount,
      customerName: o.customer?.name || '',
      customerPhone: o.customer?.phone || '',
      createdAt: o.createdAt
    }));
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(formatted);
    res.header('Content-Type', 'text/csv');
    res.attachment('orders.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportInquiriesCsv = async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll({ raw: true });
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(inquiries);
    res.header('Content-Type', 'text/csv');
    res.attachment('inquiries.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportInquiriesExcel = async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll({ raw: true });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inquiries');
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Subject', key: 'subject', width: 25 },
      { header: 'Message', key: 'message', width: 40 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ];
    worksheet.addRows(inquiries);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=inquiries.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportProductImagesZip = async (req, res) => {
  let tempZipPath = null;
  
  try {
    const products = await Product.findAll();
    const categories = await Category.findAll({ raw: true });

    const catMap = {};
    categories.forEach(c => {
      catMap[c.id] = c.name;
    });

    const manifest = {
      generatedAt: new Date().toISOString(),
      productCount: products.length,
      version: '2.0',
      products: []
    };

    const filesToAdd = [];
    const missingFiles = [];
    let imagesCount = 0;
    let videosCount = 0;
    let uniqueFolders = new Set();

    for (const p of products) {
      const product = p.toJSON();
      const catName = catMap[product.category] || product.category || 'Uncategorized';
      const subcatName = catMap[product.subCategory] || product.subCategory || '';

      const basePath = generateProductMediaPath(catName, subcatName, product.name);
      uniqueFolders.add(basePath);
      
      const manifestProduct = {
        id: product.id,
        name: product.name,
        folder: basePath,
        files: []
      };

      const processMedia = (url, type) => {
        if (!url) return;
        let relativePath = url;
        if (relativePath.includes('/uploads/')) {
          relativePath = relativePath.substring(relativePath.indexOf('/uploads/')).split('?')[0];
          const absolutePath = path.join(process.cwd(), 'public', relativePath);
          const fileName = relativePath.split('/').pop();
          
          if (fs.existsSync(absolutePath)) {
            filesToAdd.push({
              absolutePath,
              archivePath: `${basePath}/${fileName}`
            });
            manifestProduct.files.push(fileName);
            if (type === 'video') videosCount++;
            else imagesCount++;
          } else {
            missingFiles.push(`Product: ${product.name}, Missing: ${absolutePath}`);
          }
        }
      };

      if (product.image) processMedia(product.image, 'image');
      if (Array.isArray(product.images)) product.images.forEach(img => processMedia(img, 'image'));
      if (Array.isArray(product.videoUrls)) product.videoUrls.forEach(vid => processMedia(vid, 'video'));

      manifest.products.push(manifestProduct);
    }

    if (missingFiles.length > 0) {
      return res.status(400).json({ 
        message: 'Validation Error: Missing media files on disk', 
        details: missingFiles 
      });
    }

    if (filesToAdd.length === 0) {
      return res.status(400).json({
        message: 'Validation Error: No media found to export. Archive would be empty.'
      });
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    tempZipPath = path.join(uploadsDir, `temp_export_${Date.now()}_${Math.floor(Math.random() * 1000)}.zip`);
    const output = fs.createWriteStream(tempZipPath);
    
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    
    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') console.warn(err);
        else reject(err);
      });

      archive.pipe(output);
      archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });
      filesToAdd.forEach(file => {
        archive.file(file.absolutePath, { name: file.archivePath });
      });
      archive.finalize();
    });

    const stats = fs.statSync(tempZipPath);
    if (stats.size <= 22) {
      throw new Error("Generated ZIP is empty or corrupted (size <= 22 bytes)");
    }

    const AdmZip = (await import('adm-zip')).default;
    const verifyZip = new AdmZip(tempZipPath);
    const entries = verifyZip.getEntries();
    if (entries.length === 0) {
      throw new Error("Generated ZIP contains no readable files or directories");
    }

    console.log('--- Product Images ZIP Export ---');
    console.log(`Products Processed: ${products.length}`);
    console.log(`Folders Created: ${uniqueFolders.size}`);
    console.log(`Images Added: ${imagesCount}`);
    console.log(`Videos Added: ${videosCount}`);
    console.log(`Missing Files: ${missingFiles.length}`);
    console.log(`Final ZIP Size: ${stats.size} bytes`);
    console.log('Archive Finalized Successfully and Integrity Verified');

    res.download(tempZipPath, 'product_images.zip', (err) => {
      if (err) {
        console.error('Error sending ZIP to client:', err);
      }
      if (fs.existsSync(tempZipPath)) {
        fs.unlinkSync(tempZipPath);
      }
    });

  } catch (error) {
    console.error('ZIP Export Error:', error);
    if (tempZipPath && fs.existsSync(tempZipPath)) {
      fs.unlinkSync(tempZipPath);
    }
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const importProductImagesZipPreview = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a ZIP file' });
  }

  try {
    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(req.file.path);
    const zipEntries = zip.getEntries();
    
    // We expect folder structure: Category / ProductName / image.jpg
    const productsMatched = new Map();
    
    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      
      const parts = entry.entryName.split('/');
      if (parts.length >= 3) {
        // parts = [Category, ProductName, filename]
        const productName = parts[parts.length - 2].replace(/-/g, ' ');
        const fileName = parts[parts.length - 1];
        
        if (!fileName.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

        // find product by name
        const product = await Product.findOne({
          where: { name: { [Op.like]: `%${productName}%` } }
        });

        if (product) {
          if (!productsMatched.has(product.id)) {
            productsMatched.set(product.id, {
              id: product.id,
              name: product.name,
              category: product.category,
              imagesFound: []
            });
          }
          productsMatched.get(product.id).imagesFound.push({
            entryName: entry.entryName,
            fileName
          });
        }
      }
    }

    // Keep the uploaded zip around for commit
    const tempZipId = path.basename(req.file.path);

    res.json({
      message: 'Preview generated',
      tempZipId,
      matches: Array.from(productsMatched.values())
    });

  } catch (error) {
    console.error('ZIP Preview Error:', error);
    fs.unlinkSync(req.file.path);
    res.status(500).json({ message: error.message });
  }
};

// ---------- Combined products + images "Export All" (background job) ----------

const sanitizeForPath = (s, fallback = 'item') => {
  const cleaned = String(s || '').replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  return cleaned || fallback;
};

export const enqueueProductsFullExport = async (req, res) => {
  try {
    const createdBy = req.user?.username || req.user?.id || null;
    const job = await enqueue('products_full', runProductsFullExport, { createdBy });
    res.status(202).json({ jobId: job.id });
  } catch (error) {
    console.error('enqueueProductsFullExport error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getExportJob = async (req, res) => {
  try {
    const job = await ExportJob.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({
      id: job.id,
      type: job.type,
      status: job.status,
      progress: job.progress,
      message: job.message,
      fileName: job.fileName,
      fileSize: job.fileSize,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadExportJob = async (req, res) => {
  try {
    const job = await ExportJob.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'done') {
      return res.status(409).json({ message: `Job is ${job.status}, not ready to download.` });
    }
    if (!job.filePath || !fs.existsSync(job.filePath)) {
      return res.status(410).json({ message: 'Export file is no longer available.' });
    }
    res.download(job.filePath, job.fileName || 'export.zip');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Worker: builds a ZIP containing products.csv + images/<sku>/<file> + manifest.json
async function runProductsFullExport(job, report) {
  await report(1, 'Loading products');

  const products = await Product.findAll({
    include: [{ model: ProductCategory, as: 'categoryAssignments', required: false }]
  });
  const categories = await Category.findAll({ raw: true });

  const total = products.length;
  await report(5, `Found ${total} products`);

  const exportsDir = ensureExportsDir();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `hampersnest-export-${stamp}.zip`;
  const filePath = path.join(exportsDir, `${job.id}.zip`);

  // Per-product URL -> archive-relative path, for CSV rewrite.
  const urlToArchivePath = new Map();
  const warnings = [];
  const manifestProducts = [];

  // Pre-plan all images so we can rewrite the CSV (write CSV first in archive).
  // We'll fetch and append binaries while streaming.
  const plan = []; // [{ url, archivePath, product }]
  for (const p of products) {
    const prod = p.toJSON();
    const folder = `images/${sanitizeForPath(prod.sku || prod.id, prod.id)}`;
    const files = [];
    const take = (url) => {
      if (!url || urlToArchivePath.has(url)) {
        if (url && urlToArchivePath.has(url)) files.push(urlToArchivePath.get(url));
        return;
      }
      const base = (url.split('?')[0].split('#')[0].split('/').pop() || 'file').replace(/[^a-zA-Z0-9._-]+/g, '_');
      const archivePath = `${folder}/${base}`;
      urlToArchivePath.set(url, archivePath);
      plan.push({ url, archivePath, productId: prod.id });
      files.push(archivePath);
    };
    if (prod.image) take(prod.image);
    if (Array.isArray(prod.images)) prod.images.forEach(take);
    if (Array.isArray(prod.videoUrls)) prod.videoUrls.forEach(take);
    manifestProducts.push({ id: prod.id, name: prod.name, sku: prod.sku, folder, files });
  }

  await report(10, `Planned ${plan.length} media files`);

  const csv = buildProductsCsv(products, categories, {
    imageRewriter: (url) => urlToArchivePath.get(url) || null
  });

  // Create archive piped to disk.
  const output = fs.createWriteStream(filePath);
  const archive = new ZipArchive({ zlib: { level: 9 } });

  const archivePromise = new Promise((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
    archive.on('error', reject);
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') warnings.push(`archive warning: ${err.message}`);
      else reject(err);
    });
  });
  archive.pipe(output);

  // Add products.csv first so unzip tools show it at the top.
  archive.append(csv, { name: 'products.csv' });

  // Stream each binary.
  let done = 0;
  for (const item of plan) {
    try {
      const { buffer } = await fetchImageBuffer(item.url);
      archive.append(buffer, { name: item.archivePath });
    } catch (err) {
      warnings.push(`Skipped ${item.url} (${err.message})`);
    }
    done++;
    // Progress 10% -> 90% during binary fetch.
    if (plan.length > 0) {
      const pct = 10 + Math.floor((done / plan.length) * 80);
      if (done % 5 === 0 || done === plan.length) {
        await report(pct, `Packaged ${done}/${plan.length} files`);
      }
    }
  }

  const manifest = {
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    productCount: products.length,
    fileCount: plan.length,
    warnings,
    products: manifestProducts
  };
  archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

  await report(95, 'Finalizing archive');
  archive.finalize();
  await archivePromise;

  const stat = fs.statSync(filePath);
  job.filePath = filePath;
  job.fileName = fileName;
  job.fileSize = stat.size;
  job.progress = 100;
  job.status = 'done';
  job.message = `Done (${warnings.length ? `${warnings.length} warning(s)` : 'no warnings'})`;
  await job.save();
}

export const importProductImagesZipCommit = async (req, res) => {
  const { tempZipId, matches, applyWatermark } = req.body;
  if (!tempZipId) return res.status(400).json({ message: 'tempZipId is required' });

  const tempZipPath = path.join(process.cwd(), 'uploads', tempZipId);
  if (!fs.existsSync(tempZipPath)) {
    return res.status(400).json({ message: 'Temporary ZIP file not found or expired' });
  }

  try {
    const AdmZip = (await import('adm-zip')).default;
    const sharp = (await import('sharp')).default;
    const { generateWatermarkedImage } = await import('../utils/imageProcessor.js');

    const zip = new AdmZip(tempZipPath);
    let updatedCount = 0;

    for (const match of matches) {
      const product = await Product.findOne({ where: { id: match.id } });
      if (!product) continue;

      const productDir = path.join(process.cwd(), 'public', 'uploads', 'products', product.id);
      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
      }

      let mainImage = product.image;
      let additionalImages = [];
      try {
        if (product.images) {
           additionalImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
        }
      } catch(e) {}
      
      if (!Array.isArray(additionalImages)) additionalImages = [];

      for (const imgMeta of match.imagesFound) {
        const entry = zip.getEntry(imgMeta.entryName);
        if (!entry) continue;

        const buffer = entry.getData();
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
        const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

        const isMain = imgMeta.fileName.toLowerCase().startsWith('main');
        const relativeUrl = `/uploads/products/${product.id}/${filename}`;
        
        fs.writeFileSync(path.join(productDir, filename), webpBuffer);

        if (applyWatermark) {
          const watermarkOptions = {
            enableWatermark: true
          };
          const watermarkedBuffer = await generateWatermarkedImage(webpBuffer, watermarkOptions);
          const watermarkedFilename = filename.replace('.webp', '_watermarked.webp');
          fs.writeFileSync(path.join(productDir, watermarkedFilename), watermarkedBuffer);
        }

        if (isMain) {
          mainImage = relativeUrl;
        } else {
          additionalImages.push(relativeUrl);
        }
      }

      product.image = mainImage;
      product.images = additionalImages;
      await product.save();
      updatedCount++;
    }

    fs.unlinkSync(tempZipPath);
    res.json({ message: `Successfully updated images for ${updatedCount} products.` });
  } catch (error) {
    console.error('ZIP Commit Error:', error);
    res.status(500).json({ message: error.message });
  }
};
