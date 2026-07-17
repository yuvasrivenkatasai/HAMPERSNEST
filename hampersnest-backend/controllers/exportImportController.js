import { Op } from 'sequelize';
import crypto from 'crypto';
import fs from 'fs';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import csvParser from 'csv-parser';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import path from 'path';
import { Product, Order, Inquiry, Category } from '../database/models.js';

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

export const exportProductsCsv = async (req, res) => {
  try {
    const products = await Product.findAll({ raw: true });
    const fields = ['id', 'name', 'sku', 'category', 'price', 'originalPrice', 'stockQuantity', 'reservedQuantity', 'lowStockThreshold', 'isActive', 'isFeatured', 'description'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(products);
    res.header('Content-Type', 'text/csv');
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

              await Product.create({
                id: crypto.randomUUID(),
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
  try {
    const products = await Product.findAll({ raw: true });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=product_images.zip');
    
    const archive = new ZipArchive({
      zlib: { level: 9 } // Sets the compression level.
    });
    
    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        console.warn(err);
      } else {
        throw err;
      }
    });

    archive.on('error', function(err) {
      throw err;
    });

    archive.pipe(res);

    for (const product of products) {
      const categoryName = product.category ? product.category.replace(/[/\\?%*:|"<>]/g, '-') : 'Uncategorized';
      const productName = product.name ? product.name.replace(/[/\\?%*:|"<>]/g, '-') : 'Unnamed_Product';
      
      const allImages = [];
      if (product.image) allImages.push(product.image);
      let additionalImages = [];
      try {
        additionalImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      } catch (e) {}
      
      if (Array.isArray(additionalImages)) {
        additionalImages.forEach(img => {
          if (img && !allImages.includes(img)) allImages.push(img);
        });
      }

      for (let i = 0; i < allImages.length; i++) {
        const imgUrl = allImages[i];
        let relativePath = imgUrl;
        
        if (imgUrl && imgUrl.includes('/uploads/')) {
          relativePath = imgUrl.substring(imgUrl.indexOf('/uploads/'));
        }
        
        if (relativePath && relativePath.startsWith('/uploads/')) {
          // Parse out any query parameters just in case
          relativePath = relativePath.split('?')[0];
          const absolutePath = path.join(process.cwd(), 'public', relativePath);
          if (fs.existsSync(absolutePath)) {
            const ext = path.extname(absolutePath);
            const fileName = i === 0 ? `main${ext}` : `additional_${i}${ext}`;
            const zipPath = `${categoryName}/${productName}/${fileName}`;
            archive.file(absolutePath, { name: zipPath });
          } else {
            console.warn(`[ZIP Export] File not found: ${absolutePath}`);
          }
        }
      }
    }

    archive.finalize();
  } catch (error) {
    console.error('ZIP Export Error:', error);
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
            enableWatermark: true,
            watermarkText: 'Hampers Nest',
            position: 'Bottom Right',
            opacity: 0.18,
            size: 'Medium'
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
