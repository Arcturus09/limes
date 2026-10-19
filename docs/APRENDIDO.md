# Aprendido

Un concepto por sesión, en 3 líneas.

## Variables CSS (`theme.css`)
Son como los botes de pintura con etiqueta de un taller: defines una vez `--purpura: #5B1A3A` y en el resto de archivos pides «púrpura» con `var(--purpura)`.
Si un día cambias el tono, lo cambias en un solo sitio y todo el juego se repinta. Por eso en Limes no se escriben colores sueltos fuera de `theme.css`.

## Módulos ES (`import` / `export`)
Cada archivo `.js` es como un cajón con etiqueta: lo que marcas con `export` queda a la vista, y otro archivo lo coge con `import`. Lo demás queda guardado dentro.
Así `render-map.js` pide `hexToPixel` a `hex.js` sin copiarlo, y si lo cambias en un sitio cambia para todos.

## Remoto y push (git)
Tu carpeta es tu cuaderno; GitHub es una copia en la nube. `git remote add origin …` apunta la dirección de esa copia y `git push` sube los commits.
GitHub Pages lee esa copia y la sirve como web, así que cada push actualiza el enlace público en un par de minutos.

## Un único objeto de estado (`state.js`)
Toda la partida (estación, grano, denarios, legiones) cabe en un solo objeto, como una foto del tablero tomada desde arriba.
Con esa foto puedes guardar (convertirla en texto con JSON), deshacer (volver a la foto anterior) y repetir una partida. Por eso el estado no lleva funciones ni clases: solo datos.

## Función pura y deshacer (`actions.js`, `history.js`)
Una función pura es como una fotocopiadora con retoque: le das el estado, te devuelve **otra copia** con el cambio hecho y la original queda intacta.
Por eso deshacer es gratis: basta con guardar las copias viejas en una pila y volver a la anterior. Si la función modificara la original, no habría a qué volver.

## Datos separados de reglas (`game.js` y `turn.js`)
`turn.js` es la cocina y `game.js` es la receta: la cocina sabe *cómo* cobrar ingresos, pero cuánto da una aldea (+2 grano) está escrito en `game.js`.
Así puedes cambiar un número sin tocar ni una regla, y el código nunca lleva números sueltos escondidos.


## Generador con semilla (`rng.js`)
Es un dado trucado de forma honesta: la semilla es su posición en una lista larguísima de números que parecen azar pero están fijados de antemano.
Con la misma semilla salen siempre los mismos vados, así que una partida se puede repetir y los tests pueden comprobar resultados exactos. Cada tirada devuelve también la semilla siguiente, y el estado la guarda.
