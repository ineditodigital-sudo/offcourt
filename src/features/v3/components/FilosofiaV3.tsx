import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const filosofiaItems = [
  {
    title: 'DEPORTE COMO PLATAFORMA DE NEGOCIO',
    description: 'Cada torneo, clínica, atleta o contenido puede convertirse en una oportunidad comercial inteligente y sostenible.',
    image: '/fotos/IMG_008.webp'
  },
  {
    title: 'BRANDING CON IDENTIDAD',
    description: 'No construimos solo eventos o campañas; construimos percepción, prestigio y posicionamiento.',
    image: '/fotos/IMG_011.webp'
  },
  {
    title: 'EXPERIENCIAS PREMIUM',
    description: 'Buscamos que cada activación, torneo o alianza genere emociones, exclusividad y alto valor percibido.',
    image: '/fotos/IMG_012.webp'
  },
  {
    title: 'RELACIONES A LARGO PLAZO',
    description: 'El networking estratégico y la confianza son activos más importantes que cualquier venta inmediata.',
    image: '/fotos/IMG_018.webp'
  },
  {
    title: 'CULTURA & CONTENIDO',
    description: 'Las nuevas audiencias conectan con historias, personalidad y autenticidad. El contenido es parte central del crecimiento deportivo moderno.',
    image: '/fotos/IMG_021.webp'
  }
];

export const FilosofiaV3: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="py-24 px-6 md:px-12 lg:px-24 bg-white dark:bg-[#e4e4e4] text-[#1b1b1b]"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <div className="inline-block border-2 border-[#1b1b1b] rounded-full px-6 py-2 mb-6">
              <span className="font-outfit font-bold uppercase tracking-widest text-sm text-[#1b1b1b]">
                FILOSOFÍA
              </span>
            </div>
            
            <h2 className="font-outfit italic text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 text-[#1b1b1b]">
              OFF COURT
            </h2>
            
            <p className="font-sarabun text-lg md:text-xl font-medium leading-relaxed text-[#2e2f30] max-w-2xl">
              Creemos que el verdadero valor del deporte sucede <span className="font-bold">"Fuera de la cancha"</span>: en las relaciones, la narrativa, la comunidad, el networking y las experiencias que construyen marcas memorables.
            </p>
          </div>
          
          <div className="hidden md:block">
             <div className="w-16 h-8 bg-[#fda211] rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 h-auto lg:h-[500px]">
          {filosofiaItems.map((item, index) => (
            <div 
              key={index} 
              className="filosofia-card group relative rounded-[32px] overflow-hidden flex flex-col justify-end p-6 md:p-8 min-h-[400px] lg:min-h-full cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${item.image})` }}
              ></div>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b1b] via-[#1b1b1b]/50 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100"></div>
              
              {/* Content */}
              <div className="relative z-10 transition-transform duration-500 transform lg:translate-y-16 lg:group-hover:translate-y-0">
                <h3 className="font-outfit italic text-xl md:text-2xl font-extrabold text-white uppercase leading-tight mb-3">
                  {item.title}
                </h3>
                <p className="font-sarabun text-[#e4e4e4] text-sm leading-relaxed font-medium lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
