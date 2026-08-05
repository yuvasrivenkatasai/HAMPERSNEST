import React, { useState, useEffect, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import WishlistButton from './WishlistButton';
import { getPlainTextPreview } from '../utils/FormatUtils';

const ProductCard = memo(({ product, animationDelay = 0 }) => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { formatPrice } = useCurrency();
  const isWishlisted = isInWishlist(product.id);

  // Normalize media list (deduplicate if image is in images array)
  let initialMedia = [];
  if (product.images && product.images.length > 0) {
    initialMedia = [...product.images];
    if (product.image && !initialMedia.includes(product.image)) {
      initialMedia.unshift(product.image);
    }
  } else if (product.image) {
    initialMedia = [product.image];
  } else {
    initialMedia = ['/assets/hero_banner.png'];
  }
  
  const mediaList = initialMedia;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);
  let touchStartX = useRef(0);
  let touchStartY = useRef(0);

  // Auto-slider logic
  const startTimer = () => {
    if (mediaList.length > 1) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % mediaList.length);
      }, 2000); // 2 seconds
    }
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [mediaList.length]);

  const handleNext = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIndex(prev => (prev + 1) % mediaList.length);
    startTimer(); // Reset timer
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIndex(prev => (prev - 1 + mediaList.length) % mediaList.length);
    startTimer(); // Reset timer
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (mediaList.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    // Prevent swipe on vertical scroll
    if (Math.abs(touchStartY.current - touchEndY) > 40) return;

    if (touchStartX.current - touchEndX > 50) {
      setActiveIndex(prev => (prev + 1) % mediaList.length);
      startTimer();
    }
    if (touchStartX.current - touchEndX < -50) {
      setActiveIndex(prev => (prev - 1 + mediaList.length) % mediaList.length);
      startTimer();
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product, 1, {
      giftTag: '',
      wrappingStyle: 'Standard',
      ribbonColor: 'None'
    });
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(product.id);
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    navigate(`/product/${product.id}`);
  };

  return (
    <div 
      className="collection-card reveal-category active"
      style={{ animationDelay: `${animationDelay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="card-img-wrapper" 
        onClick={handleViewDetails} 
        style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Top Right: Wishlist */}
        <WishlistButton productId={product.id} absolute />
        
        {/* Top Left: Multi-image indicator */}
        {mediaList.length > 1 && (
          <span className="card-img-count-badge" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
            <i className="fa-solid fa-images"></i> {mediaList.length}
          </span>
        )}

        {/* Carousel Inner */}
        <div 
          className="card-media-carousel" 
          style={{ 
            display: 'flex', 
            height: '100%', 
            transition: 'transform 0.4s ease-in-out',
            transform: `translateX(-${activeIndex * 100}%)` 
          }}
        >
          {mediaList.map((url, idx) => (
            <div key={idx} className="card-carousel-slide" style={{ minWidth: '100%', height: '100%' }}>
              <img
                src={url}
                alt={`${product.name} - ${idx + 1}`}
                loading={idx === 0 ? "eager" : "lazy"}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          ))}
        </div>

        {/* Desktop Hover Arrows */}
        {mediaList.length > 1 && isHovered && (
          <>
            <button className="card-arrow prev" onClick={handlePrev}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button className="card-arrow next" onClick={handleNext}>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </>
        )}

        {/* Inventory Badge Overlay */}
        {product.stockQuantity === 0 ? (
          <span className="card-stock-badge out-of-stock" style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'rgba(220, 38, 38, 0.95)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '50px',
            fontSize: '0.68rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            zIndex: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            Out of Stock
          </span>
        ) : product.stockQuantity <= (product.lowStockThreshold || 5) ? (
          <span className="card-stock-badge low-stock" style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'rgba(217, 119, 6, 0.95)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '50px',
            fontSize: '0.68rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            zIndex: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            Only {product.stockQuantity} Left
          </span>
        ) : null}
        
        <div className="card-overlay" onClick={(e) => e.stopPropagation()}>
          {product.stockQuantity === 0 ? (
            <button className="card-overlay-btn" disabled style={{ background: '#64748b', color: '#cbd5e1', cursor: 'not-allowed' }}>
              Out of Stock
            </button>
          ) : (
            <button onClick={handleAddToCart} className="card-overlay-btn">
              <i className="fa-solid fa-cart-shopping"></i> Add To Cart
            </button>
          )}
        </div>
      </div>
      <div className="card-content">
        <h3 className="card-title" onClick={handleViewDetails} style={{ cursor: 'pointer' }}>
          {product.name}
        </h3>
        <p className="card-price">
          <span className="price-prefix">From </span>{formatPrice(product.price)}
        </p>
        <p className="card-desc" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {getPlainTextPreview(product.shortDescription || product.description) || <span style={{ visibility: 'hidden' }}>&nbsp;</span>}
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            onClick={handleViewDetails}
            className="card-link btn btn-secondary btn-quick-enquiry"
            style={{ flex: 1, padding: '0.5rem 0.8rem', fontSize: '0.75rem' }}
          >
            View Details <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
