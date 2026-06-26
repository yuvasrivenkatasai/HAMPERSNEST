import React, { Suspense, lazy } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const Home = lazy(() => import('./pages/Home'));
const Collections = lazy(() => import('./pages/Collections'));
const FeaturedGifts = lazy(() => import('./pages/FeaturedGifts'));
const Gallery = lazy(() => import('./pages/Gallery'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Contact = lazy(() => import('./pages/Contact'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const PolicyPage = lazy(() => import('./pages/PolicyPage'));

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
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '10rem 2rem' }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--color-gold)' }}></i></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/featured" element={<FeaturedGifts />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            
            {/* Dynamic Policy Routing */}
            <Route path="/policies/:id" element={<PolicyPage />} />
            
            {/* Universal 404 Catch-All Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Visit Our Studio section & Follow Our Journey rendered on all pages */}
      <StudioMap />
      <FollowJourney />

      {/* Main Footer */}
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
    <HelmetProvider>
      <CartProvider>
        <CurrencyProvider>
          <Router>
            <AppInner />
          </Router>
        </CurrencyProvider>
      </CartProvider>
    </HelmetProvider>
  );
}
