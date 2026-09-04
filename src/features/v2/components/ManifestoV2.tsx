import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe, Target } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const ManifestoV2: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%'
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="manifiesto" className="py-12 md:py-24 px-4 md:px-6 bg-[#FAFAFA] dark:bg-[#111111] transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div 
          ref={containerRef}
          className="relative rounded-[40px] overflow-hidden flex flex-col md:flex-row items-center bg-black min-h-[400px] shadow-2xl"
        >
          {/* Immersive Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-luminosity"
            style={{ backgroundImage: 'url(/fotos/IMG_004.webp)' }}
          ></div>

          {/* Gradient Overlay for Readability */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/95 via-black/80 to-transparent"></div>

          {/* Main Container */}
          <div className="w-full relative z-20 flex flex-col md:flex-row items-center justify-between p-6 md:p-16">
            
            <div className="flex-1 mb-10 md:mb-0 md:pr-12">
              <div className="mb-6">
                <img 
                  src="/rafa-nadal-logo.png" 
                  alt="Rafa Nadal Academy Logo" 
                  className="h-16 w-auto object-contain drop-shadow-lg"
                />
              </div>
              
              <h2 className="font-oswald text-4xl md:text-6xl font-bold tracking-tight text-[#F4F4F4] mb-4 uppercase">
                ALIANZA ESTRATÉGICA INTERNACIONAL
              </h2>
              
              <p className="font-inter text-base md:text-base xl:text-lg text-white/70 leading-relaxed max-w-lg mb-8">
                Nuestra solidez institucional nos permite ser aliados estratégicos y promotores oficiales. Operamos como el puente directo hacia las clínicas élite y campamentos de alto rendimiento en las sedes de Mallorca y Kuwait.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex items-center gap-4 glass-card p-4 rounded-2xl">
                  <Globe className="text-gold" size={24} />
                  <div>
                    <p className="font-plus text-sm font-bold text-white tracking-wide">Promotor Oficial</p>
                    <p className="text-xs text-white/60 font-inter mt-1">Gestión corporativa sin intermediarios.</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 glass-card p-4 rounded-2xl">
                  <Target className="text-gold" size={24} />
                  <div>
                    <p className="font-plus text-sm font-bold text-white tracking-wide">Alto Nivel</p>
                    <p className="text-xs text-white/60 font-inter mt-1">Metodología de entrenamiento mundial.</p>
                  </div>
                </div>
              </div>
            </div>



          </div>
        </div>
      </div>
    </section>
  );
};
