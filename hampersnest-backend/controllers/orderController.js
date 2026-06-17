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
  const { 
    customer, 
    items, 
    totalAmount, 
    budget, 
    eventType, 
    deliveryDate, 
    notes,
    source,
    paymentStatus,
    paymentMethod,
    advancePaid
  } = req.body;

  if (!customer || !items || items.length === 0 || !totalAmount || !eventType) {
    return res.status(400).json({ message: 'Order details are incomplete' });
  }

  // Validate Minimum Order Quantity (MOQ = 5) if source is Website (Admin can bypass)
  const orderSource = source || 'Website';
  if (orderSource === 'Website' && items.some(item => Number(item.quantity) < 5)) {
    return res.status(400).json({ message: 'Minimum order quantity is 5 pieces per product.' });
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
      notes: req.body.notes || '',
      internalNotes: req.body.internalNotes || '',
      status: req.body.status || 'Pending',
      source: orderSource,
      paymentStatus: paymentStatus || 'Pending',
      paymentMethod: paymentMethod || '',
      advancePaid: advancePaid ? Number(advancePaid) : 0
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

// @desc    Update order full details
// @route   PUT /api/orders/:id
// @access  Private/Admin
export const updateOrder = async (req, res) => {
  const { 
    customer, 
    items, 
    totalAmount, 
    eventType, 
    deliveryDate, 
    notes, 
    status, 
    internalNotes,
    paymentStatus,
    paymentMethod,
    advancePaid 
  } = req.body;

  try {
    const order = await Order.findOne({ where: { orderId: req.params.id } });

    if (order) {
      let historyObj = order.history || [];
      if (!Array.isArray(historyObj)) {
        historyObj = [];
      }

      const adminName = req.user ? req.user.username : 'Admin';
      const logChange = (action, fromVal, toVal) => {
        historyObj.push({
          action,
          from: fromVal,
          to: toVal,
          date: new Date().toISOString(),
          admin: adminName
        });
      };

      let hasChanges = false;
      const updateData = {};

      if (status && order.status !== status) {
        logChange('Status Changed', order.status, status);
        updateData.status = status;
        hasChanges = true;
      }
      
      if (paymentStatus && order.paymentStatus !== paymentStatus) {
        logChange('Payment Status Changed', order.paymentStatus, paymentStatus);
        updateData.paymentStatus = paymentStatus;
        hasChanges = true;
      }

      if (paymentMethod !== undefined && order.paymentMethod !== paymentMethod) {
        logChange('Payment Method Updated', order.paymentMethod, paymentMethod);
        updateData.paymentMethod = paymentMethod;
        hasChanges = true;
      }

      if (advancePaid !== undefined && Number(order.advancePaid) !== Number(advancePaid)) {
        logChange('Advance Paid Updated', order.advancePaid, advancePaid);
        updateData.advancePaid = Number(advancePaid);
        hasChanges = true;
      }

      if (internalNotes !== undefined && order.internalNotes !== internalNotes) {
        historyObj.push({ action: 'Internal Notes Updated', date: new Date().toISOString(), admin: adminName });
        updateData.internalNotes = internalNotes;
        hasChanges = true;
      }

      if (notes !== undefined && order.notes !== notes) {
        historyObj.push({ action: 'Order Notes Updated', date: new Date().toISOString(), admin: adminName });
        updateData.notes = notes;
        hasChanges = true;
      }

      if (eventType && order.eventType !== eventType) {
        logChange('Event Type Updated', order.eventType, eventType);
        updateData.eventType = eventType;
        hasChanges = true;
      }

      if (deliveryDate !== undefined) {
        const newDateObj = deliveryDate ? new Date(deliveryDate) : null;
        const oldDateObj = order.deliveryDate ? new Date(order.deliveryDate) : null;
        if (newDateObj?.toISOString() !== oldDateObj?.toISOString()) {
          logChange('Delivery Date Updated', oldDateObj ? oldDateObj.toISOString().split('T')[0] : 'None', newDateObj ? newDateObj.toISOString().split('T')[0] : 'None');
          updateData.deliveryDate = newDateObj;
          hasChanges = true;
        }
      }

      if (totalAmount !== undefined && Number(order.totalAmount) !== Number(totalAmount)) {
        logChange('Total Amount Updated', order.totalAmount, totalAmount);
        updateData.totalAmount = Number(totalAmount);
        hasChanges = true;
      }

      if (customer && JSON.stringify(order.customer) !== JSON.stringify(customer)) {
        historyObj.push({ action: 'Customer Details Updated', date: new Date().toISOString(), admin: adminName });
        // explicit Buffer to avoid CLOB/BLOB mapping issue on update
        updateData.customer = customer;
        hasChanges = true;
      }

      if (items && JSON.stringify(order.items) !== JSON.stringify(items)) {
        historyObj.push({ action: 'Order Items/Quantities Updated', date: new Date().toISOString(), admin: adminName });
        updateData.items = items;
        hasChanges = true;
      }

      if (hasChanges) {
        updateData.history = historyObj;
        await Order.update(updateData, { where: { orderId: req.params.id } });
      } else if (order.history.length !== historyObj.length) {
        updateData.history = historyObj;
        await Order.update(updateData, { where: { orderId: req.params.id } });
      }

      const updatedOrder = await Order.findOne({ where: { orderId: req.params.id } });
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ where: { orderId: req.params.id } });

    if (order) {
      await order.destroy();
      res.json({ message: 'Order removed successfully' });
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
      AdvancePaid: order.advancePaid || 0,
      BalanceAmount: order.totalAmount - (order.advancePaid || 0),
      EventType: order.eventType,
      Source: order.source || 'Website',
      Status: order.status,
      PaymentStatus: order.paymentStatus || 'Pending',
      PaymentMethod: order.paymentMethod || 'N/A',
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
      { header: 'Advance Paid', key: 'advancePaid', width: 15 },
      { header: 'Balance Amount', key: 'balanceAmount', width: 15 },
      { header: 'Event Type', key: 'eventType', width: 20 },
      { header: 'Source', key: 'source', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Payment Status', key: 'paymentStatus', width: 15 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 },
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
        advancePaid: order.advancePaid || 0,
        balanceAmount: order.totalAmount - (order.advancePaid || 0),
        eventType: order.eventType,
        source: order.source || 'Website',
        status: order.status,
        paymentStatus: order.paymentStatus || 'Pending',
        paymentMethod: order.paymentMethod || 'N/A',
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
