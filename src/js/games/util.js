// Shared helpers for the canvas mini-games.
export function canvasStage(stage) {
  const c = document.createElement('canvas'); stage.appendChild(c);
  const ctx = c.getContext('2d');
  const o = { c, ctx, w: 0, h: 0 };
  const fit = () => {
    const r = stage.getBoundingClientRect(); const d = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.max(1, r.width * d); c.height = Math.max(1, r.height * d);
    ctx.setTransform(d, 0, 0, d, 0, 0); o.w = r.width; o.h = r.height;
  };
  fit();
  const ro = new ResizeObserver(fit); ro.observe(stage);
  o.destroy = () => { ro.disconnect(); c.remove(); };
  return o;
}

export function loop(fn) {
  let raf; let last = performance.now(); let stop = false;
  const f = (t) => { if (stop) return; const dt = Math.min(0.05, (t - last) / 1000); last = t; fn(dt); raf = requestAnimationFrame(f); };
  raf = requestAnimationFrame(f);
  return () => { stop = true; cancelAnimationFrame(raf); };
}

export const fmtTime = (sec) => { const s = Math.max(0, Math.ceil(sec)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

export function drawPet(ctx, img, x, y, size, rot = 0) {
  if (!img || !img.complete || !img.naturalWidth) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(img, -size / 2, -size / 2, size, size); ctx.restore();
}

export function cloud(ctx, x, y, s, a = 0.9) {
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fff'; ctx.beginPath();
  ctx.ellipse(x, y, 46 * s, 18 * s, 0, 0, 7); ctx.ellipse(x + 30 * s, y - 10 * s, 30 * s, 20 * s, 0, 0, 7); ctx.ellipse(x - 28 * s, y - 6 * s, 26 * s, 16 * s, 0, 0, 7); ctx.fill(); ctx.restore();
}

export function starPath(ctx, x, y, r, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = rot + (i * Math.PI) / 5 - Math.PI / 2; const rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath();
}

export function floatText(list, text, x, y, color = '#fff') { list.push({ text, x, y, t: 0, color }); }
export function drawFloats(ctx, list, dt) {
  ctx.save(); ctx.font = '700 26px Gaegu, cursive'; ctx.textAlign = 'center';
  for (let i = list.length - 1; i >= 0; i--) {
    const f = list[i]; f.t += dt; if (f.t > 1.1) { list.splice(i, 1); continue; }
    ctx.globalAlpha = 1 - f.t / 1.1; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(60,30,120,.55)'; ctx.fillStyle = f.color;
    ctx.strokeText(f.text, f.x, f.y - f.t * 40); ctx.fillText(f.text, f.x, f.y - f.t * 40);
  }
  ctx.restore();
}
