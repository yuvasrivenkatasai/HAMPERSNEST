import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';

const CATEGORIES = ['All', 'Wedding', 'Baby Shower', 'Housewarming', 'Corporate', 'Customized', 'Brass'];

export default function Gallery() {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxProduct, setLightboxProduct] = useState(null);

  // Filter gallery items by category
  const galleryItems = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  // Handle escape key closure for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lightboxProduct) {
        setLightboxProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxProduct]);

  useEffect(() => {
    if (lightboxProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxProduct]);

  // IntersectionObserver for animations
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal, .reveal-heading, .gallery-item');
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
  }, [galleryItems]);

  const handleLightboxAddToCart = (e, product) => {
    e.preventDefault();
    addToCart(product, 1);
    setLightboxProduct(null);
  };

  const handleLightboxPersonalize = (e, product) => {
    e.preventDefault();
    setLightboxProduct(null);
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container" style={{ padding: 0 }}>
          <span className="section-subtitle" style={{ marginBottom: '0.5rem' }}>Exquisite Creations</span>
          <h2>Product Showcase</h2>
          <p style={{ marginBottom: '1.25rem' }}>Browse our beautiful creations and customizable return gift setups</p>

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
        {/* Category Filters */}
        <div className="reveal" style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          <div className="category-tabs" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Masonry/Grid */}
        <div className="gallery-masonry reveal" style={{ marginTop: '0' }}>
          {galleryItems.map((product) => {
            const isWishlisted = isInWishlist(product.id);
            return (
              <div
                key={product.id}
                className="gallery-item"
                data-title={product.name}
                data-desc={product.description}
                onClick={() => setLightboxProduct(product)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-actions-top" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`action-icon-btn wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    aria-label="Wishlist toggle"
                  >
                    <i className={isWishlisted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
                  </button>
                </div>
                
                <img
                  className="gallery-item-img"
                  src={product.image}
                  alt={product.name}
                />

                <div className="gallery-overlay" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="card-overlay-btn"
                  >
                    <i className="fa-solid fa-cart-shopping"></i> Add To Cart
                  </button>
                </div>

                <div className="gallery-item-info">
                  <h4>{product.name}</h4>
                  <p className="card-price">
                    <span className="price-prefix">From </span>₹{product.price}
                  </p>
                  <button
                    className="btn btn-quick-enquiry"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                    }}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIGHTBOX PREVIEW MODAL */}
      {lightboxProduct && (
        <div
          id="lightbox"
          className="lightbox active"
          onClick={(e) => {
            if (e.target.id === 'lightbox' || e.target.closest('#lightboxClose')) {
              setLightboxProduct(null);
            }
          }}
        >
          <button id="lightboxClose" className="lightbox-close" aria-label="Close Gallery Lightbox">
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="lightbox-content-wrapper" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--color-white)', borderRadius: '12px', overflow: 'hidden', maxWidth: '850px', width: '90%' }}>
            <div className="product-detail-grid" style={{ gap: 0 }}>
              {/* Image side */}
              <div style={{ maxHeight: '500px', overflow: 'hidden' }}>
                <img
                  src={lightboxProduct.image}
                  alt={lightboxProduct.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Details side */}
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                <div>
                  <span className="section-subtitle" style={{ textAlign: 'left', margin: 0, fontSize: '0.7rem' }}>
                    {lightboxProduct.category} COLLECTION
                  </span>
                  <h4 style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--color-purple-dark)', marginTop: '0.2rem' }}>
                    {lightboxProduct.name}
                  </h4>
                  <p className="card-price" style={{ margin: '0.5rem 0', fontSize: '1.3rem' }}>
                    ₹{lightboxProduct.price}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-charcoal)', lineHeight: 1.6 }}>
                    {lightboxProduct.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                  <button
                    onClick={(e) => handleLightboxAddToCart(e, lightboxProduct)}
                    className="btn btn-primary"
                    style={{ flex: 2, height: '44px', padding: 0 }}
                  >
                    Quick Add <i className="fa-solid fa-cart-shopping" style={{ marginLeft: '6px' }}></i>
                  </button>
                  <button
                    onClick={(e) => handleLightboxPersonalize(e, lightboxProduct)}
                    className="btn btn-secondary"
                    style={{ flex: 1, height: '44px', padding: 0, fontSize: '0.75rem' }}
                  >
                    Customize
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
