// Shop: food, accessories, coats, decorations, rooms and themes. Buying goes through actions.buy().
import * as store from '../core/store.js';
import { FOODS, ACCESSORIES, COATS, DECOR, ROOMS, THEMES } from '../core/data.js';
import * as A from '../engine/actions.js';
import { petSvg } from '../ui/pet-svg.js';
import { decorPreview, ROOM_BG } from '../ui/room.js';
import { icon, foodArt } from '../ui/icons.js';
import { esc, fxChips, price } from '../ui/common.js';
import { toast } from '../ui/toast.js';
import { sfx } from '../engine/audio.js';

const TABS = [['food', 'fork', 'Food', FOODS], ['acc', 'bow', 'Accessories', ACCESSORIES], ['coat', 'cat', 'Coats', COATS], ['decor', 'plant', 'Decor', DECOR], ['room', 'home', 'Rooms', ROOMS], ['theme', 'palette', 'Themes', THEMES]];
const SLOT = { head: 'Head', face: 'Face', neck: 'Neck' };
let tab = 'food';

function pic(cat, it, s) {
  if (cat === 'food') return foodArt(it.id, 62);
  if (cat === 'acc') return petSvg({ coat: s.equipped.coat, face: 'happy', head: it.slot === 'head' ? it.id : null, faceAcc: it.slot === 'face' ? it.id : null, neck: it.slot === 'neck' ? it.id : null });
  if (cat === 'coat') return petSvg({ coat: it.id, face: 'happy', bare: true });
  if (cat === 'decor') return decorPreview(it.id);
  if (cat === 'room') return ROOM_BG(it.id);
  return `<div style="width:70px;height:70px;border-radius:22px;background:linear-gradient(135deg,${it.sw[0]},${it.sw[1]});border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.12)"></div>`;
}

export function mount(root, ctx) {
  function render(animate = false) {
    const s = store.get(); const [, , , list] = TABS.find((t) => t[0] === tab);
    root.innerHTML = `<div class="page-grid"><section class="card"><div class="row sp wrap" style="margin-bottom:14px"><h2 style="margin:0">${icon('bag', 24)}Shop</h2><span class="chip lg">${icon('dust', 17)}${s.stardust}</span></div>
      <div class="tabs" role="tablist">${TABS.map(([id, ic, l]) => `<button role="tab" data-t="${id}" aria-pressed="${id === tab}">${icon(ic, 18)}${l}</button>`).join('')}</div>
      <div class="tiles ${animate ? 'swap' : ''}">${list.map((it) => {
        const owned = tab !== 'food' && s.owned[tab].includes(it.id);
        const locked = it.lvl && s.level < it.lvl;
        const chips = tab === 'food' ? fxChips(it.fx) : tab === 'acc' ? `<span class="chip">${SLOT[it.slot]}</span>` : '';
        const have = tab === 'food' && s.inventory.food[it.id] ? `<span class="tag own">×${s.inventory.food[it.id]}</span>` : '';
        return `<div class="tile ${locked ? 'locked' : ''}"><div class="pic">${pic(tab, it, s)}</div>${have}${owned ? `<span class="tag">${icon('check', 13)}Owned</span>` : locked ? `<span class="tag dim">${icon('lock', 12)}Lv ${it.lvl}</span>` : ''}
          <div class="nm">${esc(it.name)}</div><div class="chips">${chips}</div>
          ${owned ? '<button class="btn small" disabled>Owned</button>' : `<button class="btn small primary" data-b="${it.id}" ${locked || s.stardust < it.price ? 'disabled' : ''}>${it.price ? price(it.price) : 'Free'}</button>`}</div>`;
      }).join('')}</div></section></div>`;
    root.querySelectorAll('[data-t]').forEach((b) => { b.onclick = () => { tab = b.dataset.t; sfx('click'); render(true); }; });
    root.querySelectorAll('[data-b]').forEach((b) => { b.onclick = () => { const r = A.buy(tab, b.dataset.b); if (!r.ok) toast({ icon: icon('bag', 26), title: r.msg }); }; });
  }
  render();
  let sig = '';
  return { update(s) { const n = JSON.stringify([s.stardust, s.owned, s.inventory, s.level]); if (n !== sig) { if (sig) render(); sig = n; } } };
}
