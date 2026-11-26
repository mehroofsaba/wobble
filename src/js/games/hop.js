// Cloud Hop - an endless side-scroller. Jump bushes, grab stars. Three hearts.
import { icon } from '../ui/icons.js';
import { petImage } from '../ui/pet-svg.js';
import { sfx } from '../engine/audio.js';
import { canvasStage, loop, fmtTime, drawPet, cloud, starPath, floatText, drawFloats } from './util.js';

export const meta = { id: 'hop', name: 'Cloud Hop', desc: 'Hop over the bushes and collect stars.', time: 40, hint: 'Click, tap or press Space / ↑ to jump.' };

export function start(stage, api) {
  const cv = canvasStage(stage); const { ctx } = cv;
  const img = petImage(api.state, 'cheer'); const imgHurt = petImage(api.state, 'ew');
  let time = meta.time; let dist = 0; let stars = 0; let hearts = 3; let over = false; let t = 0; let inv = 0; let spawnT = 1;
  const pet = { y: 0, vy: 0, ground: true };
  const obs = []; const pick = []; const floats = [];
  const gy = () => cv.h * 0.78;

  const jump = () => { if (over) return; if (pet.ground) { pet.vy = -760; pet.ground = false; sfx('jump'); } };
  const key = (e) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); } };
  window.addEventListener('keydown', key); cv.c.addEventListener('pointerdown', jump);

  const end = () => { if (over) return; over = true; setTimeout(() => api.end({ score: Math.floor(dist / 12) + stars * 10, extra: { stars } }), 350); };

  const stopLoop = loop((dt) => {
    const W = cv.w; const H = cv.h; const G = gy(); t += dt;
    const speed = 270 + Math.min(150, t * 5);
    if (!over) {
      time -= dt; dist += speed * dt; inv = Math.max(0, inv - dt);
      if (time <= 0) { time = 0; end(); }
      spawnT -= dt;
      if (spawnT <= 0) {
        const w = 34 + Math.random() * 26; const h = 32 + Math.random() * 22;
        obs.push({ x: W + 40, w, h });
        if (Math.random() < 0.8) pick.push({ x: W + 40 + 130 + Math.random() * 60, y: G - 90 - Math.random() * 90, got: false });
        spawnT = 1.1 + Math.random() * 1.1 - Math.min(0.4, t / 120);
      }
      pet.vy += 2000 * dt; pet.y += pet.vy * dt; if (pet.y >= 0) { pet.y = 0; pet.vy = 0; pet.ground = true; }
      for (const o of obs) o.x -= speed * dt; for (const p of pick) p.x -= speed * dt;
      const px = W * 0.2; const py = G - 44 + pet.y;
      for (const o of obs) if (inv <= 0 && Math.abs(o.x - px) < o.w / 2 + 22 && py + 26 > G - o.h) { hearts--; inv = 1.4; sfx('bad'); floatText(floats, 'oops!', px, py - 40, '#ffb3c8'); if (hearts <= 0) end(); }
      for (const p of pick) if (!p.got && Math.hypot(p.x - px, p.y - py) < 40) { p.got = true; stars++; sfx('coin'); floatText(floats, '+10', p.x, p.y, '#ffe27a'); }
      while (obs.length && obs[0].x < -80) obs.shift(); while (pick.length && pick[0].x < -80) pick.shift();
    }
    // ---- draw
    const sky = ctx.createLinearGradient(0, 0, 0, G); sky.addColorStop(0, '#9fd6ff'); sky.addColorStop(1, '#ecf9ff'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 4; i++) cloud(ctx, ((i * 330 - dist * 0.12) % (W + 300) + W + 300) % (W + 300) - 100, 70 + (i % 2) * 50, 1 + (i % 3) * 0.2, 0.9);
    ctx.fillStyle = '#b7e8b0'; ctx.beginPath(); ctx.moveTo(0, G); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, G - 60 - 26 * Math.sin((x + dist * 0.25) / 90)); ctx.lineTo(W, G); ctx.fill();
    ctx.fillStyle = '#7fd08a'; ctx.fillRect(0, G, W, H - G); ctx.fillStyle = '#6ab878'; for (let x = -((dist) % 40); x < W; x += 40) ctx.fillRect(x, G, 20, 6);
    ctx.fillStyle = '#e0b88a'; ctx.fillRect(0, G + 6, W, 0);
    // goal flag near the end of the clock
    if (time < 4) { const fx = W - (4 - time) * 140 + 100; ctx.fillStyle = '#8a5c3a'; ctx.fillRect(fx, G - 90, 6, 90); ctx.fillStyle = '#ff7fb0'; ctx.beginPath(); ctx.moveTo(fx + 6, G - 90); ctx.lineTo(fx + 56, G - 72); ctx.lineTo(fx + 6, G - 54); ctx.fill(); }
    for (const o of obs) { ctx.fillStyle = '#4fae68'; ctx.beginPath(); ctx.ellipse(o.x, G - o.h * 0.4, o.w / 2, o.h * 0.6, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#62c47c'; ctx.beginPath(); ctx.ellipse(o.x - o.w * 0.18, G - o.h * 0.55, o.w * 0.28, o.h * 0.34, 0, 0, 7); ctx.fill(); }
    for (const p of pick) if (!p.got) { ctx.fillStyle = '#ffd24d'; ctx.strokeStyle = '#e8a93a'; ctx.lineWidth = 2; starPath(ctx, p.x, p.y + Math.sin(t * 4 + p.x) * 4, 15, t); ctx.fill(); ctx.stroke(); }
    const px = W * 0.2; const py = G - 54 + pet.y;
    ctx.fillStyle = 'rgba(50,25,90,.18)'; ctx.beginPath(); ctx.ellipse(px, G + 6, 34 * (1 + pet.y / 400), 7, 0, 0, 7); ctx.fill();
    if (inv <= 0 || Math.floor(t * 12) % 2) drawPet(ctx, inv > 0 ? imgHurt : img, px, py, 104, pet.ground ? Math.sin(t * 14) * 0.05 : -0.15);
    drawFloats(ctx, floats, dt);
    api.hud(fmtTime(time), Math.floor(dist / 12) + stars * 10, `${icon('heart', 20)}${Math.max(0, hearts)}  ${icon('star', 20)}${stars}`);
  });
  return { stop() { stopLoop(); window.removeEventListener('keydown', key); cv.destroy(); } };
}
