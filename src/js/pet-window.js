// Controller for the transparent desktop-pet window: behaviour, movement, dragging, menu,
// idle awareness, random events, notifications. Game / shop / settings live in the hub window.
import * as store from './core/store.js';
import { invoke, listen, emit } from './core/tauri.js';
import { FOODS, NEEDS, byId, rnd, pick } from './core/data.js';
import { icon, foodArt, moodFace } from './ui/icons.js';
import { MOOD_INFO } from './engine/pet-engine.js';
import { tick, line, moodLine, randomEvent } from './engine/pet-engine.js';
import * as A from './engine/actions.js';
import { checkNotifications } from './engine/notifier.js';
import { reward, dailyAvailable } from './engine/progression.js';
import { sfx } from './engine/audio.js';
import { createPetView } from './ui/pet-view.js';
import { playFx } from './ui/fx.js';
import { startScrub } from './ui/scrub.js';

const WIN_W = 400; const WIN_H = 590;
const $ = (id) => document.getElementById(id);

let view; let S;
let pos = { x: 200, y: 200 };
let bounds = { minX: 0, maxX: 800, minY: 0, floorY: 600 };
let walkToken = 0; let walking = false;
let dragging = false; let busyUntil = 0; let scrubCancel = null;
let away = false; let awaySince = 0;
let menuMode = null; let menuTimer = null;
let lastSpeak = 0; let lastTap = 0; let lastMood = null; let lastMoodSay = 0;
const applied = {};

const isBusy = () => Date.now() < busyUntil || !!scrubCancel;

// --------------------------------------------------------------- positioning
function computeBounds() {
  const L = screen.availLeft || 0; const T = screen.availTop || 0;
  const W = screen.availWidth || 1280; const H = screen.availHeight || 720;
  bounds = { minX: L - 70, maxX: L + W - WIN_W + 70, minY: T, floorY: T + H - WIN_H + 14 };
}
const clampX = (x) => Math.max(bounds.minX, Math.min(bounds.maxX, x));
let moveQueued = false;
function move() {
  if (moveQueued) return; moveQueued = true;
  requestAnimationFrame(() => { moveQueued = false; invoke('pet_move', { x: Math.round(pos.x), y: Math.round(pos.y) }); });
}

function cancelWalk() { walkToken++; if (walking) { walking = false; baseAnim(); } }
function baseAnim() {
  const s = store.get();
  view.setBase(away ? 'nap' : (s.mood === 'sad' && !s.sleeping ? 'sad' : 'idle'));
}

function walkTo(tx, speed, anim) {
  return new Promise((resolve) => {
    const token = ++walkToken; walking = true;
    view.flip(tx > pos.x ? 1 : -1); view.setBase(anim);
    let last = performance.now();
    const step = () => {
      if (token !== walkToken) return resolve(false);
      const now = performance.now(); const dt = Math.min(0.1, (now - last) / 1000); last = now;
      const d = Math.min(Math.abs(tx - pos.x), speed * dt);
      pos.x += Math.sign(tx - pos.x) * d; move();
      if (Math.abs(tx - pos.x) < 1) { walking = false; baseAnim(); return resolve(true); }
      setTimeout(step, 33);
    };
    step();
  });
}

// ------------------------------------------------------------------ settings
function applySettings(s) {
  const set = s.settings;
  const root = document.documentElement;
  if (applied.theme !== s.theme) { root.dataset.theme = s.theme; applied.theme = s.theme; }
  if (applied.intensity !== set.intensity) { root.dataset.intensity = set.intensity; applied.intensity = set.intensity; }
  if (applied.scale !== set.petScale) { root.style.setProperty('--pet-size', Math.round(190 * set.petScale) + 'px'); applied.scale = set.petScale; syncHit(); }
  if (applied.ct !== set.clickThrough) { invoke('pet_clickthrough', { enabled: set.clickThrough }); applied.ct = set.clickThrough; }
  if (applied.top !== set.alwaysOnTop) { invoke('pet_set_on_top', { on: set.alwaysOnTop }); applied.top = set.alwaysOnTop; }
  const visible = set.showPet && s.onboarded;
  if (applied.vis !== visible) { invoke('pet_set_visible', { visible }); applied.vis = visible; }
}

// ----------------------------------------------------------------- hit rects
let hitQueued = false;
function syncHit() {
  if (hitQueued) return; hitQueued = true;
  requestAnimationFrame(() => {
    hitQueued = false;
    const rects = [];
    document.querySelectorAll('.hit').forEach((el) => {
      if (el.hidden || el.closest('[hidden]')) return;
      const r = el.getBoundingClientRect();
      if (r.width > 4 && r.height > 4) rects.push([r.left - 6, r.top - 6, r.width + 12, r.height + 12]);
    });
    invoke('pet_hit', { rects });
  });
}

// ---------------------------------------------------------------------- menu
const MENU = [['feed', 'fork', 'Feed'], ['play', 'gamepad', 'Play'], ['clean', 'bubbles', 'Clean'], ['sleep', 'moon', 'Sleep'], ['games', 'trophy', 'Mini-games'], ['status', 'heart', 'Status'], ['open', 'home', 'Open Wobble'], ['hide', 'x', 'Hide pet']];

function renderMenu() {
  const m = $('menu'); const s = store.get();
  m.hidden = !menuMode; if (!menuMode) { syncHit(); return; }
  m.innerHTML = ''; m.classList.toggle('status', menuMode === 'status');
  const mk = (act, html, title, extra = '') => {
    const b = document.createElement('button'); b.dataset.act = act; b.title = title; b.setAttribute('aria-label', title);
    b.innerHTML = html + extra; m.appendChild(b); return b;
  };
  if (menuMode === 'food') {
    mk('back', icon('chevL', 22), 'Back').classList.add('back');
    const owned = FOODS.filter((f) => s.inventory.food[f.id] > 0);
    owned.forEach((f) => mk('food:' + f.id, foodArt(f.id, 34), `${f.name} (${s.inventory.food[f.id]})`, `<span class="badge">${s.inventory.food[f.id]}</span>`));
    if (!owned.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'Out of snacks'; m.appendChild(e); mk('shop', icon('bag', 22), 'Open the shop'); }
  } else if (menuMode === 'status') {
    const mood = s.sleeping ? 'sleepy' : s.mood;
    m.innerHTML = `<div class="sp-head">${moodFace(mood, 34)}<div><b>${s.name}</b><span>Lv. ${s.level} · ${s.sleeping ? 'Sleeping' : MOOD_INFO[mood].label}</span></div><button data-act="back" class="sp-x" aria-label="Close">${icon('x', 18)}</button></div>`
      + NEEDS.map((n) => `<div class="sp-row"><span class="sp-ic" style="color:${n.color}">${icon(n.icon, 16)}</span><span class="sp-l">${n.label}</span><i class="sp-bar"><b style="width:${Math.round(s.needs[n.id])}%;background:${n.color}"></b></i></div>`).join('')
      + `<button class="sp-top" data-act="ontop" role="switch" aria-checked="${s.settings.alwaysOnTop}"><span>Keep on top</span><i class="sw ${s.settings.alwaysOnTop ? 'on' : ''}"></i></button>`;
  } else {
    MENU.forEach(([act, ic, title]) => {
      if (act === 'sleep' && s.sleeping) mk(act, icon('sun', 22), 'Wake up'); else mk(act, icon(ic, 22), title);
    });
  }
  syncHit();
}

function setMenu(mode) {
  menuMode = mode; renderMenu();
  clearTimeout(menuTimer);
  if (mode) menuTimer = setTimeout(() => setMenu(null), 9000);
}

$('menu').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  sfx('click'); clearTimeout(menuTimer); menuTimer = setTimeout(() => setMenu(null), 9000);
  const act = b.dataset.act;
  if (act.startsWith('food:')) {
    const r = A.feed(act.slice(5));
    if (!r.ok) view.say(r.msg); else cancelWalk();
    return setMenu(null);
  }
  switch (act) {
    case 'back': return setMenu('menu');
    case 'status': return setMenu('status');
    case 'ontop': A.updateSettings((c) => { c.alwaysOnTop = !c.alwaysOnTop; }); return renderMenu();
    case 'feed': return setMenu('food');
    case 'play': { const r = A.play(); if (!r.ok) view.say(r.msg); cancelWalk(); return setMenu(null); }
    case 'clean': {
      setMenu(null);
      if (store.get().sleeping) return view.say('shh... i\'m sleeping');
      cancelWalk();
      scrubCancel = startScrub(view, () => { scrubCancel = null; A.cleanDone(); });
      return;
    }
    case 'sleep': A.toggleSleep(); return setMenu(null);
    case 'games': setMenu(null); invoke('hub_show'); return emit('wobble:nav', { page: 'games' });
    case 'shop': setMenu(null); invoke('hub_show'); return emit('wobble:nav', { page: 'shop' });
    case 'open': setMenu(null); return invoke('hub_show');
    case 'hide': setMenu(null); return A.updateSettings((st) => { st.showPet = false; });
    default: return null;
  }
});

// ----------------------------------------------------------- pointer: tap/drag
function setupPointer() {
  const art = view.art; let down = null;
  art.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    art.setPointerCapture(e.pointerId);
    down = { sx: e.screenX, sy: e.screenY, px: pos.x, py: pos.y, moved: false };
  });
  art.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.screenX - down.sx; const dy = e.screenY - down.sy;
    if (!down.moved && Math.hypot(dx, dy) > 6) {
      down.moved = true; dragging = true; cancelWalk(); setMenu(null);
      invoke('pet_drag', { dragging: true }); view.anim('lifted', 3600000);
    }
    if (down.moved) { pos.x = clampX(down.px + dx); pos.y = Math.max(bounds.minY, Math.min(bounds.floorY, down.py + dy)); move(); }
  });
  const up = async (e) => {
    if (!down) return; const d = down; down = null;
    try { art.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    if (d.moved) return endDrag();
    onTap();
  };
  art.addEventListener('pointerup', up);
  art.addEventListener('pointercancel', up);
  art.addEventListener('contextmenu', (e) => { e.preventDefault(); setMenu(menuMode ? null : 'menu'); });
}

async function endDrag() {
  view.anim('react', 500);
  // drop to the floor with a little bounce
  let v = 0; const g = 2400; let last = performance.now();
  await new Promise((res) => {
    const step = () => {
      const now = performance.now(); const dt = Math.min(0.05, (now - last) / 1000); last = now;
      v += g * dt; pos.y += v * dt;
      if (pos.y >= bounds.floorY) { pos.y = bounds.floorY; if (v > 350) { v = -v * 0.35; } else { move(); return res(); } }
      move(); setTimeout(step, 16);
    };
    step();
  });
  dragging = false; invoke('pet_drag', { dragging: false });
  store.mutate((st) => { st.petPos = { x: Math.round(pos.x) }; });
  sfx('boop');
}

function onTap() {
  const now = Date.now();
  if (now - lastTap < 320) { // double tap
    lastTap = 0; setMenu(null); view.anim('celebrate', 1200); view.fx(['♡', '✦'], 6); sfx('reward'); view.say('hehe, yay! ♡'); return;
  }
  lastTap = now;
  const r = A.petTap();
  view.anim('react', 500); view.fx('♡', r.gain ? 2 : 1); sfx(r.woke ? 'wake' : 'boop');
  if (r.woke) { view.say(line(store.get(), 'woken')); return; }
  if (r.gain && Math.random() < 0.5) view.say(r.text, 2600);
  setMenu(menuMode ? null : 'menu');
}

// ------------------------------------------------------------------ behaviour
function weighted(list) {
  const total = list.reduce((a, [, w]) => a + w, 0); let r = Math.random() * total;
  for (const [k, w] of list) { r -= w; if (r <= 0) return k; }
  return list[0][0];
}

function maybeSpeak() {
  const s = store.get(); const sp = s.settings.speech;
  if (sp === 'off' || away || s.sleeping) return;
  const cool = sp === 'low' ? 360000 : 150000;
  if (Date.now() - lastSpeak < cool || Math.random() > 0.55) return;
  lastSpeak = Date.now(); view.say(moodLine(s), 4500);
}

async function behave() {
  if (dragging || isBusy() || menuMode) return;
  const s = store.get();
  if (s.sleeping || away) return;
  maybeSpeak();
  const mood = s.mood; const set = s.settings;
  const roam = set.roam && set.intensity !== 'low' || (set.roam && Math.random() < 0.3);
  const opts = [['stay', 3], ['react', 1]];
  if (roam) { opts.push(['walk', ['sad', 'sleepy', 'bored'].includes(mood) ? 1 : 3]); if (['excited', 'playful', 'happy'].includes(mood) && s.needs.energy > 40) opts.push(['run', 1.4]); }
  if (['playful', 'excited', 'bored'].includes(mood)) opts.push(['play', 1.5]);
  const choice = weighted(opts);
  const target = () => { const span = bounds.maxX - bounds.minX; const dir = Math.random() < 0.5 ? -1 : 1; return clampX(pos.x + dir * rnd(120, Math.min(520, span))); };
  switch (choice) {
    case 'walk': await walkTo(target(), rnd(40, 60), 'walk'); break;
    case 'run': await walkTo(target(), rnd(120, 160), 'run'); break;
    case 'react': view.anim('react', 700); break;
    case 'play': view.anim('play', 2000); view.fx('✦', 3); break;
    default: break;
  }
}

function scheduleBehavior() {
  const k = { low: 2.2, normal: 1, high: 0.6 }[store.get().settings.intensity] || 1;
  setTimeout(async () => { try { await behave(); } catch (e) { console.error(e); } scheduleBehavior(); }, rnd(3500, 9000) * k);
}

function scheduleEvents() {
  const k = { low: 2, normal: 1, high: 0.6 }[store.get().settings.intensity] || 1;
  setTimeout(() => { try { runEvent(); } catch (e) { console.error(e); } scheduleEvents(); }, rnd(4, 9) * 60000 * k);
}

function runEvent() {
  const s = store.get();
  if (dragging || isBusy() || away || s.sleeping || s.settings.speech === 'off' || !s.onboarded) return;
  const ev = randomEvent(s);
  view.say(ev.text, 5000); if (ev.anim) view.anim(ev.anim, 1800); if (ev.fx) view.fx(ev.fx[0], ev.fx[1]);
  sfx('boop');
  store.mutate((st) => {
    st.stats.events += 1; if (ev.apply) ev.apply(st);
    if (ev.gift) st.inventory.food[ev.gift] = (st.inventory.food[ev.gift] || 0) + 1;
  });
  if (ev.reward) { reward(ev.reward); store.journal('event', `Found ${ev.reward.stardust} stardust`); }
  if (ev.gift) store.journal('event', 'Found a snack');
  if (ev.id === 'zoomies') walkTo(clampX(pos.x + rnd(-400, 400)), 170, 'run');
}

// ---------------------------------------------------------------- tick / idle
function tickNow() {
  const before = store.get().sleeping;
  store.mutate((st) => tick(st, Date.now(), { away }));
  const s = store.get();
  if (before && !s.sleeping) store.fx('wake', { text: line(s, 'wake') });
  if (!before && s.sleeping) store.fx('sleep', { text: line(s, 'sleep') });
  const n = checkNotifications(s, { away });
  if (n && !away) view.say(n.type === 'daily' ? line(s, 'daily') : line(s, n.type === 'dirty' ? 'sad' : n.type), 5000);
}

async function pollIdle() {
  const set = store.get().settings.activity;
  if (!set.enabled) { if (away) endAway(); return; }
  const secs = await invoke('idle_seconds');
  const nowAway = typeof secs === 'number' && secs >= set.awayMinutes * 60;
  if (nowAway && !away) {
    away = true; awaySince = Date.now() - secs * 1000; cancelWalk(); view.hideBubble();
    if (!store.get().sleeping) { view.setBase('nap'); view.face('sleeping', 3.6e6); }
  } else if (!nowAway && away) endAway();
}
function endAway() {
  const mins = (Date.now() - awaySince) / 60000; away = false;
  view.face(null, 0); baseAnim();
  if (mins >= 10 && !store.get().sleeping) { view.anim('celebrate', 1200); view.fx('♡', 4); sfx('boop'); view.say(line(store.get(), 'back')); }
}

// --------------------------------------------------------------------- state
function onState(s, remote) {
  view.render(s); applySettings(s);
  if (!walking && !isBusy() && !dragging) baseAnim();
  if (s.mood !== lastMood) {
    if (lastMood && !away && !s.sleeping && ['hungry', 'sleepy', 'bored', 'sad'].includes(s.mood) && Date.now() - lastMoodSay > 60000 && s.settings.speech !== 'off') {
      lastMoodSay = Date.now(); view.say(line(s, s.mood), 4500);
    }
    lastMood = s.mood;
  }
  if (menuMode === 'food' || menuMode === 'status') renderMenu();
}

function onFxEvent(type, p, remote) {
  playFx(view, type, p, { remote, toast: (t) => view.say(t.title + (t.text ? ' - ' + t.text : ''), 5200) });
  if (type === 'eat') { cancelWalk(); busyUntil = Date.now() + 3400; }
  if (type === 'play') { cancelWalk(); busyUntil = Date.now() + 3000; }
  if (type === 'cleaned') busyUntil = Date.now() + 1800;
  if (type === 'sleep' || type === 'wake') baseAnim();
}

// ---------------------------------------------------------------------- boot
async function boot() {
  S = await store.init();
  computeBounds();
  view = createPetView($('pet'), { bubbleEl: $('bubble') });
  $('pet').addEventListener('layout', syncHit);
  new MutationObserver(syncHit).observe($('col'), { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  setupPointer();
  store.subscribe(onState); store.onFx(onFxEvent);
  view.render(S); lastMood = S.mood;

  pos.y = bounds.floorY;
  pos.x = clampX(S.petPos?.x ?? bounds.maxX - 140);
  await invoke('pet_move', { x: Math.round(pos.x), y: Math.round(pos.y) });
  applySettings(S);

  tickNow(); setInterval(tickNow, 15000);
  setInterval(pollIdle, 5000);
  scheduleBehavior(); scheduleEvents();
  window.addEventListener('resize', () => { computeBounds(); pos.x = clampX(pos.x); pos.y = bounds.floorY; move(); });

  await listen('tray', (id) => {
    const s = store.get();
    if (id === 'toggle') A.updateSettings((st) => { st.showPet = !st.showPet; });
    else if (id === 'feed') { A.updateSettings((st) => { st.showPet = true; }); setMenu('food'); }
    else if (id === 'play') { const r = A.play(); if (!r.ok) view.say(r.msg); }
    else if (id === 'sleep') A.toggleSleep();
    else if (id === 'quiet') A.updateSettings((st) => { st.notifications.enabled = !st.notifications.enabled; });
  });
  await listen('wobble:greet', () => { view.anim('celebrate', 1500); view.say(`hi! i'm ${store.get().name} ♡`, 5000); view.fx('♡', 6); });

  if (S.onboarded) {
    setTimeout(() => { if (dailyAvailable(store.get())) view.say(line(store.get(), 'daily'), 5000); else maybeSpeak(); }, 3500);
  }
  syncHit();
}

boot().catch((e) => console.error('[wobble] pet boot failed', e));
