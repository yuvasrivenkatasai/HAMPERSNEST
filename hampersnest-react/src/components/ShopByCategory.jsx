import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';
import { useCart } from '../context/CartContext';

// Smart Default Category Images — maps keywords in category names to real product images
const DEFAULT_CATEGORY_IMAGES = {
  'wedding':       '/assets/wedding_gift.webp',
  'housewarming':  '/assets/housewarming.webp',
  'baby':          '/assets/baby_shower.webp',
  'corporate':     '/assets/corporate.webp',
  'half saree':    '/assets/half_saree.webp',
  'anniversary':   '/assets/wedding_gift.webp',
  'return':        '/assets/brass_cup.webp',
  'festival':      '/assets/housewarming.webp',
  'customized':    '/assets/hero_banner.webp',
  'custom':        '/assets/hero_banner.webp',
};

const UNIVERSAL_FALLBACK = '/assets/hero_banner.webp';

function getDefaultImage(categoryName) {
  if (!categoryName) return UNIVERSAL_FALLBACK;
  const lower = categoryName.toLowerCase();
  for (const [keyword, img] of Object.entries(DEFAULT_CATEGORY_IMAGES)) {
    if (lower.includes(keyword)) return img;
  }
  return UNIVERSAL_FALLBACK;
}

export default function ShopByCategory() {
  const [showcases, setShowcases] = useState([]);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchShowcases = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/category-showcase`);
        if (response.ok) {
          const data = await response.json();
          setShowcases(data.showcases || []);
          setAnimationEnabled(data.animationEnabled);
        }
      } catch (error) {
        console.error('Error fetching category showcases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShowcases();
  }, []);

  // IntersectionObserver for staggered fade-in
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [loading]);

  if (loading || showcases.length === 0) return null;

  // Sort: featured first, then by sortOrder
  const sorted = [...[...showcases].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  })];

  const { settings } = useCart();
  const priceRangeCards = (settings?.priceRangeCards || []).filter(c => c.isActive).sort((a,b) => a.sortOrder - b.sortOrder);

  // Render a generic strip of cards to perfectly reuse the design
  const renderCardStrip = (items, isBudget) => (
    <div className="category-cards-strip-wrapper" ref={isBudget ? null : scrollRef}>
      <div className={`category-cards-strip ${animationEnabled ? 'animated' : ''}`}>
        {items.map((showcase, idx) => {
          const imgSrc = showcase.image || (!isBudget ? getDefaultImage(showcase.name) : UNIVERSAL_FALLBACK);
          const isFeatured = showcase.isFeatured;
          
          let linkTarget = '/collections';
          if (isBudget) {
            const queryParams = new URLSearchParams();
            if (showcase.minPrice) queryParams.set('min', showcase.minPrice);
            if (showcase.maxPrice) queryParams.set('max', showcase.maxPrice);
            linkTarget = `/collections?${queryParams.toString()}`;
          } else if (!isFeatured) {
            linkTarget = `/collections?category=${encodeURIComponent(showcase.targetCollection)}`;
          }

          return (
            <Link
              key={showcase.id || idx}
              to={linkTarget}
              className={`luxury-category-card ${isFeatured ? 'featured-category-card' : ''} ${isVisible ? 'card-visible' : ''}`}
              style={{ '--card-index': idx }}
            >
              <div className="category-image-wrapper">
                {isFeatured && !showcase.image && !isBudget ? (
                  <div className="featured-gradient-bg">
                    <i className="fa-solid fa-gem featured-icon"></i>
                  </div>
                ) : (
                  <img
                    src={imgSrc}
                    alt={showcase.name}
                    loading="lazy"
                  />
                )}
                {/* Gold overlay on hover */}
                <div className="category-card-overlay"></div>
              </div>
              <div className="category-card-label">
                <span className="category-card-name">{showcase.name}</span>
              </div>
            </Link>
          );
        })}
        
        {/* Duplicate for infinite marquee if animation is enabled */}
        {animationEnabled && items.map((showcase, idx) => {
          const imgSrc = showcase.image || (!isBudget ? getDefaultImage(showcase.name) : UNIVERSAL_FALLBACK);
          const isFeatured = showcase.isFeatured;
          
          let linkTarget = '/collections';
          if (isBudget) {
            const queryParams = new URLSearchParams();
            if (showcase.minPrice) queryParams.set('min', showcase.minPrice);
            if (showcase.maxPrice) queryParams.set('max', showcase.maxPrice);
            linkTarget = `/collections?${queryParams.toString()}`;
          } else if (!isFeatured) {
            linkTarget = `/collections?category=${encodeURIComponent(showcase.targetCollection)}`;
          }

          return (
            <Link
              key={`dup-${showcase.id || idx}`}
              to={linkTarget}
              className={`luxury-category-card ${isFeatured ? 'featured-category-card' : ''} ${isVisible ? 'card-visible' : ''}`}
              style={{ '--card-index': idx }}
              aria-hidden="true"
            >
              <div className="category-image-wrapper">
                {isFeatured && !showcase.image && !isBudget ? (
                  <div className="featured-gradient-bg">
                    <i className="fa-solid fa-gem featured-icon"></i>
                  </div>
                ) : (
                  <img
                    src={imgSrc}
                    alt={showcase.name}
                    loading="lazy"
                  />
                )}
                <div className="category-card-overlay"></div>
              </div>
              <div className="category-card-label">
                <span className="category-card-name">{showcase.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {priceRangeCards.length > 0 && (
        <section className="shop-by-category-section" ref={sectionRef} style={{ paddingBottom: '0' }}>
          <div className="container">
            <span className="section-subtitle">Gifts For Every Price Range</span>
            <h2 className="section-title" style={{ marginBottom: '2.5rem' }}>Shop By Budget</h2>
            {renderCardStrip(priceRangeCards, true)}
          </div>
        </section>
      )}

      {sorted.length > 0 && (
        <section className="shop-by-category-section" style={{ paddingTop: priceRangeCards.length > 0 ? '4rem' : undefined }}>
          <div className="container">
            <span className="section-subtitle">Curated For Every Occasion</span>
            <h2 className="section-title" style={{ marginBottom: '2.5rem' }}>Shop By Category</h2>
            {renderCardStrip(sorted, false)}
          </div>
        </section>
      )}
    </>
  );
}
