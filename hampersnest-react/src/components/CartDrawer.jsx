import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { USD_RATE } from '../data/constants';

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    cartTotal,
    cartCount,
    updateQuantity,
    removeFromCart,
    getWhatsappCheckoutUrl
  } = useCart();

  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = review items, 2 = checkout details
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventType: '',
    deliveryDate: '',
    notes: ''
  });

  // Reset checkout step when cart closes
  useEffect(() => {
    if (!cartOpen) {
      setTimeout(() => setCheckoutStep(1), 300);
    }
  }, [cartOpen]);

  // Handle escape key closure
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && cartOpen) {
        setCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartOpen, setCartOpen]);

  // Handle outside click to close drawer
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('cart-drawer-backdrop')) {
      setCartOpen(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.eventType) {
      alert('Please fill out all required fields (Name, Phone, Event Type).');
      return;
    }

    const orderPayload = {
      customer: {
        name: formData.name,
        phone: formData.phone
      },
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customizations: {
          wrappingStyle: item.customizations.wrappingStyle || 'Standard',
          ribbonColor: item.customizations.ribbonColor || 'None',
          giftTag: item.customizations.giftTag || ''
        }
      })),
      totalAmount: cartTotal,
      eventType: formData.eventType,
      deliveryDate: formData.deliveryDate || null,
      notes: formData.notes || ''
    };

    let orderId = null;
    try {
      const API_BASE = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost')
        ? 'http://localhost:5000'
        : '';
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      if (response.ok) {
        const data = await response.json();
        orderId = data.orderId;
      }
    } catch (err) {
      console.error('Failed to submit order to database:', err);
    }

    const whatsappUrl = getWhatsappCheckoutUrl(formData, orderId);
    window.open(whatsappUrl, '_blank');
    setCartOpen(false);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`cart-drawer-backdrop ${cartOpen ? 'active' : ''}`}
        onClick={handleBackdropClick}
      ></div>

      {/* Slide-over Drawer panel */}
      <div className={`cart-drawer ${cartOpen ? 'active' : ''}`}>
        <div className="cart-drawer-header">
          <h3>
            {checkoutStep === 1 ? 'Your Hamper Cart' : 'Order Information'}
          </h3>
          <button
            onClick={() => setCartOpen(false)}
            className="cart-drawer-close"
            aria-label="Close cart drawer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <i className="fa-solid fa-gift"></i>
              <p>Your cart is empty.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                Add premium hampers from our collections to get started!
              </p>
              <button
                className="btn btn-primary"
                style={{ marginTop: '1.5rem', padding: '0.6rem 1.5rem', fontSize: '0.75rem' }}
                onClick={() => setCartOpen(false)}
              >
                Browse Hampers
              </button>
            </div>
          ) : checkoutStep === 1 ? (
            /* STEP 1: REVIEW CART ITEMS */
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {cart.map((item) => (
                  <div key={item.cartItemId} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    
                    <div className="cart-item-details">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-price">₹{item.price}</span>
                      
                      {/* Customization Details */}
                      {(item.customizations.giftTag ||
                        item.customizations.wrappingStyle !== 'Standard' ||
                        item.customizations.ribbonColor !== 'None') && (
                        <div className="cart-item-customizations">
                          {item.customizations.wrappingStyle !== 'Standard' && (
                            <div>• Wrap: {item.customizations.wrappingStyle}</div>
                          )}
                          {item.customizations.ribbonColor !== 'None' && (
                            <div>• Ribbon: {item.customizations.ribbonColor}</div>
                          )}
                          {item.customizations.giftTag && (
                            <div style={{ fontStyle: 'italic' }}>
                              • Tag Msg: "{item.customizations.giftTag}"
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quantity & Delete Actions */}
                      <div className="cart-item-actions">
                        <div className="cart-item-qty">
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <i className="fa-solid fa-minus"></i>
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="cart-item-remove"
                          title="Remove item"
                        >
                          <i className="fa-solid fa-trash-can"></i> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* STEP 2: ENTER CHECKOUT DETAILS */
            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="c-name">Your Name *</label>
                <input
                  type="text"
                  id="c-name"
                  name="name"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="c-phone">WhatsApp Phone *</label>
                <input
                  type="tel"
                  id="c-phone"
                  name="phone"
                  className="form-input"
                  placeholder="e.g. +91 9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="c-event">Event Type *</label>
                  <select
                    id="c-event"
                    name="eventType"
                    className="form-select"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select event</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Baby Shower">Baby Shower</option>
                    <option value="Housewarming">Housewarming</option>
                    <option value="Half Saree Function">Half Saree</option>
                    <option value="Corporate Gifting">Corporate</option>
                    <option value="Other Celebration">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="c-date">Required Date</label>
                  <input
                    type="date"
                    id="c-date"
                    name="deliveryDate"
                    className="form-input"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    style={{ padding: '0.5rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="c-notes">Customization Instructions</label>
                <textarea
                  id="c-notes"
                  name="notes"
                  className="form-textarea"
                  rows="3"
                  placeholder="E.g. customized names on tag, partition boxes, color matching..."
                  value={formData.notes}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div style={{ background: 'var(--color-lavender)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: '#666', borderLeft: '3px solid var(--color-gold)' }}>
                <strong>WhatsApp Order:</strong> We will redirect you to WhatsApp. You can review the compiled cart text before sending.
              </div>
            </form>
          )}
        </div>

        {/* CART DRAWER FOOTER */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span>Total Items:</span>
              <span>{cartCount}</span>
            </div>
            <div className="cart-summary-row cart-summary-total">
              <span>Subtotal:</span>
              <span>₹{cartTotal}</span>
            </div>
            <p className="cart-usd-total">≈ ${Math.round(cartTotal / USD_RATE)} USD</p>

            {checkoutStep === 1 ? (
              <button
                onClick={() => setCheckoutStep(2)}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                Proceed to Checkout <i className="fa-solid fa-arrow-right"></i>
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCheckoutStep(1)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.8rem 1rem' }}
                >
                  <i className="fa-solid fa-arrow-left"></i> Back
                </button>
                <button
                  onClick={handleCheckoutSubmit}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '0.8rem 1rem', background: 'var(--color-whatsapp)', borderColor: 'var(--color-whatsapp)', boxShadow: '0 8px 20px rgba(37, 211, 102, 0.2)' }}
                >
                  Checkout WhatsApp <i className="fa-brands fa-whatsapp"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
