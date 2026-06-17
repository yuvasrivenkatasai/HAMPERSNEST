import React from 'react';
import { useCart } from '../context/CartContext';

export default function FloatingButtons() {
  const { setQuoteModalOpen, settings } = useCart();
  const whatsappNumber = settings?.whatsappNumber;

  return (
    <div className="floating-container-right" style={{ zIndex: 1000 }}>
      {/* Call button */}
      <a href={`tel:+${whatsappNumber}`} className="call-float" aria-label="Quick Call contact">
        <i className="fa-solid fa-phone"></i>
      </a>
      {/* WhatsApp button — opens lead capture form */}
      <button
        onClick={() => setQuoteModalOpen(true)}
        className="whatsapp-float"
        aria-label="Get a free quote on WhatsApp"
        style={{ border: 'none', cursor: 'pointer' }}
      >
        <i className="fa-brands fa-whatsapp"></i>
      </button>
    </div>
  );
}
