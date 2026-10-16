# CLAUDE.md — Limes

> Documento de contexto para Claude Code. Léelo entero al empezar cada sesión, junto con la §14 (Estado actual).
> El juego en sí (mecánicas, números y estética) está en `docs/DISENO.md`. **Lee solo las secciones que necesite la tarea**: no hace falta leerlo entero cada vez.
> Si una petición choca con algo de estos dos documentos, avisa antes de actuar.

---

## 1. Qué es Limes

Un 4X ligero de tablero para navegador. Eres el último gobernador romano del Danubio (469–476) y tienes que equilibrar la lealtad de tu gente con el favor de un imperio que se muere. Hay un mapa pequeño de hexágonos, amenazas anunciadas, combate sin dados, cartas de Roma con dilemas y una crónica que se escribe sola. Partidas de unos 40 minutos.

Inspiración: *Into the Breach* (amenazas anunciadas y resultado previsto), *Papers, Please* (los dilemas como documentos), *FTL* (cada partida es una historia) y *Slay the Spire* (partidas cortas y rejugables).

---

## 2. Contexto

- **Autor:** Arturo. Es un **proyecto personal**, sin plazos, sin jurado y sin memoria técnica.
- **Nivel:** sabe poco de programación y **tiene poco tiempo**. Quiere aprender, pero sin que el proyecto se eternice.
- **Su papel:** director de diseño, guionista (escribe edictos, eventos y la crónica) y probador. Juega mucho a estrategia y tácticas (XCOM, Civilization, Total War, Crusader Kings) y su opinión de jugador manda.
- **Objetivo:** un juego terminado, divertido y publicado en GitHub Pages que se pueda enseñar con un enlace.

---

## 3. Quién hace qué (modelos)

| Trabajo | Dónde |
|---|---|
| Diseño, mecánicas nuevas, cambios de este documento o de `DISENO.md`, arquitectura, revisión al cierre de cada fase, análisis de equilibrio | **Opus**, en el chat de diseño de claude.ai |
| Programar los pasos de la hoja de ruta, tests, arreglos, ajustes visuales | **Sonnet**, en Claude Code (este documento) |

**Si eres Sonnet y te piden algo de la primera fila**, no lo hagas: dile a Arturo en una frase que conviene llevarlo al chat de diseño o cambiar a Opus (`/model`), y por qué.
**Si un error no se arregla en dos intentos,** para, explica lo que has probado y sugiere pasarlo a Opus. No sigas probando a ciegas: gasta tiempo y tokens.

---

## 4. Decisiones técnicas (cerradas)

| Tema | Decisión | Motivo |
|---|---|---|
| Plataforma | Navegador de escritorio y iPad en horizontal (mínimo 1024 × 700) | Un enlace basta para jugar |
| Lenguaje | **JavaScript moderno (módulos ES), HTML y CSS. Sin TypeScript** | Nada que compilar; Arturo lo lee directamente |
| Framework | **Ninguno.** Sin React, sin Phaser, sin motor | Todo el código se entiende y es suyo |
| Dependencias | **Ninguna en el juego.** No añadir paquetes sin permiso explícito de Arturo | — |
| Herramienta de construcción | **Ninguna.** Los archivos se sirven tal cual | — |
| Servidor local | `python3 -m http.server 8000` desde la raíz (los módulos ES no funcionan con `file://`) | Viene con macOS |
| Dibujo del mapa | **SVG** generado desde JavaScript | Clicable, nítido y estilable con CSS |
| Tests y simulador | **Node.js** con su ejecutor de tests integrado (`node --test`), sin librerías | Comprueba las reglas sin abrir el navegador |
| Datos del juego | Módulos `.js` en `src/data/` (no JSON): admiten comentarios y comas finales | Arturo los edita sin romperlos |
| Guardado | `localStorage`, siempre dentro de `try/catch`. El juego funciona aunque falle | — |
| Fuentes | Google Fonts (Cinzel y Alegreya) en la v1; alojarlas en el repositorio en la Fase 4 | — |
| Idioma | Interfaz y textos en español de España | — |
| Publicación | GitHub Pages desde la rama `main` | Gratis; Arturo ya lo usó en otro proyecto |
| Control de versiones | Git; un commit por paso | — |

---

## 5. Arquitectura

Tres capas, igual que Acies:

1. **Núcleo** (`src/core/`): las reglas del juego en funciones puras. **Sin DOM, sin `window`, sin `localStorage` y sin `Math.random`.** Reciben un estado y una acción y devuelven un estado nuevo. Por eso se puede testear y simular miles de partidas.
2. **Datos** (`src/data/`): el contenido (mapas, oleadas, edictos, eventos, plantillas de la crónica, finales). Solo datos, sin lógica. **Es el terreno de Arturo:** las claves van en español y cada archivo empieza con un comentario que explica cómo añadir una entrada.
3. **Interfaz** (`src/ui/`): dibuja el estado y convierte los clics en acciones. Sin reglas del juego dentro.

`src/main.js` lo une: crea el estado inicial, guarda el historial para deshacer, escucha las acciones y vuelve a dibujar.

### Carpetas

```
Limes/
├── CLAUDE.md
├── README.md                 ← cómo jugar en local y cómo publicar (2 párrafos)
├── index.html
├── docs/
│   ├── DISENO.md
│   └── APRENDIDO.md          ← conceptos para Arturo (ver §9)
├── src/
│   ├── main.js
│   ├── core/
│   │   ├── state.js          createInitialState(seed, data)
│   │   ├── actions.js        applyAction(state, action) → nuevo estado
│   │   ├── turn.js           endSeason(state): combates, saqueos, crónica, amenazas
│   │   ├── combat.js         previewCombat() y resolveCombat(), la misma función para ambos
│   │   ├── threats.js        elegir vado y objetivo, anunciar
│   │   ├── documents.js      elegir edicto o evento, aplicar efectos, consecuencias diferidas
│   │   ├── endings.js        comprobar finales
│   │   ├── hex.js            matemática de hexágonos (Red Blob Games)
│   │   └── rng.js            generador con semilla (mulberry32); el estado guarda la semilla actual
│   ├── data/
│   │   ├── maps/prototype.js
│   │   ├── units.js
│   │   ├── threats.js
│   │   ├── edicts.js
│   │   ├── events.js
│   │   ├── chronicle.js
│   │   └── endings.js
│   └── ui/
│       ├── theme.css
│       ├── layout.css
│       ├── render-map.js
│       ├── render-hud.js
│       ├── render-document.js
│       ├── render-chronicle.js
│       ├── icons.js
│       └── input.js
├── tests/                    *.test.js para node --test
└── tools/
    └── simulate.js           simulador de equilibrio (Fase 3)
```

### Reglas del núcleo
- **Un solo objeto de estado**, serializable con `JSON.stringify` (sin clases, sin funciones y sin `Map` dentro).
- **Nunca se muta el estado**: cada acción devuelve una copia (`structuredClone` vale: el estado es pequeño).
- **Todo el azar sale de `rng.js`** con la semilla guardada en el estado. Con la misma semilla y las mismas acciones, la misma partida.
- **La previsión y la resolución del combate usan la misma función.** Si la previsión miente, el pilar 2 del diseño se rompe.
- **Deshacer:** `main.js` guarda los estados de la fase del gobernador en una pila; al cerrar la estación se vacía.

---

## 6. Código

- **Claro antes que ingenioso.** La forma más legible, aunque ocupe más líneas.
- Nombres de funciones y variables **en inglés** (salvo las claves de `src/data/`, que van en español). **Comentarios en español** que explican el **porqué**.
- Archivos pequeños (idealmente menos de 200 líneas) y una responsabilidad por archivo.
- `const` por defecto, `let` cuando haga falta y nunca `var`. Funciones normales mejor que clases.
- Nada de números mágicos en el código: los valores ajustables viven en `src/data/` (los marcados con ⚖ en `DISENO.md`).
- Cada regla del núcleo tiene al menos un test. **Tests obligatorios** en: combate (victoria, derrota, empate D = F, reparto de pérdidas), elección de objetivo, ingresos y mantenimiento, hambre, deshacer, efectos de edictos, consecuencias diferidas y finales.
- Accesibilidad básica: todo lo clicable también funciona con teclado, contraste suficiente y `prefers-reduced-motion`.

## 7. Estética (resumen; el detalle está en `DISENO.md` §12)

- Concepto: el expediente del gobernador. Mapa de pergamino, fichas de tablero, cartas lacradas y crónica.
- **Usa solo los tokens de color de `theme.css`.** No inventes colores.
- Cinzel para inscripciones y Alegreya para el resto.
- Iconos SVG propios con el mismo grosor de trazo, en `icons.js`.
- **Prohibido:** imágenes generadas, *clipart*, emojis, degradados brillantes, bordes de aplicación móvil y rojo fuera de las amenazas.
- Antes de dar por terminado un paso visual, **ábrelo en el navegador y míralo** (captura de pantalla) a 1440 × 900 y a 1024 × 768.

---

## 8. Protocolo de cada sesión

1. Lee este archivo y la §14. Di en una frase qué vas a hacer.
2. **Un paso de la hoja de ruta cada vez** (§12). Si el paso toca la arquitectura o una decisión cerrada, propón un plan de 3 a 5 puntos y espera el visto bueno.
3. Tras cada cambio: `node --test`, abre el juego en local y comprueba que no hay errores en la consola.
4. Al terminar, en español y en breve:
   - qué has hecho y **cómo probarlo** ("abre el juego, mueve la legión de Lentia al vado y pasa la estación")
   - el concepto del día (ver §9)
   - un mensaje de commit en español y en imperativo ("Añade el combate determinista"), y haz el commit
5. Actualiza la §14 (Estado actual).

## 9. Modo aprendiz ligero

Arturo quiere aprender **sin que le cueste tardes enteras**.
- **Un concepto por sesión como máximo**, en 3 líneas y con una analogía, añadido a `docs/APRENDIDO.md`. Elige el más útil de lo que se ha tocado (por ejemplo, qué es un módulo, qué es una función pura o por qué un generador con semilla).
- **Lo que sí toca Arturo:** los archivos de `src/data/`. Escribe edictos y eventos y cambia números. Cuando un paso cree un archivo de datos, explícale en 2 frases cómo añadir una entrada nueva.
- **Retos opcionales de 2 minutos** cuando encajen: *"Cambia la fuerza de la banda de la estación 4 a 5 y juega. ¿Qué ha cambiado?"*. Son opcionales: nunca bloquean el avance.
- **Ninguna pregunta es básica.** Respóndelas sin condescendencia.

## 10. Ahorro (tokens y tiempo)

- No releas archivos que ya tienes en contexto. Busca con `grep` antes de abrir archivos enteros.
- Lee de `DISENO.md` solo la sección del paso en curso.
- Si la conversación se alarga, sugiere a Arturo `/clear` al cerrar un paso: la §14 guarda lo necesario para seguir.
- No generes texto de relleno ni resúmenes largos. Breve y concreto.

## 11. Límites

- **No cambies decisiones** de este documento ni de `DISENO.md` por tu cuenta. Si crees que una es un error, dilo, propón la alternativa y, si Arturo la acepta, anótala en la §13.
- No inventes mecánicas ni contenido que no estén en `DISENO.md`. Si falta un dato para programar, pregunta o usa un valor provisional marcado con `// ⚖ PROVISIONAL` y avisa.
- No añadas dependencias, servicios externos, analítica ni cuentas.
- No borres archivos sin confirmación.
- No hagas `git push` sin que Arturo lo pida.

---

## 12. Hoja de ruta

Cada paso debería caber en una sesión corta. Al cerrar cada fase: **revisión con Opus** en el chat de diseño (Arturo juega, cuenta qué siente y se ajusta el diseño).

### Fase 0: Montaje
- **0.1** Estructura de carpetas, `index.html` vacío con las fuentes y los tokens de `theme.css`, `README.md`, `.gitignore`, `git init` y primer commit. Comprobar `node -v` (si falta: `brew install node`).
- **0.2** `hex.js` con tests y `render-map.js`, que dibuja el mapa del prototipo en SVG con terrenos básicos y nombres. Clic en una casilla = queda seleccionada.
- **0.3** Repositorio en GitHub (`Arcturus09/limes`) y GitHub Pages activado. Comprobar que el enlace público abre el mapa. (Si `gh` no está instalado, guía a Arturo por la web de GitHub en 4 pasos.)

**Hecho cuando:** hay un enlace público que muestra el mapa de pergamino.

### Fase 1: Prototipo feo ("¿el bucle es divertido?")
Aquí vale el aspecto feo: fichas como cuadrados con texto. **No pulir.**
- **1.1** Estado inicial, recursos, legiones con su nombre en el mapa y barra superior.
- **1.2** Mover legiones con coste de terreno, resaltado de casillas alcanzables y deshacer.
- **1.3** Cerrar la estación: ingresos, mantenimiento, hambre y cambio de estación.
- **1.4** Amenazas: oleadas de `threats.js`, vado elegido con semilla, objetivo y flechas.
- **1.5** Combate determinista con **previsión al pasar el ratón**, saqueos y tests completos del combate.
- **1.6** Reclutar (y fortificar si cabe). Fin de partida: victoria a las 15 estaciones, derrota si cae Lauriacum. Pantalla final mínima.

**Hecho cuando:** Arturo juega 3 partidas seguidas y puede decir si el bucle engancha. → **Revisión con Opus.**

### Fase 2: El alma
- **2.1** Barras de Pueblo y Favor, presión fiscal, decaimiento y umbrales.
- **2.2** Sistema de documentos: esquema de `edicts.js` y `events.js`, carta en pantalla y aplicación de efectos.
- **2.3** Consecuencias diferidas y banderas.
- **2.4** Los 6 edictos y eventos de ejemplo de `DISENO.md` §8.
- **2.5** La crónica (plantillas y columna).
- **2.6** Finales: los anticipados, la destitución y el modo rebelde. Lápida sencilla.
- **2.7** Veteranía de las legiones (`DISENO.md` §6), su despedida en la crónica y la elección de qué legiones se entregan en un edicto.

**Hecho cuando:** una partida de 15 estaciones produce dilemas que a Arturo le cuesta decidir. → **Revisión con Opus.**

### Fase 3: Contenido y rejugabilidad
- **3.1** `tools/simulate.js`: bots (siempre obedece, nunca obedece, equilibrado, aleatorio) juegan 1000 partidas por semilla; informe de finales, estación media de derrota y opciones nunca elegidas. → **Análisis con Opus.**
- **3.2** Partida completa de 32 estaciones, fechas reales y el último documento de 476.
- **3.3** Invierno y río helado.
- **3.4** Mapas generados con semilla.
- **3.5** *Foederati*, tributo a los bárbaros y fuertes, si no existen ya.
- **3.6** Más edictos y eventos (los escribe Arturo y se revisan con Opus), con un objetivo de 25 a 30.
- **3.7** La estética completa de `DISENO.md` §12: pergamino, tramas, fichas, sellos, flechas y lápida.

### Fase 4: Pulido y publicación
- **4.1** Primera partida guiada: el primer edicto enseña a jugar, sin tutorial aparte.
- **4.2** Muerte permanente: un único guardado automático al empezar cada estación (si se recarga la página, se vuelve a ese punto) y pantalla de inicio con el nombre del gobernador.
- **4.3** Accesibilidad y teclado.
- **4.4** Sonido mínimo (opcional) y fuentes alojadas en el repositorio.
- **4.5** Crónica descargable y página de créditos.

---

## 13. Registro de decisiones

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-10-14 | Web pura sin framework ni dependencias, con SVG para el mapa | Aprender sin capas mágicas; publicar con un enlace |
| 2026-10-14 | Datos en módulos `.js` con claves en español | Arturo los edita con comentarios y sin romper la sintaxis |
| 2026-10-14 | Opus para el diseño y Sonnet para el código | Calidad donde importa y menos gasto donde no |

---

## 14. Estado actual

- **Fase:** 0, terminada. Falta la revisión de fase solo si Arturo quiere; el criterio «enlace público con el mapa» se cumple.
- **Último paso terminado:** 0.3. Repositorio `Arcturus09/limes`, remoto `origin` y Pages activo: <https://arcturus09.github.io/limes/>. `gh` no está instalado: el push lo hace Arturo desde su terminal.
- **Siguiente paso:** 1.1 (estado inicial, recursos, legiones en el mapa y barra superior).
- **Pendiente de Arturo:** nada que bloquee. Preguntas abiertas en `DISENO.md` §15.
