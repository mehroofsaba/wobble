// Stacked toast notifications inside the hub. `icon` is an HTML string (SVG).
import { icon as ic } from './icons.js';
let host = null;

export function toast({ icon = '', title = '', text = '', ms = 5200 }) {
  if (!host) { host = document.createElement('div'); host.className = 'toasts'; document.body.appendChild(host); }
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<div class="toast-ico">${icon || ic('dust', 26)}</div><div class="toast-body"><b></b><span></span></div><button class="toast-x" aria-label="Dismiss">${ic('x', 16)}</button>`;
  el.querySelector('b').textContent = title;
  el.querySelector('span').textContent = text;
  const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 260); };
  el.querySelector('.toast-x').onclick = close;
  host.appendChild(el);
  while (host.childElementCount > 4) host.firstChild.remove();
  setTimeout(close, ms);
}
