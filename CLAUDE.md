# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Gurumanie Singh Dhiman's personal portfolio, deployed to GitHub Pages at gurumanie-singh.github.io. It is a static multi-page site (no client framework) built with Vite purely as a bundler/asset pipeline, plus a Python pipeline that generates a cybersecurity knowledge base rendered as an interactive mindmap.

## Commands

```bash
npm run dev       # vite dev server
npm run build     # clean + vite build -> dist/
npm run preview   # preview the production build
npm run clean     # rm -rf dist
```

There is no lint or test tooling configured — do not invent commands for these.

Knowledge base rebuild pipeline (Python, run from repo root, operates on `data/cybersecurity.json`):

```bash
python3 scripts/build_knowledge.py      # extract source folders -> .knowledge-build/extracted
python3 scripts/rebuild_knowledge.py    # full pipeline: extract -> synthesize -> augment -> cluster -> validate -> write
python3 scripts/recluster_knowledge.py  # re-cluster existing JSON into nested root.children tree
python3 scripts/refine_knowledge.py     # post-process: fix class names, curated topics, strip null commands
```

`scripts/knowledge_schema.py` defines the shared node schema (`NODE_TYPES`, `MAX_TREE_DEPTH = 5`) used by all of the above — check it before changing node shapes. `data/knowledge-node.schema.json` is the canonical on-disk schema. `data/cybersecurity.json` is generated output; treat hand-edits to it as temporary and prefer changing the pipeline/source folders instead.

## Architecture

**Multi-entry static build.** Each course/project folder (`COMS309`, `COMS311`, `COMS415`, `CPRE308/381/430/431/489/532/536`, `RUS375`, `SeniorDesign`, `nmap-notes`, `overthewire-solutions`, `py-network-experiments` and its subprojects, `knowledge`) is its own static section with its own `index.html`, registered as a separate Rollup input in `vite.config.js`. Adding a new section means adding both the folder and a corresponding entry in `rollupOptions.input`.

**Two-phase asset handling.** Vite only processes the declared entry HTML files and what they reference. `vite.config.js` has a custom `copyStaticAssets` plugin (`closeBundle` hook) that afterward copies everything else at the repo root into `dist/` verbatim — this is how non-module scripts, non-entry HTML (e.g. OverTheWire level pages), and linked PDFs/docs end up in the deployed site. `COPY_SKIP_ROOT`/`COPY_SKIP_SEGMENTS`/`COPY_SKIP_EXTENSIONS` in that file control what's excluded (build tooling, simulator output, caches) — update those sets rather than special-casing copy logic elsewhere.

**Design system.** `css/design-system.css` is the single canonical, self-contained stylesheet (fonts, tokens, components) — any page that links it gets the full system. Theme (dark/light) is stored in `localStorage` and applied via a `data-theme` attribute set by an inline script in `<head>` *before* first paint (see `index.html`), specifically to avoid a flash of the wrong theme; this bootstrap script is intentionally separate from the stylesheet's styling rules.

**Design/animation conventions live in `.cursor/rules/`.** These aren't project narrative — they're the actual visual and motion standards this site is held to (frequency-based animate/don't-animate rules, easing choices, duration ceilings, transform-origin rules for popovers vs. modals, etc.), concentrated in `.cursor/rules/review-animations/STANDARDS.md` and the sibling design-taste skills. Consult these before adding or reviewing any UI motion or visual styling, rather than guessing conventions from existing CSS alone.

**Knowledge mindmap.** `knowledge/index.html` + `js/knowledge-mindmap.js` render `data/cybersecurity.json` as an interactive mindmap; it's a personal cybersecurity reference built from the coursework/notes folders (`COMS415`, `CPRE430/431/489/532/536`, `nmap-notes`, `overthewire-solutions`) via the Python pipeline above, not hand-authored per node. `knowledge/STRUCTURE-PLAN.md` documents the current hierarchy design intent (domain → subdomain → topic → leaf) if you need to understand *why* a node sits where it does before moving it.

## Deployment

`.github/workflows/deploy.yml` runs on every push to `main`: `npm ci` → `npm run build` → upload `dist/` as a Pages artifact → deploy. There is no staging environment or preview-deploy step; a push to `main` is a production deploy.
