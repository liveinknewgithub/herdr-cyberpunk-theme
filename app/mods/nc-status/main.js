// Night City status bar, cloned from the shipped `workspace-status`:
//   { "id": "status", "content": { "mod": "nc-status" } }
// Left: a yellow chevron chip naming the machine (LOCALHOST for this computer), then caps readouts
// (agents online, who needs you, branch). Right: a NET meter and a chip with the clock and the
// palette key ("⌘⇧P // CMD"), its left edge a chevron point.

import { View, div, svg } from "gpui-kit";
import { h_flex } from "gpui-base";
import { spaces, agents, theme, run, window, keys } from "herdr";
import { cutWedge } from "./shape.js";

// How far a chip's chevron point reaches, px.
const POINT = 9;

const two = n => String(n).padStart(2, "0");

export default class WorkspaceStatus extends View {
  init(_props, cx) {
    // The clock is data: redraw often enough that the minute is never more than 10 s late.
    cx.timer.every(10000, (cx) => cx.notify());
  }

  // The palette key as actually bound, not a hardcoded one; without a
  // binding the hint stays useful ("CMD") instead of lying.
  hint() {
    const mac = window()?.platform === "macos";
    const mod = { cmd: mac ? "⌘" : "Ctrl+", ctrl: mac ? "⌃" : "Ctrl+", shift: mac ? "⇧" : "Shift+", alt: mac ? "⌥" : "Alt+", option: mac ? "⌥" : "Alt+" };
    const b = keys().find((k) => k.section === "global" && k.action === "app.palette");
    const parts = b && b.keys.endsWith("--") ? [...b.keys.slice(0, -2).split("-"), "-"] : b?.keys.split("-");
    const key = parts && parts.map((p) => mod[p.toLowerCase()] ?? p.toUpperCase()).join("");
    return key ? `${key} // CMD` : "CMD";
  }

  render() {
    const t = theme();
    const space = spaces().find(s => s.active);
    const list = agents();
    const needs = list.filter(a => a.status === "blocked").length;
    const now = new Date();
    // Points right: two half-height wedges cut the chip's right side into a ">".
    const host = h_flex().relative().h_full().flex_none().items_center().gap(6).pl(10).pr(10 + POINT).bg(t.accent).text_color(t.accent_foreground)
      .child(svg(`mods/nc-status/${space?.machine ? "server" : "monitor"}.svg`).size(12).flex_none())
      .child((space?.machine ?? "localhost").toUpperCase())
      .child(cutWedge(t.chrome, POINT, "50%", "tr")).child(cutWedge(t.chrome, POINT, "50%", "br"));
    const meter = h_flex().flex_none().items_end().gap(1).h(11)
      .children([3, 5, 7, 9, 11].map(h => div().w(3).h(h).bg(t.ansi6)));
    // Points left: the same wedges on the left side make a "<".
    const clock = h_flex().id("palette").relative().h_full().flex_none().items_center().gap(10).pl(10 + POINT).pr(14).bg(t.raised)
      .cursor_pointer().on_click(() => run("app.palette"))
      .child(div().text_size(11).text_color(t.accent).child(`${two(now.getHours())}:${two(now.getMinutes())}`))
      .child(div().text_color(t.dim).child(this.hint()))
      .child(cutWedge(t.chrome, POINT, "50%", "tl")).child(cutWedge(t.chrome, POINT, "50%", "bl"));
    return h_flex().size_full().items_center().gap(14).bg(t.chrome).border_t(1).border_color(t.border).text_size(10.5).font_bold().text_color(t.muted)
      .child(host)
      .child(h_flex().gap(6).items_center().child(div().size(6).flex_none().bg(t.dim)).child(`${list.length} ${list.length === 1 ? "AGENT" : "AGENTS"} ONLINE`)
        .when(needs > 0, el => el.child(div().text_color(t.blocked).child(`· ${needs} NEEDS YOU`))))
      .when(Boolean(space?.branch), el => el.child(div().child(`⎇ ${space.branch.toUpperCase()}`)))
      .child(div().flex_1())
      .child(h_flex().gap(7).items_center().child(div().text_color(t.dim).child("NET")).child(meter))
      .child(clock);
  }
}
