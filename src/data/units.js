// Legiones: sus números y sus nombres. Lo edita Arturo (DISENO.md §6).
// Cómo cambiarlo:
//   - Para ajustar una legión, cambia los números de `legion` (los marcados con ⚖ en DISENO.md).
//   - Para cambiar las legiones del principio, edita `legionesIniciales`:
//     { nombre, corto, fila, col }. `corto` es lo que cabe en la ficha del mapa.
//     Las coordenadas empiezan en 0 (fila 0 es la de arriba, junto al Danubio).

export const unidades = {
  legion: {
    fuerzaInicial: 3,
    fuerzaMaxima: 4,
    movimiento: 2,
    mantenimiento: { grano: 2, denarios: 1 },
    reclutar: { denarios: 6, fuerza: 2 },
  },

  legionesIniciales: [
    { nombre: "Legio II Italica", corto: "II Italica", fila: 3, col: 4 },
    // ⚖ PROVISIONAL: los dos nombres siguen el patrón de §6, pero Arturo puede cambiarlos
    { nombre: "Numerus de Batavis", corto: "Num. Batavis", fila: 1, col: 0 },
    { nombre: "Cohors de Favianis", corto: "Coh. Favianis", fila: 1, col: 8 },
  ],

  // Nombres de las legiones reclutadas, en este orden y sin repetir (DISENO.md §6).
  // Añade más con { nombre, corto }; si se acaban, el juego usa "Legio nova N". ⚖ PROVISIONAL
  nombresReclutas: [
    { nombre: "Cohors de Lentia", corto: "Coh. Lentia" },
    { nombre: "Numerus de Lauriaco", corto: "Num. Lauriaco" },
    { nombre: "Cohors de Ioviaco", corto: "Coh. Ioviaco" },
    { nombre: "Numerus de Cetio", corto: "Num. Cetio" },
    { nombre: "Cohors de Boiodurum", corto: "Coh. Boiodurum" },
    { nombre: "Numerus de Comagenis", corto: "Num. Comagenis" },
  ],
};
