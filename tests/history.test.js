import { test } from "node:test";
import assert from "node:assert/strict";
import { createHistory, perform, undo, canUndo, clearHistory } from "../src/core/history.js";

test("al principio no hay nada que deshacer", () => {
  const h = createHistory({ n: 0 });
  assert.equal(canUndo(h), false);
  assert.equal(undo(h), h);
});

test("deshacer devuelve el estado anterior, paso a paso", () => {
  let h = createHistory({ n: 0 });
  h = perform(h, { n: 1 });
  h = perform(h, { n: 2 });
  assert.equal(h.present.n, 2);
  h = undo(h);
  assert.equal(h.present.n, 1);
  h = undo(h);
  assert.equal(h.present.n, 0);
  assert.equal(canUndo(h), false);
});

test("una acción que no cambia nada no se anota", () => {
  const h = createHistory({ n: 0 });
  assert.equal(perform(h, h.present), h);
});

test("al cerrar la estación se olvida el pasado", () => {
  let h = perform(createHistory({ n: 0 }), { n: 1 });
  h = clearHistory(h);
  assert.equal(h.present.n, 1);
  assert.equal(canUndo(h), false);
});
