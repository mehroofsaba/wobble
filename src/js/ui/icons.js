// Wobble icon + illustration library. Everything is inline SVG (no emoji, no icon font).
//  icon(name, size)      stroke icons that inherit `currentColor`
//  icon('food:<id>')     colour food illustrations     foodArt(id)
//  moodFace(mood, size)  small mood portraits
//  gameArt(id)           wide illustrated thumbnails for the mini-games
//  heart(size)           the inline heart used in speech bubbles / particles

const P = {
  home: '<path class="f" d="M4 11.5 12 4l8 7.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-5.5H9v5.5H5.5A1.5 1.5 0 0 1 4 19z"/>',
  gamepad: '<rect class="f" x="2.5" y="7" width="19" height="10.5" rx="5.2"/><path d="M8 10.2v4M6 12.2h4"/><circle cx="15.8" cy="11.2" r=".9" fill="currentColor"/><circle cx="18" cy="13.6" r=".9" fill="currentColor"/>',
  bag: '<path class="f" d="M5 8h14l-1 12H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  shirt: '<path class="f" d="M8.5 4 4 6.5l1.8 4 2.2-1V20h8V9.5l2.2 1 1.8-4L15.5 4a3.6 3.6 0 0 1-7 0z"/>',
  book: '<path class="f" d="M12 6.5C10.5 5 8 4.5 4.5 4.5V18c3.500 0 6 .5 7.500 2 1.500-1.500 4-2 7.500-2V4.500c-3.500 0-6 .5-7.500 2z"/><path d="M12 6.500V20"/>',
  gear: '<circle class="f" cx="12" cy="12" r="6.2"/><circle cx="12" cy="12" r="2.4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.800 16.800l1.700 1.700M18.500 5.500l-1.700 1.700M7.200 16.800l-1.700 1.700"/>',
  dust: '<path class="f" d="M11 3.500c.8 5 2.800 7 8 8-5.200 1-7.200 3-8 8-.8-5-2.800-7-8-8 5.200-1 7.200-3 8-8z"/><path d="M19 3v4M17 5h4"/>',
  heart: '<path class="f" d="M12 20s-7.500-4.600-7.500-10A4.300 4.300 0 0 1 12 7.300 4.300 4.300 0 0 1 19.500 10C19.500 15.400 12 20 12 20z"/>',
  paw: '<path class="f" d="M12 12.500c-3 0-5 2.400-5 4.400 0 1.600 1.300 2.400 2.800 2.100 1-.2 1.400-.5 2.200-.5s1.200.3 2.200.5c1.500.3 2.800-.5 2.800-2.100 0-2-2-4.400-5-4.400z"/><circle cx="6.200" cy="10" r="1.700"/><circle cx="9.800" cy="6.400" r="1.800"/><circle cx="14.200" cy="6.400" r="1.800"/><circle cx="17.800" cy="10" r="1.700"/>',
  bell: '<path class="f" d="M6 16v-5a6 6 0 0 1 12 0v5l1.500 2h-15z"/><path d="M10 20.500a2 2 0 0 0 4 0"/>',
  eye: '<path class="f" d="M2.500 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12z"/><circle cx="12" cy="12" r="2.800"/>',
  volume: '<path class="f" d="M4 9.500h3.500L12 6v12l-4.500-3.500H4z"/><path d="M15.500 9a4 4 0 0 1 0 6M18 6.500a7.500 7.500 0 0 1 0 11"/>',
  palette: '<path class="f" d="M12 3.500a8.500 8.500 0 1 0 0 17c1.400 0 2-1 1.500-2-.6-1.200.1-2.500 1.600-2.500H17a3.500 3.500 0 0 0 3.500-3.500C20.500 7 16.800 3.500 12 3.500z"/><circle cx="7.800" cy="11" r="1" fill="currentColor"/><circle cx="10.500" cy="7.500" r="1" fill="currentColor"/><circle cx="15" cy="7.800" r="1" fill="currentColor"/>',
  trophy: '<path class="f" d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5v1.500A3 3 0 0 0 8 10.500M16 6h3v1.500a3 3 0 0 1-3 3M12 13v4M8.500 20h7M10 17h4"/>',
  gift: '<rect class="f" x="4" y="9.500" width="16" height="10.500" rx="1.800"/><path d="M3 9.500h18V7H3zM12 7v13M12 7C10.500 3.500 7 4 7.500 6.200 7.800 7.400 10 7 12 7c2 0 4.200.4 4.500-.8C17 4 13.500 3.500 12 7z"/>',
  lock: '<rect class="f" x="5" y="10.500" width="14" height="9.500" rx="2.500"/><path d="M8.500 10.500V8a3.500 3.500 0 0 1 7 0v2.500"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  minus: '<path d="M6 12h12"/>',
  square: '<rect x="6.500" y="6.500" width="11" height="11" rx="2.200"/>',
  fork: '<path d="M6.500 3v6.500a2.500 2.500 0 0 0 5 0V3M9 3v18"/><path class="f" d="M17.500 3c-2.300 2-3 5-3 8h3v10"/>',
  smile: '<circle class="f" cx="12" cy="12" r="9"/><path d="M9 10v1M15 10v1"/><path d="M8.500 14c1 1.800 2.200 2.600 3.500 2.600s2.500-.8 3.500-2.600"/>',
  bolt: '<path class="f" d="M13 3 5.500 13.500H11L10 21l7.500-10.500H12z"/>',
  drop: '<path class="f" d="M12 3.500c3.500 4.200 6 7 6 10.500a6 6 0 0 1-12 0c0-3.500 2.500-6.300 6-10.500z"/>',
  star: '<path class="f" d="m12 3.500 2.700 5.600 6.100.8-4.500 4.200 1.100 6-5.400-3-5.400 3 1.100-6-4.500-4.200 6.100-.8z"/>',
  moon: '<path class="f" d="M20 14.500A8.500 8.500 0 0 1 9.500 4 8.500 8.500 0 1 0 20 14.500z"/>',
  sun: '<circle class="f" cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.600 5.600 7 7M17 17l1.400 1.400M18.400 5.600 17 7M7 17l-1.400 1.400"/>',
  bubbles: '<circle class="f" cx="9" cy="14" r="5"/><circle class="f" cx="17" cy="9" r="3.500"/><circle cx="15.500" cy="18.500" r="1.800"/><path d="M7 12.500a3 3 0 0 1 2-1.300"/>',
  clock: '<circle class="f" cx="12" cy="12" r="9"/><path d="M12 7v5l3.500 2"/>',
  fish: '<path class="f" d="M3 12c3-4.500 8-5.500 12-3.500l5-2.500v12l-5-2.500C11 17.500 6 16.500 3 12z"/><circle cx="8.500" cy="11" r=".8" fill="currentColor"/>',
  cards: '<rect class="f" x="3.500" y="6" width="10" height="14" rx="2" transform="rotate(-10 8.500 13)"/><rect class="f" x="10.500" y="4.500" width="10" height="14" rx="2" transform="rotate(8 15.500 11.500)"/>',
  flag: '<path d="M6 21V4"/><path class="f" d="M6 5h11l-2.500 3.500L17 12H6"/>',
  comet: '<path d="M3.500 20.500 12 12M6.500 20.500 13 14M3.500 17.500 10 11"/><path class="f" d="m16 4 1.300 2.700 3 .4-2.200 2.100.5 3-2.600-1.400-2.600 1.400.5-3-2.200-2.100 3-.4z"/>',
  chevL: '<path d="m14.500 6-6 6 6 6"/>',
  chevD: '<path d="m6 9.500 6 6 6-6"/>',
  sprout: '<path d="M12 20v-8M12 12c0-4 3-6 7-6 0 4-2.500 6-7 6zM12 14.500c0-3-2.200-4.500-5.500-4.500 0 3 1.800 4.500 5.500 4.500z"/>',
  tree: '<circle class="f" cx="12" cy="9" r="6"/><path d="M12 15v6M12 18.500l3-2.500"/>',
  flame: '<path class="f" d="M12 3c1 3.500 5.500 5.500 5.500 10.500a5.500 5.500 0 0 1-11 0c0-2 1-3.500 2.200-4.500.2 1.500 1 2.300 1.800 2.500C10 8.500 10.500 5.500 12 3z"/>',
  calendar: '<rect class="f" x="4" y="5.500" width="16" height="14.500" rx="2.500"/><path d="M4 10h16M8.500 3.500v4M15.500 3.500v4"/>',
  mail: '<rect class="f" x="3.500" y="6" width="17" height="12.500" rx="2.500"/><path d="m4 7.500 8 6 8-6"/>',
  bow: '<path class="f" d="M12 12 5 7.500v9zM12 12l7-4.500v9z"/><circle cx="12" cy="12" r="1.800"/>',
  plant: '<path class="f" d="m7.500 21-1-6h11l-1 6z"/><path d="M12 15V8M12 11.500c-3 0-5-2-5-5 3 0 5 2 5 5zM12 9.500c0-3 2-5 5-5 0 3-2 5-5 5z"/>',
  owl: '<path class="f" d="M6 20V10a6 6 0 0 1 12 0v10z"/><circle cx="9.500" cy="10.500" r="1.800"/><circle cx="14.500" cy="10.500" r="1.800"/><path d="m12 12.500-1 1.500h2zM6.500 6 5 4M17.500 6 19 4"/>',
  check: '<path d="m5 12.500 5 5L19 7"/>',
  db: '<ellipse class="f" cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.700 3.100 3 7 3s7-1.300 7-3V6M5 12c0 1.700 3.100 3 7 3s7-1.300 7-3"/>',
  shield: '<path class="f" d="M12 3 5 6v5.500c0 4.500 3 7.800 7 9.500 4-1.700 7-5 7-9.500V6z"/><path d="m9 12 2.200 2.200L15.500 10"/>',
  cat: '<path class="f" d="M5 9 5.500 3.500 10 6.500a8 8 0 0 1 4 0l4.500-3L19 9a7.500 7.500 0 0 1 1 3.500c0 4-3.500 7-8 7s-8-3-8-7A7.500 7.500 0 0 1 5 9z"/><path d="M9 12.500v.5M15 12.500v.5M10.500 15.500c.5.600 1 .8 1.500.8s1-.2 1.500-.8"/>',
  pin: '<path class="f" d="M12 21s6-5.500 6-10.500a6 6 0 0 0-12 0C6 15.500 12 21 12 21z"/><circle cx="12" cy="10.500" r="2"/>',
  layers: '<path class="f" d="m12 4 9 5-9 5-9-5z"/><path d="m3 14 9 5 9-5"/>',
  play: '<path class="f" d="M8 5.500v13l11-6.500z"/>',
  refresh: '<path d="M19 12a7 7 0 1 1-2.100-5M19 4.500V8h-3.500"/>',
  sleepz: '<path d="M5 6h5L5 12h5M13 13h4l-4 5h4"/>',
};

export function icon(name, size = 20, cls = '') {
  if (name && name.startsWith('food:')) return foodArt(name.slice(5), size);
  const body = P[name] || P.paw;
  return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
}

export const heart = (size = 16) => `<svg class="ic-heart" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.500s-8-4.800-8-10.700C4 6.700 6.200 5 8.500 5c1.500 0 2.700.8 3.500 2 .8-1.200 2-2 3.500-2C17.800 5 20 6.700 20 9.800c0 5.900-8 10.700-8 10.700z" fill="#f48fb8"/><path d="M8 8.300c-1 .3-1.600 1.200-1.600 2.300" stroke="#fff" stroke-opacity=".7" stroke-width="1.600" stroke-linecap="round" fill="none"/></svg>`;

const sp = (x, y, r, c = '#fff') => `<path transform="translate(${x} ${y}) scale(${r / 10})" d="M0-10C1 -4 4 -1 10 0 4 1 1 4 0 10-1 4-4 1-10 0-4-1-1-4 0-10z" fill="${c}"/>`;
export const sparkle = (size = 18, c = '#f6b8dc') => `<svg width="${size}" height="${size}" viewBox="-12 -12 24 24" aria-hidden="true">${sp(0, 0, 11, c)}</svg>`;
export const dot = (size = 10, c = '#ffd6ea') => `<svg width="${size}" height="${size}" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="4" fill="${c}"/></svg>`;
export const starSolid = (size = 18, c = '#ffd24d') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.500 2.900 6 6.600.9-4.800 4.600 1.200 6.500-5.900-3.200-5.900 3.200 1.200-6.500L2.500 9.400l6.600-.9z" fill="${c}" stroke="#e8a93a" stroke-width="1.400" stroke-linejoin="round"/></svg>`;

// ------------------------------------------------------------------- food art
const FOOD = {
  strawberry: '<path d="M32 58C16 50 8 36 10 26c2-9 10-11 22-8 12-3 20-1 22 8 2 10-6 24-22 32z" fill="#f2547d"/><path d="M32 58C16 50 8 36 10 26c1-4 4-7 8-8-3 8 0 24 14 40z" fill="#ff86a6" opacity=".55"/><path d="M18 19c4-7 9-7 14-3 5-4 10-4 14 3-4 3-9 3-14 1-5 2-10 2-14-1z" fill="#5cc27a"/><path d="M32 17c0-5 1-8 4-10" stroke="#3f9c5e" stroke-width="3.200" stroke-linecap="round" fill="none"/><g fill="#ffe9a8"><ellipse cx="22" cy="30" rx="1.800" ry="2.600"/><ellipse cx="32" cy="27" rx="1.800" ry="2.600"/><ellipse cx="42" cy="30" rx="1.800" ry="2.600"/><ellipse cx="26" cy="40" rx="1.800" ry="2.600"/><ellipse cx="38" cy="40" rx="1.800" ry="2.600"/><ellipse cx="32" cy="48" rx="1.800" ry="2.600"/></g>',
  riceball: '<path d="M32 7c6 0 10 5 16 21 4 11 4 23-4 26-8 3-24 3-32 0-8-3-8-15-4-26C14 12 26 7 32 7z" fill="#fff" stroke="#dcd3f0" stroke-width="2"/><path d="M17 42h30l-2.500 11c-7 2.500-18 2.500-25 0z" fill="#3f3b63"/><path d="M21 44h22" stroke="#5a5688" stroke-width="2" stroke-linecap="round"/><circle cx="32" cy="27" r="4.600" fill="#f48aa8"/><circle cx="30.500" cy="25.600" r="1.300" fill="#fff" opacity=".7"/>',
  fishsnack: '<path d="M5 32c8-15 23-19 37-8l15-9v34l-15-9C28 51 13 47 5 32z" fill="#f6b86c"/><path d="M44 25 57 15v34L44 39z" fill="#e8964a" opacity=".65"/><circle cx="19" cy="28" r="3.200" fill="#3b2a5c"/><circle cx="20" cy="27" r="1" fill="#fff"/><path d="M28 23c3.500 6 3.500 12 0 18M34 22c3 6 3 14 0 20" stroke="#e8964a" stroke-width="2.500" fill="none" stroke-linecap="round"/>',
  cupcake: '<path d="M13 34h38l-4 22H17z" fill="#ff9fc2"/><path d="M21 34l3 22M30 34l1 22M40 34l-1 22M47 34l-3 22" stroke="#ff7fae" stroke-width="2"/><path d="M10 34c0-8 7-9 11-11 0-8 6-12 11-12s11 4 11 12c4 2 11 3 11 11z" fill="#fff1f7" stroke="#ffd0e2" stroke-width="2"/><path d="M20 28c6 3 18 3 24 0" stroke="#ffd0e2" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="33" cy="9" r="5" fill="#e8456b"/><path d="M33 5c1-3 3-4 5-4" stroke="#4aa86a" stroke-width="2" fill="none" stroke-linecap="round"/><g fill="#8fd0ff"><rect x="22" y="22" width="4" height="2" rx="1" transform="rotate(30 24 23)"/><rect x="38" y="20" width="4" height="2" rx="1" transform="rotate(-30 40 21)"/></g><rect x="30" y="26" width="4" height="2" rx="1" fill="#ffd24d"/>',
  milk: '<path d="M16 10h32l-4.500 46H20.500z" fill="#eaf6ff" stroke="#bcd9f2" stroke-width="2.500" stroke-linejoin="round"/><path d="M18.500 26h27l-3 30H21.500z" fill="#fff"/><path d="M23 30l1.500 20" stroke="#dcecfa" stroke-width="3" stroke-linecap="round"/><path d="M18.500 26c4 3 8-3 13 0s9-3 14 0" stroke="#dcecfa" stroke-width="2" fill="none"/>',
  soup: '<path d="M6 30h52c0 15-10 26-26 26S6 45 6 30z" fill="#f4a6c4"/><path d="M12 48c4 5 10 8 20 8 6 0 11-2 14-5" stroke="#e885a9" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="32" cy="30" rx="26" ry="7" fill="#ffc86a"/><circle cx="22" cy="29" r="3.500" fill="#78cf8e"/><circle cx="34" cy="31" r="3" fill="#f58a6a"/><circle cx="43" cy="28" r="3.200" fill="#78cf8e"/><path d="M22 22c-3-4 3-6 0-10M32 21c-3-4 3-6 0-11M42 22c-3-4 3-6 0-10" stroke="#cdbdf0" stroke-width="2.500" fill="none" stroke-linecap="round"/>',
  goldencake: '<path d="M7 28h50v25a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5z" fill="#ffe3a8"/><path d="M7 40h50" stroke="#f6b8d4" stroke-width="5"/><path d="M7 28h50v9c-4 3-6-1-10 2s-6-1-10 2-6-1-10 2-6-1-10 2-6-1-10-2z" fill="#ffd24d"/><path d="M32 11c-2-4-8-3-7 1 1 4 7 8 7 8s6-4 7-8c1-4-5-5-7-1z" fill="#f2547d"/><path d="M50 10l1.800 4.200 4.200 1.800-4.200 1.800L50 22l-1.800-4.200-4.200-1.800 4.200-1.800z" fill="#ffd24d"/><path d="M14 8l1.200 2.800L18 12l-2.800 1.200L14 16l-1.200-2.800L10 12l2.800-1.200z" fill="#ffd24d"/>',
  yarn: '<circle cx="32" cy="32" r="22" fill="#ff9fc2"/><path d="M14 26c10 6 26 6 36 0M12 36c12 7 28 7 40 0M20 14c4 12 4 24 0 36M34 10c6 14 6 30 0 44M46 16c-3 11-3 21 0 32" stroke="#ff7fae" stroke-width="2.400" fill="none" stroke-linecap="round"/><path d="M50 44c8 2 10 8 4 11" stroke="#ff9fc2" stroke-width="3" fill="none" stroke-linecap="round"/>',
};
export function foodArt(id, size = 44) {
  return `<svg class="food-art" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">${FOOD[id] || FOOD.strawberry}</svg>`;
}

// ----------------------------------------------------------------- mood faces
const FACE_BG = { happy: '#ffe58f', excited: '#ffd1a0', sleepy: '#cfd6ff', hungry: '#ffd0c0', bored: '#e2dcf0', sad: '#cde4ff', playful: '#ffc9e0', content: '#e6f2c8' };
const INKC = '#4a3470';
const FACES = {
  happy: `<path d="M12 18q3-5 6 0M22 18q3-5 6 0" stroke="${INKC}" stroke-width="2.200" fill="none" stroke-linecap="round"/><path d="M13 24q7 7 14 0" stroke="${INKC}" stroke-width="2.200" fill="none" stroke-linecap="round"/>`,
  excited: `<circle cx="15" cy="18" r="3" fill="${INKC}"/><circle cx="25" cy="18" r="3" fill="${INKC}"/><path d="M13 23h14q-1 8-7 8t-7-8z" fill="${INKC}"/><path d="M16 28q4 2 8 0" stroke="#ff8fb0" stroke-width="2.200" fill="none"/>`,
  sleepy: `<path d="M12 19h6M22 19h6" stroke="${INKC}" stroke-width="2.200" stroke-linecap="round"/><path d="M17 26q3 2 6 0" stroke="${INKC}" stroke-width="2.200" fill="none" stroke-linecap="round"/><path d="M29 8h5l-5 5h5" stroke="${INKC}" stroke-width="1.800" fill="none" stroke-linecap="round"/>`,
  hungry: `<circle cx="14.500" cy="18" r="2.400" fill="${INKC}"/><circle cx="25.500" cy="18" r="2.400" fill="${INKC}"/><ellipse cx="20" cy="27" rx="3" ry="3.600" fill="${INKC}"/><path d="M11 13l6 1.500M29 13l-6 1.500" stroke="${INKC}" stroke-width="1.800" stroke-linecap="round"/>`,
  bored: `<path d="M11 18h7M22 18h7" stroke="${INKC}" stroke-width="2.200" stroke-linecap="round"/><path d="M15 26h10" stroke="${INKC}" stroke-width="2.200" stroke-linecap="round"/>`,
  sad: `<circle cx="14.500" cy="18" r="2.400" fill="${INKC}"/><circle cx="25.500" cy="18" r="2.400" fill="${INKC}"/><path d="M14 28q6-6 12 0" stroke="${INKC}" stroke-width="2.200" fill="none" stroke-linecap="round"/><path d="M12 23q-2 3 0 5 2-2 0-5z" fill="#7fc0f5"/>`,
  playful: `<circle cx="14.500" cy="18" r="2.600" fill="${INKC}"/><path d="M22 18q3-4 6 0" stroke="${INKC}" stroke-width="2.200" fill="none" stroke-linecap="round"/><path d="M13 23q7 6 14 0z" fill="${INKC}"/><path d="M18 27q2 4 5 0" fill="#ff7fa8"/>`,
  content: `<circle cx="14.500" cy="18" r="2.400" fill="${INKC}"/><circle cx="25.500" cy="18" r="2.400" fill="${INKC}"/><path d="M15 25q5 4 10 0" stroke="${INKC}" stroke-width="2.200" fill="none" stroke-linecap="round"/>`,
};
export function moodFace(m, size = 24) {
  const k = FACES[m] ? m : 'content';
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="${FACE_BG[k]}"/><circle cx="12" cy="24" r="3" fill="#ff9fb8" opacity=".45"/><circle cx="28" cy="24" r="3" fill="#ff9fb8" opacity=".45"/>${FACES[k]}</svg>`;
}

// --------------------------------------------------------------- game artwork
const GAME_ART = {
  fishing: `<defs><linearGradient id="ga1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0ff"/><stop offset="1" stop-color="#e6f7ff"/></linearGradient><linearGradient id="ga2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fc4f0"/><stop offset="1" stop-color="#3b7fd0"/></linearGradient></defs><rect width="320" height="180" fill="url(#ga1)"/><ellipse cx="70" cy="34" rx="34" ry="11" fill="#fff"/><ellipse cx="96" cy="26" rx="22" ry="12" fill="#fff"/><ellipse cx="250" cy="48" rx="30" ry="10" fill="#fff"/><path d="M0 100c60-40 120-6 180-20s100-14 140 6v14H0z" fill="#9fdca0"/><rect y="98" width="320" height="82" fill="url(#ga2)"/><path d="M20 118q10-5 20 0t20 0M200 130q10-5 20 0t20 0" stroke="#fff" stroke-opacity=".5" stroke-width="2.500" fill="none" stroke-linecap="round"/><rect x="0" y="88" width="96" height="12" fill="#b98558"/><rect x="14" y="100" width="9" height="40" fill="#8a5c3a"/><rect x="70" y="100" width="9" height="40" fill="#8a5c3a"/><path d="M60 82 104 40" stroke="#8a5c3a" stroke-width="3.500" stroke-linecap="round"/><path d="M104 40 214 116" stroke="#fff" stroke-opacity=".9" stroke-width="1.400" fill="none"/><path d="M200 130c12-18 32-20 48-10l16-9v38l-16-9c-16 10-36 8-48-10z" fill="#ffc93c"/><circle cx="214" cy="125" r="3" fill="#3b2a5c"/><path d="M262 112l16-9v38l-16-9z" fill="#f0a82a" opacity=".7"/>${sp(250, 100, 8, '#fff6b8')}`,
  memory: `<defs><linearGradient id="gb1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d8c8ff"/><stop offset="1" stop-color="#ffd0e6"/></linearGradient><linearGradient id="gb2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7b5fd6"/><stop offset="1" stop-color="#f0a3cf"/></linearGradient></defs><rect width="320" height="180" fill="url(#gb1)"/><g transform="rotate(-9 90 96)"><rect x="52" y="40" width="76" height="108" rx="14" fill="url(#gb2)" stroke="#fff" stroke-width="4"/><path d="M90 108s-20-12-20-26a10 10 0 0 1 20-3 10 10 0 0 1 20 3c0 14-20 26-20 26z" fill="#fff" fill-opacity=".92"/></g><g transform="rotate(7 230 96)"><rect x="192" y="40" width="76" height="108" rx="14" fill="url(#gb2)" stroke="#fff" stroke-width="4"/><path d="M230 108s-20-12-20-26a10 10 0 0 1 20-3 10 10 0 0 1 20 3c0 14-20 26-20 26z" fill="#fff" fill-opacity=".92"/></g><g transform="translate(0 -6)"><rect x="122" y="34" width="76" height="108" rx="14" fill="#fff8ff" stroke="#fff" stroke-width="4"/><path d="m160 62 9 19 21 3-15 15 4 21-19-10-19 10 4-21-15-15 21-3z" fill="#ffd24d" stroke="#e8a93a" stroke-width="3" stroke-linejoin="round"/></g>${sp(40, 30, 9)}${sp(288, 40, 11)}${sp(280, 150, 7)}`,
  hop: `<defs><linearGradient id="gc1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd6ff"/><stop offset="1" stop-color="#ecf9ff"/></linearGradient></defs><rect width="320" height="180" fill="url(#gc1)"/><ellipse cx="80" cy="38" rx="32" ry="10" fill="#fff"/><ellipse cx="104" cy="30" rx="20" ry="11" fill="#fff"/><ellipse cx="240" cy="56" rx="30" ry="9" fill="#fff"/><path d="M0 120c50-50 90-20 140-34s110-8 180 20v40H0z" fill="#b7e8b0"/><rect y="132" width="320" height="48" fill="#7fd08a"/><path d="M0 134h320" stroke="#6ab878" stroke-width="5" stroke-dasharray="14 12"/><ellipse cx="108" cy="124" rx="20" ry="16" fill="#4fae68"/><ellipse cx="100" cy="118" rx="9" ry="8" fill="#62c47c"/><rect x="248" y="52" width="6" height="82" fill="#8a5c3a"/><path d="M254 52 296 66 254 82z" fill="#ff7fb0"/><path d="m170 62 5 10.500 11.500 1.600-8.400 8 2 11.400-10.100-5.400-10.100 5.400 2-11.400-8.400-8L165 72.500z" fill="#ffd24d" stroke="#e8a93a" stroke-width="2.500" stroke-linejoin="round"/>${sp(60, 80, 8, '#fff')}`,
  stars: `<defs><linearGradient id="gd1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1650"/><stop offset="1" stop-color="#6a47a8"/></linearGradient></defs><rect width="320" height="180" fill="url(#gd1)"/><circle cx="262" cy="46" r="24" fill="#fff6c8"/><circle cx="272" cy="40" r="22" fill="#2b2166"/>${[[40, 30, 6], [90, 70, 5], [150, 24, 7], [210, 90, 5], [30, 110, 5], [300, 120, 6]].map(([x, y, r]) => sp(x, y, r, '#fff6c8')).join('')}<path d="m120 56 8 17 19 2.500-14 13 3.500 18.500-16.500-9-16.500 9 3.500-18.500-14-13 19-2.500z" fill="#ffd24d" stroke="#e8a93a" stroke-width="3" stroke-linejoin="round"/><path d="m210 108 5 10 11 1.600-8 7.600 2 11-10-5.300-10 5.300 2-11-8-7.600 11-1.600z" fill="#fff0a0" stroke="#e8a93a" stroke-width="2.500" stroke-linejoin="round"/><circle cx="60" cy="150" r="14" fill="#8b86a8"/><circle cx="55" cy="146" r="3.500" fill="#6f6a90"/><path d="M72 124 66 138" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/><ellipse cx="160" cy="168" rx="70" ry="16" fill="#fff" opacity=".92"/><ellipse cx="124" cy="164" rx="32" ry="14" fill="#fff" opacity=".92"/><ellipse cx="196" cy="160" rx="34" ry="14" fill="#fff" opacity=".92"/>`,
};
export const gameArt = (id) => `<svg class="game-art" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${GAME_ART[id] || ''}</svg>`;
