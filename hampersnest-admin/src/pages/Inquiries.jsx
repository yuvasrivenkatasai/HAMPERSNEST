import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

      <div className="dashboard-panel">
        <div className="table-responsive">
          {inquiries.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
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
