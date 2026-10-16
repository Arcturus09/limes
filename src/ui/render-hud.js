// Barra superior: estación, año y recursos (DISENO.md §13). Solo dibuja.
import { seasonLabel } from "../core/state.js";

export function renderHud(contenedor, state, partida) {
  const { estacion, anyo } = seasonLabel(state.season, partida);

  const fecha = document.createElement("span");
  fecha.className = "fecha";
  fecha.textContent = `${estacion} · Año ${anyo}`;

  const recursos = document.createElement("span");
  recursos.className = "recursos";
  recursos.textContent = `Grano ${state.resources.grain} · Denarios ${state.resources.denarii}`;

  contenedor.replaceChildren(fecha, recursos);
}
