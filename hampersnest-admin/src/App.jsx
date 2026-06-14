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
import MediaLibrary from './pages/Gallery';
import Settings from './pages/Settings';
import Users from './pages/Users';

function NavigationMenu() {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  };

  return (
    <aside className="admin-sidebar">
      {/* Brand logo details */}
      <div className="sidebar-brand">
        <i className="fa-solid fa-gem" style={{ fontSize: '1.5rem', color: 'var(--color-gold)' }}></i>
        <h1>HampersNest</h1>
      </div>
      
      {/* Sidebar Navigation */}
      <ul className="sidebar-menu" style={{ overflowY: 'auto' }}>
        <li>
          <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}>
            <i className="fa-solid fa-chart-line"></i> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/orders" className={`sidebar-link ${location.pathname === '/orders' ? 'active' : ''}`}>
            <i className="fa-solid fa-receipt"></i> Orders
          </Link>
        </li>
        <li>
          <Link to="/products" className={`sidebar-link ${location.pathname === '/products' ? 'active' : ''}`}>
            <i className="fa-solid fa-gift"></i> Products
          </Link>
        </li>
        <li>
          <Link to="/inventory" className={`sidebar-link ${location.pathname === '/inventory' ? 'active' : ''}`}>
            <i className="fa-solid fa-boxes-stacked"></i> Inventory
          </Link>
        </li>
        <li>
          <Link to="/categories" className={`sidebar-link ${location.pathname === '/categories' ? 'active' : ''}`}>
            <i className="fa-solid fa-folder-tree"></i> Categories
          </Link>
        </li>
        <li>
          <Link to="/inquiries" className={`sidebar-link ${location.pathname === '/inquiries' ? 'active' : ''}`}>
            <i className="fa-solid fa-envelope-open-text"></i> Inquiries
          </Link>
        </li>
        <li>
          <Link to="/media" className={`sidebar-link ${location.pathname === '/media' ? 'active' : ''}`}>
            <i className="fa-solid fa-photo-film"></i> Media Library
          </Link>
        </li>
        
        {localStorage.getItem('adminRole') === 'Super Admin' && (
          <>
            <li style={{ marginTop: '1.5rem', marginBottom: '0.5rem', paddingLeft: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
              Administration
            </li>
            
            <li>
              <Link to="/users" className={`sidebar-link ${location.pathname === '/users' ? 'active' : ''}`}>
                <i className="fa-solid fa-users-gear"></i> Users & Roles
              </Link>
            </li>
            <li>
              <Link to="/settings" className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}>
                <i className="fa-solid fa-sliders"></i> Settings
              </Link>
            </li>
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

function AdminLayout({ children }) {
  const location = useLocation();
  const [userRole, setUserRole] = useState('Admin');
  
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
      case '/media': return 'Media Library';
      case '/settings': return 'System Settings';
      case '/users': return 'User Access Control';
      default: return 'Admin Control';
    }
  };

  return (
    <div className="admin-shell">
      <NavigationMenu />
      
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

  // Validate token with backend on boot
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        await apiRequest('/api/auth/verify');
      } catch (err) {
        console.error('Session expired:', err.message);
        localStorage.removeItem('adminToken');
        setToken(null);
      } finally {
        setCheckingAuth(false);
      }
    };
    verifyToken();
  }, [token]);

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
          element={token ? <Navigate to="/" replace /> : <Login setToken={setToken} />} 
        />

        {/* Private Admin Pages */}
        <Route 
          path="/*" 
          element={
            token ? (
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/inquiries" element={<Inquiries />} />
                  <Route path="/media" element={<MediaLibrary />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/users" element={<Users />} />
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
