import React from 'react';
import { useSeo } from '../../../hooks/useSeo';
import { META } from '../../../lib/metaRutas';
import { MissionVisionValuesV3 } from '../components/MissionVisionValuesV3';
import { FilosofiaV3 } from '../components/FilosofiaV3';
import { IdealClientV3 } from '../components/IdealClientV3';
import { ContactFormV3 } from '../components/ContactFormV3';

export const NosotrosV3: React.FC = () => {
  useSeo(META.nosotros.title, META.nosotros.description);

  return (
    <div className="bg-white dark:bg-[#2e2f30] min-h-screen transition-colors duration-300 pt-24">
      {/* Hero Nosotros */}
      <section className="relative py-24 px-6 md:px-12 lg:px-24 bg-[#1b1b1b] overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1b1b1b] to-[#1b1b1b]/80 z-10"></div>
          <img src="/fotos/IMG_007.webp" alt="Offcourt Corporate" loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <span className="text-[#fda211] font-sarabun uppercase tracking-[0.2em] text-sm font-extrabold block mb-4">
              NUESTRA IDENTIDAD
            </span>
            <h1 className="font-outfit italic text-4xl md:text-5xl lg:text-7xl uppercase font-extrabold text-white leading-[1] mb-6">
              ESTRATEGAS <br/>FUERA DE LA CANCHA.
            </h1>
            <p className="font-sarabun text-[#e4e4e4] text-lg max-w-2xl font-medium leading-relaxed mb-8">
              No somos el típico consultor que habla con clichés deportivos. Somos el director general que entra a tu oficina con la estrategia, los números y las conexiones para multiplicar el valor comercial de tu marca o perfil deportivo. El verdadero juego, el que dicta el éxito a largo plazo, se juega en las salas de juntas.
            </p>
          </div>
        </div>
      </section>

      {/* Filosofía Off Court (Replaces ADN) */}
      <FilosofiaV3 />

      {/* Misión Visión Valores (Rediseñado) */}
      <MissionVisionValuesV3 />

      {/* A Quiénes Ayudamos (Rediseñado) */}
      <IdealClientV3 />

      <ContactFormV3 />
    </div>
  );
};
