import SeoKeywordsSection from '../components/SeoKeywordsSection';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductCard from '../components/ProductCard';

export default function Collections() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCategory = searchParams.get('category');
  const minPriceFilter = searchParams.get('min');
  const maxPriceFilter = searchParams.get('max');
  
  const { products, addToCart, settings } = useCart();
  const navigate = useNavigate();

  const location = useLocation();

  const savedState = useMemo(() => {
    try {
      const saved = sessionStorage.getItem(`collections_state_${location.key}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [location.key]);

  const [activeCategory, setActiveCategory] = useState(savedState?.activeCategory || 'All');
  const [activeSubcategory, setActiveSubcategory] = useState(savedState?.activeSubcategory || null);
  const [searchQuery, setSearchQuery] = useState(savedState?.searchQuery || '');
  const [sortBy, setSortBy] = useState(savedState?.sortBy || 'featured');
  const [currentPage, setCurrentPage] = useState(savedState?.currentPage || 1);
  const [showPopularSearches, setShowPopularSearches] = useState(false);
  const [hasScrolledCategories, setHasScrolledCategories] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleCategoryScroll = (e) => {
    if (!hasScrolledCategories) {
      setHasScrolledCategories(true);
    }
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    if (scrollWidth > clientWidth) {
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      setScrollProgress(progress);
    }
  };
  const productsGridRef = React.useRef(null);
  const subcategoriesRef = React.useRef(null);
  const isInitialMount = React.useRef(true);

  useEffect(() => {
    sessionStorage.setItem(`collections_state_${location.key}`, JSON.stringify({
      activeCategory,
      activeSubcategory,
      searchQuery,
      sortBy,
      currentPage
    }));
  }, [activeCategory, activeSubcategory, searchQuery, sortBy, currentPage, location.key]);

  const storefrontCategories = useMemo(() => {
    const configuredCategories = Array.isArray(settings?.categories) ? settings.categories : [];
    return configuredCategories
      .map((category) => ({
        id: String(category.id || category.label || '').trim(),
        label: String(category.label || category.id || '').trim(),
        parentId: category.parentId || null
      }))
      .filter((category) => category.id);
  }, [settings]);

  const mainCategories = useMemo(() => {
    return [{ id: 'All', label: 'All' }, ...storefrontCategories.filter(c => !c.parentId)];
  }, [storefrontCategories]);

  const activeSubcategoriesList = useMemo(() => {
    if (activeCategory === 'All') return [];
    return storefrontCategories.filter(c => c.parentId === activeCategory);
  }, [activeCategory, storefrontCategories]);

  const popularSearches = useMemo(() => {
    if (!settings?.popularSearches) return [];
    return settings.popularSearches.split(',').map(s => s.trim().replace(/^#/, '')).filter(Boolean);
  }, [settings?.popularSearches]);
  const getCategoryLabel = (categoryId) => {
    return storefrontCategories.find(category => category.id === categoryId)?.label || categoryId || '';
  };

  const getCategoryIdByLabel = (label) => {
    const match = storefrontCategories.find(
      category => category.label.toLowerCase().replace(/\s/g, '') === label.toLowerCase().replace(/\s/g, '')
    );
    return match?.id || label;
  };

  const handleCategoryLabelChange = (label) => {
    handleHashtagClick(label);
  };

  const scrollToGrid = () => {
    if (productsGridRef.current) {
      const yOffset = -80; // offset for fixed header
      const y = productsGridRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleHashtagClick = (hashtagText) => {
    const cleanText = hashtagText.replace(/^#/, '').trim();
    const catId = getCategoryIdByLabel(cleanText);
    const categoryObj = storefrontCategories.find(c => c.id === catId);

    if (categoryObj) {
      if (categoryObj.parentId) {
        // It's a subcategory
        setActiveCategory(categoryObj.parentId);
        setActiveSubcategory(categoryObj.id);
        searchParams.set('category', categoryObj.parentId);
        setSearchParams(searchParams);
      } else {
        // It's a main category
        handleCategoryChange(categoryObj.id);
      }
    } else {
      setSearchQuery(cleanText);
    }
    scrollToGrid();
  };

  // Sync category from URL search parameter
  useEffect(() => {
    let expectedCategory = 'All';
    let expectedSubcategory = null;

    if (queryCategory) {
      const match = storefrontCategories.find(
        c => c.id.toLowerCase() === queryCategory.toLowerCase() ||
          c.label.toLowerCase() === queryCategory.toLowerCase()
      );
      if (match) {
        if (match.parentId) {
          expectedCategory = match.parentId;
          expectedSubcategory = match.id;
        } else {
          expectedCategory = match.id;
        }
      }
    }

    if (activeCategory !== expectedCategory || activeSubcategory !== expectedSubcategory) {
      setActiveCategory(expectedCategory);
      setActiveSubcategory(expectedSubcategory);
      setCurrentPage(1);
    }
  }, [queryCategory, storefrontCategories]);

  // Save current collection URL for smart back navigation
  useEffect(() => {
    sessionStorage.setItem('last_visited_collection', window.location.pathname + window.location.search);
  }, [searchParams, currentPage, activeCategory, activeSubcategory, searchQuery]);

  // Reset page when search or sort changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  // Handle category tab click & update URL params
  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setActiveSubcategory(null);
    setCurrentPage(1);
    setSearchQuery('');
    
    if (catId !== 'All') {
      searchParams.set('category', catId);
      setSearchParams(searchParams);
      setTimeout(() => {
        if (subcategoriesRef.current) {
          const yOffset = -90; // Just below the sticky header
          const y = subcategoriesRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else if (productsGridRef.current) {
          const yOffset = -90;
          const y = productsGridRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    } else {
      searchParams.delete('category');
      setSearchParams(searchParams);
    }
  };

  const handleSubcategoryChange = (subcatId) => {
    setActiveSubcategory(subcatId);
    setCurrentPage(1);
    scrollToGrid();
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    // 1. Category Filter
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }
    if (activeSubcategory) {
      result = result.filter(p => p.subCategory === activeSubcategory);
    }

    // 1.5 Price Filter
    if (minPriceFilter !== null || maxPriceFilter !== null) {
      const min = minPriceFilter !== null ? Number(minPriceFilter) : 0;
      const max = maxPriceFilter !== null ? Number(maxPriceFilter) : Infinity;
      result = result.filter(p => {
        const price = p.price || 0;
        return price >= min && price <= max;
      });
    }

    // 2. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          getCategoryLabel(p.category).toLowerCase().includes(q)
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
  }, [activeCategory, activeSubcategory, searchQuery, sortBy, products, searchParams, minPriceFilter, maxPriceFilter]);

  // Pagination Logic
  const isViewAll = searchParams.get('view') === 'all';
  const itemsPerPage = isViewAll ? Math.max(filteredProducts.length, 1) : 24;
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
    navigate(`/product/${product.id}`);
    window.scrollTo(0, 0);
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": activeCategory === 'All' ? "All Gift Collections" : `${getCategoryLabel(activeCategory)} Gift Hampers`,
    "description": `Premium customized return gifts and luxury hampers for ${activeCategory === 'All' ? 'weddings, baby showers, housewarmings, and corporate events' : getCategoryLabel(activeCategory)}.`,
    "url": window.location.href,
    "provider": {
      "@type": "LocalBusiness",
      "name": settings?.storeName || "Hampers Nest",
      "image": window.location.origin + "/assets/hero_banner.webp",
      "telephone": `+${settings?.whatsappNumber}`,
      "priceRange": "₹₹",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Hyderabad",
        "addressCountry": "IN"
      }
    }
  };

  let seoTitle = activeCategory === 'All'
    ? `Shop Premium Gift Hampers & Return Gifts | ${settings?.storeName || 'Hampers Nest'}`
    : `Shop Premium ${getCategoryLabel(activeCategory)} Return Gifts | ${settings?.storeName || 'Hampers Nest'}`;
    
  let seoDescription = activeCategory === 'All'
    ? "Browse our collections of hand-crafted return gifts, wedding hampers, housewarming kits, and corporate gifting. Custom styling and ribbon packaging available."
    : `Explore luxury curated ${getCategoryLabel(activeCategory)} return gifts and gift hampers by Hampers Nest. Custom packaging and quick delivery options.`;
    
  let collectionHeaderTitle = 'Our Collections';

  if (minPriceFilter !== null || maxPriceFilter !== null) {
    const minText = minPriceFilter ? `₹${minPriceFilter}` : '';
    const maxText = maxPriceFilter ? `₹${maxPriceFilter}` : '';
    let priceRangeLabel = '';
    
    if (minPriceFilter && maxPriceFilter) {
      priceRangeLabel = `${minText} – ${maxText}`;
    } else if (minPriceFilter) {
      priceRangeLabel = `Above ${minText}`;
    } else if (maxPriceFilter) {
      priceRangeLabel = `Under ${maxText}`;
    }
    
    seoTitle = `Products ${priceRangeLabel} | Hampers Nest`;
    seoDescription = `Browse premium return gifts and luxury hampers ${priceRangeLabel} at Hampers Nest. Perfect for weddings, housewarmings, and special occasions.`;
    collectionHeaderTitle = `Showing Products ${priceRangeLabel}`;
  } else if (searchQuery) {
    seoTitle = `Search Results for "${searchQuery}" | Hampers Nest`;
    collectionHeaderTitle = `Search Results for "${searchQuery}"`;
  }

  return (
    <div className="page-container">
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={activeCategory === 'All'
          ? "gift collections, return gifts hyderabad, premium hampers, custom hampersnest, hampersnest collections"
          : `${getCategoryLabel(activeCategory).toLowerCase()} return gifts, ${getCategoryLabel(activeCategory).toLowerCase()} hampers hyderabad, hampersnest`}
        schema={collectionSchema}
      />
      {/* Header Banner */}
      <div className="page-header-banner mobile-compact-hero" style={{ padding: '2.5rem 0' }}>
        <div className="container" style={{ padding: 0 }}>
          <span className="section-subtitle" style={{ marginBottom: '0.5rem' }}>Premium Gifting</span>
          <h2>{collectionHeaderTitle}</h2>
          <p style={{ marginBottom: '1.25rem' }}>
            Discover handcrafted luxury hampers curated for every celebration
          </p>

          {/* Top Banner SEO Tags */}
          <div className={`trending-tags-banner ${showPopularSearches ? '' : 'mobile-hide-tags'}`}>
            <button 
              className="mobile-show-tags-btn" 
              onClick={() => setShowPopularSearches(!showPopularSearches)}
            >
              {showPopularSearches ? 'Hide Popular Searches' : 'Show Popular Searches'}
            </button>
            <div className="popular-searches-container">
              <span className="trending-label">Popular Searches:</span>
              {popularSearches.length > 0 ? popularSearches.map(term => (
                <button key={term} onClick={() => handleHashtagClick(term)} className="trending-tag-btn">#{term}</button>
              )) : (
                <>
                  <button onClick={() => handleHashtagClick('WeddingReturnGifts')} className="trending-tag-btn">#WeddingReturnGifts</button>
                  <button onClick={() => handleHashtagClick('BabyShowerHampers')} className="trending-tag-btn">#BabyShowerHampers</button>
                  <button onClick={() => handleHashtagClick('CorporateGifts')} className="trending-tag-btn">#CorporateGifts</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '8px' }}>
        <Breadcrumbs customCrumbs={[
          { name: 'Collections', path: '/collections' },
          ...(activeCategory !== 'All' ? [{ name: getCategoryLabel(activeCategory), path: `/collections?category=${activeCategory}` }] : [])
        ]} />

        <div className="mobile-sticky-category-wrapper mobile-sticky-category">
          {/* Top Right Arrow Indicator */}
          <div className={`mobile-scroll-arrow d-md-none ${hasScrolledCategories ? 'fade-out' : ''}`}>
            <i className="fa-solid fa-angles-right"></i>
          </div>

          <div ref={subcategoriesRef} onScroll={handleCategoryScroll} className="category-tabs reveal mobile-horizontal-scroll" style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '4px', flexWrap: 'wrap', position: 'relative' }}>
            {mainCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          
          {/* Custom Scroll Progress Line */}
          <div className="mobile-scroll-progress-container d-md-none">
            <div className="mobile-scroll-progress-track">
              <div className="mobile-scroll-progress-thumb" style={{ left: `${scrollProgress}%`, transform: `translateX(-${scrollProgress}%)` }}></div>
            </div>
          </div>
        </div>

        {/* === SUBCATEGORY CHIPS === */}
        {activeSubcategoriesList.length > 0 && activeCategory !== 'All' && (
          <div className="subcategory-chips reveal mobile-horizontal-scroll" style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {activeSubcategoriesList.map(subcat => (
              <button
                key={subcat.id}
                onClick={() => handleSubcategoryChange(subcat.id)}
                className={`subcategory-chip ${activeSubcategory === subcat.id ? 'active' : ''}`}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: activeSubcategory === subcat.id ? 'none' : '1px solid var(--color-beige)',
                  background: activeSubcategory === subcat.id ? 'var(--color-purple)' : '#fff',
                  color: activeSubcategory === subcat.id ? '#fff' : 'var(--color-gray-text)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeSubcategory === subcat.id ? '0 2px 8px rgba(112, 26, 117, 0.3)' : 'none'
                }}
              >
                #{subcat.label.replace(/\s+/g, '')}
              </button>
            ))}
            {activeSubcategory && (
              <button
                onClick={() => handleSubcategoryChange(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-gold-dark)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* === SEARCH + SORT BAR === */}
        <div className="filter-bar reveal mobile-merged-filter" ref={productsGridRef} style={{ marginBottom: '12px' }}>
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
          style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#666', fontSize: '0.85rem' }}
          className="reveal-heading results-counter-bar"
        >
          <span>Showing {paginatedProducts.length} of {filteredProducts.length} products</span>
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setActiveSubcategory(null); }}
              style={{ background: 'none', border: 'none', color: 'var(--color-gold-dark)', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}
            >
              Clear Filters ✕
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
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); setActiveSubcategory(null); }}
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
                <ProductCard
                  key={product.id}
                  product={product}
                  animationDelay={(idx % 8) * 60}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="reveal pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '3rem', marginBottom: '1rem' }}>
                {/* Prev Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn-prev"
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
                <div className="pagination-numbers-desktop" style={{ display: 'flex', gap: '8px' }}>
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
                </div>

                <div className="pagination-mobile-text" style={{ display: 'none', fontWeight: 600, color: 'var(--color-purple-dark)', fontSize: '0.9rem', padding: '0 10px' }}>
                  Page {currentPage} of {totalPages}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn-next"
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
                <li><button onClick={() => handleCategoryLabelChange('Wedding')} className="seo-keyword-link">Wedding Return Gifts Hyderabad</button></li>
                <li><button onClick={() => handleCategoryLabelChange('Baby Shower')} className="seo-keyword-link">Premium Baby Shower Gift Curations</button></li>
                <li><button onClick={() => handleCategoryLabelChange('Housewarming')} className="seo-keyword-link">Housewarming Ceremony Hampers</button></li>
                <li><button onClick={() => handleCategoryLabelChange('Customized Hampers')} className="seo-keyword-link">Festival & Seasonal Gift Boxes</button></li>
              </ul>
            </div>
            <div className="seo-keywords-col">
              <h5>Gift Styles</h5>
              <ul>
                <li><button onClick={() => handleCategoryLabelChange('Brass Gifting')} className="seo-keyword-link">Traditional Brass Item Return Gifts</button></li>
                <li><button onClick={() => handleCategoryLabelChange('Customized Hampers')} className="seo-keyword-link">Curated Luxury Dry Fruit Hampers</button></li>
                <li><button onClick={() => handleCategoryLabelChange('Corporate Gifting')} className="seo-keyword-link">Premium Corporate Gift Sets</button></li>
                <li><button onClick={() => handleCategoryLabelChange('Customized Hampers')} className="seo-keyword-link">Handmade Gourmet Gift Trays</button></li>
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
