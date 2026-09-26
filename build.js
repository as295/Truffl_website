#!/usr/bin/env node
// Assembles index.html from src/. Edit files in src/, never index.html directly.
//   node build.js          → writes index.html
//   node build.js --check  → exits 1 if index.html is stale
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, 'src');
const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const INCLUDE = /<!-- @include ([\w./-]+) -->/g;
function expand(txt, depth = 0) {
  if (depth > 10) throw new Error('include nesting too deep');
  return txt.replace(INCLUDE, (_, f) => expand(read(f), depth + 1));
}
const m = JSON.parse(read('manifest.json'));
let out = read(m.head);
for (const p of m.parts) {
  const body = p.file.endsWith('.html') ? expand(read(p.file)) : read(p.file);
  out += (p.open || '') + body + (p.close || '') + (p.after || '');
}
out += read(m.tail);
const dest = path.join(__dirname, 'index.html');
if (process.argv.includes('--check')) {
  const cur = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : '';
  if (cur !== out) { console.error('index.html is stale — run `npm run build`'); process.exit(1); }
  console.log('index.html is up to date'); process.exit(0);
}
fs.writeFileSync(dest, out);
console.log(`index.html written (${(out.length / 1024 / 1024).toFixed(2)} MB from ${m.parts.length} parts)`);
