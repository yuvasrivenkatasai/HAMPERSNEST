import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { products, MASTER_CATEGORIES } from '../data/products';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

const PAGE_SIZE = 12;

export default function Collections() {
  const { addToCart, setSelectedProductForModal } = useCart();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCategory, searchQuery, sortBy]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Master Category Filter
    if (activeCategory !== 'All') {
      result = result.filter(p => p.masterCategory === activeCategory);
    }

    // 2. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) ||
             p.description.toLowerCase().includes(q) ||
             p.category.toLowerCase().includes(q)
      );
    }

    // 3. Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [activeCategory, searchQuery, sortBy]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleLoadMore = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + PAGE_SIZE);
      setIsLoading(false);
    }, 300);
  }, []);

  // Scroll animations observer
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal, .reveal-heading');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );
    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [visibleProducts]);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1, { giftTag: '', wrappingStyle: 'Standard', ribbonColor: 'None' });
  };

  const handleViewDetails = (product) => {
    setSelectedProductForModal(product);
  };

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container" style={{ padding: 0 }}>
          <span className="section-subtitle" style={{ marginBottom: '0.5rem' }}>Premium Gifting</span>
          <h2>Our Collections</h2>
          <p style={{ marginBottom: '1.25rem' }}>
            Discover handcrafted luxury hampers curated for every celebration
          </p>

          {/* Top Banner SEO Tags */}
          <div className="trending-tags-banner">
            <span className="trending-label">Popular Searches:</span>
            <button onClick={() => setActiveCategory('Weddings')} className="trending-tag-btn">#WeddingReturnGifts</button>
            <button onClick={() => setActiveCategory('Baby')} className="trending-tag-btn">#BabyShowerHampers</button>
            <button onClick={() => setActiveCategory('Corporate')} className="trending-tag-btn">#CorporateGifts</button>
            <button onClick={() => setActiveCategory('Traditional')} className="trending-tag-btn">#BrassReturnGifts</button>
            <button onClick={() => setActiveCategory('Festivals')} className="trending-tag-btn">#FestivalGifts</button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '1rem' }}>

        {/* === MASTER CATEGORY TABS === */}
        <div className="master-category-tabs reveal">
          {MASTER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`master-tab ${activeCategory === cat.id ? 'active' : ''}`}
            >
              {cat.emoji && <span className="master-tab-emoji">{cat.emoji}</span>}
              {cat.label}
            </button>
          ))}
        </div>

        {/* === SEARCH + SORT BAR === */}
        <div className="filter-bar reveal" style={{ marginBottom: '1.5rem' }}>
          <div className="search-input-wrapper">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search hampers, occasions, gifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort products by"
          >
            <option value="featured">Featured Items</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>

        {/* Results Counter */}
        <div
          style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#666', fontSize: '0.85rem' }}
          className="reveal-heading"
        >
          <span>Showing {visibleProducts.length} of {filteredProducts.length} products</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--color-gold-dark)', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}
            >
              Clear Search ✕
            </button>
          )}
        </div>

        {/* === PRODUCTS GRID === */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#888' }} className="reveal">
            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '3rem', color: 'var(--color-lavender-dark)', marginBottom: '1.5rem' }}></i>
            <h3>No products found</h3>
            <p style={{ marginTop: '0.5rem' }}>
              Try modifying your search or selecting a different category.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="btn btn-secondary"
              style={{ marginTop: '1.5rem' }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="collections-grid-4col">
            {visibleProducts.map((product, idx) => (
              <CollectionCard
                key={product.id}
                product={product}
                animationDelay={idx >= visibleCount - PAGE_SIZE ? (idx % PAGE_SIZE) * 60 : 0}
                onAddToCart={(e) => handleAddToCart(e, product)}
                onViewDetails={() => handleViewDetails(product)}
              />
            ))}
          </div>
        )}

        {/* === LOAD MORE === */}
        {hasMore && filteredProducts.length > 0 && (
          <div className="load-more-wrapper">
            <button
              className="load-more-btn"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <>Loading... <i className="fa-solid fa-spinner fa-spin"></i></>
              ) : (
                <>Load More Products <i className="fa-solid fa-chevron-down"></i></>
              )}
            </button>
            <p className="products-counter">
              {visibleProducts.length} of {filteredProducts.length} products shown
            </p>
          </div>
        )}

        {/* SEO Related Keywords Grid Section */}
        <div className="collections-seo-keywords-section" style={{ marginTop: '2.5rem', borderTop: '1px solid var(--color-beige)', paddingTop: '2.5rem' }}>
          <h4 className="seo-keywords-title">Related Gifting Searches</h4>
          <div className="seo-keywords-grid">
            <div className="seo-keywords-col">
              <h5>Occasions</h5>
              <ul>
                <li><button onClick={() => setActiveCategory('Weddings')} className="seo-keyword-link">Wedding Return Gifts Hyderabad</button></li>
                <li><button onClick={() => setActiveCategory('Baby')} className="seo-keyword-link">Premium Baby Shower Gift Curations</button></li>
                <li><button onClick={() => setActiveCategory('Traditional')} className="seo-keyword-link">Housewarming Ceremony Hampers</button></li>
                <li><button onClick={() => setActiveCategory('Festivals')} className="seo-keyword-link">Festival & Seasonal Gift Boxes</button></li>
              </ul>
            </div>
            <div className="seo-keywords-col">
              <h5>Gift Styles</h5>
              <ul>
                <li><button onClick={() => setActiveCategory('Traditional')} className="seo-keyword-link">Traditional Brass Item Return Gifts</button></li>
                <li><button onClick={() => setActiveCategory('Traditional')} className="seo-keyword-link">Curated Luxury Dry Fruit Hampers</button></li>
                <li><button onClick={() => setActiveCategory('Corporate')} className="seo-keyword-link">Premium Corporate Gift Sets</button></li>
                <li><button onClick={() => setActiveCategory('Festivals')} className="seo-keyword-link">Handmade Gourmet Gift Trays</button></li>
              </ul>
            </div>
            <div className="seo-keywords-col">
              <h5>Customization</h5>
              <ul>
                <li><button onClick={() => setActiveCategory('All')} className="seo-keyword-link">Premium Ivory Lace Wrapping</button></li>
                <li><button onClick={() => setActiveCategory('All')} className="seo-keyword-link">Royal Purple Silk Box Covers</button></li>
                <li><button onClick={() => setActiveCategory('All')} className="seo-keyword-link">Personalized Gift Tags & Message Cards</button></li>
                <li><button onClick={() => setActiveCategory('Corporate')} className="seo-keyword-link">Bulk Order Corporate Hampers</button></li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Isolated collection card with currency-aware price ──────────────────────────
function CollectionCard({ product, animationDelay, onAddToCart, onViewDetails }) {
  const { formatPrice } = useCurrency();

  return (
    <div
      className="collection-card product-card-fadein"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="card-img-wrapper" onClick={onViewDetails} style={{ cursor: 'pointer' }}>
        <img src={product.image} alt={product.name} />
      </div>
      <div className="card-content">
        <h3 className="card-title" onClick={onViewDetails} style={{ cursor: 'pointer' }}>
          {product.name}
        </h3>
        <p className="card-price">
          <span className="price-prefix">From </span>{formatPrice(product.price)}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <button
            onClick={onViewDetails}
            className="card-link btn btn-secondary btn-quick-enquiry"
            style={{ fontSize: '0.72rem', padding: '0.45rem 0.8rem' }}
          >
            View Details <i className="fa-solid fa-chevron-right"></i>
          </button>
          <button
            onClick={onAddToCart}
            className="shop-card-btn"
            style={{ width: '100%', justifyContent: 'center', height: '34px' }}
          >
            <i className="fa-solid fa-cart-shopping"></i> Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
}
