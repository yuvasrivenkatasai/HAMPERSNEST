import React, { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import './FollowJourney.css';

export default function FollowJourney() {
  const { settings } = useCart();
  const sectionRef = useRef(null);

  const instagramUrl = settings?.instagramUrl;
  const youtubeUrl = settings?.youtubeUrl;
  const facebookUrl = settings?.facebookUrl;
  const linkedinUrl = settings?.linkedinUrl;
  const pinterestUrl = settings?.pinterestUrl;
  const twitterUrl = settings?.twitterUrl;

  // Render nothing if no social URLs are configured
  if (!instagramUrl && !youtubeUrl && !facebookUrl && !linkedinUrl && !pinterestUrl && !twitterUrl) {
    return null;
  }

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
  }, [settings]);

  return (
    <section className="follow-journey-section" ref={sectionRef}>
      {/* Decorative Floating Shapes */}
      <div className="floating-shape shape-1"></div>
      <div className="floating-shape shape-2"></div>

      <div className="container">
        <div className="journey-header text-center journey-reveal">
          <span className="section-subtitle">Connect With Us</span>
          <h2 className="section-title">Follow Our Journey</h2>
          <p className="journey-desc">
            Discover our latest hampers, gifting inspiration, customer celebrations, behind-the-scenes creations, and exclusive collections across our social channels.
          </p>
        </div>

        <div className="follow-journey-grid">
          {/* Instagram */}
          {instagramUrl && (
            <div className="social-card journey-reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="social-icon-wrapper">
                <i className="fa-brands fa-instagram"></i>
              </div>
              <h3>Instagram</h3>
              <p>
                Daily hamper inspirations, custom gifting ideas, wedding return gifts, festive hampers and client stories.
              </p>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary social-btn"
              >
                Follow Us
              </a>
            </div>
          )}

          {/* YouTube */}
          {youtubeUrl && (
            <div className="social-card journey-reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="social-icon-wrapper">
                <i className="fa-brands fa-youtube"></i>
              </div>
              <h3>YouTube</h3>
              <p>
                Product showcases, packaging experiences, gifting collections and behind-the-scenes content.
              </p>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary social-btn"
              >
                Watch Now
              </a>
            </div>
          )}

          {/* Facebook */}
          {facebookUrl && (
            <div className="social-card journey-reveal" style={{ transitionDelay: '0.3s' }}>
              <div className="social-icon-wrapper">
                <i className="fa-brands fa-facebook-f"></i>
              </div>
              <h3>Facebook</h3>
              <p>
                Updates, customer highlights, promotions and gifting announcements.
              </p>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary social-btn"
              >
                Join Community
              </a>
            </div>
          )}

          {/* LinkedIn (Optional Future-Ready) */}
          {linkedinUrl && (
            <div className="social-card journey-reveal" style={{ transitionDelay: '0.4s' }}>
              <div className="social-icon-wrapper">
                <i className="fa-brands fa-linkedin-in"></i>
              </div>
              <h3>LinkedIn</h3>
              <p>
                Corporate partnerships, business gifting solutions, and company news.
              </p>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary social-btn"
              >
                Connect
              </a>
            </div>
          )}

          {/* Pinterest (Optional Future-Ready) */}
          {pinterestUrl && (
            <div className="social-card journey-reveal" style={{ transitionDelay: '0.5s' }}>
              <div className="social-icon-wrapper">
                <i className="fa-brands fa-pinterest-p"></i>
              </div>
              <h3>Pinterest</h3>
              <p>
                Mood boards, event themes, and endless inspiration for your next celebration.
              </p>
              <a
                href={pinterestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary social-btn"
              >
                View Boards
              </a>
            </div>
          )}

          {/* Twitter/X (Optional Future-Ready) */}
          {twitterUrl && (
            <div className="social-card journey-reveal" style={{ transitionDelay: '0.6s' }}>
              <div className="social-icon-wrapper">
                <i className="fa-brands fa-x-twitter"></i>
              </div>
              <h3>X (Twitter)</h3>
              <p>
                Quick updates, gifting trends, and real-time customer support.
              </p>
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary social-btn"
              >
                Follow Us
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
