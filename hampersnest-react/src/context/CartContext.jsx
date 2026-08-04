import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config.js';
import { MINIMUM_ORDER_QTY } from '../utils/constants';
import { calculateProductPrice, calculateCartTotals, formatCurrency } from '../utils/PriceUtils';
import { sanitizeGiftTag } from '../utils/ValidationUtils';

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
      return parsedCart.map(item => ({ ...item, quantity: Math.max(MINIMUM_ORDER_QTY, item.quantity || MINIMUM_ORDER_QTY) }));
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
          setCart(Array.isArray(newCart) ? newCart.map(item => ({ ...item, quantity: Math.max(MINIMUM_ORDER_QTY, item.quantity || MINIMUM_ORDER_QTY) })) : []);
        } catch {
          setCart([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Cart operations
  const addToCart = (product, quantity = MINIMUM_ORDER_QTY, customizations = {}) => {
    const { 
      giftTag = '', 
      addOns = [], // Array of extended addon objects {id, name, price, ...}
      variant = null
    } = customizations;
    
    // Ensure addOns is an array of objects
    const safeAddOns = (Array.isArray(addOns) ? addOns : []).map(a => typeof a === 'string' ? { name: a, price: 0 } : a);
    const addedPrice = safeAddOns.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
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
        updatedCart[existingItemIndex].quantity += Number(Math.max(MINIMUM_ORDER_QTY, quantity));
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
            basePrice: product.price,
            image: product.image,
            category: product.category,
            quantity: Number(Math.max(MINIMUM_ORDER_QTY, quantity)),
            customizations: {
              giftTag: sanitizeGiftTag(giftTag),
              addOns: safeAddOns,
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
        item.cartItemId === cartItemId ? { ...item, quantity: Number(Math.max(MINIMUM_ORDER_QTY, newQuantity)) } : item
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
    // Transform cart to use new calculateCartTotals helper
    const itemsForHelper = cart.map(item => ({
      ...item,
      basePrice: item.customizations?.variant?.price || item.basePrice || item.price,
      addOns: item.customizations?.addOns || []
    }));

    const bulkSettings = settings?.bulkDiscountSettings;
    const isDiscountEnabled = bulkSettings?.enabled && bulkSettings?.rules && bulkSettings.rules.length > 0;
    const discountRules = isDiscountEnabled ? bulkSettings.rules : [];
    
    const { subtotal, discountPercent, discountAmount, finalTotal, totalQuantity } = calculateCartTotals(itemsForHelper, discountRules);
    
    // Legacy support for upsales UI
    const upsales = {};
    const productQtyMap = {};
    const sortedRulesDesc = isDiscountEnabled ? [...discountRules].sort((a, b) => b.minQty - a.minQty) : [];
    const sortedRulesAsc = isDiscountEnabled ? [...discountRules].sort((a, b) => a.minQty - b.minQty) : [];

    if (isDiscountEnabled) {
      cart.forEach(item => {
        productQtyMap[item.id] = (productQtyMap[item.id] || 0) + item.quantity;
      });
      cart.forEach(item => {
         const totalQtyForProduct = productQtyMap[item.id];
         const nextRule = sortedRulesAsc.find(r => totalQtyForProduct < r.minQty);
         if (nextRule && !upsales[item.id]) {
            upsales[item.id] = {
               productName: item.name,
               qtyNeeded: nextRule.minQty - totalQtyForProduct,
               discountPercent: nextRule.discountPercent
            };
         }
      });
    }

    return { 
      count: totalQuantity, 
      subtotal, 
      discountTotal: discountAmount, 
      finalTotal, 
      upsales, 
      productQtyMap, 
      sortedRulesDesc 
    };
  };

  const cartTotals = getCartTotals();
  const cartCount = cartTotals.count;
  const cartTotal = cartTotals.finalTotal;

  // Generate Whatsapp Checkout Message
  const getWhatsappCheckoutUrl = (userDetails = {}, orderId = null) => {
    const whatsappNumber = settings?.whatsappNumber;
    
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        if (d.getFullYear() > 2100 || d.getFullYear() < 2000) return dateStr;
        return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
      } catch (e) {
        return dateStr;
      }
    };
    
    const DIVIDER = '----------------------------------';

    // 1. Header
    const today = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());
    let messageParts = [];
    
    messageParts.push('*HAMPERS NEST*');
    messageParts.push('Premium Gifts & Return Gifts');
    messageParts.push('');
    messageParts.push(DIVIDER);
    messageParts.push('');
    messageParts.push('*ORDER SUMMARY*');
    messageParts.push('');
    if (orderId) {
      messageParts.push(`Order ID:\n${orderId}`);
    }
    messageParts.push(`Date:\n${today}`);
    messageParts.push('');
    messageParts.push(DIVIDER);
    messageParts.push('');
    messageParts.push('*PRODUCTS*');
    messageParts.push('');

    // 2. Products
    cart.forEach((item, idx) => {
      messageParts.push(`${idx + 1}.`);
      messageParts.push('');
      messageParts.push(`*${item.name}*`);
      
      let cats = [];
      if (item.category) cats.push(item.category);
      if (item.subCategory) cats.push(item.subCategory);
      if (cats.length > 0) messageParts.push(cats.join(' - '));
      
      if (item.customizations?.variant) {
        messageParts.push(`Variant: ${item.customizations.variant.name}`);
      }
      
      messageParts.push('');
      messageParts.push(`Quantity: ${item.quantity}`);
      
      if (item.customizations?.giftTag) {
        messageParts.push('');
        messageParts.push('Gift Tag:');
        messageParts.push(item.customizations.giftTag);
      }
      
      let addonTotal = 0;
      if (item.customizations?.addOns && item.customizations.addOns.length > 0) {
        messageParts.push('');
        messageParts.push('Selected Add-ons:');
        item.customizations.addOns.forEach(addon => {
          // Backward compatibility for old string-based addons
          const name = typeof addon === 'string' ? addon : addon.name;
          const price = typeof addon === 'string' ? 0 : (Number(addon.price) || 0);
          addonTotal += price;
          messageParts.push(`• ${name} (+${formatCurrency(price)})`);
        });
      }
      
      const basePrice = item.customizations?.variant?.price || item.basePrice || item.price;
      const unitPrice = calculateProductPrice(basePrice, item.customizations?.addOns || []);
      
      messageParts.push('');
      messageParts.push(`Price: ${formatCurrency(unitPrice * item.quantity)}`);
      messageParts.push('');
    });

    // 3. Order Summary
    messageParts.push(DIVIDER);
    messageParts.push('');
    messageParts.push(`*TOTALS*`);
    messageParts.push('');
    messageParts.push(`Subtotal: ${formatCurrency(cartTotals.subtotal)}`);
    
    if (cartTotals.discountTotal > 0) {
       messageParts.push(`Discount: -${formatCurrency(cartTotals.discountTotal)}`);
    }
    
    messageParts.push(`Shipping: Calculated Separately`);
    messageParts.push(`Grand Total: ${formatCurrency(cartTotal)}`);
    messageParts.push('');
    messageParts.push(DIVIDER);

    // 4. Customer Details
    messageParts.push('');
    messageParts.push(`*CUSTOMER*`);
    messageParts.push('');
    
    if (userDetails.name) messageParts.push(`Name: ${userDetails.name}`);
    if (userDetails.phone) messageParts.push(`Phone: ${userDetails.phone}`);
    if (userDetails.eventType) messageParts.push(`Event: ${userDetails.eventType}`);
    if (userDetails.deliveryDate) messageParts.push(`Required Date: ${formatDate(userDetails.deliveryDate)}`);
    
    if (userDetails.notes) {
       let safeNotes = userDetails.notes.trim();
       if (safeNotes.length > 180) safeNotes = safeNotes.substring(0, 180) + '...';
       messageParts.push('');
       messageParts.push(`Notes:`);
       messageParts.push(safeNotes);
    }

    // 6. Footer
    messageParts.push('');
    messageParts.push(DIVIDER);
    messageParts.push('');
    messageParts.push(`Kindly confirm:`);
    messageParts.push('');
    messageParts.push(`• Product Availability`);
    messageParts.push(`• Shipping Charges`);
    messageParts.push(`• Dispatch Date`);
    messageParts.push('');
    messageParts.push(`Thank you.`);
    messageParts.push('');
    messageParts.push(`Hampers Nest`);

    // Remove any accidental triple blank lines caused by joins
    const message = messageParts.join('\n').replace(/\n{3,}/g, '\n\n');

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
