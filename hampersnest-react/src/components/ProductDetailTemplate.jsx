import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import ProductCard from './ProductCard';
import PremiumProductGallery from './PremiumProductGallery';
import WishlistButton from './WishlistButton';
import { API_BASE } from '../config.js';

const DEFAULT_DELIVERY_INFO_TEXT = `🚚 Dispatch:
Orders are dispatched within 2–7 business days.

📦 Delivery:
We deliver across India and internationally through trusted courier partners.

⚖️ Shipping Charges:
Delivery charges are calculated based on the higher of the actual weight or volumetric weight, according to courier company guidelines.

🎁 Bulk Orders:
Automatic discounts are applied at checkout:
• 50+ items → 5% OFF
• 100+ items → 10% OFF
• 200+ items → 15% OFF`;

const OLD_DEFAULT_DELIVERY = 'Standard Delivery: 3-5 business days. Express Delivery available at checkout.';

export default function ProductDetailTemplate({ product, displayRelated = [] }) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist, setQuoteModalOpen, settings } = useCart();
  const { formatPrice } = useCurrency();

  const isWishlisted = isInWishlist(product.id);

  // Form States
  const [giftTag, setGiftTag] = useState('');
  const [quantity, setQuantity] = useState(5);
  
  // Variant State
  const defaultVariant = product.variantsEnabled && Array.isArray(product.variants) && product.variants.length > 0 
    ? (product.variants.find(v => v.isDefault) || product.variants[0]) 
    : null;
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  
  const productAddons = Array.isArray(product.customAddons) && product.customAddons.length > 0 
    ? product.customAddons 
    : [
        { name: 'Scented Wax Candle', price: 99 },
        { name: 'Extra Chocolates (Pack of 4)', price: 149 },
        { name: 'Premium Hydration Flask', price: 299 },
        { name: 'Calligraphy Message Card', price: 49 }
      ];

  const [selectedAddOnIndices, setSelectedAddOnIndices] = useState([]);

  // Gallery States
  // Managed by PremiumProductGallery component now
  
  // Reset states on product change
  useEffect(() => {
    setGiftTag('');
    setQuantity(5);
    setSelectedAddOnIndices([]);
    
    if (product?.variantsEnabled && Array.isArray(product?.variants) && product.variants.length > 0) {
      setSelectedVariant(product.variants.find(v => v.isDefault) || product.variants[0]);
    } else {
      setSelectedVariant(null);
    }

    // Track product view in backend database
    if (product?.id) {
      const recordView = async () => {
        try {
          await fetch(`${API_BASE}/api/products/${product.id}/view`, {
            method: 'POST'
          });
        } catch (err) {
          console.warn('View tracking server connection failed:', err);
        }
      };
      recordView();
    }
  }, [product?.id]);

  // Calculate Added Price
  const addedPrice = selectedAddOnIndices.reduce((total, idx) => {
    return total + (productAddons[idx] ? Number(productAddons[idx].price) : 0);
  }, 0);

  const basePrice = selectedVariant ? Number(selectedVariant.price) : product.price;
  const unitPrice = basePrice + addedPrice;

  const effectiveStock = selectedVariant ? Number(selectedVariant.stock) : product.stockQuantity;

  const handleAddToBasket = (e) => {
    e.preventDefault();

    // Gather active add-on names
    const activeAddOns = selectedAddOnIndices.map((idx) => productAddons[idx].name);

    addToCart(product, quantity, {
      giftTag,
      addOns: activeAddOns,
      addedPrice,
      variant: selectedVariant ? { name: selectedVariant.name, price: Number(selectedVariant.price), sku: selectedVariant.sku } : null
    });
  };

  const handleRequestCustomization = () => {
    setQuoteModalOpen(true);
  };

  return (
    <>
      {/* Breadcrumbs & Smart Back Navigation */}
      <div className="breadcrumb-bar">
        <div className="container" style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#777' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'var(--color-gold-dark)' }}>Home</Link> / 
            <Link to="/collections" style={{ color: 'var(--color-gold-dark)' }}>Collections</Link> / 
            <span style={{ color: 'var(--color-purple)' }}>{product.name}</span>
          </div>
          <button 
            onClick={() => {
              if (window.history.length > 2 || (window.history.state && window.history.state.idx > 0)) {
                 navigate(-1);
              } else {
                 const lastVisited = sessionStorage.getItem('last_visited_collection');
                 if (lastVisited) navigate(lastVisited);
                 else navigate('/collections');
              }
            }}
            style={{
              background: 'none',
              border: '1px solid var(--color-gold)',
              padding: '4px 12px',
              borderRadius: '20px',
              color: 'var(--color-gold-dark)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}
          >
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>
        </div>
      </div>

      <div className="container product-detail-section" style={{ paddingTop: '0.5rem' }}>
        <div className="product-detail-layout-grid">
          
          {/* MOBILE ONLY HEADER */}
          <div className="product-header-block mobile-only" style={{ marginBottom: '-1rem' }}>
            <span className="product-category-tag">{(product.subcategoryName || product.categoryName || settings?.categories?.find(c => c.id === product.subCategory)?.label || settings?.categories?.find(c => c.id === product.category)?.label || product.category)} Collection</span>
            <h1 className="product-detail-title">{product.name}</h1>
            
            <div className="product-rating-row">
              <div className="stars-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i
                    key={i}
                    className={i < Math.floor(product.rating || 4.5) ? "fa-solid fa-star" : "fa-regular fa-star"}
                  ></i>
                ))}
              </div>
              <span className="rating-count">({product.rating || 4.5} Rating / Verified Client Reviews)</span>
            </div>
          </div>

          {/* 1. Product Gallery */}
          <div className="product-detail-visual-wrapper">
            <PremiumProductGallery product={product} />
          </div>

          {/* RIGHT COLUMN: Info, Customizations, Actions */}
          <div className="product-detail-info-wrapper">
            {/* 2. Product Header */}
            <div className="product-header-block">
              {/* Desktop Only Title & Rating (Hidden on mobile) */}
              <div className="desktop-only">
                <span className="product-category-tag">{(product.subcategoryName || product.categoryName || settings?.categories?.find(c => c.id === product.subCategory)?.label || settings?.categories?.find(c => c.id === product.category)?.label || product.category)} Collection</span>
              <h1 className="product-detail-title">{product.name}</h1>
              
              <div className="product-rating-row">
                <div className="stars-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i
                      key={i}
                      className={i < Math.floor(product.rating || 4.5) ? "fa-solid fa-star" : "fa-regular fa-star"}
                    ></i>
                  ))}
                </div>
                <span className="rating-count">({product.rating || 4.5} Rating / Verified Client Reviews)</span>
              </div>
              </div>

            <div className="product-trust-badges" style={{ marginTop: '5px', marginBottom: '15px' }}>
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

              <div className="product-price-block" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span className="current-price">{formatPrice(unitPrice)}</span>
                {product.originalPrice > 0 && product.originalPrice > product.price && (
                  <>
                    <span className="original-price">{formatPrice(product.originalPrice)}</span>
                    <span className="save-badge">
                      Save {Math.round(((product.originalPrice - unitPrice) / product.originalPrice) * 100)}%
                    </span>
                  </>
                )}
                
                {/* Compact Inline Stock Status Badge */}
                {effectiveStock === 0 ? (
                  <span className="stock-badge out-of-stock" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#FEE2E2',
                    color: '#991B1B',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    border: '1px solid #FCA5A5',
                    marginLeft: '6px'
                  }}>
                    <i className="fa-solid fa-circle-xmark"></i> Out of Stock
                  </span>
                ) : effectiveStock === 1 ? (
                  <span className="stock-badge critical-stock" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#FEF3C7',
                    color: '#92400E',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    border: '1px solid #FCD34D',
                    marginLeft: '6px'
                  }}>
                    <i className="fa-solid fa-triangle-exclamation"></i> Only 1 Left!
                  </span>
                ) : effectiveStock <= (product.lowStockThreshold || 5) ? (
                  <span className="stock-badge low-stock" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#FEF3C7',
                    color: '#92400E',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    border: '1px solid #FCD34D',
                    marginLeft: '6px'
                  }}>
                    <i className="fa-solid fa-triangle-exclamation"></i> Low Stock ({effectiveStock} left)
                  </span>
                ) : (
                  <span className="stock-badge in-stock" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#DCFCE7',
                    color: '#166534',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    border: '1px solid #86EFAC',
                    marginLeft: '6px'
                  }}>
                    <i className="fa-solid fa-circle-check"></i> In Stock
                  </span>
                )}
              </div>

              {/* Product Size Variants UI */}
              {product.variantsEnabled && Array.isArray(product.variants) && product.variants.length > 0 && (
                <div className="product-variants-container" style={{ marginBottom: '1rem', marginTop: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--color-charcoal)' }}>Select Size:</h4>
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    flexWrap: 'nowrap',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none'
                  }}>
                    {product.variants.map((variant) => {
                      const isSelected = selectedVariant && selectedVariant.id === variant.id;
                      const isOutOfStock = variant.stock === 0;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => !isOutOfStock && setSelectedVariant(variant)}
                          disabled={isOutOfStock}
                          style={{
                            flex: '0 0 auto',
                            width: '120px',
                            height: '80px',
                            borderRadius: '12px',
                            border: `1px solid ${isSelected ? 'var(--color-gold)' : '#e0e0e0'}`,
                            background: isSelected ? 'var(--color-ivory)' : '#fff',
                            color: 'var(--color-charcoal)',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            opacity: isOutOfStock ? 0.5 : 1,
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            boxShadow: isSelected ? '0 4px 15px rgba(200, 169, 107, 0.2)' : '0 2px 5px rgba(0,0,0,0.03)',
                            transform: isSelected ? 'translateY(-2px)' : 'none',
                          }}
                          onMouseEnter={(e) => {
                             if (!isOutOfStock && !isSelected) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)';
                                e.currentTarget.style.borderColor = 'var(--color-gold)';
                             }
                          }}
                          onMouseLeave={(e) => {
                             if (!isOutOfStock && !isSelected) {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.03)';
                                e.currentTarget.style.borderColor = '#e0e0e0';
                             }
                          }}
                        >
                          {isSelected && (
                            <i className="fa-solid fa-check" style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              color: 'var(--color-gold)',
                              fontSize: '0.75rem'
                            }}></i>
                          )}
                          <i className="fa-solid fa-gift" style={{ color: 'var(--color-gold)', marginBottom: '4px', fontSize: '1.1rem' }}></i>
                          <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? '600' : '500', marginBottom: '2px' }}>{variant.name}</span>
                          <span style={{ fontSize: '0.8rem', color: isSelected ? 'var(--color-gold-dark)' : '#666', fontWeight: '500' }}>₹{variant.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Product Description */}
              <p className="product-detail-short-desc">{product.description}</p>
            </div>

            {/* Customization Form */}
            <div className="product-customizer-box">
              
              {/* 1. Minimum Order Quantity */}
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-charcoal)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa-solid fa-circle-info" style={{ color: 'var(--color-gold)' }}></i> Minimum Order Quantity: 5 Pieces
              </div>

              {/* 2. Bulk Discount Card */}
              {settings?.bulkDiscountSettings?.enabled && settings.bulkDiscountSettings.rules?.length > 0 && (
                <div style={{
                  background: '#F9FAFB',
                  border: '1px solid var(--color-gold-light)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    color: 'var(--color-purple)', 
                    fontSize: '0.95rem',
                    textAlign: 'center'
                  }}>
                    {settings.bulkDiscountSettings.heading || '🎉 Bulk Order Discounts'}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px dashed var(--color-beige)', borderBottom: '1px dashed var(--color-beige)', padding: '12px 0', margin: '0 0 12px 0' }}>
                    {[...settings.bulkDiscountSettings.rules].sort((a,b) => a.minQty - b.minQty).map((rule, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4B5563' }}>{rule.minQty}+ Pieces</span>
                        <span style={{ 
                          background: 'var(--color-gold-light)', 
                          color: 'var(--color-gold-dark)', 
                          padding: '2px 10px', 
                          borderRadius: '12px', 
                          fontSize: '0.75rem', 
                          fontWeight: 700 
                        }}>SAVE {rule.discountPercent}%</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>
                    {settings.bulkDiscountSettings.footerNote || '✓ Automatically applied at checkout.'}
                  </p>
                </div>
              )}



              {/* 3. Quantity Selector and Purchase Actions */}
              <div className="action-row-buying" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div className="qty-picker-detail" style={{ height: '48px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(5, quantity - 1))}
                    disabled={effectiveStock === 0 || quantity <= 5}
                    aria-label="Decrease quantity"
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                  <span className="qty-value">{effectiveStock === 0 ? 0 : quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={effectiveStock === 0 || quantity >= effectiveStock}
                    aria-label="Increase quantity"
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToBasket}
                  disabled={effectiveStock === 0}
                  className="btn btn-primary buy-btn-cart"
                  style={{ 
                    flex: 1, 
                    height: '48px', 
                    padding: 0, 
                    minWidth: '150px',
                    background: effectiveStock === 0 ? '#CBD5E1' : 'var(--gold-gradient)',
                    borderColor: effectiveStock === 0 ? '#CBD5E1' : 'var(--color-gold)',
                    color: effectiveStock === 0 ? '#64748B' : 'var(--color-white)',
                    cursor: effectiveStock === 0 ? 'not-allowed' : 'pointer',
                    boxShadow: effectiveStock === 0 ? 'none' : 'var(--shadow-gold)'
                  }}
                >
                  {effectiveStock === 0 ? (
                    'Out of Stock'
                  ) : (
                    <>Add To Cart <i className="fa-solid fa-cart-shopping" style={{ marginLeft: '6px' }}></i></>
                  )}
                </button>

                <WishlistButton productId={product.id} style={{ width: '48px', height: '48px', flexShrink: 0 }} />
              </div>

              </div>
          </div>
        </div>

        {/* --- DESKTOP GRID --- */}
        <div className="product-secondary-info-grid">
          {/* 4. Customization Available */}
          {(() => {
            const custItems = (product.customization && product.customization.length > 0)
              ? product.customization
              : (product.customizationText ? product.customizationText.split('\n').map(i => i.trim()).filter(Boolean) : []);

            if (custItems.length === 0) return null;

            return (
              <div className="secondary-info-card">
                <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-purple)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem', marginTop: 0 }}>
                  Customization Available:
                </h5>
                <div className="modal-features-grid customization-features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {custItems.map((feat, idx) => (
                    <span key={idx} style={{ fontSize: '0.85rem', color: '#555', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                      <i className="fa-solid fa-check" style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '3px' }}></i> {feat}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* 5. Delivery Information */}
          {(() => {
            let infoText = product.deliveryInfoText;
            if (!infoText || infoText.trim() === '' || infoText.trim() === OLD_DEFAULT_DELIVERY) {
              infoText = DEFAULT_DELIVERY_INFO_TEXT;
            }

            const delItems = (product.shipping && product.shipping.length > 0)
              ? product.shipping
              : infoText.split('\n').map(i => i.trim()).filter(Boolean);

            if (delItems.length === 0) return null;

            return (
              <div className="secondary-info-card">
                <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--color-charcoal)' }}>
                  <i className="fa-solid fa-truck" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i> Delivery Information
                </h5>
                {delItems.map((item, idx) => {
                  if (item.startsWith('🚚') || item.startsWith('📦') || item.startsWith('⚖️') || item.startsWith('🎁')) {
                    return (
                      <div key={idx} style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333', marginTop: idx > 0 ? '12px' : '0', marginBottom: '4px' }}>
                        {item}
                      </div>
                    );
                  }
                  return (
                    <div key={idx} style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5', display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--color-gold)' }}>•</span> {item}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* 6. Personalize Your Hamper */}
          {(product.customGiftTagEnabled !== false || product.addonsEnabled !== false || true) && (
            <div className="secondary-info-card">
              <h3 className="customizer-section-title" style={{ fontSize: '1rem' }}>Personalize Your Hamper</h3>
              
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

              {product.addonsEnabled !== false && (
                <div className="customizer-row" style={{ marginTop: '1rem' }}>
                  <label className="customizer-label" style={{ marginBottom: '8px', display: 'block' }}>
                    Optional Add-ons
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                    {productAddons.map((addon, idx) => (
                      <label key={idx} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', color: '#444' }}>
                        <input
                          type="checkbox"
                          checked={selectedAddOnIndices.includes(idx)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAddOnIndices([...selectedAddOnIndices, idx]);
                            } else {
                              setSelectedAddOnIndices(selectedAddOnIndices.filter(i => i !== idx));
                            }
                          }}
                          style={{ marginRight: '8px', width: '16px', height: '16px', accentColor: 'var(--color-gold)' }}
                        />
                        {addon.name} (+{formatPrice(addon.price)})
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleRequestCustomization}
                className="modal-customize-btn"
                style={{ marginTop: 'auto', width: '100%', paddingTop: '12px', paddingBottom: '12px', alignSelf: 'flex-start' }}
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i> Request Customization
              </button>
            </div>
          )}
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
