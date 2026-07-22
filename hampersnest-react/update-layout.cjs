const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailTemplate.jsx', 'utf8');

const startMarker = '<div className="product-customizer-box">';
const endMarker = '          </div>\n        </div>\n\n        {/* 11. Related Products */}';

const startIndex = code.indexOf(startMarker);
const customizerBoxEnd = code.indexOf(endMarker);

if (startIndex === -1 || customizerBoxEnd === -1) {
  console.log('Markers not found');
  process.exit(1);
}

const newCustomizerBox = `<div className="product-customizer-box">

              <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-charcoal)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa-solid fa-box-open" style={{ color: 'var(--color-gold)' }}></i> Minimum Order Quantity: 5 Pieces
              </div>

              {settings?.bulkDiscountSettings?.enabled && settings.bulkDiscountSettings.rules?.length > 0 && (
                <div style={{
                  background: '#F9FAFB',
                  border: '1px solid var(--color-gold-light)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}>
                  <h4 style={{ 
                    margin: '0 0 12px 0', 
                    color: 'var(--color-purple)', 
                    fontSize: '0.95rem',
                    textAlign: 'center'
                  }}>
                    {settings.bulkDiscountSettings.heading || '🎉 Bulk Order Discounts'}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px dashed var(--color-beige)', borderBottom: '1px dashed var(--color-beige)', padding: '12px 0', margin: '0 0 12px 0' }}>
                    {[...settings.bulkDiscountSettings.rules].sort((a,b) => a.minQty - b.minQty).map((rule, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4B5563' }}>{rule.minQty}+ Pieces</span>
                        <span style={{ 
                          background: 'var(--color-gold-light)', 
                          color: 'var(--color-gold-dark)', 
                          padding: '2px 10px', 
                          borderRadius: '12px', 
                          fontSize: '0.75rem', 
                          fontWeight: 700 
                        }}>SAVE {rule.discountPercent}%</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>
                    {settings.bulkDiscountSettings.footerNote || '✓ Automatically applied at checkout.'}
                  </p>
                </div>
              )}

              <div className="action-row-buying" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div className="qty-picker-detail" style={{ height: '48px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(5, quantity - 1))}
                    disabled={effectiveStock === 0 || quantity <= 5}
                    aria-label="Decrease quantity"
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                  <span className="qty-value">{effectiveStock === 0 ? 0 : quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={effectiveStock === 0 || quantity >= effectiveStock}
                    aria-label="Increase quantity"
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToBasket}
                  disabled={effectiveStock === 0}
                  className="btn btn-primary buy-btn-cart"
                  style={{ 
                    flex: 1, 
                    height: '48px', 
                    padding: 0, 
                    minWidth: '150px',
                    background: effectiveStock === 0 ? '#CBD5E1' : 'var(--gold-gradient)',
                    borderColor: effectiveStock === 0 ? '#CBD5E1' : 'var(--color-gold)',
                    color: effectiveStock === 0 ? '#64748B' : 'var(--color-white)',
                    cursor: effectiveStock === 0 ? 'not-allowed' : 'pointer',
                    boxShadow: effectiveStock === 0 ? 'none' : 'var(--shadow-gold)'
                  }}
                >
                  {effectiveStock === 0 ? (
                    'Out of Stock'
                  ) : (
                    <>Add To Cart <i className="fa-solid fa-cart-shopping" style={{ marginLeft: '6px' }}></i></>
                  )}
                </button>

                <WishlistButton productId={product.id} style={{ width: '48px', height: '48px', flexShrink: 0 }} />
              </div>

              {/* Customization Available */}
              {(() => {
                const custItems = (product.customization && product.customization.length > 0)
                  ? product.customization
                  : (product.customizationText ? product.customizationText.split('\\n').map(i => i.trim()).filter(Boolean) : []);

                if (custItems.length === 0) return null;

                return (
                  <div style={{ paddingBottom: '0.8rem', borderBottom: '1px solid var(--color-beige)', marginBottom: '1rem' }}>
                    <h5 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-purple)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                      Customization Available:
                    </h5>
                    <div className="modal-features-grid customization-features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {custItems.map((feat, idx) => (
                        <span key={idx} style={{ fontSize: '0.85rem', color: '#555', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                          <i className="fa-solid fa-check" style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '3px' }}></i> {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Delivery Information */}
              {(() => {
                const delItems = (product.shipping && product.shipping.length > 0)
                  ? product.shipping
                  : (product.deliveryInfoText ? product.deliveryInfoText.split('\\n').map(i => i.trim()).filter(Boolean) : []);

                if (delItems.length === 0) return null;

                return (
                  <div style={{ padding: '0.85rem', background: '#F8F9FA', borderRadius: '8px', border: '1px solid #E9ECEF', marginBottom: '1.5rem' }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--color-charcoal)' }}>
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

              <h3 className="customizer-section-title">Personalize Your Hamper</h3>

              {/* Gift Tag Message */}
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

              {/* Add-ons */}
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

              {/* Request Customization Button */}
              <button
                type="button"
                onClick={handleRequestCustomization}
                className="modal-customize-btn"
                style={{ marginTop: '1.5rem', width: '100%' }}
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i> Request Customization
              </button>

            </div>
`;

const newCode = code.substring(0, startIndex) + newCustomizerBox + code.substring(customizerBoxEnd);
fs.writeFileSync('src/components/ProductDetailTemplate.jsx', newCode);
console.log('Update successful');
