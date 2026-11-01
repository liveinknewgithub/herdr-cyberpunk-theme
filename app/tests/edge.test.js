// app/tests/edge.test.js — where nc-edge puts its tick: on the sidebar's spaces/agents divider.
import { test } from "node:test"; import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dividerY, find } from "../mods/nc-edge/divider.js";

const layout = () => JSON.parse(readFileSync(new URL("../layouts/night-city.json", import.meta.url), "utf8"));
// The edge block's height for a window this tall: less the tab bar, the status bar and 2×8 px padding.
const blockFor = windowH => windowH - 42 - 28 - 16;
// Where the divider really is, in window coordinates, minus where the block starts (tabs + padding).
const expected = (windowH, spacesPx) => 46 + spacesPx - 42 - 8;

test("equal weights put the divider halfway down the lists", () => {
  // window 1151: lists = 1151 - 46 - 69 = 1036, spaces = 518
  assert.equal(dividerY(layout(), blockFor(1151)), expected(1151, 518));
  // window 800: lists = 685, spaces = 342.5
  assert.equal(dividerY(layout(), blockFor(800)), expected(800, 342.5));
});

test("a dragged px size on either list wins over the weights", () => {
  const L = layout();
  find(L, "spaces").size = { px: 200 };
  assert.equal(dividerY(L, blockFor(1151)), expected(1151, 200));
  const M = layout();
  find(M, "agents").size = { px: 300 };
  assert.equal(dividerY(M, blockFor(1151)), expected(1151, 1036 - 300));
});

test("uneven weights split proportionally", () => {
  const L = layout();
  find(L, "spaces").size = { weight: 1 };
  find(L, "agents").size = { weight: 3 };
  assert.equal(dividerY(L, blockFor(1151)), expected(1151, 1036 / 4));
});

test("the lists' 90 px minimum clamps the divider", () => {
  const L = layout();
  find(L, "spaces").size = { px: 10 };
  assert.equal(dividerY(L, blockFor(1151)), expected(1151, 90));
  find(L, "spaces").size = { px: 5000 };
  assert.equal(dividerY(L, blockFor(1151)), expected(1151, 1036 - 90));
});

test("reads the real layout's sizes and padding, not stock constants", () => {
  const L = layout();
  find(L, "brand").size = { px: 60 };
  find(L, "work-body").padding = [12, 0];
  // window 1151: block = 1151 - 42 - 28 - 24 = 1057; lists = 1151 - 60 - 69 = 1022, spaces = 511
  assert.equal(dividerY(L, 1151 - 42 - 28 - 24), 60 + 511 - 42 - 12);
});
