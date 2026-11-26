// First-run onboarding: meet the pet, see the basics, name it, choose notifications.
import * as store from '../core/store.js';
import { emit } from '../core/tauri.js';
import * as A from '../engine/actions.js';
import { createPetView } from '../ui/pet-view.js';
import { personalityTitle } from '../engine/pet-engine.js';
import { icon } from '../ui/icons.js';
import { esc } from '../ui/common.js';
import { sfx } from '../engine/audio.js';

const FEATURES = [['fork', 'Feed & clean'], ['gamepad', 'Play mini-games'], ['bag', 'Shop & decorate'], ['moon', 'Sleep schedule'], ['bell', 'Gentle reminders'], ['paw', 'Drag me anywhere']];

export function mount(root, ctx) {
  let step = 0; let name = store.get().name; let notes = true;
  const last = 3;

  function render() {
    const s = store.get();
    const dots = `<div class="dots">${[0, 1, 2, 3].map((i) => `<i class="${i === step ? 'on' : ''}"></i>`).join('')}</div>`;
    let body = '';
    if (step === 0) body = `<div class="hero" id="hero"></div><h1>Meet Wobble</h1><p>Your companion for the desktop.</p>`;
    if (step === 1) body = `<h1>What we'll do</h1><div class="feat-list">${FEATURES.map(([ic, l]) => `<div class="feat"><span class="i">${icon(ic, 26)}</span>${l}</div>`).join('')}</div>`;
    if (step === 2) body = `<div class="hero" id="hero"></div><h1>Name your pet</h1><input type="text" id="nm" value="${esc(name)}" maxlength="16" aria-label="Pet name" style="font-size:var(--fs-lg);text-align:center;width:260px;height:48px" /><p style="font-size:var(--fs-md)">Personality: ${personalityTitle(s.personality)}</p>`;
    if (step === 3) body = `<h1>Reminders</h1><p>Let Wobble send a gentle notification when it needs you.</p>
      <div class="seg" style="font-size:var(--fs-md)"><button data-n="1" aria-pressed="${notes}">On</button><button data-n="0" aria-pressed="${!notes}">Off</button></div>
      <div class="privacy" style="max-width:460px;text-align:left">${icon('shield', 20)}<span>Wobble only checks whether you've been away from the keyboard. Never what you do.</span></div>`;
    root.innerHTML = `<div class="onboard">${body}<div class="row">${step > 0 ? `<button class="btn" id="prev">Back</button>` : ''}<button class="btn primary" id="next">${step === last ? 'Start' : 'Next'}</button></div>${dots}</div>`;
    const hero = root.querySelector('#hero');
    if (hero) {
      const v = createPetView(hero); v.render(store.get()); ctx.setView(v);
      const line = step === 0 ? 'hi hi!! ♡' : 'ooh, a new name!';
      setTimeout(() => { if (hero.isConnected) v.say(line, 3500); }, 450);
    } else ctx.setView(null);
    const nm = root.querySelector('#nm'); if (nm) { nm.oninput = () => { name = nm.value; }; nm.focus(); nm.select(); }
    root.querySelectorAll('[data-n]').forEach((b) => { b.onclick = () => { notes = b.dataset.n === '1'; sfx('click'); render(); }; });
    const prev = root.querySelector('#prev'); if (prev) prev.onclick = () => { step--; sfx('click'); render(); };
    root.querySelector('#next').onclick = () => {
      sfx('boop');
      if (step === 2) A.rename(name || 'Wobble');
      if (step < last) { step++; return render(); }
      store.mutate((st) => { st.onboarded = true; st.settings.notifications.enabled = notes; st.lastTick = Date.now(); });
      store.journal('milestone', `${store.get().name} moved in`);
      emit('wobble:greet', {}); ctx.go('home');
    };
  }
  render();
  return { update() {}, destroy() { ctx.setView(null); } };
}
