import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useCart } from '../context/CartContext';
import WishlistButton from './WishlistButton';

const LightboxViewer = ({ allMedia, activeIndex, setActiveIndex, onClose }) => {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const touchState = useRef({
    initialDist: 0, initialScale: 1, lastTap: 0,
    startX: 0, startY: 0, panStartX: 0, panStartY: 0
  });

  useEffect(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [activeIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setActiveIndex((p) => (p + 1) % allMedia.length);
      if (e.key === 'ArrowLeft') setActiveIndex((p) => (p - 1 + allMedia.length) % allMedia.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allMedia.length, onClose, setActiveIndex]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      touchState.current.initialDist = dist;
      touchState.current.initialScale = scale;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - touchState.current.lastTap < 300) {
        if (scale > 1) { setScale(1); setPan({ x: 0, y: 0 }); }
        else setScale(2.5);
      }
      touchState.current.lastTap = now;
      touchState.current.startX = e.touches[0].clientX;
      touchState.current.startY = e.touches[0].clientY;
      touchState.current.panStartX = pan.x;
      touchState.current.panStartY = pan.y;
      setIsDragging(scale > 1);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const newScale = Math.min(Math.max(1, touchState.current.initialScale * (dist / touchState.current.initialDist)), 4);
      setScale(newScale);
    } else if (e.touches.length === 1 && scale > 1) {
      const dx = e.touches[0].clientX - touchState.current.startX;
      const dy = e.touches[0].clientY - touchState.current.startY;
      setPan({ x: touchState.current.panStartX + dx, y: touchState.current.panStartY + dy });
    }
  };

  const handleTouchEnd = (e) => {
    if (scale === 1 && e.changedTouches.length === 1 && !isDragging) {
      const dx = e.changedTouches[0].clientX - touchState.current.startX;
      if (dx > 50) setActiveIndex((p) => (p - 1 + allMedia.length) % allMedia.length);
      else if (dx < -50) setActiveIndex((p) => (p + 1) % allMedia.length);
    }
    if (scale <= 1) setPan({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const newScale = Math.min(Math.max(1, scale - e.deltaY * 0.01), 4);
    setScale(newScale);
    if (newScale === 1) setPan({ x: 0, y: 0 });
  };

  const activeMedia = allMedia[activeIndex];

  return (
    <div className="gallery-lightbox active" onClick={onClose} style={{ touchAction: 'none' }}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close Lightbox">
        <i className="fa-solid fa-xmark"></i>
      </button>
      
      <div className="lightbox-counter" style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: '1rem', fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '20px', zIndex: 1002 }}>
        {activeIndex + 1} / {allMedia.length}
      </div>

      <div 
        className="lightbox-content-wrapper" 
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}
      >
        {activeMedia.type === 'image' ? (
          <img 
            src={activeMedia.url} 
            alt="Preview" 
            className="lightbox-media"
            style={{ 
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transition: scale === 1 && !isDragging ? 'transform 0.3s ease' : 'none',
              willChange: 'transform',
              maxHeight: '90vh',
              maxWidth: '90vw',
              objectFit: 'contain'
            }} 
            draggable={false}
          />
        ) : (
          <video src={activeMedia.url} controls autoPlay className="lightbox-media" style={{ maxHeight: '90vh', maxWidth: '90vw' }} />
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
  );
};
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
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    handleInteract();
  };

  const handleTouchEnd = (e) => {
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
        <LightboxViewer 
          allMedia={allMedia}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}

      {/* Main Hero Wrapper */}
      <div 
        className="hero-media-wrapper"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Wishlist Button - Top Right */}
        <WishlistButton productId={product.id} absolute />

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
                    onClick={() => setIsLightboxOpen(true)}
                    style={{ cursor: 'zoom-in' }}
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
