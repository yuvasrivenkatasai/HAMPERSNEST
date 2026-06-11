import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';

export default function FeaturedGifts() {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const featuredItems = products.filter(p => p.isFeatured);

  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal, .reveal-heading, .featured-row');
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

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container" style={{ padding: 0 }}>
          <span className="section-subtitle" style={{ marginBottom: '0.5rem' }}>Curator's Choice</span>
          <h2>Featured Gifts</h2>
          <p style={{ marginBottom: '1.25rem' }}>Handpicked premium hampers crafted to elevate your celebrations</p>

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

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {featuredItems.map((product, idx) => {
          const isLeft = idx % 2 === 0;
          const isWishlisted = isInWishlist(product.id);

          return (
            <div
              key={product.id}
              className={`reveal`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '2.5rem',
                alignItems: 'center',
                background: 'var(--color-white)',
                padding: '2.5rem',
                borderRadius: '16px',
                border: '1px solid var(--color-beige)',
                boxShadow: 'var(--shadow-premium)',
                transitionDelay: `${idx * 100}ms`
              }}
            >
              {/* Responsive Layout wrapper matching desktop vs mobile */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: isLeft ? 'row' : 'row-reverse',
                  flexWrap: 'wrap',
                  gap: '2.5rem',
                  alignItems: 'center',
                  width: '100%'
                }}
              >
                {/* Product Image Column */}
                <div style={{ flex: '1 1 380px', position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-beige)' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.5s ease' }}
                    className="featured-hover-zoom"
                  />
                  <div className="card-actions-top">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`action-icon-btn wishlist-btn ${isWishlisted ? 'active' : ''}`}
                      style={{ background: 'var(--color-white)', border: 'none' }}
                      aria-label="Wishlist toggle"
                    >
                      <i className={isWishlisted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
                    </button>
                  </div>
                </div>

                {/* Product Detail Text Column */}
                <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span className="section-subtitle" style={{ textAlign: 'left', margin: 0, fontSize: '0.7rem' }}>
                      {product.category} COLLECTION
                    </span>
                    <h3 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--color-purple-dark)', margin: '0.4rem 0 0.8rem 0' }}>
                      {product.name}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                      <div style={{ color: 'var(--color-gold)', fontSize: '0.8rem' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <i key={i} className="fa-solid fa-star" style={{ marginRight: '2px' }}></i>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#666' }}>({product.rating} Rating)</span>
                    </div>

                    <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-gold-dark)', margin: 0 }}>
                      ₹{product.price}
                    </p>
                  </div>

                  <p style={{ fontSize: '0.95rem', color: 'var(--color-charcoal)', lineHeight: 1.7 }}>
                    {product.description}
                  </p>

                  {/* Hamper contents */}
                  <div style={{ borderTop: '1px solid var(--color-beige)', paddingTop: '1rem' }}>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-purple)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Hamper Inclusions:
                    </h5>
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: 'var(--color-charcoal)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {product.details.map((detail, dIdx) => (
                        <li key={dIdx} style={{ position: 'relative', paddingLeft: '18px' }}>
                          <span style={{ position: 'absolute', left: 0, color: 'var(--color-gold)' }}>✔</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="btn btn-primary"
                      style={{ flex: 2, height: '48px', padding: 0 }}
                    >
                      Instant Add <i className="fa-solid fa-cart-shopping" style={{ marginLeft: '6px' }}></i>
                    </button>
                    <button
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="btn btn-secondary"
                      style={{ flex: 1, height: '48px', padding: 0, fontSize: '0.75rem' }}
                    >
                      Personalize
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
