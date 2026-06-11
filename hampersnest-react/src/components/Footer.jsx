import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const handleWhatsappDirect = (e) => {
    e.preventDefault();
    const whatsappBaseNumber = '917989202194';
    const welcomeText = encodeURIComponent('Hi Hampers Nest! I am interested in viewing your customized Return Gifts collection and getting a catalog.');
    window.open(`https://api.whatsapp.com/send?phone=${whatsappBaseNumber}&text=${welcomeText}`, '_blank');
  };

  return (
    <footer>
      <div className="container footer-grid">
        {/* About column */}
        <div className="footer-col">
          <div
            style={{
              background: 'var(--color-white)',
              padding: '8px 12px',
              borderRadius: '8px',
              display: 'inline-block',
              marginBottom: '1.5rem',
              border: '1px solid var(--color-gold)'
            }}
          >
            <Link to="/" className="logo footer-logo" style={{ display: 'block' }}>
              <img src="/assets/logo.png" alt="Hampers Nest Logo" style={{ height: '50px', width: 'auto' }} />
            </Link>
          </div>
          <p className="footer-about-text">
            Hampers Nest curation studio crafts exceptional Customized Hampers & traditional/modern return gifts for
            life's most precious occasions. Based out of Hyderabad, shipping premium bundles across India.
          </p>
        </div>

        {/* Quick Links Column */}
        <div className="footer-col">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">Our Story</Link></li>
            <li><Link to="/collections">Featured Collections</Link></li>
            <li><Link to="/gallery">Product Gallery</Link></li>
            <li><Link to="/contact">Get Quote</Link></li>
          </ul>
        </div>

        {/* Collections Shortcut Column */}
        <div className="footer-col">
          <h4 className="footer-title">Collections</h4>
          <ul className="footer-links">
            <li><Link to="/collections?category=Wedding">Wedding Gifting</Link></li>
            <li><Link to="/collections?category=Baby Shower">Baby Shower Boxes</Link></li>
            <li><Link to="/collections?category=Housewarming">Housewarming Kits</Link></li>
            <li><Link to="/collections?category=Corporate">Corporate Hampers</Link></li>
            <li><Link to="/collections?category=Customized">Customized Gifts</Link></li>
          </ul>
        </div>

        {/* Instagram Grid Column */}
        <div className="footer-col">
          <h4 className="footer-title">Follow Us</h4>
          <div className="footer-insta-grid">
            <div className="footer-insta-img"><img src="/assets/wedding_gift.png" alt="Instagram Showcase 1" /></div>
            <div className="footer-insta-img"><img src="/assets/baby_shower.png" alt="Instagram Showcase 2" /></div>
            <div className="footer-insta-img"><img src="/assets/housewarming.png" alt="Instagram Showcase 3" /></div>
            <div className="footer-insta-img"><img src="/assets/corporate.png" alt="Instagram Showcase 4" /></div>
            <div className="footer-insta-img"><img src="/assets/hero_banner.png" alt="Instagram Showcase 5" /></div>
            <div className="footer-insta-img"><img src="/assets/brass_cup.png" alt="Instagram Showcase 6" /></div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="container footer-bottom" style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <p>&copy; 2026 Hampers Nest. All Rights Reserved. Crafted with love for Hyderabad's premium celebrations.</p>
        <div className="footer-socials">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ marginRight: '15px' }}>
            <i className="fa-brands fa-facebook-f"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ marginRight: '15px' }}>
            <i className="fa-brands fa-instagram"></i>
          </a>
          <a href="#" onClick={handleWhatsappDirect} aria-label="WhatsApp direct link">
            <i className="fa-brands fa-whatsapp"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}
