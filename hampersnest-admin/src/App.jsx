import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { apiRequest } from './utils/api';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Inquiries from './pages/Inquiries';
import Categories from './pages/Categories';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Testimonials from './pages/Testimonials';
import Policies from './pages/Policies';
import CategoryShowcaseManager from './pages/CategoryShowcaseManager';
import HeroBannerManager from './pages/HeroBannerManager';

// All modules with their sidebar config
const ALL_SIDEBAR_ITEMS = [
  { path: '/', permission: 'dashboard', icon: 'fa-solid fa-chart-line', label: 'Dashboard' },
  { path: '/orders', permission: 'orders', icon: 'fa-solid fa-receipt', label: 'Orders' },
  { path: '/products', permission: 'products', icon: 'fa-solid fa-gift', label: 'Products' },
  { path: '/inventory', permission: 'inventory', icon: 'fa-solid fa-boxes-stacked', label: 'Inventory' },
  { path: '/categories', permission: 'categories', icon: 'fa-solid fa-folder-tree', label: 'Categories' },
  { path: '/inquiries', permission: 'inquiries', icon: 'fa-solid fa-envelope-open-text', label: 'Inquiries' },
  { path: '/testimonials', permission: 'testimonials', icon: 'fa-solid fa-comments', label: 'Testimonials' },
  { path: '/policies', permission: 'policies', icon: 'fa-solid fa-file-contract', label: 'Policies' },
];

const ADMIN_SIDEBAR_ITEMS = [
  { path: '/users', permission: 'users', icon: 'fa-solid fa-users-gear', label: 'Users & Roles' },
  { path: '/settings', permission: 'settings', icon: 'fa-solid fa-sliders', label: 'Settings' },
  { path: '/category-showcase', permission: 'category_showcase', icon: 'fa-solid fa-icons', label: 'Category Showcase' },
  { path: '/hero-banner', permission: 'settings', icon: 'fa-solid fa-image', label: 'Homepage Hero Images' },
];

// Helper: check if a user has a given permission
function hasPermission(permissions, permKey) {
  if (!permissions || !Array.isArray(permissions)) return false;
  return permissions.includes(permKey);
}

// Access Denied Component
function AccessDenied() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      gap: '16px'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #FEE2E2, #FECACA)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px'
      }}>
        <i className="fa-solid fa-lock" style={{ fontSize: '2rem', color: '#DC2626' }}></i>
      </div>
      <h2 style={{ color: 'var(--color-purple-dark)', margin: 0, fontSize: '1.5rem' }}>Access Denied</h2>
      <p style={{ color: 'var(--color-gray-text)', fontSize: '1rem', maxWidth: '400px', lineHeight: 1.6 }}>
        You do not have permission to access this page. Please contact your administrator to request access.
      </p>
      <Link to="/" className="btn-admin" style={{ marginTop: '10px', textDecoration: 'none' }}>
        <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i> Go Back
      </Link>
    </div>
  );
}

// Protected Route wrapper
function ProtectedRoute({ permissionKey, userPermissions, children }) {
  if (!hasPermission(userPermissions, permissionKey)) {
    return <AccessDenied />;
  }
  return children;
}

function NavigationMenu({ userPermissions }) {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminPermissions');
    window.location.href = '/login';
  };

  // Filter sidebar items based on permissions
  const visibleItems = ALL_SIDEBAR_ITEMS.filter(item => hasPermission(userPermissions, item.permission));
  const visibleAdminItems = ADMIN_SIDEBAR_ITEMS.filter(item => hasPermission(userPermissions, item.permission));

  return (
    <aside className="admin-sidebar">
      {/* Brand logo details */}
      <div className="sidebar-brand">
        <img src="/assets/logo.webp" alt="Hampers Nest Logo" className="brand-logo-img sidebar-logo" />
        <h1 style={{ display: 'none' }}>Hampers Nest Admin</h1>
      </div>
      
      {/* Sidebar Navigation */}
      <ul className="sidebar-menu" style={{ overflowY: 'auto' }}>
        {visibleItems.map(item => (
          <li key={item.path}>
            <Link to={item.path} className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}>
              <i className={item.icon}></i> {item.label}
            </Link>
          </li>
        ))}
        
        {visibleAdminItems.length > 0 && (
          <>
            <li style={{ marginTop: '1.5rem', marginBottom: '0.5rem', paddingLeft: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
              Administration
            </li>
            
            {visibleAdminItems.map(item => (
              <li key={item.path}>
                <Link to={item.path} className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}>
                  <i className={item.icon}></i> {item.label}
                </Link>
              </li>
            ))}
          </>
        )}
      </ul>
      
      {/* Logout button */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn-logout">
          <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
        </button>
      </div>
    </aside>
  );
}

function AdminLayout({ children, userPermissions }) {
  const location = useLocation();
  const [userRole, setUserRole] = useState(localStorage.getItem('adminRole') || 'Admin');
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiRequest('/api/auth/verify');
        setUserRole(data.role);
        localStorage.setItem('adminRole', data.role);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  // Dynamic page title based on path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Executive Dashboard';
      case '/orders': return 'Orders Management';
      case '/products': return 'Hampers Catalogue';
      case '/inventory': return 'Stock Management';
      case '/categories': return 'Categories Management';
      case '/inquiries': return 'Customer Inquiries';
      case '/testimonials': return 'Customer Testimonials';
      case '/policies': return 'Policy Management';
      case '/settings': return 'System Settings';
      case '/users': return 'User Access Control';
      case '/hero-banner': return 'Homepage Hero Images';
      default: return 'Hampers Nest Admin';
    }
  };

  return (
    <div className="admin-shell">
      <NavigationMenu userPermissions={userPermissions} />
      
      <main className="admin-main">
        {/* Top bar header */}
        <header className="admin-header">
          <div className="admin-header-title">
            <h2>{getPageTitle()}</h2>
          </div>
          <div className="admin-header-profile">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '5px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Administrator</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-purple)' }}>{userRole}</span>
            </div>
            <i className="fa-solid fa-circle-user" style={{ fontSize: '1.8rem', color: 'var(--color-gold)', background: 'none', padding: 0 }}></i>
          </div>
        </header>

        {/* Dynamic page container */}
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userPermissions, setUserPermissions] = useState([]);

  // Validate token with backend on boot
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const data = await apiRequest('/api/auth/verify');
        const perms = data.permissions || [];
        setUserPermissions(perms);
        localStorage.setItem('adminPermissions', JSON.stringify(perms));
        localStorage.setItem('adminRole', data.role);
      } catch (err) {
        console.error('Session expired:', err.message);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRole');
        localStorage.removeItem('adminPermissions');
        setToken(null);
      } finally {
        setCheckingAuth(false);
      }
    };
    verifyToken();
  }, [token]);

  // Custom setToken that also stores permissions from login response
  const handleSetToken = (loginData) => {
    if (loginData && loginData.token) {
      localStorage.setItem('adminToken', loginData.token);
      localStorage.setItem('adminRole', loginData.role);
      localStorage.setItem('adminPermissions', JSON.stringify(loginData.permissions || []));
      setToken(loginData.token);
      setUserPermissions(loginData.permissions || []);
    }
  };

  if (checkingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-ivory)', flexDirection: 'column', gap: '15px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-gold)' }}></i>
        <p style={{ color: 'var(--color-purple-dark)', fontWeight: 500 }}>Verifying secure session...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route 
          path="/login" 
          element={token ? <Navigate to="/" replace /> : <Login setToken={handleSetToken} />} 
        />

        {/* Private Admin Pages */}
        <Route 
          path="/*" 
          element={
            token ? (
              <AdminLayout userPermissions={userPermissions}>
                <Routes>
                  <Route path="/" element={<ProtectedRoute permissionKey="dashboard" userPermissions={userPermissions}><Dashboard /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute permissionKey="orders" userPermissions={userPermissions}><Orders /></ProtectedRoute>} />
                  <Route path="/products" element={<ProtectedRoute permissionKey="products" userPermissions={userPermissions}><Products /></ProtectedRoute>} />
                  <Route path="/inventory" element={<ProtectedRoute permissionKey="inventory" userPermissions={userPermissions}><Inventory /></ProtectedRoute>} />
                  <Route path="/categories" element={<ProtectedRoute permissionKey="categories" userPermissions={userPermissions}><Categories /></ProtectedRoute>} />
                  <Route path="/inquiries" element={<ProtectedRoute permissionKey="inquiries" userPermissions={userPermissions}><Inquiries /></ProtectedRoute>} />
                  <Route path="/testimonials" element={<ProtectedRoute permissionKey="testimonials" userPermissions={userPermissions}><Testimonials /></ProtectedRoute>} />
                  <Route path="/policies" element={<ProtectedRoute permissionKey="policies" userPermissions={userPermissions}><Policies /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute permissionKey="settings" userPermissions={userPermissions}><Settings /></ProtectedRoute>} />
                  <Route path="/users" element={<ProtectedRoute permissionKey="users" userPermissions={userPermissions}><Users /></ProtectedRoute>} />
                  <Route path="/category-showcase" element={<ProtectedRoute permissionKey="category_showcase" userPermissions={userPermissions}><CategoryShowcaseManager /></ProtectedRoute>} />
                  <Route path="/hero-banner" element={<ProtectedRoute permissionKey="settings" userPermissions={userPermissions}><HeroBannerManager /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AdminLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}
