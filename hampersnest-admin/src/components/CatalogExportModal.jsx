import React, { useState } from 'react';
import { generateCatalogPdf } from '../utils/pdfGenerator';
import { apiRequest } from '../utils/api';

export default function CatalogExportModal({ isOpen, onClose, products, categories, selectedProductIds }) {
  // Export Selection (Independent)
  const [exportMode, setExportMode] = useState(selectedProductIds?.length > 0 ? 'SELECTED' : 'ALL');
  
  // Sort By (Independent)
  const [sortBy, setSortBy] = useState('NAME_ASC');
  
  // Category & Subcategory filtering (Appears only when Sort By = Category)
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  
  // Display Options
  const [showPrice, setShowPrice] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [showSpecs, setShowSpecs] = useState(false);
  
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleGenerate = async (mode) => {
    setGenerating(true);
    setProgress(0);

    // 1. Filter by Export Selection
    let filteredProducts = products;
    if (exportMode === 'SELECTED') {
      filteredProducts = products.filter(p => selectedProductIds.includes(p.id));
    } else if (exportMode === 'FEATURED') {
      filteredProducts = products.filter(p => p.isFeatured === true || p.featured === true);
    } else if (exportMode === 'IN_STOCK') {
      filteredProducts = products.filter(p => p.stock > 0 || (p.variants && p.variants.some(v => v.stock > 0)));
    } else if (exportMode === 'OUT_OF_STOCK') {
      filteredProducts = products.filter(p => p.stock <= 0 && (!p.variants || !p.variants.some(v => v.stock > 0)));
    } else if (exportMode === 'ALL') {
      filteredProducts = products.filter(p => p.isActive !== false);
    }

    // 2. Filter by Category / Subcategory if Sort By = Category
    if (sortBy === 'CATEGORY') {
      if (selectedCategory) {
        filteredProducts = filteredProducts.filter(p => p.category === selectedCategory || p.categoryId === selectedCategory);
      }
      if (selectedSubcategory) {
        filteredProducts = filteredProducts.filter(p => p.subCategory === selectedSubcategory || p.subcategoryId === selectedSubcategory);
      }
    }

    if (filteredProducts.length === 0) {
      alert('No products available for the selected filters.');
      setGenerating(false);
      return;
    }

    // Attach human readable categories if possible
    let enrichedProducts = filteredProducts.map(p => {
      const catObj = categories.find(c => c.id === p.category);
      let catName = catObj?.name || p.category;
      let subcatName = p.subCategory;
      const subcatObj = categories.find(c => c.id === p.subCategory || c.id === p.subcategoryId);
      if (subcatObj) subcatName = subcatObj.name;
      
      return {
        ...p,
        categoryName: catName,
        subcategoryName: subcatName || p.subCategory
      };
    });

    console.log(`[PDF Generator] Products selected for PDF: ${enrichedProducts.length}`);

    // 3. Centralized Sorting Engine
    enrichedProducts.sort((a, b) => {
      const nameA = (a.name || '').replace(/^(a|an|the)\s+/i, '').trim();
      const nameB = (b.name || '').replace(/^(a|an|the)\s+/i, '').trim();

      switch (sortBy) {
        case 'NAME_ASC':
        case 'CATEGORY': // For CATEGORY, we sort by Name A-Z here, and pdfGenerator groups them
          return nameA.localeCompare(nameB);
        case 'NAME_DESC':
          return nameB.localeCompare(nameA);
        case 'PRICE_ASC':
          return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
        case 'PRICE_DESC':
          return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
        case 'RECENT':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    try {
      // Fetch the latest settings for Delivery Info and Footer
      let globalSettings = {};
      try {
        globalSettings = await apiRequest('/api/settings');
      } catch (e) {
        console.warn('Failed to fetch settings', e);
      }

      await generateCatalogPdf(enrichedProducts, mode, (prog) => setProgress(prog), {
        showPrice,
        showDescription,
        showSpecs,
        sortBy,
        exportMode,
        selectedCategory,
        selectedSubcategory,
        categories,
        pdfDeliveryInfo: globalSettings.pdfDeliveryInfo || '',
        settings: globalSettings
      });
    } catch (err) {
      console.error(err);
      alert('Failed to generate catalog. Check console for details.');
    } finally {
      setGenerating(false);
      if (mode === 'download') {
        onClose();
      }
    }
  };

  // Subcategories belonging to the selected category (or all if none selected)
  let availableSubcategories = [];
  if (selectedCategory) {
    availableSubcategories = categories
      .filter(c => c.parentId === selectedCategory)
      .sort((a, b) => a.name.localeCompare(b.name));
  } else {
    availableSubcategories = categories
      .filter(c => c.parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // Group subcategories if "All Categories" is selected
  const groupedSubcategories = {};
  if (!selectedCategory) {
    availableSubcategories.forEach(sc => {
      if (!groupedSubcategories[sc.parentId]) {
        groupedSubcategories[sc.parentId] = [];
      }
      groupedSubcategories[sc.parentId].push(sc);
    });
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && !generating && onClose()}>
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>Generate PDF Catalog</h3>
          <button className="modal-close" onClick={onClose} disabled={generating}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <p style={{ color: 'var(--color-gray-text)', marginBottom: '15px', fontSize: '0.9rem' }}>
            Generate a premium, luxury PDF catalog of Hampers Nest products to share directly with clients.
          </p>

          <div className="form-group">
            <label className="form-label">Export Selection</label>
            <select 
              className="form-select"
              value={exportMode}
              onChange={(e) => setExportMode(e.target.value)}
              disabled={generating}
            >
              <option value="ALL">All Active Products</option>
              {selectedProductIds?.length > 0 && (
                <option value="SELECTED">Selected Products ({selectedProductIds.length})</option>
              )}
              <option value="FEATURED">Featured Products</option>
              <option value="IN_STOCK">In Stock Products</option>
              <option value="OUT_OF_STOCK">Out of Stock Products</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label className="form-label">Sort By</label>
            <select 
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              disabled={generating}
            >
              <option value="NAME_ASC">Name (A-Z)</option>
              <option value="NAME_DESC">Name (Z-A)</option>
              <option value="PRICE_ASC">Price (Low to High)</option>
              <option value="PRICE_DESC">Price (High to Low)</option>
              <option value="CATEGORY">Category</option>
              <option value="RECENT">Recently Added</option>
            </select>
          </div>

          {sortBy === 'CATEGORY' && (
            <div style={{ padding: '15px', background: '#F8F9FA', borderRadius: '6px', marginTop: '15px', border: '1px solid #E9ECEF' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Select Category</label>
                <select 
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory(''); // reset subcat on cat change
                  }}
                  disabled={generating}
                >
                  <option value="">All Categories</option>
                  {categories.filter(c => !c.parentId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Select Subcategory</label>
                <select 
                  className="form-select"
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  disabled={generating}
                >
                  {availableSubcategories.length > 0 ? (
                    <>
                      <option value="">All Subcategories</option>
                      {selectedCategory ? (
                        availableSubcategories.map(sc => (
                          <option key={sc.id} value={sc.id}>{sc.name}</option>
                        ))
                      ) : (
                        Object.keys(groupedSubcategories).map(parentId => {
                          const parent = categories.find(c => c.id === parentId);
                          if (!parent) return null;
                          return (
                            <optgroup key={parentId} label={parent.name}>
                              {groupedSubcategories[parentId].map(sc => (
                                <option key={sc.id} value={sc.id}>{sc.name}</option>
                              ))}
                            </optgroup>
                          );
                        })
                      )}
                    </>
                  ) : (
                    <option value="">No subcategories available</option>
                  )}
                </select>
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label className="form-label">Display Options</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={showPrice} onChange={(e) => setShowPrice(e.target.checked)} disabled={generating} />
                Show Price
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={showDescription} onChange={(e) => setShowDescription(e.target.checked)} disabled={generating} />
                Show Description
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={showSpecs} onChange={(e) => setShowSpecs(e.target.checked)} disabled={generating} />
                Show Specifications
              </label>
            </div>
          </div>

          {generating && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-purple)' }}>
                <span>Generating PDF...</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e0e0e0', borderRadius: '3px', marginTop: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-gold)', transition: 'width 0.2s' }}></div>
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn-admin-secondary" onClick={onClose} disabled={generating}>Cancel</button>
          <button 
            className="btn-admin-secondary" 
            onClick={() => handleGenerate('preview')} 
            disabled={generating}
            style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
          >
            <i className="fa-solid fa-eye"></i> Preview
          </button>
          <button 
            className="btn-admin" 
            onClick={() => handleGenerate('download')} 
            disabled={generating}
            style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
          >
            <i className="fa-solid fa-download"></i> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
