import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MASTER_CATEGORIES, USD_RATE } from '../data/products';
import { useCart } from '../context/CartContext';

export default function Collections() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCategory = searchParams.get('category');
  const { products, addToCart, setSelectedProductForModal } = useCart();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);

  // Sync category from URL search parameter
  useEffect(() => {
    if (queryCategory) {
      const match = MASTER_CATEGORIES.find(
        c => c.id.toLowerCase() === queryCategory.toLowerCase() || 
             c.label.toLowerCase() === queryCategory.toLowerCase()
      );
      if (match) {
        setActiveCategory(match.id);
      } else {
        setActiveCategory('All');
      }
    } else {
      setActiveCategory('All');
    }
    setCurrentPage(1);
  }, [queryCategory]);

  // Reset page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  // Handle category tab click & update URL params
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    if (!products) return [];
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
             (p.description && p.description.toLowerCase().includes(q)) ||
             (p.category && p.category.toLowerCase().includes(q))
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
  }, [activeCategory, searchQuery, sortBy, products]);

  // Pagination Logic
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

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
  }, [paginatedProducts]);

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
            <button onClick={() => handleCategoryChange('Weddings')} className="trending-tag-btn">#WeddingReturnGifts</button>
            <button onClick={() => handleCategoryChange('Baby')} className="trending-tag-btn">#BabyShowerHampers</button>
            <button onClick={() => handleCategoryChange('Corporate')} className="trending-tag-btn">#CorporateGifts</button>
            <button onClick={() => handleCategoryChange('Traditional')} className="trending-tag-btn">#BrassReturnGifts</button>
            <button onClick={() => handleCategoryChange('Festivals')} className="trending-tag-btn">#FestivalGifts</button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '1rem' }}>

        {/* === MASTER CATEGORY TABS === */}
        <div className="category-tabs reveal" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          {MASTER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
            >
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
          <span>Showing {paginatedProducts.length} of {filteredProducts.length} products</span>
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
          <>
            <div className="collections-grid-4col reveal">
              {paginatedProducts.map((product, idx) => (
                <CollectionCard
                  key={product.id}
                  product={product}
                  animationDelay={(idx % 8) * 60}
                  onAddToCart={(e) => handleAddToCart(e, product)}
                  onViewDetails={() => handleViewDetails(product)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '3rem', marginBottom: '1rem' }} className="reveal">
                {/* Prev Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid var(--color-beige)',
                    background: currentPage === 1 ? '#F8F9FA' : 'var(--color-white)',
                    color: currentPage === 1 ? '#ADB5BD' : 'var(--color-purple-dark)',
                    borderRadius: '8px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fa-solid fa-chevron-left"></i> Previous
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        width: '38px',
                        height: '38px',
                        border: isActive ? 'none' : '1px solid var(--color-beige)',
                        background: isActive ? 'var(--gold-gradient)' : 'var(--color-white)',
                        color: isActive ? 'var(--color-white)' : 'var(--color-purple-dark)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? 'var(--shadow-gold)' : 'none'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid var(--color-beige)',
                    background: currentPage === totalPages ? '#F8F9FA' : 'var(--color-white)',
                    color: currentPage === totalPages ? '#ADB5BD' : 'var(--color-purple-dark)',
                    borderRadius: '8px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Next <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}

        {/* SEO Related Keywords Grid Section */}
        <div className="collections-seo-keywords-section" style={{ marginTop: '2.5rem', borderTop: '1px solid var(--color-beige)', paddingTop: '2.5rem' }}>
          <h4 className="seo-keywords-title">Related Gifting Searches</h4>
          <div className="seo-keywords-grid">
            <div className="seo-keywords-col">
              <h5>Occasions</h5>
              <ul>
                <li><button onClick={() => handleCategoryChange('Weddings')} className="seo-keyword-link">Wedding Return Gifts Hyderabad</button></li>
                <li><button onClick={() => handleCategoryChange('Baby')} className="seo-keyword-link">Premium Baby Shower Gift Curations</button></li>
                <li><button onClick={() => handleCategoryChange('Traditional')} className="seo-keyword-link">Housewarming Ceremony Hampers</button></li>
                <li><button onClick={() => handleCategoryChange('Festivals')} className="seo-keyword-link">Festival & Seasonal Gift Boxes</button></li>
              </ul>
            </div>
            <div className="seo-keywords-col">
              <h5>Gift Styles</h5>
              <ul>
                <li><button onClick={() => handleCategoryChange('Traditional')} className="seo-keyword-link">Traditional Brass Item Return Gifts</button></li>
                <li><button onClick={() => handleCategoryChange('Traditional')} className="seo-keyword-link">Curated Luxury Dry Fruit Hampers</button></li>
                <li><button onClick={() => handleCategoryChange('Corporate')} className="seo-keyword-link">Premium Corporate Gift Sets</button></li>
                <li><button onClick={() => handleCategoryChange('Festivals')} className="seo-keyword-link">Handmade Gourmet Gift Trays</button></li>
              </ul>
            </div>
            <div className="seo-keywords-col">
              <h5>Customization</h5>
              <ul>
                <li><button onClick={() => handleCategoryChange('All')} className="seo-keyword-link">Premium Ivory Lace Wrapping</button></li>
                <li><button onClick={() => handleCategoryChange('All')} className="seo-keyword-link">Royal Purple Silk Box Covers</button></li>
                <li><button onClick={() => handleCategoryChange('All')} className="seo-keyword-link">Personalized Gift Tags & Message Cards</button></li>
                <li><button onClick={() => handleCategoryChange('Corporate')} className="seo-keyword-link">Bulk Order Corporate Hampers</button></li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Isolated collection card with USD price ──────────────────────────
function CollectionCard({ product, animationDelay, onAddToCart, onViewDetails }) {
  const usdPrice = Math.round(product.price / USD_RATE);

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
          <span className="price-prefix">From </span>₹{product.price}
        </p>
        <p className="card-usd-price">≈ ${usdPrice} USD</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
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
