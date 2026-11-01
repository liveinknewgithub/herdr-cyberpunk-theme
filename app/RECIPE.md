# Night City

The Herdr window redrawn as a Cyberpunk 2077 menu screen. Neon yellow
`#FCEE0A` sits on near-black `#07080A`, and cyan and red are the only other
voices. Text is uppercase Rajdhani. Every active thing has a cut corner: the
yellow active tab, the olive rows for the active space and focused agent, the
red NEEDS YOU tag and the `+` menu's frame. Hazard stripes cap the status bar
and sit above the sidebar footer. The brand block shows a yellow ram mark and
a glitched `HERDR` wordmark split cyan over red. Terminals keep the person's
own terminal font.

![Night City](preview.png)

## What you see

Left to right: a 268 px sidebar, then the work column. A 1 px `#2A2B2F`
divider runs between them. The window has no system title bar, and the macOS
traffic lights sit at (12, 16).

**Colors** (theme `cyberpunk-2077`): canvas and terminal background
`#07080A`, chrome (sidebar, bars, popovers) `#0C0D11`, surface `#121318`,
raised `#1A1B21`, hover `#1F2027`, selected (olive) `#2A2708`, border
`#2A2B2F`, input `#3A3B40`. Text is foreground `#F0EEE4`, muted `#9A9B8E` or
dim `#5A5B52`. Accent and solid are `#FCEE0A`, with `#07080A` text on them.
Status colors: working `#FCEE0A`, blocked `#FF003C`, done `#55EAD4`, idle
`#5EF38C`, unknown `#5A5B52`. Terminal: cursor `#FCEE0A`, selection
`#4A4410`, and the ANSI colors are `#1A1B21 #FF003C #5EF38C #FCEE0A #3D9BFF
#FF2BD6 #00F0FF #B8B6A6`, brights `#5A5B52 #FF5980 #8CFFB0 #FDF460 #77BEFF
#FF75E4 #7FF7FF #F0EEE4`.

**Type:** the chrome uses Rajdhani (Medium, SemiBold, Bold). Headers, tabs,
buttons and readouts are uppercase with no added letter-spacing, while space
and agent names stay as typed. Terminals keep the person's own font with
14 × 12 px padding.

### Sidebar (268 px, `#0C0D11`)

- **Brand block, 46 px.** A 1 px `#FCEE0A` line runs along its bottom edge,
  the full sidebar width. On macOS the content starts 76 px in, clear of the
  traffic lights (14 px elsewhere). Then come:
  - the ram mark, 22 px, `#FCEE0A`: a flat ram head with a curled horn and a
    `›_` prompt cut out of the face.
  - the wordmark `HERDR`, 17 px bold, on an 18 px line, in `#FCEE0A`. Behind
    it sits a `#00F0FF` copy shifted (−1.5, −1) that shows only its top 9 px,
    and a `#FF003C` copy shifted (+1.5, +1) that shows only its bottom half.
    It doesn't move.
  - under the wordmark, `▚▞ NIGHT CITY` at 9.5 px in `#5A5B52`.
  - at the right, two 26 px square buttons, search and sidebar toggle, with
    15 px icons in `#5A5B52`. Hovered, they turn `#FCEE0A` on `#1F2027`.

  Dragging the block moves the window.
- **SPACES** (shares the middle equally with Agents, at least 90 px each):
  - The header is 31 px tall: a 2 × 10 px `#FCEE0A` tick, then `SPACES` at
    11 px bold in `#5A5B52`. A `+` button in `#FCEE0A` sits at the right.
  - Rows are 30 px tall (28 px for worktree rows) with square corners. Hovered,
    a row turns `#1F2027`.
  - The active row is `#2A2708` with a 2 px `#FCEE0A` bar down its left edge.
    Its bottom-right corner is cut 8 px.
  - Each space has an avatar: an 18 px square with the space's first letter
    at 10.5 px bold. Its bottom-right corner is cut 6 px in the row's own
    color. Each new space gets the least-used avatar color from `#00F0FF`,
    `#FCEE0A`, `#3D9BFF`, `#C77DFF`, `#5EF38C`, `#FF003C`. The letter is `#07080A` on cyan, yellow and green,
    and `#F0EEE4` on the rest.
  - The name is 13.5 px semibold in `#F0EEE4`, then a dim 11.5 px git tail
    (repo · branch only where unusual), ahead `↑N` in `#5EF38C`, behind `↓N`
    in `#FF003C`.
  - When another machine is known, rows group under 26 px machine headers in
    caps, each with a 6 px connected square (`#5EF38C`, or dim when away).
- **AGENTS:**
  - A 1 px `#2A2B2F` line runs on top. The 31 px header matches Spaces, with
    the sort icon (14 px, `#5A5B52`) at the right.
  - Group headers are 30 px, 11 px bold caps, each in its status color:
    `NEEDS YOU` `#FF003C`, `DONE` `#55EAD4`, `WORKING` `#FCEE0A`, `IDLE`
    `#5A5B52`, `PINNED` `#FCEE0A`. The count follows in `#5A5B52`. In the
    Grouped-by-space view the headers are space names in `#5A5B52`.
  - Rows are 30 px tall: a 16 px program icon, the name at 13 px, the time
    since the last change (`31m`) at 11 px dim, then the status mark.
  - The focused agent's row is styled like the active space row: `#2A2708`,
    the 2 px yellow bar and the 8 px cut.
  - Sub-agents hang under their parent in 26 px rows with tree lines.
- **Footer, 69 px.** On top is a 4 px hazard stripe of `#FCEE0A` diagonals
  (6 px wide, every 12 px), then a 1 px `#2A2B2F` line. Below are the
  `SETTINGS` (`#9A9B8E`) and `ADD MACHINE` (`#5A5B52`) rows: 28 px, 13 px
  bold caps, 14 px icons. When an app update is ready, a 6 px `#FCEE0A`
  square follows SETTINGS.

### Work column

- **Tab bar, 42 px, `#0C0D11`.** A 1 px `#2A2B2F` bottom line runs across.
  Over it, a 1 px `#FCEE0A` run 180 px long starts under the first tab.
  - Tabs are 29 px tall with 12 px side padding and a 3 px gap between them.
    Labels are 12.8 px bold caps reading `NN · NAME`, where `NN` is the
    1-based index zero-padded (`01 · CLAUDE CODE`, `Z` after a zoomed tab's
    name). The label is cut off at 170 px.
  - The active tab is solid `#FCEE0A` with `#07080A` text, program icon,
    spinner and a 12 px close `✕`. Its bottom-right corner is cut 9 px.
  - Inactive tabs have a 1 px `#2A2B2F` frame and `#9A9B8E` text, and turn
    `#1F2027` when hovered. A working tab shows a 12 px spinner. A blocked or
    done tab shows a 6 px square in `#FF003C` or `#55EAD4`.
  - At the right: a `+` (16 px, `#FCEE0A`), then `FILES` and `CHANGES`. These
    are 26 px tall, 12 px caps with 14 px icons, in `#9A9B8E`. The open one
    turns `#FCEE0A` with a 2 px `#FCEE0A` underline instead of a fill.

  Dragging the empty bar moves the window. On Linux and Windows the bar also
  draws minimize, maximize and close.
- **Work area:** 8 px padding all round, `#07080A`.
  - The pane has a 1 px `#2A2B2F` frame that turns `#FCEE0A` when focused,
    with square corners. A lone pane is framed too, and split panes sit 8 px
    apart.
  - Each pane has a 30 px header, always shown:
    - On `#07080A`, a left-to-right wash fades from `#FCEE0A` at 8 % alpha
      (`#FCEE0A14`) to clear at 40 % of the width. A 1 px `#2A2B2F` bottom
      line runs under it.
    - It shows a 14 px program icon, the program name at 12 px bold caps in
      `#F0EEE4` (cut off at 260 px), then the folder in `#5A5B52`, with the
      home folder shown as `~`.
    - At the right, at 10.5 px bold: `WORKING` plus a spinner in `#FCEE0A`,
      the blinking `NEEDS YOU` tag, `◆ DONE` in `#55EAD4`, or nothing when
      idle.
  - The Files/Changes side panel opens at 368 px (280–900) to the right of
    the panes, using Herdr's own `files` and `changes`. It is hidden at
    start.
- **Status bar, 28 px, `#0C0D11`.** A 1 px `#2A2B2F` top line runs across.
  - At the left is a 42 px cap of `#FCEE0A` hazard stripes (7 px every
    14 px). Its bottom-right corner is cut 10 px, so the stripes end on a
    diagonal.
  - Then come readouts at 11.5 px bold caps in `#9A9B8E`:
    - `▣ THIS COMPUTER` (or the machine name)
    - `⎇ BRANCH`, when the space has one
    - a 6 px round `#5EF38C` dot and `N AGENTS` (it reads `1 AGENTS` with
      one agent), plus `· N NEEDS YOU` in `#FF003C` when any are blocked
    - the fixed readout `NC_OS 2.077 // ONLINE` in `#FCEE0A`
  - At the right, the palette key as actually bound (`⌘⇧P COMMANDS`), in
    `#5A5B52`.

### The `+` menu

- A 250 px wide popup, `#0C0D11`, with a large shadow and 12.8 px text. A
  1 px `#FCEE0A` frame runs round it, and its top-right corner is cut 10 px
  with the frame following the diagonal.
- Rows are 31 px with square corners: `TERMINAL` with its shortcut, a
  `START AN AGENT` label (10.5 px bold `#FCEE0A`), the installed agents
  numbered 1–9, and up to two not-installed agents (dim, "not installed").
  A 1 px `#2A2B2F` divider follows, then New space, New worktree… and Open
  worktree….
- The height fits the list, at most 491 px.

## How it behaves

**Agent status**, in the agents list (and in the pane header and tab):

- **Working:** a 12 px spinner in `#FCEE0A` turning once every 900 ms. The
  pane header reads `WORKING` with a spinner.
- **Blocked:** the `NEEDS YOU` tag, an 18 px `#FF003C` block with 10 px bold
  `#07080A` caps. Its top-left and bottom-right corners are cut 4 px in the
  color of whatever it sits on. It pulses between 55 % and 100 % opacity
  every 1200 ms. In the Priority view the rows under the `NEEDS YOU` header
  show a short `!` tag instead. The status bar adds `· N NEEDS YOU`, the tab
  shows a red square and the pane header shows the full tag.
- **Done:** a 9 px `◆` in `#55EAD4`. The pane header reads `◆ DONE` and the
  tab shows a cyan square. Looking at a done agent makes it idle, but it
  stays under DONE until you leave it.
- **Idle:** a 7 px square outline, 1.5 px, in `#5EF38C`. The name dims to
  `#9A9B8E` unless that agent is focused. The pane header shows nothing.

**Clicks, keys, hovers:**

- **Brand block:** the search button opens Herdr's picker, and the sidebar
  button folds the sidebar into the rail.
- **Spaces:** a click selects the space and a right-click opens its menu.
  Drag a row to reorder. `+` makes a new space.
- **Agents:**
  - A click focuses that agent's pane. Hovering a row swaps the time for a
    pin button, and pinned agents go to a `PINNED` group on top.
  - A group header folds the group. Folded, it shows the count and the most
    urgent state.
  - The sort icon opens a popup with **Priority** (needs you, done, working,
    idle) and **Grouped by space**. Hovered rows there turn `#FCEE0A` with
    dark text.
- **Tabs:**
  - A click selects, a double-click renames and a drag reorders. A
    right-click opens Herdr's tab menu.
  - The scroll wheel steps through tabs, and `✕` on the active tab closes
    it.
  - Files/Changes open and close the side panel. Each space remembers its
    own panel.
- **`+` menu:**
  - The tab bar's `+` opens it. Hovered rows turn `#FCEE0A`, and their text,
    icon and hint turn `#07080A`.
  - Keys `1`–`9` start the matching installed agent in a new tab.
- **Pane header:**
  - A click focuses the pane.
  - Hovering shows split right, split down, zoom/unzoom and close. These are
    14 px icons in `#5A5B52` that turn `#FCEE0A` when hovered.
- **Status bar:** clicking the palette hint opens the command palette.
- **Sounds:** when an agent finishes, a short rising two-note square blip
  plays (`nc-done.mp3`: E5 then B5, 125 ms). When one needs you, three low
  buzzy pulses play (`nc-blocked.mp3`: A3 sawtooth, 60 ms each with 40 ms
  gaps). Both are synthesized.

**The rail.**
- The sidebar becomes a rail whenever it is narrower than 160 px, whether
  from the toggle or from dragging its edge (44–480 px). The toggle shrinks
  it to 76 px on macOS (44 px elsewhere) and remembers the old width. The
  `»` at the bottom of the agents list restores it.
- On the rail:
  - On macOS the brand block shows only a 14 px ram mark, centered at the
    block's bottom edge below the traffic lights. Elsewhere it shows only
    the toggle.
  - Spaces become 26 px rows of number plus `●`, colored when a space has a
    blocked or done agent. The active row is `#1A1B21`.
  - Agents become 26 px rows of number plus status mark, with the short `!`
    tag for blocked.
  - The footer shows icons only.

## Built from

```
root  row  background canvas, theme "cyberpunk-2077", ui_font "Rajdhani", titlebar none,
           traffic_lights [12,16], terminal_padding [14,12], divider 1px border,
           preview layouts/night-city.svg, cloned_from main 0.1.11
├─ sidebar  column  px 268, min 44, max 480, background chrome, resizable false
│  ├─ brand           block  px 46, window_drag   → nc-chrome
│  ├─ sidebar-lists   column
│  │  ├─ spaces       block  weight 1, min 90     → nc-spaces
│  │  └─ agents       block  weight 1, min 90     → nc-agents
│  └─ sidebar-footer  block  px 69                → nc-chrome  props { footer: true }
└─ work  column  resizable false
   ├─ tabs       block  px 42, window_drag        → nc-tabs
   ├─ work-body  row  padding 8, gap 8
   │  ├─ main    block  tab "active", pane { header { mod nc-pane, reveal always, height 30, top },
   │  │                 background background, border 1 border, focus 1 accent, radius 0, gap 8, lone true }
   │  └─ panel   column px 368, min 280, max 900, hidden
   │     └─ panel-body  stack active "files": files → files, changes → changes
   └─ status     block  px 28                     → nc-status
```

Every mod is a clone of a shipped mod (`cloned_from` 0.1.11 in its `mod.json`,
`place: "none"`). Each keeps the original's behavior, and only the look
changed:

| Mod | Cloned from | Role, props | `herdr` used | Commands it runs |
| --- | --- | --- | --- | --- |
| `nc-chrome` | `workspace-chrome` | brand block; `props.footer: true` = footer | `theme run props window shared setShared updates layout` | `layout.resize`, `app.settings`, `mod.open {picker \| machine-add}` |
| `nc-spaces` | `spaces` | spaces list | `spaces machines panes run openOverlay exec hc theme shared setShared watchFolder window layout` | `space.new/select/move`; `menu` overlay; runs `git status --porcelain=v2 --branch`, `git rev-parse`, `hc machine ls --json` |
| `nc-agents` | `agents` | agents list; `props.sortMenu: true` = its own sort popup | `agents terminals panes focused spaces run theme shared setShared setAgentOrder openOverlay closeOverlay props window layout` | `pane.focus`, `terminal.peek`, `layout.resize` |
| `nc-tabs` | `tabs` | tab bar | `spaces panes run openOverlay theme window shared layout settings` | `tab.select/move/rename/close/prev/next`, `layout.select/show/hide`, `window.*`; opens `nc-new-menu` (popup 250×512, `frame: "none"`) and `menu` |
| `nc-pane` | `pane` | pane header; app passes `{ pane, terminal }` | `panes props run theme home` | `pane.focus/split/zoom/close` |
| `nc-status` | `workspace-status` | status bar | `spaces agents theme run window keys` | `app.palette` |
| `nc-new-menu` | `new-menu` | the `+` menu | `theme spaces panes knownAgents run openOverlay closeOverlay props window keys` | `tab.new`, `space.new`; `worktree` dialog |

Shared keys: `space.colors`, `sidebar.width`, `sidebar.collapsed`,
`agents.sort`, `workspace.panels`. `localStorage`: tabs `panels`, agents
`changed`/`pins`, spaces `machines.folded`.

**Helpers.** Each mod that cuts corners carries identical copies of
`geometry.js` and `shape.js`, since a mod can import only from its own folder.
The originals live in `mods/nc-chrome/`.
- `geometry.js` is pure and node-testable. `trianglePoints(cut, corner)` and
  `edgePoints(cut, corner)` give px coordinates for `tl|tr|br|bl` inside a
  `cut×cut` box.
- `shape.js` paints with gpui-kit's global `window.paint_path(path, fill)`
  and `PathBuilder`. Every layer is absolute, so its parent must be
  `relative()`. It exports:
  - `cutCorner(behind, cut, corner)`: a `cut×cut` box pinned to the corner,
    filled with the triangle in the color behind.
  - `cutCornerEdge(behind, line, cut, corner)`: the same, plus a 1 px
    `PathBuilder.stroke(1)` diagonal.
  - `gradientLayer(angle, from, to)`: `Background.linear_gradient`.
  - `stripesLayer(color, width, interval)`: `Background.pattern_slash`.

Where each shape is used:
- Chamfers: active space row 8 px br, avatar 6 px br, focused agent row
  8 px br, NEEDS YOU tag 4 px tl and br, active tab 9 px br, status cap
  10 px br, `+` menu 10 px tr with edge.
- Stripes: footer 6/12, status cap 7/14.
- Gradient: pane header, 90°, `stop("#FCEE0A14", 0)` → `stop("#FCEE0A00",
  0.4)`.

Motion uses only `.spin(900)` and `.loop("opacity", { from: 0.55, to: 1,
period: 1200 })`. `cx.timer` only refreshes data: spaces git every 250 ms and
machines every 15 s, agent times every 30 s.

**Shipped assets referenced by path:** `mods/workspace-chrome/{spinner,
plus, branch, server, monitor, chevron-*, clock, layers, check, pin,
pin-off}.svg`, `mods/pane/close.svg`, `mods/files/file.svg`,
`mods/changes/changes.svg` and `icons/shell.svg`. Each mod's own folder holds
the rest: `nc-pane` split/zoom/close icons, `nc-tabs` Windows window icons,
`nc-chrome` icons and `ram.svg`.

**Art:**
- `mods/nc-chrome/ram.svg`: 32×32 viewBox, a single `fill="currentColor"`
  even-odd path.
- `mods/nc-chrome/fonts/Rajdhani-{Medium,SemiBold,Bold}.ttf` with `OFL.txt`
  (SIL OFL 1.1, from google/fonts).
- `layouts/night-city.svg`: a 320×200 settings-screen preview.

**Sounds:** `sounds/make_sounds.py` (stdlib, ffmpeg for mp3) writes
`nc-done.{wav,mp3}` and `nc-blocked.{wav,mp3}` (44.1 kHz mono 16-bit, peak
−12 dBFS). The installer copies the mp3s and points `settings.json`
`sounds.done` / `sounds.blocked` at them.

**Installer:** `install.sh [--force] [--uninstall] [--home <dir>] [--no-app]`.
- It copies only `layouts/night-city.*`, `themes/cyberpunk-2077.json`,
  `mods/nc-*` and `sounds/nc-*.mp3`.
- In `settings.json` it sets only `theme`, `sounds.done` and
  `sounds.blocked`, after a backup.
- It runs `herdr-app check` on each installed mod. When the app is running,
  it switches to `main`, runs `app.theme --name cyberpunk-2077`, switches to
  `night-city` and prints `herdr-app status` errors.

## Watch out

- **GPUI paints `.border()` over children.** A chamfer layer can't cut a
  bordered box: the border stays square on top of it.
  - The `+` menu therefore draws its frame as four absolute 1 px divs plus
    `cutCornerEdge`'s diagonal.
  - The active tab keeps a 1 px border so it stays the same size as inactive
    tabs. That border is `chrome`-colored so it vanishes, and the cut shows.
- **Nothing paints outside its block.** Negative absolute offsets
  (`.bottom(-1)`, `.top(-1)`) are clipped, which is why the tab bar's yellow
  run sits at `.bottom(0)` over the border line.
- **The pane frame stays square.** Its top-right corner can't be cut from the
  header mod: Herdr paints the frame over the header, so the diagonal drew
  inside a still-square box. That chamfer was dropped.
- **`PathCoordinate` is px or percent, never an expression.** You can't write
  `100% - 8px`, so each chamfer is its own `cut×cut` element pinned to a
  corner, with px points inside it.
- **`Background.stop(color, pos)` takes a 0–1 fraction**, not a percent:
  `stop(c, 0.4)` ends at 40 %, and `40` runs off the end.
- **Fonts load at start and on the next look change.** Fonts in a mod's
  `fonts/` folder load then, so after copying in Rajdhani, do a
  `layout.switch` round-trip (to `main` and back) before judging the type.
- **`layout.clone` copies `main`'s theme click** into
  `layouts/.state/<name>.json`. On the build machine that was a stale
  `{light: cyberpunk, dark: atom-one-dark}`. The layout file's explicit
  `"theme": "cyberpunk-2077"` wins, so keep it in the file.
- **No letter-spacing API in gpui-kit.** The game's tracked-out caps are
  plain uppercase here.
- **The macOS rail is a compromise.** It is 76 px wide, and the traffic
  lights at (12, 16) fill the brand block's middle. A centered 18 px ram
  would sit under a window button, so the 14 px ram sits at the block's
  bottom edge, 14 px below the lights. The brand's toggle is hidden on the
  macOS rail, and `»` in the agents list restores the sidebar. The 44 px
  non-macOS rail shows the toggle and no ram.
- **Shipped overlays keep their stock shapes.** `toast`, `menu`, `help`,
  `picker`, `confirm`, `prompt`, `files`, `changes`, settings and the palette
  take the theme colors, but the layout can't own them, so they keep rounded
  corners and stock type.
- **Several states were verified by code, not seen.** Blocked, done and
  pinned, and the sort popup's hover, were never on screen: only one live
  agent ran during the build. The first real blocked agent is the live test
  of the blinking NEEDS YOU tag.
- **The status bar reads `1 AGENTS`.** The label isn't pluralized yet.
- **The mods need Herdr's shipped mods.** They load assets from shipped
  `workspace-chrome`, `pane`, `files` and `changes` by path, and open shipped
  `menu`, `picker`, `machine-add` and `worktree`. Built against
  `herdr-app 0.1.11`.
- **`herdr-app check` writes files into the folder it checks.** Running it on
  a repo mod folder adds `gpui-kit.d.ts` and `jsconfig.json`. They're
  gitignored, the installer strips them, and a test fails if one is
  committed.
- **`app/package.json` (`"type": "module"`) is only for tests.** It exists so
  Node runs the ESM test files cleanly. It isn't installed.
- **How `install.sh` handles `settings.json`:**
  - Both `settings.json` and any backup `settings.json.bak-night-city` are
    validated before anything is copied.
  - The backup is single-use. If one exists but the current settings hold
    none of the managed values, it is moved aside as `.bak-night-city.<unix
    time>` and a fresh one is taken.
  - Uninstall restores the three keys (or the whole file, if nothing else
    changed) and leaves the active backup in place.
  - Existing `nc-*` files stop the install unless `--force` is given.

## Done when

- `node --test 'app/tests/*.test.js'` passes: the geometry tables, the
  `geometry.js`/`shape.js` copies identical in every mod, no
  `setTimeout`/`setInterval` in any `main.js`, and no app-written files
  committed.
- `python3 -I -m unittest discover -s app/tests -p 'test_*.py' -v` passes
  (theme, layout, sounds).
- `app/tests/test_install.sh` passes. `--home <tmp> --no-app` then
  `--uninstall` leaves `settings.json` byte-identical to its backup, with no
  `nc-*`, `night-city*` or `cyberpunk-2077*` files left behind.
- `herdr-app check ~/.config/herdr-app/mods/nc-<name>` passes for all seven
  mods, and `herdr-app status` shows `"layout": "night-city"` and
  `"errors": []`.
- `herdr-app shot` with at least 2 spaces, 2 tabs and a working agent shows
  all of these:
  - the ram mark and the cyan/red-split `HERDR` above `▚▞ NIGHT CITY`, with a
    yellow line under the brand block
  - olive active-space and focused-agent rows with the yellow left bar and a
    cut corner
  - a yellow active tab with black `01 · …` text and a cut corner
  - a yellow-framed focused pane with the yellow-washed header and
    `WORKING` plus a spinner
  - hazard stripes at the status bar cap and above the footer
  - Rajdhani caps in all the chrome, with terminals in their own font
- With a blocked agent, the red `NEEDS YOU` tag pulses in the agents list
  and the pane header, and the status bar adds `· 1 NEEDS YOU` in red. A
  done agent shows a cyan `◆`.
- The sidebar toggle (or dragging the sidebar under 160 px) gives the rail:
  numbers and status marks, plus the 14 px ram on macOS. `»` restores it,
  and the traffic lights overlap nothing.
- `⌘⇧L` cycles through the layouts (`main`, `terminals`, `win98`,
  `night-city`) and back. After an install run with the app open, `main`
  shows `cyberpunk-2077` colors. `ctrl-alt-shift-escape`
  still returns to `main`.
- Settings → Alerts plays both sounds, and `done` is shorter and higher than
  `blocked`.
