// Une las capas: guarda el historial para deshacer, convierte los clics en acciones
// y vuelve a dibujar. Las reglas viven en src/core/; aquí solo se conecta todo.
import { mapaPrototipo } from "./data/maps/prototype.js";
import { unidades } from "./data/units.js";
import { partida } from "./data/game.js";
import { createInitialState } from "./core/state.js";
import { applyAction } from "./core/actions.js";
import { reachableHexes } from "./core/movement.js";
import { createHistory, perform, undo, canUndo } from "./core/history.js";
import { renderMap, renderLegions } from "./ui/render-map.js";
import { renderHud } from "./ui/render-hud.js";
import { bindShortcuts } from "./ui/input.js";

const NOMBRES_TERRENO = { ".": "Llanura", b: "Bosque", c: "Colina", V: "Vado", A: "Aldea", C: "Ciudad" };
const datos = { mapa: mapaPrototipo, unidades, partida };

// La semilla sale del reloj aquí, fuera del núcleo, para que el núcleo no tenga azar propio
let history = createHistory(createInitialState(Date.now(), datos));
let legionElegida = null; // id de la legión seleccionada
let casillaElegida = null; // { fila, col }

const info = document.getElementById("info");
const botonDeshacer = document.getElementById("deshacer");

function describirCasilla({ fila, col }) {
  const terreno = NOMBRES_TERRENO[mapaPrototipo.filas[fila][col]];
  const lugar = mapaPrototipo.lugares.find((l) => l.fila === fila && l.col === col);
  const legion = history.present.legions.find((l) => l.fila === fila && l.col === col);
  let texto = `${lugar ? lugar.nombre + " · " : ""}${terreno} (fila ${fila}, columna ${col})`;
  if (legion) {
    texto += ` — ${legion.name} · fuerza ${legion.strength}/${unidades.legion.fuerzaMaxima}`;
    texto += ` · movimiento ${legion.movesLeft}/${unidades.legion.movimiento} · ${legion.victories} victorias`;
  }
  return texto;
}

function dibujar() {
  const state = history.present;
  renderHud(document.getElementById("barra"), state, partida);
  renderLegions(fichas, state.legions, legionElegida);
  const alcanzables = legionElegida ? reachableHexes(state, legionElegida, datos) : [];
  marcar(casillaElegida, alcanzables);
  info.textContent = casillaElegida ? describirCasilla(casillaElegida) : "Elige una casilla.";
  botonDeshacer.disabled = !canUndo(history);
}

function alElegir(hex) {
  const state = history.present;
  const legionAhi = state.legions.find((l) => l.fila === hex.fila && l.col === hex.col);

  // Con una legión elegida, pulsar una casilla alcanzable la mueve
  if (legionElegida && !legionAhi) {
    const alcanzable = reachableHexes(state, legionElegida, datos).some((h) => h.fila === hex.fila && h.col === hex.col);
    if (alcanzable) {
      history = perform(history, applyAction(state, { type: "move", legionId: legionElegida, to: hex }, datos));
      casillaElegida = hex;
      dibujar();
      return;
    }
  }

  casillaElegida = hex;
  legionElegida = legionAhi ? legionAhi.id : null;
  dibujar();
}

function deshacer() {
  history = undo(history);
  // La selección sigue a la legión, esté donde esté tras deshacer
  const legion = history.present.legions.find((l) => l.id === legionElegida);
  casillaElegida = legion ? { fila: legion.fila, col: legion.col } : casillaElegida;
  dibujar();
}

function deseleccionar() {
  legionElegida = null;
  casillaElegida = null;
  dibujar();
}

const { fichas, marcar } = renderMap(document.getElementById("mapa"), mapaPrototipo, alElegir);
botonDeshacer.addEventListener("click", deshacer);
bindShortcuts({ undo: deshacer, deselect: deseleccionar });
dibujar();
