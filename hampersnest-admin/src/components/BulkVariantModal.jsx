import React, { useState } from 'react';

export default function BulkVariantModal({ isOpen, onClose, selectedIds, onExecute }) {
  const [action, setAction] = useState('ADD_VARIANT');
  const [variantName, setVariantName] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('10');
  const [priceAdjustmentType, setPriceAdjustmentType] = useState('set');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!variantName && !['ENABLE_VARIANTS', 'DISABLE_VARIANTS'].includes(action)) {
      alert('Variant name is required.');
      return;
    }
    
    let payload = { name: variantName };
    if (action === 'ADD_VARIANT') {
      payload.price = price;
      payload.sku = sku;
      payload.stock = stock;
    } else if (action === 'UPDATE_PRICE') {
      payload.amount = price;
      payload.type = priceAdjustmentType;
    } else if (action === 'UPDATE_STOCK') {
      payload.stock = stock;
    }

    onExecute(action, payload);
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && onClose()}>
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>Bulk Manage Variants ({selectedIds.length} selected)</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Action</label>
            <select className="form-select" value={action} onChange={(e) => setAction(e.target.value)}>
              <option value="ADD_VARIANT">Add New Variant Size</option>
              <option value="UPDATE_PRICE">Update Prices for Existing Size</option>
              <option value="UPDATE_STOCK">Update Stock for Existing Size</option>
              <option value="DELETE_VARIANT">Delete Existing Size</option>
              <option value="ENABLE_VARIANTS">Enable Variants</option>
              <option value="DISABLE_VARIANTS">Disable Variants</option>
            </select>
          </div>

          {!['ENABLE_VARIANTS', 'DISABLE_VARIANTS'].includes(action) && (
            <div className="form-group" style={{ marginTop: '15px' }}>
              <label className="form-label">Variant Size Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Small, Medium, Premium"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                required={!['ENABLE_VARIANTS', 'DISABLE_VARIANTS'].includes(action)}
              />
            </div>
          )}

          {action === 'ADD_VARIANT' && (
            <>
              <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Variant Price</label>
                  <input type="number" className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Initial Stock</label>
                  <input type="number" className="form-input" value={stock} onChange={(e) => setStock(e.target.value)} required />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '15px' }}>
                <label className="form-label">SKU (Optional)</label>
                <input type="text" className="form-input" value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
            </>
          )}

          {action === 'UPDATE_PRICE' && (
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Adjustment Type</label>
                <select className="form-select" value={priceAdjustmentType} onChange={(e) => setPriceAdjustmentType(e.target.value)}>
                  <option value="set">Set To Absolute Price</option>
                  <option value="increase">Increase By Amount</option>
                  <option value="decrease">Decrease By Amount</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Amount</label>
                <input type="number" className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
            </div>
          )}

          {action === 'UPDATE_STOCK' && (
            <div className="form-group" style={{ marginTop: '15px' }}>
              <label className="form-label">New Stock Quantity</label>
              <input type="number" className="form-input" value={stock} onChange={(e) => setStock(e.target.value)} required />
            </div>
          )}

          <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-admin-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-admin">Apply Bulk Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}
