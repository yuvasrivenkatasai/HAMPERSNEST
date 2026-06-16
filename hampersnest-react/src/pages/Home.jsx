import SeoKeywordsSection from '../components/SeoKeywordsSection';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { API_BASE } from '../config';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';

const testimonials = [
  {
    rating: 5,
    quote: "Hampers Nest curated the return gifts for my daughter's wedding in Hyderabad. The brass bowls were gorgeous, and our guests absolutely loved the customized packaging. Highly professional!",
    name: "Priya Ramaswamy",
    event: "Daughter's Wedding Celebration"
  },
  {
    rating: 5,
    quote: "We ordered 150 customized lavender-themed return gifts for our baby shower. The attention to detail on the boxes, ribbons, and custom cards was outstanding. Hampers Nest made our occasion look so premium.",
    name: "Sneha Reddy",
    event: "Baby Shower Ceremony"
  },
  {
    rating: 5,
    quote: "The corporate gifting hampers we ordered for our executives were stellar. Perfect leatherette packaging and neat branding. Delivery was right on time. Will definitely order from Hampers Nest again.",
    name: "Aditya Verma",
    event: "Corporate Annual Gifting"
  }
];

export default function Home() {
  const { products, addToCart, setQuoteModalOpen, settings } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [heroBanner, setHeroBanner] = useState({
    mainImage: null,
    floatingImageTop: null,
    floatingImageBottom: null,
    isActive: false
  });

  // Fetch Hero Banner Configuration
  useEffect(() => {
    const fetchHeroBanner = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/hero-banner`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.isActive) {
            setHeroBanner(data);
          }
        }
      } catch (err) {
        console.warn('Hero banner fetch failed, falling back to local defaults', err);
      }
    };
    fetchHeroBanner();
  }, []);

  // Get first 6 featured products dynamically from context
  const featuredProducts = (products || []).filter((p) => p.isFeatured).slice(0, 6);

  // Testimonial slider auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // IntersectionObserver for scroll animations
  useEffect(() => {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-heading, .reveal-category, .reveal-gallery, .reveal-testimonial'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const openQuoteModal = (e) => {
    e.preventDefault();
    setQuoteModalOpen(true);
  };

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Hampers Nest",
    "image": window.location.origin + "/assets/hero_banner.webp",
    "@id": window.location.origin + "/#localbusiness",
    "url": window.location.origin,
    "telephone": "+917989202194",
    "priceRange": "₹₹",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jubilee Hills",
      "addressLocality": "Hyderabad",
      "addressRegion": "Telangana",
      "postalCode": "500033",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 17.4278,
      "longitude": 78.4056
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "09:00",
      "closes": "21:00"
    },
    "sameAs": [
      settings?.facebookUrl,
      settings?.instagramUrl,
      settings?.youtubeUrl,
      settings?.linkedinUrl,
      settings?.pinterestUrl,
      settings?.twitterUrl
    ].filter(Boolean)
  };

  return (
    <div style={{ overflow: 'hidden' }}>
      <SEO
        title="Hampers Nest | Premium Customized Gift Hampers & Return Gifts Hyderabad"
        description="Discover premium customized gift hampers, luxury wedding return gifts, baby shower boxes, housewarming kits, and corporate gifts by Hampers Nest Hyderabad. Ship across India."
        keywords="wedding return gifts Hyderabad, customized gift hampers, baby shower gifts Hyderabad, brass items return gifts, corporate gift sets, luxury gifting Hyderabad, hampersnest, hamspersnest"
        schema={homeSchema}
      />
      {/* LUXURY HERO */}
      <section className="luxury-hero" id="hero">
        <div className="hero-particles" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, idx) => (
            <span key={idx} className="particle"></span>
          ))}
        </div>

        <div className="hero-inner">
          {/* LEFT COLUMN: text content */}
          <div className="hero-left">
            <div className="hero-fade" style={{ '--delay': '0.2s' }}>
              <h1 className="hero-headline">
                Luxury Gifts That Leave A Lasting Impression
              </h1>
            </div>

            <div className="hero-fade" style={{ '--delay': '0.4s' }}>
              <p className="hero-desc">
                Thoughtfully crafted hampers for weddings, celebrations and memorable occasions.
              </p>
            </div>

            <div className="hero-cta hero-fade" style={{ '--delay': '0.6s' }}>
              <Link to="/collections" className="btn-hero btn-hero-primary hero-shimmer-btn">
                Explore Collections
              </Link>
              <a href="#" onClick={openQuoteModal} className="btn-hero btn-hero-secondary">
                <i className="fa-brands fa-whatsapp"></i> WhatsApp Consultation
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: image block */}
          <div className="hero-right">
            <div className="hero-visual hero-fade" style={{ '--delay': '0.5s' }}>
              <div className="hero-image-glow" aria-hidden="true"></div>
              <div className="hero-image-frame">
                <img src={heroBanner.mainImage || "/assets/hero_banner.webp"} alt="Premium luxury curated gift hamper by Hampers Nest" />
              </div>
              <div className="hero-product-card hero-product-wedding">
                <img src={heroBanner.floatingImageTop || "/assets/wedding_gift.webp"} alt="Elegant wedding hamper gift" />
              </div>
              <div className="hero-product-card hero-product-brass">
                <img src={heroBanner.floatingImageBottom || "/assets/brass_cup.webp"} alt="Handcrafted brass return gift" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP OUR COLLECTIONS — Dynamic 6 Featured Products */}
      <section className="shop-collections-section" style={{ background: 'var(--color-lavender)' }}>
        <div className="container">
          <span className="section-subtitle">Browse By Celebration</span>
          <h2 className="section-title">Shop Our Collections</h2>

          <div className="shop-collections-grid reveal" style={{ marginTop: '2.5rem' }}>
            {featuredProducts.map((product) => (
              <div key={product.id} className="shop-product-card">
                <div className="shop-card-img">
                  <img
                    src={product.images?.[0] || product.image}
                    alt={product.name}
                  />
                </div>
                <div className="shop-card-content">
                  <h3 className="shop-card-name">{product.name}</h3>
                  <p className="shop-card-inr">{formatPrice(product.price)}</p>
                  <div className="collection-card-action-row">
                    <button
                      className="shop-card-btn"
                      onClick={() => addToCart(product, 1, { giftTag: '', wrappingStyle: 'Standard', ribbonColor: 'None' })}
                    >
                      <i className="fa-solid fa-cart-shopping"></i> Add To Cart
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="card-link-text"
                    >
                      View Details <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Explore All Collections CTA */}
          <div className="explore-all-cta">
            <Link to="/collections" className="explore-all-btn">
              Explore All Collections <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

        </div>
      </section>

      {/* BULK & CORPORATE ORDERS */}
      <section className="bulk-order-section">
        <div className="bulk-order-inner reveal">
          <span className="bulk-order-subtitle">Bulk & Corporate Orders</span>
          <h2 className="bulk-order-title">Need 50, 100 or 500 Gifts?</h2>
          <p className="bulk-order-desc">
            We specialize in luxury gifting solutions for weddings, events, corporates
            and celebrations — crafted at scale without compromising on quality.
          </p>
          <div className="bulk-order-tags">
            <span className="bulk-tag">Wedding Gifting</span>
            <span className="bulk-tag">Corporate Events</span>
            <span className="bulk-tag">Employee Gifts</span>
            <span className="bulk-tag">Client Hampers</span>
            <span className="bulk-tag">Festival Gifting</span>
            <span className="bulk-tag">Custom Branding</span>
          </div>
          <button
            onClick={openQuoteModal}
            className="bulk-order-btn"
          >
            <i className="fa-brands fa-whatsapp"></i>
            Request Bulk Quote
          </button>
        </div>
      </section>

      {/* POPULAR HAMPERS SECTION */}
      <section className="featured-products container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <span className="section-subtitle">Curator's Choice</span>
        <h2 className="section-title">Popular Gift Hampers</h2>
        <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
          Explore our most loved customized gift hampers. Handpicked and tailored perfectly for premium weddings, baby showers, and celebrations.
        </p>

        <div className="collections-grid reveal active">
          {products && products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
          <Link to="/collections" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', fontWeight: 600, letterSpacing: '0.5px' }}>
            View All Products <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
          </Link>
        </div>
      </section>

      {/* ABOUT / STORY SECTION */}
      <section id="about" className="about" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <div className="about-grid">
            <div className="about-left reveal">
              <span className="section-subtitle" style={{ textAlign: 'left', marginBottom: '0.8rem' }}>
                About Hampers Nest
              </span>
              <h3>Thoughtfully Curated <br />Luxury Gifts</h3>
              <p className="about-text" style={{ fontSize: '0.95rem' }}>
                At HampersNest, we are committed to crafting luxury experiences that make gifting truly special. Our vision is to curate exquisite gift hampers that embody elegance and thoughtfulness, ensuring each product is of the highest quality and beautifully packaged. We aim to exceed expectations, transforming every gift into a memorable moment of joy and celebration. Join us in celebrating life's special occasions with our thoughtfully designed hampers.
              </p>

              <div className="about-services-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '1.5rem' }}>
                <div onClick={() => navigate('/collections?category=Wedding')} className="service-tag" style={{ background: 'var(--color-lavender)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--color-purple)', fontWeight: 500, cursor: 'pointer' }}>
                  <i className="fa-solid fa-heart" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i> Wedding Curation
                </div>
                <div onClick={() => navigate('/collections?category=Baby Shower')} className="service-tag" style={{ background: 'var(--color-lavender)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--color-purple)', fontWeight: 500, cursor: 'pointer' }}>
                  <i className="fa-solid fa-child" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i> Baby Showers
                </div>
                <div onClick={() => navigate('/collections?category=Housewarming')} className="service-tag" style={{ background: 'var(--color-lavender)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--color-purple)', fontWeight: 500, cursor: 'pointer' }}>
                  <i className="fa-solid fa-house-chimney" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i> Housewarmings
                </div>
                <div onClick={() => navigate('/collections?category=Corporate')} className="service-tag" style={{ background: 'var(--color-lavender)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--color-purple)', fontWeight: 500, cursor: 'pointer' }}>
                  <i className="fa-solid fa-briefcase" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i> Corporate Gifting
                </div>
              </div>

              <Link to="/about" className="btn btn-secondary" style={{ marginTop: '2rem' }}>
                Read Our Story
              </Link>
            </div>

            <div className="about-right reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="about-img-box"><img src="/assets/wedding_gift.webp" alt="Premium Wedding return gift" /></div>
              <div className="about-img-box"><img src="/assets/baby_shower.webp" alt="Baby shower return gift set" /></div>
              <div className="about-img-box"><img src="/assets/housewarming.webp" alt="Housewarming gift hamper" /></div>
              <div className="about-img-box"><img src="/assets/half_saree.webp" alt="Half Saree function return gift" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* CLIENT REVIEWS */}
      <section id="testimonials" className="testimonials container">
        <span className="section-subtitle">Heartfelt Reviews</span>
        <h2 className="section-title">Client Testimonials</h2>


        <div className="testimonial-slider-container reveal" style={{ marginTop: '3.5rem' }}>
          <div className="testimonial-track">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className={`testimonial-slide ${idx === activeSlide ? 'active' : ''}`}
                style={{
                  opacity: idx === activeSlide ? 1 : 0,
                  transform: idx === activeSlide ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.5s ease',
                  position: idx === activeSlide ? 'relative' : 'absolute',
                  pointerEvents: idx === activeSlide ? 'auto' : 'none',
                  width: '100%'
                }}
              >
                <div className="testimonial-rating">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <i key={i} className="fa-solid fa-star" style={{ color: 'var(--color-gold)', marginRight: '4px' }}></i>
                  ))}
                </div>
                <p className="testimonial-quote">"{testimonial.quote}"</p>

                <div className="testimonial-user">
                  <div className="testimonial-avatar">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="35" r="20" />
                      <path d="M50 60 C25 60 15 80 15 90 L85 90 C85 80 75 60 50 60 Z" />
                    </svg>
                  </div>
                  <div className="testimonial-meta">
                    <h5 className="testimonial-name">{testimonial.name}</h5>
                    <span className="testimonial-event">{testimonial.event}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicators */}
          <div className="slider-dots">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                className={`dot ${idx === activeSlide ? 'active' : ''}`}
                onClick={() => setActiveSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>



      {/* CALL TO ACTION BANNER */}
      <section className="cta-banner">
        <div className="container cta-container reveal">
          <h2 className="cta-title">Let's Create <br className="mobile-br" />Something Beautiful</h2>
          <p className="cta-desc">
            Contact our curation expert team today in Hyderabad. Let's customize beautiful hampers that suit your theme,
            budget, and celebration style.
          </p>
          <div className="cta-buttons">
            <a href="#" onClick={openQuoteModal} className="btn btn-primary btn-whatsapp">
              <i className="fa-brands fa-whatsapp"></i> Chat On WhatsApp
            </a>
            <Link to="/contact" className="btn btn-secondary" style={{ border: '1px solid var(--color-white)', color: 'var(--color-white)' }}>
              Request A Quote <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      <SeoKeywordsSection />
    </div>
  );
}
