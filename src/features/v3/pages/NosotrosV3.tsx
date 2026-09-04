import React from 'react';
import { useSeo } from '../../../hooks/useSeo';
import { useContenido } from '../../../cms/ContenidoContext';
import { Tx, Im } from '../../../cms/Editable';
import { MissionVisionValuesV3 } from '../components/MissionVisionValuesV3';
import { FilosofiaV3 } from '../components/FilosofiaV3';
import { IdealClientV3 } from '../components/IdealClientV3';
import { ContactFormV3 } from '../components/ContactFormV3';

const K = 'paginas.nosotros';

export const NosotrosV3: React.FC = () => {
  const { nosotros } = useContenido().paginas;
  useSeo(nosotros.seo.titulo, nosotros.seo.descripcion, nosotros.seo.imagen.src);

  return (
    <div className="bg-white dark:bg-gris-oscuro min-h-screen transition-colors duration-300 pt-24">
      {/* Hero Nosotros */}
      <section className="relative py-24 px-6 md:px-12 lg:px-24 bg-negro overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-r from-negro to-negro/80 z-10 pointer-events-none"></div>
          <Im k={`${K}.hero.imagenFondo`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <Tx k={`${K}.hero.antetitulo`} as="span" className="text-marca font-sarabun uppercase tracking-[0.2em] text-sm font-extrabold block mb-4" />
            <h1 data-oc={`${K}.hero.titulo`} className="font-outfit italic text-4xl md:text-5xl lg:text-7xl uppercase font-extrabold text-white leading-[1] mb-6">
              <Tx k={`${K}.hero.titulo`} sel={`${K}.hero.titulo`} as="span" /> <br />
              <Tx k={`${K}.hero.tituloLinea2`} as="span" />
            </h1>
            <Tx k={`${K}.hero.texto`} as="p" className="font-sarabun text-gris-claro text-lg max-w-2xl font-medium leading-relaxed mb-8" />
          </div>
        </div>
      </section>

      {nosotros.filosofia.visible && <FilosofiaV3 />}

      {nosotros.mvv.visible && <MissionVisionValuesV3 />}

      {nosotros.mostrarClientes && <IdealClientV3 />}

      {nosotros.mostrarContacto && <ContactFormV3 />}
    </div>
  );
};
