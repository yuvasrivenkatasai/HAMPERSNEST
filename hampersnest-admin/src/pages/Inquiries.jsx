import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchInquiries = async () => {
    try {
      const data = await apiRequest('/api/inquiries');
      setInquiries(data.inquiries || data.data || data.rows || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch customer contact messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allIds = (Array.isArray(inquiries) ? inquiries : []).map(inq => inq._id || inq.id);
    const allSelected = allIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to dismiss/delete the ${selectedIds.length} selected inquiries?`)) {
      return;
    }

    try {
      await Promise.all(selectedIds.map(id => apiRequest(`/api/inquiries/${id}`, { method: 'DELETE' })));
      setInquiries(prev => (Array.isArray(prev) ? prev : []).filter(inq => !selectedIds.includes(inq._id || inq.id)));
      setSelectedIds([]);
      alert('Selected inquiries removed successfully.');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete some inquiries');
    }
  };

  const handleInquiryUpdate = async (id, updates) => {
    setUpdating(true);
    try {
      const updated = await apiRequest(`/api/inquiries/${id}`, {
        method: 'PUT',
        body: updates
      });
      setInquiries(prev => (Array.isArray(prev) ? prev : []).map(inq => (inq._id || inq.id) === id ? updated : inq));
      setSelectedInquiry(updated);
    } catch (err) {
      alert(err.message || 'Failed to update inquiry');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '15px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-gold)' }}></i>
        <p style={{ color: 'var(--color-gray-text)' }}>Loading CRM database...</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div style={{ background: '#FFF5F5', color: '#E53E3E', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-admin-secondary" onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/inquiries/export/csv`, '_blank')}>
            <i className="fa-solid fa-file-csv"></i> Export CSV
          </button>
          <button className="btn-admin-secondary" onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/inquiries/export/excel`, '_blank')}>
            <i className="fa-solid fa-file-excel"></i> Export Excel
          </button>
        </div>
        {selectedIds.length > 0 && (
          <div>
            <button className="btn-logout" onClick={handleBulkDelete} style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
              <i className="fa-solid fa-trash-can"></i> Dismiss/Delete Selected ({selectedIds.length})
            </button>
          </div>
        )}
      </div>

      <div className="dashboard-panel">
        <div className="table-responsive">
          {inquiries.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={inquiries.length > 0 && inquiries.every(inq => selectedIds.includes(inq._id || inq.id))}
                      onChange={handleSelectAll} 
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </th>
                  <th>Lead Name</th>
                  <th>Contact</th>
                  <th>Celebration</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Received Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => {
                  const id = inq._id || inq.id;
                  return (
                    <tr key={id}>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(id)}
                          onChange={() => handleSelectRow(id)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                      </td>
                      <td className="font-semibold" style={{ color: 'var(--color-purple-dark)' }}>{inq.name}</td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>{inq.phone}</div>
                        {inq.email && <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-text)' }}>{inq.email}</div>}
                      </td>
                      <td>
                        <span className="badge pending" style={{ background: 'var(--color-lavender)', color: 'var(--color-purple-dark)' }}>
                          {inq.eventType} ({inq.quantity} pcs)
                        </span>
                      </td>
                      <td className="font-semibold">{inq.budget || 'Not specified'}</td>
                      <td>
                        <span className={`badge ${inq.status.toLowerCase().replace(' ', '-')}`}>
                          {inq.status}
                        </span>
                      </td>
                      <td>{inq.assignedAdmin || 'Unassigned'}</td>
                      <td style={{ color: 'var(--color-gray-text)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="btn-admin"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                          onClick={() => setSelectedInquiry(inq)}
                        >
                          <i className="fa-solid fa-address-card"></i> Manage Lead
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <i className="fa-regular fa-comments"></i>
              <p>No customer messages or leads yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* CRM LEAD MODAL */}
      {selectedInquiry && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setSelectedInquiry(null)}>
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>CRM Lead Detail: {selectedInquiry.name}</h3>
              <button className="modal-close" onClick={() => setSelectedInquiry(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="modal-body">
              {/* Quick Action Bar */}
              <div style={{ background: 'var(--color-lavberry, #FAF6FC)', border: '1px solid var(--color-lavender-dark)', borderRadius: '8px', padding: '15px', marginBottom: '1.5rem', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <a href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="btn-admin" style={{ background: 'var(--color-whatsapp)', border: 'none', flex: 1, textAlign: 'center' }}>
                  <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
                </a>
                <a href={`tel:${selectedInquiry.phone}`} className="btn-admin" style={{ background: '#2563eb', border: 'none', flex: 1, textAlign: 'center' }}>
                  <i className="fa-solid fa-phone"></i> Call Lead
                </a>
                <a href={`mailto:${selectedInquiry.email}`} className="btn-admin" style={{ background: '#dc2626', border: 'none', flex: 1, textAlign: 'center' }}>
                  <i className="fa-solid fa-envelope"></i> Email Lead
                </a>
              </div>

              {/* Lead Information */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '2rem' }}>
                <div>
                  <h4 style={{ color: 'var(--color-purple-dark)', marginBottom: '10px' }}>Contact Info</h4>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr><td style={{ padding: '4px 0', color: 'var(--color-gray-text)' }}>Phone:</td><td style={{ fontWeight: '500' }}>{selectedInquiry.phone}</td></tr>
                      <tr><td style={{ padding: '4px 0', color: 'var(--color-gray-text)' }}>Email:</td><td style={{ fontWeight: '500' }}>{selectedInquiry.email || 'N/A'}</td></tr>
                      <tr><td style={{ padding: '4px 0', color: 'var(--color-gray-text)' }}>City:</td><td style={{ fontWeight: '500' }}>{selectedInquiry.city || 'N/A'}</td></tr>
                      <tr><td style={{ padding: '4px 0', color: 'var(--color-gray-text)' }}>Received:</td><td style={{ fontWeight: '500' }}>{new Date(selectedInquiry.createdAt).toLocaleString()}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h4 style={{ color: 'var(--color-purple-dark)', marginBottom: '10px' }}>Requirements</h4>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr><td style={{ padding: '4px 0', color: 'var(--color-gray-text)' }}>Event:</td><td style={{ fontWeight: '500' }}>{selectedInquiry.eventType}</td></tr>
                      <tr><td style={{ padding: '4px 0', color: 'var(--color-gray-text)' }}>Quantity:</td><td style={{ fontWeight: '500' }}>{selectedInquiry.quantity} pcs</td></tr>
                      <tr><td style={{ padding: '4px 0', color: 'var(--color-gray-text)' }}>Budget:</td><td style={{ fontWeight: '500' }}>{selectedInquiry.budget || 'Not specified'}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Message */}
              <div style={{ background: '#FFFDF9', borderLeft: '4px solid var(--color-gold)', padding: '12px', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <strong>Customer Message:</strong>
                <p style={{ marginTop: '5px', whiteSpace: 'pre-wrap', color: '#555' }}>{selectedInquiry.message}</p>
              </div>

              {/* Split Management View */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', borderTop: '1px solid var(--color-gray-border)', paddingTop: '1.5rem' }}>
                
                {/* Left side: Notes & Assignment */}
                <div>
                  <h4 style={{ color: 'var(--color-purple-dark)', marginBottom: '15px' }}>CRM Management</h4>
                  
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                      <label className="form-label">Lead Status</label>
                      <select
                        className="form-select"
                        value={selectedInquiry.status}
                        onChange={(e) => handleInquiryUpdate(selectedInquiry._id || selectedInquiry.id, { status: e.target.value })}
                        disabled={updating}
                      >
                        <option value="New">New Lead</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress (Designing)</option>
                        <option value="Converted">Converted (Order Placed)</option>
                        <option value="Closed">Closed (Lost/No Response)</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                      <label className="form-label">Assigned Admin</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Admin Name"
                        defaultValue={selectedInquiry.assignedAdmin}
                        onBlur={(e) => {
                          if (e.target.value !== selectedInquiry.assignedAdmin) {
                            handleInquiryUpdate(selectedInquiry._id || selectedInquiry.id, { assignedAdmin: e.target.value });
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lead Notes (Private)</label>
                    <textarea
                      className="form-textarea"
                      rows="5"
                      placeholder="Enter follow-up details, quotes sent, or customer feedback..."
                      defaultValue={selectedInquiry.leadNotes || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (selectedInquiry.leadNotes || '')) {
                          handleInquiryUpdate(selectedInquiry._id || selectedInquiry.id, { leadNotes: e.target.value });
                        }
                      }}
                    ></textarea>
                    <small style={{ color: 'var(--color-gray-text)' }}>Notes auto-save when you click away.</small>
                  </div>
                </div>

                {/* Right side: Timeline History */}
                <div>
                  <h4 style={{ color: 'var(--color-purple-dark)', marginBottom: '15px' }}>Interaction History</h4>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', maxHeight: '350px', overflowY: 'auto' }}>
                    {selectedInquiry.history && selectedInquiry.history.length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, position: 'relative' }}>
                        {selectedInquiry.history.slice().reverse().map((hist, idx) => (
                          <li key={idx} style={{ 
                            paddingLeft: '20px', 
                            borderLeft: '2px solid var(--color-purple)', 
                            position: 'relative',
                            marginBottom: '15px',
                            paddingBottom: idx === selectedInquiry.history.length - 1 ? '0' : '5px'
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
              <button className="btn-admin-secondary" onClick={() => setSelectedInquiry(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
