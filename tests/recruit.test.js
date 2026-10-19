import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/core/state.js";
import { recruitCheck, recruitLegion } from "../src/core/recruit.js";
import { checkEnding } from "../src/core/endings.js";
import { endSeason } from "../src/core/turn.js";
import { applyAction } from "../src/core/actions.js";
import { unidades } from "../src/data/units.js";
import { partida } from "../src/data/game.js";
import { amenazas } from "../src/data/threats.js";
import { mapaPrototipo } from "../src/data/maps/prototype.js";

const datos = { mapa: mapaPrototipo, unidades, partida, amenazas };
const CIUDAD = { fila: 3, col: 4 }; // Lauriacum

test("reclutar cuesta 6 denarios y crea una legión de fuerza 2 con nombre nuevo", () => {
  const s0 = createInitialState(1, datos);
  s0.legions = s0.legions.filter((l) => l.col !== CIUDAD.col); // ciudad libre
  const s = recruitLegion(s0, datos);
  assert.equal(s.resources.denarii, 4);
  const nueva = s.legions.at(-1);
  assert.deepEqual([nueva.fila, nueva.col, nueva.strength], [CIUDAD.fila, CIUDAD.col, 2]);
  assert.equal(nueva.name, "Cohors de Lentia");
  assert.equal(s0.legions.length, s.legions.length - 1); // el original no cambia
});

test("con la ciudad ocupada aparece en una casilla libre vecina", () => {
  const s = recruitLegion(createInitialState(1, datos), datos); // II Italica está en Lauriacum
  const nueva = s.legions.at(-1);
  assert.notDeepEqual({ fila: nueva.fila, col: nueva.col }, CIUDAD);
  assert.equal(new Set(s.legions.map((l) => `${l.fila},${l.col}`)).size, s.legions.length);
});

test("solo una recluta por estación, y se repone al cerrarla", () => {
  const s1 = recruitLegion(createInitialState(1, datos), datos);
  assert.equal(recruitCheck(s1, datos).ok, false);
  assert.equal(recruitLegion(s1, datos), s1);
  assert.equal(recruitCheck(endSeason(s1, datos), datos).ok, true);
});

test("sin 6 denarios no se puede reclutar", () => {
  const s0 = createInitialState(1, datos);
  s0.resources.denarii = 5;
  assert.equal(recruitCheck(s0, datos).ok, false);
});

test("los ids y los nombres no se repiten aunque caiga una legión", () => {
  let s = recruitLegion(createInitialState(1, datos), datos);
  s.legions = s.legions.filter((l) => l.id !== 4); // cae la recién reclutada
  s.resources.denarii = 20;
  s.recruitedThisSeason = false;
  s = recruitLegion(s, datos);
  assert.equal(s.legions.at(-1).id, 5);
  assert.equal(s.legions.at(-1).name, "Numerus de Lauriaco");
});

test("victoria al cerrar la estación 15", () => {
  const s = createInitialState(1, datos);
  s.season = 14;
  assert.equal(checkEnding(s, datos), null);
  assert.equal(endSeason(s, datos).ending.type, "victoria");
});

test("derrota si Lauriacum es saqueada, aunque sea la última estación", () => {
  const s = createInitialState(1, datos);
  s.season = 14;
  s.legions = [];
  s.threats = [{ id: 1, strength: 2, vado: { fila: 0, col: 4 }, objetivo: CIUDAD }];
  const fin = endSeason(s, datos);
  assert.equal(fin.ending.type, "derrota");
  assert.equal(fin.looted.some((h) => h.fila === 3 && h.col === 4), true);
});

test("terminada la partida, las acciones no hacen nada", () => {
  const s = createInitialState(1, datos);
  s.ending = { type: "victoria", reason: "" };
  assert.equal(applyAction(s, { type: "endSeason" }, datos), s);
  assert.equal(applyAction(s, { type: "recruit" }, datos), s);
});
