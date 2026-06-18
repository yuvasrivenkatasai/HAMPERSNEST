import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function CategoryShowcaseManager() {
  const [showcases, setShowcases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShowcase, setEditingShowcase] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    icon: 'fa-solid fa-gift',
    image: '',
    isFeatured: false,
    targetCollection: '',
    sortOrder: 0,
    isActive: true
  });

  const fetchShowcases = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/category-showcase/admin');
      setShowcases(data.showcases || []);
      setAnimationEnabled(data.animationEnabled);
    } catch (err) {
      setError(err.message || 'Failed to fetch category showcases');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiRequest('/api/categories');
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchShowcases();
    fetchCategories();
  }, []);

  const handleToggleAnimation = async () => {
    const newState = !animationEnabled;
    try {
      await apiRequest('/api/category-showcase/settings/animation', {
        method: 'PUT',
        body: { enabled: newState }
      });
      setAnimationEnabled(newState);
    } catch (err) {
      alert('Failed to update animation setting: ' + err.message);
    }
  };

  const handleOpenAddModal = () => {
    setEditingShowcase(null);
    setFormData({
      name: '',
      icon: 'fa-solid fa-gift',
      image: '',
      isFeatured: false,
      targetCollection: '',
      sortOrder: showcases.length > 0 ? Math.max(...showcases.map(s => s.sortOrder || 0)) + 1 : 0,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (showcase) => {
    setEditingShowcase(showcase);
    setFormData({
      name: showcase.name,
      icon: showcase.icon,
      image: showcase.image || '',
      isFeatured: !!showcase.isFeatured,
      targetCollection: showcase.targetCollection,
      sortOrder: showcase.sortOrder,
      isActive: showcase.isActive
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/api/upload?folder=general`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await response.json();
      if (response.ok) {
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        alert('Upload failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingShowcase) {
        await apiRequest(`/api/category-showcase/${editingShowcase.id}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        await apiRequest('/api/category-showcase', {
          method: 'POST',
          body: formData
        });
      }
      setIsModalOpen(false);
      fetchShowcases();
    } catch (err) {
      alert(err.message || 'Failed to save showcase');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this showcase item?')) return;
    try {
      await apiRequest(`/api/category-showcase/${id}`, { method: 'DELETE' });
      fetchShowcases();
    } catch (err) {
      alert(err.message || 'Failed to delete showcase');
    }
  };

  const handleToggleStatus = async (showcase) => {
    try {
      await apiRequest(`/api/category-showcase/${showcase.id}`, {
        method: 'PUT',
        body: { isActive: !showcase.isActive }
      });
      fetchShowcases();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h2 style={{ color: 'var(--color-purple-dark)' }}>Category Showcase Manager</h2>
          <p style={{ color: 'var(--color-gray-text)', fontSize: '0.9rem' }}>Manage the premium category showcase section on the homepage</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-admin-secondary"
            onClick={handleToggleAnimation}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px',
              border: animationEnabled ? '2px solid var(--color-purple)' : '1px solid #E5E7EB',
              background: animationEnabled ? '#EDE9FE' : '#fff'
            }}
          >
            <i className={animationEnabled ? "fa-solid fa-toggle-on" : "fa-solid fa-toggle-off"} style={{ color: animationEnabled ? 'var(--color-purple)' : '#9CA3AF', fontSize: '1.2rem' }}></i>
            {animationEnabled ? 'Animation Enabled' : 'Animation Paused'}
          </button>
          <button className="btn-admin" onClick={handleOpenAddModal}>
            <i className="fa-solid fa-plus"></i> Add Category
          </button>
        </div>
      </div>

      {error && (
        <div className="login-error" style={{ marginBottom: '1.5rem', background: '#FFF3CD', color: '#856404', border: '1px solid #FFEEBA' }}>
          <i className="fa-solid fa-triangle-exclamation"></i> {error}
        </div>
      )}

      <div className="dashboard-panel">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--color-gold)' }}></i>
          </div>
        ) : showcases.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-icons"></i>
            <h3>No showcase items found</h3>
            <p>Add your first category showcase to display it on the homepage.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Order</th>
                  <th style={{ width: '60px' }}>Image</th>
                  <th>Category Name</th>
                  <th>Target Collection</th>
                  <th style={{ width: '80px' }}>Featured</th>
                  <th style={{ width: '80px' }}>Status</th>
                  <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {showcases.map(showcase => (
                  <tr key={showcase.id}>
                    <td>
                      <span className="badge" style={{ background: '#F3F4F6', color: '#374151', fontSize: '0.8rem' }}>
                        {showcase.sortOrder}
                      </span>
                    </td>
                    <td>
                      {showcase.image ? (
                        <img src={showcase.image} alt={showcase.name} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #E5E7EB' }} />
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--color-lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-purple-dark)', fontSize: '0.9rem' }}>
                          <i className={showcase.icon || 'fa-solid fa-gift'}></i>
                        </div>
                      )}
                    </td>
                    <td className="font-semibold">{showcase.name}</td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>{showcase.targetCollection}</span>
                    </td>
                    <td>
                      {showcase.isFeatured ? (
                        <span className="badge" style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', color: '#92400E', fontSize: '0.72rem' }}>
                          <i className="fa-solid fa-gem"></i> Featured
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>—</span>
                      )}
                    </td>
                    <td>
                      {showcase.isActive ? (
                        <span className="badge confirmed" style={{ background: '#D1FAE5', color: '#065F46', fontSize: '0.72rem' }}>Active</span>
                      ) : (
                        <span className="badge pending" style={{ background: '#FEE2E2', color: '#991B1B', fontSize: '0.72rem' }}>Hidden</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn-admin-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleOpenEditModal(showcase)} title="Edit">
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button className="btn-admin-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: showcase.isActive ? '#991B1B' : '#065F46' }} onClick={() => handleToggleStatus(showcase)} title={showcase.isActive ? "Hide" : "Show"}>
                          <i className={showcase.isActive ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                        </button>
                        <button className="btn-logout" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleDelete(showcase.id)} title="Delete">
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>{editingShowcase ? 'Edit Category' : 'Add Category'}</h3>
              <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                {/* Name */}
                <div className="form-group">
                  <label className="form-label">Category Display Name *</label>
                  <input type="text" className="form-input" required value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Wedding Gifts"
                  />
                </div>

                {/* Image Upload (OPTIONAL) */}
                <div className="form-group">
                  <label className="form-label">Category Image</label>
                  {formData.image ? (
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px' }}>
                      <img src={formData.image} alt="Category" style={{ width: '120px', height: '120px', borderRadius: '16px', objectFit: 'cover', border: '2px solid var(--color-gold)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <button type="button" onClick={() => setFormData({...formData, image: ''})}
                        style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: '#EF4444', color: '#fff', border: 'none', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  ) : (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', borderRadius: '16px', border: '2px dashed #D1D5DB', cursor: 'pointer', background: '#FAFAFA', transition: 'all 0.2s ease' }}>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                      {uploading ? (
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.5rem', color: 'var(--color-gold)' }}></i>
                      ) : (
                        <>
                          <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '1.5rem', color: '#9CA3AF', marginBottom: '6px' }}></i>
                          <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Upload</span>
                        </>
                      )}
                    </label>
                  )}
                  <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '6px', fontStyle: 'italic' }}>
                    <i className="fa-solid fa-circle-info" style={{ marginRight: '4px' }}></i>
                    Optional — Leave empty to use default luxury category image.
                  </p>
                </div>

                {/* Target Collection */}
                <div className="form-group">
                  <label className="form-label">Redirect Collection *</label>
                  <select className="form-select" required value={formData.targetCollection}
                    onChange={(e) => setFormData({...formData, targetCollection: e.target.value})}
                  >
                    <option value="">Select a collection...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    <option value="Customized Gifts">Customized Gifts</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input type="number" className="form-input" value={formData.sortOrder}
                    onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                  />
                </div>

                {/* Toggles Row */}
                <div style={{ display: 'flex', gap: '24px', marginTop: '10px' }}>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="showcase-active" checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <label htmlFor="showcase-active" style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>Visible</label>
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="showcase-featured" checked={formData.isFeatured}
                      onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <label htmlFor="showcase-featured" style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem', color: 'var(--color-gold-dark)' }}>
                      <i className="fa-solid fa-gem" style={{ marginRight: '4px' }}></i> Featured Card
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-admin-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-admin">{editingShowcase ? 'Save Changes' : 'Add Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
