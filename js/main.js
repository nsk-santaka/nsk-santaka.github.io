// NSK Santaka - JavaScript funkcionalumai

document.addEventListener('DOMContentLoaded', function() {
  // Mobilios navigacijos valdymas
  initMobileNav();
  
  // Galerijos lightbox
  initLightbox();
  
  // Smooth scroll
  initSmoothScroll();
  
  // Animacijos scroll metu
  initScrollAnimations();
});

// ============================================
// Mobili navigacija
// ============================================
function initMobileNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  
  if (!navToggle || !nav) return;
  
  navToggle.addEventListener('click', function() {
    nav.classList.toggle('open');
    navToggle.classList.toggle('active');
    
    // Aria accessibility
    const isOpen = nav.classList.contains('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  
  // Uždaryti navigaciją paspaudus ant nuorodos
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
      nav.classList.remove('open');
      navToggle.classList.remove('active');
    });
  });
  
  // Uždaryti navigaciją paspaudus už jos ribų
  document.addEventListener('click', function(e) {
    if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
      nav.classList.remove('open');
      navToggle.classList.remove('active');
    }
  });
}

// ============================================
// Galerijos Lightbox
// ============================================
function initLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (galleryItems.length === 0) return;
  
  // Sukurti lightbox elementą jei jo nėra
  let lightbox = document.querySelector('.lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Uždaryti">×</button>
      <img src="" alt="">
    `;
    document.body.appendChild(lightbox);
  }
  
  const lightboxImg = lightbox.querySelector('img');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  
  // Atidaryti lightbox
  galleryItems.forEach(item => {
    item.addEventListener('click', function() {
      const img = this.querySelector('img');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });
  
  // Uždaryti lightbox
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  lightboxClose.addEventListener('click', closeLightbox);
  
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
  
  // Uždaryti ESC klavišu
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

// ============================================
// Smooth Scroll
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ============================================
// Scroll animacijos
// ============================================
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Stebėti elementus su .animate-on-scroll klase
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// ============================================
// Pagalbinės funkcijos
// ============================================

// Formatuoti datą lietuviškai
function formatDateLT(date) {
  const months = [
    'sausio', 'vasario', 'kovo', 'balandžio', 'gegužės', 'birželio',
    'liepos', 'rugpjūčio', 'rugsėjo', 'spalio', 'lapkričio', 'gruodžio'
  ];
  
  const d = new Date(date);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Kopijuoti tekstą į iškarpinę
function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = button.textContent;
    button.textContent = 'Nukopijuota!';
    button.disabled = true;
    
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  });
}
