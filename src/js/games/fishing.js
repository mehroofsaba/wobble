// Pond Fishing - click to drop the hook, catch fish before time runs out. Golden fish are worth a lot.
import { icon } from '../ui/icons.js';
import { petImage } from '../ui/pet-svg.js';
import { sfx } from '../engine/audio.js';
import { canvasStage, loop, fmtTime, drawPet, cloud, floatText, drawFloats } from './util.js';

export const meta = { id: 'fishing', name: 'Pond Fishing', desc: 'Drop the hook and catch fish. Watch for the golden one!', time: 45, hint: 'Move the mouse, click to drop the hook.' };

export function start(stage, api) {
  const cv = canvasStage(stage);
  const { ctx } = cv;
  const img = petImage(api.state, 'happy');
  let time = meta.time; let score = 0; let caught = 0; let golden = 0; let over = false; let t = 0;
  const hook = { x: 0, y: 0, mode: 'idle', fish: null }; let mx = -1;
  const fish = []; const floats = []; let spawnT = 0;
  const water = () => cv.h * 0.55;

  const spawn = () => {
    const gold = Math.random() < 0.07; const dir = Math.random() < 0.5 ? 1 : -1;
    const size = gold ? 24 : 16 + Math.random() * 9;
    fish.push({ x: dir > 0 ? -40 : cv.w + 40, y: water() + 50 + Math.random() * (cv.h - water() - 90), vx: dir * (gold ? 130 : 60 + Math.random() * 60), size, gold, c: gold ? '#ffc93c' : pick(['#f58fa8', '#8fb8f0', '#b79bff', '#7fd0c0']), ph: Math.random() * 6 });
  };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  const move = (e) => { const r = cv.c.getBoundingClientRect(); mx = e.clientX - r.left; };
  const click = () => { if (hook.mode === 'idle' && !over) { hook.mode = 'down'; sfx('splash'); } };
  cv.c.addEventListener('pointermove', move); cv.c.addEventListener('pointerdown', (e) => { move(e); click(); });

  const stop = loop((dt) => {
    const W = cv.w; const H = cv.h; const wy = water(); t += dt;
    if (!over) {
      time -= dt; if (time <= 0) { time = 0; over = true; setTimeout(() => api.end({ score, extra: { golden, caught } }), 350); }
      spawnT -= dt; if (spawnT <= 0 && fish.length < 7) { spawn(); spawnT = 0.7 + Math.random() * 0.9; }
    }
    // hook
    const minX = W * 0.28; const maxX = W - 30;
    if (hook.mode === 'idle') { const tx = Math.max(minX, Math.min(maxX, mx < 0 ? W * 0.6 : mx)); hook.x += (tx - (hook.x || tx)) * Math.min(1, dt * 10) || 0; if (!hook.x) hook.x = tx; hook.y = wy - 14 + Math.sin(t * 3) * 3; }
    else if (hook.mode === 'down') {
      hook.y += 430 * dt;
      for (const f of fish) if (Math.hypot(f.x - hook.x, f.y - hook.y) < f.size + 8) { hook.fish = f; fish.splice(fish.indexOf(f), 1); hook.mode = 'up'; sfx('pop'); break; }
      if (hook.y > H - 14) hook.mode = 'up';
    } else {
      hook.y -= 320 * dt; if (hook.fish) { hook.fish.x = hook.x; hook.fish.y = hook.y + 6; }
      if (hook.y <= wy - 14) {
        if (hook.fish) {
          const g = hook.fish.gold; const pts = g ? 50 : 10; score += pts; caught++; if (g) golden++;
          floatText(floats, g ? 'Golden fish! +50' : '+10', hook.x, wy - 20, g ? '#ffe27a' : '#fff'); sfx(g ? 'reward' : 'coin'); hook.fish = null;
        }
        hook.mode = 'idle';
      }
    }
    for (let i = fish.length - 1; i >= 0; i--) { const f = fish[i]; f.x += f.vx * dt; if (f.x < -80 || f.x > W + 80) fish.splice(i, 1); }

    // ---- draw
    const sky = ctx.createLinearGradient(0, 0, 0, wy); sky.addColorStop(0, '#8fd0ff'); sky.addColorStop(1, '#e8f7ff'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, wy);
    cloud(ctx, W * 0.2 + Math.sin(t * 0.2) * 20, 60, 1.2); cloud(ctx, W * 0.7 + Math.cos(t * 0.15) * 24, 90, 1);
    ctx.fillStyle = '#9fdca0'; ctx.beginPath(); ctx.moveTo(0, wy); ctx.quadraticCurveTo(W * 0.25, wy - 90, W * 0.5, wy - 20); ctx.quadraticCurveTo(W * 0.75, wy - 70, W, wy - 10); ctx.lineTo(W, wy); ctx.fill();
    const wg = ctx.createLinearGradient(0, wy, 0, H); wg.addColorStop(0, '#6fc4f0'); wg.addColorStop(1, '#3b7fd0'); ctx.fillStyle = wg; ctx.fillRect(0, wy, W, H - wy);
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; for (let i = 0; i < 9; i++) { const x = ((i * 137 + t * 14) % (W + 60)) - 30; ctx.beginPath(); ctx.moveTo(x, wy + 14 + (i % 3) * 8); ctx.quadraticCurveTo(x + 14, wy + 8 + (i % 3) * 8, x + 28, wy + 14 + (i % 3) * 8); ctx.stroke(); }
    // dock + pet
    ctx.fillStyle = '#b98558'; ctx.fillRect(0, wy - 16, W * 0.26, 16); ctx.fillStyle = '#8a5c3a'; ctx.fillRect(W * 0.04, wy, 14, 70); ctx.fillRect(W * 0.2, wy, 14, 70);
    drawPet(ctx, img, W * 0.13, wy - 70, 128);
    const rx = W * 0.13 + 40; const ry = wy - 118;
    ctx.strokeStyle = '#8a5c3a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(rx - 20, ry + 50); ctx.lineTo(rx + 30, ry - 10); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(rx + 30, ry - 10); ctx.lineTo(hook.x, hook.y); ctx.stroke();
    // fish
    const drawFish = (f) => {
      const d = f.vx >= 0 ? 1 : -1; const wob = Math.sin(t * 8 + f.ph) * 0.15;
      ctx.save(); ctx.translate(f.x, f.y); ctx.scale(d, 1); ctx.rotate(wob);
      if (f.gold) { ctx.shadowColor = '#ffe27a'; ctx.shadowBlur = 14; }
      ctx.fillStyle = f.c; ctx.beginPath(); ctx.ellipse(0, 0, f.size, f.size * 0.6, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-f.size * 0.8, 0); ctx.lineTo(-f.size * 1.5, -f.size * 0.6); ctx.lineTo(-f.size * 1.5, f.size * 0.6); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(f.size * 0.45, -f.size * 0.12, f.size * 0.2, 0, 7); ctx.fill(); ctx.fillStyle = '#3b2a5c'; ctx.beginPath(); ctx.arc(f.size * 0.5, -f.size * 0.12, f.size * 0.1, 0, 7); ctx.fill();
      ctx.restore();
    };
    fish.forEach(drawFish); if (hook.fish) drawFish(hook.fish);
    ctx.strokeStyle = '#ddd'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hook.x, hook.y + 5, 6, 0.2, Math.PI + 0.5); ctx.stroke();
    drawFloats(ctx, floats, dt);
    api.hud(fmtTime(time), score, `${icon('fish', 20)}${caught}`);
  });

  return { stop() { stop(); cv.destroy(); } };
}
