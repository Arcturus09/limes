// Atajos de teclado (DISENO.md §13): Z deshace, Esc deselecciona y Espacio cierra la estación.
export function bindShortcuts({ undo, deselect, closeSeason }) {
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "z" || e.key === "Z") undo();
    else if (e.key === "Escape") deselect();
    else if (e.key === " ") {
      // Con un botón enfocado, el Espacio ya lo pulsa el propio navegador
      if (e.target.closest && e.target.closest("button")) return;
      e.preventDefault(); // evita que la página baje
      closeSeason();
    }
  });
}
