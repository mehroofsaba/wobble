// Star Catcher - glide along a cloud and catch falling stars. Dodge the grey meteors.
import { icon } from '../ui/icons.js';
import { petImage } from '../ui/pet-svg.js';
import { sfx } from '../engine/audio.js';
import { canvasStage, loop, fmtTime, drawPet, cloud, starPath, floatText, drawFloats } from './util.js';

export const meta = { id: 'stars', name: 'Star Catcher', desc: 'Catch falling stars, dodge the meteors.', time: 40, hint: 'Move the mouse (or ← → keys) to glide.' };

export function start(stage, api) {
  const cv = canvasStage(stage); const { ctx } = cv;
  const img = petImage(api.state, 'cheer'); const imgHurt = petImage(api.state, 'ew');
  let time = meta.time; let score = 0; let caught = 0; let over = false; let t = 0; let hurt = 0; let spawnT = 0.4; let px = -1; let target = -1;
  const items = []; const floats = []; const keys = {};
  const bg = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + 0.4, p: Math.random() * 6 }));

  const move = (e) => { const r = cv.c.getBoundingClientRect(); target = e.clientX - r.left; };
  const kd = (e) => { if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') { keys[e.code] = e.type === 'keydown'; e.preventDefault(); } };
  cv.c.addEventListener('pointermove', move); cv.c.addEventListener('pointerdown', move);
  window.addEventListener('keydown', kd); window.addEventListener('keyup', kd);

  const stopLoop = loop((dt) => {
    const W = cv.w; const H = cv.h; t += dt; if (px < 0) { px = W / 2; target = W / 2; }
    const py = H - 96;
    if (keys.ArrowLeft) target = Math.max(40, target - 560 * dt); if (keys.ArrowRight) target = Math.min(W - 40, target + 560 * dt);
    px += (Math.max(40, Math.min(W - 40, target)) - px) * Math.min(1, dt * 9);
    hurt = Math.max(0, hurt - dt);
    if (!over) {
      time -= dt; if (time <= 0) { time = 0; over = true; setTimeout(() => api.end({ score: Math.max(0, score), extra: { caught } }), 350); }
      spawnT -= dt;
      if (spawnT <= 0) {
        const r = Math.random(); const kind = r < 0.14 ? 'big' : r < 0.36 ? 'rock' : 'star';
        items.push({ kind, x: 30 + Math.random() * (W - 60), y: -30, v: 150 + Math.random() * 90 + t * 3, rot: Math.random() * 6 });
        spawnT = Math.max(0.35, 0.8 - t * 0.008) * (0.7 + Math.random() * 0.6);
      }
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i]; it.y += it.v * dt; it.rot += dt * 2;
        if (Math.abs(it.x - px) < 52 && Math.abs(it.y - (py - 12)) < 40) {
          if (it.kind === 'rock') { score = Math.max(0, score - 15); hurt = 0.7; sfx('bad'); floatText(floats, '-15', px, py - 60, '#ffb3c8'); }
          else { const p = it.kind === 'big' ? 25 : 10; score += p; caught++; sfx(it.kind === 'big' ? 'reward' : 'coin'); floatText(floats, '+' + p, it.x, py - 60, '#ffe27a'); }
          items.splice(i, 1);
        } else if (it.y > H + 40) items.splice(i, 1);
      }
    }
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1c1650'); g.addColorStop(1, '#6a47a8'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const s of bg) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + s.p); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1; ctx.fillStyle = '#fff6c8'; ctx.beginPath(); ctx.arc(W - 90, 80, 34, 0, 7); ctx.fill(); ctx.fillStyle = '#2c2266'; ctx.beginPath(); ctx.arc(W - 78, 72, 31, 0, 7); ctx.fill();
    for (const it of items) {
      if (it.kind === 'rock') { ctx.fillStyle = '#8b86a8'; ctx.beginPath(); ctx.arc(it.x, it.y, 20, 0, 7); ctx.fill(); ctx.fillStyle = '#6f6a90'; ctx.beginPath(); ctx.arc(it.x - 6, it.y - 4, 5, 0, 7); ctx.arc(it.x + 7, it.y + 6, 4, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(it.x + 18, it.y - 34); ctx.lineTo(it.x + 6, it.y - 12); ctx.stroke(); }
      else { const big = it.kind === 'big'; ctx.save(); if (big) { ctx.shadowColor = '#ffe27a'; ctx.shadowBlur = 18; } ctx.fillStyle = big ? '#ffd24d' : '#fff0a0'; ctx.strokeStyle = '#e8a93a'; ctx.lineWidth = 2; starPath(ctx, it.x, it.y, big ? 26 : 17, it.rot); ctx.fill(); ctx.stroke(); ctx.restore(); }
    }
    cloud(ctx, px, py + 48, 1.5, 0.95);
    if (hurt <= 0 || Math.floor(t * 14) % 2) drawPet(ctx, hurt > 0 ? imgHurt : img, px, py - 4, 104);
    drawFloats(ctx, floats, dt);
    api.hud(fmtTime(time), score, `${icon('star', 20)}${caught}`);
  });
  return { stop() { stopLoop(); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', kd); cv.destroy(); } };
}
