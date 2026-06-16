import { Inquiry } from '../database/models.js';
import { Parser } from 'json2csv';

// @desc    Submit a contact inquiry
// @route   POST /api/inquiries
// @access  Public
export const createInquiry = async (req, res) => {
  const { name, phone, email, city, eventType, budget, quantity, message } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ message: 'Name, phone, and message are required' });
  }

  try {
    const createdInquiry = await Inquiry.create({
      name,
      phone,
      email: email || '',
      city: city || '',
      eventType: eventType || 'General',
      budget: budget || '',
      quantity: quantity ? Number(quantity) : 10,
      message,
      status: 'New'
    });

    res.status(201).json(createdInquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all inquiries (Paginated)
// @route   GET /api/inquiries
// @access  Private/Admin
export const getInquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const { count, rows } = await Inquiry.findAndCountAll({ 
      where: filter,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      inquiries: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an inquiry status and CRM fields
// @route   PUT /api/inquiries/:id
// @access  Private/Admin
export const updateInquiryStatus = async (req, res) => {
  const { status, leadNotes, assignedAdmin } = req.body;
  try {
    const inquiry = await Inquiry.findByPk(req.params.id);
    if (inquiry) {
      let historyObj = inquiry.history || [];
      if (!Array.isArray(historyObj)) {
        historyObj = [];
      }

      if (status && inquiry.status !== status) {
        historyObj.push({
          action: 'Status Changed',
          from: inquiry.status,
          to: status,
          date: new Date().toISOString(),
          admin: req.user ? req.user.username : 'Admin'
        });
        inquiry.status = status;
      }

      if (leadNotes !== undefined && inquiry.leadNotes !== leadNotes) {
        historyObj.push({
          action: 'Notes Updated',
          date: new Date().toISOString(),
          admin: req.user ? req.user.username : 'Admin'
        });
        inquiry.leadNotes = leadNotes;
      }

      if (assignedAdmin !== undefined && inquiry.assignedAdmin !== assignedAdmin) {
        historyObj.push({
          action: 'Assigned Admin Changed',
          from: inquiry.assignedAdmin,
          to: assignedAdmin,
          date: new Date().toISOString(),
          admin: req.user ? req.user.username : 'Admin'
        });
        inquiry.assignedAdmin = assignedAdmin;
      }

      inquiry.history = historyObj;
      await inquiry.save();
      res.json(inquiry);
    } else {
      res.status(404).json({ message: 'Inquiry not found' });
    }
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

// @desc    Export inquiries to CSV
// @route   GET /api/inquiries/export/csv
// @access  Private/Admin
export const exportInquiriesCSV = async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll({ order: [['createdAt', 'DESC']] });
    
    const formattedData = inquiries.map(inq => ({
      ID: inq.id,
      Name: inq.name,
      Phone: inq.phone,
      Email: inq.email || 'N/A',
      City: inq.city || 'N/A',
      EventType: inq.eventType,
      Quantity: inq.quantity,
      Budget: inq.budget || 'N/A',
      Message: inq.message,
      Status: inq.status,
      CreatedAt: new Date(inq.createdAt).toISOString().split('T')[0]
    }));

    const parser = new Parser();
    const csv = parser.parse(formattedData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`inquiries-export-${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
