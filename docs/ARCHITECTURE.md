# Wobble architecture

Two Tauri windows share one save-game:

| Window | File | Job |
|---|---|---|
| `pet` (transparent, frameless, always-on-top) | `src/pet.html`, `src/js/pet-window.js` | Pet behaviour, dragging, quick menu, idle awareness, random events, notifications, **owns the clock** (needs tick every 15 s) |
| `hub` (normal frameless window) | `src/index.html`, `src/js/hub.js` | Home room, games, shop, customize, journal, settings, onboarding |

Both load `core/store.js`, mutate state through `engine/actions.js`, and sync through Tauri events (`wobble:state`, `wobble:fx`). Every change is saved (debounced) to SQLite via the `db_set` command.

## Layers
- **Pet engine** `engine/pet-engine.js` - needs decay, moods, personality, speech, random events (pure logic)
- **Game engine** `games/*` + `pages/games.js` - registry, per-game modules, reward calculation
- **Customization** `core/data.js` (catalogue) + `ui/room.js` + `pages/shop.js` / `customize.js`
- **UI system** `css/*`, `ui/*`, `pages/*`
- **Rust** `src-tauri/src/lib.rs` - SQLite, tray, notifications, window control, click-through, idle seconds
- **SQLite** `wobble.db` in the app-data folder: `kv` (save-game JSON), `journal`, `achievements`

## Adding content
- New food / accessory / coat / decor / room / theme: add an entry in `core/data.js` (themes also need a block in `css/themes.css`; new accessory art goes in the `accessory()` switch in `ui/pet-svg.js`; decor art in `decorSvg()` in `ui/room.js`).
- New mini-game: add `games/<name>.js` exporting `meta` and `start(stage, api)`, register in `games/index.js`.

## Click-through
The Rust hit-test thread (50 ms) compares the cursor with rectangles the frontend reports (`pet_hit`) from elements with class `.hit`, and toggles `set_ignore_cursor_events`. Disable in Settings → Click-through if it misbehaves on your setup.

## Privacy
Activity awareness uses only `GetLastInputInfo` (seconds since last input). No keystrokes, window titles, files or screen content are read. Nothing is sent over the network.
