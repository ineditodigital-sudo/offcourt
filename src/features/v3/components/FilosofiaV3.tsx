import React, { useEffect, useRef } from 'react';
import { cargarGsap } from '../../../lib/gsapLazy';
import { useContenido } from '../../../cms/ContenidoContext';
import { Tx, marcar, useEstiloDe } from '../../../cms/Editable';

const K = 'paginas.nosotros.filosofia';

export const FilosofiaV3: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { items } = useContenido().paginas.nosotros.filosofia;

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelado = false;

    // GSAP viaja en su propio chunk (antes esta página lo importaba en seco).
    cargarGsap().then(({ gsap }) => {
      if (cancelado) return;
      ctx = gsap.context(() => {
        gsap.fromTo('.filosofia-card',
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 70%',
            }
          }
        );
      }, containerRef);
    });

    return () => { cancelado = true; ctx?.revert(); };
  }, []);

  const p = useEstiloDe(`${K}.texto`, 'font-sarabun text-lg md:text-xl font-medium leading-relaxed text-gris-oscuro max-w-2xl');

  return (
    <section
      ref={containerRef}
      className="py-24 px-6 md:px-12 lg:px-24 bg-white dark:bg-gris-claro text-negro"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <div className="inline-block border-2 border-negro rounded-full px-6 py-2 mb-6">
              <Tx k={`${K}.etiqueta`} as="span" className="font-outfit font-bold uppercase tracking-widest text-sm text-negro" />
            </div>

            <Tx k={`${K}.titulo`} as="h2" className="font-outfit italic text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 text-negro" />

            <p data-oc={`${K}.texto`} className={p.className} style={p.style}>
              <Tx k={`${K}.texto`} sel={`${K}.texto`} as="span" /> <Tx k={`${K}.textoDestacado`} as="span" className="font-bold" /><Tx k={`${K}.textoFinal`} as="span" />
            </p>
          </div>

          <div className="hidden md:block">
            <div className="w-16 h-8 bg-marca rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 h-auto lg:h-[500px]">
          {items.map((item, index) => (
            <div
              key={index}
              className="filosofia-card group relative rounded-[32px] overflow-hidden flex flex-col justify-end p-6 md:p-8 min-h-[400px] lg:min-h-full cursor-pointer hover:shadow-2xl transition-[transform,box-shadow] duration-500 hover:-translate-y-2"
            >
              {/* Background Image */}
              <div
                {...marcar(`${K}.items.${index}.imagen`)}
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${item.imagen.src})` }}
              ></div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-negro via-negro/50 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"></div>

              {/* Content */}
              <div className="relative z-10 transition-transform duration-500 transform lg:translate-y-16 lg:group-hover:translate-y-0">
                <Tx k={`${K}.items.${index}.titulo`} as="h3" className="font-outfit italic text-xl md:text-2xl font-extrabold text-white uppercase leading-tight mb-3" />
                <Tx k={`${K}.items.${index}.texto`} as="p" className="font-sarabun text-gris-claro text-sm leading-relaxed font-medium lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 delay-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
