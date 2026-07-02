/* ============================================================================
   knowledge-mindmap.js
   Recursive mind map: every node is a bubble, arbitrary depth.
   ========================================================================== */

/** Inline SVG icons per domainId — 24×24, stroke only, cyan accent */
const DOMAIN_ICON_PATHS = {
  'network-security': '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><line x1="8" y1="7.5" x2="10.5" y2="16"/><line x1="16" y1="7.5" x2="13.5" y2="16"/><line x1="8.5" y1="6" x2="15.5" y2="6"/>',
  'web-security': '<rect x="3" y="4" width="18" height="14" rx="2"/><line x1="3" y1="8" x2="21" y2="8"/><rect x="15" y="13" width="5" height="4" rx="1"/><path d="M16.5 13v-1a1.5 1.5 0 013 0v1"/>',
  'exploitation-vulnerability': '<path d="M12 3l7 4v5c0 4.5-3.5 7.5-7 9-3.5-1.5-7-4.5-7-9V7l7-4z"/><line x1="8" y1="10" x2="16" y2="14"/><line x1="16" y1="10" x2="8" y2="14"/>',
  'reconnaissance-osint': '<circle cx="10" cy="10" r="6"/><line x1="14.5" y1="14.5" x2="20" y2="20"/><line x1="10" y1="7" x2="10" y2="13"/><line x1="7" y1="10" x2="13" y2="10"/>',
  cryptography: '<circle cx="8" cy="14" r="4"/><path d="M12 14h5a3 3 0 010 6h-1"/><line x1="12" y1="10" x2="12" y2="14"/>',
  'linux-cli': '<rect x="3" y="4" width="18" height="14" rx="2"/><polyline points="7 9 9 11 7 13"/><line x1="11" y1="13" x2="15" y2="13"/><rect x="17" y="12" width="2" height="2" fill="#22d3ee" stroke="none"/>',
  'malware-threat': '<ellipse cx="12" cy="14" rx="5" ry="6"/><circle cx="12" cy="8" r="3"/><line x1="9" y1="5" x2="8" y2="2"/><line x1="15" y1="5" x2="16" y2="2"/><line x1="7" y1="14" x2="4" y2="16"/><line x1="17" y1="14" x2="20" y2="16"/><line x1="8" y1="18" x2="6" y2="21"/><line x1="16" y1="18" x2="18" y2="21"/>',
  'digital-forensics': '<path d="M6 4h10l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"/><circle cx="14" cy="14" r="4"/><line x1="16.5" y1="16.5" x2="19" y2="19"/>',
  'cloud-infrastructure': '<path d="M7 18h10a4 4 0 000-8 5.5 5.5 0 00-10.5 2A3.5 3.5 0 007 18z"/><rect x="10" y="12" width="4" height="3" rx="0.5"/><path d="M11.5 12v-1a1 1 0 012 0v1"/>',
  'software-code-security': '<polyline points="8 6 4 12 8 18"/><polyline points="16 6 20 12 16 18"/><line x1="13" y1="5" x2="11" y2="19"/><polyline points="11 16 13 19 15 16"/>',
  'intrusion-detection-monitoring': '<polyline points="3 14 7 10 11 13 15 7 19 9 21 6"/><circle cx="15" cy="7" r="1.5" fill="#22d3ee" stroke="none"/>',
  'incident-response': '<path d="M12 3l7 4v5c0 4.5-3.5 7.5-7 9-3.5-1.5-7-4.5-7-9V7l7-4z"/><line x1="12" y1="9" x2="12" y2="13"/><polyline points="10 15 12 17 16 13"/>',
  key: '<circle cx="8" cy="14" r="4"/><path d="M12 14h5a3 3 0 010 6h-1"/><line x1="12" y1="10" x2="12" y2="14"/>',
};

function domainIconSvg(iconKey, size = 24) {
  const paths = DOMAIN_ICON_PATHS[iconKey] || DOMAIN_ICON_PATHS['network-security'];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function hasChildren(node) {
  return Array.isArray(node?.children) && node.children.length > 0;
}

function escapeHtml(v = '') {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function markdownTable(block) {
  const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2 || !/^\|.*\|$/.test(lines[0]) || !/^\|\s*-/.test(lines[1])) return null;
  const head = lines[0].split('|').slice(1, -1).map((x) => x.trim());
  const body = lines.slice(2).map((ln) => ln.split('|').slice(1, -1).map((x) => x.trim()));
  return `<table><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function renderMarkdown(md) {
  if (!md) return '';
  let html = escapeHtml(md);
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  const blocks = html.split(/\n\n+/);
  return blocks.map((block) => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('<h')) return block;
    const table = markdownTable(block);
    if (table) return table;
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

function normalizeLegacy(raw) {
  if (raw.root) return raw;
  if (raw.domains) {
    return {
      category: raw.category || 'Knowledge',
      lastBuilt: raw.lastBuilt,
      root: {
        id: (raw.category || 'knowledge').toLowerCase().replace(/\s+/g, '-'),
        title: raw.category || 'Knowledge',
        type: 'root',
        children: raw.domains.map((d) => ({
          id: d.domainId,
          title: d.domainName,
          type: 'domain',
          icon: d.domainId,
          summary: `${d.topicCount ?? (d.topics || []).length} topics`,
          children: (d.topics || []).map((t) => ({
            id: t.topicId,
            title: t.title,
            type: 'topic',
            tags: t.tags || [],
            summary: t.summary || '',
            detail: t.detail || '',
            commands: t.commands || [],
            sourceType: t.sourceType,
            sources: t.sources,
          })),
        })),
      },
    };
  }
  return raw;
}

function nodeRadius(node, depth, focused) {
  if (focused) return 52;
  if (node.type === 'domain') return 38;
  if (depth <= 1) return 34;
  if (depth === 2) return 30;
  return 26;
}

export class KnowledgeMindmap {
  constructor(rootEl, options = {}) {
    this.rootEl = rootEl;
    this.category = options.category || rootEl.dataset.category || 'cybersecurity';
    this.dataPath = options.dataPath || rootEl.dataset.source || `../data/${this.category}.json`;
    this.tree = null;
    this.nodeById = new Map();
    this.parentById = new Map();
    this.path = [];
    this.leafOpen = false;
    this.flatNodes = [];
  }

  async init() {
    const res = await fetch(this.dataPath);
    if (!res.ok) throw new Error(`Failed to load ${this.dataPath}`);
    const raw = normalizeLegacy(await res.json());
    this.tree = raw;
    this.indexTree(raw.root, null);
    const fromHash = this.pathFromHash();
    this.path = fromHash.length ? fromHash : [raw.root.id];
    this.leafOpen = this.isLeaf(this.currentNode());
    this.renderLayout();
    this.renderAll();
    this.bindEvents();
    this.syncHash(true);
  }

  indexTree(node, parentId) {
    this.nodeById.set(node.id, node);
    if (parentId) this.parentById.set(node.id, parentId);
    this.flatNodes.push(node);
    (node.children || []).forEach((child) => this.indexTree(child, node.id));
  }

  currentNode() {
    return this.nodeById.get(this.path[this.path.length - 1]);
  }

  isLeaf(node) {
    return node && !hasChildren(node);
  }

  childrenOf(node) {
    return node?.children || [];
  }

  pathFor(nodeId) {
    const chain = [];
    let cur = nodeId;
    while (cur) {
      chain.push(cur);
      cur = this.parentById.get(cur);
    }
    return chain.reverse();
  }

  pathFromHash() {
    const hash = decodeURIComponent(window.location.hash || '').replace(/^#/, '');
    if (!hash) return [];
    const parts = hash.split('/').filter(Boolean);
    const valid = [];
    for (let i = 0; i < parts.length; i += 1) {
      const id = parts[i];
      const node = this.nodeById.get(id);
      if (!node) break;
      if (i > 0) {
        const parent = this.nodeById.get(parts[i - 1]);
        if (!(parent?.children || []).some((c) => c.id === id)) break;
      }
      valid.push(id);
    }
    return valid;
  }

  syncHash(replace = false) {
    const next = `#${this.path.join('/')}`;
    if (replace) history.replaceState(null, '', next);
    else if (window.location.hash !== next) window.location.hash = next;
  }

  renderLayout() {
    this.rootEl.className = 'km-page';
    this.rootEl.innerHTML = `
      <div class="km-toolbar">
        <span class="km-category-label">${escapeHtml(this.tree.category || this.currentNode()?.title || 'Knowledge')}</span>
        <div class="km-search-wrap">
          <input type="search" class="km-search" id="kmSearch" placeholder="Search nodes..." autocomplete="off" />
          <div class="km-search-results" id="kmSearchResults" hidden></div>
        </div>
        <button type="button" class="km-btn" id="kmResetBtn">Reset</button>
      </div>
      <div class="km-canvas-wrap">
        <div class="km-breadcrumb" id="kmBreadcrumb"></div>
        <div class="km-desktop-canvas" id="kmDesktopCanvas"></div>
        <div class="km-mobile-canvas" id="kmMobileCanvas"></div>
      </div>
    `;
  }

  renderAll() {
    this.renderBreadcrumb();
    this.renderDesktop();
    this.renderMobile();
  }

  renderBreadcrumb() {
    const el = this.rootEl.querySelector('#kmBreadcrumb');
    if (!el) return;
    const crumbs = this.path.map((id) => this.nodeById.get(id)).filter(Boolean);
    el.innerHTML = crumbs.map((node, idx) => {
      const sep = idx > 0 ? '<span class="km-bc-sep">›</span>' : '';
      if (idx === crumbs.length - 1) return `${sep}<span class="km-bc-current">${escapeHtml(node.title)}</span>`;
      return `${sep}<button type="button" class="km-bc-link" data-id="${node.id}">${escapeHtml(node.title)}</button>`;
    }).join('');
    el.querySelectorAll('.km-bc-link').forEach((btn) => {
      btn.addEventListener('click', () => this.navigateTo(btn.dataset.id));
    });
  }

  renderDesktop() {
    const mount = this.rootEl.querySelector('#kmDesktopCanvas');
    if (!mount) return;
    const focus = this.currentNode();
    const children = this.childrenOf(focus);
    const parent = this.nodeById.get(this.parentById.get(focus.id));
    const siblings = parent ? this.childrenOf(parent).filter((n) => n.id !== focus.id) : [];

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1200 800');
    svg.setAttribute('class', 'km-canvas');

    const cx = 600;
    const cy = 420;
    const childRadius = Math.min(280, Math.max(170, 105 + children.length * 8));

    // path ancestors as faded background (still clickable)
    const ancestors = this.path.slice(0, -1).map((id) => this.nodeById.get(id)).filter(Boolean);
    ancestors.forEach((node, idx) => {
      const p = polarToCartesian(180, 130 + idx * 110, 0, 0);
      this.drawNode(svg, {
        node,
        x: p.x,
        y: p.y,
        radius: 24,
        cls: 'km-node km-node-bg',
        label: node.title,
        onClick: () => this.navigateTo(node.id),
      });
    });

    // siblings of focus in background ring
    siblings.forEach((node, i) => {
      const pos = polarToCartesian(cx, cy, childRadius + 110, (360 / Math.max(siblings.length, 1)) * i);
      this.drawEdge(svg, cx, cy, pos.x, pos.y, 'km-edge km-edge-bg');
      this.drawNode(svg, {
        node,
        x: pos.x,
        y: pos.y,
        radius: 24,
        cls: 'km-node km-node-bg',
        label: node.title,
        onClick: () => this.navigateTo(node.id),
      });
    });

    // focus node
    this.drawNode(svg, {
      node: focus,
      x: cx,
      y: cy,
      radius: nodeRadius(focus, this.path.length - 1, true),
      cls: 'km-node km-node-focus',
      label: focus.title,
      summary: focus.summary,
      onClick: () => {
        if (hasChildren(focus)) this.navigateTo(focus.id);
        else this.toggleLeaf();
      },
    });

    // children orbit ring
    children.forEach((node, i) => {
      const angle = (360 / Math.max(children.length, 1)) * i;
      const pos = polarToCartesian(cx, cy, childRadius, angle);
      this.drawEdge(svg, cx, cy, pos.x, pos.y, 'km-edge');
      this.drawNode(svg, {
        node,
        x: pos.x,
        y: pos.y,
        radius: nodeRadius(node, this.path.length, false),
        cls: `km-node ${this.isLeaf(node) ? 'km-node-leaf' : 'km-node-branch'}`,
        label: node.title,
        summary: node.summary,
        onClick: () => this.navigateTo(node.id),
      });
    });

    mount.innerHTML = '';
    mount.appendChild(svg);

    if (this.leafOpen && this.isLeaf(focus)) {
      const card = document.createElement('div');
      card.className = 'km-leaf-card';
      card.innerHTML = this.leafCardHtml(focus);
      mount.appendChild(card);
      card.querySelectorAll('.km-copy').forEach((btn) => {
        btn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(btn.dataset.cmd);
            btn.textContent = 'Copied';
            setTimeout(() => { btn.textContent = 'Copy'; }, 1200);
          } catch (_) {}
        });
      });
      card.querySelector('#kmLeafClose')?.addEventListener('click', () => {
        this.leafOpen = false;
        this.renderAll();
      });
    }
  }

  leafCardHtml(node) {
    const tags = (node.tags || []).map((t) => `<span class="km-tag">${escapeHtml(t)}</span>`).join('');
    const commands = (node.commands || []).length ? `
      <div class="km-commands">
        <div class="km-commands-label">Commands</div>
        ${(node.commands || []).map((c) => `
          <div class="km-command">
            <div class="km-command-top">
              <pre><code>${escapeHtml(c.cmd)}</code></pre>
              <button type="button" class="km-copy" data-cmd="${escapeHtml(c.cmd)}">Copy</button>
            </div>
            ${c.explain ? `<div class="km-command-explain">${escapeHtml(c.explain)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    ` : '';
    return `
      <button type="button" class="km-leaf-close km-btn" id="kmLeafClose">Back</button>
      <h2 class="km-topic-title">${escapeHtml(node.title)}</h2>
      ${tags ? `<div class="km-tags">${tags}</div>` : ''}
      <div class="km-summary">${escapeHtml(node.summary || '')}</div>
      <div class="km-detail">${renderMarkdown(node.detail || '')}</div>
      ${commands}
    `;
  }

  drawEdge(svg, x1, y1, x2, y2, cls = 'km-edge') {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', cls);
    svg.appendChild(line);
  }

  drawNode(svg, { node, x, y, radius, cls, label, summary, onClick }) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', cls);
    g.style.cursor = 'pointer';
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', x);
    c.setAttribute('cy', y);
    c.setAttribute('r', radius);
    c.setAttribute('class', 'km-node-circle');
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', y + 3);
    t.setAttribute('class', 'km-label');
    const short = label.length > 26 ? `${label.slice(0, 24)}…` : label;
    t.textContent = short;
    g.appendChild(c);
    if ((node.type === 'domain' || node.icon) && radius >= 32) {
      const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
      fo.setAttribute('x', x - 10);
      fo.setAttribute('y', y - radius + 10);
      fo.setAttribute('width', 20);
      fo.setAttribute('height', 20);
      fo.innerHTML = domainIconSvg(node.icon || node.id, 18);
      g.appendChild(fo);
    }
    g.appendChild(t);
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${label}${summary ? `\n${summary}` : ''}`;
    g.appendChild(title);
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    svg.appendChild(g);
  }

  renderMobile() {
    const mount = this.rootEl.querySelector('#kmMobileCanvas');
    if (!mount) return;
    const focus = this.currentNode();
    const list = this.childrenOf(focus);
    const isLeaf = this.isLeaf(focus);
    if (isLeaf && this.leafOpen) {
      mount.innerHTML = `<div class="km-mobile-leaf">${this.leafCardHtml(focus)}</div>`;
      mount.querySelector('#kmLeafClose')?.addEventListener('click', () => {
        this.leafOpen = false;
        this.renderAll();
      });
      mount.querySelectorAll('.km-copy').forEach((btn) => {
        btn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(btn.dataset.cmd);
            btn.textContent = 'Copied';
            setTimeout(() => { btn.textContent = 'Copy'; }, 1200);
          } catch (_) {}
        });
      });
      return;
    }

    mount.innerHTML = `
      <div class="km-mobile-list">
        ${list.map((node) => `
          <button type="button" class="km-mobile-item" data-id="${node.id}">
            <span class="km-mobile-item-title">${escapeHtml(node.title)}</span>
            <span class="km-mobile-item-meta">${hasChildren(node) ? `${node.children.length} children` : 'Leaf'}</span>
          </button>
        `).join('')}
      </div>
    `;
    mount.querySelectorAll('.km-mobile-item').forEach((btn) => {
      btn.addEventListener('click', () => this.navigateTo(btn.dataset.id));
    });
  }

  navigateTo(id, fromPopstate = false) {
    const node = this.nodeById.get(id);
    if (!node) return;
    this.path = this.pathFor(id);
    this.leafOpen = this.isLeaf(node);
    this.renderAll();
    if (!fromPopstate) this.syncHash(false);
  }

  navigateUp() {
    if (this.leafOpen) {
      this.leafOpen = false;
      this.renderAll();
      return;
    }
    if (this.path.length <= 1) return;
    this.path = this.path.slice(0, -1);
    this.leafOpen = false;
    this.renderAll();
    this.syncHash(false);
  }

  reset() {
    this.path = [this.tree.root.id];
    this.leafOpen = false;
    this.renderAll();
    this.syncHash(false);
  }

  toggleLeaf() {
    if (!this.isLeaf(this.currentNode())) return;
    this.leafOpen = !this.leafOpen;
    this.renderAll();
  }

  runSearch(query) {
    const resultsEl = this.rootEl.querySelector('#kmSearchResults');
    if (!resultsEl) return;
    const q = query.trim().toLowerCase();
    if (!q) {
      resultsEl.hidden = true;
      resultsEl.innerHTML = '';
      return;
    }
    const matches = this.flatNodes.filter((n) => {
      const hay = `${n.title || ''} ${n.summary || ''} ${(n.tags || []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    }).slice(0, 25);
    if (!matches.length) {
      resultsEl.hidden = false;
      resultsEl.innerHTML = '<div class="km-search-empty">No matches</div>';
      return;
    }
    resultsEl.hidden = false;
    resultsEl.innerHTML = matches.map((n) => `
      <button type="button" class="km-search-item" data-id="${n.id}">
        <span class="km-search-badge">${escapeHtml(n.type || 'node')}</span>
        <span class="km-search-title">${escapeHtml(n.title)}</span>
      </button>
    `).join('');
    resultsEl.querySelectorAll('.km-search-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.navigateTo(btn.dataset.id);
        resultsEl.hidden = true;
        const input = this.rootEl.querySelector('#kmSearch');
        if (input) input.value = '';
      });
    });
  }

  bindEvents() {
    this.rootEl.querySelector('#kmSearch')?.addEventListener('input', (e) => {
      this.runSearch(e.target.value);
    });
    this.rootEl.querySelector('#kmResetBtn')?.addEventListener('click', () => this.reset());
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.km-search-wrap')) {
        const r = this.rootEl.querySelector('#kmSearchResults');
        if (r) r.hidden = true;
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.navigateUp();
    });
    window.addEventListener('hashchange', () => {
      const p = this.pathFromHash();
      if (p.length) {
        this.path = p;
        this.leafOpen = this.isLeaf(this.currentNode());
        this.renderAll();
      } else {
        this.reset();
      }
    });
  }
}

export function initKnowledgeMindmap(selector = '#knowledge-mindmap') {
  const el = document.querySelector(selector);
  if (!el) return null;
  const map = new KnowledgeMindmap(el);
  map.init().catch((err) => {
    el.innerHTML = `<p style="padding:24px;color:#f87171;">Failed to load knowledge map: ${escapeHtml(err.message)}</p>`;
  });
  return map;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initKnowledgeMindmap());
} else {
  initKnowledgeMindmap();
}
