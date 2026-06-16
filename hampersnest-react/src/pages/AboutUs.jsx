import SeoKeywordsSection from '../components/SeoKeywordsSection';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const visionPillars = [
  {
    icon: "fa-solid fa-gift",
    title: "Artisanal Curation",
    desc: "We handpick every element, pairing traditional Hyderabad craftsmanship (intricate brass engravings, silk zari) with premium dry fruits and hand-poured fragrances."
  },
  {
    icon: "fa-solid fa-wand-magic-sparkles",
    title: "Deep Personalization",
    desc: "From handwritten calligraphy gift tags to custom-colored rigid box packaging, we tailor every detail to match your celebration's theme, color palette, and style."
  },
  {
    icon: "fa-solid fa-shield-heart",
    title: "Quality Assurance",
    desc: "Every brass bowl is hand-polished, every chocolate is checked for freshness, and every box is structurally verified to ensure safe transit and exquisite reception."
  },
  {
    icon: "fa-solid fa-leaf",
    title: "Eco-Conscious Curation",
    desc: "We prioritize reusable, sustainable materials like solid brass, hand-woven bamboo, and jute detailing to ensure your return gifts are both beautiful and kind to earth."
  }
];

export default function AboutUs() {
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal, .reveal-heading, .pillar-card');
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

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Hampers Nest",
    "description": "Learn about the story, core philosophy, and artisanal curation of Hampers Nest Hyderabad.",
    "url": window.location.href,
    "mainEntity": {
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
        title="About Us | Luxury Curation & Philosophy | Hampers Nest"
        description="Read the story behind Hampers Nest Hyderabad. We partner with local artisans to craft sustainable, highly customized return gifts and festival hampers."
        keywords="about hampersnest, gifting history hyderabad, return gift curators, custom gift boxes hyderabad"
        schema={aboutSchema}
      />
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container" style={{ padding: 0 }}>
          <span className="section-subtitle" style={{ marginBottom: '0.5rem' }}>Our Story</span>
          <h2>Crafting Lasting Impressions</h2>
          <p style={{ marginBottom: '1.25rem' }}>Learn about our vision, our curators, and our passion for elegant gifting</p>

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

      {/* Main Story Grid */}
      <section className="about" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div className="about-grid">
            <div className="about-left reveal">
              <span className="section-subtitle" style={{ textAlign: 'left', marginBottom: '0.8rem' }}>The Curation Studio</span>
              <h3>Where Tradition <br />Meets Luxury</h3>
              <p className="about-text" style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
                Established in Hyderabad, Hampers Nest was founded on a simple belief: <em>a return gift is a physical representation of your gratitude and celebration.</em> We believe that generic, mass-produced items lack the warmth and elegance that your guests deserve.
              </p>
              <p className="about-text" style={{ fontSize: '0.95rem' }}>
                Our curation studio collaborates with local Indian artisans, bringing timeless treasures (like handcrafted brass bowls, peacock diyas, and zari pouches) and presenting them inside luxury, high-end packaging. Whether it is a grand wedding, a sweet baby shower, a warm housewarming, or an executive corporate event, we elevate the experience.
              </p>
            </div>

            <div className="about-right reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="about-img-box"><img src="/assets/wedding_gift.webp" alt="Traditional brass crafting" /></div>
              <div className="about-img-box"><img src="/assets/hero_banner.webp" alt="Curated lavender box details" /></div>
              <div className="about-img-box"><img src="/assets/housewarming.webp" alt="Handcrafted diyas details" /></div>
              <div className="about-img-box"><img src="/assets/corporate.webp" alt="Premium corporate layout" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Pillars Grid */}
      <section style={{ background: 'var(--color-lavender)', padding: '3.5rem 0' }}>
        <div className="container">
          <span className="section-subtitle">Core Philosophy</span>
          <h2 className="section-title">The Pillars of Hampers Nest</h2>
          
          <div className="collections-grid reveal" style={{ marginTop: '2rem' }}>
            {visionPillars.map((pillar, idx) => (
              <div
                key={idx}
                className="pillar-card reveal-category"
                style={{
                  background: 'var(--color-white)',
                  padding: '2.5rem 2rem',
                  borderRadius: '12px',
                  border: '1px solid var(--color-beige)',
                  boxShadow: 'var(--shadow-premium)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transitionDelay: `${idx * 100}ms`
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--color-lavender)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    fontSize: '1.5rem',
                    color: 'var(--color-gold-dark)',
                    border: '1px solid var(--color-gold-light)'
                  }}
                >
                  <i className={pillar.icon}></i>
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-purple-dark)' }}>
                  {pillar.title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-charcoal)', lineHeight: 1.6 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SeoKeywordsSection />
    </div>
  );
}
