# DISEÑO.md — Limes

> Documento de diseño del juego: qué es, cómo se juega, qué números usa y cómo se ve.
> Lo escribe y lo cambia el chat de diseño (Opus). Claude Code lo **lee**, pero no cambia decisiones por su cuenta (ver `CLAUDE.md` §11).
> Los números marcados con ⚖ son provisionales: los ajustará el simulador de equilibrio (Fase 3).

---

## 1. La idea en una frase

**Eres el último gobernador romano de una provincia del Danubio entre los años 469 y 476. Roma te exige y tu gente te necesita, y no puedes contentar a los dos.**

Es un 4X ligero de tablero: un mapa pequeño de hexágonos, partidas de unos 40 minutos y pocas decisiones por turno, pero todas con peso.

### Tres pilares (todo lo que se añada debe servir a alguno)

1. **Decisiones que pesan, no clics que rellenan.** Pocas acciones por turno. Si una decisión es siempre obvia, sobra.
2. **Sin azar que te arruine.** Las amenazas se anuncian antes de llegar y el resultado de un combate se ve antes de confirmarlo, como en *Into the Breach*. El azar está en *qué* pasa (qué edicto llega, por dónde cruzan), nunca en *si te sale la tirada*.
3. **Cada partida cuenta una historia.** La crónica de la provincia se escribe sola con lo que haces y termina en una lápida. Como en *FTL*, lo que recuerdas es lo que te pasó.

### La pregunta de fondo

*¿A quién te debes?* ¿A un imperio que se está muriendo y que aún firma órdenes, o a la gente que tienes delante? El juego no responde: cada final premia y castiga algo distinto. Su modelo es *Papers, Please*: la reflexión no sale de un diálogo profundo, sino de que la mecánica te hace cómplice.

---

## 2. Ambientación

- **Lugar:** Nórico Ribereño, la orilla sur del Danubio, entre las actuales Passau y Viena. La geografía del mapa está **inspirada**, no calcada.
- **Época:** de la primavera de 469 al invierno de 476. Son **32 turnos = 8 años × 4 estaciones**.
- **Tú:** el *dux* de la provincia, con el mando militar y el civil a la vez (en la realidad estaban separados; aquí se simplifica a propósito).
- **Roma:** en realidad, la corte de **Rávena** y quien mande allí ese año. Las órdenes llegan como cartas selladas.
- **Tu gente:** los provinciales romanos de las ciudades y aldeas del *limes*.
- **Los de enfrente:** pueblos germánicos al norte del río (rugios, alamanes, turingios, hérulos). En la Fase 1 son simplemente "bandas".

### Anclas históricas que el juego usa (verificadas a grandes rasgos; el detalle, en la crónica de cada evento)

| Hecho | Uso en el juego |
|---|---|
| La **Legio II Italica** tenía su base en **Lauriacum** (*Notitia Dignitatum*) | Tu legión inicial |
| En **472**, Ricimero y el emperador Antemio se enfrentaron en Italia; Roma fue saqueada y Antemio murió | Evento "Dos cartas": los dos te piden tus tropas |
| Los **rugios** vivían justo enfrente de **Favianis** y comerciaban con la orilla romana | Vecinos con los que se puede negociar (Fase 3) |
| Eugippio, en la *Vida de san Severino*, cuenta que la guarnición de **Batavis** envió hombres a Italia a cobrar la última paga y que sus cuerpos bajaron por el río | Evento "La última paga" |
| Según la tradición, en la **Nochevieja de 406** los bárbaros cruzaron el Rin helado | Mecánica de invierno: el río helado se cruza por cualquier sitio |
| **Siagrio**, un general romano de la Galia, gobernó por su cuenta como "rey de los romanos" hasta 486 | Final "Rex" |
| En **septiembre de 476**, Odoacro depuso a Rómulo Augústulo | Penúltimo turno: ya no hay emperador en Occidente |

> **Decidido:** personajes, lugares y hechos reales con su nombre. Todo dato histórico que aparezca en un texto se verifica antes de darlo por bueno (en el chat de diseño), y si algo se inventa, se nota que es invención (por ejemplo, el gobernador).

---

## 3. El turno (una estación)

```
1. INICIO DE ESTACIÓN
   - Ingresos de los asentamientos no saqueados.
   - Mantenimiento de las legiones (grano y denarios).
   - Efectos de las barras (decaimiento, presión fiscal).
   - Consecuencias diferidas que vencen este turno.
   - Si toca: llega un EDICTO o un EVENTO (documento que hay que responder).
2. FASE DEL GOBERNADOR (sin azar; todo se puede deshacer hasta confirmar)
   - Ves las amenazas anunciadas: flechas desde un vado hasta su objetivo, con su fuerza.
   - Mueves legiones, reclutas, construyes, ajustas impuestos.
   - Al pasar el ratón por una amenaza ves el RESULTADO PREVISTO.
3. FIN DE ESTACIÓN (pulsas "Cerrar la estación")
   - Las bandas cruzan y se resuelven los combates en orden de izquierda a derecha.
   - Saqueos.
   - Se escribe la crónica de la estación.
   - Se anuncian las amenazas de la estación siguiente.
   - Se comprueban las condiciones de fin.
```

**Deshacer:** durante la fase del gobernador todo se puede deshacer sin límite, porque todavía no ha ocurrido nada. Al cerrar la estación ya no hay vuelta atrás.

---

## 4. El mapa

- **Hexágonos con punta arriba** (*pointy-top*), en filas horizontales. El Danubio corre por el borde norte.
- **Prototipo:** 9 columnas × 6 filas = 54 casillas, con un mapa fijo.
- **Fase 3:** mapas generados a partir de una semilla (misma semilla, mismo mapa), sobre el mismo tamaño.
- Referencia técnica obligatoria para la matemática de hexágonos: <https://www.redblobgames.com/grids/hexagons/>.

### Terrenos

| Símbolo | Terreno | Efecto |
|---|---|---|
| `.` | Llanura | Coste de movimiento 1 |
| `b` | Bosque | Coste de movimiento 2 |
| `c` | Colina | Coste 2; **+1 de defensa** a quien defienda ahí |
| `V` | Vado | Punto de cruce del río; **+1 de defensa** a quien lo defienda |
| `A` | Aldea | Produce; se puede saquear |
| `C` | Ciudad | Produce más; recluta y cura; si cae, se pierde la partida |

### Mapa del prototipo (editable por Arturo en `src/data/maps/prototype.js`)

```
         0 1 2 3 4 5 6 7 8      ← columnas (oeste → este)
  fila 0  . V . . V . . V .     ← orilla sur del Danubio
  fila 1  A . b . A . b . A
  fila 2  . b . c . . c b .
  fila 3  . . . . C . . . .
  fila 4  b . c . . . b . c
  fila 5  . . . b . . . . .
```

| Casilla | Nombre |
|---|---|
| Aldea (1,0) | Batavis |
| Aldea (1,4) | Lentia |
| Aldea (1,8) | Favianis |
| Ciudad (3,4) | Lauriacum |

(coordenadas como `(fila, columna)`)

---

## 5. Recursos y barras

### Recursos (números enteros, visibles siempre)

| Recurso | Para qué | Inicial ⚖ |
|---|---|---|
| **Grano** | Alimenta a las legiones | 10 |
| **Denarios** | Paga legiones, reclutas, fuertes, tributos | 10 |

### Producción por estación ⚖

| Asentamiento | Grano | Denarios |
|---|---|---|
| Aldea | +2 | +1 |
| Ciudad | +3 | +3 |
| Saqueado | 0 durante 2 estaciones | 0 durante 2 estaciones |

**Presión fiscal (Fase 2):** baja (−2 denarios, +1 Pueblo por estación), normal (sin cambios) o alta (+3 denarios, −2 Pueblo por estación) ⚖.

### Las dos barras (Fase 2), de 0 a 100

| Barra | Color | Inicial ⚖ | Sube con | Baja con |
|---|---|---|---|---|
| **Pueblo** (lealtad de tu provincia) | verde oliva | 60 | defender, impuestos bajos, desobedecer a Roma a favor de los tuyos | saqueos (−8), hambre (−5), impuestos altos, cumplir edictos duros |
| **Favor de Roma** (lo que piensa Rávena de ti) | púrpura | 60 | cumplir edictos, pagar tributo | **−1 por estación**, porque Rávena olvida a los que callan; desobedecer |

**Umbrales:**
- Por debajo de 20, la barra parpadea suavemente y la crónica lo comenta.
- **Pueblo a 0:** revuelta y fin de la partida.
- **Favor a 0:** destitución. Llega un *comes* con un ejército a relevarte (ver §10).

---

## 6. Legiones y combate

### La legión (única unidad en la Fase 1)

| Dato | Valor ⚖ |
|---|---|
| Fuerza inicial / máxima | 3 / 4 |
| Movimiento | 2 puntos por estación |
| Mantenimiento | 2 de grano + 1 denario por estación |
| Reclutar | 6 denarios, en la ciudad, aparece con fuerza 2; máximo una por estación |
| Curación | +1 de fuerza por estación si empieza el turno en la ciudad o en un fuerte |
| Inicio | 3 legiones con fuerza 3: en Lauriacum (la *Legio II Italica*), en Batavis y en Favianis |

### Nombre y veteranía

Cada legión tiene **nombre propio** y un historial. Se le coge cariño, como a un soldado de *XCOM*.

- **Nombres:** la inicial es la *Legio II Italica*. Las demás salen de una lista editable en `src/data/units.js` con el patrón *"Numerus de Batavis"* o *"Cohors de Lentia"* (unidad + lugar de reclutamiento), sin repetir.
- **Veteranía** ⚖ (se cuentan las victorias en combate):

| Rango | Victorias | Efecto |
|---|---|---|
| Bisoños | 0–1 | — |
| Veteranos | 2–4 | Fuerza máxima 5 |
| Élite | 5 o más | Fuerza máxima 5 y **+1 de defensa** |

- **Cuando cae una legión,** la crónica la despide con su nombre y su historial (*"Cayó la Cohors de Lentia, que había rechazado cuatro incursiones"*), y la lápida final enumera las legiones perdidas.
- Esto da una decisión nueva: ¿arriesgas a tus veteranos en el vado o mandas a los bisoños?
- Un edicto que se lleva legiones a Italia **elige el jugador cuáles entrega**. Ahí duele.

Si al pagar el mantenimiento falta grano o faltan denarios, **cada legión pierde 1 de fuerza** (deserciones) y, en la Fase 2, el Pueblo baja 5.

**Fuerte (Fase 1, si da tiempo; si no, Fase 3):** cuesta 8 denarios, se construye en una casilla con legión, da **+2 de defensa** y cura. Máximo uno por estación.

### Combate (determinista: sin dados)

Una banda con fuerza **F** llega a una casilla. La **defensa D** es la suma de la fuerza de las legiones que haya allí más los bonos de terreno (vado +1, colina +1, fuerte +2).

| Caso | Resultado ⚖ |
|---|---|
| **D ≥ F** (victoria) | La banda desaparece. Las legiones pierden en total ⌊F/2⌋ de fuerza. |
| **D < F** (derrota) | La banda pierde D de fuerza, sigue hacia su objetivo y lo saquea. Las legiones pierden en total ⌈F/2⌉. |

- Las pérdidas se reparten empezando por la legión con más fuerza, de una en una, para no aniquilar una sola de golpe.
- Una legión con fuerza 0 desaparece.
- **El resultado previsto se muestra antes de confirmar.** Es el corazón del pilar 2: el jugador nunca debería sorprenderse por un combate, solo por sus propias decisiones.

---

## 7. Los bárbaros (amenazas anunciadas)

- Al final de cada estación aparecen las **amenazas de la siguiente**: una ficha en la orilla norte, frente a un vado, con una flecha hasta su **objetivo** y su **fuerza** escrita.
- **Objetivo:** el asentamiento no saqueado más cercano al vado. En caso de empate, el más rico.
- **Recorrido:** la banda cruza por el vado. Si hay legiones en el vado, combate allí. Si sobrevive (o el vado estaba vacío), llega al objetivo en la misma estación y combate ahí si hay legiones. Si nadie la para, saquea.
- **Tras saquear,** la banda vuelve al norte con el botín y desaparece.
- **Saqueo:** el asentamiento deja de producir durante 2 estaciones y el Pueblo baja 8 (Fase 2). **Si Lauriacum es saqueada, se pierde la partida** en el prototipo; en la Fase 2, la segunda vez.

### Oleadas del prototipo (editables en `src/data/threats.js`) ⚖

Fuerza de cada banda; el vado se elige con la semilla de la partida.

| Estación | Bandas | | Estación | Bandas |
|---|---|---|---|---|
| 1 | — (se aprende a mover) | | 9 | 3, 3 |
| 2 | 2 | | 10 | 4, 2 |
| 3 | 2 | | 11 | 5 |
| 4 | 3 | | 12 | 4, 3 |
| 5 | 2, 2 | | 13 | 5, 3 |
| 6 | 3 | | 14 | 6 |
| 7 | 3, 2 | | 15 | 5, 4 |
| 8 | 4 | | | |

### Invierno (Fase 3)
En las estaciones de invierno **el río se hiela**: las bandas pueden cruzar por cualquier casilla de la fila 0, no solo por los vados, y ninguna casilla da el bono de vado. El invierno da miedo porque el mapa cambia, no porque los números suban.

---

## 8. Edictos (las cartas de Roma)

Cada 2 o 3 estaciones llega un **edicto**: una carta con sello púrpura que hay que responder antes de mover. Es el *Papers, Please* del juego. Reglas de escritura:

- **Ninguna opción es gratis.** Si una opción es claramente la mejor, el edicto está mal hecho.
- **Lo justo y lo útil no coinciden.** La opción "buena" para tu gente casi siempre cuesta Favor, y viceversa.
- **Consecuencias diferidas.** Al menos un tercio de las opciones dejan algo pendiente que vuelve más tarde.
- **Voz:** carta oficial, seca y algo burocrática, con un encabezado en latín. Las opciones se escriben en primera persona y en tono llano.

### Esquema de datos (en `src/data/edicts.js`; las claves van en español porque es terreno de Arturo)

```js
{
  id: 'legiones_a_italia',
  desde: 4,                 // primera estación en que puede salir
  hasta: 14,                // última (opcional)
  unaVez: true,             // no se repite
  encabezado: 'AD ITALIAM',
  remitente: 'Ricimero, magister militum',
  texto: 'El servicio del Estado requiere dos legiones de tu provincia en Italia antes del verano. No se admitirán demoras.',
  opciones: [
    {
      texto: 'Obedezco. Envío dos legiones.',
      requiere: { legiones: 2 },
      efectos: { legiones: -2, favor: +15 },
      cronica: 'El dux envió dos legiones a Italia. El limes quedó más vacío.',
    },
    {
      texto: 'Envío una y escribo una excusa larga.',
      requiere: { legiones: 1 },
      efectos: { legiones: -1, favor: +3 },
      cronica: 'Una legión partió hacia el sur, acompañada de una carta muy cortés.',
    },
    {
      texto: 'No envío a nadie. Aquí los necesito.',
      efectos: { favor: -15, pueblo: +5 },
      despues: { estaciones: 4, evento: 'inspector_imperial' },
      cronica: 'El dux no envió a nadie. En Rávena alguien anotó su nombre.',
    },
  ],
}
```

Efectos admitidos: `grano`, `denarios`, `pueblo`, `favor`, `legiones` (negativo: **el jugador elige cuáles entrega**; positivo: aparecen en la ciudad con fuerza 2), `saquear` (nombre de un asentamiento), `bandera` (marca para eventos futuros) y `despues` (consecuencia diferida).

### Edictos de ejemplo (para el prototipo de la Fase 2)

1. **AD ITALIAM.** Dos legiones para Italia (el ejemplo de arriba).
2. **TRIBUTUM.** *"El tesoro requiere 12 denarios de tu provincia este año."* Pagar (+10 Favor) · Pagar subiendo impuestos (+10 Favor, 0 denarios, −10 Pueblo) · Alegar pobreza (−10 Favor; 50 % de probabilidad de que más tarde llegue un inspector, decidido por la semilla).
3. **DE FOEDERATIS.** *"Por tratado, un grupo de rugios se asentará en tierras de tu provincia."* Aceptar (pierdes una aldea, que pasa a ser de los rugios: no produce para ti, pero las bandas no la atacan y defiende su vado; +10 Favor, −10 Pueblo) · Resistirte (−15 Favor). *(Fase 3)*
4. **DE EPISCOPO.** *"Se ordena entregar al obispo de Lauriacum para que responda ante el tribunal."* Entregarlo (+12 Favor, −15 Pueblo y, 4 estaciones después, "El mártir": −5 Pueblo más) · Esconderlo (−12 Favor, +8 Pueblo).
5. **DUAE EPISTULAE** (solo en 472). Llegan dos cartas a la vez: Antemio, el emperador, y Ricimero, su general, te piden tropas el uno contra el otro. Apoyar a Antemio · Apoyar a Ricimero · No apoyar a ninguno. Quien pierde la guerra (Antemio, como en la historia) te lo cobra en Favor. Quien no se moja pierde un poco de Favor con todos y no arriesga legiones.
6. **ULTIMUM STIPENDIUM** (evento, no edicto). *"La paga no llega desde hace un año. Los hombres de Batavis quieren ir a Italia a buscarla."* Dejarles ir (−1 legión; 3 estaciones después, una de dos cosas decidida por la semilla: vuelven con 15 denarios o "los cuerpos bajan por el río", con −8 Pueblo) · Pagarles de tu bolsillo (−10 denarios) · Prohibírselo (la legión de Batavis pierde 1 de fuerza por deserciones).

---

## 9. Eventos y consecuencias diferidas

- **Eventos:** documentos que no vienen de Roma (un monje, un mercader rugio, una aldea que pide ayuda). Usan el mismo esquema que los edictos.
- **Consecuencias diferidas:** cualquier opción puede dejar `despues: { estaciones, evento }`. Cuando vence, el evento aparece aunque el jugador ya lo haya olvidado. **Esto es lo que hace pensar:** decidiste algo cómodo hace un año y ahora vuelve.
- **Banderas:** marcas de texto (`'obispo_entregado'`) que otros eventos pueden pedir u ocultar. Así la historia recuerda lo que hiciste.
- **Frecuencia:** como mucho un documento por estación. En las estaciones sin documento, solo mapa.

---

## 10. Finales

### Finales anticipados

| Condición | Final |
|---|---|
| Pueblo a 0 | **La revuelta.** Las ciudades abren sus puertas a otro. |
| Lauriacum saqueada (en la Fase 2, por segunda vez) | **La caída de Lauriacum.** |
| Favor a 0 y te sometes al *comes* | **Destituido.** Vuelves a Italia; la provincia sigue sin ti. |
| Favor a 0 y te resistes | No es un final: pasas al **modo rebelde**. Dejan de llegar edictos, el Favor desaparece y Roma pasa a ser un enemigo más: el ejército del *comes* entra por el sur. Si aguantas hasta el final, desbloqueas **Rex**. |

### El último documento (estación 32, invierno de 476)

*"Ya no hay emperador en Occidente. ¿Qué eres ahora?"*
- **Seguir siendo el dux de nadie.** Mantienes el cargo de un imperio que ya no existe.
- **Proclamarte rey de los romanos del Danubio.**
- **Evacuar la provincia hacia Italia** (lo que acabó ocurriendo en 488).

Esa respuesta, cruzada con las barras, da el final:

| | Pueblo ≥ 50 | Pueblo < 50 |
|---|---|---|
| **Favor ≥ 50** | *El último romano* (raro y difícil) | *Funcionario ejemplar de un imperio muerto* |
| **Favor < 50** | *Padre de la provincia* | *Superviviente* |

Cada combinación de casilla y respuesta tiene su propio texto de epílogo (3 a 5 frases).

### La lápida
La pantalla final es una **estela funeraria romana**: inscripción en mayúsculas con interpuntos (`D·M· FLAVIVS ... DVX NORICI ...`) y la traducción debajo, en cursiva. El nombre del gobernador lo elige el jugador al empezar (por defecto, *Flavio Severo*). Debajo, la crónica completa, que se puede copiar o descargar como texto.

---

## 11. La crónica

- Una columna a la derecha del mapa, escrita como la crónica de un monje, en pasado y con frases cortas.
- Cada estación añade de 1 a 3 líneas a partir de plantillas (`src/data/chronicle.js`):
  *"Invierno de 470. Los alamanes cruzaron el río helado junto a Batavis. La guarnición resistió, pero quedaron pocos."*
- Las respuestas a edictos y eventos añaden su línea `cronica`.
- Al final, la crónica entera es el resumen de la partida, para compartir. Es la "historia" de *FTL* hecha con texto barato.

---

## 12. Estética

### Concepto: *el expediente del gobernador*
Todo lo que se ve es un objeto que existiría sobre la mesa de un *dux*: un **mapa de pergamino** con **fichas** de juego de tablero, **cartas lacradas** y una **crónica**. Nada de interfaz de videojuego genérico, sin barras brillantes ni botones con degradado. La limitación técnica se convierte en tema: si parece un documento, es porque *es* un documento.

### Paleta (variables CSS en `src/ui/theme.css`)

| Token | Hex | Uso |
|---|---|---|
| `--pergamino` | `#EFE4CB` | Fondo del mapa y los documentos |
| `--pergamino-oscuro` | `#D9C8A3` | Paneles, casillas de bosque |
| `--tinta` | `#2B2118` | Texto y líneas principales |
| `--tinta-suave` | `#6B5640` | Texto secundario y rejilla |
| `--purpura` | `#5B1A3A` | Roma: sellos, barra de Favor |
| `--oliva` | `#5E6B2E` | Pueblo: barra de Pueblo, asentamientos |
| `--minio` | `#A33A1F` | Amenazas y avisos (el rojo de las rúbricas medievales) |
| `--oro` | `#A8832F` | Selección y detalles de sello |
| `--rio` | `#6E8A8F` | Agua |
| `--mesa` | `#1E1813` | Fondo de la página alrededor del pergamino |

Regla: **como máximo dos colores además de la tinta** en cualquier elemento. Nada de degradados salvo la textura del pergamino.

### Tipografía (Google Fonts, licencia OFL)
- **Cinzel**, solo para inscripciones, encabezados de edictos, nombres de lugar en el mapa y la lápida. Siempre en mayúsculas.
- **Alegreya** para todo lo demás (documentos, crónica, interfaz), con su cursiva para las traducciones.
- Cifras: `font-variant-numeric: lining-nums tabular-nums` en los recursos, para que no bailen.
- Años y estaciones: *"Primavera, año 469"* con el número romano pequeño al lado (`CDLXIX`) como adorno, nunca como única información.

### El mapa
- **SVG**, no canvas: 54 hexágonos con eventos de ratón, estilos CSS y nitidez a cualquier tamaño.
- **Textura del pergamino:** filtro SVG `feTurbulence` + `feColorMatrix`, generado y sin imágenes.
- **Trazo "a mano":** filtro `feDisplacementMap` muy suave sobre las líneas de la rejilla y el río, para que no parezcan de ordenador.
- **Terrenos con trama, no con color:** el bosque con pequeños árboles de tinta, la colina con *hachures* y la llanura limpia. Como un mapa antiguo, no como un juego de estrategia moderno.
- **Nombres de lugar** en Cinzel, con un ligero espaciado entre letras.

### Las fichas
- Cuadradas, con borde de tinta, como las de un juego de guerra de tablero.
- **Legión:** fondo pergamino, icono de escudo con el número de la legión y la fuerza en una esquina con puntos (●●●○).
- **Banda:** fondo de tinta, icono de hacha en pergamino y la fuerza en número grande de color minio.
- **Iconos:** todos dibujados a mano en SVG con **el mismo grosor de trazo (2 px a escala 1)**, sin relleno de color, solo tinta. Un único archivo `src/ui/icons.js` con todos. Si un icono no cabe en este estilo, no entra.

### Amenazas
- Flecha curva de color **minio**, con trazo discontinuo, desde la ficha de la banda hasta su objetivo.
- Al pasar el ratón: recuadro con el **resultado previsto** ("Defensa 4 contra 3. Rechazada. Pierdes 1.").

### Documentos (edictos y eventos)
- Aparecen sobre el mapa como una carta: papel algo más claro, **sello de lacre púrpura** dibujado en SVG, encabezado latino en Cinzel, remitente y texto en Alegreya.
- Las opciones son líneas escritas a mano dentro de la carta, no botones grises. Al pasar el ratón se subrayan en tinta y muestran sus efectos conocidos ("−2 legiones · +15 Favor"). **Las consecuencias diferidas no se muestran:** esa es la gracia.

### Movimiento y sonido
- Animaciones cortas y con sentido: una ficha se desliza en 200 ms, la crónica se escribe letra a letra y el sello "se rompe" al abrir una carta. Siempre se respeta `prefers-reduced-motion`.
- **Sonido:** ninguno hasta la Fase 4. Después, como mucho, papel, lacre, pluma y un tambor lejano. Nada de música épica genérica.

### Prohibido
- Imágenes generadas por IA, fotos o *clipart*.
- Emojis.
- Degradados brillantes, sombras exageradas, bordes redondeados de aplicación móvil.
- Mezclar estilos de icono.
- Rojo para cualquier cosa que no sea una amenaza.

---

## 13. Pantalla

```
┌──────────────────────────────────────────────────────────────────────┐
│ PRIMAVERA · AÑO 469        Grano 10  Denarios 10   Pueblo ▓▓▓░  Roma ▓▓▓░ │  ← barra superior
├──────────────────────────────────────────────┬───────────────────────┤
│                                              │  CRÓNICA              │
│        (orilla norte: bandas)                │  Primavera de 469.    │
│  ~~~~~~~~~~~~~ DANUBIO ~~~~~~~~~~~~~~        │  El dux llegó a       │
│        MAPA DE HEXÁGONOS                     │  Lauriacum...         │
│                                              │                       │
│                                              ├───────────────────────┤
│                                              │  CASILLA / LEGIÓN     │
│                                              │  seleccionada         │
├──────────────────────────────────────────────┴───────────────────────┤
│  [Reclutar]  [Fortificar]  [Impuestos: normal ▾]   [Deshacer]  [CERRAR LA ESTACIÓN] │
└──────────────────────────────────────────────────────────────────────┘
```

- **Objetivo:** ordenador y iPad en horizontal (mínimo 1024 × 700). El móvil queda fuera de la v1.
- Todo se puede hacer con ratón; atajos de teclado: `Espacio` cierra la estación, `Z` deshace y `Esc` deselecciona.

---

## 14. Fuera de alcance (por ahora) e ideas para después

- **No:** multijugador, rivales controlados por la IA, diplomacia compleja, árbol tecnológico, edificios variados, móvil, música.
- **Ideas para después (solo si el núcleo ya es divertido):**
  - Tribus con relación propia: los rugios como vecinos con los que se comercia y los alamanes como saqueadores.
  - **Tu familia en Rávena:** un edicto temprano se lleva a tu hijo "a educarse en la corte". Rebelarte después tiene otro precio.
  - Un consejero (un monje venido de Oriente) que a veces acierta.
  - Otras provincias como escenarios: Britania en 410 o la Galia de Siagrio.
  - Meta-progresión ligera entre partidas, como en *Slay the Spire*: nuevos gobernadores con un rasgo propio.

---

## 15. Preguntas abiertas para Arturo (el "gamer de verdad")

Se resuelven en el chat de diseño y se pasan a §16.

1. ¿Te sobra algo de este documento? ¿Echas algo en falta de los juegos que te gustan?
2. Tras jugar el prototipo: ¿pocas legiones grandes o más legiones pequeñas?
3. ¿Cuánto debe durar de verdad una partida para que apetezca "otra más"?

---

## 16. Decisiones de diseño tomadas

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-10-14 | Ambientación romana tardía; solo contra el sistema; dos barras (Pueblo y Favor de Roma) | Elegido por Arturo |
| 2026-10-14 | Combate determinista con resultado previsto | Elegido por Arturo; pilar 2 |
| 2026-10-14 | Historia real con nombres | Elegido por Arturo |
| 2026-10-14 | Legiones con nombre y veteranía | Elegido por Arturo; da apego al estilo de *XCOM* |
| 2026-10-14 | Muerte permanente: un único guardado automático al empezar cada estación, con deshacer libre dentro de la estación | Elegido por Arturo; las decisiones pesan como en *FTL* |
| 2026-10-14 | 32 estaciones (469–476); prototipo de 15 | Partidas de unos 40 minutos |
