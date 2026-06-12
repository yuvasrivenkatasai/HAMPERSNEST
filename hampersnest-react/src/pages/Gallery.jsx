import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost')
  ? 'http://localhost:5000'
  : '';

export default function Gallery() {
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isInWishlist } = useCart();
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxItem, setLightboxItem] = useState(null);

  // Fetch dynamic gallery items from backend
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/gallery`);
        if (response.ok) {
          const data = await response.json();
          setGalleryItems(data);
        }
      } catch (err) {
        console.error('Failed to load gallery items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Determine active dataset (dynamic gallery or fallback products)
  const activeDataset = useMemo(() => {
    if (galleryItems.length > 0) {
      return galleryItems;
    }
    return products || [];
  }, [galleryItems, products]);

  // Compute categories dynamically based on active dataset
  const categoriesList = useMemo(() => {
    const distinct = [...new Set(activeDataset.map(item => item.category))];
    // Filter out empty or null categories and sort standard ones first if possible
    const cleanDistinct = distinct.filter(Boolean);
    return ['All', ...cleanDistinct];
  }, [activeDataset]);

  // Filter gallery items by category
  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return activeDataset;
    return activeDataset.filter(item => item.category === activeCategory);
  }, [activeCategory, activeDataset]);

  // Handle escape key closure for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lightboxItem) {
        setLightboxItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxItem]);

  useEffect(() => {
    if (lightboxItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxItem]);

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
  }, [filteredItems]);

  const handleWhatsappInquiry = (e, item) => {
    e.preventDefault();
    const title = item.title || item.name;
    const imageUrl = item.image;
    // Build absolute URL if relative
    let absoluteImageUrl = imageUrl;
    if (imageUrl && imageUrl.startsWith('/')) {
      absoluteImageUrl = window.location.origin + imageUrl;
    }
    const whatsappBaseNumber = '917989202194';
    const welcomeText = encodeURIComponent(`Hi Hampers Nest! I am interested in this event setup style from your showcase: ${title} (${absoluteImageUrl}). Could you please share a customized quote?`);
    window.open(`https://api.whatsapp.com/send?phone=${whatsappBaseNumber}&text=${welcomeText}`, '_blank');
  };

  const handleLightboxAddToCart = (e, product) => {
    e.preventDefault();
    addToCart(product, 1);
    setLightboxItem(null);
  };

  const handleLightboxPersonalize = (e, product) => {
    e.preventDefault();
    setLightboxItem(null);
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
            {categoriesList.map((cat) => (
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

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh', flexDirection: 'column', gap: '10px' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--color-purple)' }}></i>
            <p style={{ color: 'var(--color-charcoal)', fontWeight: 500 }}>Loading dynamic gallery...</p>
          </div>
        ) : (
          /* Gallery Masonry/Grid */
          <div className="gallery-masonry reveal" style={{ marginTop: '0' }}>
            {filteredItems.map((item) => {
              const isProduct = item.price !== undefined;
              const title = item.title || item.name;
              const isWishlisted = isProduct ? isInWishlist(item.id) : false;

              return (
                <div
                  key={item.id || item._id}
                  className="gallery-item"
                  data-title={title}
                  data-desc={item.description}
                  onClick={() => setLightboxItem(item)}
                  style={{ cursor: 'pointer' }}
                >
                  {isProduct && (
                    <div className="card-actions-top" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleWishlist(item.id)}
                        className={`action-icon-btn wishlist-btn ${isWishlisted ? 'active' : ''}`}
                        aria-label="Wishlist toggle"
                      >
                        <i className={isWishlisted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
                      </button>
                    </div>
                  )}
                  
                  <img
                    className="gallery-item-img"
                    src={item.image}
                    alt={title}
                  />

                  <div className="gallery-overlay" onClick={(e) => e.stopPropagation()}>
                    {isProduct ? (
                      <button
                        onClick={() => addToCart(item, 1)}
                        className="card-overlay-btn"
                      >
                        <i className="fa-solid fa-cart-shopping"></i> Add To Cart
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleWhatsappInquiry(e, item)}
                        className="card-overlay-btn"
                        style={{ background: '#25D366', borderColor: '#25D366' }}
                      >
                        <i className="fa-brands fa-whatsapp"></i> Enquire Now
                      </button>
                    )}
                  </div>

                  <div className="gallery-item-info">
                    <h4>{title}</h4>
                    {isProduct ? (
                      <>
                        <p className="card-price">
                          <span className="price-prefix">From </span>₹{item.price}
                        </p>
                        <button
                          className="btn btn-quick-enquiry"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item, 1);
                          }}
                        >
                          ADD TO CART
                        </button>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-charcoal)', marginBottom: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.description || 'Exclusive Custom Design'}
                        </p>
                        <button
                          className="btn btn-quick-enquiry"
                          style={{ background: '#25D366', color: '#fff', borderColor: '#25D366' }}
                          onClick={(e) => handleWhatsappInquiry(e, item)}
                        >
                          <i className="fa-brands fa-whatsapp" style={{ marginRight: '6px' }}></i> WHATSAPP ENQUIRY
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* LIGHTBOX PREVIEW MODAL */}
      {lightboxItem && (
        <div
          id="lightbox"
          className="lightbox active"
          onClick={(e) => {
            if (e.target.id === 'lightbox' || e.target.closest('#lightboxClose')) {
              setLightboxItem(null);
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
                  src={lightboxItem.image}
                  alt={lightboxItem.title || lightboxItem.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Details side */}
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                <div>
                  <span className="section-subtitle" style={{ textAlign: 'left', margin: 0, fontSize: '0.7rem' }}>
                    {lightboxItem.category.toUpperCase()} COLLECTION
                  </span>
                  <h4 style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--color-purple-dark)', marginTop: '0.2rem' }}>
                    {lightboxItem.title || lightboxItem.name}
                  </h4>
                  
                  {lightboxItem.price !== undefined ? (
                    <p className="card-price" style={{ margin: '0.5rem 0', fontSize: '1.3rem' }}>
                      ₹{lightboxItem.price}
                    </p>
                  ) : (
                    <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--color-gold-dark)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      ✨ Custom Design Showcase
                    </p>
                  )}
                  
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-charcoal)', lineHeight: 1.6 }}>
                    {lightboxItem.description || 'This is a custom return gift setup designed by Hampers Nest. Contact our team in Hyderabad to personalize this layout with your custom colors, ribbons, tags, and items according to your budget.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                  {lightboxItem.price !== undefined ? (
                    <>
                      <button
                        onClick={(e) => handleLightboxAddToCart(e, lightboxItem)}
                        className="btn btn-primary"
                        style={{ flex: 2, height: '44px', padding: 0 }}
                      >
                        Quick Add <i className="fa-solid fa-cart-shopping" style={{ marginLeft: '6px' }}></i>
                      </button>
                      <button
                        onClick={(e) => handleLightboxPersonalize(e, lightboxItem)}
                        className="btn btn-secondary"
                        style={{ flex: 1, height: '44px', padding: 0, fontSize: '0.75rem' }}
                      >
                        Customize
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => handleWhatsappInquiry(e, lightboxItem)}
                      className="btn"
                      style={{ flex: 1, height: '48px', background: '#25D366', color: '#fff', fontSize: '0.95rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.25rem' }}></i> Enquire on WhatsApp
                    </button>
                  )}
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
