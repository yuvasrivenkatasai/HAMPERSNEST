import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  // Find current product
  const product = products.find((p) => p.id === id);

  // Customization States
  const [giftTag, setGiftTag] = useState('');
  const [wrappingStyle, setWrappingStyle] = useState('Standard');
  const [ribbonColor, setRibbonColor] = useState('None');
  const [selectedAddOns, setSelectedAddOns] = useState({
    candle: false,
    chocolates: false,
    bottle: false,
    calligraphy: false,
  });
  const [quantity, setQuantity] = useState(1);

  // Accordion Toggles
  const [accordions, setAccordions] = useState({
    inclusions: true,
    specs: false,
    shipping: false,
    faqs: false,
  });

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Reset selections
    setGiftTag('');
    setWrappingStyle('Standard');
    setRibbonColor('None');
    setSelectedAddOns({
      candle: false,
      chocolates: false,
      bottle: false,
      calligraphy: false,
    });
    setQuantity(1);
  }, [id]);

  // IntersectionObserver for scroll animations
  useEffect(() => {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-heading, .reveal-category'
    );
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [id]);


  if (!product) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: 'var(--color-gold)', marginBottom: '1.5rem' }}></i>
        <h2>Product Not Found</h2>
        <p style={{ margin: '1rem 0 2rem 0', color: '#666' }}>The product you are looking for does not exist or has been moved.</p>
        <Link to="/collections" className="btn btn-primary">Back to Collections</Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  // Pricing Rules
  const boxPrices = {
    'Standard': 0,
    'Ivory Lace': 150,
    'Royal Purple Silk': 180,
    'Gold Glare Foil': 220,
  };

  const ribbonPrices = {
    'None': 0,
    'Metallic Gold': 30,
    'Lavender Lace': 40,
    'Royal Violet': 50,
    'Red Velvet': 60,
  };

  const addOnDetails = {
    candle: { name: 'Scented Wax Candle', price: 99 },
    chocolates: { name: 'Extra Chocolates (Pack of 4)', price: 149 },
    bottle: { name: 'Premium Hydration Flask', price: 299 },
    calligraphy: { name: 'Calligraphy Message Card', price: 49 },
  };

  // Calculate Added Price
  const addedPrice = 
    (boxPrices[wrappingStyle] || 0) +
    (ribbonPrices[ribbonColor] || 0) +
    Object.keys(selectedAddOns).reduce((total, key) => {
      return total + (selectedAddOns[key] ? addOnDetails[key].price : 0);
    }, 0);

  const unitPrice = product.price + addedPrice;
  const totalPrice = unitPrice * quantity;

  // Toggle Accordion Section
  const toggleAccordion = (section) => {
    setAccordions((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle Add to Basket
  const handleAddToBasket = (e) => {
    e.preventDefault();
    
    // Gather active add-on names
    const activeAddOns = Object.keys(selectedAddOns)
      .filter((key) => selectedAddOns[key])
      .map((key) => addOnDetails[key].name);

    addToCart(product, quantity, {
      giftTag,
      wrappingStyle,
      ribbonColor,
      addOns: activeAddOns,
      addedPrice,
    });
  };

  // Generate WhatsApp Direct Order Link
  const handleWhatsAppOrder = (e) => {
    e.preventDefault();
    const whatsappBaseNumber = '917989202194';

    // Build custom description
    let detailsStr = `*${product.name}* (Qty: ${quantity})\n`;
    detailsStr += `• Base Price: ₹${product.price} each\n`;
    detailsStr += `• Wrapping: ${wrappingStyle} (+₹${boxPrices[wrappingStyle] || 0})\n`;
    detailsStr += `• Ribbon: ${ribbonColor} (+₹${ribbonPrices[ribbonColor] || 0})\n`;
    
    if (giftTag.trim()) {
      detailsStr += `• Gift Tag Message: "${giftTag.trim()}"\n`;
    }

    const activeAddOns = Object.keys(selectedAddOns)
      .filter((key) => selectedAddOns[key])
      .map((key) => `+ ${addOnDetails[key].name} (₹${addOnDetails[key].price})`);

    if (activeAddOns.length > 0) {
      detailsStr += `• Add-ons:\n   ${activeAddOns.join('\n   ')}\n`;
    }

    detailsStr += `\n*Total Estimated Price:* ₹${totalPrice}`;

    const text = encodeURIComponent(
      `Hi Hampers Nest!\n\nI want to order this customized hamper:\n\n${detailsStr}\n\nPlease confirm availability. Thank you!`
    );

    window.open(`https://api.whatsapp.com/send?phone=${whatsappBaseNumber}&text=${text}`, '_blank');
  };

  // Filter Related Products (Same category, excluding current)
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  // Fallback to featured products if no same-category items
  const displayRelated = relatedProducts.length > 0 
    ? relatedProducts 
    : products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="page-container">
      {/* Breadcrumbs */}
      <div className="breadcrumb-bar">
        <div className="container" style={{ padding: '15px 16px', display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#777' }}>
          <Link to="/" style={{ color: 'var(--color-gold-dark)' }}>Home</Link> / 
          <Link to="/collections" style={{ color: 'var(--color-gold-dark)' }}>Collections</Link> / 
          <span style={{ color: 'var(--color-purple)' }}>{product.name}</span>
        </div>
      </div>

      <div className="container product-detail-section" style={{ paddingTop: '1rem' }}>
        <div className="product-detail-layout-grid">
          
          {/* LEFT COLUMN: Large Image Casing */}
          <div className="product-detail-visual-wrapper">
            <div className="product-image-container-frame">
              <img src={product.image} alt={product.name} className="product-main-zoom-image" />
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`product-detail-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
              </button>
            </div>
            <div className="product-trust-badges">
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

          {/* RIGHT COLUMN: Info, Customizations, Actions */}
          <div className="product-detail-info-wrapper">
            <div className="product-header-block">
              <span className="product-category-tag">{product.category} Collection</span>
              <h1 className="product-detail-title">{product.name}</h1>
              
              <div className="product-rating-row">
                <div className="stars-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i
                      key={i}
                      className={i < Math.floor(product.rating) ? "fa-solid fa-star" : "fa-regular fa-star"}
                    ></i>
                  ))}
                </div>
                <span className="rating-count">({product.rating} Rating / Verified Client Reviews)</span>
              </div>

              <div className="product-price-block">
                <span className="current-price">₹{unitPrice}</span>
                <span className="original-price">₹{Math.round(unitPrice * 1.15)}</span>
                <span className="save-badge">Save 15%</span>
              </div>

              <p className="product-detail-short-desc">{product.description}</p>
            </div>

            {/* Customization Form */}
            <div className="product-customizer-box">
              <h3 className="customizer-section-title">Personalize Your Hamper</h3>

              {/* 1. Custom Gift Tag Message */}
              <div className="customizer-row">
                <label className="customizer-label" htmlFor="gift-tag-msg">
                  Custom Gift Tag Message (Optional)
                </label>
                <input
                  type="text"
                  id="gift-tag-msg"
                  className="customizer-input-text"
                  placeholder="e.g., Happy Wedding Sneha & Ajay! / Welcome Home"
                  value={giftTag}
                  onChange={(e) => setGiftTag(e.target.value)}
                />
              </div>

              {/* 2. Wrapping Style Dropdown */}
              <div className="customizer-row-split">
                <div className="customizer-column">
                  <label className="customizer-label" htmlFor="wrap-style">
                    Wrapping Style
                  </label>
                  <select
                    id="wrap-style"
                    className="customizer-select"
                    value={wrappingStyle}
                    onChange={(e) => setWrappingStyle(e.target.value)}
                  >
                    <option value="Standard">Standard (Eco-craft box) - Free</option>
                    <option value="Ivory Lace">Premium Ivory Lace (+₹150)</option>
                    <option value="Royal Purple Silk">Royal Purple Silk (+₹180)</option>
                    <option value="Gold Glare Foil">Gold Glare Foil (+₹220)</option>
                  </select>
                </div>

                {/* 3. Ribbon Color Dropdown */}
                <div className="customizer-column">
                  <label className="customizer-label" htmlFor="ribbon-color">
                    Satin Ribbon Color
                  </label>
                  <select
                    id="ribbon-color"
                    className="customizer-select"
                    value={ribbonColor}
                    onChange={(e) => setRibbonColor(e.target.value)}
                  >
                    <option value="None">None (Default Jute Rope) - Free</option>
                    <option value="Metallic Gold">Metallic Gold (+₹30)</option>
                    <option value="Lavender Lace">Lavender Lace (+₹40)</option>
                    <option value="Royal Violet">Royal Violet Silk (+₹50)</option>
                    <option value="Red Velvet">Red Velvet Ribbon (+₹60)</option>
                  </select>
                </div>
              </div>

              {/* 4. Add-ons Checkboxes */}
              <div className="customizer-row" style={{ marginTop: '1.2rem' }}>
                <label className="customizer-label">Enhance with Add-ons (Optional)</label>
                <div className="addons-grid-check">
                  {Object.keys(addOnDetails).map((key) => (
                    <label key={key} className={`addon-checkbox-card ${selectedAddOns[key] ? 'active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedAddOns[key]}
                        onChange={(e) =>
                          setSelectedAddOns((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                      />
                      <span className="addon-name">{addOnDetails[key].name}</span>
                      <span className="addon-price">+₹{addOnDetails[key].price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quantity Selector and Purchase Actions */}
              <div className="action-row-buying">
                <div className="qty-picker-detail">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToBasket}
                  className="btn btn-primary buy-btn-cart"
                  style={{ flex: 1, height: '48px', padding: 0 }}
                >
                  Add To Basket <i className="fa-solid fa-cart-shopping" style={{ marginLeft: '6px' }}></i>
                </button>
              </div>

              {/* WhatsApp Checkout Button */}
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="btn btn-whatsapp buy-btn-whatsapp"
                style={{ width: '100%', height: '48px', marginTop: '0.8rem', padding: 0 }}
              >
                <i className="fa-brands fa-whatsapp" style={{ marginRight: '6px', fontSize: '1.2rem' }}></i> Order via WhatsApp
              </button>
            </div>

            {/* Accordion Tabs */}
            <div className="product-accordions-group">
              
              {/* Inclusions */}
              <div className={`accordion-item ${accordions.inclusions ? 'open' : ''}`}>
                <button className="accordion-header" onClick={() => toggleAccordion('inclusions')}>
                  <span>Hamper Inclusions</span>
                  <i className={`fa-solid ${accordions.inclusions ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </button>
                {accordions.inclusions && (
                  <div className="accordion-content">
                    <ul className="details-list-check">
                      {product.details.map((detail, idx) => (
                        <li key={idx}>
                          <i className="fa-solid fa-check text-gold"></i> {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Specifications */}
              <div className={`accordion-item ${accordions.specs ? 'open' : ''}`}>
                <button className="accordion-header" onClick={() => toggleAccordion('specs')}>
                  <span>Specifications</span>
                  <i className={`fa-solid ${accordions.specs ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </button>
                {accordions.specs && (
                  <div className="accordion-content">
                    <table className="specs-table">
                      <tbody>
                        <tr>
                          <td><strong>Category</strong></td>
                          <td>{product.category} Return Gift Hamper</td>
                        </tr>
                        <tr>
                          <td><strong>Box Dimensions</strong></td>
                          <td>12" x 10" x 4.5" (Premium Rigid Board)</td>
                        </tr>
                        <tr>
                          <td><strong>Weight</strong></td>
                          <td>Approx. 1.2 kg per box</td>
                        </tr>
                        <tr>
                          <td><strong>Edible Shelf Life</strong></td>
                          <td>60-90 Days (Chocolates & Dry Fruits)</td>
                        </tr>
                        <tr>
                          <td><strong>Storage</strong></td>
                          <td>Store dry items in a cool, dry place. Keep brass away from direct water.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Shipping & Delivery */}
              <div className={`accordion-item ${accordions.shipping ? 'open' : ''}`}>
                <button className="accordion-header" onClick={() => toggleAccordion('shipping')}>
                  <span>Shipping & Delivery</span>
                  <i className={`fa-solid ${accordions.shipping ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </button>
                {accordions.shipping && (
                  <div className="accordion-content">
                    <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--color-charcoal)' }}>
                      • <strong>Hyderabad Delivery:</strong> Hand-delivery is available within Hyderabad city limits. Same-day delivery can be arranged for select ready hampers.
                      <br />
                      • <strong>Pan-India Shipping:</strong> We ship to all major cities across India via premium courier partners (Delhivery, BlueDart). Delivery usually takes 4-7 business days depending on the location.
                      <br />
                      • <strong>Bulk Delivery:</strong> For bulk orders above 50 units, custom logistics and doorstep delivery can be scheduled.
                    </p>
                  </div>
                )}
              </div>

              {/* FAQs */}
              <div className={`accordion-item ${accordions.faqs ? 'open' : ''}`}>
                <button className="accordion-header" onClick={() => toggleAccordion('faqs')}>
                  <span>Frequently Asked Questions</span>
                  <i className={`fa-solid ${accordions.faqs ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </button>
                {accordions.faqs && (
                  <div className="accordion-content">
                    <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--color-charcoal)' }}>
                      <strong>Q: Can I replace items in the hamper?</strong>
                      <br />
                      A: Yes! Please contact us via WhatsApp to customize the specific items inside any hamper.
                      <br /><br />
                      <strong>Q: Do you offer bulk discounts?</strong>
                      <br />
                      A: Yes, we offer special pricing tiers for corporate orders and weddings exceeding 25 units.
                      <br /><br />
                      <strong>Q: Can you print our wedding logo on the box?</strong>
                      <br />
                      A: Yes, we provide custom logo embossing and printing options for bulk orders.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* RELATED PRODUCTS */}
        <div className="related-products-section" style={{ marginTop: '3rem', borderTop: '1px solid var(--color-beige)', paddingTop: '2.5rem' }}>
          <span className="section-subtitle">Customers also viewed</span>
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Related Hampers</h2>
          
          <div className="collections-grid">
            {displayRelated.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>

        {/* SEO Related Keywords Grid Section */}
        <div className="collections-seo-keywords-section" style={{ marginTop: '2.5rem', borderTop: '1px solid var(--color-beige)', paddingTop: '2.5rem' }}>
          <h4 className="seo-keywords-title">Related Gifting Searches</h4>
          <div className="seo-keywords-grid">
            <div className="seo-keywords-col">
              <h5>Occasions</h5>
              <ul>
                <li><Link to="/collections?category=Wedding" className="seo-keyword-link">Wedding Return Gifts Hyderabad</Link></li>
                <li><Link to="/collections?category=Baby%20Shower" className="seo-keyword-link">Premium Baby Shower Gift Curations</Link></li>
                <li><Link to="/collections?category=Housewarming" className="seo-keyword-link">Housewarming Ceremony Hampers</Link></li>
                <li><Link to="/collections?category=Customized" className="seo-keyword-link">Custom Birthday & Anniversary Boxes</Link></li>
              </ul>
            </div>
            <div className="seo-keywords-col">
              <h5>Gift Styles</h5>
              <ul>
                <li><Link to="/collections?category=Brass" className="seo-keyword-link">Traditional Brass Item Return Gifts</Link></li>
                <li><Link to="/collections?category=Customized" className="seo-keyword-link">Curated Luxury Dry Fruit Hampers</Link></li>
                <li><Link to="/collections?category=Corporate" className="seo-keyword-link">Premium Corporate Gift Sets</Link></li>
                <li><Link to="/collections?category=Customized" className="seo-keyword-link">Handmade Gourmet Chocolate Trays</Link></li>
              </ul>
            </div>
            <div className="seo-keywords-col">
              <h5>Customization options</h5>
              <ul>
                <li><Link to="/collections" className="seo-keyword-link">Premium Ivory Lace Wrapping</Link></li>
                <li><Link to="/collections" className="seo-keyword-link">Royal Purple Silk Box Covers</Link></li>
                <li><Link to="/collections" className="seo-keyword-link">Personalized Gift Tags & Message Cards</Link></li>
                <li><Link to="/collections" className="seo-keyword-link">Enhancing Scented Wax Candle Add-ons</Link></li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
