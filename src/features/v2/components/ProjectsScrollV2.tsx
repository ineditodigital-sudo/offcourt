import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ProjectsScrollV2: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const projects = [
    { title: 'PAOLA RINCÓN X PIRMA, PUMA, TECATE, LEAGUES CUP, BYD, NECAXA', img: '/fotos/IMG_021.webp', role: 'Sponsorship' },
    { title: 'MASTER CLASS - THE ATHLETE BRAND X SDX SPORTS', img: '/fotos/IMG_024.webp', role: 'Education' },
    { title: 'THE SPORTS MIND', img: '/fotos/IMG_008.webp', role: 'Cognitive' }
  ];

  useEffect(() => {
    // We removed GSAP pinning for a native CSS horizontal scroll experience
    // which fixes the "scroll stops too much for 3 cards" issue.
  }, []);

  return (
    <section ref={sectionRef} className="h-auto md:h-screen w-full bg-[#FAFAFA] dark:bg-[#050505] overflow-hidden flex flex-col md:justify-center relative py-20 md:py-0 transition-colors duration-300">
      <div className="relative md:absolute md:top-10 md:left-10 z-10 px-6 md:px-0 mb-10 md:mb-0">
        <h2 className="font-oswald text-5xl md:text-7xl font-black text-black dark:text-white uppercase tracking-tighter">
          PROYECTOS
        </h2>
      </div>

      {/* Native Horizontal Scroll Container */}
      <div ref={scrollContainerRef} className="flex flex-col md:flex-row gap-10 md:gap-20 px-6 md:px-32 items-center md:h-full md:pt-20 w-full md:w-full md:overflow-x-auto snap-y md:snap-x md:snap-mandatory hide-scrollbar">
        {projects.map((proj, i) => (
          <div 
            key={i} 
            className="group relative w-full max-w-[350px] md:min-w-[450px] lg:min-w-[400px] xl:min-w-[440px] 2xl:min-w-[480px] h-[450px] md:h-[650px] lg:h-[500px] xl:h-[550px] 2xl:h-[600px] overflow-hidden flex-shrink-0 cursor-pointer shadow-2xl rounded-[40px] border border-black/10 dark:border-white/10 md:snap-center"
            style={{ transform: 'skewX(-10deg)' }}
          >
            {/* Un-skew Image */}
            <div className="absolute inset-0 w-[120%] h-full -ml-[10%]" style={{ transform: 'skewX(10deg)' }}>
              <img 
                src={proj.img} 
                alt={proj.title}
                className="w-full h-full object-cover grayscale-0 md:grayscale md:contrast-125 md:group-hover:grayscale-0 transition-all duration-700 scale-100 md:scale-110 md:group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-transparent md:bg-white/30 dark:md:bg-black/40 md:group-hover:bg-white/10 dark:md:group-hover:bg-black/10 transition-colors duration-500"></div>
            </div>

            {/* Glassmorphism Title Overlay */}
            <div className="absolute bottom-10 -left-6 z-10 bg-white/60 dark:bg-black/60 backdrop-blur-md border-y border-r border-white/40 dark:border-white/10 px-8 py-4 text-black dark:text-white rounded-r-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] max-w-[90%]">
              <div style={{ transform: 'skewX(10deg)' }}>
                <h3 className="font-oswald text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tight">{proj.title}</h3>
                <p className="font-plus text-[10px] md:text-sm font-bold uppercase tracking-widest text-[#B79657] drop-shadow-sm mt-1">{proj.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
