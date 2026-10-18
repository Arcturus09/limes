// Dónde puede llegar una legión con los puntos de movimiento que le quedan.
// Es una búsqueda del camino más barato (Dijkstra) sobre la rejilla de hexágonos.
import { neighbors } from "./hex.js";

const clave = (h) => `${h.fila},${h.col}`;

// data = { mapa, partida }. Devuelve [{ fila, col, cost }] sin incluir la casilla de salida.
export function reachableHexes(state, legionId, data) {
  const { mapa, partida } = data;
  const legion = state.legions.find((l) => l.id === legionId);
  const filas = mapa.filas.length;
  const columnas = mapa.filas[0].length;

  // ⚖ PROVISIONAL: no se puede entrar en una casilla ocupada por otra legión (ni pasar por ella)
  const ocupadas = new Set(state.legions.filter((l) => l.id !== legionId).map(clave));

  const mejorCoste = { [clave(legion)]: 0 };
  const pendientes = [{ fila: legion.fila, col: legion.col }];

  while (pendientes.length > 0) {
    // Siempre se expande la casilla más barata, así el primer coste que se anota es el mínimo
    pendientes.sort((a, b) => mejorCoste[clave(a)] - mejorCoste[clave(b)]);
    const actual = pendientes.shift();

    for (const vecina of neighbors(actual, filas, columnas)) {
      if (ocupadas.has(clave(vecina))) continue;
      const coste = mejorCoste[clave(actual)] + partida.costeTerreno[mapa.filas[vecina.fila][vecina.col]];
      // ⚖ PROVISIONAL: hay que tener puntos para pagar el coste entero de la casilla
      if (coste > legion.movesLeft) continue;
      if (mejorCoste[clave(vecina)] === undefined || coste < mejorCoste[clave(vecina)]) {
        mejorCoste[clave(vecina)] = coste;
        pendientes.push(vecina);
      }
    }
  }

  return Object.entries(mejorCoste)
    .filter(([k]) => k !== clave(legion))
    .map(([k, cost]) => {
      const [fila, col] = k.split(",").map(Number);
      return { fila, col, cost };
    });
}
