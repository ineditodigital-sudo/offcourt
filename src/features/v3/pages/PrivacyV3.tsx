import React from 'react';
import { useSeo } from '../../../hooks/useSeo';
import { useContenido } from '../../../cms/ContenidoContext';
import { Tx, Rico } from '../../../cms/Editable';

const K = 'paginas.privacidad';

export const PrivacyV3: React.FC = () => {
  const { privacidad } = useContenido().paginas;
  useSeo(privacidad.seo.titulo, privacidad.seo.descripcion, privacidad.seo.imagen.src);

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto font-sarabun text-gris-oscuro dark:text-gris-claro">
      <Tx k={`${K}.titulo`} as="h1" className="text-4xl md:text-5xl font-bold uppercase tracking-widest mb-8" />

      <div className="space-y-6 text-sm md:text-base leading-relaxed opacity-90">
        <p><strong>Última actualización:</strong> <Tx k={`${K}.actualizacion`} /></p>
        <Rico k={`${K}.cuerpo`} className="oc-rico" />
      </div>
    </div>
  );
};
