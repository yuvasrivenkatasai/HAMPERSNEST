const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/ProductDetailTemplate.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// FIX MISSING DIV (if present)
if (code.includes(`              </div>\n          </div>\n        </div>\n\n        {/* --- DESKTOP GRID --- */}`)) {
  code = code.replace(
    `              </div>\n          </div>\n        </div>\n\n        {/* --- DESKTOP GRID --- */}`,
    `              </div>\n            </div>\n          </div>\n        </div>\n\n        {/* --- DESKTOP GRID --- */}`
  );
}

// 2. Add Trust Badges to Left Column (Desktop Only)
if (!code.includes(`desktop-only" style={{ marginTop: '1rem' }}`)) {
  code = code.replace(
    `          {/* 1. Product Gallery */}\n          <div className="product-detail-visual-wrapper">\n            <PremiumProductGallery product={product} />\n          </div>`,
    `          {/* 1. Product Gallery */}\n          <div className="product-detail-visual-wrapper">\n            <PremiumProductGallery product={product} />\n            <div className="desktop-only" style={{ marginTop: '1rem' }}>\n              <div className="product-trust-badges" style={{ marginTop: '0', marginBottom: '0', justifyContent: 'center' }}>\n                <div className="trust-badge-item">\n                  <i className="fa-solid fa-truck-fast"></i>\n                  <span>Fast Shipping</span>\n                </div>\n                <div className="trust-badge-item">\n                  <i className="fa-solid fa-gift"></i>\n                  <span>Premium Quality</span>\n                </div>\n                <div className="trust-badge-item">\n                  <i className="fa-solid fa-lock"></i>\n                  <span>Secure Packing</span>\n                </div>\n              </div>\n            </div>\n          </div>`
  );
}

// 3. Wrap right-column Trust Badges in mobile-only
if (!code.includes(`<div className="mobile-only">\n              <div className="product-trust-badges"`)) {
  code = code.replace(
    `            <div className="product-trust-badges" style={{ marginTop: '5px', marginBottom: '15px' }}>\n              <div className="trust-badge-item">\n                <i className="fa-solid fa-truck-fast"></i>\n                <span>Fast Shipping</span>\n              </div>\n              <div className="trust-badge-item">\n                <i className="fa-solid fa-gift"></i>\n                <span>Premium Quality</span>\n              </div>\n              <div className="trust-badge-item">\n                <i className="fa-solid fa-lock"></i>\n                <span>Secure Packing</span>\n              </div>\n            </div>`,
    `            <div className="mobile-only">\n              <div className="product-trust-badges" style={{ marginTop: '5px', marginBottom: '15px' }}>\n                <div className="trust-badge-item">\n                  <i className="fa-solid fa-truck-fast"></i>\n                  <span>Fast Shipping</span>\n                </div>\n                <div className="trust-badge-item">\n                  <i className="fa-solid fa-gift"></i>\n                  <span>Premium Quality</span>\n                </div>\n                <div className="trust-badge-item">\n                  <i className="fa-solid fa-lock"></i>\n                  <span>Secure Packing</span>\n                </div>\n              </div>\n            </div>`
  );
}

// 4. Compact the spacing (reduce margins by ~20-30%)
code = code.replace(
  `marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>\n                <i className="fa-solid fa-check"`,
  `marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>\n                <i className="fa-solid fa-check"`
);

code = code.replace(
  `className="product-variants-container" style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>`,
  `className="product-variants-container" style={{ marginBottom: '1rem', marginTop: '0.75rem' }}>`
);

code = code.replace(
  `margin: '0 0 12px 0', \n                    color: 'var(--color-purple)'`,
  `margin: '0 0 8px 0', \n                    color: 'var(--color-purple)'`
);

code = code.replace(
  `marginBottom: '1.5rem',\n                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'`,
  `marginBottom: '1rem',\n                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'`
);

code = code.replace(
  `className="action-row-buying" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>`,
  `className="action-row-buying" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>`
);

fs.writeFileSync(filePath, code);
console.log("Successfully applied all optimizations correctly.");
