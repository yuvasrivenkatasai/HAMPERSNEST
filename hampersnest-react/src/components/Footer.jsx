import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Footer() {
  const { settings } = useCart();
  const handleWhatsappDirect = (e) => {
    e.preventDefault();
    const WHATSAPP_NUMBER = "917989202194";
    const welcomeText = encodeURIComponent('Hi Hampers Nest! I am interested in viewing your customized Return Gifts collection and getting a catalog.');
    window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${welcomeText}`, '_blank');
  };

  return (
    <footer>
      <div className="container footer-grid">
        {/* About column */}
        <div className="footer-col">
          <div style={{ marginBottom: '1.5rem' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <h2 style={{ 
                color: 'var(--color-gold)', 
                fontSize: '2rem', 
                fontWeight: '700', 
                letterSpacing: '2px', 
                margin: '0',
                textTransform: 'uppercase'
              }}>
                HAMPERS NEST
              </h2>
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
            <li><Link to="/" onClick={() => window.scrollTo(0, 0)}>Home</Link></li>
            <li><Link to="/about" onClick={() => window.scrollTo(0, 0)}>Our Story</Link></li>
            <li><Link to="/featured" onClick={() => window.scrollTo(0, 0)}>Featured Collections</Link></li>
            <li><Link to="/gallery" onClick={() => window.scrollTo(0, 0)}>Product Gallery</Link></li>
            <li><Link to="/contact" onClick={() => window.scrollTo(0, 0)}>Get Quote</Link></li>
          </ul>
        </div>

        {/* Collections Shortcut Column */}
        <div className="footer-col">
          <h4 className="footer-title">Collections</h4>
          <ul className="footer-links">
            <li><Link to="/collections?category=Wedding" onClick={() => window.scrollTo(0, 0)}>Wedding Gifting</Link></li>
            <li><Link to="/collections?category=Baby%20Shower" onClick={() => window.scrollTo(0, 0)}>Baby Shower Boxes</Link></li>
            <li><Link to="/collections?category=Housewarming" onClick={() => window.scrollTo(0, 0)}>Housewarming Kits</Link></li>
            <li><Link to="/collections?category=Corporate%20Gifting" onClick={() => window.scrollTo(0, 0)}>Corporate Hampers</Link></li>
            <li><Link to="/collections?category=Customized%20Hampers" onClick={() => window.scrollTo(0, 0)}>Customized Gifts</Link></li>
          </ul>
        </div>


      </div>

      {/* Footer Bottom Bar */}
      <div className="container footer-bottom" style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div className="footer-policy-links" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '0.8rem', opacity: 0.8 }}>
          <Link to="/privacy-policy" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}>Privacy Policy</Link>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
          <Link to="/shipping-policy" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}>Shipping Policy</Link>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
          <Link to="/refund-policy" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}>Refund Policy</Link>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
          <Link to="/terms-and-conditions" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}>Terms & Conditions</Link>
        </div>
        <p>&copy; 2026 Hampers Nest. All Rights Reserved. Crafted with love for Hyderabad's premium celebrations.</p>
        <div className="footer-socials">
          {settings?.facebookUrl && (
            <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
          )}
          {settings?.instagramUrl && (
            <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fa-brands fa-instagram"></i>
            </a>
          )}
          {settings?.youtubeUrl && (
            <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <i className="fa-brands fa-youtube"></i>
            </a>
          )}
          {settings?.linkedinUrl && (
            <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <i className="fa-brands fa-linkedin"></i>
            </a>
          )}
          {settings?.pinterestUrl && (
            <a href={settings.pinterestUrl} target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
              <i className="fa-brands fa-pinterest"></i>
            </a>
          )}
          {settings?.twitterUrl && (
            <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="fa-brands fa-x-twitter"></i>
            </a>
          )}
          <a href="#" onClick={handleWhatsappDirect} aria-label="WhatsApp direct link">
            <i className="fa-brands fa-whatsapp"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}
