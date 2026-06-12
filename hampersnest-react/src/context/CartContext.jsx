import React, { createContext, useContext, useState, useEffect } from 'react';

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
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem('hampers_nest_wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  const [products, setProducts] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
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
        const API_BASE = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost')
          ? 'http://localhost:5000'
          : '';
        const response = await fetch(`${API_BASE}/api/products`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setProducts(data);
          }
        }
      } catch (err) {
        console.warn('Backend products API offline:', err);
      }
    };

    const fetchSettings = async () => {
      try {
        const API_BASE = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost')
          ? 'http://localhost:5000'
          : '';
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

  // Cart operations
  const addToCart = (product, quantity = 1, customizations = {}) => {
    const { 
      giftTag = '', 
      wrappingStyle = 'Standard', 
      ribbonColor = 'None',
      addOns = [],
      addedPrice = 0
    } = customizations;
    
    const finalPrice = product.price + addedPrice;
    
    // Create a unique cart item ID based on product ID, customizations, and add-ons
    const sortedAddOns = [...addOns].sort().join(',');
    const cartItemId = `${product.id}-${giftTag.trim()}-${wrappingStyle}-${ribbonColor}-${sortedAddOns}`;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.cartItemId === cartItemId);

      if (existingItemIndex > -1) {
        // Increment quantity of existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += Number(quantity);
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
            quantity: Number(quantity),
            customizations: {
              giftTag: giftTag.trim(),
              wrappingStyle,
              ribbonColor,
              addOns
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
        const API_BASE = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost')
          ? 'http://localhost:5000'
          : '';
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
        item.cartItemId === cartItemId ? { ...item, quantity: Number(newQuantity) } : item
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
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Generate Whatsapp Checkout Message
  const getWhatsappCheckoutUrl = (userDetails = {}, orderId = null) => {
    const whatsappBaseNumber = '917989202194';
    
    let orderDetailsText = cart.map((item, idx) => {
      let customStr = '';
      if (item.customizations.giftTag) {
        customStr += `\n   - Tag Msg: "${item.customizations.giftTag}"`;
      }
      if (item.customizations.wrappingStyle !== 'Standard') {
        customStr += `\n   - Wrapping: ${item.customizations.wrappingStyle}`;
      }
      if (item.customizations.ribbonColor !== 'None') {
        customStr += `\n   - Ribbon: ${item.customizations.ribbonColor}`;
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

    const message = `Hi Hampers Nest!\n\nI would like to place an order / get a quote for the following hampers:\n\n${orderDetailsText}\n\n*Total Items:* ${cartCount}\n*Estimated Subtotal:* ₹${cartTotal}\n\n${nameStr}${phoneStr}${eventStr}${dateStr}${notesStr}Please confirm availability and share the catalog. Thank you!`;

    return `https://api.whatsapp.com/send?phone=${whatsappBaseNumber}&text=${encodeURIComponent(message)}`;
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
        getWhatsappCheckoutUrl,
        settings
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
