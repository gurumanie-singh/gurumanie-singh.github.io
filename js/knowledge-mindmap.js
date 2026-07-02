/* ============================================================================
   knowledge-mindmap.js — Left-to-right accordion knowledge tree
   ========================================================================== */

const COL_GAP = 220;
const ROW_GAP = 52;
const ROOT_X = 48;
const PILL_MIN_W = 100;
const PILL_H = 36;
const PILL_PAD_X = 14;

/** Inline SVG icons per domainId — stroke via currentColor (--km-accent) */
const DOMAIN_ICON_PATHS = {
  'network-security': '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><line x1="8" y1="7.5" x2="10.5" y2="16"/><line x1="16" y1="7.5" x2="13.5" y2="16"/><line x1="8.5" y1="6" x2="15.5" y2="6"/>',
  'web-security': '<rect x="3" y="4" width="18" height="14" rx="2"/><line x1="3" y1="8" x2="21" y2="8"/><rect x="15" y="13" width="5" height="4" rx="1"/><path d="M16.5 13v-1a1.5 1.5 0 013 0v1"/>',
  'exploitation-vulnerability': '<path d="M12 3l7 4v5c0 4.5-3.5 7.5-7 9-3.5-1.5-7-4.5-7-9V7l7-4z"/><line x1="8" y1="10" x2="16" y2="14"/><line x1="16" y1="10" x2="8" y2="14"/>',
  'reconnaissance-osint': '<circle cx="10" cy="10" r="6"/><line x1="14.5" y1="14.5" x2="20" y2="20"/><line x1="10" y1="7" x2="10" y2="13"/><line x1="7" y1="10" x2="13" y2="10"/>',
  cryptography: '<circle cx="8" cy="14" r="4"/><path d="M12 14h5a3 3 0 010 6h-1"/><line x1="12" y1="10" x2="12" y2="14"/>',
  'linux-cli': '<rect x="3" y="4" width="18" height="14" rx="2"/><polyline points="7 9 9 11 7 13"/><line x1="11" y1="13" x2="15" y2="13"/>',
  'malware-threat': '<ellipse cx="12" cy="14" rx="5" ry="6"/><circle cx="12" cy="8" r="3"/>',
  'digital-forensics': '<path d="M6 4h10l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"/><circle cx="14" cy="14" r="4"/>',
  'cloud-infrastructure': '<path d="M7 18h10a4 4 0 000-8 5.5 5.5 0 00-10.5 2A3.5 3.5 0 007 18z"/>',
  'software-code-security': '<polyline points="8 6 4 12 8 18"/><polyline points="16 6 20 12 16 18"/>',
  'intrusion-detection-monitoring': '<polyline points="3 14 7 10 11 13 15 7 19 9 21 6"/>',
  'incident-response': '<path d="M12 3l7 4v5c0 4.5-3.5 7.5-7 9-3.5-1.5-7-4.5-7-9V7l7-4z"/>',
  key: '<circle cx="8" cy="14" r="4"/><path d="M12 14h5a3 3 0 010 6h-1"/><line x1="12" y1="10" x2="12" y2="14"/>',
};

function domainIconSvg(iconKey, size = 16) {
  const paths = DOMAIN_ICON_PATHS[iconKey] || DOMAIN_ICON_PATHS.key;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
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

/** Fallback: first meaningful noun phrase, max 4 words */
function deriveLabel(title) {
  if (!title) return '';
  let t = title.replace(/\([^)]*\)/g, '').replace(/\s*[—–-]\s*.+$/, '').trim();
  const words = t.split(/\s+/).filter(Boolean);
  const skip = new Set(['the', 'a', 'an']);
  while (words.length && skip.has(words[0].toLowerCase())) words.shift();
  return words.slice(0, 4).join(' ');
}

function nodeLabel(node) {
  return node.label || deriveLabel(node.title || '');
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

function estimatePillWidth(label, isRoot) {
  const charW = 7.2;
  const base = label.length * charW + PILL_PAD_X * 2 + (isRoot ? 8 : 0);
  return Math.max(PILL_MIN_W, Math.min(base, 200));
}

function bezierEdge(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

export class KnowledgeMindmap {
  constructor(rootEl, options = {}) {
    this.rootEl = rootEl;
    this.category = options.category || rootEl.dataset.category || 'cybersecurity';
    this.dataPath = options.dataPath || rootEl.dataset.source || `../data/${this.category}.json`;
    this.tree = null;
    this.nodeById = new Map();
    this.parentById = new Map();
    /** Open branch from root: [rootId, childId, ...] — accordion path */
    this.expandedPath = [];
    this.openLeafId = null;
    this.flatNodes = [];
    this.prevVisibleIds = new Set();
    this.rootCenterY = 400;
  }

  async init() {
    const res = await fetch(this.dataPath);
    if (!res.ok) throw new Error(`Failed to load ${this.dataPath}`);
    const raw = normalizeLegacy(await res.json());
    this.tree = raw;
    this.indexTree(raw.root, null);
    const fromHash = this.pathFromHash();
    this.expandedPath = fromHash.length ? fromHash : [raw.root.id];
    this.openLeafId = null;
    this.renderLayout();
    this.renderAll();
    this.bindEvents();
    this.syncHash(true);
  }

  indexTree(node, parentId) {
    if (!node.label) node.label = deriveLabel(node.title || '');
    this.nodeById.set(node.id, node);
    if (parentId) this.parentById.set(node.id, parentId);
    this.flatNodes.push(node);
    (node.children || []).forEach((child) => this.indexTree(child, node.id));
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
    return valid.length ? valid : [];
  }

  syncHash(replace = false) {
    const next = `#${this.expandedPath.join('/')}`;
    if (replace) history.replaceState(null, '', next);
    else if (window.location.hash !== next) window.location.hash = next;
  }

  /** Visible columns for accordion tree */
  getVisibleColumns() {
    const columns = [[this.tree.root]];
    if (!this.expandedPath.length) return columns;

    const root = this.tree.root;
    if (root.children?.length) columns.push(root.children);

    for (let i = 1; i < this.expandedPath.length; i += 1) {
      const node = this.nodeById.get(this.expandedPath[i]);
      if (node && hasChildren(node)) columns.push(node.children);
    }
    return columns;
  }

  isEdgeActive(parentId, childId) {
    const pi = this.expandedPath.indexOf(parentId);
    return pi >= 0 && this.expandedPath[pi + 1] === childId;
  }

  isExpandedBranch(nodeId) {
    const path = this.pathFor(nodeId);
    const depth = path.length - 1;
    return this.expandedPath[depth] === nodeId && hasChildren(this.nodeById.get(nodeId));
  }

  computeLayout() {
    const columns = this.getVisibleColumns();
    const positions = new Map();
    const pillWidths = new Map();
    const viewportMid = 400;

    columns.forEach((col, depth) => {
      col.forEach((node) => {
        const isRoot = node.type === 'root';
        pillWidths.set(node.id, estimatePillWidth(nodeLabel(node), isRoot));
      });
    });

    const root = this.tree.root;
    const rootW = pillWidths.get(root.id) || PILL_MIN_W;
    positions.set(root.id, { x: ROOT_X, y: viewportMid, depth: 0, w: rootW });
    this.rootCenterY = viewportMid;

    if (columns.length > 1) {
      const col1 = columns[1];
      const blockH = (col1.length - 1) * ROW_GAP;
      let startY = viewportMid - blockH / 2;
      col1.forEach((node, i) => {
        positions.set(node.id, {
          x: ROOT_X + COL_GAP,
          y: startY + i * ROW_GAP,
          depth: 1,
          w: pillWidths.get(node.id),
        });
      });
    }

    for (let d = 2; d < columns.length; d += 1) {
      const parentId = this.expandedPath[d - 1];
      const parentPos = positions.get(parentId);
      const col = columns[d];
      if (!parentPos || !col) continue;
      const blockH = (col.length - 1) * ROW_GAP;
      let startY = parentPos.y - blockH / 2;
      col.forEach((node, i) => {
        positions.set(node.id, {
          x: ROOT_X + d * COL_GAP,
          y: startY + i * ROW_GAP,
          depth: d,
          w: pillWidths.get(node.id),
        });
      });
    }

    const maxX = Math.max(...[...positions.values()].map((p) => p.x + (p.w || PILL_MIN_W)), 800);
    const allY = [...positions.values()].map((p) => p.y);
    const minY = Math.min(...allY, 0) - 80;
    const maxY = Math.max(...allY, 0) + 80;

    return { positions, columns, width: maxX + 120, height: maxY - minY + 120, minY };
  }

  toggleBranch(nodeId) {
    const node = this.nodeById.get(nodeId);
    if (!node || !hasChildren(node)) return;
    const path = this.pathFor(nodeId);
    const depth = path.length - 1;
    if (depth === 0) return; // root never collapses

    if (this.expandedPath[depth] === nodeId) {
      this.expandedPath = this.expandedPath.slice(0, depth);
    } else {
      this.expandedPath = path;
    }
    this.openLeafId = null;
    this.renderAll();
    this.syncHash(false);
    this.scrollNodeIntoView(nodeId);
  }

  openLeaf(nodeId) {
    const node = this.nodeById.get(nodeId);
    if (!node || hasChildren(node)) return;
    this.openLeafId = nodeId;
    this.renderAll();
    this.scrollNodeIntoView(nodeId);
  }

  closeLeaf() {
    this.openLeafId = null;
    this.renderAll();
  }

  handleNodeClick(node) {
    if (hasChildren(node)) this.toggleBranch(node.id);
    else this.openLeaf(node.id);
  }

  renderLayout() {
    this.rootEl.className = 'km-page';
    this.rootEl.innerHTML = `
      <div class="km-toolbar">
        <span class="km-category-label">${escapeHtml(this.tree?.category || 'Knowledge')}</span>
        <div class="km-search-wrap">
          <input type="search" class="km-search" id="kmSearch" placeholder="Search nodes..." autocomplete="off" />
          <div class="km-search-results" id="kmSearchResults" hidden></div>
        </div>
        <button type="button" class="km-btn" id="kmResetBtn">Reset</button>
      </div>
      <div class="km-canvas-wrap">
        <div class="km-tree-scroll" id="kmTreeScroll">
          <button type="button" class="km-jump-root" id="kmJumpRoot" title="Back to root" aria-label="Back to root">↑ Root</button>
          <div class="km-tree-inner" id="kmTreeInner"></div>
        </div>
        <aside class="km-leaf-panel" id="kmLeafPanel" hidden></aside>
      </div>
    `;
  }

  renderAll() {
    this.renderTree();
    this.renderLeafPanel();
    this.updateJumpRootButton();
  }

  renderTree() {
    const scroll = this.rootEl.querySelector('#kmTreeScroll');
    const inner = this.rootEl.querySelector('#kmTreeInner');
    if (!inner) return;

    const { positions, width, height, minY } = this.computeLayout();
    const visibleIds = new Set(positions.keys());
    const entering = new Set([...visibleIds].filter((id) => !this.prevVisibleIds.has(id)));
    const exiting = new Set([...this.prevVisibleIds].filter((id) => !visibleIds.has(id)));

    inner.style.width = `${width}px`;
    inner.style.height = `${height}px`;
    inner.style.paddingTop = `${Math.max(0, -minY + 60)}px`;

    const yOffset = Math.max(0, -minY + 60);

    // SVG edges
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'km-tree-edges');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);

    const edgesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgesG.setAttribute('transform', `translate(0, ${yOffset})`);

    for (const [childId, pos] of positions) {
      if (pos.depth === 0) continue;
      const parentId = this.parentById.get(childId);
      const parentPos = positions.get(parentId);
      if (!parentPos) continue;
      const x1 = parentPos.x + (parentPos.w || PILL_MIN_W);
      const y1 = parentPos.y;
      const x2 = pos.x;
      const y2 = pos.y;
      const onPath = this.isEdgeActive(parentId, childId);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', bezierEdge(x1, y1, x2, y2));
      path.setAttribute('class', `km-tree-edge${onPath ? ' is-active' : ''}${entering.has(childId) ? ' is-entering' : ''}${exiting.has(childId) ? ' is-exiting' : ''}`);
      path.dataset.from = parentId;
      path.dataset.to = childId;
      edgesG.appendChild(path);
    }
    svg.appendChild(edgesG);

    const nodesLayer = document.createElement('div');
    nodesLayer.className = 'km-tree-nodes';
    nodesLayer.style.transform = `translateY(${yOffset}px)`;

    for (const [id, pos] of positions) {
      const node = this.nodeById.get(id);
      if (!node) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'km-pill';
      btn.dataset.id = id;
      btn.title = node.title;
      btn.style.left = `${pos.x}px`;
      btn.style.top = `${pos.y - PILL_H / 2}px`;
      btn.style.minWidth = `${pos.w}px`;

      if (node.type === 'root') btn.classList.add('km-pill-root');
      if (this.isExpandedBranch(id)) btn.classList.add('is-expanded');
      if (this.openLeafId === id) btn.classList.add('is-leaf-open');
      if (!hasChildren(node)) btn.classList.add('km-pill-leaf');
      if (entering.has(id)) btn.classList.add('is-entering');
      if (exiting.has(id)) btn.classList.add('is-exiting');

      const icon = (node.type === 'domain' || node.icon)
        ? `<span class="km-pill-icon">${domainIconSvg(node.icon || node.id, 14)}</span>`
        : '';

      btn.innerHTML = `${icon}<span class="km-pill-label">${escapeHtml(nodeLabel(node))}</span>`;
      btn.addEventListener('click', () => this.handleNodeClick(node));
      nodesLayer.appendChild(btn);
    }

    inner.innerHTML = '';
    inner.appendChild(svg);
    inner.appendChild(nodesLayer);

    requestAnimationFrame(() => {
      inner.querySelectorAll('.is-entering').forEach((el) => {
        el.classList.remove('is-entering');
        el.classList.add('is-entered');
      });
      inner.querySelectorAll('.km-tree-edge.is-entering').forEach((el) => {
        el.classList.remove('is-entering');
      });
    });

    this.prevVisibleIds = visibleIds;
  }

  renderLeafPanel() {
    const panel = this.rootEl.querySelector('#kmLeafPanel');
    if (!panel) return;
    if (!this.openLeafId) {
      panel.hidden = true;
      panel.innerHTML = '';
      return;
    }
    const node = this.nodeById.get(this.openLeafId);
    if (!node) {
      panel.hidden = true;
      return;
    }
    panel.hidden = false;
    panel.innerHTML = this.leafCardHtml(node);
    this.bindLeafCard(panel);
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

  bindLeafCard(card) {
    card.querySelector('#kmLeafClose')?.addEventListener('click', () => this.closeLeaf());
    card.querySelectorAll('.km-copy').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(btn.dataset.cmd);
          btn.textContent = 'Copied';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1200);
        } catch (_) {}
      });
    });
  }

  scrollNodeIntoView(nodeId) {
    const scroll = this.rootEl.querySelector('#kmTreeScroll');
    const pill = scroll?.querySelector(`[data-id="${nodeId}"]`);
    if (scroll && pill) {
      const left = pill.offsetLeft - 80;
      scroll.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    }
  }

  jumpToRoot() {
    const scroll = this.rootEl.querySelector('#kmTreeScroll');
    const inner = this.rootEl.querySelector('#kmTreeInner');
    if (!scroll) return;
    const padTop = parseFloat(inner?.style.paddingTop) || 0;
    const rootY = padTop + this.rootCenterY - scroll.clientHeight / 2;
    scroll.scrollTo({ left: 0, top: Math.max(0, rootY), behavior: 'smooth' });
  }

  updateJumpRootButton() {
    const btn = this.rootEl.querySelector('#kmJumpRoot');
    const scroll = this.rootEl.querySelector('#kmTreeScroll');
    if (!btn || !scroll) return;
    const show = scroll.scrollLeft > 200 || scroll.scrollTop > 200;
    btn.classList.toggle('is-visible', show);
  }

  reset() {
    this.expandedPath = [this.tree.root.id];
    this.openLeafId = null;
    this.renderAll();
    this.syncHash(false);
    this.jumpToRoot();
  }

  navigateToSearchResult(nodeId) {
    const node = this.nodeById.get(nodeId);
    if (!node) return;
    if (hasChildren(node)) {
      this.expandedPath = this.pathFor(nodeId);
      this.openLeafId = null;
    } else {
      const parentId = this.parentById.get(nodeId);
      this.expandedPath = parentId ? this.pathFor(parentId) : [this.tree.root.id];
      this.openLeafId = nodeId;
    }
    this.renderAll();
    this.syncHash(false);
    this.scrollNodeIntoView(nodeId);
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
      const hay = `${n.title || ''} ${n.label || ''} ${n.summary || ''} ${(n.tags || []).join(' ')}`.toLowerCase();
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
        this.navigateToSearchResult(btn.dataset.id);
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
    this.rootEl.querySelector('#kmJumpRoot')?.addEventListener('click', () => this.jumpToRoot());

    const scroll = this.rootEl.querySelector('#kmTreeScroll');
    scroll?.addEventListener('scroll', () => this.updateJumpRootButton());

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.km-search-wrap')) {
        const r = this.rootEl.querySelector('#kmSearchResults');
        if (r) r.hidden = true;
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.openLeafId) this.closeLeaf();
        else if (this.expandedPath.length > 1) {
          this.expandedPath = this.expandedPath.slice(0, -1);
          this.renderAll();
          this.syncHash(false);
        }
      }
    });
    window.addEventListener('hashchange', () => {
      const p = this.pathFromHash();
      if (p.length) {
        this.expandedPath = p;
        this.openLeafId = null;
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
    el.innerHTML = `<p style="padding:24px;color:var(--km-text);">Failed to load knowledge map: ${escapeHtml(err.message)}</p>`;
  });
  return map;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initKnowledgeMindmap());
} else {
  initKnowledgeMindmap();
}
