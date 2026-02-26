// ========================================
// BELLURE — Premium interactions v4
// Depth. Layers. Luxe.
// ========================================

// ---- Cursor glow follow ----
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow && window.innerWidth > 1024) {
  let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorGlow.classList.add('active');
  });
  function animateGlow() {
    glowX += (mouseX - glowX) * 0.06;
    glowY += (mouseY - glowY) * 0.06;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
  document.addEventListener('mouseleave', () => cursorGlow.classList.remove('active'));
}

// ---- Smooth scroll (lerp-based, desktop only) ----
class SmoothScroll {
  constructor() {
    this.targetY = window.scrollY;
    this.currentY = window.scrollY;
    this.ease = 0.075;
    this.isRunning = false;
    this.enabled = !('ontouchstart' in window) && window.innerWidth > 768;
    if (this.enabled) this.init();
  }
  init() {
    window.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.targetY = Math.max(0, Math.min(
        this.targetY + e.deltaY * 0.8,
        document.body.scrollHeight - window.innerHeight
      ));
      if (!this.isRunning) this.animate();
    }, { passive: false });
    window.addEventListener('scroll', () => {
      if (!this.isRunning) { this.targetY = window.scrollY; this.currentY = window.scrollY; }
    }, { passive: true });
  }
  animate() {
    this.isRunning = true;
    this.currentY += (this.targetY - this.currentY) * this.ease;
    if (Math.abs(this.targetY - this.currentY) < 0.5) {
      this.currentY = this.targetY;
      window.scrollTo(0, this.currentY);
      this.isRunning = false;
      return;
    }
    window.scrollTo(0, this.currentY);
    requestAnimationFrame(() => this.animate());
  }
  scrollTo(y) { this.targetY = y; if (!this.isRunning) this.animate(); }
}
const smoothScroll = new SmoothScroll();

// ---- Scroll reveal ----
const revealElements = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => entry.target.classList.add('revealed'));
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
);
revealElements.forEach((el) => revealObserver.observe(el));

// ---- Nav scroll effect ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

// ---- Smooth anchor links ----
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const targetEl = document.querySelector(anchor.getAttribute('href'));
    if (targetEl) {
      e.preventDefault();
      const y = targetEl.getBoundingClientRect().top + window.scrollY - 80;
      if (smoothScroll.enabled) smoothScroll.scrollTo(y);
      else window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});

// ---- Parallax depth system ----
const parallaxElements = document.querySelectorAll('[data-parallax-speed]');
const heroContent = document.querySelector('.hero-content');
const heroVisual = document.querySelector('.hero-visual');
const depthOrbs = document.querySelectorAll('.depth-orb');

function updateParallax() {
  const scrollY = window.scrollY;
  const vh = window.innerHeight;

  // Hero parallax
  if (heroContent && scrollY < vh * 1.2) {
    const progress = scrollY / vh;
    heroContent.style.transform = `translateY(${scrollY * 0.2}px)`;
    heroContent.style.opacity = 1 - progress * 1.5;
    if (heroVisual) {
      heroVisual.style.transform = `translateY(${scrollY * 0.1}px)`;
      heroVisual.style.opacity = 1 - progress * 1.2;
    }
  }

  // Depth orbs — move at different speeds for layered feel
  depthOrbs.forEach((orb, i) => {
    const speed = parseFloat(orb.dataset.parallaxSpeed) || 0.03;
    orb.style.transform = `translateY(${scrollY * speed * (i % 2 === 0 ? -1 : 1)}px)`;
  });

  // Generic parallax elements
  parallaxElements.forEach((el) => {
    const speed = parseFloat(el.dataset.parallaxSpeed) || 0.05;
    const rect = el.getBoundingClientRect();
    const centerOffset = (rect.top + rect.height / 2 - vh / 2) / vh;
    el.style.transform = `translateY(${centerOffset * speed * vh * -1}px)`;
  });
}

if (window.innerWidth > 768) {
  window.addEventListener('scroll', updateParallax, { passive: true });
  updateParallax();
}

// ---- Floating card bob animation ----
document.querySelectorAll('.hero-float').forEach((el, i) => {
  el.style.animation = `floatBob ${3 + i * 0.5}s ease-in-out infinite ${i * 0.8}s`;
});

// ---- Card tilt on hover (desktop) ----
if (window.innerWidth > 1024) {
  document.querySelectorAll('.feature-block, .salon-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-4px) perspective(800px) rotateX(${y * -5}deg) rotateY(${x * 5}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ---- Animated counter for stats ----
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        if (target) {
          let current = 0;
          const step = Math.ceil(target / 30);
          const interval = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(interval); }
            el.textContent = current;
          }, 40);
        }
        countObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

// ---- Section divider glow on scroll ----
const dividers = document.querySelectorAll('.section-divider-line');
const dividerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '0.5';
        entry.target.style.height = '80px';
      }
    });
  },
  { threshold: 0.5 }
);
dividers.forEach((d) => {
  d.style.transition = 'opacity 1s ease, height 1s ease';
  d.style.opacity = '0';
  d.style.height = '0';
  dividerObserver.observe(d);
});

// ---- Salon cards scroll dots ----
const salonsGrid = document.querySelector('.salons-grid');
const salonDots = document.querySelectorAll('.scroll-dot');

if (salonsGrid && salonDots.length) {
  salonsGrid.addEventListener('scroll', () => {
    const cards = salonsGrid.querySelectorAll('.salon-card');
    const scrollLeft = salonsGrid.scrollLeft;
    const cardWidth = cards[0]?.offsetWidth + 16; // gap
    const activeIndex = Math.round(scrollLeft / cardWidth);

    salonDots.forEach((dot, i) => {
      dot.classList.toggle('scroll-dot--active', i === activeIndex);
    });
  }, { passive: true });
}

// ---- Mobile menu ----
const hamburger = document.getElementById('navHamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open');
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ---- Fallback reveal ----
setTimeout(() => {
  revealElements.forEach((el) => {
    if (!el.classList.contains('revealed') && el.getBoundingClientRect().top < window.innerHeight + 100) {
      el.classList.add('revealed');
    }
  });
}, 3500);
