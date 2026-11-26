// Downloads Gaegu (OFL) into src/assets/fonts so the app works fully offline. Run once: node scripts/get-fonts.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'fonts');
fs.mkdirSync(dir, { recursive: true });
const base = 'https://github.com/google/fonts/raw/main/ofl/gaegu/';
for (const f of ['Gaegu-Light.ttf', 'Gaegu-Regular.ttf', 'Gaegu-Bold.ttf']) {
  const r = await fetch(base + f);
  if (!r.ok) { console.error('failed', f, r.status); continue; }
  fs.writeFileSync(path.join(dir, f), Buffer.from(await r.arrayBuffer())); console.log('saved', f);
}
