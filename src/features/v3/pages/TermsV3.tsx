import React from 'react';
import { useSeo } from '../../../hooks/useSeo';
import { META } from '../../../lib/metaRutas';

export const TermsV3: React.FC = () => {
  useSeo(META.terminos.title, META.terminos.description);

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto font-sarabun text-[#2e2f30] dark:text-[#e4e4e4]">
      <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest mb-8">Términos de Servicio</h1>
      
      <div className="space-y-6 text-sm md:text-base leading-relaxed opacity-90">
        <p><strong>Última actualización:</strong> {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-bold uppercase tracking-wider mt-8 mb-4">1. Aceptación de los Términos</h2>
        <p>Al acceder y utilizar el sitio web de Offcourt Sports Group, usted acepta estar sujeto a estos Términos de Servicio y a todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder a este sitio.</p>
        
        <h2 className="text-2xl font-bold uppercase tracking-wider mt-8 mb-4">2. Uso de Licencia</h2>
        <p>Se concede permiso para descargar temporalmente una copia de los materiales (información o software) en el sitio web de Offcourt Sports Group solo para visualización transitoria personal y no comercial. Esta es la concesión de una licencia, no una transferencia de título.</p>
        
        <h2 className="text-2xl font-bold uppercase tracking-wider mt-8 mb-4">3. Servicios Proporcionados</h2>
        <p>Offcourt Sports Group proporciona servicios de marketing deportivo, representación de atletas, desarrollo de alianzas y relaciones públicas. Las descripciones de los servicios en el sitio web son informativas y no constituyen una oferta vinculante hasta la firma de un contrato formal.</p>
        
        <h2 className="text-2xl font-bold uppercase tracking-wider mt-8 mb-4">4. Limitaciones</h2>
        <p>En ningún caso Offcourt Sports Group o sus proveedores serán responsables de ningún daño (incluyendo, sin limitación, daños por pérdida de datos o beneficios, o debido a la interrupción del negocio) que surja del uso o la incapacidad de usar los materiales en el sitio web.</p>
        
        <h2 className="text-2xl font-bold uppercase tracking-wider mt-8 mb-4">5. Precisión de los Materiales</h2>
        <p>Los materiales que aparecen en el sitio web de Offcourt Sports Group podrían incluir errores técnicos, tipográficos o fotográficos. Offcourt Sports Group no garantiza que ninguno de los materiales en su sitio web sea preciso, completo o actual. Podemos realizar cambios en los materiales en cualquier momento sin previo aviso.</p>
        
        <h2 className="text-2xl font-bold uppercase tracking-wider mt-8 mb-4">6. Modificaciones</h2>
        <p>Offcourt Sports Group puede revisar estos términos de servicio para su sitio web en cualquier momento sin previo aviso. Al utilizar este sitio web, usted acepta estar sujeto a la versión actual de estos términos de servicio.</p>
        
        <h2 className="text-2xl font-bold uppercase tracking-wider mt-8 mb-4">7. Ley Aplicable</h2>
        <p>Estos términos y condiciones se rigen e interpretan de acuerdo con las leyes y usted se somete irrevocablemente a la jurisdicción exclusiva de los tribunales en esa ubicación.</p>
      </div>
    </div>
  );
};
