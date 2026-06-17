import SeoKeywordsSection from '../components/SeoKeywordsSection';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import SEO from '../components/SEO';

export default function Collections() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCategory = searchParams.get('category');
  const { products, addToCart, settings } = useCart();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const productsGridRef = React.useRef(null);

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
    if (queryCategory) {
      const match = storefrontCategories.find(
        c => c.id.toLowerCase() === queryCategory.toLowerCase() || 
             c.label.toLowerCase() === queryCategory.toLowerCase()
      );
      if (match) {
        if (match.parentId) {
          setActiveCategory(match.parentId);
          setActiveSubcategory(match.id);
        } else {
          setActiveCategory(match.id);
          setActiveSubcategory(null);
        }
      } else {
        setActiveCategory('All');
        setActiveSubcategory(null);
      }
    } else {
      setActiveCategory('All');
      setActiveSubcategory(null);
    }
    setCurrentPage(1);
  }, [queryCategory, storefrontCategories]);

  // Reset page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  // Handle category tab click & update URL params
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setActiveSubcategory(null);
    setCurrentPage(1);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
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
  }, [activeCategory, activeSubcategory, searchQuery, sortBy, products]);

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

  return (
    <div className="page-container">
      <SEO 
        title={activeCategory === 'All' 
          ? `Shop Premium Gift Hampers & Return Gifts | ${settings?.storeName || 'Hampers Nest'}` 
          : `Shop Premium ${getCategoryLabel(activeCategory)} Return Gifts | ${settings?.storeName || 'Hampers Nest'}`}
        description={activeCategory === 'All'
          ? "Browse our collections of hand-crafted return gifts, wedding hampers, housewarming kits, and corporate gifting. Custom styling and ribbon packaging available."
          : `Explore luxury curated ${getCategoryLabel(activeCategory)} return gifts and gift hampers by Hampers Nest. Custom packaging and quick delivery options.`}
        keywords={activeCategory === 'All'
          ? "gift collections, return gifts hyderabad, premium hampers, custom hampersnest, hampersnest collections"
          : `${getCategoryLabel(activeCategory).toLowerCase()} return gifts, ${getCategoryLabel(activeCategory).toLowerCase()} hampers hyderabad, hampersnest`}
        schema={collectionSchema}
      />
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

      <div className="container" style={{ paddingTop: '1rem' }}>

        {/* === MASTER CATEGORY TABS === */}
        <div className="category-tabs reveal" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
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

        {/* === SUBCATEGORY CHIPS === */}
        {activeSubcategoriesList.length > 0 && (
          <div className="subcategory-chips reveal" style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '2rem' }}>
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
        <div className="filter-bar reveal" ref={productsGridRef} style={{ marginBottom: '1.5rem' }}>
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
        <div className="collection-card-action-row">
          <button
            onClick={onAddToCart}
            className="shop-card-btn"
          >
            <i className="fa-solid fa-cart-shopping"></i> Add To Cart
          </button>
          <button
            onClick={onViewDetails}
            className="card-link-text"
          >
            View Details <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
