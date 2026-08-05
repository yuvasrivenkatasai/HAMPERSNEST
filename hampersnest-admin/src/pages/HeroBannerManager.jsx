import React, { useState, useEffect } from 'react';
import { apiRequest, API_BASE } from '../utils/api';

export default function HeroBannerManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [banner, setBanner] = useState({
    title: 'Main Homepage Hero',
    mainImage: null,
    floatingImageTop: null,
    floatingImageBottom: null,
    isActive: true
  });

  // Fetch current banner settings
  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/hero-banner');
      if (data) {
        setBanner(data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch hero banner settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = () => {
    setBanner((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  // Upload an image via the backend /api/upload endpoint
  const handleUploadImage = async (field, file) => {
    if (!file) return;

    try {
      setError('');
      setSaving(true);
      
      const formData = new FormData();
      formData.append('image', file);

      // Upload the file
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/api/upload?folder=hero`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Image upload failed');
      }

      const uploadRes = await response.json();
      
      if (uploadRes && uploadRes.url) {
        setBanner((prev) => ({ ...prev, [field]: uploadRes.url }));
        setSuccess(`${field} uploaded successfully. Don't forget to save changes!`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Image upload failed', err);
      setError(`Failed to upload ${field}. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = (field) => {
    setBanner((prev) => ({ ...prev, [field]: null }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const data = await apiRequest('/api/hero-banner', {
        method: 'PUT',
        body: banner
      });
      setBanner(data);
      setSuccess('Hero banner settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset the hero banner to the default assets?')) return;
    try {
      setSaving(true);
      setError('');
      await apiRequest('/api/hero-banner', { method: 'DELETE' });
      await fetchBanner();
      setSuccess('Hero banner reset to defaults.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to reset banner.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <p>Loading hero banner configurations...</p>
      </div>
    );
  }

  return (
    <div className="hero-banner-manager">
      <div className="panel-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-purple-dark)' }}>Hero Banner Manager</h2>
          <p style={{ color: 'var(--color-gray-text)', fontSize: '0.9rem' }}>Customize the storefront homepage images without touching code.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-admin-secondary" 
            onClick={handleReset}
            disabled={saving}
            style={{ color: '#dc3545', borderColor: '#dc3545' }}
          >
            <i className="fa-solid fa-rotate-left"></i> Reset Defaults
          </button>
          <button 
            className="btn-admin" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} Save Changes
          </button>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}
      {success && <div className="login-error" style={{ background: 'rgba(25,135,84,0.1)', color: '#198754', borderColor: '#198754' }}>{success}</div>}

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Settings Panel */}
        <div className="dashboard-panel">
          <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-gray-light)', padding: '1rem', borderRadius: '8px' }}>
            <div>
              <label className="form-label" style={{ marginBottom: 0 }}>Enable Custom Hero Banner</label>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-text)', margin: 0 }}>If disabled, the homepage will fallback to the default hardcoded images.</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={banner.isActive} onChange={handleToggleActive} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="dashboard-panel" style={{ background: 'var(--color-ivory)' }}>
          <h3 className="form-label" style={{ marginBottom: '1.5rem', fontSize: '1.1rem', borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '0.5rem' }}>
            Storefront Replica Preview
          </h3>
          
          <div className="hero-replica-container">
            {/* Left Col Simulation */}
            <div className="hero-replica-left">
              <h1>Luxury Gifts That Leave A Lasting Impression</h1>
              <p>Thoughtfully crafted hampers for weddings, celebrations and memorable occasions.</p>
              <div className="fake-btn">Explore Collections</div>
            </div>

            {/* Right Col: The Image Controls */}
            <div className="hero-replica-right">
              
              {/* Main Image Center */}
              <div className="replica-slot replica-main">
                <ImageUploader 
                  label="Main Banner"
                  recommended="1600 x 1600px"
                  imageUrl={banner.mainImage || '/assets/hero_banner.webp'}
                  isFallback={!banner.mainImage}
                  onUpload={(file) => handleUploadImage('mainImage', file)}
                  onRemove={() => handleRemoveImage('mainImage')}
                  saving={saving}
                />
              </div>

              {/* Floating Top Image */}
              <div className="replica-slot replica-float-top">
                <ImageUploader 
                  label="Top Floating"
                  recommended="600 x 600px"
                  imageUrl={banner.floatingImageTop || '/assets/wedding_gift.webp'}
                  isFallback={!banner.floatingImageTop}
                  onUpload={(file) => handleUploadImage('floatingImageTop', file)}
                  onRemove={() => handleRemoveImage('floatingImageTop')}
                  saving={saving}
                  small
                />
              </div>

              {/* Floating Bottom Image */}
              <div className="replica-slot replica-float-bottom">
                <ImageUploader 
                  label="Bottom Floating"
                  recommended="600 x 600px"
                  imageUrl={banner.floatingImageBottom || '/assets/brass_cup.webp'}
                  isFallback={!banner.floatingImageBottom}
                  onUpload={(file) => handleUploadImage('floatingImageBottom', file)}
                  onRemove={() => handleRemoveImage('floatingImageBottom')}
                  saving={saving}
                  small
                />
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Sub-component for individual image slots
function ImageUploader({ label, recommended, imageUrl, isFallback, onUpload, onRemove, saving, small }) {
  return (
    <div className={`image-slot-card ${small ? 'slot-small' : ''}`}>
      <div className="slot-preview">
        <img src={imageUrl} alt={label} className={isFallback ? 'img-fallback' : 'img-custom'} />
        {isFallback && <div className="fallback-badge">Default Asset</div>}
      </div>
      
      <div className="slot-controls">
        <div className="slot-info">
          <strong>{label}</strong>
          <span>Rec: {recommended}</span>
        </div>
        
        <div className="slot-actions">
          <label className="btn-upload-sm">
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onUpload(e.target.files[0]);
                }
              }}
              disabled={saving}
            />
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </label>
          
          {!isFallback && (
            <button className="btn-remove-sm" onClick={onRemove} disabled={saving} title="Remove Image">
              <i className="fa-solid fa-trash"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
