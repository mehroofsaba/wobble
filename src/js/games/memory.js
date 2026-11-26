// Heart Match - flip cards, find all six pairs before time runs out.
import { sfx } from '../engine/audio.js';
import { icon, foodArt, starSolid } from '../ui/icons.js';
const art = (k) => (k === 'star' ? starSolid(52) : k === 'moon' ? icon('moon', 52) : foodArt(k, 58));
import { fmtTime } from './util.js';

export const meta = { id: 'memory', name: 'Heart Match', desc: 'Flip cards and find all the matching pairs.', time: 60, hint: 'Click two cards to flip them.' };
const FACES = ['strawberry', 'cupcake', 'fishsnack', 'star', 'moon', 'yarn'];

export function start(stage, api) {
  const grid = document.createElement('div'); grid.className = 'memory-grid';
  grid.style.gridTemplateColumns = 'repeat(4, minmax(0, 130px))'; grid.style.gridTemplateRows = 'repeat(3, minmax(0, 150px))';
  stage.appendChild(grid);
  const deck = [...FACES, ...FACES].map((f, i) => ({ f, i })).sort(() => Math.random() - 0.5);
  let open = []; let lock = false; let matched = 0; let moves = 0; let time = meta.time; let over = false;
  const els = deck.map((c, idx) => {
    const el = document.createElement('button'); el.className = 'mcard'; el.setAttribute('aria-label', 'Card ' + (idx + 1));
    el.innerHTML = `<div class="in"><div class="face front">${icon('heart', 34)}</div><div class="face back">${art(c.f)}</div></div>`;
    el.onclick = () => flip(idx); grid.appendChild(el); return el;
  });
  const finish = (win) => {
    if (over) return; over = true; clearInterval(timer);
    const score = matched * 20 + (win ? Math.round(time) * 2 + 30 : 0);
    setTimeout(() => api.end({ score, extra: { moves } }), 600);
  };
  function flip(i) {
    if (lock || over || open.includes(i) || els[i].classList.contains('done')) return;
    sfx('flip'); els[i].classList.add('flip'); open.push(i);
    if (open.length < 2) return;
    moves++; lock = true;
    const [a, b] = open;
    if (deck[a].f === deck[b].f) {
      setTimeout(() => { [a, b].forEach((k) => { els[k].classList.remove('flip'); els[k].classList.add('done'); }); matched++; sfx('match'); open = []; lock = false; api.hud(fmtTime(time), matched * 20, `${icon('cards', 20)}${moves}`); if (matched === FACES.length) finish(true); }, 450);
    } else setTimeout(() => { els[a].classList.remove('flip'); els[b].classList.remove('flip'); open = []; lock = false; }, 800);
  }
  const timer = setInterval(() => { time -= 1; api.hud(fmtTime(time), matched * 20, `${icon('cards', 20)}${moves}`); if (time <= 0) finish(false); }, 1000);
  api.hud(fmtTime(time), 0, `${icon('cards', 20)}0`);
  return { stop() { clearInterval(timer); over = true; grid.remove(); } };
}
