import React, { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import './FollowJourney.css';

export default function FollowJourney() {
  const sectionRef = useRef(null);
  const { settings } = useCart();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.journey-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const socialCards = [
    {
      id: 'instagram',
      url: settings?.instagramUrl,
      icon: 'fa-brands fa-instagram',
      title: 'Instagram',
      desc: 'Daily hamper inspirations, custom gifting ideas, wedding return gifts, festive hampers, and client stories.',
      btnText: 'FOLLOW US'
    },
    {
      id: 'youtube',
      url: settings?.youtubeUrl,
      icon: 'fa-brands fa-youtube',
      title: 'YouTube',
      desc: 'Product showcases, packaging experiences, gifting collections, customer stories, and behind-the-scenes content.',
      btnText: 'WATCH NOW'
    },
    {
      id: 'facebook',
      url: settings?.facebookUrl,
      icon: 'fa-brands fa-facebook-f',
      title: 'Facebook',
      desc: 'Latest updates, customer celebrations, premium gifting collections, announcements, and festive inspirations.',
      btnText: 'VISIT PAGE'
    },
    {
      id: 'linkedin',
      url: settings?.linkedinUrl,
      icon: 'fa-brands fa-linkedin',
      title: 'LinkedIn',
      desc: 'Professional network, corporate gifting solutions, and business updates.',
      btnText: 'CONNECT'
    },
    {
      id: 'pinterest',
      url: settings?.pinterestUrl,
      icon: 'fa-brands fa-pinterest',
      title: 'Pinterest',
      desc: 'Curated inspiration boards for wedding gifts, baby showers, and aesthetic packaging.',
      btnText: 'VIEW PINS'
    },
    {
      id: 'twitter',
      url: settings?.twitterUrl,
      icon: 'fa-brands fa-x-twitter',
      title: 'Twitter / X',
      desc: 'Quick updates, news, and conversations about premium gifting.',
      btnText: 'FOLLOW'
    }
  ].filter(social => social.url && social.url.trim() !== '');

  if (socialCards.length === 0) return null;

  return (
    <section className="follow-journey-section" ref={sectionRef}>
      {/* Decorative Floating Shapes */}
      <div className="floating-shape shape-1"></div>
      <div className="floating-shape shape-2"></div>

      <div className="container">
        <div className="journey-header text-center journey-reveal">
          <span className="section-subtitle">CONNECT WITH US</span>
          <h2 className="section-title">Follow Our Journey</h2>
          <p className="journey-desc">
            Discover our latest hampers, gifting inspirations, customer celebrations, behind-the-scenes creations, and exclusive collections across our social channels.
          </p>
        </div>

        <div className="follow-journey-grid">
          {socialCards.map((card, idx) => (
            <div key={card.id} className="social-card journey-reveal" style={{ transitionDelay: `${0.1 * (idx + 1)}s` }}>
              <div className="social-icon-wrapper">
                <i className={card.icon}></i>
              </div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary social-btn"
              >
                {card.btnText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
