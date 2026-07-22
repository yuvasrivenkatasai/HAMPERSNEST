import React, { useState } from 'react';
import { API_BASE } from '../config';

export default function PriceRangeManager({ settingsData, setSettingsData }) {
  const cards = settingsData.priceRangeCards || [];
  
  const [uploadingIdx, setUploadingIdx] = useState(null);

  const handleUpdate = (newCards) => {
    setSettingsData(prev => ({
      ...prev,
      priceRangeCards: newCards
    }));
  };

  const handleAddCard = () => {
    const newCards = [...cards, {
      id: `price-${Date.now()}`,
      name: 'New Price Range',
      slug: `range-${Date.now()}`,
      minPrice: 0,
      maxPrice: 100,
      image: '',
      sortOrder: cards.length + 1,
      isActive: true
    }];
    handleUpdate(newCards);
  };

  const handleRemoveCard = (index) => {
    const newCards = [...cards];
    newCards.splice(index, 1);
    handleUpdate(newCards);
  };

  const handleChange = (index, field, value) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    handleUpdate(newCards);
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingIdx(index);
    const formData = new FormData();
    formData.append('image', file);

    try {
      // We pass watermarkEnabled=false specifically so category images aren't watermarked
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/upload?folder=showcase&watermarkEnabled=false`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        handleChange(index, 'image', data.imageUrl);
      } else {
        alert('Image upload failed');
      }
    } catch (error) {
      console.error(error);
      alert('Error uploading image');
    } finally {
      setUploadingIdx(null);
    }
  };

  const moveCard = (index, direction) => {
    const newCards = [...cards];
    if (direction === 'up' && index > 0) {
      const temp = newCards[index - 1];
      newCards[index - 1] = newCards[index];
      newCards[index] = temp;
    } else if (direction === 'down' && index < newCards.length - 1) {
      const temp = newCards[index + 1];
      newCards[index + 1] = newCards[index];
      newCards[index] = temp;
    }
    // Update sort orders implicitly by array position, or explicitly:
    const reordered = newCards.map((c, i) => ({ ...c, sortOrder: i + 1 }));
    handleUpdate(reordered);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#F9FAFB', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--color-beige)', paddingBottom: '8px' }}>
        <h4 style={{ color: 'var(--color-purple)', margin: 0 }}>
          <i className="fa-solid fa-money-bill-wave"></i> Shop By Budget Categories
        </h4>
        <button type="button" onClick={handleAddCard} className="btn btn-primary btn-sm">
          <i className="fa-solid fa-plus"></i> Add Price Range
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {cards.map((card, idx) => (
          <div key={card.id} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '15px', display: 'flex', gap: '20px' }}>
            
            {/* Image Preview & Upload */}
            <div style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ 
                width: '100%', aspectRatio: '4/5', background: '#f0f0f0', borderRadius: '8px', overflow: 'hidden',
                position: 'relative', border: '1px dashed #ccc'
              }}>
                {card.image ? (
                  <img src={card.image} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    No Image
                  </div>
                )}
                {uploadingIdx === idx && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="spinner"></span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <label className="btn btn-secondary btn-sm" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '4px' }}>
                  {card.image ? 'Replace' : 'Upload'}
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageUpload(e, idx)} />
                </label>
                {card.image && (
                  <button type="button" onClick={() => handleChange(idx, 'image', '')} className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Details */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', alignContent: 'start' }}>
              
              <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between' }}>
                <label className="toggle-switch" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    checked={card.isActive} 
                    onChange={(e) => handleChange(idx, 'isActive', e.target.checked)}
                  />
                  <span style={{ fontWeight: 600, color: card.isActive ? 'var(--color-gold-dark)' : '#777' }}>
                    {card.isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button type="button" onClick={() => moveCard(idx, 'up')} disabled={idx === 0} className="btn btn-secondary btn-sm" title="Move Up"><i className="fa-solid fa-arrow-up"></i></button>
                  <button type="button" onClick={() => moveCard(idx, 'down')} disabled={idx === cards.length - 1} className="btn btn-secondary btn-sm" title="Move Down"><i className="fa-solid fa-arrow-down"></i></button>
                  <button type="button" onClick={() => handleRemoveCard(idx)} className="btn btn-danger btn-sm" title="Delete"><i className="fa-solid fa-trash-can"></i></button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={card.name}
                  onChange={(e) => handleChange(idx, 'name', e.target.value)}
                  placeholder="e.g. Under ₹100"
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={card.slug}
                  onChange={(e) => handleChange(idx, 'slug', e.target.value)}
                  placeholder="e.g. under-100"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Min Price (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={card.minPrice || ''}
                  onChange={(e) => handleChange(idx, 'minPrice', e.target.value === '' ? null : Number(e.target.value))}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Max Price (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={card.maxPrice || ''}
                  onChange={(e) => handleChange(idx, 'maxPrice', e.target.value === '' ? null : Number(e.target.value))}
                  placeholder="No limit"
                />
                <small style={{ color: '#777' }}>Leave empty for "Above X"</small>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
