import React from 'react';
import { useSeo } from '../../../hooks/useSeo';
import { META, tituloServicio } from '../../../lib/metaRutas';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { servicesData } from '../data/servicios';
import { ContactFormV3 } from '../components/ContactFormV3';
import { PdfLink } from '../components/PdfLink';
import { scrollToSection } from '../../../lib/smoothScroll';

export const ServicePageV3: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const service = id && servicesData[id as keyof typeof servicesData] ? servicesData[id as keyof typeof servicesData] : null;

  useSeo(
    service ? tituloServicio(service.title) : META.serviciosGenerico.title,
    service ? service.description : META.serviciosGenerico.description,
  );

  if (!service) {
    return (
      <div className="pt-32 pb-24 text-center min-h-screen bg-[#e4e4e4] dark:bg-[#1b1b1b]">
        <h1 className="text-3xl font-outfit text-[#1b1b1b] dark:text-white">Servicio no encontrado</h1>
        <Link to="/" className="mt-6 inline-block text-[#fda211] underline font-sarabun">Volver al inicio</Link>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <div className="bg-white dark:bg-[#2e2f30] min-h-screen transition-colors duration-300 pt-24 pb-0">
      {/* Hero Section */}
      <section className="relative py-32 px-6 md:px-12 lg:px-24 bg-[#1b1b1b] overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1b1b1b] via-[#1b1b1b]/80 to-transparent z-10"></div>
          <img src={service.image} alt={service.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <Link to="/" className="inline-flex items-center gap-2 text-[#fda211] font-sarabun font-bold text-sm uppercase tracking-widest mb-8 hover:text-white transition-colors">
              <ArrowLeft size={16} /> Volver
            </Link>
            
            <div className="w-16 h-16 rounded-[16px] bg-[#fda211] flex items-center justify-center mb-6 shadow-lg shadow-[#fda211]/20">
              <Icon className="text-[#1b1b1b]" size={32} />
            </div>
            
            <h1 className="font-outfit italic text-3xl sm:text-4xl md:text-5xl lg:text-7xl uppercase font-extrabold text-white leading-[1] mb-6 drop-shadow-xl">
              {service.title}
            </h1>
            <p className="font-sarabun text-[#fda211] text-lg font-bold tracking-widest uppercase">
              {service.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Bento Box Grid Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#e4e4e4] dark:bg-[#1b1b1b] transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,_auto)]">
          
          {/* Card 1: Main Description & Challenge (2 cols wide) */}
          <div className="md:col-span-2 bg-white dark:bg-[#2e2f30] rounded-[32px] p-10 flex flex-col justify-between shadow-xl border border-black/5 dark:border-white/5 group transition-colors duration-300">
            <div>
              <h2 className="font-outfit italic text-3xl md:text-4xl uppercase font-extrabold text-[#1b1b1b] dark:text-white mb-6">El Contexto</h2>
              <div className="w-12 h-1 bg-[#fda211] mb-8"></div>
              <p className="font-sarabun text-[#2e2f30] dark:text-[#e4e4e4] text-lg leading-relaxed font-medium mb-8">
                {service.description}
              </p>
            </div>
            
            <div className="bg-[#1b1b1b] dark:bg-black p-6 rounded-[24px] border border-black/10 flex items-start gap-4">
              <AlertTriangle className="text-[#fda211] shrink-0" size={24} />
              <div>
                <p className="font-sarabun text-xs uppercase tracking-widest text-neutral-400 font-extrabold mb-1">El Desafío</p>
                <p className="font-sarabun text-white text-sm font-medium">{service.challenge}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Gallery Image 1 */}
          <div className="md:col-span-1 bg-[#1b1b1b] rounded-[32px] overflow-hidden relative shadow-xl min-h-[300px] md:min-h-full group">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ backgroundImage: `url(${service.gallery[0]})` }}
            ></div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
          </div>

          {/* Card 3: Key Stat */}
          <div className="md:col-span-1 bg-[#fda211] rounded-[32px] p-10 shadow-xl flex flex-col justify-center items-center text-center group hover:scale-[1.02] transition-transform duration-300">
            <h3 className="font-outfit italic text-5xl md:text-6xl uppercase font-extrabold text-[#1b1b1b] mb-4 drop-shadow-sm">
              {service.keyStat.value}
            </h3>
            <p className="font-sarabun text-[#1b1b1b] font-bold text-sm uppercase tracking-widest">
              {service.keyStat.label}
            </p>
          </div>

          {/* Card 4: Benefits List */}
          <div className="md:col-span-1 bg-white dark:bg-[#2e2f30] rounded-[32px] p-10 shadow-xl border border-black/5 dark:border-white/5 transition-colors duration-300">
            <h3 className="font-outfit italic text-2xl uppercase font-extrabold text-[#1b1b1b] dark:text-white mb-6">Entregables</h3>
            <ul className="flex flex-col gap-4">
              {service.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#fda211] flex-shrink-0 mt-1" size={20} />
                  <p className="font-sarabun text-sm text-[#2e2f30] dark:text-[#e4e4e4] font-bold leading-tight">{benefit}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 5: Gallery Image 2 */}
          <div className="md:col-span-1 bg-[#1b1b1b] rounded-[32px] overflow-hidden relative shadow-xl min-h-[300px] md:min-h-full group">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ backgroundImage: `url(${service.gallery[1]})` }}
            ></div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
          </div>

          {/* Card 6: Sales Pitch / Call to Action Anchor (3 cols wide) */}
          <div className="md:col-span-3 bg-[#1b1b1b] dark:bg-black rounded-[32px] p-10 md:p-16 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 border border-white/5">
            <div className="flex-1">
              <h2 className="font-outfit italic text-3xl md:text-4xl uppercase font-extrabold text-white leading-tight mb-4">
                "{service.salesPitch}"
              </h2>
              <p className="font-sarabun text-[#fda211] font-bold uppercase tracking-widest text-sm">
                Offcourt Sports Group
              </p>
            </div>
            <div className="flex-shrink-0">
              <button 
                onClick={() => scrollToSection('contacto')}
                className="bg-[#fda211] hover:bg-[#e5920f] text-[#1b1b1b] font-sarabun font-bold uppercase tracking-wider text-sm px-10 py-5 rounded-[20px] transition-colors duration-300 shadow-lg cursor-pointer whitespace-nowrap"
              >
                Iniciemos un Proyecto
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Creadora destacada (solo OFF COURT Creators) */}
      {id === 'creators' && (
        <section className="py-20 px-6 md:px-12 lg:px-24 bg-white dark:bg-[#2e2f30] transition-colors duration-300">
          <div className="max-w-5xl mx-auto">
            <span className="text-[#fda211] uppercase tracking-[0.2em] text-sm font-sarabun font-extrabold block mb-6">Creadora destacada</span>
            <div className="relative bg-gradient-to-br from-[#1b1b1b] to-[#2e2f30] rounded-[36px] shadow-2xl overflow-hidden border border-white/10">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#fda211]/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12 p-8 md:p-12">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1.5 rounded-[30px] bg-gradient-to-tr from-[#fda211] to-[#ffd37a] shadow-lg shadow-[#fda211]/30"></div>
                  <img src="/foto-pao.jpg" alt="Paola Rincón" className="relative w-44 h-44 md:w-56 md:h-56 object-cover rounded-[26px]" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <span className="inline-flex items-center gap-1.5 bg-[#fda211]/15 border border-[#fda211]/40 text-[#fda211] text-[10px] font-sarabun font-extrabold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4">Creadora de contenido deportivo</span>
                  <h3 className="font-outfit italic text-4xl md:text-5xl uppercase font-black text-white leading-none mb-2">Paola Rincón</h3>
                  <a href="https://www.instagram.com/paofifas23" target="_blank" rel="noopener noreferrer" className="font-sarabun text-[#fda211] font-bold text-lg hover:underline inline-block mb-4">@paofifas23</a>
                  <p className="font-sarabun text-[#e4e4e4] text-sm md:text-base mb-6 max-w-xl mx-auto md:mx-0">Conoce su alcance, audiencia y propuesta de valor. Descarga su media kit o visita su Instagram.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                    <PdfLink href="/brochures/Paola_Rincon_Media_Kit_2026.pdf" className="bg-[#fda211] hover:bg-[#e5920f] text-[#1b1b1b] font-sarabun font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-[16px] inline-flex items-center justify-center gap-2 transition-colors duration-300 shadow-lg cursor-pointer">
                      <Download size={16} /> Ver Media Kit
                    </PdfLink>
                    <a href="https://www.instagram.com/paofifas23" target="_blank" rel="noopener noreferrer" className="border-2 border-white/25 hover:border-[#fda211] hover:text-[#fda211] text-white font-sarabun font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-[16px] inline-flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> Ver fotos en Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <ContactFormV3 />
    </div>
  );
};
