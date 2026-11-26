// Static catalogue + default save-game. Everything content-like lives here so new
// foods / accessories / rooms / themes can be added without touching engine code.

export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const rnd = (a, b) => a + Math.random() * (b - a);
export const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const NEEDS = [
  { id: 'hunger', label: 'Hunger', icon: 'fork', color: 'var(--c-hunger)' },
  { id: 'happiness', label: 'Happiness', icon: 'smile', color: 'var(--c-happy)' },
  { id: 'energy', label: 'Energy', icon: 'bolt', color: 'var(--c-energy)' },
  { id: 'cleanliness', label: 'Cleanliness', icon: 'drop', color: 'var(--c-clean)' },
  { id: 'boredom', label: 'Boredom', icon: 'star', color: 'var(--c-bored)' },
  { id: 'health', label: 'Health', icon: 'heart', color: 'var(--c-health)' },
];

export const THEMES = [
  { id: 'lavender', name: 'Lavender Dusk', price: 0, sw: ['#9d8be0', '#d8b5ef'] },
  { id: 'cream', name: 'Warm Cream', price: 0, sw: ['#f7ecd2', '#fff8e8'] },
  { id: 'pink', name: 'Blush Pink', price: 40, sw: ['#f6b8d4', '#fde0ec'] },
  { id: 'sage', name: 'Sage Garden', price: 40, sw: ['#b6d8be', '#e4f2df'] },
  { id: 'peach', name: 'Peach Fizz', price: 40, sw: ['#ffc9a8', '#ffe6d4'] },
  { id: 'celestial', name: 'Celestial Night', price: 100, lvl: 3, sw: ['#1b1840', '#4a3a8e'] },
];

export const FOODS = [
  { id: 'strawberry', name: 'Strawberry', price: 6, fx: { hunger: 14, happiness: 3 }, desc: 'Sweet and light.' },
  { id: 'riceball', name: 'Rice Ball', price: 10, fx: { hunger: 24, energy: 2 }, desc: 'Filling and simple.' },
  { id: 'fishsnack', name: 'Fish Snack', price: 14, fx: { hunger: 20, happiness: 6 }, desc: 'A little treat from the pond.' },
  { id: 'cupcake', name: 'Cupcake', price: 16, fx: { hunger: 12, happiness: 14, cleanliness: -3 }, desc: 'Happy, but a bit messy.' },
  { id: 'milk', name: 'Warm Milk', price: 8, fx: { hunger: 10, health: 5, energy: 4 }, desc: 'Cozy and calming.' },
  { id: 'soup', name: 'Veggie Soup', price: 20, fx: { hunger: 34, health: 8 }, lvl: 3, desc: 'Big, warm and good for you.' },
  { id: 'goldencake', name: 'Golden Cake', price: 60, fx: { hunger: 28, happiness: 25, energy: 10, health: 10 }, lvl: 8, desc: 'A celebration slice.' },
];

export const COATS = [
  { id: 'lavender', name: 'Lavender Patch', price: 0, c: { base: '#fff7ff', patch: '#bfa9ee', inner: '#ffb3cf', line: '#6c55b8' } },
  { id: 'cream', name: 'Cream Tabby', price: 0, c: { base: '#fff3df', patch: '#e8b98a', inner: '#ffb3b3', line: '#9a6a3c' } },
  { id: 'peach', name: 'Peach Fuzz', price: 60, c: { base: '#ffe9dc', patch: '#ffb58f', inner: '#ff9db4', line: '#b4613c' } },
  { id: 'mint', name: 'Mint Cloud', price: 70, c: { base: '#f1fff6', patch: '#a9ddc0', inner: '#ffc2d4', line: '#4a8a6a' } },
  { id: 'rose', name: 'Rosy Pearl', price: 90, c: { base: '#fff0f6', patch: '#f4a9c9', inner: '#ff8fb5', line: '#b04a7a' } },
  { id: 'cloud', name: 'Storm Cloud', price: 100, c: { base: '#eef1fb', patch: '#a3acc9', inner: '#ffb8c8', line: '#4e5a85' } },
  { id: 'cocoa', name: 'Cocoa Swirl', price: 80, c: { base: '#f6e6d6', patch: '#a9785a', inner: '#ffb0b8', line: '#6a4330' } },
  { id: 'midnight', name: 'Midnight Star', price: 140, lvl: 6, c: { base: '#cfc6ee', patch: '#5a4a9a', inner: '#ff9cc4', line: '#2f2560' } },
];

// slot: head | face | neck
export const ACCESSORIES = [
  { id: 'bow', name: 'Ribbon Bow', slot: 'head', price: 0, color: '#ff8fbf' },
  { id: 'flower', name: 'Daisy', slot: 'head', price: 35, color: '#ffe27a' },
  { id: 'starclip', name: 'Star Clip', slot: 'head', price: 40, color: '#ffd24d' },
  { id: 'partyhat', name: 'Party Hat', slot: 'head', price: 45, color: '#ffb6d9' },
  { id: 'headphones', name: 'Cozy Headphones', slot: 'head', price: 70, color: '#8a7ad0' },
  { id: 'crown', name: 'Little Crown', slot: 'head', price: 120, lvl: 6, color: '#ffd66b' },
  { id: 'glasses', name: 'Round Glasses', slot: 'face', price: 50, color: '#6a58aa' },
  { id: 'heartglasses', name: 'Heart Specs', slot: 'face', price: 65, color: '#ff7fb0' },
  { id: 'shades', name: 'Cool Shades', slot: 'face', price: 75, color: '#2f2a4a' },
  { id: 'bellcollar', name: 'Bell Collar', slot: 'neck', price: 40, color: '#ff8fa8' },
  { id: 'bowtie', name: 'Bow Tie', slot: 'neck', price: 45, color: '#7a8be0' },
  { id: 'scarf', name: 'Snug Scarf', slot: 'neck', price: 55, color: '#f58f8f' },
];

// slot types: hang | wall | floor | rug
export const SLOTS = [
  { id: 'hang1', type: 'hang', label: 'Ceiling' },
  { id: 'wall1', type: 'wall', label: 'Left wall' },
  { id: 'wall2', type: 'wall', label: 'Right wall' },
  { id: 'floor1', type: 'floor', label: 'Floor (left)' },
  { id: 'floor2', type: 'floor', label: 'Floor (right)' },
  { id: 'rug1', type: 'rug', label: 'Rug' },
];

export const DECOR = [
  { id: 'fairylights', name: 'Fairy Lights', type: 'hang', price: 30 },
  { id: 'starmobile', name: 'Star Mobile', type: 'hang', price: 40 },
  { id: 'lantern', name: 'Paper Lantern', type: 'hang', price: 35 },
  { id: 'frame', name: 'Cat Portrait', type: 'wall', price: 25 },
  { id: 'moonposter', name: 'Moon Poster', type: 'wall', price: 30 },
  { id: 'clock', name: 'Tiny Clock', type: 'wall', price: 35 },
  { id: 'pennant', name: 'Pennant Flags', type: 'wall', price: 28 },
  { id: 'plant', name: 'Leafy Plant', type: 'floor', price: 30 },
  { id: 'cactus', name: 'Smiling Cactus', type: 'floor', price: 28 },
  { id: 'lamp', name: 'Star Lamp', type: 'floor', price: 50 },
  { id: 'books', name: 'Book Stack', type: 'floor', price: 25 },
  { id: 'duck', name: 'Rubber Duck', type: 'floor', price: 20 },
  { id: 'mug', name: 'Big Mug', type: 'floor', price: 22 },
  { id: 'cushions', name: 'Cushion Pile', type: 'floor', price: 45 },
  { id: 'roundrug', name: 'Pink Round Rug', type: 'rug', price: 40 },
  { id: 'stripedrug', name: 'Striped Rug', type: 'rug', price: 40 },
  { id: 'starrug', name: 'Starry Rug', type: 'rug', price: 60, lvl: 4 },
];

export const ROOMS = [
  { id: 'cozy', name: 'Moonlit Bedroom', price: 0, desc: 'Plants, a big window and a very soft light.' },
  { id: 'meadow', name: 'Sunny Meadow', price: 0, desc: 'Open grass, little hills and a cottage.' },
  { id: 'balcony', name: 'Sky Balcony', price: 150, desc: 'A sunset above the city lights.' },
  { id: 'attic', name: 'Starlit Attic', price: 200, lvl: 5, desc: 'Wooden beams and a round window of stars.' },
  { id: 'garden', name: 'Sage Garden', price: 180, desc: 'Trellis, pots and mossy stones.' },
  { id: 'cafe', name: 'Peach Cafe', price: 220, lvl: 7, desc: 'Awning stripes and a checkered floor.' },
];

export const ACHIEVEMENTS = [
  { id: 'first_bite', icon: 'food:strawberry', name: 'First Bite', desc: 'Feed your companion.', check: (s) => s.stats.fed >= 1 },
  { id: 'foodie', icon: 'food:riceball', name: 'Little Foodie', desc: 'Feed 25 times.', check: (s) => s.stats.fed >= 25, prog: (s) => [s.stats.fed, 25] },
  { id: 'gourmet', icon: 'food:goldencake', name: 'Gourmet', desc: 'Feed 100 times.', check: (s) => s.stats.fed >= 100, prog: (s) => [s.stats.fed, 100] },
  { id: 'squeaky', icon: 'bubbles', name: 'Squeaky Clean', desc: 'Give a bubble bath.', check: (s) => s.stats.cleaned >= 1 },
  { id: 'spa', icon: 'drop', name: 'Spa Day', desc: 'Clean 10 times.', check: (s) => s.stats.cleaned >= 10, prog: (s) => [s.stats.cleaned, 10] },
  { id: 'dreamer', icon: 'moon', name: 'Sweet Dreams', desc: 'Tuck your companion in.', check: (s) => s.stats.slept >= 1 },
  { id: 'cuddler', icon: 'heart', name: 'Cuddle Buddy', desc: 'Pet your companion 50 times.', check: (s) => s.stats.pets >= 50, prog: (s) => [s.stats.pets, 50] },
  { id: 'player', icon: 'gamepad', name: 'Game On', desc: 'Play a mini-game.', check: (s) => s.stats.games >= 1 },
  { id: 'gamer', icon: 'trophy', name: 'Game Night', desc: 'Play 15 mini-games.', check: (s) => s.stats.games >= 15, prog: (s) => [s.stats.games, 15] },
  { id: 'angler', icon: 'fish', name: 'Golden Catch', desc: 'Catch a Golden Fish.', check: (s) => s.stats.golden >= 1 },
  { id: 'saver', icon: 'dust', name: 'Stardust Saver', desc: 'Earn 500 stardust in total.', check: (s) => s.earned >= 500, prog: (s) => [s.earned, 500] },
  { id: 'tycoon', icon: 'star', name: 'Stardust Tycoon', desc: 'Earn 2000 stardust in total.', check: (s) => s.earned >= 2000, prog: (s) => [s.earned, 2000] },
  { id: 'lvl5', icon: 'sprout', name: 'Growing Up', desc: 'Reach level 5.', check: (s) => s.level >= 5, prog: (s) => [s.level, 5] },
  { id: 'lvl10', icon: 'tree', name: 'Best Friends', desc: 'Reach level 10.', check: (s) => s.level >= 10, prog: (s) => [s.level, 10] },
  { id: 'streak3', icon: 'calendar', name: 'Three in a Row', desc: 'Claim daily rewards 3 days in a row.', check: (s) => s.daily.best >= 3, prog: (s) => [s.daily.best, 3] },
  { id: 'streak7', icon: 'flame', name: 'Lucky Seven', desc: 'Claim daily rewards 7 days in a row.', check: (s) => s.daily.best >= 7, prog: (s) => [s.daily.best, 7] },
  { id: 'shopper', icon: 'bag', name: 'Window Shopper', desc: 'Buy 5 things in the shop.', check: (s) => s.stats.bought >= 5, prog: (s) => [s.stats.bought, 5] },
  { id: 'decorator', icon: 'plant', name: 'Nest Builder', desc: 'Place 4 decorations in a room.', check: (s) => Object.values(s.room.placed).filter(Boolean).length >= 4, prog: (s) => [Object.values(s.room.placed).filter(Boolean).length, 4] },
  { id: 'stylist', icon: 'bow', name: 'Little Stylist', desc: 'Own 4 accessories.', check: (s) => s.owned.acc.length >= 4, prog: (s) => [s.owned.acc.length, 4] },
  { id: 'roomie', icon: 'home', name: 'Home Sweet Home', desc: 'Own 3 rooms.', check: (s) => s.owned.room.length >= 3, prog: (s) => [s.owned.room.length, 3] },
  { id: 'nightowl', icon: 'owl', name: 'Night Owl', desc: 'Say hi in the small hours.', check: (s) => !!s.stats.nightOwl },
  { id: 'week', icon: 'mail', name: 'One Week Together', desc: 'Spend 7 days together.', check: (s) => Math.floor((Date.now() - s.createdAt) / 864e5) >= 7, prog: (s) => [Math.min(7, Math.floor((Date.now() - s.createdAt) / 864e5)), 7] },
];

export function defaultSettings() {
  return {
    showPet: true, alwaysOnTop: true, roam: true, clickThrough: true, petScale: 1, startHidden: false,
    intensity: 'normal', // low | normal | high
    speech: 'normal', // off | low | normal
    notifications: { enabled: true, hungry: true, sleepy: true, bored: true, dirty: true, sad: true, daily: true, cooldown: 45 },
    quiet: { enabled: true, from: '22:30', to: '07:00' },
    sleep: { auto: true, bedtime: '23:00', wake: '07:00' },
    activity: { enabled: true, awayMinutes: 5 },
    sound: { enabled: true, volume: 50 },
  };
}

export function defaultState() {
  const foods = FOODS.slice(0, 5).map((f) => f.id);
  const fav = pick(foods);
  const dis = pick(foods.filter((x) => x !== fav));
  const r = () => +rnd(0.2, 0.9).toFixed(2);
  return {
    v: 1, rev: 0, name: 'Wobble', onboarded: false, createdAt: Date.now(), lastTick: Date.now(),
    needs: { hunger: 85, happiness: 85, energy: 95, cleanliness: 90, boredom: 85, health: 95 },
    sleeping: false, sleepReason: null, sleepOverrideUntil: 0, mood: 'content',
    fx: { excitedUntil: 0, playfulUntil: 0, lastPet: 0 },
    personality: { playful: r(), sleepy: r(), greedy: r(), shy: r(), fav, dis },
    xp: 0, level: 1, stardust: 120, earned: 0,
    inventory: { food: { strawberry: 3, riceball: 2, cupcake: 1 } },
    owned: { acc: ['bow'], coat: ['lavender', 'cream'], decor: [], room: ['cozy', 'meadow'], theme: ['lavender', 'cream'] },
    equipped: { coat: 'lavender', head: null, face: null, neck: null },
    room: { id: 'cozy', placed: {} },
    theme: 'lavender', petPos: null,
    settings: defaultSettings(),
    stats: { gamesDay: { day: '', n: 0 }, fed: 0, played: 0, cleaned: 0, slept: 0, pets: 0, games: 0, gameBy: {}, best: {}, golden: 0, bought: 0, events: 0, foodTally: {}, nightOwl: false },
    achievements: {},
    notif: { last: {} },
    daily: { last: '', streak: 0, best: 0 },
  };
}

function merge(def, cur) {
  if (Array.isArray(def) || typeof def !== 'object' || def === null) return cur === undefined ? def : cur;
  const out = { ...(typeof cur === 'object' && cur ? cur : {}) };
  for (const k of Object.keys(def)) out[k] = merge(def[k], cur ? cur[k] : undefined);
  return out;
}
// Fills in any keys added in newer versions, then restores the open-ended maps untouched.
export function migrate(saved) {
  const d = defaultState();
  const out = merge(d, saved);
  out.inventory = { food: { ...(saved.inventory?.food || d.inventory.food) } };
  out.room = { id: saved.room?.id || d.room.id, placed: { ...(saved.room?.placed || {}) } };
  out.achievements = { ...(saved.achievements || {}) };
  out.stats.gameBy = { ...(saved.stats?.gameBy || {}) };
  out.stats.best = { ...(saved.stats?.best || {}) };
  out.stats.foodTally = { ...(saved.stats?.foodTally || {}) };
  out.notif = { last: { ...(saved.notif?.last || {}) } };
  out.owned = { ...d.owned, ...(saved.owned || {}) };
  return out;
}

export const byId = (list, id) => list.find((x) => x.id === id);
