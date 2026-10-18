// Atajos de teclado (DISENO.md §13): Z deshace y Esc deselecciona.
// El Espacio para cerrar la estación llega en el paso 1.3.
export function bindShortcuts({ undo, deselect }) {
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "z" || e.key === "Z") undo();
    else if (e.key === "Escape") deselect();
  });
}
