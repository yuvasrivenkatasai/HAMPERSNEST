import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';

export default function PolicyPage({ slug }) {
  const { id } = useParams();
  const { settings } = useCart();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const policyId = slug || id;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [policyId]);

  useEffect(() => {
    if (settings && settings.customPolicies) {
      const foundPolicy = settings.customPolicies.find(p => p.id === policyId);
      setPolicy(foundPolicy || null);
      setLoading(false);
    } else if (settings) {
      // settings loaded but no policies array found
      setLoading(false);
    }
  }, [settings, policyId]);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--color-gold)' }}></i>
      </div>
    );
  }

  if (!policy || !policy.isPublished) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page-container">
      <SEO 
        title={`${policy.title} | ${settings?.storeName || 'Hampers Nest'}`}
        description={policy.description || `Read the ${policy.title} for ${settings?.storeName || 'Hampers Nest'}.`}
      />
      
      {/* Page Header */}
      <div className="page-header-banner">
        <div className="container" style={{ padding: 0 }}>
          {policy.subtitle && <span className="section-subtitle" style={{ marginBottom: '0.5rem' }}>{policy.subtitle}</span>}
          <h2>{policy.title}</h2>
          {policy.lastUpdated && <p>Last Updated: {policy.lastUpdated}</p>}
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '800px' }}>
        <div className="policies-content glass-panel" style={{ padding: '2.5rem', background: 'var(--color-white)', borderRadius: '12px', border: '1px solid var(--color-beige)', boxShadow: 'var(--shadow-premium)' }}>
          <div 
            className="policy-text-block" 
            style={{ color: 'var(--color-charcoal)', lineHeight: 1.8, fontSize: '0.95rem' }}
            dangerouslySetInnerHTML={{ __html: policy.content }}
          />
        </div>
      </div>
    </div>
  );
}
