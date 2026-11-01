// geometry.js — the chamfer's pure geometry. No imports, so it is node-testable.
// Copied verbatim into every nc-* mod that cuts corners; mods/nc-chrome/ holds the original.
// Coordinates are px inside a cut×cut box, x right, y down.

export const CORNERS = ["tl", "tr", "br", "bl"];

const TRIANGLES = {
  tl: c => [[0, 0], [c, 0], [0, c]],
  tr: c => [[0, 0], [c, 0], [c, c]],
  br: c => [[c, 0], [c, c], [0, c]],
  bl: c => [[0, 0], [0, c], [c, c]],
};

const EDGES = {
  tl: c => [[c, 0], [0, c]],
  tr: c => [[0, 0], [c, c]],
  br: c => [[c, 0], [0, c]],
  bl: c => [[0, 0], [c, c]],
};

function lookup(table, corner) {
  if (!Object.hasOwn(table, corner)) throw new RangeError(`unknown corner: ${corner} (expected one of ${CORNERS.join(", ")})`);
  return table[corner];
}

/** Vertices of the triangle that cuts `corner` of a cut×cut box, in px: [[x,y],[x,y],[x,y]]. */
export function trianglePoints(cut, corner) {
  return lookup(TRIANGLES, corner)(cut);
}

/** The two endpoints of the cut edge (the diagonal) for `corner`: [[x1,y1],[x2,y2]]. */
export function edgePoints(cut, corner) {
  return lookup(EDGES, corner)(cut);
}
