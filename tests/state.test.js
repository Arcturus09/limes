import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialState, seasonLabel } from "../src/core/state.js";
import { unidades } from "../src/data/units.js";
import { partida } from "../src/data/game.js";

const data = { unidades, partida };

test("los recursos iniciales salen de los datos", () => {
  const s = createInitialState(1, data);
  assert.deepEqual(s.resources, { grain: 10, denarii: 10 });
  assert.equal(s.season, 0);
  assert.equal(s.seed, 1);
});

test("el calendario empieza en la primavera de 469 y suma un año cada 4 estaciones", () => {
  assert.deepEqual(seasonLabel(0, partida), { estacion: "Primavera", anyo: 469 });
  assert.deepEqual(seasonLabel(3, partida), { estacion: "Invierno", anyo: 469 });
  assert.deepEqual(seasonLabel(4, partida), { estacion: "Primavera", anyo: 470 });
});

test("hay 3 legiones con fuerza 3 en Lauriacum, Batavis y Favianis", () => {
  const { legions } = createInitialState(1, data);
  assert.equal(legions.length, 3);
  for (const l of legions) assert.equal(l.strength, 3);
  assert.deepEqual(legions.map((l) => [l.fila, l.col]), [[3, 4], [1, 0], [1, 8]]);
  for (const l of legions) assert.equal(l.movesLeft, 2);
  assert.equal(legions[0].name, "Legio II Italica");
  assert.equal(new Set(legions.map((l) => l.id)).size, 3);
  assert.equal(new Set(legions.map((l) => l.name)).size, 3);
});

test("el estado se puede guardar en JSON sin perder nada", () => {
  const s = createInitialState(42, data);
  assert.deepEqual(JSON.parse(JSON.stringify(s)), s);
});

test("cambiar el estado no toca los datos", () => {
  const s = createInitialState(1, data);
  s.legions[0].fila = 0;
  s.resources.grain = 0;
  assert.equal(unidades.legionesIniciales[0].fila, 3);
  assert.equal(partida.recursosIniciales.grano, 10);
});
