// Quick sanity check: syntax of every JS module + JSON config files. Run: npm run check
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let bad = 0;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? (e.name === 'node_modules' || e.name === 'target' ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]));
for (const f of walk(root)) {
  try {
    if (f.endsWith('.js') || f.endsWith('.mjs')) execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
    if (f.endsWith('.json')) JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch (e) { bad++; console.error('FAIL', path.relative(root, f), String(e.stderr || e.message).split('\n').slice(0, 4).join('\n')); }
}
console.log(bad ? `${bad} file(s) failed` : 'all good'); process.exit(bad ? 1 : 0);
