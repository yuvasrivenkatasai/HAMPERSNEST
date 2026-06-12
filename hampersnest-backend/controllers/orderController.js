import { Order } from '../database/models.js';

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
  const { customer, items, totalAmount, eventType, deliveryDate, notes } = req.body;

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

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    res.json(orders);
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

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Please provide status' });
  }

  try {
    const order = await Order.findOne({ where: { orderId: req.params.id } });

    if (order) {
      order.status = status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
