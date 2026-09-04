import type Lenis from 'lenis';

/**
 * Instancia única de Lenis, creada una sola vez en App.tsx.
 * Los componentes la consultan desde aquí en vez de usar scrollIntoView,
 * que compite con el motor de scroll suave y se queda a medias.
 */
let instance: Lenis | null = null;

/** Altura del navbar fijo (top-6 + alto de la píldora) para no tapar el título. */
const NAV_OFFSET = -110;

export function registerLenis(lenis: Lenis | null) {
  instance = lenis;
  if (import.meta.env.DEV) {
    (window as unknown as { __lenis?: Lenis | null }).__lenis = lenis;
  }
}

/** Desplaza suavemente hasta una sección por id. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  if (instance) {
    instance.scrollTo(el, { offset: NAV_OFFSET, duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

/** Desplaza hasta un elemento concreto, dejándolo bajo el navbar. Lo usa el editor. */
export function scrollToElement(el: HTMLElement) {
  if (instance) {
    instance.scrollTo(el, { offset: -140, duration: 0.8 });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/** Sube al inicio con animación. Se usa en el botón del footer. */
export function scrollToTopSmooth() {
  if (instance) {
    instance.scrollTo(0, { duration: 1.4 });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/**
 * Salta al inicio sin animación. Se usa al cambiar de página.
 *
 * Ponemos a cero el scroll nativo Y el objetivo interno de Lenis. Hacer solo lo
 * primero era el error anterior: Lenis conservaba su posición vieja y en el
 * siguiente fotograma la reescribía, devolviendo la página a media altura.
 * Aquí los dos apuntan a 0, así que no hay nada que reconciliar.
 */
export function scrollToTop() {
  instance?.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}
