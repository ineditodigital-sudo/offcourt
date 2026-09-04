import React, { useEffect, useRef } from 'react';
import { cargarGsap } from '../../../lib/gsapLazy';

export const TextManifestoV3: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <section 
      id="manifiesto"
      ref={containerRef}
      className="relative py-32 md:py-48 px-6 md:px-12 lg:px-24 bg-[#1b1b1b] overflow-hidden flex items-center justify-center transition-colors duration-300"
    >
      {/* Background elements */}
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'url(/fotos/IMG_014.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#1b1b1b]/85 via-[#1b1b1b]/45 to-[#1b1b1b]/85"></div>
      
      <div className="max-w-5xl mx-auto relative z-20 text-center flex flex-col items-center">
        
        <span className="text-[#fda211] uppercase tracking-[0.4em] text-sm font-sarabun font-extrabold mb-8 block">
          NUESTRO MANIFIESTO
        </span>
        
        <h2 className="v3-manifesto-text font-outfit italic text-4xl md:text-5xl lg:text-7xl uppercase font-extrabold leading-[1.1] text-white mb-10">
          EL VERDADERO VALOR DEL DEPORTE <span className="text-[#fda211]">SUCEDE FUERA DE LA CANCHA</span>.
        </h2>
        
        <div className="v3-manifesto-text w-24 h-1 bg-[#fda211] mb-10 rounded-full"></div>
        
        <p className="v3-manifesto-text font-sarabun text-lg md:text-2xl text-[#e4e4e4] font-medium leading-relaxed max-w-4xl text-center">
          El marcador se olvida; el legado permanece. Los contratos, las alianzas y las decisiones que definen una carrera se juegan lejos de los reflectores.
          <br /><br />
          <span className="text-white font-bold">Ahí jugamos nosotros —junto a las marcas, los clubes y los atletas que quieren ganar también fuera de la cancha.</span>
        </p>

      </div>
    </section>
  );
};
