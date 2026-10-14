import { test } from "node:test";
import assert from "node:assert/strict";
import { offsetToCube, cubeToOffset, neighbors, distance, hexToPixel, hexCorners } from "../src/core/hex.js";

test("offset → cúbicas → offset devuelve la misma casilla", () => {
  for (let fila = 0; fila < 6; fila++) {
    for (let col = 0; col < 9; col++) {
      assert.deepEqual(cubeToOffset(offsetToCube({ fila, col })), { fila, col });
    }
  }
});

test("las coordenadas cúbicas suman cero", () => {
  const { q, r, s } = offsetToCube({ fila: 3, col: 4 });
  assert.equal(q + r + s, 0);
});

test("una casilla interior tiene 6 vecinos, todos a distancia 1", () => {
  const origen = { fila: 3, col: 4 };
  const vecinos = neighbors(origen, 6, 9);
  assert.equal(vecinos.length, 6);
  for (const v of vecinos) assert.equal(distance(origen, v), 1);
});

test("las filas impares se desplazan a la derecha", () => {
  // La casilla (2,3) toca a (1,3) y (1,4) por arriba; (1,3) toca a (2,2) y (2,3)
  const v = neighbors({ fila: 2, col: 3 }, 6, 9);
  assert.ok(v.some((h) => h.fila === 1 && h.col === 3));
  assert.ok(v.some((h) => h.fila === 1 && h.col === 2));
  const w = neighbors({ fila: 1, col: 3 }, 6, 9);
  assert.ok(w.some((h) => h.fila === 2 && h.col === 3));
  assert.ok(w.some((h) => h.fila === 2 && h.col === 4));
});

test("las esquinas del tablero tienen menos vecinos", () => {
  assert.equal(neighbors({ fila: 0, col: 0 }, 6, 9).length, 2);
  assert.equal(neighbors({ fila: 5, col: 8 }, 6, 9).length, 2);
});

test("distancia entre casillas conocidas", () => {
  assert.equal(distance({ fila: 0, col: 0 }, { fila: 0, col: 8 }), 8);
  assert.equal(distance({ fila: 0, col: 4 }, { fila: 3, col: 4 }), 3);
  assert.equal(distance({ fila: 2, col: 2 }, { fila: 2, col: 2 }), 0);
});

test("hexToPixel desplaza las filas impares media casilla", () => {
  const a = hexToPixel({ fila: 0, col: 0 }, 10);
  const b = hexToPixel({ fila: 1, col: 0 }, 10);
  assert.ok(Math.abs(b.x - a.x - 10 * Math.sqrt(3) / 2) < 1e-9);
  assert.equal(b.y - a.y, 15);
});

test("hexCorners da 6 esquinas a distancia `size` del centro", () => {
  const c = { x: 5, y: 7 };
  const esquinas = hexCorners(c, 10);
  assert.equal(esquinas.length, 6);
  for (const p of esquinas) assert.ok(Math.abs(Math.hypot(p.x - c.x, p.y - c.y) - 10) < 1e-9);
});
