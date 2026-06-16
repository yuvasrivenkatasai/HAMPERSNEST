import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'Admin', isActive: true });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/auth/users');
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch users. You might not have Super Admin permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'Admin', isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: '', role: user.role, isActive: user.isActive !== false });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Edit mode
        const payload = { username: formData.username, role: formData.role, isActive: formData.isActive };
        if (formData.password) payload.password = formData.password;
        
        await apiRequest(`/api/auth/users/${editingUser.id}`, {
          method: 'PUT',
          body: payload
        });
      } else {
        // Add mode
        await apiRequest('/api/auth/users', {
          method: 'POST',
          body: formData
        });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this user? This cannot be undone.')) return;
    try {
      await apiRequest(`/api/auth/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.isActive !== false ? false : true;
      await apiRequest(`/api/auth/users/${user.id}`, {
        method: 'PUT',
        body: { isActive: newStatus }
      });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h2 style={{ color: 'var(--color-purple-dark)' }}>Admin Users</h2>
          <p style={{ color: 'var(--color-gray-text)', fontSize: '0.9rem' }}>Manage admin accounts and roles</p>
        </div>
        <button className="btn-admin" onClick={handleOpenAddModal}>
          <i className="fa-solid fa-plus"></i> Add New Admin
        </button>
      </div>

      {error && (
        <div className="login-error" style={{ marginBottom: '1.5rem', background: '#FFF3CD', color: '#856404', border: '1px solid #FFEEBA' }}>
          <i className="fa-solid fa-triangle-exclamation"></i> {error}
        </div>
      )}

      <div className="dashboard-panel">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--color-gold)' }}></i>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-users-slash"></i>
            <h3>No users found</h3>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td className="font-semibold">{user.username}</td>
                    <td>
                      <span className={`badge ${user.role === 'Super Admin' ? 'confirmed' : 'pending'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.isActive !== false ? (
                        <span className="badge confirmed" style={{ background: '#D1FAE5', color: '#065F46' }}>
                          <i className="fa-solid fa-circle-check"></i> Active
                        </span>
                      ) : (
                        <span className="badge pending" style={{ background: '#FEE2E2', color: '#991B1B' }}>
                          <i className="fa-solid fa-circle-xmark"></i> Disabled
                        </span>
                      )}
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-admin-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => handleOpenEditModal(user)}
                          title="Edit User"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button 
                          className="btn-admin-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: user.isActive !== false ? '#991B1B' : '#065F46' }}
                          onClick={() => handleToggleStatus(user)}
                          title={user.isActive !== false ? "Disable User" : "Enable User"}
                        >
                          <i className={user.isActive !== false ? "fa-solid fa-ban" : "fa-solid fa-circle-check"}></i>
                        </button>
                        <button 
                          className="btn-logout"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => handleDelete(user.id)}
                          title="Delete User"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* USER MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit Admin User' : 'Create Admin User'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{editingUser ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    required={!editingUser} 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select 
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="Staff">Staff</option>
                    <option value="Manager">Manager</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
                {editingUser && (
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px' }}>
                    <input 
                      type="checkbox" 
                      id="user-active"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <label htmlFor="user-active" style={{ margin: 0, fontWeight: 500 }}>Account is Active</label>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-admin-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-admin">{editingUser ? 'Save Changes' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
