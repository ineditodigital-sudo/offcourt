import type { gsap as GsapTipo } from 'gsap';
import type { ScrollTrigger as ScrollTriggerTipo } from 'gsap/ScrollTrigger';

/**
 * Carga GSAP + ScrollTrigger bajo demanda.
 *
 * GSAP pesa 44 kB comprimidos: el 31% del bundle inicial, casi tanto como React.
 * Pero todo lo que anima está por debajo del pliegue, así que no hace falta al
 * arrancar: para cuando el visitante baja, la librería ya llegó. Las animaciones
 * en sí no cambian ni una línea; solo cambia el momento en que se registran.
 *
 * La promesa se guarda para que las ~8 secciones que la piden compartan una
 * única descarga y un único registro del plugin.
 */

type Gsap = { gsap: typeof GsapTipo; ScrollTrigger: typeof ScrollTriggerTipo };

let promesa: Promise<Gsap> | null = null;

export function cargarGsap(): Promise<Gsap> {
  if (!promesa) {
    promesa = Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([modGsap, modST]) => {
      const gsap = modGsap.gsap;
      const ScrollTrigger = modST.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    });
  }
  return promesa;
}

/** Recalcula las posiciones de los triggers, si GSAP ya está en memoria. */
export function refrescarScrollTrigger() {
  if (!promesa) return;
  promesa.then(({ ScrollTrigger }) => ScrollTrigger.refresh());
}
