import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe, Target } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const Manifesto: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.manifesto-content > *',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      id="manifiesto"
      ref={containerRef}
      className="relative py-8 md:py-12 px-6 bg-white dark:bg-black text-black dark:text-white flex items-center justify-center overflow-hidden transition-colors duration-300"
    >
      {/* Immersive Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-105"
        style={{ backgroundImage: 'url(/fotos/IMG_005.webp)' }}
      ></div>

      {/* Gradient Overlay for Readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-white/95 via-white/80 to-transparent dark:from-black/95 dark:via-black/80 dark:to-transparent transition-colors duration-300"></div>

      {/* Main Container - Left Aligned to emphasize the background on the right */}
      <div className="max-w-5xl w-full mx-auto relative z-20 flex flex-col md:flex-row items-center justify-start">
        
        {/* Content Block */}
        <div className="manifesto-content w-full md:w-1/2 space-y-8 flex flex-col items-start pr-0 md:pr-12">
          
          <span className="text-gold uppercase tracking-[0.35em] text-xs font-black inline-block px-4 py-1 border border-gold/30 rounded-full bg-gold/10 backdrop-blur-md">
            GLOBAL PARTNERSHIP
          </span>
          
          {/* Logo Partner */}
          <div className="w-64 md:w-80 h-auto py-4">
            <img 
              src="/rafa-nadal-logo.png" 
              alt="Rafa Nadal Academy Logo" 
              className="w-full h-auto object-contain drop-shadow-2xl brightness-110"
            />
          </div>
          
          <h2 className="font-oswald text-4xl md:text-5xl lg:text-6xl uppercase font-bold tracking-tighter leading-[1.1] text-black dark:text-white transition-colors duration-300">
            ALIANZA ESTRATÉGICA INTERNACIONAL
          </h2>
          
          <p className="font-inter text-base md:text-base xl:text-lg text-neutral-700 dark:text-white/80 leading-relaxed font-medium max-w-lg transition-colors duration-300">
            Nuestra solidez institucional nos permite ser aliados estratégicos y promotores oficiales. Operamos como el puente directo hacia las clínicas élite y campamentos de alto rendimiento en las sedes de Mallorca y Kuwait, garantizando acceso y gestión premium.
          </p>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-none bg-gold/20 flex items-center justify-center border border-gold/30">
                <Globe className="text-gold" size={20} />
              </div>
              <div>
                <p className="font-oswald text-lg uppercase font-bold text-black dark:text-white tracking-wide transition-colors">Promotor Oficial</p>
                <p className="text-xs text-neutral-600 dark:text-white/60 font-inter font-medium mt-1 transition-colors">Gestión corporativa sin intermediarios.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-none bg-gold/20 flex items-center justify-center border border-gold/30">
                <Target className="text-gold" size={20} />
              </div>
              <div>
                <p className="font-oswald text-lg uppercase font-bold text-black dark:text-white tracking-wide transition-colors">Alto Nivel</p>
                <p className="text-xs text-neutral-600 dark:text-white/60 font-inter font-medium mt-1 transition-colors">Metodología de entrenamiento mundial.</p>
              </div>
            </div>
          </div>


        </div>
      </div>
    </section>
  );
};
