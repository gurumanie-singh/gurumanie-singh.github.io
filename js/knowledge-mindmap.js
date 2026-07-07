/* ============================================================================
   knowledge-mindmap.js — Radial drill-down knowledge tree (vanilla JS + SVG edges)
   ========================================================================== */

import { initParticleField } from './design-system.js';

const RADIAL_SIBLING_X = 220;
const RADIAL_CHILD_X = 300;
const NODE_GAP_Y = 68;
const MOBILE_BREAKPOINT = 720;
const FONT_SIZE_FLOOR = 11;
const LAYOUT_PAD = 100;
const PILL_MIN_W = 100;
const PILL_H = 36;
const PILL_PAD_X = 14;
const ROOT_PILL_MAX_W = 420;

/** Inline SVG icons per domainId — stroke via currentColor (--km-accent) */
const DOMAIN_ICON_PATHS = {
  fundamentals: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/>',
  networks: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><line x1="8" y1="7.5" x2="10.5" y2="16"/><line x1="16" y1="7.5" x2="13.5" y2="16"/><line x1="8.5" y1="6" x2="15.5" y2="6"/>',
  systems: '<rect x="3" y="4" width="18" height="14" rx="2"/><polyline points="7 9 9 11 7 13"/><line x1="11" y1="13" x2="15" y2="13"/><line x1="11" y1="9" x2="15" y2="9"/>',
  identity: '<circle cx="12" cy="8" r="3"/><path d="M5 20a7 7 0 0114 0"/><circle cx="17" cy="7" r="2"/><path d="M19 11v1"/>',
  'cloud-security': '<path d="M7 18h10a4 4 0 000-8 5.5 5.5 0 00-10.5 2A3.5 3.5 0 007 18z"/>',
  'detection-monitoring': '<polyline points="3 14 7 10 11 13 15 7 19 9 21 6"/><circle cx="18" cy="5" r="2"/>',
  'offensive-security': '<circle cx="12" cy="12" r="8"/><line x1="12" y1="4" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="20"/><line x1="4" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="20" y2="12"/><circle cx="12" cy="12" r="2"/>',
  'malware-re': '<ellipse cx="12" cy="14" rx="5" ry="6"/><circle cx="12" cy="8" r="3"/>',
  'governance-risk-compliance': '<path d="M12 3l7 4v5c0 4.5-3.5 7.5-7 9-3.5-1.5-7-4.5-7-9V7l7-4z"/><line x1="9" y1="12" x2="11" y2="14"/><line x1="11" y1="14" x2="15" y2="10"/>',
  tools: '<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>',
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

/** Inline SVG icons per node type — stroke via currentColor */
const TYPE_ICON_PATHS = {
  concept: '<rect x="5" y="4" width="14" height="16" rx="2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="13" y2="13"/>',
  tool: '<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>',
  technique: '<path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/>',
  attack: '<path d="M12 9v4"/><path d="M12 3l7 14H5L12 3z"/>',
  defense: '<path d="M12 3l7 4v5c0 4.5-3.5 7.5-7 9-3.5-1.5-7-4.5-7-9V7l7-4z"/>',
  lab: '<path d="M9 3h6"/><path d="M10 3v5.5L5.5 18h13L14 8.5V3"/><line x1="8" y1="15" x2="16" y2="15"/>',
  detection: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>',
  command: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
  case_study: '<path d="M6 4h10l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"/><line x1="9" y1="13" x2="15" y2="13"/>',
};

const CONTENT_TYPES = new Set([
  'concept', 'tool', 'technique', 'attack', 'defense', 'lab', 'detection', 'command', 'case_study',
]);

const SEARCH_TYPE_OPTIONS = [
  'domain', 'topic', 'concept', 'tool', 'technique', 'attack', 'defense', 'lab', 'detection', 'command', 'case_study',
];

function formatTypeLabel(type) {
  return String(type).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function typeIconSvg(typeKey, size = 12) {
  const paths = TYPE_ICON_PATHS[typeKey] || TYPE_ICON_PATHS.concept;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function pillTypeClass(type) {
  if (type === ROOT_TYPE) return 'km-pill-root';
  const slug = (type || 'concept').replace(/_/g, '-');
  return `km-pill-type-${slug}`;
}

function pillHeight(type) {
  if (type === ROOT_TYPE) return 44;
  if (type === 'domain') return 40;
  if (CONTENT_TYPES.has(type)) return 38;
  return PILL_H;
}

function pillIconSize(type) {
  if (type === 'domain') return 16;
  if (type === 'topic') return 14;
  if (CONTENT_TYPES.has(type)) return 12;
  return 14;
}

function pillIconHtml(node) {
  const type = node.type || 'concept';
  if (type === ROOT_TYPE) return '';
  if (type === 'domain' || type === 'topic') {
    return `<span class="km-pill-icon km-pill-icon-domain">${domainIconSvg(node.icon || node.id, pillIconSize(type))}</span>`;
  }
  if (CONTENT_TYPES.has(type)) {
    return `<span class="km-pill-icon km-pill-icon-type">${typeIconSvg(type, pillIconSize(type))}</span>`;
  }
  return '';
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

const NODE_TYPES = new Set([
  'domain', 'topic', 'concept', 'tool', 'technique', 'attack', 'defense',
  'lab', 'detection', 'command', 'case_study',
]);
const ROOT_TYPE = 'root';
const LEGACY_TYPE_ALIASES = { subtopic: 'concept', leaf: 'concept' };

function defaultMetadata(overrides = {}) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    difficulty: 'intermediate',
    confidence: 'decent',
    relevance: 'both',
    cert_mapping: [],
    last_updated: today,
    ...overrides,
  };
}

function inferTypeFromDepth(depth, hasKids) {
  if (depth === 0) return ROOT_TYPE;
  if (depth === 1) return 'domain';
  return hasKids ? 'topic' : 'concept';
}

/** Render-time sort — does not mutate source data */
function sortNodesByLabel(nodes) {
  return [...nodes].sort((a, b) =>
    nodeLabel(a).localeCompare(nodeLabel(b), undefined, { sensitivity: 'base', numeric: true }),
  );
}

function normalizeNodeType(node, depth) {
  const kids = hasChildren(node);
  let t = node.type || inferTypeFromDepth(depth, kids);
  if (LEGACY_TYPE_ALIASES[t]) t = LEGACY_TYPE_ALIASES[t];
  if (depth === 0) return ROOT_TYPE;
  if (!NODE_TYPES.has(t)) t = inferTypeFromDepth(depth, kids);
  if (t === 'topic' && !kids && depth >= 2) return 'concept';
  return t;
}

function isContentLeaf(node) {
  if (hasChildren(node)) return false;
  if (node.type === ROOT_TYPE || node.type === 'domain' || node.type === 'topic') return false;
  return true;
}

function normalizeContentFields(node) {
  if (!isContentLeaf(node)) {
    node.children = node.children || [];
    return;
  }
  if (node.detail && !node.core_idea) node.core_idea = node.detail;
  node.summary = node.summary || '';
  node.why_it_matters = node.why_it_matters || '';
  node.core_idea = node.core_idea || node.detail || '';
  node.example_scenario = node.example_scenario || '';
  node.detection_angle = node.detection_angle || '';
  node.defensive_takeaway = node.defensive_takeaway || '';
  node.commands = node.commands || [];
  node.related = node.related || [];
  node.tags = node.tags || [];
  node.metadata = { ...defaultMetadata(), ...(node.metadata || {}) };
}

function normalizeTreeNode(node, depth = 0) {
  if (!node.label) node.label = deriveLabel(node.title || '');
  node.type = normalizeNodeType(node, depth);
  normalizeContentFields(node);
  (node.children || []).forEach((child) => normalizeTreeNode(child, depth + 1));
}

function coreContent(node) {
  return node.core_idea || node.detail || '';
}

function legacyTopicNode(t) {
  return {
    id: t.topicId,
    title: t.title,
    label: t.label,
    type: t.type,
    tags: t.tags || [],
    summary: t.summary || '',
    why_it_matters: t.why_it_matters || '',
    core_idea: t.core_idea || t.detail || '',
    detail: t.detail || '',
    example_scenario: t.example_scenario || '',
    detection_angle: t.detection_angle || '',
    defensive_takeaway: t.defensive_takeaway || '',
    commands: t.commands || [],
    related: t.related || [],
    metadata: t.metadata,
    sourceType: t.sourceType,
    sources: t.sources,
    children: t.children || [],
  };
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
  if (raw?.root) {
    normalizeTreeNode(raw.root, 0);
    return raw;
  }
  if (raw?.domains) {
    const normalized = {
      category: raw.category || 'Knowledge',
      lastBuilt: raw.lastBuilt,
      root: {
        id: (raw.category || 'knowledge').toLowerCase().replace(/\s+/g, '-'),
        title: raw.category || 'Knowledge',
        type: ROOT_TYPE,
        children: raw.domains.map((d) => ({
          id: d.domainId,
          title: d.domainName,
          type: 'domain',
          icon: d.domainId,
          label: d.label,
          summary: `${d.topicCount ?? (d.topics || []).length} topics`,
          children: (d.topics || []).map((t) => legacyTopicNode(t)),
        })),
      },
    };
    normalizeTreeNode(normalized.root, 0);
    return normalized;
  }
  return raw;
}

function validateTreeShape(raw) {
  const errors = [];
  if (!raw || typeof raw !== 'object') {
    errors.push('Document is not a JSON object.');
    return errors;
  }
  if (raw.root) {
    validateNodeBranch(raw.root, errors, new Set(), []);
    return errors;
  }
  if (raw.domains) return errors;
  errors.push('Unrecognized shape: expected nested "root" or legacy "domains[]".');
  return errors;
}

function validateNodeBranch(node, errors, seenIds, path) {
  const here = [...path, node?.id || node?.title || '?'];
  if (!node?.id) {
    errors.push(`Node missing required "id" at ${here.join(' → ')}`);
  } else if (seenIds.has(node.id)) {
    errors.push(`Duplicate node id "${node.id}" at ${here.join(' → ')}`);
  } else {
    seenIds.add(node.id);
  }
  if (!node?.title) {
    console.warn(`[KnowledgeMindmap] Node missing title: id="${node?.id || '?'}" at ${here.join(' → ')}`);
  }
  (node?.children || []).forEach((child) => validateNodeBranch(child, errors, seenIds, here));
}

function showLoadError(rootEl, err, dataPath) {
  const detail = err?.stack || err?.message || String(err);
  console.error('[KnowledgeMindmap] Failed to load knowledge map:', err);
  rootEl.innerHTML = `
    <div class="km-load-error" role="alert">
      <h2 class="km-load-error-title">Failed to load knowledge map</h2>
      <p class="km-load-error-path"><strong>Source:</strong> ${escapeHtml(dataPath)}</p>
      <pre class="km-load-error-detail">${escapeHtml(detail)}</pre>
    </div>
  `;
}

const CAMERA_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const CAMERA_MS = 400;
const PAN_MARGIN = 350;
const PAN_SNAP_MS = 200;

/** Fixed per top-level domain palette — dark (d) and light (l) variants */
const DOMAIN_COLORS = {
  fundamentals: { d: '#c4b5fd', l: '#6d28d9' },
  networks: { d: '#67e8f9', l: '#0e7490' },
  systems: { d: '#7dd3fc', l: '#0369a1' },
  identity: { d: '#f9a8d4', l: '#be185d' },
  'web-security': { d: '#fdba74', l: '#c2410c' },
  'cloud-security': { d: '#a5b4fc', l: '#4338ca' },
  'detection-monitoring': { d: '#86efac', l: '#15803d' },
  'offensive-security': { d: '#fca5a5', l: '#b91c1c' },
  'malware-re': { d: '#f0abfc', l: '#a21caf' },
  cryptography: { d: '#fde047', l: '#a16207' },
  'governance-risk-compliance': { d: '#d4d4d8', l: '#52525b' },
  tools: { d: '#93c5fd', l: '#1d4ed8' },
};

function layoutBox(node) {
  const type = node.type || 'concept';
  const isRoot = type === ROOT_TYPE;
  return {
    width: estimatePillWidth(nodeLabel(node), isRoot),
    height: pillHeight(type),
  };
}

function edgeAnchors(parent, child, mobile = false) {
  const pcx = parent.x + parent.width / 2;
  const pcy = parent.y + parent.height / 2;
  const ccx = child.x + child.width / 2;
  const ccy = child.y + child.height / 2;

  if (mobile && child.y > parent.y + parent.height * 0.4) {
    return {
      x1: pcx,
      y1: parent.y + parent.height,
      x2: ccx,
      y2: child.y,
    };
  }

  if (ccx >= pcx) {
    return {
      x1: parent.x + parent.width,
      y1: pcy,
      x2: child.x,
      y2: ccy,
    };
  }
  return {
    x1: parent.x,
    y1: pcy,
    x2: child.x + child.width,
    y2: ccy,
  };
}

function fontSizeForDepth(depth) {
  const sizes = [15, 14, 13, 12, FONT_SIZE_FLOOR];
  return sizes[Math.min(depth, sizes.length - 1)];
}

function isLightTheme() {
  const t = document.documentElement.getAttribute('data-theme');
  if (t === 'light') return true;
  if (t === 'dark') return false;
  return window.matchMedia('(prefers-color-scheme: light)').matches;
}

function estimatePillWidth(label, isRoot) {
  if (isRoot) {
    // Root had a separate width estimator that could under-size longer labels.
    // Keep root sizing source-of-truth here with a wider fit and sane ceiling.
    const charW = 10.2;
    const padX = 64;
    const estimated = Math.ceil(label.length * charW + padX);
    return Math.max(180, Math.min(estimated, ROOT_PILL_MAX_W));
  }
  const charW = 7.2;
  const iconExtra = 22;
  const base = label.length * charW + PILL_PAD_X * 2 + iconExtra;
  return Math.max(PILL_MIN_W, Math.min(base, 210));
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
    /** Open branch from root: [rootId, childId, ...] — single active path */
    this.expandedPath = [];
    this.rootRevealed = false;
    this.introActive = true;
    this.layoutMobile = false;
    this._particleTeardown = null;
    this.openLeafId = null;
    this.flatNodes = [];
    this.prevVisibleIds = new Set();
    this.lastLayout = null;
    this.camera = { x: 0, y: 0, scale: 1 };
    this.rootCamera = { x: 0, y: 0 };
    this.pendingCameraFocus = null;
    this.panDrag = null;
    this.hasPanned = false;
    this._wheelSnapTimer = null;
    this._panHintTimer = null;
  }

  async init() {
    let raw;
    try {
      const res = await fetch(this.dataPath);
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${this.dataPath}`);
      raw = await res.json();
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error(`Invalid JSON in ${this.dataPath}: ${err.message}`);
      }
      throw err;
    }

    raw = normalizeLegacy(raw);
    const validationErrors = validateTreeShape(raw);
    if (validationErrors.length) {
      throw new Error(`Invalid knowledge data:\n${validationErrors.slice(0, 8).join('\n')}`);
    }

    this.tree = raw;
    this.nodeById.clear();
    this.parentById.clear();
    this.flatNodes = [];
    this.indexTree(raw.root, null);
    const fromHash = this.pathFromHash();
    if (fromHash.length > 1) {
      this.expandedPath = fromHash;
      this.rootRevealed = true;
      this.introActive = false;
    } else {
      this.expandedPath = [raw.root.id];
      this.rootRevealed = false;
      this.introActive = true;
    }
    this.openLeafId = null;
    this.renderLayout();
    this.initParticles();
    this.applyDomainPalette();
    this.renderAll();
    this.bindEvents();
    this.bindPanEvents();
    this.syncHash(true);
    this.focusCameraOn(this.getFocusId(), false);
    this.schedulePanHintFade();
    this.observeThemeChanges();
    if (this.introActive) {
      this.rootEl.classList.add('is-intro');
    }
  }

  initParticles() {
    const wrap = this.rootEl.querySelector('.km-canvas-wrap');
    if (!wrap) return;
    this._particleTeardown?.();
    this._particleTeardown = initParticleField(wrap, {
      className: 'km-particles-canvas',
      density: { mobile: 18, desktop: 36 },
      mobileBreakpoint: MOBILE_BREAKPOINT,
    });
  }

  observeThemeChanges() {
    const observer = new MutationObserver(() => this.applyDomainPalette());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    this._themeObserver = observer;
  }

  applyDomainPalette() {
    const light = isLightTheme();
    Object.entries(DOMAIN_COLORS).forEach(([id, colors]) => {
      this.rootEl.style.setProperty(`--km-domain-${id}`, light ? colors.l : colors.d);
      const dim = light ? `color-mix(in srgb, ${colors.l} 12%, transparent)` : `color-mix(in srgb, ${colors.d} 14%, transparent)`;
      this.rootEl.style.setProperty(`--km-domain-${id}-dim`, dim);
    });
  }

  topDomainFor(nodeId) {
    const path = this.pathFor(nodeId);
    return path.length >= 2 ? path[1] : null;
  }

  isVivid(nodeId) {
    if (this.openLeafId === nodeId) return true;
    const path = this.pathFor(nodeId);
    for (let i = 0; i < path.length; i += 1) {
      if (this.expandedPath[i] !== path[i]) return false;
    }
    return path.length <= this.expandedPath.length;
  }

  domainColorVar(domainId) {
    return domainId ? `var(--km-domain-${domainId})` : null;
  }

  indexTree(node, parentId) {
    normalizeContentFields(node);
    if (!node.label) node.label = deriveLabel(node.title || '');
    if (!node.id) {
      console.warn('[KnowledgeMindmap] Skipping node without id:', node.title || node);
      return;
    }
    if (this.nodeById.has(node.id)) {
      console.warn(`[KnowledgeMindmap] Duplicate node id "${node.id}" — graph lookups will be corrupt; fix data.`);
    }
    this.nodeById.set(node.id, node);
    if (parentId) this.parentById.set(node.id, parentId);
    this.flatNodes.push(node);
    (node.children || []).forEach((child) => this.indexTree(child, node.id));
  }

  pathFor(nodeId) {
    const chain = [];
    const visited = new Set();
    let cur = nodeId;
    while (cur) {
      if (visited.has(cur)) {
        console.warn(`[KnowledgeMindmap] Cycle in parent chain at id "${cur}"`);
        break;
      }
      visited.add(cur);
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

  getFocusId() {
    return this.expandedPath[this.expandedPath.length - 1] || this.tree?.root?.id;
  }

  depthFor(nodeId) {
    return this.pathFor(nodeId).length - 1;
  }

  /** Nodes shown on canvas for the current drill focus */
  getVisibleNodeIds() {
    const focusId = this.getFocusId();
    const focus = this.nodeById.get(focusId);
    if (!focus) return new Set();

    const visible = new Set([focusId]);

    if (!this.rootRevealed && focusId === this.tree.root.id) {
      return visible;
    }

    if (focusId === this.tree.root.id) {
      sortNodesByLabel(this.tree.root.children || []).forEach((c) => visible.add(c.id));
      return visible;
    }

    const parentId = this.parentById.get(focusId);
    const parent = parentId ? this.nodeById.get(parentId) : null;
    if (parent) {
      sortNodesByLabel(parent.children || []).forEach((c) => visible.add(c.id));
    }

    if (hasChildren(focus)) {
      sortNodesByLabel(focus.children).forEach((c) => visible.add(c.id));
    }

    return visible;
  }

  isEdgeActive(parentId, childId) {
    const pi = this.expandedPath.indexOf(parentId);
    return pi >= 0 && this.expandedPath[pi + 1] === childId;
  }

  isExpandedBranch(nodeId) {
    const path = this.pathFor(nodeId);
    const depth = path.length - 1;
    if (depth === 0) return this.rootRevealed && this.expandedPath.length === 1;
    return this.expandedPath[depth] === nodeId && this.expandedPath.length > depth;
  }

  placeSplitNodes(nodes, positions, centerX, centerY, focusBox, offsetX, depth, role, mobile) {
    if (!nodes.length) return;

    const gap = NODE_GAP_Y;

    if (mobile) {
      const boxes = nodes.map((n) => ({ node: n, box: layoutBox(n) }));
      let y = centerY + focusBox.height / 2 + 56;
      boxes.forEach(({ node, box }) => {
        positions.set(node.id, {
          x: centerX - box.width / 2,
          y,
          width: box.width,
          height: box.height,
          depth,
          role,
        });
        y += box.height + gap;
      });
      return;
    }

    const left = nodes.slice(0, Math.ceil(nodes.length / 2));
    const right = nodes.slice(Math.ceil(nodes.length / 2));

    const stackSide = (sideNodes, side) => {
      const boxes = sideNodes.map((n) => ({ node: n, box: layoutBox(n) }));
      const totalH = boxes.reduce((s, b) => s + b.box.height, 0) + gap * Math.max(0, boxes.length - 1);
      let y = centerY - totalH / 2;
      boxes.forEach(({ node, box }) => {
        const x = side === 'left'
          ? centerX - offsetX - box.width
          : centerX + offsetX;
        positions.set(node.id, {
          x,
          y,
          width: box.width,
          height: box.height,
          depth,
          role,
        });
        y += box.height + gap;
      });
    };

    stackSide(left, 'left');
    stackSide(right, 'right');
  }

  computeLayout() {
    const viewport = this.rootEl.querySelector('#kmTreeViewport');
    const vw = viewport?.clientWidth || 900;
    const vh = viewport?.clientHeight || 640;
    const mobile = vw < MOBILE_BREAKPOINT;
    this.layoutMobile = mobile;

    const focusId = this.getFocusId();
    const focus = this.nodeById.get(focusId);
    const positions = new Map();

    const cx = Math.max(LAYOUT_PAD, vw / 2);
    const cy = Math.max(LAYOUT_PAD + 40, vh / 2);

    if (!focus) {
      return { positions, width: vw, height: vh, paddingTop: 0, focusId, mobile };
    }

    const focusBox = layoutBox(focus);
    positions.set(focusId, {
      x: cx - focusBox.width / 2,
      y: cy - focusBox.height / 2,
      width: focusBox.width,
      height: focusBox.height,
      depth: this.depthFor(focusId),
      role: 'focus',
    });

    if (!this.rootRevealed && focusId === this.tree.root.id) {
      return this.finalizeLayout(positions, vw, vh, focusId, mobile);
    }

    let lateralNodes = [];
    let childNodes = [];

    if (focusId === this.tree.root.id) {
      childNodes = sortNodesByLabel(this.tree.root.children || []);
    } else {
      const parentId = this.parentById.get(focusId);
      const parent = parentId ? this.nodeById.get(parentId) : null;
      lateralNodes = sortNodesByLabel(parent?.children || []).filter((n) => n.id !== focusId);
      if (hasChildren(focus)) {
        childNodes = sortNodesByLabel(focus.children);
      }
    }

    const childDepth = this.depthFor(focusId) + 1;
    const lateralDepth = this.depthFor(focusId);

    this.placeSplitNodes(lateralNodes, positions, cx, cy, focusBox, RADIAL_SIBLING_X, lateralDepth, 'sibling', mobile);
    this.placeSplitNodes(childNodes, positions, cx, cy, focusBox, RADIAL_CHILD_X, childDepth, 'child', mobile);

    return this.finalizeLayout(positions, vw, vh, focusId, mobile);
  }

  finalizeLayout(positions, vw, vh, focusId, mobile) {
    const boxes = [...positions.values()];
    const minY = Math.min(...boxes.map((p) => p.y), 0) - LAYOUT_PAD;
    const maxY = Math.max(...boxes.map((p) => p.y + p.height), vh) + LAYOUT_PAD;
    const minX = Math.min(...boxes.map((p) => p.x), 0) - LAYOUT_PAD;
    const maxX = Math.max(...boxes.map((p) => p.x + p.width), vw) + LAYOUT_PAD;
    const paddingTop = Math.max(0, -minY + 40);
    const paddingLeft = Math.max(0, -minX + 40);

    for (const pos of positions.values()) {
      pos.y += paddingTop;
      pos.x += paddingLeft;
    }

    return {
      positions,
      width: maxX - minX + paddingLeft + LAYOUT_PAD,
      height: maxY - minY + paddingTop + LAYOUT_PAD,
      paddingTop,
      paddingLeft,
      focusId,
      mobile,
    };
  }

  toggleBranch(nodeId) {
    const node = this.nodeById.get(nodeId);
    if (!node || !hasChildren(node)) return;
    const path = this.pathFor(nodeId);
    const depth = path.length - 1;

    if (depth === 0) {
      if (!this.rootRevealed) {
        this.rootRevealed = true;
        this.expandedPath = [this.tree.root.id];
      } else if (this.expandedPath.length === 1) {
        this.rootRevealed = false;
      } else {
        this.expandedPath = [this.tree.root.id];
      }
    } else if (this.expandedPath[depth] === nodeId) {
      this.expandedPath = path.slice(0, depth);
    } else {
      this.expandedPath = path;
      this.rootRevealed = true;
    }

    this.dismissIntro();
    this.beginDrillTransition();
    this.openLeafId = null;
    this.renderAll();
    this.syncHash(false);
    this.focusCameraOn(this.getFocusId());
  }

  dismissIntro() {
    if (!this.introActive) return;
    this.introActive = false;
    this.rootEl.classList.remove('is-intro');
  }

  beginDrillTransition() {
    this.rootEl.classList.add('is-drilling');
    window.clearTimeout(this._drillTimer);
    this._drillTimer = window.setTimeout(() => {
      this.rootEl.classList.remove('is-drilling');
    }, 560);
  }

  navigateToDepth(depth) {
    if (depth === 0 && this.expandedPath.length === 1 && this.rootRevealed) {
      this.rootRevealed = false;
    } else {
      this.expandedPath = this.expandedPath.slice(0, depth + 1);
      this.rootRevealed = true;
    }
    this.dismissIntro();
    this.beginDrillTransition();
    this.openLeafId = null;
    this.renderAll();
    this.syncHash(false);
    this.focusCameraOn(this.getFocusId());
  }

  openLeaf(nodeId) {
    const node = this.nodeById.get(nodeId);
    if (!node || hasChildren(node)) return;
    this.openLeafId = nodeId;
    this.renderAll();
    this.focusCameraOn(nodeId);
  }

  closeLeaf() {
    const modal = this.rootEl.querySelector('#kmLeafModal');
    if (!modal || !this.openLeafId) {
      this.openLeafId = null;
      this.renderAll();
      return;
    }
    modal.classList.remove('is-open');
    modal.classList.add('is-closing');
    const finish = () => {
      modal.classList.remove('is-closing');
      this.openLeafId = null;
      this.renderAll();
    };
    modal.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 220);
  }

  handleNodeClick(node) {
    this.dismissIntro();
    if (hasChildren(node)) this.toggleBranch(node.id);
    else this.openLeaf(node.id);
  }

  renderLayout() {
    this.rootEl.className = 'km-page';
    this.rootEl.innerHTML = `
      <div class="km-toolbar">
        <span class="km-category-label">${escapeHtml(this.tree?.category || 'Knowledge')}</span>
        <nav class="km-breadcrumbs" id="kmBreadcrumbs" aria-label="Knowledge path"></nav>
        <div class="km-search-group">
          <div class="km-search-filters">
            <select class="km-filter-select" id="kmFilterType" aria-label="Filter by type">
              <option value="">All types</option>
            </select>
            <select class="km-filter-select" id="kmFilterTag" aria-label="Filter by tag">
              <option value="">All tags</option>
            </select>
          </div>
          <div class="km-search-wrap">
            <input type="search" class="km-search" id="kmSearch" placeholder="Search nodes..." autocomplete="off" />
            <div class="km-search-results" id="kmSearchResults" hidden></div>
          </div>
        </div>
        <button type="button" class="km-btn" id="kmResetBtn">Reset</button>
      </div>
      <div class="km-canvas-wrap">
        <div class="km-tree-viewport" id="kmTreeViewport">
          <button type="button" class="km-jump-root" id="kmJumpRoot" title="Back to root" aria-label="Back to root">↑ Root</button>
          <p class="km-pan-hint" id="kmPanHint" aria-hidden="true">Drag to pan</p>
          <div class="km-tree-camera" id="kmTreeCamera">
            <div class="km-tree-inner" id="kmTreeInner"></div>
          </div>
        </div>
      </div>
      <div class="km-leaf-modal" id="kmLeafModal" hidden aria-hidden="true">
        <div class="km-leaf-backdrop" id="kmLeafBackdrop"></div>
        <div class="km-leaf-card" id="kmLeafCard" role="dialog" aria-modal="true"></div>
      </div>
    `;
  }

  renderAll() {
    this.renderTree();
    this.renderBreadcrumbs();
    this.renderLeafModal();
    this.updateJumpRootButton();
  }

  renderBreadcrumbs() {
    const el = this.rootEl.querySelector('#kmBreadcrumbs');
    if (!el) return;

    const parts = this.expandedPath.map((id, i) => {
      const node = this.nodeById.get(id);
      if (!node) return '';
      const isLast = i === this.expandedPath.length - 1;
      return `<button type="button" class="km-crumb${isLast ? ' is-current' : ''}" data-depth="${i}">${escapeHtml(nodeLabel(node))}</button>`;
    }).filter(Boolean);

    el.innerHTML = parts.reduce((html, part, i) => (
      i === 0 ? part : `${html}<span class="km-crumb-sep" aria-hidden="true">/</span>${part}`
    ), '');

    el.querySelectorAll('.km-crumb').forEach((btn) => {
      btn.addEventListener('click', () => this.navigateToDepth(Number(btn.dataset.depth)));
    });
  }

  renderTree() {
    const inner = this.rootEl.querySelector('#kmTreeInner');
    if (!inner) return;

    const layout = this.computeLayout();
    this.lastLayout = layout;
    const { positions, width, height, mobile } = layout;
    const visibleIds = this.getVisibleNodeIds();
    const entering = new Set([...visibleIds].filter((id) => !this.prevVisibleIds.has(id)));
    const exiting = new Set([...this.prevVisibleIds].filter((id) => !visibleIds.has(id)));

    inner.style.width = `${width}px`;
    inner.style.height = `${height}px`;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'km-tree-edges');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);

    for (const childId of visibleIds) {
      const parentId = this.parentById.get(childId);
      if (!parentId || !visibleIds.has(parentId)) continue;
      const parentPos = positions.get(parentId);
      const pos = positions.get(childId);
      if (!parentPos || !pos) continue;
      const { x1, y1, x2, y2 } = edgeAnchors(parentPos, pos, mobile);
      const onPath = this.isEdgeActive(parentId, childId);
      const domainId = this.topDomainFor(childId);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', bezierEdge(x1, y1, x2, y2));
      path.setAttribute('class', `km-tree-edge${onPath ? ' is-active' : ''}${entering.has(childId) ? ' is-entering' : ''}${exiting.has(childId) ? ' is-exiting' : ''}${onPath ? '' : ' is-muted'}`);
      if (onPath && domainId) {
        path.style.stroke = this.domainColorVar(domainId);
      }
      path.dataset.from = parentId;
      path.dataset.to = childId;
      svg.appendChild(path);
    }

    const nodesLayer = document.createElement('div');
    nodesLayer.className = 'km-tree-nodes';

    for (const id of visibleIds) {
      const pos = positions.get(id);
      const node = this.nodeById.get(id);
      if (!node || !pos) continue;
      const nodeType = node.type || 'concept';
      const domainId = this.topDomainFor(id);
      const vivid = this.isVivid(id);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'km-pill';
      btn.classList.add(pillTypeClass(nodeType));
      if (domainId) btn.dataset.domain = domainId;
      if (vivid) btn.classList.add('is-vivid');
      else if (domainId) btn.classList.add('is-muted');
      btn.dataset.id = id;
      btn.dataset.type = nodeType;
      btn.dataset.depth = String(pos.depth ?? this.depthFor(id));
      btn.title = node.title;
      btn.style.left = `${pos.x}px`;
      btn.style.top = `${pos.y}px`;
      btn.style.width = `${pos.width}px`;
      btn.style.height = `${pos.height}px`;
      btn.style.setProperty('--km-pill-fs', `${fontSizeForDepth(pos.depth ?? 0)}px`);
      if (domainId) {
        btn.style.setProperty('--pill-color', this.domainColorVar(domainId));
        btn.style.setProperty('--pill-color-dim', `var(--km-domain-${domainId}-dim)`);
      }

      if (id === this.getFocusId()) btn.classList.add('is-focus');
      if (this.isExpandedBranch(id)) btn.classList.add('is-expanded');
      if (this.openLeafId === id) btn.classList.add('is-leaf-open');
      if (!hasChildren(node)) btn.classList.add('km-pill-leaf');
      if (entering.has(id)) btn.classList.add('is-entering');
      if (exiting.has(id)) btn.classList.add('is-exiting');

      btn.innerHTML = `${pillIconHtml(node)}<span class="km-pill-label">${escapeHtml(nodeLabel(node))}</span>`;
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
      if (this.pendingCameraFocus) {
        const id = this.pendingCameraFocus;
        this.pendingCameraFocus = null;
        this.focusCameraOn(id, true);
      }
    });

    this.prevVisibleIds = visibleIds;
  }

  getNodeCenter(nodeId) {
    const pos = this.lastLayout?.positions.get(nodeId);
    if (!pos) return null;
    return { x: pos.x + pos.width / 2, y: pos.y + pos.height / 2 };
  }

  getPanBounds() {
    const vp = this.rootEl.querySelector('#kmTreeViewport');
    const layout = this.lastLayout;
    if (!vp || !layout) return null;

    const scale = this.camera.scale;
    const vw = vp.clientWidth;
    const vh = vp.clientHeight;
    let contentMinX = Infinity;
    let contentMinY = Infinity;
    let contentMaxX = -Infinity;
    let contentMaxY = -Infinity;

    for (const pos of layout.positions.values()) {
      contentMinX = Math.min(contentMinX, pos.x);
      contentMinY = Math.min(contentMinY, pos.y);
      contentMaxX = Math.max(contentMaxX, pos.x + pos.width);
      contentMaxY = Math.max(contentMaxY, pos.y + pos.height);
    }

    if (!Number.isFinite(contentMinX)) {
      contentMinX = 0;
      contentMinY = 0;
      contentMaxX = layout.width;
      contentMaxY = layout.height;
    }

    const margin = PAN_MARGIN;
    let txMin = vw - margin - contentMaxX * scale;
    let txMax = margin - contentMinX * scale;
    let tyMin = vh - margin - contentMaxY * scale;
    let tyMax = margin - contentMinY * scale;

    if (txMin > txMax) {
      const mid = (txMin + txMax) / 2;
      txMin = mid - margin;
      txMax = mid + margin;
    }
    if (tyMin > tyMax) {
      const mid = (tyMin + tyMax) / 2;
      tyMin = mid - margin;
      tyMax = mid + margin;
    }

    return { minX: txMin, maxX: txMax, minY: tyMin, maxY: tyMax };
  }

  isCameraOutOfBounds() {
    const bounds = this.getPanBounds();
    if (!bounds) return false;
    return (
      this.camera.x < bounds.minX
      || this.camera.x > bounds.maxX
      || this.camera.y < bounds.minY
      || this.camera.y > bounds.maxY
    );
  }

  applyCameraTransform({ animate = false, snapBack = false } = {}) {
    const cam = this.rootEl.querySelector('#kmTreeCamera');
    if (!cam) return;

    if (snapBack) {
      const bounds = this.getPanBounds();
      if (bounds) {
        this.camera.x = Math.min(bounds.maxX, Math.max(bounds.minX, this.camera.x));
        this.camera.y = Math.min(bounds.maxY, Math.max(bounds.minY, this.camera.y));
      }
    }

    cam.classList.remove('is-animating', 'is-snap-back');
    if (animate) {
      const cls = snapBack ? 'is-snap-back' : 'is-animating';
      cam.classList.add(cls);
      cam.addEventListener('transitionend', () => cam.classList.remove(cls), { once: true });
    }

    const { x, y, scale } = this.camera;
    cam.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }

  focusCameraOn(nodeId, animate = true) {
    const vp = this.rootEl.querySelector('#kmTreeViewport');
    const center = this.getNodeCenter(nodeId);
    if (!vp || !center) {
      this.pendingCameraFocus = nodeId;
      return;
    }

    const vw = vp.clientWidth;
    const vh = vp.clientHeight;
    const scale = this.camera.scale;
    const tx = vw / 2 - center.x * scale;
    const ty = vh / 2 - center.y * scale;

    this.camera.x = tx;
    this.camera.y = ty;

    if (nodeId === this.tree.root.id) {
      this.rootCamera = { x: tx, y: ty };
    }

    this.applyCameraTransform({ animate });
    this.updateJumpRootButton();
  }

  dismissPanHint() {
    const hint = this.rootEl.querySelector('#kmPanHint');
    if (!hint) return;
    hint.classList.add('is-dismissed');
    clearTimeout(this._panHintTimer);
    this._panHintTimer = setTimeout(() => hint.remove(), 400);
  }

  schedulePanHintFade() {
    const hint = this.rootEl.querySelector('#kmPanHint');
    if (!hint || this.hasPanned) {
      hint?.remove();
      return;
    }
    clearTimeout(this._panHintTimer);
    this._panHintTimer = setTimeout(() => {
      if (!this.hasPanned) {
        hint.classList.add('is-fading');
        setTimeout(() => hint.remove(), 500);
      }
    }, 4000);
  }

  bindPanEvents() {
    const vp = this.rootEl.querySelector('#kmTreeViewport');
    if (!vp || vp.dataset.panBound) return;
    vp.dataset.panBound = '1';

    vp.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.target.closest('.km-pill, .km-jump-root, .km-pan-hint')) return;

      this.rootEl.querySelector('#kmTreeCamera')?.classList.remove('is-animating', 'is-snap-back');
      this.panDrag = {
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        originX: this.camera.x,
        originY: this.camera.y,
        moved: false,
      };
      vp.setPointerCapture(e.pointerId);
      vp.classList.add('is-grabbing');
    });

    vp.addEventListener('pointermove', (e) => {
      if (!this.panDrag || e.pointerId !== this.panDrag.pointerId) return;
      const dx = e.clientX - this.panDrag.startClientX;
      const dy = e.clientY - this.panDrag.startClientY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) this.panDrag.moved = true;

      this.camera.x = this.panDrag.originX + dx;
      this.camera.y = this.panDrag.originY + dy;
      this.applyCameraTransform({ animate: false });
      this.updateJumpRootButton();
    });

    const endPan = (e) => {
      if (!this.panDrag || e.pointerId !== this.panDrag.pointerId) return;
      if (vp.hasPointerCapture(e.pointerId)) vp.releasePointerCapture(e.pointerId);
      vp.classList.remove('is-grabbing');

      if (this.panDrag.moved) {
        this.hasPanned = true;
        this.dismissPanHint();
      }

      this.panDrag = null;

      if (this.isCameraOutOfBounds()) {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.applyCameraTransform({ animate: !reduced, snapBack: true });
        this.updateJumpRootButton();
      }
    };

    vp.addEventListener('pointerup', endPan);
    vp.addEventListener('pointercancel', endPan);

    vp.addEventListener('wheel', (e) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      this.rootEl.querySelector('#kmTreeCamera')?.classList.remove('is-animating', 'is-snap-back');

      this.camera.x -= e.deltaX;
      this.camera.y -= e.deltaY;
      this.applyCameraTransform({ animate: false });
      this.updateJumpRootButton();
      this.hasPanned = true;
      this.dismissPanHint();

      clearTimeout(this._wheelSnapTimer);
      this._wheelSnapTimer = setTimeout(() => {
        if (this.isCameraOutOfBounds()) {
          const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          this.applyCameraTransform({ animate: !reduced, snapBack: true });
          this.updateJumpRootButton();
        }
      }, 150);
    }, { passive: false });
  }

  renderLeafModal() {
    const modal = this.rootEl.querySelector('#kmLeafModal');
    const card = this.rootEl.querySelector('#kmLeafCard');
    if (!modal || !card) return;

    if (!this.openLeafId) {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('is-open');
      card.innerHTML = '';
      document.body.classList.remove('km-modal-open');
      return;
    }

    const node = this.nodeById.get(this.openLeafId);
    if (!node) {
      modal.hidden = true;
      return;
    }

    const domainId = this.topDomainFor(node.id);
    modal.classList.remove('is-closing');
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('km-modal-open');
    card.innerHTML = this.leafCardHtml(node);
    if (domainId) {
      card.style.setProperty('--pill-color', this.domainColorVar(domainId));
      card.style.setProperty('--pill-color-dim', `var(--km-domain-${domainId}-dim)`);
    }
    requestAnimationFrame(() => modal.classList.add('is-open'));
    this.bindLeafCard(card);
  }

  leafCardHtml(node) {
    const tags = (node.tags || []).map((t) => `<span class="km-tag">${escapeHtml(t)}</span>`).join('');
    const related = this.relatedSectionHtml(node);
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
      <button type="button" class="km-leaf-close km-btn" id="kmLeafClose" aria-label="Close">Close</button>
      <h2 class="km-topic-title">${escapeHtml(node.title)}</h2>
      ${tags ? `<div class="km-tags">${tags}</div>` : ''}
      <div class="km-summary km-summary-lead">${escapeHtml(node.summary || '')}</div>
      ${related}
      <div class="km-detail">${renderMarkdown(coreContent(node))}</div>
      ${commands}
    `;
  }

  relatedSectionHtml(node) {
    const ids = (node.related || []).filter((id) => id && id !== node.id && this.nodeById.has(id));
    if (!ids.length) return '';

    const chips = ids.map((id) => {
      const rel = this.nodeById.get(id);
      const label = nodeLabel(rel);
      return `<button type="button" class="km-related-chip" data-id="${escapeHtml(id)}" title="${escapeHtml(rel.title)}">${escapeHtml(label)}</button>`;
    }).join('');

    return `
      <div class="km-related">
        <div class="km-related-label">Related</div>
        <div class="km-related-chips">${chips}</div>
      </div>
    `;
  }

  bindLeafCard(card) {
    card.querySelector('#kmLeafClose')?.addEventListener('click', () => this.closeLeaf());
    card.querySelectorAll('.km-related-chip').forEach((btn) => {
      btn.addEventListener('click', () => this.navigateToSearchResult(btn.dataset.id));
    });
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

  jumpToRoot() {
    this.expandedPath = [this.tree.root.id];
    this.rootRevealed = false;
    this.openLeafId = null;
    this.dismissIntro();
    this.renderAll();
    this.syncHash(false);
    this.focusCameraOn(this.tree.root.id, true);
  }

  updateJumpRootButton() {
    const btn = this.rootEl.querySelector('#kmJumpRoot');
    if (!btn) return;
    const dx = Math.abs(this.camera.x - this.rootCamera.x);
    const dy = Math.abs(this.camera.y - this.rootCamera.y);
    btn.classList.toggle('is-visible', dx > 80 || dy > 80);
  }

  reset() {
    this.expandedPath = [this.tree.root.id];
    this.rootRevealed = false;
    this.introActive = false;
    this.rootEl.classList.remove('is-intro');
    this.openLeafId = null;
    const input = this.rootEl.querySelector('#kmSearch');
    if (input) input.value = '';
    this.clearSearchFilters();
    const resultsEl = this.rootEl.querySelector('#kmSearchResults');
    if (resultsEl) {
      resultsEl.hidden = true;
      resultsEl.innerHTML = '';
    }
    this.renderAll();
    this.syncHash(false);
    this.focusCameraOn(this.tree.root.id, true);
  }

  navigateToSearchResult(nodeId) {
    const node = this.nodeById.get(nodeId);
    if (!node) return;
    this.dismissIntro();
    this.rootRevealed = true;
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
    this.focusCameraOn(hasChildren(node) ? nodeId : this.getFocusId());
  }

  runSearch() {
    const resultsEl = this.rootEl.querySelector('#kmSearchResults');
    const input = this.rootEl.querySelector('#kmSearch');
    if (!resultsEl) return;

    const q = (input?.value || '').trim().toLowerCase();
    const { type, tag } = this.getSearchFilters();
    const hasQuery = q.length > 0;
    const hasFilters = Boolean(type || tag);

    if (!hasQuery && !hasFilters) {
      resultsEl.hidden = true;
      resultsEl.innerHTML = '';
      return;
    }

    const matches = this.flatNodes.filter((n) => {
      if (n.type === ROOT_TYPE) return false;
      if (type && n.type !== type) return false;
      if (tag && !(n.tags || []).includes(tag)) return false;
      if (!hasQuery) return true;

      const meta = n.metadata || {};
      const hay = [
        n.title || '',
        n.label || '',
        n.summary || '',
        n.why_it_matters || '',
        coreContent(n),
        n.example_scenario || '',
        n.detection_angle || '',
        n.defensive_takeaway || '',
        (n.tags || []).join(' '),
        (n.related || []).join(' '),
        meta.difficulty || '',
        meta.relevance || '',
        (meta.cert_mapping || []).join(' '),
      ].join(' ').toLowerCase();
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
        if (input) input.value = '';
        this.clearSearchFilters();
      });
    });
  }

  getSearchFilters() {
    const typeEl = this.rootEl.querySelector('#kmFilterType');
    const tagEl = this.rootEl.querySelector('#kmFilterTag');
    return {
      type: typeEl?.value || '',
      tag: tagEl?.value || '',
    };
  }

  clearSearchFilters() {
    const typeEl = this.rootEl.querySelector('#kmFilterType');
    const tagEl = this.rootEl.querySelector('#kmFilterTag');
    if (typeEl) typeEl.value = '';
    if (tagEl) tagEl.value = '';
  }

  populateSearchFilters() {
    const typeSel = this.rootEl.querySelector('#kmFilterType');
    const tagSel = this.rootEl.querySelector('#kmFilterTag');
    if (!typeSel || !tagSel) return;

    const presentTypes = new Set(this.flatNodes.map((n) => n.type).filter(Boolean));
    const typeOptions = SEARCH_TYPE_OPTIONS.filter((t) => presentTypes.has(t));

    typeSel.innerHTML = [
      '<option value="">All types</option>',
      ...typeOptions.map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(formatTypeLabel(t))}</option>`),
    ].join('');

    const tags = new Set();
    this.flatNodes.forEach((n) => (n.tags || []).forEach((t) => tags.add(t)));
    const sortedTags = [...tags].sort((a, b) => a.localeCompare(b));

    tagSel.innerHTML = [
      '<option value="">All tags</option>',
      ...sortedTags.map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`),
    ].join('');
  }

  bindEvents() {
    const triggerSearch = () => this.runSearch();

    this.populateSearchFilters();
    this.rootEl.querySelector('#kmSearch')?.addEventListener('input', triggerSearch);
    this.rootEl.querySelector('#kmFilterType')?.addEventListener('change', triggerSearch);
    this.rootEl.querySelector('#kmFilterTag')?.addEventListener('change', triggerSearch);
    this.rootEl.querySelector('#kmResetBtn')?.addEventListener('click', () => this.reset());
    this.rootEl.querySelector('#kmJumpRoot')?.addEventListener('click', () => this.jumpToRoot());
    this.rootEl.querySelector('#kmLeafBackdrop')?.addEventListener('click', () => this.closeLeaf());

    window.addEventListener('resize', () => {
      const focusId = this.openLeafId
        || this.expandedPath[this.expandedPath.length - 1]
        || this.tree?.root?.id;
      if (focusId) this.focusCameraOn(focusId, false);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.km-search-group')) {
        const r = this.rootEl.querySelector('#kmSearchResults');
        if (r) r.hidden = true;
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.openLeafId) {
          e.stopPropagation();
          this.closeLeaf();
        } else if (this.expandedPath.length > 1) {
          this.expandedPath = this.expandedPath.slice(0, -1);
          this.rootRevealed = true;
          this.renderAll();
          this.syncHash(false);
          this.focusCameraOn(this.getFocusId());
        } else if (this.rootRevealed) {
          this.rootRevealed = false;
          this.renderAll();
          this.syncHash(false);
          this.focusCameraOn(this.tree.root.id);
        }
      }
    });
    window.addEventListener('hashchange', () => {
      const p = this.pathFromHash();
      if (p.length > 1) {
        this.expandedPath = p;
        this.rootRevealed = true;
        this.openLeafId = null;
        this.dismissIntro();
        this.renderAll();
      } else if (p.length === 1) {
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
  map.init().catch((err) => showLoadError(el, err, map.dataPath));
  return map;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initKnowledgeMindmap());
} else {
  initKnowledgeMindmap();
}
