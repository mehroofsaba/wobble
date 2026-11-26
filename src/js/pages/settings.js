// Settings: every toggle writes to state.settings via a dotted path (data-set="notifications.enabled").
import * as store from '../core/store.js';
import { invoke } from '../core/tauri.js';
import { THEMES } from '../core/data.js';
import * as A from '../engine/actions.js';
import { modal } from '../ui/common.js';
import { toast } from '../ui/toast.js';
import { icon } from '../ui/icons.js';
import { sfx } from '../engine/audio.js';

const get = (o, p) => p.split('.').reduce((a, k) => a[k], o);
function setPath(o, p, v) { const ks = p.split('.'); const last = ks.pop(); ks.reduce((a, k) => a[k], o)[last] = v; }

const sw = (path, v) => `<label class="switch"><input type="checkbox" data-set="${path}" ${v ? 'checked' : ''}><i></i></label>`;
const seg = (path, v, opts) => `<div class="seg" role="group">${opts.map(([val, l]) => `<button data-set="${path}" data-val="${val}" aria-pressed="${String(v) === String(val)}">${l}</button>`).join('')}</div>`;
const row = (l, d, ctl) => `<div class="set-row"><div class="l"><b>${l}</b>${d ? `<span>${d}</span>` : ''}</div>${ctl}</div>`;
const range = (path, min, max, step, v, unit) => `<span class="row"><input type="range" min="${min}" max="${max}" step="${step}" data-set="${path}" data-unit="${unit}" value="${v}"><span class="val-label">${v}${unit}</span></span>`;

export function mount(root, ctx) {
  function render() {
    const s = store.get(); const c = s.settings; const n = c.notifications;
    root.innerHTML = `<div class="settings">
      <div class="col">
        <section class="card"><h2>${icon('paw', 22)}Pet</h2>
          ${row('Show on desktop', '', sw('showPet', c.showPet))}
          ${row('Keep on top', '', sw('alwaysOnTop', c.alwaysOnTop))}
          ${row('Roam around', '', sw('roam', c.roam))}
          ${row('Click-through', 'Clicks pass through empty space around the pet', sw('clickThrough', c.clickThrough))}
          ${row('Size', '', seg('petScale', c.petScale, [[0.75, 'S'], [1, 'M'], [1.3, 'L']]))}
          ${row('Animation', '', seg('intensity', c.intensity, [['low', 'Calm'], ['normal', 'Normal'], ['high', 'Lively']]))}
          ${row('Speech bubbles', '', seg('speech', c.speech, [['off', 'Off'], ['low', 'Rare'], ['normal', 'Normal']]))}</section>
        <section class="card"><h2>${icon('moon', 22)}Sleep</h2>
          ${row('Automatic bedtime', '', sw('sleep.auto', c.sleep.auto))}
          ${row('Bedtime', '', `<input type="time" data-set="sleep.bedtime" value="${c.sleep.bedtime}">`)}
          ${row('Wake up', '', `<input type="time" data-set="sleep.wake" value="${c.sleep.wake}">`)}</section>
        <section class="card"><h2>${icon('volume', 22)}Sound</h2>
          ${row('Sound effects', '', sw('sound.enabled', c.sound.enabled))}
          ${row('Volume', '', range('sound.volume', 0, 100, 5, c.sound.volume, '%'))}</section>
      </div>
      <div class="col">
        <section class="card"><h2>${icon('bell', 22)}Notifications</h2>
          ${row('Enabled', '', sw('notifications.enabled', n.enabled))}
          ${row('Hungry', '', sw('notifications.hungry', n.hungry))}${row('Sleepy', '', sw('notifications.sleepy', n.sleepy))}${row('Bored', '', sw('notifications.bored', n.bored))}
          ${row('Needs a wash', '', sw('notifications.dirty', n.dirty))}${row('Misses you', '', sw('notifications.sad', n.sad))}${row('Daily reward', '', sw('notifications.daily', n.daily))}
          ${row('Minimum gap', '', range('notifications.cooldown', 15, 180, 15, n.cooldown, ' min'))}
          ${row('Quiet hours', '', `<span class="row">${sw('quiet.enabled', c.quiet.enabled)}<input type="time" data-set="quiet.from" value="${c.quiet.from}" aria-label="Quiet from"><input type="time" data-set="quiet.to" value="${c.quiet.to}" aria-label="Quiet until"></span>`)}
          <div style="margin-top:12px"><button class="btn small" id="test-n">${icon('bell', 16)}Test notification</button></div></section>
        <section class="card"><h2>${icon('eye', 22)}Activity awareness</h2>
          ${row('React to my activity', '', sw('activity.enabled', c.activity.enabled))}
          ${row('Away after', '', range('activity.awayMinutes', 2, 30, 1, c.activity.awayMinutes, ' min'))}
          <div class="privacy">${icon('shield', 20)}<span>Only the time since your last keyboard or mouse input is read. Nothing else, and nothing leaves your computer.</span></div></section>
        <section class="card"><h2>${icon('palette', 22)}Appearance</h2>
          <div class="theme-grid">${THEMES.map((t) => { const own = s.owned.theme.includes(t.id); return `<button class="theme-opt" data-theme="${t.id}" aria-pressed="${s.theme === t.id}"><span class="sw" style="background:linear-gradient(135deg,${t.sw[0]},${t.sw[1]})">${own ? '' : icon('lock', 18)}</span>${t.name}</button>`; }).join('')}</div>
          <div class="row wrap" style="margin-top:18px"><button class="btn small" id="replay">${icon('refresh', 16)}Replay intro</button><button class="btn small danger" id="reset">${icon('db', 16)}Reset data</button></div></section>
      </div></div>`;

    root.querySelectorAll('input[data-set]').forEach((el) => {
      el.addEventListener('change', () => {
        const v = el.type === 'checkbox' ? el.checked : el.type === 'range' ? Number(el.value) : el.value;
        A.updateSettings((st) => setPath(st, el.dataset.set, v)); sfx('click'); render();
      });
      if (el.type === 'range') el.addEventListener('input', () => { el.parentElement.querySelector('.val-label').textContent = el.value + el.dataset.unit; });
    });
    root.querySelectorAll('button[data-set]').forEach((b) => {
      b.onclick = () => { const raw = b.dataset.val; A.updateSettings((st) => setPath(st, b.dataset.set, isNaN(raw) ? raw : Number(raw))); sfx('click'); render(); };
    });
    root.querySelectorAll('[data-theme]').forEach((b) => { b.onclick = () => { if (store.get().owned.theme.includes(b.dataset.theme)) { A.setTheme(b.dataset.theme); sfx('click'); render(); } else toast({ icon: icon('lock', 26), title: 'Locked', text: 'Unlock it in the shop' }); }; });
    root.querySelector('#test-n').onclick = () => { invoke('notify', { title: 'Wobble', body: `${s.name} says hi` }); toast({ icon: icon('bell', 26), title: 'Notification sent' }); };
    root.querySelector('#replay').onclick = () => store.mutate((st) => { st.onboarded = false; });
    root.querySelector('#reset').onclick = async () => {
      const ok = await modal({ title: 'Reset all data?', big: icon('db', 44), body: '<div class="muted">Your pet, items, achievements and log are deleted. This cannot be undone.</div>', buttons: [{ label: 'Cancel', value: false, primary: true }, { label: 'Reset', value: true, danger: true }] });
      if (ok) await store.reset();
    };
  }
  render();
  // Settings never re-renders from background ticks (it would steal focus); only from its own changes.
  return { update() {} };
}
