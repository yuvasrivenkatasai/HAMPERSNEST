import SeoKeywordsSection from '../components/SeoKeywordsSection';
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import SEO from '../components/SEO';


export default function Gallery() {
  const navigate = useNavigate();
  const { products, addToCart, settings } = useCart();
  const [activeCategory, setActiveCategory] = useState('All');

  // Active dataset is purely products to match Collections functionality
  const activeDataset = useMemo(() => {
    return products || [];
  }, [products]);


  // Compute categories dynamically based on active dataset
  const categoriesList = useMemo(() => {
    const distinct = [...new Set(activeDataset.map(item => item.category))].filter(Boolean);
    const configuredCategories = Array.isArray(settings?.categories) ? settings.categories : [];

    const mapped = distinct.map(id => {
      const match = configuredCategories.find(c => c.id === id);
      return {
        id,
        label: match ? match.label : id
      };
    });

    return [{ id: 'All', label: 'All' }, ...mapped];
  }, [activeDataset, settings]);

  // Filter gallery items by category
  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return activeDataset;
    return activeDataset.filter(item => item.category === activeCategory);
  }, [activeCategory, activeDataset]);



  // IntersectionObserver for animations
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal, .reveal-heading, .gallery-item');
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
  }, [filteredItems]);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1, { giftTag: '', wrappingStyle: 'Standard', ribbonColor: 'None' });
  };

  const handleViewDetails = (product) => {
    navigate(`/product/${product.id || product._id}`);
    window.scrollTo(0, 0);
  };

  const gallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": "Hampers Nest Gift Showcase",
    "description": "Exquisite return gift designs, customized packaging styles, and celebration setups in Hyderabad.",
    "url": window.location.href,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Hampers Nest"
    }
  };

  return (
    <div className="page-container">
      <SEO 
        title="Luxury Gifting Gallery & Custom Portfolio | Hampers Nest"
        description="Browse our gallery of past custom curations, wedding return gifts, and baby shower box setups crafted in Hyderabad."
        keywords="gift gallery, portfolio, custom return gift images, hampersnest showcase"
        schema={gallerySchema}
      />
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container" style={{ padding: 0 }}>
          <span className="section-subtitle" style={{ marginBottom: '0.5rem' }}>Exquisite Creations</span>
          <h2>Product Showcase</h2>
          <p style={{ marginBottom: '1.25rem' }}>Browse our beautiful creations and customizable return gift setups</p>

          {/* Top Banner SEO Tags */}
          <div className="trending-tags-banner">
            <span className="trending-label">Popular Searches:</span>
            <Link to="/collections?category=Wedding" className="trending-tag-btn">#WeddingReturnGifts</Link>
            <Link to="/collections?category=Baby%20Shower" className="trending-tag-btn">#BabyShowerHampers</Link>
            <Link to="/collections?category=Corporate" className="trending-tag-btn">#CorporateGifts</Link>
            <Link to="/collections?category=Brass" className="trending-tag-btn">#BrassReturnGifts</Link>
            <Link to="/collections?category=Customized" className="trending-tag-btn">#CustomGiftBoxes</Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '1rem' }}>
        {/* Category Filters */}
        <div className="reveal" style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          <div className="category-tabs" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Collections Grid */ }
        <div className="collections-grid-4col reveal">
          {filteredItems.map((product, idx) => (
            <CollectionCard
              key={product.id || product._id || idx}
              product={product}
              animationDelay={(idx % 8) * 60}
              onAddToCart={(e) => handleAddToCart(e, product)}
              onViewDetails={() => handleViewDetails(product)}
            />
          ))}
        </div>
      </div>

      <SeoKeywordsSection />
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
