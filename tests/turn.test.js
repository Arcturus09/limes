import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/core/state.js";
import { endSeason } from "../src/core/turn.js";
import { applyAction } from "../src/core/actions.js";
import { unidades } from "../src/data/units.js";
import { partida } from "../src/data/game.js";
import { mapaPrototipo } from "../src/data/maps/prototype.js";

const datosReales = { mapa: mapaPrototipo, unidades, partida };
// Mapa sin asentamientos: no hay ingresos, así se prueba el hambre sin ruido
const datosSinAldeas = { mapa: { filas: ["....."], lugares: [] }, unidades, partida };

test("cerrar la estación pasa a la siguiente", () => {
  const s = endSeason(createInitialState(1, datosReales), datosReales);
  assert.equal(s.season, 1);
});

test("ingresos y mantenimiento del mapa del prototipo: 3 aldeas y 1 ciudad, 3 legiones", () => {
  // Ingresos: grano 3×2 + 3 = 9; denarios 3×1 + 3 = 6. Mantenimiento: grano 3×2 = 6; denarios 3×1 = 3.
  const s = endSeason(createInitialState(1, datosReales), datosReales);
  assert.deepEqual(s.lastSeason.income, { grain: 9, denarii: 6 });
  assert.deepEqual(s.lastSeason.upkeep, { grain: 6, denarii: 3 });
  assert.deepEqual(s.resources, { grain: 13, denarii: 13 });
  assert.equal(s.lastSeason.shortage, false);
});

test("si el grano alcanza justo, no hay hambre", () => {
  const s0 = createInitialState(1, datosSinAldeas);
  s0.resources.grain = 6;
  const s = endSeason(s0, datosSinAldeas);
  assert.equal(s.lastSeason.shortage, false);
  assert.equal(s.resources.grain, 0);
  for (const l of s.legions) assert.equal(l.strength, 3);
});

test("si falta grano, cada legión pierde 1 de fuerza y el grano queda a 0", () => {
  const s0 = createInitialState(1, datosSinAldeas);
  s0.resources.grain = 3;
  const s = endSeason(s0, datosSinAldeas);
  assert.equal(s.lastSeason.shortage, true);
  assert.equal(s.resources.grain, 0);
  assert.equal(s.resources.denarii, 7);
  for (const l of s.legions) assert.equal(l.strength, 2);
});

test("si faltan denarios, también hay deserciones", () => {
  const s0 = createInitialState(1, datosSinAldeas);
  s0.resources.denarii = 2;
  const s = endSeason(s0, datosSinAldeas);
  assert.equal(s.lastSeason.shortage, true);
  assert.equal(s.resources.denarii, 0);
  for (const l of s.legions) assert.equal(l.strength, 2);
});

test("falten grano y denarios a la vez, la pérdida es de 1 (no de 2)", () => {
  const s0 = createInitialState(1, datosSinAldeas);
  s0.resources = { grain: 0, denarii: 0 };
  const s = endSeason(s0, datosSinAldeas);
  for (const l of s.legions) assert.equal(l.strength, 2);
});

test("una legión que llega a fuerza 0 desaparece y se anota su nombre", () => {
  const s0 = createInitialState(1, datosSinAldeas);
  s0.resources.grain = 0;
  s0.legions[1].strength = 1;
  const s = endSeason(s0, datosSinAldeas);
  assert.equal(s.legions.length, 2);
  assert.deepEqual(s.lastSeason.deserted, [s0.legions[1].name]);
});

test("al cerrar la estación las legiones recuperan sus puntos de movimiento", () => {
  const s0 = createInitialState(1, datosReales);
  for (const l of s0.legions) l.movesLeft = 0;
  const s = endSeason(s0, datosReales);
  for (const l of s.legions) assert.equal(l.movesLeft, unidades.legion.movimiento);
});

test("cerrar la estación no modifica el estado original", () => {
  const s0 = createInitialState(1, datosReales);
  const copia = structuredClone(s0);
  endSeason(s0, datosReales);
  assert.deepEqual(s0, copia);
});

test("la acción endSeason llama a endSeason", () => {
  const s0 = createInitialState(1, datosReales);
  assert.deepEqual(applyAction(s0, { type: "endSeason" }, datosReales), endSeason(s0, datosReales));
});
