// Generador de números con semilla (mulberry32). Es una función pura: no guarda nada
// por dentro. Recibe la semilla actual y devuelve el número y la semilla siguiente,
// que el estado guarda. Misma semilla, misma sucesión de números.

// Devuelve { value, seed }: value en [0, 1) y la semilla para la próxima llamada
export function nextRandom(seed) {
  const a = (seed + 0x6d2b79f5) >>> 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: a };
}

// Entero en [0, max): devuelve { value, seed }
export function nextInt(seed, max) {
  const r = nextRandom(seed);
  return { value: Math.floor(r.value * max), seed: r.seed };
}
