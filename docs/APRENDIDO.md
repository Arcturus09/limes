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
