// divider.js — where the sidebar's spaces/agents divider sits, seen from the nc-edge block.
// No imports, so it is node-testable against the real layout file.
//
// The edge block fills the work area between the tab bar and the status bar, less work-body's
// vertical padding, so the window height follows from the block's own height. The divider then
// splits the sidebar's lists (between the brand block and the footer) by the two lists' weights,
// or by a px size the person dragged one of them to, clamped to the lists' 90px minimum.

export function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

// A fixed-size node's px height in the layout (0 if hidden), else `fallback`.
function px(root, id, fallback) {
  const n = find(root, id);
  return n?.hidden ? 0 : (n?.size?.px ?? fallback);
}

const MIN = 90;

/** The divider's y in the edge block's coordinates, for a block `height` px tall. */
export function dividerY(root, height) {
  const pad = [].concat(find(root, "work-body")?.padding ?? 8)[0];
  const tabs = px(root, "tabs", 42), brand = px(root, "brand", 46);
  const lists = height + 2 * pad + tabs + px(root, "status", 28) - brand - px(root, "sidebar-footer", 69);
  const s = find(root, "spaces")?.size ?? {}, a = find(root, "agents")?.size ?? {};
  const spaces = s.px ?? (a.px != null ? lists - a.px : lists * (s.weight ?? 1) / ((s.weight ?? 1) + (a.weight ?? 1)));
  return brand + Math.max(MIN, Math.min(lists - MIN, spaces)) - tabs - pad;
}
