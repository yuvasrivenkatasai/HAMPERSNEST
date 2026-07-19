import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Wishlist() {
  const { products, wishlist, toggleWishlist, settings } = useCart();
  const [sortBy, setSortBy] = useState('newest');

  const savedProducts = useMemo(() => {
    if (!products) return [];
    
    // Filter products that are in the wishlist
    let list = products.filter(p => wishlist.includes(p.id));

    // Sort
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else {
      // 'newest' based on the order they were added (which matches the wishlist array order)
      list.sort((a, b) => wishlist.indexOf(b.id) - wishlist.indexOf(a.id));
    }

    return list;
  }, [products, wishlist, sortBy]);

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to remove all items from your wishlist?')) {
      savedProducts.forEach(p => toggleWishlist(p.id));
    }
  };

  return (
    <div className="page-container">
      <SEO 
        title={`My Wishlist | ${settings?.storeName || 'Hampers Nest'}`}
        description="View your saved premium gift hampers and return gifts."
      />
      
      <div className="container" style={{ paddingTop: '20px' }}>
        <Breadcrumbs customCrumbs={[{ name: 'Wishlist', path: '/wishlist' }]} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '2rem', marginTop: '1rem' }}>
          <h2>My Wishlist <span style={{ color: 'var(--color-gray-text)', fontSize: '1.2rem', fontWeight: 500 }}>({savedProducts.length})</span></h2>
          
          {savedProducts.length > 0 && (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <select 
                className="sort-select" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-beige)' }}
              >
                <option value="newest">Recently Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <button 
                onClick={handleClearWishlist}
                style={{ background: 'none', border: 'none', color: '#e24e4e', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="fa-solid fa-trash-can"></i> Clear All
              </button>
            </div>
          )}
        </div>

        {savedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#888' }} className="reveal active">
            <div style={{ fontSize: '4rem', color: '#fca5a5', marginBottom: '1.5rem' }}>
              <i className="fa-regular fa-heart"></i>
            </div>
            <h3 style={{ color: 'var(--color-charcoal)' }}>Your wishlist is empty</h3>
            <p style={{ marginTop: '0.5rem', marginBottom: '2rem' }}>
              Save your favorite hampers here to find them easily later.
            </p>
            <Link to="/collections?view=all" className="btn btn-primary" style={{ padding: '12px 30px' }}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="collections-grid-4col reveal active" style={{ marginBottom: '4rem' }}>
            {savedProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                animationDelay={(idx % 8) * 60}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
