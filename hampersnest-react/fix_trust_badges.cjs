const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/ProductDetailTemplate.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to \n for easy replacement
code = code.replace(/\r\n/g, '\n');

// 1. Move Trust Badges below Image Gallery
if (!code.includes('desktop-only" style={{ marginTop: \'1rem\' }}')) {
  code = code.replace(
    `          {/* 1. Product Gallery */}
          <div className="product-detail-visual-wrapper">
            <PremiumProductGallery product={product} />
          </div>`,
    `          {/* 1. Product Gallery */}
          <div className="product-detail-visual-wrapper">
            <PremiumProductGallery product={product} />
            
            <div className="desktop-only" style={{ marginTop: '1rem' }}>
              <div className="product-trust-badges" style={{ marginTop: '0', marginBottom: '0', justifyContent: 'center' }}>
                <div className="trust-badge-item">
                  <i className="fa-solid fa-truck-fast"></i>
                  <span>Fast Shipping</span>
                </div>
                <div className="trust-badge-item">
                  <i className="fa-solid fa-gift"></i>
                  <span>Premium Quality</span>
                </div>
                <div className="trust-badge-item">
                  <i className="fa-solid fa-lock"></i>
                  <span>Secure Packing</span>
                </div>
              </div>
            </div>
          </div>`
  );
}

// 2. Hide original Trust Badges on Desktop
if (!code.includes('<div className="mobile-only">\n              <div className="product-trust-badges"')) {
  code = code.replace(
    `            <div className="product-trust-badges" style={{ marginTop: '5px', marginBottom: '15px' }}>
              <div className="trust-badge-item">
                <i className="fa-solid fa-truck-fast"></i>
                <span>Fast Shipping</span>
              </div>
              <div className="trust-badge-item">
                <i className="fa-solid fa-gift"></i>
                <span>Premium Quality</span>
              </div>
              <div className="trust-badge-item">
                <i className="fa-solid fa-lock"></i>
                <span>Secure Packing</span>
              </div>
            </div>`,
    `            <div className="mobile-only">
              <div className="product-trust-badges" style={{ marginTop: '5px', marginBottom: '15px' }}>
                <div className="trust-badge-item">
                  <i className="fa-solid fa-truck-fast"></i>
                  <span>Fast Shipping</span>
                </div>
                <div className="trust-badge-item">
                  <i className="fa-solid fa-gift"></i>
                  <span>Premium Quality</span>
                </div>
                <div className="trust-badge-item">
                  <i className="fa-solid fa-lock"></i>
                  <span>Secure Packing</span>
                </div>
              </div>
            </div>`
  );
}

// 3. Compact Spacing
code = code.replace(
  `marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa-solid fa-check"`,
  `marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa-solid fa-check"`
);

code = code.replace(
  `className="product-variants-container" style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>`,
  `className="product-variants-container" style={{ marginBottom: '1rem', marginTop: '0.75rem' }}>`
);

code = code.replace(
  `margin: '0 0 12px 0', 
                    color: 'var(--color-purple)'`,
  `margin: '0 0 8px 0', 
                    color: 'var(--color-purple)'`
);

code = code.replace(
  `marginBottom: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'`,
  `marginBottom: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'`
);

code = code.replace(
  `className="action-row-buying" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>`,
  `className="action-row-buying" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>`
);

// Save with native line endings
fs.writeFileSync(filePath, code.replace(/\n/g, require('os').EOL));
console.log("Successfully fixed layout.");
