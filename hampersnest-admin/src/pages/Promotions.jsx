import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';

export default function Promotions() {
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [activeTheme, setActiveTheme] = useState('theme-default');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const responseData = await apiRequest('/api/settings');
        const settings = responseData || {};
        setAnnouncementText(settings?.announcementText || '');
        setAnnouncementActive(!!settings?.announcementActive);
        setActiveTheme(settings?.activeTheme || 'theme-default');
      } catch (err) {
        console.error(err);
        setError('Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiRequest('/api/settings', {
        method: 'PUT',
        body: {
          announcementText,
          announcementActive,
          activeTheme
        }
      });
      setSuccess('Promotional settings and theme updated successfully!');
      
      // If the theme was updated, apply it to the admin page too to see it live!
      document.body.className = activeTheme;
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '15px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-gold)' }}></i>
        <p style={{ color: 'var(--color-gray-text)' }}>Loading campaign configurations...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div className="dashboard-panel">
        <div className="panel-header" style={{ borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h3><i className="fa-solid fa-bullhorn" style={{ color: 'var(--color-gold-dark)', marginRight: '10px' }}></i> Promotions & Festival Campaigns</h3>
        </div>

        {error && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FFE3E3', color: '#E53E3E', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i> {error}
          </div>
        )}

        {success && (
          <div style={{ background: '#F0FDF4', border: '1px solid #DCFCE7', color: '#15803D', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }}></i> {success}
          </div>
        )}

        <form onSubmit={handleSaveSettings}>
          {/* Theme Section */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: 'var(--color-purple)', marginBottom: '0.8rem' }}>
              <i className="fa-solid fa-palette" style={{ marginRight: '8px' }}></i>
              Active Storefront Theme
            </h4>
            <p style={{ color: 'var(--color-gray-text)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Select a theme to instantly change the color accents (buttons, header links, reviews) across the customer storefront.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              {/* Default Theme Card */}
              <label 
                className={`addon-checkbox-card ${activeTheme === 'theme-default' ? 'active' : ''}`}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', padding: '15px', alignItems: 'center', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--color-gray-border)' }}
              >
                <input 
                  type="radio" 
                  name="theme" 
                  checked={activeTheme === 'theme-default'}
                  onChange={() => setActiveTheme('theme-default')}
                  style={{ display: 'none' }}
                />
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #4A1D5F 50%, #C8A96B 50%)', marginBottom: '10px', border: '1px solid #fff', boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}></div>
                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>Default Elegant</span>
                <small style={{ color: '#777', fontSize: '0.75rem', marginTop: '4px' }}>Purple & Gold</small>
              </label>

              {/* Diwali Theme Card */}
              <label 
                className={`addon-checkbox-card ${activeTheme === 'theme-diwali' ? 'active' : ''}`}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', padding: '15px', alignItems: 'center', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--color-gray-border)' }}
              >
                <input 
                  type="radio" 
                  name="theme" 
                  checked={activeTheme === 'theme-diwali'}
                  onChange={() => setActiveTheme('theme-diwali')}
                  style={{ display: 'none' }}
                />
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #B22222 50%, #FFD700 50%)', marginBottom: '10px', border: '1px solid #fff', boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}></div>
                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>Diwali Festival</span>
                <small style={{ color: '#777', fontSize: '0.75rem', marginTop: '4px' }}>Crimson & Gold</small>
              </label>

              {/* Baby Shower Theme Card */}
              <label 
                className={`addon-checkbox-card ${activeTheme === 'theme-babyshower' ? 'active' : ''}`}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', padding: '15px', alignItems: 'center', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--color-gray-border)' }}
              >
                <input 
                  type="radio" 
                  name="theme" 
                  checked={activeTheme === 'theme-babyshower'}
                  onChange={() => setActiveTheme('theme-babyshower')}
                  style={{ display: 'none' }}
                />
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #F3A3B3 50%, #9ACD32 50%)', marginBottom: '10px', border: '1px solid #fff', boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}></div>
                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>Baby Shower</span>
                <small style={{ color: '#777', fontSize: '0.75rem', marginTop: '4px' }}>Pastel Pink & Sage</small>
              </label>

              {/* Spring Theme Card */}
              <label 
                className={`addon-checkbox-card ${activeTheme === 'theme-spring' ? 'active' : ''}`}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', padding: '15px', alignItems: 'center', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--color-gray-border)' }}
              >
                <input 
                  type="radio" 
                  name="theme" 
                  checked={activeTheme === 'theme-spring'}
                  onChange={() => setActiveTheme('theme-spring')}
                  style={{ display: 'none' }}
                />
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981 50%, #F59E0B 50%)', marginBottom: '10px', border: '1px solid #fff', boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}></div>
                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>Spring Blossom</span>
                <small style={{ color: '#777', fontSize: '0.75rem', marginTop: '4px' }}>Green & Orange</small>
              </label>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-border)', margin: '2rem 0' }} />

          {/* Categories Section Link */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: 'var(--color-purple)', marginBottom: '0.5rem' }}>
              <i className="fa-solid fa-layer-group" style={{ marginRight: '8px' }}></i>
              Storefront Categories
            </h4>
            <p style={{ color: 'var(--color-gray-text)', fontSize: '0.85rem', marginBottom: '1.2rem', lineHeight: '1.4' }}>
              Categories are now managed in their own dedicated panel. This allows adding, editing, and deleting categories with safety checks to ensure no catalog items are broken.
            </p>
            <Link 
              to="/categories" 
              className="btn-admin-secondary" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '0.55rem 1.2rem' }}
            >
              <i className="fa-solid fa-folder-open"></i> Go to Categories Manager
            </Link>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-border)', margin: '2rem 0' }} />

          {/* Announcement Bar Section */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: 'var(--color-purple)', marginBottom: '0.8rem' }}>
              <i className="fa-solid fa-rectangle-ad" style={{ marginRight: '8px' }}></i>
              Top Announcement Bar
            </h4>
            
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <input 
                type="checkbox" 
                id="banner-toggle"
                checked={announcementActive}
                onChange={(e) => setAnnouncementActive(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label htmlFor="banner-toggle" style={{ fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>
                Enable Announcement Bar on Storefront
              </label>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="banner-text">Announcement Text Message</label>
              <input 
                type="text" 
                id="banner-text"
                className="form-input"
                placeholder="e.g. Festival Season Sale: 15% Off on All Traditional Diya Hampers!"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                disabled={!announcementActive}
                required={announcementActive}
              />
              <small style={{ color: 'var(--color-gray-text)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                This message will slide in at the very top of the customer's browser window when they open the site.
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="submit" className="btn-admin" style={{ padding: '0.6rem 2rem' }} disabled={saving}>
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i> Save Campaign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
