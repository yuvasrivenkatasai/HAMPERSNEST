import React, { useState } from 'react';
import { generateCatalogPdf } from '../utils/pdfGenerator';

export default function CatalogExportModal({ isOpen, onClose, products, categories, selectedProductIds }) {
  const [exportMode, setExportMode] = useState(selectedProductIds?.length > 0 ? 'SELECTED' : 'ALL');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  
  // Sort and Display Options
  const [sortBy, setSortBy] = useState('NAME_ASC');
  const [showPrice, setShowPrice] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [showSpecs, setShowSpecs] = useState(false);
  const [useWatermark, setUseWatermark] = useState(false);
  
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleGenerate = async (mode) => {
    setGenerating(true);
    setProgress(0);

    let filteredProducts = products;
    if (exportMode === 'SELECTED') {
      filteredProducts = products.filter(p => selectedProductIds.includes(p.id));
    } else if (exportMode === 'CATEGORY' && selectedCategory) {
      filteredProducts = products.filter(p => p.category === selectedCategory);
    } else if (exportMode === 'SUBCATEGORY' && selectedSubcategory) {
      filteredProducts = products.filter(p => p.subCategory === selectedSubcategory);
    }

    if (filteredProducts.length === 0) {
      alert('No products found for the selected criteria.');
      setGenerating(false);
      return;
    }

    // Attach human readable categories if possible
    let enrichedProducts = filteredProducts.map(p => ({
      ...p,
      categoryName: categories.find(c => c.id === p.category)?.name || p.category
    }));

    // Apply Sorting
    enrichedProducts.sort((a, b) => {
      if (sortBy === 'NAME_ASC') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'PRICE_ASC') {
        return a.price - b.price;
      } else if (sortBy === 'PRICE_DESC') {
        return b.price - a.price;
      } else if (sortBy === 'CATEGORY') {
        const catA = a.categoryName || '';
        const catB = b.categoryName || '';
        if (catA === catB) return a.name.localeCompare(b.name);
        return catA.localeCompare(catB);
      }
      return 0;
    });

    try {
      await generateCatalogPdf(enrichedProducts, mode, (prog) => setProgress(prog), {
        showPrice,
        showDescription,
        showSpecs,
        useWatermark
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
              <option value="CATEGORY">By Category</option>
              <option value="SUBCATEGORY">By Subcategory</option>
            </select>
          </div>

          {exportMode === 'CATEGORY' && (
            <div className="form-group" style={{ marginTop: '15px' }}>
              <label className="form-label">Select Category</label>
              <select 
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={generating}
              >
                <option value="">-- Choose Category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {exportMode === 'SUBCATEGORY' && (
            <div className="form-group" style={{ marginTop: '15px' }}>
              <label className="form-label">Select Subcategory</label>
              <select 
                className="form-select"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                disabled={generating}
              >
                <option value="">-- Choose Subcategory --</option>
                {categories.flatMap(c => c.subcategories || []).map(sc => (
                  <option key={sc.id} value={sc.id}>{sc.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label className="form-label">Sort By</label>
            <select 
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              disabled={generating}
            >
              <option value="NAME_ASC">Name (A-Z)</option>
              <option value="PRICE_ASC">Price (Low to High)</option>
              <option value="PRICE_DESC">Price (High to Low)</option>
              <option value="CATEGORY">Category</option>
            </select>
          </div>

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
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={useWatermark} onChange={(e) => setUseWatermark(e.target.checked)} disabled={generating} />
                Use Watermarked Images
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
            disabled={generating || (exportMode === 'CATEGORY' && !selectedCategory)}
            style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
          >
            <i className="fa-solid fa-eye"></i> Preview
          </button>
          <button 
            className="btn-admin" 
            onClick={() => handleGenerate('download')} 
            disabled={generating || (exportMode === 'CATEGORY' && !selectedCategory)}
            style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
          >
            <i className="fa-solid fa-download"></i> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
