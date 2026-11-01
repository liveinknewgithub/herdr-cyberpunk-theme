// shape.js — painted geometry for the Night City mods: chamfered corners, gradients, stripes.
// Copied verbatim into every nc-* mod that needs it; mods/nc-chrome/ holds the original.
// Every layer here is absolute, so its parent must be relative().
// `window` is gpui-kit's global (it owns paint_path), not herdr's window() platform info.
import { div, PathBuilder, Background } from "gpui-kit";
import { trianglePoints, edgePoints } from "./geometry.js";

const RECT = () => PathBuilder.fill().move_to("0%", "0%").line_to("100%", "0%").line_to("100%", "100%").line_to("0%", "100%").close().build();

const fill = el => el.absolute().top(0).left(0).size_full();

function pinned(cut, corner) {
  const box = div().absolute().size(cut);
  const vertical = corner[0] === "t" ? box.top(0) : box.bottom(0);
  return corner[1] === "l" ? vertical.left(0) : vertical.right(0);
}

/** A cut×cut layer pinned to `corner` of a relative() parent, painted in `behind`, so the parent's corner looks cut. */
export function cutCorner(behind, cut, corner = "br") {
  const triangle = PathBuilder.fill().add_polygon(trianglePoints(cut, corner), true).build();
  return pinned(cut, corner).child(fill(window.paint_path(triangle, behind)));
}

/** cutCorner plus a 1px line in `line` along the diagonal (a frame edge following the cut). */
export function cutCornerEdge(behind, line, cut, corner = "tr") {
  const [a, b] = edgePoints(cut, corner);
  const edge = PathBuilder.stroke(1).move_to(a[0], a[1]).line_to(b[0], b[1]).build();
  return cutCorner(behind, cut, corner).child(fill(window.paint_path(edge, line)));
}

/**
 * A layer filling its relative() parent with a linear gradient (angle in degrees, 90 = left to right).
 * `from`/`to` are Colors or Background.stop(color, position), where position is a 0–1 fraction
 * of the gradient line, not a percent: stop(c, 0.4) ends at 40% (verified with herdr-app shot; 40 runs off the end).
 */
export function gradientLayer(angle, from, to) {
  return fill(window.paint_path(RECT(), Background.linear_gradient(angle, from, to)));
}

/** A layer filling its relative() parent with diagonal stripes. */
export function stripesLayer(color, width = 7, interval = 14) {
  return fill(window.paint_path(RECT(), Background.pattern_slash(color, width, interval)));
}
