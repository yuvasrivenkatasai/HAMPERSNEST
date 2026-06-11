/* ==========================================
   HAMPERS NEST - INTERACTIVE SCRIPTING
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. MOBILE NAVBAR HAMBURGER TOGGLE
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const navLinks = navMenu ? navMenu.querySelectorAll('a') : [];

  if (menuToggle && navMenu) {
    const toggleMenu = () => {
      const isActive = menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      if (menuOverlay) {
        menuOverlay.classList.toggle('active');
      }
      document.body.style.overflow = isActive ? 'hidden' : '';
    };

    const closeMenu = () => {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
      if (menuOverlay) {
        menuOverlay.classList.remove('active');
      }
      document.body.style.overflow = '';
    };

    menuToggle.addEventListener('click', toggleMenu);

    if (menuOverlay) {
      menuOverlay.addEventListener('click', closeMenu);
    }

    navLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // 2. STICKY HEADER ON SCROLL
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  // 3. PREMIUM LUXURY SCROLL REVEAL ANIMATIONS (IntersectionObserver)
  // Enable animation system states
  document.documentElement.classList.add('js-enabled');

  // Assign reveal classes programmatically
  document.querySelectorAll('.section-subtitle, .section-title, .about-left h3, .contact-info-title, .about-text, .cta-title').forEach(el => {
    el.classList.add('reveal-heading');
  });

  document.querySelectorAll('.collection-card').forEach(el => {
    el.classList.add('reveal-category');
  });

  document.querySelectorAll('.gallery-item').forEach(el => {
    el.classList.add('reveal-gallery');
  });

  document.querySelectorAll('.testimonial-slider-container').forEach(el => {
    el.classList.add('reveal-testimonial');
  });

  // Calculate stagger delays dynamically for layout grids
  document.querySelectorAll('.collections-grid, .gallery-masonry, .instagram-grid, .about-right').forEach(grid => {
    const children = Array.from(grid.children);
    children.forEach((child, idx) => {
      child.style.setProperty('--delay', `${idx * 100}ms`);
    });
  });

  // Set up intersection observer to trigger active class once entering viewport
  const animElements = document.querySelectorAll('.reveal, .reveal-heading, .reveal-category, .reveal-gallery, .reveal-testimonial');
  
  if ('IntersectionObserver' in window && animElements.length > 0) {
    const animObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px'
    });

    animElements.forEach(el => animObserver.observe(el));
  }

  // 4. PRODUCT GALLERY LIGHTBOX PREVIEW
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightbox && lightboxClose) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('.gallery-item-img');
        const title = item.getAttribute('data-title');
        const desc = item.getAttribute('data-desc');

        if (img && lightboxImg) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt;
        }
        if (lightboxTitle) lightboxTitle.textContent = title || 'Custom Return Gift';
        if (lightboxDesc) lightboxDesc.textContent = desc || 'Premium customized hamper curated with love.';
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock scrolling
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = ''; // Release scrolling
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
    });
  }

  // 5. HEADER SEARCH FILTER LOGIC
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  const performSearch = () => {
    if (!searchInput) return;
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) {
      galleryItems.forEach(item => {
        item.style.display = '';
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
      });
      return;
    }

    galleryItems.forEach(item => {
      const title = (item.getAttribute('data-title') || '').toLowerCase();
      const desc = (item.getAttribute('data-desc') || '').toLowerCase();
      
      if (title.includes(query) || desc.includes(query)) {
        item.style.display = '';
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
      } else {
        item.style.display = 'none';
        item.style.opacity = '0';
        item.style.transform = 'scale(0.8)';
      }
    });

    const gallerySection = document.getElementById('gallery');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }

  // 6. CLIENT TESTIMONIALS SLIDER
  const slides = document.querySelectorAll('.testimonial-slide');
  const dotsContainer = document.getElementById('sliderDots');
  let currentSlide = 0;
  let slideInterval;

  if (slides.length > 0 && dotsContainer) {
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.classList.add('dot');
      if (idx === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
      dotsContainer.appendChild(dot);

      dot.addEventListener('click', () => {
        goToSlide(idx);
        resetSlideInterval();
      });
    });

    const dots = dotsContainer.querySelectorAll('.dot');

    const goToSlide = (index) => {
      if (slides[currentSlide] && dots[currentSlide]) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
      }
      currentSlide = index;
      if (slides[currentSlide] && dots[currentSlide]) {
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
      }
    };

    const nextSlide = () => {
      goToSlide((currentSlide + 1) % slides.length);
    };

    const startSlideInterval = () => {
      slideInterval = setInterval(nextSlide, 5000);
    };

    const resetSlideInterval = () => {
      clearInterval(slideInterval);
      startSlideInterval();
    };

    const sliderContainer = document.querySelector('.testimonial-slider-container');
    if (sliderContainer) {
      sliderContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
      sliderContainer.addEventListener('mouseleave', startSlideInterval);
    }

    startSlideInterval();
  }

  // 7. QUICK INQUIRY MODAL POPUP
  const quickInquiryBtns = document.querySelectorAll('#quickInquiryBtn, .quote-float');
  const inquiryModal = document.getElementById('inquiryModal');
  const inquiryModalClose = document.getElementById('inquiryModalClose');

  const openInquiryModal = () => {
    if (inquiryModal) {
      inquiryModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeInquiryModal = () => {
    if (inquiryModal) {
      inquiryModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (quickInquiryBtns.length > 0 && inquiryModal && inquiryModalClose) {
    quickInquiryBtns.forEach(btn => {
      btn.addEventListener('click', openInquiryModal);
    });
    inquiryModalClose.addEventListener('click', closeInquiryModal);
    inquiryModal.addEventListener('click', (e) => {
      if (e.target === inquiryModal) closeInquiryModal();
    });
  }

  // 8. INQUIRY FORM SUBMISSION & WHATSAPP REDIRECTION
  const forms = [
    document.getElementById('mainInquiryForm'),
    document.getElementById('modalInquiryForm')
  ];

  const successPopup = document.getElementById('successPopup');

  const showSuccessPopup = (message) => {
    if (successPopup) {
      const popupText = successPopup.querySelector('span');
      if (popupText) popupText.textContent = message;
      successPopup.classList.add('active');
      setTimeout(() => {
        successPopup.classList.remove('active');
      }, 3500);
    }
  };

  forms.forEach(form => {
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Form fields validation
      const nameInput = form.querySelector('[name="name"]');
      const phoneInput = form.querySelector('[name="phone"]');
      const eventSelect = form.querySelector('[name="event-type"]');
      const quantityInput = form.querySelector('[name="quantity"]');
      const messageInput = form.querySelector('[name="message"]');

      if (!nameInput || !phoneInput || !eventSelect || !quantityInput) return;

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const eventType = eventSelect.value;
      const quantity = quantityInput.value.trim();
      const message = messageInput ? messageInput.value.trim() : '';

      // Validation
      if (!name || !phone || !eventType || !quantity) {
        alert('Please fill out all required fields.');
        return;
      }

      // Format WhatsApp Message
      const whatsappBaseNumber = '917989202194'; // Official business phone number
      const textMessage = `Hi Hampers Nest!\n\nI would like to request a quote for customized hampers:\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Event Type:* ${eventType}\n*Quantity:* ${quantity}\n*Message:* ${message || 'N/A'}`;
      
      const encodedText = encodeURIComponent(textMessage);
      const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappBaseNumber}&text=${encodedText}`;

      // Close modal if open
      if (form.id === 'modalInquiryForm') closeInquiryModal();

      showSuccessPopup('Thank you! Redirecting you to WhatsApp...');

      setTimeout(() => {
        window.open(whatsappURL, '_blank');
        form.reset();
      }, 1800);
    });
  });

  // Direct CTA WhatsApp hooks
  const whatsappDirectButtons = document.querySelectorAll('.whatsapp-direct');
  whatsappDirectButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const whatsappBaseNumber = '917989202194';
      const welcomeText = encodeURIComponent('Hi Hampers Nest! I am interested in viewing your customized Return Gifts collection and getting a catalog.');
      window.open(`https://api.whatsapp.com/send?phone=${whatsappBaseNumber}&text=${welcomeText}`, '_blank');
    });
  });

});
