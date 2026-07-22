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

    let orderDetailsText = cart.map((item, idx) => {
      let customStr = '';
      if (item.customizations.variant) {
        customStr += `\n   - Size: ${item.customizations.variant.name}`;
      }
      if (item.customizations.giftTag) {
        customStr += `\n   - Tag Msg: "${item.customizations.giftTag}"`;
      }
      if (item.customizations.addOns && item.customizations.addOns.length > 0) {
        customStr += `\n   - Add-ons: ${item.customizations.addOns.join(', ')}`;
      }
      return `${idx + 1}. *${item.name}* x ${item.quantity} (₹${item.price} each) ${customStr}`;
    }).join('\n\n');

    const orderRefStr = orderId ? `*Order Reference:* ${orderId}\n` : '';
    const nameStr = userDetails.name ? `*Name:* ${userDetails.name}\n` : '';
    const phoneStr = userDetails.phone ? `*Phone:* ${userDetails.phone}\n` : '';
    const eventStr = userDetails.eventType ? `*Event:* ${userDetails.eventType}\n` : '';
    const dateStr = userDetails.deliveryDate ? `*Required Date:* ${userDetails.deliveryDate}\n` : '';
    const notesStr = userDetails.notes ? `*Notes:* ${userDetails.notes}\n` : '';

    const message = `Hi ${settings?.storeName || 'Hampers Nest'}!\n\nI would like to place an order / get a quote for the following hampers:\n\n${orderDetailsText}\n\n*Total Items:* ${cartCount}\n*Estimated Subtotal:* ₹${cartTotals.subtotal.toFixed(2)}${cartTotals.discountTotal > 0 ? `\n*Bulk Discount Saved:* -₹${cartTotals.discountTotal.toFixed(2)}` : ''}\n*Estimated Total:* ₹${cartTotal.toFixed(2)}\n\n${nameStr}${phoneStr}${eventStr}${dateStr}${notesStr}Please confirm availability and share the catalog. Thank you!`;

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
