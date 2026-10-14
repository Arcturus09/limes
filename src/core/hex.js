// Matemática de hexágonos con punta arriba (pointy-top).
// Referencia: https://www.redblobgames.com/grids/hexagons/
// Las casillas se guardan como { fila, col } ("offset", filas impares desplazadas
// a la derecha) y, para calcular, se pasan a coordenadas cúbicas { q, r, s }.

const SQRT3 = Math.sqrt(3);

// Fila/columna → cúbicas (variante "odd-r" de Red Blob Games)
export function offsetToCube({ fila, col }) {
  const q = col - (fila - (fila & 1)) / 2;
  const r = fila;
  return { q, r, s: -q - r };
}

export function cubeToOffset({ q, r }) {
  return { fila: r, col: q + (r - (r & 1)) / 2 };
}

// Las seis direcciones, en orden: este, noreste, noroeste, oeste, suroeste, sureste
const CUBE_DIRECTIONS = [
  { q: 1, r: 0, s: -1 }, { q: 1, r: -1, s: 0 }, { q: 0, r: -1, s: 1 },
  { q: -1, r: 0, s: 1 }, { q: -1, r: 1, s: 0 }, { q: 0, r: 1, s: -1 },
];

// Vecinos que existen dentro de un tablero de `filas` × `columnas`
export function neighbors(hex, filas, columnas) {
  const c = offsetToCube(hex);
  return CUBE_DIRECTIONS
    .map((d) => cubeToOffset({ q: c.q + d.q, r: c.r + d.r }))
    .filter((h) => h.fila >= 0 && h.fila < filas && h.col >= 0 && h.col < columnas);
}

// Número de pasos entre dos casillas
export function distance(a, b) {
  const ca = offsetToCube(a);
  const cb = offsetToCube(b);
  return Math.max(Math.abs(ca.q - cb.q), Math.abs(ca.r - cb.r), Math.abs(ca.s - cb.s));
}

// Centro de la casilla en píxeles; `size` es la distancia del centro a una esquina
export function hexToPixel({ fila, col }, size) {
  return {
    x: size * SQRT3 * (col + 0.5 * (fila & 1)),
    y: size * 1.5 * fila,
  };
}

// Las seis esquinas, empezando por la de arriba a la derecha de la punta superior
export function hexCorners(center, size) {
  return [0, 1, 2, 3, 4, 5].map((i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return { x: center.x + size * Math.cos(angle), y: center.y + size * Math.sin(angle) };
  });
}
