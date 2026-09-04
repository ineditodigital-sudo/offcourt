import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const MissionVisionValuesV3: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.mvv-bento-item', 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1.2,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-12 md:py-24 px-4 md:px-8 lg:px-12 bg-[#2e2f30] dark:bg-[#1b1b1b] transition-colors duration-300"
    >
      <div className="max-w-[1400px] mx-auto">
        
        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-min md:auto-rows-[150px]">
          
          {/* VISIÓN (Top Left - Spans 8 cols, 3 rows) */}
          <div className="mvv-bento-item col-span-1 md:col-span-8 row-span-1 md:row-span-3 rounded-[32px] overflow-hidden relative min-h-[400px] md:min-h-0 bg-black">
            <div className="absolute inset-0 bg-[url('/fotos/IMG_015.webp')] bg-cover bg-center opacity-60"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
              <h2 className="font-outfit font-black italic text-6xl sm:text-7xl md:text-[110px] uppercase leading-none text-[#fda211] mb-4">
                VISIÓN
              </h2>
              <p className="font-outfit text-white font-bold text-sm md:text-base leading-tight max-w-xl uppercase">
                Desarrollar oportunidades de negocio, <span className="text-white">BRANDING Y POSICIONAMIENTO</span> dentro del ecosistema deportivo, conectando atletas, academias, instituciones y marcas mediante experiencias, alianzas estratégicas y proyectos de alto impacto.
              </p>
            </div>
            {/* Small icon bottom right */}
            <div className="absolute bottom-10 right-10 text-[#fda211] font-bold text-4xl hidden md:block">
              <span className="inline-block border-4 border-[#fda211] rounded-full w-12 h-12 text-center leading-10">C</span>
            </div>
          </div>

          {/* VALORES (Top Right - Spans 4 cols, 4 rows) */}
          <div className="mvv-bento-item col-span-1 md:col-span-4 row-span-1 md:row-span-4 rounded-[32px] overflow-hidden relative min-h-[500px] md:min-h-0 bg-black">
            <div className="absolute inset-0 bg-[url('/fotos/IMG_025.webp')] bg-cover bg-center opacity-50 grayscale mix-blend-luminosity"></div>
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative z-10 p-8 md:p-10 h-full flex flex-col">
              <div className="flex justify-between items-start mb-auto">
                <div className="border border-[#fda211] rounded-full px-8 py-2">
                  <span className="font-outfit text-[#fda211] font-bold uppercase tracking-widest text-lg">
                    VALORES
                  </span>
                </div>
                <div className="w-16 h-16 bg-[#fda211] rounded-full"></div>
              </div>
              
              <ul className="font-outfit font-bold text-white text-2xl md:text-3xl uppercase leading-tight space-y-4 mt-12">
                <li>Excelencia</li>
                <li>Innovación</li>
                <li>Integridad</li>
                <li>Pasión por el deporte</li>
                <li>Experiencias Premium</li>
                <li>Autenticidad</li>
              </ul>
            </div>
          </div>

          {/* Slogan Orange Box (Bottom Left - Spans 3 cols, 3 rows) */}
          <div className="mvv-bento-item col-span-1 md:col-span-3 row-span-1 md:row-span-3 rounded-[32px] bg-[#fda211] p-8 md:p-10 flex flex-col justify-between min-h-[300px] md:min-h-0">
            <h3 className="font-outfit text-white font-medium text-3xl md:text-4xl leading-tight">
              Again<br/>Again<br/>Again<br/>A Gain.
            </h3>
            <div className="w-14 h-14 border-[3px] border-white rounded-full"></div>
          </div>

          {/* Image Box (Bottom Middle - Spans 5 cols, 3 rows) */}
          <div className="mvv-bento-item col-span-1 md:col-span-5 row-span-1 md:row-span-3 rounded-[32px] overflow-hidden relative min-h-[300px] md:min-h-0 bg-black">
            <div className="absolute inset-0 bg-[url('/fotos/IMG_018.webp')] bg-cover bg-center grayscale opacity-80"></div>
          </div>

          {/* MISIÓN (Bottom Right - Spans 4 cols, 2 rows) Note: Shifts to right under values */}
          <div className="mvv-bento-item col-span-1 md:col-span-4 row-span-1 md:row-span-2 rounded-[32px] bg-[#fda211] p-8 md:p-10 flex flex-col justify-center min-h-[300px] md:min-h-0">
            <h2 className="font-outfit font-black italic text-6xl md:text-7xl uppercase text-[#1b1b1b] mb-4">
              MISIÓN
            </h2>
            <p className="font-outfit text-[#1b1b1b] font-bold text-sm leading-tight uppercase">
              Convertirnos en la agencia líder de sports marketing y experiencias deportivas en Latinoamérica, conectando el mundo del pádel y otras disciplinas con marcas, atletas e instituciones a través de proyectos que impulsen negocio, posicionamiento y crecimiento global.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
