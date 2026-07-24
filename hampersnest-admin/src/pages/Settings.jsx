import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import BulkDiscountManager from './BulkDiscountManager';
export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [settingsData, setSettingsData] = useState({
    storeName: 'HampersNest',
    contactEmail: 'Hampersnestgifts@gmail.com',
    currency: 'INR',
    usdRate: '83',
    shippingRate: '0',
    announcementText: '',
    announcementActive: false,
    businessAddress: 'Uppal, Hyderabad, Telangana, India',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Uppal%2C%20Hyderabad%2C%20Telangana%2C%20India',
    whatsappNumber: '917989202194',
    instagramUrl: 'https://www.instagram.com/hampersnest',
    youtubeUrl: 'https://youtube.com/@hampersnestgifts',
    facebookUrl: '',
    linkedinUrl: '',
    pinterestUrl: '',
    twitterUrl: '',
    popularSearches: '#WeddingReturnGifts, #BabyShowerGifts, #CorporateGifts, #BrassReturnGifts',
    studioHoursTitle: 'Curation Studio Hours',
    studioHoursMonSat: 'Monday - Saturday: 10:00 AM - 7:00 PM',
    studioHoursSun: 'Sunday: Closed (Available for emergency wedding deliveries)',
    studioWalkInMsg: 'Walk-ins by prior appointment only.',
    ownerContactNumber: '+91 79892 02194',
    heroTitle: 'Premium Return Gifts & Customized Hampers',
    heroSubtitle: 'Wedding • Housewarming • Baby Shower • Corporate Gifting',
    heroDescription: 'Luxury gifting solutions crafted for every celebration.',
    heroButtonPrimary: 'Explore Collections',
    heroButtonSecondary: 'WhatsApp Consultation',
    aboutLabel: 'ABOUT HAMPERS NEST',
    aboutTitle: 'Thoughtfully Curated Luxury Gifts',
    aboutDescription: "We specialize in curating bespoke return gifts and premium hampers for all your special occasions. From exquisite brass and silver items to personalized chocolates and eco-friendly packaging, every hamper is crafted with love and attention to detail.\n\nWhether it's a grand wedding or an intimate baby shower, Hampers Nest brings a touch of elegance to your celebrations, ensuring your guests leave with a memorable token of appreciation.",
    aboutTags: JSON.stringify(['Wedding Curation', 'Baby Showers', 'Housewarmings', 'Corporate Gifting']),
    aboutButtonText: 'READ OUR STORY',
    ourStorySection1Label: 'The Curation Studio',
    ourStorySection1Title: 'Where Tradition <br />Meets Luxury',
    ourStorySection1Paragraph1: 'Established in Hyderabad, {storeName} was founded on a simple belief: <em>a return gift is a physical representation of your gratitude and celebration.</em> We believe that generic, mass-produced items lack the warmth and elegance that your guests deserve.',
    ourStorySection1Paragraph2: 'Our curation studio collaborates with local Indian artisans, bringing timeless treasures (like handcrafted brass bowls, peacock diyas, and zari pouches) and presenting them inside luxury, high-end packaging. Whether it is a grand wedding, a sweet baby shower, a warm housewarming, or an executive corporate event, we elevate the experience.',
    ourStorySection2Label: 'Core Philosophy',
    ourStorySection2Title: 'The Pillars of {storeName}',
    ourStoryPillars: JSON.stringify([
      {
        icon: "fa-solid fa-gift",
        title: "Artisanal Curation",
        desc: "We handpick every element, pairing traditional Hyderabad craftsmanship (intricate brass engravings, silk zari) with premium dry fruits and hand-poured fragrances."
      },
      {
        icon: "fa-solid fa-wand-magic-sparkles",
        title: "Deep Personalization",
        desc: "From handwritten calligraphy gift tags to custom-colored rigid box packaging, we tailor every detail to match your celebration's theme, color palette, and style."
      },
      {
        icon: "fa-solid fa-shield-heart",
        title: "Quality Assurance",
        desc: "Every brass bowl is hand-polished, every chocolate is checked for freshness, and every box is structurally verified to ensure safe transit and exquisite reception."
      },
      {
        icon: "fa-solid fa-leaf",
        title: "Eco-Conscious Curation",
        desc: "We prioritize reusable, sustainable materials like solid brass, hand-woven bamboo, and jute detailing to ensure your return gifts are both beautiful and kind to earth."
      }
    ])
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
        shippingRate: safeData?.shippingRate || '0', // Ensure string for input
        usdRate: safeData?.usdRate || '83'
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

  const [socialMessage, setSocialMessage] = useState(null);

  const handleSocialSubmit = async (e) => {
    e.preventDefault();
    setSocialMessage(null);
    try {
      await apiRequest('/api/settings', {
        method: 'PUT',
        body: settingsData
      });
      setSocialMessage('Social media settings updated successfully.');
      setTimeout(() => setSocialMessage(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save social media settings');
    }
  };

  const [contentMessage, setContentMessage] = useState(null);

  const handleContentSubmit = async (e) => {
    e.preventDefault();
    setContentMessage(null);
    try {
      await apiRequest('/api/settings', {
        method: 'PUT',
        body: settingsData
      });
      setContentMessage('Content updated successfully');
      setTimeout(() => setContentMessage(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save content settings');
    }
  };

  const handleAddTag = () => {
    try {
      const tags = typeof settingsData.aboutTags === 'string' ? JSON.parse(settingsData.aboutTags || '[]') : (settingsData.aboutTags || []);
      tags.push('New Tag');
      setSettingsData(prev => ({ ...prev, aboutTags: JSON.stringify(tags) }));
    } catch(e) {
      setSettingsData(prev => ({ ...prev, aboutTags: JSON.stringify(['New Tag']) }));
    }
  };

  const handleRemoveTag = (index) => {
    try {
      const tags = typeof settingsData.aboutTags === 'string' ? JSON.parse(settingsData.aboutTags || '[]') : (settingsData.aboutTags || []);
      tags.splice(index, 1);
      setSettingsData(prev => ({ ...prev, aboutTags: JSON.stringify(tags) }));
    } catch(e) {}
  };

  const handleTagChange = (index, value) => {
    try {
      const tags = typeof settingsData.aboutTags === 'string' ? JSON.parse(settingsData.aboutTags || '[]') : (settingsData.aboutTags || []);
      tags[index] = value;
      setSettingsData(prev => ({ ...prev, aboutTags: JSON.stringify(tags) }));
    } catch(e) {}
  };

  const getTags = () => {
    try {
      if (Array.isArray(settingsData.aboutTags)) return settingsData.aboutTags;
      return JSON.parse(settingsData.aboutTags || '[]');
    } catch(e) {
      return [];
    }
  };

  const handleAddPillar = () => {
    try {
      const pillars = typeof settingsData.ourStoryPillars === 'string' ? JSON.parse(settingsData.ourStoryPillars || '[]') : (settingsData.ourStoryPillars || []);
      pillars.push({ icon: 'fa-solid fa-star', title: 'New Pillar', desc: 'Description' });
      setSettingsData(prev => ({ ...prev, ourStoryPillars: JSON.stringify(pillars) }));
    } catch(e) {
      setSettingsData(prev => ({ ...prev, ourStoryPillars: JSON.stringify([{ icon: 'fa-solid fa-star', title: 'New Pillar', desc: 'Description' }]) }));
    }
  };

  const handleRemovePillar = (index) => {
    try {
      const pillars = typeof settingsData.ourStoryPillars === 'string' ? JSON.parse(settingsData.ourStoryPillars || '[]') : (settingsData.ourStoryPillars || []);
      pillars.splice(index, 1);
      setSettingsData(prev => ({ ...prev, ourStoryPillars: JSON.stringify(pillars) }));
    } catch(e) {}
  };

  const handlePillarChange = (index, field, value) => {
    try {
      const pillars = typeof settingsData.ourStoryPillars === 'string' ? JSON.parse(settingsData.ourStoryPillars || '[]') : (settingsData.ourStoryPillars || []);
      pillars[index][field] = value;
      setSettingsData(prev => ({ ...prev, ourStoryPillars: JSON.stringify(pillars) }));
    } catch(e) {}
  };

  const handleMovePillar = (index, dir) => {
    try {
      const pillars = typeof settingsData.ourStoryPillars === 'string' ? JSON.parse(settingsData.ourStoryPillars || '[]') : (settingsData.ourStoryPillars || []);
      if (dir === 'up' && index > 0) {
        const temp = pillars[index];
        pillars[index] = pillars[index - 1];
        pillars[index - 1] = temp;
      } else if (dir === 'down' && index < pillars.length - 1) {
        const temp = pillars[index];
        pillars[index] = pillars[index + 1];
        pillars[index + 1] = temp;
      }
      setSettingsData(prev => ({ ...prev, ourStoryPillars: JSON.stringify(pillars) }));
    } catch(e) {}
  };

  const getPillars = () => {
    try {
      if (Array.isArray(settingsData.ourStoryPillars)) return settingsData.ourStoryPillars;
      return JSON.parse(settingsData.ourStoryPillars || '[]');
    } catch(e) {
      return [];
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Global Settings Panel */}
          <div className="dashboard-panel" style={{ margin: 0 }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
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
                  <label className="form-label">1 USD to INR Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    name="usdRate"
                    className="form-input"
                    min="1"
                    value={settingsData.usdRate}
                    onChange={handleSettingsChange}
                  />
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

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
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

              <h4 style={{ color: 'var(--color-purple)', borderBottom: '1px solid var(--color-beige)', paddingBottom: '8px', marginBottom: '15px', marginTop: '20px' }}>
                <i className="fa-solid fa-fire"></i> Popular Searches (Storefront)
              </h4>

              <div className="form-group">
                <label className="form-label">Trending Hashtags</label>
                <input
                  type="text"
                  name="popularSearches"
                  className="form-input"
                  value={settingsData.popularSearches || ''}
                  onChange={handleSettingsChange}
                  placeholder="e.g. #WeddingReturnGifts, #CorporateGifts"
                />
                <small style={{ color: 'var(--color-gray-text)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  Comma separated. These will appear as quick-filter chips on the Collections page. Make sure the text matches your category/subcategory labels (spaces are ignored for matching).
                </small>
              </div>

              <h4 style={{ color: 'var(--color-purple)', borderBottom: '1px solid var(--color-beige)', paddingBottom: '8px', marginBottom: '15px' }}>
                <i className="fa-solid fa-location-dot"></i> Studio & Contact Info
              </h4>

              <div className="form-group">
                <label className="form-label">Business Address</label>
                <input
                  type="text"
                  name="businessAddress"
                  className="form-input"
                  value={settingsData.businessAddress}
                  onChange={handleSettingsChange}
                  placeholder="e.g. Hyderabad, Telangana, India"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Google Maps Share URL</label>
                <input
                  type="url"
                  name="googleMapsUrl"
                  className="form-input"
                  value={settingsData.googleMapsUrl}
                  onChange={handleSettingsChange}
                  placeholder="https://www.google.com/maps/..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp Number (with country code)</label>
                <input
                  type="text"
                  name="whatsappNumber"
                  className="form-input"
                  value={settingsData.whatsappNumber}
                  onChange={handleSettingsChange}
                  placeholder="e.g. 917989202194"
                />
              </div>

              <h4 style={{ color: 'var(--color-purple)', borderBottom: '1px solid var(--color-beige)', paddingBottom: '8px', marginBottom: '15px', marginTop: '20px' }}>
                <i className="fa-regular fa-clock"></i> Curation Studio Hours Management
              </h4>

              <div className="form-group">
                <label className="form-label">Studio Hours Title</label>
                <input
                  type="text"
                  name="studioHoursTitle"
                  className="form-input"
                  value={settingsData.studioHoursTitle || ''}
                  onChange={handleSettingsChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Monday–Saturday Timing</label>
                <input
                  type="text"
                  name="studioHoursMonSat"
                  className="form-input"
                  value={settingsData.studioHoursMonSat || ''}
                  onChange={handleSettingsChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sunday Timing</label>
                <input
                  type="text"
                  name="studioHoursSun"
                  className="form-input"
                  value={settingsData.studioHoursSun || ''}
                  onChange={handleSettingsChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Walk-in Message</label>
                <input
                  type="text"
                  name="studioWalkInMsg"
                  className="form-input"
                  value={settingsData.studioWalkInMsg || ''}
                  onChange={handleSettingsChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Owner Contact Number</label>
                <input
                  type="text"
                  name="ownerContactNumber"
                  className="form-input"
                  value={settingsData.ownerContactNumber || ''}
                  onChange={handleSettingsChange}
                />
              </div>

              <h4 style={{ color: 'var(--color-purple)', borderBottom: '1px solid var(--color-beige)', paddingBottom: '8px', marginBottom: '15px', marginTop: '20px' }}>
                <i className="fa-solid fa-hashtag"></i> Social Media Links
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label"><i className="fa-brands fa-instagram"></i> Instagram</label>
                  <input type="url" name="instagramUrl" className="form-input" value={settingsData.instagramUrl || ''} onChange={handleSettingsChange} placeholder="https://instagram.com/..." />
                </div>
                <div className="form-group">
                  <label className="form-label"><i className="fa-brands fa-youtube"></i> YouTube</label>
                  <input type="url" name="youtubeUrl" className="form-input" value={settingsData.youtubeUrl || ''} onChange={handleSettingsChange} placeholder="https://youtube.com/..." />
                </div>
                <div className="form-group">
                  <label className="form-label"><i className="fa-brands fa-facebook"></i> Facebook</label>
                  <input type="url" name="facebookUrl" className="form-input" value={settingsData.facebookUrl || ''} onChange={handleSettingsChange} placeholder="https://facebook.com/..." />
                </div>
                <div className="form-group">
                  <label className="form-label"><i className="fa-brands fa-linkedin"></i> LinkedIn</label>
                  <input type="url" name="linkedinUrl" className="form-input" value={settingsData.linkedinUrl || ''} onChange={handleSettingsChange} placeholder="https://linkedin.com/..." />
                </div>
                <div className="form-group">
                  <label className="form-label"><i className="fa-brands fa-pinterest"></i> Pinterest</label>
                  <input type="url" name="pinterestUrl" className="form-input" value={settingsData.pinterestUrl || ''} onChange={handleSettingsChange} placeholder="https://pinterest.com/..." />
                </div>
                <div className="form-group">
                  <label className="form-label"><i className="fa-brands fa-x-twitter"></i> Twitter / X</label>
                  <input type="url" name="twitterUrl" className="form-input" value={settingsData.twitterUrl || ''} onChange={handleSettingsChange} placeholder="https://twitter.com/..." />
                </div>
              </div>

              <BulkDiscountManager settingsData={settingsData} setSettingsData={setSettingsData} />


              <button type="submit" className="btn-admin mt-2">
                Save Store Settings
              </button>
            </form>
          )}
          </div>

          {/* Content Management Panel */}
          <div className="dashboard-panel" style={{ margin: 0 }}>
            <div className="panel-header">
              <h3><i className="fa-solid fa-pen-to-square color-gold"></i> Content Management</h3>
            </div>

            {settingsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ color: 'var(--color-gold)', fontSize: '1.5rem' }}></i>
              </div>
            ) : (
              <form onSubmit={handleContentSubmit}>
                {contentMessage && <div style={{ background: 'rgba(25, 135, 84, 0.1)', color: 'var(--color-delivered)', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>{contentMessage}</div>}

                <h4 style={{ color: 'var(--color-purple-dark)', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '15px' }}>Hero Section</h4>
                <div className="form-group">
                  <label className="form-label">Hero Main Heading *</label>
                  <input type="text" name="heroTitle" className="form-input" required value={settingsData.heroTitle || ''} onChange={handleSettingsChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hero Subtitle</label>
                  <input type="text" name="heroSubtitle" className="form-input" value={settingsData.heroSubtitle || ''} onChange={handleSettingsChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hero Description *</label>
                  <textarea name="heroDescription" className="form-input" required rows="3" value={settingsData.heroDescription || ''} onChange={handleSettingsChange}></textarea>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Explore Collections Button Text *</label>
                    <input type="text" name="heroButtonPrimary" className="form-input" required value={settingsData.heroButtonPrimary || ''} onChange={handleSettingsChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Button Text</label>
                    <input type="text" name="heroButtonSecondary" className="form-input" value={settingsData.heroButtonSecondary || ''} onChange={handleSettingsChange} />
                  </div>
                </div>

                <h4 style={{ color: 'var(--color-purple-dark)', borderBottom: '1px solid #ddd', paddingBottom: '8px', margin: '20px 0 15px 0' }}>About Section</h4>
                <div className="form-group">
                  <label className="form-label">Small Label</label>
                  <input type="text" name="aboutLabel" className="form-input" value={settingsData.aboutLabel || ''} onChange={handleSettingsChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">About Heading *</label>
                  <input type="text" name="aboutTitle" className="form-input" required value={settingsData.aboutTitle || ''} onChange={handleSettingsChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">About Description *</label>
                  <textarea name="aboutDescription" className="form-input" required rows="5" value={settingsData.aboutDescription || ''} onChange={handleSettingsChange}></textarea>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Service Tags</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {getTags().map((tag, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px' }}>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={tag} 
                          onChange={(e) => handleTagChange(idx, e.target.value)} 
                          required
                        />
                        <button type="button" onClick={() => handleRemoveTag(idx)} className="btn-admin-secondary" style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5' }}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddTag} className="btn-admin-secondary" style={{ width: 'fit-content', marginTop: '5px' }}>
                      <i className="fa-solid fa-plus"></i> Add Tag
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">About Button Text *</label>
                  <input type="text" name="aboutButtonText" className="form-input" required value={settingsData.aboutButtonText || ''} onChange={handleSettingsChange} />
                </div>

                <h4 style={{ color: 'var(--color-purple-dark)', borderBottom: '1px solid #ddd', paddingBottom: '8px', margin: '20px 0 15px 0' }}>Our Story Page - Section 1</h4>
                <div className="form-group">
                  <label className="form-label">Small Label</label>
                  <input type="text" name="ourStorySection1Label" className="form-input" value={settingsData.ourStorySection1Label || ''} onChange={handleSettingsChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Main Heading</label>
                  <input type="text" name="ourStorySection1Title" className="form-input" value={settingsData.ourStorySection1Title || ''} onChange={handleSettingsChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Paragraph 1</label>
                  <textarea name="ourStorySection1Paragraph1" className="form-input" rows="4" value={settingsData.ourStorySection1Paragraph1 || ''} onChange={handleSettingsChange}></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label">Paragraph 2</label>
                  <textarea name="ourStorySection1Paragraph2" className="form-input" rows="4" value={settingsData.ourStorySection1Paragraph2 || ''} onChange={handleSettingsChange}></textarea>
                </div>

                <h4 style={{ color: 'var(--color-purple-dark)', borderBottom: '1px solid #ddd', paddingBottom: '8px', margin: '20px 0 15px 0' }}>Our Story Page - Section 2 (Pillars)</h4>
                <div className="form-group">
                  <label className="form-label">Small Label</label>
                  <input type="text" name="ourStorySection2Label" className="form-input" value={settingsData.ourStorySection2Label || ''} onChange={handleSettingsChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Main Heading</label>
                  <input type="text" name="ourStorySection2Title" className="form-input" value={settingsData.ourStorySection2Title || ''} onChange={handleSettingsChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">Pillar Cards</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {getPillars().map((pillar, idx) => (
                      <div key={idx} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>Card {idx + 1}</strong>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button type="button" onClick={() => handleMovePillar(idx, 'up')} disabled={idx === 0} className="btn-admin-secondary" style={{ padding: '5px 10px' }}><i className="fa-solid fa-arrow-up"></i></button>
                            <button type="button" onClick={() => handleMovePillar(idx, 'down')} disabled={idx === getPillars().length - 1} className="btn-admin-secondary" style={{ padding: '5px 10px' }}><i className="fa-solid fa-arrow-down"></i></button>
                            <button type="button" onClick={() => handleRemovePillar(idx)} className="btn-admin-secondary" style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '5px 10px' }}><i className="fa-solid fa-trash"></i></button>
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '5px' }}>
                          <label className="form-label">Icon (FontAwesome Class)</label>
                          <input type="text" className="form-input" value={pillar.icon || ''} onChange={(e) => handlePillarChange(idx, 'icon', e.target.value)} placeholder="e.g. fa-solid fa-gift" />
                        </div>
                        <div className="form-group" style={{ marginBottom: '5px' }}>
                          <label className="form-label">Title</label>
                          <input type="text" className="form-input" value={pillar.title || ''} onChange={(e) => handlePillarChange(idx, 'title', e.target.value)} />
                        </div>
                        <div className="form-group" style={{ marginBottom: '0' }}>
                          <label className="form-label">Description</label>
                          <textarea className="form-input" rows="2" value={pillar.desc || ''} onChange={(e) => handlePillarChange(idx, 'desc', e.target.value)}></textarea>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddPillar} className="btn-admin-secondary" style={{ width: 'fit-content' }}>
                      <i className="fa-solid fa-plus"></i> Add New Pillar
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-admin mt-2">Save Content</button>
              </form>
            )}
          </div>
        </div>

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

          {/* Social Media Settings Panel */}
          <div className="dashboard-panel" style={{ margin: 0 }}>
            <div className="panel-header">
              <h3><i className="fa-brands fa-instagram color-gold"></i> Social Media Settings</h3>
            </div>
            
            <form onSubmit={handleSocialSubmit}>
              {socialMessage && <div style={{ background: 'rgba(25, 135, 84, 0.1)', color: 'var(--color-delivered)', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>{socialMessage}</div>}
              
              <div className="form-group">
                <label className="form-label">Instagram URL</label>
                <input 
                  type="url" 
                  name="instagramUrl"
                  className="form-input" 
                  value={settingsData.instagramUrl || ''}
                  onChange={handleSettingsChange}
                  placeholder="https://www.instagram.com/..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">YouTube URL</label>
                <input 
                  type="url" 
                  name="youtubeUrl"
                  className="form-input" 
                  value={settingsData.youtubeUrl || ''}
                  onChange={handleSettingsChange}
                  placeholder="https://youtube.com/@..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Facebook URL</label>
                <input 
                  type="url" 
                  name="facebookUrl"
                  className="form-input" 
                  value={settingsData.facebookUrl || ''}
                  onChange={handleSettingsChange}
                  placeholder="https://www.facebook.com/..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">LinkedIn URL</label>
                  <input 
                    type="url" 
                    name="linkedinUrl"
                    className="form-input" 
                    value={settingsData.linkedinUrl || ''}
                    onChange={handleSettingsChange}
                    placeholder="Optional"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pinterest URL</label>
                  <input 
                    type="url" 
                    name="pinterestUrl"
                    className="form-input" 
                    value={settingsData.pinterestUrl || ''}
                    onChange={handleSettingsChange}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Twitter/X URL</label>
                <input 
                  type="url" 
                  name="twitterUrl"
                  className="form-input" 
                  value={settingsData.twitterUrl || ''}
                  onChange={handleSettingsChange}
                  placeholder="Optional"
                />
              </div>

              <button type="submit" className="btn-admin mt-2">
                Save Social Links
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
