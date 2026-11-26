// Home: the room scene with the pet, quick actions, needs and daily reward.
import * as store from '../core/store.js';
import { FOODS, ROOMS, byId } from '../core/data.js';
import * as A from '../engine/actions.js';
import { claimDaily, dailyAvailable, dailyAmount, xpNeeded } from '../engine/progression.js';
import { MOOD_INFO, personalityTitle } from '../engine/pet-engine.js';
import { sfx } from '../engine/audio.js';
import { createPetView } from '../ui/pet-view.js';
import { petSvgFromState } from '../ui/pet-svg.js';
import { startScrub } from '../ui/scrub.js';
import { roomSvg } from '../ui/room.js';
import { icon, foodArt, moodFace } from '../ui/icons.js';
import { meters, xpPct, esc } from '../ui/common.js';

const ACTIONS = [['feed', 'fork', 'Feed'], ['play', 'gamepad', 'Play'], ['clean', 'bubbles', 'Clean'], ['sleep', 'moon', 'Sleep'], ['games', 'trophy', 'Mini-games'], ['shop', 'bag', 'Shop']];

export function mount(root, ctx) {
  root.innerHTML = `<div class="page-grid home">
    <div class="side"><section class="card" id="h-status"></section><section class="card" id="h-daily"></section><section class="card" id="h-inv"></section></div>
    <div class="scene" id="scene"><div id="room"></div><div class="scene-label" id="room-name"></div><div class="scene-pet" id="pet-host"></div>
      <div class="scene-actions" id="actions">${ACTIONS.map(([a, ic, l]) => `<button data-a="${a}">${icon(ic, 20)}<span class="l">${l}</span></button>`).join('')}</div>
      <div class="tray" id="tray" hidden></div></div></div>`;
  const $ = (id) => root.querySelector('#' + id);
  const view = createPetView($('pet-host'));
  ctx.setView(view);
  let roomSig = ''; let trayOpen = false; let scrubbing = null;
  const say = (m) => m && view.say(m);

  $('actions').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return; sfx('click');
    const a = b.dataset.a;
    if (a === 'feed') { trayOpen = !trayOpen; return render(store.get()); }
    trayOpen = false;
    if (a === 'play') { const r = A.play(); if (!r.ok) say(r.msg); }
    else if (a === 'clean') {
      if (store.get().sleeping) say('shh... i\'m sleeping');
      else if (!scrubbing) scrubbing = startScrub(view, () => { scrubbing = null; A.cleanDone(); });
    } else if (a === 'sleep') A.toggleSleep();
    else ctx.go(a);
    render(store.get());
  });
  $('tray').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-f]'); if (!b) return;
    const r = A.feed(b.dataset.f); if (!r.ok) say(r.msg); else { trayOpen = false; render(store.get()); }
  });
  $('pet-host').addEventListener('click', (e) => {
    if (!e.target.closest('.pv-art')) return;
    const r = A.petTap(); view.anim('react', 500); view.fx('♡', 2); sfx(r.woke ? 'wake' : 'boop');
    if (r.text && Math.random() < 0.6) say(r.text);
  });
  root.querySelector('#h-daily').addEventListener('click', (e) => { if (e.target.closest('#claim')) claimDaily(); });

  function render(s) {
    const mk = s.sleeping ? 'sleepy' : s.mood;
    $('h-status').innerHTML = `<div class="profile-mini"><div class="avatar">${petSvgFromState(s, { face: 'happy' })}</div>
      <div class="grow"><div class="nm">${esc(s.name)} · Lv. ${s.level}</div><div class="xpbar" title="${s.xp} / ${xpNeeded(s.level)} xp"><i style="width:${xpPct(s)}%"></i></div></div></div>
      ${meters(s)}<div class="mood-row">${moodFace(mk, 28)}<span class="chip lg">${s.sleeping ? 'Sleeping' : MOOD_INFO[mk].label}</span><span class="chip lg">${personalityTitle(s.personality)}</span></div>`;
    const can = dailyAvailable(s);
    $('h-daily').innerHTML = `<div class="daily"><div class="gift">${icon('gift', 28)}</div><div class="grow"><b>Daily reward</b><span>${can ? `${dailyAmount((s.daily.streak || 0) + 1)} stardust` : `Day ${s.daily.streak} streak`}</span></div>
      <button class="btn small primary" id="claim" ${can ? '' : 'disabled'}>${can ? 'Claim' : 'Claimed'}</button></div>`;
    const foods = FOODS.filter((f) => s.inventory.food[f.id] > 0);
    $('h-inv').innerHTML = `<h2>${icon('bag', 22)}Snacks</h2>` + (foods.length
      ? `<div class="snacks">${foods.map((f) => `<div class="snack" title="${esc(f.name)}">${foodArt(f.id, 46)}<span class="n">${s.inventory.food[f.id]}</span></div>`).join('')}</div>`
      : '<div class="empty-note">No snacks</div>');
    const sig = s.room.id + JSON.stringify(s.room.placed);
    if (sig !== roomSig) { roomSig = sig; $('room').innerHTML = roomSvg(s.room.id, s.room.placed); }
    $('room-name').innerHTML = `${icon('pin', 16)}${esc(byId(ROOMS, s.room.id)?.name || '')}`;
    const sb = root.querySelector('[data-a="sleep"]'); sb.innerHTML = `${icon(s.sleeping ? 'sun' : 'moon', 20)}<span class="l">${s.sleeping ? 'Wake up' : 'Sleep'}</span>`;
    root.querySelector('[data-a="feed"]').setAttribute('aria-pressed', trayOpen);
    view.render(s);
    const t = $('tray'); t.hidden = !trayOpen;
    if (trayOpen) t.innerHTML = foods.length ? foods.map((f) => `<button data-f="${f.id}" title="${esc(f.name)}">${foodArt(f.id, 42)}<span class="badge">${s.inventory.food[f.id]}</span></button>`).join('') : '<div class="empty">No snacks left</div>';
  }
  render(store.get());
  return { update: render, destroy() { scrubbing?.(); ctx.setView(null); } };
}
