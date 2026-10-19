// Las oleadas de bárbaros (DISENO.md §7). Lo edita Arturo. ⚖
// Cómo añadir una: en `oleadas`, la clave es el número de estación (1 = la primera)
// y el valor, la lista de fuerzas de cada banda: `7: [3, 2]` son dos bandas, de 3 y de 2.
// Una estación sin clave no trae bandas. El vado de cada banda lo elige la semilla.

export const amenazas = {
  oleadas: {
    2: [2],
    3: [2],
    4: [3],
    5: [2, 2],
    6: [3],
    7: [3, 2],
    8: [4],
    9: [3, 3],
    10: [4, 2],
    11: [5],
    12: [4, 3],
    13: [5, 3],
    14: [6],
    15: [5, 4],
  },
};
