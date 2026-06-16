import React from 'react';
import { Link } from 'react-router-dom';

export default function SeoKeywordsSection() {
  const handleClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className="container" style={{ paddingBottom: '2rem' }}>
      <div className="collections-seo-keywords-section" style={{ marginTop: '2rem', borderTop: '1px solid var(--color-beige)', paddingTop: '2.5rem' }}>
        <h4 className="seo-keywords-title">Related Gifting Searches</h4>
        <div className="seo-keywords-grid">
          <div className="seo-keywords-col">
            <h5>Occasions</h5>
            <ul>
              <li><Link to="/collections?category=Wedding" onClick={handleClick} className="seo-keyword-link">Wedding Return Gifts Hyderabad</Link></li>
              <li><Link to="/collections?category=Baby%20Shower" onClick={handleClick} className="seo-keyword-link">Premium Baby Shower Gift Curations</Link></li>
              <li><Link to="/collections?category=Housewarming" onClick={handleClick} className="seo-keyword-link">Housewarming Ceremony Hampers</Link></li>
              <li><Link to="/collections?category=Customized%20Hampers" onClick={handleClick} className="seo-keyword-link">Festival & Seasonal Gift Boxes</Link></li>
            </ul>
          </div>
          <div className="seo-keywords-col">
            <h5>Gift Styles</h5>
            <ul>
              <li><Link to="/collections?category=Brass%20Gifting" onClick={handleClick} className="seo-keyword-link">Traditional Brass Item Return Gifts</Link></li>
              <li><Link to="/collections?category=Customized%20Hampers" onClick={handleClick} className="seo-keyword-link">Curated Luxury Dry Fruit Hampers</Link></li>
              <li><Link to="/collections?category=Corporate%20Gifting" onClick={handleClick} className="seo-keyword-link">Premium Corporate Gift Sets</Link></li>
              <li><Link to="/collections?category=Customized%20Hampers" onClick={handleClick} className="seo-keyword-link">Handmade Gourmet Gift Trays</Link></li>
            </ul>
          </div>
          <div className="seo-keywords-col">
            <h5>Customization</h5>
            <ul>
              <li><Link to="/collections?category=Customized%20Hampers" onClick={handleClick} className="seo-keyword-link">Premium Ivory Lace Wrapping</Link></li>
              <li><Link to="/collections?category=Customized%20Hampers" onClick={handleClick} className="seo-keyword-link">Royal Purple Silk Box Covers</Link></li>
              <li><Link to="/collections?category=Customized%20Hampers" onClick={handleClick} className="seo-keyword-link">Personalized Gift Tags & Message Cards</Link></li>
              <li><Link to="/collections?category=Corporate%20Gifting" onClick={handleClick} className="seo-keyword-link">Bulk Order Corporate Hampers</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
