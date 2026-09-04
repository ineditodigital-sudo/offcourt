import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Target, Eye, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const MissionVisionValuesV2: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.mvv-card-v2', 
        { y: 60, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1.2,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-24 px-4 md:px-6 bg-[#FAFAFA] dark:bg-[#111111] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        
        {/* Mission */}
        <div className="mvv-card-v2 group rounded-[24px] p-8 md:p-10 border border-white/5 bg-[#1A1A1A] hover:border-[#B79657]/30 hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_0_40px_rgba(183,150,87,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#B79657]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white group-hover:bg-black group-hover:border group-hover:border-[#B79657] rounded-xl flex items-center justify-center mb-8 transition-colors duration-500">
              <Target className="text-black group-hover:text-[#B79657] transition-colors duration-500" size={28} />
            </div>
            <h2 className="font-oswald text-3xl md:text-4xl uppercase font-black italic tracking-tight text-white mb-6">
              MISIÓN
            </h2>
            <p className="font-inter text-neutral-400 group-hover:text-neutral-300 text-sm md:text-base leading-relaxed transition-colors duration-500">
              Conectar marcas globales y negocios con el talento deportivo de alto rendimiento, creando estrategias rentables que maximicen el retorno de inversión y el impacto fuera de la cancha.
            </p>
          </div>
        </div>

        {/* Vision */}
        <div className="mvv-card-v2 group rounded-[24px] p-8 md:p-10 border border-white/5 bg-[#1A1A1A] hover:border-[#B79657]/30 hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_0_40px_rgba(183,150,87,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#B79657]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white group-hover:bg-black group-hover:border group-hover:border-[#B79657] rounded-xl flex items-center justify-center mb-8 transition-colors duration-500">
              <Eye className="text-black group-hover:text-[#B79657] transition-colors duration-500" size={28} />
            </div>
            <h2 className="font-oswald text-3xl md:text-4xl uppercase font-black italic tracking-tight text-white mb-6">
              VISIÓN
            </h2>
            <p className="font-inter text-neutral-400 group-hover:text-neutral-300 text-sm md:text-base leading-relaxed transition-colors duration-500">
              Posicionarnos como la agencia premium líder a nivel internacional en Sports Marketing y Desarrollo Comercial, redefiniendo los estándares de éxito en el ecosistema deportivo global.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mvv-card-v2 group rounded-[24px] p-8 md:p-10 border border-white/5 bg-[#1A1A1A] hover:border-[#B79657]/30 hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_0_40px_rgba(183,150,87,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#B79657]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white group-hover:bg-black group-hover:border group-hover:border-[#B79657] rounded-xl flex items-center justify-center mb-8 transition-colors duration-500">
              <ShieldCheck className="text-black group-hover:text-[#B79657] transition-colors duration-500" size={28} />
            </div>
            <h2 className="font-oswald text-3xl md:text-4xl uppercase font-black italic tracking-tight text-white mb-6">
              VALORES
            </h2>
            <ul className="font-inter font-bold text-neutral-400 group-hover:text-neutral-300 text-sm md:text-base leading-relaxed space-y-4 transition-colors duration-500">
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-white group-hover:bg-black border border-transparent group-hover:border-neutral-500 transition-colors duration-500"></div> Excelencia e Innovación</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-white group-hover:bg-black border border-transparent group-hover:border-neutral-500 transition-colors duration-500"></div> Integridad y Transparencia</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-white group-hover:bg-black border border-transparent group-hover:border-neutral-500 transition-colors duration-500"></div> Alianzas Estratégicas</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-white group-hover:bg-black border border-transparent group-hover:border-neutral-500 transition-colors duration-500"></div> Resultados Tangibles</li>
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
};
