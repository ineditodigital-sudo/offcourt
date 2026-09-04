import React, { useEffect, useRef } from 'react';
import { cargarGsap } from '../../../lib/gsapLazy';
import { useContenido } from '../../../cms/ContenidoContext';
import { Tx } from '../../../cms/Editable';
import { Icono } from '../../../cms/iconos';

const K = 'paginas.inicio.adn';

export const AdnOffcourtV3: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { tarjetas } = useContenido().paginas.inicio.adn;

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelado = false;

    // GSAP viaja en su propio chunk. Esta sección queda bajo el pliegue,
    // así que para cuando el visitante la alcanza la librería ya llegó y la
    // animación se ve igual que antes.
    cargarGsap().then(({ gsap }) => {
      if (cancelado) return;
      ctx = gsap.context(() => {
        gsap.fromTo('.mvv-card-v3',
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
            }
          }
        );
      }, sectionRef);
    });

    return () => { cancelado = true; ctx?.revert(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 px-6 md:px-12 lg:px-24 bg-gris-claro dark:bg-negro transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {tarjetas.map((tarjeta, i) => {
          const k = `${K}.tarjetas.${i}`;
          return (
            <div key={i} className="mvv-card-v3 group rounded-[32px] p-8 md:p-10 border border-black/5 dark:border-white/5 bg-white dark:bg-gris-oscuro hover:border-marca dark:hover:border-marca hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(253,162,17,0.15)] relative overflow-hidden">
              <div className="relative z-10">
                <div data-oc={`${k}.icono`} className="w-14 h-14 bg-gris-claro dark:bg-negro group-hover:bg-marca dark:group-hover:bg-marca rounded-2xl flex items-center justify-center mb-8 transition-colors duration-500">
                  <Icono clave={tarjeta.icono} className="text-negro dark:text-white group-hover:text-negro transition-colors duration-500" size={28} />
                </div>
                <Tx k={`${k}.titulo`} as="h2" className="font-outfit italic text-3xl md:text-4xl uppercase font-extrabold tracking-tight text-negro dark:text-white mb-6" />
                <Tx k={`${k}.texto`} as="p" className="font-sarabun text-gris-oscuro dark:text-gris-claro text-sm md:text-base leading-relaxed font-medium" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
