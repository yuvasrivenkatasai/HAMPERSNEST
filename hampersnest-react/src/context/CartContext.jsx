import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config.js';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Load initial states from localStorage if available
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('hampers_nest_cart');
    if (!savedCart) return [];
    try {
      const parsedCart = JSON.parse(savedCart);
      return parsedCart.map(item => ({ ...item, quantity: Math.max(5, item.quantity || 5) }));
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem('hampers_nest_wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  const [products, setProducts] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [settings, setSettings] = useState({
    announcementText: 'Welcome to HampersNest! Premium Customized Gift Hampers & Return Gifts Hyderabad.',
    announcementActive: false,
    activeTheme: 'theme-default',
    categories: []
  });

  // Fetch products and settings from backend on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/products?nolimit=true`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.products && Array.isArray(data.products)) {
            console.log(`[Audit Debug] Fetched ${data.products.length} products from Oracle DB.`);
            setProducts(data.products);
          } else if (data && Array.isArray(data)) {
            console.log(`[Audit Debug] Fetched ${data.length} products from Oracle DB (Array format).`);
            setProducts(data);
          } else {
            console.warn('[Audit Debug] Backend returned 0 products or invalid data format.', data);
          }
        }
      } catch (err) {
        console.warn('Backend products API offline:', err);
      }
    };

    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/settings`);
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          // Apply theme directly to storefront body
          document.body.className = data.activeTheme || 'theme-default';
        }
      } catch (err) {
        console.warn('Backend settings API offline:', err);
      }
    };

    fetchProducts();
    fetchSettings();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('hampers_nest_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('hampers_nest_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync state across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'hampers_nest_wishlist') {
        try {
          const newWishlist = JSON.parse(e.newValue);
          setWishlist(Array.isArray(newWishlist) ? newWishlist : []);
        } catch {
          setWishlist([]);
        }
      } else if (e.key === 'hampers_nest_cart') {
        try {
          const newCart = JSON.parse(e.newValue);
          setCart(Array.isArray(newCart) ? newCart.map(item => ({ ...item, quantity: Math.max(5, item.quantity || 5) })) : []);
        } catch {
          setCart([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Cart operations
  const addToCart = (product, quantity = 5, customizations = {}) => {
    const { 
      giftTag = '', 
      addOns = [],
      addedPrice = 0,
      variant = null
    } = customizations;
    
    const finalPrice = product.price + addedPrice + (variant && typeof variant.price === 'number' ? variant.price - product.price : 0);
    
    // Create a unique cart item ID based on product ID, customizations, and add-ons
    const sortedAddOns = [...addOns].sort().join(',');
    const variantStr = variant ? `-${variant.name}` : '';
    const cartItemId = `${product.id}${variantStr}-${giftTag.trim()}-${sortedAddOns}`;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.cartItemId === cartItemId);

      if (existingItemIndex > -1) {
        // Increment quantity of existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += Number(Math.max(5, quantity));
        return updatedCart;
      } else {
        // Add new item
        return [
          ...prevCart,
          {
            cartItemId,
            id: product.id,
            name: product.name,
            price: finalPrice,
            image: product.image,
            category: product.category,
            quantity: Number(Math.max(5, quantity)),
            customizations: {
              giftTag: giftTag.trim(),
              addOns,
              variant
            }
          }
        ];
      }
    });

    // Automatically open the cart drawer when item is added
    setCartOpen(true);

    // Record click analytics to backend
    const recordClick = async () => {
      try {
        await fetch(`${API_BASE}/api/products/${product.id}/click`, {
          method: 'POST'
        });
      } catch (err) {
        console.warn('Click tracking server connection failed:', err);
      }
    };
    recordClick();
  };

  const removeFromCart = (cartItemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: Number(Math.max(5, newQuantity)) } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist operations
  const toggleWishlist = (productId) => {
    setWishlist((prevWishlist) => {
      if (prevWishlist.includes(productId)) {
        return prevWishlist.filter((id) => id !== productId);
      } else {
        return [...prevWishlist, productId];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  // Calculate totals
  const getCartTotals = () => {
    let count = 0;
    let subtotal = 0;
    let discountTotal = 0;
    
    const productQtyMap = {};
    cart.forEach(item => {
      productQtyMap[item.id] = (productQtyMap[item.id] || 0) + item.quantity;
      count += item.quantity;
    });

    const bulkSettings = settings?.bulkDiscountSettings;
    const isDiscountEnabled = bulkSettings?.enabled && bulkSettings?.rules && bulkSettings.rules.length > 0;
    const sortedRulesDesc = isDiscountEnabled ? [...bulkSettings.rules].sort((a, b) => b.minQty - a.minQty) : [];
    const sortedRulesAsc = isDiscountEnabled ? [...bulkSettings.rules].sort((a, b) => a.minQty - b.minQty) : [];

    cart.forEach(item => {
      const lineSubtotal = item.price * item.quantity;
      subtotal += lineSubtotal;

      if (isDiscountEnabled) {
        const totalQtyForProduct = productQtyMap[item.id];
        const rule = sortedRulesDesc.find(r => totalQtyForProduct >= r.minQty);
        if (rule) {
          discountTotal += lineSubtotal * (rule.discountPercent / 100);
        }
      }
    });

    const finalTotal = subtotal - discountTotal;

    const upsales = {};
    if (isDiscountEnabled) {
      cart.forEach(item => {
         const totalQtyForProduct = productQtyMap[item.id];
         const nextRule = sortedRulesAsc.find(r => totalQtyForProduct < r.minQty);
         if (nextRule && !upsales[item.id]) { // only compute once per product
            upsales[item.id] = {
               productName: item.name,
               qtyNeeded: nextRule.minQty - totalQtyForProduct,
               discountPercent: nextRule.discountPercent
            };
         }
      });
    }

    return { count, subtotal, discountTotal, finalTotal, upsales, productQtyMap, sortedRulesDesc };
  };

  const cartTotals = getCartTotals();
  const cartCount = cartTotals.count;
  const cartTotal = cartTotals.finalTotal;

  // Generate Whatsapp Checkout Message
  const getWhatsappCheckoutUrl = (userDetails = {}, orderId = null) => {
    const whatsappNumber = settings?.whatsappNumber;
    
    // Format currency without trailing zero decimals for whole numbers
    const formatCurrency = (val) => {
      const num = Number(val);
      const isWhole = num % 1 === 0;
      return '₹' + num.toLocaleString('en-IN', {
        minimumFractionDigits: isWhole ? 0 : 2,
        maximumFractionDigits: isWhole ? 0 : 2
      });
    };
    
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        // Check for crazy years
        if (d.getFullYear() > 2100 || d.getFullYear() < 2000) return dateStr;
        return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
      } catch (e) {
        return dateStr;
      }
    };
    
    const DIVIDER = '══════════════════════';

    // 1. Header
    const today = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());
    let headerParts = [];
    headerParts.push('*HAMPERS NEST*');
    headerParts.push('Premium Gifts & Return Gifts');
    headerParts.push('');
    headerParts.push(DIVIDER);
    headerParts.push('');
    headerParts.push('*ORDER REQUEST*');
    if (orderId) {
      headerParts.push(`Order Reference:\n${orderId}`);
    }
    headerParts.push(`Date:\n${today}`);

    // 2. Products
    let orderDetailsText = cart.map((item, idx) => {
      let lines = [];
      lines.push(DIVIDER);
      lines.push('');
      
      lines.push(`*${item.name}*`);
      
      let cats = [];
      if (item.category) cats.push(item.category);
      if (item.subCategory) cats.push(item.subCategory);
      if (cats.length > 0) lines.push(cats.join(' - '));
      
      if (item.customizations?.variant) {
        lines.push(`Variant: ${item.customizations.variant.name}`);
      }
      
      lines.push('');
      
      const basePrice = item.customizations?.variant?.price 
                        ? item.customizations.variant.price 
                        : (item.basePrice || (item.price - (item.customizations?.addedPrice || 0)));
                        
      lines.push(`• Qty : ${item.quantity} Pieces`);
      lines.push(`• Price : ${formatCurrency(basePrice)} each`);
      lines.push(`• Total : ${formatCurrency(basePrice * item.quantity)}`);

      // Customizations
      if (item.customizations?.giftTag) {
        lines.push('');
        lines.push('Gift Tag');
        lines.push(item.customizations.giftTag);
      }
      
      let addonTotal = 0;
      if (item.customizations?.addOns && item.customizations.addOns.length > 0) {
        lines.push('');
        lines.push('Selected Add-ons');
        
        item.customizations.addOns.forEach(addonName => {
          let price = 0;
          if (item.customAddons && Array.isArray(item.customAddons)) {
             const found = item.customAddons.find(a => a.name === addonName);
             if (found) price = Number(found.price);
          } else {
             const defaultAddons = [
                { name: 'Scented Wax Candle', price: 99 },
                { name: 'Extra Chocolates (Pack of 4)', price: 149 },
                { name: 'Premium Hydration Flask', price: 299 },
                { name: 'Calligraphy Message Card', price: 49 }
             ];
             const found = defaultAddons.find(a => a.name === addonName);
             if (found) price = Number(found.price);
          }
          addonTotal += price;
          lines.push(`• ${addonName} (+${formatCurrency(price)})`);
        });
      }

      if (addonTotal > 0) {
         lines.push('');
         lines.push('Customization Total');
         lines.push(formatCurrency(addonTotal * item.quantity));
      }

      return lines.join('\n');
    }).join('\n\n');

    // 3. Order Summary
    let totalsLines = [];
    totalsLines.push(`*ORDER SUMMARY*`);
    totalsLines.push('');
    // Proportional fonts in WhatsApp make perfect alignment hard, but this is a close approximation.
    totalsLines.push(`Products            ${cart.length}`);
    totalsLines.push(`Total Pieces        ${cartCount}`);
    totalsLines.push(`Subtotal            ${formatCurrency(cartTotals.subtotal)}`);
    
    if (cartTotals.discountTotal > 0) {
       totalsLines.push(`Discount            -${formatCurrency(cartTotals.discountTotal)}`);
    }
    
    totalsLines.push(`Shipping            Calculated Separately`);
    totalsLines.push(`Estimated Total     ${formatCurrency(cartTotal)}`);

    // 4. Customer Details
    let customerLines = [];
    if (userDetails.name || userDetails.phone || userDetails.email || userDetails.eventType || userDetails.deliveryDate || userDetails.location) {
       customerLines.push(DIVIDER);
       customerLines.push('');
       customerLines.push(`*CUSTOMER*`);
       customerLines.push('');
       
       if (userDetails.name) {
         customerLines.push(userDetails.name);
       }
       if (userDetails.phone) {
         customerLines.push(userDetails.phone);
       }
       if (userDetails.email) {
         customerLines.push(userDetails.email);
       }
       if (userDetails.eventType) {
         customerLines.push(userDetails.eventType);
       }
       if (userDetails.deliveryDate) {
         customerLines.push(formatDate(userDetails.deliveryDate));
       }
       if (userDetails.location) {
         customerLines.push(userDetails.location);
       }
    }

    // 5. Notes
    let notesLines = [];
    if (userDetails.notes) {
       let safeNotes = userDetails.notes.trim();
       if (safeNotes.length > 180) {
         safeNotes = safeNotes.substring(0, 180) + '...Read More';
       }
       notesLines.push(DIVIDER);
       notesLines.push('');
       notesLines.push(`*CUSTOMER NOTES*`);
       notesLines.push('');
       notesLines.push(safeNotes);
    }

    // 6. Footer
    let footerLines = [
      DIVIDER,
      ``,
      `Shipping charges are calculated separately based on destination and volumetric weight.`,
      ``,
      `Kindly confirm:`,
      ``,
      `• Product Availability`,
      `• Final Shipping Charges`,
      `• Estimated Dispatch Date`,
      ``,
      `Thank you.`,
      ``,
      `Hampers Nest Team`
    ];

    const messageParts = [];
    messageParts.push(headerParts.join('\n'));
    messageParts.push(orderDetailsText);
    messageParts.push(DIVIDER);
    messageParts.push(totalsLines.join('\n'));
    if (customerLines.length > 0) messageParts.push(customerLines.join('\n'));
    if (notesLines.length > 0) messageParts.push(notesLines.join('\n'));
    messageParts.push(footerLines.join('\n'));

    // Remove any accidental triple blank lines caused by joins
    const message = messageParts.join('\n\n').replace(/\n{3,}/g, '\n\n');

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <CartContext.Provider
      value={{
        products,
        cart,
        wishlist,
        cartOpen,
        setCartOpen,
        inquiryOpen,
        setInquiryOpen,
        quoteModalOpen,
        setQuoteModalOpen,
        selectedProductForModal,
        setSelectedProductForModal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        cartCount,
        cartTotal,
        cartTotals,
        getWhatsappCheckoutUrl,
        settings
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
