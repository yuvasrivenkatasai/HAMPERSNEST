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
  const isViewAll = searchParams.get('view') === 'all';
  const queryCategory = searchParams.get('category');
  const minPriceFilter = searchParams.get('min');
  const maxPriceFilter = searchParams.get('max');
  
  const { products, addToCart, settings, productsLoading } = useCart();
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

  const [activeCategory, setActiveCategory] = useState(queryCategory ? 'All' : (savedState?.activeCategory || 'All'));
  const [activeSubcategory, setActiveSubcategory] = useState(savedState?.activeSubcategory || null);
  const [searchQuery, setSearchQuery] = useState(savedState?.searchQuery || '');
  const [sortBy, setSortBy] = useState(savedState?.sortBy || 'featured');
  const [showPopularSearches, setShowPopularSearches] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Infinite Scroll / Page Scroller Constants & State
  const BATCH_SIZE = 18;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderSentinelRef = React.useRef(null);
  const productsGridRef = React.useRef(null);
  const subcategoriesRef = React.useRef(null);
  const isInitialMount = React.useRef(true);

  useEffect(() => {
    sessionStorage.setItem(`collections_state_${location.key}`, JSON.stringify({
      activeCategory,
      activeSubcategory,
      searchQuery,
      sortBy,
      visibleCount
    }));
  }, [activeCategory, activeSubcategory, searchQuery, sortBy, visibleCount, location.key]);

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

  const getCategoryGroupKey = (label) => {
    const l = String(label || '').trim().toLowerCase();
    if (l.includes('wedding')) return 'wedding';
    if (l.includes('baby')) return 'baby';
    if (l.includes('corporate')) return 'corporate';
    if (l === 'bags' || l.includes('jute')) return 'jute_bags';
    return l.replace(/s$/, '');
  };

  const mainCategories = useMemo(() => {
    const raw = [{ id: 'All', label: 'All' }, ...storefrontCategories.filter(c => !c.parentId)];
    const groups = new Map();

    for (const cat of raw) {
      if (cat.id === 'All') {
        groups.set('all', { ...cat, allIds: ['All'] });
        continue;
      }
      const key = getCategoryGroupKey(cat.label);
      if (!groups.has(key)) {
        groups.set(key, { ...cat, allIds: [cat.id] });
      } else {
        const existing = groups.get(key);
        existing.allIds.push(cat.id);
        // Prefer more descriptive label (e.g. 'Weddings' over 'Wedding', 'Corporate Gifting' over 'Corporate')
        if (cat.label.length > existing.label.length) {
          existing.label = cat.label;
          existing.id = cat.id;
        }
      }
    }

    return Array.from(groups.values());
  }, [storefrontCategories]);

  // Compute live product counts per main category
  const categoryCounts = useMemo(() => {
    if (!products) return {};
    const counts = { All: products.length };

    mainCategories.forEach(cat => {
      if (cat.id === 'All') return;
      const allIds = new Set(cat.allIds || [cat.id]);

      const count = products.filter(p => {
        if (allIds.has(p.category)) return true;
        if (Array.isArray(p.allCategories) && p.allCategories.some(c => allIds.has(c))) return true;
        if (Array.isArray(p.categoryAssignments) && p.categoryAssignments.some(a => allIds.has(a.categoryId || a.category))) return true;
        return false;
      }).length;
      counts[cat.id] = count;
    });

    return counts;
  }, [products, mainCategories]);

  // Filter out empty duplicate categories (only show categories that have curated products)
  const visibleCategories = useMemo(() => {
    return mainCategories.filter(cat => cat.id === 'All' || (categoryCounts[cat.id] || 0) > 0);
  }, [mainCategories, categoryCounts]);

  const activeSubcategoriesList = useMemo(() => {
    if (activeCategory === 'All') return [];
    return storefrontCategories.filter(c => c.parentId === activeCategory);
  }, [activeCategory, storefrontCategories]);

  const popularSearches = useMemo(() => {
    if (!settings?.popularSearches) return [];
    return settings.popularSearches.split(',').map(s => s.trim().replace(/^#/, '')).filter(Boolean);
  }, [settings?.popularSearches]);
  const getCategoryLabel = (categoryId) => {
    const match = storefrontCategories.find(category => category.id === categoryId);
    if (match?.label) return match.label;
    const isId = categoryId && (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId) || /^[0-9a-f]{24}$/i.test(categoryId));
    return isId ? 'Curated Gifts' : (categoryId || '');
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
      setVisibleCount(BATCH_SIZE);
    }
  }, [queryCategory, storefrontCategories]);

  // Save current collection URL for smart back navigation
  useEffect(() => {
    sessionStorage.setItem('last_visited_collection', window.location.pathname + window.location.search);
  }, [searchParams, visibleCount, activeCategory, activeSubcategory, searchQuery]);

  // Reset page when search or sort changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setVisibleCount(BATCH_SIZE);
  }, [searchQuery, sortBy]);

  // Handle category tab click & update URL params
  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setActiveSubcategory(null);
    setVisibleCount(BATCH_SIZE);
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
    setVisibleCount(BATCH_SIZE);
    scrollToGrid();
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    // 1. Category Filter (Matches ID and aliases across duplicates)
    if (activeCategory !== 'All') {
      const activeObj = mainCategories.find(c => c.id === activeCategory) || storefrontCategories.find(c => c.id === activeCategory);
      const allIds = activeObj?.allIds || [activeCategory];
      const matchingCatIds = new Set(allIds);

      result = result.filter(p => {
        if (matchingCatIds.has(p.category)) return true;
        if (Array.isArray(p.allCategories) && p.allCategories.some(c => matchingCatIds.has(c))) return true;
        if (Array.isArray(p.categoryAssignments) && p.categoryAssignments.some(a => matchingCatIds.has(a.categoryId || a.category))) return true;
        return false;
      });
    }
    if (activeSubcategory) {
      result = result.filter(p => {
        if (p.subCategory === activeSubcategory) return true;
        if (Array.isArray(p.allSubCategories) && p.allSubCategories.includes(activeSubcategory)) return true;
        if (Array.isArray(p.categoryAssignments) && p.categoryAssignments.some(a => (a.subCategoryId || a.subcategoryId || a.subCategory) === activeSubcategory)) return true;
        return false;
      });
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
      result = result.filter(p => {
        const catLabels = (p.allCategoryNames || [getCategoryLabel(p.category)]).join(' ').toLowerCase();
        const subcatLabels = (p.allSubcategoryNames || [p.subcategoryName || '']).join(' ').toLowerCase();
        return p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          catLabels.includes(q) ||
          subcatLabels.includes(q);
      });
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

  // Infinite Scroll / Page Scroller Logic
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
    setIsLoadingMore(false);
  }, [activeCategory, activeSubcategory, searchQuery, sortBy, minPriceFilter, maxPriceFilter]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    // Instant append so user never hits the footer
    setVisibleCount(prev => Math.min(prev + BATCH_SIZE, filteredProducts.length));
    setTimeout(() => {
      setIsLoadingMore(false);
    }, 120);
  }, [isLoadingMore, hasMore, filteredProducts.length]);

  // Primary: IntersectionObserver with generous 1000px pre-trigger margin
  useEffect(() => {
    const sentinel = loaderSentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: '1000px 0px',
        threshold: 0.01
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  // Secondary Safety: Pre-emptively load when user is within 1000px of page bottom
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollBottom = window.innerHeight + window.scrollY;
          const triggerThreshold = document.documentElement.scrollHeight - 1000;
          if (scrollBottom >= triggerThreshold) {
            loadMore();
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, loadMore]);

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
  }, [displayedProducts]);

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
    const minText = minPriceFilter ? `Rs. ${minPriceFilter}` : '';
    const maxText = maxPriceFilter ? `Rs. ${maxPriceFilter}` : '';
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

      <div className="container collections-container-wide" style={{ paddingTop: '8px' }}>
        <Breadcrumbs customCrumbs={[
          { name: 'Collections', path: '/collections' },
          ...(activeCategory !== 'All' ? [{ name: getCategoryLabel(activeCategory), path: `/collections?category=${activeCategory}` }] : [])
        ]} />

        {/* === 2-COLUMN COLLECTIONS LAYOUT (Left Sidebar Categories + Right Main Products) === */}
        <div className="collections-layout-container">
          
          {/* Mobile Filter Toggle */}
          <div className="mobile-sidebar-toggle-bar">
            <button 
              className="mobile-sidebar-toggle-btn"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              <div className="mobile-toggle-btn-left">
                <i className="fa-solid fa-sliders"></i>
                <span>Occasion: <strong>{activeCategory === 'All' ? 'All Collections' : getCategoryLabel(activeCategory)}</strong></span>
              </div>
              <i className={`fa-solid fa-chevron-${mobileSidebarOpen ? 'up' : 'down'}`}></i>
            </button>
          </div>

          {/* LEFT SIDEBAR: CATEGORIES */}
          <aside className={`collections-sidebar-panel ${mobileSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-sticky-box">
              <div className="sidebar-header-row">
                <div className="sidebar-title">
                  <i className="fa-solid fa-shapes"></i>
                  <span>Gifting Occasions</span>
                </div>
                {activeCategory !== 'All' && (
                  <button 
                    className="sidebar-reset-btn"
                    onClick={() => { handleCategoryChange('All'); setMobileSidebarOpen(false); }}
                  >
                    Reset
                  </button>
                )}
              </div>

              <nav className="sidebar-category-nav" ref={subcategoriesRef}>
                {visibleCategories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <div key={cat.id} className="sidebar-cat-group">
                      <button
                        onClick={() => {
                          handleCategoryChange(cat.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`sidebar-cat-btn ${isActive ? 'active' : ''}`}
                      >
                        <div className="sidebar-cat-left">
                          {cat.id === 'All' ? (
                            <i className="fa-solid fa-gem sidebar-gem-icon"></i>
                          ) : (
                            <span className="sidebar-cat-dot"></span>
                          )}
                          <span className="sidebar-cat-name">{cat.label}</span>
                        </div>
                        {categoryCounts[cat.id] !== undefined && (
                          <span className="sidebar-cat-badge">{categoryCounts[cat.id]}</span>
                        )}
                      </button>

                      {/* Nested Subcategories under active parent */}
                      {isActive && activeSubcategoriesList.length > 0 && (
                        <div className="sidebar-subcat-dropdown">
                          {activeSubcategoriesList.map(subcat => {
                            const isSubActive = activeSubcategory === subcat.id;
                            return (
                              <button
                                key={subcat.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubcategoryChange(isSubActive ? null : subcat.id);
                                  setMobileSidebarOpen(false);
                                }}
                                className={`sidebar-subcat-btn ${isSubActive ? 'active' : ''}`}
                              >
                                <i className={`fa-${isSubActive ? 'solid fa-circle-check' : 'regular fa-circle'}`}></i>
                                <span>{subcat.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* RIGHT MAIN PANEL */}
          <div className="collections-main-panel">
            {/* === UNIFIED SEARCH + COUNTER + SORT BAR === */}
            <div className="filter-bar-unified reveal" ref={productsGridRef}>
              <div className="search-input-wrapper-unified">
                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                <input
                  type="text"
                  placeholder="Search hampers, occasions, gifts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="clear-search-btn-unified"
                    onClick={() => { setSearchQuery(''); setActiveSubcategory(null); }}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="filter-counter-unified">
                Showing <strong>{displayedProducts.length}</strong> of <strong>{filteredProducts.length}</strong> Products
              </div>

              <div className="sort-wrapper-unified">
                <span className="sort-label-text">Sort:</span>
                <div className="sort-select-container">
                  <select
                    className="sort-select-unified"
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
                  <i className="fa-solid fa-chevron-down sort-chevron-icon"></i>
                </div>
              </div>
            </div>

        {/* === PRODUCTS GRID === */}
        {productsLoading && filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--color-purple)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--color-gold)', marginBottom: '1.25rem' }}></i>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-purple)' }}>Curating Luxury Hampers...</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-gray-text)' }}>Fetching handcrafted collections for you.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#888' }} className="reveal active">
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
            <div className="collections-grid-4col reveal active">
              {displayedProducts.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  animationDelay={(idx % 6) * 50}
                />
              ))}
            </div>

            {/* === INFINITE SCROLL / PAGE SCROLLER LOADER === */}
            {hasMore && (
              <div ref={loaderSentinelRef} className="scrolling-loader-sentinel">
                <div className="scrolling-loader-card">
                  <div className="scrolling-loader-spinner"></div>
                  <p className="scrolling-loader-text">Loading more handcrafted hampers...</p>
                  <span className="scrolling-loader-counter">
                    {displayedProducts.length} of {filteredProducts.length} loaded
                  </span>
                </div>
              </div>
            )}

            {/* === ALL PRODUCTS VIEWED COMPLETION INDICATOR === */}
            {!hasMore && filteredProducts.length > 0 && (
              <div className="scrolling-completed-indicator">
                <div className="scrolling-gem-badge">
                  <i className="fa-solid fa-gem"></i>
                </div>
                <h4>You've explored all {filteredProducts.length} curated hampers</h4>
                <p>Looking for a custom bespoke creation? Reach out directly to our gifting atelier.</p>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                  className="scrolling-back-to-top-btn"
                >
                  <i className="fa-solid fa-arrow-up"></i> Back to Top
                </button>
              </div>
            )}
          </>
        )}
          </div> {/* closes collections-main-panel */}
        </div>   {/* closes collections-layout-container */}

        {/* SEO Related Keywords Grid Section (Only shown after all products are explored) */}
        {!hasMore && (
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
        )}

      </div>
    </div>
  );
}
