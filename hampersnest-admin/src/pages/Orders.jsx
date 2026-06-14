import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Status edit state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await apiRequest('/api/orders');
      setOrders(ordersData.orders || ordersData.data || ordersData.rows || (Array.isArray(ordersData) ? ordersData : []));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch orders list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderUpdate = async (orderId, updates) => {
    setUpdatingStatus(true);
    try {
      const updatedOrder = await apiRequest(`/api/orders/${orderId}`, {
        method: 'PUT',
        body: updates
      });
      
      // Update local state
      setOrders(prev => (Array.isArray(prev) ? prev : []).map(o => o.orderId === orderId ? updatedOrder : o));
      setSelectedOrder(updatedOrder);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update order');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Filter orders based on status tab and search text
  const safeOrders = Array.isArray(orders) ? orders : [];
  const filteredOrders = safeOrders.filter(order => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesSearch = 
      order.orderId.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.phone.includes(search);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '15px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-gold)' }}></i>
        <p style={{ color: 'var(--color-gray-text)' }}>Fetching orders database...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filters Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', background: 'var(--color-beige)', padding: '4px', borderRadius: '30px', gap: '4px' }}>
          {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                border: 'none',
                background: statusFilter === status ? 'var(--color-purple)' : 'transparent',
                color: statusFilter === status ? 'var(--color-white)' : 'var(--color-purple-dark)',
                padding: '0.5rem 1.25rem',
                borderRadius: '25px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Input and Export Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by customer name, phone, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-text)' }}></i>
          </div>
          
          <button 
            className="btn-admin-secondary" 
            title="Print / PDF Export"
            onClick={() => window.print()}
          >
            <i className="fa-solid fa-file-pdf"></i>
          </button>
          <button 
            className="btn-admin-secondary" 
            title="Export to CSV"
            onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/export/csv`, '_blank')}
            style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)' }}
          >
            <i className="fa-solid fa-file-csv"></i>
          </button>
          <a 
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/export/excel`}
            className="btn-admin" 
            title="Export to Excel"
            style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)' }}
          >
            <i className="fa-solid fa-file-excel"></i>
          </a>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FFF5F5', color: '#E53E3E', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="dashboard-panel">
        <div className="table-responsive">
          {filteredOrders.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Contact Phone</th>
                  <th>Celebration</th>
                  <th>Requested Date</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.orderId}>
                    <td className="font-semibold" style={{ color: 'var(--color-purple-dark)' }}>{order.orderId}</td>
                    <td className="font-semibold">{order.customer.name}</td>
                    <td>{order.customer.phone}</td>
                    <td>{order.eventType}</td>
                    <td>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="font-semibold">₹{order.totalAmount.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-admin"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <i className="fa-solid fa-eye"></i> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <i className="fa-solid fa-box-open"></i>
              <p>No orders match the selected criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setSelectedOrder(null)}>
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>Order Detail: {selectedOrder.orderId}</h3>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="modal-body">
              {/* Customer Info Card */}
              <div style={{ background: 'var(--color-lavberry, #FAF6FC)', border: '1px solid var(--color-lavender-dark)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: 'var(--color-purple-dark)', marginBottom: '5px' }}>
                    <i className="fa-solid fa-user-tag" style={{ marginRight: '6px' }}></i>
                    {selectedOrder.customer.name}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-text)' }}>
                    Phone: {selectedOrder.customer.phone}
                  </p>
                </div>
                <a
                  href={`https://wa.me/${selectedOrder.customer.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-admin"
                  style={{ background: 'var(--color-whatsapp)', color: 'var(--color-white)', border: 'none', fontSize: '0.8rem' }}
                >
                  Chat WhatsApp <i className="fa-brands fa-whatsapp"></i>
                </a>
              </div>

              {/* Order Specifications */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div>
                  <strong>Event Type:</strong> {selectedOrder.eventType}
                </div>
                <div>
                  <strong>Requested Delivery Date:</strong> {selectedOrder.deliveryDate ? new Date(selectedOrder.deliveryDate).toLocaleDateString() : 'N/A'}
                </div>
                <div>
                  <strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
                <div>
                  <strong>Current Status:</strong> <span className={`badge ${selectedOrder.status.toLowerCase()}`} style={{ verticalAlign: 'middle', marginLeft: '4px' }}>{selectedOrder.status}</span>
                </div>
              </div>

              {/* Order Items */}
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-purple)' }}>Ordered Hampers</h4>
              <div style={{ border: '1px solid var(--color-gray-border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <table className="data-table" style={{ fontSize: '0.8rem' }}>
                  <thead style={{ background: 'var(--color-gray-light)' }}>
                    <tr>
                      <th>Hamper Item</th>
                      <th>Customizations</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="font-semibold">{item.name}</td>
                        <td>
                          {/* Display Custom Details */}
                          {item.customizations ? (
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-text)' }}>
                              {item.customizations.wrappingStyle !== 'Standard' && <div>• Wrap: {item.customizations.wrappingStyle}</div>}
                              {item.customizations.ribbonColor !== 'None' && <div>• Ribbon: {item.customizations.ribbonColor}</div>}
                              {item.customizations.giftTag && <div style={{ fontStyle: 'italic' }}>• Tag: "{item.customizations.giftTag}"</div>}
                            </div>
                          ) : 'Standard Product'}
                        </td>
                        <td>₹{item.price}</td>
                        <td>{item.quantity}</td>
                        <td className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr style={{ background: 'var(--color-gray-light)', fontSize: '0.85rem' }}>
                      <td colSpan="4" className="font-semibold text-right">Grand Total:</td>
                      <td className="font-semibold color-gold" style={{ fontSize: '1rem' }}>₹{selectedOrder.totalAmount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Special instructions */}
              {selectedOrder.notes && (
                <div style={{ background: '#FFFDF9', borderLeft: '4px solid var(--color-gold)', padding: '12px', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                  <strong>Customization Instructions / Notes:</strong>
                  <p style={{ marginTop: '5px', whiteSpace: 'pre-wrap', color: '#555' }}>{selectedOrder.notes}</p>
                </div>
              )}

              {/* Layout for History and Updates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '2rem', borderTop: '1px solid var(--color-gray-border)', paddingTop: '1.5rem' }}>
                
                {/* Left Column: Updates */}
                <div>
                  <h4 style={{ color: 'var(--color-purple-dark)', marginBottom: '10px' }}>Manage Order</h4>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="status-select">Change Order Status</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select
                        id="status-select"
                        className="form-select"
                        value={selectedOrder.status}
                        onChange={(e) => handleOrderUpdate(selectedOrder.orderId, { status: e.target.value })}
                        disabled={updatingStatus}
                        style={{ flexGrow: 1 }}
                      >
                        <option value="Pending">Pending (Awaiting Confirmation)</option>
                        <option value="Confirmed">Confirmed (Processing / Packing)</option>
                        <option value="Shipped">Shipped (In Transit)</option>
                        <option value="Delivered">Delivered (Completed)</option>
                      </select>
                      {updatingStatus && (
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                          <i className="fa-solid fa-spinner fa-spin" style={{ color: 'var(--color-gold)' }}></i>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '15px' }}>
                    <label className="form-label" htmlFor="internal-notes">Internal Admin Notes</label>
                    <textarea
                      id="internal-notes"
                      className="form-textarea"
                      rows="4"
                      placeholder="Add private notes about this order..."
                      defaultValue={selectedOrder.internalNotes || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (selectedOrder.internalNotes || '')) {
                          handleOrderUpdate(selectedOrder.orderId, { internalNotes: e.target.value });
                        }
                      }}
                    ></textarea>
                    <small style={{ color: 'var(--color-gray-text)' }}>Visible only to admins. Auto-saves on blur.</small>
                  </div>
                </div>

                {/* Right Column: Timeline History */}
                <div>
                  <h4 style={{ color: 'var(--color-purple-dark)', marginBottom: '10px' }}>Order History</h4>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedOrder.history && selectedOrder.history.length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, position: 'relative' }}>
                        {selectedOrder.history.slice().reverse().map((hist, idx) => (
                          <li key={idx} style={{ 
                            paddingLeft: '20px', 
                            borderLeft: '2px solid var(--color-purple)', 
                            position: 'relative',
                            marginBottom: '15px',
                            paddingBottom: idx === selectedOrder.history.length - 1 ? '0' : '5px'
                          }}>
                            <div style={{
                              position: 'absolute', left: '-6px', top: '0',
                              width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-purple)'
                            }}></div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-text)' }}>
                              {new Date(hist.date).toLocaleString()} by {hist.admin}
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-purple-dark)', marginTop: '3px' }}>
                              {hist.action}
                            </div>
                            {hist.from && hist.to && (
                              <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '3px' }}>
                                <span style={{ textDecoration: 'line-through', marginRight: '5px' }}>{hist.from}</span>
                                <span>&rarr; {hist.to}</span>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-text)', textAlign: 'center', margin: '20px 0' }}>No history recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-admin-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
