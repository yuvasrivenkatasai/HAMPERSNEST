import { Inquiry } from '../database/models.js';

// @desc    Submit a contact inquiry
// @route   POST /api/inquiries
// @access  Public
export const createInquiry = async (req, res) => {
  const { name, phone, email, eventType, quantity, message } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ message: 'Name, phone, and message are required' });
  }

  try {
    const createdInquiry = await Inquiry.create({
      name,
      phone,
      email: email || '',
      eventType: eventType || 'General',
      quantity: quantity ? Number(quantity) : 10,
      message
    });

    res.status(201).json(createdInquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private/Admin
export const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll({ order: [['createdAt', 'DESC']] });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private/Admin
export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id);

    if (inquiry) {
      await inquiry.destroy();
      res.json({ message: 'Inquiry removed successfully' });
    } else {
      res.status(404).json({ message: 'Inquiry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
