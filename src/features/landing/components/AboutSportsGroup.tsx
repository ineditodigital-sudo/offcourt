import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const AboutSportsGroup: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.about-content', 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-black overflow-hidden border-b border-white/10"
    >
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: 'url(/fotos/IMG_003.webp)' }}
      ></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 md:gap-24 items-start relative z-10">
        
        {/* Left Side: The Question */}
        <div className="about-content flex-shrink-0 w-full md:w-1/3 space-y-6">
          <div className="w-10 h-[3px] bg-[#B79657] shadow-[0_0_15px_rgba(183,150,87,0.5)]"></div>
          <h2 className="font-oswald text-4xl md:text-5xl lg:text-6xl uppercase font-black italic tracking-tighter text-white leading-[0.9] drop-shadow-lg">
            ¿A QUIÉNES<br/>AYUDAMOS?
          </h2>
          <p className="text-[#B79657] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs drop-shadow-md">
            NUESTROS ALIADOS
          </p>
        </div>

        {/* Right Side: The Answer */}
        <div className="about-content flex-grow md:pl-12 lg:pl-24">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 font-inter text-sm md:text-[13px] lg:text-sm text-neutral-300 font-bold tracking-widest uppercase drop-shadow-md">
            <li className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 bg-[#B79657] flex-shrink-0 mt-[6px] shadow-[0_0_10px_rgba(183,150,87,0.8)]"></div> MARCAS Y PATROCINADORES
            </li>
            <li className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 bg-[#B79657] flex-shrink-0 mt-[6px] shadow-[0_0_10px_rgba(183,150,87,0.8)]"></div> CLUBES Y ACADEMIAS DEPORTIVAS
            </li>
            <li className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 bg-[#B79657] flex-shrink-0 mt-[6px] shadow-[0_0_10px_rgba(183,150,87,0.8)]"></div> GOBIERNOS Y DEPENDENCIAS
            </li>
            <li className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 bg-[#B79657] flex-shrink-0 mt-[6px] shadow-[0_0_10px_rgba(183,150,87,0.8)]"></div> ATLETAS PROFESIONALES Y EMERGENTES
            </li>
            <li className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 bg-[#B79657] flex-shrink-0 mt-[6px] shadow-[0_0_10px_rgba(183,150,87,0.8)]"></div> UNIVERSIDADES E INSTITUCIONES<br/>EDUCATIVAS
            </li>
            <li className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 bg-[#B79657] flex-shrink-0 mt-[6px] shadow-[0_0_10px_rgba(183,150,87,0.8)]"></div> ORGANIZADORES DE EVENTOS<br/>DEPORTIVOS
            </li>
            <li className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 bg-[#B79657] flex-shrink-0 mt-[6px] shadow-[0_0_10px_rgba(183,150,87,0.8)]"></div> EVENTOS CORPORATIVOS Y<br/>EMPRESARIALES
            </li>
          </ul>
        </div>

      </div>
    </section>
  );
};
