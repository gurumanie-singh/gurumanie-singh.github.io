/* ============================================================================
   design-system.js
   Behaviour for the design system. Runs on DOMContentLoaded, exports nothing,
   loaded as <script type="module">. No third-party libraries.
   Responsibilities: theme toggle, nav scroll state, scroll-spy, scroll reveal,
   mobile menu, magnetic CTA. Cross-document view transitions are handled in CSS.
   ========================================================================== */

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

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
function initReveal() {
  const els = document.querySelectorAll('.reveal, .ds-card');
  if (!els.length) return;

  if (reduceMotion.matches) {
    els.forEach((el) => el.classList.add('is-visible', 'visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const group = Array.from(el.parentElement ? el.parentElement.children : []);
      const index = Math.max(0, group.indexOf(el));
      const delay = Math.min(index, 6) * 60;
      window.setTimeout(() => el.classList.add('is-visible', 'visible'), delay);
      obs.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

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

/* ── MAGNETIC CTA (decorative, gated) ────────────────────────────────────── */
function initMagnetic() {
  if (reduceMotion.matches || !finePointer.matches) return;

  document.querySelectorAll('.btn-magnetic').forEach((btn) => {
    let raf = null;
    let tx = 0, ty = 0, cx = 0, cy = 0, pressed = false;
    const STRENGTH = 0.3;
    const MAX = 6;

    const frame = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      const scale = pressed ? 0.97 : 1;
      btn.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px) scale(${scale})`;
      const settled = Math.abs(tx - cx) < 0.1 && Math.abs(ty - cy) < 0.1;
      if (!settled || pressed) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = null;
        btn.style.transform = '';
      }
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(frame); };

    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      tx = Math.max(-MAX, Math.min(MAX, dx * STRENGTH));
      ty = Math.max(-MAX, Math.min(MAX, dy * STRENGTH));
      start();
    });
    btn.addEventListener('pointerleave', () => { tx = 0; ty = 0; start(); });
    btn.addEventListener('pointerdown', () => { pressed = true; start(); });
    window.addEventListener('pointerup', () => { pressed = false; start(); });
  });
}

/* ── INIT ────────────────────────────────────────────────────────────────── */
function init() {
  initTheme();
  initNavState();
  initScrollSpy();
  initReveal();
  initMobileMenu();
  initMagnetic();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
