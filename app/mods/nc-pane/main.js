// Night City pane header, cloned from the shipped `pane`:
//   { "tab": "active", "pane": { "header": { "content": { "mod": "nc-pane" } } } }
// A yellow bar on the left (focused), program icon, caps name // folder, then a caps status readout
// (WORKING / NEEDS YOU / DONE; nothing when idle or a plain shell) and a small hazard hatch on the
// right; on hover, buttons split, zoom and close this pane. Props from the app: { pane, terminal }.
// Click: focus the pane.

import { View, div, svg, image } from "gpui-kit";
import { h_flex } from "gpui-base";
import { panes, props, run, theme, home } from "herdr";
import { cutCorner, stripesLayer } from "./shape.js";

function icon(p, size, color) {
  if (!p?.icon) return null;
  return p.tint ? svg(p.icon).size(size).flex_none().text_color(color) : image(p.icon).w(size).h(size).flex_none();
}

// The red "needs you" tag, blinking; `behind` is the surface it sits on, so the two corner cuts match.
function needsYou(t, compact, behind) {
  return h_flex().relative().flex_none().items_center().h(18).px(6).bg(t.blocked).text_size(10).font_bold().text_color(t.accent_foreground)
    .child(compact ? "!" : "NEEDS YOU").child(cutCorner(behind, 4, "tl")).child(cutCorner(behind, 4, "br"))
    .loop("opacity", { from: 0.55, to: 1, period: 1200 });
}

function folder(cwd) {
  if (!cwd) return "";
  const h = home();
  return cwd === h ? "~" : cwd.startsWith(h + "/") ? "~" + cwd.slice(h.length) : cwd;
}

export default class Pane extends View {
  init() { this.hovered = false; }

  me() {
    return panes().find((p) => p.pane === props()?.pane);
  }

  button(t, id, icon, command, args) {
    return div()
      .id(id)
      .p(3)
      .rounded(0)
      .text_color(t.dim)
      .hover((s) => s.text_color(t.accent))
      .on_click((_e, cx) => {
        cx.stop_propagation();
        run(command, args);
      })
      .child(svg(`mods/nc-pane/${icon}.svg`).size(14));
  }

  render(cx) {
    const t = theme();
    const p = this.me();
    if (!p) return div();
    const name = ((p.program?.agent || p.program?.shell) && p.program.name) || p.title || p.program?.name || "shell";
    const lit = p.focused ? t.accent : t.muted;
    const pic = icon(p.program, 13, lit);
    const st = p.status;
    const pane = p.pane;
    return h_flex()
      .id(`pane-head-${pane}`)
      .relative()
      .size_full()
      .pl(12)
      .pr(10)
      .gap(8)
      .items_center()
      .bg(t.surface)
      .border_b(1)
      .border_color(t.accent + "33")
      .text_size(11.5)
      .font_bold()
      .on_hover((hovered, cx) => { this.hovered = hovered; cx.notify(); })
      .on_click(() => run("pane.focus", { pane }))
      // The left bar: a heavier edge on the header, yellow while this pane has the keyboard.
      .child(div().absolute().left(0).top(0).bottom(0).w(3).bg(p.focused ? t.accent : t.border))
      .when(Boolean(pic), (el) => el.child(pic))
      .child(div().flex_none().truncate().max_w(260).text_color(lit).child(name.toUpperCase()))
      .child(div().flex_none().text_color(t.ansi5).child("//"))
      .child(div().flex_1().truncate().font_normal().text_color(t.dim).child(folder(p.cwd)))
      .when(st === "working", el => el.child(h_flex().flex_none().items_center().gap(6).text_size(10.5).text_color(t.working)
        .child("WORKING").child(svg("mods/workspace-chrome/spinner.svg").size(12).flex_none().text_color(t.working).spin(900))))
      .when(st === "blocked", el => el.child(needsYou(t, false, t.surface)))
      .when(st === "done", el => el.child(div().flex_none().text_size(10.5).text_color(t.done).child("◆ DONE")))
      .when(this.hovered, el => el
        .child(this.button(t, `ph-r-${pane}`, "split-right", "pane.split", { direction: "right", pane }))
        .child(this.button(t, `ph-d-${pane}`, "split-down", "pane.split", { direction: "down", pane }))
        .child(this.button(t, `ph-z-${pane}`, p.zoomed ? "unzoom" : "zoom", "pane.zoom", { pane }))
        .child(this.button(t, `ph-x-${pane}`, "close", "pane.close", { pane })))
      // The hatch: five short yellow slashes, dimmed when the pane is in the background.
      .child(div().relative().w(26).h(8).flex_none().child(stripesLayer(p.focused ? t.accent : t.dim, 2, 5)));
  }
}
