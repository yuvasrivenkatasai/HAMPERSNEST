const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/ProductDetailTemplate.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// The block to extract and remove from the original location
const blockStartStr = '{/* 4. Customization Available */}';
const blockEndStr = '{/* 11. Related Products */}';

const blockStartIndex = code.indexOf(blockStartStr);
const blockEndIndex = code.indexOf(blockEndStr);

if (blockStartIndex === -1 || blockEndIndex === -1) {
  console.error("Could not find blocks");
  process.exit(1);
}

// Extract the original chunk
// We actually want to replace everything from blockStartStr down to just before `</div>\n        </div>\n\n        {/* 11.`
const searchRegex = /\{\/\* 4\. Customization Available \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\{\/\* 11\. Related Products \*\/\}/;

const replacement = `</div>
        </div>

        {/* --- DESKTOP GRID --- */}
        <div className="product-secondary-info-grid">
          {/* 4. Customization Available */}
          {(() => {
            const custItems = (product.customization && product.customization.length > 0)
              ? product.customization
              : (product.customizationText ? product.customizationText.split('\\n').map(i => i.trim()).filter(Boolean) : []);

            if (custItems.length === 0) return null;

            return (
              <div className="secondary-info-card">
                <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-purple)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem', marginTop: 0 }}>
                  Customization Available:
                </h5>
                <div className="modal-features-grid customization-features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {custItems.map((feat, idx) => (
                    <span key={idx} style={{ fontSize: '0.85rem', color: '#555', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                      <i className="fa-solid fa-check" style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '3px' }}></i> {feat}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* 5. Delivery Information */}
          {(() => {
            const delItems = (product.shipping && product.shipping.length > 0)
              ? product.shipping
              : (product.deliveryInfoText ? product.deliveryInfoText.split('\\n').map(i => i.trim()).filter(Boolean) : []);

            if (delItems.length === 0) return null;

            return (
              <div className="secondary-info-card">
                <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--color-charcoal)' }}>
                  <i className="fa-solid fa-truck" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i> Delivery Information
                </h5>
                {delItems.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5', display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                    <i className="fa-solid fa-truck-fast" style={{ fontSize: '0.75rem', marginTop: '4px', color: '#999' }}></i> {item}
                  </div>
                ))}
              </div>
            );
          })()}

          {/* 6. Personalize Your Hamper */}
          {(product.customGiftTagEnabled !== false || product.addonsEnabled !== false || true) && (
            <div className="secondary-info-card">
              <h3 className="customizer-section-title" style={{ fontSize: '1rem' }}>Personalize Your Hamper</h3>
              
              {product.customGiftTagEnabled !== false && (
                <div className="customizer-row">
                  <label className="customizer-label" htmlFor="gift-tag-msg">
                    Custom Gift Tag Message (Optional)
                  </label>
                  <input
                    type="text"
                    id="gift-tag-msg"
                    className="customizer-input-text"
                    placeholder="e.g. Happy Wedding Sneha & Ajay! / Welcome Home"
                    value={giftTag}
                    onChange={(e) => setGiftTag(e.target.value)}
                  />
                </div>
              )}

              {product.addonsEnabled !== false && (
                <div className="customizer-row" style={{ marginTop: '1rem' }}>
                  <label className="customizer-label" style={{ marginBottom: '8px', display: 'block' }}>
                    Optional Add-ons
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                    {productAddons.map((addon, idx) => (
                      <label key={idx} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', color: '#444' }}>
                        <input
                          type="checkbox"
                          checked={selectedAddOnIndices.includes(idx)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAddOnIndices([...selectedAddOnIndices, idx]);
                            } else {
                              setSelectedAddOnIndices(selectedAddOnIndices.filter(i => i !== idx));
                            }
                          }}
                          style={{ marginRight: '8px', width: '16px', height: '16px', accentColor: 'var(--color-gold)' }}
                        />
                        {addon.name} (+{formatPrice(addon.price)})
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleRequestCustomization}
                className="modal-customize-btn"
                style={{ marginTop: 'auto', width: '100%', paddingTop: '12px', paddingBottom: '12px', alignSelf: 'flex-start' }}
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i> Request Customization
              </button>
            </div>
          )}
        </div>

        {/* 11. Related Products */}`;

if (!searchRegex.test(code)) {
  console.error("Regex did not match");
  process.exit(1);
}

code = code.replace(searchRegex, replacement);

fs.writeFileSync(filePath, code);
console.log("Successfully refactored ProductDetailTemplate.jsx");
