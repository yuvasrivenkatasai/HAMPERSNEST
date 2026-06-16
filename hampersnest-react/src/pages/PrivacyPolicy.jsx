import React, { useEffect } from 'react';
import SEO from '../components/SEO';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container">
      <SEO 
        title="Privacy Policy | Hampers Nest"
        description="At Hampers Nest, your privacy is important to us. Read our privacy policy to understand how we collect, use, and protect your information."
        keywords="hampersnest privacy policy, user data protection, privacy guidelines"
      />
      
      {/* Page Header */}
      <div className="page-header-banner">
        <div className="container" style={{ padding: 0 }}>
          <span className="section-subtitle" style={{ marginBottom: '0.5rem' }}>Legal & Guidelines</span>
          <h2>Privacy Policy</h2>
          <p>Effective Date: 14-07-2025 | Last Updated: 14-07-2025</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '800px' }}>
        <div className="policies-content glass-panel" style={{ padding: '2.5rem', background: 'var(--color-white)', borderRadius: '12px', border: '1px solid var(--color-beige)', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ color: 'var(--color-charcoal)', lineHeight: 1.8, fontSize: '0.95rem' }} className="policy-text-block">
            <p>Hampers Nest ("we", "our", or "us") is committed to protecting the privacy and security of your personal information.</p>
            <p>This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you interact with us via our website, social media platforms, offline store, or through other services related to premium gifts and return gifts.</p>
            
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>1. Information We Collect</h3>
            <p>We may collect the following types of information:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li><strong>Personal Information:</strong> Name, phone number, email address, delivery address, billing address, and occasion/event details (for personalized gifts).</li>
              <li><strong>Payment Information:</strong> UPI details, card info (processed securely via third-party payment gateways; we do not store card details).</li>
              <li><strong>Technical & Usage Data:</strong> IP address, device type, browser type, pages visited on our website, and referral source.</li>
            </ul>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>2. How We Use Your Information</h3>
            <p>We use your data for the following purposes:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li>To process and deliver your orders.</li>
              <li>To personalize gift hampers or return gifts.</li>
              <li>To provide customer support.</li>
              <li>To send order confirmations, invoices, and tracking information.</li>
              <li>To inform you about offers, promotions, or new products (only with your explicit consent).</li>
              <li>To improve our services and website functionality.</li>
            </ul>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>3. Sharing Your Information</h3>
            <p>We do not sell your personal data. However, we may share it with:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li>Delivery partners (for order fulfillment).</li>
              <li>Payment processors (to complete transactions securely).</li>
              <li>Marketing platforms (only if you've opted-in for offers).</li>
              <li>Legal authorities, when required under applicable law.</li>
            </ul>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>4. Data Security</h3>
            <p>We take appropriate technical and organizational measures to:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li>Prevent unauthorized access, disclosure, or misuse of your information.</li>
              <li>Secure transactions via encryption and secure payment gateways.</li>
              <li>Limit internal access to sensitive information.</li>
            </ul>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>5. Your Rights</h3>
            <p>Under Indian law and applicable data protection rules, you have the right to:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li>Request access to your personal data.</li>
              <li>Correct or update personal information.</li>
              <li>Withdraw consent for marketing at any time.</li>
              <li>Request deletion of your personal data (subject to legal obligations).</li>
            </ul>
            <p>To make a request, please contact us at our customer support channels.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>6. Cookies & Tracking</h3>
            <p>We use cookies and similar technologies to enhance your browsing experience. You may disable cookies in your browser settings, but some features of our website may not function properly as a result.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>7. Children's Privacy</h3>
            <p>Our services are not intended for individuals under the age of 18. We do not knowingly collect personal data from children without parental consent.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>8. Third-Party Links</h3>
            <p>Our website may contain links to third-party sites. We are not responsible for the privacy practices or content of these sites.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>9. Changes to This Privacy Policy</h3>
            <p>We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated "Last Updated" date.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>10. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy or your data, please contact us at:</p>
            <p style={{ background: 'var(--color-lavender)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--color-beige)', marginTop: '1rem' }}>
              <strong>Hampers Nest</strong><br />
              Hyderabad, Telangana, India<br />
              📧 Email: <a href="mailto:info@hampersnest.com" style={{ color: 'var(--color-purple-dark)', textDecoration: 'underline' }}>info@hampersnest.com</a><br />
              🌐 Website: <a href="http://www.hampersnest.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-purple-dark)', textDecoration: 'underline' }}>www.hampersnest.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
