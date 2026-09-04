import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: 'paola-rincon',
    title: 'PAOLA RINCÓN X PIRMA, PUMA, TECATE, LEAGUES CUP, BYD, NECAXA',
    subtitle: 'Sponsorship & Representation',
    deliverables: 'Athlete Sponsorship • Brand Activation • Global PR',
    description: 'Campañas estratégicas y alianzas de alto nivel con marcas de renombre como Pirma, Puma, Tecate, Leagues Cup y BYD.',
    image: '/fotos/IMG_007.webp',
    className: 'lg:col-span-2 lg:row-span-2 min-h-[550px] md:min-h-[500px] lg:min-h-[450px] xl:min-h-[500px] 2xl:min-h-[600px]',
  },
  {
    id: 'masterclass',
    title: 'MASTER CLASS - THE ATHLETE BRAND X SDX SPORTS',
    subtitle: 'The Athlete Brand x SDX',
    deliverables: 'Commercial Education • Sports Management',
    description: 'Seminarios de comercialización deportiva y posicionamiento estratégico de marca para atletas de alto rendimiento.',
    image: '/fotos/IMG_015.webp',
    className: 'lg:col-span-1 lg:row-span-1 min-h-[450px] md:min-h-[400px] lg:min-h-[250px] xl:min-h-[350px] 2xl:min-h-[450px]',
  },
  {
    id: 'sportsmind',
    title: 'THE SPORTS MIND',
    subtitle: 'Sports Psychology',
    deliverables: 'Cognitive Strategy • High Performance',
    description: 'Modelos avanzados de entrenamiento cognitivo, resiliencia y preparación mental para atletas de nivel mundial.',
    image: '/fotos/IMG_025.webp',
    className: 'lg:col-span-1 lg:row-span-1 min-h-[450px] md:min-h-[400px] lg:min-h-[250px] xl:min-h-[350px] 2xl:min-h-[450px]',
  },
];

export const ProjectsScroll: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro headers reveal
      gsap.fromTo('.projects-header > *',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
          }
        }
      );

      // Bento cards reveal
      gsap.fromTo('.bento-card-wrap',
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.bento-grid-wrapper',
            start: 'top 75%',
          }
        }
      );

      // Image Parallax movement
      gsap.utils.toArray<HTMLElement>('.bento-img').forEach((img) => {
        gsap.to(img, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: img.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleProjectClick = () => {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div 
      ref={containerRef} 
      id="proyectos" 
      className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-white dark:bg-[#050505] text-neutral-900 dark:text-white relative border-b border-neutral-200 dark:border-white/10 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto relative z-20 space-y-16 md:space-y-24">
        
        {/* Header */}
        <div className="projects-header flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-gold uppercase tracking-[0.3em] text-xs font-black">CASOS Y PROYECTOS</span>
            <h2 className="font-oswald text-5xl md:text-7xl lg:text-7xl uppercase font-bold tracking-tighter leading-[0.9] text-black dark:text-white transition-colors duration-300">
              PROYECTOS DESTACADOS
            </h2>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 font-inter text-sm md:text-base max-w-sm leading-relaxed transition-colors duration-300">
            No somos solo consultores, somos ejecutores. Estos son algunos de nuestros desarrollos estratégicos que demuestran nuestra capacidad para crear valor real en la industria del deporte.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid-wrapper">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
            {projects.map((project) => (
              <div 
                key={project.id}
                onClick={handleProjectClick}
                className={`bento-card-wrap ${project.className} group relative rounded-none overflow-hidden cursor-pointer border border-neutral-200 dark:border-white/10`}
              >
                {/* Image Wrap for Parallax */}
                <div className="absolute inset-[-10%] w-[120%] h-[120%] z-0 bg-black">
                  <div 
                    className="bento-img w-full h-full bg-cover bg-center transition-transform duration-[2000ms] ease-out group-hover:scale-105 grayscale-0 md:grayscale md:group-hover:grayscale-0 opacity-80 md:opacity-100"
                    style={{ backgroundImage: `url(${project.image})` }}
                  ></div>
                </div>
                
                {/* Editorial overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-colors duration-700 z-10"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-20">
                  <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                    <span className="text-gold text-[10px] uppercase tracking-[0.2em] font-black mb-2 block">
                      {project.subtitle}
                    </span>
                    
                    <h3 className="font-oswald text-xl md:text-2xl lg:text-3xl uppercase font-bold tracking-tight mb-2 text-white">
                      {project.title}
                    </h3>
                    
                    <p className="text-xs text-gold uppercase font-bold tracking-widest mb-4">
                      {project.deliverables}
                    </p>

                    <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] group-hover:grid-rows-[1fr] opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out">
                      <p className="text-sm font-medium text-white leading-relaxed overflow-hidden">
                        {project.description}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest">
                      <span className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-0 md:translate-x-[-10px] group-hover:translate-x-0">
                        Explorar Caso
                      </span>
                      <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-gold group-hover:text-gold transition-colors duration-300">
                        <ExternalLink size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
