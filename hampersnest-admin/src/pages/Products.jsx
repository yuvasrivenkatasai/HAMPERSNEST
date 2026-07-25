import React, { useState, useEffect, useRef } from 'react';
import { apiRequest, API_BASE, apiDownload } from '../utils/api';
import BulkImportWizard from '../components/BulkImportWizard';
import CatalogExportModal from '../components/CatalogExportModal';
import BulkVariantModal from '../components/BulkVariantModal';
import BulkImageImportModal from '../components/BulkImageImportModal';

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
  
  // Export/Import/Catalog State
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkVariantModalOpen, setBulkVariantModalOpen] = useState(false);
  const [imageImportModalOpen, setImageImportModalOpen] = useState(false);
  
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
    shortDescription: '',
    rating: 4.5,
    isFeatured: false,
    originalPrice: '',
    isActive: true,
    images: [],
    videoUrls: [],
    customGiftTagEnabled: true,
    addonsEnabled: true,
    customAddons: [],
    customizationText: 'Make your gift extra special by adding a custom gift tag and selecting add-ons.',
    deliveryInfoText: 'Standard Delivery: 3-5 business days. Express Delivery available at checkout.',
    watermarkSettings: {
      enabled: true,
      type: 'Brand Name',
      text: 'Hampers Nest',
      position: 'Top Left',
      opacity: 18,
      size: 'Medium'
    },
    variantsEnabled: false,
    variants: []
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
      shortDescription: '',
      rating: 4.5,
      isFeatured: false,
      originalPrice: '',
      isActive: true,
      images: [],
      videoUrls: [],
      customGiftTagEnabled: true,
      addonsEnabled: true,
      customAddons: [
        { name: 'Scented Wax Candle', price: 99 },
        { name: 'Extra Chocolates (Pack of 4)', price: 149 },
        { name: 'Premium Hydration Flask', price: 299 },
        { name: 'Calligraphy Message Card', price: 49 }
      ],
      customizationText: 'Make your gift extra special by adding a custom gift tag and selecting add-ons.',
      deliveryInfoText: `🚚 Dispatch:
Orders are dispatched within 2–7 business days.

📦 Delivery:
We deliver across India and internationally through trusted courier partners.

⚖️ Shipping Charges:
Delivery charges are calculated based on the higher of the actual weight or volumetric weight, according to courier company guidelines.

🎁 Bulk Orders:
Automatic discounts are applied at checkout:
• 50+ items → 5% OFF
• 100+ items → 10% OFF
• 200+ items → 15% OFF`,
      watermarkSettings: {
        enabled: true,
        type: 'Brand Name',
        text: 'Hampers Nest',
        position: 'Bottom Right',
        opacity: 18,
        size: 'Medium'
      },
      variantsEnabled: false,
      variants: []
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
      shortDescription: product.shortDescription || '',
      rating: product.rating !== undefined ? product.rating : 4.5,
      isFeatured: !!product.isFeatured,
      originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
      isActive: product.isActive !== false,
      images: combinedImages,
      videoUrls: Array.isArray(product.videoUrls) ? product.videoUrls : [],
      customGiftTagEnabled: product.customGiftTagEnabled !== false,
      addonsEnabled: product.addonsEnabled !== false,
      customAddons: Array.isArray(product.customAddons) && product.customAddons.length > 0 
        ? product.customAddons 
        : (product.addonsEnabled !== false ? [
          { name: 'Scented Wax Candle', price: 99 },
          { name: 'Extra Chocolates (Pack of 4)', price: 149 },
          { name: 'Premium Hydration Flask', price: 299 },
          { name: 'Calligraphy Message Card', price: 49 }
        ] : []),
      customizationText: product.customizationText || 'Make your gift extra special by adding a custom gift tag and selecting add-ons.',
      deliveryInfoText: (!product.deliveryInfoText || product.deliveryInfoText === 'Standard Delivery: 3-5 business days. Express Delivery available at checkout.') ? `🚚 Dispatch:
Orders are dispatched within 2–7 business days.

📦 Delivery:
We deliver across India and internationally through trusted courier partners.

⚖️ Shipping Charges:
Delivery charges are calculated based on the higher of the actual weight or volumetric weight, according to courier company guidelines.

🎁 Bulk Orders:
Automatic discounts are applied at checkout:
• 50+ items → 5% OFF
• 100+ items → 10% OFF
• 200+ items → 15% OFF` : product.deliveryInfoText,
      watermarkSettings: product.watermarkSettings || {
        enabled: true,
        type: 'Brand Name',
        text: 'Hampers Nest',
        position: 'Bottom Right',
        opacity: 18,
        size: 'Medium'
      },
      variantsEnabled: !!product.variantsEnabled,
      variants: Array.isArray(product.variants) ? product.variants : []
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

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { id: Date.now().toString(), name: '', price: '', sku: '', stock: '', isDefault: prev.variants.length === 0 }]
    }));
  };

  const handleUpdateVariant = (index, field, value) => {
    const updated = [...formData.variants];
    updated[index][field] = value;
    if (field === 'isDefault' && value === true) {
      updated.forEach((v, i) => { if (i !== index) v.isDefault = false; });
    }
    setFormData(prev => ({ ...prev, variants: updated }));
  };

  const handleRemoveVariant = (index) => {
    const updated = formData.variants.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some(v => v.isDefault)) {
      updated[0].isDefault = true;
    }
    setFormData(prev => ({ ...prev, variants: updated }));
  };

  const handleAddCustomAddon = () => {
    setFormData(prev => ({
      ...prev,
      customAddons: [...prev.customAddons, { name: '', price: '' }]
    }));
  };

  const handleUpdateCustomAddon = (index, field, value) => {
    const updated = [...formData.customAddons];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, customAddons: updated }));
  };

  const handleRemoveCustomAddon = (index) => {
    const updated = formData.customAddons.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, customAddons: updated }));
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
          let uploadUrl = `${API_BASE}/api/upload?folder=products&productId=${formData.id}`;
          if (formData.watermarkSettings && formData.watermarkSettings.enabled) {
            uploadUrl += `&watermarkEnabled=true`;
          }

          const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
            body: formDataObj
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Failed to upload image: ${item.file.name}`);
          }

          const data = await response.json();
          // If a watermarked version was generated, save that, otherwise save the original
          if (data.watermarkedUrl) {
            uploadedImages.push(data.watermarkedUrl);
          } else {
            uploadedImages.push(data.url);
          }
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
        shortDescription: formData.shortDescription,
        rating: Number(formData.rating) || 4.5,
        isFeatured: formData.isFeatured,
        originalPrice: finalOriginalPrice,
        isActive: formData.isActive,
        images: uploadedImages.slice(1),
        videoUrls: uploadedVideos,
        customGiftTagEnabled: formData.customGiftTagEnabled,
        addonsEnabled: formData.addonsEnabled,
        customizationText: formData.customizationText,
        deliveryInfoText: formData.deliveryInfoText,
        watermarkSettings: formData.watermarkSettings,
        variantsEnabled: formData.variantsEnabled,
        variants: formData.variants,
        customAddons: formData.customAddons.filter(a => a.name.trim() !== '')
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

  const handleDuplicateProduct = async (product) => {
    try {
      const duplicated = await apiRequest(`/api/products/${product.id}/duplicate`, { method: 'POST' });
      setProducts(prev => [duplicated, ...(Array.isArray(prev) ? prev : [])]);
      openEditModal(duplicated);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to duplicate product');
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

  const executeBulkWatermark = async () => {
    if (!window.confirm(`Queue watermark regeneration for ${selectedIds.length} products?`)) return;
    try {
      await apiRequest('/api/products/bulk-watermark', {
        method: 'POST',
        body: { ids: selectedIds }
      });
      alert('Bulk watermark regeneration queued in background.');
      setSelectedIds([]);
    } catch (err) {
      alert('Bulk watermark failed: ' + err.message);
    }
  };

  const executeBulkVariants = async (action, payload) => {
    try {
      await apiRequest('/api/products/bulk-variants', {
        method: 'POST',
        body: { ids: selectedIds, action, payload }
      });
      alert('Bulk variant update applied successfully.');
      setBulkVariantModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert('Bulk variant update failed: ' + err.message);
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
              <button className="btn-admin-secondary" onClick={() => apiDownload('/api/products/export/images-zip', 'product_images.zip')}>
                <i className="fa-solid fa-file-zipper"></i> Export Images (ZIP)
              </button>
              <button className="btn-admin-secondary" onClick={() => setBulkImportOpen(true)}>
                <i className="fa-solid fa-boxes-packing"></i> Bulk Import
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


      {/* BULK IMPORT MODAL */}
      <BulkImportWizard 
        isOpen={bulkImportOpen} 
        onClose={() => setBulkImportOpen(false)} 
        categories={categories}
        setCategories={setCategories}
        products={products}
        setProducts={setProducts}
      />

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

      {/* BULK VARIANT MODAL */}
      <BulkVariantModal 
        isOpen={bulkVariantModalOpen}
        onClose={() => setBulkVariantModalOpen(false)}
        selectedIds={selectedIds}
        onExecute={executeBulkVariants}
      />

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
          <button className="btn-admin-secondary" onClick={executeBulkWatermark}>Apply Watermark</button>
          <button className="btn-admin-secondary" onClick={() => setBulkVariantModalOpen(true)}>Manage Variants</button>
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
                                className="btn-admin-secondary"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.72rem' }}
                                onClick={() => handleDuplicateProduct(product)}
                                title="Duplicate Product"
                              >
                                <i className="fa-solid fa-copy"></i>
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

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label" htmlFor="prod-rating">Product Rating</label>
                  <input
                    type="number"
                    id="prod-rating"
                    name="rating"
                    className="form-input"
                    placeholder="e.g. 4.5"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={handleInputChange}
                  />
                </div>

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
                <div style={{ padding: '15px', background: '#F8F9FA', borderRadius: '8px', marginTop: '15px', border: '1px solid #E9ECEF' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--color-purple)' }}>Image Watermark</h4>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                    <input
                      type="checkbox"
                      id="wm-enabled"
                      checked={formData.watermarkSettings?.enabled !== false}
                      onChange={(e) => setFormData(prev => ({...prev, watermarkSettings: {...prev.watermarkSettings, enabled: e.target.checked}}))}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="wm-enabled" style={{ fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem' }}>
                      Enable Watermark
                    </label>
                  </div>
                  {formData.watermarkSettings?.enabled !== false && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="form-group">
                        <label className="form-label">Watermark Type</label>
                        <select
                          className="form-input"
                          value={formData.watermarkSettings?.type || 'Brand Name'}
                          onChange={(e) => setFormData(prev => ({...prev, watermarkSettings: {...prev.watermarkSettings, type: e.target.value}}))}
                        >
                          <option value="Logo">Logo</option>
                          <option value="Brand Name">Brand Name</option>
                          <option value="Logo + Brand Name">Logo + Brand Name</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Watermark Text</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.watermarkSettings?.text || 'Hampers Nest'}
                          onChange={(e) => setFormData(prev => ({...prev, watermarkSettings: {...prev.watermarkSettings, text: e.target.value}}))}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Position</label>
                        <select
                          className="form-input"
                          value={formData.watermarkSettings?.position || 'Top Left'}
                          onChange={(e) => setFormData(prev => ({...prev, watermarkSettings: {...prev.watermarkSettings, position: e.target.value}}))}
                        >
                          <option value="Top Left">Top Left</option>
                          <option value="Top Right">Top Right</option>
                          <option value="Bottom Left">Bottom Left</option>
                          <option value="Bottom Right">Bottom Right</option>
                          <option value="Center">Center</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Opacity (%)</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className="form-input"
                          value={formData.watermarkSettings?.opacity || 18}
                          onChange={(e) => setFormData(prev => ({...prev, watermarkSettings: {...prev.watermarkSettings, opacity: parseInt(e.target.value) || 18}}))}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Size</label>
                        <select
                          className="form-input"
                          value={formData.watermarkSettings?.size || 'Medium'}
                          onChange={(e) => setFormData(prev => ({...prev, watermarkSettings: {...prev.watermarkSettings, size: e.target.value}}))}
                        >
                          <option value="Small">Small</option>
                          <option value="Medium">Medium</option>
                          <option value="Large">Large</option>
                        </select>
                      </div>
                      
                      {editingProduct && (
                        <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                          <button
                            type="button"
                            className="btn-admin-secondary"
                            onClick={async () => {
                              try {
                                await apiRequest(`/api/products/${editingProduct.id}/watermark`, { method: 'POST' });
                                alert('Watermark regeneration queued successfully!');
                              } catch(e) {
                                alert('Failed to regenerate watermark: ' + e.message);
                              }
                            }}
                          >
                            <i className="fa-solid fa-arrows-rotate"></i> Regenerate Watermark
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Product Size Variants */}
                <div style={{ padding: '15px', background: '#F8F9FA', borderRadius: '8px', marginTop: '15px', border: '1px solid #E9ECEF' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--color-purple)' }}>Product Size Variants</h4>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                    <input
                      type="checkbox"
                      id="var-enabled"
                      checked={formData.variantsEnabled}
                      onChange={(e) => setFormData(prev => ({...prev, variantsEnabled: e.target.checked}))}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="var-enabled" style={{ fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem' }}>
                      Enable Size Variants (e.g., Small, Medium, Large)
                    </label>
                  </div>
                  
                  {formData.variantsEnabled && (
                    <div>
                      {formData.variants.map((variant, index) => (
                        <div key={variant.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto auto', gap: '10px', alignItems: 'center', marginBottom: '10px', padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Name (e.g., Small)" 
                            value={variant.name} 
                            onChange={(e) => handleUpdateVariant(index, 'name', e.target.value)} 
                          />
                          <input 
                            type="number" 
                            className="form-input" 
                            placeholder="Price" 
                            value={variant.price} 
                            onChange={(e) => handleUpdateVariant(index, 'price', e.target.value)} 
                          />
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="SKU" 
                            value={variant.sku} 
                            onChange={(e) => handleUpdateVariant(index, 'sku', e.target.value)} 
                          />
                          <input 
                            type="number" 
                            className="form-input" 
                            placeholder="Stock" 
                            value={variant.stock} 
                            onChange={(e) => handleUpdateVariant(index, 'stock', e.target.value)} 
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input 
                              type="radio" 
                              name="defaultVariant" 
                              checked={variant.isDefault} 
                              onChange={() => handleUpdateVariant(index, 'isDefault', true)} 
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.8rem' }}>Default</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveVariant(index)} 
                            className="btn-admin-secondary" 
                            style={{ padding: '4px 8px', color: 'red' }}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      ))}
                      <button type="button" className="btn-admin-secondary" onClick={handleAddVariant} style={{ marginTop: '5px' }}>
                        <i className="fa-solid fa-plus"></i> Add Size
                      </button>
                    </div>
                  )}
                </div>


                <div className="form-group">
                  <label className="form-label" htmlFor="prod-short-desc">Short Description</label>
                  <textarea
                    id="prod-short-desc"
                    name="shortDescription"
                    className="form-textarea"
                    rows="2"
                    placeholder="Brief description for cards and catalog (max 120 chars)..."
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-desc">Full Description</label>
                  <textarea
                    id="prod-desc"
                    name="description"
                    className="form-textarea"
                    rows="4"
                    placeholder="Full product description for detail pages..."
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
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

                  {formData.addonsEnabled && (
                    <div className="form-group" style={{ marginBottom: '20px', padding: '15px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label className="form-label" style={{ margin: 0 }}>Custom Add-ons Options</label>
                        <button type="button" className="btn btn-secondary" onClick={handleAddCustomAddon} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                          <i className="fa-solid fa-plus"></i> Add Option
                        </button>
                      </div>
                      
                      {formData.customAddons.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>No custom add-ons configured. The Add-ons section will be hidden for this product.</p>
                      ) : (
                        <div style={{ display: 'grid', gap: '10px' }}>
                          {formData.customAddons.map((addon, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Add-on Name (e.g. Greeting Card)"
                                value={addon.name}
                                onChange={(e) => handleUpdateCustomAddon(index, 'name', e.target.value)}
                                style={{ flex: 2 }}
                              />
                              <input
                                type="number"
                                className="form-input"
                                placeholder="Price (+₹)"
                                value={addon.price}
                                onChange={(e) => handleUpdateCustomAddon(index, 'price', e.target.value)}
                                style={{ flex: 1 }}
                              />
                              <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={() => handleRemoveCustomAddon(index)}
                                style={{ padding: '8px', minWidth: '40px', flexShrink: 0 }}
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

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
