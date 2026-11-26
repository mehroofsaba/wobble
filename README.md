# Wobble ♡ - your little desktop companion

Tauri 2 + Rust + HTML/CSS/JS + SQLite. Windows first.

## Run
Prerequisites: [Rust](https://rustup.rs), Node 18+, and the WebView2 runtime + MSVC build tools on Windows ([Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)).

```bash
npm install
node scripts/get-fonts.mjs     # optional: bundle the Gaegu font for offline use
npm run dev                    # desktop app
npm run build                  # Windows installer (NSIS) in src-tauri/target/release/bundle
```

Design / UI work without Rust: `npm run preview`, then open http://localhost:5173/ (hub) and /pet.html (pet). Data falls back to localStorage in that mode.
`npm run check` syntax-checks all JS/JSON.

## What's inside
All artwork and icons are inline SVG (no emoji, no icon font): `src/js/ui/icons.js` (icons, food art, mood faces, game art), `ui/pet-svg.js` (character), `ui/room.js` (rooms + decor).

Pet with 6 needs + 8 moods + personality (favourite/disliked food) · feeding · sleep schedule · interactive bubble cleaning · random events · 4 mini-games (Pond Fishing, Heart Match, Cloud Hop, Star Catcher) · XP/levels, daily rewards + streaks, 22 achievements · shop (food, accessories, coats, decor, rooms, themes) · 6 rooms with decoration slots · 6 themes · native notifications with quiet hours · activity awareness · system tray · onboarding · settings · SQLite persistence.

See `docs/ARCHITECTURE.md`.

## Notes / decisions to confirm
- **Database:** the table said "Supabase or Neon"; the blueprint says local SQLite. This build uses local SQLite (works offline, private). Cloud sync can be added later behind `db_get`/`db_set`.
- **Frontend:** plain JS modules, no framework.
- **Art:** the character, rooms and decor are original SVG drawings made for this project, in the spirit of your reference images but not copies. Swap in your own illustrated assets by editing `ui/pet-svg.js` / `ui/room.js`.
- **Icons:** generated placeholders in `src-tauri/icons` (`npx tauri icon yourlogo.png` to replace).
- **Boredom meter:** a fuller bar means *less* bored (like the other bars).
