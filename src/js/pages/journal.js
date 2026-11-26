// Journal: profile, statistics, achievements and the activity log (persisted in SQLite).
import * as store from '../core/store.js';
import { invoke } from '../core/tauri.js';
import { ACHIEVEMENTS, FOODS, byId } from '../core/data.js';
import * as A from '../engine/actions.js';
import { personalityTitle } from '../engine/pet-engine.js';
import { petSvgFromState } from '../ui/pet-svg.js';
import { icon, foodArt } from '../ui/icons.js';
import { esc, timeAgo, xpPct } from '../ui/common.js';
import { xpNeeded } from '../engine/progression.js';

export function mount(root) {
  async function render() {
    const s = store.get();
    const rows = (await invoke('journal_list', { limit: 40 })) || [];
    const days = Math.max(1, Math.floor((Date.now() - s.createdAt) / 864e5) + 1);
    const done = ACHIEVEMENTS.filter((a) => s.achievements[a.id]).length;
    const fav = byId(FOODS, s.personality.fav); const dis = byId(FOODS, s.personality.dis);
    root.innerHTML = `<div class="page-grid">
      <section class="card"><div class="profile-card"><div class="avatar">${petSvgFromState(s, { face: 'happy' })}</div>
        <div><div class="row wrap" style="margin-bottom:8px"><h2 style="margin:0">${esc(s.name)}</h2><span class="chip lg">Lv. ${s.level}</span><span class="chip lg">${personalityTitle(s.personality)}</span></div>
        <div class="xpbar" style="margin-bottom:12px" title="${s.xp}/${xpNeeded(s.level)}"><i style="width:${xpPct(s)}%"></i></div>
        <div class="row wrap" style="margin-bottom:12px"><span class="chip lg" title="Favourite food">${icon('heart', 15)}${foodArt(fav.id, 24)}${fav.name}</span><span class="chip lg" title="Dislikes">${icon('x', 15)}${foodArt(dis.id, 24)}${dis.name}</span></div>
        <div class="row"><input type="text" id="nm" value="${esc(s.name)}" maxlength="16" aria-label="Pet name" /><button class="btn small" id="rn">Rename</button></div></div></div>
        <div class="stat-grid">${[['Days together', days], ['Fed', s.stats.fed], ['Games', s.stats.games], ['Cleaned', s.stats.cleaned], ['Pets', s.stats.pets], ['Stardust earned', s.earned], ['Best streak', s.daily.best], ['Achievements', `${done}/${ACHIEVEMENTS.length}`]].map(([l, v]) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('')}</div></section>
      <section class="card"><h2>${icon('trophy', 22)}Achievements</h2><div class="ach-grid">${ACHIEVEMENTS.map((a) => {
        const got = !!s.achievements[a.id]; const p = a.prog ? a.prog(s) : null;
        return `<div class="ach ${got ? '' : 'locked'}"><div class="i">${icon(a.icon, 30)}</div><div class="t"><b>${esc(a.name)}</b><span>${esc(a.desc)}</span>${!got && p ? `<div class="xpbar"><i style="width:${Math.min(100, (p[0] / p[1]) * 100)}%"></i></div>` : ''}</div></div>`;
      }).join('')}</div></section>
      <section class="card"><h2>${icon('book', 22)}Log</h2><div class="list">${rows.length ? rows.map((r) => `<div class="entry"><time>${timeAgo(r.ts)}</time><span>${esc(r.text)}</span></div>`).join('') : '<div class="empty-note">No entries yet</div>'}</div></section></div>`;
    root.querySelector('#rn').onclick = () => A.rename(root.querySelector('#nm').value);
  }
  render();
  let sig = '';
  return { update(s) { const n = JSON.stringify([s.stats, s.achievements, s.level, s.name, s.earned]); if (n !== sig) { sig = n; render(); } } };
}
