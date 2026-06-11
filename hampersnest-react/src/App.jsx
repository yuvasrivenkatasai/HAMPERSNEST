import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
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

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-ivory)' }}>
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
    </CartProvider>
  );
}
