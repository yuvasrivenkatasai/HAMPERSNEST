import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Header from './components/Header';
import Footer from './components/Footer';
import StudioMap from './components/StudioMap';
import FollowJourney from './components/FollowJourney';
import CartDrawer from './components/CartDrawer';
import FloatingButtons from './components/FloatingButtons';
import QuoteModal from './components/QuoteModal';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Collections from './pages/Collections';
import FeaturedGifts from './pages/FeaturedGifts';
import Gallery from './pages/Gallery';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import ProductDetail from './pages/ProductDetail';
import PolicyPage from './pages/PolicyPage';

import './GlobalStyles.css';

// Inner component — has access to CartContext (rendered inside CartProvider)
function AppInner() {
  const { quoteModalOpen, setQuoteModalOpen } = useCart();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-ivory)' }}>
      <ScrollToTop />
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
          {/* Dynamic Policy Routing */}
          <Route path="/privacy-policy" element={<PolicyPage slug="privacy-policy" />} />
          <Route path="/shipping-policy" element={<PolicyPage slug="shipping-policy" />} />
          <Route path="/refund-policy" element={<PolicyPage slug="refund-policy" />} />
          <Route path="/terms-and-conditions" element={<PolicyPage slug="terms-and-conditions" />} />
          <Route path="/policy/:id" element={<PolicyPage />} />
        </Routes>
      </main>

      {/* Map & Footer layout */}
      <FollowJourney />
      <StudioMap />
      <Footer />

      {/* Slide-over Shopping Cart Drawer */}
      <CartDrawer />

      {/* Lead Capture Quote Modal */}
      <QuoteModal open={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} />

      {/* Call & WhatsApp Floating shortcuts */}
      <FloatingButtons />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <CurrencyProvider>
        <Router>
          <AppInner />
        </Router>
      </CurrencyProvider>
    </CartProvider>
  );
}
