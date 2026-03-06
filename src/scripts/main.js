// ========================================
// BELLURE — Interactive pricing + smooth UX
// ========================================

// ---- Scroll reveal ----
const animatedEls = document.querySelectorAll('[data-animate]');

if ('IntersectionObserver' in window && animatedEls.length > 0) {
  document.documentElement.classList.add('js-animate-ready');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || 0;
          setTimeout(() => entry.target.classList.add('visible'), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  );

  animatedEls.forEach((el) => observer.observe(el));

  // Safety: if elements still hidden after 3s, disable animations entirely
  setTimeout(() => {
    const stillHidden = document.querySelector('[data-animate]:not(.visible)');
    if (stillHidden) document.documentElement.classList.remove('js-animate-ready');
  }, 3000);
}

// ---- Nav scroll ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ---- Smooth anchor links ----
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const t = document.querySelector(href);
    if (t) {
      e.preventDefault();
      // If menu is open, close it first, then scroll
      if (menuOpen) {
        closeMenu();
        setTimeout(() => {
          window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
        }, 200);
      } else {
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
      }
    }
  });
});

// ---- Mobile menu ----
const hamburger = document.getElementById('navHamburger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

function openMenu() {
  menuOpen = true;
  mobileMenu.classList.add('open');
  hamburger.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  menuOpen = false;
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburger && mobileMenu) {
  // Use a flag to debounce rapid toggles
  let toggling = false;

  hamburger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (toggling) return;
    toggling = true;

    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }

    // Debounce for 400ms to prevent double-fires
    setTimeout(() => { toggling = false; }, 400);
  });

  // Prevent ghost click / double tap on touch devices
  hamburger.addEventListener('touchend', (e) => {
    e.preventDefault();
  });

  // Close menu when clicking a link inside it
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (!menuOpen) return;
      e.stopPropagation();
      closeMenu();
    });
  });

  // Close menu when clicking the overlay background
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu || e.target.classList.contains('mobile-menu-inner')) {
      closeMenu();
    }
  });
}

// ---- Step line animation ----
const lineObs = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('revealed'); lineObs.unobserve(e.target); }
  }),
  { threshold: 0.5 }
);
document.querySelectorAll('.step-line').forEach((el) => lineObs.observe(el));

// ========================================
// BILLING TOGGLE + PRICING CONFIGURATOR
// ========================================
const toggleMonth = document.getElementById('toggleMonth');
const toggleYear = document.getElementById('toggleYear');
const toggleSlider = document.getElementById('toggleSlider');
const billingToggle = document.getElementById('billingToggle');

let isYearly = false;

function positionSlider() {
  if (!toggleSlider || !toggleMonth || !toggleYear) return;
  const target = isYearly ? toggleYear : toggleMonth;
  const rect = target.getBoundingClientRect();
  const parentRect = billingToggle.getBoundingClientRect();
  toggleSlider.style.left = (rect.left - parentRect.left) + 'px';
  toggleSlider.style.width = rect.width + 'px';

  toggleMonth.classList.toggle('toggle-option--active', !isYearly);
  toggleYear.classList.toggle('toggle-option--active', isYearly);
}

toggleMonth?.addEventListener('click', () => { isYearly = false; positionSlider(); updatePricing(); });
toggleYear?.addEventListener('click', () => { isYearly = true; positionSlider(); updatePricing(); });

// Position slider on load
requestAnimationFrame(() => {
  positionSlider();
  updatePricing();
});

// Also reposition on resize
window.addEventListener('resize', positionSlider);

// ---- Pricing state ----
const PRICES = {
  base:    { monthly: 14.95, yearly: 11.96 },
  booking: { monthly: 19.95, yearly: 15.96 },
  cms:     { monthly: 3.95,  yearly: 3.16 },
  email:   { monthly: 3.95,  yearly: 3.16 },
  seo_basic: { monthly: 0, yearly: 0 },
  support: { monthly: 9.99, yearly: 7.99 },
};

function getActiveAddons() {
  const addons = ['base']; // always included
  if (document.getElementById('addonBooking')?.checked) addons.push('booking');
  if (document.getElementById('addonCms')?.checked) addons.push('cms');
  if (document.getElementById('addonEmail')?.checked) addons.push('email');

  const seoVal = document.querySelector('input[name="seo"]:checked')?.value;
  if (seoVal === 'basic') addons.push('seo_basic');
  // seo_pro = op aanvraag, no price

  if (document.getElementById('addonSupport')?.checked) addons.push('support');
  return addons;
}

function formatPrice(n) {
  return '€ ' + n.toFixed(2).replace('.', ',');
}

function animateNumber(el, newText) {
  el.style.transform = 'translateY(-4px)';
  el.style.opacity = '0.5';
  setTimeout(() => {
    el.textContent = newText;
    el.style.transform = 'translateY(0)';
    el.style.opacity = '1';
  }, 150);
}

function updatePricing() {
  const addons = getActiveAddons();
  const period = isYearly ? 'yearly' : 'monthly';

  // Update individual config-price elements
  document.querySelectorAll('.config-price').forEach((el) => {
    const m = el.dataset.monthly;
    const y = el.dataset.yearly;
    if (m && y) el.textContent = formatPrice(parseFloat(isYearly ? y : m));
  });

  // Update SEO option prices
  document.querySelectorAll('.seo-option-price').forEach((el) => {
    const m = el.dataset.monthly;
    const y = el.dataset.yearly;
    if (m && y) {
      const value = parseFloat(isYearly ? y : m);
      el.textContent = value === 0 ? 'Gratis' : (formatPrice(value) + '/mnd');
    }
  });

  // Update standalone price
  document.querySelectorAll('.standalone-price-amount').forEach((el) => {
    const m = el.dataset.monthly;
    const y = el.dataset.yearly;
    if (m && y) el.textContent = formatPrice(parseFloat(isYearly ? y : m));
  });

  // Calculate total
  let total = 0;
  let hasSeoProRequest = false;

  addons.forEach((key) => {
    if (PRICES[key]) total += PRICES[key][period];
  });

  const seoVal = document.querySelector('input[name="seo"]:checked')?.value;
  if (seoVal === 'pro') hasSeoProRequest = true;

  // Build summary items
  const summaryEl = document.getElementById('summaryItems');
  const items = [
    { name: 'Website', key: 'base', active: true },
    { name: 'Online boeken', key: 'booking', active: addons.includes('booking') },
    { name: 'Zelf aanpassen', key: 'cms', active: addons.includes('cms') },
    { name: 'Zakelijke e-mail', key: 'email', active: addons.includes('email') },
    { name: 'SEO Goed', key: 'seo_basic', active: addons.includes('seo_basic') },
    { name: 'Premium support', key: 'support', active: addons.includes('support') },
  ];

  // Only show active items + SEO Pro if selected
  summaryEl.innerHTML = items
    .filter(i => i.active)
    .map(i => {
      const value = PRICES[i.key][period];
      const label = value === 0 ? 'Gratis' : formatPrice(value);
      return `
      <div class="summary-item">
        <span class="summary-item-name">${i.name}</span>
        <span class="summary-item-price">${label}</span>
      </div>
    `;
    }).join('');

  if (hasSeoProRequest) {
    summaryEl.innerHTML += `
      <div class="summary-item">
        <span class="summary-item-name">SEO Best</span>
        <span class="summary-item-price">Op aanvraag</span>
      </div>
    `;
  }

  // Update total
  const totalEl = document.getElementById('totalAmount');
  if (totalEl) animateNumber(totalEl, formatPrice(total));

  // Update yearly total
  const yearlyEl = document.getElementById('yearlyAmount');
  const yearlyRow = document.getElementById('summaryYearly');
  if (yearlyEl && yearlyRow) {
    if (isYearly) {
      yearlyRow.style.display = 'flex';
      yearlyEl.textContent = formatPrice(total * 12);
    } else {
      yearlyRow.style.display = 'none';
    }
  }
}

// Listen to all config changes
document.querySelectorAll('.config-checkbox, .seo-radio').forEach((input) => {
  input.addEventListener('change', updatePricing);
});

// ---- Expandable cards ----
document.querySelectorAll('.config-expand-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const targetId = btn.dataset.target;
    const expandEl = targetId
      ? document.getElementById(targetId)
      : btn.closest('.config-card')?.querySelector('.config-expand');

    if (!expandEl) return;

    const isOpen = expandEl.classList.contains('open');
    btn.classList.toggle('open', !isOpen);
    expandEl.classList.toggle('open', !isOpen);

    if (!isOpen) {
      expandEl.style.maxHeight = expandEl.scrollHeight + 'px';
    } else {
      expandEl.style.maxHeight = '0';
    }
  });
});

// ---- Fallback reveal ----
setTimeout(() => {
  animatedEls.forEach((el) => {
    if (!el.classList.contains('visible') && el.getBoundingClientRect().top < window.innerHeight + 50) {
      el.classList.add('visible');
    }
  });
}, 2500);
