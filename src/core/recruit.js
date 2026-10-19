// Reclutar (DISENO.md §6): 6 denarios, en la ciudad, aparece con fuerza 2; una por estación.
import { neighbors } from "./hex.js";

const ocupada = (state, h) => state.legions.some((l) => l.fila === h.fila && l.col === h.col);

function findCity(mapa) {
  for (const [fila, cadena] of mapa.filas.entries()) {
    const col = cadena.indexOf("C");
    if (col >= 0) return { fila, col };
  }
  return null;
}

// Dónde aparecería la nueva legión, o por qué no se puede. Devuelve { ok, hex } o { ok: false, reason }.
export function recruitCheck(state, data) {
  const { mapa, unidades } = data;
  if (state.ending) return { ok: false, reason: "La partida ha terminado." };
  if (state.recruitedThisSeason) return { ok: false, reason: "Ya has reclutado esta estación." };
  if (state.resources.denarii < unidades.legion.reclutar.denarios) {
    return { ok: false, reason: `Hacen falta ${unidades.legion.reclutar.denarios} denarios.` };
  }
  const ciudad = findCity(mapa);
  if (!ciudad) return { ok: false, reason: "No hay ciudad donde reclutar." };
  if (!ocupada(state, ciudad)) return { ok: true, hex: ciudad };
  // ⚖ PROVISIONAL: dos legiones no comparten casilla, así que, con la ciudad ocupada,
  // la recluta aparece en la primera casilla libre pegada a ella.
  const libre = neighbors(ciudad, mapa.filas.length, mapa.filas[0].length).find((h) => !ocupada(state, h));
  return libre ? { ok: true, hex: libre } : { ok: false, reason: "No hay sitio libre junto a la ciudad." };
}

export function recruitLegion(state, data) {
  const check = recruitCheck(state, data);
  if (!check.ok) return state; // la interfaz solo ofrece lo posible
  const { unidades } = data;
  const next = structuredClone(state);
  const nombre = unidades.nombresReclutas[next.recruitCount] ?? { nombre: `Legio nova ${next.recruitCount + 1}`, corto: `Nova ${next.recruitCount + 1}` };
  next.resources.denarii -= unidades.legion.reclutar.denarios;
  next.legions.push({
    id: next.nextLegionId,
    name: nombre.nombre,
    short: nombre.corto,
    fila: check.hex.fila,
    col: check.hex.col,
    strength: unidades.legion.reclutar.fuerza,
    movesLeft: 0, // ⚖ PROVISIONAL: la recluta no se mueve la estación en que llega
    victories: 0,
  });
  next.nextLegionId += 1;
  next.recruitCount += 1;
  next.recruitedThisSeason = true;
  return next;
}
