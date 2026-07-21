import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const isInitialMount = useRef(true);

  // Disable native browser scroll restoration globally because we handle it manually.
  // This prevents the browser from aggressively scrolling down on fresh visits from history/bookmarks.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(`scroll_${location.key}`, window.scrollY);
    };

    let scrollTimeout;
    const throttledScroll = () => {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          handleScroll();
          scrollTimeout = null;
        }, 100);
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [location.key]);

  useEffect(() => {
    // 1. Handle completely fresh visit or hard page reload
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // Ensure homepage always starts at the very top on a fresh visit
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        return;
      }
      
      // For other pages, restore session scroll if they refreshed
      const savedScroll = sessionStorage.getItem(`scroll_${location.key}`);
      if (savedScroll !== null) {
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedScroll, 10), left: 0, behavior: 'instant' });
        }, 50);
      }
      return;
    }

    // 2. Handle Back Button navigation (POP)
    if (navigationType === 'POP') {
      const savedScroll = sessionStorage.getItem(`scroll_${location.key}`);
      if (savedScroll !== null) {
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedScroll, 10),
            left: 0,
            behavior: 'instant'
          });
        }, 50);
        return;
      }
    }

    // 3. Handle normal link clicks (PUSH/REPLACE)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [location.pathname, location.key, navigationType]);

  return null;
}
