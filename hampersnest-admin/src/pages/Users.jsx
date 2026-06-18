import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const ALL_MODULES = [
  { key: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-line' },
  { key: 'orders', label: 'Orders', icon: 'fa-solid fa-receipt' },
  { key: 'products', label: 'Products', icon: 'fa-solid fa-gift' },
  { key: 'inventory', label: 'Inventory', icon: 'fa-solid fa-boxes-stacked' },
  { key: 'categories', label: 'Categories', icon: 'fa-solid fa-folder-tree' },
  { key: 'inquiries', label: 'Inquiries', icon: 'fa-solid fa-envelope-open-text' },
  { key: 'testimonials', label: 'Testimonials', icon: 'fa-solid fa-comments' },
  { key: 'policies', label: 'Policies', icon: 'fa-solid fa-file-contract' },
  { key: 'users', label: 'Users & Roles', icon: 'fa-solid fa-users-gear' },
  { key: 'settings', label: 'Settings', icon: 'fa-solid fa-sliders' },
];

const ALL_PERMISSIONS = ['dashboard', 'orders', 'products', 'inventory', 'categories', 'inquiries', 'testimonials', 'policies', 'users', 'settings'];

const ROLES = ['Super Admin', 'Admin', 'Manager', 'Staff'];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Admin',
    isActive: true,
    permissions: []
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/auth/users');
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch users. You might not have the required permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      role: 'Admin',
      isActive: true,
      permissions: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    const perms = user.permissions || [];
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
      isActive: user.isActive !== false,
      permissions: [...perms]
    });
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole) => {
    // When role changes to Super Admin, grant full access. Otherwise keep current selections.
    if (newRole === 'Super Admin') {
      setFormData(prev => ({
        ...prev,
        role: newRole,
        permissions: [...ALL_PERMISSIONS]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        role: newRole
      }));
    }
  };

  const handlePermissionToggle = (moduleKey) => {
    setFormData(prev => {
      const current = prev.permissions || [];
      if (current.includes(moduleKey)) {
        return { ...prev, permissions: current.filter(p => p !== moduleKey) };
      } else {
        return { ...prev, permissions: [...current, moduleKey] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Edit mode
        const payload = {
          username: formData.username,
          role: formData.role,
          isActive: formData.isActive,
          permissions: formData.permissions
        };
        if (formData.password) payload.password = formData.password;
        
        await apiRequest(`/api/auth/users/${editingUser.id}`, {
          method: 'PUT',
          body: payload
        });
      } else {
        // Add mode
        await apiRequest('/api/auth/users', {
          method: 'POST',
          body: {
            username: formData.username,
            password: formData.password,
            role: formData.role,
            permissions: formData.permissions
          }
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

  // Helper to display permission badges
  const getPermissionBadges = (user) => {
    const perms = user.permissions || [];
    if (perms.length === ALL_MODULES.length) {
      return <span className="badge confirmed" style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.7rem' }}>Full Access</span>;
    }
    if (perms.length === 0) {
      return <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>No permissions set</span>;
    }
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
        {perms.slice(0, 4).map(p => (
          <span key={p} style={{
            background: '#EDE9FE',
            color: '#5B21B6',
            padding: '1px 6px',
            borderRadius: '3px',
            fontSize: '0.65rem',
            fontWeight: 500
          }}>{p}</span>
        ))}
        {perms.length > 4 && (
          <span style={{
            background: '#F3F4F6',
            color: '#6B7280',
            padding: '1px 6px',
            borderRadius: '3px',
            fontSize: '0.65rem',
            fontWeight: 500
          }}>+{perms.length - 4} more</span>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h2 style={{ color: 'var(--color-purple-dark)' }}>Users & Roles</h2>
          <p style={{ color: 'var(--color-gray-text)', fontSize: '0.9rem' }}>Manage admin accounts, roles, and module permissions</p>
        </div>
        <button className="btn-admin" onClick={handleOpenAddModal}>
          <i className="fa-solid fa-plus"></i> Add New User
        </button>
      </div>

      {/* Role Legend */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {ROLES.map(role => (
          <div key={role} style={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '10px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: '140px'
          }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-purple-dark)' }}>{role}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-text)' }}>
              {role === 'Super Admin' ? 'Full Access (always)' : 'Customizable'}
            </span>
          </div>
        ))}
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
                  <th>Permissions</th>
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
                      <span className={`badge ${user.role === 'Super Admin' ? 'confirmed' : user.role === 'Admin' ? 'pending' : 'pending'}`}
                        style={
                          user.role === 'Super Admin' ? { background: '#DCFCE7', color: '#166534' } :
                          user.role === 'Admin' ? { background: '#DBEAFE', color: '#1E40AF' } :
                          user.role === 'Manager' ? { background: '#FEF3C7', color: '#92400E' } :
                          { background: '#F3F4F6', color: '#374151' }
                        }
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>{getPermissionBadges(user)}</td>
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
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
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
                    onChange={(e) => handleRoleChange(e.target.value)}
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                  <small style={{ color: 'var(--color-gray-text)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    Changing role resets permissions to that role's defaults. You can then customize below.
                  </small>
                </div>

                {/* Permission Editor */}
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: '#F9FAFB',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, color: 'var(--color-purple-dark)', fontSize: '0.95rem' }}>
                      <i className="fa-solid fa-shield-halved" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i>
                      Module Permissions
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-text)' }}>
                      {formData.permissions.length}/{ALL_MODULES.length} selected
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {ALL_MODULES.map(mod => {
                      const isChecked = formData.permissions.includes(mod.key);
                      return (
                        <label
                          key={mod.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: isChecked ? '#EDE9FE' : '#FFFFFF',
                            border: isChecked ? '1px solid #A78BFA' : '1px solid #E5E7EB',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handlePermissionToggle(mod.key)}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--color-purple)' }}
                          />
                          <i className={mod.icon} style={{ fontSize: '0.8rem', color: isChecked ? 'var(--color-purple)' : '#9CA3AF', width: '16px' }}></i>
                          <span style={{
                            fontSize: '0.82rem',
                            fontWeight: isChecked ? 600 : 400,
                            color: isChecked ? 'var(--color-purple-dark)' : '#6B7280'
                          }}>
                            {mod.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
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
