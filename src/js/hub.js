// Hub window shell: titlebar, navigation (with sliding pill), animated page routing, splash, global effects.
import * as store from './core/store.js';
import { invoke, listen, isTauri } from './core/tauri.js';
import { tick } from './engine/pet-engine.js';
import { dailyAvailable } from './engine/progression.js';
import { playFx } from './ui/fx.js';
import { nullView } from './ui/common.js';
import { toast } from './ui/toast.js';
import { icon, heart } from './ui/icons.js';

const PAGES = [['home', 'home', 'Home'], ['games', 'gamepad', 'Games'], ['shop', 'bag', 'Shop'], ['customize', 'shirt', 'Customize'], ['journal', 'book', 'Journal'], ['settings', 'gear', 'Settings']];
const loaders = {
  home: () => import('./pages/home.js'), games: () => import('./pages/games.js'), shop: () => import('./pages/shop.js'),
  customize: () => import('./pages/customize.js'), journal: () => import('./pages/journal.js'), settings: () => import('./pages/settings.js'),
  onboarding: () => import('./pages/onboarding.js'),
};

const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let current = null; let currentId = null; let petView = null; let navToken = 0; let dailyDot = null;
const ctx = { go: (p) => go(p), setView: (v) => { petView = v; } };

const splash = {
  set(p) { const b = $('splash-bar'); if (b) b.style.width = p + '%'; },
  hide() { const s = $('splash'); if (!s) return; s.classList.add('done'); setTimeout(() => s.remove(), 700); },
};

function renderNav() {
  const s = store.get();
  const nav = $('nav');
  nav.innerHTML = '<span class="pill"></span>' + PAGES.map(([id, ic, l]) => `<button data-p="${id}" ${id === currentId ? 'aria-current="page"' : ''}>${icon(ic, 20)}<span class="t">${l}</span>${id === 'home' && dailyAvailable(s) && id !== currentId ? '<i class="badge-dot"></i>' : ''}</button>`).join('');
  placePill(false);
}

function placePill(animate = true) {
  const pill = document.querySelector('#nav .pill'); const cur = document.querySelector('#nav [aria-current]');
  if (!pill) return;
  if (!cur) { pill.style.width = '0px'; return; }
  if (!animate) pill.style.transition = 'none';
  pill.style.width = cur.offsetWidth + 'px'; pill.style.transform = `translateX(${cur.offsetLeft}px)`;
  if (!animate) { void pill.offsetWidth; pill.style.transition = ''; }
}

/** Page transition: fade/slide the old page out, mount the new one, stagger its cards in. */
async function go(id) {
  const s = store.get();
  if (!s.onboarded) id = 'onboarding'; else if (id === 'onboarding') id = 'home';
  if (id === currentId) return;
  const token = ++navToken;
  const root = $('page');
  const loading = loaders[id]();
  if (current) { root.classList.add('leave'); await wait(170); }
  const mod = await loading;
  if (token !== navToken) return;
  current?.destroy?.(); petView = null;
  root.innerHTML = ''; root.scrollTop = 0;
  currentId = id; current = mod.mount(root, ctx) || {};
  $('nav').hidden = id === 'onboarding';
  const items = root.querySelectorAll('.card, .tile, .game-card, .stat, .ach, .scene, .feat, .opt');
  items.forEach((el, i) => { el.classList.add('rise'); el.style.setProperty('--i', Math.min(i, 16)); });
  root.classList.add('enter'); root.classList.remove('leave');
  clearTimeout(go.t); go.t = setTimeout(() => root.classList.remove('enter'), 1100);
  renderNav();
}

function applyTheme(s) {
  const r = document.documentElement;
  if (r.dataset.theme !== s.theme) r.dataset.theme = s.theme;
  if (r.dataset.intensity !== s.settings.intensity) r.dataset.intensity = s.settings.intensity;
  $('dust').textContent = s.stardust;
}

function onState(s) {
  applyTheme(s);
  if (!s.onboarded && currentId !== 'onboarding') return go('onboarding');
  if (s.onboarded && currentId === 'onboarding') return go('home');
  current?.update?.(s);
  const dot = dailyAvailable(s);
  if (dot !== dailyDot) { dailyDot = dot; renderNav(); }
}

async function boot() {
  splash.set(15);
  const started = performance.now();
  $('brand-heart').innerHTML = heart(20);
  $('wallet-ic').innerHTML = icon('dust', 20);
  $('w-min').innerHTML = icon('minus', 18); $('w-max').innerHTML = icon('square', 16); $('w-close').innerHTML = icon('x', 18);

  const s = await store.init(); splash.set(45);
  applyTheme(s);
  $('nav').addEventListener('click', (e) => { const b = e.target.closest('button[data-p]'); if (b) go(b.dataset.p); });
  $('w-min').onclick = () => invoke('hub_minimize');
  $('w-max').onclick = () => invoke('hub_toggle_max');
  $('w-close').onclick = () => (isTauri ? invoke('hub_hide') : window.close());
  $('titlebar').addEventListener('dblclick', (e) => { if (e.target.closest('button,nav')) return; invoke('hub_toggle_max'); });
  window.addEventListener('resize', () => placePill(false));

  store.subscribe(onState);
  store.onFx((type, p, remote) => playFx(petView || nullView, type, p, { remote, toast }));
  await listen('wobble:nav', (m) => go(m.page));

  // In the desktop app the pet window drives the clock. In a plain browser preview there is no pet window, so tick here.
  if (!isTauri) setInterval(() => store.mutate((st) => tick(st, Date.now(), {})), 15000);

  await go(new URLSearchParams(location.search).get('page') || 'home'); splash.set(80);
  renderNav();
  try { await Promise.race([document.fonts.ready, wait(1200)]); } catch { /* fonts are optional */ }
  splash.set(100);
  await wait(Math.max(0, 1100 - (performance.now() - started)));   // show the loader long enough to read as intentional
  splash.hide();
}

boot().catch((e) => { console.error('[wobble] hub boot failed', e); document.body.textContent = 'Wobble failed to start: ' + e.message; });
