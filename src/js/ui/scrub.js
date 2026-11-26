// Interactive cleaning: foam bubbles cover the pet; rub the pointer over them (or click) to pop.
import { sfx } from '../engine/audio.js';

export function startScrub(view, onDone, count = 9) {
  const layer = document.createElement('div');
  layer.className = 'foam-layer hit';
  view.body.appendChild(layer);
  let left = count;
  const finish = () => { layer.remove(); };
  for (let i = 0; i < count; i++) {
    const b = document.createElement('div');
    const size = 30 + Math.random() * 22;
    b.className = 'foam';
    b.style.cssText = `width:${size}px;height:${size}px;left:${14 + Math.random() * 62}%;top:${16 + Math.random() * 62}%;animation-delay:${i * 60}ms`;
    const pop = () => {
      if (b.classList.contains('pop')) return;
      b.classList.add('pop'); sfx('pop'); view.fx('✦', 1);
      setTimeout(() => b.remove(), 260);
      if (--left === 0) { setTimeout(finish, 280); onDone(); }
    };
    b.addEventListener('pointerenter', pop);
    b.addEventListener('pointerdown', pop);
    layer.appendChild(b);
  }
  view.say('rub the bubbles away! ♡', 3500);
  return () => finish();
}
