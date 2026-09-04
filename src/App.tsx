import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import Lenis from 'lenis';

import { registerLenis, scrollToSection, scrollToTop } from './lib/smoothScroll';
import { cargarGsap, refrescarScrollTrigger } from './lib/gsapLazy';

// Lo que se ve al entrar: carga inmediata.
import { NavbarV3 } from './features/v3/components/NavbarV3';
import { Footer } from './components/layout/Footer';
import { AiChatButton } from './features/v3/components/AiChatButton';
import { HomeV3 } from './features/v3/pages/HomeV3';

// Rutas secundarias y versiones antiguas: chunks aparte, se descargan solo si se visitan.
const NosotrosV3 = lazy(() => import('./features/v3/pages/NosotrosV3').then(m => ({ default: m.NosotrosV3 })));
const ServicePageV3 = lazy(() => import('./features/v3/pages/ServicePageV3').then(m => ({ default: m.ServicePageV3 })));
const PrivacyV3 = lazy(() => import('./features/v3/pages/PrivacyV3').then(m => ({ default: m.PrivacyV3 })));
const TermsV3 = lazy(() => import('./features/v3/pages/TermsV3').then(m => ({ default: m.TermsV3 })));
const AppV1 = lazy(() => import('./features/legacy/AppV1'));
const AppV2 = lazy(() => import('./features/legacy/AppV2'));

const AppV3Layout: React.FC<{ theme: 'dark' | 'light'; toggleTheme: () => void }> = ({ theme, toggleTheme }) => (
  <div className="min-h-screen bg-[#e4e4e4] dark:bg-[#1b1b1b] text-[#1b1b1b] dark:text-white transition-colors duration-300 flex flex-col">
    <NavbarV3 theme={theme} toggleTheme={toggleTheme} />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer theme={theme} />
    <AiChatButton />
  </div>
);

/** Espacio en blanco mientras baja un chunk diferido; evita saltos de layout. */
const RouteFallback: React.FC = () => <div className="min-h-screen" />;

/**
 * Gestiona la posición del scroll en cada navegación:
 * con hash va a la sección, sin hash vuelve arriba.
 * Antes no existía lo segundo y las páginas se abrían a media altura.
 */
const ScrollManager: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Esperamos a que la ruta nueva monte su contenido antes de buscar el ancla.
      const t = setTimeout(() => scrollToSection(hash.slice(1)), 300);
      return () => clearTimeout(t);
    }

    scrollToTop();

    // El alto de la página cambia al montar la ruta: hay que recalcular los triggers.
    const t = setTimeout(() => refrescarScrollTrigger(), 300);
    return () => clearTimeout(t);
  }, [pathname, hash]);

  return null;
};

export const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark'; // Dark mode is default
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Bloquear scroll mientras carga
  useEffect(() => {
    document.body.style.overflow = isLoading ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isLoading]);

  /**
   * Retira la pantalla de arranque de index.html.
   *
   * Antes había además un Loader de React que repetía la misma animación del
   * logo: la intro se veía dos veces seguidas y el hero no aparecía hasta que
   * terminaba la segunda. Ahora la intro es una sola, ya corriendo desde que
   * llega el HTML, y aquí solo se dispara su salida.
   */
  useEffect(() => {
    // La cortina ya se retiró sola: su salida está encadenada por CSS con
    // tiempos fijos, sin esperar a React. Aquí solo se quita del DOM el nodo,
    // que a estas alturas es invisible y no intercepta nada.
    document.getElementById('boot')?.remove();
    setIsLoading(false);
    refrescarScrollTrigger();
  }, []);

  /**
   * Lenis se crea UNA sola vez en toda la vida de la app.
   * Antes se recreaba en cada cambio de ruta y su bucle de animación nunca se
   * cancelaba, así que cada navegación dejaba un rAF huérfano corriendo a 60fps
   * sobre una instancia ya destruida: el sitio se degradaba clic a clic.
   *
   * El bucle vuelve a ser un requestAnimationFrame propio (ya no el ticker de
   * GSAP) porque GSAP dejó de estar en el bundle inicial. La diferencia con el
   * código original es que aquí SÍ se cancela en el cleanup, que era el bug.
   */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    registerLenis(lenis);

    let rafId = requestAnimationFrame(function bucle(t: number) {
      lenis.raf(t);
      rafId = requestAnimationFrame(bucle);
    });

    // ScrollTrigger llega más tarde, en su propio chunk; en cuanto está, se
    // suscribe al scroll de Lenis para mantenerse sincronizado.
    let desuscribir: (() => void) | undefined;
    cargarGsap().then(({ ScrollTrigger }) => {
      const actualizar = () => ScrollTrigger.update();
      lenis.on('scroll', actualizar);
      desuscribir = () => lenis.off('scroll', actualizar);
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(rafId);
      desuscribir?.();
      lenis.destroy();
      registerLenis(null);
    };
  }, []);

  // Las imágenes pesadas llegan después del primer render y cambian el alto real
  // de la página; sin este refresh los ScrollTrigger disparan a destiempo.
  useEffect(() => {
    const refresh = () => refrescarScrollTrigger();
    window.addEventListener('load', refresh);
    return () => window.removeEventListener('load', refresh);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return (
    <>
      <ScrollManager />

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<AppV3Layout theme={theme} toggleTheme={toggleTheme} />}>
            <Route index element={<HomeV3 />} />
            <Route path="nosotros" element={<NosotrosV3 />} />
            <Route path="servicios/:id" element={<ServicePageV3 />} />
            <Route path="privacidad" element={<PrivacyV3 />} />
            <Route path="terminos" element={<TermsV3 />} />
          </Route>
          <Route path="/v1" element={<AppV1 theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/v2" element={<AppV2 theme={theme} toggleTheme={toggleTheme} />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
