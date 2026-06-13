import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null means "Add Category" mode
  const [formData, setFormData] = useState({ name: '' });

  const fetchCategories = async () => {
    try {
      const data = await apiRequest('/api/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name
    });
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter a category name.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (editingCategory) {
        // Edit Mode (Only name can be modified via PUT /api/categories/:id)
        const updated = await apiRequest(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: { name: formData.name }
        });
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? updated : c));
        setSuccess(`Category "${formData.name}" updated successfully!`);
      } else {
        // Create Mode
        const created = await apiRequest('/api/categories', {
          method: 'POST',
          body: { name: formData.name }
        });
        setCategories(prev => [...prev, created]);
        setSuccess(`Category "${formData.name}" created successfully!`);
      }
      // Reset form
      setEditingCategory(null);
      setFormData({ name: '' });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Are you sure you want to permanently delete the category "${category.name}"? This cannot be undone.`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await apiRequest(`/api/categories/${category.id}`, {
        method: 'DELETE'
      });
      setCategories(prev => prev.filter(c => c.id !== category.id));
      setSuccess(`Category "${category.name}" deleted successfully.`);
      if (editingCategory?.id === category.id) {
        handleCancelEdit();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '15px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-gold)' }}></i>
        <p style={{ color: 'var(--color-gray-text)' }}>Loading category structures...</p>
      </div>
    );
  }

  return (
    <div>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '25px', alignItems: 'start' }}>
        
        {/* Categories List Table */}
        <div className="dashboard-panel" style={{ margin: 0 }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}><i className="fa-solid fa-layer-group" style={{ color: 'var(--color-gold-dark)', marginRight: '10px' }}></i> Active Categories</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-text)', fontWeight: 500 }}>{categories.length} Categories Registered</span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Display Label Name</th>
                  <th>Category GUID</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.id} className={editingCategory?.id === category.id ? 'active-row-highlight' : ''} style={editingCategory?.id === category.id ? { background: '#FDFBF7' } : {}}>
                    <td className="font-semibold" style={{ color: 'var(--color-purple-dark)' }}>{category.name}</td>
                    <td>
                      <code style={{ background: '#F3E8FF', color: '#701A75', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                        {category.id}
                      </code>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-gray-text)' }}>
                      {category.createdAt ? new Date(category.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn-admin-secondary"
                          style={{ padding: '0.4rem 0.7rem', fontSize: '0.75rem' }}
                          onClick={() => handleSelectEdit(category)}
                          title="Edit Category Display Name"
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button
                          className="btn-logout"
                          style={{ padding: '0.4rem 0.7rem', fontSize: '0.75rem' }}
                          onClick={() => handleDeleteCategory(category)}
                          title="Delete Category"
                        >
                          <i className="fa-solid fa-trash-can"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray-text)' }}>
                      No categories found. Create one using the form on the right.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Form */}
        <div className="dashboard-panel" style={{ margin: 0 }}>
          <div className="panel-header" style={{ borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>
              <i className={editingCategory ? "fa-solid fa-pen" : "fa-solid fa-plus-circle"} style={{ color: 'var(--color-gold-dark)', marginRight: '10px' }}></i>
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="cat-name">Category Display Label *</label>
              <input
                id="cat-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g. Wedding Return Gifts"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <small style={{ color: 'var(--color-gray-text)', fontSize: '0.72rem', marginTop: '4px', display: 'block' }}>
                The internal category GUID is generated automatically and cannot be edited.
              </small>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {editingCategory && (
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  style={{ padding: '0.55rem 1.2rem' }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="btn-admin"
                disabled={saving}
                style={{ padding: '0.55rem 1.5rem' }}
              >
                {saving ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-floppy-disk"></i> {editingCategory ? 'Update Label' : 'Create Category'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
