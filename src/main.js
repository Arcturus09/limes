// Une las capas: guarda el historial para deshacer, convierte los clics en acciones
// y vuelve a dibujar. Las reglas viven en src/core/; aquí solo se conecta todo.
import { mapaPrototipo } from "./data/maps/prototype.js";
import { unidades } from "./data/units.js";
import { partida } from "./data/game.js";
import { amenazas } from "./data/threats.js";
import { createInitialState, seasonLabel } from "./core/state.js";
import { applyAction } from "./core/actions.js";
import { reachableHexes } from "./core/movement.js";
import { createHistory, perform, undo, canUndo, clearHistory } from "./core/history.js";
import { renderMap, renderLegions, renderThreats } from "./ui/render-map.js";
import { renderHud } from "./ui/render-hud.js";
import { bindShortcuts } from "./ui/input.js";

const NOMBRES_TERRENO = { ".": "Llanura", b: "Bosque", c: "Colina", V: "Vado", A: "Aldea", C: "Ciudad" };
const datos = { mapa: mapaPrototipo, unidades, partida, amenazas };

// La semilla sale del reloj aquí, fuera del núcleo, para que el núcleo no tenga azar propio
let history = createHistory(createInitialState(Date.now(), datos));
let legionElegida = null; // id de la legión seleccionada
let casillaElegida = null; // { fila, col }
let mensaje = null; // resumen de la última estación; se borra al elegir otra cosa

const info = document.getElementById("info");
const botonDeshacer = document.getElementById("deshacer");
const botonCerrar = document.getElementById("cerrar");

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

function nombreLugar({ fila, col }) {
  const lugar = mapaPrototipo.lugares.find((l) => l.fila === fila && l.col === col);
  return lugar ? lugar.nombre : `la casilla (${fila}, ${col})`;
}

function describirBanda(t) {
  return `Banda de fuerza ${t.strength} por el vado de la columna ${t.vado.col}, rumbo a ${nombreLugar(t.objetivo)}.`;
}

// Texto del resumen de la estación que acaba de empezar (la crónica llega en la Fase 2)
function describirEstacion(state) {
  const { estacion, anyo } = seasonLabel(state.season, partida);
  const { income, upkeep, shortage, deserted } = state.lastSeason;
  let texto = `${estacion} del año ${anyo}: ingresos +${income.grain} grano y +${income.denarii} denarios`;
  texto += ` · mantenimiento −${upkeep.grain} grano y −${upkeep.denarii} denarios.`;
  if (shortage) texto += " Faltan provisiones: cada legión pierde 1 de fuerza.";
  if (deserted.length > 0) texto += ` Desaparece: ${deserted.join(", ")}.`;
  for (const t of state.threats) texto += ` ${describirBanda(t)}`;
  return texto;
}

function dibujar() {
  const state = history.present;
  renderHud(document.getElementById("barra"), state, partida);
  renderLegions(fichas, state.legions, legionElegida);
  renderThreats(capaAmenazas, state.threats);
  const alcanzables = legionElegida ? reachableHexes(state, legionElegida, datos) : [];
  marcar(casillaElegida, alcanzables);
  info.textContent = casillaElegida ? describirCasilla(casillaElegida) : (mensaje || "Elige una casilla.");
  botonDeshacer.disabled = !canUndo(history);
}

function alElegir(hex) {
  mensaje = null;
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
  mensaje = null;
  history = undo(history);
  // La selección sigue a la legión, esté donde esté tras deshacer
  const legion = history.present.legions.find((l) => l.id === legionElegida);
  casillaElegida = legion ? { fila: legion.fila, col: legion.col } : casillaElegida;
  dibujar();
}

// Irreversible: al cerrar la estación se vacía el historial y ya no se puede deshacer
function cerrarEstacion() {
  const siguiente = applyAction(history.present, { type: "endSeason" }, datos);
  history = clearHistory(perform(history, siguiente));
  legionElegida = null;
  casillaElegida = null;
  mensaje = describirEstacion(siguiente);
  dibujar();
}

function deseleccionar() {
  legionElegida = null;
  casillaElegida = null;
  dibujar();
}

const { fichas, amenazas: capaAmenazas, marcar } = renderMap(document.getElementById("mapa"), mapaPrototipo, alElegir);
// blur(): tras pulsar un botón, el Espacio no debe volver a pulsarlo
botonDeshacer.addEventListener("click", () => { deshacer(); botonDeshacer.blur(); });
botonCerrar.addEventListener("click", () => { cerrarEstacion(); botonCerrar.blur(); });
bindShortcuts({ undo: deshacer, deselect: deseleccionar, closeSeason: cerrarEstacion });
dibujar();
