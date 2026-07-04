import SeoKeywordsSection from '../components/SeoKeywordsSection';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductDetailTemplate from '../components/ProductDetailTemplate';
import SEO from '../components/SEO';
import { API_BASE } from '../config.js';
import Breadcrumbs from '../components/Breadcrumbs';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isInWishlist, settings } = useCart();

  // Find current product
  const [localProduct, setLocalProduct] = useState(null);
  const [loadingLocal, setLoadingLocal] = useState(true);

  useEffect(() => {
    const fetchFallback = async () => {
      const productFromContext = products ? products.find((p) => p.id === id) : null;
      if (productFromContext) {
        setLocalProduct(productFromContext);
        setLoadingLocal(false);
        return;
      }

      setLoadingLocal(true);
      try {
        const response = await fetch(`${API_BASE}/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setLocalProduct(data);
        } else {
          setLocalProduct(null);
        }
      } catch (err) {
        console.error(err);
        setLocalProduct(null);
      } finally {
        setLoadingLocal(false);
      }
    };
    fetchFallback();
  }, [id, products]);

  const product = localProduct;

  // Customization States
  const [giftTag, setGiftTag] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState({
    candle: false,
    chocolates: false,
    bottle: false,
    calligraphy: false,
  });
  const [quantity, setQuantity] = useState(1);

  // Gallery States
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Accordion Toggles
  const [accordions, setAccordions] = useState({
    inclusions: true,
    specs: false,
    shipping: false,
    faqs: false,
  });

  // Scroll to top on product change
  useEffect(() => {
    setActiveMediaIndex(0);
    setIsLightboxOpen(false);
    // Reset selections
    setGiftTag('');
    setSelectedAddOns({
      candle: false,
      chocolates: false,
      bottle: false,
      calligraphy: false,
    });
    setQuantity(1);

    // Track product view in backend database
    if (id) {
      const recordView = async () => {
        try {
          await fetch(`${API_BASE}/api/products/${id}/view`, {
            method: 'POST'
          });
        } catch (err) {
          console.warn('View tracking server connection failed:', err);
        }
      };
      recordView();
    }
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


  if (loadingLocal) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--color-gold)' }}></i>
        <p style={{ marginTop: '1rem', color: 'var(--color-gray-text)' }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return <Navigate to="/collections" replace />;
  }

  const isWishlisted = isInWishlist(product.id);

  const addOnDetails = {
    candle: { name: 'Scented Wax Candle', price: 99 },
    chocolates: { name: 'Extra Chocolates (Pack of 4)', price: 149 },
    bottle: { name: 'Premium Hydration Flask', price: 299 },
    calligraphy: { name: 'Calligraphy Message Card', price: 49 },
  };

  // Calculate Added Price
  const addedPrice = 
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
      addOns: activeAddOns,
      addedPrice,
    });
  };



  // Filter Related Products (Same category, excluding current)
  const relatedProducts = products ? products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3) : [];

  // Fallback to featured products if no same-category items
  const displayRelated = relatedProducts.length > 0 
    ? relatedProducts 
    : (products ? products.filter((p) => p.id !== product.id).slice(0, 3) : []);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images ? product.images.map(img => img.startsWith('http') ? img : window.location.origin + img) : [window.location.origin + product.image],
    "description": product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": settings?.storeName || "Hampers Nest"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "LocalBusiness",
        "name": settings?.storeName || "Hampers Nest"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 4.8,
      "reviewCount": product.rating ? Math.floor(product.rating * 5) : 24
    }
  };

  return (
    <div className="page-container">

      <SEO 
        title={`${product.name} | Customized Gift Hampers Hyderabad | ${settings?.storeName || 'Hampers Nest'}`}
        description={`${product.description} Customizable packaging, ribbons, and gift tags available. Order directly via WhatsApp.`}
        keywords={`${product.name.toLowerCase()}, custom gift box hyderabad, return gift hampers, hampersnest product, hampersnest ${product.id}`}
        ogImage={product.image}
        schema={productSchema}
      />
      
      <div className="container" style={{ paddingTop: '20px' }}>
        <Breadcrumbs customCrumbs={[
          { name: 'Collections', path: '/collections' },
          { name: product.subcategoryName || product.categoryName || product.category, path: `/collections?category=${product.category}` },
          { name: product.name, path: `/product/${product.id}` }
        ]} />
      </div>

      <ProductDetailTemplate product={product} displayRelated={displayRelated} />
      
      <SeoKeywordsSection />
    </div>
  );
}
