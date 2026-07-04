#!/usr/bin/env node
/**
 * Pass 2: Merge leaf content from LEAF-CONTENT-DRAFT.md into cybersecurity.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.join(__dirname, '../data/cybersecurity.json');
const DRAFT_PATH = path.join(__dirname, '../knowledge/LEAF-CONTENT-DRAFT.md');

function parseDraft(md) {
  const entries = new Map();
  const sections = md.split(/^#### `/m).slice(1);
  for (const section of sections) {
    const idMatch = section.match(/^([a-z0-9-]+)` —/);
    if (!idMatch) continue;
    const id = idMatch[1];
    const body = section.slice(idMatch[0].length);

    const getField = (name) => {
      const re = new RegExp(`^- \\*\\*${name}:\\*\\*\\s*([\\s\\S]*?)(?=\\n- \\*\\*|\\n---|\\n## |\\n### |\\n#### |$)`, 'm');
      const m = body.match(re);
      if (!m) return undefined;
      return m[1].trim();
    };

    const type = getField('type');
    const summary = getField('summary');
    const core_idea = getField('core_idea');

    let bullets = [];
    const bulletsBlock = body.match(/^- \*\*bullets:\*\*\s*\n([\s\S]*?)(?=\n- \*\*related:\*\*|\n---|\n## |\n### |\n#### )/m);
    if (bulletsBlock) {
      bullets = bulletsBlock[1]
        .split('\n')
        .map((l) => l.replace(/^\s*-\s*/, '').trim())
        .filter(Boolean);
    }

    let related = [];
    const relatedBlock = getField('related');
    if (relatedBlock) {
      related = relatedBlock
        .split(',')
        .map((s) => s.replace(/`/g, '').trim())
        .filter(Boolean);
    }

    entries.set(id, { type, summary, core_idea, bullets, related });
  }
  return entries;
}

function collectLeaves(node, map = new Map()) {
  for (const c of node.children || []) {
    if ((c.children || []).length === 0 && c.type && !['domain', 'topic', 'root'].includes(c.type)) {
      map.set(c.id, c);
    } else {
      collectLeaves(c, map);
    }
  }
  return map;
}

function walkUpdate(node, draft, typeConflicts, updated) {
  for (const c of node.children || []) {
    if ((c.children || []).length === 0 && c.type && !['domain', 'topic', 'root'].includes(c.type)) {
      const d = draft.get(c.id);
      if (!d) {
        console.error('Missing draft content for leaf:', c.id);
        process.exitCode = 1;
        continue;
      }
      if (d.type && c.type !== d.type) {
        typeConflicts.push({ id: c.id, jsonType: c.type, draftType: d.type });
      }
      c.summary = d.summary ?? c.summary;
      c.core_idea = d.core_idea ?? c.core_idea;
      c.bullets = d.bullets ?? [];
      c.related = d.related ?? c.related;
      updated.push(c.id);
    } else {
      walkUpdate(c, draft, typeConflicts, updated);
    }
  }
}

function validateRelated(node, leafIds, dangling) {
  for (const c of node.children || []) {
    if ((c.children || []).length === 0 && c.type && !['domain', 'topic', 'root'].includes(c.type)) {
      for (const rid of c.related || []) {
        if (!leafIds.has(rid)) dangling.push({ from: c.id, ref: rid });
      }
    } else {
      validateRelated(c, leafIds, dangling);
    }
  }
}

const md = fs.readFileSync(DRAFT_PATH, 'utf8');
const draft = parseDraft(md);
console.log('Draft entries parsed:', draft.size);

const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const leavesBefore = collectLeaves(data.root);
console.log('JSON leaf count before Pass 2:', leavesBefore.size);

if (leavesBefore.size !== 180) {
  console.error('ABORT: expected 180 leaves');
  process.exit(1);
}

if (draft.size !== 180) {
  const draftIds = new Set(draft.keys());
  const jsonIds = new Set(leavesBefore.keys());
  const missingInDraft = [...jsonIds].filter((id) => !draftIds.has(id));
  const extraInDraft = [...draftIds].filter((id) => !jsonIds.has(id));
  console.error('Draft/JSON leaf count mismatch');
  console.error('Missing in draft:', missingInDraft);
  console.error('Extra in draft:', extraInDraft);
  process.exit(1);
}

const typeConflicts = [];
const updated = [];
walkUpdate(data.root, draft, typeConflicts, updated);

const leafIds = new Set(leavesBefore.keys());
const dangling = [];
validateRelated(data.root, leafIds, dangling);

data.lastBuilt = new Date().toISOString();
fs.writeFileSync(JSON_PATH, `${JSON.stringify(data, null, 2)}\n`);

console.log('\n=== PASS 2 RESULTS ===');
console.log('Leaves updated:', updated.length);
console.log('Type conflicts:', typeConflicts.length);
if (typeConflicts.length) {
  for (const c of typeConflicts) console.log(`  ${c.id}: json=${c.jsonType} draft=${c.draftType}`);
}
console.log('Dangling related refs:', dangling.length);
if (dangling.length) {
  for (const d of dangling.slice(0, 20)) console.log(`  ${d.from} -> ${d.ref}`);
  if (dangling.length > 20) console.log(`  ... and ${dangling.length - 20} more`);
}

if (process.exitCode) process.exit(process.exitCode);
