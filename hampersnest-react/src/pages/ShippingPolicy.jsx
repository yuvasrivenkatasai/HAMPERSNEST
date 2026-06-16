import React, { useEffect } from 'react';
import SEO from '../components/SEO';

export default function ShippingPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container">
      <SEO 
        title="Shipping Policy | Hampers Nest"
        description="Read Hampers Nest shipping policy. We aim to deliver your gifts with care, speed, and attention to detail across India and globally."
        keywords="hampersnest shipping policy, delivery timeline, bulk shipping, international shipping"
      />
      
      {/* Page Header */}
      <div className="page-header-banner">
        <div className="container" style={{ padding: 0 }}>
          <span className="section-subtitle" style={{ marginBottom: '0.5rem' }}>Delivery & Logistics</span>
          <h2>Shipping Policy</h2>
          <p>Care, speed, and premium handling for your special events</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '800px' }}>
        <div className="policies-content glass-panel" style={{ padding: '2.5rem', background: 'var(--color-white)', borderRadius: '12px', border: '1px solid var(--color-beige)', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ color: 'var(--color-charcoal)', lineHeight: 1.8, fontSize: '0.95rem' }} className="policy-text-block">
            <p>At Hampers Nest, we aim to deliver your gifts with care, speed, and attention to detail. Below are the terms and conditions that govern our shipping process.</p>
            
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>📍 Shipping Coverage</h3>
            <p>We currently offer shipping across India, with free delivery available on all orders above a certain value.</p>
            <p><em>Note: Delivery to remote or restricted areas may take additional time or incur a surcharge (which will be communicated during checkout or customization finalization).</em></p>
            
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>⏱️ Processing Time</h3>
            <p>Orders are processed within 1–2 business days after confirmation. For bulk or custom curated hampers, processing/curation timeline is discussed individually and begins post advance payment.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>Domestic Orders (India)</h3>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li><strong>Shipping Charges:</strong>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <li>Orders below ₹3,000 – Shipping charges apply based on weight and destination.</li>
                  <li>Orders above ₹3,000 – Free standard delivery across India.</li>
                </ul>
              </li>
              <li style={{ marginTop: '1rem' }}><strong>Delivery Timeline:</strong>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <li>Standard Delivery: 7–14 working days.</li>
                  <li>Custom or Bulk Orders: Timeline will be discussed and agreed individually with the customer during curation.</li>
                </ul>
              </li>
              <li style={{ marginTop: '1rem' }}><strong>Shipping Methods:</strong>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <li>Standard Courier / Speed Post.</li>
                  <li>For urgent deliveries: Bus parcel service or Premium express courier (additional charges apply).</li>
                </ul>
              </li>
            </ul>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>International Orders</h3>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li><strong>Shipping Charges:</strong> Calculated during checkout/billing. Any changes or custom rates will be communicated before dispatch.</li>
              <li><strong>Delivery Timeline:</strong> 7–20 business days (varies by destination, order volume, or customization). Orders placed on weekends or public holidays are processed on the next business day.</li>
              <li><strong>Shipping Method:</strong> International Courier Services.</li>
              <li><strong>Note:</strong> The customer/recipient is responsible for any local custom duties, taxes, or customs clearance fees applicable in the destination country.</li>
            </ul>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>Order Tracking & Notifications</h3>
            <p>Once your order is dispatched, you will receive:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li>Shipping confirmation via email/WhatsApp.</li>
              <li>Tracking ID & carrier link.</li>
              <li>Notice if your order is split into multiple shipments (no extra shipping charges apply for split shipments).</li>
            </ul>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>Urgent Delivery Requests (India Only)</h3>
            <p>Available on request. Expedited orders can be shipped via Bus Parcel or Premium Courier services. All extra charges for expedited delivery are borne by the customer.</p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>Important Shipping Terms</h3>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li><strong>Delayed or Lost Orders:</strong> Domestic orders are considered lost after 15 business days in transit; international orders after 30 business days. We are not liable for courier transit delays or Force Majeure events (natural disasters, strikes, pandemics, etc.).</li>
              <li><strong>Wrong or Incomplete Address:</strong> If packages are returned to us due to incorrect or incomplete address details provided by the customer, re-delivery charges must be paid by the customer.</li>
              <li><strong>Tampered Packages:</strong> If the package appears damaged or tampered with at the time of delivery, please do not accept it. Once accepted, it is assumed the parcel was received in good condition.</li>
              <li><strong>Delivery Availability:</strong> Delivery may not be possible on Sundays and National Holidays. Courier partners may not call prior to delivery, so please ensure someone is available at the address to receive the parcel.</li>
            </ul>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)', marginTop: '2rem', marginBottom: '1rem' }}>Contact Us</h3>
            <p style={{ background: 'var(--color-lavender)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--color-beige)', marginTop: '1rem' }}>
              For any shipping queries, reach out to us at:<br />
              📧 Email: <a href="mailto:info@hampersnest.com" style={{ color: 'var(--color-purple-dark)', textDecoration: 'underline' }}>info@hampersnest.com</a><br />
              📞 WhatsApp Support: +91 7989202194
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
