import React, { useEffect } from 'react';
import SEO from '../components/SEO';

export default function RefundPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container">
      <SEO 
        title="Refund & Cancellation Policy | Hampers Nest"
        description="Learn about our return, cancellation, and refund policy for customized hampers and return gifts at Hampers Nest."
        keywords="hampersnest refund policy, returns, cancellation policy"
      />
      
      {/* Page Header */}
      <div className="page-header-banner">
        <div className="container" style={{ padding: 0 }}>
          <span className="section-subtitle" style={{ marginBottom: '0.5rem' }}>Legal & Guidelines</span>
          <h2>Refund & Cancellation Policy</h2>
          <p>Our guidelines regarding cancellations, transit damages, and refunds</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '800px' }}>
        <div className="policies-content glass-panel" style={{ padding: '2.5rem', background: 'var(--color-white)', borderRadius: '12px', border: '1px solid var(--color-beige)', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ color: 'var(--color-charcoal)', lineHeight: 1.8, fontSize: '0.95rem' }} className="policy-text-block">
            <p>Our focus is complete customer satisfaction. Please read the terms below regarding cancellations and refunds.</p>
            
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>1. Cancellations</h3>
            <p>For custom curated hampers and bulk return gifts, cancellations are only accepted within 24 hours of placing the order and payment.</p>
            <p>Once customization design approvals are given and raw materials or tags are produced/printed, orders cannot be cancelled or altered.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>2. Damaged or Incorrect Items</h3>
            <p>We pack our hampers and fragile return gifts (such as brass or glass items) with extreme care and multi-layered premium bubble wrap.</p>
            <p>In the rare event that an item is damaged during transit, please share an <strong>unboxing video</strong> (showing the shipping label and the opening of the box from start to finish without cuts/edits) with our WhatsApp support within <strong>24 hours of delivery</strong>. We will review and immediately arrange a replacement or partial refund as deemed appropriate.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>3. Refunds</h3>
            <p>Approved refunds are processed back to the original payment method (UPI, credit/debit card, or bank account) within 5–7 working days.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>Contact Us</h3>
            <p style={{ background: 'var(--color-lavender)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--color-beige)', marginTop: '1rem' }}>
              For any cancellation or refund queries, contact us at:<br />
              <strong>Hampers Nest Support</strong><br />
              📧 Email: <a href="mailto:info@hampersnest.com" style={{ color: 'var(--color-purple-dark)', textDecoration: 'underline' }}>info@hampersnest.com</a><br />
              📞 WhatsApp Support: +91 7989202194
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
