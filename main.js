/* ==========================================================================
   Noctix NFT Main Javascript File
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. SCROLL-LINKED ZOOM & FADE LOGIC (HERO)
  // ==========================================
  const scrollWrapper = document.getElementById('scroll-wrapper');
  const heroVideo = document.getElementById('hero-video');
  const videoOverlay = document.getElementById('video-overlay');
  const heroTitle = document.getElementById('hero-title');
  const heroTagline = document.getElementById('hero-tagline');
  const heroPortalBtn = document.getElementById('hero-portal-btn');
  const scrollIndicator = document.getElementById('scroll-indicator');
  
  // Set up animation limits
  const startScale = 4.5;
  const endScale = 1.0;
  const startOverlay = 0.2;
  const endOverlay = 0.85;
  
  // Set the height of the scroll runway for the zoom effect
  // Let the zoom animation run for 1.2x of the screen height
  const zoomDuration = window.innerHeight * 1.2;
  
  function updateScrollAnimation() {
    const scrollTop = window.scrollY;
    
    // Calculate progress as a fraction between 0 and 1
    let progress = scrollTop / zoomDuration;
    progress = Math.min(Math.max(progress, 0), 1); // Clamp between 0 and 1
    
    // 1. Interpolate scale of the background video
    const currentScale = startScale - (progress * (startScale - endScale));
    heroVideo.style.setProperty('--zoom-scale', currentScale);
    
    // 2. Interpolate overlay opacity to darken background as content scrolls up
    const currentOverlay = startOverlay + (progress * (endOverlay - startOverlay));
    heroVideo.style.setProperty('--overlay-opacity', currentOverlay);
    
    // 3. Fade out and scale down hero text
    const textOpacity = Math.max(0, 1 - progress * 1.4);
    const textScale = 1 - progress * 0.15;
    const textTranslateY = progress * -50; // Slide up slightly
    
    if (heroTitle) {
      heroTitle.style.opacity = textOpacity;
      heroTitle.style.transform = `scale(${textScale}) translateY(${textTranslateY}px)`;
    }
    if (heroTagline) {
      heroTagline.style.opacity = textOpacity;
      heroTagline.style.transform = `translateY(${textTranslateY}px)`;
    }
    if (heroPortalBtn) {
      heroPortalBtn.style.opacity = textOpacity;
      heroPortalBtn.style.transform = `translateY(${textTranslateY}px)`;
      if (textOpacity === 0) {
        heroPortalBtn.style.pointerEvents = 'none';
      } else {
        heroPortalBtn.style.pointerEvents = 'auto';
      }
    }
    
    // 4. Fade out scroll indicator quickly
    if (scrollIndicator) {
      const indicatorOpacity = Math.max(0, 1 - (scrollTop / 200));
      scrollIndicator.style.opacity = indicatorOpacity;
      if (indicatorOpacity === 0) {
        scrollIndicator.style.pointerEvents = 'none';
      } else {
        scrollIndicator.style.pointerEvents = 'auto';
      }
    }
  }
  
  // Run on scroll
  window.addEventListener('scroll', () => {
    // Use requestAnimationFrame for high performance rendering
    requestAnimationFrame(updateScrollAnimation);
  });
  
  // Run once initially to set starting values
  updateScrollAnimation();

  // ==========================================
  // 2. NAVBAR STICKY & ACTIVE SCROLL
  // ==========================================
  const navbar = document.getElementById('navbar');
  
  function handleNavbarState() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  
  window.addEventListener('scroll', handleNavbarState);
  handleNavbarState();

  // Mobile Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    if (navMenu.classList.contains('active')) {
      icon.className = 'fa-solid fa-xmark';
    } else {
      icon.className = 'fa-solid fa-bars';
    }
  });
  
  // Close menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      menuToggle.querySelector('i').className = 'fa-solid fa-bars';
    });
  });



  // ==========================================
  // 5. FAQ ACCORDION TRANSITIONS
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Collapse other items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-answer').style.maxHeight = null;
      });
      
      if (!isActive) {
        item.classList.add('active');
        // Set max-height equal to scrollHeight of content for smooth CSS animation
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ==========================================
  // 6. SCROLL REVEAL SYSTEM (INTERSECTION OBSERVER)
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal-el');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Stop observing once revealed to maintain state
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });
  
  revealElements.forEach(el => {
    revealObserver.observe(el);
  });



});
