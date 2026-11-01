// app/tests/geometry.test.js
import { test } from "node:test"; import assert from "node:assert/strict";
import { CORNERS, trianglePoints, edgePoints } from "../mods/nc-chrome/geometry.js";
test("corners", () => assert.deepEqual(CORNERS, ["tl", "tr", "br", "bl"]));
// Percent strings of the cut×cut box, so the cut follows the box at any zoom (px did not).
const O = "0%", F = "100%";
test("triangles", () => {
  assert.deepEqual(trianglePoints(8, "br"), [[F, O], [F, F], [O, F]]);
  assert.deepEqual(trianglePoints(8, "tr"), [[O, O], [F, O], [F, F]]);
  assert.deepEqual(trianglePoints(8, "tl"), [[O, O], [F, O], [O, F]]);
  assert.deepEqual(trianglePoints(8, "bl"), [[O, O], [O, F], [F, F]]);
});
test("edges", () => {
  assert.deepEqual(edgePoints(14, "tr"), [[O, O], [F, F]]);
  assert.deepEqual(edgePoints(14, "br"), [[F, O], [O, F]]);
  assert.deepEqual(edgePoints(14, "tl"), [[F, O], [O, F]]);
  assert.deepEqual(edgePoints(14, "bl"), [[O, O], [F, F]]);
});
test("no px: the shape does not depend on the cut size", () => {
  for (const c of CORNERS) {
    assert.deepEqual(trianglePoints(4, c), trianglePoints(14, c));
    for (const [x, y] of trianglePoints(10, c)) assert.match(`${x} ${y}`, /^(0|100)% (0|100)%$/);
  }
});
test("returned points are copies", () => {
  trianglePoints(8, "br")[0][0] = "50%";
  assert.equal(trianglePoints(8, "br")[0][0], F);
});
test("unknown corner throws", () => assert.throws(() => trianglePoints(8, "x")));
