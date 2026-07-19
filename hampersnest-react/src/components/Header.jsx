import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function Header() {
  const { cartCount, setCartOpen, settings = {}, wishlist } = useCart();
  const { currency, toggleCurrency } = useCurrency();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Toggle scroll header state
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Manage body scroll locking when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {settings?.announcementActive && settings?.announcementText && (
        <div className="top-banner" style={{ 
          background: 'var(--color-purple-dark)', 
          color: 'var(--color-white)', 
          textAlign: 'center', 
          padding: '8px 15px', 
          fontSize: '0.85rem', 
          fontWeight: '500', 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1001,
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}>
          {settings.announcementText}
        </div>
      )}
      <header 
        id="header" 
        className={scrolled ? 'scrolled' : ''}
        style={{ top: (settings?.announcementActive && !scrolled) ? '38px' : '0px' }}
      >
        <div className="nav-container">
          {/* Logo container - image + brand name */}
          <Link to="/" className="logo-container" onClick={closeMobileMenu}>
            <div className="logo-wrapper">
              <img src="/assets/hampersnest-logo.png" alt={`${settings?.storeName || 'Hampers Nest'} Logo`} />
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <div className="nav-menu-inner">
              <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
                Home
              </NavLink>
              <NavLink 
                to="/collections?view=all" 
                className={({ isActive }) => isActive ? 'active' : ''} 
                onClick={closeMobileMenu}
              >
                Collections
              </NavLink>
              <NavLink to="/featured" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
                Featured Gifts
              </NavLink>
              <NavLink to="/gallery" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
                Gallery
              </NavLink>
              <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
                About Us
              </NavLink>
              <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
                Contact
              </NavLink>

              {/* Currency Switcher — inside mobile menu */}
              <div className="currency-switcher currency-switcher-mobile">
                <button
                  className={`currency-btn ${currency === 'INR' ? 'active' : ''}`}
                  onClick={() => toggleCurrency('INR')}
                  aria-label="Switch to INR"
                >
                  ₹ INR
                </button>
                <span className="currency-divider">|</span>
                <button
                  className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
                  onClick={() => toggleCurrency('USD')}
                  aria-label="Switch to USD"
                >
                  $ USD
                </button>
              </div>
            </div>
          </nav>

          {/* Desktop & Mobile Actions */}
          <div className="header-actions">
            {/* Currency Switcher — desktop (top-right of navbar) */}
            <div className="currency-switcher currency-switcher-desktop">
              <button
                className={`currency-btn ${currency === 'INR' ? 'active' : ''}`}
                onClick={() => toggleCurrency('INR')}
                aria-label="Switch to INR"
              >
                ₹ INR
              </button>
              <span className="currency-divider">|</span>
              <button
                className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
                onClick={() => toggleCurrency('USD')}
                aria-label="Switch to USD"
              >
                $ USD
              </button>
            </div>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="nav-cart-btn"
              aria-label="View Wishlist"
              onClick={closeMobileMenu}
              style={{ marginRight: '8px' }}
            >
              <i className="fa-solid fa-heart"></i>
              {wishlist.length > 0 && <span className="nav-cart-badge" style={{ background: '#e24e4e' }}>{wishlist.length}</span>}
            </Link>

            {/* Cart Icon */}
            <button
              onClick={() => {
                closeMobileMenu();
                setCartOpen(true);
              }}
              className="nav-cart-btn"
              aria-label="View Collections / Cart"
            >
              <i className="fa-solid fa-cart-shopping"></i>
              {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
            </button>

            {/* Hamburger menu for small screens */}
            <button
              onClick={toggleMobileMenu}
              className={`menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              aria-label="Toggle navigation menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`menu-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      ></div>
    </>
  );
}
