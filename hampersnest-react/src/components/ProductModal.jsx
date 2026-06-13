import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import ImageGallery from './ImageGallery';

export default function ProductModal() {
  const {
    selectedProductForModal,
    setSelectedProductForModal,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuoteModalOpen,
  } = useCart();
  const { formatPrice } = useCurrency();

  const [quantity, setQuantity] = useState(1);
  const [giftTag, setGiftTag] = useState('');
  const [wrappingStyle, setWrappingStyle] = useState('Standard');
  const [ribbonColor, setRibbonColor] = useState('None');
  const [activeThumb, setActiveThumb] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);

  // Reset form states when product changes
  useEffect(() => {
    if (selectedProductForModal) {
      setQuantity(1);
      setGiftTag('');
      setWrappingStyle('Standard');
      setRibbonColor('None');
      setActiveThumb(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProductForModal]);

  // Handle Escape key closure
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedProductForModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedProductForModal]);

  if (!selectedProductForModal) return null;

  const product = selectedProductForModal;
  const isWishlisted = isInWishlist(product.id);

  // Build media list (images + videos)
  const mediaList = product.images && product.images.length > 0
    ? [...product.images, ...(product.videos || [])]
    : [product.image];

  const isVideo = (src) =>
    typeof src === 'string' && (src.endsWith('.mp4') || src.endsWith('.webm'));

  const handleClose = () => {
    setSelectedProductForModal(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('product-modal')) {
      handleClose();
    }
  };

  const handleAddToCartSubmit = (e) => {
    e.preventDefault();
    addToCart(product, quantity, { giftTag, wrappingStyle, ribbonColor });
    handleClose();
  };

  const handleWhatsappOrder = () => {
    const whatsappNumber = '917989202194';
    const message = encodeURIComponent(
      `Hi Hampers Nest! I would like to order:\n\n` +
      `*${product.name}*\n` +
      `Qty: ${quantity}\n` +
      `Price: ${formatPrice(product.price * quantity)}\n\n` +
      (giftTag ? `Gift Tag Message: "${giftTag}"\n` : '') +
      (wrappingStyle !== 'Standard' ? `Wrapping: ${wrappingStyle}\n` : '') +
      (ribbonColor !== 'None' ? `Ribbon: ${ribbonColor}\n` : '') +
      `\nPlease confirm availability and delivery details. Thank you!`
    );
    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`, '_blank');
    handleClose();
  };

  const handleRequestCustomization = () => {
    handleClose();
    setQuoteModalOpen(true);
  };

  return (
    <>
      <div
        className="inquiry-modal active"
        onClick={handleBackdropClick}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '20px 10px' }}
      >
        <div
          className="inquiry-modal-content"
          style={{
            maxWidth: '940px',
            width: '100%',
            margin: 'auto',
            transform: 'none',
            opacity: 1,
            animation: 'heroZoomIn 0.3s ease forwards',
            padding: '2rem'
          }}
        >
          <button
            onClick={handleClose}
            className="inquiry-modal-close"
            aria-label="Close Product Details"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          <div className="product-detail-grid">
            {/* Left Column: Multi-Image Gallery Panel */}
            <div className="product-detail-images">
              {/* Main Image */}
              <div
                className="product-main-img-wrapper"
                onClick={() => setGalleryOpen(true)}
                title="Click to view fullscreen"
              >
                {isVideo(mediaList[activeThumb]) ? (
                  <video
                    src={mediaList[activeThumb]}
                    className="product-main-img"
                    muted
                    playsInline
                    style={{ objectFit: 'cover', width: '100%', borderRadius: '12px' }}
                  />
                ) : (
                  <img
                    src={mediaList[activeThumb]}
                    alt={product.name}
                    className="product-main-img"
                  />
                )}
                <div className="product-img-zoom-hint">
                  <i className="fa-solid fa-magnifying-glass-plus"></i> Click to zoom
                </div>
              </div>

              {/* Thumbnail Strip */}
              {mediaList.length > 1 && (
                <div className="product-thumb-strip">
                  {mediaList.map((src, idx) => (
                    <button
                      key={idx}
                      className={`product-thumb ${idx === activeThumb ? 'active' : ''}`}
                      onClick={() => setActiveThumb(idx)}
                      aria-label={`View ${isVideo(src) ? 'video' : 'image'} ${idx + 1}`}
                    >
                      {isVideo(src) ? (
                        <div className="product-thumb-video">
                          <i className="fa-solid fa-circle-play"></i>
                        </div>
                      ) : (
                        <img src={src} alt={`${product.name} view ${idx + 1}`} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Details and Customization Form */}
            <div className="product-info-block">
              <div>
                {/* Category + Availability */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span className="section-subtitle" style={{ textAlign: 'left', margin: 0, fontSize: '0.7rem' }}>
                    {product.category} COLLECTION
                  </span>
                  <span className="modal-availability">
                    <i className="fa-solid fa-circle-check"></i> In Stock
                  </span>
                </div>

                <h2 className="product-modal-title">{product.name}</h2>

                {/* Star Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 10px 0' }}>
                  <div style={{ color: 'var(--color-gold)', fontSize: '0.9rem' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i
                        key={i}
                        className={i < Math.floor(product.rating) ? 'fa-solid fa-star' : 'fa-regular fa-star'}
                        style={{ marginRight: '2px' }}
                      ></i>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>({product.rating} / 5.0)</span>
                </div>

                {/* Price — currency-aware */}
                <p className="product-modal-price">{formatPrice(product.price)}</p>

                <p className="product-modal-desc">{product.description}</p>
              </div>

              {/* Hamper Inclusions */}
              {product.details && product.details.length > 0 && (
                <ul className="product-modal-spec">
                  <li style={{ fontWeight: 600, listStyle: 'none', paddingLeft: 0, color: 'var(--color-purple)' }}>
                    Hamper Inclusions:
                  </li>
                  {product.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              )}

              {/* Customization Features */}
              {product.customization && (
                <div>
                  <h5 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-purple)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                    Customization Available:
                  </h5>
                  <div className="modal-features-grid">
                    {product.customization.map((feat, idx) => (
                      <span key={idx} className="modal-feature-tag">
                        <i className="fa-solid fa-check"></i> {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Info */}
              {product.shipping && (
                <div style={{ borderTop: '1px solid var(--color-beige)', paddingTop: '0.8rem' }}>
                  <h5 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-purple)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                    Delivery Information:
                  </h5>
                  {product.shipping.map((item, idx) => (
                    <div key={idx} className="modal-shipping-row">
                      <i className="fa-solid fa-truck"></i>
                      {item}
                    </div>
                  ))}
                </div>
              )}

              {/* Customization Form */}
              <form onSubmit={handleAddToCartSubmit} className="customization-section">
                <h4 className="customization-title">Personalize Your Hamper</h4>

                <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                  <label className="form-label" htmlFor="m-gift-tag">
                    Custom Gift Tag Message (Optional)
                  </label>
                  <input
                    type="text"
                    id="m-gift-tag"
                    className="form-input"
                    placeholder="e.g. Happy Wedding Sneha & Ajay! / Welcome Home"
                    value={giftTag}
                    onChange={(e) => setGiftTag(e.target.value)}
                  />
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '0.8rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="m-wrap">Wrapping Style</label>
                    <select
                      id="m-wrap"
                      className="form-select"
                      value={wrappingStyle}
                      onChange={(e) => setWrappingStyle(e.target.value)}
                    >
                      <option value="Standard">Standard (Eco-craft box)</option>
                      <option value="Ivory Lace">Premium Ivory Lace Ribbon</option>
                      <option value="Royal Purple Silk">Royal Purple Silk Wrapper</option>
                      <option value="Gold Glare Foil">Gold Glare Metallic Foil</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="m-ribbon">Satin Ribbon Color</label>
                    <select
                      id="m-ribbon"
                      className="form-select"
                      value={ribbonColor}
                      onChange={(e) => setRibbonColor(e.target.value)}
                    >
                      <option value="None">None (Default Jute Rope)</option>
                      <option value="Metallic Gold">Metallic Gold Ribbon</option>
                      <option value="Lavender Lace">Lavender Lace Ribbon</option>
                      <option value="Royal Violet">Royal Violet Silk Ribbon</option>
                      <option value="Red Velvet">Red Velvet Ribbon</option>
                    </select>
                  </div>
                </div>

                {/* Quantity + Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderTop: '1px solid var(--color-beige)',
                    paddingTop: '1.2rem',
                    marginTop: '0.5rem',
                    flexWrap: 'wrap'
                  }}
                >
                  {/* Quantity Selector */}
                  <div className="cart-item-qty" style={{ height: '44px', border: '1px solid var(--color-gold)', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ width: '36px', height: '44px' }}
                      aria-label="Decrease quantity"
                    >
                      <i className="fa-solid fa-minus"></i>
                    </button>
                    <span style={{ fontSize: '1rem', minWidth: '28px', textAlign: 'center' }}>{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      style={{ width: '36px', height: '44px' }}
                      aria-label="Increase quantity"
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>

                  {/* Add To Cart */}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1, height: '44px', padding: 0, minWidth: '130px' }}
                  >
                    Add To Cart <i className="fa-solid fa-cart-shopping" style={{ marginLeft: '6px' }}></i>
                  </button>

                  {/* Order on WhatsApp */}
                  <button
                    type="button"
                    onClick={handleWhatsappOrder}
                    className="modal-whatsapp-btn"
                    style={{ flexShrink: 0 }}
                  >
                    <i className="fa-brands fa-whatsapp"></i>
                    Order on WhatsApp
                  </button>

                  {/* Wishlist */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className={`btn btn-secondary ${isWishlisted ? 'active' : ''}`}
                    style={{
                      width: '44px',
                      height: '44px',
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

                {/* Request Customization */}
                <button
                  type="button"
                  onClick={handleRequestCustomization}
                  className="modal-customize-btn"
                  style={{ marginTop: '0.8rem', width: '100%' }}
                >
                  <i className="fa-solid fa-wand-magic-sparkles"></i> Request Customization
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Gallery */}
      {galleryOpen && (
        <ImageGallery
          media={mediaList}
          startAt={activeThumb}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </>
  );
}
