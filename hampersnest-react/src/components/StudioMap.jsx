import React, { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';

export default function StudioMap() {
  const { settings } = useCart();
  const sectionRef = useRef(null);

  // Use dynamic settings, fallback to hardcoded values if missing
  const businessAddress = settings?.businessAddress || 'Hyderabad, Telangana, India';
  const googleMapsUrl = 'https://www.google.com/maps/dir/?api=1&destination=17.419195,78.6025405';
  const whatsappNumber = settings?.whatsappNumber || '917989202194';

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="studio-map-section" ref={sectionRef}>
      <div className="container">
        <div className="studio-map-header text-center">
          <span className="section-subtitle">Experience Luxury</span>
          <h2 className="section-title">Visit Our Studio</h2>
          <p className="studio-map-desc">
            Experience our luxury hamper collections and discuss custom gifting solutions in person.
          </p>
        </div>

        <div className="studio-map-grid">
          {/* Left Side: Map Embed */}
          <div className="studio-map-embed-wrapper">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d951.7108719375196!2d78.60257771936811!3d17.41929715897546!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9f7754de06e7%3A0x8521cabc2faa0ae5!2sHampers%20Nest!5e0!3m2!1sen!2sin!4v1781604203517!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hampers Nest Google Maps Location"
            ></iframe>
          </div>

          {/* Right Side: Business Information */}
          <div className="studio-map-info-card glass-panel">
            <div className="info-card-content">
              <h3>Hampers Nest</h3>
              
              <div className="info-row">
                <i className="fa-solid fa-location-dot"></i>
                <p>{businessAddress}</p>
              </div>

              <div className="info-row">
                <i className="fa-solid fa-clock"></i>
                <div>
                  <p><strong>Mon - Sat:</strong> 10:00 AM - 7:00 PM</p>
                  <p><strong>Sunday:</strong> By Appointment Only</p>
                </div>
              </div>

              <div className="studio-map-actions">
                <a 
                  href={googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary"
                >
                  <i className="fa-solid fa-map-location-dot"></i> Get Directions
                </a>
                <a 
                  href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=Hi Hampers Nest! I would like to schedule a studio visit.`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-whatsapp"
                >
                  <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
