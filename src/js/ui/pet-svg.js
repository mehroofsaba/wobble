// The Wobble character, drawn as SVG so coats, faces and accessories can be mixed freely.
import { COATS, ACCESSORIES, byId } from '../core/data.js';

let uid = 0;
const INK = '#3b2a5c';

const EYES = {
  open: `<g class="eye"><ellipse cx="76" cy="99" rx="7" ry="8.5" fill="${INK}"/><circle cx="78.6" cy="95.6" r="2.7" fill="#fff"/><circle cx="73.5" cy="102" r="1.2" fill="#fff" opacity=".8"/></g>
         <g class="eye"><ellipse cx="124" cy="99" rx="7" ry="8.5" fill="${INK}"/><circle cx="126.6" cy="95.6" r="2.7" fill="#fff"/><circle cx="121.5" cy="102" r="1.2" fill="#fff" opacity=".8"/></g>`,
  wide: `<g class="eye"><ellipse cx="76" cy="98" rx="8.5" ry="10" fill="${INK}"/><circle cx="79" cy="94" r="3.4" fill="#fff"/><circle cx="73" cy="102" r="1.8" fill="#fff"/></g>
         <g class="eye"><ellipse cx="124" cy="98" rx="8.5" ry="10" fill="${INK}"/><circle cx="127" cy="94" r="3.4" fill="#fff"/><circle cx="121" cy="102" r="1.8" fill="#fff"/></g>`,
  happy: `<path d="M67 101 Q76 90 85 101" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M115 101 Q124 90 133 101" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
  sleep: `<path d="M67 98 Q76 106 85 98" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/><path d="M115 98 Q124 106 133 98" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>`,
  drowsy: `<path d="M68 101 H84" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M116 101 H132" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M69 96 Q76 92 83 96" fill="none" stroke="${INK}" stroke-width="2" opacity=".35" stroke-linecap="round"/>`,
  sad: `<g class="eye"><ellipse cx="76" cy="100" rx="7" ry="8.5" fill="${INK}"/><circle cx="78.6" cy="97" r="3" fill="#fff"/></g>
        <g class="eye"><ellipse cx="124" cy="100" rx="7" ry="8.5" fill="${INK}"/><circle cx="126.6" cy="97" r="3" fill="#fff"/></g>
        <path d="M64 88 L84 84" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M136 88 L116 84" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
        <path d="M86 108 q4 6 0 10 q-4 -4 0 -10z" fill="#9fd8f5"/>`,
};

const MOUTHS = {
  smile: `<path d="M91 115 Q95.5 121 100 115 Q104.5 121 109 115" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`,
  grin: `<path d="M90 113 Q100 129 110 113 Z" fill="#7a3a5a" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M94 121 Q100 126 106 121 Q100 118 94 121Z" fill="#ff9fb8"/>`,
  open: `<ellipse cx="100" cy="119" rx="5.5" ry="6.5" fill="#7a3a5a" stroke="${INK}" stroke-width="2"/><ellipse cx="100" cy="122" rx="3" ry="2.2" fill="#ff9fb8"/>`,
  chomp: `<g class="chomp"><path d="M91 113 Q100 130 109 113 Z" fill="#7a3a5a" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M95 121 Q100 125 105 121 Q100 118 95 121Z" fill="#ff9fb8"/></g>`,
  frown: `<path d="M92 122 Q100 113 108 122" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>`,
  flat: `<path d="M93 118 H107" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>`,
  zzz: `<path d="M96 116 Q100 120 104 116" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`,
};

export const FACES = {
  happy: { eyes: 'open', mouth: 'smile' }, content: { eyes: 'open', mouth: 'smile' },
  excited: { eyes: 'wide', mouth: 'grin' }, playful: { eyes: 'open', mouth: 'grin' },
  sleepy: { eyes: 'drowsy', mouth: 'zzz' }, hungry: { eyes: 'sad', mouth: 'open' },
  bored: { eyes: 'drowsy', mouth: 'flat' }, sad: { eyes: 'sad', mouth: 'frown' },
  sleeping: { eyes: 'sleep', mouth: 'zzz' }, eating: { eyes: 'happy', mouth: 'chomp' },
  love: { eyes: 'happy', mouth: 'grin' }, ew: { eyes: 'sad', mouth: 'frown' }, cheer: { eyes: 'happy', mouth: 'grin' },
};

function accessory(id) {
  const a = byId(ACCESSORIES, id); if (!a) return '';
  const c = a.color;
  switch (id) {
    case 'bow': return `<g transform="translate(135 56) rotate(14)"><path d="M0 0 L-19 -11 Q-22 0 -19 11Z" fill="${c}" stroke="#d9588f" stroke-width="2" stroke-linejoin="round"/><path d="M0 0 L19 -11 Q22 0 19 11Z" fill="${c}" stroke="#d9588f" stroke-width="2" stroke-linejoin="round"/><circle r="5.5" fill="#ff6fa8" stroke="#d9588f" stroke-width="2"/></g>`;
    case 'flower': return `<g transform="translate(70 54)">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="0" cy="-8" rx="5.5" ry="8" fill="#fff" stroke="#e6d9f2" stroke-width="1.5" transform="rotate(${r})"/>`).join('')}<circle r="5" fill="${c}" stroke="#e8b83a" stroke-width="1.5"/></g>`;
    case 'starclip': return `<path transform="translate(136 58) rotate(12)" d="M0 -13 L3.8 -4 L13 -3.5 L6 3 L8 12.5 L0 7.5 L-8 12.5 L-6 3 L-13 -3.5 L-3.8 -4Z" fill="${c}" stroke="#e8a93a" stroke-width="2" stroke-linejoin="round"/>`;
    case 'partyhat': return `<g><path d="M78 56 L100 6 L122 56Z" fill="${c}" stroke="#d9588f" stroke-width="2.4" stroke-linejoin="round"/><path d="M86 42 L114 42" stroke="#fff" stroke-width="4" opacity=".7"/><path d="M92 28 L108 28" stroke="#fff" stroke-width="4" opacity=".7"/><circle cx="100" cy="7" r="6" fill="#ffe27a" stroke="#e8b83a" stroke-width="1.6"/></g>`;
    case 'headphones': return `<g><path d="M42 96 C34 22 166 22 158 96" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/><rect x="31" y="84" width="19" height="30" rx="9" fill="#ffb3d1" stroke="${c}" stroke-width="4"/><rect x="150" y="84" width="19" height="30" rx="9" fill="#ffb3d1" stroke="${c}" stroke-width="4"/></g>`;
    case 'crown': return `<g><path d="M72 56 L74 24 L89 40 L100 16 L111 40 L126 24 L128 56Z" fill="${c}" stroke="#e8a93a" stroke-width="2.6" stroke-linejoin="round"/><circle cx="100" cy="36" r="3.6" fill="#ff7fb0"/><circle cx="82" cy="46" r="2.6" fill="#7fd0ff"/><circle cx="118" cy="46" r="2.6" fill="#7fd0ff"/></g>`;
    case 'glasses': return `<g fill="rgba(255,255,255,.25)" stroke="${c}" stroke-width="3.2"><circle cx="76" cy="99" r="13"/><circle cx="124" cy="99" r="13"/><path d="M89 98 Q100 92 111 98" fill="none"/></g>`;
    case 'heartglasses': return `<g fill="${c}" fill-opacity=".45" stroke="${c}" stroke-width="3" stroke-linejoin="round"><path d="M76 112 C58 100 62 86 70 86 C74 86 76 90 76 90 C76 90 78 86 82 86 C90 86 94 100 76 112Z"/><path d="M124 112 C106 100 110 86 118 86 C122 86 124 90 124 90 C124 90 126 86 130 86 C138 86 142 100 124 112Z"/><path d="M92 95 Q100 91 108 95" fill="none"/></g>`;
    case 'shades': return `<g><path d="M60 90 H140 L136 108 Q126 116 116 108 L112 100 H88 L84 108 Q74 116 64 108Z" fill="${c}" stroke="#1a1730" stroke-width="2.6" stroke-linejoin="round"/><path d="M70 94 L80 94" stroke="#fff" stroke-width="2.4" opacity=".5" stroke-linecap="round"/></g>`;
    case 'bellcollar': return `<g><path d="M62 138 Q100 160 138 138" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/><circle cx="100" cy="152" r="7.5" fill="#ffd66b" stroke="#e8a93a" stroke-width="2"/><path d="M100 148 V156" stroke="#e8a93a" stroke-width="1.6"/></g>`;
    case 'bowtie': return `<g transform="translate(100 150)"><path d="M0 0 L-17 -9 L-17 9Z" fill="${c}" stroke="#4a5ac0" stroke-width="2" stroke-linejoin="round"/><path d="M0 0 L17 -9 L17 9Z" fill="${c}" stroke="#4a5ac0" stroke-width="2" stroke-linejoin="round"/><circle r="4.6" fill="#a9b4ff" stroke="#4a5ac0" stroke-width="2"/></g>`;
    case 'scarf': return `<g><path d="M56 136 Q100 166 144 136 L148 150 Q100 180 52 150Z" fill="${c}" stroke="#d96a6a" stroke-width="2.2" stroke-linejoin="round"/><path d="M118 160 L132 160 L136 186 L120 184Z" fill="${c}" stroke="#d96a6a" stroke-width="2.2" stroke-linejoin="round"/><path d="M60 146 Q100 172 140 146" fill="none" stroke="#fff" stroke-width="2.4" stroke-dasharray="3 7" opacity=".7"/></g>`;
    default: return '';
  }
}

/**
 * @param opts.coat coat id  @param opts.head/face/neck accessory ids
 * @param opts.face key of FACES   @param opts.bare skip accessories
 */
export function petSvg({ coat = 'lavender', head = null, face = 'content', neck = null, faceAcc = null, bare = false } = {}) {
  const k = ++uid;
  const c = (byId(COATS, coat) || COATS[0]).c;
  const f = FACES[face] || FACES.content;
  const clip = `hc${k}`;
  const eyesMarkup = EYES[f.eyes] || EYES.open;
  const accHead = !bare && head ? accessory(head) : '';
  const accFace = !bare && faceAcc ? accessory(faceAcc) : '';
  const accNeck = !bare && neck ? accessory(neck) : '';
  return `<svg class="pet-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs><clipPath id="${clip}"><ellipse cx="100" cy="94" rx="62" ry="50"/></clipPath></defs>
<ellipse class="shadow" cx="100" cy="188" rx="54" ry="8" fill="rgba(50,25,90,.2)"/>
<g class="rig">
  <g class="tail"><path d="M146 160 C196 166 202 108 172 96 C186 120 170 142 146 142Z" fill="${c.base}" stroke="${c.line}" stroke-width="2.4" stroke-linejoin="round"/><path d="M172 96 C180 104 184 112 183 122 C173 116 168 106 172 96Z" fill="${c.patch}"/></g>
  <g class="body">
    <ellipse cx="100" cy="146" rx="48" ry="38" fill="${c.base}" stroke="${c.line}" stroke-width="2.4"/>
    <path d="M118 112 C148 116 152 150 132 170 C116 164 108 140 118 112Z" fill="${c.patch}" opacity=".85"/>
    <ellipse class="paw pl" cx="78" cy="178" rx="14" ry="9" fill="${c.base}" stroke="${c.line}" stroke-width="2.2"/>
    <ellipse class="paw pr" cx="122" cy="178" rx="14" ry="9" fill="${c.base}" stroke="${c.line}" stroke-width="2.2"/>
  </g>
  ${accNeck}
  <g class="head">
    <path d="M47 74 C38 40 48 22 58 20 C74 26 86 40 90 54Z" fill="${c.base}" stroke="${c.line}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M153 74 C162 40 152 22 142 20 C126 26 114 40 110 54Z" fill="${c.base}" stroke="${c.line}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M56 58 C52 42 56 32 60 30 C68 34 74 42 76 50Z" fill="${c.inner}"/>
    <path d="M144 58 C148 42 144 32 140 30 C132 34 126 42 124 50Z" fill="${c.inner}"/>
    <ellipse cx="100" cy="94" rx="62" ry="50" fill="${c.base}" stroke="${c.line}" stroke-width="2.4"/>
    <g clip-path="url(#${clip})"><path d="M30 70 C40 44 72 40 90 44 C76 66 66 92 30 104Z" fill="${c.patch}"/><path d="M120 44 C140 42 150 52 168 60 C158 66 138 66 120 44Z" fill="${c.patch}" opacity=".55"/></g>
    <ellipse cx="60" cy="113" rx="9" ry="5.5" fill="#ff9fb8" opacity=".6"/><ellipse cx="140" cy="113" rx="9" ry="5.5" fill="#ff9fb8" opacity=".6"/>
    <g class="eyes">${eyesMarkup}</g>
    <path d="M96 106.5 Q100 103 104 106.5 Q102 111 100 111 Q98 111 96 106.5Z" fill="#f08fa8"/>
    <g class="mouth">${MOUTHS[f.mouth] || MOUTHS.smile}</g>
    <g stroke="${c.line}" stroke-width="1.6" stroke-linecap="round" opacity=".45"><path d="M54 110 L36 105"/><path d="M54 116 L36 118"/><path d="M146 110 L164 105"/><path d="M146 116 L164 118"/></g>
    ${accFace}
    ${accHead}
  </g>
</g></svg>`;
}

export function faceForState(s, override) {
  if (override) return override;
  if (s.sleeping) return 'sleeping';
  return s.mood in FACES ? s.mood : 'content';
}

export const petSvgFromState = (s, o = {}) =>
  petSvg({ coat: s.equipped.coat, head: s.equipped.head, faceAcc: s.equipped.face, neck: s.equipped.neck, face: faceForState(s, o.face), bare: o.bare });

const imgCache = new Map();
/** Rasterise the pet for canvas mini-games. */
export function petImage(s, face = 'happy') {
  const svg = petSvgFromState(s, { face }).replace('<svg ', '<svg width="200" height="200" ');
  const key = svg;
  if (imgCache.has(key)) return imgCache.get(key);
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  imgCache.set(key, img);
  return img;
}
