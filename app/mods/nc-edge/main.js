// Night City gap decoration, the 8px strip between the sidebar and the work area:
//   { "id": "edge", "type": "block", "size": { "px": 8 }, "content": { "mod": "nc-edge" } }
// A pink gauge bar hugging the sidebar's edge just below the spaces/agents divider, and a yellow
// tick against the pane frame at the divider's height, so the two read as a HUD connector.
// Transparent otherwise (the backdrop shows). Draws nothing for { props: { side: "right" } },
// the matching spacer on the far side, or while the sidebar is hidden.

import { View, div } from "gpui-kit";
import { theme, layout, props, settings } from "herdr";
import { find, dividerY } from "./divider.js";

export default class Edge extends View {
  init() { this.size = null; }

  render() {
    const t = theme();
    const root = layout();
    const off = props()?.side === "right" || find(root, "sidebar")?.hidden;
    // on_size_change reports on-screen points, but layout sizes and this mod's positions are at zoom 1.
    const y = !off && this.size ? dividerY(root, this.size.height / (settings()?.zoom || 1)) : null;
    return div().id("edge").relative().size_full()
      .on_size_change((size, cx) => { this.size = size; cx.notify(); })
      .when(y !== null, el => el
        // The tick: 4px of yellow running into the pane's 2px frame.
        .child(div().absolute().top(y - 1).right(0).w(4).h(2).bg(t.accent))
        // The gauge: flush with the sidebar's edge line, starting just under the divider.
        .child(div().absolute().top(y + 13).left(0).w(3).h(92).bg(t.ansi5).opacity(0.75)));
  }
}
