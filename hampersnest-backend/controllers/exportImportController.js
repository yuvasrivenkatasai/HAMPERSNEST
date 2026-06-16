import { Op } from 'sequelize';
import crypto from 'crypto';
import fs from 'fs';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import csvParser from 'csv-parser';
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
