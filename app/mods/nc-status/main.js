// Night City status bar, cloned from the shipped `workspace-status`:
//   { "id": "status", "content": { "mod": "nc-status" } }
// A hazard-stripe cap ending on a diagonal, then caps readouts (machine, branch, agents,
// who needs you), a fixed NC_OS readout in the accent, and the palette hint on the right.

import { View, div } from "gpui-kit";
import { h_flex } from "gpui-base";
import { spaces, agents, theme, run, window, keys } from "herdr";
import { stripesLayer, cutCorner } from "./shape.js";

export default class WorkspaceStatus extends View {
  // The palette key as actually bound, not a hardcoded one; without a
  // binding the hint stays useful ("commands") instead of lying.
  hint(t) {
    const mac = window()?.platform === "macos";
    const mod = { cmd: mac ? "⌘" : "Ctrl+", ctrl: mac ? "⌃" : "Ctrl+", shift: mac ? "⇧" : "Shift+", alt: mac ? "⌥" : "Alt+", option: mac ? "⌥" : "Alt+" };
    const b = keys().find((k) => k.section === "global" && k.action === "app.palette");
    const parts = b && b.keys.endsWith("--") ? [...b.keys.slice(0, -2).split("-"), "-"] : b?.keys.split("-");
    const key = parts && parts.map((p) => mod[p.toLowerCase()] ?? p.toUpperCase()).join("");
    return key ? `${key}  commands` : "commands";
  }

  render() {
    const t = theme();
    const space = spaces().find(s => s.active);
    const list = agents();
    const needs = list.filter(a => a.status === "blocked").length;
    const label = (glyph, text) => h_flex().gap(6).items_center().child(glyph).child(text.toUpperCase());
    const cap = div().relative().w(42).h_full().flex_none()
      .child(stripesLayer(t.accent, 7, 14)).child(cutCorner(t.chrome, 10, "br"));
    return h_flex().size_full().gap(16).items_center().bg(t.chrome).border_t(1).border_color(t.border).text_size(11.5).font_bold().text_color(t.muted)
      .child(cap)
      .child(label("▣", space?.machine ?? "This computer"))
      .when(Boolean(space?.branch), el => el.child(label("⎇", space.branch)))
      .child(h_flex().gap(6).items_center().child(div().size(6).rounded(3).bg(t.idle)).child(`${list.length} ${list.length === 1 ? "AGENT" : "AGENTS"}`)
        .when(needs > 0, el => el.child(div().text_color(t.blocked).child(`· ${needs} NEEDS YOU`))))
      .child(div().text_color(t.accent).child("NC_OS 2.077 // ONLINE"))
      .child(div().flex_1())
      .child(div().id("palette").pr(14).text_color(t.dim).on_click(() => run("app.palette")).child(this.hint(t).toUpperCase()));
  }
}
