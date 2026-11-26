// Bridge to the Tauri backend. Falls back to localStorage + BroadcastChannel when the
// frontend is opened in a plain browser (handy for `npm run preview` and design work).
const T = window.__TAURI__;
export const isTauri = !!(T && T.core);

const ls = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem('wobble:' + k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem('wobble:' + k, JSON.stringify(v)),
};

const fallback = {
  db_get: ({ key }) => localStorage.getItem('wobble:kv:' + key),
  db_set: ({ key, value }) => localStorage.setItem('wobble:kv:' + key, value),
  db_reset: () => Object.keys(localStorage).filter((k) => k.startsWith('wobble:')).forEach((k) => localStorage.removeItem(k)),
  journal_add: ({ kind, text }) => { const l = ls.get('journal', []); l.unshift({ ts: Date.now(), kind, text }); ls.set('journal', l.slice(0, 500)); },
  journal_list: ({ limit }) => ls.get('journal', []).slice(0, limit),
  ach_unlock: ({ id }) => { const l = ls.get('ach', {}); if (l[id]) return false; l[id] = Date.now(); ls.set('ach', l); return true; },
  ach_list: () => Object.entries(ls.get('ach', {})).map(([id, unlocked_at]) => ({ id, unlocked_at })),
  idle_seconds: () => 0,
  pet_get_pos: () => [100, 100],
  notify: ({ title, body }) => {
    if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body });
  },
};

export async function invoke(cmd, args = {}) {
  if (isTauri) {
    try { return await T.core.invoke(cmd, args); }
    catch (e) { console.warn('[wobble] invoke failed:', cmd, e); return null; }
  }
  const f = fallback[cmd];
  return f ? f(args) : null;
}

const bc = !isTauri && 'BroadcastChannel' in window ? new BroadcastChannel('wobble') : null;
const bcHandlers = new Map();
if (bc) bc.onmessage = (e) => (bcHandlers.get(e.data.name) || []).forEach((h) => h(e.data.payload));

export async function listen(name, cb) {
  if (isTauri) return T.event.listen(name, (e) => cb(e.payload));
  if (!bcHandlers.has(name)) bcHandlers.set(name, []);
  bcHandlers.get(name).push(cb);
  return () => {};
}

export async function emit(name, payload) {
  if (isTauri) return T.event.emit(name, payload);
  if (bc) bc.postMessage({ name, payload });
}
