import SeoKeywordsSection from '../components/SeoKeywordsSection';
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';

export default function FeaturedGifts() {
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isInWishlist, settings } = useCart();

  const featuredItems = products ? products.filter(p => p.isFeatured) : [];

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
  }, []);

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
              {settings.popularSearches.split(',').map((tag, idx) => {
                const cleanTag = tag.trim();
                let cat = '';
                if (cleanTag.toLowerCase().includes('wedding')) cat = 'Wedding';
                else if (cleanTag.toLowerCase().includes('baby')) cat = 'Baby Shower';
                else if (cleanTag.toLowerCase().includes('corporate')) cat = 'Corporate';
                else if (cleanTag.toLowerCase().includes('brass')) cat = 'Brass';
                else if (cleanTag.toLowerCase().includes('custom')) cat = 'Customized';
                return (
                  <Link key={idx} to={cat ? `/collections?category=${cat}` : '/collections'} className="trending-tag-btn">{cleanTag}</Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="collections-grid reveal">
          {featuredItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <SeoKeywordsSection />
    </div>
  );
}
