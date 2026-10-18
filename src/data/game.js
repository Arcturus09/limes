// Reglas generales de la partida: recursos del principio y calendario. Lo edita Arturo.
// Cómo cambiarlo: cambia los números y recarga la página.
// `estaciones` es el orden del año; tras la última vuelve la primera y suma un año.

export const partida = {
  recursosIniciales: { grano: 10, denarios: 10 },
  estaciones: ["Primavera", "Verano", "Otoño", "Invierno"],
  anyoInicial: 469,
  estacionesPrototipo: 15,

  // Puntos de movimiento que cuesta entrar en cada tipo de casilla (DISENO.md §4).
  // ⚖ PROVISIONAL: el diseño solo da llanura (1), bosque (2) y colina (2);
  // vado, aldea y ciudad cuestan 1 hasta que Arturo decida otra cosa.
  costeTerreno: { ".": 1, b: 2, c: 2, V: 1, A: 1, C: 1 },
};
