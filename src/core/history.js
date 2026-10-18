// Pila para deshacer durante la fase del gobernador (CLAUDE.md §5).
// `past` guarda los estados anteriores y `present` el actual. Todo son funciones puras.

export function createHistory(state) {
  return { past: [], present: state };
}

// Anota un estado nuevo. Si la acción no cambió nada (mismo objeto), no se anota.
export function perform(history, next) {
  if (next === history.present) return history;
  return { past: [...history.past, history.present], present: next };
}

export function canUndo(history) {
  return history.past.length > 0;
}

export function undo(history) {
  if (!canUndo(history)) return history;
  return { past: history.past.slice(0, -1), present: history.past[history.past.length - 1] };
}

// Al cerrar la estación ya no hay vuelta atrás: se olvida el pasado
export function clearHistory(history) {
  return { past: [], present: history.present };
}
