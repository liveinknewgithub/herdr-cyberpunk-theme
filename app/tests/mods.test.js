// app/tests/mods.test.js
import { test } from "node:test"; import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
const root = new URL("../mods/", import.meta.url);
const mods = readdirSync(root).filter(n => n.startsWith("nc-"));
test("helper copies identical", () => {
  for (const f of ["geometry.js", "shape.js"]) {
    const base = readFileSync(new URL(`nc-chrome/${f}`, root), "utf8");
    for (const m of mods) if (existsSync(new URL(`${m}/${f}`, root))) assert.equal(readFileSync(new URL(`${m}/${f}`, root), "utf8"), base, `${m}/${f}`);
  }
});
test("no JS timers for motion", () => {
  for (const m of mods) assert.doesNotMatch(readFileSync(new URL(`${m}/main.js`, root), "utf8"), /setTimeout|setInterval/, m);
});
test("no app-written files committed", () => {
  for (const m of mods) for (const f of ["gpui-kit.d.ts", "jsconfig.json"]) assert.ok(!existsSync(new URL(`${m}/${f}`, root)), `${m}/${f}`);
});
