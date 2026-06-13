import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { apiRequest } from './utils/api';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Inquiries from './pages/Inquiries';
import Promotions from './pages/Promotions';
import Gallery from './pages/Gallery';
import Categories from './pages/Categories';

function NavigationMenu() {
  const location = useLocation();
  const navigate = useNavigate();

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
      <ul className="sidebar-menu">
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
          <Link to="/categories" className={`sidebar-link ${location.pathname === '/categories' ? 'active' : ''}`}>
            <i className="fa-solid fa-folder-open"></i> Categories
          </Link>
        </li>
        <li>
          <Link to="/inquiries" className={`sidebar-link ${location.pathname === '/inquiries' ? 'active' : ''}`}>
            <i className="fa-solid fa-envelope-open-text"></i> Inquiries
          </Link>
        </li>
        <li>
          <Link to="/promotions" className={`sidebar-link ${location.pathname === '/promotions' ? 'active' : ''}`}>
            <i className="fa-solid fa-bullhorn"></i> Campaigns
          </Link>
        </li>
        <li>
          <Link to="/gallery" className={`sidebar-link ${location.pathname === '/gallery' ? 'active' : ''}`}>
            <i className="fa-solid fa-images"></i> Showcase Gallery
          </Link>
        </li>
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
  
  // Dynamic page title based on path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard Analytics';
      case '/orders': return 'Orders Management';
      case '/products': return 'Hampers Catalogue';
      case '/categories': return 'Categories Management';
      case '/inquiries': return 'Customer Inquiries';
      case '/promotions': return 'Promotions & Themes';
      case '/gallery': return 'Showcase Gallery';
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
            <i className="fa-solid fa-user-gear"></i>
            <span>Administrator</span>
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
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/inquiries" element={<Inquiries />} />
                  <Route path="/promotions" element={<Promotions />} />
                  <Route path="/gallery" element={<Gallery />} />
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
