// Cerrar la estación: pasa a la siguiente, cobra los ingresos y paga el mantenimiento
// (DISENO.md §3 y §6). Función pura: devuelve otro estado y deja el original intacto.
// Los combates y los saqueos se añaden en el paso 1.5.

// data = { mapa, unidades, partida }
export function endSeason(state, data) {
  const { mapa, unidades, partida } = data;
  const next = structuredClone(state);
  next.season += 1;

  // 1. Ingresos de los asentamientos del mapa
  const income = { grain: 0, denarii: 0 };
  for (const fila of mapa.filas) {
    for (const terreno of fila) {
      const produce = partida.produccion[terreno];
      if (!produce) continue;
      income.grain += produce.grano;
      income.denarii += produce.denarios;
    }
  }
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

  next.lastSeason = { income, upkeep: pagado, shortage: faltaAlgo, deserted: desertadas };
  return next;
}
