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

/* ── STAGE DETECTION ───────────────────────────────────────────────────────
   The home page runs a "panel stage" on wide viewports: sections are
   absolutely stacked inside a fixed rail and JS translates each one
   horizontally from `window.scrollY`, producing a Simon Holm-style
   glide-over effect. Sub-pages are conventional vertical documents.
   `isPanelStage()` is true only when both conditions are met. */
const stageEl = document.getElementById('main');
const stageMedia = window.matchMedia('(min-width: 900px)');
const isPanelStage = () =>
  !!stageEl && stageEl.classList.contains('stage') && stageMedia.matches;

/* ── NAV SCROLL STATE ──────────────────────────────────────────────────────
   The nav gains a `.is-scrolled` class once the user has moved a few
   pixels off the top of the window. Uses an IntersectionObserver against
   a tiny sentinel at the document top so no scroll listener is required. */
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

/* ── SCROLL SPY (active nav link) ──────────────────────────────────────────
   On the home page panel-stage, all panels are absolutely stacked at the
   same viewport position — IntersectionObserver can't distinguish them.
   So on that page we compute the active panel index directly from
   `scrollY / viewportHeight`. Elsewhere (subpages, mobile) sections lay
   out normally and an IntersectionObserver with a narrow vertical strip
   in the viewport centre handles it. */
function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.nav-link[data-spy]'));
  if (!links.length) return;

  const map = new Map();
  links.forEach((link) => {
    const id = link.getAttribute('href').replace('#', '');
    const section = document.getElementById(id);
    if (section) map.set(section, link);
  });

  if (isPanelStage()) {
    const panels = Array.from(stageEl.querySelectorAll('.panel'));
    if (!panels.length) return;

    let vh = window.innerHeight;
    let ticking = false;
    const update = () => {
      ticking = false;
      const idx = Math.min(
        panels.length - 1,
        Math.max(0, Math.round(window.scrollY / Math.max(1, vh))),
      );
      const active = panels[idx];
      links.forEach((l) => l.classList.remove('is-active'));
      const link = map.get(active);
      if (link) link.classList.add('is-active');
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', () => { vh = window.innerHeight; update(); });
    update();
    return;
  }

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
/* Motion values are owned by design-system.css. Read them from the cascade
   rather than duplicating the numbers here — a stagger constant hardcoded in JS
   that disagrees with the CSS token is exactly the drift this system exists to
   remove. */
function motionToken(name, fallback) {
  const n = parseFloat(getComputedStyle(root).getPropertyValue(name));
  return Number.isFinite(n) ? n : fallback;
}

function initReveal() {
  const els = document.querySelectorAll('[data-reveal], .reveal, .ds-card');
  if (!els.length) return;

  const STAGGER_STEP = motionToken('--stagger-step', 60);
  const STAGGER_CAP = motionToken('--stagger-cap', 4);
  const ENTER_MS = motionToken('--dur-enter', 240);

  const show = (el) => {
    // will-change is set immediately before the transition and cleared the
    // moment it ends — never left on the element permanently, which would keep
    // a compositor layer alive for every revealed block on the page.
    el.style.willChange = 'opacity, translate';
    el.classList.add('is-visible', 'visible');

    const settle = () => { el.style.willChange = ''; };
    el.addEventListener('transitionend', settle, { once: true });
    // transitionend never fires if the transition doesn't actually run (already
    // at its end state, reduced motion, background tab). Always clean up.
    window.setTimeout(settle, ENTER_MS + 100);
  };

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
      // Stagger per sibling from --stagger-step, capped at --stagger-cap
      // siblings (60ms x 4 = 240ms) so later items in long lists never arrive
      // after the reader has already scrolled past them.
      const delay = Math.min(orderIndex(el), STAGGER_CAP) * STAGGER_STEP;
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

/**
 * Decorative particle network on any host element.
 * @param {HTMLElement} host — container (canvas is prepended, pointer-events: none)
 * @param {{ className?: string, density?: { mobile: number, desktop: number }, mobileBreakpoint?: number }} [options]
 * @returns {(() => void) | null} teardown, or null if skipped
 */
export function initParticleField(host, options = {}) {
  if (!host || reduceMotion.matches) return null;

  const className = options.className || 'hero-canvas';
  const mobileBp = options.mobileBreakpoint ?? 768;
  const density = options.density || { mobile: 28, desktop: 55 };

  const canvas = document.createElement('canvas');
  canvas.className = className;
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return null; }

  const LINK_DIST = 110;
  const LINK_MAX = 0.12;
  const DOT_ALPHA = 0.35;
  const count = () => (window.innerWidth <= mobileBp ? density.mobile : density.desktop);

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
    const rect = host.getBoundingClientRect();
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

  const onVisibility = () => {
    visible = !document.hidden;
    if (visible) start(); else stop();
  };
  document.addEventListener('visibilitychange', onVisibility);

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

  return () => {
    stop();
    io.disconnect();
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.remove();
  };
}

/* Hero particle field intentionally NOT initialised on the home page anymore.
   The editorial redesign leans on typography and hairlines; a decorative
   canvas layer competed with that. `initParticleField` is still exported so
   the knowledge mindmap can keep using it as its own atmospheric backdrop. */

/* ── SCROLL PROGRESS BAR ────────────────────────────────────────────────────
   Single scaleX-transform driven by window scroll position. rAF-throttled
   so multiple scroll events per frame coalesce into one paint. On the
   home page the document height = N * viewport heights (see main.stage
   in CSS), so this naturally spans the full glide-over run. */
function initProgressBar() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = `scaleX(${p})`;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  update();
}

/* ── PANEL STAGE (scroll-driven horizontal glide-over) ─────────────────────
   Home page desktop only. `main.stage` provides one viewport of vertical
   scroll per transition (see CSS: `height: (N-1) * 100vh`), the `.rail`
   is `position: fixed` and always visible, and each panel is absolutely
   stacked inside it. This function reads `window.scrollY` on every scroll
   tick and writes `transform: translate3d(...)` on each panel so that
   the newer panel glides in from the right, over the previous one, which
   drifts slightly left as it's covered.

   Every panel k gets two per-frame progress values, each clamped [0, 1]:
     enter[k] = (scrollY - (k-1) * vh) / vh   — 0 = off right, 1 = at rest
     cover[k] = (scrollY - k * vh) / vh       — 0 = at rest, 1 = fully covered
   Panel k's translateX (in % of its own width) is:
     (1 - enter[k]) * 100 - cover[k] * PARALLAX
   The `-cover * PARALLAX` term is the slight leftward drift that gives
   the outgoing panel a sense of depth — pure sticky (cover term = 0)
   makes the transition feel like a slide-in over a still image, which
   reads flat.

   Snap-per-gesture: every wheel/keyboard input advances by exactly one
   panel, no matter how large the flick — the browser's native
   `scrollTo({ behavior: 'smooth' })` handles the actual animation. This
   is what stops the user from ever ending up half-way between two
   sections. Reduced-motion drops out via CSS (the `.rail` stops being
   fixed and panels stack naturally) so this function still runs but
   its transforms and hijacks are visually inert.

   Skipped on narrow viewports (mobile) — CSS falls back to natural
   vertical stacking. */
function initPanelStage() {
  if (!stageEl || !stageEl.classList.contains('stage')) return;

  const panels = Array.from(stageEl.querySelectorAll('.panel'));
  if (!panels.length) return;

  // Tell CSS how many panels there are so `main.stage` can size itself
  // to (N-1) * 100vh — one viewport of scroll per transition.
  root.style.setProperty('--stage-panel-count', String(panels.length));

  // Below the desktop breakpoint, panels stack naturally via CSS — no JS
  // transforms needed. Under reduced motion, the CSS media query drops
  // out of the fixed rail entirely, so any transforms we'd apply would
  // be inert (position: relative, transform: none override); no harm
  // running the tick, but pointless — bail.
  if (!stageMedia.matches) return;
  if (reduceMotion.matches) return;

  const PARALLAX = 15; // % of viewport width the outgoing panel drifts left
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

  let vh = window.innerHeight;
  let ticking = false;

  const update = () => {
    ticking = false;
    const scrollY = window.scrollY;
    for (let i = 0; i < panels.length; i++) {
      const enter = clamp01((scrollY - (i - 1) * vh) / vh);
      const cover = i < panels.length - 1
        ? clamp01((scrollY - i * vh) / vh)
        : 0;
      const tx = (1 - enter) * 100 - cover * PARALLAX;
      panels[i].style.transform = `translate3d(${tx}%, 0, 0)`;
    }
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      vh = window.innerHeight;
      update();
    }, 120);
  });

  /* ── Custom smooth-scroll ────────────────────────────────────────────────
     Browser-native `scrollTo({ behavior: 'smooth' })` runs different
     durations and curves per engine — Safari lands in ~300ms with a
     near-linear ramp, which reads as flicky. This rAF loop drives a
     consistent 800ms `easeInOutCubic` on every browser, matching the
     premium-scroll feel of Lenis-style implementations without a
     dependency. */
  const ANIMATION_MS = 800;
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  let currentScrollAnim = null;
  const smoothScrollTo = (targetY) => {
    if (currentScrollAnim) cancelAnimationFrame(currentScrollAnim);
    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 1) { currentScrollAnim = null; return; }
    const startTime = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - startTime) / ANIMATION_MS);
      const eased = easeInOutCubic(t);
      window.scrollTo(0, Math.round(startY + distance * eased));
      if (t < 1) {
        currentScrollAnim = requestAnimationFrame(step);
      } else {
        currentScrollAnim = null;
      }
    };
    currentScrollAnim = requestAnimationFrame(step);
  };

  // Hash-link clicks smooth-scroll to the target panel's vertical offset.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      const panel = target.classList.contains('panel') ? target : target.closest('.panel');
      if (!panel) return;
      const index = panels.indexOf(panel);
      if (index < 0) return;
      e.preventDefault();
      lockoutUntil = performance.now() + LOCKOUT_MS;
      smoothScrollTo(index * vh);
      history.pushState(null, '', hash);
    });
  });

  // Landing with a hash: jump to that panel on load, no animation on cold load.
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      const panel = target.classList.contains('panel') ? target : target.closest('.panel');
      if (panel) {
        const index = panels.indexOf(panel);
        if (index >= 0) window.scrollTo(0, index * vh);
      }
    }
  }

  /* ── Snap-per-gesture (wheel + keyboard) ─────────────────────────────────
     Every deliberate wheel or keyboard input advances by exactly one
     panel — short flicks and long flicks alike.

     The design is set up to defeat macOS / trackpad inertial-scroll
     bleed. A single hard flick emits a large first event, then a burst
     of 30–50 decaying tail events over 500–1500 ms. Our earlier version
     dealt with the tail by extending the lockout by 160 ms on every
     wheel event during lockout — but that meant if the *user's finger
     stayed on the trackpad* between two flicks, the tail never dies,
     the lockout never expires, and the second flick is silently
     absorbed. That's why moving the cursor "fixed" it: releasing the
     trackpad long enough was the only way to break the extension.

     New approach: **fixed** lockout equal to the animation duration
     (no extension), and a new gesture is detected by *either*:
       (a) SILENCE_MS of no wheel events (the tail has died), OR
       (b) a delta that spikes above the decaying peak of the current
           stream by FRESH_RATIO — a deliberate flick that lands amid
           an inertial tail is still visibly larger than the tail's
           current magnitude.
     Either signal is enough on its own, so a rapid re-flick that keeps
     the finger on the trackpad now advances correctly.

     A `MIN_ABS_DELTA` guard drops mouse-jitter and precise-trackpad
     micro-scrolls that shouldn't count as gestures. */
  const LOCKOUT_MS = ANIMATION_MS + 50;
  const SILENCE_MS = 120;
  const MIN_ABS_DELTA = 5;
  const FRESH_MIN_DELTA = 20;
  const FRESH_RATIO = 1.4;
  const PEAK_HALF_LIFE_MS = 250;

  let lockoutUntil = 0;
  let lastWheelTime = 0;
  let recentPeak = 0;
  let recentPeakTime = 0;

  const gesture = (direction) => {
    const now = performance.now();
    const currentIdx = Math.max(
      0,
      Math.min(panels.length - 1, Math.round(window.scrollY / Math.max(1, vh))),
    );
    const targetIdx = Math.max(0, Math.min(panels.length - 1, currentIdx + direction));
    // At a boundary in the direction of the gesture — nothing to advance
    // to. Don't start a lockout so the user can immediately reverse.
    if (targetIdx === currentIdx) return;
    lockoutUntil = now + LOCKOUT_MS;
    smoothScrollTo(targetIdx * vh);
  };

  /* Let internally-scrollable panels absorb the wheel first. Panels are
     `overflow: hidden` at wide desktop, so this only matters in the
     narrow-desktop (900–1100px) fallback where they scroll vertically. */
  const shouldHijack = (e) => {
    const panel = e.target?.closest?.('.panel');
    if (!panel) return true;
    const hasInternalScroll = panel.scrollHeight > panel.clientHeight + 1;
    if (!hasInternalScroll) return true;
    const scrollingDown = (e.deltaY || 0) > 0;
    const atTop = panel.scrollTop <= 0;
    const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;
    if (scrollingDown && !atBottom) return false;
    if (!scrollingDown && !atTop) return false;
    return true;
  };

  window.addEventListener('wheel', (e) => {
    if (!shouldHijack(e)) return;
    e.preventDefault();

    const now = performance.now();

    // Normalise line-mode wheels (mouse scroll wheels on some OSes report
    // `deltaMode: 1` in "lines") to pixels so the same thresholds apply.
    const rawDelta = (e.deltaY || 0) + (e.deltaX || 0);
    const delta = e.deltaMode === 1 ? rawDelta * 30 : rawDelta;
    const absDelta = Math.abs(delta);

    // The gap since the last wheel event of *any* magnitude — always
    // updated, even for events we ignore, so silence tracking stays
    // accurate.
    const gap = now - lastWheelTime;
    lastWheelTime = now;

    // Ignore pointer jitter / precise-scroll micro-events.
    if (absDelta < MIN_ABS_DELTA) return;

    // During animation: absorb WITHOUT extending the lockout. The
    // inertial tail can't keep pushing the guard forward, so a second
    // deliberate flick moments after the animation ends will fire.
    if (now < lockoutUntil) return;

    // Time-decayed peak of recent wheel deltas. A deliberate new flick
    // spikes above this; inertial tail sits below.
    const decayedPeak = recentPeak *
      Math.exp(-(now - recentPeakTime) / PEAK_HALF_LIFE_MS);
    if (absDelta > decayedPeak) {
      recentPeak = absDelta;
      recentPeakTime = now;
    }

    const isSilenceGap = gap >= SILENCE_MS;
    const isFreshSpike = absDelta >= FRESH_MIN_DELTA
      && absDelta > decayedPeak * FRESH_RATIO;
    if (!isSilenceGap && !isFreshSpike) return;

    gesture(delta > 0 ? 1 : -1);
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.target && e.target.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const now = performance.now();
    if (now < lockoutUntil) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
      case 'PageDown':
        e.preventDefault(); gesture(1); break;
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault(); gesture(-1); break;
      case ' ':
        e.preventDefault(); gesture(e.shiftKey ? -1 : 1); break;
      case 'Home':
        e.preventDefault();
        lockoutUntil = now + LOCKOUT_MS;
        smoothScrollTo(0);
        break;
      case 'End':
        e.preventDefault();
        lockoutUntil = now + LOCKOUT_MS;
        smoothScrollTo((panels.length - 1) * vh);
        break;
      default:
        break;
    }
  });

  // Hide the scroll cue after any downward movement.
  const cue = document.getElementById('scrollCue');
  if (cue) {
    let hidden = false;
    window.addEventListener('scroll', () => {
      if (hidden) return;
      if (window.scrollY > 40) {
        hidden = true;
        cue.classList.add('is-hidden');
      }
    }, { passive: true });
  }

  update();
}

/* ── CURSOR-TRACKED SPOTLIGHT (work list) ──────────────────────────────────
   Sets `--spot-x` / `--spot-y` custom properties on any [data-spotlight]
   container as the pointer moves, so a `radial-gradient()` background in the
   CSS follows the cursor. rAF-throttled, no layout reads on hot path — only
   `getBoundingClientRect()` on `mouseenter` (which is one event per hover
   session, not per move). Skips entirely on coarse pointers where there's
   no meaningful cursor to track. */
function initSpotlight() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.querySelectorAll('[data-spotlight], .work-list').forEach((el) => {
    let rect = null;
    let pending = false;
    let latest = { x: 0, y: 0 };

    const apply = () => {
      pending = false;
      if (!rect) return;
      el.style.setProperty('--spot-x', `${latest.x - rect.left}px`);
      el.style.setProperty('--spot-y', `${latest.y - rect.top}px`);
    };

    el.addEventListener('pointerenter', () => { rect = el.getBoundingClientRect(); });
    el.addEventListener('pointermove', (e) => {
      latest.x = e.clientX;
      latest.y = e.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(apply);
    });
    // Reset rect on resize so the coord math stays correct.
    window.addEventListener('resize', () => { rect = el.getBoundingClientRect(); }, { passive: true });
  });
}

/* ── MAGNETIC HOVER (buttons only) ─────────────────────────────────────────
   Buttons subtly translate toward the pointer as it approaches, creating the
   sense that the control is "reachable". Kept small (max 6px) so it reads as
   physical attraction rather than a jump. Only active on fine pointers with
   hover; disabled entirely under reduced motion. */
function initMagneticButtons() {
  if (reduceMotion.matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const btns = document.querySelectorAll('.btn');
  const STRENGTH = 0.22;
  const MAX = 6;

  btns.forEach((btn) => {
    let raf = null;
    let rect = null;

    const move = (e) => {
      if (!rect) rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(-MAX, Math.min(MAX, (e.clientX - cx) * STRENGTH));
      const dy = Math.max(-MAX, Math.min(MAX, (e.clientY - cy) * STRENGTH));
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        btn.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
      });
    };
    const leave = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      rect = null;
      btn.style.transform = '';
    };
    btn.addEventListener('pointerenter', () => { rect = btn.getBoundingClientRect(); });
    btn.addEventListener('pointermove', move);
    btn.addEventListener('pointerleave', leave);
    btn.addEventListener('blur', leave);
  });
}

/* ── INIT ──────────────────────────────────────────────────────────────────
   Order matters slightly: `initPanelStage` must run before
   `initNavState` / `initProgressBar` / `initScrollSpy` because it sets
   the `--stage-panel-count` CSS variable and (for hash landings) primes
   `window.scrollY` — the other three read that value on their first tick. */
function init() {
  initTheme();
  initPanelStage();
  initNavState();
  initScrollSpy();
  initReveal();
  initMobileMenu();
  initProgressBar();
  initSpotlight();
  initMagneticButtons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
