import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { API_BASE } from '../config.js';
import { useCurrency } from '../context/CurrencyContext';
import { MIN_ORDER_QUANTITY, QUICK_QTYS } from '../utils/constants';
import { validateQuantityInput, sanitizeQuantityOnBlur, validateRequiredDate, validatePhone } from '../utils/ValidationUtils';

const DeliveryAccordion = ({ cart, products }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Look for custom delivery info in cart items
  let customInfoItems = null;
  for (const item of cart) {
    const product = products.find(p => p.id === item.id);
    if (product && product.deliveryInfoText && product.deliveryInfoText.trim() !== '' && product.deliveryInfoText.trim() !== 'Standard Delivery: 3-5 business days. Express Delivery available at checkout.') {
       customInfoItems = product.shipping && product.shipping.length > 0 
         ? product.shipping 
         : product.deliveryInfoText.split('\n').map(i => i.trim()).filter(Boolean);
       break;
    }
  }

  return (
    <div style={{
      background: 'var(--color-ivory, #FCFBF8)',
      border: '1px solid var(--color-gold-light, #EADDCA)',
      borderRadius: '8px',
      marginBottom: '1rem',
      marginTop: '1rem',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-charcoal, #333)',
          fontSize: '0.9rem',
          fontWeight: 600,
          textAlign: 'left'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-circle-info" style={{ color: 'var(--color-gold, #C8A96B)' }}></i>
          Important Delivery Information
        </span>
        <i 
          className="fa-solid fa-chevron-down" 
          style={{ 
            color: 'var(--color-gold, #C8A96B)', 
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        ></i>
      </button>
      
      <div style={{
        maxHeight: isOpen ? '500px' : '0',
        opacity: isOpen ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out'
      }}>
        <div style={{ padding: '0 16px 16px 16px' }}>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px', 
            fontSize: '0.8rem', 
            color: '#555', 
            lineHeight: '1.6' 
          }}>
            {customInfoItems ? customInfoItems.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
            )) : (
              <>
                <li style={{ marginBottom: '6px' }}>Shipping charges are NOT included in the displayed product price.</li>
                <li style={{ marginBottom: '6px' }}>Delivery charges are calculated after checkout based on the destination and the higher of the actual or volumetric weight.</li>
                <li style={{ marginBottom: '6px' }}>Our team will contact the customer with the final shipping cost and estimated delivery date before dispatch.</li>
                <li style={{ marginBottom: '6px' }}>Orders are generally dispatched within 2–7 business days.</li>
                <li style={{ marginBottom: '6px' }}>Delivery is available across India.</li>
                <li>Bulk order discounts are automatically applied where applicable.</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    cartCount,
    cartTotal,
    cartTotals,
    updateQuantity,
    removeFromCart,
    getWhatsappCheckoutUrl,
    products
  } = useCart();
  const { currency, formatPrice } = useCurrency();

  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = review items, 2 = checkout details
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventType: '',
    deliveryDate: '',
    notes: ''
  });
  
  const [qtyInputTexts, setQtyInputTexts] = useState({});
  
  useEffect(() => {
    const newInputs = {};
    cart.forEach(item => {
      if (qtyInputTexts[item.cartItemId] === undefined) {
         newInputs[item.cartItemId] = item.quantity.toString();
      } else {
         newInputs[item.cartItemId] = qtyInputTexts[item.cartItemId];
      }
    });
    setQtyInputTexts(prev => ({ ...prev, ...newInputs }));
  }, [cart]);

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
    
    if (!validatePhone(formData.phone)) {
      alert('Please enter a valid phone number (10-15 digits).');
      return;
    }
    
    if (formData.deliveryDate && !validateRequiredDate(formData.deliveryDate, 0, 3)) {
      alert('Please enter a valid required date (must be a valid 4-digit year within next 3 years).');
      return;
    }

    if (cart.some(item => item.quantity < MIN_ORDER_QUANTITY)) {
      alert(`Minimum order quantity is ${MIN_ORDER_QUANTITY} pieces per product. Please increase your quantities.`);
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
                      <span className="cart-item-price">{formatPrice(item.price)}</span>
                      
                      {/* Customization Details */}
                      {(item.customizations.giftTag || item.customizations.variant || (item.customizations.addOns && item.customizations.addOns.length > 0)) && (
                        <div className="cart-item-customizations" style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: '4px' }}>
                          {item.customizations.variant && (
                            <div style={{ fontStyle: 'italic', marginBottom: '2px' }}>
                              • Size: {item.customizations.variant.name}
                            </div>
                          )}
                          {item.customizations.giftTag && (
                            <div style={{ fontStyle: 'italic', marginBottom: '2px' }}>
                              • Tag Msg: "{item.customizations.giftTag}"
                            </div>
                          )}
                          {item.customizations.addOns && item.customizations.addOns.length > 0 && (
                            <div style={{ fontStyle: 'italic' }}>
                              • Add-ons: {item.customizations.addOns.map(a => typeof a === 'string' ? a : a.name).join(', ')}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Upselling Message per Product */}
                      {cartTotals?.upsales?.[item.id] && (
                        <div style={{ 
                          marginTop: '6px', 
                          background: 'rgba(251, 191, 36, 0.1)', 
                          border: '1px dashed var(--color-gold)', 
                          padding: '6px', 
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          color: 'var(--color-gold-dark)'
                        }}>
                          🎁 Add <strong>{cartTotals.upsales[item.id].qtyNeeded} more pieces</strong> to unlock <strong>{cartTotals.upsales[item.id].discountPercent}% OFF</strong>
                        </div>
                      )}

                      {/* Quantity & Delete Actions */}
                      <div className="cart-item-actions-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <div className="qty-picker-detail" style={{ height: '36px', display: 'flex', flexShrink: 0, padding: '0 4px' }}>
                            <button
                              onClick={() => {
                                const newQ = Math.max(MIN_ORDER_QUANTITY, item.quantity - 1);
                                setQtyInputTexts(p => ({ ...p, [item.cartItemId]: newQ.toString() }));
                                updateQuantity(item.cartItemId, newQ);
                              }}
                              disabled={item.quantity <= MIN_ORDER_QUANTITY}
                              aria-label="Decrease quantity"
                              style={{ opacity: item.quantity <= MIN_ORDER_QUANTITY ? 0.5 : 1, cursor: item.quantity <= MIN_ORDER_QUANTITY ? 'not-allowed' : 'pointer' }}
                            >
                              <i className="fa-solid fa-minus" style={{ fontSize: '0.75rem' }}></i>
                            </button>
                            <input
                              type="text"
                              value={qtyInputTexts[item.cartItemId] ?? item.quantity.toString()}
                              onChange={(e) => {
                                const res = validateQuantityInput(e.target.value);
                                if (res.isValid) {
                                  setQtyInputTexts(p => ({ ...p, [item.cartItemId]: res.value.toString() }));
                                }
                              }}
                              onBlur={() => {
                                const val = qtyInputTexts[item.cartItemId];
                                const sanitized = sanitizeQuantityOnBlur(val);
                                setQtyInputTexts(p => ({ ...p, [item.cartItemId]: sanitized.toString() }));
                                updateQuantity(item.cartItemId, sanitized);
                              }}
                              style={{ 
                                width: '40px', textAlign: 'center', border: 'none', background: 'transparent',
                                fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-charcoal)', padding: '0'
                              }}
                            />
                            <button
                              onClick={() => {
                                const newQ = item.quantity + 1;
                                setQtyInputTexts(p => ({ ...p, [item.cartItemId]: newQ.toString() }));
                                updateQuantity(item.cartItemId, newQ);
                              }}
                              aria-label="Increase quantity"
                            >
                              <i className="fa-solid fa-plus" style={{ fontSize: '0.75rem' }}></i>
                            </button>
                          </div>
                          
                          {/* Quick Buttons for Cart Items */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {QUICK_QTYS.map((q) => (
                               <button
                                 key={q}
                                 type="button"
                                 onClick={() => {
                                   setQtyInputTexts(p => ({ ...p, [item.cartItemId]: q.toString() }));
                                   updateQuantity(item.cartItemId, q);
                                 }}
                                 style={{
                                   padding: '2px 6px', fontSize: '0.7rem', borderRadius: '4px',
                                   border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer'
                                 }}
                               >
                                 +{q}
                               </button>
                            ))}
                          </div>
                        </div>

                        <div className="cart-item-actions" style={{ justifyContent: 'space-between' }}>
                          <button
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="cart-item-remove"
                            title="Remove item"
                            style={{ padding: 0 }}
                          >
                            <i className="fa-solid fa-trash-can"></i> Remove
                          </button>
                          <div style={{ fontSize: '0.7rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="fa-solid fa-circle-info"></i> Min: {MIN_ORDER_QUANTITY}
                          </div>
                        </div>
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
            
            {cartTotals?.discountTotal > 0 ? (
              <>
                <div className="cart-summary-row" style={{ fontSize: '0.9rem', color: '#666' }}>
                  <span>Subtotal:</span>
                  <span>{formatPrice(cartTotals.subtotal)}</span>
                </div>
                <div className="cart-summary-row" style={{ fontSize: '0.9rem', color: '#16a34a' }}>
                  <span>Bulk Discount:</span>
                  <span>-{formatPrice(cartTotals.discountTotal)}</span>
                </div>
                <div className="cart-summary-row cart-summary-total">
                  <span>Total:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </>
            ) : (
              <div className="cart-summary-row cart-summary-total">
                <span>Subtotal:</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <span className="cart-currency-badge">{currency === 'INR' ? '₹ INR' : '$ USD'}</span>
            </div>

            {checkoutStep === 1 ? (
              <>
                <DeliveryAccordion cart={cart} products={products} />
                <button
                  onClick={() => setCheckoutStep(2)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  Proceed to Checkout <i className="fa-solid fa-arrow-right"></i>
                </button>
              </>
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
