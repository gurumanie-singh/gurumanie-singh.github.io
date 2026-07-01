/* ============================================================================
   knowledge-mindmap.js
   Reusable radial knowledge mindmap. Loads data/[category].json at runtime.
   No hardcoded content — works with cybersecurity, software, hardware, etc.
   ========================================================================== */

const KM_STORAGE_PREFIX = 'knowledge-progress-';

/** Minimal markdown → HTML for detail panels (no external deps). */
function renderMarkdown(md) {
  if (!md) return '';
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  const blocks = html.split(/\n\n+/);
  return blocks.map((block) => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('<h')) return block;
    if (/^[-*] /.test(block)) {
      const items = block.split(/\n/).map((l) => l.replace(/^[-*] /, '').trim());
      return `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
    }
    if (/^\d+\. /.test(block)) {
      const items = block.split(/\n/).map((l) => l.replace(/^\d+\. /, '').trim());
      return `<ol>${items.map((i) => `<li>${i}</li>`).join('')}</ol>`;
    }
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('');
}

function loadProgress(category) {
  try {
    const raw = localStorage.getItem(`${KM_STORAGE_PREFIX}${category}`);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveProgress(category, reviewed) {
  try {
    localStorage.setItem(`${KM_STORAGE_PREFIX}${category}`, JSON.stringify([...reviewed]));
  } catch { /* private mode */ }
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, progress) {
  const start = polarToCartesian(cx, cy, r, 0);
  const end = polarToCartesian(cx, cy, r, 360 * progress);
  const large = progress > 0.5 ? 1 : 0;
  if (progress <= 0) return '';
  if (progress >= 1) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}`;
  }
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

export class KnowledgeMindmap {
  constructor(rootEl, options = {}) {
    this.root = rootEl;
    this.category = options.category || rootEl.dataset.category || 'cybersecurity';
    this.data = null;
    this.reviewed = loadProgress(this.category);
    this.selectedTopic = null;
    this.selectedClass = null;
    this.flashIndex = 0;
    this.flashFlipped = false;
    this.pan = { x: 0, y: 0 };
    this.dragging = false;
    this.dragStart = null;
    this.flatTopics = [];
  }

  async init() {
    const res = await fetch(`../data/${this.category}.json`);
    if (!res.ok) throw new Error(`Failed to load data/${this.category}.json`);
    this.data = await res.json();
    this.flatTopics = [];
    (this.data.classes || []).forEach((cls) => {
      (cls.topics || []).forEach((t) => {
        this.flatTopics.push({ ...t, classId: cls.classId, classCode: cls.classCode });
      });
    });
    this.render();
    this.bindEvents();
    this.updateProgressLabel();
  }

  render() {
    this.root.innerHTML = '';
    this.root.classList.add('km-page');

    const toolbar = document.createElement('div');
    toolbar.className = 'km-toolbar';
    toolbar.innerHTML = `
      <div class="km-toolbar-left">
        <span class="km-category-label">${this.data.category}</span>
        <span class="km-progress-text" id="kmProgressText">0 / 0 reviewed</span>
      </div>
      <div class="km-toolbar-actions">
        <button type="button" class="km-btn" id="kmFlashBtn">Flashcards</button>
        <button type="button" class="km-btn" id="kmResetView">Reset view</button>
      </div>
    `;

    const shell = document.createElement('div');
    shell.className = 'km-shell';

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'km-canvas-wrap';
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.classList.add('km-canvas');
    this.svg.setAttribute('viewBox', '0 0 800 800');
    this.svg.setAttribute('aria-label', `${this.data.category} knowledge map`);
    canvasWrap.appendChild(this.svg);

    this.panel = document.createElement('aside');
    this.panel.className = 'km-panel';
    this.panel.innerHTML = `<div class="km-panel-empty">Select a topic node to view details</div>`;

    shell.append(canvasWrap, this.panel);
    this.root.append(toolbar, shell);

    this.flashOverlay = document.createElement('div');
    this.flashOverlay.className = 'km-flash-overlay';
    this.flashOverlay.innerHTML = `
      <button type="button" class="km-btn km-flash-close" id="kmFlashClose">Close</button>
      <div>
        <div class="km-flash-card" id="kmFlashCard">
          <div class="km-flash-inner" id="kmFlashInner"></div>
        </div>
        <div class="km-flash-controls">
          <button type="button" class="km-btn" id="kmFlashPrev">← Prev</button>
          <button type="button" class="km-btn" id="kmFlashFlip">Flip</button>
          <button type="button" class="km-btn" id="kmFlashNext">Next →</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.flashOverlay);

    this.drawMap();
  }

  drawMap() {
    const svg = this.svg;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${this.pan.x}, ${this.pan.y})`);
    this.mapGroup = g;

    const cx = 400;
    const cy = 400;
    const classes = this.data.classes || [];

    // Center hub
    const centerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const centerR = 44;
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', cx);
    centerCircle.setAttribute('cy', cy);
    centerCircle.setAttribute('r', centerR);
    centerCircle.setAttribute('fill', 'var(--km-surface-2)');
    centerCircle.setAttribute('stroke', 'var(--km-accent)');
    centerCircle.setAttribute('stroke-width', '2');
    const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerText.setAttribute('x', cx);
    centerText.setAttribute('y', cy);
    centerText.setAttribute('class', 'km-label km-label-center');
    centerText.textContent = this.data.category;
    centerG.append(centerCircle, centerText);
    g.appendChild(centerG);

    const classCount = classes.length;
    const classRadius = 140;
    const topicRadius = 300;

    classes.forEach((cls, ci) => {
      const classAngle = (360 / classCount) * ci;
      const classPos = polarToCartesian(cx, cy, classRadius, classAngle);
      const topics = cls.topics || [];
      const topicSpan = Math.min(120, (360 / classCount) * 0.85);
      const topicStart = classAngle - topicSpan / 2;

      // Edge center → class
      const edgeC = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      edgeC.setAttribute('x1', cx);
      edgeC.setAttribute('y1', cy);
      edgeC.setAttribute('x2', classPos.x);
      edgeC.setAttribute('y2', classPos.y);
      edgeC.setAttribute('class', 'km-edge');
      g.appendChild(edgeC);

      // Class node
      const classG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      classG.dataset.classId = cls.classId;
      const classNodeR = 36;
      const classCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      classCircle.setAttribute('cx', classPos.x);
      classCircle.setAttribute('cy', classPos.y);
      classCircle.setAttribute('r', classNodeR);
      classCircle.setAttribute('class', 'km-node-class');
      if (this.selectedClass === cls.classId) classCircle.classList.add('is-selected');

      const classLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      classLabel.setAttribute('x', classPos.x);
      classLabel.setAttribute('y', classPos.y);
      classLabel.setAttribute('class', 'km-label km-label-class');
      const code = cls.classCode || cls.classId;
      classLabel.textContent = code.length > 10 ? code.replace(' ', '\n') : code;

      classG.append(classCircle, classLabel);
      classG.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectedClass = this.selectedClass === cls.classId ? null : cls.classId;
        this.drawMap();
      });
      g.appendChild(classG);

      // Class progress arc
      const classReviewed = topics.filter((t) => this.reviewed.has(t.topicId)).length;
      const classProgress = topics.length ? classReviewed / topics.length : 0;
      if (classProgress > 0) {
        const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arc.setAttribute('d', describeArc(classPos.x, classPos.y, classNodeR + 6, classProgress));
        arc.setAttribute('class', 'km-progress-arc');
        g.appendChild(arc);
      }

      topics.forEach((topic, ti) => {
        const tAngle = topics.length === 1
          ? classAngle
          : topicStart + (topicSpan / Math.max(1, topics.length - 1)) * ti;
        const tPos = polarToCartesian(cx, cy, topicRadius, tAngle);

        const edgeT = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        edgeT.setAttribute('x1', classPos.x);
        edgeT.setAttribute('y1', classPos.y);
        edgeT.setAttribute('x2', tPos.x);
        edgeT.setAttribute('y2', tPos.y);
        edgeT.setAttribute('class', 'km-edge');
        if (this.selectedClass && this.selectedClass !== cls.classId) {
          edgeT.style.opacity = '0.2';
        }
        g.appendChild(edgeT);

        const topicG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        topicG.dataset.topicId = topic.topicId;
        const topicR = 22;
        const topicCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        topicCircle.setAttribute('cx', tPos.x);
        topicCircle.setAttribute('cy', tPos.y);
        topicCircle.setAttribute('r', topicR);
        topicCircle.setAttribute('class', 'km-node-topic');
        if (this.reviewed.has(topic.topicId)) topicCircle.classList.add('is-reviewed');
        if (this.selectedTopic === topic.topicId) topicCircle.classList.add('is-active');
        if (this.selectedClass && this.selectedClass !== cls.classId) {
          topicCircle.style.opacity = '0.25';
        }

        const topicLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        topicLabel.setAttribute('x', tPos.x);
        topicLabel.setAttribute('y', tPos.y + topicR + 14);
        topicLabel.setAttribute('class', 'km-label');
        const shortTitle = topic.title.length > 22 ? `${topic.title.slice(0, 20)}…` : topic.title;
        topicLabel.textContent = shortTitle;

        topicG.append(topicCircle, topicLabel);
        topicG.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectTopic(topic, cls);
        });
        g.appendChild(topicG);
      });
    });

    svg.appendChild(g);
  }

  selectTopic(topic, cls) {
    this.selectedTopic = topic.topicId;
    this.drawMap();
    this.showPanel(topic, cls);
  }

  showPanel(topic, cls) {
    const commandsHtml = (topic.commands || []).length
      ? `<div class="km-commands">
          <div class="km-commands-label">Commands</div>
          ${topic.commands.map((c) => `
            <div class="km-command">
              <div class="km-command-top">
                <pre><code>${c.cmd.replace(/</g, '&lt;')}</code></pre>
                <button type="button" class="km-copy" data-cmd="${c.cmd.replace(/"/g, '&quot;')}">Copy</button>
              </div>
              <div class="km-command-explain">${c.explain}</div>
            </div>
          `).join('')}
        </div>`
      : '';

    const tagsHtml = (topic.tags || []).length
      ? `<div class="km-tags">${topic.tags.map((t) => `<span class="km-tag">${t}</span>`).join('')}</div>`
      : '';

    this.panel.innerHTML = `
      <div class="km-panel-content">
        <div class="km-panel-header">
          <span class="km-class-badge">${cls.classCode}</span>
          <h2 class="km-topic-title">${topic.title}</h2>
          ${tagsHtml}
        </div>
        <div class="km-summary">${topic.summary}</div>
        <div class="km-detail">${renderMarkdown(topic.detail || '')}</div>
        ${commandsHtml}
      </div>
      <div class="km-panel-actions">
        <button type="button" class="km-btn" id="kmMarkReviewed">
          ${this.reviewed.has(topic.topicId) ? '✓ Reviewed' : 'Mark reviewed'}
        </button>
      </div>
    `;

    this.panel.querySelectorAll('.km-copy').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(btn.dataset.cmd);
          btn.textContent = 'Copied';
          btn.classList.add('is-copied');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('is-copied');
          }, 1500);
        } catch { /* clipboard blocked */ }
      });
    });

    this.panel.querySelector('#kmMarkReviewed')?.addEventListener('click', () => {
      if (this.reviewed.has(topic.topicId)) {
        this.reviewed.delete(topic.topicId);
      } else {
        this.reviewed.add(topic.topicId);
      }
      saveProgress(this.category, this.reviewed);
      this.updateProgressLabel();
      this.showPanel(topic, cls);
      this.drawMap();
    });
  }

  updateProgressLabel() {
    const el = document.getElementById('kmProgressText');
    if (el) {
      el.textContent = `${this.reviewed.size} / ${this.flatTopics.length} reviewed`;
    }
  }

  bindEvents() {
    document.getElementById('kmFlashBtn')?.addEventListener('click', () => this.openFlashcards());
    document.getElementById('kmResetView')?.addEventListener('click', () => {
      this.pan = { x: 0, y: 0 };
      this.selectedClass = null;
      this.drawMap();
    });
    document.getElementById('kmFlashClose')?.addEventListener('click', () => this.closeFlashcards());
    document.getElementById('kmFlashPrev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.flashPrev();
    });
    document.getElementById('kmFlashNext')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.flashNext();
    });
    document.getElementById('kmFlashFlip')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.flipFlash();
    });

    const card = document.getElementById('kmFlashCard');
    card?.addEventListener('click', () => this.flipFlash());

    // Pan drag
    this.svg.addEventListener('pointerdown', (e) => {
      if (e.target.closest('[data-topic-id]') || e.target.closest('[data-class-id]')) return;
      this.dragging = true;
      this.dragStart = { x: e.clientX - this.pan.x, y: e.clientY - this.pan.y };
      this.svg.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      this.pan.x = e.clientX - this.dragStart.x;
      this.pan.y = e.clientY - this.dragStart.y;
      this.mapGroup?.setAttribute('transform', `translate(${this.pan.x}, ${this.pan.y})`);
    });
    window.addEventListener('pointerup', () => {
      this.dragging = false;
      this.svg?.classList.remove('is-dragging');
    });
  }

  openFlashcards() {
    if (!this.flatTopics.length) return;
    this.flashIndex = 0;
    this.flashFlipped = false;
    this.renderFlashcard();
    this.flashOverlay.classList.add('is-open');
  }

  closeFlashcards() {
    this.flashOverlay.classList.remove('is-open');
  }

  renderFlashcard() {
    const topic = this.flatTopics[this.flashIndex];
    const card = document.getElementById('kmFlashCard');
    const inner = document.getElementById('kmFlashInner');
    if (!topic || !inner) return;

    card.classList.toggle('is-flipped', this.flashFlipped);
    inner.innerHTML = `
      <div class="km-flash-face front">
        <div class="km-flash-title">${topic.title}</div>
        <p>${topic.summary}</p>
        <span class="km-flash-hint">Click or press Flip to see detail · ${this.flashIndex + 1} / ${this.flatTopics.length}</span>
      </div>
      <div class="km-flash-face back">
        <div class="km-detail">${renderMarkdown(topic.detail || topic.summary)}</div>
        <span class="km-flash-hint">${topic.classCode}</span>
      </div>
    `;
  }

  flipFlash() {
    this.flashFlipped = !this.flashFlipped;
    document.getElementById('kmFlashCard')?.classList.toggle('is-flipped', this.flashFlipped);
  }

  flashPrev() {
    this.flashFlipped = false;
    this.flashIndex = (this.flashIndex - 1 + this.flatTopics.length) % this.flatTopics.length;
    this.renderFlashcard();
  }

  flashNext() {
    this.flashFlipped = false;
    this.flashIndex = (this.flashIndex + 1) % this.flatTopics.length;
    this.renderFlashcard();
  }
}

/** Auto-init when a root element is present. */
export function initKnowledgeMindmap(selector = '#knowledge-mindmap') {
  const el = document.querySelector(selector);
  if (!el) return null;
  const map = new KnowledgeMindmap(el);
  map.init().catch((err) => {
    el.innerHTML = `<p style="padding:24px;color:#f87171;">Failed to load knowledge map: ${err.message}</p>`;
  });
  return map;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initKnowledgeMindmap());
} else {
  initKnowledgeMindmap();
}
