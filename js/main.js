// NSK Santaka - JavaScript funkcionalumai

document.addEventListener('DOMContentLoaded', function () {
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

  navToggle.addEventListener('click', function () {
    nav.classList.toggle('open');
    navToggle.classList.toggle('active');

    // Aria accessibility
    const isOpen = nav.classList.contains('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Uždaryti navigaciją paspaudus ant nuorodos
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      navToggle.classList.remove('active');
    });
  });

  // Uždaryti navigaciją paspaudus už jos ribų
  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
      nav.classList.remove('open');
      navToggle.classList.remove('active');
    }
  });
}

// ============================================
// Galerijos Lightbox
// ============================================
// ============================================
// Galerijos Lightbox
// ============================================
function initLightbox() {
  let lightbox = document.querySelector('.lightbox');

  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Uždaryti">×</button>
      <button class="lightbox-nav lightbox-prev" aria-label="Ankstesnė">❮</button>
      <button class="lightbox-nav lightbox-next" aria-label="Kita">❯</button>
      <img src="" alt="">
    `;
    document.body.appendChild(lightbox);
  }

  const lightboxImg = lightbox.querySelector('img');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  const btnPrev = lightbox.querySelector('.lightbox-prev');
  const btnNext = lightbox.querySelector('.lightbox-next');

  let currentImages = []; // Saugosime rodomų nuotraukų sąrašą
  let currentIndex = 0;

  // Atidaryti lightbox
  document.body.addEventListener('click', function (e) {
    const item = e.target.closest('.gallery-item');
    if (!item) return;

    // Tikriname, ar tai kategorijos kortelė - jei taip, nieko nedarome (ji turi savo click handlerį)
    if (item.classList.contains('category-card')) return;

    // Sudarome esamą nuotraukų sąrašą iš DOM
    const visibleItems = Array.from(document.querySelectorAll('#gallery-container .gallery-item img'));
    if (visibleItems.length === 0) return;

    const clickedImg = item.querySelector('img');
    if (!clickedImg) return;

    currentImages = visibleItems.map(img => ({
      src: img.dataset.full || img.src,
      alt: img.alt
    }));

    // Randame paspaustos nuotraukos indeksą
    // Lyginame pagal src arba thumbnail src, nes objektų nuorodos gali skirtis
    currentIndex = visibleItems.findIndex(img => img === clickedImg);
    if (currentIndex === -1) currentIndex = 0;

    showImage(currentIndex);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  function showImage(index) {
    if (currentImages.length === 0) return;

    // Ciklinis rodimas
    if (index < 0) index = currentImages.length - 1;
    if (index >= currentImages.length) index = 0;

    currentIndex = index;

    // Prieš keičiant šaltinį, trumpam paslepiame, kad nesimatytų "mirgėjimo"
    lightboxImg.style.opacity = '0.5';

    setTimeout(() => {
      const imageData = currentImages[currentIndex];
      lightboxImg.src = imageData.src;
      lightboxImg.alt = imageData.alt;
      lightboxImg.style.opacity = '1';
    }, 150);
  }

  // Navigacija
  function prevImage(e) {
    e.stopPropagation();
    showImage(currentIndex - 1);
  }

  function nextImage(e) {
    e.stopPropagation();
    showImage(currentIndex + 1);
  }

  btnPrev.addEventListener('click', prevImage);
  btnNext.addEventListener('click', nextImage);

  // Uždarymas
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    currentImages = []; // Išvalome, kad neužimtų atminties
  }

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Klaviatūros valdymas
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
}

// ============================================
// Smooth Scroll
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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
