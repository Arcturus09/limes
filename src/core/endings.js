// Fin de partida del prototipo (DISENO.md §10): victoria al cerrar la última estación
// y derrota si Lauriacum es saqueada. Los finales de la Fase 2 llegan en el 2.6.

// null mientras la partida sigue; si no, { type: "victoria" | "derrota", reason }
export function checkEnding(state, data) {
  const { mapa, partida } = data;
  // Derrota primero: si en la última estación cae Lauriacum, no cuenta como victoria
  const ciudadSaqueada = state.looted.some((h) => mapa.filas[h.fila][h.col] === "C");
  if (ciudadSaqueada) return { type: "derrota", reason: "Lauriacum ha sido saqueada." };
  if (state.season >= partida.estacionesPrototipo) {
    return { type: "victoria", reason: `Has resistido ${partida.estacionesPrototipo} estaciones.` };
  }
  return null;
}
