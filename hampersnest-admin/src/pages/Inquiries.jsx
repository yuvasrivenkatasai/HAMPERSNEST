import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allIds = inquiries.map(inq => inq._id);
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
      await Promise.all(selectedIds.map(id => apiRequest(`/api/inquiries/${id}`, {
        method: 'DELETE'
      })));
      setInquiries(prev => prev.filter(inq => !selectedIds.includes(inq._id)));
      setSelectedIds([]);
      alert('Selected inquiries removed successfully.');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete some inquiries');
    }
  };

  const fetchInquiries = async () => {
    try {
      const data = await apiRequest('/api/inquiries');
      setInquiries(data);
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

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the message from "${name}"?`)) {
      return;
    }

    try {
      await apiRequest(`/api/inquiries/${id}`, {
        method: 'DELETE'
      });
      setInquiries(prev => prev.filter(inq => inq._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete inquiry');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '15px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-gold)' }}></i>
        <p style={{ color: 'var(--color-gray-text)' }}>Loading customer inquiries...</p>
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

      {selectedIds.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button className="btn-logout" onClick={handleBulkDelete} style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
            <i className="fa-solid fa-trash-can"></i> Dismiss/Delete Selected ({selectedIds.length})
          </button>
        </div>
      )}

      <div className="dashboard-panel">
        <div className="table-responsive">
          {inquiries.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={inquiries.length > 0 && inquiries.every(inq => selectedIds.includes(inq._id))}
                      onChange={handleSelectAll} 
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </th>
                  <th>Sender Info</th>
                  <th>Celebration Detail</th>
                  <th>Quantity</th>
                  <th>Message Request</th>
                  <th>Received Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr key={inq._id}>
                    <td style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(inq._id)}
                        onChange={() => handleSelectRow(inq._id)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                    </td>
                    <td>
                      <div className="font-semibold" style={{ color: 'var(--color-purple-dark)' }}>{inq.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-text)' }}>Phone: {inq.phone}</div>
                    </td>
                    <td>
                      <span className="badge pending" style={{ background: 'var(--color-lavender)', color: 'var(--color-purple-dark)' }}>
                        {inq.eventType}
                      </span>
                    </td>
                    <td className="font-semibold">{inq.quantity} pcs</td>
                    <td>
                      <div 
                        style={{ 
                          maxHeight: '80px', 
                          overflowY: 'auto', 
                          fontSize: '0.82rem', 
                          color: '#555', 
                          whiteSpace: 'pre-wrap',
                          padding: '6px',
                          background: 'var(--color-gray-light)',
                          borderRadius: '4px',
                          border: '1px solid var(--color-gray-border)',
                          minWidth: '250px'
                        }}
                      >
                        {inq.message}
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-gray-text)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {new Date(inq.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a 
                          href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`} 
                          target="_blank"
                          rel="noreferrer"
                          className="btn-admin" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textDecoration: 'none', background: 'var(--color-whatsapp)' }}
                        >
                          <i className="fa-brands fa-whatsapp"></i> Chat
                        </a>
                        <button
                          className="btn-logout"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                          onClick={() => handleDelete(inq._id, inq.name)}
                        >
                          <i className="fa-solid fa-trash-can"></i> Dismiss
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <i className="fa-regular fa-comments"></i>
              <p>No customer messages or inquiries yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
