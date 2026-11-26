//! Wobble - Rust / native layer.
//!
//! Responsibilities (see docs/ARCHITECTURE.md):
//!   * SQLite persistence (kv save-game, journal, achievements)
//!   * Native notifications
//!   * System tray
//!   * Pet window control (move, show/hide, always-on-top, click-through hit testing)
//!   * User idle detection (time since last input ONLY - no content is ever read)

use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, LogicalPosition, Manager, State, WebviewWindow, WindowEvent,
};
use tauri_plugin_notification::NotificationExt;

const SCHEMA: &str = "
CREATE TABLE IF NOT EXISTS kv (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS journal (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    ts   INTEGER NOT NULL,
    kind TEXT NOT NULL,
    text TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS achievements (
    id          TEXT PRIMARY KEY,
    unlocked_at INTEGER NOT NULL
);
";

struct Db(Mutex<Connection>);

#[derive(Default)]
struct HitState {
    /// Interactive rectangles [x, y, w, h] in logical px, relative to the pet window.
    rects: Vec<[f64; 4]>,
    dragging: bool,
    enabled: bool,
}
struct Hit(Arc<Mutex<HitState>>);

fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

fn err<E: std::fmt::Display>(e: E) -> String {
    e.to_string()
}

// ---------------------------------------------------------------- database

#[tauri::command]
fn db_get(db: State<Db>, key: String) -> Result<Option<String>, String> {
    let c = db.0.lock().map_err(err)?;
    c.query_row("SELECT value FROM kv WHERE key = ?1", params![key], |r| {
        r.get::<_, String>(0)
    })
    .optional()
    .map_err(err)
}

#[tauri::command]
fn db_set(db: State<Db>, key: String, value: String) -> Result<(), String> {
    let c = db.0.lock().map_err(err)?;
    c.execute(
        "INSERT INTO kv(key, value, updated_at) VALUES(?1, ?2, ?3)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
        params![key, value, now_ms()],
    )
    .map_err(err)?;
    Ok(())
}

#[tauri::command]
fn db_reset(db: State<Db>) -> Result<(), String> {
    let c = db.0.lock().map_err(err)?;
    c.execute_batch("DELETE FROM kv; DELETE FROM journal; DELETE FROM achievements;")
        .map_err(err)
}

#[derive(Serialize)]
struct JournalRow {
    ts: i64,
    kind: String,
    text: String,
}

#[tauri::command]
fn journal_add(db: State<Db>, kind: String, text: String) -> Result<(), String> {
    let c = db.0.lock().map_err(err)?;
    c.execute(
        "INSERT INTO journal(ts, kind, text) VALUES(?1, ?2, ?3)",
        params![now_ms(), kind, text],
    )
    .map_err(err)?;
    c.execute(
        "DELETE FROM journal WHERE id NOT IN (SELECT id FROM journal ORDER BY id DESC LIMIT 500)",
        [],
    )
    .map_err(err)?;
    Ok(())
}

#[tauri::command]
fn journal_list(db: State<Db>, limit: i64) -> Result<Vec<JournalRow>, String> {
    let c = db.0.lock().map_err(err)?;
    let mut stmt = c
        .prepare("SELECT ts, kind, text FROM journal ORDER BY id DESC LIMIT ?1")
        .map_err(err)?;
    let rows = stmt
        .query_map(params![limit], |r| {
            Ok(JournalRow {
                ts: r.get(0)?,
                kind: r.get(1)?,
                text: r.get(2)?,
            })
        })
        .map_err(err)?;
    let mut out = Vec::new();
    for row in rows {
        out.push(row.map_err(err)?);
    }
    Ok(out)
}

#[derive(Serialize)]
struct AchRow {
    id: String,
    unlocked_at: i64,
}

/// Returns true when the achievement was newly unlocked.
#[tauri::command]
fn ach_unlock(db: State<Db>, id: String) -> Result<bool, String> {
    let c = db.0.lock().map_err(err)?;
    let n = c
        .execute(
            "INSERT OR IGNORE INTO achievements(id, unlocked_at) VALUES(?1, ?2)",
            params![id, now_ms()],
        )
        .map_err(err)?;
    Ok(n > 0)
}

#[tauri::command]
fn ach_list(db: State<Db>) -> Result<Vec<AchRow>, String> {
    let c = db.0.lock().map_err(err)?;
    let mut stmt = c
        .prepare("SELECT id, unlocked_at FROM achievements ORDER BY unlocked_at")
        .map_err(err)?;
    let rows = stmt
        .query_map([], |r| {
            Ok(AchRow {
                id: r.get(0)?,
                unlocked_at: r.get(1)?,
            })
        })
        .map_err(err)?;
    let mut out = Vec::new();
    for row in rows {
        out.push(row.map_err(err)?);
    }
    Ok(out)
}

// ----------------------------------------------------------- notifications

#[tauri::command]
fn notify(app: AppHandle, title: String, body: String) -> Result<(), String> {
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(err)
}

// ---------------------------------------------------------- idle detection

#[cfg(windows)]
fn idle_impl() -> u64 {
    use windows_sys::Win32::System::SystemInformation::GetTickCount;
    use windows_sys::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};
    unsafe {
        let mut info = LASTINPUTINFO {
            cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32,
            dwTime: 0,
        };
        if GetLastInputInfo(&mut info) != 0 {
            let tick = GetTickCount();
            return (tick.wrapping_sub(info.dwTime) / 1000) as u64;
        }
        0
    }
}

#[cfg(not(windows))]
fn idle_impl() -> u64 {
    0
}

/// Seconds since the last keyboard / mouse input. Nothing else is observed.
#[tauri::command]
fn idle_seconds() -> u64 {
    idle_impl()
}

// ------------------------------------------------------------- pet window

fn pet_win(app: &AppHandle) -> Result<WebviewWindow, String> {
    app.get_webview_window("pet")
        .ok_or_else(|| "pet window not found".to_string())
}

#[tauri::command]
fn pet_move(app: AppHandle, x: f64, y: f64) -> Result<(), String> {
    pet_win(&app)?
        .set_position(LogicalPosition::new(x, y))
        .map_err(err)
}

#[tauri::command]
fn pet_get_pos(app: AppHandle) -> Result<(f64, f64), String> {
    let w = pet_win(&app)?;
    let p = w.outer_position().map_err(err)?;
    let s = w.scale_factor().map_err(err)?;
    Ok((p.x as f64 / s, p.y as f64 / s))
}

#[tauri::command]
fn pet_set_visible(app: AppHandle, visible: bool) -> Result<(), String> {
    let w = pet_win(&app)?;
    if visible {
        w.show().map_err(err)
    } else {
        w.hide().map_err(err)
    }
}

#[tauri::command]
fn pet_set_on_top(app: AppHandle, on: bool) -> Result<(), String> {
    pet_win(&app)?.set_always_on_top(on).map_err(err)
}

#[tauri::command]
fn pet_hit(hit: State<Hit>, rects: Vec<[f64; 4]>) {
    if let Ok(mut h) = hit.0.lock() {
        h.rects = rects;
    }
}

#[tauri::command]
fn pet_drag(hit: State<Hit>, dragging: bool) {
    if let Ok(mut h) = hit.0.lock() {
        h.dragging = dragging;
    }
}

#[tauri::command]
fn pet_clickthrough(hit: State<Hit>, enabled: bool) {
    if let Ok(mut h) = hit.0.lock() {
        h.enabled = enabled;
    }
}

/// Lets mouse clicks pass through the transparent parts of the pet window.
/// Polls the cursor every 50 ms (cheap) and compares it with the interactive
/// rectangles the frontend reports.
fn spawn_hit_thread(app: AppHandle, hit: Arc<Mutex<HitState>>) {
    std::thread::spawn(move || {
        let mut last: Option<bool> = None;
        loop {
            std::thread::sleep(Duration::from_millis(50));
            let Some(win) = app.get_webview_window("pet") else {
                continue;
            };
            if !win.is_visible().unwrap_or(false) {
                continue;
            }
            let (rects, dragging, enabled) = match hit.lock() {
                Ok(h) => (h.rects.clone(), h.dragging, h.enabled),
                Err(_) => continue,
            };
            let want_ignore = if !enabled || dragging || rects.is_empty() {
                false
            } else {
                match (win.cursor_position(), win.outer_position(), win.scale_factor()) {
                    (Ok(c), Ok(p), Ok(s)) => {
                        let x = (c.x - p.x as f64) / s;
                        let y = (c.y - p.y as f64) / s;
                        !rects
                            .iter()
                            .any(|r| x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3])
                    }
                    _ => false,
                }
            };
            if last != Some(want_ignore) {
                let _ = win.set_ignore_cursor_events(want_ignore);
                last = Some(want_ignore);
            }
        }
    });
}

// --------------------------------------------------------------- hub window

fn show_hub(app: &AppHandle) {
    if let Some(w) = app.get_webview_window("hub") {
        let _ = w.show();
        let _ = w.unminimize();
        let _ = w.set_focus();
    }
}

#[tauri::command]
fn hub_show(app: AppHandle) {
    show_hub(&app);
}

#[tauri::command]
fn hub_hide(app: AppHandle) {
    if let Some(w) = app.get_webview_window("hub") {
        let _ = w.hide();
    }
}

#[tauri::command]
fn hub_minimize(app: AppHandle) {
    if let Some(w) = app.get_webview_window("hub") {
        let _ = w.minimize();
    }
}

#[tauri::command]
fn hub_toggle_max(app: AppHandle) {
    if let Some(w) = app.get_webview_window("hub") {
        if w.is_maximized().unwrap_or(false) {
            let _ = w.unmaximize();
        } else {
            let _ = w.maximize();
        }
    }
}

#[tauri::command]
fn quit_app(app: AppHandle) {
    app.exit(0);
}

// --------------------------------------------------------------------- tray

fn build_tray(app: &AppHandle) -> tauri::Result<()> {
    let open = MenuItem::with_id(app, "open", "Open Wobble", true, None::<&str>)?;
    let toggle = MenuItem::with_id(app, "toggle", "Show / hide pet", true, None::<&str>)?;
    let feed = MenuItem::with_id(app, "feed", "Feed a snack", true, None::<&str>)?;
    let play = MenuItem::with_id(app, "play", "Play together", true, None::<&str>)?;
    let sleep = MenuItem::with_id(app, "sleep", "Sleep / wake", true, None::<&str>)?;
    let quiet = MenuItem::with_id(app, "quiet", "Toggle quiet mode", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit Wobble", true, None::<&str>)?;
    let sep1 = PredefinedMenuItem::separator(app)?;
    let sep2 = PredefinedMenuItem::separator(app)?;
    let menu = Menu::with_items(
        app,
        &[&open, &toggle, &sep1, &feed, &play, &sleep, &quiet, &sep2, &quit],
    )?;

    let mut builder = TrayIconBuilder::with_id("main")
        .tooltip("Wobble")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "quit" => app.exit(0),
            "open" => show_hub(app),
            other => {
                let _ = app.emit("tray", other.to_string());
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                show_hub(tray.app_handle());
            }
        });
    if let Some(icon) = app.default_window_icon() {
        builder = builder.icon(icon.clone());
    }
    builder.build(app)?;
    Ok(())
}

// ---------------------------------------------------------------------- run

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&dir)?;
            let conn = Connection::open(dir.join("wobble.db"))?;
            conn.execute_batch(SCHEMA)?;
            app.manage(Db(Mutex::new(conn)));

            let hit = Arc::new(Mutex::new(HitState {
                enabled: true,
                ..Default::default()
            }));
            app.manage(Hit(hit.clone()));
            spawn_hit_thread(app.handle().clone(), hit);

            build_tray(app.handle())?;
            Ok(())
        })
        .on_window_event(|window, event| {
            // Closing the main window tucks Wobble into the tray instead of quitting.
            if window.label() == "hub" {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            db_get,
            db_set,
            db_reset,
            journal_add,
            journal_list,
            ach_unlock,
            ach_list,
            notify,
            idle_seconds,
            pet_move,
            pet_get_pos,
            pet_set_visible,
            pet_set_on_top,
            pet_hit,
            pet_drag,
            pet_clickthrough,
            hub_show,
            hub_hide,
            hub_minimize,
            hub_toggle_max,
            quit_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running Wobble");
}
