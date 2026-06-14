import React, { useState, useEffect } from 'react';
import { apiRequest, API_BASE } from '../utils/api';

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null means "Add Showcase Item" mode
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    image: '',
    description: '',
    fileSize: 'Unknown',
    dimensions: 'Unknown',
    isActive: true
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formDataObj = new FormData();
    formDataObj.append('image', file);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/api/upload?folder=gallery`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formDataObj
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Image upload failed');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        image: data.url,
        fileSize: data.size || 'Unknown',
        dimensions: data.dimensions || 'Unknown'
      }));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to upload image. Please verify config.');
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchGalleryItems = async () => {
    try {
      const [galleryData, categoriesData] = await Promise.all([
        apiRequest('/api/gallery?all=true'),
        apiRequest('/api/categories')
      ]);
      setGalleryItems(galleryData.items || galleryData.galleryItems || galleryData.data || galleryData.rows || (Array.isArray(galleryData) ? galleryData : []));
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch gallery items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const getCategoryLabel = (categoryId) => {
    return (Array.isArray(categories) ? categories : []).find(category => category.id === categoryId)?.name || categoryId || 'Uncategorized';
  };

  const openAddModal = () => {
    setEditingItem(null);
    const defaultCategory = categories[0]?.id || '';
    setFormData({
      title: '',
      category: defaultCategory,
      image: '',
      description: '',
      fileSize: 'Unknown',
      dimensions: 'Unknown',
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    
    setFormData({
      title: item.title,
      category: item.category,
      image: item.image,
      description: item.description || '',
      fileSize: item.fileSize || 'Unknown',
      dimensions: item.dimensions || 'Unknown',
      isActive: item.isActive !== false
    });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.image) {
      alert('Please fill out all required fields (Title, Category, and Image).');
      return;
    }

    setFormSubmitting(true);

    const payload = {
      title: formData.title,
      category: formData.category,
      image: formData.image,
      description: formData.description,
      fileSize: formData.fileSize,
      dimensions: formData.dimensions,
      isActive: formData.isActive
    };

    try {
      if (editingItem) {
        // Edit mode
        const updated = await apiRequest(`/api/gallery/${editingItem.id}`, {
          method: 'PUT',
          body: payload
        });
        setGalleryItems(prev => (Array.isArray(prev) ? prev : []).map(item => item.id === editingItem.id ? updated : item));
      } else {
        // Add mode
        const created = await apiRequest('/api/gallery', {
          method: 'POST',
          body: payload
        });
        setGalleryItems(prev => [created, ...(Array.isArray(prev) ? prev : [])]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to save gallery item');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleGalleryActive = async (item) => {
    const newStatus = item.isActive !== false ? false : true;
    try {
      const updated = await apiRequest(`/api/gallery/${item.id}`, {
        method: 'PUT',
        body: { isActive: newStatus }
      });
      setGalleryItems(prev => (Array.isArray(prev) ? prev : []).map(i => i.id === item.id ? { ...i, isActive: updated.isActive } : i));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update status');
    }
  };

  // Get distinct categories dynamically
  const categoriesList = ['All', ...new Set([
    ...(Array.isArray(categories) ? categories : []).map(category => category.id),
    ...(Array.isArray(galleryItems) ? galleryItems : []).map(i => i.category)
  ].filter(Boolean))];

  // Filter items
  const safeGalleryItems = Array.isArray(galleryItems) ? galleryItems : [];
  const filteredItems = safeGalleryItems.filter(item => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const categoryLabel = getCategoryLabel(item.category).toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      categoryLabel.includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '15px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-gold)' }}></i>
        <p style={{ color: 'var(--color-gray-text)' }}>Loading gallery items...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Action Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Category Selector */}
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '180px', padding: '0.5rem 1rem' }}
          >
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All' : getCategoryLabel(cat)} Category</option>
            ))}
          </select>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search gallery..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
            />
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-text)', fontSize: '0.85rem' }}></i>
          </div>
        </div>

        {/* Add Showcase Button */}
        <button className="btn-admin" onClick={openAddModal}>
          <i className="fa-solid fa-plus"></i> Add Showcase Photo
        </button>
      </div>

      {error && (
        <div style={{ background: '#FFF5F5', color: '#E53E3E', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Gallery Showcase Table */}
      <div className="dashboard-panel">
        <div className="table-responsive">
          {filteredItems.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Showcase Title</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Media Info</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-gray-border)' }} 
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23F3E8FF'/%3E%3Ctext x='50%25' y='55%25' font-family='sans-serif' font-size='12' fill='%23701A75' text-anchor='middle'%3EImage%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </td>
                    <td className="font-semibold" style={{ color: 'var(--color-purple-dark)' }}>{item.title}</td>
                    <td>{getCategoryLabel(item.category)}</td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.description || <span style={{ color: '#aaa', fontSize: '0.8rem' }}>None</span>}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-text)' }}>
                        <div><i className="fa-solid fa-weight-scale"></i> {item.fileSize || 'Unknown'}</div>
                        <div><i className="fa-solid fa-crop-simple"></i> {item.dimensions || 'Unknown'}</div>
                      </div>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>
                      {item.isActive !== false ? (
                        <span className="badge confirmed" style={{ background: '#D1FAE5', color: '#065F46' }}>
                          <i className="fa-solid fa-circle-check"></i> Active
                        </span>
                      ) : (
                        <span className="badge pending" style={{ background: '#FEE2E2', color: '#991B1B' }}>
                          <i className="fa-solid fa-circle-xmark"></i> Inactive
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn-admin-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.72rem' }}
                          onClick={() => openEditModal(item)}
                          title="Edit Photo"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          className="btn-admin"
                          style={{ 
                            padding: '0.4rem 0.6rem', 
                            fontSize: '0.72rem', 
                            background: item.isActive !== false ? 'var(--color-purple)' : 'var(--color-gold)',
                            color: '#fff'
                          }}
                          onClick={() => handleToggleGalleryActive(item)}
                          title={item.isActive !== false ? "Set as Inactive" : "Set as Active"}
                        >
                          <i className={item.isActive !== false ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                        </button>
                        <button
                          className="btn-admin-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.72rem' }}
                          onClick={() => {
                            navigator.clipboard.writeText(item.image);
                            alert('Media URL copied to clipboard!');
                          }}
                          title="Copy Media URL"
                        >
                          <i className="fa-solid fa-link"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <i className="fa-solid fa-images"></i>
              <p>No gallery showcase items found.</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT GALLERY ITEM MODAL */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{editingItem ? `Edit Showcase Photo: ${editingItem.title}` : 'Add Showcase Photo'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="gallery-title">Showcase Title *</label>
                  <input
                    type="text"
                    id="gallery-title"
                    name="title"
                    className="form-input"
                    placeholder="e.g. Ivory & Gold Luxury Wedding Setup"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="gallery-cat">Category *</label>
                    <select
                      id="gallery-cat"
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    {categories.length === 0 && (
                      <small style={{ color: '#E53E3E', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                        Please create at least one category before adding showcase photos.
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="gallery-img">Image File *</label>
                    
                    {/* File Uploader */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
                      <input
                        type="file"
                        id="gallery-image-file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="form-input"
                        style={{ padding: '6px 12px' }}
                      />
                      {uploadingImage && (
                        <small style={{ color: 'var(--color-purple)', fontWeight: 500 }}>
                          <i className="fa-solid fa-spinner fa-spin"></i> Converting to WebP & uploading...
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="gallery-img-url">Image Path / URL *</label>
                  <input
                    type="text"
                    id="gallery-img-url"
                    name="image"
                    className="form-input"
                    placeholder="Auto-filled on file upload"
                    value={formData.image}
                    readOnly
                    required
                    style={{ background: '#f1f3f5', cursor: 'not-allowed' }}
                  />

                  {/* Image Preview Block */}
                  {formData.image && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-gray-border)' }} 
                      />
                      <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <i className="fa-solid fa-circle-check"></i> Image Uploaded
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="gallery-desc">Brief Description / Event Details</label>
                  <textarea
                    id="gallery-desc"
                    name="description"
                    className="form-textarea"
                    rows="3"
                    placeholder="Tell customers about the design elements, color themes, or items featured in this setup..."
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1rem' }}>
                  <input
                    type="checkbox"
                    id="gallery-active"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="gallery-active" style={{ fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem', margin: 0 }}>
                    Show in Storefront (Active)
                  </label>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-admin-secondary" onClick={() => setModalOpen(false)} disabled={formSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-admin" disabled={formSubmitting}>
                  {formSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    'Save Showcase Photo'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
