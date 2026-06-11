import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Contact() {
  const { cart, cartCount, cartTotal } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventType: '',
    quantity: '',
    message: ''
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal, .reveal-heading');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );
    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.eventType || !formData.quantity) {
      alert('Please fill out all required fields.');
      return;
    }

    const whatsappBaseNumber = '917989202194';
    
    // Append cart items if they exist
    let cartString = '';
    if (cart.length > 0) {
      cartString = `\n\n*Interested Items in Cart:*` + cart.map((item, idx) => {
        return `\n- ${item.name} x ${item.quantity}`;
      }).join('');
      cartString += `\n*Est. Cart Value:* ₹${cartTotal}`;
    }

    const textMessage = `Hi Hampers Nest!\n\nI would like to request a customized quote:\n\n*Name:* ${formData.name}\n*Phone:* ${formData.phone}\n*Event Type:* ${formData.eventType}\n*Est. Quantity:* ${formData.quantity}\n*Customization Request:* ${formData.message || 'N/A'}${cartString}`;

    const encodedText = encodeURIComponent(textMessage);
    const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappBaseNumber}&text=${encodedText}`;

    setShowSuccessToast(true);

    setTimeout(() => {
      window.open(whatsappURL, '_blank');
      setFormData({
        name: '',
        phone: '',
        eventType: '',
        quantity: '',
        message: ''
      });
      setShowSuccessToast(false);
    }, 1800);
  };

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container" style={{ padding: 0 }}>
          <span className="section-subtitle" style={{ marginBottom: '0.5rem' }}>Let's Connect</span>
          <h2>Plan Your Return Gifts</h2>
          <p style={{ marginBottom: '1.25rem' }}>Get in touch with our curation studio for bespoke gifting plans and pricing catalogs</p>

          {/* Top Banner SEO Tags */}
          <div className="trending-tags-banner">
            <span className="trending-label">Popular Searches:</span>
            <Link to="/collections?category=Wedding" className="trending-tag-btn">#WeddingReturnGifts</Link>
            <Link to="/collections?category=Baby%20Shower" className="trending-tag-btn">#BabyShowerHampers</Link>
            <Link to="/collections?category=Corporate" className="trending-tag-btn">#CorporateGifts</Link>
            <Link to="/collections?category=Brass" className="trending-tag-btn">#BrassReturnGifts</Link>
            <Link to="/collections?category=Customized" className="trending-tag-btn">#CustomGiftBoxes</Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '1rem' }}>
        <div className="contact-grid">
          {/* Left Column: Info & Map Placeholder */}
          <div className="contact-info reveal">
            <span className="section-subtitle" style={{ textAlign: 'left', marginBottom: '0.8rem' }}>Get In Touch</span>
            <h2 className="contact-info-title" style={{ fontSize: '2rem' }}>Plan Your Return Gifts</h2>
            <p className="contact-info-desc" style={{ fontSize: '0.9rem' }}>
              Drop us your custom request details, and our Hyderabad team will get back to you with custom catalog designs,
              pricing options, and shipping estimates within a few hours.
            </p>

            <div className="contact-details">
              <div className="contact-detail-item">
                <div className="contact-icon-box">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <div className="contact-detail-text">
                  <h5>Location</h5>
                  <p>Hyderabad, Telangana, India</p>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-icon-box">
                  <i className="fa-solid fa-gift"></i>
                </div>
                <div className="contact-detail-text">
                  <h5>Services</h5>
                  <p>Premium Return Gifts & Customized Hampers</p>
                </div>
              </div>
            </div>

            {/* Studio Hours Card */}
            <div
              style={{
                marginTop: '2rem',
                background: 'var(--color-white)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid var(--color-beige)',
                boxShadow: 'var(--shadow-premium)'
              }}
            >
              <h5 style={{ color: 'var(--color-purple)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                <i className="fa-regular fa-clock" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i> Curation Studio Hours
              </h5>
              <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.6 }}>
                Monday - Saturday: 10:00 AM - 7:00 PM<br />
                Sunday: Closed (Available for emergency wedding deliveries)<br />
                <span style={{ color: 'var(--color-gold-dark)', fontWeight: 500 }}>Walk-ins by prior appointment only.</span>
              </p>
            </div>

            <div className="contact-socials">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-circle" aria-label="Facebook Page"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-circle" aria-label="Instagram Page"><i className="fa-brands fa-instagram"></i></a>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-box reveal" style={{ transitionDelay: '0.2s' }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', textAlign: 'center', color: 'var(--color-purple)' }}>Request Details Quote</h3>
            <p style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center', marginBottom: '1.5rem' }}>
              Fill in your celebration size to receive custom catalogs
            </p>
            
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="f-name">Full Name *</label>
                <input
                  type="text"
                  id="f-name"
                  name="name"
                  className="form-input"
                  placeholder="Your complete name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="f-phone">Phone Number *</label>
                <input
                  type="tel"
                  id="f-phone"
                  name="phone"
                  className="form-input"
                  placeholder="Your active WhatsApp number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="f-event">Celebration *</label>
                  <select
                    id="f-event"
                    name="eventType"
                    className="form-select"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select event</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Baby Shower">Baby Shower</option>
                    <option value="Housewarming">Housewarming</option>
                    <option value="Half Saree Function">Half Saree Function</option>
                    <option value="Corporate Gifting">Corporate Gifting</option>
                    <option value="Special Celebration">Special Celebration</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="f-qty">Order Size *</label>
                  <input
                    type="number"
                    id="f-qty"
                    name="quantity"
                    className="form-input"
                    placeholder="Min 10 pieces"
                    min="10"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="f-msg">Detailed Customization Requirements</label>
                <textarea
                  id="f-msg"
                  name="message"
                  className="form-textarea"
                  rows="4"
                  placeholder="E.g. Let us know if you need specific box colors, brass items, card text, etc."
                  value={formData.message}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              {cart.length > 0 && (
                <div style={{ background: 'var(--color-lavender)', padding: '10px 14px', borderRadius: '8px', marginBottom: '1.2rem', fontSize: '0.8rem', color: 'var(--color-purple-dark)', borderLeft: '3px solid var(--color-gold)' }}>
                  <i className="fa-solid fa-cart-shopping" style={{ marginRight: '6px' }}></i>
                  <strong>Cart Integration:</strong> We will automatically append the {cartCount} items currently in your basket (₹{cartTotal}) to this catalog inquiry request.
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Send Inquiry Via WhatsApp <i className="fa-solid fa-paper-plane" style={{ marginLeft: '6px' }}></i>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* TOAST SUCCESS NOTIFICATION POPUP */}
      <div
        id="successPopup"
        className={`success-popup ${showSuccessToast ? 'active' : ''}`}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: showSuccessToast ? 'translateY(0) translateX(-50%)' : 'translateY(100px) translateX(-50%)',
          background: 'var(--color-purple-dark)',
          color: 'var(--color-white)',
          padding: '12px 24px',
          borderRadius: '50px',
          boxShadow: 'var(--shadow-premium)',
          zIndex: 2000,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          opacity: showSuccessToast ? 1 : 0
        }}
      >
        <i className="fa-solid fa-circle-check" style={{ color: 'var(--color-whatsapp)' }}></i>
        <span>Thank you! Redirecting you to WhatsApp...</span>
      </div>
      {/* SEO Related Keywords Grid Section */}
      <div className="container" style={{ paddingTop: 0 }}>
        <div className="collections-seo-keywords-section" style={{ marginTop: '2.5rem', borderTop: '1px solid var(--color-beige)', paddingTop: '2.5rem' }}>
          <h4 className="seo-keywords-title">Related Gifting Searches</h4>
          <div className="seo-keywords-grid">
            <div className="seo-keywords-col">
              <h5>Occasions</h5>
              <ul>
                <li><Link to="/collections?category=Wedding" className="seo-keyword-link">Wedding Return Gifts Hyderabad</Link></li>
                <li><Link to="/collections?category=Baby%20Shower" className="seo-keyword-link">Premium Baby Shower Gift Curations</Link></li>
                <li><Link to="/collections?category=Housewarming" className="seo-keyword-link">Housewarming Ceremony Hampers</Link></li>
                <li><Link to="/collections?category=Customized" className="seo-keyword-link">Custom Birthday & Anniversary Boxes</Link></li>
              </ul>
            </div>
            <div className="seo-keywords-col">
              <h5>Gift Styles</h5>
              <ul>
                <li><Link to="/collections?category=Brass" className="seo-keyword-link">Traditional Brass Item Return Gifts</Link></li>
                <li><Link to="/collections?category=Customized" className="seo-keyword-link">Curated Luxury Dry Fruit Hampers</Link></li>
                <li><Link to="/collections?category=Corporate" className="seo-keyword-link">Premium Corporate Gift Sets</Link></li>
                <li><Link to="/collections?category=Customized" className="seo-keyword-link">Handmade Gourmet Chocolate Trays</Link></li>
              </ul>
            </div>
            <div className="seo-keywords-col">
              <h5>Customization options</h5>
              <ul>
                <li><Link to="/collections" className="seo-keyword-link">Premium Ivory Lace Wrapping</Link></li>
                <li><Link to="/collections" className="seo-keyword-link">Royal Purple Silk Box Covers</Link></li>
                <li><Link to="/collections" className="seo-keyword-link">Personalized Gift Tags & Message Cards</Link></li>
                <li><Link to="/collections" className="seo-keyword-link">Enhancing Scented Wax Candle Add-ons</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
