import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import ProductCard from './ProductCard';
import PremiumProductGallery from './PremiumProductGallery';
import { API_BASE } from '../config.js';

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
              const lastVisited = sessionStorage.getItem('last_visited_collection');
              if (lastVisited) navigate(lastVisited);
              else navigate('/collections');
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
          
          {/* 1. Product Gallery */}
          <div className="product-detail-visual-wrapper">
            <PremiumProductGallery product={product} />

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
                <div className="product-variants-container" style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--color-charcoal)' }}>Select Size:</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {product.variants.map((variant) => {
                      const isSelected = selectedVariant && selectedVariant.id === variant.id;
                      const isOutOfStock = variant.stock === 0;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => !isOutOfStock && setSelectedVariant(variant)}
                          disabled={isOutOfStock}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '50px',
                            border: `2px solid ${isSelected ? 'var(--color-gold)' : '#e0e0e0'}`,
                            background: isSelected ? 'var(--color-gold-light)' : '#fff',
                            color: isSelected ? 'var(--color-charcoal)' : '#555',
                            fontWeight: isSelected ? '600' : '500',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            opacity: isOutOfStock ? 0.5 : 1,
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            minWidth: '80px'
                          }}
                        >
                          <span>{variant.name}</span>
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
              {/* 4. Customization Available */}
              {(() => {
                const custItems = (product.customization && product.customization.length > 0)
                  ? product.customization
                  : (product.customizationText ? product.customizationText.split('\n').map(i => i.trim()).filter(Boolean) : []);

                if (custItems.length === 0) return null;

                return (
                  <div style={{ paddingBottom: '0.8rem', borderBottom: '1px solid var(--color-beige)' }}>
                    <h5 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-purple)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                      Customization Available:
                    </h5>
                    <div className="modal-features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {custItems.map((feat, idx) => (
                        <span key={idx} style={{ fontSize: '0.85rem', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className="fa-solid fa-check" style={{ color: 'var(--color-gold)' }}></i> {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 5. Delivery Information */}
              {(() => {
                const delItems = (product.shipping && product.shipping.length > 0)
                  ? product.shipping
                  : (product.deliveryInfoText ? product.deliveryInfoText.split('\n').map(i => i.trim()).filter(Boolean) : []);

                if (delItems.length === 0) return null;

                return (
                  <div style={{ padding: '0.85rem', background: '#F8F9FA', borderRadius: '8px', border: '1px solid #E9ECEF' }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--color-charcoal)' }}>
                      <i className="fa-solid fa-truck" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i> Delivery Information
                    </h5>
                    {delItems.map((item, idx) => (
                      <div key={idx} style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5', display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                        <i className="fa-solid fa-truck-fast" style={{ fontSize: '0.75rem', marginTop: '4px', color: '#999' }}></i> {item}
                      </div>
                    ))}
                  </div>
                );
              })()}

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

              {/* Add-ons Selection */}
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
              {/* Quantity Selector and Purchase Actions */}
              <div className="action-row-buying" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                {/* 7. Quantity Selector */}
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

                {/* 8. Add To Cart Button */}
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
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-charcoal)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa-solid fa-circle-info" style={{ color: 'var(--color-gold)' }}></i> Minimum Order Quantity: 5 Pieces
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
