// Amenazas anunciadas (DISENO.md §7): al empezar cada estación se sabe qué bandas
// llegarán, por qué vado y a qué asentamiento. Aquí solo se elige; el combate es del 1.5.
import { distance } from "./hex.js";
import { nextInt } from "./rng.js";

// Casillas de vado: las 'V' de la fila 0 (el borde del Danubio)
export function findFords(mapa) {
  const vados = [];
  [...mapa.filas[0]].forEach((t, col) => { if (t === "V") vados.push({ fila: 0, col }); });
  return vados;
}

// Asentamientos (aldeas y ciudad) que no están saqueados, con su riqueza
function targetsAvailable(state, data) {
  const { mapa, partida } = data;
  const lista = [];
  mapa.filas.forEach((cadena, fila) => {
    [...cadena].forEach((terreno, col) => {
      const produce = partida.produccion[terreno];
      if (!produce) return;
      if (state.looted.some((h) => h.fila === fila && h.col === col)) return;
      lista.push({ fila, col, riqueza: produce.grano + produce.denarios });
    });
  });
  return lista;
}

// Objetivo: el asentamiento no saqueado más cercano al vado; si empatan, el más rico;
// si aún empatan, el primero del mapa (así es determinista sin gastar azar). null si no queda ninguno.
export function chooseTarget(state, vado, data) {
  let mejor = null;
  for (const t of targetsAvailable(state, data)) {
    const d = distance(vado, t);
    if (!mejor || d < mejor.d || (d === mejor.d && t.riqueza > mejor.riqueza)) mejor = { ...t, d };
  }
  return mejor ? { fila: mejor.fila, col: mejor.col } : null;
}

// Bandas de la estación `season` (0 = estación 1). Devuelve { threats, seed }:
// la semilla avanzada hay que guardarla en el estado.
export function announceThreats(state, data) {
  const fuerzas = data.amenazas?.oleadas?.[state.season + 1] ?? [];
  const vados = findFords(data.mapa);
  let seed = state.seed;
  const threats = [];
  for (const [i, strength] of fuerzas.entries()) {
    const r = nextInt(seed, vados.length);
    seed = r.seed;
    const vado = vados[r.value];
    const objetivo = chooseTarget(state, vado, data);
    if (!objetivo) continue; // sin asentamientos en pie no hay a quién atacar
    threats.push({ id: i + 1, strength, vado, objetivo });
  }
  return { threats, seed };
}
