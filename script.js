// ─────────────────────────────────────────────────────────────
// Diotranics Enterprises – main script
// ─────────────────────────────────────────────────────────────

// ── Current year ──────────────────────────────────────────────
document.getElementById('currentYear').textContent = new Date().getFullYear();

// ── Navbar elements ───────────────────────────────────────────
const navbar       = document.getElementById('navbar');
const mobileToggle = document.getElementById('mobileToggle');
const navLinks     = document.getElementById('navLinks');

// Mobile menu toggle
mobileToggle.addEventListener('click', () => {
  mobileToggle.classList.toggle('active');
  navLinks.classList.toggle('mobile-open');
});
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileToggle.classList.remove('active');
    navLinks.classList.remove('mobile-open');
  });
});

// Navbar scroll opacity
window.addEventListener('scroll', () => {
  navbar.style.backgroundColor = window.scrollY > 50
    ? 'rgba(17, 19, 23, 0.98)'
    : 'rgba(17, 19, 23, 0.9)';
}, { passive: true });

// ── Hero Carousel ─────────────────────────────────────────────
const carouselTrack = document.getElementById('carouselTrack');
const carouselDots  = document.querySelectorAll('.carousel-dot');
const carousel      = document.getElementById('carousel');
const totalSlides   = 3;
let currentSlide    = 0;
let carouselInterval;

function goToSlide(index) {
  currentSlide = index;
  carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  carouselDots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}
function nextSlide()    { goToSlide((currentSlide + 1) % totalSlides); }
function startCarousel(){ carouselInterval = setInterval(nextSlide, 5000); }
function stopCarousel() { clearInterval(carouselInterval); }

startCarousel();
carouselDots.forEach((dot, i) => {
  dot.addEventListener('click', () => { stopCarousel(); goToSlide(i); startCarousel(); });
});
carousel.addEventListener('mouseenter', stopCarousel);
carousel.addEventListener('mouseleave', startCarousel);

// Carousel touch swipe
let cTouchStartX = 0;
carousel.addEventListener('touchstart', e => { cTouchStartX = e.changedTouches[0].screenX; stopCarousel(); }, { passive: true });
carousel.addEventListener('touchend',   e => {
  const diff = cTouchStartX - e.changedTouches[0].screenX;
  if (Math.abs(diff) > 50) goToSlide(diff > 0
    ? (currentSlide + 1) % totalSlides
    : (currentSlide - 1 + totalSlides) % totalSlides);
  startCarousel();
}, { passive: true });

// ── Smooth scroll helpers ──────────────────────────────────────
function scrollToSection(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── WhatsApp helper ────────────────────────────────────────────
function openWhatsApp() {
  const msg = encodeURIComponent('Hello Diotranics Enterprises Limited, I would like to inquire about your services.');
  window.open(`https://wa.me/254721423793?text=${msg}`, '_blank');
}

// ─────────────────────────────────────────────────────────────
// All DOM-dependent features
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {

  // ── Scroll reveal ────────────────────────────────────────────
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => revealObs.observe(el));

  // Stagger service items per grid
  const gridObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.service-item').forEach((item, i) => {
          setTimeout(() => item.classList.add('revealed'), i * 75);
        });
        gridObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('.service-items-grid').forEach(g => gridObs.observe(g));

  // Legacy fade-in for contact cards
  const legacyObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.contact-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    legacyObs.observe(el);
  });

  // ── Collapsible portfolio sections ───────────────────────────
  document.querySelectorAll('.portfolio-grid').forEach(g => g.classList.add('collapsed'));

  document.querySelectorAll('.expand-btn').forEach(button => {
    button.addEventListener('click', function () {
      const service  = this.getAttribute('data-service');
      const grid     = document.querySelector(`.portfolio-grid[data-service="${service}"]`);
      const wasOpen  = grid.classList.contains('expanded');

      grid.classList.toggle('expanded', !wasOpen);
      grid.classList.toggle('collapsed', wasOpen);

      const expandText = this.querySelector('.expand-text');
      if (!wasOpen) {
        expandText.textContent = 'View Less';
        this.classList.add('expanded');
        // Scroll to the specific portfolio section
        const specificPortfolio = document.querySelector(`.service-portfolio[data-service="${service}"]`);
        if (specificPortfolio) {
          setTimeout(() => specificPortfolio.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
        }
      } else {
        expandText.textContent = 'View More Projects';
        this.classList.remove('expanded');
      }
    });
  });

  // ── Lightbox ──────────────────────────────────────────────────
  const lightboxOverlay    = document.getElementById('lightboxOverlay');
  const lightboxImg        = document.getElementById('lightboxImg');
  const lightboxClose      = document.getElementById('lightboxClose');
  const lightboxPrev       = document.getElementById('lightboxPrev');
  const lightboxNext       = document.getElementById('lightboxNext');
  const lightboxTitle      = document.getElementById('lightboxTitle');
  const lightboxCategory   = document.getElementById('lightboxCategory');
  const lightboxLocationText = document.getElementById('lightboxLocationText');
  const lightboxCounter    = document.getElementById('lightboxCounter');

  let allLightboxCards      = [];
  let currentLightboxIndex  = 0;

  function openLightbox(card) {
    allLightboxCards     = Array.from(document.querySelectorAll('.project-card[data-lightbox="true"]'));
    currentLightboxIndex = allLightboxCards.indexOf(card);
    showLightboxSlide(currentLightboxIndex);
    lightboxOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightboxOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showLightboxSlide(index) {
    const card     = allLightboxCards[index];
    const img      = card.querySelector('img');
    lightboxImg.classList.add('loading');
    lightboxTitle.textContent        = card.dataset.title    || '';
    lightboxCategory.textContent     = card.dataset.category || '';
    lightboxLocationText.textContent = card.dataset.location || '';
    lightboxCounter.textContent      = `${index + 1} / ${allLightboxCards.length}`;
    const newImg = new Image();
    newImg.onload = () => { lightboxImg.src = newImg.src; lightboxImg.classList.remove('loading'); };
    newImg.src = img.src;
  }

  document.querySelectorAll('.project-card[data-lightbox="true"]').forEach(card => {
    card.addEventListener('click', () => openLightbox(card));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click',  e => { e.stopPropagation(); currentLightboxIndex = (currentLightboxIndex - 1 + allLightboxCards.length) % allLightboxCards.length; showLightboxSlide(currentLightboxIndex); });
  lightboxNext.addEventListener('click',  e => { e.stopPropagation(); currentLightboxIndex = (currentLightboxIndex + 1) % allLightboxCards.length; showLightboxSlide(currentLightboxIndex); });
  lightboxOverlay.addEventListener('click', e => { if (e.target === lightboxOverlay) closeLightbox(); });

  let lbTouchX = 0;
  lightboxOverlay.addEventListener('touchstart', e => { lbTouchX = e.changedTouches[0].screenX; }, { passive: true });
  lightboxOverlay.addEventListener('touchend',   e => {
    const diff = lbTouchX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      currentLightboxIndex = diff > 0
        ? (currentLightboxIndex + 1) % allLightboxCards.length
        : (currentLightboxIndex - 1 + allLightboxCards.length) % allLightboxCards.length;
      showLightboxSlide(currentLightboxIndex);
    }
  }, { passive: true });

  // ── Interactive Service Tile Expansion ───────────────────────
  const tilePanelBackdrop = document.getElementById('tilePanelBackdrop');
  const tilePanel         = document.getElementById('tilePanel');
  const tilePanelClose    = document.getElementById('tilePanelClose');
  const tilePanelIconWrap = document.getElementById('tilePanelIconWrap');
  const tilePanelCategory = document.getElementById('tilePanelCategory');
  const tilePanelTitle    = document.getElementById('tilePanelTitle');
  const tilePanelDetail   = document.getElementById('tilePanelDetail');
  const tilePanelBullets  = document.getElementById('tilePanelBullets');

  const categoryLabels = {
    borehole:   'Borehole Services',
    solar:      'Solar Services',
    electrical: 'Electrical Services'
  };

  // Map the clicked tile's screen centre to a transform-origin on the panel,
  // so the scale animation grows from that direction
  function getTransformOrigin(rect) {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const tx = rect.left + rect.width  / 2;
    const ty = rect.top  + rect.height / 2;
    const pw = Math.min(640, window.innerWidth * 0.92);
    const ph = 460;
    const ox = Math.max(0, Math.min(100, ((tx - cx) / (pw / 2)) * 50 + 50));
    const oy = Math.max(0, Math.min(100, ((ty - cy) / (ph / 2)) * 50 + 50));
    return `${ox.toFixed(1)}% ${oy.toFixed(1)}%`;
  }

  function openTilePanel(tile) {
    const color      = tile.dataset.color   || 'borehole';
    const title      = tile.dataset.title   || '';
    const detail     = tile.dataset.detail  || '';
    const bulletsRaw = tile.dataset.bullets || '';

    // Clone icon SVG from the tile's icon element
    const iconEl  = tile.querySelector('.service-item-icon');
    tilePanelIconWrap.innerHTML = iconEl ? iconEl.innerHTML : '';

    // Populate text
    tilePanel.dataset.color       = color;
    tilePanelCategory.textContent = categoryLabels[color] || '';
    tilePanelTitle.textContent    = title;
    tilePanelDetail.textContent   = detail;

    // Bullets – split on pipe, decode &amp;
    tilePanelBullets.innerHTML = '';
    if (bulletsRaw) {
      bulletsRaw.split('|').forEach(raw => {
        const li = document.createElement('li');
        li.textContent = raw.replace(/&amp;/g, '&').trim();
        tilePanelBullets.appendChild(li);
      });
    }

    // Anchor grow-from-tile animation origin
    const rect = tile.getBoundingClientRect();
    tilePanel.style.transformOrigin = getTransformOrigin(rect);

    // Show
    tilePanelBackdrop.classList.add('active');
    // Tiny rAF delay ensures the panel is painted at scale(0.35) before
    // the 'open' class triggers the transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        tilePanel.classList.add('open');
      });
    });
    document.body.style.overflow = 'hidden';
  }

  function closeTilePanel() {
    tilePanel.classList.remove('open');
    tilePanelBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Attach click + keyboard to every tile
  document.querySelectorAll('.service-item[data-tile="true"]').forEach(tile => {
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('role', 'button');
    tile.setAttribute('aria-haspopup', 'dialog');

    tile.addEventListener('click', () => openTilePanel(tile));
    tile.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTilePanel(tile); }
    });
  });

  tilePanelClose.addEventListener('click', closeTilePanel);
  tilePanelBackdrop.addEventListener('click', closeTilePanel);

  // Swipe-down on mobile to dismiss
  let tpTouchStartY = 0;
  tilePanel.addEventListener('touchstart', e => { tpTouchStartY = e.changedTouches[0].clientY; }, { passive: true });
  tilePanel.addEventListener('touchend',   e => {
    if (e.changedTouches[0].clientY - tpTouchStartY > 80) closeTilePanel();
  }, { passive: true });

  // ── Unified keyboard handler ──────────────────────────────────
  // Escape closes whichever panel is active; arrow keys drive lightbox when it's open
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (tilePanel.classList.contains('open'))         closeTilePanel();
      else if (lightboxOverlay.classList.contains('active')) closeLightbox();
      return;
    }
    if (lightboxOverlay.classList.contains('active')) {
      if (e.key === 'ArrowLeft')  { currentLightboxIndex = (currentLightboxIndex - 1 + allLightboxCards.length) % allLightboxCards.length; showLightboxSlide(currentLightboxIndex); }
      if (e.key === 'ArrowRight') { currentLightboxIndex = (currentLightboxIndex + 1) % allLightboxCards.length; showLightboxSlide(currentLightboxIndex); }
    }
  });

}); // end DOMContentLoaded