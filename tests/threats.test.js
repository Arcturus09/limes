import { test } from "node:test";
import assert from "node:assert/strict";
import { nextRandom, nextInt } from "../src/core/rng.js";
import { createInitialState } from "../src/core/state.js";
import { endSeason } from "../src/core/turn.js";
import { findFords, chooseTarget, announceThreats } from "../src/core/threats.js";
import { unidades } from "../src/data/units.js";
import { partida } from "../src/data/game.js";
import { amenazas } from "../src/data/threats.js";
import { mapaPrototipo } from "../src/data/maps/prototype.js";

const datos = { mapa: mapaPrototipo, unidades, partida, amenazas };

test("rng: misma semilla, misma sucesión; y no toca la semilla original", () => {
  const a = nextRandom(42);
  const b = nextRandom(42);
  assert.deepEqual(a, b);
  assert.ok(a.value >= 0 && a.value < 1);
  assert.notEqual(nextRandom(a.seed).value, a.value);
});

test("rng: nextInt queda dentro del rango", () => {
  let seed = 7;
  for (let i = 0; i < 200; i++) {
    const r = nextInt(seed, 3);
    seed = r.seed;
    assert.ok(Number.isInteger(r.value) && r.value >= 0 && r.value < 3);
  }
});

test("los vados del prototipo son los tres de la fila 0", () => {
  assert.deepEqual(findFords(mapaPrototipo), [{ fila: 0, col: 1 }, { fila: 0, col: 4 }, { fila: 0, col: 7 }]);
});

test("objetivo: el asentamiento más cercano al vado", () => {
  const s = createInitialState(1, datos);
  assert.deepEqual(chooseTarget(s, { fila: 0, col: 1 }, datos), { fila: 1, col: 0 }); // Batavis
  assert.deepEqual(chooseTarget(s, { fila: 0, col: 4 }, datos), { fila: 1, col: 4 }); // Lentia
  assert.deepEqual(chooseTarget(s, { fila: 0, col: 7 }, datos), { fila: 1, col: 8 }); // Favianis
});

test("objetivo: un asentamiento saqueado se salta", () => {
  const s = createInitialState(1, datos);
  s.looted.push({ fila: 1, col: 4 });
  const t = chooseTarget(s, { fila: 0, col: 4 }, datos);
  assert.notDeepEqual(t, { fila: 1, col: 4 });
});

test("objetivo: en empate de distancia gana el más rico", () => {
  // Aldea y ciudad, ambas pegadas al vado: elige la ciudad
  const mapa = { filas: ["..V..", ".AC.."], lugares: [] };
  const d = { mapa, unidades, partida };
  const s = createInitialState(1, d);
  const t = chooseTarget(s, { fila: 0, col: 2 }, d);
  assert.equal(mapa.filas[t.fila][t.col], "C");
});

test("objetivo: sin asentamientos en pie no hay objetivo", () => {
  const s = createInitialState(1, datos);
  s.looted = [{ fila: 1, col: 0 }, { fila: 1, col: 4 }, { fila: 1, col: 8 }, { fila: 3, col: 4 }];
  assert.equal(chooseTarget(s, { fila: 0, col: 4 }, datos), null);
});

test("la estación 1 no trae bandas y la 2 trae una de fuerza 2", () => {
  const s0 = createInitialState(1, datos);
  assert.deepEqual(s0.threats, []);
  const s1 = endSeason(s0, datos);
  assert.equal(s1.threats.length, 1);
  assert.equal(s1.threats[0].strength, 2);
});

test("las amenazas son reproducibles con la misma semilla", () => {
  const a = endSeason(createInitialState(123, datos), datos);
  const b = endSeason(createInitialState(123, datos), datos);
  assert.deepEqual(a.threats, b.threats);
  assert.equal(a.seed, b.seed);
});

test("dos bandas en la misma estación: cada una con su vado y su objetivo", () => {
  const s = createInitialState(5, datos);
  s.season = 4; // la próxima es la estación 5: bandas 2 y 2
  const { threats } = announceThreats(s, datos);
  assert.equal(threats.length, 2);
  for (const t of threats) assert.equal(mapaPrototipo.filas[t.vado.fila][t.vado.col], "V");
});

test("anunciar no modifica el estado original", () => {
  const s = createInitialState(9, datos);
  const copia = structuredClone(s);
  endSeason(s, datos);
  assert.deepEqual(s, copia);
});
