// Mapa del prototipo: 9 columnas × 6 filas. Lo edita Arturo.
// Cómo cambiarlo: cada fila de `filas` es una cadena de 9 letras, de oeste a este.
//   .  llanura    b  bosque    c  colina    V  vado    A  aldea    C  ciudad
// Para dar nombre a una aldea o ciudad, añade { fila, col, nombre } a `lugares`
// (las coordenadas empiezan en 0: fila 0 es la de arriba, junto al Danubio).

export const mapaPrototipo = {
  filas: [
    ".V..V..V.",
    "A.b.A.b.A",
    ".b.c..cb.",
    "....C....",
    "b.c...b.c",
    "...b.....",
  ],
  lugares: [
    { fila: 1, col: 0, nombre: "Batavis" },
    { fila: 1, col: 4, nombre: "Lentia" },
    { fila: 1, col: 8, nombre: "Favianis" },
    { fila: 3, col: 4, nombre: "Lauriacum" },
  ],
};
