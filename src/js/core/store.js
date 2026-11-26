// Single source of truth for the save-game. Both windows (pet + hub) hold a copy;
// every mutation is persisted through Rust/SQLite and broadcast to the other window.
import { invoke, listen, emit } from './tauri.js';
import { defaultState, migrate } from './data.js';

const SRC = Math.random().toString(36).slice(2);
let state = null;
let saveTimer = null;
const subs = new Set();
const fxHandlers = new Set();

export const get = () => state;
export const subscribe = (cb) => { subs.add(cb); return () => subs.delete(cb); };
const fire = (remote = false) => subs.forEach((cb) => { try { cb(state, remote); } catch (e) { console.error(e); } });

export async function init() {
  const raw = await invoke('db_get', { key: 'save' });
  let loaded = null;
  if (raw) { try { loaded = migrate(JSON.parse(raw)); } catch (e) { console.warn('bad save, starting fresh', e); } }
  state = loaded || defaultState();
  await listen('wobble:state', (m) => { if (m.src === SRC) return; state = m.state; fire(true); });
  await listen('wobble:fx', (m) => { if (m.src === SRC) return; fxHandlers.forEach((h) => h(m.type, m.payload, true)); });
  window.addEventListener('beforeunload', flush);
  if (!loaded) save();
  return state;
}

function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 300);
}
export function flush() {
  clearTimeout(saveTimer);
  if (state) invoke('db_set', { key: 'save', value: JSON.stringify(state) });
}

/** Change the state. `fn` mutates the draft in place. */
export function mutate(fn) {
  fn(state);
  state.rev = (state.rev || 0) + 1;
  save();
  emit('wobble:state', { src: SRC, state });
  fire(false);
}

export async function reset() {
  await invoke('db_reset');
  state = defaultState();
  emit('wobble:state', { src: SRC, state });
  save();
  fire(false);
}

/** Visual/audio effect event (eat, play, levelup ...). Played locally and in the other window. */
export function fx(type, payload = {}) {
  fxHandlers.forEach((h) => h(type, payload, false));
  emit('wobble:fx', { src: SRC, type, payload });
}
export const onFx = (cb) => { fxHandlers.add(cb); return () => fxHandlers.delete(cb); };

export function journal(kind, text) { invoke('journal_add', { kind, text }); }
