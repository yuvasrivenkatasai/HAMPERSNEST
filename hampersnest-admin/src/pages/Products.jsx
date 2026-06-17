import React, { useState, useEffect } from 'react';
import { apiRequest, API_BASE, apiDownload } from '../utils/api';
import CatalogExportModal from '../components/CatalogExportModal';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means "Add Product" mode
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Catalog Modal state
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  
  // Import modal states
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState('CREATE_ONLY');
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  
  // Bulk selection states
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkCategory, setBulkCategory] = useState('');
  
  const adminRole = localStorage.getItem('adminRole') || 'Staff';

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    category: '',
    subCategory: '',
    image: '',
    description: '',
    detailsText: '', // text area split by newlines
    isFeatured: false,
    originalPrice: '',
    isActive: true,
    images: [],
    videoUrls: [],
    customGiftTagEnabled: true,
    addonsEnabled: true,
    customizationText: 'Make your gift extra special by adding a custom gift tag and selecting add-ons.',
    deliveryInfoText: 'Standard Delivery: 3-5 business days. Express Delivery available at checkout.'
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);

  const handleImagesSelected = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newItems = files.map(file => ({
      id: Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
      file,
      preview: URL.createObjectURL(file)
    }));

    setSelectedImages(prev => [...prev, ...newItems]);
  };

  const moveImage = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= selectedImages.length) return;

    const updated = [...selectedImages];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;

    setSelectedImages(updated);
  };

  const setAsCover = (index) => {
    if (index <= 0 || index >= selectedImages.length) return;

    const updated = [...selectedImages];
    const target = updated.splice(index, 1)[0];
    updated.unshift(target);

    setSelectedImages(updated);
  };

  const removeImage = (index) => {
    const item = selectedImages[index];
    if (item.file && item.preview.startsWith('blob:')) {
      URL.revokeObjectURL(item.preview);
    }
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoSelected = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedVideos(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
        file,
        preview: URL.createObjectURL(file)
      }
    ]);
  };

  const removeVideo = (index) => {
    const item = selectedVideos[index];
    if (item.file && item.preview.startsWith('blob:')) {
      URL.revokeObjectURL(item.preview);
    }
    setSelectedVideos(prev => prev.filter((_, i) => i !== index));
  };

  const fetchProducts = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiRequest('/api/products?all=true'),
        apiRequest('/api/categories')
      ]);
      setProducts(productsData.products || productsData.data || productsData.rows || (Array.isArray(productsData) ? productsData : []));
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
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
    setSelectedImages([]);
    setSelectedVideos([]);
    const defaultCategory = categories.filter(c => !c.parentId)[0]?.id || '';
    const newId = (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID)
      ? window.crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
    setFormData({
      id: newId,
      name: '',
      price: '',
      category: defaultCategory,
      subCategory: '',
      image: '',
      description: '',
      detailsText: '',
      isFeatured: false,
      originalPrice: '',
      isActive: true,
      images: [],
      videoUrls: [],
      customGiftTagEnabled: true,
      addonsEnabled: true,
      customizationText: 'Make your gift extra special by adding a custom gift tag and selecting add-ons.',
      deliveryInfoText: 'Standard Delivery: 3-5 business days. Express Delivery available at checkout.'
    });
    setModalOpen(true);
  };

  const getCategoryLabel = (categoryId) => {
    return (Array.isArray(categories) ? categories : []).find(category => category.id === categoryId)?.name || categoryId || 'Uncategorized';
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    
    const combinedImages = [];
    if (product.image) {
      combinedImages.push(product.image);
    }
    if (Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && !combinedImages.includes(img)) {
          combinedImages.push(img);
        }
      });
    }

    setSelectedImages(combinedImages.map(url => ({
      id: Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
      url,
      preview: url
    })));

    setSelectedVideos((Array.isArray(product.videoUrls) ? product.videoUrls : []).map(url => ({
      id: Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
      url,
      preview: url
    })));

    setFormData({
      id: product.id || '',
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      subCategory: product.subCategory || '',
      image: product.image || '',
      description: product.description || '',
      detailsText: product.details ? product.details.join('\n') : '',
      isFeatured: !!product.isFeatured,
      originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
      isActive: product.isActive !== false,
      images: combinedImages,
      videoUrls: Array.isArray(product.videoUrls) ? product.videoUrls : [],
      customGiftTagEnabled: product.customGiftTagEnabled !== false,
      addonsEnabled: product.addonsEnabled !== false,
      customizationText: product.customizationText || 'Make your gift extra special by adding a custom gift tag and selecting add-ons.',
      deliveryInfoText: product.deliveryInfoText || 'Standard Delivery: 3-5 business days. Express Delivery available at checkout.'
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    selectedImages.forEach(img => {
      if (img.file && img.preview && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview);
      }
    });
    selectedVideos.forEach(vid => {
      if (vid.file && vid.preview && vid.preview.startsWith('blob:')) {
        URL.revokeObjectURL(vid.preview);
      }
    });
    setModalOpen(false);
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

    if (!formData.name || (!priceVal && !originalPriceVal) || !formData.category || selectedImages.length === 0) {
      alert('Please fill out all required fields (Name, Category, at least one Image, and at least one price).');
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

    try {
      const token = localStorage.getItem('adminToken');

      // 1. Upload Images to R2/Local Storage
      const uploadedImages = [];
      for (let i = 0; i < selectedImages.length; i++) {
        const item = selectedImages[i];
        if (item.file) {
          const formDataObj = new FormData();
          formDataObj.append('image', item.file);
          
          const response = await fetch(`${API_BASE}/api/upload?folder=products&productId=${formData.id}`, {
            method: 'POST',
            headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
            body: formDataObj
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Failed to upload image: ${item.file.name}`);
          }

          const data = await response.json();
          uploadedImages.push(data.url);
        } else {
          uploadedImages.push(item.url);
        }
      }

      // 2. Upload Videos to R2/Local Storage
      const uploadedVideos = [];
      for (let i = 0; i < selectedVideos.length; i++) {
        const item = selectedVideos[i];
        if (item.file) {
          const formDataObj = new FormData();
          formDataObj.append('video', item.file);
          
          const response = await fetch(`${API_BASE}/api/upload/video?folder=products&productId=${formData.id}`, {
            method: 'POST',
            headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
            body: formDataObj
          });

          if (!response.ok) {
            throw new Error(`Failed to upload video: ${item.file.name}`);
          }

          const data = await response.json();
          uploadedVideos.push(data.url);
        } else {
          uploadedVideos.push(item.url);
        }
      }

      const payload = {
        id: formData.id,
        name: formData.name,
        price: finalPrice,
        category: formData.category,
        subCategory: formData.subCategory || '',
        image: uploadedImages[0] || '/assets/hero_banner.png',
        description: formData.description,
        details,
        isFeatured: formData.isFeatured,
        originalPrice: finalOriginalPrice,
        isActive: formData.isActive,
        images: uploadedImages.slice(1),
        videoUrls: uploadedVideos,
        customGiftTagEnabled: formData.customGiftTagEnabled,
        addonsEnabled: formData.addonsEnabled,
        customizationText: formData.customizationText,
        deliveryInfoText: formData.deliveryInfoText
      };

      if (editingProduct) {
        // Edit mode
        const updated = await apiRequest(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          body: payload
        });
        setProducts(prev => (Array.isArray(prev) ? prev : []).map(p => p.id === editingProduct.id ? updated : p));
      } else {
        // Add mode
        const created = await apiRequest('/api/products', {
          method: 'POST',
          body: payload
        });
        setProducts(prev => [created, ...(Array.isArray(prev) ? prev : [])]);
      }
      handleCloseModal();
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
      setProducts(prev => (Array.isArray(prev) ? prev : []).map(p => p.id === product.id ? { ...p, isActive: updated.isActive } : p));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update status');
    }
  };

  // Get distinct categories dynamically
  const categoriesList = ['All', ...new Set([
    ...(Array.isArray(categories) ? categories : []).map(category => category.id),
    ...(Array.isArray(products) ? products : []).map(p => p.category)
  ].filter(Boolean))];

  // Filter products
  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter(product => {
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    const categoryLabel = getCategoryLabel(product.category).toLowerCase();
    const matchesSearch = 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      categoryLabel.includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Bulk actions handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const executeBulkUpdate = async (updates) => {
    if (!window.confirm(`Apply these changes to ${selectedIds.length} products?`)) return;
    try {
      await apiRequest('/api/products/bulk-update', {
        method: 'POST',
        body: { ids: selectedIds, updates }
      });
      fetchProducts();
      setSelectedIds([]);
    } catch (err) {
      alert('Bulk update failed: ' + err.message);
    }
  };

  const executeBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} products? This cannot be undone.`)) return;
    try {
      await apiRequest('/api/products/bulk-delete', {
        method: 'POST',
        body: { ids: selectedIds }
      });
      fetchProducts();
      setSelectedIds([]);
    } catch (err) {
      alert('Bulk delete failed: ' + err.message);
    }
  };

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
              <option key={cat} value={cat}>{cat === 'All' ? 'All' : getCategoryLabel(cat)} Category</option>
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

        {/* Export / Import / Add Product Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {(adminRole === 'Super Admin' || adminRole === 'Manager') && (
            <>
              <button className="btn-admin-secondary" onClick={() => apiDownload('/api/products/export/csv', 'products.csv')}>
                <i className="fa-solid fa-file-csv"></i> Export CSV
              </button>
              <button className="btn-admin-secondary" onClick={() => apiDownload('/api/products/export/excel', 'products.xlsx')}>
                <i className="fa-solid fa-file-excel"></i> Export Excel
              </button>
              <button className="btn-admin-secondary" onClick={() => setImportModalOpen(true)}>
                <i className="fa-solid fa-file-import"></i> Import CSV
              </button>
              <button className="btn-admin" style={{ background: 'var(--color-gold)' }} onClick={() => setCatalogModalOpen(true)}>
                <i className="fa-solid fa-file-pdf"></i> PDF Catalog
              </button>
              <button className="btn-admin" onClick={openAddModal}>
                <i className="fa-solid fa-plus"></i> Add New Hamper
              </button>
            </>
          )}
        </div>
      </div>

      {/* IMPORT MODAL */}
      {importModalOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setImportModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Import Products via CSV</h3>
              <button className="modal-close" onClick={() => { setImportModalOpen(false); setImportResult(null); }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              {!importResult ? (
                <>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-text)', marginBottom: '15px' }}>
                    Upload a CSV file to import products. Download the <a href={`${API_BASE}/api/products/template/csv`} style={{ color: 'var(--color-purple)' }}>template here</a>.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Import Mode</label>
                    <select className="form-select" value={importMode} onChange={(e) => setImportMode(e.target.value)}>
                      <option value="CREATE_ONLY">Create New Only (Skip Existing SKUs)</option>
                      <option value="UPDATE_ONLY">Update Existing (Skip New SKUs)</option>
                      <option value="CREATE_UPDATE">Create + Update</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">CSV File</label>
                    <input type="file" accept=".csv" className="form-input" onChange={(e) => setImportFile(e.target.files[0])} style={{ padding: '8px' }} />
                  </div>
                </>
              ) : (
                <div style={{ padding: '20px', background: '#F3E8FF', borderRadius: '8px', textAlign: 'center' }}>
                  <i className="fa-solid fa-circle-check" style={{ color: 'var(--color-purple)', fontSize: '2rem', marginBottom: '10px' }}></i>
                  <h4>Import Complete</h4>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px', display: 'grid', gap: '10px' }}>
                    <li><strong>Total Rows Processed:</strong> {importResult.totalRows}</li>
                    <li style={{ color: '#16A34A' }}><strong>Created:</strong> {importResult.createdCount}</li>
                    <li style={{ color: '#2563EB' }}><strong>Updated:</strong> {importResult.updatedCount}</li>
                    <li style={{ color: '#6B7280' }}><strong>Skipped:</strong> {importResult.skippedCount}</li>
                    <li style={{ color: '#DC2626' }}><strong>Errors:</strong> {importResult.errorCount}</li>
                  </ul>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {!importResult ? (
                <>
                  <button className="btn-admin-secondary" onClick={() => setImportModalOpen(false)}>Cancel</button>
                  <button className="btn-admin" disabled={importing || !importFile} onClick={async () => {
                    setImporting(true);
                    const formData = new FormData();
                    formData.append('file', importFile);
                    formData.append('mode', importMode);
                    try {
                      const res = await apiRequest('/api/products/import/csv', { method: 'POST', body: formData });
                      setImportResult(res);
                      fetchProducts();
                    } catch (err) {
                      alert(err.message);
                    } finally {
                      setImporting(false);
                    }
                  }}>
                    {importing ? 'Importing...' : 'Start Import'}
                  </button>
                </>
              ) : (
                <button className="btn-admin" onClick={() => { setImportModalOpen(false); setImportResult(null); }}>Done</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CATALOG EXPORT MODAL */}
      <CatalogExportModal 
        isOpen={catalogModalOpen} 
        onClose={() => setCatalogModalOpen(false)} 
        products={products}
        categories={categories}
        selectedProductIds={selectedIds}
      />

      {error && (
        <div style={{ background: '#FFF5F5', color: '#E53E3E', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div style={{
          position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
          background: '#fff', padding: '15px 25px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          display: 'flex', gap: '15px', alignItems: 'center', zIndex: 1000, border: '1px solid var(--color-purple)'
        }}>
          <span style={{ fontWeight: 'bold', color: 'var(--color-purple)' }}>{selectedIds.length} Selected</span>
          <div style={{ height: '24px', width: '1px', background: '#ccc' }}></div>
          <button className="btn-admin-secondary" onClick={() => executeBulkUpdate({ isActive: true })}>Activate</button>
          <button className="btn-admin-secondary" onClick={() => executeBulkUpdate({ isActive: false })}>Deactivate</button>
          <button className="btn-admin-secondary" onClick={() => executeBulkUpdate({ isFeatured: true })}>Feature</button>
          <button className="btn-admin-secondary" onClick={() => executeBulkUpdate({ isFeatured: false })}>Unfeature</button>
          <div style={{ display: 'flex', gap: '5px' }}>
            <select className="form-select" value={bulkCategory} onChange={e => setBulkCategory(e.target.value)} style={{ padding: '0.4rem' }}>
              <option value="">Move to Category...</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <button className="btn-admin-secondary" disabled={!bulkCategory} onClick={() => executeBulkUpdate({ category: bulkCategory })}>Apply</button>
          </div>
          <div style={{ height: '24px', width: '1px', background: '#ccc' }}></div>
          {adminRole === 'Super Admin' && (
            <button className="btn-admin" style={{ background: '#dc3545', color: '#fff' }} onClick={executeBulkDelete}><i className="fa-solid fa-trash"></i> Delete</button>
          )}
        </div>
      )}

      {/* Products Table */}
      <div className="dashboard-panel">
        <div className="table-responsive">
          {filteredProducts.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                      onChange={handleSelectAll} 
                    />
                  </th>
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
                    <tr key={product.id} style={{ background: selectedIds.includes(product.id) ? '#F3E8FF' : 'transparent' }}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(product.id)}
                          onChange={() => handleSelectOne(product.id)} 
                        />
                      </td>
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
                      <td>{getCategoryLabel(product.category)}{product.subCategory ? ` > ${getCategoryLabel(product.subCategory)}` : ''}</td>
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
                          {(adminRole === 'Super Admin' || adminRole === 'Manager') && (
                            <>
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
                            </>
                          )}
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
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && handleCloseModal()}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{editingProduct ? `Edit Hamper: ${editingProduct.name}` : 'Add New Gift Hamper'}</h3>
              <button className="modal-close" type="button" onClick={handleCloseModal}>
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
                      {categories.filter(c => !c.parentId).map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    {categories.filter(c => !c.parentId).length === 0 && (
                      <small style={{ color: '#E53E3E', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                        Please create at least one Main Category before adding products.
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-subcat">Subcategory (Optional)</label>
                    <select
                      id="prod-subcat"
                      name="subCategory"
                      className="form-select"
                      value={formData.subCategory}
                      onChange={handleInputChange}
                    >
                      <option value="">-- None --</option>
                      {categories.filter(c => c.parentId === formData.category).map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                  {/* Left Column: Hamper Images */}
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ fontWeight: '600', color: 'var(--color-purple-dark)', fontSize: '0.95rem' }}>
                      Hamper Images * <span style={{ fontWeight: 'normal', fontSize: '0.8rem', color: 'var(--color-gray-text)' }}>(Upload multiple. Drag/reorder. The first image will be the Cover image)</span>
                    </label>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                      {/* Upload button wrapper */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input
                          type="file"
                          id="prod-images-multiple"
                          accept="image/*"
                          multiple
                          onChange={handleImagesSelected}
                          className="form-input"
                          style={{ padding: '6px 12px', width: '250px' }}
                        />
                      </div>
                    </div>

                    {/* Image ordering and manipulation grid */}
                    {selectedImages && selectedImages.length > 0 ? (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                        gap: '12px',
                        padding: '12px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px dashed #cbd5e1'
                      }}>
                        {selectedImages.map((img, idx) => (
                          <div key={img.id || idx} style={{
                            position: 'relative',
                            border: idx === 0 ? '2px solid var(--color-gold)' : '1px solid var(--color-gray-border)',
                            borderRadius: '8px',
                            padding: '4px',
                            background: '#fff',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                          }}>
                            <div style={{ position: 'relative', width: '100%', height: '80px' }}>
                              <img src={img.preview} alt={`Hamper ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                              {idx === 0 ? (
                                <span style={{ position: 'absolute', top: '4px', left: '4px', background: 'var(--color-gold)', color: '#000', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 'bold', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>Cover</span>
                              ) : (
                                <span style={{ position: 'absolute', top: '4px', left: '4px', background: 'var(--color-purple)', color: '#fff', padding: '2px 6px', fontSize: '0.65rem', fontWeight: '500', borderRadius: '4px' }}>Gallery</span>
                              )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '6px', gap: '2px' }}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveImage(idx, -1)}
                                className="btn-admin-secondary"
                                style={{ padding: '2px 5px', fontSize: '0.7rem', flex: 1, minWidth: 0 }}
                                title="Move Left/Up"
                              >
                                <i className="fa-solid fa-arrow-left"></i>
                              </button>
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setAsCover(idx)}
                                  className="btn-admin-secondary"
                                  style={{ padding: '2px 5px', fontSize: '0.7rem', flex: 1, minWidth: 0 }}
                                  title="Set as Cover"
                                >
                                  <i className="fa-solid fa-star" style={{ color: 'var(--color-gold)' }}></i>
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={idx === selectedImages.length - 1}
                                onClick={() => moveImage(idx, 1)}
                                className="btn-admin-secondary"
                                style={{ padding: '2px 5px', fontSize: '0.7rem', flex: 1, minWidth: 0 }}
                                title="Move Right/Down"
                              >
                                <i className="fa-solid fa-arrow-right"></i>
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="btn-admin-secondary"
                                style={{ padding: '2px 5px', fontSize: '0.7rem', background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', flex: 1, minWidth: 0 }}
                                title="Remove"
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px dashed #cbd5e1',
                        color: 'var(--color-gray-text)',
                        fontSize: '0.85rem'
                      }}>
                        <i className="fa-regular fa-image" style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'block' }}></i>
                        No images uploaded yet. Select files above.
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginTop: '15px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-video-file">Product Videos (MP4/WebM)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
                      <input
                        type="file"
                        id="prod-video-file"
                        accept="video/mp4,video/webm"
                        onChange={handleVideoSelected}
                        className="form-input"
                        style={{ padding: '6px 12px' }}
                      />
                    </div>
                    {selectedVideos && selectedVideos.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                        {selectedVideos.map((vid, idx) => (
                          <div key={vid.id || idx} style={{ position: 'relative', background: '#000', borderRadius: '4px', padding: '2px' }}>
                            <video src={vid.preview} style={{ width: '80px', height: '50px', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={() => removeVideo(idx)}
                              style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>



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

                <div style={{ padding: '15px', background: '#F8F9FA', borderRadius: '8px', marginTop: '15px', border: '1px solid #E9ECEF' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--color-purple)' }}>Storefront Personalization Options</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      <input
                        type="checkbox"
                        id="prod-gift-tag"
                        name="customGiftTagEnabled"
                        checked={formData.customGiftTagEnabled}
                        onChange={handleInputChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="prod-gift-tag" style={{ fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem' }}>
                        Enable Custom Gift Tag field
                      </label>
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      <input
                        type="checkbox"
                        id="prod-addons"
                        name="addonsEnabled"
                        checked={formData.addonsEnabled}
                        onChange={handleInputChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="prod-addons" style={{ fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem' }}>
                        Enable Add-ons selection
                      </label>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label className="form-label" htmlFor="prod-cust-text">Customization Section Text</label>
                    <textarea
                      id="prod-cust-text"
                      name="customizationText"
                      className="form-textarea"
                      rows="2"
                      placeholder="e.g. Make your gift extra special..."
                      value={formData.customizationText}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="prod-del-info">Delivery Information Text</label>
                    <textarea
                      id="prod-del-info"
                      name="deliveryInfoText"
                      className="form-textarea"
                      rows="2"
                      placeholder="e.g. Standard Delivery: 3-5 business days."
                      value={formData.deliveryInfoText}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
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
                <button type="button" className="btn-admin-secondary" onClick={handleCloseModal} disabled={formSubmitting}>
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
