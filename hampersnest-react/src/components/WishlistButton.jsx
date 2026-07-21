import React from 'react';
import { useCart } from '../context/CartContext';

export default function WishlistButton({ productId, absolute = false, className = '', style = {} }) {
  const { toggleWishlist, isInWishlist } = useCart();
  
  if (!productId) return null;
  
  const isWishlisted = isInWishlist(productId);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`wishlist-luxury-btn ${isWishlisted ? 'active' : ''} ${absolute ? 'is-absolute' : ''} ${className}`}
      style={style}
      aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
    </button>
  );
}
