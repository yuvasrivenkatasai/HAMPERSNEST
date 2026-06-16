import { Testimonial } from '../database/models.js';

// @desc    Get testimonials (active only, or all for admin)
// @route   GET /api/testimonials
// @access  Public
export const getTestimonials = async (req, res) => {
  try {
    const isAll = req.query.all === 'true';
    const filter = {};
    if (!isAll) {
      filter.isActive = true;
    }

    const testimonials = await Testimonial.findAll({
      where: filter,
      order: [['createdAt', 'DESC']]
    });

    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
export const createTestimonial = async (req, res) => {
  const { name, quote, rating, event, isActive } = req.body;

  if (!name || !quote) {
    return res.status(400).json({ message: 'Please provide name and quote' });
  }

  try {
    const newTestimonial = await Testimonial.create({
      name,
      quote,
      rating: rating !== undefined ? Number(rating) : 5,
      event: event || '',
      isActive: isActive !== undefined ? !!isActive : true
    });

    res.status(201).json(newTestimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Private/Admin
export const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (testimonial) {
      const fields = ['name', 'quote', 'rating', 'event', 'isActive'];
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          if (field === 'rating') {
            testimonial[field] = Number(req.body[field]);
          } else if (field === 'isActive') {
            testimonial[field] = !!req.body[field];
          } else {
            testimonial[field] = req.body[field];
          }
        }
      });

      const updatedTestimonial = await testimonial.save();
      res.json(updatedTestimonial);
    } else {
      res.status(404).json({ message: 'Testimonial not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (testimonial) {
      await testimonial.destroy();
      res.json({ message: 'Testimonial deleted successfully' });
    } else {
      res.status(404).json({ message: 'Testimonial not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
