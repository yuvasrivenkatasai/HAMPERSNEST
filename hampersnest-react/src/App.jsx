import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ProductModal from './components/ProductModal';
import FloatingButtons from './components/FloatingButtons';

import Home from './pages/Home';
import Collections from './pages/Collections';
import FeaturedGifts from './pages/FeaturedGifts';
import Gallery from './pages/Gallery';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import ProductDetail from './pages/ProductDetail';

import './App.css';

function AnnouncementBar() {
  const { settings } = useCart();
  
  if (!settings || !settings.announcementActive) return null;

  return (
    <div className="announcement-bar" style={{
      background: 'var(--gold-gradient)',
      color: 'var(--color-purple-dark)',
      textAlign: 'center',
      padding: '0 20px',
      fontSize: '0.82rem',
      fontWeight: '600',
      letterSpacing: '0.5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      position: 'relative',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      height: '38px',
      boxSizing: 'border-box'
    }}>
      <i className="fa-solid fa-bullhorn" style={{ color: 'var(--color-purple-dark)' }}></i>
      <span>{settings.announcementText}</span>
    </div>
  );
}

function AppContent() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-ivory)' }}>
        {/* Announcement Bar */}
        <AnnouncementBar />

        {/* Header layout */}
        <Header />

        {/* Page Routing */}
        <main style={{ flex: '1 0 auto' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/featured" element={<FeaturedGifts />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </main>

        {/* Footer layout */}
        <Footer />

        {/* Slide-over Shopping Cart Drawer */}
        <CartDrawer />

        {/* Product Details Customizer Modal */}
        <ProductModal />

        {/* Call & WhatsApp Floating shortcuts */}
        <FloatingButtons />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
