// A reusable pet component: renders the SVG, plays animations, spawns particles, shows speech.
// Used by both the desktop pet window and the hub's room scene.
import { petSvgFromState } from './pet-svg.js';
import { heart, sparkle, dot, foodArt } from './icons.js';

const PINK = ['#f6b8dc', '#ffffff', '#d3b8ff', '#ffe27a'];
const glyph = (ch) => (ch === '♡' ? heart(22) : (ch === '•' || ch === '·') ? dot(9) : sparkle(18, PINK[Math.floor(Math.random() * PINK.length)]));

export function createPetView(host, { bubbleEl = null } = {}) {
  host.classList.add('pv');
  host.innerHTML = `<div class="pv-body"><div class="pv-flip"><div class="pv-art hit"></div></div><div class="pv-fx"></div></div>`;
  let bubble = bubbleEl;
  if (!bubble) {
    bubble = document.createElement('div');
    bubble.className = 'bubble hit'; bubble.hidden = true;
    host.prepend(bubble);
  }
  const body = host.querySelector('.pv-body');
  const flip = host.querySelector('.pv-flip');
  const art = host.querySelector('.pv-art');
  const fxLayer = host.querySelector('.pv-fx');

  let base = 'idle'; let temp = null; let tempTimer = null;
  let faceOverride = null; let faceTimer = null;
  let sig = ''; let last = null; let zzzTimer = null; let bubbleTimer = null;

  // 'nap' = looks asleep without being in the sleeping state (used while the user is away)
  const effectiveAnim = () => temp || (last?.sleeping || base === 'nap' ? 'sleep' : base);
  const applyAnim = () => { host.dataset.anim = effectiveAnim(); };

  function render(state) {
    last = state;
    const key = [state.equipped.coat, state.equipped.head, state.equipped.face, state.equipped.neck, state.sleeping, state.mood, faceOverride].join('|');
    if (key !== sig) { sig = key; art.innerHTML = petSvgFromState(state, { face: faceOverride }); }
    host.dataset.mood = state.sleeping ? 'sleeping' : state.mood;
    applyAnim();
    if (state.sleeping && !zzzTimer) zzzTimer = setInterval(() => spawn('z', 1), 1900);
    if (!state.sleeping && zzzTimer) { clearInterval(zzzTimer); zzzTimer = null; }
  }

  function spawn(ch, n = 1) {
    for (let i = 0; i < n; i++) {
      if (fxLayer.childElementCount > 16) return;
      const s = document.createElement('span');
      const sleepy = ch === 'z';
      s.className = 'pt' + (sleepy ? ' pt-z' : '');
      if (sleepy) s.textContent = 'z'; else s.innerHTML = glyph(Array.isArray(ch) ? ch[Math.floor(Math.random() * ch.length)] : ch);
      s.style.setProperty('--x', (sleepy ? 62 : 25 + Math.random() * 50) + '%');
      s.style.setProperty('--dx', (Math.random() * 50 - 25) + 'px');
      s.style.animationDelay = (i * 90) + 'ms';
      fxLayer.appendChild(s);
      setTimeout(() => s.remove(), 2000 + i * 90);
    }
  }

  function say(text, ms = 4300) {
    if (!text) return;
    bubble.innerHTML = '';
    const t = document.createElement('span');
    text.split('♡').forEach((part, i, a) => { t.append(part); if (i < a.length - 1) t.insertAdjacentHTML('beforeend', heart(17)); });
    bubble.appendChild(t);
    bubble.hidden = false; bubble.classList.remove('out'); void bubble.offsetWidth; bubble.classList.add('in');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => { bubble.classList.add('out'); setTimeout(() => { bubble.hidden = true; bubble.classList.remove('in', 'out'); host.dispatchEvent(new CustomEvent('layout')); }, 260); }, ms);
    host.dispatchEvent(new CustomEvent('layout'));
  }

  return {
    el: host, art, body, bubble,
    render,
    setBase(name) { base = name; applyAnim(); },
    anim(name, ms = 1200) { temp = name; applyAnim(); clearTimeout(tempTimer); tempTimer = setTimeout(() => { temp = null; applyAnim(); }, ms); },
    face(key, ms = 1500) {
      faceOverride = key; if (last) render(last);
      clearTimeout(faceTimer); faceTimer = setTimeout(() => { faceOverride = null; if (last) render(last); }, ms);
    },
    flip(dir) { flip.style.transform = dir < 0 ? 'scaleX(-1)' : 'scaleX(1)'; },
    fx: spawn,
    say,
    hideBubble() { bubble.hidden = true; },
    dropFood(id) {
      const f = document.createElement('span'); f.className = 'food-drop'; f.innerHTML = foodArt(id, 40); body.appendChild(f);
      setTimeout(() => f.remove(), 1500);
    },
    toy(id, ms = 2400) {
      const t = document.createElement('span'); t.className = 'toy'; t.innerHTML = foodArt(id, 38); body.appendChild(t);
      setTimeout(() => t.remove(), ms);
    },
  };
}
