# Night City: a Cyberpunk 2077 layout for the Herdr desktop app

Date: 2026-11-01 · Status: draft for builder check

## Intent

Make the Herdr desktop app (`/Applications/Herdr.app`, config home
`~/.config/herdr-app`) look and feel like a screen out of Cyberpunk 2077's
menu UI: neon yellow `#FCEE0A` as the key color on near-black, cyan and red
as the only other voices, angular cut corners, uppercase condensed type,
hazard stripes, a redrawn brand mark. Not a palette swap: the window
chrome (brand block, sidebar lists, tab bar, pane headers, status bar, the
`+` menu) is rebuilt as a layout plus cloned mods, so the shapes change,
not just the colors.

Why: the person already runs a violet "cyberpunk" theme in this app and in
the Herdr TUI (`config.toml` in this repo). They picked the game's
*Main Menu* direction (yellow on black) over a cyan/HUD direction in a
side-by-side mockup, and brand lockup **B** (ram mark + glitch wordmark)
over two alternatives. The accepted full-window mockup is
`.superpowers/brainstorm/90505-1793532997/content/full-window.html` in
this repo (not committed; open it in a browser if you want the picture).

## Goals

- A new layout `night-city` that replaces the look of Herdr's `main`
  layout while keeping every behavior of `main` (same node ids, same
  commands, same panels, same keyboard and mouse behavior).
- A new theme `cyberpunk-2077` usable by any layout, with terminal colors
  to match.
- Rajdhani as the UI typeface, shipped with the layout.
- A `herdr.dev/layouts`-style shareable folder in this repo, installable
  on another Mac with one script.
- Fix the existing misconfiguration: the theme picker on `main` is
  `{light: cyberpunk, dark: atom-one-dark}` and macOS is in dark mode, so
  the violet theme has never shown. After install, dark mode shows
  `cyberpunk-2077` on `main` too.

## Non-goals

- Editing any file Herdr ships (`layouts/main.json`, `mods/tabs`, etc.).
  Herdr rewrites them on every start. Everything here is a new file or a
  clone.
- Restyling overlays the layout can't own: `toast`, `menu` (context menus),
  `help`, `picker`, `confirm`, `prompt`, `files`, `changes`, the settings
  and palette screens in `frame/`. They read `theme()` so they pick up the
  colors; their shapes stay stock.
- Changing how terminals draw text (scanlines over terminal output, text
  glitch on live labels, blur). GPUI/gpui-kit can't.
- Linux and Windows. Build for macOS; don't break the platform branches
  that the shipped mods already have (window buttons, traffic-light
  padding), just keep them as they are.
- Sounds. Open question for the person; see the end.

## Anti-goals (what would make this a failure even if it works)

- The game's red-everything HUD. Red means *blocked / needs you* and
  nothing else. Yellow carries focus and activity; cyan carries done,
  links and branches.
- Losing information the stock sidebar shows: pins, sub-agent trees,
  fold chevrons, machine groups, worktree nesting, ahead/behind, drag to
  reorder. Clone, restyle, keep.
- Battery drain from timer-driven animation. Every animation is native
  (`.loop`, `.spin`, `.transition`, `.frames`); no `cx.timer` for motion.
- A window that only looks right at one size. The collapsed rail
  (`sidebar` narrower than 160 px) and the macOS traffic-light padding
  must still work.

## Constraints (from the recon; the builder should not need to rediscover these)

- The app's whole UI is files under `~/.config/herdr-app`; read its
  `AGENTS.md` first (it's rewritten every start and is the authority),
  then `herdr.d.ts` and `gpui-kit.d.ts`.
- Mods are gpui-kit JavaScript: `div()`, `h_flex()`, `v_flex()`, chained
  builders, `theme()`, no DOM/CSS/HTML, no `setTimeout`.
- Available and verified in `gpui-kit.d.ts` (module `"gpui-kit"`):
  `rounded_tl/tr/bl/br`, `border_l/t/...`, `shadow_xs..xl`,
  `absolute()/relative()/inset_0()`, `overflow_hidden()`, `opacity()`,
  `font_family(name)`, `font_weight(100..900)`, `font_bold/semibold/
  medium()`, `svg(path)` (tinted by text color), `image(path)` (full
  color, SVG ok), `.spin(ms)`, `.frames([...], ms)`,
  `.loop(property, {from, to, period?, easing?})` and
  `.transition(property, {duration, delay?, easing?})` where `property`
  is one of `"opacity" | "width" | "height" | "left" | "top"`.
  8-digit hex `#rrggbbaa` works for colors (the shipped `agents` mod
  does `t.blocked + "26"`).
- **Painted geometry.** `bg()` takes only a hex `Color`. Gradients,
  patterns and arbitrary polygons go through
  `window.paint_path(path, Background | Color)` (import `PathBuilder`,
  `Background` from `"gpui-kit"`; `window` is the gpui-kit global, which
  the shipped win98 mod uses while importing herdr's `window as
  appWindow`). It returns a native element you place with
  `.absolute().top(0).left(0).size_full()` inside a `relative()` parent.
  `PathBuilder.fill()` or `PathBuilder.stroke(width)`, then
  `move_to(x, y)`, `line_to(x, y)`, `add_polygon([[x, y], ...])`,
  `close()`, `build()`; coordinates are px numbers or percent strings
  (`"100%"`). `Background.solid(c)`, `Background.linear_gradient(angle,
  from, to)` with `Background.stop(c, pct)`,
  `Background.pattern_slash(c, width, interval)`. Reference:
  `~/.config/herdr-app/mods/win98/kit.js` lines 190–200 (`RECT()`,
  `gradient()`).
- Not found: clip paths, rotate/transform, blur, text letter-spacing.
  Letter-spacing: uppercase alone is acceptable; the wordmark may use
  hair spaces (U+200A) between letters. Builder's call, verify with
  `herdr-app shot`.
- Shipped layouts and mods are read-only; clone with
  `herdr-app do layout.clone '{"name":"main","as":"night-city"}'` and
  `herdr-app do mod.clone '{"name":"<mod>","as":"nc-<mod>"}'`. Clones
  rewrite their own `mods/<name>/` asset paths.
- A layout brings fonts in a mod's `fonts/` folder (Herdr 98 does this in
  `mods/win98/fonts/`); they load at start and on the next look change.
- `herdr-app check <mod folder>` must pass for every mod before it's
  called done; `herdr-app shot <file.png>` captures the window for visual
  checks; `herdr-app status` lists file and mod errors.
- Theme file schema: `{ background, foreground, selection, cursor?, ansi:
  [16], colors?: {...} }`. `theme()` color names: background, surface,
  canvas, chrome, popover, raised, hover, selected, border, input,
  foreground, muted, dim, accent, accent_foreground, solid,
  solid_foreground, selection, working, blocked, done, idle, unknown,
  ansi0..ansi15.
- A theme named like a layout becomes that layout's private theme. This
  theme is deliberately **not** named `night-city` so `main` can use it.
- Only the root node's look (theme, fonts) applies today; per-block look
  is not yet supported.
- The escape hatch `ctrl-alt-shift-escape` returns to `main`; `⌘⇧L`
  cycles layouts. Nothing here may break either.

## Deliverables

All under `app/` in this repo, laid out like a Herdr home so the folder is
a valid herdr.dev layout share:

```
app/
  RECIPE.md                     Herdr's 6-section recipe (see AGENTS.md "A RECIPE.md is a brief")
  preview.png                   herdr-app shot of the finished window
  install.sh                    copies into ~/.config/herdr-app, checks, switches
  layouts/night-city.json
  layouts/night-city.svg        settings-screen preview picture
  themes/cyberpunk-2077.json
  mods/nc-chrome/               brand block + sidebar footer (clone of workspace-chrome)
    main.js  mod.json  geometry.js  shape.js  ram.svg
    fonts/Rajdhani-{Medium,SemiBold,Bold}.ttf  fonts/OFL.txt
  mods/nc-spaces/               clone of spaces           (+ geometry.js, shape.js copies)
  mods/nc-agents/               clone of agents           (+ copies)
  mods/nc-tabs/                 clone of tabs             (+ copies)
  mods/nc-pane/                 clone of pane             (+ copies)
  mods/nc-status/               clone of workspace-status (+ copies)
  mods/nc-new-menu/             clone of new-menu         (+ copies)
  sounds/make_sounds.py  nc-done.{wav,mp3}  nc-blocked.{wav,mp3}
  tests/                        node --test for geometry.js; python unittest for theme + sounds; bash test for install.sh
```

`geometry.js`/`shape.js` are copied, not shared: a mod may import only
from its own folder, and the folders must travel independently. The
copies must stay identical (a test compares them).

Plus: `README.md` gains an "App layout" section (what it is, install,
uninstall, screenshot); `.gitignore` ignores `.superpowers/`.

Fonts: Rajdhani Medium/SemiBold/Bold from
`https://github.com/google/fonts/tree/main/ofl/rajdhani` (SIL OFL 1.1;
ship `OFL.txt` beside them). Rajdhani is the free stand-in for the game's
UI face. Terminals keep the person's terminal font (unset in the layout).

## The theme: `themes/cyberpunk-2077.json`

```json
{
  "background": "#07080A",
  "foreground": "#F0EEE4",
  "selection":  "#4A4410",
  "cursor":     "#FCEE0A",
  "ansi": [
    "#1A1B21", "#FF003C", "#5EF38C", "#FCEE0A", "#3D9BFF", "#FF2BD6", "#00F0FF", "#B8B6A6",
    "#5A5B52", "#FF5980", "#8CFFB0", "#FDF460", "#77BEFF", "#FF75E4", "#7FF7FF", "#F0EEE4"
  ],
  "colors": {
    "accent": "#FCEE0A", "accent_foreground": "#07080A",
    "solid":  "#FCEE0A", "solid_foreground":  "#07080A",
    "canvas": "#07080A", "chrome": "#0C0D11", "popover": "#0C0D11",
    "surface": "#121318", "raised": "#1A1B21", "hover": "#1F2027", "selected": "#2A2708",
    "border": "#2A2B2F", "input": "#3A3B40",
    "foreground": "#F0EEE4", "muted": "#9A9B8E", "dim": "#5A5B52",
    "working": "#FCEE0A", "blocked": "#FF003C", "done": "#55EAD4", "idle": "#5EF38C", "unknown": "#5A5B52"
  }
}
```

`selected` is a dark olive, not solid yellow: row text can't be recolored
per row to black, so a solid yellow row would be unreadable. Yellow-on-
black-text blocks are used only where the mod controls both colors (the
active tab, menu hover rows, the NEEDS YOU tag).

## The layout: `layouts/night-city.json`

Start from `layout.clone` of `main` and keep **every node id** (`root,
sidebar, brand, sidebar-lists, spaces, agents, sidebar-footer, work, tabs,
work-body, main, panel, panel-body, files, changes, status`): the cloned
mods find `sidebar`, `panel` and `panel-body` by id. Then change:

- root: `"theme": "cyberpunk-2077"`, `"ui_font": "Rajdhani"`, keep
  `"titlebar": "none"`, `"traffic_lights": [12, 16]`, `"background":
  "canvas"`, `"terminal_padding": [14, 12]`, divider `border`.
- `brand` → `{ "mod": "nc-chrome" }`; `sidebar-footer` → `nc-chrome` with
  `props.footer = true`; `spaces` → `nc-spaces`; `agents` → `nc-agents`;
  `tabs` → `nc-tabs`; `status` → `nc-status`. `files` and `changes` stay
  the shipped mods.
- `main` pane frame: `gap 8`, `radius 0`, `background "background"`,
  `lone true`, `border {1, "border"}`, `focus {1, "accent"}`, header
  `{ mod: "nc-pane", height 30, position top, reveal always }`.
- `"preview": "layouts/night-city.svg"`.
- Sizes as in `main` (sidebar 268 px, tabs 42, status 28, footer 69,
  brand 46).

## The chamfer technique (used everywhere a corner is cut)

GPUI has no clip path, but it paints polygons, and `PathCoordinate` is
px *or* percent (never an expression), so the cut is drawn as a small
corner element rather than a reshaped box. The element keeps its normal
`bg()` and `.hover(...)`; it only adds `.relative()` and one child per
cut corner: a `cut × cut` box pinned to that corner
(`absolute().right(0).bottom(0)` for `br`, etc.) holding a
`window.paint_path` triangle in the color of whatever is *behind* the
element. Geometry is pure data, so it is testable without GPUI.

Two files, copied identically into every `nc-*` mod that needs them
(`mods/nc-chrome/` holds the originals; a mod may only import from its
own folder):

```js
// geometry.js — no imports; node-testable
export const CORNERS = ["tl", "tr", "br", "bl"];
/** Vertices of the triangle that cuts `corner` of a cut×cut box, in px: [[x,y],[x,y],[x,y]]. */
export function trianglePoints(cut, corner) {}
/** The two endpoints of the cut edge (the diagonal) for `corner`: [[x1,y1],[x2,y2]]. */
export function edgePoints(cut, corner) {}

// shape.js — gpui-kit side
import { div, PathBuilder, Background } from "gpui-kit";
import { trianglePoints, edgePoints } from "./geometry.js";
/** A cut×cut layer pinned to `corner` of a relative() parent, painted in `behind`, so the parent's corner looks cut. */
export function cutCorner(behind, cut, corner = "br") {}
/** cutCorner plus a 1px line in `line` along the diagonal (a frame edge following the cut). */
export function cutCornerEdge(behind, line, cut, corner = "tr") {}
/** A layer filling its relative() parent with a linear gradient (angle in degrees). */
export function gradientLayer(angle, from, to) {}
/** A layer filling its relative() parent with diagonal stripes. */
export function stripesLayer(color, width = 7, interval = 14) {}
```

Triangle vertices (x right, y down, inside the cut×cut box): `br`:
(cut,0) (cut,cut) (0,cut); `tr`: (0,0) (cut,0) (cut,cut); `tl`: (0,0)
(cut,0) (0,cut); `bl`: (0,0) (0,cut) (cut,cut). Edge: `br` (cut,0)→(0,cut);
`tr` (0,0)→(cut,cut); `tl` (cut,0)→(0,cut); `bl` (0,0)→(cut,cut).
Full-size layers use `PathBuilder.fill().move_to("0%","0%")… ("100%",
"100%")`, as `RECT()` in `mods/win98/kit.js:190`.

Uses:

- **Fill-only corner** (rows, tabs, tags, menus): `.relative()` on the
  element, `.child(cutCorner(t.chrome, 8, "br"))` with the color of the
  surface behind it (`t.chrome` in the sidebar, `t.canvas` in the work
  area, `t.popover` inside menus).
- **Corner with an edge line** (the pane frame's top-right): `nc-pane`
  adds `cutCornerEdge(t.canvas, p.focused ? t.accent : t.border, 14,
  "tr")` at its header's top-right, positioned to cover the frame's own
  corner (the frame is 1 px outside the header, so `.top(-1).right(-1)`).
  If the header can't paint past its own bounds onto the frame line,
  drop this corner and keep the pane square: say so in RECIPE.md
  "Watch out".

Chamfer sizes: 8 px on sidebar rows, 9 px on the active tab, 4 px on the
NEEDS YOU tag, 10 px on the `+` menu, 14 px on the pane.

## Mod by mod

Every clone keeps its behavior. Below is only what changes. "Caps" means
uppercase text, `font_bold`, and letter-spacing if available.

### nc-chrome (brand block; footer with `props.footer`)

Brand row, expanded (`!narrow()`):
- Keep macOS left padding for the traffic lights (`pl(76)`) and the
  `window_drag` block behavior (buttons stop propagation on mouse down).
- **Ram mark**: `svg("mods/nc-chrome/ram.svg").size(22).text_color(t.accent)`.
  `ram.svg` is a single flat silhouette redrawn from
  `frame/welcome/herdr.png` (ram head with curled horn, `›_` prompt cut
  out of the face as negative space), `fill="currentColor"`, 32×32
  viewBox. Flat, no gradients, readable at 22 px and at 16 px.
- **Wordmark** `HERDR`, 17 px, bold, color `t.accent`, with a glitch
  split: three copies stacked in a `relative()` container. Cyan
  `#00F0FF` copy offset (−1.5, −1) showing only its **top half**, red
  `#FF003C` copy offset (+1.5, +1) showing only its **bottom half**, yellow
  copy on top. Halves: wrap each offset copy in an `overflow_hidden()` box
  of half the text height (top box at y 0; bottom box at y h/2 with the
  text shifted up by h/2). Static; no animation.
- Under it, 9.5 px, `t.dim`, caps: `▚▞ NIGHT CITY`.
- Right side: search button and sidebar-toggle button as today, icon
  color `t.dim`, hover `t.accent` text on `t.hover` bg, `rounded(0)`.
- Yellow underline: a 1 px `t.accent` line along the brand block's
  bottom edge, full sidebar width (`border_b(1).border_color(t.accent)`
  on the block's root). The layout's root divider between sidebar and
  work stays `border`, untouched.

Collapsed rail (`narrow()`): ram mark only, centered, 18 px; toggle
button as today (macOS rule unchanged).

Footer (`props.footer`): keep Settings / Add machine rows; labels caps
13 px, `rounded(0)`; the update dot becomes a 6 px yellow square. Above
the footer border, a 4 px hazard stripe:
`div().relative().h(4).w_full().child(stripesLayer(t.accent, 6, 12))`.

### nc-spaces

- Header: `▌` tick (a 2×10 px `t.accent` bar) then `SPACES` caps 11 px
  `t.dim`; the `+` button in `t.accent`.
- Rows: `rounded(0)`. Active row: `bg(t.selected)`, a 2 px `t.accent` bar
  at left (absolute, full height), fill-only chamfer 8 px at bottom-right
  tinted `t.chrome`. Hover rows: `t.hover`, square.
- Avatar: 18 px square (`rounded(0)`), fill-only chamfer 6 px at
  bottom-right tinted with the row's own bg (`t.selected` on the active
  row, `t.chrome` otherwise). Replace `MARK` with the 2077 set:
  `ansi6 #00F0FF, ansi3 #FCEE0A, ansi4 #3D9BFF, ansi5 #C77DFF,
  ansi2 #5EF38C, ansi1 #FF003C`. Letter color: `#07080A` on yellow, cyan,
  green; `#F0EEE4` on the rest.
- Name 13.5 px `font_semibold`. Git tail unchanged (dim; ahead in
  `t.idle`, behind in `t.blocked`).
- Machine headers caps; the connected dot becomes a 6 px square.
- Worktree tree rows, drag reorder, right-click menu: unchanged.

### nc-agents

- Header `AGENTS` like Spaces, sort button in `t.dim` → hover `t.accent`.
- Group headers: caps 11 px bold in the group's status color (`t.blocked`,
  `t.done`, `t.working`, `t.dim` for idle; "Pinned" in `t.accent`), count
  in `t.dim`.
- Rows `rounded(0)`; focused row styled like the active space row (olive
  bg, left bar, 8 px chamfer).
- Status marks: working → shipped spinner svg in `t.working`, `spin(900)`;
  blocked (full) → tag `NEEDS YOU` caps 10 px bold, `bg(t.blocked)`,
  text `t.solid_foreground`-dark (`#07080A`), 4 px chamfers at top-left
  and bottom-right, `.loop("opacity", { from: 0.55, to: 1, period: 1200 })`;
  blocked (compact) → same tag with `!`; done → `◆` glyph in `t.done`;
  idle → 7 px square outline 1.5 px `t.idle`.
- Sub-agent rows, pins, folds, sort popup, agent order
  (`setAgentOrder`): unchanged. The sort popup rows: hover `bg(t.accent)`
  with dark text.

### nc-tabs

- Tabs `rounded(0)`, h 29, px 12, caps 12.8 px bold. Label is
  `NN · NAME` where `NN` is the tab's 1-based index zero-padded to two
  digits (`01 · CLAUDE CODE`); `Z` suffix for zoomed stays.
- Active: `bg(t.accent)`, text `t.accent_foreground`, border `t.accent`,
  fill-only chamfer 9 px at bottom-right tinted `t.chrome`; program icon,
  spinner and close `✕` drawn in `t.accent_foreground`.
- Inactive: `border(1).border_color(t.border)`, text `t.muted`, hover
  `bg(t.hover)`; working spinner in `t.muted`; blocked/done dot stays a
  6 px square in that status color.
- `+` button: `t.accent`, 16 px. It opens **`nc-new-menu`** (not
  `new-menu`), same width/height.
- Files / Changes buttons: caps 12 px; on-state = text `t.accent` with a
  2 px `t.accent` bottom border instead of a filled background.
- A 1 px `t.accent` segment 180 px wide along the bar's bottom edge from
  the left of the first tab (absolute div), over the `border` line.
- Keep: drag-to-reorder, scroll wheel switching, double-click rename,
  right-click menu (shipped `menu`), per-space panel memory
  (`syncPanel`), traffic-light padding math, non-mac window buttons.

### nc-pane (pane header)

- Header: `relative()`, `bg(t.background)`, first child
  `gradientLayer(90, Background.stop("#FCEE0A14", 0),
  Background.stop("#FCEE0A00", 40))`; bottom border 1 px `t.border`.
- Program icon 14 px; name caps 12 px bold `t.foreground`; folder in
  `t.dim` (no change to the `folder()` shortening).
- Right side status readout, caps 10.5 px bold: working → `WORKING` in
  `t.working` + spinner; blocked → the `NEEDS YOU` tag (same as
  nc-agents, with blink); done → `◆ DONE` in `t.done`; idle → nothing.
- Hover buttons (split right / down, zoom, close) as today, hover color
  `t.accent`, `rounded(0)`.
- Chamfer with edge line at the header's top-right (see technique);
  `corner-focus.svg` when `p.focused`, else `corner-idle.svg`.

### nc-status

- Left cap: a 42 px wide, full-height `relative()` block holding
  `stripesLayer(t.accent, 7, 14)` and, over it, `chamfer(t.chrome, 10,
  ["br"])`-style triangle in `t.chrome` so the stripes end on a
  diagonal. Then 14 px gap.
- Entries caps 11.5 px bold `t.muted`: machine (`▣ THIS COMPUTER` or the
  machine name), branch (`⎇ MAIN`), agents (`● N AGENTS` with the dot in
  `t.idle`, plus `· N NEEDS YOU` in `t.blocked` when > 0), then a fixed
  readout `NC_OS 2.077 // ONLINE` in `t.accent`.
- Right: the palette hint as today, caps, `t.dim`.

### nc-new-menu

- Opened by nc-tabs with `frame: "none"` so the mod draws its own frame:
  `bg(t.popover)`, `border(1).border_color(t.accent)`, fill-only chamfer
  10 px at top-right tinted `t.canvas`, `shadow_lg`.
- Rows h 31, `rounded(0)`; hover → `bg(t.accent)` with text and hint in
  `t.accent_foreground`. The Terminal row's label caps; agent names as
  given. Section label `START AN AGENT` caps 10.5 px in `t.accent`.
  Divider `t.border`. Keyboard 1–9 and Esc as today.

## install.sh

Idempotent, macOS, bash. Steps:

Flags: `--force`, `--uninstall`, `--home <dir>` (default
`~/.config/herdr-app`; exists so tests can run against a temp dir;
`HERDR_APP_HOME` is respected the same way the app does), `--no-app`
(skip every `herdr-app do`, for tests and headless installs).

1. Refuse if `herdr-app` isn't on PATH or at `~/.local/bin/herdr-app`
   (unless `--no-app`). Print its `--version`. No minimum-version check:
   the app's mod API is whatever its `AGENTS.md`/`.d.ts` say; README
   records the version this was built against (`herdr-app 0.1.11`).
2. Copy `app/layouts/night-city.*`, `app/themes/cyberpunk-2077.json`,
   `app/mods/nc-*/`, `app/sounds/nc-*.mp3` into `<home>/`. Never touch
   anything not named `night-city`, `cyberpunk-2077`, `nc-*`. If a target
   exists, replace it only with `--force`; otherwise stop and say what's
   there.
3. `settings.json`: once, copy it to `settings.json.bak-night-city` (never
   overwritten if present). Then merge, keeping every other key and the
   file's formatting as `python3 -m json.tool` would write it:
   `"theme": "cyberpunk-2077"`, `"sounds": {…existing…, "done":
   "sounds/nc-done.mp3", "blocked": "sounds/nc-blocked.mp3"}`. The `theme`
   key is what makes `main` (and any layout without a pick) show the theme
   with the app closed or on a fresh Mac.
4. `herdr-app check <home>/mods/nc-<each>`; stop on the first failure with
   its output.
5. If the app is running and not `--no-app`: `herdr-app do layout.switch
   --name main`, `herdr-app do app.theme --name cyberpunk-2077` (clears
   `main`'s stale dark pick, which is a click and beats `settings.json`),
   `herdr-app do layout.switch --name night-city`. Print any
   `herdr-app status` errors.
6. Print how to go back (`⌘⇧L`, or `herdr-app do layout.switch --name
   main`) and how to uninstall.

`--uninstall`: if the app is running and `night-city` is shown, switch to
`main` first. If `main`'s pick is `cyberpunk-2077` (the app is running),
run `app.theme` with the `theme` value from the backup (or
`atom-one-dark` if the backup has none) so no pick points at a missing
file. Restore `theme` and `sounds.done`/`sounds.blocked` in
`settings.json` from the backup (remove the two sound keys if the backup
lacked them), leaving other keys as they are now. Remove the copied
files. Keep the backup.

Builder note: `layout.clone` copies `main`'s click state into
`layouts/.state/night-city.json`, including the stale theme pick. A
deliberate layout-file edit beats a click on that field, so the explicit
`"theme": "cyberpunk-2077"` in `night-city.json` wins; confirm with
`herdr-app shot` right after the clone and before styling anything.

Development note for the builder: develop live in `~/.config/herdr-app`
(hot reload, `herdr-app shot`), then copy the finished folders back into
`app/`. The repo is the source of truth once done.

## Verification ("done when")

- `herdr-app check` passes for all 7 mods; `herdr-app status` shows no
  errors with `night-city` shown.
- `herdr-app shot` of the window with ≥ 2 spaces, ≥ 3 agents in
  different states (working, blocked, done) and ≥ 2 tabs matches the
  mockup in structure: yellow active tab with black text; olive active
  rows with yellow left bar and cut corner; red blinking NEEDS YOU; cyan
  ◆ done; hazard stripes at the status bar cap and above the footer; ram
  mark + glitch wordmark; Rajdhani everywhere in the chrome; terminals
  unchanged in font.
- Sidebar dragged below 160 px: rail shows the ram mark, numbers and
  status marks; dragging back restores. Traffic lights don't overlap
  anything.
- `⌘⇧L` cycles to `main`/`terminals`/`win98` and back; `main` now shows
  `cyberpunk-2077` colors in dark mode.
- `ctrl-alt-shift-escape` still returns to `main`.
- A fresh clone of this repo + `app/install.sh` on a Mac with the Herdr
  app (built against `herdr-app 0.1.11`) reproduces the window, with
  the app closed during install too (the install never overwrites
  shipped files).
- `app/install.sh --home <tmp> --no-app` followed by `--uninstall` on
  the same temp home leaves `settings.json` byte-identical to its backup
  and no `nc-*`/`night-city`/`cyberpunk-2077` files behind.
- No `cx.timer` used for animation anywhere in the 7 mods.

## Left to the builder

- Exact SVG paths for `ram.svg`, the corner triangles and
  `night-city.svg`.
- Letter-spacing approach (hair spaces vs none), after checking
  gpui-kit for a tracking API.
- Whether `font_bold()` resolves Rajdhani Bold from the shipped file;
  if not, ship only the weight that renders and say so in RECIPE.md.
- Whether the pane's top-right edge-line chamfer is achievable from the
  header mod; if not, keep the pane square and note it.
- Order of implementation and how much to copy from the shipped mods vs
  rewrite (cloning and editing in place is expected).

## Also in scope (decided by the person, 2026-11-01)

### Sounds: two synthesized UI blips

Replace the bundled done/blocked sounds with generated ones. No game
audio; everything is synthesized by a script committed to the repo.

- `app/sounds/make_sounds.py` (Python 3 stdlib `wave` + `math`; no
  numpy; underscore so tests can import it) writes `nc-done.wav` and `nc-blocked.wav`, 44.1 kHz mono 16-bit,
  peak −12 dBFS, then converts each to `.mp3` with `ffmpeg` if it is on
  PATH (`ffmpeg -i x.wav -codec:a libmp3lame -q:a 4 x.mp3`). Commit the
  script and the generated files (`app/sounds/nc-done.mp3`,
  `app/sounds/nc-blocked.mp3`, and the `.wav`s as fallback).
- **done**: two ascending square-wave tones, E5 (659 Hz) 55 ms then B5
  (988 Hz) 70 ms, 5 ms attack, exponential decay on the second tone, a
  faint 2nd harmonic. Reads as "confirmed".
- **blocked**: three low pulses, A3 (220 Hz) sawtooth, 60 ms each with
  40 ms gaps, hard-clipped slightly for grit, short decay on the last.
  Reads as "attention", not alarm.
- Herdr reads `settings.json` → `sounds.done` / `sounds.blocked`
  (absolute, or relative to `~/.config/herdr-app`); the bundled originals
  are MP3, so prefer MP3 and fall back to WAV if the builder finds the app
  plays it (verify with Settings → Alerts → Play).
- `install.sh` copies the files to `~/.config/herdr-app/sounds/` and
  sets the two keys as described under install.sh (step 3). Together
  with `theme`, those are the only three keys the script ever writes in
  `settings.json`, which is otherwise the person's file.

### TUI: retheme `config.toml` to the same palette

The Herdr TUI theme in this repo moves from violet to the Main Menu
palette so both front-ends match. Behavior and structure unchanged;
values only, plus the agent-glyph simplification below.

`[theme.custom]`: `accent #FCEE0A`, `panel_bg #0C0D11`, `sidebar_bg
#07080A`, `active_row_bg #2A2708`, `selection_bg #4A4410`, `surface0
#121318`, `surface1 #1A1B21`, `surface_dim #2A2B2F`, `overlay0 #5A5B52`,
`overlay1 #9A9B8E`, `text #F0EEE4`, `subtext0 #B8B6A6`, `mauve #00F0FF`
(branches), `green #5EF38C` (idle), `yellow #FCEE0A` (working), `red
#FF003C` (blocked), `blue #00F0FF` (unseen), `teal #55EAD4` (done),
`peach #FF7A00` (interrupted).

`[ui]`: `tab_bar_right` = zoom, `text "NIGHT CITY"`, `text "2077"`,
datetime `%H:%M`; `tab_bar_right_separator = " // "`. Everything else
(symbols, `pane_borders = "always"`, labels on pane borders, sidebar
width 30) stays.

`[ui.sidebar.agents]`: one `rows` entry with the agent glyph in
`#FCEE0A` bold; **drop the `rows_by_agent` brand-color table** (the glyph
already identifies the agent; one color reads as one screen). Add
`[ui.sidebar.spaces]` rows: workspace in `#FCEE0A` bold, branch in
`#00F0FF`, then `git_status`.

The `plugins/agent-icons` plugin is unchanged. `README.md`'s TUI section
updates its palette description and the Ghostty cross-link stays.

### Verification additions

- `herdr config check` passes on the new `config.toml`.
- Both sound files play from Settings → Alerts; `done` is noticeably
  shorter and higher than `blocked`.
- `install.sh --uninstall` leaves `settings.json` without the two keys and
  otherwise byte-identical to the backup.
