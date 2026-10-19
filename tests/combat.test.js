import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/core/state.js";
import { resolveThreats, previewThreats } from "../src/core/combat.js";
import { endSeason } from "../src/core/turn.js";
import { unidades } from "../src/data/units.js";
import { partida } from "../src/data/game.js";
import { amenazas } from "../src/data/threats.js";
import { mapaPrototipo } from "../src/data/maps/prototype.js";

const datos = { mapa: mapaPrototipo, unidades, partida, amenazas };
const VADO = { fila: 0, col: 1 }; // vado: +1 de defensa
const BATAVIS = { fila: 1, col: 0 }; // aldea: sin bono

// Estado con legiones a medida: [{ fila, col, strength }] y una banda hacia Batavis
function escenario(legiones, fuerzaBanda, objetivo = BATAVIS) {
  const s = createInitialState(1, datos);
  s.legions = legiones.map((l, i) => ({ id: i + 1, name: `L${i + 1}`, short: `L${i + 1}`, movesLeft: 2, victories: 0, ...l }));
  s.threats = [{ id: 1, strength: fuerzaBanda, vado: VADO, objetivo }];
  return s;
}

test("victoria: D ≥ F, la banda desaparece y las legiones pierden ⌊F/2⌋", () => {
  // D = 3 (legión) + 1 (vado) = 4; F = 3 → victoria, pérdida ⌊3/2⌋ = 1
  const { state, reports } = resolveThreats(escenario([{ ...VADO, strength: 3 }], 3), datos);
  assert.equal(reports[0].steps[0].victory, true);
  assert.equal(reports[0].looted, false);
  assert.equal(state.legions[0].strength, 2);
  assert.equal(state.legions[0].victories, 1);
  assert.equal(state.looted.length, 0);
});

test("empate D = F cuenta como victoria", () => {
  // D = 3 + 1 = 4 contra F = 4: gana; pierde ⌊4/2⌋ = 2
  const { state, reports } = resolveThreats(escenario([{ ...VADO, strength: 3 }], 4), datos);
  assert.equal(reports[0].steps[0].victory, true);
  assert.equal(state.legions[0].strength, 1);
});

test("derrota: la banda pierde D, las legiones ⌈F/2⌉, y sigue hacia el objetivo y lo saquea", () => {
  // D = 4 contra F = 5: derrota. Banda queda en 1, legión pierde ⌈5/2⌉ = 3 → fuerza 0 y desaparece.
  const { state, reports } = resolveThreats(escenario([{ ...VADO, strength: 3 }], 5), datos);
  assert.equal(reports[0].steps[0].victory, false);
  assert.equal(reports[0].steps[0].bandLeft, 1);
  assert.deepEqual(reports[0].fallen, ["L1"]);
  assert.equal(state.legions.length, 0);
  assert.equal(reports[0].looted, true);
  assert.deepEqual(state.looted, [{ ...BATAVIS, seasonsLeft: 2 }]);
});

test("las pérdidas se reparten empezando por la más fuerte, de una en una", () => {
  const s = escenario([{ ...VADO, strength: 4 }], 6);
  // Dos legiones en la misma casilla (el movimiento no lo permite, pero el combate lo soporta)
  s.legions.push({ id: 2, name: "L2", short: "L2", movesLeft: 2, victories: 0, ...VADO, strength: 2 });
  // D = 4 + 2 + 1 = 7 ≥ 6: victoria, pérdida 3 → 4,2 → 3,2 → 2,2 → 1,2
  const { state } = resolveThreats(s, datos);
  assert.deepEqual(state.legions.map((l) => l.strength), [1, 2]);
});

test("si la banda sobrevive al vado y encuentra otra legión en el objetivo, combate allí", () => {
  // Vado: D = 1 + 1 = 2 contra F = 4 → derrota; banda 2; la legión (1) pierde 2 y cae.
  // Objetivo Batavis: D = 3 contra F = 2 → victoria.
  const s = escenario([{ ...VADO, strength: 1 }, { ...BATAVIS, strength: 3 }], 4);
  const { state, reports } = resolveThreats(s, datos);
  assert.equal(reports[0].steps.length, 2);
  assert.equal(reports[0].steps[1].victory, true);
  assert.equal(reports[0].looted, false);
  assert.equal(state.looted.length, 0);
  assert.equal(state.legions.length, 1);
  assert.equal(state.legions[0].strength, 2); // 3 − ⌊2/2⌋
});

test("sin legiones en el camino no hay combate y se saquea", () => {
  const { reports, state } = resolveThreats(escenario([], 2), datos);
  assert.equal(reports[0].steps.every((p) => !p.fought), true);
  assert.equal(reports[0].looted, true);
  assert.equal(state.looted.length, 1);
});

test("el bono de colina se suma en la defensa del objetivo", () => {
  // Colina (2,3): D = 2 + 1 = 3 contra F = 3 → empate, victoria
  const s = escenario([{ fila: 2, col: 3, strength: 2 }], 3, { fila: 2, col: 3 });
  const { reports } = resolveThreats(s, datos);
  assert.equal(reports[0].steps[1].defense, 3);
  assert.equal(reports[0].steps[1].victory, true);
});

test("las bandas se resuelven de oeste a este", () => {
  const s = escenario([], 2);
  s.threats = [
    { id: 1, strength: 2, vado: { fila: 0, col: 7 }, objetivo: { fila: 1, col: 8 } },
    { id: 2, strength: 2, vado: VADO, objetivo: BATAVIS },
  ];
  const { reports } = resolveThreats(s, datos);
  assert.deepEqual(reports.map((r) => r.id), [2, 1]);
});

test("la previsión coincide con lo que ocurre al cerrar la estación", () => {
  const s = escenario([{ ...VADO, strength: 3 }], 5);
  const prevision = previewThreats(s, datos);
  const real = endSeason(s, datos);
  assert.deepEqual(prevision, real.lastSeason.battles);
});

test("el estado original no se modifica", () => {
  const s = escenario([{ ...VADO, strength: 3 }], 5);
  const copia = structuredClone(s);
  previewThreats(s, datos);
  assert.deepEqual(s, copia);
});

test("un asentamiento saqueado no produce durante 2 estaciones y luego se recupera", () => {
  const s = escenario([], 2);
  const a = endSeason(s, datos); // Batavis saqueada: sin sus 2 de grano y 1 de denario
  assert.deepEqual(a.lastSeason.income, { grain: 7, denarii: 5 });
  const b = endSeason({ ...a, threats: [] }, datos); // segunda estación sin producir
  assert.deepEqual(b.lastSeason.income, { grain: 7, denarii: 5 });
  const c = endSeason({ ...b, threats: [] }, datos); // recuperada
  assert.deepEqual(c.lastSeason.income, { grain: 9, denarii: 6 });
});
