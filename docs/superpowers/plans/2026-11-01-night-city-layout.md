# Night City Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Cyberpunk 2077 "Main Menu" look for the Herdr desktop app — new layout `night-city`, theme `cyberpunk-2077`, seven restyled mod clones, Rajdhani font, two synthesized alert sounds, an installer — plus the matching TUI palette in `config.toml`.

**Architecture:** Nothing Herdr ships is edited. Development happens live in `~/.config/herdr-app` (hot reload + `herdr-app shot`), and every finished folder is copied into `app/` in this repo, which is the source of truth and a valid herdr.dev layout share. Mods are gpui-kit JavaScript; painted geometry (cut corners, stripes, gradients) comes from `window.paint_path` through two small helper files copied identically into each mod.

**Tech Stack:** Herdr app 0.1.11 (gpui-kit / GPUI, JS mods), JSON layout + theme, Python 3 stdlib (`wave`, `json`, `unittest`), Node 22 (`node --test`), bash, `ffmpeg` (MP3), Herdr TUI 0.9.5 (`config.toml`).

**Spec:** `docs/superpowers/specs/2026-11-01-night-city-layout-design.md` — read it first; every task below names the spec section it implements and only repeats the values it pins.

## Global Constraints

- Work on branch `night-city` off `main`; one commit per task, message in imperative mood, no trailer beyond the conversation's attribution line.
- Never edit a shipped file under `~/.config/herdr-app` (`layouts/main.json`, `mods/{workspace-chrome,spaces,agents,tabs,pane,workspace-status,new-menu,…}`, `AGENTS.md`, `*.d.ts`). New files and `nc-*` / `night-city` / `cyberpunk-2077` names only.
- Every `nc-*` mod passes `herdr-app check ~/.config/herdr-app/mods/<name>` (prints `check passed: <path>`, exit 0) before its task is done, and `herdr-app status` shows `"errors": []`.
- No `cx.timer`, `setTimeout`, `setInterval` for animation. Motion only via `.spin`, `.loop`, `.transition`, `.frames`.
- Keep every node id of `main.json`: `root, sidebar, brand, sidebar-lists, spaces, agents, sidebar-footer, work, tabs, work-body, main, panel, panel-body, files, changes, status`.
- Palette (verbatim from the spec): accent `#FCEE0A`, accent_foreground `#07080A`, canvas `#07080A`, chrome `#0C0D11`, popover `#0C0D11`, surface `#121318`, raised `#1A1B21`, hover `#1F2027`, selected `#2A2708`, border `#2A2B2F`, input `#3A3B40`, foreground `#F0EEE4`, muted `#9A9B8E`, dim `#5A5B52`, working `#FCEE0A`, blocked `#FF003C`, done `#55EAD4`, idle `#5EF38C`, unknown `#5A5B52`, selection `#4A4410`, cursor `#FCEE0A`. Mods read these through `theme()`; never hardcode them except where the spec says (glitch cyan `#00F0FF` / red `#FF003C`, avatar MARK map, header gradient stops).
- Red is only ever *blocked / needs you*.
- Repo copies exclude the app-written `gpui-kit.d.ts` and `jsconfig.json` inside mod folders.
- Screenshots go to `<scratch>/shots/` (create it; `<scratch>` is a local scratch folder of your choice, never committed); read each PNG with the Read tool and judge it against the task's pass list.
- Sync a finished mod to the repo with
  `rsync -a --delete --exclude gpui-kit.d.ts --exclude jsconfig.json ~/.config/herdr-app/mods/<name>/ app/mods/<name>/`.

## Review Focus

1. Sidebar dragged under 160 px (the rail): every sidebar mod must still render its compact form — `nc-chrome` shows only the ram mark, `nc-spaces`/`nc-agents` their numbered compact rows — and dragging back restores the full rows. Pinned to Task 3 and Task 7.
2. `settings.json` missing, or present without a `sounds` key: the installer must create what's missing and still produce a byte-identical restore on uninstall. Pinned to Task 11.
3. Ten or more tabs, and a tab named longer than 170 px: labels read `10 · NAME`, still truncate, and the bar still scrolls. Pinned to Task 5.
4. A pane whose program is a plain shell (no agent) and an agent on another machine (`vps/t7`): the pane header shows no status readout for the shell; the agent row still shows its machine label beside the name. Pinned to Task 7 and Task 8.
5. `layout.clone` copying `main`'s stale theme click (`{light: cyberpunk, dark: atom-one-dark}`) into `layouts/.state/night-city.json`: the layout file's explicit theme must win, visibly, on the first screenshot. Pinned to Task 2.

---

### Task 1: Branch, theme file, theme test

**Files:**
- Create: `app/themes/cyberpunk-2077.json`
- Create: `app/tests/test_theme.py`
- Modify: `.gitignore` (add `app/mods/*/gpui-kit.d.ts`, `app/mods/*/jsconfig.json`)
- Commit also: `docs/superpowers/specs/2026-11-01-night-city-layout-design.md`, `docs/superpowers/plans/2026-11-01-night-city-layout.md`

**Interfaces:**
- Produces: theme name `cyberpunk-2077`, installed at `~/.config/herdr-app/themes/cyberpunk-2077.json`, used by Task 2's layout root and Task 11's installer.

- [ ] **Step 1: Branch**

Run: `git checkout -b night-city`
Expected: `Switched to a new branch 'night-city'`

- [ ] **Step 2: Write the failing test**

```python
# app/tests/test_theme.py
import json, re, unittest, pathlib
HEX = re.compile(r"^#[0-9A-F]{6}$")
T = json.loads((pathlib.Path(__file__).parents[1] / "themes" / "cyberpunk-2077.json").read_text())
class Theme(unittest.TestCase):
    def test_top_level(self):
        for k in ("background", "foreground", "selection", "cursor", "ansi", "colors"): self.assertIn(k, T)
        self.assertEqual(T["background"], "#07080A"); self.assertEqual(T["cursor"], "#FCEE0A")
    def test_ansi_16_hex(self):
        self.assertEqual(len(T["ansi"]), 16)
        for c in T["ansi"]: self.assertRegex(c, HEX)
        self.assertEqual(T["ansi"][1], "#FF003C"); self.assertEqual(T["ansi"][3], "#FCEE0A"); self.assertEqual(T["ansi"][6], "#00F0FF")
    def test_colors(self):
        c = T["colors"]
        self.assertEqual(c["accent"], "#FCEE0A"); self.assertEqual(c["accent_foreground"], "#07080A")
        self.assertEqual(c["selected"], "#2A2708"); self.assertEqual(c["blocked"], "#FF003C"); self.assertEqual(c["done"], "#55EAD4")
        for v in c.values(): self.assertRegex(v, HEX)
if __name__ == "__main__": unittest.main()
```

- [ ] **Step 3: Run it to verify it fails**

Run: `python3 -I -m unittest app/tests/test_theme.py -v`
Expected: FAIL (FileNotFoundError on the theme file)

- [ ] **Step 4: Write `app/themes/cyberpunk-2077.json`**

Exactly the JSON block in spec § "The theme".

- [ ] **Step 5: Run the test, verify it passes**

Run: `python3 -I -m unittest app/tests/test_theme.py -v`
Expected: `OK` (3 tests)

- [ ] **Step 6: Install the theme and confirm the app accepts it**

Run: `cp app/themes/cyberpunk-2077.json ~/.config/herdr-app/themes/ && sleep 1 && herdr-app status | python3 -I -c 'import json,sys; print(json.load(sys.stdin)["errors"])'`
Expected: `[]`

- [ ] **Step 7: Commit**

```bash
git add .gitignore docs app/themes app/tests/test_theme.py
git commit -m "Add cyberpunk-2077 theme, spec and plan for the Night City layout"
```

### Task 2: The `night-city` layout (stock mods, new look)

**Files:**
- Create: `app/layouts/night-city.json`, `app/layouts/night-city.svg`
- Create: `app/tests/test_layout.py`

**Interfaces:**
- Produces: layout name `night-city` with `main.json`'s node ids; later tasks only change `content.mod` on `brand`, `sidebar-footer`, `spaces`, `agents`, `tabs`, `status` and `main.pane.header.content.mod`, and add `ui_font` on root (Task 3).

- [ ] **Step 1: Clone the shipped layout**

Run: `herdr-app do layout.clone '{"name":"main","as":"night-city"}' && herdr-app status | python3 -I -c 'import json,sys; s=json.load(sys.stdin); print(s["layout"], s["errors"])'`
Expected: `night-city []`

- [ ] **Step 2: Screenshot before any edit (Review Focus 5)**

Run: `mkdir -p <shots> && herdr-app shot <shots>/02-cloned.png` then Read it.
Expected: the window still shows the grey atom-one-dark look (the stale click came along). This is the baseline the next step must visibly beat.

- [ ] **Step 3: Write the failing test**

```python
# app/tests/test_layout.py
import json, unittest, pathlib
L = json.loads((pathlib.Path(__file__).parents[1] / "layouts" / "night-city.json").read_text())
def ids(n, out=None):
    out = out if out is not None else set(); out.add(n.get("id")); [ids(c, out) for c in n.get("children", [])]; return out
def node(n, i):
    if n.get("id") == i: return n
    for c in n.get("children", []):
        f = node(c, i)
        if f: return f
class Layout(unittest.TestCase):
    def test_root_look(self):
        self.assertEqual(L["theme"], "cyberpunk-2077"); self.assertEqual(L["titlebar"], "none")
        self.assertEqual(L["preview"], "layouts/night-city.svg"); self.assertEqual(L["background"], "canvas")
    def test_ids_kept(self):
        self.assertTrue({"root","sidebar","brand","sidebar-lists","spaces","agents","sidebar-footer","work","tabs","work-body","main","panel","panel-body","files","changes","status"} <= ids(L))
    def test_pane_frame(self):
        p = node(L, "main")["content"]["pane"]
        self.assertEqual(p["radius"], 0); self.assertEqual(p["gap"], 8); self.assertTrue(p["lone"])
        self.assertEqual(p["border"], {"width": 1, "color": "border"}); self.assertEqual(p["focus"], {"width": 1, "color": "accent"})
        self.assertEqual(p["header"]["height"], 30)
if __name__ == "__main__": unittest.main()
```

- [ ] **Step 4: Run it to verify it fails**

Run: `python3 -I -m unittest app/tests/test_layout.py -v`
Expected: FAIL (file missing)

- [ ] **Step 5: Edit the live clone, then copy it to the repo**

In `~/.config/herdr-app/layouts/night-city.json`: set root `"theme": "cyberpunk-2077"`, `"preview": "layouts/night-city.svg"`; in `main.content.pane` set `"radius": 0` (keep gap 8, lone true, border/focus/header as cloned). Leave all `content.mod` names as shipped for now. Then
`mkdir -p app/layouts && cp ~/.config/herdr-app/layouts/night-city.json app/layouts/`.

- [ ] **Step 6: Draw `app/layouts/night-city.svg`** and copy it beside the live layout

A 320×200 SVG: `#07080A` background, a 62-wide `#0C0D11` sidebar with a `#FCEE0A` 1-px line under a 12-px brand strip, a `#FCEE0A` filled tab 40×8 at the top of the work area, a `#FCEE0A`-stroked square pane below it. Then `cp app/layouts/night-city.svg ~/.config/herdr-app/layouts/`.

- [ ] **Step 7: Run the test, verify it passes**

Run: `python3 -I -m unittest app/tests/test_layout.py -v`
Expected: `OK` (3 tests)

- [ ] **Step 8: Visual check**

Run: `sleep 1 && herdr-app status | python3 -I -c 'import json,sys; print(json.load(sys.stdin)["errors"])' && herdr-app shot <shots>/02-layout.png`, Read it.
Pass when: background near-black, sidebar `#0C0D11`, focused pane border yellow, pane corners square, terminal text colors changed (yellow prompt, no violet anywhere). The stale click did **not** win.

- [ ] **Step 9: Commit**

```bash
git add app/layouts app/tests/test_layout.py
git commit -m "Add night-city layout with the cyberpunk-2077 theme and square pane frames"
```

### Task 3: `nc-chrome` — geometry helpers, fonts, brand lockup B, footer

**Files:**
- Create (live, then rsync): `~/.config/herdr-app/mods/nc-chrome/{geometry.js, shape.js, ram.svg, fonts/Rajdhani-Medium.ttf, fonts/Rajdhani-SemiBold.ttf, fonts/Rajdhani-Bold.ttf, fonts/OFL.txt}`; modify its cloned `main.js`
- Create: `app/tests/geometry.test.js`, `app/tests/mods.test.js`
- Modify: `app/layouts/night-city.json` (root `ui_font`, `brand` and `sidebar-footer` → `nc-chrome`) and the live copy

**Interfaces:**
- Produces (`geometry.js`, copied verbatim into every later mod): `CORNERS: string[]`, `trianglePoints(cut: number, corner: "tl"|"tr"|"br"|"bl"): [number, number][]` (3 points), `edgePoints(cut, corner): [[number, number], [number, number]]`, both per the vertex table in spec § "The chamfer technique".
- Produces (`shape.js`, copied verbatim): `cutCorner(behind: Color, cut: number, corner = "br"): Element` — a `div().absolute().size(cut)` pinned with `.top(0)/.bottom(0)/.left(0)/.right(0)` per corner, child `window.paint_path(PathBuilder.fill().add_polygon(trianglePoints(cut, corner), true).build(), behind)`; `cutCornerEdge(behind, line, cut, corner = "tr"): Element` — same plus a second `paint_path` of `PathBuilder.stroke(1).move_to(a).line_to(b).build()` in `line`; `gradientLayer(angle, from, to): Element`; `stripesLayer(color, width = 7, interval = 14): Element` — both `paint_path(RECT, Background.…).absolute().top(0).left(0).size_full()` with `RECT` built from `"0%"/"100%"` as in `mods/win98/kit.js:190`.
- Produces: fonts resolvable as family `"Rajdhani"` once the layout sets `ui_font`.

- [ ] **Step 1: Write the failing geometry test**

```js
// app/tests/geometry.test.js
import { test } from "node:test"; import assert from "node:assert/strict";
import { CORNERS, trianglePoints, edgePoints } from "../mods/nc-chrome/geometry.js";
test("corners", () => assert.deepEqual(CORNERS, ["tl", "tr", "br", "bl"]));
test("triangles", () => {
  assert.deepEqual(trianglePoints(8, "br"), [[8, 0], [8, 8], [0, 8]]);
  assert.deepEqual(trianglePoints(8, "tr"), [[0, 0], [8, 0], [8, 8]]);
  assert.deepEqual(trianglePoints(8, "tl"), [[0, 0], [8, 0], [0, 8]]);
  assert.deepEqual(trianglePoints(8, "bl"), [[0, 0], [0, 8], [8, 8]]);
});
test("edges", () => {
  assert.deepEqual(edgePoints(14, "tr"), [[0, 0], [14, 14]]);
  assert.deepEqual(edgePoints(14, "br"), [[14, 0], [0, 14]]);
  assert.deepEqual(edgePoints(14, "tl"), [[14, 0], [0, 14]]);
  assert.deepEqual(edgePoints(14, "bl"), [[0, 0], [14, 14]]);
});
test("unknown corner throws", () => assert.throws(() => trianglePoints(8, "x")));
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test app/tests/geometry.test.js`
Expected: fails to import (module not found)

- [ ] **Step 3: Clone the mod and write `geometry.js`**

Run: `herdr-app do mod.clone '{"name":"workspace-chrome","as":"nc-chrome"}'`. Write `~/.config/herdr-app/mods/nc-chrome/geometry.js` (no imports) implementing the Interfaces block; `trianglePoints`/`edgePoints` throw `RangeError` on an unknown corner. Then `mkdir -p app/mods/nc-chrome && cp ~/.config/herdr-app/mods/nc-chrome/geometry.js app/mods/nc-chrome/`.

- [ ] **Step 4: Run the geometry test, verify it passes**

Run: `node --test app/tests/geometry.test.js`
Expected: 4 passing

- [ ] **Step 5: Write `shape.js`** per the Interfaces block, in the live folder.

- [ ] **Step 6: Fetch the fonts**

Run (in the live folder): `mkdir -p fonts && for f in Rajdhani-Medium.ttf Rajdhani-SemiBold.ttf Rajdhani-Bold.ttf OFL.txt; do curl -fsSL -o fonts/$f https://raw.githubusercontent.com/google/fonts/main/ofl/rajdhani/$f; done && ls -l fonts`
Expected: four files, each `.ttf` > 100 kB.

- [ ] **Step 7: Draw `ram.svg`**

32×32 viewBox, one `<path fill="currentColor">`: flat ram-head silhouette with a curled horn, facing left, with the `›_` prompt cut out of the face as negative space (use `fill-rule="evenodd"` with the prompt as inner subpaths). Reference the shape in `~/.config/herdr-app/frame/welcome/herdr.png`. Must read at 22 px and 18 px.

- [ ] **Step 8: Restyle `main.js`** per spec § nc-chrome

Brand row (expanded): keep `pl(76)` on macOS, keep both buttons (`rounded(0)`, icon `t.dim`, hover text `t.accent` on `t.hover`), replace the `image("frame/welcome/herdr.png")` + "Herdr" with: `svg("mods/nc-chrome/ram.svg").size(22).text_color(t.accent)`; a `relative()` wordmark box containing three `div().child("HERDR")` at `text_size(17).font_bold()` — cyan `#00F0FF` copy inside `div().absolute().left(-1.5).top(-1).h(9).overflow_hidden()`, red `#FF003C` copy inside `div().absolute().left(1.5).top(9).h(9).overflow_hidden()` with the text shifted `.mt(-9)`, yellow `t.accent` copy on top in flow; under it `div().text_size(9.5).text_color(t.dim).child("▚▞ NIGHT CITY")`. Root: `.border_b(1).border_color(t.accent)`. Rail (`narrow()`): ram mark 18 px centered. Footer: caps labels 13 px, `rounded(0)`, update dot `div().size(6).bg(t.accent)` (no radius), and before the border `div().relative().h(4).w_full().child(stripesLayer(t.accent, 6, 12))`.

- [ ] **Step 9: Point the layout at it**

In both `~/.config/herdr-app/layouts/night-city.json` and `app/layouts/night-city.json`: `brand.content.mod = "nc-chrome"`, `sidebar-footer.content.mod = "nc-chrome"` (props `{footer: true}` kept), root `"ui_font": "Rajdhani"`. Add to `app/tests/test_layout.py::test_root_look`: `self.assertEqual(L["ui_font"], "Rajdhani")`.

- [ ] **Step 10: Check**

Run: `herdr-app check ~/.config/herdr-app/mods/nc-chrome && python3 -I -m unittest app/tests/test_layout.py && herdr-app do layout.switch --name main && herdr-app do layout.switch --name night-city && herdr-app shot <shots>/03-chrome.png`
Expected: `check passed`, `OK`, then Read the PNG. Pass when: yellow ram mark, HERDR with a cyan upper fringe and red lower fringe, `▚▞ NIGHT CITY` under it, yellow 1-px underline across the sidebar at y≈46, stripes above the footer, and **all sidebar/tab text in a condensed sans (Rajdhani)**, terminals still monospace. (The layout switch round-trip is the "next look change" that loads the fonts.)

- [ ] **Step 11: Rail check (Review Focus 1)**

Run: `herdr-app do layout.resize '{"id":"sidebar","px":76}' && sleep 1 && herdr-app shot <shots>/03-rail.png && herdr-app do layout.resize '{"id":"sidebar","px":268}'`, Read the PNG.
Pass when: only the ram mark shows in the brand block, nothing overlaps the traffic lights.

- [ ] **Step 12: Write the mods test, then sync**

```js
// app/tests/mods.test.js
import { test } from "node:test"; import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
const root = new URL("../mods/", import.meta.url);
const mods = readdirSync(root).filter(n => n.startsWith("nc-"));
test("helper copies identical", () => {
  for (const f of ["geometry.js", "shape.js"]) {
    const base = readFileSync(new URL(`nc-chrome/${f}`, root), "utf8");
    for (const m of mods) if (existsSync(new URL(`${m}/${f}`, root))) assert.equal(readFileSync(new URL(`${m}/${f}`, root), "utf8"), base, `${m}/${f}`);
  }
});
test("no JS timers for motion", () => {
  for (const m of mods) assert.doesNotMatch(readFileSync(new URL(`${m}/main.js`, root), "utf8"), /setTimeout|setInterval/, m);
});
test("no app-written files committed", () => {
  for (const m of mods) for (const f of ["gpui-kit.d.ts", "jsconfig.json"]) assert.ok(!existsSync(new URL(`${m}/${f}`, root)), `${m}/${f}`);
});
```

Run: `rsync -a --delete --exclude gpui-kit.d.ts --exclude jsconfig.json ~/.config/herdr-app/mods/nc-chrome/ app/mods/nc-chrome/ && node --test app/tests/`
Expected: all passing.

- [ ] **Step 13: Commit**

```bash
git add app/mods/nc-chrome app/layouts app/tests
git commit -m "Add nc-chrome: painted-geometry helpers, Rajdhani, ram + glitch wordmark, footer stripe"
```

### Task 4: `nc-new-menu`

**Files:**
- Create (live, then rsync): `mods/nc-new-menu/` from `new-menu` + `geometry.js`, `shape.js` copies

**Interfaces:**
- Consumes: `cutCorner`.
- Produces: mod name `nc-new-menu`, opened by Task 5 with `openOverlay({ mod: "nc-new-menu", kind: "popup", width: 250, height: 512, frame: "none" })`.

- [ ] **Step 1: Clone and copy helpers**

Run: `herdr-app do mod.clone '{"name":"new-menu","as":"nc-new-menu"}' && cp ~/.config/herdr-app/mods/nc-chrome/{geometry.js,shape.js} ~/.config/herdr-app/mods/nc-new-menu/`

- [ ] **Step 2: Restyle `main.js`** per spec § nc-new-menu

Root: `.relative().bg(t.popover).border(1).border_color(t.accent).shadow_lg()` with `.child(cutCorner(t.canvas, 10, "tr"))` first; rows `rounded(0)`, hover `bg(t.accent)` and text/hint `t.accent_foreground` (hover styles via `.hover(s => s.bg(t.accent).text_color(t.accent_foreground))`); the Terminal row label `"TERMINAL"`; section label `"START AN AGENT"` `text_size(10.5).font_bold().text_color(t.accent)`; divider `t.border`. Keyboard handling unchanged.

- [ ] **Step 3: Check and look**

Run: `herdr-app check ~/.config/herdr-app/mods/nc-new-menu && herdr-app do mod.open --name nc-new-menu && sleep 1 && herdr-app shot <shots>/04-menu.png && herdr-app do overlay.close`, Read the PNG.
Pass when: black menu with a yellow 1-px frame, cut top-right corner, yellow `START AN AGENT` label; hovering isn't capturable, so also confirm in code that the hover sets both bg and text color.

- [ ] **Step 4: Sync, test, commit**

Run: `rsync -a --delete --exclude gpui-kit.d.ts --exclude jsconfig.json ~/.config/herdr-app/mods/nc-new-menu/ app/mods/nc-new-menu/ && node --test app/tests/`
Expected: passing.

```bash
git add app/mods/nc-new-menu
git commit -m "Add nc-new-menu: yellow-framed + menu with cut corner"
```

### Task 5: `nc-tabs`

**Files:**
- Create (live, then rsync): `mods/nc-tabs/` from `tabs` + helper copies
- Modify: both copies of `layouts/night-city.json` (`tabs.content.mod = "nc-tabs"`)

**Interfaces:**
- Consumes: `cutCorner`, `nc-new-menu`.
- Produces: tab label format `${String(index).padStart(2, "0")} · ${name.toUpperCase()}` where `index` is the tab's 1-based position in `space.tabs`.

- [ ] **Step 1: Clone, copy helpers, point the layout at it** (both layout copies; add `self.assertEqual(node(L, "tabs")["content"]["mod"], "nc-tabs")` to `test_layout.py` as a new `test_mods` method that later tasks extend).

- [ ] **Step 2: Restyle `main.js`** per spec § nc-tabs

`item(c, i)`: label as in Interfaces (index = `space.tabs.findIndex(x => x.id === c.id) + 1`); `rounded(0)`, `h(29).px(12).text_size(12.8).font_bold()`; active → `.relative().bg(t.accent).border_color(t.accent).text_color(t.accent_foreground).child(cutCorner(t.chrome, 9, "br"))`, icon/spinner/close in `t.accent_foreground`; inactive → `border_color(t.border).text_color(t.muted)`, spinner `t.muted`; status dot `div().size(6).bg(t[c.status])` (no radius). `button("tab-new", "+")` text `t.accent`, `text_size(16)`, opens `nc-new-menu` with `frame: "none"`. `panelButton`: caps label, on-state `text_color(t.accent).border_b(2).border_color(t.accent)` with `bg(t.chrome)`. Root: `.relative()` plus `div().absolute().left(lightsPadding).bottom(-1).h(1).w(180).bg(t.accent)`. Everything else (drag, wheel, rename, context menu, `syncPanel`, window buttons) verbatim from the clone.

- [ ] **Step 3: Check and look with two tabs (Review Focus 3)**

Run: `herdr-app check ~/.config/herdr-app/mods/nc-tabs && herdr-app do tab.new --name "a very long tab name that must truncate in the bar" && sleep 1 && herdr-app shot <shots>/05-tabs.png`, Read it, then `herdr-app do tab.close --confirmed true` (closes the new, active tab) and `herdr-app do tab.select --index 1`.
Pass when: active tab solid yellow with black text and a cut corner, label starts `02 ·` and truncates with an ellipsis inside the bar, inactive tab outlined, `+` yellow, Files/Changes uppercase, yellow 180-px segment under the first tab.

- [ ] **Step 4: Sync, tests, commit**

Run: `rsync … nc-tabs … && node --test app/tests/ && python3 -I -m unittest app/tests/test_layout.py`

```bash
git add app/mods/nc-tabs app/layouts app/tests/test_layout.py
git commit -m "Add nc-tabs: yellow angular active tab, indexed caps labels, underlined panel switches"
```

### Task 6: `nc-spaces`

**Files:**
- Create (live, then rsync): `mods/nc-spaces/` from `spaces` + helper copies
- Modify: both layout copies (`spaces.content.mod = "nc-spaces"`), `test_layout.py::test_mods`

**Interfaces:**
- Consumes: `cutCorner`.
- Produces: `MARK = { ansi6: "#00F0FF", ansi3: "#FCEE0A", ansi4: "#3D9BFF", ansi5: "#C77DFF", ansi2: "#5EF38C", ansi1: "#FF003C" }` and `INK = { "#00F0FF": "#07080A", "#FCEE0A": "#07080A", "#5EF38C": "#07080A" }` (default ink `#F0EEE4`).

- [ ] **Step 1: Clone, copy helpers, point the layout** (and extend `test_mods`).

- [ ] **Step 2: Restyle `main.js`** per spec § nc-spaces

Header: `div().w(2).h(10).bg(t.accent)` then `"SPACES"` `text_size(11).font_bold().text_color(t.dim)`; `+` in `t.accent`. `row()`: `rounded(0)`, active → `.relative().bg(t.selected).child(div().absolute().left(0).top(0).bottom(0).w(2).bg(t.accent)).child(cutCorner(t.chrome, 8, "br"))`; avatar `size(18).rounded(0).relative()` with `bg(fill)`, letter in `INK[fill] ?? t.foreground`, `.child(cutCorner(on ? t.selected : t.chrome, 6, "br"))`; name `text_size(13.5).font_semibold()`. Machine header labels `.toUpperCase()`, connected dot `size(6)` no radius. `compact()`, drag, tree rows, git tail, menus: verbatim.

- [ ] **Step 3: Check and look**

Run: `herdr-app check ~/.config/herdr-app/mods/nc-spaces && herdr-app shot <shots>/06-spaces.png`, Read it.
Pass when: `▌SPACES` header, active row olive with a yellow left bar and cut corner, avatar a cut square in the mapped color with dark ink on yellow/cyan/green.

- [ ] **Step 4: Sync, tests, commit** — `git commit -m "Add nc-spaces: cut-corner rows, yellow tick headers, 2077 avatar palette"`

### Task 7: `nc-agents`

**Files:**
- Create (live, then rsync): `mods/nc-agents/` from `agents` + helper copies
- Modify: both layout copies (`agents.content.mod = "nc-agents"`), `test_layout.py::test_mods`

**Interfaces:**
- Consumes: `cutCorner`.
- Produces: `needsYou(t, compact: boolean): Element` — the red tag: `h_flex().relative().h(18).px(6).bg(t.blocked).text_size(10).font_bold().text_color("#07080A").child(compact ? "!" : "NEEDS YOU").child(cutCorner(behind, 4, "tl")).child(cutCorner(behind, 4, "br")).loop("opacity", { from: 0.55, to: 1, period: 1200 })` where `behind` is the row's surface (`t.selected` when focused, else `t.chrome`). Task 8 copies this function (it is 6 lines; don't share a file).

- [ ] **Step 1: Clone, copy helpers, point the layout** (extend `test_mods`).

- [ ] **Step 2: Restyle `main.js`** per spec § nc-agents

Header like Spaces (`▌AGENTS`), sort icon hover `t.accent`. Group headers `text_size(11).font_bold()`, label `.toUpperCase()`, color `t[g.status] ?? t.dim`, `"PINNED"` in `t.accent`. `row()`: `rounded(0)`, focused → olive + left bar + `cutCorner(t.chrome, 8, "br")` as in nc-spaces. `status()`: working unchanged (`spin(900)`); blocked → `needsYou(t, compact)`; done → `div().text_color(t.done).child("◆")`; idle → `div().size(7).border(1.5).border_color(t.idle)` (no radius). Sort popup rows hover `bg(t.accent)` + `text_color(t.accent_foreground)`. Everything else verbatim: pins, folds, sub-agent tree lines, `setAgentOrder`, compact rows, empty-state text.

- [ ] **Step 3: Check and look (Review Focus 1 & 4)**

Run: `herdr-app check ~/.config/herdr-app/mods/nc-agents && herdr-app shot <shots>/07-agents.png`, Read it; then the rail round-trip from Task 3 Step 11 saved as `07-rail.png`.
Pass when: caps colored group headers, working row with yellow spinner, focused row olive with cut corner; in the rail, numbered compact rows with a status mark each. Static check: `grep -n "a.address.includes(\"/\")" main.js` still present (machine label kept); `grep -c "needsYou" main.js` ≥ 3 (full, compact, sort-independent).

- [ ] **Step 4: Sync, tests, commit** — `git commit -m "Add nc-agents: colored caps sections, blinking NEEDS YOU tag, square status marks"`

### Task 8: `nc-pane` (pane header)

**Files:**
- Create (live, then rsync): `mods/nc-pane/` from `pane` + helper copies
- Modify: both layout copies (`main.content.pane.header.content.mod = "nc-pane"`), `test_layout.py::test_mods`

**Interfaces:**
- Consumes: `gradientLayer`, `cutCornerEdge`, `needsYou` (copied from Task 7).

- [ ] **Step 1: Clone, copy helpers, point the layout** (extend `test_mods`).

- [ ] **Step 2: Restyle `main.js`** per spec § nc-pane

Root `h_flex().relative().bg(t.background)` with first child `gradientLayer(90, Background.stop("#FCEE0A14", 0), Background.stop("#FCEE0A00", 40))`, then icon, name `.toUpperCase()` `text_size(12).font_bold()`, folder `t.dim`; right readout `text_size(10.5).font_bold()`: working → `"WORKING"` in `t.working` + spinner; blocked → `needsYou(t, false)` with `behind = t.background`; done → `"◆ DONE"` in `t.done`; idle/shell → nothing. Buttons `rounded(0)`, hover `text_color(t.accent)`. Last child: `cutCornerEdge(t.canvas, p.focused ? t.accent : t.border, 14, "tr")` positioned `.top(-1).right(-1)`.

- [ ] **Step 3: Check and look (Review Focus 4)**

Run: `herdr-app check ~/.config/herdr-app/mods/nc-pane && herdr-app do pane.split --direction right && sleep 1 && herdr-app shot <shots>/08-pane.png`, Read it, then `herdr-app do pane.close` (closes the new, focused shell pane).
Pass when: both headers show caps names with a faint yellow wash on the left; the shell pane's header has **no** status readout; the focused pane's top-right corner is cut with a yellow diagonal, the unfocused one grey. If the diagonal doesn't reach the frame line, remove `cutCornerEdge`, keep the pane square, and record it in Task 12's RECIPE "Watch out".

- [ ] **Step 4: Sync, tests, commit** — `git commit -m "Add nc-pane: gradient header, caps status readout, cut frame corner"`

### Task 9: `nc-status` and the final layout check

**Files:**
- Create (live, then rsync): `mods/nc-status/` from `workspace-status` + helper copies
- Modify: both layout copies (`status.content.mod = "nc-status"`), `test_layout.py::test_mods` (now asserting all seven: brand/footer `nc-chrome`, `nc-spaces`, `nc-agents`, `nc-tabs`, header `nc-pane`, `nc-status`)

**Interfaces:**
- Consumes: `stripesLayer`, `cutCorner`.

- [ ] **Step 1: Clone, copy helpers, point the layout; finish `test_mods`.**

- [ ] **Step 2: Restyle `main.js`** per spec § nc-status

Root `h_flex().size_full().gap(16).items_center().bg(t.chrome).border_t(1).border_color(t.border).text_size(11.5).font_bold().text_color(t.muted)` (no left padding); first child `div().relative().w(42).h_full().flex_none().child(stripesLayer(t.accent, 7, 14)).child(cutCorner(t.chrome, 10, "br"))`, then `div().w(14)` spacer; labels `.toUpperCase()`: machine (`▣`/server icon kept), `⎇ BRANCH`, `● N AGENTS` with the dot `div().size(6).bg(t.idle)`, `· N NEEDS YOU` in `t.blocked`; then `div().text_color(t.accent).child("NC_OS 2.077 // ONLINE")`; `flex_1()`; palette hint caps in `t.dim`, `pr(14)`.

- [ ] **Step 3: Check and full-window look**

Run: `herdr-app check ~/.config/herdr-app/mods/nc-status && python3 -I -m unittest app/tests/ -v && herdr-app shot <shots>/09-full.png`, Read it.
Pass when: stripes cap on the left ending on a diagonal, caps readouts, yellow `NC_OS 2.077 // ONLINE`; the whole window matches the mockup's structure (brand, lists, tabs, pane, status). Also `herdr-app do layout.switch` three times returns to `night-city` without errors, and `herdr-app status` errors stay `[]`.

- [ ] **Step 4: Sync, tests, commit** — `git commit -m "Add nc-status: hazard-stripe cap and caps readouts; layout now fully on nc-* mods"`

### Task 10: Sounds

**Files:**
- Create: `app/sounds/make-sounds.py`, `app/sounds/nc-done.wav`, `app/sounds/nc-done.mp3`, `app/sounds/nc-blocked.wav`, `app/sounds/nc-blocked.mp3`
- Create: `app/tests/test_sounds.py`

**Interfaces:**
- Produces: `make-sounds.py [outdir]` (default: its own folder) writing the four files; module functions `done_samples(rate=44100) -> list[int]`, `blocked_samples(rate=44100) -> list[int]` (16-bit ints), `write_wav(path, samples, rate)`, `to_mp3(wav_path) -> bool` (False when `ffmpeg` is missing).

- [ ] **Step 1: Write the failing test**

```python
# app/tests/test_sounds.py
import unittest, wave, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parents[1] / "sounds")); import make_sounds as m
D = pathlib.Path(__file__).parents[1] / "sounds"
class Sounds(unittest.TestCase):
    def test_done_shape(self):
        s = m.done_samples(); self.assertAlmostEqual(len(s) / 44100, 0.125, delta=0.02)
        self.assertLessEqual(max(abs(x) for x in s), int(32767 * 10 ** (-12 / 20)) + 1)
    def test_blocked_shape(self):
        s = m.blocked_samples(); self.assertAlmostEqual(len(s) / 44100, 0.26, delta=0.03)
        self.assertGreater(len(s), len(m.done_samples()))
    def test_files_exist_and_are_mono_16bit(self):
        for n in ("nc-done.wav", "nc-blocked.wav"):
            with wave.open(str(D / n)) as w: self.assertEqual((w.getnchannels(), w.getsampwidth(), w.getframerate()), (1, 2, 44100))
        for n in ("nc-done.mp3", "nc-blocked.mp3"): self.assertGreater((D / n).stat().st_size, 1000)
if __name__ == "__main__": unittest.main()
```

- [ ] **Step 2: Run it to verify it fails** — `python3 -I -m unittest app/tests/test_sounds.py` → ImportError.

- [ ] **Step 3: Write `app/sounds/make_sounds.py`** per spec § Sounds: done = E5 659 Hz square 55 ms then B5 988 Hz square 70 ms with 5 ms attack, exponential decay on the second tone, a 2nd harmonic at −12 dB; blocked = three A3 220 Hz sawtooth pulses 60 ms with 40 ms gaps, soft clip at 0.8, decay on the last. Peak-normalize to −12 dBFS. `__main__` writes WAVs then `to_mp3` via `ffmpeg -y -i in.wav -codec:a libmp3lame -q:a 4 out.mp3`.

- [ ] **Step 4: Generate and test**

Run: `python3 -I app/sounds/make_sounds.py && python3 -I -m unittest app/tests/test_sounds.py -v`
Expected: `OK` (3 tests); `ls -l app/sounds` shows four audio files.

- [ ] **Step 5: Listen once** — `afplay app/sounds/nc-done.mp3; afplay app/sounds/nc-blocked.mp3`. Done should be a short rising two-note blip; blocked three low buzzes.

- [ ] **Step 6: Commit** — `git add app/sounds app/tests/test_sounds.py && git commit -m "Add synthesized done/blocked UI blips and their generator"`

### Task 11: `install.sh`

**Files:**
- Create: `app/install.sh` (executable), `app/tests/test_install.sh` (executable)

**Interfaces:**
- Consumes: everything under `app/`.
- Produces: `app/install.sh [--force] [--uninstall] [--home <dir>] [--no-app]` exactly per spec § install.sh; exit 0 on success, 1 with a one-line reason otherwise. JSON merging is done by an inline `python3 -I -` heredoc (no jq dependency).

- [ ] **Step 1: Write the failing test**

```bash
#!/usr/bin/env bash
# app/tests/test_install.sh — runs install/uninstall against a temp home with --no-app
set -euo pipefail
here=$(cd "$(dirname "$0")/.." && pwd); tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
fail() { echo "FAIL: $1"; exit 1; }
# 1. settings without a sounds key (Review Focus 2)
mkdir -p "$tmp/a"; printf '{\n  "zoom": 1,\n  "theme": "cyberpunk"\n}\n' > "$tmp/a/settings.json"
"$here/install.sh" --home "$tmp/a" --no-app >/dev/null || fail "install a"
python3 -I - "$tmp/a/settings.json" <<'EOF'
import json,sys; s=json.load(open(sys.argv[1]))
assert s["theme"]=="cyberpunk-2077" and s["zoom"]==1, s
assert s["sounds"]=={"done":"sounds/nc-done.mp3","blocked":"sounds/nc-blocked.mp3"}, s
EOF
for p in layouts/night-city.json layouts/night-city.svg themes/cyberpunk-2077.json mods/nc-chrome/main.js mods/nc-chrome/fonts/Rajdhani-Bold.ttf mods/nc-status/main.js sounds/nc-done.mp3 settings.json.bak-night-city; do [ -e "$tmp/a/$p" ] || fail "missing $p"; done
"$here/install.sh" --home "$tmp/a" --no-app >/dev/null 2>&1 && fail "second install without --force should refuse"
"$here/install.sh" --home "$tmp/a" --no-app --force >/dev/null || fail "force reinstall"
"$here/install.sh" --home "$tmp/a" --no-app --uninstall >/dev/null || fail "uninstall a"
cmp -s "$tmp/a/settings.json" "$tmp/a/settings.json.bak-night-city" || fail "settings not restored byte-identical"
[ -z "$(find "$tmp/a" -name 'nc-*' -o -name 'night-city*' -o -name 'cyberpunk-2077*' | grep -v bak)" ] || fail "files left behind"
# 2. no settings.json at all (Review Focus 2)
mkdir -p "$tmp/b"; "$here/install.sh" --home "$tmp/b" --no-app >/dev/null || fail "install b"
python3 -I -c 'import json,sys; s=json.load(open(sys.argv[1])); assert s["theme"]=="cyberpunk-2077" and "done" in s["sounds"]' "$tmp/b/settings.json"
"$here/install.sh" --home "$tmp/b" --no-app --uninstall >/dev/null || fail "uninstall b"
[ ! -e "$tmp/b/settings.json" ] || python3 -I -c 'import json,sys; s=json.load(open(sys.argv[1])); assert "theme" not in s and "sounds" not in s' "$tmp/b/settings.json" || fail "b not restored"
echo "install tests passed"
```

- [ ] **Step 2: Run it to verify it fails** — `chmod +x app/tests/test_install.sh && app/tests/test_install.sh` → `FAIL: install a` (script missing).

- [ ] **Step 3: Write `install.sh`** per spec § install.sh (steps 1–6 and `--uninstall`). Backup rule: write `settings.json.bak-night-city` only if absent; when `settings.json` itself is absent, write an empty-object backup marker `{}` and on uninstall remove `settings.json` if it equals the installed keys only, else strip the three keys. `--no-app` skips step 1's binary check, step 4's `herdr-app check`, and all `herdr-app do`.

- [ ] **Step 4: Run the test, verify it passes** — `app/tests/test_install.sh` → `install tests passed`.

- [ ] **Step 5: Real install on this Mac**

Run: `app/install.sh --force` (the live folders already exist from development; `--force` replaces them with the repo copies — which are identical if every task synced). Expected output ends with the go-back / uninstall hints; then `herdr-app status` errors `[]`, `python3 -I -c 'import json; print(json.load(open("'$HOME'/.config/herdr-app/settings.json"))["theme"])'` → `cyberpunk-2077`, Settings → Alerts → Play plays the new blips (ask the person to click Play, or run `afplay` on the installed files), and `herdr-app do layout.switch --name main && herdr-app shot <shots>/11-main-dark.png` shows `main` in 2077 colors; switch back.

- [ ] **Step 6: Commit** — `git add app/install.sh app/tests/test_install.sh && git commit -m "Add install.sh with --home/--no-app/--force/--uninstall and settings.json merge"`

### Task 12: RECIPE, preview, README (app section)

**Files:**
- Create: `app/RECIPE.md`, `app/preview.png`
- Modify: `README.md`

- [ ] **Step 1: Capture the preview** with ≥ 2 spaces, ≥ 2 tabs, one working agent: `herdr-app shot app/preview.png` (open a second space with `herdr-app do space.new --name probe` first, close it after with `space.close --confirmed true`).

- [ ] **Step 2: Write `app/RECIPE.md`** in Herdr's six sections (AGENTS.md "A RECIPE.md is a brief"): What you see (regions, px sizes, hex), How it behaves (each agent status, clicks, the rail), Built from (node tree, the seven mods and their helpers, `herdr` functions used, `paint_path`), Watch out (fonts load on the next look change; `layout.clone` stale theme click; `PathCoordinate` has no expressions; shipped-mod overlays keep stock shapes; pane corner note if dropped), Done when (the spec's verification list).

- [ ] **Step 3: README** — add an "App layout (Night City)" section above the TUI one: one paragraph, `![Night City](app/preview.png)`, install (`git clone …; app/install.sh`), go back (`⌘⇧L`), uninstall (`app/install.sh --uninstall`), "built against herdr-app 0.1.11", the sounds note, and that it's a herdr.dev layout folder (`herdr-layout` topic).

- [ ] **Step 4: Commit** — `git add app/RECIPE.md app/preview.png README.md && git commit -m "Add Night City recipe, preview and README section"`

### Task 13: TUI `config.toml` to the Main Menu palette

**Files:**
- Modify: `config.toml`, `README.md` (TUI palette description)

- [ ] **Step 1: Edit `config.toml`** per spec § "TUI: retheme": the 19 `[theme.custom]` values; `tab_bar_right = [ {type="zoom"}, {type="text", text="NIGHT CITY"}, {type="text", text="2077"}, {type="datetime", format="%H:%M"} ]`, `tab_bar_right_separator = " // "`; `[ui.sidebar.agents] rows = [["state_icon", { token = "agent", fg = "#FCEE0A", bold = true }, "machine", "workspace", "tab"]]`; delete the whole `[ui.sidebar.agents.rows_by_agent]` table; add `[ui.sidebar.spaces] rows = [["state_icon", { token = "workspace", fg = "#FCEE0A", bold = true }], [{ token = "branch", fg = "#00F0FF" }, "git_status"]]`. Update the header comments (no more "violet").

- [ ] **Step 2: Validate** — `cp ~/.config/herdr/config.toml /tmp/herdr-config.bak && cp config.toml ~/.config/herdr/config.toml && herdr config check; cp /tmp/herdr-config.bak ~/.config/herdr/config.toml`
Expected: `herdr config check` prints no errors. (The person's live TUI config has extra `command` entries; don't replace it permanently — the README's install steps are theirs to run.)

- [ ] **Step 3: README TUI section** — replace the violet/cyan/magenta description with yellow-on-black / cyan / red; keep install steps and the Ghostty link.

- [ ] **Step 4: Commit** — `git add config.toml README.md && git commit -m "Retheme the TUI config to the Night City palette"`

---

## Self-review notes

- Spec coverage: theme (T1), layout + preview svg (T2), fonts + chamfer helpers + brand + footer (T3), menu (T4), tabs (T5), spaces (T6), agents (T7), pane (T8), status (T9), sounds (T10), install/uninstall incl. settings.json theme + picker fix (T11), RECIPE/preview/README (T12), TUI (T13), `.gitignore` (T1). Verification list: every bullet lands in a task's check step; the "fresh Mac" bullet is covered by T11's temp-home test plus the README.
- Names used across tasks: `cutCorner`, `cutCornerEdge`, `gradientLayer`, `stripesLayer`, `trianglePoints`, `edgePoints`, `needsYou`, `MARK`/`INK`, `test_mods` — consistent.
- Sound generator is `make_sounds.py` in both spec and plan (importable by the test).
