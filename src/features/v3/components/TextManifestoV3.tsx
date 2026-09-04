import React, { useEffect, useRef } from 'react';
import { cargarGsap } from '../../../lib/gsapLazy';
import { useContenido } from '../../../cms/ContenidoContext';
import { Tx, marcar, useEstiloDe } from '../../../cms/Editable';

const K = 'paginas.inicio.manifiesto';

export const TextManifestoV3: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { imagenFondo } = useContenido().paginas.inicio.manifiesto;

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelado = false;

    // GSAP viaja en su propio chunk. Esta sección queda bajo el pliegue,
    // así que para cuando el visitante la alcanza la librería ya llegó y la
    // animación se ve igual que antes.
    cargarGsap().then(({ gsap }) => {
      if (cancelado) return;
      ctx = gsap.context(() => {
        gsap.fromTo('.v3-manifesto-text',
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 75%',
            }
          }
        );
      }, containerRef);
    });

    return () => { cancelado = true; ctx?.revert(); };
  }, []);

  const h2 = useEstiloDe(`${K}.titulo`, 'v3-manifesto-text font-outfit italic text-4xl md:text-5xl lg:text-7xl uppercase font-extrabold leading-[1.1] text-white mb-10');
  const p = useEstiloDe(`${K}.texto`, 'v3-manifesto-text font-sarabun text-lg md:text-2xl text-gris-claro font-medium leading-relaxed max-w-4xl text-center');

  return (
    <section
      id="manifiesto"
      ref={containerRef}
      className="relative py-32 md:py-48 px-6 md:px-12 lg:px-24 bg-negro overflow-hidden flex items-center justify-center transition-colors duration-300"
    >
      {/* Background elements */}
      <div {...marcar(`${K}.imagenFondo`)} className="absolute inset-0 opacity-50" style={{ backgroundImage: `url(${imagenFondo.src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-negro/85 via-negro/45 to-negro/85 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-20 text-center flex flex-col items-center">

        <Tx k={`${K}.antetitulo`} as="span" className="text-marca uppercase tracking-[0.4em] text-sm font-sarabun font-extrabold mb-8 block" />

        <h2 data-oc={`${K}.titulo`} className={h2.className} style={h2.style}>
          <Tx k={`${K}.titulo`} sel={`${K}.titulo`} as="span" /> <Tx k={`${K}.tituloDestacado`} as="span" className="text-marca" />.
        </h2>

        <div className="v3-manifesto-text w-24 h-1 bg-marca mb-10 rounded-full"></div>

        <p data-oc={`${K}.texto`} className={p.className} style={p.style}>
          <Tx k={`${K}.texto`} sel={`${K}.texto`} as="span" />
          <br /><br />
          <Tx k={`${K}.textoDestacado`} as="span" className="text-white font-bold" />
        </p>

      </div>
    </section>
  );
};
