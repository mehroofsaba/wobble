// Tiny WebAudio synth - no audio assets needed. Respects settings.sound.
import * as store from '../core/store.js';

let ctx = null;
function ac() {
  if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, { type = 'sine', vol = 0.18, at = 0, slide = 0 } = {}) {
  const s = store.get()?.settings.sound;
  if (!s || !s.enabled || s.volume <= 0) return;
  const a = ac(); if (!a) return;
  const t = a.currentTime + at;
  const o = a.createOscillator(); const g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  const v = vol * (s.volume / 100);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}

const SOUNDS = {
  click: () => tone(620, 0.07, { type: 'triangle', vol: 0.12 }),
  pop: () => tone(520, 0.09, { type: 'sine', slide: 380, vol: 0.2 }),
  boop: () => { tone(420, 0.1, { type: 'triangle' }); tone(640, 0.12, { type: 'triangle', at: 0.07 }); },
  chomp: () => { tone(220, 0.07, { type: 'square', vol: 0.08 }); tone(200, 0.07, { type: 'square', vol: 0.08, at: 0.11 }); tone(230, 0.07, { type: 'square', vol: 0.08, at: 0.22 }); },
  coin: () => { tone(880, 0.09, { type: 'triangle' }); tone(1320, 0.18, { type: 'triangle', at: 0.08 }); },
  reward: () => [660, 830, 990, 1320].forEach((f, i) => tone(f, 0.2, { type: 'triangle', at: i * 0.09 })),
  levelup: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.26, { type: 'triangle', at: i * 0.1 })),
  sleep: () => [440, 392, 330].forEach((f, i) => tone(f, 0.4, { type: 'sine', at: i * 0.22, vol: 0.12 })),
  wake: () => [330, 392, 494].forEach((f, i) => tone(f, 0.25, { type: 'sine', at: i * 0.12, vol: 0.12 })),
  meow: () => tone(700, 0.28, { type: 'sawtooth', vol: 0.06, slide: -260 }),
  bad: () => tone(200, 0.25, { type: 'sawtooth', vol: 0.1, slide: -80 }),
  splash: () => tone(300, 0.2, { type: 'sine', slide: -150, vol: 0.14 }),
  flip: () => tone(480, 0.06, { type: 'triangle', vol: 0.1 }),
  match: () => { tone(740, 0.1, { type: 'triangle' }); tone(988, 0.16, { type: 'triangle', at: 0.09 }); },
  jump: () => tone(360, 0.14, { type: 'square', vol: 0.07, slide: 260 }),
};

export const sfx = (name) => { try { SOUNDS[name] && SOUNDS[name](); } catch { /* audio is optional */ } };
