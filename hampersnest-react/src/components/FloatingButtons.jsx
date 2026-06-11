import React from 'react';

export default function FloatingButtons() {
  const handleWhatsappFloat = (e) => {
    e.preventDefault();
    const whatsappBaseNumber = '917989202194';
    const welcomeText = encodeURIComponent('Hi Hampers Nest! I am interested in viewing your customized Return Gifts collection and getting a catalog.');
    window.open(`https://api.whatsapp.com/send?phone=${whatsappBaseNumber}&text=${welcomeText}`, '_blank');
  };

  return (
    <div className="floating-container-right" style={{ zIndex: 1000 }}>
      {/* Call button */}
      <a href="tel:+917989202194" className="call-float" aria-label="Quick Call contact">
        <i className="fa-solid fa-phone"></i>
      </a>
      {/* WhatsApp button */}
      <button
        onClick={handleWhatsappFloat}
        className="whatsapp-float"
        aria-label="Quick WhatsApp chat"
        style={{ border: 'none', cursor: 'pointer' }}
      >
        <i className="fa-brands fa-whatsapp"></i>
      </button>
    </div>
  );
}
