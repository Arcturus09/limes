// Une las capas. En el paso 0.2 solo dibuja el mapa y escribe la casilla elegida.
import { mapaPrototipo } from "./data/maps/prototype.js";
import { renderMap } from "./ui/render-map.js";

const NOMBRES_TERRENO = { ".": "Llanura", b: "Bosque", c: "Colina", V: "Vado", A: "Aldea", C: "Ciudad" };

const info = document.getElementById("info");

renderMap(document.getElementById("mapa"), mapaPrototipo, ({ fila, col }) => {
  const terreno = NOMBRES_TERRENO[mapaPrototipo.filas[fila][col]];
  const lugar = mapaPrototipo.lugares.find((l) => l.fila === fila && l.col === col);
  info.textContent = `${lugar ? lugar.nombre + " · " : ""}${terreno} (fila ${fila}, columna ${col})`;
});
