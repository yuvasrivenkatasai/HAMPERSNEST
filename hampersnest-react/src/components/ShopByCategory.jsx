import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';

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

  const PRICE_CATEGORIES = [
    { id: 'price-under-100', name: 'Under ₹100', isPrice: true, priceFilter: 'under-100' },
    { id: 'price-100-200', name: '₹100–₹200', isPrice: true, priceFilter: '100-200' },
    { id: 'price-200-300', name: '₹200–₹300', isPrice: true, priceFilter: '200-300' },
    { id: 'price-300-plus', name: '₹300 & Above', isPrice: true, priceFilter: '300-plus' }
  ];

  const finalCategories = [...PRICE_CATEGORIES, ...sorted];

  return (
    <section className="shop-by-category-section" ref={sectionRef}>
      <div className="container">
        <span className="section-subtitle">Curated For Every Occasion</span>
        <h2 className="section-title" style={{ marginBottom: '2.5rem' }}>Shop By Category</h2>

        <div className="category-cards-strip-wrapper" ref={scrollRef}>
          <div className={`category-cards-strip ${animationEnabled ? 'animated' : ''}`}>
            {finalCategories.map((showcase, idx) => {
            const imgSrc = showcase.image || getDefaultImage(showcase.name);
            const isFeatured = showcase.isFeatured;

            return (
              <Link
                key={showcase.id || idx}
                to={showcase.isPrice ? `/collections?price=${showcase.priceFilter}` : (isFeatured ? '/collections' : `/collections?category=${encodeURIComponent(showcase.targetCollection)}`)}
                className={`luxury-category-card ${isFeatured ? 'featured-category-card' : ''} ${isVisible ? 'card-visible' : ''}`}
                style={{ '--card-index': idx }}
              >
                <div className="category-image-wrapper">
                  {showcase.isPrice ? (
                    <div className="featured-gradient-bg">
                      <i className="fa-solid fa-indian-rupee-sign featured-icon"></i>
                    </div>
                  ) : isFeatured && !showcase.image ? (
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
            {animationEnabled && finalCategories.map((showcase, idx) => {
              const imgSrc = showcase.image || getDefaultImage(showcase.name);
              const isFeatured = showcase.isFeatured;

              return (
                <Link
                  key={`dup-${showcase.id || idx}`}
                  to={showcase.isPrice ? `/collections?price=${showcase.priceFilter}` : (isFeatured ? '/collections' : `/collections?category=${encodeURIComponent(showcase.targetCollection)}`)}
                  className={`luxury-category-card ${isFeatured ? 'featured-category-card' : ''} ${isVisible ? 'card-visible' : ''}`}
                  style={{ '--card-index': idx }}
                  aria-hidden="true"
                >
                  <div className="category-image-wrapper">
                    {showcase.isPrice ? (
                      <div className="featured-gradient-bg">
                        <i className="fa-solid fa-indian-rupee-sign featured-icon"></i>
                      </div>
                    ) : isFeatured && !showcase.image ? (
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
      </div>
    </section>
  );
}
