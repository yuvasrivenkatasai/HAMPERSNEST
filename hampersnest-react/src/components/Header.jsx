import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function Header() {
  const { cartCount, setCartOpen, settings = {} } = useCart();
  const { currency, toggleCurrency } = useCurrency();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionsDropdownOpen, setCollectionsDropdownOpen] = useState(false);

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
    setCollectionsDropdownOpen(false);
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
            <div className="logo-wrapper">
              <img src="/assets/hampersnest-logo.png" alt="Hampers Nest Logo" />
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <div className="nav-menu-inner">
              <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
                Home
              </NavLink>
              <div className={`nav-dropdown-wrapper ${collectionsDropdownOpen ? 'open' : ''}`}>
                <NavLink 
                  to="/collections" 
                  className={({ isActive }) => isActive ? 'active' : ''}
                  onClick={(e) => {
                    if (window.innerWidth <= 1024) {
                      e.preventDefault();
                      setCollectionsDropdownOpen(!collectionsDropdownOpen);
                    } else {
                      closeMobileMenu();
                    }
                  }}
                >
                  Collections <i className="fa-solid fa-chevron-down dropdown-arrow"></i>
                </NavLink>
                <div className="nav-dropdown-menu">
                  <Link to="/collections" onClick={closeMobileMenu}>All Products</Link>
                  {Array.isArray(settings?.categories) && settings.categories.map((category) => {
                    const id = String(category.id || category.label || '').trim();
                    const label = String(category.label || category.id || '').trim();
                    if (!id) return null;
                    return (
                      <Link 
                        key={id} 
                        to={`/collections?category=${encodeURIComponent(id)}`} 
                        onClick={closeMobileMenu}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
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
