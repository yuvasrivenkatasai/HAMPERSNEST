import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useCart } from '../context/CartContext';

const PremiumProductGallery = memo(({ product }) => {
  const { toggleWishlist, isInWishlist } = useCart();
  const isWishlisted = isInWishlist(product.id);

  // Normalize media
  const allMedia = [
    { type: 'image', url: product.image },
    ...(product.images || []).map(url => ({ type: 'image', url })),
    ...(product.videoUrls || []).map(url => ({ type: 'video', url }))
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [imageLoadedStatus, setImageLoadedStatus] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});
  const [isZoomed, setIsZoomed] = useState(false);
  
  const timerRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const galleryRef = useRef(null);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Autoplay logic
  const startAutoplay = useCallback(() => {
    if (allMedia.length <= 1) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % allMedia.length);
    }, 4000);
  }, [allMedia.length]);

  useEffect(() => {
    if (!isPaused && !isLightboxOpen) {
      startAutoplay();
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused, isLightboxOpen, startAutoplay]);

  // Tab visibility pause
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleInteract = () => {
    setIsPaused(true);
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  };

  // Swipe logic
  let touchStartX = 0;
  let touchStartY = 0;
  
  const handleTouchStart = (e) => {
    if (isZoomed) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    handleInteract();
  };

  const handleTouchEnd = (e) => {
    if (isZoomed) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    // Prevent swipe on vertical scroll
    if (Math.abs(touchStartY - touchEndY) > 40) return;

    if (touchStartX - touchEndX > 50) {
      setActiveIndex(prev => (prev + 1) % allMedia.length);
    }
    if (touchStartX - touchEndX < -50) {
      setActiveIndex(prev => (prev - 1 + allMedia.length) % allMedia.length);
    }
  };

  // Desktop Hover Zoom
  const handleMouseMove = (e) => {
    if (isMobile || allMedia[activeIndex].type === 'video') return;
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)'
    });
    setIsZoomed(true);
    handleInteract();
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
    setIsZoomed(false);
    setIsPaused(false);
  };

  // Mobile Pinch/Double Tap Zoom mock
  const handleDoubleTap = () => {
    if (!isMobile || allMedia[activeIndex].type === 'video') return;
    if (isZoomed) {
      setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
      setIsZoomed(false);
    } else {
      setZoomStyle({ transformOrigin: 'center center', transform: 'scale(2)' });
      setIsZoomed(true);
    }
    handleInteract();
  };

  const handleImageLoad = (idx) => {
    setImageLoadedStatus(prev => ({ ...prev, [idx]: true }));
  };

  const handleImageError = (idx) => {
    setImageLoadedStatus(prev => ({ ...prev, [idx]: 'error' }));
    console.warn(`Failed to load image at index ${idx}`);
  };

  const activeMedia = allMedia[activeIndex] || allMedia[0];

  return (
    <div className={`premium-gallery ${isMobile ? 'mobile' : 'desktop'}`} ref={galleryRef}>
      
      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="gallery-lightbox active" onClick={() => setIsLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setIsLightboxOpen(false)} aria-label="Close Lightbox">
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="lightbox-content-wrapper" onClick={e => e.stopPropagation()}>
            {activeMedia.type === 'image' ? (
              <img src={activeMedia.url} alt={product.name} className="lightbox-media" />
            ) : (
              <video src={activeMedia.url} controls autoPlay className="lightbox-media" />
            )}
          </div>
          {allMedia.length > 1 && (
            <>
              <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); setActiveIndex((p) => (p - 1 + allMedia.length) % allMedia.length); }}>
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); setActiveIndex((p) => (p + 1) % allMedia.length); }}>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </>
          )}
        </div>
      )}

      {/* Main Hero Wrapper */}
      <div 
        className="hero-media-wrapper"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleDoubleTap}
      >
        {/* Wishlist Button - Top Right */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          className={`gallery-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          aria-label="Toggle Wishlist"
        >
          <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
        </button>

        {/* Zoom Button - Bottom Right */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
          className="gallery-zoom-btn"
          aria-label="Open fullscreen"
        >
          <i className="fa-solid fa-expand"></i>
        </button>

        {/* Main Media Render */}
        <div className="media-carousel-inner" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
          {allMedia.map((media, idx) => (
            <div key={idx} className="media-slide">
              {/* Skeleton Loader */}
              {media.type === 'image' && !imageLoadedStatus[idx] && (
                <div className="skeleton-loader"></div>
              )}
              
              {media.type === 'image' ? (
                <picture>
                  {/* WebP Support */}
                  <source srcSet={media.url.replace(/\.(jpg|jpeg|png)$/, '.webp')} type="image/webp" />
                  <img 
                    src={imageLoadedStatus[idx] === 'error' ? '/assets/hero_banner.png' : media.url} 
                    alt={`${product.name} - View ${idx + 1}`}
                    loading={idx === 0 || idx === activeIndex || idx === (activeIndex + 1) % allMedia.length ? 'eager' : 'lazy'}
                    onLoad={() => handleImageLoad(idx)}
                    onError={() => handleImageError(idx)}
                    className={`hero-image ${imageLoadedStatus[idx] === true ? 'loaded' : ''}`}
                    style={idx === activeIndex ? zoomStyle : {}}
                  />
                </picture>
              ) : (
                <div className="video-wrapper">
                  <video src={media.url} controls muted={idx !== activeIndex} playsInline className="hero-video" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Hover Arrows */}
        {allMedia.length > 1 && !isMobile && (
          <>
            <button className="desktop-arrow prev" onClick={(e) => { e.stopPropagation(); setActiveIndex((p) => (p - 1 + allMedia.length) % allMedia.length); handleInteract(); }}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button className="desktop-arrow next" onClick={(e) => { e.stopPropagation(); setActiveIndex((p) => (p + 1) % allMedia.length); handleInteract(); }}>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </>
        )}
      </div>

      {/* Mobile Pagination Dots */}
      {isMobile && allMedia.length > 1 && (
        <div className="mobile-dots">
          {allMedia.map((_, idx) => (
            <span 
              key={idx} 
              className={`dot ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(idx)}
            ></span>
          ))}
        </div>
      )}

      {/* Thumbnail Strip */}
      {allMedia.length > 1 && (
        <div className="thumbnail-strip">
          {allMedia.map((media, idx) => (
            <div 
              key={idx} 
              className={`thumbnail-item ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => { setActiveIndex(idx); handleInteract(); }}
            >
              {media.type === 'image' ? (
                <img src={media.url} alt={`Thumbnail ${idx}`} loading="lazy" />
              ) : (
                <div className="video-thumbnail">
                  <video src={media.url} />
                  <i className="fa-solid fa-play"></i>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default PremiumProductGallery;
