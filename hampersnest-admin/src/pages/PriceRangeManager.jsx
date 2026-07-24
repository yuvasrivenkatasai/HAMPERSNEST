import React, { useState, useEffect } from 'react';
import { apiRequest, API_BASE } from '../utils/api';

export default function PriceRangeManager() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/settings');
      setCards(data?.priceRangeCards || []);
    } catch (err) {
      setError('Failed to load price range categories');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newCards) => {
    try {
      setSaving(true);
      setError(null);
      await apiRequest('/api/settings', {
        method: 'PUT',
        body: { priceRangeCards: newCards }
      });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = (newCards) => {
    setCards(newCards);
    saveSettings(newCards);
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
    // Wait for blur to save input text, or save toggles immediately
    if (field === 'isActive' || field === 'image') {
      handleUpdate(newCards);
    } else {
      setCards(newCards);
    }
  };

  const handleBlur = () => {
    saveSettings(cards);
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    setUploadingIdx(index);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('adminToken');
      // watermarkEnabled=false so these cover images don't get watermarked
      const response = await fetch(`${API_BASE}/api/upload?folder=showcase&watermarkEnabled=false`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      if (response.ok) {
        // Backend returns data.url for the uploaded image
        handleChange(index, 'image', data.url);
      } else {
        alert(data.message || 'Image upload failed');
      }
    } catch (error) {
      console.error(error);
      alert('Error uploading image');
    } finally {
      setUploadingIdx(null);
      e.target.value = ''; // Reset input so same file can be selected again
    }
  };

  const handleRemoveImage = (index) => {
    handleChange(index, 'image', '');
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
    const reordered = newCards.map((c, i) => ({ ...c, sortOrder: i + 1 }));
    handleUpdate(reordered);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><i className="fa-solid fa-spinner fa-spin" style={{ color: 'var(--color-gold)', fontSize: '1.5rem' }}></i></div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#F9FAFB', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--color-beige)', paddingBottom: '8px' }}>
        <div>
          <h4 style={{ color: 'var(--color-purple)', margin: 0 }}>
            <i className="fa-solid fa-money-bill-wave"></i> Price Range Categories
          </h4>
          <p style={{ color: 'var(--color-gray-text)', fontSize: '0.85rem', marginTop: '4px' }}>These categories appear first in the Shop By Category section.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {saving && <span style={{ fontSize: '0.8rem', color: '#6B7280' }}><i className="fa-solid fa-circle-notch fa-spin"></i> Saving...</span>}
          {message && <span style={{ fontSize: '0.8rem', color: 'var(--color-delivered)' }}>{message}</span>}
          <button type="button" onClick={handleAddCard} className="btn-admin">
            <i className="fa-solid fa-plus"></i> Add Price Range
          </button>
        </div>
      </div>

      {error && <div className="login-error" style={{ marginBottom: '15px' }}>{error}</div>}

      <div style={{ display: 'grid', gap: '20px' }}>
        {cards.map((card, idx) => (
          <div key={card.id} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '15px', display: 'flex', gap: '20px' }}>
            
            {/* Unified Image Upload (Exactly matches CategoryShowcaseManager) */}
            <div style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Cover Image</label>
                {card.image ? (
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px' }}>
                    <img src={card.image} alt="Category" style={{ width: '120px', height: '120px', borderRadius: '16px', objectFit: 'cover', border: '2px solid var(--color-gold)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <button type="button" onClick={() => handleRemoveImage(idx)} title="Remove Image"
                      style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: '#EF4444', color: '#fff', border: 'none', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', borderRadius: '16px', border: '2px dashed #D1D5DB', cursor: 'pointer', background: '#FAFAFA', transition: 'all 0.2s ease' }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, idx)} />
                    {uploadingIdx === idx ? (
                      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.5rem', color: 'var(--color-gold)' }}></i>
                    ) : (
                      <>
                        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '1.5rem', color: '#9CA3AF', marginBottom: '6px' }}></i>
                        <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Upload</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>

            {/* Details */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', alignContent: 'start' }}>
              
              <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label className="toggle-switch" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    checked={card.isActive} 
                    onChange={(e) => handleChange(idx, 'isActive', e.target.checked)}
                  />
                  <span style={{ fontWeight: 600, color: card.isActive ? 'var(--color-gold-dark)' : '#777' }}>
                    {card.isActive ? 'Visible' : 'Hidden'}
                  </span>
                </label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button type="button" onClick={() => moveCard(idx, 'up')} disabled={idx === 0} className="btn-admin-secondary" style={{ padding: '5px 10px' }} title="Move Up"><i className="fa-solid fa-arrow-up"></i></button>
                  <button type="button" onClick={() => moveCard(idx, 'down')} disabled={idx === cards.length - 1} className="btn-admin-secondary" style={{ padding: '5px 10px' }} title="Move Down"><i className="fa-solid fa-arrow-down"></i></button>
                  <button type="button" onClick={() => handleRemoveCard(idx)} className="btn-admin-secondary" style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '5px 10px' }} title="Delete"><i className="fa-solid fa-trash"></i></button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={card.name}
                  onChange={(e) => handleChange(idx, 'name', e.target.value)}
                  onBlur={handleBlur}
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
                  onBlur={handleBlur}
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
                  onBlur={handleBlur}
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
                  onBlur={handleBlur}
                  placeholder="No limit"
                />
                <small style={{ color: '#777' }}>Leave empty for "Above X"</small>
              </div>

            </div>
          </div>
        ))}
        
        {cards.length === 0 && (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <i className="fa-solid fa-tags" style={{ fontSize: '2rem', color: '#ccc', marginBottom: '1rem' }}></i>
            <p>No price ranges configured yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
