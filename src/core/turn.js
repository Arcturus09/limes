// Cerrar la estación: pasa a la siguiente, cobra los ingresos y paga el mantenimiento
// (DISENO.md §3 y §6). Función pura: devuelve otro estado y deja el original intacto.
// Primero las bandas anunciadas atacan (combates y saqueos); luego empieza la estación siguiente.
import { announceThreats } from "./threats.js";
import { resolveThreats } from "./combat.js";

// data = { mapa, unidades, partida }
export function endSeason(state, data) {
  const { mapa, unidades, partida } = data;
  // 0. Las bandas de la estación que acaba cruzan y combaten
  const { state: next, reports } = resolveThreats(state, data);
  next.season += 1;

  // 1. Ingresos de los asentamientos del mapa
  const income = { grain: 0, denarii: 0 };
  mapa.filas.forEach((fila, f) => {
    [...fila].forEach((terreno, c) => {
      const produce = partida.produccion[terreno];
      if (!produce) return;
      if (next.looted.some((h) => h.fila === f && h.col === c)) return; // saqueado: no produce
      income.grain += produce.grano;
      income.denarii += produce.denarios;
    });
  });
  // Cada ingreso acerca al asentamiento saqueado a recuperarse
  for (const h of next.looted) h.seasonsLeft -= 1;
  next.looted = next.looted.filter((h) => h.seasonsLeft > 0);
  next.resources.grain += income.grain;
  next.resources.denarii += income.denarii;

  // 2. Mantenimiento de las legiones
  const cuesta = unidades.legion.mantenimiento;
  const debido = { grain: next.legions.length * cuesta.grano, denarii: next.legions.length * cuesta.denarios };
  // ⚖ PROVISIONAL: si no alcanza, se paga lo que haya (el recurso queda a 0) y no se debe nada
  const pagado = {
    grain: Math.min(next.resources.grain, debido.grain),
    denarii: Math.min(next.resources.denarii, debido.denarii),
  };
  next.resources.grain -= pagado.grain;
  next.resources.denarii -= pagado.denarii;

  // 3. Hambre: falte grano, denarios o ambos, cada legión pierde 1 de fuerza (una sola vez).
  const faltaAlgo = pagado.grain < debido.grain || pagado.denarii < debido.denarii;
  const desertadas = [];
  if (faltaAlgo) {
    for (const legion of next.legions) legion.strength -= 1;
    for (const legion of next.legions) if (legion.strength <= 0) desertadas.push(legion.name);
    // Una legión con fuerza 0 desaparece (DISENO.md §6)
    next.legions = next.legions.filter((l) => l.strength > 0);
  }

  // 4. Cada legión recupera sus puntos de movimiento
  for (const legion of next.legions) legion.movesLeft = unidades.legion.movimiento;

  // 5. Se anuncian las bandas de la estación que empieza (y la semilla avanza)
  const anuncio = announceThreats(next, data);
  next.threats = anuncio.threats;
  next.seed = anuncio.seed;

  next.lastSeason = { income, upkeep: pagado, shortage: faltaAlgo, deserted: desertadas, battles: reports };
  return next;
}
