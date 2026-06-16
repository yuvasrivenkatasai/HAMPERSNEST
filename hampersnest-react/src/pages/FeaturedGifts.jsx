import SeoKeywordsSection from '../components/SeoKeywordsSection';
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';

export default function FeaturedGifts() {
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isInWishlist } = useCart();

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
      "name": "Hampers Nest",
      "image": window.location.origin + "/assets/hero_banner.webp",
      "telephone": "+917989202194",
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
        title="Curator's Choice: Featured Luxury Hampers | Hampers Nest"
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
