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
   The home page uses a horizontal-scroll stage on wide viewports; sub-pages
   don't. Every scroll-driven behaviour below (nav state, spy, progress bar)
   needs to know which axis is the "primary" scroll for the current page. */
const stageEl = document.getElementById('main');
const stageMedia = window.matchMedia('(min-width: 900px)');
const isHorizontalStage = () =>
  !!stageEl && stageEl.classList.contains('stage') && stageMedia.matches;

/** Return the scroll source (element or window) whose scroll axis matters. */
function scrollSource() {
  return isHorizontalStage() ? stageEl : window;
}

/** Return the primary scroll position for the current page (px). */
function scrollPos() {
  return isHorizontalStage() ? stageEl.scrollLeft : window.scrollY;
}

/* ── NAV SCROLL STATE ──────────────────────────────────────────────────────
   The nav gains a `.is-scrolled` class once the user has moved a few pixels
   away from the start of the primary axis. On sub-pages / mobile that's the
   window's Y axis (via a sentinel IntersectionObserver so we don't add a
   scroll listener). On the desktop home page the primary axis is the
   stage's X, so we use a rAF-throttled listener there. */
function initNavState() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  if (isHorizontalStage()) {
    let ticking = false;
    const check = () => {
      ticking = false;
      nav.classList.toggle('is-scrolled', stageEl.scrollLeft > 8);
    };
    stageEl.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(check);
    }, { passive: true });
    check();
    return;
  }

  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none;';
  document.body.prepend(sentinel);

  new IntersectionObserver(([entry]) => {
    nav.classList.toggle('is-scrolled', !entry.isIntersecting);
  }, { threshold: 0 }).observe(sentinel);
}

/* ── SCROLL SPY (active nav link) ──────────────────────────────────────────
   IntersectionObserver against the viewport works for both scroll axes,
   because horizontal scroll of `.stage` still moves the panels within the
   viewport. rootMargin is set as a narrow horizontal strip in the middle
   of the viewport on horizontal stages, and a narrow vertical strip
   otherwise — either way a section is "active" once its centre crosses it. */
function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.nav-link[data-spy]'));
  if (!links.length) return;

  const map = new Map();
  links.forEach((link) => {
    const id = link.getAttribute('href').replace('#', '');
    const section = document.getElementById(id);
    if (section) map.set(section, link);
  });

  const rootMargin = isHorizontalStage()
    ? '0px -45% 0px -45%'   // strip down the horizontal centre
    : '-45% 0px -50% 0px';  // strip across the vertical centre

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.forEach((l) => l.classList.remove('is-active'));
        const link = map.get(entry.target);
        if (link) link.classList.add('is-active');
      }
    });
  }, { rootMargin, threshold: 0 });

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
   Single scaleX-transform driven by scroll position — no layout work, no
   width writes. rAF-throttled so multiple scroll events per frame coalesce
   into one paint. On the horizontal home stage it tracks scrollLeft; on
   sub-pages / mobile it tracks window scrollY. */
function initProgressBar() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;

  const horizontal = isHorizontalStage();
  const source = horizontal ? stageEl : window;

  let ticking = false;
  const update = () => {
    ticking = false;
    let p = 0;
    if (horizontal) {
      const max = stageEl.scrollWidth - stageEl.clientWidth;
      p = max > 0 ? Math.min(1, Math.max(0, stageEl.scrollLeft / max)) : 0;
    } else {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    }
    bar.style.transform = `scaleX(${p})`;
  };

  source.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  update();
}

/* ── HORIZONTAL STAGE (snap-per-gesture + smooth lerp + hash nav + keyboard) ─
   On the home page (≥900px viewport, motion enabled), the page's primary
   scroll axis is horizontal. Vertical mouse-wheel input is captured and
   converted into horizontal scroll on `main.stage`, but instead of the
   free-scrolling continuous lerp that earlier versions used, each wheel
   gesture snaps to the next / previous panel — one scroll = one panel
   advance. That's what stops the user from stopping halfway between
   two sections.

   The mechanism:
   - Wheel deltaY accumulates until it crosses `WHEEL_THRESHOLD` (small
     enough that even a light trackpad flick triggers a snap).
   - When it crosses, we snap toward the next / previous panel, smoothly
     lerped over ~500ms, and lock out further wheel input until the
     animation settles (`LOCKOUT_MS`). This is what prevents a single
     hard scroll from skipping past multiple panels.
   - The CSS side (see design-system.css `scroll-snap-type: x mandatory`
     with `scroll-snap-stop: always` on every panel) is the safety net:
     if any input path bypasses this JS (drag on scrollbar, touch), the
     browser still snaps to the nearest panel edge.

   The wheel is only intercepted when the current panel isn't scrolling
   internally — a panel with content taller than the viewport (narrow-
   desktop fallback) scrolls vertically first and only cedes the wheel to
   the horizontal stage once it hits the top/bottom edge.

   Skipped entirely on narrow viewports (mobile) and under prefers-reduced-
   motion — both cases fall back to native scroll behaviour. */
function initHorizontalStage() {
  if (!stageEl || !stageEl.classList.contains('stage')) return;
  if (!stageMedia.matches) return;

  // Under reduced motion we still let hash links jump instantly and hide the
  // scroll cue, but skip the animation and wheel-hijack entirely so
  // scrolling stays 1:1 with input.
  const smooth = !reduceMotion.matches;

  const panels = Array.from(stageEl.querySelectorAll('.panel'));
  if (!panels.length) return;

  // Flattened S-curve: mostly linear, with a light sine ease-in-out
  // mixed in. Pure easeInOutSine peaks at π/2 ≈ 1.57× average speed
  // at the midpoint — that burst eats most of the remaining distance
  // before the "slow end" can be seen, so the settle reads as a snap.
  // Blending 60% linear + 40% sine caps the peak at ~1.23×, which
  // keeps the slow → slightly-faster → slow shape without a spike:
  //
  //   t=0.1 → 7%    t=0.5 → 50%    t=0.8 → 84%    t=0.9 → 93%
  //
  // (Pure sine is already at 90% by t=0.8, which is the snap.)
  // CSS scroll-snap is also disabled for the duration of the tick —
  // `proximity` snap will otherwise yank the panel to its align point
  // the moment the next section crosses ~50% of the viewport, which
  // is the other half of the "snaps from the middle" feel.
  const DURATION_MS = 800;
  const SINE_MIX = 0.4;
  const ease = (t) => {
    const sine = (1 - Math.cos(Math.PI * t)) / 2;
    return t * (1 - SINE_MIX) + sine * SINE_MIX;
  };

  const state = {
    target: stageEl.scrollLeft,
    current: stageEl.scrollLeft,
    startX: stageEl.scrollLeft,
    startTime: 0,
    animating: false,
  };

  const clampTarget = () => {
    const max = stageEl.scrollWidth - stageEl.clientWidth;
    state.target = Math.max(0, Math.min(max, state.target));
  };

  const tick = (now) => {
    const elapsed = now - state.startTime;
    const t = Math.min(1, elapsed / DURATION_MS);
    const eased = ease(t);
    state.current = state.startX + (state.target - state.startX) * eased;
    stageEl.scrollLeft = state.current;
    if (t >= 1) {
      state.current = state.target;
      stageEl.scrollLeft = state.target;
      state.animating = false;
      stageEl.style.scrollSnapType = '';
      return;
    }
    requestAnimationFrame(tick);
  };

  const ensureTick = () => {
    // Re-anchor from the current position so an in-flight retarget
    // doesn't jump. Kill CSS snap for the duration of this tick so
    // the browser can't yank us to a panel edge mid-curve.
    state.startX = state.current;
    state.startTime = performance.now();
    stageEl.style.scrollSnapType = 'none';
    if (state.animating) return;
    state.animating = true;
    requestAnimationFrame(tick);
  };

  // Which panel is currently in the viewport? Determined by whichever
  // panel's centre is closest to the current viewport centre.
  const findCurrentPanelIndex = () => {
    const viewportCentre = stageEl.scrollLeft + stageEl.clientWidth * 0.5;
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < panels.length; i++) {
      const centre = panels[i].offsetLeft + panels[i].offsetWidth * 0.5;
      const dist = Math.abs(centre - viewportCentre);
      if (dist < minDist) { minDist = dist; closest = i; }
    }
    return closest;
  };

  const snapToPanel = (index) => {
    const clamped = Math.max(0, Math.min(panels.length - 1, index));
    state.target = panels[clamped].offsetLeft;
    clampTarget();
    if (!smooth) {
      state.current = state.target;
      stageEl.scrollLeft = state.current;
      return;
    }
    ensureTick();
  };

  /* Determine whether a wheel event should pan the stage horizontally, or
     let the currently-focused panel scroll internally. Panels are
     overflow: hidden on wide desktop, so this only matters in the
     narrow-desktop fallback where they scroll vertically. */
  const shouldHijack = (e) => {
    if (!smooth) return false;
    const panel = e.target.closest('.panel');
    if (!panel) return true;
    const hasInternalScroll = panel.scrollHeight > panel.clientHeight + 1;
    if (!hasInternalScroll) return true;
    const scrollingDown = e.deltaY > 0;
    const scrollingUp   = e.deltaY < 0;
    const atTop    = panel.scrollTop <= 0;
    const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;
    if (scrollingDown && !atBottom) return false;
    if (scrollingUp   && !atTop)    return false;
    return true;
  };

  // Wheel handler.
  //
  // The subtle bug this has to defeat is inertial-scroll bleed from
  // macOS / trackpad flicks. A single hard flick doesn't produce one
  // wheel event — it produces a *burst* of 30–50 events over 1–2s: a
  // large initial delta, then a long decaying tail as the OS simulates
  // physical momentum. A naive lockout ends before the tail does, so
  // the trailing events cross the threshold on their own and trigger a
  // *second* snap — the user sees one gesture skip two panels.
  //
  // Fix: while wheel events keep arriving, push the lockout forward.
  // Only after INERTIA_QUIET_MS of true silence do we accept a new
  // gesture. Combined with LOCKOUT_MS covering the animation itself,
  // one flick = one snap regardless of how long the OS tail lasts.
  const WHEEL_THRESHOLD = 40;
  const LOCKOUT_MS = DURATION_MS + 80;
  const INERTIA_QUIET_MS = 160;
  let wheelAccumulator = 0;
  let wheelResetTimer = null;
  let lockoutUntil = 0;

  if (smooth) {
    stageEl.addEventListener('wheel', (e) => {
      if (!shouldHijack(e)) return;
      e.preventDefault();

      const now = performance.now();

      // Locked out — either the animation window or still absorbing the
      // previous gesture's inertial tail. Swallow the event and push
      // the lockout forward so the tail can't sneak past.
      if (now < lockoutUntil) {
        wheelAccumulator = 0;
        lockoutUntil = Math.max(lockoutUntil, now + INERTIA_QUIET_MS);
        return;
      }

      // Trackpads sometimes emit horizontal deltaX for a vertical scroll;
      // treat both as scroll-progress input.
      const dy = (e.deltaY || 0) + (e.deltaX || 0);
      wheelAccumulator += dy;

      // Reset the accumulator between gestures — a pause of ~180ms
      // between wheel events means the previous gesture is over.
      window.clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => { wheelAccumulator = 0; }, 180);

      if (Math.abs(wheelAccumulator) < WHEEL_THRESHOLD) return;

      const direction = wheelAccumulator > 0 ? 1 : -1;
      wheelAccumulator = 0;
      lockoutUntil = now + LOCKOUT_MS;
      snapToPanel(findCurrentPanelIndex() + direction);
    }, { passive: false });
  }

  // Keyboard: snap-per-key. Home / End jump to the first / last panel.
  window.addEventListener('keydown', (e) => {
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.target && e.target.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
        e.preventDefault();
        snapToPanel(findCurrentPanelIndex() + 1);
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        snapToPanel(findCurrentPanelIndex() - 1);
        break;
      case ' ':
        e.preventDefault();
        snapToPanel(findCurrentPanelIndex() + (e.shiftKey ? -1 : 1));
        break;
      case 'Home':
        e.preventDefault();
        snapToPanel(0);
        break;
      case 'End':
        e.preventDefault();
        snapToPanel(panels.length - 1);
        break;
      default:
        break;
    }
  });

  // Hash-link clicks snap to the target panel.
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
      snapToPanel(index);
      // Update history so back/forward and refresh land on the right panel.
      history.pushState(null, '', hash);
    });
  });

  // Hide the scroll cue after any horizontal movement.
  const cue = document.getElementById('scrollCue');
  if (cue) {
    let hidden = false;
    stageEl.addEventListener('scroll', () => {
      if (hidden) return;
      if (stageEl.scrollLeft > 40) {
        hidden = true;
        cue.classList.add('is-hidden');
      }
    }, { passive: true });
  }

  // On resize, re-snap to the currently active panel so it stays flush
  // to the viewport edge (offsets change with viewport width).
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const idx = findCurrentPanelIndex();
      state.target = panels[idx].offsetLeft;
      state.current = state.target;
      stageEl.scrollLeft = state.current;
    }, 120);
  });

  // Landing with a hash: jump to that panel on load (native browsers only
  // vertically snap to hashes; we need horizontal here).
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      const panel = target.classList.contains('panel') ? target : target.closest('.panel');
      if (panel) {
        state.current = panel.offsetLeft;
        state.target = state.current;
        stageEl.scrollLeft = state.current;
      }
    }
  }
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
   Order matters slightly: `initHorizontalStage` must run before
   `initNavState` / `initProgressBar` / `initScrollSpy` don't strictly
   depend on it, but running it early primes the stage's scrollLeft (e.g.
   from a page-load hash target) so those readers see the correct value
   on their first tick. */
function init() {
  initTheme();
  initHorizontalStage();
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
