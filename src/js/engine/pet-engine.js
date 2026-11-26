// Pet engine: needs decay, moods, personality, speech and random events.
// Everything here is plain logic over the state object - no DOM, no Tauri.
import { clamp, pick, FOODS, byId } from '../core/data.js';

const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const minutesNow = (d) => d.getHours() * 60 + d.getMinutes();

export function inWindow(date, from, to) {
  const n = minutesNow(date); const a = toMin(from); const b = toMin(to);
  return a <= b ? n >= a && n < b : n >= a || n < b;
}
/** Timestamp of the next occurrence of "HH:MM" after `now`. */
export function nextOccurrence(now, hhmm) {
  const d = new Date(now); const m = toMin(hhmm);
  d.setHours(Math.floor(m / 60), m % 60, 0, 0);
  if (d.getTime() <= now) d.setDate(d.getDate() + 1);
  return d.getTime();
}

export function wakeUp(s) { s.sleeping = false; s.sleepReason = null; }
export function fallAsleep(s, reason = 'manual') { s.sleeping = true; s.sleepReason = reason; }

/** Advance needs to `now`. Gradual, with sensible limits for long absences. */
export function tick(s, now, ctx = {}) {
  let dt = (now - s.lastTick) / 36e5;
  if (dt <= 0) return;
  if (dt > 0.2) dt = Math.min(dt, 8) * 0.5; // app was closed: cap at 8h and go easy (half rate)
  s.lastTick = now;
  const n = s.needs; const p = s.personality;

  if (s.sleeping) {
    n.energy += 14 * dt;
    n.hunger -= 2.5 * (1 + p.greedy * 0.3) * dt;
    n.cleanliness -= 1 * dt; n.boredom -= 1 * dt; n.happiness -= 0.6 * dt;
  } else {
    n.hunger -= 7 * (0.8 + p.greedy * 0.5) * dt;
    n.energy -= 3 * (0.8 + p.sleepy * 0.5) * dt;
    n.cleanliness -= 2.5 * dt;
    if (!ctx.away) n.boredom -= 6 * (0.8 + p.playful * 0.5) * dt; // never punish the user for being away
    n.happiness -= 3 * dt;
  }
  if (n.hunger < 20) n.happiness -= 4 * dt;
  if (n.cleanliness < 20) n.happiness -= 2 * dt;
  if (n.boredom < 20) n.happiness -= 3 * dt;
  for (const k of Object.keys(n)) n[k] = clamp(n[k]);

  const target = 0.3 * n.hunger + 0.2 * n.energy + 0.2 * n.cleanliness + 0.2 * n.happiness + 0.1 * n.boredom;
  n.health = clamp(n.health + (target - n.health) * Math.min(1, dt * 0.8), 8, 100); // the pet is never in danger

  const d = new Date(now);
  const sl = s.settings.sleep;
  const inBed = inWindow(d, sl.bedtime, sl.wake);
  if (sl.auto) {
    if (inBed && !s.sleeping && now >= s.sleepOverrideUntil) fallAsleep(s, 'schedule');
    if (!inBed && s.sleeping && s.sleepReason === 'schedule') wakeUp(s);
  }
  if (!s.sleeping && n.energy < 8 && sl.auto) fallAsleep(s, 'tired');
  if (s.sleeping && s.sleepReason === 'tired' && n.energy >= 90) wakeUp(s);
  if (d.getHours() < 4) s.stats.nightOwl = true;

  s.mood = computeMood(s, now);
}

export function computeMood(s, now = Date.now()) {
  const n = s.needs; const f = s.fx; const p = s.personality;
  if (s.sleeping) return 'sleepy';
  if (n.hunger < 25) return 'hungry';
  if (n.energy < 25) return 'sleepy';
  if (n.boredom < 25) return 'bored';
  if (n.happiness < 30 || n.health < 35 || n.cleanliness < 15) return 'sad';
  if (now < f.excitedUntil) return 'excited';
  if (now < f.playfulUntil || (n.energy > 65 && n.boredom < 55 && n.happiness > 55 && p.playful > 0.6)) return 'playful';
  const avg = (n.hunger + n.happiness + n.energy + n.cleanliness + n.boredom + n.health) / 6;
  if (avg > 75 && n.happiness > 70) return 'happy';
  return 'content';
}

export const MOOD_INFO = {
  happy: { label: 'Happy' }, excited: { label: 'Excited' }, sleepy: { label: 'Sleepy' }, hungry: { label: 'Hungry' },
  bored: { label: 'Bored' }, sad: { label: 'Sad' }, playful: { label: 'Playful' }, content: { label: 'Content' },
};

export function personalityTitle(p) {
  const t = [['playful', 'Playful'], ['sleepy', 'Dreamy'], ['greedy', 'Foodie'], ['shy', 'Shy']];
  t.sort((a, b) => p[b[0]] - p[a[0]]);
  return t[0][1];
}

// ------------------------------------------------------------------ speech
const LINES = {
  idle: ['you\'re doing great! ♡', 'hi hi! ♡', '*wiggles*', 'i like it here ♡', 'what are we up to?', 'having a cozy day?', 'don\'t forget to drink water!', 'i\'m right here if you need me ♡', 'stretch your shoulders a little!'],
  happy: ['today is a good day ♡', 'life is nice ♡', 'thank you for hanging out with me!', 'i feel so warm and fuzzy'],
  excited: ['yay yay yay!!', 'this is the best!!', 'i can\'t sit still!!'],
  playful: ['wanna play? ♡', 'catch me if you can!', 'i have so much energy!', 'play with me? pleeease?'],
  content: ['mmm, nice and calm.', 'just vibing ♡', 'all is well.'],
  hungry: ['my tummy is rumbling...', 'snack time? ♡', 'i\'m a little hungry...', 'is it lunchtime yet?'],
  sleepy: ['*yawn*', 'so sleepy...', 'maybe a tiny nap?', 'my eyes are heavy...'],
  bored: ['i\'m bored... ', 'can we do something fun?', 'play a game with me?', '*stares at the ceiling*'],
  sad: ['i feel a little down...', 'could i have a cuddle?', 'i missed you...'],
  tap: ['hehe, that tickles!', 'boop! ♡', 'hi there!', 'purr purr ♡', 'again again!'],
  shyTap: ['oh! h-hi...', '*blushes*', 'um... hi ♡'],
  fed: ['yum!! thank you ♡', 'nom nom nom', 'so tasty!', 'delicious!'],
  love: ['MY FAVORITE!! ♡♡♡', 'you remembered my favorite!!', 'best snack ever!!'],
  dislike: ['ew... not my favorite...', 'bleh... i\'ll eat it anyway', 'hmm... not for me...'],
  full: ['i\'m too full right now!', 'maybe later? i\'m stuffed ♡'],
  tired: ['too tired to play...', 'let\'s rest first...'],
  clean: ['squeaky clean! ♡', 'ahh, so fresh!', 'sparkly!', 'thank you for the bubbles ♡'],
  play: ['that was fun!!', 'again!', 'wheee!'],
  sleep: ['good night... ♡', 'zzz... see you in my dreams', 'nighty night...'],
  wake: ['mmm... good morning!', 'i feel rested ♡', '*stretches* hi!'],
  woken: ['mmm... hm?', 'five more minutes...'],
  back: ['welcome back! ♡', 'i missed you!', 'you\'re back!'],
  night: ['it\'s getting late... ♡', 'don\'t stay up too late!', 'the stars are out ♡'],
  levelup: ['i leveled up!! ♡', 'we\'re growing together!'],
  daily: ['your daily reward is waiting ♡', 'psst... a gift is ready for you!'],
};

let lastLine = '';
export function line(s, kind) {
  let pool = [...(LINES[kind] || LINES.idle)];
  if (kind === 'tap' && s.personality.shy > 0.65) pool = LINES.shyTap.concat(pool.slice(0, 1));
  if (kind === 'idle') {
    const h = new Date().getHours();
    if (h >= 23 || h < 5) pool.push(...LINES.night, ...LINES.night);
    const days = Math.floor((Date.now() - s.createdAt) / 864e5);
    if (days >= 2) pool.push(`we've been together ${days} days ♡`);
    if (s.stats.fed > 10) pool.push('thanks for always feeding me ♡');
    if (s.personality.greedy > 0.7) pool.push('is it snack o\'clock?');
    if (s.personality.sleepy > 0.7) pool.push('*yawns* ...cozy.');
    if (s.personality.playful > 0.7) pool.push('let\'s play something!');
  }
  let t = pick(pool);
  if (t === lastLine && pool.length > 1) t = pick(pool);
  lastLine = t;
  return t.replace('{name}', s.name);
}

export function moodLine(s) {
  const m = s.mood;
  if (['hungry', 'sleepy', 'bored', 'sad'].includes(m)) return line(s, m);
  if (Math.random() < 0.5 && LINES[m]) return line(s, m);
  return line(s, 'idle');
}

// ----------------------------------------------------------- random events
export const TIPS = [
  'tip: rub the bubbles off me when i\'m dirty ♡',
  'tip: golden fish are worth a lot of stardust!',
  'tip: drag me anywhere on your screen.',
  'tip: you can change my bedtime in settings.',
  'tip: new accessories live in the shop ♡',
  'tip: click me for quick actions!',
];

/** Returns a random event description; the controller plays it and applies `apply`. */
export function randomEvent(s) {
  const n = s.needs; const p = s.personality;
  const list = [
    { w: 3, id: 'butterfly', text: 'ooh, a butterfly!', anim: 'play', fx: ['✦', 3], apply: (st) => { st.needs.boredom = clamp(st.needs.boredom + 8); st.needs.happiness = clamp(st.needs.happiness + 3); } },
    { w: 2 + (p.playful > 0.6 ? 2 : 0), id: 'zoomies', text: 'zoomies!!', anim: 'run', apply: (st) => { st.needs.boredom = clamp(st.needs.boredom + 6); st.needs.energy = clamp(st.needs.energy - 3); st.fx.playfulUntil = Date.now() + 60000; } },
    { w: 2, id: 'sneeze', text: 'achoo!', anim: 'react' },
    { w: 2, id: 'stretch', text: '*big stretch*', anim: 'react' },
    { w: 2, id: 'hiccup', text: '*hic!*', anim: 'react' },
    { w: 2, id: 'compliment', text: 'you\'re doing great! ♡', anim: 'celebrate', fx: ['♡', 3] },
    { w: 3, id: 'stardust', text: 'found some stardust!', anim: 'celebrate', fx: ['✧', 5], reward: { stardust: Math.floor(5 + Math.random() * 11) } },
    { w: 1, id: 'gift', text: 'i found a snack for later!', anim: 'celebrate', fx: ['✦', 2], gift: 'strawberry' },
    { w: n.boredom < 60 ? 4 : 1, id: 'askplay', text: 'wanna play a game? ♡', anim: 'play' },
    { w: 1, id: 'tip', text: pick(TIPS), anim: 'react' },
    { w: 1, id: 'dream', text: 'i had the nicest daydream...', anim: 'react' },
  ];
  const total = list.reduce((a, e) => a + e.w, 0);
  let r = Math.random() * total;
  for (const e of list) { r -= e.w; if (r <= 0) return e; }
  return list[0];
}

export function foodReaction(s, foodId) {
  if (foodId === s.personality.fav) return 'love';
  if (foodId === s.personality.dis) return 'dislike';
  return 'ok';
}

export const foodName = (id) => byId(FOODS, id)?.name || id;
