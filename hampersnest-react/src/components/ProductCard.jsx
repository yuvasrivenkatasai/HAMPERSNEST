import React, { useState, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import WishlistButton from './WishlistButton';
import './ProductCard.css';

// Utility to detect UUID or raw database ID strings
const isRawId = (str) => {
  if (!str || typeof str !== 'string') return true;
  const trimmed = str.trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) return true;
  if (/^[0-9a-f]{24}$/i.test(trimmed)) return true;
  if (trimmed.length > 20 && !trimmed.includes(' ') && /^[a-z0-9_-]+$/i.test(trimmed)) return true;
  return false;
};

export const getDisplayCategory = (prod) => {
  if (!prod) return 'Curated Hamper';

  // 1. Subcategory name (e.g. 'Half Saree Return Gifts', 'German Silver', 'Anniversary Gifts')
  if (prod.subcategoryName && !isRawId(prod.subcategoryName)) {
    return prod.subcategoryName;
  }

  // 2. Category name (e.g. 'Traditional Ceremonies', 'Weddings', 'Housewarming', 'Festive Hampers')
  if (prod.categoryName && !isRawId(prod.categoryName)) {
    return prod.categoryName;
  }

  // 3. allCategoryNames array
  if (Array.isArray(prod.allCategoryNames)) {
    const found = prod.allCategoryNames.find(c => !isRawId(c));
    if (found) return found;
  }

  // 4. categoryAssignments array
  if (Array.isArray(prod.categoryAssignments) && prod.categoryAssignments.length > 0) {
    for (const assignment of prod.categoryAssignments) {
      if (assignment.subcategoryName && !isRawId(assignment.subcategoryName)) {
        return assignment.subcategoryName;
      }
      if (assignment.categoryName && !isRawId(assignment.categoryName)) {
        return assignment.categoryName;
      }
    }
  }

  // 5. category string if not a raw UUID/ID
  if (prod.category && !isRawId(prod.category)) {
    return prod.category;
  }

  return 'Curated Hamper';
};

const ProductCard = memo(({ product, animationDelay = 0 }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

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
  let touchStartX = useRef(0);
  let touchStartY = useRef(0);

  // Clean hover behavior: reveal secondary product angle on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (mediaList.length > 1) {
      setActiveIndex(1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setActiveIndex(0);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIndex(prev => (prev + 1) % mediaList.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIndex(prev => (prev - 1 + mediaList.length) % mediaList.length);
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
    }
    if (touchStartX.current - touchEndX < -50) {
      setActiveIndex(prev => (prev - 1 + mediaList.length) % mediaList.length);
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

  const handleViewDetails = (e) => {
    e.preventDefault();
    navigate(`/product/${product.id}`);
  };

  // Calculate discount percentage if originalPrice exists
  const discountPercent = (product.originalPrice && product.originalPrice > product.price)
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // Extract up to 2 micro-chips from tags
  const featureChips = (product.tags && product.tags.length > 0)
    ? product.tags.slice(0, 2).map(tag => tag.replace(/[-_]/g, ' '))
    : [];

  return (
    <div 
      className="collection-card product-card-modern reveal-category active"
      style={{ animationDelay: `${animationDelay}ms` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Media / Image Wrapper */}
      <div 
        className="card-img-wrapper" 
        onClick={handleViewDetails} 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Right: Wishlist Luxury Button */}
        <WishlistButton productId={product.id} absolute />
        
        {/* Top Left: Badges Dock (Bestseller & Customizable) */}
        <div className="card-badges-dock">
          {(product.featured || product.isBestseller) && (
            <span className="card-badge bestseller">
              <i className="fa-solid fa-star" style={{ fontSize: '0.6rem', marginRight: '2px' }}></i> Bestseller
            </span>
          )}
          {product.customizable !== false && (
            <span className="card-badge customizable">
              <i className="fa-solid fa-sliders" style={{ fontSize: '0.6rem', marginRight: '2px' }}></i> Customizable
            </span>
          )}
        </div>

        {/* Carousel Slides */}
        <div 
          className="card-media-carousel" 
          style={{ 
            transform: `translateX(-${activeIndex * 100}%)` 
          }}
        >
          {mediaList.map((url, idx) => (
            <div key={idx} className="card-carousel-slide">
              <img
                src={url}
                alt={`${product.name} - ${idx + 1}`}
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Interactive Pagination Dots (When multiple images exist) */}
        {mediaList.length > 1 && (
          <div className="card-carousel-dots" onClick={(e) => e.stopPropagation()}>
            {mediaList.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`card-dot ${idx === activeIndex ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setActiveIndex(idx);
                }}
                aria-label={`View photo angle ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Desktop Hover Arrows */}
        {mediaList.length > 1 && isHovered && (
          <>
            <button className="card-arrow prev" onClick={handlePrev} aria-label="Previous angle">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button className="card-arrow next" onClick={handleNext} aria-label="Next angle">
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
            padding: '3px 8px',
            borderRadius: '50px',
            fontSize: '0.64rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
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
            padding: '3px 8px',
            borderRadius: '50px',
            fontSize: '0.64rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            Only {product.stockQuantity} Left
          </span>
        ) : null}
      </div>

      {/* Card Content Area */}
      <div className="card-content">
        <div>
          {/* Header Row: Category, Rating Header Pill, and Availability */}
          <div className="card-header-row">
            <span className="card-category-tag" title={getDisplayCategory(product)}>
              {getDisplayCategory(product)}
            </span>

            {/* Header Pill for Rating (Active when product.rating is available) */}
            {product.rating ? (
              <span className="card-header-rating-pill" title={`${product.rating} rating from ${product.reviewCount || 0} reviews`}>
                <i className="fa-solid fa-star"></i> {Number(product.rating).toFixed(1)}
                {product.reviewCount ? <span className="rating-count">({product.reviewCount})</span> : null}
              </span>
            ) : null}

            {/* Availability Pill */}
            <span className={`card-availability-badge ${product.stockQuantity === 0 ? 'out-of-stock' : 'in-stock'}`}>
              {product.stockQuantity === 0 ? 'Sold Out' : 'In Stock'}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="card-title" onClick={handleViewDetails} title={product.name}>
            {product.name}
          </h3>

          {/* Feature Chips */}
          {featureChips.length > 0 && (
            <div className="card-feature-chips">
              {featureChips.map((chip, idx) => (
                <span key={idx} className="card-chip">
                  {chip}
                </span>
              ))}
            </div>
          )}

          {/* Price Row */}
          <div className="card-price-row">
            <span className="card-price-current">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="card-price-original">
                  {formatPrice(product.originalPrice)}
                </span>
                {discountPercent && (
                  <span className="card-price-discount">
                    {discountPercent}% OFF
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Dual Bottom Actions: Personalize vs Add to Cart */}
        <div className="card-action-split">
          <button
            type="button"
            onClick={handleViewDetails}
            className="btn-card-action btn-personalize"
          >
            Personalize
          </button>

          {product.stockQuantity === 0 ? (
            <button type="button" className="btn-card-action disabled" disabled>
              Out of Stock
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="btn-card-action btn-add-cart"
            >
              <i className="fa-solid fa-cart-shopping"></i> Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
