import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Track inline edits
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ stockQuantity: 0, reservedQuantity: 0, lowStockThreshold: 5 });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/products?limit=500&all=true&search=${search}`);
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchInventory();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setEditForm({
      stockQuantity: product.stockQuantity || 0,
      reservedQuantity: product.reservedQuantity || 0,
      lowStockThreshold: product.lowStockThreshold || 5
    });
  };

  const handleSaveStock = async (id) => {
    try {
      await apiRequest(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      setProducts(products.map(p => p.id === id ? { ...p, ...editForm } : p));
      setEditingId(null);
    } catch (err) {
      alert('Failed to update inventory');
    }
  };

  // Derived Stats
  const safeProductsOutOfStock = Array.isArray(products) ? products : [];
  const outOfStockCount = safeProductsOutOfStock.filter(p => (p.stockQuantity - (p.reservedQuantity || 0)) <= 0).length;
  const safeProducts2 = Array.isArray(products) ? products : [];
  const lowStockCount = safeProducts2.filter(p => {
    const avail = p.stockQuantity - (p.reservedQuantity || 0);
    return avail > 0 && avail <= (p.lowStockThreshold || 5);
  }).length;

  // Filtering
  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter(p => {
    if (!statusFilter) return true;
    const avail = p.stockQuantity - (p.reservedQuantity || 0);
    if (statusFilter === 'out') return avail <= 0;
    if (statusFilter === 'low') return avail > 0 && avail <= (p.lowStockThreshold || 5);
    if (statusFilter === 'in') return avail > (p.lowStockThreshold || 5);
    return true;
  });

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h2 style={{ color: 'var(--color-purple-dark)' }}>Inventory Management</h2>
          <p style={{ color: 'var(--color-gray-text)', fontSize: '0.9rem' }}>Monitor and update product stock levels</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div className="dashboard-card">
          <h3>Total Products</h3>
          <div className="value">{products.length}</div>
        </div>
        <div className="dashboard-card">
          <h3>Low Stock Products</h3>
          <div className="value" style={{ color: '#856404' }}>{lowStockCount}</div>
        </div>
        <div className="dashboard-card">
          <h3>Out of Stock</h3>
          <div className="value" style={{ color: '#dc3545' }}>{outOfStockCount}</div>
        </div>
      </div>

      <div className="dashboard-panel mb-4">
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
            <i className="fa-solid fa-search" style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--color-gray-text)' }}></i>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by product name or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <select 
            className="form-input" 
            style={{ width: '200px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="dashboard-panel">
        {loading && products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--color-gold)' }}></i>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-box-open"></i>
            <h3>No inventory items found</h3>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table" style={{ minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th>Product & SKU</th>
                  <th>Status</th>
                  <th>Stock Qty</th>
                  <th>Reserved Qty</th>
                  <th>Available Qty</th>
                  <th>Low Threshold</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const stock = product.stockQuantity || 0;
                  const reserved = product.reservedQuantity || 0;
                  const threshold = product.lowStockThreshold || 5;
                  const available = stock - reserved;

                  const isOutOfStock = available <= 0;
                  const isLowStock = available > 0 && available <= threshold;
                  
                  return (
                    <tr key={product.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          <div>
                            <div className="font-semibold">{product.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-text)' }}>SKU: {product.sku || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {isOutOfStock ? (
                          <span className="badge pending">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="badge pending" style={{ background: '#FFF3CD', color: '#856404' }}>Low Stock</span>
                        ) : (
                          <span className="badge confirmed">In Stock</span>
                        )}
                      </td>
                      
                      {editingId === product.id ? (
                        <>
                          <td>
                            <input type="number" className="form-input" style={{ width: '80px', padding: '0.4rem' }}
                              value={editForm.stockQuantity} onChange={e => setEditForm({...editForm, stockQuantity: Number(e.target.value)})} />
                          </td>
                          <td>
                            <input type="number" className="form-input" style={{ width: '80px', padding: '0.4rem' }}
                              value={editForm.reservedQuantity} onChange={e => setEditForm({...editForm, reservedQuantity: Number(e.target.value)})} />
                          </td>
                          <td>
                            <span style={{ fontWeight: 'bold' }}>{editForm.stockQuantity - editForm.reservedQuantity}</span>
                          </td>
                          <td>
                            <input type="number" className="form-input" style={{ width: '80px', padding: '0.4rem' }}
                              value={editForm.lowStockThreshold} onChange={e => setEditForm({...editForm, lowStockThreshold: Number(e.target.value)})} />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                              <button className="btn-text" style={{ color: 'var(--color-delivered)' }} onClick={() => handleSaveStock(product.id)}>Save</button>
                              <button className="btn-text" style={{ color: 'var(--color-gray-text)' }} onClick={() => setEditingId(null)}>Cancel</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{stock}</td>
                          <td>{reserved}</td>
                          <td>
                            <span style={{ fontWeight: 'bold', color: isLowStock ? '#dc3545' : 'inherit' }}>
                              {available}
                            </span>
                          </td>
                          <td>{threshold}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="btn-text" onClick={() => handleEditClick(product)}>
                              <i className="fa-solid fa-pen"></i> Update
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
