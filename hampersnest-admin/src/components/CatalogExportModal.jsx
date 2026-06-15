import React, { useState } from 'react';
import { generateCatalogPdf } from '../utils/pdfGenerator';

export default function CatalogExportModal({ isOpen, onClose, products, categories, selectedProductIds }) {
  const [exportMode, setExportMode] = useState(selectedProductIds?.length > 0 ? 'SELECTED' : 'ALL');
  const [selectedCategory, setSelectedCategory] = useState('');
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
    }

    if (filteredProducts.length === 0) {
      alert('No products found for the selected criteria.');
      setGenerating(false);
      return;
    }

    // Attach human readable categories if possible
    const enrichedProducts = filteredProducts.map(p => ({
      ...p,
      categoryName: categories.find(c => c.id === p.category)?.name || p.category
    }));

    try {
      await generateCatalogPdf(enrichedProducts, mode, (prog) => setProgress(prog));
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
