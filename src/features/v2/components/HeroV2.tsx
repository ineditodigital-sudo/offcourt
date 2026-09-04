import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight } from 'lucide-react';

export const HeroV2: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.fromTo('.hero-text-line', 
        { y: 60, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: "power4.out", delay: 0.2 }
      )
      .fromTo('.hero-sub-element',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out" },
        "-=0.8"
      )
      .fromTo(imageRef.current,
        { x: '10%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 1.5, ease: "power2.out" },
        "-=1.2"
      );
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[100svh] w-full flex overflow-hidden bg-white dark:bg-[#0A0A0A] transition-colors duration-300"
    >
      {/* Mobile Background Video (Hidden on md) */}
      <div className="absolute inset-0 z-0 md:hidden overflow-hidden">
        <video 
          src="/hero-offcourt.mp4" 
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover grayscale opacity-40 dark:opacity-20 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#0A0A0A] dark:via-[#0A0A0A]/80 dark:to-transparent"></div>
      </div>

      {/* Right Side - Skewed Image Container */}
      <div 
        ref={imageRef}
        className="absolute top-0 -right-[10%] w-[65%] md:w-[60%] lg:w-[65%] xl:w-[70%] h-[120%] -top-[10%] bg-black overflow-hidden z-0 hidden md:block rounded-l-[40px] border-l-8 border-[#B79657]/20"
        style={{ transform: 'skewX(-12deg)' }}
      >
        {/* Un-skew wrapper for image */}
        <div className="absolute inset-0 w-[120%] h-full -ml-[10%]" style={{ transform: 'skewX(12deg)' }}>
          <video 
            src="/hero-offcourt.mp4" 
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-1000 scale-105 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/40 dark:from-[#0A0A0A]/95 dark:via-[#0A0A0A]/40 to-transparent transition-colors duration-300"></div>
          <div className="absolute inset-0 bg-[#B79657]/10 mix-blend-overlay"></div>
        </div>
      </div>

      {/* Left Side - Massive Text Area */}
      <div className="relative z-10 flex flex-col justify-center min-h-[100svh] w-full md:w-[55%] lg:w-[50%] px-6 md:px-16 lg:px-24 pt-32 pb-24 md:py-0">
        


        <div ref={textRef} className="w-full flex flex-col items-start select-none z-10">
          <div className="overflow-hidden">
            <h1 className="hero-text-line pr-4 font-oswald text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black text-black dark:text-white uppercase leading-[0.85] tracking-tighter">
              EL VERDADERO VALOR
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="hero-text-line pr-4 font-oswald text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black text-black dark:text-white uppercase leading-[0.85] tracking-tighter">
              DEL DEPORTE SUCEDE
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="hero-text-line pr-4 font-oswald text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black text-[#B79657] uppercase leading-[0.85] tracking-tighter">
              FUERA DE LA CANCHA.
            </h1>
          </div>
        </div>

        <div className="mt-10 hero-sub-element max-w-md z-10">
          <p className="font-inter text-sm md:text-base lg:text-sm xl:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
            Agencia premium de Sports Marketing, Representación y Desarrollo Comercial.
          </p>
        </div>

        <div className="mt-12 hero-sub-element">
          <button 
            onClick={() => {
              const servicesSection = document.getElementById('expertise');
              if (servicesSection) {
                servicesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="group relative flex items-center justify-center gap-3 bg-black dark:bg-white text-white dark:text-black px-8 py-4 font-plus font-bold uppercase tracking-widest text-sm transform -skew-x-12 hover:bg-[#B79657] dark:hover:bg-[#B79657] hover:text-black transition-colors duration-300"
          >
            <span className="block transform skew-x-12 flex items-center gap-2">
              Ver Soluciones <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

      </div>



      {/* Decorative Slanted Block at bottom right */}
      <div className="absolute bottom-0 right-0 w-[40%] h-32 bg-[#B79657] transform origin-bottom-right -skew-y-2 z-20 translate-y-24 opacity-20"></div>
    </section>
  );
};
