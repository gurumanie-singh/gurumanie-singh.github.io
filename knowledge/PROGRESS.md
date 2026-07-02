# Knowledge Base — Architecture & Progress

## Current UI (2026)

The Knowledge page is a **left-to-right accordion tree** — not a radial mindmap.

| File | Purpose |
|------|---------|
| `knowledge/index.html` | Page shell, theme bootstrap, `#knowledge-mindmap` mount |
| `js/knowledge-mindmap.js` | `KnowledgeMindmap` class — tree layout, accordion expansion, leaf panel, search |
| `css/knowledge-mindmap.css` | `--km-*` theme tokens, pill nodes, tree canvas, leaf panel |
| `data/knowledge-node.schema.json` | Canonical node schema |
| `data/knowledge-taxonomy-map.md` | Legacy cluster → top-level taxonomy mapping |
| `data/cybersecurity.json` | Production nested `root` tree |
| `data/sample-mindmap-data.json` | UI dev fixture (deep Cryptography branch) |

### Interaction model

- **Layout:** Root at left; columns grow rightward; SVG bezier connectors
- **State:** `expandedPath` (accordion — one open branch per level) + `openLeafId` (leaf detail panel, separate from expansion)
- **Navigation:** Click branch → expand/collapse; click leaf → right-side detail card; hash sync on `expandedPath`; **↑ Root** scrolls without resetting expansion
- **Search:** Text + Type + Tag filters over `flatNodes` (linear scan, max 25 results)
- **Leaf panel:** Full title, tags, related chips, summary, `core_idea` markdown, commands with copy

### Data model

Nested `root` tree (max depth 5):

```
root → taxonomy domain (15 top-level) → legacy group / topic → concept leaf
```

Node fields: `id`, `title`, `label`, `type`, `children`, plus content fields (`summary`, `core_idea`, `why_it_matters`, `related[]`, `metadata`, etc.) on leaves.

Legacy `domains[]` JSON still loads via `normalizeLegacy()` in JS.

### Pipeline

| Script | Output |
|--------|--------|
| `scripts/rebuild_knowledge.py` | Full extract → synthesize → augment → nested `data/cybersecurity.json` |
| `scripts/build_knowledge.py` | Per-folder extract into classes schema |
| `scripts/recluster_knowledge.py` | Re-cluster into nested root tree |
| `scripts/knowledge_schema.py` | Shared schema helpers + `build_knowledge_document()` |

```bash
python3 scripts/rebuild_knowledge.py   # full production rebuild
npm run build
```

## Integration

- `vite.config.js` — `knowledge` entry point
- `index.html` — nav link to `knowledge/index.html`

## Content status

- **Production:** `data/cybersecurity.json` — 15 top-level domains, 140 leaf notes (8 domains populated)
- **Dev fixture:** `knowledge/index.html` currently points at `sample-mindmap-data.json`

## Removed (legacy)

Previous radial SVG hub, domain orbit, side topic list, breadcrumb bar, flashcard mode, and pan/zoom camera — all removed from JS and CSS.
