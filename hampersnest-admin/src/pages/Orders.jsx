import React, { useState, useEffect } from 'react';
import { apiRequest, apiDownload } from '../utils/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null); // Used for viewing history & quick actions
  const [isEditing, setIsEditing] = useState(false); // Used for the Full Edit Modal
  const [editFormData, setEditFormData] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrdersAndProducts();
  }, []);

  const fetchOrdersAndProducts = async () => {
    try {
      const [ordersData, productsData] = await Promise.all([
        apiRequest('/api/orders'),
        apiRequest('/api/products?all=true')
      ]);
      setOrders(ordersData.orders || ordersData.data || ordersData.rows || (Array.isArray(ordersData) ? ordersData : []));
      setProducts(productsData.products || productsData.data || productsData.rows || (Array.isArray(productsData) ? productsData : []));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch orders or products list');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdate = async (orderId, updates) => {
    setUpdatingStatus(true);
    try {
      const updatedOrder = await apiRequest(`/api/orders/${orderId}`, {
        method: 'PUT',
        body: updates
      });
      setOrders(prev => (Array.isArray(prev) ? prev : []).map(o => o.orderId === orderId ? updatedOrder : o));
      if (selectedOrder && selectedOrder.orderId === orderId) setSelectedOrder(updatedOrder);
      return updatedOrder;
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update order');
      throw err;
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateOrder = async (orderData) => {
    setUpdatingStatus(true);
    try {
      const newOrder = await apiRequest('/api/orders', {
        method: 'POST',
        body: orderData
      });
      setOrders(prev => [newOrder, ...prev]);
      alert('Order created successfully!');
      closeEditModal();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to create order');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Filter Logic
  const safeOrders = Array.isArray(orders) ? orders : [];
  const filteredOrders = safeOrders.filter(order => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || (sourceFilter === 'Online' ? (order.source === 'Website' || !order.source) : (order.source && order.source !== 'Website'));
    const matchesPayment = paymentFilter === 'All' || order.paymentStatus === paymentFilter;
    const matchesSearch = 
      order.orderId.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.phone.includes(search);
    return matchesStatus && matchesSource && matchesPayment && matchesSearch;
  });

  // Modal Handlers
  const openCreateModal = () => {
    setEditFormData({
      isNew: true,
      customer: { name: '', phone: '', alternateNumber: '', email: '', address: '' },
      eventType: 'General',
      deliveryDate: '',
      source: 'Walk-In Customer',
      status: 'Pending',
      paymentStatus: 'Pending',
      paymentMethod: '',
      advancePaid: 0,
      totalAmount: 0,
      notes: '',
      internalNotes: '',
      items: []
    });
    setIsEditing(true);
  };

  const openEditModal = (order) => {
    setEditFormData({
      isNew: false,
      orderId: order.orderId,
      customer: { ...order.customer },
      eventType: order.eventType || 'General',
      deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : '',
      source: order.source || 'Website',
      status: order.status,
      paymentStatus: order.paymentStatus || 'Pending',
      paymentMethod: order.paymentMethod || '',
      advancePaid: order.advancePaid || 0,
      totalAmount: order.totalAmount,
      notes: order.notes || '',
      internalNotes: order.internalNotes || '',
      items: JSON.parse(JSON.stringify(order.items || []))
    });
    setIsEditing(true);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setEditFormData(null);
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    if (editFormData.items.length === 0) {
      return alert('Please add at least one product to the order.');
    }

    const payload = {
      ...editFormData
    };

    if (editFormData.isNew) {
      await handleCreateOrder(payload);
    } else {
      await handleOrderUpdate(editFormData.orderId, payload);
      alert('Order updated successfully!');
      closeEditModal();
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order ${orderId}? This action cannot be undone.`)) {
      return;
    }
    try {
      await apiRequest(`/api/orders/${orderId}`, { method: 'DELETE' });
      alert('Order deleted successfully');
      fetchOrdersAndProducts();
    } catch (err) {
      console.error('Delete order error:', err);
      alert('Failed to delete order');
    }
  };

  // Manage Items in Form
  const addItemToForm = () => {
    if (products.length === 0) return alert('No products available in database.');
    const defaultProd = products[0];
    setEditFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: defaultProd.id, name: defaultProd.name, price: defaultProd.price, quantity: 5, customizations: {} }]
    }));
  };

  const updateItemInForm = (index, field, value) => {
    const newItems = [...editFormData.items];
    if (field === 'productId') {
      const prod = products.find(p => String(p.id) === String(value));
      if (prod) {
        newItems[index] = { ...newItems[index], productId: prod.id, name: prod.name, price: prod.price };
      }
    } else {
      newItems[index][field] = value;
    }
    
    // Auto update total amount
    const newTotal = newItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    setEditFormData(prev => ({ ...prev, items: newItems, totalAmount: newTotal }));
  };

  const removeItemFromForm = (index) => {
    const newItems = [...editFormData.items];
    newItems.splice(index, 1);
    const newTotal = newItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    setEditFormData(prev => ({ ...prev, items: newItems, totalAmount: newTotal }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '15px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-gold)' }}></i>
        <p style={{ color: 'var(--color-gray-text)' }}>Loading Order Management System...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <button className="btn-admin" onClick={openCreateModal}>
            <i className="fa-solid fa-plus"></i> Create Manual Order
          </button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-admin-secondary" title="Export to CSV" onClick={() => apiDownload('/api/orders/export/csv', 'orders.csv')} style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)' }}>
            <i className="fa-solid fa-file-csv"></i>
          </button>
          <button className="btn-admin" title="Export to Excel" onClick={() => apiDownload('/api/orders/export/excel', 'orders.xlsx')} style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-sm)' }}>
            <i className="fa-solid fa-file-excel"></i>
          </button>
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="dashboard-panel" style={{ padding: '15px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Search</label>
            <div style={{ position: 'relative' }}>
              <input type="text" className="form-input" placeholder="ID, Name, Phone..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2rem' }} />
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-text)' }}></i>
            </div>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Order Status</label>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Order Source</label>
            <select className="form-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
              <option value="All">All Sources</option>
              <option value="Online">Online (Website)</option>
              <option value="Offline">Offline (Manual)</option>
            </select>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Payment Status</label>
            <select className="form-select" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="All">All Payments</option>
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div style={{ background: '#FFF5F5', color: '#E53E3E', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

      {/* Orders Unified Table */}
      <div className="dashboard-panel">
        <div className="table-responsive">
          {filteredOrders.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Source</th>
                  <th>Customer</th>
                  <th>Celebration</th>
                  <th>Requested Date</th>
                  <th>Payment</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.orderId}>
                    <td className="font-semibold" style={{ color: 'var(--color-purple-dark)' }}>{order.orderId}</td>
                    <td>
                      {(!order.source || order.source === 'Website') ? (
                        <span className="badge confirmed" style={{ background: '#E0E7FF', color: '#3730A3' }}><i className="fa-solid fa-globe"></i> ONLINE</span>
                      ) : (
                        <span className="badge pending" style={{ background: '#FEF3C7', color: '#92400E' }}><i className="fa-solid fa-store"></i> OFFLINE</span>
                      )}
                      <div style={{ fontSize: '0.7rem', marginTop: '4px', color: 'var(--color-gray-text)' }}>{order.source || 'Website'}</div>
                    </td>
                    <td>
                      <div className="font-semibold">{order.customer.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-text)' }}>{order.customer.phone}</div>
                    </td>
                    <td>{order.eventType}</td>
                    <td>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className={`badge ${order.paymentStatus === 'Paid' ? 'confirmed' : order.paymentStatus === 'Partially Paid' ? 'pending' : 'cancelled'}`}>
                        {order.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="font-semibold">₹{order.totalAmount.toLocaleString()}</td>
                    <td><span className={`badge ${order.status.toLowerCase()}`}>{order.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-admin-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setSelectedOrder(order)} title="View Details">
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button className="btn-admin" style={{ background: 'var(--color-gold)', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} onClick={() => openEditModal(order)} title="Edit Order">
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button className="btn-admin" style={{ background: '#DC2626', color: '#FFF', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleDeleteOrder(order.orderId)} title="Delete Order">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
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

      {/* FULL EDIT / CREATE MODAL */}
      {isEditing && editFormData && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && closeEditModal()}>
          <div className="modal-content" style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, borderBottom: '1px solid var(--color-gray-border)' }}>
              <h3>{editFormData.isNew ? 'Create Manual Order' : `Edit Order: ${editFormData.orderId}`}</h3>
              <button className="modal-close" onClick={closeEditModal} type="button"><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <form onSubmit={handleEditFormSubmit}>
              <div className="modal-body" style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  {/* Left Column: Customer & Order Details */}
                  <div>
                    <h4 style={{ borderBottom: '1px solid var(--color-gold)', paddingBottom: '8px', marginBottom: '15px', color: 'var(--color-purple)' }}>Customer Details</h4>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input type="text" className="form-input" required value={editFormData.customer.name} onChange={(e) => setEditFormData(p => ({...p, customer: {...p.customer, name: e.target.value}}))} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Phone Number *</label>
                        <input type="text" className="form-input" required value={editFormData.customer.phone} onChange={(e) => setEditFormData(p => ({...p, customer: {...p.customer, phone: e.target.value}}))} />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Alternate Phone</label>
                        <input type="text" className="form-input" value={editFormData.customer.alternateNumber || ''} onChange={(e) => setEditFormData(p => ({...p, customer: {...p.customer, alternateNumber: e.target.value}}))} />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '10px' }}>
                      <label className="form-label">Email Address</label>
                      <input type="email" className="form-input" value={editFormData.customer.email || ''} onChange={(e) => setEditFormData(p => ({...p, customer: {...p.customer, email: e.target.value}}))} />
                    </div>
                    <div className="form-group" style={{ marginTop: '10px' }}>
                      <label className="form-label">Delivery Address</label>
                      <textarea className="form-textarea" rows="2" value={editFormData.customer.address || ''} onChange={(e) => setEditFormData(p => ({...p, customer: {...p.customer, address: e.target.value}}))}></textarea>
                    </div>

                    <h4 style={{ borderBottom: '1px solid var(--color-gold)', paddingBottom: '8px', marginTop: '25px', marginBottom: '15px', color: 'var(--color-purple)' }}>Order Details</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Event Type *</label>
                        <input type="text" className="form-input" required value={editFormData.eventType} onChange={(e) => setEditFormData(p => ({...p, eventType: e.target.value}))} />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Delivery Date</label>
                        <input type="date" className="form-input" value={editFormData.deliveryDate} onChange={(e) => setEditFormData(p => ({...p, deliveryDate: e.target.value}))} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Order Source *</label>
                        <select className="form-select" value={editFormData.source} onChange={(e) => setEditFormData(p => ({...p, source: e.target.value}))}>
                          <option value="Website">Website</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Instagram">Instagram</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Walk-In Customer">Walk-In Customer</option>
                          <option value="Phone Call">Phone Call</option>
                          <option value="Exhibition/Event">Exhibition/Event</option>
                          <option value="Referral">Referral</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Order Status *</label>
                        <select className="form-select" value={editFormData.status} onChange={(e) => setEditFormData(p => ({...p, status: e.target.value}))}>
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Payment & Notes */}
                  <div>
                    <h4 style={{ borderBottom: '1px solid var(--color-gold)', paddingBottom: '8px', marginBottom: '15px', color: 'var(--color-purple)' }}>Payment Tracking</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Payment Status *</label>
                        <select className="form-select" value={editFormData.paymentStatus} onChange={(e) => setEditFormData(p => ({...p, paymentStatus: e.target.value}))}>
                          <option value="Pending">Pending</option>
                          <option value="Partially Paid">Partially Paid</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Payment Method</label>
                        <select className="form-select" value={editFormData.paymentMethod} onChange={(e) => setEditFormData(p => ({...p, paymentMethod: e.target.value}))}>
                          <option value="">-- Select --</option>
                          <option value="Cash">Cash</option>
                          <option value="UPI">UPI / GPay</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cheque">Cheque</option>
                          <option value="Card">Card/POS</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div style={{ background: '#F8F9FA', padding: '15px', borderRadius: '8px', marginTop: '15px', border: '1px solid var(--color-gray-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span>Total Amount:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>₹</span>
                          <input type="number" className="form-input" style={{ width: '100px', padding: '4px 8px', height: '30px' }} value={editFormData.totalAmount} onChange={(e) => setEditFormData(p => ({...p, totalAmount: Number(e.target.value)}))} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span>Advance Paid:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>₹</span>
                          <input type="number" className="form-input" style={{ width: '100px', padding: '4px 8px', height: '30px' }} value={editFormData.advancePaid} onChange={(e) => setEditFormData(p => ({...p, advancePaid: Number(e.target.value)}))} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                        <strong>Balance Due:</strong>
                        <strong style={{ color: '#E53E3E' }}>₹{(editFormData.totalAmount - editFormData.advancePaid).toLocaleString()}</strong>
                      </div>
                    </div>

                    <h4 style={{ borderBottom: '1px solid var(--color-gold)', paddingBottom: '8px', marginTop: '25px', marginBottom: '15px', color: 'var(--color-purple)' }}>Notes</h4>
                    <div className="form-group">
                      <label className="form-label">Order / Customization Notes (Visible to Customer)</label>
                      <textarea className="form-textarea" rows="2" value={editFormData.notes || ''} onChange={(e) => setEditFormData(p => ({...p, notes: e.target.value}))}></textarea>
                    </div>
                    <div className="form-group" style={{ marginTop: '10px' }}>
                      <label className="form-label" style={{ color: 'var(--color-purple-dark)' }}><i className="fa-solid fa-lock" style={{ marginRight: '5px' }}></i> Internal Admin Notes</label>
                      <textarea className="form-textarea" rows="2" style={{ background: '#FFF5F5', borderColor: '#FFE3E3' }} placeholder="VIP Client, waiting on stock..." value={editFormData.internalNotes || ''} onChange={(e) => setEditFormData(p => ({...p, internalNotes: e.target.value}))}></textarea>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Products */}
                <div style={{ marginTop: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-gold)', paddingBottom: '8px', marginBottom: '15px' }}>
                    <h4 style={{ color: 'var(--color-purple)', margin: 0 }}>Product Selection</h4>
                    <button type="button" className="btn-admin-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={addItemToForm}>
                      <i className="fa-solid fa-plus"></i> Add Product
                    </button>
                  </div>
                  
                  {editFormData.items.length === 0 ? (
                    <div className="empty-state" style={{ padding: '20px' }}>Please add at least one product to create the order.</div>
                  ) : (
                    <table className="data-table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '40%' }}>Product</th>
                          <th style={{ width: '20%' }}>Unit Price (₹)</th>
                          <th style={{ width: '15%' }}>Qty</th>
                          <th style={{ width: '15%' }}>Subtotal</th>
                          <th style={{ width: '10%' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {editFormData.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <select className="form-select" style={{ padding: '4px 8px', fontSize: '0.85rem' }} value={item.productId} onChange={(e) => updateItemInForm(idx, 'productId', e.target.value)}>
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input type="number" className="form-input" style={{ padding: '4px 8px', height: '30px' }} value={item.price} onChange={(e) => updateItemInForm(idx, 'price', Number(e.target.value))} />
                            </td>
                            <td>
                              <input type="number" className="form-input" style={{ padding: '4px 8px', height: '30px' }} min="1" value={item.quantity} onChange={(e) => updateItemInForm(idx, 'quantity', Number(e.target.value))} />
                            </td>
                            <td className="font-semibold color-purple">₹{(item.price * item.quantity).toLocaleString()}</td>
                            <td>
                              <button type="button" className="btn-admin-secondary" style={{ color: '#E53E3E', borderColor: '#E53E3E', padding: '4px 8px' }} onClick={() => removeItemFromForm(idx)}>
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              
              <div className="modal-footer" style={{ position: 'sticky', bottom: 0, background: '#fff', borderTop: '1px solid var(--color-gray-border)' }}>
                <button type="button" className="btn-admin-secondary" onClick={closeEditModal} disabled={updatingStatus}>Cancel</button>
                <button type="submit" className="btn-admin" disabled={updatingStatus}>
                  {updatingStatus ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>} Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ORDER / HISTORY MODAL */}
      {selectedOrder && !isEditing && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setSelectedOrder(null)}>
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>Order Detail: {selectedOrder.orderId}</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-admin-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => { setSelectedOrder(null); openEditModal(selectedOrder); }}>
                  <i className="fa-solid fa-pen"></i> Edit Full Order
                </button>
                <button className="modal-close" onClick={() => setSelectedOrder(null)}><i className="fa-solid fa-xmark"></i></button>
              </div>
            </div>
            
            <div className="modal-body">
              {/* Existing Details View Layout */}
              <div style={{ background: 'var(--color-lavberry, #FAF6FC)', border: '1px solid var(--color-lavender-dark)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: 'var(--color-purple-dark)', marginBottom: '5px' }}>
                    <i className="fa-solid fa-user-tag" style={{ marginRight: '6px' }}></i>
                    {selectedOrder.customer.name}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-text)' }}>Phone: {selectedOrder.customer.phone}</p>
                </div>
                <a href={`https://wa.me/${selectedOrder.customer.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="btn-admin" style={{ background: 'var(--color-whatsapp)', color: 'var(--color-white)', border: 'none', fontSize: '0.8rem' }}>
                  Chat WhatsApp <i className="fa-brands fa-whatsapp"></i>
                </a>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div><strong>Event Type:</strong> {selectedOrder.eventType}</div>
                <div><strong>Delivery Date:</strong> {selectedOrder.deliveryDate ? new Date(selectedOrder.deliveryDate).toLocaleDateString() : 'N/A'}</div>
                <div><strong>Source:</strong> {selectedOrder.source || 'Website'}</div>
                <div>
                  <strong>Status:</strong> <span className={`badge ${selectedOrder.status.toLowerCase()}`} style={{ verticalAlign: 'middle', marginLeft: '4px' }}>{selectedOrder.status}</span>
                </div>
              </div>

              {/* Order Items Summary */}
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
                        <td>{item.customizations?.giftTag ? <div style={{ fontStyle: 'italic' }}>• Tag: "{item.customizations.giftTag}"</div> : 'Standard'}</td>
                        <td>₹{item.price}</td>
                        <td>{item.quantity}</td>
                        <td className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Timeline History */}
              <h4 style={{ color: 'var(--color-purple-dark)', marginBottom: '10px' }}>Order History & Audit Trail</h4>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {selectedOrder.history && selectedOrder.history.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {selectedOrder.history.slice().reverse().map((hist, idx) => (
                      <li key={idx} style={{ paddingLeft: '20px', borderLeft: '2px solid var(--color-purple)', position: 'relative', marginBottom: '15px', paddingBottom: idx === selectedOrder.history.length - 1 ? '0' : '5px' }}>
                        <div style={{ position: 'absolute', left: '-6px', top: '0', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-purple)' }}></div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-text)' }}>{new Date(hist.date).toLocaleString()} by {hist.admin}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-purple-dark)', marginTop: '3px' }}>{hist.action}</div>
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
            
            <div className="modal-footer">
              <button className="btn-admin-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
