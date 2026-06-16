import React, { useEffect, useRef } from 'react';
import './FollowJourney.css';

export default function FollowJourney() {
  const sectionRef = useRef(null);

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
          {/* Instagram */}
          <div className="social-card journey-reveal" style={{ transitionDelay: '0.1s' }}>
            <div className="social-icon-wrapper">
              <i className="fa-brands fa-instagram"></i>
            </div>
            <h3>Instagram</h3>
            <p>
              Daily hamper inspirations, custom gifting ideas, wedding return gifts, festive hampers, and client stories.
            </p>
            <a
              href="https://www.instagram.com/hampersnest"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary social-btn"
            >
              FOLLOW US
            </a>
          </div>

          {/* YouTube */}
          <div className="social-card journey-reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="social-icon-wrapper">
              <i className="fa-brands fa-youtube"></i>
            </div>
            <h3>YouTube</h3>
            <p>
              Product showcases, packaging experiences, gifting collections, customer stories, and behind-the-scenes content.
            </p>
            <a
              href="https://youtube.com/@hampersnestgifts?si=tHfy4HNnaphp1YBE"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary social-btn"
            >
              WATCH NOW
            </a>
          </div>

          {/* Facebook */}
          <div className="social-card journey-reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="social-icon-wrapper">
              <i className="fa-brands fa-facebook-f"></i>
            </div>
            <h3>Facebook</h3>
            <p>
              Latest updates, customer celebrations, premium gifting collections, announcements, and festive inspirations.
            </p>
            <a
              href="https://www.facebook.com/share/1Cz8aEeJwo/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary social-btn"
            >
              VISIT PAGE
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
