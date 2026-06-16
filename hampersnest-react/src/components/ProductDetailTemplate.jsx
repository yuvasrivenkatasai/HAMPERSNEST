import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import ProductCard from './ProductCard';

export default function ProductDetailTemplate({ product, displayRelated = [] }) {
  const { addToCart, toggleWishlist, isInWishlist, setQuoteModalOpen } = useCart();
  const { formatPrice } = useCurrency();

  const isWishlisted = isInWishlist(product.id);

  // Form States
  const [giftTag, setGiftTag] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState({
    candle: false,
    chocolates: false,
    bottle: false,
    calligraphy: false,
  });

  // Gallery States
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Accordion Toggles
  const [accordions, setAccordions] = useState({
    inclusions: true,
    specs: false,
    shipping: false,
    faqs: false,
  });

  // Reset states on product change
  useEffect(() => {
    setActiveMediaIndex(0);
    setIsLightboxOpen(false);
    setGiftTag('');
    setSelectedAddOns({
      candle: false,
      chocolates: false,
      bottle: false,
      calligraphy: false,
    });
    setQuantity(1);
  }, [product.id]);

  const addOnDetails = {
    candle: { name: 'Scented Wax Candle', price: 99 },
    chocolates: { name: 'Extra Chocolates (Pack of 4)', price: 149 },
    bottle: { name: 'Premium Hydration Flask', price: 299 },
    calligraphy: { name: 'Calligraphy Message Card', price: 49 },
  };

  // Calculate Added Price
  const addedPrice = Object.keys(selectedAddOns).reduce((total, key) => {
    return total + (selectedAddOns[key] ? addOnDetails[key].price : 0);
  }, 0);

  const unitPrice = product.price + addedPrice;

  const toggleAccordion = (section) => {
    setAccordions((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddToBasket = (e) => {
    e.preventDefault();
    const activeAddOns = Object.keys(selectedAddOns)
      .filter((key) => selectedAddOns[key])
      .map((key) => addOnDetails[key].name);

    addToCart(product, quantity, {
      giftTag,
      addOns: activeAddOns,
      addedPrice,
    });
  };

  const handleRequestCustomization = () => {
    setQuoteModalOpen(true);
  };

  const allMedia = [
    { type: 'image', url: product.image },
    ...(product.images || []).map(url => ({ type: 'image', url })),
    ...(product.videoUrls || []).map(url => ({ type: 'video', url }))
  ];
  const activeMedia = allMedia[activeMediaIndex] || allMedia[0];

  let touchStartX = 0;
  const handleTouchStart = (e) => { touchStartX = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchStartX - touchEndX > 50) setActiveMediaIndex((p) => (p + 1) % allMedia.length); // Swipe left
    if (touchStartX - touchEndX < -50) setActiveMediaIndex((p) => (p - 1 + allMedia.length) % allMedia.length); // Swipe right
  };

  const nextMedia = (e) => {
    e.stopPropagation();
    setActiveMediaIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevMedia = (e) => {
    e.stopPropagation();
    setActiveMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  return (
    <>
      {/* FULLSCREEN LIGHTBOX */}
      {isLightboxOpen && (
        <div className="gallery-lightbox active" onClick={() => setIsLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setIsLightboxOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="lightbox-content-wrapper" onClick={e => e.stopPropagation()}>
            {activeMedia.type === 'image' ? (
              <img src={activeMedia.url} alt={product.name} className="lightbox-media" />
            ) : (
              <video src={activeMedia.url} controls autoPlay className="lightbox-media" />
            )}
          </div>
          {allMedia.length > 1 && (
            <>
              <button className="lightbox-prev" onClick={prevMedia}>
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button className="lightbox-next" onClick={nextMedia}>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </>
          )}
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="breadcrumb-bar">
        <div className="container" style={{ padding: '15px 16px', display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#777' }}>
          <Link to="/" style={{ color: 'var(--color-gold-dark)' }}>Home</Link> / 
          <Link to="/collections" style={{ color: 'var(--color-gold-dark)' }}>Collections</Link> / 
          <span style={{ color: 'var(--color-purple)' }}>{product.name}</span>
        </div>
      </div>

      <div className="container product-detail-section" style={{ paddingTop: '1rem' }}>
        <div className="product-detail-layout-grid">
          
          {/* 1. Product Gallery */}
          <div className="product-detail-visual-wrapper">
            <div className="product-media-gallery">
              {/* Main Active Media */}
              <div 
                className="product-image-container-frame" 
                onClick={() => setIsLightboxOpen(true)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                style={{ cursor: 'zoom-in' }}
              >
                {activeMedia.type === 'image' ? (
                  <img src={activeMedia.url} alt={product.name} className="product-main-zoom-image" />
                ) : (
                  <video src={activeMedia.url} controls muted className="product-main-zoom-image" style={{ objectFit: 'contain', background: '#000' }} />
                )}
                
                {activeMedia.type === 'video' && !isLightboxOpen && (
                  <div className="video-play-indicator">
                    <i className="fa-solid fa-play"></i>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allMedia.length > 1 && (
                <div className="media-thumbnails">
                  {allMedia.map((media, idx) => (
                    <div 
                      key={idx} 
                      className={`thumbnail-item ${idx === activeMediaIndex ? 'active' : ''}`}
                      onClick={() => setActiveMediaIndex(idx)}
                    >
                      {media.type === 'image' ? (
                        <img src={media.url} alt={`Thumbnail ${idx}`} />
                      ) : (
                        <div className="video-thumbnail">
                          <video src={media.url} />
                          <i className="fa-solid fa-play"></i>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="product-trust-badges" style={{ marginTop: '20px' }}>
              <div className="trust-badge-item">
                <i className="fa-solid fa-truck-fast"></i>
                <span>Fast Shipping</span>
              </div>
              <div className="trust-badge-item">
                <i className="fa-solid fa-gift"></i>
                <span>Premium Quality</span>
              </div>
              <div className="trust-badge-item">
                <i className="fa-solid fa-lock"></i>
                <span>Secure Packing</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Info, Customizations, Actions */}
          <div className="product-detail-info-wrapper">
            {/* 2. Product Header */}
            <div className="product-header-block">
              <span className="product-category-tag">{product.category} Collection</span>
              <h1 className="product-detail-title">{product.name}</h1>
              
              <div className="product-rating-row">
                <div className="stars-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i
                      key={i}
                      className={i < Math.floor(product.rating || 5) ? "fa-solid fa-star" : "fa-regular fa-star"}
                    ></i>
                  ))}
                </div>
                <span className="rating-count">({product.rating || 5.0} Rating / Verified Client Reviews)</span>
              </div>

              <div className="product-price-block">
                <span className="current-price">{formatPrice(unitPrice)}</span>
                {product.originalPrice > 0 && product.originalPrice > product.price && (
                  <>
                    <span className="original-price">{formatPrice(product.originalPrice + addedPrice)}</span>
                    <span className="save-badge">
                      Save {Math.round((((product.originalPrice + addedPrice) - unitPrice) / (product.originalPrice + addedPrice)) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {/* 3. Product Description */}
              <p className="product-detail-short-desc">{product.description}</p>
            </div>

            {/* Customization Form */}
            <div className="product-customizer-box">
              {/* 4. Customization Available */}
              {product.customization && product.customization.length > 0 && (
                <div style={{ marginBottom: '1.2rem', paddingBottom: '1.2rem', borderBottom: '1px solid var(--color-beige)' }}>
                  <h5 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-purple)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                    Customization Available:
                  </h5>
                  <div className="modal-features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {product.customization.map((feat, idx) => (
                      <span key={idx} style={{ fontSize: '0.85rem', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-check" style={{ color: 'var(--color-gold)' }}></i> {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Delivery Information */}
              {product.shipping && product.shipping.length > 0 && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#F8F9FA', borderRadius: '8px', border: '1px solid #E9ECEF' }}>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--color-charcoal)' }}>
                    <i className="fa-solid fa-truck" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i> Delivery Information
                  </h5>
                  {product.shipping.map((item, idx) => (
                    <div key={idx} style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5', display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                      <i className="fa-solid fa-truck-fast" style={{ fontSize: '0.75rem', marginTop: '4px', color: '#999' }}></i> {item}
                    </div>
                  ))}
                </div>
              )}

              <h3 className="customizer-section-title">Personalize Your Hamper</h3>

              {/* 6. Personalize Your Hamper */}
              {product.customGiftTagEnabled !== false && (
                <div className="customizer-row">
                  <label className="customizer-label" htmlFor="gift-tag-msg">
                    Custom Gift Tag Message (Optional)
                  </label>
                  <input
                    type="text"
                    id="gift-tag-msg"
                    className="customizer-input-text"
                    placeholder="e.g. Happy Wedding Sneha & Ajay! / Welcome Home"
                    value={giftTag}
                    onChange={(e) => setGiftTag(e.target.value)}
                  />
                </div>
              )}

              {/* Add-ons Checkboxes */}
              {product.addonsEnabled !== false && (
                <div className="customizer-row" style={{ marginTop: '1.2rem' }}>
                  <label className="customizer-label">Enhance with Add-ons (Optional)</label>
                  <div className="addons-grid-check">
                    {Object.keys(addOnDetails).map((key) => (
                      <label key={key} className={`addon-checkbox-card ${selectedAddOns[key] ? 'active' : ''}`}>
                        <input
                          type="checkbox"
                          checked={selectedAddOns[key]}
                          onChange={(e) =>
                            setSelectedAddOns((prev) => ({
                              ...prev,
                              [key]: e.target.checked,
                            }))
                          }
                        />
                        <span className="addon-name">{addOnDetails[key].name}</span>
                        <span className="addon-price">+{formatPrice(addOnDetails[key].price)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector and Purchase Actions */}
              <div className="action-row-buying" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                {/* 7. Quantity Selector */}
                <div className="qty-picker-detail" style={{ height: '48px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>

                {/* 8. Add To Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToBasket}
                  className="btn btn-primary buy-btn-cart"
                  style={{ flex: 1, height: '48px', padding: 0, minWidth: '150px' }}
                >
                  Add To Cart <i className="fa-solid fa-cart-shopping" style={{ marginLeft: '6px' }}></i>
                </button>

                {/* 9. Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`btn btn-secondary ${isWishlisted ? 'active' : ''}`}
                  style={{
                    width: '48px',
                    height: '48px',
                    padding: 0,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: isWishlisted ? '#e24e4e' : 'var(--color-gold)',
                    color: isWishlisted ? '#e24e4e' : 'var(--color-gold)',
                    flexShrink: 0
                  }}
                  aria-label="Toggle Wishlist"
                >
                  <i className={isWishlisted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
                </button>
              </div>

              {/* 10. Request Customization Button */}
              <button
                type="button"
                onClick={handleRequestCustomization}
                className="modal-customize-btn"
                style={{ marginTop: '1rem', width: '100%' }}
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i> Request Customization
              </button>
            </div>

            {/* Accordion Tabs */}
            {product.details && product.details.length > 0 && (
              <div className="product-accordions-group">
                
                {/* Inclusions */}
                <div className={`accordion-item ${accordions.inclusions ? 'open' : ''}`}>
                  <button className="accordion-header" onClick={() => toggleAccordion('inclusions')}>
                    <span>Hamper Inclusions</span>
                    <i className={`fa-solid ${accordions.inclusions ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                  </button>
                  {accordions.inclusions && (
                    <div className="accordion-content">
                      <ul className="details-list-check">
                        {product.details.map((detail, idx) => (
                          <li key={idx}>
                            <i className="fa-solid fa-check text-gold"></i> {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Specifications */}
                <div className={`accordion-item ${accordions.specs ? 'open' : ''}`}>
                  <button className="accordion-header" onClick={() => toggleAccordion('specs')}>
                    <span>Specifications</span>
                    <i className={`fa-solid ${accordions.specs ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                  </button>
                  {accordions.specs && (
                    <div className="accordion-content">
                      <table className="specs-table">
                        <tbody>
                          <tr>
                            <td><strong>Category</strong></td>
                            <td>{product.category} Return Gift Hamper</td>
                          </tr>
                          <tr>
                            <td><strong>Storage</strong></td>
                            <td>Store dry items in a cool, dry place.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* FAQs */}
                <div className={`accordion-item ${accordions.faqs ? 'open' : ''}`}>
                  <button className="accordion-header" onClick={() => toggleAccordion('faqs')}>
                    <span>Frequently Asked Questions</span>
                    <i className={`fa-solid ${accordions.faqs ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                  </button>
                  {accordions.faqs && (
                    <div className="accordion-content">
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--color-charcoal)' }}>
                        <strong>Q: Can I replace items in the hamper?</strong>
                        <br />
                        A: Yes! Please contact us via WhatsApp to customize.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

        {/* 11. Related Products */}
        {displayRelated && displayRelated.length > 0 && (
          <div className="related-products-section" style={{ marginTop: '3rem', borderTop: '1px solid var(--color-beige)', paddingTop: '2.5rem' }}>
            <span className="section-subtitle">Customers also viewed</span>
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Related Hampers</h2>
            
            <div className="collections-grid">
              {displayRelated.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
