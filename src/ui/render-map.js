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
    // Dos lomas anchas que se solapan. La de delante lleva relleno del color del terreno
    // (clase "relleno") para tapar el arco de la de atrás: así no se dibuja lo que queda oculto.
    g.append(el("path", { d: "M-32 12 Q-14 -18 6 12" }));
    for (const d of ["M-12 0 v5", "M-8 2 v5", "M-4 4 v4"]) g.append(el("path", { d }));
    g.append(el("path", { class: "relleno", d: "M-6 14 Q14 -10 32 14 Z" }));
    g.append(el("path", { d: "M-6 14 Q14 -10 32 14" }));
    for (const d of ["M18 6 v5", "M22 8 v5", "M26 10.5 v3"]) g.append(el("path", { d }));
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
  // Capa de amenazas: flechas y fichas de bandas, encima de las legiones
  const amenazas = el("g", { class: "amenazas", transform: mundo.getAttribute("transform") });
  svg.append(amenazas);
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

      const elegir = () => alElegir({ fila, col });
      g.addEventListener("click", elegir);
      g.addEventListener("keydown", (e) => {
        // Solo Enter: el Espacio cierra la estación (DISENO.md §13)
        if (e.key === "Enter") { e.preventDefault(); elegir(); }
      });
      mundo.append(g);
    });
  });

  contenedor.replaceChildren(svg);

  // Marca la casilla elegida y las alcanzables. Lo llama main.js tras cada cambio,
  // así el mapa se dibuja una sola vez y el foco del teclado no se pierde.
  function marcar(elegida, alcanzables = [], saqueadas = []) {
    const clave = (h) => `${h.fila},${h.col}`;
    const alcanzablesSet = new Set(alcanzables.map(clave));
    const saqueadasSet = new Set(saqueadas.map(clave));
    const casillas = [...svg.querySelectorAll(".casilla")];
    const foco = document.activeElement;
    for (const c of casillas) {
      const k = clave({ fila: c.dataset.fila, col: c.dataset.col });
      c.classList.toggle("alcanzable", alcanzablesSet.has(k));
      c.classList.toggle("saqueada", saqueadasSet.has(k));
      c.classList.toggle("elegida", Boolean(elegida) && k === clave(elegida));
    }
    // Se pintan las últimas para que sus bordes no queden tapados por los vecinos
    for (const c of casillas.filter((x) => x.classList.contains("alcanzable"))) mundo.append(c);
    for (const c of casillas.filter((x) => x.classList.contains("elegida"))) mundo.append(c);
    if (foco && foco.classList && foco.classList.contains("casilla")) foco.focus(); // mover el nodo quita el foco
  }

  return { fichas, amenazas, marcar };
}

// Dibuja las legiones como fichas rectangulares (aspecto feo de la Fase 1).
// Se puede llamar cada vez que cambie el estado: vacía la capa y la rehace.
export function renderLegions(capa, legions, elegidaId = null) {
  capa.replaceChildren();
  for (const legion of legions) {
    const centro = hexToPixel(legion, SIZE);
    const texto = `${legion.short.toUpperCase()} · ${legion.strength}`;
    const ancho = texto.length * 5.6 + 10;
    // Algo por encima del centro, para no tapar el nombre del lugar
    const g = el("g", { class: legion.id === elegidaId ? "ficha elegida" : "ficha", transform: `translate(${centro.x.toFixed(1)} ${(centro.y - 8).toFixed(1)})` });
    g.append(el("rect", { x: (-ancho / 2).toFixed(1), y: -9, width: ancho.toFixed(1), height: 18 }));
    g.append(el("text", { x: 0, y: 4, "text-anchor": "middle" }, [texto]));
    capa.append(g);
  }
}

// Dibuja cada banda anunciada: ficha en el Danubio frente a su vado y flecha curva
// discontinua hasta el objetivo. Como las legiones, se rehace entera cada vez.
export function renderThreats(capa, threats, onHover = () => {}) {
  capa.replaceChildren();
  for (const t of threats) {
    const vado = hexToPixel(t.vado, SIZE);
    const meta = hexToPixel(t.objetivo, SIZE);
    const ini = { x: vado.x, y: -SIZE - 26 }; // en la franja del río, sobre el vado
    // La flecha acaba antes del centro para no tapar el nombre ni la trama del asentamiento
    const dx = meta.x - ini.x;
    const dy = meta.y - ini.y;
    const largo = Math.hypot(dx, dy) || 1;
    const fin = { x: meta.x - (dx / largo) * 16, y: meta.y - (dy / largo) * 16 };
    const ctrl = { x: (ini.x + fin.x) / 2 + 22 * Math.sign(dy || 1), y: (ini.y + fin.y) / 2 };
    // Dirección de llegada (del punto de control al final) para orientar la punta
    const ax = fin.x - ctrl.x;
    const ay = fin.y - ctrl.y;
    const al = Math.hypot(ax, ay) || 1;
    const u = { x: ax / al, y: ay / al };
    const punta = [
      `${fin.x.toFixed(1)},${fin.y.toFixed(1)}`,
      `${(fin.x - u.x * 11 - u.y * 6).toFixed(1)},${(fin.y - u.y * 11 + u.x * 6).toFixed(1)}`,
      `${(fin.x - u.x * 11 + u.y * 6).toFixed(1)},${(fin.y - u.y * 11 - u.x * 6).toFixed(1)}`,
    ].join(" ");

    const g = el("g", { class: "amenaza" });
    g.append(el("path", { class: "flecha", d: `M${ini.x.toFixed(1)} ${(ini.y + 10).toFixed(1)} Q${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${fin.x.toFixed(1)} ${fin.y.toFixed(1)}` }));
    g.append(el("polygon", { class: "punta", points: punta }));
    const ficha = el("g", { class: "banda", tabindex: 0, role: "button", "aria-label": `Banda de fuerza ${t.strength}: ver resultado previsto`, transform: `translate(${ini.x.toFixed(1)} ${ini.y.toFixed(1)})` });
    ficha.append(el("rect", { x: -20, y: -10, width: 40, height: 20 }));
    ficha.append(el("text", { x: 0, y: 4.5, "text-anchor": "middle" }, [String(t.strength)]));
    // Pasar el ratón (o enfocar con el teclado) enseña el resultado previsto
    ficha.addEventListener("mouseenter", () => onHover(t.id));
    ficha.addEventListener("focus", () => onHover(t.id));
    ficha.addEventListener("mouseleave", () => onHover(null));
    ficha.addEventListener("blur", () => onHover(null));
    g.append(ficha);
    capa.append(g);
  }
}
