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

// The glitch split: the wordmark's fringes, the cyan top half and red bottom half of offset copies.
const CYAN = "#00F0FF";
const RED = "#FF003C";
const WORD = "HERDR";

export default class WorkspaceChrome extends View {
  button(id, label, action) {
    const t = theme();
    return div().id(id).size(26).flex_none().flex().items_center().justify_center().rounded(0).text_color(t.dim).hover(s => s.bg(t.hover).text_color(t.accent))
      .on_mouse_down("left", (_e, cx) => cx.stop_propagation()).on_click(action).child(label);
  }
  // Three copies in one box: cyan and red offset behind, each cut to half its height, yellow on top in flow.
  wordmark() {
    const t = theme();
    return div().relative().flex_none().text_size(17).line_height("18px").font_bold().whitespace_nowrap()
      .child(div().absolute().left(-1.5).top(-1).h(9).overflow_hidden().text_color(CYAN).child(div().child(WORD)))
      .child(div().absolute().left(1.5).top(10).h(9).overflow_hidden().text_color(RED).child(div().mt(-9).child(WORD)))
      .child(div().text_color(t.accent).child(WORD));
  }
  render() {
    const t = theme();
    const collapsed = narrow();
    const mac = appWindow()?.platform === "macos";
    if (props()?.footer) {
      const row = (id, icon, label, dim, action) => h_flex().id(id).h(28).px(8).gap(9).items_center().rounded(0)
        .text_color(dim ? t.dim : t.muted).hover(s => s.bg(t.hover).text_color(t.foreground)).cursor_pointer()
        .on_click(action).child(svg(`mods/nc-chrome/${icon}.svg`).size(14))
        .when(!collapsed, el => el.child(label.toUpperCase()));
      return v_flex().size_full().bg(t.chrome)
        // The hazard stripe sits above the footer's border.
        .child(div().relative().h(4).w_full().flex_none().child(stripesLayer(t.accent, 6, 12)))
        .child(v_flex().flex_1().border_t(1).border_color(t.border).px(8).pt(2).pb(6).text_size(13).font_bold()
          .child(row("settings", "settings", "Settings", false, () => run("app.settings"))
            .when(Boolean(updates().app.ready), el => el.child(div().size(6).bg(t.accent))))
          .child(row("machine", "plus", "Add machine", true, () => run("mod.open", { name: "machine-add" }))));
    }
    const ram = size => svg("mods/nc-chrome/ram.svg").size(size).flex_none().text_color(t.accent);
    return h_flex().size_full().bg(t.chrome).border_b(1).border_color(t.accent).pl(collapsed ? 6 : 14).pr(10).gap(4).items_center()
      .when(mac && !collapsed, el => el.pl(76))
      .when(!collapsed, el => el.child(h_flex().flex_1().min_w(0).gap(8).items_center().child(ram(22))
        .child(v_flex().child(this.wordmark()).child(div().text_size(9.5).line_height("11px").text_color(t.dim).child("\u259A\u259E NIGHT CITY")))))
      .when(!collapsed, el => el.child(this.button("search", svg("mods/nc-chrome/search.svg").size(15), () => run("mod.open", { name: "picker" }))))
      // On the macOS rail the traffic lights (12,16) fill the row's middle, so the ram sits small under them; the agents list's » unfolds it.
      .when(collapsed && mac, el => el.pl(0).pr(0).pb(1).justify_center().items_end().child(ram(14)))
      .when(!(collapsed && mac), el => el.child(this.button("sidebar-toggle", svg("mods/nc-chrome/sidebar.svg").size(15), toggleSidebar)));
  }
}
