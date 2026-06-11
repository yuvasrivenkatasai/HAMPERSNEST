/* ==========================================
   HAMPERS NEST — CART ENGINE
   Cart, Wishlist, Product Modal, WhatsApp Checkout
   ========================================== */

(function () {
  'use strict';

  /* -------- STATE -------- */
  let cart = [];
  let wishlist = [];
  let currentProductId = null;
  let currentQty = 1;
  let currentCustomizations = [];

  /* -------- PERSIST -------- */
  function saveCart() {
    localStorage.setItem('hn_cart', JSON.stringify(cart));
  }
  function loadCart() {
    try { cart = JSON.parse(localStorage.getItem('hn_cart')) || []; } catch (e) { cart = []; }
  }
  function saveWishlist() {
    localStorage.setItem('hn_wishlist', JSON.stringify(wishlist));
  }
  function loadWishlist() {
    try { wishlist = JSON.parse(localStorage.getItem('hn_wishlist')) || []; } catch (e) { wishlist = []; }
  }

  /* -------- CART ACTIONS -------- */
  function addToCart(productId, qty, customizations) {
    qty = qty || 1;
    customizations = customizations || [];
    const product = hn_getProduct(productId);
    if (!product) return;
    const existing = cart.find(i => i.id === productId);
    if (existing) {
      existing.qty += qty;
      existing.customizations = customizations.length ? customizations : existing.customizations;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        image: product.images[0],
        price_inr: product.price_inr,
        price_usd: product.price_usd,
        qty: qty,
        customizations: customizations
      });
    }
    saveCart();
    updateCartBadge();
    renderCartDrawer();
    animateCartBadge();
    showMiniToast(`"${product.name}" added to cart!`);
  }

  function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    updateCartBadge();
    renderCartDrawer();
  }

  function updateQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    saveCart();
    updateCartBadge();
    renderCartDrawer();
  }

  function clearCart() {
    cart = [];
    saveCart();
    updateCartBadge();
    renderCartDrawer();
  }

  function getCartTotals() {
    const items = cart.reduce((s, i) => s + i.qty, 0);
    const totalINR = cart.reduce((s, i) => s + i.price_inr * i.qty, 0);
    const totalUSD = cart.reduce((s, i) => s + i.price_usd * i.qty, 0);
    return { items, totalINR, totalUSD };
  }

  /* -------- CART BADGE -------- */
  function updateCartBadge() {
    const { items } = getCartTotals();
    document.querySelectorAll('.hn-cart-badge').forEach(el => {
      el.textContent = items;
      el.style.display = items > 0 ? 'flex' : 'none';
    });
  }

  function animateCartBadge() {
    document.querySelectorAll('.hn-cart-badge').forEach(el => {
      el.classList.remove('hn-bounce');
      void el.offsetWidth;
      el.classList.add('hn-bounce');
    });
  }

  /* -------- CART DRAWER -------- */
  function openCartDrawer() {
    const drawer = document.getElementById('hn-cart-drawer');
    const overlay = document.getElementById('hn-cart-overlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCartDrawer();
  }

  function closeCartDrawer() {
    const drawer = document.getElementById('hn-cart-drawer');
    const overlay = document.getElementById('hn-cart-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderCartDrawer() {
    const list = document.getElementById('hn-cart-list');
    const summary = document.getElementById('hn-cart-summary');
    if (!list) return;

    if (cart.length === 0) {
      list.innerHTML = `
        <div class="hn-cart-empty">
          <div class="hn-cart-empty-icon"><i class="fa-solid fa-cart-shopping"></i></div>
          <p>Your cart is empty</p>
          <small>Add some luxury hampers to get started!</small>
        </div>`;
      if (summary) summary.innerHTML = '';
      return;
    }

    list.innerHTML = cart.map(item => `
      <div class="hn-cart-item" data-id="${item.id}">
        <div class="hn-cart-item-img">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="hn-cart-item-info">
          <h4>${item.name}</h4>
          ${item.customizations && item.customizations.length ? `<p class="hn-cart-item-custom">${item.customizations.slice(0,2).join(', ')}${item.customizations.length > 2 ? '...' : ''}</p>` : ''}
          <div class="hn-cart-item-prices">
            <span class="hn-price-inr">${hn_formatINR(item.price_inr * item.qty)}</span>
            <span class="hn-price-usd">$${item.price_usd * item.qty} USD</span>
          </div>
          <div class="hn-qty-controls">
            <button class="hn-qty-btn hn-qty-dec" data-id="${item.id}">−</button>
            <span class="hn-qty-val">${item.qty}</span>
            <button class="hn-qty-btn hn-qty-inc" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="hn-cart-remove" data-id="${item.id}" aria-label="Remove item">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join('');

    const { items, totalINR, totalUSD } = getCartTotals();
    if (summary) {
      summary.innerHTML = `
        <div class="hn-cart-totals">
          <div class="hn-cart-total-row">
            <span>${items} Item${items !== 1 ? 's' : ''}</span>
            <span>${hn_formatINR(totalINR)}</span>
          </div>
          <div class="hn-cart-total-row hn-cart-total-usd">
            <span>Total USD</span>
            <span>$${totalUSD} USD</span>
          </div>
          <div class="hn-cart-total-row hn-cart-shipping">
            <span><i class="fa-solid fa-truck"></i> Shipping</span>
            <span>Pan India</span>
          </div>
        </div>
        <button class="hn-btn-checkout" id="hn-checkout-btn">
          <i class="fa-brands fa-whatsapp"></i> Proceed to Order
        </button>
        <button class="hn-btn-clear-cart" id="hn-clear-cart-btn">Clear Cart</button>
      `;
    }

    // Bind cart item events
    list.querySelectorAll('.hn-cart-remove').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });
    list.querySelectorAll('.hn-qty-dec').forEach(btn => {
      btn.addEventListener('click', () => updateQty(btn.dataset.id, -1));
    });
    list.querySelectorAll('.hn-qty-inc').forEach(btn => {
      btn.addEventListener('click', () => updateQty(btn.dataset.id, 1));
    });
    const checkoutBtn = document.getElementById('hn-checkout-btn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', openCustomerForm);
    const clearBtn = document.getElementById('hn-clear-cart-btn');
    if (clearBtn) clearBtn.addEventListener('click', clearCart);
  }

  /* -------- WISHLIST -------- */
  function toggleWishlist(productId) {
    const idx = wishlist.indexOf(productId);
    if (idx === -1) {
      wishlist.push(productId);
      showMiniToast('Added to wishlist ♥');
    } else {
      wishlist.splice(idx, 1);
      showMiniToast('Removed from wishlist');
    }
    saveWishlist();
    updateWishlistBadge();
    updateHeartIcons();
    renderWishlistDrawer();
  }

  function isWishlisted(productId) {
    return wishlist.includes(productId);
  }

  function updateWishlistBadge() {
    document.querySelectorAll('.hn-wishlist-badge').forEach(el => {
      el.textContent = wishlist.length;
      el.style.display = wishlist.length > 0 ? 'flex' : 'none';
    });
  }

  function updateHeartIcons() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      const id = btn.dataset.productId;
      if (id) {
        const icon = btn.querySelector('i');
        if (icon) {
          icon.className = isWishlisted(id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        }
        btn.classList.toggle('wishlisted', isWishlisted(id));
      }
    });
  }

  function openWishlistDrawer() {
    const drawer = document.getElementById('hn-wishlist-drawer');
    const overlay = document.getElementById('hn-wishlist-overlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderWishlistDrawer();
  }

  function closeWishlistDrawer() {
    const drawer = document.getElementById('hn-wishlist-drawer');
    const overlay = document.getElementById('hn-wishlist-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderWishlistDrawer() {
    const list = document.getElementById('hn-wishlist-list');
    if (!list) return;
    if (wishlist.length === 0) {
      list.innerHTML = `
        <div class="hn-cart-empty">
          <div class="hn-cart-empty-icon"><i class="fa-regular fa-heart"></i></div>
          <p>Your wishlist is empty</p>
          <small>Save items you love for later!</small>
        </div>`;
      return;
    }
    list.innerHTML = wishlist.map(id => {
      const p = hn_getProduct(id);
      if (!p) return '';
      return `
        <div class="hn-wishlist-item" data-id="${p.id}">
          <div class="hn-cart-item-img">
            <img src="${p.images[0]}" alt="${p.name}">
          </div>
          <div class="hn-cart-item-info">
            <h4>${p.name}</h4>
            <div class="hn-cart-item-prices">
              <span class="hn-price-inr">${hn_formatINR(p.price_inr)}</span>
              <span class="hn-price-usd">$${p.price_usd} USD</span>
            </div>
          </div>
          <div class="hn-wishlist-item-actions">
            ${p.priceOnRequest
              ? `<button class="hn-btn-request-sm hn-wl-request" data-id="${p.id}">Request Quote</button>`
              : `<button class="hn-btn-atc-sm hn-wl-atc" data-id="${p.id}"><i class="fa-solid fa-cart-shopping"></i></button>`
            }
            <button class="hn-cart-remove hn-wl-remove" data-id="${p.id}" aria-label="Remove from wishlist">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>`;
    }).join('');

    list.querySelectorAll('.hn-wl-atc').forEach(btn => {
      btn.addEventListener('click', () => { addToCart(btn.dataset.id, 1, []); });
    });
    list.querySelectorAll('.hn-wl-request').forEach(btn => {
      btn.addEventListener('click', () => { requestQuote(btn.dataset.id); });
    });
    list.querySelectorAll('.hn-wl-remove').forEach(btn => {
      btn.addEventListener('click', () => { toggleWishlist(btn.dataset.id); });
    });
  }

  /* -------- PRODUCT MODAL -------- */
  function openProductModal(productId) {
    const product = hn_getProduct(productId);
    if (!product) return;
    currentProductId = productId;
    currentQty = 1;
    currentCustomizations = [];

    const modal = document.getElementById('hn-product-modal');
    const overlay = document.getElementById('hn-modal-overlay');
    if (!modal) return;

    // Stock badge
    const stockClass = { 'in-stock': 'hn-stock-in', 'limited': 'hn-stock-limited', 'made-to-order': 'hn-stock-mto' }[product.availability] || 'hn-stock-in';
    const stockLabel = { 'in-stock': '✓ In Stock', 'limited': '⚠ Limited Stock', 'made-to-order': '⏳ Made To Order' }[product.availability] || 'In Stock';

    // Customization checkboxes
    const custHtml = product.customizable ? `
      <div class="hn-customization-options">
        <h5>Customization Options</h5>
        ${product.customizationOptions.map(opt => `
          <label class="hn-custom-checkbox">
            <input type="checkbox" value="${opt}" class="hn-custom-check">
            <span class="hn-custom-checkmark"></span>
            ${opt}
          </label>
        `).join('')}
      </div>` : '';

    // CTA buttons
    const ctaHtml = product.priceOnRequest
      ? `<button class="hn-btn-request" onclick="hnRequestQuote('${product.id}')"><i class="fa-brands fa-whatsapp"></i> Request Quote</button>`
      : `
        <div class="hn-modal-cta-row">
          <button class="hn-btn-atc" id="hn-modal-atc"><i class="fa-solid fa-cart-shopping"></i> Add To Cart</button>
          <button class="hn-btn-whatsapp" id="hn-modal-wa"><i class="fa-brands fa-whatsapp"></i> Order on WhatsApp</button>
        </div>`;

    // Related products
    const related = hn_getRelated(product);
    const relatedHtml = related.length ? `
      <div class="hn-related">
        <h4>You May Also Like</h4>
        <div class="hn-related-grid">
          ${related.map(r => `
            <div class="hn-related-card" data-id="${r.id}">
              <div class="hn-related-img"><img src="${r.images[0]}" alt="${r.name}"></div>
              <h5>${r.name}</h5>
              <p class="hn-price-inr">${hn_formatINR(r.price_inr)}</p>
              <p class="hn-price-usd">$${r.price_usd} USD</p>
              <button class="hn-related-view" data-id="${r.id}">View Details</button>
            </div>
          `).join('')}
        </div>
      </div>` : '';

    modal.innerHTML = `
      <div class="hn-modal-inner">
        <button class="hn-modal-close" id="hn-modal-close"><i class="fa-solid fa-xmark"></i></button>

        <div class="hn-modal-body">
          <!-- LEFT: Image -->
          <div class="hn-modal-gallery">
            <div class="hn-modal-main-img">
              <img src="${product.images[0]}" alt="${product.name}" id="hn-modal-main-img">
            </div>
          </div>

          <!-- RIGHT: Info -->
          <div class="hn-modal-info">
            <div class="hn-modal-badges">
              <span class="hn-category-badge">${product.category}</span>
              <span class="hn-stock-badge ${stockClass}">${stockLabel}</span>
            </div>
            <h2 class="hn-modal-title">${product.name}</h2>

            ${product.priceOnRequest ? `
              <div class="hn-modal-price">
                <span class="hn-price-por">Price On Request</span>
              </div>
            ` : `
              <div class="hn-modal-price">
                <span class="hn-price-main">${hn_formatINR(product.price_inr)}</span>
                <span class="hn-price-usd-large">≈ $${product.price_usd} USD</span>
              </div>
            `}

            <p class="hn-modal-short-desc">${product.description}</p>

            <!-- Qty selector (only if not price-on-request) -->
            ${!product.priceOnRequest ? `
              <div class="hn-modal-qty-row">
                <span>Quantity</span>
                <div class="hn-qty-stepper">
                  <button class="hn-qty-btn" id="hn-qty-dec">−</button>
                  <span class="hn-qty-val" id="hn-qty-display">1</span>
                  <button class="hn-qty-btn" id="hn-qty-inc">+</button>
                </div>
              </div>
            ` : ''}

            ${ctaHtml}

            <!-- Share -->
            <button class="hn-share-btn" id="hn-share-btn">
              <i class="fa-solid fa-share-nodes"></i> Share Product
            </button>
            <span class="hn-share-tooltip" id="hn-share-tooltip">Link copied!</span>

            <!-- Trust badges -->
            <div class="hn-trust-badges">
              <div class="hn-trust-badge"><i class="fa-solid fa-truck"></i><span>Pan India Shipping</span></div>
              <div class="hn-trust-badge"><i class="fa-solid fa-hand-sparkles"></i><span>Handcrafted</span></div>
              <div class="hn-trust-badge"><i class="fa-solid fa-clock"></i><span>${product.shippingTime}</span></div>
              <div class="hn-trust-badge"><i class="fa-solid fa-star"></i><span>Premium Quality</span></div>
            </div>

            <!-- Tabs -->
            <div class="hn-tabs">
              <div class="hn-tab-headers">
                <button class="hn-tab-btn active" data-tab="description">Description</button>
                ${product.customizable ? `<button class="hn-tab-btn" data-tab="customization">Customization</button>` : ''}
                <button class="hn-tab-btn" data-tab="shipping">Shipping</button>
                <button class="hn-tab-btn" data-tab="care">Care</button>
              </div>
              <div class="hn-tab-contents">
                <div class="hn-tab-panel active" data-panel="description">
                  <p>${product.longDescription}</p>
                </div>
                ${product.customizable ? `
                  <div class="hn-tab-panel" data-panel="customization">
                    ${custHtml}
                    <p style="margin-top:12px;font-size:0.88rem;color:#888">${product.customizationInfo}</p>
                  </div>` : ''}
                <div class="hn-tab-panel" data-panel="shipping">
                  <p>${product.shippingInfo}</p>
                </div>
                <div class="hn-tab-panel" data-panel="care">
                  <p>${product.careInstructions}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Products -->
        ${relatedHtml}
      </div>
    `;

    modal.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Bind close
    document.getElementById('hn-modal-close').addEventListener('click', closeProductModal);

    // Qty controls
    const qtyDec = document.getElementById('hn-qty-dec');
    const qtyInc = document.getElementById('hn-qty-inc');
    const qtyDisplay = document.getElementById('hn-qty-display');
    if (qtyDec) qtyDec.addEventListener('click', () => {
      currentQty = Math.max(1, currentQty - 1);
      if (qtyDisplay) qtyDisplay.textContent = currentQty;
    });
    if (qtyInc) qtyInc.addEventListener('click', () => {
      currentQty++;
      if (qtyDisplay) qtyDisplay.textContent = currentQty;
    });

    // Add to cart from modal
    const atcBtn = document.getElementById('hn-modal-atc');
    if (atcBtn) atcBtn.addEventListener('click', () => {
      currentCustomizations = getSelectedCustomizations();
      addToCart(currentProductId, currentQty, currentCustomizations);
    });

    // WhatsApp direct from modal
    const waBtn = document.getElementById('hn-modal-wa');
    if (waBtn) waBtn.addEventListener('click', () => {
      currentCustomizations = getSelectedCustomizations();
      cart = [];
      addToCart(currentProductId, currentQty, currentCustomizations);
      closeProductModal();
      openCustomerForm();
    });

    // Share button
    const shareBtn = document.getElementById('hn-share-btn');
    const shareTooltip = document.getElementById('hn-share-tooltip');
    if (shareBtn) shareBtn.addEventListener('click', () => shareProduct(currentProductId, shareTooltip));

    // Tabs
    modal.querySelectorAll('.hn-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        modal.querySelectorAll('.hn-tab-btn').forEach(b => b.classList.remove('active'));
        modal.querySelectorAll('.hn-tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = modal.querySelector(`.hn-tab-panel[data-panel="${tab}"]`);
        if (panel) panel.classList.add('active');
      });
    });

    // Related product views
    modal.querySelectorAll('.hn-related-view').forEach(btn => {
      btn.addEventListener('click', () => {
        closeProductModal();
        setTimeout(() => openProductModal(btn.dataset.id), 200);
      });
    });
  }

  function closeProductModal() {
    const modal = document.getElementById('hn-product-modal');
    const overlay = document.getElementById('hn-modal-overlay');
    if (modal) modal.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function getSelectedCustomizations() {
    const checks = document.querySelectorAll('.hn-custom-check:checked');
    return Array.from(checks).map(c => c.value);
  }

  /* -------- SHARE PRODUCT -------- */
  function shareProduct(productId, tooltipEl) {
    const product = hn_getProduct(productId);
    if (!product) return;
    const url = `${HN_CONFIG.siteUrl}#product-${product.slug}`;
    const shareData = {
      title: product.name + ' — Hampers Nest',
      text: `Check out this luxury gift: ${product.name} — ${hn_formatINR(product.price_inr)}`,
      url: url
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        if (tooltipEl) {
          tooltipEl.classList.add('visible');
          setTimeout(() => tooltipEl.classList.remove('visible'), 2000);
        }
      });
    }
  }

  /* -------- REQUEST QUOTE -------- */
  function requestQuote(productId) {
    const product = hn_getProduct(productId);
    if (!product) return;
    const msg = encodeURIComponent(
      `Hello Hampers Nest! 🌟\n\nI'm interested in: *${product.name}*\n\nCould you please share the pricing, customization options, and delivery details?\n\nThank you!`
    );
    window.open(`https://api.whatsapp.com/send?phone=${HN_CONFIG.whatsappNumber}&text=${msg}`, '_blank');
  }
  window.hnRequestQuote = requestQuote;

  /* -------- CUSTOMER FORM -------- */
  function openCustomerForm() {
    const overlay = document.getElementById('hn-customer-overlay');
    if (!overlay) return;
    closeCartDrawer();
    const { items, totalINR, totalUSD } = getCartTotals();
    const summaryEl = overlay.querySelector('#hn-order-summary-detail');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="hn-order-sum-items">
          ${cart.map(i => `
            <div class="hn-order-sum-row">
              <span>${i.name} × ${i.qty}</span>
              <span>${hn_formatINR(i.price_inr * i.qty)}</span>
            </div>
          `).join('')}
        </div>
        <div class="hn-order-sum-total">
          <span>Total (${items} item${items !== 1 ? 's' : ''})</span>
          <div>
            <strong>${hn_formatINR(totalINR)}</strong>
            <small>$${totalUSD} USD</small>
          </div>
        </div>
      `;
    }
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCustomerForm() {
    const overlay = document.getElementById('hn-customer-overlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* -------- WHATSAPP CHECKOUT -------- */
  function buildWhatsAppMessage(customer) {
    const { items, totalINR, totalUSD } = getCartTotals();
    let msg = `Hello Hampers Nest! 🌟\n\nI would like to place an order.\n\n`;
    msg += `👤 *CUSTOMER DETAILS*\n`;
    msg += `Name: ${customer.name}\n`;
    msg += `Phone: ${customer.phone}\n`;
    if (customer.email) msg += `Email: ${customer.email}\n`;
    msg += `City: ${customer.city}\n`;
    msg += `Event: ${customer.event}\n`;
    if (customer.delivery) msg += `Delivery Date: ${customer.delivery}\n`;
    msg += `\n🛍 *ORDER ITEMS*\n`;
    cart.forEach(item => {
      msg += `\n• *${item.name}*\n`;
      msg += `  ${hn_formatINR(item.price_inr)} ($${item.price_usd} USD)\n`;
      msg += `  Qty: ${item.qty}\n`;
      if (item.customizations && item.customizations.length) {
        msg += `  Customization: ${item.customizations.join(', ')}\n`;
      }
    });
    msg += `\n💰 *ORDER TOTAL*\n`;
    msg += `Items: ${items}\n`;
    msg += `Total: ${hn_formatINR(totalINR)} ($${totalUSD} USD)\n`;
    msg += `Shipping: Pan India (confirmed on order)\n`;
    if (customer.notes) msg += `\n📝 Notes: ${customer.notes}\n`;
    msg += `\nPlease contact me regarding customization and delivery. Thank you! 🙏`;
    return msg;
  }

  function redirectToWhatsApp(customer) {
    const msg = buildWhatsAppMessage(customer);
    const encoded = encodeURIComponent(msg);
    const url = `https://api.whatsapp.com/send?phone=${HN_CONFIG.whatsappNumber}&text=${encoded}`;
    showOrderSuccessPopup();
    setTimeout(() => {
      window.open(url, '_blank');
    }, 1200);
  }

  /* -------- ORDER SUCCESS POPUP -------- */
  function showOrderSuccessPopup() {
    closeCustomerForm();
    const popup = document.getElementById('hn-order-success');
    if (popup) {
      popup.classList.add('visible');
      setTimeout(() => popup.classList.remove('visible'), 4000);
    }
    clearCart();
  }

  /* -------- MINI TOAST -------- */
  function showMiniToast(msg) {
    let toast = document.getElementById('hn-mini-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'hn-mini-toast';
      toast.className = 'hn-mini-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('visible'), 2500);
  }

  /* -------- INIT -------- */
  document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    loadWishlist();
    updateCartBadge();
    updateWishlistBadge();
    renderCartDrawer();
    renderWishlistDrawer();
    updateHeartIcons();

    // Cart button
    document.querySelectorAll('#hn-cart-btn, #hn-cart-btn-mobile').forEach(btn => {
      if (btn) btn.addEventListener('click', openCartDrawer);
    });

    // Wishlist button
    const wlBtn = document.getElementById('hn-wishlist-btn');
    if (wlBtn) wlBtn.addEventListener('click', openWishlistDrawer);

    // Cart overlay close
    const cartOverlay = document.getElementById('hn-cart-overlay');
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

    // Wishlist overlay close
    const wlOverlay = document.getElementById('hn-wishlist-overlay');
    if (wlOverlay) wlOverlay.addEventListener('click', closeWishlistDrawer);

    // Cart close button
    const cartClose = document.getElementById('hn-cart-close');
    if (cartClose) cartClose.addEventListener('click', closeCartDrawer);

    // Wishlist close button
    const wlClose = document.getElementById('hn-wishlist-close');
    if (wlClose) wlClose.addEventListener('click', closeWishlistDrawer);

    // Modal overlay close
    const modalOverlay = document.getElementById('hn-modal-overlay');
    if (modalOverlay) modalOverlay.addEventListener('click', closeProductModal);

    // Customer form close
    const custClose = document.getElementById('hn-customer-close');
    if (custClose) custClose.addEventListener('click', closeCustomerForm);

    // Customer form submit
    const custForm = document.getElementById('hn-customer-form');
    if (custForm) {
      custForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const customer = {
          name: custForm.querySelector('[name="hn_name"]').value.trim(),
          phone: custForm.querySelector('[name="hn_phone"]').value.trim(),
          email: custForm.querySelector('[name="hn_email"]').value.trim(),
          city: custForm.querySelector('[name="hn_city"]').value.trim(),
          event: custForm.querySelector('[name="hn_event"]').value,
          delivery: custForm.querySelector('[name="hn_delivery"]').value,
          notes: custForm.querySelector('[name="hn_notes"]').value.trim()
        };
        if (!customer.name || !customer.phone || !customer.city || !customer.event) {
          alert('Please fill in Name, Phone, City and Event Type.');
          return;
        }
        redirectToWhatsApp(customer);
      });
    }

    // Wire up product card "Add to Cart" buttons
    document.querySelectorAll('[data-atc-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const product = hn_getProduct(btn.dataset.atcId);
        if (product && product.priceOnRequest) {
          requestQuote(btn.dataset.atcId);
        } else {
          addToCart(btn.dataset.atcId, 1, []);
          openCartDrawer();
        }
      });
    });

    // Wire up product card "View Details" buttons
    document.querySelectorAll('[data-detail-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openProductModal(btn.dataset.detailId);
      });
    });

    // Wire up card image/title clicks for modal
    document.querySelectorAll('[data-card-id]').forEach(el => {
      el.addEventListener('click', () => openProductModal(el.dataset.cardId));
    });

    // Wire up wishlist buttons
    document.querySelectorAll('.wishlist-btn[data-product-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(btn.dataset.productId);
      });
    });

    // Keyboard close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCartDrawer();
        closeWishlistDrawer();
        closeProductModal();
        closeCustomerForm();
      }
    });
  });

})();
