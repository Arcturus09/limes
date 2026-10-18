// Las acciones del gobernador. Cada una recibe el estado y devuelve OTRO estado:
// nunca se modifica el original, y eso es lo que hace gratis el deshacer.
import { reachableHexes } from "./movement.js";

// data = { mapa, unidades, partida }
export function applyAction(state, action, data) {
  if (action.type === "move") return moveLegion(state, action, data);
  return state;
}

function moveLegion(state, { legionId, to }, data) {
  const destino = reachableHexes(state, legionId, data).find((h) => h.fila === to.fila && h.col === to.col);
  // Una orden imposible no cambia nada (la interfaz solo ofrece las posibles)
  if (!destino) return state;

  const next = structuredClone(state);
  const legion = next.legions.find((l) => l.id === legionId);
  legion.fila = to.fila;
  legion.col = to.col;
  legion.movesLeft -= destino.cost;
  return next;
}
