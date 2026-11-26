// Small shared UI helpers for the hub pages.
import { NEEDS } from '../core/data.js';
import { xpNeeded } from '../engine/progression.js';
import { sfx } from '../engine/audio.js';
import { icon } from './icons.js';

export const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const NEED_BY_ID = Object.fromEntries(NEEDS.map((n) => [n.id, n]));

export function meters(s) {
  return NEEDS.map((n) => {
    const v = Math.round(s.needs[n.id]);
    const tip = n.id === 'boredom' ? 'Fuller = less bored' : n.label;
    return `<div class="meter ${v < 25 ? 'low' : ''}" title="${tip}" style="--col:${n.color}">${icon(n.icon, 19)}<span>${n.label}</span><div class="bar"><i style="width:${v}%"></i></div><span class="val">${v}%</span></div>`;
  }).join('');
}

/** Effect chips for a food item: [+14 hunger icon] [+3 happiness icon] */
export function fxChips(fx) {
  return Object.entries(fx).map(([k, v]) => `<span class="chip" style="--c:${NEED_BY_ID[k].color}" title="${NEED_BY_ID[k].label}">${icon(NEED_BY_ID[k].icon, 14)}${v > 0 ? '+' : ''}${v}</span>`).join('');
}

export const xpPct = (s) => Math.min(100, Math.round((s.xp / xpNeeded(s.level)) * 100));
export const price = (n) => `${icon('dust', 16)}${n}`;

/** Modal dialog. Resolves with the `value` of the clicked button. `big` is an HTML string (icon / art). */
export function modal({ title = '', big = '', body = '', buttons = [{ label: 'Done', value: true, primary: true }] }) {
  const ov = document.getElementById('overlay');
  return new Promise((resolve) => {
    ov.hidden = false;
    ov.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${big ? `<div class="big">${big}</div>` : ''}<h2>${esc(title)}</h2><div class="mbody">${body}</div><div class="btns"></div></div>`;
    const btns = ov.querySelector('.btns');
    buttons.forEach((b) => {
      const el = document.createElement('button'); el.className = 'btn' + (b.primary ? ' primary' : '') + (b.danger ? ' danger' : ''); el.textContent = b.label;
      el.onclick = () => { sfx('click'); ov.hidden = true; ov.innerHTML = ''; resolve(b.value); };
      btns.appendChild(el);
    });
    btns.querySelector('button')?.focus();
  });
}

export function timeAgo(ts) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return 'just now'; if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60); if (h < 24) return `${h} h ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Inert pet-view stand-in for pages that have no pet on screen. */
export const nullView = new Proxy({}, { get: () => () => {} });
