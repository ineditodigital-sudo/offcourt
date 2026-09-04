import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Calendar, Award, Users, TrendingUp } from 'lucide-react';

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.8 } });
      
      // Hyper-smooth reveal sequence
      tl.fromTo('.hero-bg', { scale: 1.1, filter: 'brightness(0.3)' }, { scale: 1, filter: 'brightness(0.5)', duration: 3.5, ease: 'sine.out' })
        .fromTo('.tactical-grid-line-v', { scaleY: 0 }, { scaleY: 1, transformOrigin: 'top center', stagger: 0.1, duration: 1.5 }, '-=3.0')
        .fromTo('.tactical-grid-line-h', { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left center', stagger: 0.1, duration: 1.5 }, '-=2.8')
        .fromTo(titleRef.current, { y: 100, opacity: 0 }, { y: 0, opacity: 1 }, '-=2.0')
        .fromTo(subtitleRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1 }, '-=1.7')
        .fromTo(buttonsRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1 }, '-=1.5')
        .fromTo('.floating-badge', { x: -30, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.15 }, '-=1.2')
        .fromTo(bannerRef.current, { y: 100, opacity: 0 }, { y: 0, opacity: 1 }, '-=1.0');

      // Infinite slow background movement
      gsap.to('.hero-bg', {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleScroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      ref={containerRef}
      className="relative h-screen w-full flex flex-col justify-between overflow-hidden bg-white dark:bg-black text-black dark:text-white transition-colors duration-300"
    >
      {/* Background Video */}
      <div className="hero-bg absolute inset-0">
        <video 
          src="/hero-offcourt.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>
      {/* Editorial overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-white/20 dark:from-black dark:via-black/35 dark:to-black/20 transition-colors duration-300"></div>

      {/* Tactical Grid Overlay Lines (Blueprint Sport look) */}
      <div className="absolute inset-0 pointer-events-none z-10 hidden md:block">
        <div className="tactical-grid-line-v absolute left-[10%] top-0 w-[1px] h-full bg-black/10 dark:bg-white/10 transition-colors"></div>
        <div className="tactical-grid-line-v absolute left-[50%] top-0 w-[1px] h-full bg-black/10 dark:bg-white/10 transition-colors"></div>
        <div className="tactical-grid-line-v absolute right-[10%] top-0 w-[1px] h-full bg-black/10 dark:bg-white/10 transition-colors"></div>
        <div className="tactical-grid-line-h absolute left-0 top-[20%] w-full h-[1px] bg-black/10 dark:bg-white/10 transition-colors"></div>
        <div className="tactical-grid-line-h absolute left-0 bottom-[120px] w-full h-[1px] bg-black/10 dark:bg-white/10 transition-colors"></div>
      </div>



      {/* Center content */}
      <div className="flex-grow flex items-center px-6 md:px-12 lg:px-24 relative z-20">
        <div className="max-w-7xl mx-auto w-full pt-28 md:pt-16">
          <div className="floating-badge border border-neutral-300 dark:border-white/20 bg-white/45 dark:bg-black/45 backdrop-blur-md px-4 py-2 rounded-none flex items-center gap-3 w-fit mb-8 transition-colors">
            <div className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest font-inter">Sports Marketing Elite</span>
          </div>

          <span className="text-gold uppercase tracking-[0.4em] text-xs font-black block mb-4">
            OFFCOURT SPORTS GROUP
          </span>
          
          <h1 
            ref={titleRef}
            className="font-oswald text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold tracking-tighter uppercase leading-[1.1] text-black dark:text-white pl-2 overflow-visible transition-colors"
          >
            EL VERDADERO VALOR DEL DEPORTE <br />
            <span className="text-gold">SUCEDE FUERA DE LA CANCHA.</span>
          </h1>

          <p 
            ref={subtitleRef}
            className="font-inter text-sm md:text-base lg:text-sm xl:text-base 2xl:text-lg text-neutral-700 dark:text-gray-300 mt-6 xl:mt-8 mb-8 xl:mb-10 max-w-2xl leading-relaxed tracking-wide transition-colors"
          >
            Agencia premium de Sports Marketing, Representación y Desarrollo Comercial.
          </p>

          <div 
            ref={buttonsRef}
            className="flex flex-wrap items-center gap-4"
          >
            <button
              onClick={() => handleScroll('contacto')}
              className="bg-black dark:bg-white hover:bg-gold dark:hover:bg-gold hover:text-black text-white dark:text-black font-bold uppercase tracking-widest text-xs px-10 py-5 rounded-none flex items-center justify-center gap-2 transition-colors duration-300 border border-black dark:border-white cursor-pointer"
            >
              <Calendar size={16} />
              Agenda una videollamada
            </button>
            <button
              onClick={() => handleScroll('expertise')}
              className="border border-neutral-300 dark:border-white/30 hover:border-gold dark:hover:border-gold hover:text-gold text-black dark:text-white font-bold uppercase tracking-widest text-xs px-10 py-5 rounded-none transition-colors duration-300 cursor-pointer bg-white/40 dark:bg-black/40 backdrop-blur-sm"
            >
              Nuestros Servicios
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Tactical Metrics Bar */}
      <div 
        ref={bannerRef}
        className="w-full bg-white/60 dark:bg-black/60 backdrop-blur-md relative z-20 border-t border-neutral-200 dark:border-white/10 transition-colors"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-white/10 text-center py-6">
          <div className="flex items-center justify-center gap-4 py-4 md:py-0">
            <Award className="text-gold" size={24} />
            <div className="text-left">
              <p className="font-oswald text-xl uppercase font-bold text-black dark:text-white tracking-wide transition-colors">Alianzas Globales</p>
              <p className="text-xs text-neutral-500 dark:text-gray-400 font-medium font-inter transition-colors">Rafa Nadal Academy Alliance</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 py-4 md:py-0">
            <Users className="text-gold" size={24} />
            <div className="text-left">
              <p className="font-oswald text-xl uppercase font-bold text-black dark:text-white tracking-wide transition-colors">Representación</p>
              <p className="text-xs text-neutral-500 dark:text-gray-400 font-medium font-inter transition-colors">Patrocinios de Élite</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 py-4 md:py-0">
            <TrendingUp className="text-gold" size={24} />
            <div className="text-left">
              <p className="font-oswald text-xl uppercase font-bold text-black dark:text-white tracking-wide transition-colors">Desarrollo Comercial</p>
              <p className="text-xs text-neutral-500 dark:text-gray-400 font-medium font-inter transition-colors">Complejos y Proyectos de Alto Nivel</p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};
