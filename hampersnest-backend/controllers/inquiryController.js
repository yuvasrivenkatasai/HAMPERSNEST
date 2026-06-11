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
    const inquiry = new Inquiry({
      name,
      phone,
      email: email || '',
      eventType: eventType || 'General',
      quantity: quantity ? Number(quantity) : 10,
      message
    });

    const createdInquiry = await inquiry.save();
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
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
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
    const inquiry = await Inquiry.findById(req.params.id);

    if (inquiry) {
      await Inquiry.deleteOne({ _id: req.params.id });
      res.json({ message: 'Inquiry removed successfully' });
    } else {
      res.status(404).json({ message: 'Inquiry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
