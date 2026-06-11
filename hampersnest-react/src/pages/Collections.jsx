import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'Wedding', 'Baby Shower', 'Housewarming', 'Corporate', 'Customized', 'Brass'];

export default function Collections() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCategory = searchParams.get('category');

  // Filter States
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // featured, price-low, price-high, rating

  // Sync category from URL search parameter
  useEffect(() => {
    if (queryCategory && CATEGORIES.includes(queryCategory)) {
      setActiveCategory(queryCategory);
    } else {
      setActiveCategory('All');
    }
  }, [queryCategory]);

  // Handle category tab click
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    // Update URL param
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Category Filter
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    // 2. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    // 4. Sorting
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

  // Scroll animations observer
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal, .reveal-heading, .reveal-category');
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
  }, [filteredProducts]);

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container" style={{ padding: 0 }}>
          <span className="section-subtitle" style={{ marginBottom: '0.5rem' }}>Premium Gifting</span>
          <h2>Our Collections</h2>
          <p style={{ marginBottom: '1.25rem' }}>Explore luxury return gifts and personalized hampers tailored for special moments</p>
          
          {/* Top Banner SEO Tags */}
          <div className="trending-tags-banner">
            <span className="trending-label">Popular Searches:</span>
            <button onClick={() => handleCategoryChange('Wedding')} className="trending-tag-btn">#WeddingReturnGifts</button>
            <button onClick={() => handleCategoryChange('Baby Shower')} className="trending-tag-btn">#BabyShowerHampers</button>
            <button onClick={() => handleCategoryChange('Corporate')} className="trending-tag-btn">#CorporateGifts</button>
            <button onClick={() => handleCategoryChange('Brass')} className="trending-tag-btn">#BrassReturnGifts</button>
            <button onClick={() => handleCategoryChange('Customized')} className="trending-tag-btn">#CustomGiftBoxes</button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '1rem' }}>
        {/* Search, Filter, Sort Bar */}
        <div className="filter-bar reveal">
          {/* Category Tabs */}
          <div className="category-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="search-input-wrapper">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort Dropdown */}
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
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#666', fontSize: '0.9rem' }} className="reveal-heading">
          <span>Showing {filteredProducts.length} premium products</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--color-gold-dark)', cursor: 'pointer', fontWeight: 500 }}
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#888' }} className="reveal">
            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '3rem', color: 'var(--color-lavender-dark)', marginBottom: '1.5rem' }}></i>
            <h3>No products found</h3>
            <p style={{ marginTop: '0.5rem' }}>Try modifying your search queries, clearing price constraints, or selecting a different category.</p>
          </div>
        ) : (
          <div className="collections-grid reveal">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* SEO Related Keywords Grid Section (instead of boring paragraphs) */}
        <div className="collections-seo-keywords-section" style={{ marginTop: '2.5rem', borderTop: '1px solid var(--color-beige)', paddingTop: '2.5rem' }}>
          <h4 className="seo-keywords-title">Related Gifting Searches</h4>
          <div className="seo-keywords-grid">
            <div className="seo-keywords-col">
              <h5>Occasions</h5>
              <ul>
                <li><button onClick={() => handleCategoryChange('Wedding')} className="seo-keyword-link">Wedding Return Gifts Hyderabad</button></li>
                <li><button onClick={() => handleCategoryChange('Baby Shower')} className="seo-keyword-link">Premium Baby Shower Gift Curations</button></li>
                <li><button onClick={() => handleCategoryChange('Housewarming')} className="seo-keyword-link">Housewarming Ceremony Hampers</button></li>
                <li><button onClick={() => handleCategoryChange('Customized')} className="seo-keyword-link">Custom Birthday & Anniversary Boxes</button></li>
              </ul>
            </div>
            <div className="seo-keywords-col">
              <h5>Gift Styles</h5>
              <ul>
                <li><button onClick={() => handleCategoryChange('Brass')} className="seo-keyword-link">Traditional Brass Item Return Gifts</button></li>
                <li><button onClick={() => handleCategoryChange('Customized')} className="seo-keyword-link">Curated Luxury Dry Fruit Hampers</button></li>
                <li><button onClick={() => handleCategoryChange('Corporate')} className="seo-keyword-link">Premium Corporate Gift Sets</button></li>
                <li><button onClick={() => handleCategoryChange('Customized')} className="seo-keyword-link">Handmade Gourmet Chocolate Trays</button></li>
              </ul>
            </div>
            <div className="seo-keywords-col">
              <h5>Customization options</h5>
              <ul>
                <li><a href="#/collections" className="seo-keyword-link">Premium Ivory Lace Wrapping</a></li>
                <li><a href="#/collections" className="seo-keyword-link">Royal Purple Silk Box Covers</a></li>
                <li><a href="#/collections" className="seo-keyword-link">Personalized Gift Tags & Message Cards</a></li>
                <li><a href="#/collections" className="seo-keyword-link">Enhancing Scented Wax Candle Add-ons</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
