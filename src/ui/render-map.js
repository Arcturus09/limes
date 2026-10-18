// Dibuja el mapa en SVG y avisa con un callback cuando se elige una casilla.
// Aquí no hay reglas del juego: solo dibujo y clics.
import { hexToPixel, hexCorners } from "../core/hex.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const SIZE = 44;         // distancia del centro de una casilla a una esquina
const MARGEN = 20;
const BANDA_RIO = 34;    // alto de la franja del Danubio sobre la fila 0

function el(nombre, atributos = {}, hijos = []) {
  const nodo = document.createElementNS(SVG_NS, nombre);
  for (const [clave, valor] of Object.entries(atributos)) nodo.setAttribute(clave, valor);
  for (const h of hijos) nodo.append(h);
  return nodo;
}

// Trama de cada terreno, dibujada en tinta alrededor del centro (0,0)
function dibujarTrama(terreno) {
  const g = el("g", { class: "trama" });
  if (terreno === "b") {
    for (const [x, y] of [[-14, 6], [0, -8], [14, 6]]) {
      g.append(el("path", { d: `M${x - 6} ${y + 6} L${x} ${y - 8} L${x + 6} ${y + 6} Z` }));
      g.append(el("path", { d: `M${x} ${y + 6} v6` }));
    }
  } else if (terreno === "c") {
    // Dos lomas dibujadas como arcos, con trazos cortos en la ladera (como en los mapas antiguos).
    // Un abanico de rayos parecía un sol; un contorno cerrado se lee como "bulto".
    g.append(el("path", { d: "M-28 10 Q-15 -16 -2 10" }));
    g.append(el("path", { d: "M2 14 Q14 -8 26 14" }));
    for (const d of ["M-8 4 v5", "M-5 7 v3", "M18 7 v5", "M21 9.5 v3"]) g.append(el("path", { d }));
  } else if (terreno === "V") {
    for (const y of [-6, 6]) g.append(el("path", { d: `M-18 ${y} q6 -6 12 0 t12 0 t12 0` }));
  } else if (terreno === "A") {
    g.append(el("path", { d: "M-10 6 v-10 l10 -8 l10 8 v10 Z" }));
  } else if (terreno === "C") {
    g.append(el("path", { d: "M-16 10 v-18 h8 v6 h6 v-6 h8 v6 h6 v-6 h4 v18 Z" }));
  }
  return g;
}

export function renderMap(contenedor, mapa, alElegir) {
  const filas = mapa.filas.length;
  const columnas = mapa.filas[0].length;
  const ancho = SIZE * Math.sqrt(3) * (columnas + 0.5) + MARGEN * 2;
  const alto = SIZE * (1.5 * (filas - 1) + 2) + MARGEN * 2 + BANDA_RIO;

  const svg = el("svg", {
    viewBox: `0 0 ${ancho} ${alto}`,
    class: "mapa",
    role: "group",
    "aria-label": "Mapa del limes del Danubio",
  });

  // El Danubio, a lo largo del borde norte
  svg.append(el("rect", { class: "rio", x: 0, y: 0, width: ancho, height: BANDA_RIO + MARGEN }));
  svg.append(el("text", { class: "nombre-rio", x: ancho / 2, y: BANDA_RIO / 2 + MARGEN / 2 + 4, "text-anchor": "middle" }, ["DANUBIO"]));

  const mundo = el("g", { transform: `translate(${MARGEN + SIZE * Math.sqrt(3) / 2} ${MARGEN + BANDA_RIO + SIZE})` });
  svg.append(mundo);
  // Capa de fichas: encima de las casillas y debajo de los nombres
  const fichas = el("g", { class: "fichas", transform: mundo.getAttribute("transform") });
  svg.append(fichas);
  // Capa de nombres por encima de todas las casillas, para que ningún vecino los tape
  const etiquetas = el("g", { class: "etiquetas", transform: mundo.getAttribute("transform") });
  svg.append(etiquetas);

  mapa.filas.forEach((cadena, fila) => {
    [...cadena].forEach((terreno, col) => {
      const centro = hexToPixel({ fila, col }, SIZE);
      const puntos = hexCorners({ x: 0, y: 0 }, SIZE).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
      const lugar = mapa.lugares.find((l) => l.fila === fila && l.col === col);

      const g = el("g", {
        class: `casilla terreno-${terreno}`,
        transform: `translate(${centro.x.toFixed(1)} ${centro.y.toFixed(1)})`,
        tabindex: 0,
        role: "button",
        "data-fila": fila,
        "data-col": col,
        "aria-label": lugar ? `${lugar.nombre}, fila ${fila + 1}, columna ${col + 1}` : `Casilla fila ${fila + 1}, columna ${col + 1}`,
      });
      g.append(el("polygon", { points: puntos }));
      g.append(dibujarTrama(terreno));
      if (lugar) {
        etiquetas.append(el("text", {
          class: "nombre-lugar", x: centro.x.toFixed(1), y: (centro.y + 30).toFixed(1), "text-anchor": "middle",
        }, [lugar.nombre.toUpperCase()]));
      }

      const elegir = () => {
        svg.querySelectorAll(".casilla.elegida").forEach((c) => c.classList.remove("elegida"));
        g.classList.add("elegida");
        mundo.append(g); // se pinta la última para que su borde no quede tapado por los vecinos
        alElegir({ fila, col });
      };
      g.addEventListener("click", elegir);
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); elegir(); }
      });
      mundo.append(g);
    });
  });

  contenedor.replaceChildren(svg);
  return { fichas };
}

// Dibuja las legiones como fichas rectangulares (aspecto feo de la Fase 1).
// Se puede llamar cada vez que cambie el estado: vacía la capa y la rehace.
export function renderLegions(capa, legions) {
  capa.replaceChildren();
  for (const legion of legions) {
    const centro = hexToPixel(legion, SIZE);
    const texto = `${legion.short.toUpperCase()} · ${legion.strength}`;
    const ancho = texto.length * 5.6 + 10;
    // Algo por encima del centro, para no tapar el nombre del lugar
    const g = el("g", { class: "ficha", transform: `translate(${centro.x.toFixed(1)} ${(centro.y - 8).toFixed(1)})` });
    g.append(el("rect", { x: (-ancho / 2).toFixed(1), y: -9, width: ancho.toFixed(1), height: 18 }));
    g.append(el("text", { x: 0, y: 4, "text-anchor": "middle" }, [texto]));
    capa.append(g);
  }
}
