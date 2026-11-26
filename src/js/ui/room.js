// Room scenes + decorations as SVG. Scene is 800x450, floor line at y=330.
// Decor items are placed into named slots (see SLOTS in data.js).
import { DECOR, byId } from '../core/data.js';

let uid = 0;

export const SLOT_POS = {
  hang1: [400, 0], wall1: [150, 168], wall2: [650, 168], floor1: [128, 396], floor2: [694, 396], rug1: [400, 408],
};

const planks = (y0, c) => Array.from({ length: 6 }, (_, i) => `<path d="M0 ${y0 + 18 + i * 20} H800" stroke="${c}" stroke-width="2" opacity=".35"/>`).join('');

const ROOM_DRAW = {
  cozy(k) {
    const books = [['#e8a0c0', 18], ['#8a7ad0', 14], ['#f2cf8c', 20], ['#7fc4b0', 16], ['#d98ab0', 12], ['#a995e8', 18]];
    let bx = 52; const bookRects = books.map(([c, w]) => { const r = `<rect x="${bx}" y="${150 - (w + 36)}" width="${w}" height="${w + 36}" rx="2" fill="${c}"/>`; bx += w + 3; return r; }).join('');
    return `<defs><linearGradient id="w${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f58be"/><stop offset="1" stop-color="#c79be0"/></linearGradient>
      <linearGradient id="n${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241b5e"/><stop offset="1" stop-color="#6a47a8"/></linearGradient>
      <linearGradient id="f${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b5815a"/><stop offset="1" stop-color="#8a5c42"/></linearGradient></defs>
      <rect width="800" height="330" fill="url(#w${k})"/>
      <g opacity=".14" stroke="#fff" stroke-width="3"><path d="M100 0V330M210 0V330M590 0V330M700 0V330"/></g>
      <rect y="330" width="800" height="120" fill="url(#f${k})"/>${planks(330, '#5a3a2a')}
      <rect y="322" width="800" height="12" fill="#e7cfa8" opacity=".9"/>
      <g><rect x="276" y="52" width="248" height="214" rx="16" fill="#efd3aa"/><rect x="290" y="66" width="220" height="186" rx="8" fill="url(#n${k})"/>
        <circle cx="440" cy="118" r="26" fill="#ffe9a8"/><circle cx="452" cy="110" r="23" fill="#2c2266" opacity=".9"/>
        ${[[320, 100], [356, 150], [480, 168], [330, 200], [500, 96], [400, 84]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0 -5 L1.6 -1.6 L5 0 L1.6 1.6 L0 5 L-1.6 1.6 L-5 0 L-1.6 -1.6Z" fill="#fff6c8"/>`).join('')}
        <path d="M290 252 Q330 214 370 252Z M420 252 Q470 200 510 252Z" fill="#1d1648" opacity=".85"/>
        <path d="M400 66V252M290 160H510" stroke="#efd3aa" stroke-width="8"/><rect x="266" y="262" width="268" height="14" rx="7" fill="#e3bf8e"/></g>
      <g><rect x="40" y="96" width="170" height="234" rx="6" fill="#7a4e3a"/><rect x="48" y="104" width="154" height="218" rx="3" fill="#5f3b2c"/>
        <rect x="48" y="150" width="154" height="8" fill="#7a4e3a"/><rect x="48" y="232" width="154" height="8" fill="#7a4e3a"/>${bookRects}
        <g transform="translate(0 82)">${(() => { let x = 56; return [['#8a7ad0', 22], ['#e8a0c0', 18], ['#7fc4b0', 24], ['#f2cf8c', 16]].map(([c, w]) => { const r = `<rect x="${x}" y="${150 - (w + 34)}" width="${w}" height="${w + 34}" rx="2" fill="${c}"/>`; x += w + 4; return r; }).join(''); })()}</g></g>
      <g><path d="M600 330 L612 280 H690 L702 330Z" fill="#e8c9a0"/><g fill="#6fc08a">${[[-30, 0], [0, -26], [30, 0], [-18, -14], [18, -14]].map(([dx, dy]) => `<ellipse cx="${651 + dx}" cy="${258 + dy}" rx="16" ry="30" transform="rotate(${dx * 1.4} ${651 + dx} ${258 + dy})"/>`).join('')}</g></g>`;
  },
  meadow(k) {
    return `<defs><linearGradient id="s${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0ff"/><stop offset="1" stop-color="#e9f8ff"/></linearGradient>
      <linearGradient id="g${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86d68f"/><stop offset="1" stop-color="#58b36a"/></linearGradient></defs>
      <rect width="800" height="450" fill="url(#s${k})"/>
      <g fill="#fff" opacity=".95"><ellipse cx="150" cy="80" rx="64" ry="22"/><ellipse cx="190" cy="66" rx="40" ry="20"/><ellipse cx="560" cy="110" rx="76" ry="24"/><ellipse cx="610" cy="94" rx="44" ry="22"/></g>
      <circle cx="690" cy="60" r="34" fill="#fff2b0"/>
      <path d="M0 300 Q140 220 300 290 T600 270 T800 300 V450 H0Z" fill="#a8e2a0"/>
      <g><rect x="560" y="212" width="104" height="80" fill="#fff3e0" stroke="#d9b894" stroke-width="3"/><path d="M548 214 L612 164 L676 214Z" fill="#f08f8a"/><rect x="596" y="240" width="30" height="52" rx="4" fill="#b97a5a"/><rect x="574" y="230" width="20" height="20" rx="3" fill="#a8dcf5"/></g>
      <g><rect x="118" y="196" width="12" height="90" fill="#9a6a48"/><circle cx="124" cy="176" r="52" fill="#6cc27c"/><circle cx="96" cy="200" r="32" fill="#7ad08a"/><circle cx="152" cy="200" r="32" fill="#7ad08a"/></g>
      <rect y="320" width="800" height="130" fill="url(#g${k})"/>
      ${Array.from({ length: 26 }, (_, i) => { const x = (i * 97) % 790 + 6; const y = 340 + ((i * 53) % 96); const c = ['#fff', '#ffd1e8', '#ffe98a', '#d6c4ff'][i % 4]; return `<g transform="translate(${x} ${y})"><circle r="4" fill="${c}"/><circle r="1.6" fill="#f7b731"/></g>`; }).join('')}`;
  },
  balcony(k) {
    const bl = [[40, 120, 60], [110, 80, 80], [196, 150, 54], [260, 100, 70], [340, 60, 90], [440, 130, 60], [510, 90, 76], [596, 160, 56], [662, 110, 70], [740, 140, 60]];
    return `<defs><linearGradient id="s${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8f7ae0"/><stop offset=".55" stop-color="#f0a3cf"/><stop offset="1" stop-color="#ffd4b0"/></linearGradient></defs>
      <rect width="800" height="450" fill="url(#s${k})"/><circle cx="560" cy="250" r="64" fill="#ffe3b8" opacity=".9"/>
      <g fill="#fff" opacity=".7"><ellipse cx="130" cy="90" rx="70" ry="16"/><ellipse cx="640" cy="64" rx="90" ry="18"/></g>
      ${bl.map(([x, h, w], i) => `<rect x="${x}" y="${330 - h - 20}" width="${w}" height="${h + 20}" fill="#5a4390" opacity="${i % 2 ? .85 : .7}"/>${Array.from({ length: Math.floor(h / 24) }, (_, j) => `<rect x="${x + 10 + (j % 2) * 24}" y="${330 - h + j * 22}" width="8" height="10" fill="#ffe9a8" opacity=".85"/>`).join('')}`).join('')}
      <rect y="330" width="800" height="120" fill="#cfa6c0"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 100} 330 L${i * 100 - 60} 450" stroke="#b58aa9" stroke-width="3"/>`).join('')}
      <rect y="300" width="800" height="14" rx="7" fill="#f6e3ef"/>${Array.from({ length: 17 }, (_, i) => `<rect x="${i * 50 + 12}" y="312" width="10" height="20" fill="#f6e3ef"/>`).join('')}`;
  },
  attic(k) {
    return `<defs><linearGradient id="w${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f1850"/><stop offset="1" stop-color="#40318a"/></linearGradient></defs>
      <rect width="800" height="450" fill="url(#w${k})"/>
      <g stroke="#6a4a3a" stroke-width="16" stroke-linecap="round"><path d="M0 120 L400 0 L800 120"/><path d="M200 60 V330 M600 60 V330"/></g>
      <g opacity=".8" stroke="#bfb2ff" stroke-width="1.5">${[[70, 150, 130, 200], [130, 200, 190, 160], [190, 160, 250, 220], [560, 140, 620, 180], [620, 180, 700, 140], [700, 140, 740, 210]].map(([a, b, c, d]) => `<path d="M${a} ${b} L${c} ${d}"/><circle cx="${a}" cy="${b}" r="3.5" fill="#fff6c8"/>`).join('')}</g>
      <circle cx="400" cy="170" r="92" fill="#6a4a3a"/><circle cx="400" cy="170" r="80" fill="#17123f"/>
      ${[[360, 130], [430, 120], [410, 200], [350, 190], [450, 170]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0 -6 L2 -2 L6 0 L2 2 L0 6 L-2 2 L-6 0 L-2 -2Z" fill="#fff6c8"/>`).join('')}
      <path d="M320 170H480M400 90V250" stroke="#6a4a3a" stroke-width="6"/>
      <rect y="330" width="800" height="120" fill="#5b4152"/>${planks(330, '#2d1f2c')}<rect y="324" width="800" height="10" fill="#7a5a6a"/>`;
  },
  garden(k) {
    return `<defs><linearGradient id="w${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3c4"/><stop offset="1" stop-color="#e6f5df"/></linearGradient></defs>
      <rect width="800" height="450" fill="url(#w${k})"/>
      <g stroke="#9ec9a6" stroke-width="5">${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 100 - 20} 40 L${i * 100 + 120} 330 M${i * 100 + 120} 40 L${i * 100 - 20} 330"/>`).join('')}</g>
      <g fill="#6fb985">${Array.from({ length: 22 }, (_, i) => `<ellipse cx="${(i * 79) % 780 + 10}" cy="${60 + (i * 47) % 250}" rx="11" ry="6" transform="rotate(${i * 37} ${(i * 79) % 780 + 10} ${60 + (i * 47) % 250})"/>`).join('')}</g>
      <g fill="#ffb3cf">${Array.from({ length: 12 }, (_, i) => `<circle cx="${(i * 131) % 780 + 14}" cy="${80 + (i * 71) % 220}" r="6"/>`).join('')}</g>
      <rect y="330" width="800" height="120" fill="#b9c9b0"/>
      ${Array.from({ length: 14 }, (_, i) => `<ellipse cx="${(i * 61) % 800 + 20}" cy="${350 + ((i * 37) % 80)}" rx="${30 + i % 3 * 8}" ry="12" fill="${i % 2 ? '#cbd9c2' : '#a9bba0'}"/>`).join('')}
      <rect y="322" width="800" height="12" fill="#8fae8b"/>`;
  },
  cafe(k) {
    const stripes = Array.from({ length: 16 }, (_, i) => `<path d="M${i * 50} 0 h50 v70 q-25 22 -50 0z" fill="${i % 2 ? '#fff6ee' : '#ff9f8a'}"/>`).join('');
    return `<defs><linearGradient id="w${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd2b8"/><stop offset="1" stop-color="#ffe8d8"/></linearGradient>
      <pattern id="c${k}" width="80" height="40" patternUnits="userSpaceOnUse"><rect width="80" height="40" fill="#fff3e8"/><rect width="40" height="20" fill="#ffc7a6"/><rect x="40" y="20" width="40" height="20" fill="#ffc7a6"/></pattern></defs>
      <rect width="800" height="330" fill="url(#w${k})"/>${stripes}
      <rect x="40" y="150" width="190" height="10" rx="5" fill="#c98f6a"/><rect x="570" y="150" width="190" height="10" rx="5" fill="#c98f6a"/>
      ${[[70, 'M0 0h24v22q-12 8 -24 0z', '#fff'], [120, 'M0 0h24v22q-12 8 -24 0z', '#ffb3cf'], [600, 'M0 0h24v22q-12 8 -24 0z', '#cfe6ff'], [660, 'M0 0h24v22q-12 8 -24 0z', '#fff']].map(([x, d, c]) => `<path transform="translate(${x} 126)" d="${d}" fill="${c}" stroke="#c98f6a" stroke-width="2"/>`).join('')}
      <rect x="300" y="110" width="200" height="130" rx="10" fill="#6a4a3a"/><rect x="312" y="122" width="176" height="106" rx="6" fill="#3d2c26"/>
      <text x="400" y="168" text-anchor="middle" font-family="Gaegu, cursive" font-size="34" font-weight="700" fill="#ffe9d6">cafe</text><text x="400" y="204" text-anchor="middle" font-family="Gaegu, cursive" font-size="22" fill="#ffc7a6">fresh &amp; cozy</text>
      <rect y="330" width="800" height="120" fill="url(#c${k})"/><rect y="324" width="800" height="10" fill="#c98f6a"/>`;
  },
};

export const ROOM_BG = (id) => `<svg class="room-svg" viewBox="0 0 800 450" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${(ROOM_DRAW[id] || ROOM_DRAW.cozy)(++uid)}</svg>`;

// ------------------------------------------------------------------- decor
export function decorSvg(id) {
  switch (id) {
    case 'fairylights': {
      const y = (x) => 8 + 26 * Math.pow(Math.sin(Math.PI * (x + 330) / 220), 2);
      let d = `M-330 ${y(-330).toFixed(1)}`; for (let x = -320; x <= 330; x += 10) d += ` L${x} ${y(x).toFixed(1)}`;
      const cols = ['#ffe27a', '#ff9fc8', '#9fe0ff', '#b9f0b0', '#d3b8ff'];
      const bulbs = Array.from({ length: 13 }, (_, i) => { const x = -330 + 55 * i; return `<g transform="translate(${x} ${y(x) + 8})"><circle r="8" fill="${cols[i % 5]}" opacity=".35"/><circle r="4.6" fill="${cols[i % 5]}"/></g>`; }).join('');
      return `<path d="${d}" fill="none" stroke="#6a4a8a" stroke-width="2"/>${bulbs}`;
    }
    case 'starmobile': return `<path d="M0 0V34M-46 34H46" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>${[[-46, 40, 16], [0, 56, 20], [46, 40, 14]].map(([x, l, s]) => `<path d="M${x} 34V${34 + l}" stroke="#fff" stroke-width="1.6"/><path transform="translate(${x} ${34 + l + s * .6}) scale(${s / 12})" d="M0 -13 L3.8 -4 L13 -3.5 L6 3 L8 12.5 L0 7.5 L-8 12.5 L-6 3 L-13 -3.5 L-3.8 -4Z" fill="#ffd24d" stroke="#e8a93a" stroke-width="2"/>`).join('')}`;
    case 'lantern': return `<path d="M0 0V26" stroke="#fff" stroke-width="2"/><ellipse cx="0" cy="58" rx="28" ry="34" fill="#ff9f9f" stroke="#d96a6a" stroke-width="3"/><path d="M-14 28Q-20 58 -14 88M14 28Q20 58 14 88M0 24V92" fill="none" stroke="#d96a6a" stroke-width="2"/><rect x="-12" y="22" width="24" height="8" rx="3" fill="#8a5a3a"/><rect x="-12" y="86" width="24" height="8" rx="3" fill="#8a5a3a"/><path d="M0 94 V116" stroke="#ffe27a" stroke-width="3"/>`;
    case 'frame': return `<rect x="-38" y="-48" width="76" height="96" rx="6" fill="#d9a066" stroke="#a8743c" stroke-width="3"/><rect x="-29" y="-39" width="58" height="78" rx="3" fill="#ffe9f2"/><ellipse cx="0" cy="6" rx="18" ry="16" fill="#fff" stroke="#6c55b8" stroke-width="2"/><path d="M-16 -4 L-14 -22 L-4 -10M16 -4 L14 -22 L4 -10" fill="#fff" stroke="#6c55b8" stroke-width="2" stroke-linejoin="round"/><circle cx="-6" cy="4" r="2" fill="#3b2a5c"/><circle cx="6" cy="4" r="2" fill="#3b2a5c"/><path d="M-3 11q3 3 6 0" fill="none" stroke="#3b2a5c" stroke-width="1.6"/>`;
    case 'moonposter': return `<rect x="-34" y="-50" width="68" height="100" rx="4" fill="#2b2166" stroke="#fff" stroke-width="3"/><circle cx="0" cy="-10" r="18" fill="#ffe9a8"/><circle cx="8" cy="-14" r="16" fill="#2b2166"/>${[[-18, -34], [20, 8], [-14, 24], [12, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#fff6c8"/>`).join('')}`;
    case 'clock': return `<circle r="36" fill="#fff8f0" stroke="#d9a066" stroke-width="6"/>${Array.from({ length: 12 }, (_, i) => `<path d="M0 -28V-24" stroke="#8a6a4a" stroke-width="2" transform="rotate(${i * 30})"/>`).join('')}<path d="M0 0V-18" stroke="#4d3a86" stroke-width="4" stroke-linecap="round"/><path d="M0 0L14 6" stroke="#4d3a86" stroke-width="3" stroke-linecap="round"/><circle r="3" fill="#f08fa8"/>`;
    case 'pennant': return `<path d="M-70 -20 Q0 20 70 -20" fill="none" stroke="#8a6a4a" stroke-width="2.4"/>${[-56, -28, 0, 28, 56].map((x, i) => { const yy = -20 + 40 * (1 - Math.pow(x / 70, 2)) * .5 + 0; return `<path d="M${x - 11} ${yy - 2} L${x + 11} ${yy - 2} L${x} ${yy + 28}Z" fill="${['#ff9fc8', '#ffe27a', '#9fe0ff', '#b9f0b0', '#d3b8ff'][i]}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>`; }).join('')}`;
    case 'plant': return `<path d="M-24 0 L-30 -40 H30 L24 0Z" fill="#f0b08c" stroke="#c9825a" stroke-width="3" stroke-linejoin="round"/><rect x="-33" y="-48" width="66" height="12" rx="6" fill="#f6c3a4" stroke="#c9825a" stroke-width="3"/><g fill="#6fc08a" stroke="#4a9a68" stroke-width="2">${[-38, -18, 0, 18, 38].map((a, i) => `<ellipse cx="0" cy="-86" rx="13" ry="${34 - Math.abs(a) / 6}" transform="rotate(${a} 0 -48)"/>`).join('')}</g>`;
    case 'cactus': return `<path d="M-20 0 L-24 -26 H24 L20 0Z" fill="#ffb3cf" stroke="#d9588f" stroke-width="3" stroke-linejoin="round"/><rect x="-18" y="-84" width="36" height="62" rx="18" fill="#7fcf8a" stroke="#4a9a68" stroke-width="3"/><path d="M-18 -56 H-30 Q-34 -56 -34 -62 V-72 Q-34 -76 -30 -76 Q-26 -76 -26 -72 V-64 H-18Z" fill="#7fcf8a" stroke="#4a9a68" stroke-width="3" stroke-linejoin="round"/><circle cx="-6" cy="-58" r="2.4" fill="#3b2a5c"/><circle cx="6" cy="-58" r="2.4" fill="#3b2a5c"/><path d="M-3 -52 q3 3 6 0" fill="none" stroke="#3b2a5c" stroke-width="1.8" stroke-linecap="round"/><circle cx="0" cy="-88" r="6" fill="#ff9fc8"/>`;
    case 'lamp': return `<ellipse cx="0" cy="-2" rx="22" ry="5" fill="#8a6a4a"/><path d="M0 -2V-84" stroke="#8a6a4a" stroke-width="5" stroke-linecap="round"/><circle cx="0" cy="-104" r="44" fill="#ffe27a" opacity=".25"/><path transform="translate(0 -104) scale(2)" d="M0 -13 L3.8 -4 L13 -3.5 L6 3 L8 12.5 L0 7.5 L-8 12.5 L-6 3 L-13 -3.5 L-3.8 -4Z" fill="#ffe27a" stroke="#e8a93a" stroke-width="1.6" stroke-linejoin="round"/>`;
    case 'books': return `<rect x="-36" y="-18" width="72" height="18" rx="3" fill="#8a7ad0" stroke="#5a4a9a" stroke-width="2"/><rect x="-30" y="-36" width="62" height="18" rx="3" fill="#f2a3c4" stroke="#c0628f" stroke-width="2"/><rect x="-34" y="-54" width="66" height="18" rx="3" fill="#f7d58a" stroke="#c9a04a" stroke-width="2"/><path d="M-26 -9H26M-20 -27H22M-24 -45H24" stroke="#fff" stroke-width="2" opacity=".6"/>`;
    case 'duck': return `<ellipse cx="0" cy="-16" rx="26" ry="18" fill="#ffe27a" stroke="#e8b83a" stroke-width="3"/><circle cx="14" cy="-42" r="15" fill="#ffe27a" stroke="#e8b83a" stroke-width="3"/><path d="M26 -42 L38 -38 L26 -34Z" fill="#ffa86a" stroke="#e8823a" stroke-width="2" stroke-linejoin="round"/><circle cx="18" cy="-46" r="2.4" fill="#3b2a5c"/><path d="M-26 -22 Q-36 -30 -30 -34 Q-18 -26 -14 -20Z" fill="#ffd24d" stroke="#e8b83a" stroke-width="2"/>`;
    case 'mug': return `<path d="M-26 -50 H26 V-14 Q26 0 12 0 H-12 Q-26 0 -26 -14Z" fill="#cfe6ff" stroke="#7aa6d9" stroke-width="3" stroke-linejoin="round"/><path d="M26 -40 H36 Q46 -40 46 -28 Q46 -16 34 -16 H26" fill="none" stroke="#7aa6d9" stroke-width="5" stroke-linecap="round"/><path d="M-14 -62 q-6 -8 0 -14 M2 -62 q-6 -8 0 -14 M16 -62 q-6 -8 0 -14" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/><path d="M-12 -30 l6 -8 l6 8z" fill="#ffb3cf"/>`;
    case 'cushions': return `<rect x="-52" y="-34" width="64" height="34" rx="14" fill="#ffb3cf" stroke="#d9588f" stroke-width="3"/><rect x="-14" y="-50" width="60" height="50" rx="16" fill="#cbb8ff" stroke="#7b5fd6" stroke-width="3" transform="rotate(8 16 -25)"/><circle cx="16" cy="-26" r="4" fill="#fff" opacity=".8"/>`;
    case 'roundrug': return `<ellipse cx="0" cy="0" rx="150" ry="30" fill="#ffc2da"/><ellipse cx="0" cy="0" rx="128" ry="24" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="96" ry="17" fill="#ffd9e8"/>`;
    case 'stripedrug': return `<ellipse cx="0" cy="0" rx="150" ry="30" fill="#8fd0c0"/><ellipse cx="0" cy="0" rx="124" ry="24" fill="#fff6e0"/><ellipse cx="0" cy="0" rx="98" ry="18" fill="#f2a3c4"/><ellipse cx="0" cy="0" rx="72" ry="12" fill="#fff6e0"/><ellipse cx="0" cy="0" rx="46" ry="7" fill="#8fd0c0"/>`;
    case 'starrug': return `<ellipse cx="0" cy="0" rx="150" ry="30" fill="#3a2f84"/><ellipse cx="0" cy="0" rx="138" ry="26" fill="none" stroke="#b79bff" stroke-width="2" stroke-dasharray="3 8"/>${[-90, -40, 0, 44, 94].map((x, i) => `<path transform="translate(${x} ${i % 2 ? 4 : -3}) scale(.8 .4)" d="M0 -13 L3.8 -4 L13 -3.5 L6 3 L8 12.5 L0 7.5 L-8 12.5 L-6 3 L-13 -3.5 L-3.8 -4Z" fill="#ffe27a"/>`).join('')}`;
    default: return '';
  }
}

const PREVIEW_BOX = { fairylights: '-340 -10 680 70', pennant: '-80 -40 160 90', roundrug: '-160 -40 320 80', stripedrug: '-160 -40 320 80', starrug: '-160 -40 320 80', starmobile: '-60 -4 120 130', lantern: '-40 -4 80 130' };
export function decorPreview(id) {
  const d = byId(DECOR, id); const t = d?.type;
  const box = PREVIEW_BOX[id] || (t === 'wall' ? '-60 -60 120 120' : t === 'floor' ? '-60 -110 120 120' : '-60 -10 120 130');
  return `<svg viewBox="${box}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${decorSvg(id)}</svg>`;
}

/** Full scene markup: background + placed decor (drawn behind the pet, which is an HTML overlay). */
export function roomSvg(roomId, placed = {}) {
  const bg = ROOM_BG(roomId);
  const items = Object.entries(placed).filter(([, v]) => v).map(([slot, id]) => {
    const [x, y] = SLOT_POS[slot] || [0, 0];
    return `<g transform="translate(${x} ${y})">${decorSvg(id)}</g>`;
  }).join('');
  return bg.replace('</svg>', `${items}</svg>`);
}
