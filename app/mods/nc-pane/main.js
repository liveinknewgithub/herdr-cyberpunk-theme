// Night City pane header, cloned from the shipped `pane`:
//   { "tab": "active", "pane": { "header": { "content": { "mod": "nc-pane" } } } }
// Program icon, caps name, folder, and a caps status readout on the right (WORKING / NEEDS YOU /
// DONE; nothing when idle or a plain shell); buttons split, zoom and close this pane.
// Props from the app: { pane, terminal }. Click: focus the pane.

import { View, div, svg, image, Background } from "gpui-kit";
import { h_flex } from "gpui-base";
import { panes, props, run, theme, home } from "herdr";
import { gradientLayer, cutCorner } from "./shape.js";

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
    const pic = icon(p.program, 14, t.dim);
    const st = p.status;
    const pane = p.pane;
    return h_flex()
      .id(`pane-head-${pane}`)
      .relative()
      .size_full()
      .px(10)
      .gap(8)
      .items_center()
      .bg(t.background)
      .border_b(1)
      .border_color(t.border)
      .text_size(12)
      .on_hover((hovered, cx) => { this.hovered = hovered; cx.notify(); })
      .on_click(() => run("pane.focus", { pane }))
      .child(gradientLayer(90, Background.stop("#FCEE0A14", 0), Background.stop("#FCEE0A00", 0.4)))
      .when(Boolean(pic), (el) => el.child(pic))
      .child(div().flex_none().truncate().max_w(260).text_size(12).font_bold().text_color(t.foreground).child(name.toUpperCase()))
      .child(div().flex_1().truncate().text_color(t.dim).child(folder(p.cwd)))
      .when(st === "working", el => el.child(h_flex().flex_none().items_center().gap(6).text_size(10.5).font_bold().text_color(t.working)
        .child("WORKING").child(svg("mods/workspace-chrome/spinner.svg").size(12).flex_none().text_color(t.working).spin(900))))
      .when(st === "blocked", el => el.child(needsYou(t, false, t.background)))
      .when(st === "done", el => el.child(div().flex_none().text_size(10.5).font_bold().text_color(t.done).child("\u25c6 DONE")))
      .when(this.hovered, el => el
        .child(this.button(t, `ph-r-${pane}`, "split-right", "pane.split", { direction: "right", pane }))
        .child(this.button(t, `ph-d-${pane}`, "split-down", "pane.split", { direction: "down", pane }))
        .child(this.button(t, `ph-z-${pane}`, p.zoomed ? "unzoom" : "zoom", "pane.zoom", { pane }))
        .child(this.button(t, `ph-x-${pane}`, "close", "pane.close", { pane })));
  }
}
