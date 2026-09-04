import { useCallback, useEffect, useState } from 'react';

/**
 * Tema del panel.
 *
 * Usa una clave propia, distinta de la del sitio. Es a propósito: dentro del
 * panel, la vista previa es el sitio real y lee `theme` para mostrarse en claro
 * u oscuro. Si compartieran preferencia, poner el panel en oscuro cambiaría
 * también la página que se está editando, y no es lo mismo elegir cómo se ve la
 * herramienta que cómo se ve la web.
 *
 * La primera vez sigue lo que tenga configurado el sistema; a partir de que se
 * pulsa el interruptor, manda la elección. Mientras no haya elección explícita
 * el panel sigue al sistema en caliente: si el equipo cambia a oscuro al
 * anochecer, el panel acompaña.
 *
 * El primer pintado lo resuelve un script en admin/index.html, antes de que
 * React monte, para que no se vea un fogonazo con el tema equivocado.
 */

export type Tema = 'claro' | 'oscuro';

const CLAVE = 'oc-tema-panel';

function leerGuardado(): Tema | null {
  try {
    const v = localStorage.getItem(CLAVE);
    return v === 'claro' || v === 'oscuro' ? v : null;
  } catch {
    return null;
  }
}

function delSistema(): Tema {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'oscuro'
    : 'claro';
}

function aplicar(tema: Tema) {
  document.documentElement.classList.toggle('dark', tema === 'oscuro');
}

export function useTema(): { tema: Tema; alternar: () => void } {
  const [tema, setTema] = useState<Tema>(() => leerGuardado() ?? delSistema());

  useEffect(() => { aplicar(tema); }, [tema]);

  // Sin elección explícita, el panel sigue al sistema aunque cambie con la app
  // abierta. En cuanto alguien pulsa el interruptor, esto deja de escucharse.
  useEffect(() => {
    if (leerGuardado()) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const alCambiar = (e: MediaQueryListEvent) => setTema(e.matches ? 'oscuro' : 'claro');
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, [tema]);

  const alternar = useCallback(() => {
    setTema((actual) => {
      const nuevo: Tema = actual === 'oscuro' ? 'claro' : 'oscuro';
      try { localStorage.setItem(CLAVE, nuevo); } catch { /* modo privado */ }
      return nuevo;
    });
  }, []);

  return { tema, alternar };
}
