// Games hub: pick a game, play it, collect rewards that feed back into the pet's needs and progression.
import * as store from '../core/store.js';
import { clamp, dayKey } from '../core/data.js';
import { GAMES, gameById } from '../games/index.js';
import { reward, checkAchievements } from '../engine/progression.js';
import { computeMood } from '../engine/pet-engine.js';
import { sfx } from '../engine/audio.js';
import { modal } from '../ui/common.js';
import { toast } from '../ui/toast.js';
import { icon, gameArt } from '../ui/icons.js';

export function mount(root, ctx) {
  let running = null;

  function list() {
    const s = store.get();
    root.innerHTML = `<div class="page-grid fill"><section class="card page-card-fill"><h2>${icon('gamepad', 24)}Mini-games</h2>
      <div class="game-cards">${GAMES.map(({ meta: m }) => `<button class="game-card rise" data-g="${m.id}"><div class="thumb">${gameArt(m.id)}</div>
        <div class="body"><b>${m.name}</b><span class="chip lg">${icon('trophy', 15)}${s.stats.best[m.id] ?? '–'}</span></div></button>`).join('')}</div></section></div>`;
    root.querySelectorAll('[data-g]').forEach((b) => { b.onclick = () => { sfx('click'); play(b.dataset.g); }; });
  }

  function play(id) {
    const s = store.get(); const g = gameById(id);
    if (s.sleeping) return toast({ icon: icon('moon', 26), title: `${s.name} is sleeping`, text: 'Wake them up from Home first' });
    if (s.needs.energy < 10) return toast({ icon: icon('bolt', 26), title: 'Too tired', text: `${s.name} needs to rest` });
    root.innerHTML = `<div class="game-shell"><div class="game-bar"><button class="btn small" id="back">${icon('chevL', 16)}Back</button><b style="font-size:var(--fs-lg)">${g.meta.name}</b><span class="grow"></span>
      <span class="chip">${icon('clock', 20)}<span id="g-time">--</span></span><span class="chip">${icon('star', 20)}<span id="g-score">0</span></span><span class="chip" id="g-extra"></span></div>
      <div class="game-stage" id="stage"></div><div class="game-hint">${g.meta.hint}</div></div>`;
    const stage = root.querySelector('#stage'); let ended = false;
    const api = {
      state: s,
      hud: (time, score, extra) => { root.querySelector('#g-time').textContent = time; root.querySelector('#g-score').textContent = score; const ex = root.querySelector('#g-extra'); ex.innerHTML = extra || ''; ex.hidden = !extra; },
      end: (res) => { if (ended) return; ended = true; finish(g, res); },
    };
    root.querySelector('#back').onclick = () => { running?.stop(); running = null; list(); };
    running = g.start(stage, api);
  }

  async function finish(g, { score, extra = {} }) {
    running?.stop(); running = null;
    const s0 = store.get(); const today = dayKey();
    const n = s0.stats.gamesDay.day === today ? s0.stats.gamesDay.n : 0;
    const k = n >= 8 ? 0.5 : 1;
    const dust = Math.round(clamp(score / 8, 2, 60) * k);
    const xp = Math.round((8 + Math.min(score / 10, 30) + (extra.golden ? 30 : 0)) * k);
    const best = (s0.stats.best[g.meta.id] || 0) < score;
    store.mutate((st) => {
      st.needs.happiness = clamp(st.needs.happiness + 10 * k); st.needs.boredom = clamp(st.needs.boredom + 28 * k);
      st.needs.energy = clamp(st.needs.energy - 10); st.needs.hunger = clamp(st.needs.hunger - 3);
      st.stats.games += 1; st.stats.gameBy[g.meta.id] = (st.stats.gameBy[g.meta.id] || 0) + 1;
      st.stats.gamesDay = { day: today, n: n + 1 };
      if (best) st.stats.best[g.meta.id] = score;
      if (extra.golden) st.stats.golden += extra.golden;
      st.fx.excitedUntil = Date.now() + 30000; st.mood = computeMood(st);
    });
    store.journal('game', `Played ${g.meta.name} - score ${score}`);
    reward({ xp, stardust: dust }); checkAchievements();
    sfx('reward'); store.fx('cheer-game', {});
    const again = await modal({
      title: extra.golden ? 'Golden fish!' : best ? 'New best!' : 'Nice game',
      big: icon(extra.golden ? 'fish' : 'trophy', 46),
      body: `<div class="muted" style="font-size:var(--fs-lg)">Score ${score}</div><div class="reward-line"><span class="chip lg">${icon('star', 16)}+${xp} XP</span><span class="chip lg">${icon('smile', 16)}+${Math.round(10 * k)}</span><span class="chip lg">${icon('dust', 16)}+${dust}</span></div>${k < 1 ? '<div class="muted" style="margin-top:10px">Reduced rewards after 8 games today</div>' : ''}`,
      buttons: [{ label: 'Play again', value: true, primary: true }, { label: 'Back', value: false }],
    });
    if (again) play(g.meta.id); else list();
  }

  list();
  return { update() { /* the running game keeps its own state */ }, destroy() { running?.stop(); running = null; } };
}
