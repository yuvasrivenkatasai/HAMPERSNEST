import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';

const POLICIES = {
  privacy: {
    title: "Privacy Policy",
    content: (
      <>
        <p>At Hampers Nest, we respect your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our website or use our services.</p>
        <h4>1. Information We Collect</h4>
        <p>We collect information you provide directly to us when placing an order, requesting a catalog or quote, signing up for announcements, or contacting us. This includes your name, email, WhatsApp/phone number, and shipping address.</p>
        <h4>2. How We Use Your Information</h4>
        <p>We use the collected information to process transactions, dispatch orders, respond to quotes, and coordinate custom gift hampers. We may also send updates regarding your orders or seasonal gifting opportunities via WhatsApp or email.</p>
        <h4>3. Data Security</h4>
        <p>Your personal data is stored securely. We do not sell, trade, or otherwise transfer your personally identifiable information to third parties, except for trusted shipping partners executing deliveries.</p>
      </>
    )
  },
  shipping: {
    title: "Shipping Policy",
    content: (
      <>
        <p>We strive to deliver your customized hampers and return gifts in pristine condition and right on time for your special events.</p>
        <h4>1. Processing and Delivery Timeline</h4>
        <p>Since most of our hampers are customized (including custom tags, ribbons, and personalized box styling), curation takes 2–5 business days. Standard delivery across India takes 3–5 business days post-dispatch. Express shipping is available for urgent event timelines.</p>
        <h4>2. Shipping Charges</h4>
        <p>Shipping rates depend on order size, weight, and delivery destination. Flat shipping promotions or bulk order shipping rates are calculated dynamically at quote confirmation. Any flat shipping fees applicable will be listed clearly in your checkout summary.</p>
        <h4>3. Hand-Delivery (Hyderabad)</h4>
        <p>For large bulk wedding return gifts or baby shower hampers in Hyderabad, we coordinate dedicated direct hand-delivery to ensure delicate brass or glass items remain absolutely intact.</p>
      </>
    )
  },
  refund: {
    title: "Refund & Cancellation Policy",
    content: (
      <>
        <p>Our focus is complete customer satisfaction. Please read the terms below regarding cancellations and refunds.</p>
        <h4>1. Cancellations</h4>
        <p>For custom curated hampers and bulk return gifts, cancellations are only accepted within 24 hours of payment. Once customization design approvals are given and raw materials/tags are produced, orders cannot be cancelled.</p>
        <h4>2. Damaged or Incorrect Items</h4>
        <p>We pack our hampers with extreme care. In the rare event that an item is damaged during transit, please share an unboxing video with our WhatsApp support within 24 hours of delivery. We will immediately arrange a replacement or partial refund.</p>
        <h4>3. Refunds</h4>
        <p>Approved refunds are processed back to the original payment method within 5–7 working days.</p>
      </>
    )
  },
  terms: {
    title: "Terms & Conditions",
    content: (
      <>
        <p>Welcome to Hampers Nest. By browsing this website, you agree to comply with and be bound by the following terms and conditions of use.</p>
        <h4>1. Product Customization & Variance</h4>
        <p>Many of our products are handcrafted by local artisans (especially brass, silver, and wood items). Subtle variations in color, texture, and pattern are natural characteristics of handcrafted items and are not considered defects.</p>
        <h4>2. Pricing and Payments</h4>
        <p>All prices listed are in INR (Indian Rupees) unless specified otherwise. Full payment or a custom booking advance (for bulk orders) is required to begin the curation process.</p>
        <h4>3. Intellectual Property</h4>
        <p>All designs, website graphics, logo, and photography displayed are the intellectual property of Hampers Nest. Reproduction without prior written consent is strictly prohibited.</p>
      </>
    )
  }
};

export default function Policies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'privacy';
  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    if (POLICIES[tabParam]) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('privacy');
    }
    window.scrollTo(0, 0);
  }, [tabParam]);

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  return (
    <div className="page-container">
      <SEO 
        title={`${POLICIES[activeTab]?.title || 'Policies'} | Hampers Nest`}
        description="Read Hampers Nest policies including Shipping timelines, Refund procedures, and Terms & Conditions."
        keywords="hampersnest policies, shipping return gifts, return policy hampers, terms and conditions"
      />
      
      {/* Page Header */}
      <div className="page-header-banner">
        <div className="container" style={{ padding: 0 }}>
          <span className="section-subtitle" style={{ marginBottom: '0.5rem' }}>Legal & Guidelines</span>
          <h2>Store Policies</h2>
          <p>Read about our shipping guidelines, refund terms, and customer privacy details</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="policies-layout" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          {/* Tabs Sidebar */}
          <div className="policies-sidebar" style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.keys(POLICIES).map((key) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`policy-tab-btn ${activeTab === key ? 'active' : ''}`}
                style={{
                  textAlign: 'left',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-beige)',
                  background: activeTab === key ? 'var(--gold-gradient)' : 'var(--color-white)',
                  color: activeTab === key ? 'var(--color-white)' : 'var(--color-purple-dark)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: activeTab === key ? 'var(--shadow-gold)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {POLICIES[key].title}
              </button>
            ))}
          </div>

          {/* Policy Content */}
          <div className="policies-content glass-panel" style={{ flex: '3 1 500px', padding: '2.5rem', background: 'var(--color-white)', borderRadius: '12px', border: '1px solid var(--color-beige)', boxShadow: 'var(--shadow-premium)' }}>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--color-purple-dark)', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-beige)', paddingBottom: '0.8rem' }}>
              {POLICIES[activeTab]?.title}
            </h3>
            <div style={{ color: 'var(--color-charcoal)', lineHeight: 1.8, fontSize: '0.92rem' }} className="policy-text-block">
              {POLICIES[activeTab]?.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
