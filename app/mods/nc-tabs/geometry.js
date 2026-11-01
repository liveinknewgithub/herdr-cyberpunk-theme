// geometry.js — the chamfer's pure geometry. No imports, so it is node-testable.
// Copied verbatim into every nc-* mod that cuts corners; mods/nc-chrome/ holds the original.
// Coordinates are percent strings of the cut×cut box they are painted in, x right, y down:
// path px do not follow the app's zoom while the box does, so px vertices drift off the
// box's edges at zoom ≠ 1 (seen at 1.3: a strip of the surface showed past the cut).
// `cut` is kept in the signatures for callers; the shape no longer depends on it.

export const CORNERS = ["tl", "tr", "br", "bl"];

const O = "0%", F = "100%";

const TRIANGLES = {
  tl: [[O, O], [F, O], [O, F]],
  tr: [[O, O], [F, O], [F, F]],
  br: [[F, O], [F, F], [O, F]],
  bl: [[O, O], [O, F], [F, F]],
};

const EDGES = {
  tl: [[F, O], [O, F]],
  tr: [[O, O], [F, F]],
  br: [[F, O], [O, F]],
  bl: [[O, O], [F, F]],
};

function lookup(table, corner) {
  if (!Object.prototype.hasOwnProperty.call(table, corner)) throw new RangeError(`unknown corner: ${corner} (expected one of ${CORNERS.join(", ")})`);
  return table[corner];
}

/** Vertices of the triangle that cuts `corner` of a cut×cut box, as percents: [[x,y],[x,y],[x,y]]. */
export function trianglePoints(cut, corner) {
  return lookup(TRIANGLES, corner).map(p => [...p]);
}

/** The two endpoints of the cut edge (the diagonal) for `corner`: [[x1,y1],[x2,y2]]. */
export function edgePoints(cut, corner) {
  return lookup(EDGES, corner).map(p => [...p]);
}
