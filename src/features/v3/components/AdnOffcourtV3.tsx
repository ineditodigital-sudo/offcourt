import React, { useEffect, useRef } from 'react';
import { cargarGsap } from '../../../lib/gsapLazy';
import { AlertCircle, Target, Zap } from 'lucide-react';

export const AdnOffcourtV3: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

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
      className="py-24 px-6 md:px-12 lg:px-24 bg-[#e4e4e4] dark:bg-[#1b1b1b] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        
        {/* Problema */}
        <div className="mvv-card-v3 group rounded-[32px] p-8 md:p-10 border border-black/5 dark:border-white/5 bg-white dark:bg-[#2e2f30] hover:border-[#fda211] dark:hover:border-[#fda211] hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(253,162,17,0.15)] relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-[#e4e4e4] dark:bg-[#1b1b1b] group-hover:bg-[#fda211] dark:group-hover:bg-[#fda211] rounded-2xl flex items-center justify-center mb-8 transition-colors duration-500">
              <AlertCircle className="text-[#1b1b1b] dark:text-white group-hover:text-[#1b1b1b] transition-colors duration-500" size={28} />
            </div>
            <h2 className="font-outfit italic text-3xl md:text-4xl uppercase font-extrabold tracking-tight text-[#1b1b1b] dark:text-white mb-6">
              EL PROBLEMA
            </h2>
            <p className="font-sarabun text-[#2e2f30] dark:text-[#e4e4e4] text-sm md:text-base leading-relaxed font-medium">
              El negocio del deporte está fragmentado. El talento sobra; la estructura para convertirlo en negocio, no.
            </p>
          </div>
        </div>

        {/* Solucion */}
        <div className="mvv-card-v3 group rounded-[32px] p-8 md:p-10 border border-black/5 dark:border-white/5 bg-white dark:bg-[#2e2f30] hover:border-[#fda211] dark:hover:border-[#fda211] hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(253,162,17,0.15)] relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-[#e4e4e4] dark:bg-[#1b1b1b] group-hover:bg-[#fda211] dark:group-hover:bg-[#fda211] rounded-2xl flex items-center justify-center mb-8 transition-colors duration-500">
              <Target className="text-[#1b1b1b] dark:text-white group-hover:text-[#1b1b1b] transition-colors duration-500" size={28} />
            </div>
            <h2 className="font-outfit italic text-3xl md:text-4xl uppercase font-extrabold tracking-tight text-[#1b1b1b] dark:text-white mb-6">
              LA SOLUCIÓN
            </h2>
            <p className="font-sarabun text-[#2e2f30] dark:text-[#e4e4e4] text-sm md:text-base leading-relaxed font-medium">
              Un solo aliado para todo el ecosistema. Estrategia, marca, experiencias, medios y alianzas bajo un mismo techo. Tú compites; nosotros hacemos el negocio.
            </p>
          </div>
        </div>

        {/* ADN */}
        <div className="mvv-card-v3 group rounded-[32px] p-8 md:p-10 border border-black/5 dark:border-white/5 bg-white dark:bg-[#2e2f30] hover:border-[#fda211] dark:hover:border-[#fda211] hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(253,162,17,0.15)] relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-[#e4e4e4] dark:bg-[#1b1b1b] group-hover:bg-[#fda211] dark:group-hover:bg-[#fda211] rounded-2xl flex items-center justify-center mb-8 transition-colors duration-500">
              <Zap className="text-[#1b1b1b] dark:text-white group-hover:text-[#1b1b1b] transition-colors duration-500" size={28} />
            </div>
            <h2 className="font-outfit italic text-3xl md:text-4xl uppercase font-extrabold tracking-tight text-[#1b1b1b] dark:text-white mb-6">
              NUESTRO ADN
            </h2>
            <p className="font-sarabun text-[#2e2f30] dark:text-[#e4e4e4] text-sm md:text-base leading-relaxed font-medium">
              La primera agencia premium de pádel en México, abierta a todo el deporte. El valor real sucede fuera de la cancha.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
