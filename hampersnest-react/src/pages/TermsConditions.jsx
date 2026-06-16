import React, { useEffect } from 'react';
import SEO from '../components/SEO';

export default function TermsConditions() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container">
      <SEO 
        title="Terms & Conditions | Hampers Nest"
        description="Review the terms and conditions governing the use of Hampers Nest's website, products, and curation services."
        keywords="hampersnest terms and conditions, gift terms, legal disclaimer"
      />
      
      {/* Page Header */}
      <div className="page-header-banner">
        <div className="container" style={{ padding: 0 }}>
          <span className="section-subtitle" style={{ marginBottom: '0.5rem' }}>Legal & Guidelines</span>
          <h2>Terms & Conditions</h2>
          <p>Please read these terms carefully before accessing or using our services</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '800px' }}>
        <div className="policies-content glass-panel" style={{ padding: '2.5rem', background: 'var(--color-white)', borderRadius: '12px', border: '1px solid var(--color-beige)', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ color: 'var(--color-charcoal)', lineHeight: 1.8, fontSize: '0.95rem' }} className="policy-text-block">
            <p>Welcome to Hampers Nest! These Terms and Conditions ("Terms") govern your access to and use of our services, including our website, social media, and any transactions made with us.</p>
            <p>By using our services, you agree to be bound by these Terms. If you do not agree, please refrain from using our website or services.</p>
            
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>1. About Us</h3>
            <p>Hampers Nest operates from Hyderabad, India, and offers curated premium gifts, traditional and modern return gifts, and personalized hampers for all life's celebrations.</p>
            
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>2. Eligibility</h3>
            <p>To use our services, you must:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li>Be at least 18 years old or have parental/guardian consent.</li>
              <li>Provide accurate and complete personal and contact information.</li>
              <li>Use our services in accordance with applicable laws and these Terms.</li>
            </ul>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>3. Orders and Customization</h3>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li>All orders are subject to acceptance and product availability.</li>
              <li>Customization requests must be clear and confirmed in writing (via email or WhatsApp).</li>
              <li>Once customized materials or cards are produced, orders cannot be cancelled or returned unless there is a manufacturing defect or shipping error.</li>
              <li>We reserve the right to refuse any order at our sole discretion.</li>
            </ul>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>4. Pricing & Payment</h3>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li>All prices listed are in Indian Rupees (INR) and include applicable taxes, unless stated otherwise.</li>
              <li>Full payment or a custom booking advance (for bulk orders) must be made before dispatch via UPI, credit/debit card, net banking, or bank transfer.</li>
              <li>Prices are subject to change without prior notice, but confirmed/booked orders will not be affected.</li>
            </ul>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>5. Shipping & Delivery</h3>
            <p>Please refer to our <a href="/shipping-policy" style={{ color: 'var(--color-purple-dark)', textDecoration: 'underline', fontWeight: '600' }}>Shipping Policy</a> for details on delivery timelines, split shipments, and lost or returned packages.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>6. Returns & Refunds</h3>
            <p>Due to the nature of our personalized, custom-made, and perishable products, returns are not accepted. If a product is damaged in transit, please notify us within 24 hours of delivery with clear unboxing video/photo proof. Please refer to our Refund Policy for more information.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>7. Intellectual Property</h3>
            <p>All content on our website, including images, graphics, product designs, packaging styles, logos, text, and layout, is the intellectual property of Hampers Nest. Unauthorized use, copying, or distribution is strictly prohibited.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>8. User Conduct</h3>
            <p>You agree not to misuse our website or services, provide false details, upload any malicious code, or post abusive comments on our channels.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>9. Limitation of Liability</h3>
            <p>Hampers Nest shall not be liable for any indirect, incidental, or consequential damages arising from courier delays, Force Majeure events, or misuse of products after delivery. Our total liability will not exceed the value of the purchased product.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>10. Force Majeure</h3>
            <p>We are not liable for failure to perform our obligations due to events beyond our control, including natural disasters, strikes, wars, transport disruptions, or pandemics.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>11. Governing Law & Jurisdiction</h3>
            <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>12. Contact Us</h3>
            <p style={{ background: 'var(--color-lavender)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--color-beige)', marginTop: '1rem' }}>
              If you have any questions regarding these Terms, contact us:<br />
              <strong>Hampers Nest</strong><br />
              📧 Email: <a href="mailto:info@hampersnest.com" style={{ color: 'var(--color-purple-dark)', textDecoration: 'underline' }}>info@hampersnest.com</a><br />
              📞 WhatsApp: +91 7989202194
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
