/* ─────────────────────────────────────────────
   design-system.js
   Shared behaviour for all portfolio sub-pages.
   Requires: <canvas id="particle-canvas"> in the page,
             <button class="ds-theme-toggle" id="themeToggle">,
             design-system.css already loaded.
   ───────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── THEME ── */
  const root   = document.documentElement;
  const toggle = document.getElementById('themeToggle');

  const sunSVG  = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`;
  const moonSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    if (toggle) toggle.innerHTML = t === 'dark' ? moonSVG : sunSVG;
  }

  applyTheme(localStorage.getItem('theme') || 'light');

  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  }

  /* ── PARTICLES ── */
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    function getAccentRgb() {
      return root.getAttribute('data-theme') === 'dark' ? '167,139,250' : '124,58,237';
    }

    function Particle(scatter) {
      this.init = function (s) {
        this.x = Math.random() * W;
        this.y = s ? Math.random() * H : -8;
        this.r = Math.random() * 1.8 + 0.4;
        this.vy = Math.random() * 0.55 + 0.18;
        this.vx = (Math.random() - 0.5) * 0.12;
        this.alpha = Math.random() * 0.22 + 0.04;
      };
      this.update = function () {
        this.y += this.vy; this.x += this.vx;
        if (this.y > H + 10) this.init(false);
        if (this.x < -5) this.x = W + 5;
        if (this.x > W + 5) this.x = -5;
      };
      this.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${getAccentRgb()},${this.alpha})`;
        ctx.fill();
      };
      this.init(scatter);
    }

    const particles = [];
    for (let i = 0; i < 80; i++) particles.push(new Particle(true));

    (function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(loop);
    })();
  }

  /* ── SCROLL REVEAL ── */
  function triggerReveal() {
    const els = document.querySelectorAll('.ds-card, .ds-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const siblings = Array.from(e.target.parentElement?.children || []);
          const idx = siblings.indexOf(e.target);
          setTimeout(() => e.target.classList.add('visible'), idx * 70);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    els.forEach(el => { if (!el.classList.contains('visible')) io.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', triggerReveal);
})();
