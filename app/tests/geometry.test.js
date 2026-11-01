// app/tests/geometry.test.js
import { test } from "node:test"; import assert from "node:assert/strict";
import { CORNERS, trianglePoints, edgePoints } from "../mods/nc-chrome/geometry.js";
test("corners", () => assert.deepEqual(CORNERS, ["tl", "tr", "br", "bl"]));
test("triangles", () => {
  assert.deepEqual(trianglePoints(8, "br"), [[8, 0], [8, 8], [0, 8]]);
  assert.deepEqual(trianglePoints(8, "tr"), [[0, 0], [8, 0], [8, 8]]);
  assert.deepEqual(trianglePoints(8, "tl"), [[0, 0], [8, 0], [0, 8]]);
  assert.deepEqual(trianglePoints(8, "bl"), [[0, 0], [0, 8], [8, 8]]);
});
test("edges", () => {
  assert.deepEqual(edgePoints(14, "tr"), [[0, 0], [14, 14]]);
  assert.deepEqual(edgePoints(14, "br"), [[14, 0], [0, 14]]);
  assert.deepEqual(edgePoints(14, "tl"), [[14, 0], [0, 14]]);
  assert.deepEqual(edgePoints(14, "bl"), [[0, 0], [14, 14]]);
});
test("unknown corner throws", () => assert.throws(() => trianglePoints(8, "x")));
