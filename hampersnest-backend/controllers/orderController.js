import { Order } from '../database/models.js';
import { Parser } from 'json2csv';

// Helper to generate custom human-readable Order ID
const generateOrderId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
  return `HN-${dateStr}-${randNum}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (called from checkout)
export const createOrder = async (req, res) => {
  const { customer, items, totalAmount, budget, eventType, deliveryDate, notes } = req.body;

  if (!customer || !items || items.length === 0 || !totalAmount || !eventType) {
    return res.status(400).json({ message: 'Order details are incomplete' });
  }

  try {
    const orderId = generateOrderId();
    const createdOrder = await Order.create({
      orderId,
      customer,
      items,
      totalAmount: Number(totalAmount),
      budget: budget ? Number(budget) : 0,
      eventType,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      notes: notes || '',
      status: 'Pending'
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Paginated)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const { count, rows } = await Order.findAndCountAll({ 
      where: filter,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    res.json({
      orders: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by orderId
// @route   GET /api/orders/:id
// @access  Private/Admin
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ where: { orderId: req.params.id } });
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status and notes
// @route   PUT /api/orders/:id
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const { status, internalNotes } = req.body;

  try {
    const order = await Order.findOne({ where: { orderId: req.params.id } });

    if (order) {
      let historyObj = order.history || [];
      if (!Array.isArray(historyObj)) {
        historyObj = [];
      }

      if (status && order.status !== status) {
        historyObj.push({
          action: 'Status Changed',
          from: order.status,
          to: status,
          date: new Date().toISOString(),
          admin: req.user ? req.user.username : 'Admin'
        });
        order.status = status;
      }

      if (internalNotes !== undefined && order.internalNotes !== internalNotes) {
        historyObj.push({
          action: 'Internal Notes Updated',
          date: new Date().toISOString(),
          admin: req.user ? req.user.username : 'Admin'
        });
        order.internalNotes = internalNotes;
      }

      order.history = historyObj;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export orders to CSV
// @route   GET /api/orders/export/csv
// @access  Private/Admin
export const exportOrdersCSV = async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    
    const formattedData = orders.map(order => ({
      OrderID: order.orderId,
      CustomerName: order.customer?.name || 'N/A',
      CustomerEmail: order.customer?.email || 'N/A',
      CustomerPhone: order.customer?.phone || 'N/A',
      TotalAmount: order.totalAmount,
      EventType: order.eventType,
      Status: order.status,
      DeliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : 'N/A',
      CreatedAt: new Date(order.createdAt).toISOString().split('T')[0]
    }));

    const parser = new Parser();
    const csv = parser.parse(formattedData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`orders-export-${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import ExcelJS from 'exceljs';

// @desc    Export orders to Excel
// @route   GET /api/orders/export/excel
// @access  Private/Admin
export const exportOrdersExcel = async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    worksheet.columns = [
      { header: 'Order ID', key: 'orderId', width: 20 },
      { header: 'Customer Name', key: 'customerName', width: 25 },
      { header: 'Customer Email', key: 'customerEmail', width: 30 },
      { header: 'Customer Phone', key: 'customerPhone', width: 20 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
      { header: 'Event Type', key: 'eventType', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Delivery Date', key: 'deliveryDate', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 15 },
    ];

    orders.forEach(order => {
      worksheet.addRow({
        orderId: order.orderId,
        customerName: order.customer?.name || 'N/A',
        customerEmail: order.customer?.email || 'N/A',
        customerPhone: order.customer?.phone || 'N/A',
        totalAmount: order.totalAmount,
        eventType: order.eventType,
        status: order.status,
        deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : 'N/A',
        createdAt: new Date(order.createdAt).toISOString().split('T')[0]
      });
    });

    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment(`orders-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
