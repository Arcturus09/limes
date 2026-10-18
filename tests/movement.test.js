import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/core/state.js";
import { reachableHexes } from "../src/core/movement.js";
import { applyAction } from "../src/core/actions.js";
import { unidades } from "../src/data/units.js";
import { partida } from "../src/data/game.js";
import { mapaPrototipo } from "../src/data/maps/prototype.js";

// Una sola fila: los vecinos de una casilla son solo la de su izquierda y la de su derecha
function datosFila(cadena) {
  return { mapa: { filas: [cadena], lugares: [] }, unidades, partida };
}

// Estado con una única legión en (0, col) y los puntos indicados
function estadoFila(col, movesLeft, data) {
  const s = createInitialState(1, data);
  s.legions = [{ ...s.legions[0], fila: 0, col, movesLeft }];
  return s;
}

const claves = (casillas) => casillas.map((h) => `${h.fila},${h.col}:${h.cost}`).sort();

test("en llanura, con 2 puntos se llega a 2 casillas de distancia", () => {
  const data = datosFila(".....");
  assert.deepEqual(claves(reachableHexes(estadoFila(2, 2, data), 1, data)), ["0,0:2", "0,1:1", "0,3:1", "0,4:2"]);
});

test("el bosque cuesta 2: se llega a él pero no se sigue más allá", () => {
  const data = datosFila(".b...");
  assert.deepEqual(claves(reachableHexes(estadoFila(0, 2, data), 1, data)), ["0,1:2"]);
});

test("con 1 punto no se puede entrar en un bosque ni en una colina", () => {
  for (const terreno of ["b", "c"]) {
    const data = datosFila(`.${terreno}.`);
    assert.deepEqual(claves(reachableHexes(estadoFila(0, 1, data), 1, data)), []);
  }
});

test("una legión sin puntos no puede ir a ninguna parte", () => {
  const data = datosFila(".....");
  assert.deepEqual(reachableHexes(estadoFila(2, 0, data), 1, data), []);
});

test("no se puede entrar en una casilla con otra legión, ni pasar por ella", () => {
  const data = datosFila(".....");
  const s = estadoFila(0, 2, data);
  s.legions.push({ ...s.legions[0], id: 2, col: 1 });
  assert.deepEqual(reachableHexes(s, 1, data), []);
});

test("en el mapa real, la llanura junto a Batavis cuesta 1 y nada pasa de 2 puntos", () => {
  const data = { mapa: mapaPrototipo, unidades, partida };
  const s = createInitialState(1, data);
  const alcanzables = reachableHexes(s, 2, data);
  const abajo = alcanzables.find((h) => h.fila === 2 && h.col === 0);
  assert.equal(abajo.cost, 1);
  assert.ok(alcanzables.every((h) => h.cost <= 2));
});

test("mover cambia la posición y gasta los puntos del camino", () => {
  const data = datosFila(".....");
  const antes = estadoFila(2, 2, data);
  const despues = applyAction(antes, { type: "move", legionId: 1, to: { fila: 0, col: 4 } }, data);
  assert.deepEqual([despues.legions[0].fila, despues.legions[0].col, despues.legions[0].movesLeft], [0, 4, 0]);
});

test("mover no modifica el estado original", () => {
  const data = datosFila(".....");
  const antes = estadoFila(2, 2, data);
  const copia = structuredClone(antes);
  applyAction(antes, { type: "move", legionId: 1, to: { fila: 0, col: 3 } }, data);
  assert.deepEqual(antes, copia);
});

test("se puede mover en varios pasos mientras queden puntos", () => {
  const data = datosFila(".....");
  let s = estadoFila(0, 2, data);
  s = applyAction(s, { type: "move", legionId: 1, to: { fila: 0, col: 1 } }, data);
  s = applyAction(s, { type: "move", legionId: 1, to: { fila: 0, col: 2 } }, data);
  assert.equal(s.legions[0].col, 2);
  assert.equal(s.legions[0].movesLeft, 0);
  const igual = applyAction(s, { type: "move", legionId: 1, to: { fila: 0, col: 3 } }, data);
  assert.equal(igual, s);
});

test("una orden imposible devuelve el mismo estado", () => {
  const data = datosFila(".b...");
  const s = estadoFila(0, 1, data);
  assert.equal(applyAction(s, { type: "move", legionId: 1, to: { fila: 0, col: 1 } }, data), s);
  assert.equal(applyAction(s, { type: "baila" }, data), s);
});
