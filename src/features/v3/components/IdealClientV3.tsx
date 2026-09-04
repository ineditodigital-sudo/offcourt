import React, { useEffect, useRef } from 'react';
import { cargarGsap } from '../../../lib/gsapLazy';
import { Megaphone, Building2, Landmark, Trophy, GraduationCap, CalendarDays, Plane } from 'lucide-react';

const targets = [
  {
    label: 'ATLETAS PROFESIONALES Y EMERGENTES',
    desc: 'Convertimos tu talento en una marca personal rentable y atractiva para patrocinadores.',
    Icon: Trophy,
    img: '/fotos/IMG_008.webp',
    classDesktop: 'md:col-span-2 md:row-span-2',
    classMobile: 'col-span-2',
  },
  {
    label: 'FAMILIAS Y AFICIONADOS',
    desc: 'Turismo deportivo de élite: clínicas y campamentos internacionales de pádel, tenis y más.',
    Icon: Plane,
    img: '/fotos/IMG_021.webp',
    classDesktop: 'md:col-span-1 md:row-span-2',
    classMobile: 'col-span-1',
  },
  {
    label: 'PADRES CON HIJOS DEPORTISTAS',
    desc: 'Acompañamiento estratégico para aspirar a becas deportivas en el extranjero.',
    Icon: GraduationCap,
    img: '/fotos/IMG_O10.webp',
    classDesktop: 'md:col-span-2 md:row-span-1',
    classMobile: 'col-span-1',
  },
  {
    label: 'MARCAS Y PATROCINADORES',
    desc: 'Conectamos tu marca con el ecosistema deportivo, con presencia y retorno real.',
    Icon: Megaphone,
    img: '/fotos/IMG_003.webp',
    classDesktop: 'md:col-span-1 md:row-span-1',
    classMobile: 'col-span-1',
  },
  {
    label: 'CLUBES Y ACADEMIAS',
    desc: 'Potenciamos el modelo de negocio y el posicionamiento de tu club.',
    Icon: Building2,
    img: '/fotos/IMG_024.webp',
    classDesktop: 'md:col-span-1 md:row-span-1',
    classMobile: 'col-span-1',
  },
  {
    label: 'GOBIERNOS E INSTITUCIONES',
    desc: 'Estrategias deportivas de impacto social, turístico y económico.',
    Icon: Landmark,
    img: '/fotos/IMG_017.webp',
    classDesktop: 'md:col-span-1 md:row-span-1',
    classMobile: 'col-span-1',
  },
  {
    label: 'EVENTOS Y CORPORATIVOS',
    desc: 'Eventos de alto impacto y el deporte como plataforma de networking premium.',
    Icon: CalendarDays,
    img: '/fotos/IMG_016.webp',
    classDesktop: 'md:col-span-1 md:row-span-1',
    classMobile: 'col-span-1',
  },
];

export const IdealClientV3: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelado = false;

    // GSAP viaja en su propio chunk. Esta sección queda bajo el pliegue,
    // así que para cuando el visitante la alcanza la librería ya llegó y la
    // animación se ve igual que antes.
    cargarGsap().then(({ gsap }) => {
      if (cancelado) return;
      ctx = gsap.context(() => {
        gsap.fromTo('.bento-card',
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            }
          }
        );
      }, sectionRef);
    });

    return () => { cancelado = true; ctx?.revert(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 px-4 sm:px-6 md:px-12 lg:px-24 bg-[#1b1b1b] transition-colors duration-300"
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10 md:mb-12">
          <span className="text-[#fda211] uppercase tracking-[0.3em] text-xs font-sarabun font-extrabold mb-3 block">
            NUESTROS CLIENTES
          </span>
          <h2 className="font-outfit italic text-4xl sm:text-5xl md:text-6xl uppercase font-black text-white tracking-tighter leading-tight">
            ¿A QUIÉNES<br />AYUDAMOS?
          </h2>
        </div>

        {/* 
          Grid layout:
          Desktop (3 cols):
            Row 1+2: [Marcas 2×2] [Clubes 1×2]
            Row 3:   [Atletas 2×1] [Gobiernos 1×1]
            Row 4:   [Universidades 1] [Eventos 1] [Corporativos 1]

          Mobile (2 cols):
            [Marcas span-2]
            [Clubes] [Atletas span-... wait] — handled per-card
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[170px] sm:auto-rows-[190px] md:auto-rows-[200px] gap-3">
          {targets.map(({ label, desc, Icon, img, classDesktop, classMobile }, idx) => (
            <div
              key={idx}
              className={`bento-card group relative overflow-hidden rounded-2xl bg-[#111111] border border-white/10 hover:border-[#fda211]/50 transition-all duration-500 flex flex-col justify-end ${classMobile} ${classDesktop}`}
            >
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                style={{ backgroundImage: `url(${img})` }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Content */}
              <div className="relative z-10 p-4 md:p-5">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-[#fda211]/20 border border-[#fda211]/40 flex items-center justify-center mb-2.5 group-hover:bg-[#fda211]/30 transition-colors duration-300">
                  <Icon size={15} className="text-[#fda211]" />
                </div>
                <h3 className="font-outfit font-extrabold text-sm sm:text-base md:text-[15px] uppercase text-white leading-tight tracking-tight">
                  {label}
                </h3>
                <div className="overflow-hidden max-h-0 group-hover:max-h-16 transition-all duration-500 ease-in-out">
                  <p className="font-sarabun text-xs text-white/50 mt-1.5 leading-snug">
                    {desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
