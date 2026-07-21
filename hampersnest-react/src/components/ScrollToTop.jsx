import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();

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
    if (navigationType === 'POP') {
      const savedScroll = sessionStorage.getItem(`scroll_${location.key}`);
      if (savedScroll !== null) {
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedScroll, 10),
            left: 0,
            behavior: 'instant'
          });
        }, 50); // slight delay to allow state restoration to finish
        return;
      }
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [location.pathname, location.key, navigationType]);

  return null;
}
