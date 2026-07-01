/* ============================================================================
   knowledge-mindmap.js
   Two-level drill-down: Domain hub → Topic list → Detail panel.
   Loads data/[category].json (domains or legacy classes schema).
   ========================================================================== */

const KM_STORAGE_PREFIX = 'knowledge-progress-';

/** Inline SVG icons per domainId — 24×24, stroke only, cyan accent */
const DOMAIN_ICON_PATHS = {
  'network-security': '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><line x1="8" y1="7.5" x2="10.5" y2="16"/><line x1="16" y1="7.5" x2="13.5" y2="16"/><line x1="8.5" y1="6" x2="15.5" y2="6"/>',
  'web-security': '<rect x="3" y="4" width="18" height="14" rx="2"/><line x1="3" y1="8" x2="21" y2="8"/><rect x="15" y="13" width="5" height="4" rx="1"/><path d="M16.5 13v-1a1.5 1.5 0 013 0v1"/>',
  'exploitation-vulnerability': '<path d="M12 3l7 4v5c0 4.5-3.5 7.5-7 9-3.5-1.5-7-4.5-7-9V7l7-4z"/><line x1="8" y1="10" x2="16" y2="14"/><line x1="16" y1="10" x2="8" y2="14"/>',
  'reconnaissance-osint': '<circle cx="10" cy="10" r="6"/><line x1="14.5" y1="14.5" x2="20" y2="20"/><line x1="10" y1="7" x2="10" y2="13"/><line x1="7" y1="10" x2="13" y2="10"/>',
  'cryptography': '<circle cx="8" cy="14" r="4"/><path d="M12 14h5a3 3 0 010 6h-1"/><line x1="12" y1="10" x2="12" y2="14"/>',
  'linux-cli': '<rect x="3" y="4" width="18" height="14" rx="2"/><polyline points="7 9 9 11 7 13"/><line x1="11" y1="13" x2="15" y2="13"/><rect x="17" y="12" width="2" height="2" fill="#22d3ee" stroke="none"/>',
  'malware-threat': '<ellipse cx="12" cy="14" rx="5" ry="6"/><circle cx="12" cy="8" r="3"/><line x1="9" y1="5" x2="8" y2="2"/><line x1="15" y1="5" x2="16" y2="2"/><line x1="7" y1="14" x2="4" y2="16"/><line x1="17" y1="14" x2="20" y2="16"/><line x1="8" y1="18" x2="6" y2="21"/><line x1="16" y1="18" x2="18" y2="21"/>',
  'digital-forensics': '<path d="M6 4h10l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"/><circle cx="14" cy="14" r="4"/><line x1="16.5" y1="16.5" x2="19" y2="19"/>',
  'cloud-infrastructure': '<path d="M7 18h10a4 4 0 000-8 5.5 5.5 0 00-10.5 2A3.5 3.5 0 007 18z"/><rect x="10" y="12" width="4" height="3" rx="0.5"/><path d="M11.5 12v-1a1 1 0 012 0v1"/>',
  'software-code-security': '<polyline points="8 6 4 12 8 18"/><polyline points="16 6 20 12 16 18"/><line x1="13" y1="5" x2="11" y2="19"/><polyline points="11 16 13 19 15 16"/>',
  'intrusion-detection-monitoring': '<polyline points="3 14 7 10 11 13 15 7 19 9 21 6"/><circle cx="15" cy="7" r="1.5" fill="#22d3ee" stroke="none"/>',
  'incident-response': '<path d="M12 3l7 4v5c0 4.5-3.5 7.5-7 9-3.5-1.5-7-4.5-7-9V7l7-4z"/><line x1="12" y1="9" x2="12" y2="13"/><polyline points="10 15 12 17 16 13"/>',
};

function domainIconSvg(domainId, size = 24) {
  const paths = DOMAIN_ICON_PATHS[domainId] || DOMAIN_ICON_PATHS['network-security'];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function appendDomainIconSvg(parent, domainId, x, y, size = 22) {
  const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
  fo.setAttribute('x', x - size / 2);
  fo.setAttribute('y', y - size / 2 - 4);
  fo.setAttribute('width', size);
  fo.setAttribute('height', size);
  fo.innerHTML = domainIconSvg(domainId, size);
  parent.appendChild(fo);
}

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

function normalizeData(raw) {
  if (raw.domains) {
    return {
      category: raw.category,
      domains: raw.domains.map((d) => ({
        ...d,
        topics: (d.topics || []).map((t) => ({
          ...t,
          domainId: d.domainId,
          domainName: d.domainName,
        })),
      })),
    };
  }
  // Legacy classes → pseudo-domains for forward compat
  return {
    category: raw.category,
    domains: (raw.classes || []).map((c) => ({
      domainId: c.classId,
      domainName: c.className || c.classCode,
      topics: (c.topics || []).map((t) => ({ ...t, domainId: c.classId, domainName: c.className || c.classCode })),
    })),
  };
}

export class KnowledgeMindmap {
  constructor(rootEl, options = {}) {
    this.root = rootEl;
    this.category = options.category || rootEl.dataset.category || 'cybersecurity';
    this.data = null;
    this.reviewed = loadProgress(this.category);
    this.level = 1; // 1=domains, 2=topic list, 3=detail
    this.selectedDomain = null;
    this.selectedTopic = null;
    this.searchQuery = '';
    this.flatTopics = [];
    this.flashIndex = 0;
    this.flashFlipped = false;
  }

  async init() {
    const res = await fetch(`../data/${this.category}.json`);
    if (!res.ok) throw new Error(`Failed to load data/${this.category}.json`);
    this.data = normalizeData(await res.json());
    this.flatTopics = this.data.domains.flatMap((d) => d.topics);
    this.render();
    this.bindEvents();
    this.updateProgressLabel();
  }

  render() {
    this.root.innerHTML = '';
    this.root.className = 'km-page';

    const toolbar = document.createElement('div');
    toolbar.className = 'km-toolbar';
    toolbar.innerHTML = `
      <div class="km-toolbar-left">
        <span class="km-category-label">${this.data.category}</span>
        <span class="km-progress-text" id="kmProgressText">0 / 0 reviewed</span>
      </div>
      <div class="km-search-wrap">
        <input type="search" class="km-search" id="kmSearch" placeholder="Search topics…" autocomplete="off" />
        <div class="km-search-results" id="kmSearchResults" hidden></div>
      </div>
      <div class="km-toolbar-actions">
        <button type="button" class="km-btn" id="kmFlashBtn">Flashcards</button>
      </div>
    `;

    const shell = document.createElement('div');
    shell.className = 'km-shell';

    this.hubWrap = document.createElement('div');
    this.hubWrap.className = 'km-hub-wrap';
    this.hubWrap.innerHTML = `
      <div class="km-hub-desktop" id="kmHubDesktop"></div>
      <div class="km-hub-mobile" id="kmHubMobile"></div>
    `;

    this.panel = document.createElement('aside');
    this.panel.className = 'km-panel km-panel-transition';
    this.renderPanel();

    shell.append(this.hubWrap, this.panel);
    this.root.append(toolbar, shell);

    if (!this.flashOverlay) {
      this.flashOverlay = document.createElement('div');
      this.flashOverlay.className = 'km-flash-overlay';
      this.flashOverlay.innerHTML = `
        <button type="button" class="km-btn km-flash-close" id="kmFlashClose">Close</button>
        <div>
          <div class="km-flash-card" id="kmFlashCard"><div class="km-flash-inner" id="kmFlashInner"></div></div>
          <div class="km-flash-controls">
            <button type="button" class="km-btn" id="kmFlashPrev">← Prev</button>
            <button type="button" class="km-btn" id="kmFlashFlip">Flip</button>
            <button type="button" class="km-btn" id="kmFlashNext">Next →</button>
          </div>
        </div>
      `;
      document.body.appendChild(this.flashOverlay);
    }

    this.drawDomainHub();
    this.updateHubHighlight();
  }

  renderPanel() {
    this.panel.classList.toggle('is-level-2', this.level === 2);
    this.panel.classList.toggle('is-level-3', this.level === 3);

    if (this.level === 1) {
      this.panel.innerHTML = `
        <div class="km-panel-empty">
          <p>Select a domain to browse topics</p>
        </div>
      `;
      return;
    }

    const breadcrumb = this.renderBreadcrumb();

    if (this.level === 2 && this.selectedDomain) {
      const topics = this.selectedDomain.topics || [];
      this.panel.innerHTML = `
        ${breadcrumb}
        <div class="km-topic-list-header">
          <span class="km-domain-icon-lg">${domainIconSvg(this.selectedDomain.domainId, 28)}</span>
          <div>
            <h2 class="km-domain-heading">${this.selectedDomain.domainName}</h2>
            <p class="km-domain-count">${topics.length} topics</p>
          </div>
        </div>
        <div class="km-topic-list" role="list">
          ${topics.map((t) => `
            <button type="button" class="km-topic-card${this.reviewed.has(t.topicId) ? ' is-reviewed' : ''}" data-topic-id="${t.topicId}" role="listitem">
              <span class="km-topic-card-title">${t.title}</span>
              <span class="km-topic-card-tags">${(t.tags || []).slice(0, 3).map((tag) => `<span class="km-tag-pill">${tag}</span>`).join('')}</span>
            </button>
          `).join('')}
        </div>
      `;
      this.panel.querySelectorAll('.km-topic-card').forEach((btn) => {
        btn.addEventListener('click', () => {
          const topic = topics.find((t) => t.topicId === btn.dataset.topicId);
          if (topic) this.openTopic(topic);
        });
      });
      return;
    }

    if (this.level === 3 && this.selectedTopic) {
      const t = this.selectedTopic;
      const commandsHtml = (t.commands || []).length
        ? `<div class="km-commands">
            <div class="km-commands-label">Commands</div>
            ${t.commands.map((c) => `
              <div class="km-command">
                <div class="km-command-top">
                  <pre><code>${c.cmd.replace(/</g, '&lt;')}</code></pre>
                  <button type="button" class="km-copy" data-cmd="${c.cmd.replace(/"/g, '&quot;')}">Copy</button>
                </div>
                ${c.explain ? `<div class="km-command-explain">${c.explain}</div>` : ''}
              </div>
            `).join('')}
          </div>`
        : '';
      const tagsHtml = (t.tags || []).length
        ? `<div class="km-tags">${t.tags.map((tag) => `<span class="km-tag">${tag}</span>`).join('')}</div>`
        : '';

      this.panel.innerHTML = `
        ${breadcrumb}
        <div class="km-panel-content">
          <div class="km-panel-header">
            <h2 class="km-topic-title">${t.title}</h2>
            ${tagsHtml}
          </div>
          <div class="km-summary">${t.summary}</div>
          <div class="km-detail">${renderMarkdown(t.detail || '')}</div>
          ${commandsHtml}
        </div>
        <div class="km-panel-actions">
          <button type="button" class="km-btn" id="kmMarkReviewed">
            ${this.reviewed.has(t.topicId) ? '✓ Reviewed' : 'Mark reviewed'}
          </button>
        </div>
      `;

      this.panel.querySelectorAll('.km-copy').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          try {
            await navigator.clipboard.writeText(btn.dataset.cmd);
            btn.textContent = 'Copied';
            btn.classList.add('is-copied');
            setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('is-copied'); }, 1500);
          } catch { /* blocked */ }
        });
      });

      this.panel.querySelector('#kmMarkReviewed')?.addEventListener('click', () => {
        if (this.reviewed.has(t.topicId)) this.reviewed.delete(t.topicId);
        else this.reviewed.add(t.topicId);
        saveProgress(this.category, this.reviewed);
        this.updateProgressLabel();
        this.openTopic(t);
        this.updateHubHighlight();
      });
    }
  }

  renderBreadcrumb() {
    const parts = [
      { label: this.data.category, action: () => this.goLevel1() },
    ];
    if (this.selectedDomain) {
      parts.push({ label: this.selectedDomain.domainName, action: () => this.openDomain(this.selectedDomain) });
    }
    if (this.selectedTopic && this.level === 3) {
      parts.push({ label: this.selectedTopic.title, action: null });
    }
    return `<nav class="km-breadcrumb" aria-label="Breadcrumb">
      ${parts.map((p, i) => {
        const sep = i > 0 ? '<span class="km-bc-sep">→</span>' : '';
        if (p.action) {
          return `${sep}<button type="button" class="km-bc-link">${p.label}</button>`;
        }
        return `${sep}<span class="km-bc-current">${p.label}</span>`;
      }).join('')}
    </nav>`;
  }

  attachBreadcrumbHandlers() {
    const links = this.panel.querySelectorAll('.km-bc-link');
    const actions = [() => this.goLevel1()];
    if (this.selectedDomain) actions.push(() => this.openDomain(this.selectedDomain));
    links.forEach((link, i) => {
      link.addEventListener('click', () => actions[i]?.());
    });
  }

  drawDomainHub() {
    const domains = this.data.domains.filter((d) => (d.topics || []).length > 0);
    const desktop = document.getElementById('kmHubDesktop');
    const mobile = document.getElementById('kmHubMobile');
    if (!desktop || !mobile) return;

    // Desktop radial SVG
    const cx = 400, cy = 400, radius = 220;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 800');
    svg.setAttribute('class', 'km-canvas');
    svg.setAttribute('aria-label', 'Domain hub');

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Center
    const centerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    centerG.setAttribute('class', 'km-center-node');
    centerG.style.cursor = 'pointer';
    const centerR = 52;
    const cc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    cc.setAttribute('cx', cx); cc.setAttribute('cy', cy); cc.setAttribute('r', centerR);
    cc.setAttribute('class', 'km-node-center');
    const ct1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    ct1.setAttribute('x', cx); ct1.setAttribute('y', cy - 6);
    ct1.setAttribute('class', 'km-label km-label-center');
    ct1.textContent = this.data.category;
    const ct2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    ct2.setAttribute('x', cx); ct2.setAttribute('y', cy + 14);
    ct2.setAttribute('class', 'km-label km-label-center-sub');
    ct2.textContent = `${domains.length} domains`;
    centerG.append(cc, ct1, ct2);
    centerG.addEventListener('click', () => this.goLevel1());
    g.appendChild(centerG);

    domains.forEach((domain, i) => {
      const angle = (360 / domains.length) * i;
      const pos = polarToCartesian(cx, cy, radius, angle);

      const edge = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      edge.setAttribute('x1', cx); edge.setAttribute('y1', cy);
      edge.setAttribute('x2', pos.x); edge.setAttribute('y2', pos.y);
      edge.setAttribute('class', 'km-edge');
      g.appendChild(edge);

      const nodeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeG.dataset.domainId = domain.domainId;
      nodeG.setAttribute('class', 'km-domain-node');
      nodeG.style.cursor = 'pointer';

      const r = 42;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x); circle.setAttribute('cy', pos.y); circle.setAttribute('r', r);
      circle.setAttribute('class', 'km-node-domain');

      const iconG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      appendDomainIconSvg(iconG, domain.domainId, pos.x, pos.y, 22);

      const name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      name.setAttribute('x', pos.x); name.setAttribute('y', pos.y + r + 16);
      name.setAttribute('class', 'km-label km-domain-name');
      const short = domain.domainName.length > 18 ? domain.domainName.slice(0, 16) + '…' : domain.domainName;
      name.textContent = short;

      const count = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      count.setAttribute('x', pos.x); count.setAttribute('y', pos.y + 12);
      count.setAttribute('class', 'km-label km-domain-count-label');
      count.textContent = `${domain.topicCount ?? (domain.topics || []).length}`;

      nodeG.append(circle, iconG, count, name);
      nodeG.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openDomain(domain);
      });
      g.appendChild(nodeG);
    });

    svg.appendChild(g);
    desktop.innerHTML = '';
    desktop.appendChild(svg);

    // Mobile vertical cards
    mobile.innerHTML = domains.map((d) => `
      <button type="button" class="km-domain-card" data-domain-id="${d.domainId}">
        <span class="km-domain-card-icon">${domainIconSvg(d.domainId, 24)}</span>
        <span class="km-domain-card-body">
          <span class="km-domain-card-name">${d.domainName}</span>
          <span class="km-domain-card-count">${d.topicCount ?? (d.topics || []).length} topics</span>
        </span>
      </button>
    `).join('');

    mobile.querySelectorAll('.km-domain-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = domains.find((x) => x.domainId === btn.dataset.domainId);
        if (d) this.openDomain(d);
      });
    });
  }

  updateHubHighlight() {
    const activeId = this.selectedDomain?.domainId;
    document.querySelectorAll('.km-domain-node').forEach((node) => {
      const circle = node.querySelector('.km-node-domain');
      circle?.classList.toggle('is-active', activeId === node.dataset.domainId && this.level >= 2);
    });
    document.querySelectorAll('.km-domain-card').forEach((card) => {
      card.classList.toggle('is-active', activeId === card.dataset.domainId && this.level >= 2);
    });
  }

  goLevel1() {
    this.level = 1;
    this.selectedDomain = null;
    this.selectedTopic = null;
    this.renderPanel();
    this.updateHubHighlight();
    this.hubWrap?.classList.remove('is-dimmed');
  }

  openDomain(domain) {
    this.level = 2;
    this.selectedDomain = domain;
    this.selectedTopic = null;
    this.renderPanel();
    this.attachBreadcrumbHandlers();
    this.updateHubHighlight();
    this.hubWrap?.classList.add('is-dimmed');
    this.panel.scrollTop = 0;
  }

  openTopic(topic) {
    this.level = 3;
    this.selectedTopic = topic;
    this.renderPanel();
    this.attachBreadcrumbHandlers();
    this.panel.scrollTop = 0;
  }

  runSearch(query) {
    const resultsEl = document.getElementById('kmSearchResults');
    if (!resultsEl) return;
    const q = query.trim().toLowerCase();
    if (!q) {
      resultsEl.hidden = true;
      resultsEl.innerHTML = '';
      return;
    }
    const matches = this.flatTopics.filter((t) => {
      const hay = `${t.title} ${t.summary} ${(t.tags || []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    }).slice(0, 20);

    if (!matches.length) {
      resultsEl.hidden = false;
      resultsEl.innerHTML = '<div class="km-search-empty">No matches</div>';
      return;
    }

    resultsEl.hidden = false;
    resultsEl.innerHTML = matches.map((t) => `
      <button type="button" class="km-search-item" data-topic-id="${t.topicId}">
        <span class="km-search-badge"><span class="km-search-icon">${domainIconSvg(t.domainId, 14)}</span> ${t.domainName}</span>
        <span class="km-search-title">${t.title}</span>
      </button>
    `).join('');

    resultsEl.querySelectorAll('.km-search-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const topic = this.flatTopics.find((t) => t.topicId === btn.dataset.topicId);
        if (!topic) return;
        const domain = this.data.domains.find((d) => d.domainId === topic.domainId);
        if (domain) {
          this.selectedDomain = domain;
          this.openTopic(topic);
        }
        resultsEl.hidden = true;
        document.getElementById('kmSearch').value = '';
      });
    });
  }

  updateProgressLabel() {
    const el = document.getElementById('kmProgressText');
    if (el) el.textContent = `${this.reviewed.size} / ${this.flatTopics.length} reviewed`;
  }

  bindEvents() {
    document.getElementById('kmSearch')?.addEventListener('input', (e) => {
      this.runSearch(e.target.value);
    });
    document.getElementById('kmSearch')?.addEventListener('focus', (e) => {
      if (e.target.value) this.runSearch(e.target.value);
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.km-search-wrap')) {
        const r = document.getElementById('kmSearchResults');
        if (r) r.hidden = true;
      }
    });
    document.getElementById('kmFlashBtn')?.addEventListener('click', () => this.openFlashcards());
    document.getElementById('kmFlashClose')?.addEventListener('click', () => this.closeFlashcards());
    document.getElementById('kmFlashPrev')?.addEventListener('click', (e) => { e.stopPropagation(); this.flashPrev(); });
    document.getElementById('kmFlashNext')?.addEventListener('click', (e) => { e.stopPropagation(); this.flashNext(); });
    document.getElementById('kmFlashFlip')?.addEventListener('click', (e) => { e.stopPropagation(); this.flipFlash(); });
    document.getElementById('kmFlashCard')?.addEventListener('click', () => this.flipFlash());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.flashOverlay?.classList.contains('is-open')) this.closeFlashcards();
        else if (this.level > 1) this.goLevel1();
      }
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
    this.flashOverlay?.classList.remove('is-open');
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
        <span class="km-flash-hint">Click or Flip · ${this.flashIndex + 1} / ${this.flatTopics.length}</span>
      </div>
      <div class="km-flash-face back">
        <div class="km-detail">${renderMarkdown(topic.detail || topic.summary)}</div>
        <span class="km-flash-hint">${topic.domainName}</span>
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
