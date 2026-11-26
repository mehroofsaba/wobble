// Customize: dress the pet, decorate the room, switch rooms and app themes.
import * as store from '../core/store.js';
import { COATS, ACCESSORIES, DECOR, ROOMS, SLOTS, THEMES, byId } from '../core/data.js';
import * as A from '../engine/actions.js';
import { createPetView } from '../ui/pet-view.js';
import { petSvg } from '../ui/pet-svg.js';
import { roomSvg, ROOM_BG } from '../ui/room.js';
import { icon } from '../ui/icons.js';
import { esc } from '../ui/common.js';
import { sfx } from '../engine/audio.js';

let tab = 'pet';
const SECTIONS = [['head', 'Head'], ['face', 'Face'], ['neck', 'Neck']];

export function mount(root, ctx) {
  let view = null; let animate = false;

  const accOpts = (slot, s) => {
    const cur = s.equipped[slot];
    const items = ACCESSORIES.filter((a) => a.slot === slot && s.owned.acc.includes(a.id));
    return `<button class="opt none ${!cur ? 'sel' : ''}" data-eq="${slot}" data-id=""><span class="art">${icon('x', 30)}</span>None</button>`
      + items.map((a) => `<button class="opt ${cur === a.id ? 'sel' : ''}" data-eq="${slot}" data-id="${a.id}"><span class="art">${petSvg({ coat: s.equipped.coat, face: 'happy', head: slot === 'head' ? a.id : null, faceAcc: slot === 'face' ? a.id : null, neck: slot === 'neck' ? a.id : null })}</span>${esc(a.name)}</button>`).join('')
      + `<button class="opt more" data-shop><span class="art">${icon('bag', 28)}</span>Shop</button>`;
  };

  const renderPet = (s) => `<div class="page-grid custom"><div class="card preview-card"><h2 style="margin:0">${esc(s.name)}</h2><div class="stage" id="stage"></div></div>
    <div class="card"><div class="opt-section"><h3>Coat</h3><div class="opt-grid">${COATS.filter((c) => s.owned.coat.includes(c.id)).map((c) =>
      `<button class="opt ${s.equipped.coat === c.id ? 'sel' : ''}" data-coat="${c.id}"><span class="art">${petSvg({ coat: c.id, face: 'happy', bare: true })}</span>${esc(c.name)}</button>`).join('')}<button class="opt more" data-shop><span class="art">${icon('bag', 28)}</span>Shop</button></div></div>
      ${SECTIONS.map(([slot, label]) => `<div class="opt-section"><h3>${label}</h3><div class="opt-grid">${accOpts(slot, s)}</div></div>`).join('')}</div></div>`;

  const renderRoom = (s) => {
    const owned = ROOMS.filter((r) => s.owned.room.includes(r.id));
    return `<div class="page-grid room-edit"><div class="card"><div class="scene" style="aspect-ratio:16/9;min-height:0">${roomSvg(s.room.id, s.room.placed)}<div class="scene-label">${icon('pin', 16)}${esc(byId(ROOMS, s.room.id).name)}</div></div>
      <h3 style="margin:18px 0 10px">Rooms</h3><div class="opt-grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">${owned.map((r) => `<button class="opt ${s.room.id === r.id ? 'sel' : ''}" data-room="${r.id}"><span class="art" style="height:62px">${ROOM_BG(r.id)}</span>${esc(r.name)}</button>`).join('')}<button class="opt more" data-shop><span class="art" style="height:62px">${icon('bag', 28)}</span>Shop</button></div></div>
      <div class="card"><h2>${icon('plant', 22)}Decor</h2><div class="slot-list">${SLOTS.map((sl) => {
        const opts = DECOR.filter((d) => d.type === sl.type && s.owned.decor.includes(d.id));
        return `<div class="slot-item"><label for="sl-${sl.id}">${sl.label}</label><select id="sl-${sl.id}" data-slot="${sl.id}"><option value="">Empty</option>${opts.map((d) => `<option value="${d.id}" ${s.room.placed[sl.id] === d.id ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select></div>`;
      }).join('')}</div></div></div>`;
  };

  const renderTheme = (s) => `<div class="page-grid"><section class="card"><h2>${icon('palette', 22)}Theme</h2><div class="tiles">${THEMES.map((t) => {
    const own = s.owned.theme.includes(t.id);
    return `<button class="tile ${s.theme === t.id ? 'sel' : ''}" data-theme="${t.id}"><div class="pic"><div style="width:100%;height:70px;border-radius:18px;background:linear-gradient(135deg,${t.sw[0]},${t.sw[1]});border:3px solid #fff"></div></div><div class="nm">${esc(t.name)}</div>
      <span class="chip lg" style="margin-top:auto">${own ? (s.theme === t.id ? `${icon('check', 15)}Active` : 'Apply') : `${icon('lock', 14)}${t.price}`}</span></button>`;
  }).join('')}</div></section></div>`;

  function render() {
    const s = store.get();
    root.innerHTML = `<div style="display:flex;flex-direction:column;gap:14px"><div class="tabs" style="margin:0">${[['pet', 'cat', 'Pet'], ['room', 'home', 'Room'], ['theme', 'palette', 'Theme']].map(([id, ic, l]) => `<button data-tab="${id}" aria-pressed="${tab === id}">${icon(ic, 18)}${l}</button>`).join('')}</div>
      <div class="${animate ? 'swap' : ''}">${tab === 'pet' ? renderPet(s) : tab === 'room' ? renderRoom(s) : renderTheme(s)}</div></div>`;
    animate = false;
    root.querySelectorAll('[data-tab]').forEach((b) => { b.onclick = () => { tab = b.dataset.tab; sfx('click'); animate = true; render(); }; });
    root.querySelectorAll('[data-shop]').forEach((b) => { b.onclick = () => ctx.go('shop'); });
    view = null; ctx.setView(null);
    if (tab === 'pet') {
      view = createPetView(root.querySelector('#stage')); view.render(s); ctx.setView(view);
      view.art.onclick = () => { view.anim('react', 500); view.fx('♡', 3); sfx('boop'); };
      root.querySelectorAll('[data-coat]').forEach((b) => { b.onclick = () => { sfx('click'); A.equip('coat', b.dataset.coat); }; });
      root.querySelectorAll('[data-eq]').forEach((b) => { b.onclick = () => { sfx('click'); A.equip(b.dataset.eq, b.dataset.id || null); }; });
    } else if (tab === 'room') {
      root.querySelectorAll('[data-room]').forEach((b) => { b.onclick = () => { sfx('click'); A.setRoom(b.dataset.room); }; });
      root.querySelectorAll('[data-slot]').forEach((sel) => { sel.onchange = () => { sfx('pop'); A.placeDecor(sel.dataset.slot, sel.value || null); }; });
    } else {
      root.querySelectorAll('[data-theme]').forEach((b) => { b.onclick = () => { if (store.get().owned.theme.includes(b.dataset.theme)) { sfx('click'); A.setTheme(b.dataset.theme); } else ctx.go('shop'); }; });
    }
  }
  render();
  let sig = JSON.stringify([store.get().equipped, store.get().owned, store.get().room, store.get().theme, store.get().name]);
  return {
    update(s) {
      view && view.render(s);
      const n = JSON.stringify([s.equipped, s.owned, s.room, s.theme, s.name]);
      if (n !== sig) { sig = n; render(); }
    },
    destroy() { ctx.setView(null); },
  };
}
