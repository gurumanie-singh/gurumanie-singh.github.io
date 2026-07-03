import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cpSync, readdirSync } from 'fs';

// Top-level repo entries never copied into dist (build tooling, caches, VCS).
const COPY_SKIP_ROOT = new Set([
  'node_modules',
  'dist',
  '.git',
  '.github',
  '.cursor',
  '.knowledge-build',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  '.gitignore',
  '.DS_Store',
  'scripts',
  'inventory-report.md',
  'extraction-progress.log',
  'rebuild-progress.log',
  'rebuild-run.log',
]);

// Path segments excluded anywhere under a copied tree (sim outputs, dev tooling).
const COPY_SKIP_SEGMENTS = new Set([
  'output',
  'internal',
  '__MACOSX',
  'node_modules',
  '.git',
  '__pycache__',
  '.knowledge-build',
]);

const COPY_SKIP_EXTENSIONS = new Set([
  '.wlf',
  '.dbg',
  '.qdb',
  '.qtl',
  '.qpg',
]);

function shouldCopyStaticPath(src) {
  const normalized = src.split(/[/\\]/);
  const base = normalized[normalized.length - 1];
  if (base === '.DS_Store') return false;
  if (COPY_SKIP_SEGMENTS.has(base)) return false;
  const ext = base.includes('.') ? base.slice(base.lastIndexOf('.')) : '';
  if (COPY_SKIP_EXTENSIONS.has(ext)) return false;
  return true;
}

// This portfolio is a large static site: alongside the bundled entry pages it
// ships many assets Vite does not process on its own (classic non-module scripts,
// non-entry HTML like the OverTheWire level pages, and PDFs/docs linked via plain
// anchors). Vite only emits the entry HTML + bundleable assets, so everything else
// would be missing from dist. This plugin copies the remaining static files into
// dist verbatim AFTER the build, without overwriting Vite's generated output
// (force:false / errorOnExist:false skip files Vite already produced). Each
// top-level entry is copied individually because cpSync cannot copy the root into
// its own dist subdirectory.
const copyStaticAssets = () => ({
  name: 'copy-static-assets',
  closeBundle() {
    const root = __dirname;
    const dist = resolve(root, 'dist');
    for (const entry of readdirSync(root)) {
      if (COPY_SKIP_ROOT.has(entry)) continue;
      cpSync(resolve(root, entry), resolve(dist, entry), {
        recursive: true,
        force: false,
        errorOnExist: false,
        filter: shouldCopyStaticPath,
      });
    }
  },
});

export default defineConfig({
  base: '/',
  plugins: [copyStaticAssets()],
  build: {
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        coms309: resolve(__dirname, 'COMS309/index.html'),
        coms311: resolve(__dirname, 'COMS311/index.html'),
        coms415: resolve(__dirname, 'COMS415/index.html'),
        coms472: resolve(__dirname, 'COMS472/index.html'),
        cpre308: resolve(__dirname, 'CPRE308/index.html'),
        cpre381: resolve(__dirname, 'CPRE381/index.html'),
        cpre430: resolve(__dirname, 'CPRE430/index.html'),
        cpre431: resolve(__dirname, 'CPRE431/index.html'),
        cpre489: resolve(__dirname, 'CPRE489/index.html'),
        cpre532: resolve(__dirname, 'CPRE532/index.html'),
        cpre536: resolve(__dirname, 'CPRE536/index.html'),
        rus375: resolve(__dirname, 'RUS375/index.html'),
        seniordesign: resolve(__dirname, 'SeniorDesign/index.html'),
        nmap: resolve(__dirname, 'nmap-notes/index.html'),
        otw: resolve(__dirname, 'overthewire-solutions/docs/index.html'),
        pynet: resolve(__dirname, 'py-network-experiments/index.html'),
        pycs: resolve(__dirname, 'py-network-experiments/Client-Server/index.html'),
        pyrs: resolve(__dirname, 'py-network-experiments/ReverseShell/index.html'),
        pysp: resolve(__dirname, 'py-network-experiments/SocketProgramming/index.html'),
        pysql: resolve(__dirname, 'py-network-experiments/SQLInjectionScanner/index.html'),
        pytcp: resolve(__dirname, 'py-network-experiments/TCPChatRoom/index.html'),
        knowledge: resolve(__dirname, 'knowledge/index.html'),
      },
    },
  },
});
