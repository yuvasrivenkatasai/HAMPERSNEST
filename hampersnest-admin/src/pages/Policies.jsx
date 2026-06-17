import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { apiRequest } from '../utils/api';

const DEFAULT_POLICY = {
  id: '',
  title: '',
  subtitle: 'Legal & Guidelines',
  description: '',
  content: '',
  isPublished: true,
  isCustom: true
};

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPolicyIndex, setSelectedPolicyIndex] = useState(0);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // For the rich text editor
  const quillModules = {
    toolbar: [
      [{ 'header': [2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/settings');
      if (data && data.customPolicies) {
        setPolicies(data.customPolicies);
      } else {
        setPolicies([]);
      }
    } catch (err) {
      console.error('Failed to fetch policies:', err);
      setError('Failed to load policies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async (updatedPolicies) => {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      
      const policiesToSave = updatedPolicies || policies;

      await apiRequest('/api/settings', {
        method: 'PUT',
        body: { customPolicies: policiesToSave }
      });
      
      setMessage('Policies saved successfully!');
      setTimeout(() => setMessage(null), 3000);
      
      if (updatedPolicies) {
        setPolicies(updatedPolicies);
      }
    } catch (err) {
      setError(err.message || 'Failed to save policies');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = () => {
    const newPolicy = { ...DEFAULT_POLICY, id: 'custom-policy-' + Date.now(), title: 'New Custom Policy', lastUpdated: new Date().toISOString().split('T')[0] };
    const newPolicies = [...policies, newPolicy];
    setPolicies(newPolicies);
    setSelectedPolicyIndex(newPolicies.length - 1);
  };

  const handleDelete = (indexToDelete) => {
    if (window.confirm("Are you sure you want to delete this policy? This action cannot be undone.")) {
      const newPolicies = policies.filter((_, idx) => idx !== indexToDelete);
      setPolicies(newPolicies);
      if (selectedPolicyIndex >= newPolicies.length) {
        setSelectedPolicyIndex(Math.max(0, newPolicies.length - 1));
      }
      handleSaveAll(newPolicies);
    }
  };

  const updateSelectedPolicy = (field, value) => {
    const updatedPolicies = [...policies];
    updatedPolicies[selectedPolicyIndex] = {
      ...updatedPolicies[selectedPolicyIndex],
      [field]: value,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setPolicies(updatedPolicies);
  };

  const handleGenerateId = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    const currentPol = policies[selectedPolicyIndex];
    if (currentPol.isCustom && currentPol.id.startsWith('custom-policy-')) {
      updateSelectedPolicy('id', handleGenerateId(newTitle));
    }
    updateSelectedPolicy('title', newTitle);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--color-gold)' }}></i>
      </div>
    );
  }

  const selectedPolicy = policies[selectedPolicyIndex];

  return (
    <div className="policies-manager-container">
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ display: 'flex', gap: '20px', minHeight: 'calc(100vh - 120px)' }}>
        {/* Sidebar for Policies */}
        <div style={{ width: '250px', background: 'var(--color-white)', borderRadius: '12px', padding: '15px', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>All Policies</h3>
            <button onClick={handleAddNew} className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.7rem' }}>
              <i className="fa-solid fa-plus"></i> Add
            </button>
          </div>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {policies.map((pol, idx) => (
              <li key={pol.id}>
                <button 
                  onClick={() => setSelectedPolicyIndex(idx)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px',
                    borderRadius: '8px',
                    background: idx === selectedPolicyIndex ? 'var(--color-lavender)' : 'transparent',
                    border: idx === selectedPolicyIndex ? '1px solid var(--color-purple)' : '1px solid transparent',
                    color: idx === selectedPolicyIndex ? 'var(--color-purple)' : 'var(--color-charcoal)',
                    cursor: 'pointer',
                    fontWeight: idx === selectedPolicyIndex ? '600' : '400',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="fa-solid fa-file-lines" style={{ color: idx === selectedPolicyIndex ? 'var(--color-gold)' : '#aaa' }}></i>
                  {pol.title || 'Untitled Policy'}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Editor Area */}
        <div style={{ flex: 1, background: 'var(--color-white)', borderRadius: '12px', padding: '25px', boxShadow: 'var(--shadow-premium)' }}>
          {selectedPolicy ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Edit Policy</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <a 
                    href={`http://localhost:5173/${selectedPolicy.isCustom ? 'policy/' : ''}${selectedPolicy.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary"
                  >
                    <i className="fa-solid fa-eye"></i> Preview
                  </a>
                  <button onClick={() => handleSaveAll()} disabled={saving} className="btn btn-primary">
                    {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} 
                    {saving ? 'Saving...' : 'Save & Publish'}
                  </button>
                  {selectedPolicy.isCustom && (
                    <button onClick={() => handleDelete(selectedPolicyIndex)} className="btn btn-danger" style={{ background: '#dc3545', color: '#fff', border: 'none' }}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Policy Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={selectedPolicy.title} 
                    onChange={handleTitleChange} 
                    placeholder="e.g. Return Policy"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">URL Slug (ID)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={selectedPolicy.id} 
                    onChange={(e) => updateSelectedPolicy('id', e.target.value)} 
                    disabled={!selectedPolicy.isCustom}
                    style={{ backgroundColor: !selectedPolicy.isCustom ? '#f5f5f5' : '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Subtitle (Optional)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={selectedPolicy.subtitle || ''} 
                    onChange={(e) => updateSelectedPolicy('subtitle', e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">SEO Description</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={selectedPolicy.description || ''} 
                    onChange={(e) => updateSelectedPolicy('description', e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Policy Content</span>
                  <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'normal' }}>
                    Last Updated: {selectedPolicy.lastUpdated}
                  </span>
                </label>
                <div className="quill-editor-container" style={{ height: '400px', marginBottom: '50px' }}>
                  <ReactQuill 
                    theme="snow" 
                    value={selectedPolicy.content || ''} 
                    onChange={(content) => updateSelectedPolicy('content', content)} 
                    modules={quillModules}
                    style={{ height: '350px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <input 
                  type="checkbox" 
                  id="isPublished" 
                  checked={selectedPolicy.isPublished} 
                  onChange={(e) => updateSelectedPolicy('isPublished', e.target.checked)} 
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="isPublished" style={{ margin: 0, fontWeight: 600, cursor: 'pointer' }}>
                  Published (Visible on website)
                </label>
              </div>

            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888' }}>
              <i className="fa-solid fa-file-contract" style={{ fontSize: '3rem', marginBottom: '15px', color: '#ddd' }}></i>
              <p>Select a policy from the sidebar or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
