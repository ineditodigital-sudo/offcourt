import React, { useEffect, useRef } from 'react';
import { cargarGsap } from '../../../lib/gsapLazy';
import { ExternalLink, TrendingUp, Users, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const solutions = [
  {
    id: 'consulting',
    title: 'OFF COURT CONSULTING',
    subtitle: 'Estrategia y Desarrollo de Negocio',
    deliverables: 'Consultoría • Modelos de Negocio',
    description: 'Auditamos, estructuramos y ejecutamos el plan que convierte tu proyecto deportivo en un activo rentable. Estrategia de sala de juntas, no de tribuna.',
    image: '/fotos/IMG_008.webp',
  },
  {
    id: 'experiences',
    title: 'OFF COURT EXPERIENCES',
    subtitle: 'Eventos, Clínicas y Camps',
    deliverables: 'Rafa Nadal Academy • Clínicas Internacionales',
    description: 'Experiencias y campamentos de alto rendimiento con metodologías de clase mundial —como la Rafa Nadal Academy— operados de forma directa, sin intermediarios.',
    image: '/rafa-nadal.webp',
  },
  {
    id: 'marketing',
    title: 'OFF COURT MARKETING',
    subtitle: 'Branding Deportivo, Contenido y Patrocinios',
    deliverables: 'Brand Identity • Sponsorships',
    description: 'Construimos identidad, narrativa y alianzas que convierten a marcas y atletas en referentes. Patrocinios que se sienten, no que solo se ven.',
    image: '/fotos/IMG_O10.webp',
  },
  {
    id: 'athletes',
    title: 'OFF COURT ATHLETES',
    subtitle: 'Representación Comercial y Marca Personal',
    deliverables: 'Sponsorships • Protección Financiera',
    description: 'Convertimos tu talento en una marca personal sólida y rentable, atractiva para patrocinadores y blindada con protección financiera para tu legado.',
    image: '/fotos/IMG_019.webp',
  },
  {
    id: 'creators',
    title: 'OFF COURT CREATORS',
    subtitle: 'Creadores de Contenido Deportivo',
    deliverables: 'Digital Creators • Media Strategy',
    description: 'Profesionalizamos, gestionamos y monetizamos a las nuevas voces del deporte, conectándolas con las marcas correctas.',
    image: '/fotos/IMG_012.webp',
  },
  {
    id: 'media',
    title: 'OFF COURT MEDIA',
    subtitle: 'Producción, Streaming y Medios',
    deliverables: 'Broadcasting • Content Production',
    description: 'Casa productora y medio propio: streaming de eventos, contenido original y distribución para escalar tu narrativa deportiva.',
    image: '/fotos/IMG_011.webp',
  },
  {
    id: 'ventures',
    title: 'OFF COURT VENTURES',
    subtitle: 'Eventos, Nuevos Proyectos y Alianzas',
    deliverables: 'Event Organization • Strategic Partnerships',
    description: 'Organizamos eventos, incubamos proyectos y estructuramos alianzas estratégicas para llevar ideas disruptivas del deporte al mercado.',
    image: '/fotos/IMG_025.webp',
  },
];

export const ProjectsScrollV3: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelado = false;

    // GSAP viaja en su propio chunk. Esta sección queda bajo el pliegue,
    // así que para cuando el visitante la alcanza la librería ya llegó y la
    // animación se ve igual que antes.
    cargarGsap().then(({ gsap }) => {
      if (cancelado) return;
      ctx = gsap.context(() => {
        gsap.fromTo('.v3-project-card',
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 75%',
            }
          }
        );
      
        gsap.fromTo('.v3-stat-card',
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            stagger: 0.1,
            duration: 1,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
            }
          }
        );
      }, containerRef);
    });

    return () => { cancelado = true; ctx?.revert(); };
  }, []);

  return (
    <div 
      ref={containerRef} 
      id="soluciones" 
      className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-white dark:bg-[#2e2f30] transition-colors duration-300"
    >
      <div className="max-w-[1600px] mx-auto space-y-16 md:space-y-24">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-[#fda211] uppercase tracking-[0.3em] text-xs font-sarabun font-extrabold">NUESTRAS VERTICALES</span>
            <h2 className="font-outfit italic text-4xl sm:text-5xl md:text-6xl uppercase font-extrabold text-[#1b1b1b] dark:text-white leading-[1]">
              SOLUCIONES
            </h2>
          </div>
          <p className="text-neutral-500 dark:text-[#e4e4e4] font-sarabun text-sm md:text-base max-w-sm leading-relaxed font-medium">
            Funcionamos como un Hub Integral para cubrir todas las necesidades comerciales del ecosistema deportivo bajo un mismo techo.
          </p>
        </div>

        {/* Hard Data / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-y border-black/10 dark:border-white/10 py-12">
          <div className="v3-stat-card flex flex-col items-center md:items-start text-center md:text-left">
            <TrendingUp className="text-[#fda211] mb-4" size={32} />
            <h3 className="font-outfit italic text-5xl font-extrabold text-[#1b1b1b] dark:text-white mb-2">7</h3>
            <p className="font-sarabun text-sm font-bold text-neutral-500 uppercase tracking-widest">Verticales Estratégicas</p>
          </div>
          <div className="v3-stat-card flex flex-col items-center md:items-start text-center md:text-left border-t md:border-t-0 md:border-l border-black/10 dark:border-white/10 pt-8 md:pt-0 md:pl-12">
            <Users className="text-[#fda211] mb-4" size={32} />
            <h3 className="font-outfit italic text-5xl font-extrabold text-[#1b1b1b] dark:text-white mb-2">100%</h3>
            <p className="font-sarabun text-sm font-bold text-neutral-500 uppercase tracking-widest">Enfoque Deportivo</p>
          </div>
          <div className="v3-stat-card flex flex-col items-center md:items-start text-center md:text-left border-t md:border-t-0 md:border-l border-black/10 dark:border-white/10 pt-8 md:pt-0 md:pl-12">
            <Target className="text-[#fda211] mb-4" size={32} />
            <h3 className="font-outfit italic text-5xl font-extrabold text-[#1b1b1b] dark:text-white mb-2">360°</h3>
            <p className="font-sarabun text-sm font-bold text-neutral-500 uppercase tracking-widest">Estrategia Integral</p>
          </div>
        </div>

        {/* Flex Accordion Projects */}
        <div className="flex flex-col lg:flex-row gap-2 w-full h-[1200px] lg:h-[650px]">
          {solutions.map((project) => (
            <div 
              key={project.id}
              onClick={() => navigate(`/servicios/${project.id}`)}
              className={`v3-project-card group relative overflow-hidden rounded-[24px] cursor-pointer shadow-lg bg-[#1b1b1b] flex-1 lg:hover:flex-[3] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col justify-end`}
            >
              <div className="absolute inset-0">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url(${project.image})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b1b] via-[#1b1b1b]/70 to-transparent z-10"></div>
              </div>
                
              <div className="relative z-20 p-4 md:p-6 flex flex-col justify-end h-full">
                <div className="mt-auto">
                  <span className="text-[#fda211] font-sarabun text-[9px] uppercase tracking-[0.2em] font-extrabold mb-2 block whitespace-nowrap overflow-hidden text-ellipsis">
                    {project.subtitle}
                  </span>
                  
                  <h3 className="font-outfit italic text-lg md:text-xl font-extrabold uppercase mb-2 text-white line-clamp-2">
                    {project.title}
                  </h3>
                  
                  <p className="text-[10px] md:text-xs text-[#e4e4e4] font-sarabun font-medium mb-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 line-clamp-1">
                    {project.deliverables}
                  </p>

                  <div className="grid grid-rows-[0fr] lg:group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
                    <div className="overflow-hidden">
                      <div className="pt-1 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        <p className="font-sarabun text-xs md:text-sm font-medium text-[#e4e4e4] mb-4 line-clamp-3">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-2 text-white font-sarabun font-bold text-xs uppercase tracking-widest">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#fda211] group-hover:text-[#1b1b1b] transition-colors duration-300">
                            <ExternalLink size={14} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
