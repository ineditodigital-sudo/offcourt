import React from 'react';
import { useSeo } from '../../../hooks/useSeo';
import { META } from '../../../lib/metaRutas';

export const PrivacyV3: React.FC = () => {
  useSeo(META.privacidad.title, META.privacidad.description);

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto font-sarabun text-[#2e2f30] dark:text-[#e4e4e4]">
      <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest mb-8">Política de Privacidad</h1>
      
      <div className="space-y-6 text-sm md:text-base leading-relaxed opacity-90">
        <p><strong>Última actualización:</strong> {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-bold uppercase tracking-wider mt-8 mb-4">1. Introducción</h2>
        <p>En Offcourt Sports Group ("nosotros", "nuestro"), respetamos su privacidad y estamos comprometidos a proteger los datos personales que pueda compartir con nosotros a través de nuestro sitio web.</p>
        
        <h2 className="text-2xl font-bold uppercase tracking-wider mt-8 mb-4">2. Información que recopilamos</h2>
        <p>Podemos recopilar información personal que usted nos proporcione directamente, como su nombre, dirección de correo electrónico, y número de teléfono cuando se comunica con nosotros a través de formularios de contacto.</p>
        
        <h2 className="text-2xl font-bold uppercase tracking-wider mt-8 mb-4">3. Uso de la información</h2>
        <p>Utilizamos la información recopilada para:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Responder a sus consultas y proporcionar servicio al cliente.</li>
          <li>Enviarle información sobre nuestros servicios de marketing y representación deportiva.</li>
          <li>Mejorar nuestro sitio web y analizar el uso de nuestros servicios.</li>
        </ul>
        
        <h2 className="text-2xl font-bold uppercase tracking-wider mt-8 mb-4">4. Compartir información</h2>
        <p>No vendemos ni alquilamos su información personal a terceros. Podemos compartir su información con proveedores de servicios de confianza que nos asisten en la operación de nuestro sitio web y negocio, siempre bajo estrictos acuerdos de confidencialidad.</p>
        
        <h2 className="text-2xl font-bold uppercase tracking-wider mt-8 mb-4">5. Seguridad</h2>
        <p>Implementamos medidas de seguridad razonables para proteger su información personal contra acceso no autorizado, alteración o destrucción.</p>
        
        <h2 className="text-2xl font-bold uppercase tracking-wider mt-8 mb-4">6. Sus Derechos</h2>
        <p>Usted tiene derecho a acceder, corregir o solicitar la eliminación de su información personal. Para ejercer estos derechos, contáctenos en contacto@offcourtsports.com.mx.</p>
        
        <h2 className="text-2xl font-bold uppercase tracking-wider mt-8 mb-4">7. Contacto</h2>
        <p>Si tiene preguntas sobre esta Política de Privacidad, puede contactarnos en:</p>
        <p>Email: <a href="mailto:contacto@offcourtsports.com.mx" className="text-[#fda211] hover:underline">contacto@offcourtsports.com.mx</a></p>
      </div>
    </div>
  );
};
