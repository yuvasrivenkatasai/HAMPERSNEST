import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import ImageGallery from './ImageGallery';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist, setSelectedProductForModal } = useCart();
  const { formatPrice } = useCurrency();
  const isWishlisted = isInWishlist(product.id);
  const [galleryOpen, setGalleryOpen] = useState(false);

  // Normalise: support both legacy single `image` and new `images[]`
  const mediaList = product.images && product.images.length > 0
    ? [...product.images, ...(product.videos || [])]
    : [product.image];

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
    setSelectedProductForModal(product);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    setGalleryOpen(true);
  };

  return (
    <>
      <div className="collection-card reveal-category active">
        <div className="card-img-wrapper" style={{ cursor: 'pointer' }}>
          <div className="card-actions-top">
            <button
              onClick={handleWishlist}
              className={`action-icon-btn wishlist-btn ${isWishlisted ? 'active' : ''}`}
              aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
            </button>
            {/* Multi-image indicator */}
            {mediaList.length > 1 && (
              <span className="card-img-count-badge">
                <i className="fa-solid fa-images"></i> {mediaList.length}
              </span>
            )}
          </div>
          <img
            src={product.images?.[0] || product.image}
            alt={product.name}
            onClick={handleImageClick}
          />
          <div className="card-overlay" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleAddToCart} className="card-overlay-btn">
              <i className="fa-solid fa-cart-shopping"></i> Add To Cart
            </button>
          </div>
        </div>
        <div className="card-content">
          <h3 className="card-title" onClick={handleViewDetails} style={{ cursor: 'pointer' }}>
            {product.name}
          </h3>
          <p className="card-price">
            <span className="price-prefix">From </span>{formatPrice(product.price)}
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

      {/* Fullscreen Gallery */}
      {galleryOpen && (
        <ImageGallery
          media={mediaList}
          startAt={0}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </>
  );
}
