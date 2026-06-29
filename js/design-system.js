/* ============================================================================
   design-system.js
   Behaviour for the design system. Runs on DOMContentLoaded, exports nothing,
   loaded as <script type="module">. No third-party libraries.
   Responsibilities: theme toggle, nav scroll state, scroll-spy, scroll reveal,
   mobile menu, hero particle field. Cross-document view transitions are CSS.
   ========================================================================== */

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

/* ── THEME ───────────────────────────────────────────────────────────────── */
function currentTheme() {
  return root.getAttribute('data-theme')
    || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
}

function initTheme() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const sync = () => {
    const isDark = currentTheme() === 'dark';
    toggle.innerHTML = isDark ? SUN : MOON;
    toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  };
  sync();

  toggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
    sync();
  });
}

/* ── NAV SCROLL STATE (sentinel, no scroll listener) ─────────────────────── */
function initNavState() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none;';
  document.body.prepend(sentinel);

  new IntersectionObserver(([entry]) => {
    nav.classList.toggle('is-scrolled', !entry.isIntersecting);
  }, { threshold: 0 }).observe(sentinel);
}

/* ── SCROLL SPY (active nav link) ────────────────────────────────────────── */
function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.nav-link[data-spy]'));
  if (!links.length) return;

  const map = new Map();
  links.forEach((link) => {
    const id = link.getAttribute('href').replace('#', '');
    const section = document.getElementById(id);
    if (section) map.set(section, link);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.forEach((l) => l.classList.remove('is-active'));
        const link = map.get(entry.target);
        if (link) link.classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  map.forEach((_, section) => observer.observe(section));
}

/* ── SCROLL REVEAL (once, staggered) ─────────────────────────────────────── */
/* [data-reveal] is the canonical hook (initial state set in CSS). Legacy
   .reveal / .ds-card selectors keep existing sub-pages working. */
function initReveal() {
  const els = document.querySelectorAll('[data-reveal], .reveal, .ds-card');
  if (!els.length) return;

  const show = (el) => el.classList.add('is-visible', 'visible');

  if (reduceMotion.matches) {
    els.forEach(show);
    return;
  }

  // Stagger siblings inside a [data-reveal-group]; otherwise fall back to the
  // element's position among its parent's children (legacy behaviour).
  const orderIndex = (el) => {
    const group = el.closest('[data-reveal-group]');
    const scope = group
      ? Array.from(group.querySelectorAll('[data-reveal]'))
      : (el.parentElement ? Array.from(el.parentElement.children) : []);
    return Math.max(0, scope.indexOf(el));
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      // Stagger 80ms per sibling, capped at 6 (480ms) so long lists don't lag.
      const delay = Math.min(orderIndex(el), 6) * 80;
      window.setTimeout(() => show(el), delay);
      obs.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

  els.forEach((el) => observer.observe(el));
}

/* ── MOBILE MENU ─────────────────────────────────────────────────────────── */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const panel = document.getElementById('navPanel');
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    panel.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(!panel.classList.contains('is-open'));
  });

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* ── HERO PARTICLE FIELD (decorative, gated, perf-aware) ──────────────────── */
function hexToRgb(hex) {
  let h = String(hex).trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function initHeroParticles() {
  const hero = document.querySelector('.hero');
  // No canvas under reduced motion — nothing to pause, it never starts.
  if (!hero || reduceMotion.matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  hero.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }

  const LINK_DIST = 110;     // px: connect particles closer than this
  const LINK_MAX = 0.12;     // max line opacity (closer = more opaque)
  const DOT_ALPHA = 0.35;    // particle opacity
  const count = () => (window.innerWidth <= 768 ? 28 : 55);

  let width = 0, height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let rgb = { r: 124, g: 156, b: 255 };
  let rafId = null;
  let inView = true;
  let visible = !document.hidden;
  let tick = 0;

  const readAccent = () => {
    const cs = getComputedStyle(document.documentElement);
    const raw = cs.getPropertyValue('--color-accent').trim()
      || cs.getPropertyValue('--accent').trim();
    const parsed = hexToRgb(raw);
    if (parsed) rgb = parsed;
  };

  const rand = (min, max) => Math.random() * (max - min) + min;
  const velocity = () => {
    const v = rand(0.15, 0.40);
    return Math.random() < 0.5 ? -v : v;
  };

  const build = () => {
    particles = [];
    for (let i = 0, n = count(); i < n; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: velocity(),
        vy: velocity(),
        r: rand(1, 2),
      });
    }
  };

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  };

  const draw = () => {
    rafId = null;
    if (!inView || !visible) return;          // loop only runs in view + tab visible
    if ((tick++ % 30) === 0) readAccent();    // pick up theme changes cheaply

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x <= 0 || p.x >= width) { p.vx *= -1; p.x = Math.max(0, Math.min(width, p.x)); }
      if (p.y <= 0 || p.y >= height) { p.vy *= -1; p.y = Math.max(0, Math.min(height, p.y)); }
    }

    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * LINK_MAX;
          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${DOT_ALPHA})`;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(draw);
  };

  const start = () => { if (rafId == null && inView && visible) rafId = requestAnimationFrame(draw); };
  const stop = () => { if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; } };

  let resizeTimer = null;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      resize();
      start();
    }, 150);
  };
  window.addEventListener('resize', onResize);

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) start(); else stop();
  });

  const io = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) start(); else stop();
  }, { threshold: 0 });
  io.observe(canvas);

  new MutationObserver(readAccent).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  // If the user switches on reduced motion, tear the canvas down entirely.
  const onReduceChange = (e) => {
    if (!e.matches) return;
    stop();
    io.disconnect();
    window.removeEventListener('resize', onResize);
    canvas.remove();
  };
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onReduceChange);

  readAccent();
  resize();
  start();
}

/* ── INIT ────────────────────────────────────────────────────────────────── */
function init() {
  initTheme();
  initNavState();
  initScrollSpy();
  initReveal();
  initMobileMenu();
  initHeroParticles();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
