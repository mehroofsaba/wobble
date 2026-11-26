# Wobble

*A little desktop companion for your everyday.*

Wobble is a cozy desktop pet built with **Tauri 2, Rust, vanilla JavaScript, HTML, CSS, and SQLite**. Keep a tiny companion nearby, look after its needs, decorate its space, play quick mini-games, and keep a journal — all from a lightweight Windows desktop app.

> Windows is the primary target for this project.

## Features

- **A living little pet** — six needs, eight moods, personality traits, favourite and disliked foods, feeding, sleep scheduling, and random events.
- **A desktop companion window** — a transparent, frameless pet window with dragging, quick interactions, idle awareness, and native notifications.
- **Make its space yours** — six rooms, decoration slots, themes, accessories, coats, and a shop with unlockable items.
- **Little games and rewards** — Pond Fishing, Heart Match, Cloud Hop, and Star Catcher, with XP, levels, daily rewards, streaks, and achievements.
- **A place to write** — a private journal for notes and entries.
- **A setup that stays yours** — onboarding, settings, a system tray, and local save data.

## Screens and structure

Wobble has two windows that share the same save data:

| Window | What it does |
| --- | --- |
| **Hub** | Home room, games, shop, customization, journal, settings, and onboarding |
| **Pet** | The floating companion, quick menu, idle awareness, and pet interactions |

The app uses original inline SVG artwork for its character, rooms, decorations, icons, and game art.

## Getting started

### Requirements

- [Node.js](https://nodejs.org/) 18 or newer
- [Rust](https://rustup.rs/)
- On Windows: Microsoft C++ Build Tools and the WebView2 runtime
- Tauri's platform prerequisites: [Tauri v2 setup guide](https://v2.tauri.app/start/prerequisites/)

### Run the desktop app

Clone the repository, open a terminal in the project folder, and run:

~~~bash
npm install
npm run dev
~~~

To bundle the Gaegu font for offline use, run the optional font script:

~~~bash
node scripts/get-fonts.mjs
~~~

### Build a Windows installer

~~~bash
npm run build
~~~

The NSIS installer is generated under:

~~~text
src-tauri/target/release/bundle/nsis/
~~~

### Preview the interface without the Rust desktop shell

~~~bash
npm run preview
~~~

Then open [http://localhost:5173/](http://localhost:5173/) for the hub or [http://localhost:5173/pet.html](http://localhost:5173/pet.html) for the pet window. Preview mode uses browser localStorage as its data fallback; the desktop app uses SQLite.

### Run project checks

~~~bash
npm run check
~~~

This runs the repository's JavaScript and JSON syntax checks.

## Back up and reset your data

The desktop app stores your pet state, journal entries, and achievements in a SQLite database named `wobble.db` inside the operating system's application data directory.

To make a backup, **fully quit Wobble** and copy `wobble.db` to a safe location. To restore it, quit Wobble and replace the current database file with your backup. Keep a separate copy before replacing anything.

**Important:** Closing the Hub window does not quit the desktop app; it hides Wobble in the system tray. Before copying or replacing the database, use the Wobble tray menu and choose **Quit** so the database connection is closed and pending writes are finished.

You can also reset the app from **Settings → Appearance → Reset data**. This permanently deletes your pet state, owned items, achievements, and journal entries.

When using browser preview mode (`npm run preview`), data is stored in that browser's `localStorage` instead of `wobble.db`.

## Tech stack

| Area | Technology |
| --- | --- |
| Desktop shell | Tauri 2 |
| Native backend | Rust |
| Frontend | HTML, CSS, and vanilla JavaScript modules |
| Local database | SQLite via rusqlite |
| Artwork | Inline SVG |

## Project layout

~~~text
src/
  css/          Base styles, themes, hub, and pet-window styles
  js/
    core/       Shared data, state store, and Tauri bridge
    engine/     Pet behaviour, actions, audio, notifications, progression
    games/      Individual mini-games and game registry
    pages/      Hub pages
    ui/         Reusable UI, pet, room, icons, and effects
  index.html    Main hub window
  pet.html      Floating pet window
src-tauri/
  src/          Rust commands and application setup
  icons/        App and installer icons
docs/
  ARCHITECTURE.md
~~~

For the window responsibilities, state flow, database layout, and guidance for adding content or mini-games, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Privacy and storage

Wobble is designed to keep its companion data on the device. The desktop app stores its save data and journal in a SQLite database in the app's data directory. Browser preview mode uses localStorage instead.

Activity awareness uses the operating system's last-input time to estimate idle duration. It does not read keystrokes, window titles, files, or screen contents. The app does not send pet activity or journal content to a remote service.

## Contributing

Bug reports, thoughtful suggestions, and pull requests are welcome. For larger changes, opening an issue first helps discuss the approach before implementation.

When contributing, please keep changes focused and include clear steps to reproduce bugs or test new behaviour.
