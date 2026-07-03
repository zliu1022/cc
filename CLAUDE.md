# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A mobile web app for logging daily **Convict Conditioning** (囚徒健身) bodyweight workouts. Six exercises — `PUSHUP`, `BRIDGE`, `LEGRAISE`, `SQUAT`, `PULLUP`, `HANDSTAND` (plus a hidden `BASIN`/pelvic-floor one) — each with 10 progression levels ("式"). A user logs, per day and level, three sets of reps (`N1`/`N2`/`N3`) plus a free-text `Comment`. The app also includes a "212" tempo trainer that plays audio cues to pace positive/hold/negative reps, and an exercise-encyclopedia page.

There is **no build system, no package.json, and no tests.** It is a static frontend, now also packaged as an installable **PWA with on-device (IndexedDB) storage**. The original Node/lowdb backend + nginx still exist under `nodejs/` and `nginx/` but are **no longer required** by the app.

## Running

The app is self-contained static files under `cc/`. Because it uses a service worker + IndexedDB, it must be served over **HTTPS or `http://localhost`** (not `file://`).

- **Local dev:** `cd cc && python3 -m http.server 8899`, then open `http://localhost:8899/train.html`.
- **Hosting / install:** serve the `cc/` folder from any static HTTPS host (e.g. GitHub Pages), open in mobile Safari, then **Share → Add to Home Screen**. Runs standalone and fully offline; all data stays on the device.
- **Legacy backend (optional, not used by the app):** `cd nodejs && node server.js` — Express on port **32000** + lowdb JSON files; `nginx/nginx.conf` proxied `location ^~ /db/ → 127.0.0.1:32000/`. `nodejs/server.js` still has hardcoded Windows `require()` paths and the old synchronous lowdb v0.x/1.0 chaining API — see "Backend architecture" below for the data contract the local layer now reimplements.

## PWA / local storage (the current data layer)

The app talks to a "backend" through `$.ajax({url:'/db/...'})` calls. **`cc/js/db.js`** replaces that backend entirely, on-device:

- It exposes `window.CCDB` (an IndexedDB wrapper) **and** monkey-patches `$.ajax` so any URL starting with `/db/` is rerouted to IndexedDB instead of the network. This is why `train.js`'s AJAX-based UI logic was left almost untouched — the adapter preserves the old server's `success(data)`/`error` callback contract, including jQuery's `context`→`this` binding (needed by the progress-cell loop). Load order matters: **jQuery → db.js → train.js**.
- **Store:** one object store `records`, composite key `[user, table, Year, Month, Day, Level]`, index `by_user_table`. So upsert = `put` (overwrite by key), delete = `delete`. `user` = the Prison No. (data partition), `table` = exercise name. The adapter mirrors the old server's delete semantics: a POST with all of `N1/N2/N3` empty/zero deletes; otherwise it upserts.
- **Login is now local.** Any non-empty Prison No. logs in (password ignored); it just selects the IndexedDB partition. Login state + active user persist in `localStorage` (`localStorage.login`, `localStorage.ccuser`), so the app skips the login dialog on relaunch. (The old build used `sessionStorage` + hardcoded credentials `0027`/`123`, `bb`, `guest`.)
- **Offline:** `cc/sw.js` precaches the whole app shell (list built from a `find` over `cc/`). **Bump `CACHE` (`cc-vN`) whenever you change static files**, or the service worker keeps serving the old copies. `cc/manifest.json` + apple-touch-icon meta make it installable; icons `img/icon-{180,192,512}.png` were generated from `img/login.png`.

⚠️ **No Web SQL.** The old `openDatabase(...)` calls were removed — Web SQL is gone from modern Safari and would crash the page on boot. The large commented-out Web SQL blocks in `train.js` (and the dead `updatedisplay()` function) are inert; do not revive them.

### Legacy backend architecture (`nodejs/server.js`) — reference for the data contract

- **Per-user databases.** Each "prison number" maps to its own lowdb file (`<name>.json`, e.g. `0027.json`, `guest.json`). `ex.json` is the default (empty `{}`) db loaded at boot. `GET /newdb?Name=&Password=` switches the active db to `<Name>.json`, creating it and seeding empty tables via `db.defaults(...)` if new.
- **Tables** are the seven exercise names; each is an array of record objects `{Year, Month, Day, Level, N1, N2, N3, Comment}`.
- **Routing is path-based on a shared mutable `table` variable.** `GET|POST /<EXERCISE>` first points the global `table` at that exercise's collection, then acts on it. Because `table` is process-global state mutated per request, two concurrent clients hitting different exercises can race — this is a known single-user-at-a-time design, called out in the code's Chinese comments.
- **Reads** (`GET /<EXERCISE>`): with `Year`/`Month`/`Day` query params → that day's records (top 10 by Level desc); otherwise → all records sorted by date+level desc.
- **Writes** (`POST /<EXERCISE>`, urlencoded body): keyed by `Year/Month/Day/Level`. If any of `N1/N2/N3` is nonzero → upsert (find-and-`assign`, else `push`). If all three are empty/zero → **delete** that record. (The frontend deletes by POSTing a record with empty rep fields.)
- **JSONP:** every response honors a `?callback=` param and wraps the JSON accordingly, so cross-origin `GET`s work as JSONP. Errors return `{result:"error", remark:"..."}`; success reads return the record array (or `response_ok` for commands).
- **Admin/seed helpers:** `GET /newtable`, `/deltable` (empties current table), `/addrecord` (pushes a full year of demo rows) — used for setup/testing, not by normal app flow.

## Frontend architecture (`cc/`)

- **`train.html` + `cc/js/train.js`** — the tracker. WeUI-styled mobile UI, **jQuery 1.8.3**, all backend calls are JSONP `GET`s and form-encoded `POST`s to `/db/...`. No framework, no modules.
- **`teach.html`** — static Bootstrap-based exercise encyclopedia ("Wiki"), reachable from the tracker.
- **Login/session:** the login dialog posts the prison number to `/db/newdb` and sets `sessionStorage.login`. Hardcoded accepted logins: `0027`/password `123`, `bb`, or `guest` (no password).
- **Client-side config arrays in `train.js`** (index-aligned to the 7 exercises) drive most UI. When adding/renaming an exercise or level you must keep all of these in sync:
  - `cclist` — exercise keys (must match backend table names).
  - `ccimglist` — image filename prefixes (`fwc`, `q`, `jt`, `sd`, `ytxs`, `dlc`, `dlc`); level images are `img/<prefix><level>.png` (`fwc1.png`…`fwc10.png`).
  - `ccdetail` — the 10 Chinese level names per exercise.
  - `cclevelcount` — target rep totals per level (used to render "Level N: done/target" progress).
  - `level_time` — default "212" tempo (prepare/positive/hold/negative/interval seconds) per exercise.
  - `plan` — weekday→exercise schedule (index 0 = Sunday); today's exercise cell is highlighted.
- **"212" tempo trainer.** There are **two** implementations in `train.js`: the `jsq` object (simple `setInterval` timing) and the `#sound-play` handler (an audio-`onended`-driven state machine, `status` 0→4, that self-corrects drift against `Date.now()` timestamps — the more accurate one). Both play `cc/sound/counting_1.*` (move) and `counting_2.*` (hold). Timing is configurable via the "212设置" dialog.
- **Legacy local storage:** large commented-out blocks use the Web SQL `openDatabase` API — an earlier offline version. The app now uses the network backend exclusively; ignore/remove these rather than reviving them.

## Conventions

- Comments and UI strings are in Chinese; keep that convention when editing existing files.
- Sound/asset paths are root-relative (e.g. `/cc/sound/counting_1.mp3`), so the app expects to be served with `cc/` mounted at the web root under nginx.
