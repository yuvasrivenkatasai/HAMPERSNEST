import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null); // null means Add mode
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    event: '',
    quote: '',
    rating: 5,
    isActive: true
  });

  const adminRole = localStorage.getItem('adminRole') || 'Staff';

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/testimonials?all=true');
      setTestimonials(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openAddModal = () => {
    setEditingTestimonial(null);
    setFormData({
      name: '',
      event: '',
      quote: '',
      rating: 5,
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      event: testimonial.event || '',
      quote: testimonial.quote,
      rating: testimonial.rating,
      isActive: testimonial.isActive !== false
    });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.quote.trim()) {
      alert('Name and Review Quote are required.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingTestimonial) {
        // Edit mode
        const updated = await apiRequest(`/api/testimonials/${editingTestimonial.id}`, {
          method: 'PUT',
          body: formData
        });
        setTestimonials(prev => prev.map(t => t.id === editingTestimonial.id ? updated : t));
      } else {
        // Add mode
        const created = await apiRequest('/api/testimonials', {
          method: 'POST',
          body: formData
        });
        setTestimonials(prev => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to save testimonial');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActive = async (testimonial) => {
    const newStatus = testimonial.isActive !== false ? false : true;
    try {
      const updated = await apiRequest(`/api/testimonials/${testimonial.id}`, {
        method: 'PUT',
        body: { isActive: newStatus }
      });
      setTestimonials(prev => prev.map(t => t.id === testimonial.id ? { ...t, isActive: updated.isActive } : t));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial? This cannot be undone.')) return;
    try {
      await apiRequest(`/api/testimonials/${id}`, {
        method: 'DELETE'
      });
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete testimonial');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '15px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-gold)' }}></i>
        <p style={{ color: 'var(--color-gray-text)' }}>Loading customer reviews...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <p style={{ color: 'var(--color-gray-text)', fontSize: '0.95rem' }}>
          Manage client reviews and testimonials displayed on the storefront website's Homepage.
        </p>
        {(adminRole === 'Super Admin' || adminRole === 'Manager') && (
          <button className="btn-admin" onClick={openAddModal}>
            <i className="fa-solid fa-plus"></i> Add Testimonial
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: '#FFF5F5', color: '#E53E3E', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Testimonials Table */}
      <div className="dashboard-panel">
        <div className="table-responsive">
          {testimonials.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Occasion/Event</th>
                  <th>Rating</th>
                  <th style={{ width: '45%' }}>Review Quote</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map(testimonial => (
                  <tr key={testimonial.id}>
                    <td className="font-semibold" style={{ color: 'var(--color-purple-dark)' }}>{testimonial.name}</td>
                    <td>{testimonial.event || 'General'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '2px', color: 'var(--color-gold)' }}>
                        {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                          <i key={i} className="fa-solid fa-star" style={{ fontSize: '0.8rem' }}></i>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.88rem', fontStyle: 'italic', color: '#555' }}>
                      "{testimonial.quote.length > 150 ? `${testimonial.quote.substring(0, 150)}...` : testimonial.quote}"
                    </td>
                    <td>
                      {testimonial.isActive !== false ? (
                        <span className="badge confirmed" style={{ background: '#D1FAE5', color: '#065F46' }}>
                          <i className="fa-solid fa-circle-check"></i> Active
                        </span>
                      ) : (
                        <span className="badge pending" style={{ background: '#FEE2E2', color: '#991B1B' }}>
                          <i className="fa-solid fa-circle-xmark"></i> Inactive
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(adminRole === 'Super Admin' || adminRole === 'Manager') && (
                          <>
                            <button
                              className="btn-admin-secondary"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.72rem' }}
                              onClick={() => openEditModal(testimonial)}
                              title="Edit Testimonial"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button
                              className="btn-admin"
                              style={{ 
                                padding: '0.4rem 0.6rem', 
                                fontSize: '0.72rem', 
                                background: testimonial.isActive !== false ? 'var(--color-purple)' : 'var(--color-gold)',
                                color: '#fff'
                              }}
                              onClick={() => handleToggleActive(testimonial)}
                              title={testimonial.isActive !== false ? "Set as Inactive" : "Set as Active"}
                            >
                              <i className={testimonial.isActive !== false ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                            </button>
                          </>
                        )}
                        {adminRole === 'Super Admin' && (
                          <button
                            className="btn-admin"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.72rem', background: '#dc3545', color: '#fff' }}
                            onClick={() => handleDelete(testimonial.id)}
                            title="Delete Testimonial"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <i className="fa-solid fa-comments"></i>
              <p>No customer testimonials found.</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingTestimonial ? 'Edit Client Testimonial' : 'Add Client Testimonial'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Client Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Priya Ramaswamy"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Occasion / Event / Details</label>
                  <input
                    type="text"
                    name="event"
                    className="form-input"
                    value={formData.event}
                    onChange={handleInputChange}
                    placeholder="e.g., Daughter's Wedding Celebration"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rating (Stars)</label>
                  <select
                    name="rating"
                    className="form-select"
                    value={formData.rating}
                    onChange={handleInputChange}
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Review Quote *</label>
                  <textarea
                    name="quote"
                    className="form-input"
                    rows={4}
                    value={formData.quote}
                    onChange={handleInputChange}
                    placeholder="Enter the client's detailed feedback here..."
                    required
                  ></textarea>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <label htmlFor="isActive" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    Show on Homepage (Active)
                  </label>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-admin-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-admin" disabled={formSubmitting}>
                  {formSubmitting ? 'Saving...' : 'Save Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
