import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const isWishlisted = isInWishlist(product.id);

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
    <div className="collection-card reveal-category active">
      <div className="card-img-wrapper" onClick={handleViewDetails} style={{ cursor: 'pointer' }}>
        <div className="card-actions-top">
          <button
            onClick={handleWishlist}
            className={`action-icon-btn wishlist-btn ${isWishlisted ? 'active' : ''}`}
            aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
          </button>
        </div>
        <img src={product.image} alt={product.name} />
        <div className="card-overlay" onClick={(e) => e.stopPropagation()}>
          <button onClick={handleAddToCart} className="card-overlay-btn">
            <i className="fa-solid fa-cart-shopping"></i> Add To Cart
          </button>
        </div>
      </div>
      <div className="card-content">
        <h3 className="card-title" onClick={handleViewDetails} style={{ cursor: 'pointer' }}>{product.name}</h3>
        <p className="card-price">
          <span className="price-prefix">From </span>₹{product.price}
        </p>
        <p className="card-desc" style={{ fontSize: '0.8rem', minHeight: '40px' }}>{product.description}</p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
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
}
