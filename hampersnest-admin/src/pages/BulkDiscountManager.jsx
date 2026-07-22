import React from 'react';

export default function BulkDiscountManager({ settingsData, setSettingsData }) {
  const bulkSettings = settingsData.bulkDiscountSettings || {
    enabled: false,
    ruleType: 'Product Quantity',
    heading: '🎉 Bulk Order Discounts',
    footerNote: '✓ Automatically applied at checkout.',
    rules: [
      { minQty: 50, discountPercent: 5 },
      { minQty: 100, discountPercent: 10 },
      { minQty: 200, discountPercent: 15 }
    ]
  };

  const handleUpdate = (field, value) => {
    setSettingsData(prev => ({
      ...prev,
      bulkDiscountSettings: {
        ...bulkSettings,
        [field]: value
      }
    }));
  };

  const handleAddRule = () => {
    const rules = [...(bulkSettings.rules || [])];
    const lastRule = rules[rules.length - 1];
    rules.push({
      minQty: lastRule ? lastRule.minQty + 50 : 50,
      discountPercent: lastRule ? lastRule.discountPercent + 5 : 5
    });
    handleUpdate('rules', rules);
  };

  const handleRemoveRule = (index) => {
    const rules = [...(bulkSettings.rules || [])];
    rules.splice(index, 1);
    handleUpdate('rules', rules);
  };

  const handleRuleChange = (index, field, value) => {
    const rules = [...(bulkSettings.rules || [])];
    rules[index] = { ...rules[index], [field]: Number(value) };
    
    // Sort and validation is typically done on blur or submit, but we can enforce it loosely here or sort before render.
    // For now just update the value
    handleUpdate('rules', rules);
  };

  const validateRules = () => {
    // Check if quantities increase and percentages increase, no negatives, no duplicates
    const sorted = [...(bulkSettings.rules || [])].sort((a,b) => a.minQty - b.minQty);
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].minQty < 0 || sorted[i].discountPercent < 0) return "Values cannot be negative.";
      if (i > 0) {
        if (sorted[i].minQty === sorted[i-1].minQty) return "Duplicate minimum quantities found.";
        if (sorted[i].discountPercent <= sorted[i-1].discountPercent) return "Discount percentages must increase as quantity increases.";
      }
    }
    return null;
  };

  const validationError = validateRules();

  return (
    <div style={{ padding: '20px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#F9FAFB', marginBottom: '20px' }}>
      <h4 style={{ color: 'var(--color-purple)', borderBottom: '1px solid var(--color-beige)', paddingBottom: '8px', marginBottom: '15px' }}>
        <i className="fa-solid fa-tags"></i> Bulk Order Discounts
      </h4>

      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label className="toggle-switch" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
          <input 
            type="checkbox" 
            checked={bulkSettings.enabled} 
            onChange={(e) => handleUpdate('enabled', e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span className="slider round" style={{ 
            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: bulkSettings.enabled ? 'var(--color-gold)' : '#ccc', 
            transition: '.4s', borderRadius: '24px' 
          }}>
            <span style={{
              position: 'absolute', content: '""', height: '18px', width: '18px', 
              left: bulkSettings.enabled ? '22px' : '3px', bottom: '3px', 
              backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
            }}></span>
          </span>
        </label>
        <span style={{ fontWeight: 600, color: bulkSettings.enabled ? 'var(--color-gold-dark)' : '#777' }}>
          {bulkSettings.enabled ? 'Feature Enabled' : 'Feature Disabled'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Left Column: Form */}
        <div>
          <div className="form-group">
            <label className="form-label">Rule Type</label>
            <select 
              className="form-select" 
              value={bulkSettings.ruleType}
              onChange={(e) => handleUpdate('ruleType', e.target.value)}
            >
              <option value="Product Quantity">Product Quantity</option>
              <option value="Total Cart Quantity" disabled>Total Cart Quantity (Coming Soon)</option>
            </select>
            <small style={{ color: '#777' }}>Currently applied based on the quantity of a single product item.</small>
          </div>

          <div className="form-group">
            <label className="form-label">Heading</label>
            <input 
              type="text" 
              className="form-input" 
              value={bulkSettings.heading}
              onChange={(e) => handleUpdate('heading', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Footer Note</label>
            <input 
              type="text" 
              className="form-input" 
              value={bulkSettings.footerNote}
              onChange={(e) => handleUpdate('footerNote', e.target.value)}
            />
          </div>

          <label className="form-label">Discount Rules</label>
          <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
            {bulkSettings.rules && bulkSettings.rules.map((rule, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <small style={{ display: 'block', marginBottom: '4px', color: '#666' }}>Min Qty</small>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={rule.minQty} 
                    onChange={(e) => handleRuleChange(idx, 'minQty', e.target.value)} 
                    min="1"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <small style={{ display: 'block', marginBottom: '4px', color: '#666' }}>Discount %</small>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={rule.discountPercent} 
                    onChange={(e) => handleRuleChange(idx, 'discountPercent', e.target.value)} 
                    min="1"
                    max="100"
                  />
                </div>
                <button type="button" onClick={() => handleRemoveRule(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', marginTop: '22px' }}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            ))}
            
            {validationError && (
              <div style={{ color: '#EF4444', fontSize: '0.85rem', marginBottom: '10px' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {validationError}
              </div>
            )}

            <button type="button" onClick={handleAddRule} style={{ background: '#f0f0f0', border: '1px dashed #ccc', padding: '8px', width: '100%', borderRadius: '6px', cursor: 'pointer', color: '#555', fontWeight: 500 }}>
              <i className="fa-solid fa-plus"></i> Add Rule
            </button>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div>
          <label className="form-label">Live Preview (Storefront View)</label>
          <div style={{ 
            background: '#fff', 
            border: '1px solid var(--color-gold-light)', 
            borderRadius: '12px', 
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <h5 style={{ 
              color: 'var(--color-purple)', 
              fontSize: '1rem', 
              fontWeight: 600, 
              textAlign: 'center',
              marginBottom: '15px'
            }}>{bulkSettings.heading}</h5>
            
            <div style={{ borderTop: '2px dashed var(--color-beige)', borderBottom: '2px dashed var(--color-beige)', padding: '15px 0', margin: '15px 0' }}>
              {(bulkSettings.rules || []).sort((a,b) => a.minQty - b.minQty).map((rule, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: idx < bulkSettings.rules.length - 1 ? '1px solid #f5f5f5' : 'none'
                }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>{rule.minQty}+ Pieces</span>
                  <span style={{ 
                    background: 'var(--color-gold-light)', 
                    color: 'var(--color-gold-dark)', 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem', 
                    fontWeight: 700 
                  }}>SAVE {rule.discountPercent}%</span>
                </div>
              ))}
            </div>
            
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#777', margin: 0 }}>
              {bulkSettings.footerNote}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
