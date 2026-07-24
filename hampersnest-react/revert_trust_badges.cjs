const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/ProductDetailTemplate.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to \n
code = code.replace(/\r\n/g, '\n');

// 1. Remove the left column trust badges (Desktop Only)
const leftColumnBadges = `<div className="desktop-only" style={{ marginTop: '1rem' }}>
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
            </div>`;

code = code.replace(leftColumnBadges, '');

// Clean up extra whitespace if left behind
code = code.replace(`          {/* 1. Product Gallery */}
          <div className="product-detail-visual-wrapper">
            <PremiumProductGallery product={product} />
            
            
          </div>`, 
`          {/* 1. Product Gallery */}
          <div className="product-detail-visual-wrapper">
            <PremiumProductGallery product={product} />
          </div>`);

// 2. Remove mobile-only wrapper from right column trust badges
const mobileOnlyBadges = `<div className="mobile-only">
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
            </div>`;

const originalBadges = `<div className="product-trust-badges" style={{ marginTop: '5px', marginBottom: '15px' }}>
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
            </div>`;

code = code.replace(mobileOnlyBadges, originalBadges);

// Save with native line endings
fs.writeFileSync(filePath, code.replace(/\n/g, require('os').EOL));
console.log("Successfully reverted trust badges position.");
