# Knowledge Base Build — Progress Log

## Step 1 — Component Generalization

**Finding:** The interactive AWS security study tool (Ensign InfoSecurity interview prep) was **not present** in this repository or under `/Users/guru/Documents`. A search for `mindmap`, `ensign`, and `aws study` returned no matches.

**Action:** Built a **new reusable component** matching the specified visual language instead:

| File | Purpose |
|------|---------|
| `js/knowledge-mindmap.js` | Radial SVG mindmap, progress arcs, flashcard mode, detail panel |
| `css/knowledge-mindmap.css` | Dark canvas (`#0a0a0f`), cyan accent (`#22d3ee`), 8px spacing |
| `knowledge/index.html` | Page shell loading `data-category="cybersecurity"` |

**Why not generalize:** There was no existing AWS component to refactor. The new `KnowledgeMindmap` class accepts any `data/[category].json` via the `data-category` attribute — adding `data/software.json` or `data/hardware.json` later requires only a new data file and page (or attribute change), zero component edits.

**Component features:**
- Loads `../data/{category}.json` at runtime
- Summary shown in panel by default; full markdown detail below
- Commands in monospace blocks with per-command copy button
- Progress arcs per class node + localStorage reviewed tracking
- Flashcard mode (summary front / detail back)
- Pan/drag on radial canvas

## Step 4 — Integration

- `vite.config.js` — added `knowledge` entry point
- `index.html` — single nav link: **Knowledge** → `knowledge/index.html`
- No other existing pages modified

## Step 2–3 — Extraction

Run: `python3 scripts/build_knowledge.py`

Outputs:
- `data/cybersecurity.json`
- `extraction-progress.log`
- `.knowledge-build/extracted/` (raw extracted text per file)

See `extraction-progress.log` for per-file parser decisions and skip reasons.

## Extraction Summary (final run)

| Folder | Topics | Files extracted |
|--------|-------:|----------------:|
| COMS415 | 16 | 6 |
| CPRE430 | 38 | 12 |
| CPRE431 | 114 | 35 |
| CPRE489 | 221 | 90 |
| CPRE532 | 133 | 44 |
| CPRE536 | 30 | 11 |
| nmap-notes | 7 (curated) | 3 |
| overthewire-solutions | 14 levels | 16 |
| **Total** | **573** | **217** |

Post-refinement: `python3 scripts/refine_knowledge.py` replaces garbled OCR nmap topics with curated command reference nodes and filters overthewire to level-only topics.

## Rebuild

```bash
python3 scripts/build_knowledge.py   # extract + synthesize
python3 scripts/refine_knowledge.py  # curated fixes
npm run build
```
