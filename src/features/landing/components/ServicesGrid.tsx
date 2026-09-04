import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Target, Globe, Users, Briefcase, Award, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    id: 'sports-marketing',
    num: '01',
    title: 'SPORTS MARKETING',
    description: 'Conectamos marcas con audiencias apasionadas mediante patrocinios y activaciones que aseguran un alto retorno de inversión.',
    icon: Target,
    image: '/fotos/IMG_027.webp'
  },
  {
    id: 'clinicas-camps',
    num: '02',
    title: 'CLÍNICAS Y CAMPAMENTOS INTERNACIONALES',
    description: 'Desarrollamos talento local con impacto global mediante alianzas estratégicas, incluyendo programas con la Rafa Nadal Academy.',
    icon: Globe,
    image: '/fotos/IMG_022.webp'
  },
  {
    id: 'experiencias',
    num: '03',
    title: 'EXPERIENCIAS CORPORATIVAS, CONFERENCIAS Y ORGANIZACIÓN DE EQUIPOS DEPORTIVOS',
    description: 'Team building de élite. Llevamos el liderazgo y la resiliencia del deporte profesional directamente al corazón de tu empresa.',
    icon: Briefcase,
    image: '/fotos/IMG_013.webp'
  },
  {
    id: 'representacion',
    num: '04',
    title: 'REPRESENTACIÓN COMERCIAL DE ATLETAS Y CREADORES DE CONTENIDO',
    description: 'Gestionamos la imagen corporativa de atletas y creadores, transformándolos en marcas rentables y atractivas para sponsors.',
    icon: Users,
    image: '/fotos/IMG_002.webp'
  },
  {
    id: 'branding',
    num: '05',
    title: 'BRANDING DEPORTIVO',
    description: 'Diseñamos narrativas e identidades visuales poderosas para clubes, franquicias y entidades deportivas que buscan destacar.',
    icon: Award,
    image: '/fotos/IMG_014.webp'
  },
  {
    id: 'desarrollo',
    num: '06',
    title: 'DESARROLLO DE PROYECTOS Y COMPLEJOS DEPORTIVOS',
    description: 'Desde la planificación financiera hasta la ejecución técnica, estructuramos infraestructura deportiva altamente rentable.',
    icon: TrendingUp,
    image: '/fotos/IMG_020.webp'
  },
];

export const ServicesGrid: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Smooth header fade in
      gsap.fromTo('.services-header > *', 
        { y: 60, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.15, 
          duration: 1.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          }
        }
      );

      // Cards stagger entry
      gsap.fromTo('.service-card',
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.services-grid-container',
            start: 'top 75%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleCTA = (e: React.MouseEvent, interest: string) => {
    e.stopPropagation();
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      const selectElement = document.getElementById('interest') as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = interest;
        const event = new Event('change', { bubbles: true });
        selectElement.dispatchEvent(event);
      }
    }
  };

  return (
    <section 
      id="expertise" 
      ref={sectionRef}
      className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-white dark:bg-[#050505] text-neutral-900 dark:text-white relative border-b border-neutral-200 dark:border-white/10 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="services-header space-y-4 max-w-4xl mb-16 relative">
          <span className="text-gold uppercase tracking-[0.3em] text-xs font-black block mb-4">
            NUESTRAS ÁREAS DE EXPERTISE
          </span>
          <h2 className="font-oswald text-5xl md:text-7xl lg:text-7xl uppercase font-bold tracking-tighter leading-[0.9] text-black dark:text-white transition-colors duration-300">
            SOLUCIONES ESTRATÉGICAS DE CLASE MUNDIAL
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 font-inter text-sm md:text-base max-w-lg mt-8 leading-relaxed font-medium transition-colors duration-300">
            Estructuras comerciales y de marketing sólidas diseñadas específicamente para maximizar la rentabilidad en el ecosistema del deporte de alto rendimiento.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="services-grid-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-neutral-200 dark:border-white/10 bg-white dark:bg-[#050505] transition-colors duration-300">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div 
                key={service.id}
                className="service-card group relative h-[400px] md:h-[500px] border-b border-r border-neutral-200 dark:border-white/10 bg-white dark:bg-black overflow-hidden cursor-pointer transition-colors duration-300"
                onClick={(e) => handleCTA(e, service.id)}
              >
                {/* Background Image with Dark to Color Hover */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-[filter,transform,opacity] duration-[1200ms] ease-out opacity-100 md:opacity-60 grayscale-0 md:grayscale group-hover:grayscale-0 md:group-hover:scale-110 group-hover:opacity-100 z-0"
                  style={{ backgroundImage: `url(${service.image})` }}
                ></div>
                
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-black dark:via-black/60 dark:to-black/20 group-hover:from-white/90 group-hover:via-white/70 dark:group-hover:from-black/90 dark:group-hover:via-black/50 transition-colors duration-700 z-10"></div>
                
                {/* Content Container */}
                <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between z-20">
                  
                  {/* Top Bar: Icon and Number */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 flex items-center justify-center border border-black/20 dark:border-white/20 rounded-none group-hover:border-gold/50 transition-colors duration-500 bg-white/20 dark:bg-black/20 backdrop-blur-sm group-hover:bg-gold/20 text-black/80 dark:text-white/80 group-hover:text-gold dark:group-hover:text-gold">
                      <Icon size={20} />
                    </div>
                    <span className="font-oswald text-4xl md:text-5xl font-bold text-black/30 dark:text-white/30 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors duration-500">
                      {service.num}
                    </span>
                  </div>

                  {/* Text Details */}
                  <div className="space-y-4">
                    <h3 className="font-oswald text-3xl md:text-4xl uppercase font-bold tracking-tight text-black dark:text-white group-hover:text-gold dark:group-hover:text-gold transition-colors duration-500">
                      {service.title}
                    </h3>

                    {/* Hidden Description that reveals on hover (sliding up) */}
                    <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] group-hover:grid-rows-[1fr] opacity-100 md:opacity-0 group-hover:opacity-100 transition-[grid-template-rows,opacity] duration-700 ease-out">
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 font-inter leading-relaxed overflow-hidden">
                        {service.description}
                      </p>
                    </div>

                    {/* Bottom Action Line */}
                    <div className="flex items-center gap-3 pt-4 border-t border-black/20 dark:border-white/20 group-hover:border-gold/50 transition-colors duration-500">
                      <span className="text-xs uppercase font-bold tracking-widest text-black/70 dark:text-white/70 group-hover:text-gold dark:group-hover:text-gold transition-colors duration-500">
                        Agendar Sesión
                      </span>
                      <ArrowRight size={14} className="text-black/50 dark:text-white/50 group-hover:text-gold dark:group-hover:text-gold transition-colors duration-500 transform translate-x-0 md:-translate-x-4 opacity-100 md:opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
