// User-facing actions. Each one validates, mutates the save, then broadcasts an fx event
// so every window animates it. UI code never edits the state directly.
import * as store from '../core/store.js';
import { FOODS, ACCESSORIES, COATS, DECOR, ROOMS, THEMES, byId, clamp } from '../core/data.js';
import { computeMood, fallAsleep, wakeUp, foodReaction, line, inWindow, nextOccurrence } from './pet-engine.js';
import { reward, checkAchievements } from './progression.js';

const CATALOG = { food: FOODS, acc: ACCESSORIES, coat: COATS, decor: DECOR, room: ROOMS, theme: THEMES };
let lastPlay = 0; let lastPetFx = 0;

const refreshMood = (s) => { s.mood = computeMood(s); };

export function feed(foodId) {
  const s = store.get(); const f = byId(FOODS, foodId);
  if (!f || !(s.inventory.food[foodId] > 0)) return { ok: false, msg: 'None left - the shop has more!' };
  if (s.sleeping) return { ok: false, msg: 'shh... sleeping' };
  if (s.needs.hunger >= 95) return { ok: false, msg: line(s, 'full') };
  const reaction = foodReaction(s, foodId);
  store.mutate((st) => {
    st.inventory.food[foodId] -= 1;
    if (st.inventory.food[foodId] <= 0) delete st.inventory.food[foodId];
    const k = reaction === 'dislike' ? 0.6 : 1;
    for (const [need, v] of Object.entries(f.fx)) st.needs[need] = clamp(st.needs[need] + (need === 'hunger' ? v * k : v));
    if (reaction === 'love') { st.needs.happiness = clamp(st.needs.happiness + 8); st.fx.excitedUntil = Date.now() + 25000; }
    if (reaction === 'dislike') st.needs.happiness = clamp(st.needs.happiness - 4);
    st.stats.fed += 1; st.stats.foodTally[foodId] = (st.stats.foodTally[foodId] || 0) + 1;
    refreshMood(st);
  });
  store.fx('eat', { food: foodId, reaction, text: line(store.get(), reaction === 'ok' ? 'fed' : reaction) });
  reward({ xp: 3 + (reaction === 'love' ? 3 : 0) });
  return { ok: true, reaction };
}

export function play() {
  const s = store.get();
  if (s.sleeping) return { ok: false, msg: 'shh... sleeping' };
  if (s.needs.energy < 12) return { ok: false, msg: line(s, 'tired') };
  if (Date.now() - lastPlay < 6000) return { ok: false, msg: 'catching my breath...' };
  if (s.needs.boredom > 92 && s.needs.happiness > 92) return { ok: false, msg: 'i\'ve had plenty of fun for now ♡' };
  lastPlay = Date.now();
  store.mutate((st) => {
    st.needs.happiness = clamp(st.needs.happiness + 10); st.needs.boredom = clamp(st.needs.boredom + 22);
    st.needs.energy = clamp(st.needs.energy - 8); st.needs.hunger = clamp(st.needs.hunger - 3);
    st.fx.playfulUntil = Date.now() + 45000; st.stats.played += 1; refreshMood(st);
  });
  store.fx('play', { text: line(store.get(), 'play') });
  reward({ xp: 4 });
  return { ok: true };
}

/** A gentle tap/pet. Stat gain is rate-limited so it can't be farmed. */
export function petTap() {
  const s = store.get();
  const now = Date.now();
  if (s.sleeping) { wake(true); return { ok: true, woke: true }; }
  const gain = now - lastPetFx > 2500;
  if (gain) {
    lastPetFx = now;
    store.mutate((st) => { st.needs.happiness = clamp(st.needs.happiness + 1.5); st.stats.pets += 1; refreshMood(st); });
    checkAchievements();
  }
  return { ok: true, text: line(store.get(), 'tap'), gain };
}

export function cleanDone() {
  store.mutate((st) => {
    st.needs.cleanliness = clamp(st.needs.cleanliness + 45); st.needs.happiness = clamp(st.needs.happiness + 4);
    st.stats.cleaned += 1; refreshMood(st);
  });
  store.fx('cleaned', { text: line(store.get(), 'clean') });
  reward({ xp: 4 });
}

export function sleep() {
  const s = store.get();
  if (s.sleeping) return { ok: false };
  store.mutate((st) => { fallAsleep(st, 'manual'); st.stats.slept += 1; refreshMood(st); });
  store.fx('sleep', { text: line(store.get(), 'sleep') });
  checkAchievements();
  return { ok: true };
}

export function wake(gentle = false) {
  const s = store.get();
  if (!s.sleeping) return { ok: false };
  const sl = s.settings.sleep; const now = Date.now();
  store.mutate((st) => {
    wakeUp(st);
    // If the scheduled bedtime is active, don't put the pet straight back to bed.
    if (sl.auto && inWindow(new Date(now), sl.bedtime, sl.wake)) st.sleepOverrideUntil = nextOccurrence(now, sl.wake);
    refreshMood(st);
  });
  store.fx('wake', { text: line(store.get(), gentle ? 'woken' : 'wake') });
  return { ok: true };
}

export function toggleSleep() { return store.get().sleeping ? wake() : sleep(); }

// ---------------------------------------------------------------- economy
export function buy(cat, id) {
  const s = store.get(); const item = byId(CATALOG[cat] || [], id);
  if (!item) return { ok: false, msg: 'Unknown item' };
  if (item.lvl && s.level < item.lvl) return { ok: false, msg: `Unlocks at level ${item.lvl}` };
  if (cat !== 'food' && s.owned[cat].includes(id)) return { ok: false, msg: 'Already yours' };
  if (s.stardust < item.price) return { ok: false, msg: 'Not enough stardust yet' };
  store.mutate((st) => {
    st.stardust -= item.price; st.stats.bought += 1;
    if (cat === 'food') st.inventory.food[id] = (st.inventory.food[id] || 0) + 1;
    else st.owned[cat].push(id);
  });
  store.journal('shop', `Bought ${item.name}`);
  store.fx('bought', { name: item.name });
  checkAchievements();
  return { ok: true };
}

export function equip(slot, id) {
  const s = store.get();
  if (id) {
    const own = slot === 'coat' ? s.owned.coat : s.owned.acc;
    if (!own.includes(id)) return { ok: false };
  }
  store.mutate((st) => { st.equipped[slot] = id; });
  store.fx('react', {});
  checkAchievements();
  return { ok: true };
}

export function placeDecor(slotId, decorId) {
  const s = store.get();
  if (decorId && !s.owned.decor.includes(decorId)) return { ok: false };
  store.mutate((st) => {
    if (decorId) for (const k of Object.keys(st.room.placed)) if (st.room.placed[k] === decorId && k !== slotId) st.room.placed[k] = null;
    st.room.placed[slotId] = decorId || null;
  });
  checkAchievements();
  return { ok: true };
}

export function setRoom(id) { if (store.get().owned.room.includes(id)) store.mutate((st) => { st.room.id = id; }); }
export function setTheme(id) { if (store.get().owned.theme.includes(id)) store.mutate((st) => { st.theme = id; }); }
export function rename(name) { const n = (name || '').trim().slice(0, 16); if (n) store.mutate((st) => { st.name = n; }); }

export function updateSettings(fn) { store.mutate((st) => fn(st.settings)); }
