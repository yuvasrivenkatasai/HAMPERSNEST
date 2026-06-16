import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductDetailTemplate from '../components/ProductDetailTemplate';
import SEO from '../components/SEO';
import { API_BASE } from '../config.js';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isInWishlist } = useCart();

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
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <SEO title="Product Not Found | Hampers Nest" description="The requested customized gift hamper was not found." />
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: 'var(--color-gold)', marginBottom: '1.5rem' }}></i>
        <h2>Product Not Found</h2>
        <p style={{ margin: '1rem 0 2rem 0', color: '#666' }}>The product you are looking for does not exist or has been moved.</p>
        <Link to="/collections" className="btn btn-primary">Back to Collections</Link>
      </div>
    );
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
      "name": "Hampers Nest"
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
        "name": "Hampers Nest"
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
        title={`${product.name} | Customized Gift Hampers Hyderabad | Hampers Nest`}
        description={`${product.description} Customizable packaging, ribbons, and gift tags available. Order directly via WhatsApp.`}
        keywords={`${product.name.toLowerCase()}, custom gift box hyderabad, return gift hampers, hampersnest product, hampersnest ${product.id}`}
        ogImage={product.image}
        schema={productSchema}
      />
      
      <ProductDetailTemplate product={product} displayRelated={displayRelated} />
      
      {/* SEO Related Keywords Grid Section */}
      <div className="container" style={{ paddingBottom: '3rem' }}>
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
