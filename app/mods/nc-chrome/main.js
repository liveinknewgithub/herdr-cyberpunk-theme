import { View, div, svg } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { stripesLayer } from "./shape.js";
import { theme, run, props, window as appWindow, shared, setShared, updates, layout } from "herdr";

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

// The sidebar's rail goes by its width, not a flag: dragging its edge narrows it too.
const narrow = () => (find(layout(), "sidebar")?.size?.px ?? Infinity) < 160;

// To the rail (on macOS wide enough for the traffic lights), or back to the width it had.
function toggleSidebar() {
  const width = find(layout(), "sidebar")?.size?.px;
  if (!narrow()) setShared("sidebar.width", width);
  // Mods edited before the rail went by width still read the flag.
  setShared("sidebar.collapsed", !narrow());
  run("layout.resize", { id: "sidebar", px: narrow() ? (shared("sidebar.width") ?? 268) : appWindow()?.platform === "macos" ? 76 : 44 });
}

// The netrunner slashes that mark the wordmark (and, in the sibling mods, every section header).
const slashes = t => div().flex_none().text_color(t.ansi5).child("//");

// A thin yellow/black hazard stripe, full width.
const hazard = t => div().relative().h(4).w_full().flex_none().child(stripesLayer(t.accent, 3, 8));

export default class WorkspaceChrome extends View {
  button(id, label, action) {
    const t = theme();
    return div().id(id).size(26).flex_none().flex().items_center().justify_center().rounded(0).text_color(t.dim).hover(s => s.bg(t.hover).text_color(t.accent))
      .on_mouse_down("left", (_e, cx) => cx.stop_propagation()).on_click(action).child(label);
  }
  // HERDR // ▮ — the wordmark, the slashes, and a blinking cursor block.
  wordmark() {
    const t = theme();
    return h_flex().flex_none().gap(6).items_center().text_size(15).line_height("17px").font_bold().whitespace_nowrap()
      .child(div().text_color(t.accent).child("HERDR"))
      .child(slashes(t))
      .child(div().w(7).h(13).flex_none().bg(t.accent).loop("opacity", { from: 0.18, to: 0.7, period: 1600 }));
  }
  render() {
    const t = theme();
    const collapsed = narrow();
    const mac = appWindow()?.platform === "macos";
    if (props()?.footer) {
      const row = (id, icon, label, action) => h_flex().id(id).h(28).px(8).gap(9).items_center().rounded(0)
        .text_color(t.foreground).hover(s => s.bg(t.hover).text_color(t.accent)).cursor_pointer()
        .on_click(action).child(svg(`mods/nc-chrome/${icon}.svg`).size(13).text_color(t.dim))
        .when(!collapsed, el => el.child(label.toUpperCase()));
      return v_flex().size_full().bg(t.chrome)
        .child(hazard(t))
        .child(v_flex().flex_1().px(6).pt(3).pb(5).text_size(11).font_bold()
          .child(row("settings", "settings", "Settings", () => run("app.settings"))
            .when(Boolean(updates().app.ready), el => el.child(div().size(6).bg(t.accent))))
          .child(row("machine", "plus", "Jack in a machine", () => run("mod.open", { name: "machine-add" }))));
    }
    return v_flex().size_full().bg(t.chrome)
      .child(h_flex().flex_1().min_h(0).pl(collapsed ? 6 : 14).pr(10).gap(4).items_center()
        .when(mac && !collapsed, el => el.pl(76))
        .when(!collapsed, el => el.child(v_flex().flex_1().min_w(0).gap(1).child(this.wordmark())
          .child(div().text_size(9).line_height("11px").text_color(t.dim).whitespace_nowrap().child("NETRUNNER/OS 2077"))))
        .when(!collapsed, el => el.child(this.button("search", svg("mods/nc-chrome/search.svg").size(14), () => run("mod.open", { name: "picker" }))))
        // On the macOS rail the traffic lights (12,16) fill the row's middle, so the slashes sit small under them; the agents list's » unfolds it.
        .when(collapsed && mac, el => el.pl(0).pr(0).pb(2).justify_center().items_end().text_size(12).font_bold().child(slashes(t)))
        .when(!(collapsed && mac), el => el.child(this.button("sidebar-toggle", svg("mods/nc-chrome/sidebar.svg").size(14), toggleSidebar))))
      .child(hazard(t));
  }
}
