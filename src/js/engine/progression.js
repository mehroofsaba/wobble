// XP, levels, stardust, achievements and the daily reward.
import * as store from '../core/store.js';
import { invoke } from '../core/tauri.js';
import { ACHIEVEMENTS, dayKey } from '../core/data.js';

export const xpNeeded = (level) => Math.round(40 + level * 22);

/** Grant xp / stardust. Handles level-ups (with a stardust bonus) and achievement checks. */
export function reward({ xp = 0, stardust = 0 } = {}) {
  const gained = [];
  store.mutate((s) => {
    s.stardust += stardust; s.earned += stardust; s.xp += xp;
    while (s.xp >= xpNeeded(s.level)) {
      s.xp -= xpNeeded(s.level); s.level += 1; gained.push(s.level);
      const bonus = 20 + s.level * 5; s.stardust += bonus; s.earned += bonus;
      s.fx.excitedUntil = Date.now() + 20000;
    }
  });
  for (const l of gained) { store.fx('levelup', { level: l }); store.journal('level', `Reached level ${l}`); }
  checkAchievements();
  return gained;
}

export function checkAchievements() {
  const s = store.get();
  const fresh = ACHIEVEMENTS.filter((a) => !s.achievements[a.id] && a.check(s));
  if (!fresh.length) return;
  store.mutate((st) => { fresh.forEach((a) => { st.achievements[a.id] = Date.now(); st.stardust += 25; st.earned += 25; }); });
  fresh.forEach((a) => {
    invoke('ach_unlock', { id: a.id });
    store.journal('achievement', `Achievement unlocked: ${a.name}`);
    store.fx('achievement', { id: a.id, name: a.name, icon: a.icon });
  });
}

export const dailyAvailable = (s) => s.daily.last !== dayKey();

export function dailyAmount(streak) { return 40 + Math.min(streak, 7) * 10; }

export function claimDaily() {
  const s = store.get();
  if (!dailyAvailable(s)) return null;
  const y = new Date(); y.setDate(y.getDate() - 1);
  const streak = s.daily.last === dayKey(y) ? s.daily.streak + 1 : 1;
  const amount = dailyAmount(streak);
  const bonusFood = streak % 7 === 0;
  store.mutate((st) => {
    st.daily.last = dayKey(); st.daily.streak = streak; st.daily.best = Math.max(st.daily.best, streak);
    if (bonusFood) st.inventory.food.fishsnack = (st.inventory.food.fishsnack || 0) + 2;
  });
  reward({ stardust: amount, xp: 10 });
  store.journal('daily', `Daily reward: ${amount} stardust (day ${streak})`);
  store.fx('daily', { amount, streak, bonusFood });
  return { amount, streak, bonusFood };
}
