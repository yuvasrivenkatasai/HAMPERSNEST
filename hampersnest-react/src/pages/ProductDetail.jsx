import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { API_BASE } from '../config.js';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isInWishlist } = useCart();

  // Find current product
  const [localProduct, setLocalProduct] = useState(null);
  const [loadingLocal, setLoadingLocal] = useState(true);

  useEffect(() => {
    const fetchFallback = async () => {
      const productFromContext = products ? products.find((p) => p.id === id) : null;
      if (productFromContext) {
        setLocalProduct(productFromContext);
        setLoadingLocal(false);
        return;
      }

      setLoadingLocal(true);
      try {
        const response = await fetch(`${API_BASE}/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setLocalProduct(data);
        } else {
          setLocalProduct(null);
        }
      } catch (err) {
        console.error(err);
        setLocalProduct(null);
      } finally {
        setLoadingLocal(false);
      }
    };
    fetchFallback();
  }, [id, products]);

  const product = localProduct;

  // Customization States
  const [giftTag, setGiftTag] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState({
    candle: false,
    chocolates: false,
    bottle: false,
    calligraphy: false,
  });
  const [quantity, setQuantity] = useState(1);

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

  // Scroll to top on product change
  useEffect(() => {
    setActiveMediaIndex(0);
    setIsLightboxOpen(false);
    // Reset selections
    setGiftTag('');
    setSelectedAddOns({
      candle: false,
      chocolates: false,
      bottle: false,
      calligraphy: false,
    });
    setQuantity(1);

    // Track product view in backend database
    if (id) {
      const recordView = async () => {
        try {
          await fetch(`${API_BASE}/api/products/${id}/view`, {
            method: 'POST'
          });
        } catch (err) {
          console.warn('View tracking server connection failed:', err);
        }
      };
      recordView();
    }
  }, [id]);

  // IntersectionObserver for scroll animations
  useEffect(() => {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-heading, .reveal-category'
    );
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [id]);


  if (loadingLocal) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--color-gold)' }}></i>
        <p style={{ marginTop: '1rem', color: 'var(--color-gray-text)' }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <SEO title="Product Not Found | Hampers Nest" description="The requested customized gift hamper was not found." />
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: 'var(--color-gold)', marginBottom: '1.5rem' }}></i>
        <h2>Product Not Found</h2>
        <p style={{ margin: '1rem 0 2rem 0', color: '#666' }}>The product you are looking for does not exist or has been moved.</p>
        <Link to="/collections" className="btn btn-primary">Back to Collections</Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  const addOnDetails = {
    candle: { name: 'Scented Wax Candle', price: 99 },
    chocolates: { name: 'Extra Chocolates (Pack of 4)', price: 149 },
    bottle: { name: 'Premium Hydration Flask', price: 299 },
    calligraphy: { name: 'Calligraphy Message Card', price: 49 },
  };

  // Calculate Added Price
  const addedPrice = 
    Object.keys(selectedAddOns).reduce((total, key) => {
      return total + (selectedAddOns[key] ? addOnDetails[key].price : 0);
    }, 0);

  const unitPrice = product.price + addedPrice;
  const totalPrice = unitPrice * quantity;

  // Toggle Accordion Section
  const toggleAccordion = (section) => {
    setAccordions((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle Add to Basket
  const handleAddToBasket = (e) => {
    e.preventDefault();
    
    // Gather active add-on names
    const activeAddOns = Object.keys(selectedAddOns)
      .filter((key) => selectedAddOns[key])
      .map((key) => addOnDetails[key].name);

    addToCart(product, quantity, {
      giftTag,
      addOns: activeAddOns,
      addedPrice,
    });
  };

  // Generate WhatsApp Direct Order Link
  const handleWhatsAppOrder = (e) => {
    e.preventDefault();
    const whatsappBaseNumber = '917989202194';

    // Record direct WhatsApp click analytics to backend
    const recordDirectClick = async () => {
      try {
        await fetch(`${API_BASE}/api/products/${product.id}/click`, {
          method: 'POST'
        });
      } catch (err) {
        console.warn('Click tracking server connection failed:', err);
      }
    };
    recordDirectClick();

    // Build custom description
    let detailsStr = `*${product.name}* (Qty: ${quantity})\n`;
    detailsStr += `• Base Price: ₹${product.price} each\n`;
    
    if (giftTag.trim()) {
      detailsStr += `• Gift Tag Message: "${giftTag.trim()}"\n`;
    }

    const activeAddOns = Object.keys(selectedAddOns)
      .filter((key) => selectedAddOns[key])
      .map((key) => `+ ${addOnDetails[key].name} (₹${addOnDetails[key].price})`);

    if (activeAddOns.length > 0) {
      detailsStr += `• Add-ons:\n   ${activeAddOns.join('\n   ')}\n`;
    }

    detailsStr += `\n*Total Estimated Price:* ₹${totalPrice}`;

    const text = encodeURIComponent(
      `Hi Hampers Nest!\n\nI want to order this customized hamper:\n\n${detailsStr}\n\nPlease confirm availability. Thank you!`
    );

    window.open(`https://api.whatsapp.com/send?phone=${whatsappBaseNumber}&text=${text}`, '_blank');
  };

  // Filter Related Products (Same category, excluding current)
  const relatedProducts = products ? products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3) : [];

  // Fallback to featured products if no same-category items
  const displayRelated = relatedProducts.length > 0 
    ? relatedProducts 
    : (products ? products.filter((p) => p.id !== product.id).slice(0, 3) : []);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images ? product.images.map(img => img.startsWith('http') ? img : window.location.origin + img) : [window.location.origin + product.image],
    "description": product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Hampers Nest"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "LocalBusiness",
        "name": "Hampers Nest"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 4.8,
      "reviewCount": product.rating ? Math.floor(product.rating * 5) : 24
    }
  };

  return (
    <div className="page-container">
      <SEO 
        title={`${product.name} | Customized Gift Hampers Hyderabad | Hampers Nest`}
        description={`${product.description} Customizable packaging, ribbons, and gift tags available. Order directly via WhatsApp.`}
        keywords={`${product.name.toLowerCase()}, custom gift box hyderabad, return gift hampers, hampersnest product, hampersnest ${product.id}`}
        ogImage={product.image}
        schema={productSchema}
      />
      
      {/* FULLSCREEN LIGHTBOX */}
      {isLightboxOpen && (() => {
        const allMedia = [
          { type: 'image', url: product.image },
          ...(product.images || []).map(url => ({ type: 'image', url })),
          ...(product.videoUrls || []).map(url => ({ type: 'video', url }))
        ];
        const activeMedia = allMedia[activeMediaIndex];

        const nextMedia = (e) => {
          e.stopPropagation();
          setActiveMediaIndex((prev) => (prev + 1) % allMedia.length);
        };

        const prevMedia = (e) => {
          e.stopPropagation();
          setActiveMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
        };

        return (
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
        );
      })()}

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
          
          {/* LEFT COLUMN: Large Image Casing & Gallery */}
          <div className="product-detail-visual-wrapper">
            {(() => {
              const allMedia = [
                { type: 'image', url: product.image },
                ...(product.images || []).map(url => ({ type: 'image', url })),
                ...(product.videoUrls || []).map(url => ({ type: 'video', url }))
              ];
              const activeMedia = allMedia[activeMediaIndex] || allMedia[0];

              // Swipe support vars
              let touchStartX = 0;
              const handleTouchStart = (e) => { touchStartX = e.touches[0].clientX; };
              const handleTouchEnd = (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                if (touchStartX - touchEndX > 50) setActiveMediaIndex((p) => (p + 1) % allMedia.length); // Swipe left
                if (touchStartX - touchEndX < -50) setActiveMediaIndex((p) => (p - 1 + allMedia.length) % allMedia.length); // Swipe right
              };

              return (
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
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                      className={`product-detail-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                      aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                    </button>
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
              );
            })()}

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
            <div className="product-header-block">
              <span className="product-category-tag">{product.category} Collection</span>
              <h1 className="product-detail-title">{product.name}</h1>
              
              <div className="product-rating-row">
                <div className="stars-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i
                      key={i}
                      className={i < Math.floor(product.rating) ? "fa-solid fa-star" : "fa-regular fa-star"}
                    ></i>
                  ))}
                </div>
                <span className="rating-count">({product.rating} Rating / Verified Client Reviews)</span>
              </div>

              <div className="product-price-block">
                <span className="current-price">₹{unitPrice}</span>
                {product.originalPrice > 0 && product.originalPrice > product.price && (
                  <>
                    <span className="original-price">₹{product.originalPrice + addedPrice}</span>
                    <span className="save-badge">
                      Save {Math.round((((product.originalPrice + addedPrice) - unitPrice) / (product.originalPrice + addedPrice)) * 100)}%
                    </span>
                  </>
                )}
              </div>

              <p className="product-detail-short-desc">{product.description}</p>
            </div>

            {/* Customization Form */}
            <div className="product-customizer-box">
              <h3 className="customizer-section-title">Personalize Your Hamper</h3>
              <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                {product.customizationText || 'Make your gift extra special by adding a custom gift tag and selecting add-ons.'}
              </p>

              {/* 1. Custom Gift Tag Message */}
              {product.customGiftTagEnabled !== false && (
                <div className="customizer-row">
                  <label className="customizer-label" htmlFor="gift-tag-msg">
                    Custom Gift Tag Message (Optional)
                  </label>
                  <input
                    type="text"
                    id="gift-tag-msg"
                    className="customizer-input-text"
                    placeholder="e.g., Happy Wedding Sneha & Ajay! / Welcome Home"
                    value={giftTag}
                    onChange={(e) => setGiftTag(e.target.value)}
                  />
                </div>
              )}

              {/* 2. Add-ons Checkboxes */}
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
                        <span className="addon-price">+₹{addOnDetails[key].price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector and Purchase Actions */}
              <div className="action-row-buying">
                <div className="qty-picker-detail">
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

                <button
                  type="button"
                  onClick={handleAddToBasket}
                  className="btn btn-primary buy-btn-cart"
                  style={{ flex: 1, height: '48px', padding: 0 }}
                >
                  Add To Basket <i className="fa-solid fa-cart-shopping" style={{ marginLeft: '6px' }}></i>
                </button>
              </div>

              {/* WhatsApp Checkout Button */}
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="btn btn-whatsapp buy-btn-whatsapp"
                style={{ width: '100%', height: '48px', marginTop: '0.8rem', padding: 0 }}
              >
                <i className="fa-brands fa-whatsapp" style={{ marginRight: '6px', fontSize: '1.2rem' }}></i> Order via WhatsApp
              </button>

              {/* Delivery Information Block */}
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#F8F9FA', borderRadius: '8px', border: '1px solid #E9ECEF' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--color-charcoal)' }}>
                  <i className="fa-solid fa-truck" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i> Delivery Information
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', lineHeight: '1.5' }}>
                  {product.deliveryInfoText || 'Standard Delivery: 3-5 business days. Express Delivery available at checkout.'}
                </p>
              </div>
            </div>

            {/* Accordion Tabs */}
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
                          <td><strong>Box Dimensions</strong></td>
                          <td>12" x 10" x 4.5" (Premium Rigid Board)</td>
                        </tr>
                        <tr>
                          <td><strong>Weight</strong></td>
                          <td>Approx. 1.2 kg per box</td>
                        </tr>
                        <tr>
                          <td><strong>Edible Shelf Life</strong></td>
                          <td>60-90 Days (Chocolates & Dry Fruits)</td>
                        </tr>
                        <tr>
                          <td><strong>Storage</strong></td>
                          <td>Store dry items in a cool, dry place. Keep brass away from direct water.</td>
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
                      A: Yes! Please contact us via WhatsApp to customize the specific items inside any hamper.
                      <br /><br />
                      <strong>Q: Do you offer bulk discounts?</strong>
                      <br />
                      A: Yes, we offer special pricing tiers for corporate orders and weddings exceeding 25 units.
                      <br /><br />
                      <strong>Q: Can you print our wedding logo on the box?</strong>
                      <br />
                      A: Yes, we provide custom logo embossing and printing options for bulk orders.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* RELATED PRODUCTS */}
        <div className="related-products-section" style={{ marginTop: '3rem', borderTop: '1px solid var(--color-beige)', paddingTop: '2.5rem' }}>
          <span className="section-subtitle">Customers also viewed</span>
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Related Hampers</h2>
          
          <div className="collections-grid">
            {displayRelated.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>

        {/* SEO Related Keywords Grid Section */}
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
