// Combate determinista (DISENO.md §6): sin dados. La previsión y la resolución son la
// MISMA función (resolveThreats): la previsión solo tira el estado resultante y enseña el informe.
// Así lo que se anuncia no puede mentir.

const mismaCasilla = (a, b) => a.fila === b.fila && a.col === b.col;

// Pérdidas: de una en una, empezando por la legión con más fuerza (empate: la de id menor),
// para no aniquilar una sola de golpe. No toca el estado.
function distributeLosses(legions, total) {
  const fuerza = new Map(legions.map((l) => [l.id, l.strength]));
  const perdido = new Map(legions.map((l) => [l.id, 0]));
  for (let i = 0; i < total; i++) {
    const candidatas = legions.filter((l) => fuerza.get(l.id) > 0);
    if (candidatas.length === 0) break;
    candidatas.sort((a, b) => fuerza.get(b.id) - fuerza.get(a.id) || a.id - b.id);
    const id = candidatas[0].id;
    fuerza.set(id, fuerza.get(id) - 1);
    perdido.set(id, perdido.get(id) + 1);
  }
  return legions
    .filter((l) => perdido.get(l.id) > 0)
    .map((l) => ({ legionId: l.id, name: l.name, amount: perdido.get(l.id) }));
}

// Un combate en una casilla. Sin legiones allí no hay combate (la banda pasa de largo).
function fight(state, hex, strength, data) {
  const legiones = state.legions.filter((l) => mismaCasilla(l, hex));
  if (legiones.length === 0) return { hex, fought: false, strength, bandLeft: strength };

  const terreno = data.mapa.filas[hex.fila][hex.col];
  const defensa = legiones.reduce((suma, l) => suma + l.strength, 0) + (data.partida.bonoDefensa[terreno] ?? 0);
  const victoria = defensa >= strength;
  // Victoria: las legiones pierden ⌊F/2⌋. Derrota: ⌈F/2⌉ y la banda pierde D de fuerza.
  const total = victoria ? Math.floor(strength / 2) : Math.ceil(strength / 2);
  return {
    hex,
    fought: true,
    defense: defensa,
    strength,
    victory: victoria,
    bandLeft: victoria ? 0 : strength - defensa,
    losses: distributeLosses(legiones, total),
    winners: victoria ? legiones.map((l) => l.id) : [],
  };
}

// Aplica un combate al estado (ya clonado): resta pérdidas, cuenta victorias y retira a las caídas.
function applyFight(state, result, report) {
  if (!result.fought) return;
  for (const p of result.losses) state.legions.find((l) => l.id === p.legionId).strength -= p.amount;
  for (const id of result.winners) state.legions.find((l) => l.id === id).victories += 1;
  for (const l of state.legions) if (l.strength <= 0) report.fallen.push(l.name);
  state.legions = state.legions.filter((l) => l.strength > 0);
}

// Resuelve todas las bandas de la estación, de oeste a este (DISENO.md §3).
// Devuelve { state, reports }: un informe por banda, en el orden de resolución.
export function resolveThreats(state, data) {
  const next = structuredClone(state);
  const orden = [...next.threats].sort((a, b) => a.vado.col - b.vado.col || a.id - b.id);
  const reports = [];

  for (const banda of orden) {
    const report = {
      id: banda.id,
      strength: banda.strength,
      vado: banda.vado,
      objetivo: banda.objetivo,
      steps: [],
      fallen: [],
      looted: false,
    };
    // 1. El vado; 2. el objetivo si la banda sobrevive. Sin legiones en medio, nadie la para.
    let fuerza = banda.strength;
    for (const hex of [banda.vado, banda.objetivo]) {
      const result = fight(next, hex, fuerza, data);
      report.steps.push(result);
      applyFight(next, result, report);
      fuerza = result.bandLeft;
      if (fuerza <= 0) break;
    }
    if (fuerza > 0) {
      report.looted = true;
      if (!next.looted.some((h) => mismaCasilla(h, banda.objetivo))) {
        next.looted.push({ fila: banda.objetivo.fila, col: banda.objetivo.col, seasonsLeft: data.partida.saqueo.estaciones });
      }
    }
    reports.push(report);
  }
  next.threats = [];
  return { state: next, reports };
}

// Previsión para la interfaz: lo que pasaría si se cerrara la estación ahora mismo.
export function previewThreats(state, data) {
  return resolveThreats(state, data).reports;
}
