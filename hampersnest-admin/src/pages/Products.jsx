import React, { useState, useEffect } from 'react';
import { apiRequest, API_BASE } from '../utils/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means "Add Product" mode
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Wedding',
    image: '',
    description: '',
    detailsText: '', // text area split by newlines
    isFeatured: false,
    originalPrice: '',
    customCategory: '',
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
      const response = await fetch(`${API_BASE}/api/upload?folder=products`, {
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
        image: data.url
      }));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to upload image. Please verify config.');
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await apiRequest('/api/products?all=true');
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch products catalogue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      category: 'Wedding',
      image: '',
      description: '',
      detailsText: '',
      isFeatured: false,
      originalPrice: '',
      customCategory: '',
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    const standardCategories = ['Wedding', 'Baby Shower', 'Housewarming', 'Brass', 'Corporate', 'Customized'];
    const isStandardCat = standardCategories.includes(product.category);
    
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: isStandardCat ? product.category : 'custom',
      image: product.image,
      description: product.description || '',
      detailsText: product.details ? product.details.join('\n') : '',
      isFeatured: !!product.isFeatured,
      originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
      customCategory: isStandardCat ? '' : product.category,
      isActive: product.isActive !== false
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
    
    const priceVal = formData.price ? Number(formData.price) : 0;
    const originalPriceVal = formData.originalPrice ? Number(formData.originalPrice) : 0;

    if (!formData.name || (!priceVal && !originalPriceVal) || !formData.category || !formData.image) {
      alert('Please fill out all required fields (Name, Category, Image, and at least one price).');
      return;
    }

    setFormSubmitting(true);
    
    // Parse details text area into array of lines, removing empty lines
    const details = formData.detailsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    let finalPrice = 0;
    let finalOriginalPrice = 0;

    if (priceVal && originalPriceVal) {
      finalPrice = priceVal;
      finalOriginalPrice = originalPriceVal;
    } else if (priceVal) {
      finalPrice = priceVal;
      finalOriginalPrice = 0;
    } else {
      finalPrice = originalPriceVal;
      finalOriginalPrice = 0;
    }

    const payload = {
      name: formData.name,
      price: finalPrice,
      category: formData.category === 'custom' ? formData.customCategory.trim() : formData.category,
      image: formData.image,
      description: formData.description,
      details,
      isFeatured: formData.isFeatured,
      originalPrice: finalOriginalPrice,
      isActive: formData.isActive
    };

    try {
      if (editingProduct) {
        // Edit mode
        const updated = await apiRequest(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          body: payload
        });
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
      } else {
        // Add mode
        const created = await apiRequest('/api/products', {
          method: 'POST',
          body: payload
        });
        setProducts(prev => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to save product');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleProductActive = async (product) => {
    const newStatus = product.isActive !== false ? false : true;
    try {
      const updated = await apiRequest(`/api/products/${product.id}`, {
        method: 'PUT',
        body: { isActive: newStatus }
      });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: updated.isActive } : p));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update status');
    }
  };

  // Get distinct categories dynamically
  const categoriesList = ['All', ...new Set(products.map(p => p.category))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    const matchesSearch = 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '15px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-gold)' }}></i>
        <p style={{ color: 'var(--color-gray-text)' }}>Loading hampers inventory...</p>
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
              <option key={cat} value={cat}>{cat} Category</option>
            ))}
          </select>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
            />
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-text)', fontSize: '0.85rem' }}></i>
          </div>
        </div>

        {/* Add Product Button */}
        <button className="btn-admin" onClick={openAddModal}>
          <i className="fa-solid fa-plus"></i> Add New Hamper
        </button>
      </div>

      {error && (
        <div style={{ background: '#FFF5F5', color: '#E53E3E', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="dashboard-panel">
        <div className="table-responsive">
          {filteredProducts.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Hamper Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Views</th>
                  <th>Clicks (Cart)</th>
                  <th>Conv. Rate</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const conversionRate = product.views > 0
                    ? ((product.clicks || 0) / product.views * 100).toFixed(1)
                    : 0;
                  return (
                    <tr key={product.id}>
                      <td>
                        {/* Show image or placeholder circle */}
                        <img 
                          src={product.image.startsWith('http') || product.image.startsWith('/assets') ? product.image : '/assets/hero_banner.png'} 
                          alt={product.name} 
                          style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-gray-border)' }} 
                          onError={(e) => {
                            const fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23F3E8FF'/%3E%3Ctext x='50%25' y='55%25' font-family='sans-serif' font-size='12' fill='%23701A75' text-anchor='middle'%3EGift%3C/text%3E%3C/svg%3E";
                            if (e.target.src !== fallback) {
                              e.target.src = fallback;
                            }
                          }}
                        />
                      </td>
                      <td className="font-semibold" style={{ color: 'var(--color-purple-dark)' }}>{product.name}</td>
                      <td>{product.category}</td>
                      <td className="font-semibold">
                        ₹{product.price.toLocaleString()}
                        {product.originalPrice > 0 && product.originalPrice > product.price && (
                          <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.75rem', marginLeft: '6px', fontWeight: 'normal' }}>
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <i className="fa-regular fa-eye" style={{ color: 'var(--color-gray-text)' }}></i>
                          {product.views || 0}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <i className="fa-solid fa-arrow-pointer" style={{ color: 'var(--color-gray-text)' }}></i>
                          {product.clicks || 0}
                        </span>
                      </td>
                      <td className="font-semibold" style={{ color: conversionRate >= 10 ? 'var(--color-delivered)' : 'var(--color-purple)' }}>
                        {conversionRate}%
                      </td>
                      <td>
                        {product.isFeatured ? (
                          <span className="badge confirmed">
                            <i className="fa-solid fa-circle-check"></i> Featured
                          </span>
                        ) : (
                          <span className="badge pending" style={{ background: '#E9ECEF', color: '#6C757D' }}>
                            Standard
                          </span>
                        )}
                      </td>
                      <td>
                        {product.isActive !== false ? (
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
                            onClick={() => openEditModal(product)}
                            title="Edit Product"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            className="btn-admin"
                            style={{ 
                              padding: '0.4rem 0.6rem', 
                              fontSize: '0.72rem', 
                              background: product.isActive !== false ? 'var(--color-purple)' : 'var(--color-gold)',
                              color: '#fff'
                            }}
                            onClick={() => handleToggleProductActive(product)}
                            title={product.isActive !== false ? "Set as Inactive" : "Set as Active"}
                          >
                            <i className={product.isActive !== false ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <i className="fa-solid fa-gift"></i>
              <p>No hampers found matching search.</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{editingProduct ? `Edit Hamper: ${editingProduct.name}` : 'Add New Gift Hamper'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-name">Hamper Name *</label>
                  <input
                    type="text"
                    id="prod-name"
                    name="name"
                    className="form-input"
                    placeholder="e.g. Traditional Brass Diya Set"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-price">Offer Price (₹)</label>
                    <input
                      type="number"
                      id="prod-price"
                      name="price"
                      className="form-input"
                      placeholder="e.g. 599"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-orig-price">Original Price (Strike-through) (₹)</label>
                    <input
                      type="number"
                      id="prod-orig-price"
                      name="originalPrice"
                      className="form-input"
                      placeholder="e.g. 799"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>

                {(() => {
                  const offerVal = Number(formData.price);
                  const origVal = Number(formData.originalPrice);
                  if (origVal > 0 && origVal > offerVal) {
                    const pct = Math.round(((origVal - offerVal) / origVal) * 100);
                    return (
                      <div style={{ background: '#F0FDF4', color: '#16A34A', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '15px', border: '1px solid #DCFCE7' }}>
                        <i className="fa-solid fa-tags"></i> Live Discount calculated: {pct}% OFF
                      </div>
                    );
                  }
                  return null;
                })()}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-cat">Category *</label>
                    <select
                      id="prod-cat"
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Wedding">Wedding</option>
                      <option value="Baby Shower">Baby Shower</option>
                      <option value="Housewarming">Housewarming</option>
                      <option value="Brass">Brass Gifting</option>
                      <option value="Corporate">Corporate Gifting</option>
                      <option value="Customized">Customized Hampers</option>
                      <option value="custom">✍️ Custom Category (Write-in)...</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-img">Image Path / URL *</label>
                    
                    {/* File Uploader */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-gray-text)' }}>
                        Upload file (converts to WebP & uploads to R2)
                      </span>
                      <input
                        type="file"
                        id="prod-image-file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="form-input"
                        style={{ padding: '6px 12px' }}
                      />
                      {uploadingImage && (
                        <small style={{ color: 'var(--color-purple)', fontWeight: 500 }}>
                          <i className="fa-solid fa-spinner fa-spin"></i> Processing and uploading WebP...
                        </small>
                      )}
                    </div>

                    <input
                      type="text"
                      id="prod-img"
                      name="image"
                      className="form-input"
                      placeholder="Auto-filled on upload or select template"
                      value={formData.image}
                      readOnly
                      required
                      style={{ background: '#f1f3f5', cursor: 'not-allowed' }}
                    />
                    <select
                      className="form-select"
                      style={{ marginTop: '5px', fontSize: '0.8rem', padding: '4px 8px', height: 'auto' }}
                      onChange={(e) => {
                        if (e.target.value) {
                          setFormData(prev => ({ ...prev, image: e.target.value }));
                        }
                      }}
                      value=""
                    >
                      <option value="" disabled>-- Or Select Quick Template Asset --</option>
                      <option value="/assets/wedding_gift.png">Wedding Hamper (/assets/wedding_gift.png)</option>
                      <option value="/assets/baby_shower.png">Baby Shower (/assets/baby_shower.png)</option>
                      <option value="/assets/housewarming.png">Housewarming (/assets/housewarming.png)</option>
                      <option value="/assets/corporate.png">Corporate Hamper (/assets/corporate.png)</option>
                      <option value="/assets/brass_cup.png">Brass Cup (/assets/brass_cup.png)</option>
                      <option value="/assets/half_saree.png">Half Saree (/assets/half_saree.png)</option>
                      <option value="/assets/hero_banner.png">Hero Banner default (/assets/hero_banner.png)</option>
                    </select>

                    {/* Image Preview Block */}
                    {formData.image && (
                      <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <img 
                          src={formData.image} 
                          alt="Preview" 
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-gray-border)' }} 
                        />
                        <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <i className="fa-solid fa-circle-check"></i> Image Active
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {formData.category === 'custom' && (
                  <div className="form-group" style={{ marginTop: '5px', marginBottom: '15px' }}>
                    <label className="form-label" htmlFor="prod-custom-cat">Custom Category Name *</label>
                    <input
                      type="text"
                      id="prod-custom-cat"
                      name="customCategory"
                      className="form-input"
                      placeholder="e.g. Diwali Specials"
                      value={formData.customCategory}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-desc">Brief Description</label>
                  <textarea
                    id="prod-desc"
                    name="description"
                    className="form-textarea"
                    rows="2"
                    placeholder="Short marketing text shown in catalogs..."
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-details">Items Inside Hamper (One specification per line)</label>
                  <textarea
                    id="prod-details"
                    name="detailsText"
                    className="form-textarea"
                    rows="4"
                    placeholder="e.g.&#10;1 x Engraved Traditional Brass Bowl&#10;2 x Aromatic Jasmine Candles&#10;1 x Custom Greeting Card"
                    value={formData.detailsText}
                    onChange={handleInputChange}
                  ></textarea>
                  <small style={{ color: 'var(--color-gray-text)', fontSize: '0.75rem' }}>
                    Press Enter to start a new line for each detail. These will show as bullet points on the product page.
                  </small>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '1rem' }}>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <input
                      type="checkbox"
                      id="prod-feat"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="prod-feat" style={{ fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem' }}>
                      Feature on Homepage slider
                    </label>
                  </div>

                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <input
                      type="checkbox"
                      id="prod-active"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="prod-active" style={{ fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem' }}>
                      Show in Storefront (Active)
                    </label>
                  </div>
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
                    'Save Product'
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
