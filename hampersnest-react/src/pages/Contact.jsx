import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
import { API_BASE } from '../config.js';

export default function Contact() {
  const { settings } = useCart();
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.eventType || !formData.quantity) {
      alert('Please fill out all required fields.');
      return;
    }

    const whatsappNumber = settings?.whatsappNumber;
    
    const textMessage = `Hi Hampers Nest!\n\nI would like to request a customized quote:\n\n*Name:* ${formData.name}\n*Phone:* ${formData.phone}\n*Event Type:* ${formData.eventType}\n*Est. Quantity:* ${formData.quantity}\n*Customization Request:* ${formData.message || 'N/A'}`;

    const encodedText = encodeURIComponent(textMessage);
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

    setShowSuccessToast(true);

    // POST inquiry details to backend
    const inquiryPayload = {
      name: formData.name,
      phone: formData.phone,
      eventType: formData.eventType,
      quantity: Number(formData.quantity),
      message: formData.message || ''
    };

    try {
      await fetch(`${API_BASE}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryPayload)
      });
    } catch (err) {
      console.error('Failed to save inquiry to database:', err);
    }

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

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": `Contact ${settings?.storeName || 'Hampers Nest'}`,
    "description": "Contact our curation expert team in Hyderabad for bulk orders, wedding return gifts, baby shower boxes, and custom hampers.",
    "url": window.location.href,
    "mainEntity": {
      "@type": "LocalBusiness",
      "name": settings?.storeName || "Hampers Nest",
      "telephone": `+${settings?.whatsappNumber}`,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Jubilee Hills",
        "addressLocality": "Hyderabad",
        "addressRegion": "Telangana",
        "postalCode": "500033",
        "addressCountry": "IN"
      }
    }
  };

  return (
    <div className="page-container">
      <SEO 
        title={`Contact Our Gifting Experts | ${settings?.storeName || 'Hampers Nest'} Hyderabad`}
        description="Contact Hampers Nest Hyderabad for bulk orders, wedding consultations, and customized gifting queries. Get a quick quote via WhatsApp or phone."
        keywords="contact hampersnest, bulk return gifts hyderabad, wedding gifts consultation, custom hamper enquiry"
        schema={contactSchema}
      />
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
            <span className="section-subtitle contact-info-subtitle">Get In Touch</span>
            <h2 className="contact-info-title">Plan Your Return Gifts</h2>
            <p className="contact-info-desc">
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
                  <p style={{ marginBottom: '5px' }}>{settings?.businessAddress || 'Uppal, Hyderabad, Telangana, India'}</p>
                  <a 
                    href={settings?.googleMapsUrl || 'https://www.google.com/maps/dir/?api=1&destination=Uppal%2C%20Hyderabad%2C%20Telangana%2C%20India'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.8rem', color: 'var(--color-gold-dark)', fontWeight: '600', textDecoration: 'none', display: 'inline-block' }}
                  >
                    Get Directions <i className="fa-solid fa-arrow-right-long" style={{ marginLeft: '4px' }}></i>
                  </a>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-icon-box">
                  <i className="fa-regular fa-envelope"></i>
                </div>
                <div className="contact-detail-text">
                  <h5>Email</h5>
                  <p><a href={`mailto:${settings?.contactEmail || 'Hampersnestgifts@gmail.com'}`} style={{ color: 'var(--color-text)', textDecoration: 'none' }}>{settings?.contactEmail || 'Hampersnestgifts@gmail.com'}</a></p>
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
                <i className="fa-regular fa-clock" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i> {settings?.studioHoursTitle || 'Curation Studio Hours'}
              </h5>
              <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.6 }}>
                {settings?.studioHoursMonSat || 'Monday - Saturday: 10:00 AM - 7:00 PM'}<br />
                {settings?.studioHoursSun || 'Sunday: Closed (Available for emergency wedding deliveries)'}<br />
                <span style={{ color: 'var(--color-gold-dark)', fontWeight: 500 }}>{settings?.studioWalkInMsg || 'Walk-ins by prior appointment only.'}</span>
              </p>

              <h5 style={{ color: 'var(--color-purple)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem', marginTop: '1.2rem', textTransform: 'uppercase' }}>
                <i className="fa-solid fa-phone" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i> OWNER CONTACT
              </h5>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-gold-dark)', fontWeight: '600', margin: 0 }}>
                {settings?.ownerContactNumber || '+91 79892 02194'}
              </p>
            </div>

            <div className="contact-socials">
              {settings?.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="social-circle" aria-label="Facebook Page"><i className="fa-brands fa-facebook-f"></i></a>}
              {settings?.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="social-circle" aria-label="Instagram Page"><i className="fa-brands fa-instagram"></i></a>}
              {settings?.youtubeUrl && <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="social-circle" aria-label="YouTube Channel"><i className="fa-brands fa-youtube"></i></a>}
              {settings?.linkedinUrl && <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="social-circle" aria-label="LinkedIn"><i className="fa-brands fa-linkedin"></i></a>}
              {settings?.pinterestUrl && <a href={settings.pinterestUrl} target="_blank" rel="noopener noreferrer" className="social-circle" aria-label="Pinterest"><i className="fa-brands fa-pinterest"></i></a>}
              {settings?.twitterUrl && <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="social-circle" aria-label="Twitter"><i className="fa-brands fa-x-twitter"></i></a>}
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-box reveal" style={{ transitionDelay: '0.2s' }}>
            <h3 className="contact-form-title">Request Details Quote</h3>
            <p className="contact-form-subtitle">
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

              <div className="form-row">
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
                    placeholder="Min 5 pieces"
                    min="5"
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
