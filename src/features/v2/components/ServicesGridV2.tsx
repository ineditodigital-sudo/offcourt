import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const ServicesGridV2: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  const services = [
    {
      title: 'SPORTS MARKETING',
      desc: 'Conectamos marcas con audiencias apasionadas mediante patrocinios y activaciones que aseguran un alto retorno de inversión.',
      image: '/fotos/IMG_017.webp'
    },
    {
      title: 'CLÍNICAS Y CAMPAMENTOS INTERNACIONALES',
      desc: 'Desarrollamos talento local con impacto global mediante alianzas estratégicas, incluyendo programas con la Rafa Nadal Academy.',
      image: '/fotos/IMG_026.webp'
    },
    {
      title: 'EXPERIENCIAS CORPORATIVAS, CONFERENCIAS Y ORGANIZACIÓN DE EQUIPOS DEPORTIVOS',
      desc: 'Team building de élite. Llevamos el liderazgo y la resiliencia del deporte profesional directamente al corazón de tu empresa.',
      image: '/fotos/IMG_023.webp'
    },
    {
      title: 'REPRESENTACIÓN COMERCIAL DE ATLETAS Y CREADORES DE CONTENIDO',
      desc: 'Gestionamos la imagen corporativa de atletas y creadores, transformándolos en marcas rentables y atractivas para sponsors.',
      image: '/fotos/IMG_018.webp'
    },
    {
      title: 'BRANDING DEPORTIVO',
      desc: 'Diseñamos narrativas e identidades visuales poderosas para clubes, franquicias y entidades deportivas que buscan destacar.',
      image: '/fotos/IMG_016.webp'
    },
    {
      title: 'DESARROLLO DE PROYECTOS Y COMPLEJOS DEPORTIVOS',
      desc: 'Desde la planificación financiera hasta la ejecución técnica, estructuramos infraestructura deportiva altamente rentable.',
      image: '/fotos/PADEL.webp'
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.brutalist-card', 
        { y: 100, opacity: 0 }, 
        { 
          y: 0, 
          opacity: 1, 
          duration: 1, 
          stagger: 0.15, 
          ease: "power4.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
          }
        }
      );
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section 
      id="expertise"
      ref={containerRef}
      className="py-32 w-full bg-[#FAFAFA] dark:bg-[#111111] overflow-hidden transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Brutalist Title */}
        <div className="mb-20 text-center w-full relative z-10 flex flex-col items-center">
          <div className="bg-[#B79657] text-black px-6 py-2 mb-6 transform -skew-x-12 inline-block shadow-lg">
            <span className="block transform skew-x-12 font-plus font-bold uppercase tracking-widest text-sm">
              NUESTRAS ÁREAS DE EXPERTISE
            </span>
          </div>
          <h2 className="font-oswald text-5xl md:text-7xl lg:text-7xl font-black text-black dark:text-white uppercase tracking-tighter leading-[0.9]">
            SOLUCIONES ESTRATÉGICAS <br className="hidden md:block"/> DE CLASE MUNDIAL
          </h2>
          <p className="font-inter text-sm md:text-base text-neutral-600 dark:text-neutral-400 mt-6 max-w-2xl text-center leading-relaxed font-medium">
            Estructuras comerciales y de marketing sólidas diseñadas específicamente para maximizar la rentabilidad en el ecosistema del deporte de alto rendimiento.
          </p>
        </div>

        {/* Skewed Brutalist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-6 md:gap-x-10 lg:px-10 justify-items-center">
          {services.map((svc, idx) => (
            <div 
              key={idx} 
              className="brutalist-card group relative w-full max-w-[350px] lg:max-w-[320px] xl:max-w-[340px] 2xl:max-w-[360px] h-[450px] lg:h-[420px] xl:h-[450px] 2xl:h-[480px] bg-white dark:bg-[#1A1A1A] overflow-hidden shadow-2xl transition-transform duration-500 hover:-translate-y-4 cursor-pointer rounded-[40px] border border-black/10 dark:border-white/10"
              style={{ transform: 'skewX(-8deg)' }}
            >
              {/* Un-skew wrapper for image to prevent warping */}
              <div 
                className="absolute inset-0 w-[120%] h-[75%] -ml-[10%]" 
                style={{ transform: 'skewX(8deg)' }}
              >
                <img 
                  src={svc.image} 
                  alt={svc.title}
                  className="w-full h-full object-cover grayscale-0 md:grayscale md:group-hover:grayscale-0 transition-[filter,transform] duration-700 scale-100 md:scale-110 md:group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-transparent md:bg-white/20 dark:md:bg-black/20 md:group-hover:bg-transparent transition-colors duration-500"></div>
              </div>

              {/* Bottom Text Box */}
              <div className="absolute bottom-0 w-full h-[40%] bg-white/90 dark:bg-[#0D0D0D]/90 backdrop-blur-md flex flex-col justify-center items-center px-6 border-t-4 border-[#B79657]">
                <div style={{ transform: 'skewX(8deg)' }} className="text-center w-full">
                  <h3 className="font-oswald text-2xl font-black text-black dark:text-white uppercase tracking-tight mb-2">
                    {svc.title}
                  </h3>
                  <p className="font-inter text-[11px] md:text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
                    {svc.desc}
                  </p>
                </div>
              </div>

              {/* Accent Line */}
              <div className="absolute top-0 left-0 w-1 h-full bg-[#B79657] transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
