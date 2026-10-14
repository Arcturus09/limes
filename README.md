# Limes

Un 4X ligero de tablero para navegador. Eres el último gobernador romano del Danubio (469–476) y tienes que equilibrar la lealtad de tu gente con el favor de un imperio que se muere. Partidas de unos 40 minutos.

## Jugar en local

Los módulos ES no funcionan abriendo el archivo directamente (`file://`), así que hace falta un servidor. Desde la carpeta del proyecto:

```bash
python3 -m http.server 8000
```

Después abre <http://localhost:8000>. Para ejecutar los tests (hace falta Node.js): `node --test`.

## Publicar

El juego se publica con GitHub Pages desde la rama `main`: en el repositorio, *Settings → Pages → Deploy from a branch → main / (root)*. Pasados un par de minutos, el juego queda disponible en `https://<usuario>.github.io/<repositorio>/`.
