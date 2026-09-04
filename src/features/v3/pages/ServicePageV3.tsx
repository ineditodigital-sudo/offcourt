import React from 'react';
import { useSeo } from '../../../hooks/useSeo';
import { tituloServicio } from '../../../lib/metaRutas';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { ContactFormV3 } from '../components/ContactFormV3';
import { PdfLink } from '../components/PdfLink';
import { useContenido } from '../../../cms/ContenidoContext';
import { Tx, Im, Btn, marcar } from '../../../cms/Editable';
import { Icono } from '../../../cms/iconos';

const KT = 'paginas.servicios.textos';
const KC = 'paginas.servicios.creadora';

export const ServicePageV3: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { servicios } = useContenido().paginas;

  // Se busca por el identificador de la ruta y se conserva el índice: es lo que
  // enlaza cada texto de esta página con su campo en el panel.
  const indice = servicios.items.findIndex((s) => s.id === id);
  const service = indice === -1 ? null : servicios.items[indice];
  const visible = !!service && service.visible;

  useSeo(
    visible ? tituloServicio(service.titulo) : servicios.seo.titulo,
    visible ? service.descripcion : servicios.seo.descripcion,
    servicios.seo.imagen.src,
  );

  if (!service || !visible) {
    return (
      <div className="pt-32 pb-24 text-center min-h-screen bg-gris-claro dark:bg-negro">
        <Tx k={`${KT}.noEncontrado`} as="h1" className="text-3xl font-outfit text-negro dark:text-white" />
        <Link to="/" className="mt-6 inline-block text-marca underline font-sarabun"><Tx k={`${KT}.volverInicio`} /></Link>
      </div>
    );
  }

  const K = `paginas.servicios.items.${indice}`;
  const creadora = servicios.creadora;

  return (
    <div className="bg-white dark:bg-gris-oscuro min-h-screen transition-colors duration-300 pt-24 pb-0">
      {/* Hero Section */}
      <section className="relative py-32 px-6 md:px-12 lg:px-24 bg-negro overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-r from-negro via-negro/80 to-transparent z-10 pointer-events-none"></div>
          <Im k={`${K}.imagen`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <Link to="/" className="inline-flex items-center gap-2 text-marca font-sarabun font-bold text-sm uppercase tracking-widest mb-8 hover:text-white transition-colors">
              <ArrowLeft size={16} /> <Tx k={`${KT}.volver`} />
            </Link>

            <div data-oc={`${K}.icono`} className="w-16 h-16 rounded-[16px] bg-marca flex items-center justify-center mb-6 shadow-lg shadow-marca/20">
              <Icono clave={service.icono} className="text-negro" size={32} />
            </div>

            <Tx k={`${K}.titulo`} as="h1" className="font-outfit italic text-3xl sm:text-4xl md:text-5xl lg:text-7xl uppercase font-extrabold text-white leading-[1] mb-6 drop-shadow-xl" />
            <Tx k={`${K}.subtitulo`} as="p" className="font-sarabun text-marca text-lg font-bold tracking-widest uppercase" />
          </div>
        </div>
      </section>

      {/* Bento Box Grid Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-gris-claro dark:bg-negro transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,_auto)]">

          {/* Card 1: Main Description & Challenge (2 cols wide) */}
          <div className="md:col-span-2 bg-white dark:bg-gris-oscuro rounded-[32px] p-10 flex flex-col justify-between shadow-xl border border-black/5 dark:border-white/5 group transition-colors duration-300">
            <div>
              <Tx k={`${KT}.contexto`} as="h2" className="font-outfit italic text-3xl md:text-4xl uppercase font-extrabold text-negro dark:text-white mb-6" />
              <div className="w-12 h-1 bg-marca mb-8"></div>
              <Tx k={`${K}.descripcion`} as="p" className="font-sarabun text-gris-oscuro dark:text-gris-claro text-lg leading-relaxed font-medium mb-8" />
            </div>

            <div className="bg-negro dark:bg-black p-6 rounded-[24px] border border-black/10 flex items-start gap-4">
              <AlertTriangle className="text-marca shrink-0" size={24} />
              <div>
                <Tx k={`${KT}.desafio`} as="p" className="font-sarabun text-xs uppercase tracking-widest text-neutral-400 font-extrabold mb-1" />
                <Tx k={`${K}.reto`} as="p" className="font-sarabun text-white text-sm font-medium" />
              </div>
            </div>
          </div>

          {/* Card 2: Gallery Image 1 */}
          <div className="md:col-span-1 bg-negro rounded-[32px] overflow-hidden relative shadow-xl min-h-[300px] md:min-h-full group">
            <div
              {...marcar(`${K}.galeria1`)}
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ backgroundImage: `url(${service.galeria1.src})` }}
            ></div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 pointer-events-none"></div>
          </div>

          {/* Card 3: Key Stat */}
          <div className="md:col-span-1 bg-marca rounded-[32px] p-10 shadow-xl flex flex-col justify-center items-center text-center group hover:scale-[1.02] transition-transform duration-300">
            <Tx k={`${K}.datoCifra`} as="h3" className="font-outfit italic text-5xl md:text-6xl uppercase font-extrabold text-negro mb-4 drop-shadow-sm" />
            <Tx k={`${K}.datoTexto`} as="p" className="font-sarabun text-negro font-bold text-sm uppercase tracking-widest" />
          </div>

          {/* Card 4: Benefits List */}
          <div className="md:col-span-1 bg-white dark:bg-gris-oscuro rounded-[32px] p-10 shadow-xl border border-black/5 dark:border-white/5 transition-colors duration-300">
            <Tx k={`${KT}.entregables`} as="h3" className="font-outfit italic text-2xl uppercase font-extrabold text-negro dark:text-white mb-6" />
            <ul className="flex flex-col gap-4">
              {service.beneficios.map((_, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="text-marca flex-shrink-0 mt-1" size={20} />
                  <Tx k={`${K}.beneficios.${idx}.texto`} as="p" className="font-sarabun text-sm text-gris-oscuro dark:text-gris-claro font-bold leading-tight" />
                </li>
              ))}
            </ul>
          </div>

          {/* Card 5: Gallery Image 2 */}
          <div className="md:col-span-1 bg-negro rounded-[32px] overflow-hidden relative shadow-xl min-h-[300px] md:min-h-full group">
            <div
              {...marcar(`${K}.galeria2`)}
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ backgroundImage: `url(${service.galeria2.src})` }}
            ></div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 pointer-events-none"></div>
          </div>

          {/* Card 6: Sales Pitch / Call to Action Anchor (3 cols wide) */}
          <div className="md:col-span-3 bg-negro dark:bg-black rounded-[32px] p-10 md:p-16 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 border border-white/5">
            <div className="flex-1">
              <h2 data-oc={`${K}.frase`} className="font-outfit italic text-3xl md:text-4xl uppercase font-extrabold text-white leading-tight mb-4">
                "<Tx k={`${K}.frase`} sel={`${K}.frase`} as="span" />"
              </h2>
              <Tx k={`${KT}.firma`} as="p" className="font-sarabun text-marca font-bold uppercase tracking-widest text-sm" />
            </div>
            <div className="flex-shrink-0">
              <Btn
                k={`${KT}.botonCta`}
                className="bg-marca hover:bg-marca-oscuro text-negro font-sarabun font-bold uppercase tracking-wider text-sm px-10 py-5 rounded-[20px] transition-colors duration-300 shadow-lg cursor-pointer whitespace-nowrap inline-flex items-center justify-center"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Creadora destacada (solo OFF COURT Creators) */}
      {id === 'creators' && creadora.visible && (
        <section className="py-20 px-6 md:px-12 lg:px-24 bg-white dark:bg-gris-oscuro transition-colors duration-300">
          <div className="max-w-5xl mx-auto">
            <Tx k={`${KC}.etiqueta`} as="span" className="text-marca uppercase tracking-[0.2em] text-sm font-sarabun font-extrabold block mb-6" />
            <div className="relative bg-gradient-to-br from-negro to-gris-oscuro rounded-[36px] shadow-2xl overflow-hidden border border-white/10">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-marca/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12 p-8 md:p-12">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1.5 rounded-[30px] bg-gradient-to-tr from-marca to-[#ffd37a] shadow-lg shadow-marca/30"></div>
                  <Im k={`${KC}.foto`} className="relative w-44 h-44 md:w-56 md:h-56 object-cover rounded-[26px]" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <Tx k={`${KC}.insignia`} as="span" className="inline-flex items-center gap-1.5 bg-marca/15 border border-marca/40 text-marca text-[10px] font-sarabun font-extrabold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4" />
                  <Tx k={`${KC}.nombre`} as="h3" className="font-outfit italic text-4xl md:text-5xl uppercase font-black text-white leading-none mb-2" />
                  <a href={creadora.instagram.url} target="_blank" rel="noopener noreferrer" {...marcar(`${KC}.instagram`)} className="font-sarabun text-marca font-bold text-lg hover:underline inline-block mb-4">
                    <Tx k={`${KC}.usuario`} sel={`${KC}.instagram`} as="span" />
                  </a>
                  <Tx k={`${KC}.texto`} as="p" className="font-sarabun text-gris-claro text-sm md:text-base mb-6 max-w-xl mx-auto md:mx-0" />
                  <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                    <PdfLink href={creadora.mediaKit.src} {...marcar(`${KC}.mediaKit`)} className="bg-marca hover:bg-marca-oscuro text-negro font-sarabun font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-[16px] inline-flex items-center justify-center gap-2 transition-colors duration-300 shadow-lg cursor-pointer">
                      <Download size={16} /> <Tx k={`${KC}.botonMediaKit`} sel={`${KC}.mediaKit`} as="span" />
                    </PdfLink>
                    <a href={creadora.instagram.url} target="_blank" rel="noopener noreferrer" className="border-2 border-white/25 hover:border-marca hover:text-marca text-white font-sarabun font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-[16px] inline-flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> <Tx k={`${KC}.botonInstagram`} as="span" />
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
