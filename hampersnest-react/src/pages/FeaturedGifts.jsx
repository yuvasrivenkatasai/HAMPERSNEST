import SeoKeywordsSection from '../components/SeoKeywordsSection';
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';

export default function FeaturedGifts() {
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isInWishlist, settings } = useCart();
  
  // State for desktop filtering
  const [activeFilter, setActiveFilter] = useState('All');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Handle window resize to toggle desktop/mobile view
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const featuredItems = useMemo(() => {
    return products ? products.filter(p => p.isFeatured) : [];
  }, [products]);

  const filteredFeaturedItems = useMemo(() => {
    if (activeFilter === 'All') return featuredItems;
    return featuredItems.filter(p => p.category === activeFilter);
  }, [featuredItems, activeFilter]);

  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal, .reveal-heading, .featured-row');
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
  }, [filteredFeaturedItems]); // Add dependency to re-trigger when products load or filter changes

  const featuredSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Featured Gifting Collection",
    "description": "Discover our handpicked premium gift hampers and return gift packs crafted in Hyderabad.",
    "url": window.location.href,
    "provider": {
      "@type": "LocalBusiness",
      "name": settings?.storeName || "Hampers Nest",
      "image": window.location.origin + "/assets/hero_banner.webp",
      "telephone": `+${settings?.whatsappNumber}`,
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
        title={`Curator's Choice: Featured Luxury Hampers | ${settings?.storeName || 'Hampers Nest'}`}
        description="Explore our most loved customized gift hampers. Handpicked and tailored perfectly for premium weddings, baby showers, and grand celebrations."
        keywords="featured hampers, premium return gifts, best gift hampers hyderabad, hampersnest best sellers"
        schema={featuredSchema}
      />
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container" style={{ padding: 0 }}>
          <span className="section-subtitle" style={{ marginBottom: '0.5rem' }}>Curator's Choice</span>
          <h2>Featured Gifts</h2>
          <p style={{ marginBottom: '1.25rem' }}>Handpicked premium hampers crafted to elevate your celebrations</p>

          {/* Top Banner SEO Tags */}
          {settings?.popularSearches && (
            <div className="trending-tags-banner">
              <span className="trending-label">Popular Searches:</span>
              
              {/* "All" button for clearing filter on Desktop */}
              {isDesktop && activeFilter !== 'All' && (
                <button 
                  onClick={() => setActiveFilter('All')} 
                  className="trending-tag-btn"
                  style={{ background: 'var(--color-purple-dark)', color: 'white' }}
                >
                  All Featured
                </button>
              )}

              {settings.popularSearches.split(',').map((tag, idx) => {
                const cleanTag = tag.trim();
                let cat = '';
                if (cleanTag.toLowerCase().includes('wedding')) cat = 'Wedding';
                else if (cleanTag.toLowerCase().includes('baby')) cat = 'Baby Shower';
                else if (cleanTag.toLowerCase().includes('corporate')) cat = 'Corporate';
                else if (cleanTag.toLowerCase().includes('brass')) cat = 'Brass';
                else if (cleanTag.toLowerCase().includes('custom')) cat = 'Customized';
                
                if (isDesktop) {
                  return (
                    <button 
                      key={idx} 
                      onClick={() => setActiveFilter(cat || cleanTag)} 
                      className={`trending-tag-btn ${activeFilter === (cat || cleanTag) ? 'active' : ''}`}
                      style={activeFilter === (cat || cleanTag) ? { background: 'var(--color-gold)', color: 'white', borderColor: 'var(--color-gold)' } : {}}
                    >
                      {cleanTag}
                    </button>
                  );
                } else {
                  return (
                    <Link key={idx} to={cat ? `/collections?category=${cat}` : '/collections'} className="trending-tag-btn">{cleanTag}</Link>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        {filteredFeaturedItems.length === 0 && products && products.length > 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }} className="reveal active">
            <p>No featured products found for this filter.</p>
            <button onClick={() => setActiveFilter('All')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
              View All Featured
            </button>
          </div>
        ) : (
          <div className="collections-grid reveal">
            {filteredFeaturedItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <SeoKeywordsSection />
    </div>
  );
}
