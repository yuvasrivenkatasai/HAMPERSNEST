import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * ImageGallery — Fullscreen lightbox with:
 *   • thumbnail strip, prev/next, image counter
 *   • zoom on click, keyboard nav (←/→/Esc)
 *   • touch swipe support
 *   • inline video playback (MP4 / WEBM)
 *
 * Props:
 *   media   — array of strings (image paths or video paths)
 *   startAt — initial index (default 0)
 *   onClose — callback to close the gallery
 */
export default function ImageGallery({ media = [], startAt = 0, onClose }) {
  const [current, setCurrent] = useState(startAt);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef(null);

  const total = media.length;

  const isVideo = (src) =>
    typeof src === 'string' && (src.endsWith('.mp4') || src.endsWith('.webm'));

  const goTo = useCallback((idx) => {
    setZoomed(false);
    setCurrent((idx + total) % total);
  }, [total]);

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Touch swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      delta < 0 ? next() : prev();
    }
    touchStartX.current = null;
  };

  const currentSrc = media[current];

  return (
    <div
      className="gallery-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Close button */}
      <button className="gallery-close-btn" onClick={onClose} aria-label="Close gallery">
        <i className="fa-solid fa-xmark"></i>
      </button>

      {/* Counter */}
      <div className="gallery-counter">{current + 1} / {total}</div>

      {/* Main media area */}
      <div
        className="gallery-main"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Prev */}
        {total > 1 && (
          <button className="gallery-nav-btn gallery-prev" onClick={prev} aria-label="Previous">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
        )}

        {/* Media */}
        <div
          className={`gallery-media-wrapper ${zoomed ? 'zoomed' : ''}`}
          onClick={() => !isVideo(currentSrc) && setZoomed((z) => !z)}
        >
          {isVideo(currentSrc) ? (
            <video
              key={currentSrc}
              className="gallery-video"
              src={currentSrc}
              controls
              autoPlay
              playsInline
            />
          ) : (
            <img
              key={currentSrc}
              className="gallery-img"
              src={currentSrc}
              alt={`Gallery item ${current + 1}`}
              draggable={false}
            />
          )}
          {!isVideo(currentSrc) && (
            <span className="gallery-zoom-hint">
              {zoomed ? (
                <><i className="fa-solid fa-magnifying-glass-minus"></i> Click to zoom out</>
              ) : (
                <><i className="fa-solid fa-magnifying-glass-plus"></i> Click to zoom</>
              )}
            </span>
          )}
        </div>

        {/* Next */}
        {total > 1 && (
          <button className="gallery-nav-btn gallery-next" onClick={next} aria-label="Next">
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="gallery-thumbnails">
          {media.map((src, idx) => (
            <button
              key={idx}
              className={`gallery-thumb ${idx === current ? 'active' : ''}`}
              onClick={() => goTo(idx)}
              aria-label={`Go to ${isVideo(src) ? 'video' : 'image'} ${idx + 1}`}
            >
              {isVideo(src) ? (
                <div className="gallery-thumb-video-icon">
                  <i className="fa-solid fa-circle-play"></i>
                </div>
              ) : (
                <img src={src} alt={`Thumb ${idx + 1}`} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
