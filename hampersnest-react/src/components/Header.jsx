import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function Header() {
  const { cartCount, setCartOpen, settings = {} } = useCart();
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
      <header 
        id="header" 
        className={scrolled ? 'scrolled' : ''}
        style={{ top: (settings?.announcementActive && !scrolled) ? '38px' : '0px' }}
      >
        <div className="nav-container">
          {/* Logo container - image + brand name */}
          <Link to="/" className="logo-container" onClick={closeMobileMenu}>
            <div className="logo-circle">
              <img src="/assets/logo.png" alt="Hampers Nest Logo" />
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
              Home
            </NavLink>
            <NavLink to="/collections" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
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
