/* ═══════════════════════════════════════════════
   HERACLES — DIGITAL STORE | script.js
   All interactions, animations & UI behaviors
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────
     NAVBAR — sticky scroll + highlight
  ───────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function handleNavScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link highlight
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href').replace('#', '');
      if (href === current) link.classList.add('active');
    });
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ─────────────────────────────────
     MOBILE MENU — hamburger toggle
  ───────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });

  /* ─────────────────────────────────
     SMOOTH SCROLL — anchor links
  ───────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-h')) || 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ─────────────────────────────────
     SCROLL ANIMATIONS — fade-in
  ───────────────────────────────── */
  const fadeEls = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  fadeEls.forEach(el => observer.observe(el));

  /* ─────────────────────────────────
     REVIEW SLIDER / CAROUSEL
  ───────────────────────────────── */
  const slider = document.getElementById('reviewSlider');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('sliderDots');

  if (slider && prevBtn && nextBtn && dotsContainer) {
    const cards = slider.querySelectorAll('.review-card');
    const total = cards.length;
    let current = 0;
    let autoInterval;
    let cardWidth = 0;
    let visibleCount = 1;

    // Build dots
    function buildDots() {
      dotsContainer.innerHTML = '';
      const pages = getPageCount();
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === current ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }

    function getPageCount() {
      const w = slider.parentElement.offsetWidth;
      visibleCount = w >= 900 ? 3 : w >= 600 ? 2 : 1;
      return Math.ceil(total / visibleCount);
    }

    function updateSlider() {
      const w = slider.parentElement.offsetWidth;
      visibleCount = w >= 900 ? 3 : w >= 600 ? 2 : 1;
      cardWidth = Math.floor((w - (visibleCount - 1) * 24) / visibleCount);

      cards.forEach(card => {
        card.style.flex = '0 0 ' + cardWidth + 'px';
      });

      const maxPage = getPageCount() - 1;
      if (current > maxPage) current = maxPage;
      if (current < 0) current = 0;

      const offset = current * (cardWidth + 24) * visibleCount;
      slider.style.transform = 'translateX(-' + offset + 'px)';
      slider.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

      // Update dots
      const dots = dotsContainer.querySelectorAll('.dot');
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    }

    function goTo(index) {
      const pages = getPageCount();
      current = (index + pages) % pages;
      updateSlider();
      resetAuto();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    // Auto-advance
    function startAuto() {
      autoInterval = setInterval(next, 4500);
    }
    function resetAuto() {
      clearInterval(autoInterval);
      startAuto();
    }

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? next() : prev();
      }
    }, { passive: true });

    // Init
    buildDots();
    updateSlider();
    startAuto();

    window.addEventListener('resize', () => {
      buildDots();
      updateSlider();
    });

    // Pause auto on hover
    slider.addEventListener('mouseenter', () => clearInterval(autoInterval));
    slider.addEventListener('mouseleave', startAuto);
  }

  /* ─────────────────────────────────
     CATALOG CARDS — hover interaction
  ───────────────────────────────── */
  const catCards = document.querySelectorAll('.cat-card');

  catCards.forEach(card => {
    card.addEventListener('mouseenter', function () {
      // Subtle tilt effect on desktop
      if (window.innerWidth > 768) {
        this.style.willChange = 'transform';
      }
    });

    card.addEventListener('mousemove', function (e) {
      if (window.innerWidth <= 768) return;
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = ((y - cy) / cy) * 4;
      const ry = ((x - cx) / cx) * -4;
      this.style.transform = `translateY(-8px) perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });

    card.addEventListener('mouseleave', function () {
      this.style.transform = '';
      this.style.willChange = '';
    });
  });

  /* ─────────────────────────────────
     PRICELIST ROWS — hover highlight
  ───────────────────────────────── */
  const priceRows = document.querySelectorAll('.price-table tbody tr');

  priceRows.forEach(row => {
    row.addEventListener('mouseenter', function () {
      priceRows.forEach(r => r.style.opacity = '0.5');
      this.style.opacity = '1';
    });
    row.addEventListener('mouseleave', () => {
      priceRows.forEach(r => r.style.opacity = '1');
    });
  });

  /* ─────────────────────────────────
     NAVBAR SEARCH — toggle animation
  ───────────────────────────────── */
  const searchBtn = document.querySelector('.nav-search');
  let searchActive = false;

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      searchActive = !searchActive;
      if (searchActive) {
        searchBtn.style.background = 'rgba(244,167,197,0.2)';
        searchBtn.style.borderColor = 'var(--pink)';
        searchBtn.style.color = 'var(--pink-deep)';
      } else {
        searchBtn.style.background = '';
        searchBtn.style.borderColor = '';
        searchBtn.style.color = '';
      }
    });
  }

  /* ─────────────────────────────────
     PARALLAX — hero bg text
  ───────────────────────────────── */
  const heroBgText = document.querySelector('.hero-bg-text');

  if (heroBgText) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const speed = 0.25;
      heroBgText.style.transform = `translate(-50%, calc(-50% + ${scrollY * speed}px))`;
    }, { passive: true });
  }

  /* ─────────────────────────────────
     DECORATIVE ORBs — mouse parallax
  ───────────────────────────────── */
  const deco1 = document.querySelector('.deco-1');
  const deco2 = document.querySelector('.deco-2');

  if (deco1 && deco2) {
    document.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 768) return;
      const mx = (e.clientX / window.innerWidth - 0.5) * 30;
      const my = (e.clientY / window.innerHeight - 0.5) * 20;
      deco1.style.transform = `translate(${mx}px, ${my}px)`;
      deco2.style.transform = `translate(${-mx * 0.5}px, ${-my * 0.5}px)`;
    });
  }

  /* ─────────────────────────────────
     REGULATION CARDS — stagger reveal
  ───────────────────────────────── */
  const regCards = document.querySelectorAll('.reg-card');
  const regObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
        regObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  regCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    regObserver.observe(card);
  });

  /* ─────────────────────────────────
     CTA SECTION — glow on hover
  ───────────────────────────────── */
  const ctaSection = document.querySelector('.cta-section');
  const ctaBtn = document.querySelector('.btn-cta');

  if (ctaSection && ctaBtn) {
    ctaSection.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 768) return;
      const rect = ctaSection.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      ctaSection.style.backgroundImage =
        `radial-gradient(circle at ${x}% ${y}%, rgba(244,167,197,0.12) 0%, transparent 50%),
         linear-gradient(135deg, #2e1e28 0%, #3d1e35 40%, #2a1428 100%)`;
    });
    ctaSection.addEventListener('mouseleave', () => {
      ctaSection.style.backgroundImage = '';
    });
  }

  /* ─────────────────────────────────
     PAYMENT FEATURES — wave in
  ───────────────────────────────── */
  const payFeats = document.querySelectorAll('.pay-feat');
  const payObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
        }, i * 100);
        payObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  payFeats.forEach(feat => {
    feat.style.opacity = '0';
    feat.style.transform = 'translateX(-20px)';
    feat.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    payObserver.observe(feat);
  });

  /* ─────────────────────────────────
     QRIS CARD — glow pulse
  ───────────────────────────────── */
  const qrisCard = document.querySelector('.qris-card');
  if (qrisCard) {
    let glowing = true;
    setInterval(() => {
      if (glowing) {
        qrisCard.style.boxShadow = '0 20px 60px rgba(30,10,25,0.4), 0 0 0 1.5px rgba(244,167,197,0.2), 0 0 40px rgba(244,167,197,0.1)';
      } else {
        qrisCard.style.boxShadow = '0 20px 60px rgba(30,10,25,0.4), 0 0 0 1.5px rgba(244,167,197,0.2)';
      }
      glowing = !glowing;
    }, 2000);
  }

  /* ─────────────────────────────────
     COUNTER ANIMATION — price table
  ───────────────────────────────── */
  function animateNumber(el, from, to, duration) {
    const start = performance.now();
    function update(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = 'Rp ' + Math.floor(from + (to - from) * eased).toLocaleString('id-ID');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  /* ─────────────────────────────────
     KEYBOARD ACCESSIBILITY — slider
  ───────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    const focused = document.activeElement;
    if (focused && (focused.id === 'prevBtn' || focused.id === 'nextBtn')) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        focused.click();
      }
    }
  });

  /* ─────────────────────────────────
     CATALOG — tag filter highlight
  ───────────────────────────────── */
  const catBtns = document.querySelectorAll('.cat-btn');
  catBtns.forEach(btn => {
    btn.addEventListener('click', function (e) {
      // Ripple effect
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      ripple.style.cssText = `
        position: absolute;
        width: 0; height: 0;
        left: ${e.clientX - rect.left}px;
        top: ${e.clientY - rect.top}px;
        background: rgba(255,255,255,0.4);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: ripple-anim 0.5s ease-out forwards;
        pointer-events: none;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });

  // Inject ripple keyframe
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    @keyframes ripple-anim {
      to { width: 200px; height: 200px; opacity: 0; }
    }
  `;
  document.head.appendChild(rippleStyle);

  /* ─────────────────────────────────
     HERO — entrance animation
  ───────────────────────────────── */
  window.addEventListener('load', () => {
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');
    if (heroContent) {
      heroContent.style.opacity = '0';
      heroContent.style.transform = 'translateY(40px)';
      heroContent.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
      setTimeout(() => {
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
      }, 200);
    }
    if (heroVisual) {
      heroVisual.style.opacity = '0';
      heroVisual.style.transform = 'translateY(30px) scale(0.95)';
      heroVisual.style.transition = 'opacity 0.9s ease 0.4s, transform 0.9s ease 0.4s';
      setTimeout(() => {
        heroVisual.style.opacity = '1';
        heroVisual.style.transform = 'translateY(0) scale(1)';
      }, 400);
    }
  });

  console.log('%c✦ HERACLES Digital Store', 'color: #f4a7c5; font-size: 20px; font-weight: 900; font-family: serif;');
  console.log('%cFuturistic · Luxury · Trusted', 'color: #e07aa5; font-size: 12px; letter-spacing: 4px;');

})();
