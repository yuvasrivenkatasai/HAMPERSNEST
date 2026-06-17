import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';

const OCCASIONS = [
  'Wedding Return Gifts',
  'Baby Shower',
  'Naming Ceremony',
  'Half Saree',
  'Dhoti Ceremony',
  'Housewarming',
  'Birthday',
  'Anniversary',
  'Corporate Gifts',
  'Festival Hampers',
  'Other',
];

const BUDGETS = [
  'Under ₹250',
  '₹250–₹500',
  '₹500–₹1,000',
  '₹1,000–₹2,000',
  'Above ₹2,000',
];

const CUSTOMIZATION_OPTIONS = [
  'Name Tags',
  'Thank You Cards',
  'Logo Printing',
  'Custom Message',
  'Invitation Inserts',
];


const EMPTY_FORM = {
  occasion: '',
  eventDate: '',
  quantity: '5',
  budget: '',
  location: '',
  customizations: [],
  name: '',
  mobile: '',
  email: '',
  notes: '',
};

export default function QuoteModal({ open, onClose }) {
  const { settings } = useCart();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCheckbox = (option) => {
    setForm((prev) => {
      const already = prev.customizations.includes(option);
      return {
        ...prev,
        customizations: already
          ? prev.customizations.filter((o) => o !== option)
          : [...prev.customizations, option],
      };
    });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.mobile.trim()) {
      e.mobile = 'Mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\s+/g, ''))) {
      e.mobile = 'Enter a valid 10-digit Indian mobile number.';
    }
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const customStr = form.customizations.length > 0
      ? form.customizations.join(', ')
      : 'None';

    const message =
      `Hello ${settings?.storeName || 'Hampers Nest'},\n\n` +
      `I would like a quote for my event.\n\n` +
      `*Occasion:*\n${form.occasion || 'Not specified'}\n\n` +
      `*Event Date:*\n${form.eventDate || 'Not specified'}\n\n` +
      `*Quantity:*\n${form.quantity || 'Not specified'}\n\n` +
      `*Budget:*\n${form.budget || 'Not specified'}\n\n` +
      `*Location:*\n${form.location || 'Not specified'}\n\n` +
      `*Customization:*\n${customStr}\n\n` +
      `*Name:*\n${form.name}\n\n` +
      `*Phone:*\n${form.mobile}\n\n` +
      (form.email ? `*Email:*\n${form.email}\n\n` : '') +
      (form.notes ? `*Additional Notes:*\n${form.notes}\n\n` : '') +
      `Please share suitable options.\n\nThank you.`;

    const whatsappNumber = settings?.whatsappNumber;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    onClose();
  };

  return (
    <div className="quote-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="quote-modal-container" role="dialog" aria-modal="true" aria-labelledby="quote-modal-title">
        {/* Close */}
        <button className="quote-modal-close" onClick={onClose} aria-label="Close quote form">
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Header */}
        <div className="quote-modal-header">
          <div className="quote-modal-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
              <polyline points="20 12 20 22 4 22 4 12" fill="rgba(200, 169, 107, 0.15)" />
              <rect x="2" y="7" width="20" height="5" rx="1" fill="rgba(200, 169, 107, 0.25)" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </div>
          <h2 id="quote-modal-title" className="quote-modal-title">Get a Free Quote for Your Event</h2>
          <p className="quote-modal-subtitle">
            Tell us about your celebration and we'll curate the perfect hamper solution based on your budget and requirements.
          </p>
        </div>

        {/* Form */}
        <form className="quote-modal-form" onSubmit={handleSubmit} noValidate>

          {/* Row 1: Occasion + Event Date */}
          <div className="quote-form-row">
            <div className="quote-form-group">
              <label className="quote-label" htmlFor="qm-occasion">Occasion</label>
              <select
                id="qm-occasion"
                name="occasion"
                className="quote-select"
                value={form.occasion}
                onChange={handleChange}
              >
                <option value="">Select occasion</option>
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="quote-form-group">
              <label className="quote-label" htmlFor="qm-date">Event Date</label>
              <input
                type="date"
                id="qm-date"
                name="eventDate"
                className="quote-input"
                value={form.eventDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 2: Quantity + Budget */}
          <div className="quote-form-row">
            <div className="quote-form-group">
              <label className="quote-label" htmlFor="qm-qty">Quantity Required</label>
              <input
                type="number"
                id="qm-qty"
                name="quantity"
                className="quote-input"
                placeholder="e.g. 150"
                min="5"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>

            <div className="quote-form-group">
              <label className="quote-label" htmlFor="qm-budget">Budget Per Gift</label>
              <select
                id="qm-budget"
                name="budget"
                className="quote-select"
                value={form.budget}
                onChange={handleChange}
              >
                <option value="">Select budget</option>
                {BUDGETS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="quote-form-group">
            <label className="quote-label" htmlFor="qm-location">Delivery City / Pincode</label>
            <input
              type="text"
              id="qm-location"
              name="location"
              className="quote-input"
              placeholder="e.g. Hyderabad or 500032"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          {/* Customization Checkboxes */}
          <div className="quote-form-group">
            <label className="quote-label">Customization Needed</label>
            <div className="quote-checkboxes">
              {CUSTOMIZATION_OPTIONS.map((opt) => (
                <label key={opt} className="quote-checkbox-label">
                  <input
                    type="checkbox"
                    className="quote-checkbox"
                    checked={form.customizations.includes(opt)}
                    onChange={() => handleCheckbox(opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>



          {/* Row 3: Name + Mobile */}
          <div className="quote-form-row">
            <div className="quote-form-group">
              <label className="quote-label" htmlFor="qm-name">
                Name <span className="quote-required">*</span>
              </label>
              <input
                type="text"
                id="qm-name"
                name="name"
                className={`quote-input ${errors.name ? 'error' : ''}`}
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <span className="quote-error">{errors.name}</span>}
            </div>

            <div className="quote-form-group">
              <label className="quote-label" htmlFor="qm-mobile">
                Mobile / WhatsApp <span className="quote-required">*</span>
              </label>
              <input
                type="tel"
                id="qm-mobile"
                name="mobile"
                className={`quote-input ${errors.mobile ? 'error' : ''}`}
                placeholder="10-digit number"
                value={form.mobile}
                onChange={handleChange}
              />
              {errors.mobile && <span className="quote-error">{errors.mobile}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="quote-form-group">
            <label className="quote-label" htmlFor="qm-email">
              Email <span className="quote-optional">(Optional)</span>
            </label>
            <input
              type="email"
              id="qm-email"
              name="email"
              className="quote-input"
              placeholder="yourname@email.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          {/* Notes */}
          <div className="quote-form-group">
            <label className="quote-label" htmlFor="qm-notes">Additional Requirements</label>
            <textarea
              id="qm-notes"
              name="notes"
              className="quote-textarea"
              placeholder="Mention any special requests, themes, or packaging preferences..."
              maxLength={500}
              value={form.notes}
              onChange={handleChange}
              rows={3}
            />
            <span className="quote-char-count">{form.notes.length} / 500</span>
          </div>

          {/* Submit */}
          <button type="submit" className="quote-submit-btn">
            <i className="fa-brands fa-whatsapp"></i>
            ✨ Get My Free Quote
          </button>
        </form>
      </div>
    </div>
  );
}
