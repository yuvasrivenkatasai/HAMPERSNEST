import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [settingsData, setSettingsData] = useState({
    storeName: 'HampersNest',
    contactEmail: 'contact@hampersnest.com',
    currency: 'INR',
    shippingRate: '0',
    announcementText: '',
    announcementActive: false
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsMessage, setSettingsMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setSettingsLoading(true);
      const data = await apiRequest('/api/settings');
      const safeData = data || {};
      setSettingsData(prev => ({
        ...prev,
        ...safeData,
        shippingRate: safeData?.shippingRate || '0' // Ensure string for input
      }));
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      setMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsMessage(null);
    try {
      await apiRequest('/api/settings', {
        method: 'PUT',
        body: settingsData
      });
      setSettingsMessage('Settings saved successfully!');
      setTimeout(() => setSettingsMessage(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    }
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h2 style={{ color: 'var(--color-purple-dark)' }}>System Settings</h2>
          <p style={{ color: 'var(--color-gray-text)', fontSize: '0.9rem' }}>Configure global settings and security</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Global Settings Panel */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3><i className="fa-solid fa-globe color-gold"></i> Global Store Settings</h3>
          </div>
          
          {settingsLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ color: 'var(--color-gold)', fontSize: '1.5rem' }}></i>
            </div>
          ) : (
            <form onSubmit={handleSettingsSubmit}>
              {settingsMessage && <div style={{ background: 'rgba(25, 135, 84, 0.1)', color: 'var(--color-delivered)', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>{settingsMessage}</div>}
              
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <input 
                  type="text" 
                  name="storeName"
                  className="form-input" 
                  value={settingsData.storeName}
                  onChange={handleSettingsChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input 
                  type="email" 
                  name="contactEmail"
                  className="form-input" 
                  value={settingsData.contactEmail}
                  onChange={handleSettingsChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Default Currency</label>
                  <select 
                    name="currency"
                    className="form-select"
                    value={settingsData.currency}
                    onChange={handleSettingsChange}
                  >
                    <option value="INR">₹ INR</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="GBP">£ GBP</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Flat Shipping Rate</label>
                  <input 
                    type="number" 
                    name="shippingRate"
                    className="form-input" 
                    min="0"
                    value={settingsData.shippingRate}
                    onChange={handleSettingsChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Announcement Banner Text</label>
                <input 
                  type="text" 
                  name="announcementText"
                  className="form-input" 
                  value={settingsData.announcementText}
                  onChange={handleSettingsChange}
                />
              </div>
              
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  name="announcementActive"
                  id="announcementActive"
                  checked={settingsData.announcementActive}
                  onChange={handleSettingsChange}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="announcementActive" style={{ margin: 0, fontWeight: 500 }}>Show Announcement Banner</label>
              </div>

              <button type="submit" className="btn-admin mt-2">
                Save Settings
              </button>
            </form>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Security Settings Panel */}
          <div className="dashboard-panel" style={{ margin: 0 }}>
            <div className="panel-header">
              <h3><i className="fa-solid fa-shield-halved color-gold"></i> Security Settings</h3>
            </div>
            
            <form onSubmit={handlePasswordChange}>
              {error && <div className="login-error" style={{ padding: '10px', marginBottom: '15px' }}>{error}</div>}
              {message && <div style={{ background: 'rgba(25, 135, 84, 0.1)', color: 'var(--color-delivered)', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>{message}</div>}
              
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  required 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  required 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              <button type="submit" className="btn-admin" disabled={loading}>
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* System Info Panel */}
          <div className="dashboard-panel" style={{ margin: 0 }}>
            <div className="panel-header">
              <h3><i className="fa-solid fa-server color-gold"></i> System Information</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '10px 0', borderBottom: '1px solid var(--color-gray-border)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-gray-text)' }}>Database Status</span>
                <span className="badge confirmed">Connected (Oracle)</span>
              </li>
              <li style={{ padding: '10px 0', borderBottom: '1px solid var(--color-gray-border)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-gray-text)' }}>Environment</span>
                <span className="badge confirmed">Production</span>
              </li>
              <li style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-gray-text)' }}>App Version</span>
                <span style={{ fontWeight: 600 }}>v2.0.0</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
