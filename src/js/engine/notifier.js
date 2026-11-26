// Native notification rules: helpful, rate-limited, never during quiet hours or while the user is away.
import * as store from '../core/store.js';
import { invoke } from '../core/tauri.js';
import { inWindow } from './pet-engine.js';
import { dayKey } from '../core/data.js';
import { dailyAvailable } from './progression.js';

export function checkNotifications(s, { away = false } = {}) {
  const cfg = s.settings.notifications;
  if (!cfg.enabled || away || s.sleeping) return null;
  const q = s.settings.quiet;
  if (q.enabled && inWindow(new Date(), q.from, q.to)) return null;
  const now = Date.now(); const cool = cfg.cooldown * 60000; const n = s.needs; const nm = s.name;
  const rules = [
    ['hungry', n.hunger < 22, `${nm} is getting hungry`, 'A snack would be lovely'],
    ['sleepy', n.energy < 18, `${nm} is sleepy`, 'Maybe it is time for a nap?'],
    ['bored', n.boredom < 20, `${nm} is bored`, 'Want to play a mini-game together?'],
    ['dirty', n.cleanliness < 20, `${nm} could use a wash`, 'A few bubbles would help'],
    ['sad', n.happiness < 25, `${nm} misses you`, 'A little cuddle would help.'],
  ];
  for (const [type, cond, title, body] of rules) {
    if (cfg[type] && cond && now - (s.notif.last[type] || 0) > cool) {
      store.mutate((st) => { st.notif.last[type] = now; });
      invoke('notify', { title, body });
      return { type, title, body };
    }
  }
  if (cfg.daily && dailyAvailable(s) && s.notif.last.dailyDay !== dayKey()) {
    store.mutate((st) => { st.notif.last.dailyDay = dayKey(); });
    invoke('notify', { title: 'Daily reward', body: `${nm} has a gift waiting for you.` });
    return { type: 'daily', title: 'Daily reward', body: 'a gift is waiting!' };
  }
  return null;
}
