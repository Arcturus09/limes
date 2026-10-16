// Une las capas: crea el estado inicial, dibuja la barra, el mapa y las legiones,
// y escribe lo que hay en la casilla elegida.
import { mapaPrototipo } from "./data/maps/prototype.js";
import { unidades } from "./data/units.js";
import { partida } from "./data/game.js";
import { createInitialState } from "./core/state.js";
import { renderMap, renderLegions } from "./ui/render-map.js";
import { renderHud } from "./ui/render-hud.js";

const NOMBRES_TERRENO = { ".": "Llanura", b: "Bosque", c: "Colina", V: "Vado", A: "Aldea", C: "Ciudad" };

// La semilla sale del reloj aquí, fuera del núcleo, para que el núcleo no tenga azar propio
const state = createInitialState(Date.now(), { mapa: mapaPrototipo, unidades, partida });

const info = document.getElementById("info");

function describirCasilla({ fila, col }) {
  const terreno = NOMBRES_TERRENO[mapaPrototipo.filas[fila][col]];
  const lugar = mapaPrototipo.lugares.find((l) => l.fila === fila && l.col === col);
  const legion = state.legions.find((l) => l.fila === fila && l.col === col);
  let texto = `${lugar ? lugar.nombre + " · " : ""}${terreno} (fila ${fila}, columna ${col})`;
  if (legion) {
    texto += ` — ${legion.name} · fuerza ${legion.strength}/${unidades.legion.fuerzaMaxima} · ${legion.victories} victorias`;
  }
  info.textContent = texto;
}

renderHud(document.getElementById("barra"), state, partida);
const { fichas } = renderMap(document.getElementById("mapa"), mapaPrototipo, describirCasilla);
renderLegions(fichas, state.legions);
