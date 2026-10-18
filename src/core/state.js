// El estado de la partida: un único objeto plano que se puede guardar con JSON.
// Aquí no hay DOM ni azar: con los mismos datos y la misma semilla, el mismo estado.

// `data` = { unidades, partida } (de src/data/)
export function createInitialState(seed, data) {
  const { unidades, partida } = data;
  return {
    seed,
    season: 0,
    resources: {
      grain: partida.recursosIniciales.grano,
      denarii: partida.recursosIniciales.denarios,
    },
    // Se copian los valores uno a uno para que el estado nunca comparta objetos con los datos
    legions: unidades.legionesIniciales.map((l, i) => ({
      id: i + 1,
      name: l.nombre,
      short: l.corto,
      fila: l.fila,
      col: l.col,
      strength: unidades.legion.fuerzaInicial,
      movesLeft: unidades.legion.movimiento, // se repone al empezar cada estación (paso 1.3)
      victories: 0,
    })),
  };
}

// Estación 0 = la primera del año inicial; cada vuelta completa suma un año
export function seasonLabel(season, partida) {
  const porAnyo = partida.estaciones.length;
  return {
    estacion: partida.estaciones[season % porAnyo],
    anyo: partida.anyoInicial + Math.floor(season / porAnyo),
  };
}
