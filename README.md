# Madrid Tactics

Tactical breakdowns of Real Madrid's big games (Clásicos, derbies, Champions League knockouts):

- **Dashboard** (`index.html`): the latest game's numbers, goals, tactical keys and the season's big games, with the winning goal drawn on a board.
- **Tactics board** (`tactics.html`): every Madrid goal replayed move by move, with a record mode for screen captures.
- **Match graphic** (`match.html`): a 1080×1350 picture of each game for Instagram, downloadable as PNG.

## Download

**[⬇ Download the latest version (ZIP)](https://github.com/fadri788/madrid-tactics/archive/refs/heads/main.zip)**

Unzip it and open `index.html` with Live Server (see below).

## Run it

No npm, no build step: plain HTML, CSS and JavaScript.

1. Unzip the download and open the folder in VS Code.
2. Install the **Live Server** extension, right-click `index.html`, **Open with Live Server**.

Open it through Live Server (or any web server), not by double-clicking: the pages use JavaScript modules, which browsers block on `file://`.

### Install as an app

The site is a PWA. Open it through Live Server in Chrome and click **Install app** in the top bar. It then has its own window and works offline.

## Add a new game

1. Copy the game object in `js/data.js` and change the values (`id`, score, stats, `goals`, `keys`, `motm`).
   - `result`: `"W"`, `"D"` or `"L"`
   - `team` in `goals`: `"madrid"` or `"opponent"`; add `board: "<board id>"` to link a goal to its board
   - `verdict` in `keys`: `"worked"`, `"mixed"` or `"failed"`
2. Add the goal boards to `js/boards.js`. Madrid always attack to the right, Madrid's right wing is the bottom of the pitch (1050×680), the goal is at x = 1050, y = 304–376. Add `up: true` to a player whose name overlaps someone.
3. Optional stadium picture: put it in `img/stadiums/`, add it as a data URI to `js/stadiums.js` and set `stadiumImg` on the game.
4. New file? Add it to `CORE` in `sw.js` and bump `CACHE`, so the app picks it up.

The dashboard always shows the game with the newest date.

## Files

| Path | What it is |
|---|---|
| `index.html`, `js/dashboard.js`, `css/dashboard.css` | Dashboard |
| `tactics.html`, `js/tactics.js`, `css/tactics.css` | Tactics board |
| `match.html`, `js/match.js`, `css/match.css` | Match graphic |
| `js/data.js`, `js/boards.js`, `js/stadiums.js` | All the data |
| `css/theme.css` | Shared colours and fonts |
| `assets/` | Design kit from [taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT), don't edit |
| `fonts/` | SUSE and JetBrains Mono, self-hosted (SIL Open Font License) |
| `js/vendor/html-to-image.js` | Makes the PNG (MIT) |
| `manifest.webmanifest`, `sw.js`, `js/pwa.js`, `icons/` | App install and offline |

Board positions are read from broadcast highlights, so they're approximate.
