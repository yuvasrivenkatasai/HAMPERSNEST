import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { products } from '../data/products';

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

// Get first 6 featured products dynamically
const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 6);

export default function Home() {
  const { addToCart, setQuoteModalOpen } = useCart();
  const { formatPrice } = useCurrency();
  const [activeSlide, setActiveSlide] = useState(0);

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

  return (
    <div style={{ overflow: 'hidden' }}>
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
                <img src="/assets/hero_banner.png" alt="Premium luxury curated gift hamper by Hampers Nest" />
              </div>
              <div className="hero-product-card hero-product-wedding">
                <img src="/assets/wedding_gift.png" alt="Elegant wedding hamper gift" />
              </div>
              <div className="hero-product-card hero-product-brass">
                <img src="/assets/brass_cup.png" alt="Handcrafted brass return gift" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT / STORY SECTION */}
      <section id="about" className="about container">
        <div className="about-grid">
          <div className="about-left reveal">
            <span className="section-subtitle" style={{ textAlign: 'left', marginBottom: '0.8rem' }}>
              About Hampers Nest
            </span>
            <h3>Thoughtfully Curated <br />Luxury Gifts</h3>
            <p className="about-text" style={{ fontSize: '0.95rem' }}>
              Hampers Nest specializes in premium customized return gifts designed to leave a lasting impression. Every
              hamper is thoughtfully curated with attention to quality, aesthetics, and deep personalization. We merge
              traditional Hyderabad artistry with modern premium packaging to build return gifts worth cherishing.
            </p>

            <div className="about-services-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '1.5rem' }}>
              <div className="service-tag" style={{ background: 'var(--color-lavender)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--color-purple)', fontWeight: 500 }}>
                <i className="fa-solid fa-heart" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i> Wedding Curation
              </div>
              <div className="service-tag" style={{ background: 'var(--color-lavender)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--color-purple)', fontWeight: 500 }}>
                <i className="fa-solid fa-child" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i> Baby Showers
              </div>
              <div className="service-tag" style={{ background: 'var(--color-lavender)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--color-purple)', fontWeight: 500 }}>
                <i className="fa-solid fa-house-chimney" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i> Housewarmings
              </div>
              <div className="service-tag" style={{ background: 'var(--color-lavender)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--color-purple)', fontWeight: 500 }}>
                <i className="fa-solid fa-briefcase" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i> Corporate Gifting
              </div>
            </div>
            
            <Link to="/about" className="btn btn-secondary" style={{ marginTop: '2rem' }}>
              Read Our Story
            </Link>
          </div>

          <div className="about-right reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="about-img-box"><img src="/assets/wedding_gift.png" alt="Premium Wedding return gift" /></div>
            <div className="about-img-box"><img src="/assets/baby_shower.png" alt="Baby shower return gift set" /></div>
            <div className="about-img-box"><img src="/assets/housewarming.png" alt="Housewarming gift hamper" /></div>
            <div className="about-img-box"><img src="/assets/half_saree.png" alt="Half Saree function return gift" /></div>
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
                  <button
                    className="shop-card-btn"
                    onClick={() => addToCart(product, 1, { giftTag: '', wrappingStyle: 'Standard', ribbonColor: 'None' })}
                  >
                    <i className="fa-solid fa-cart-shopping"></i> Add To Cart
                  </button>
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
          <span className="bulk-order-icon">💼</span>
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

      {/* SEO Related Keywords Grid Section */}
      <div className="container" style={{ paddingBottom: '2rem' }}>
        <div className="collections-seo-keywords-section" style={{ marginTop: '2rem', borderTop: '1px solid var(--color-beige)', paddingTop: '2.5rem' }}>
          <h4 className="seo-keywords-title">Related Gifting Searches</h4>
          <div className="seo-keywords-grid">
            <div className="seo-keywords-col">
              <h5>Occasions</h5>
              <ul>
                <li><Link to="/collections?category=Wedding" className="seo-keyword-link">Wedding Return Gifts Hyderabad</Link></li>
                <li><Link to="/collections?category=Baby%20Shower" className="seo-keyword-link">Premium Baby Shower Gift Curations</Link></li>
                <li><Link to="/collections?category=Housewarming" className="seo-keyword-link">Housewarming Ceremony Hampers</Link></li>
                <li><Link to="/collections?category=Customized" className="seo-keyword-link">Custom Birthday & Anniversary Boxes</Link></li>
              </ul>
            </div>
            <div className="seo-keywords-col">
              <h5>Gift Styles</h5>
              <ul>
                <li><Link to="/collections?category=Brass" className="seo-keyword-link">Traditional Brass Item Return Gifts</Link></li>
                <li><Link to="/collections?category=Customized" className="seo-keyword-link">Curated Luxury Dry Fruit Hampers</Link></li>
                <li><Link to="/collections?category=Corporate" className="seo-keyword-link">Premium Corporate Gift Sets</Link></li>
                <li><Link to="/collections?category=Customized" className="seo-keyword-link">Handmade Gourmet Chocolate Trays</Link></li>
              </ul>
            </div>
            <div className="seo-keywords-col">
              <h5>Customization options</h5>
              <ul>
                <li><Link to="/collections" className="seo-keyword-link">Premium Ivory Lace Wrapping</Link></li>
                <li><Link to="/collections" className="seo-keyword-link">Royal Purple Silk Box Covers</Link></li>
                <li><Link to="/collections" className="seo-keyword-link">Personalized Gift Tags & Message Cards</Link></li>
                <li><Link to="/collections" className="seo-keyword-link">Enhancing Scented Wax Candle Add-ons</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
