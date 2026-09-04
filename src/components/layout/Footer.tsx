import React from 'react';
import { Mail, MapPin, ChevronUp } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { scrollToSection, scrollToTopSmooth } from '../../lib/smoothScroll';

interface FooterProps {
  theme?: 'dark' | 'light';
}

export const Footer: React.FC<FooterProps> = ({ theme = 'dark' }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Subir con Lenis, no con window.scrollTo: el scroll nativo compite con el
  // motor suave y el recorrido se corta a media altura.
  const scrollToTop = scrollToTopSmooth;

  const goSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === '/') {
      scrollToSection(id);
    } else {
      navigate('/#' + id);
    }
  };
  const goHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === '/') scrollToTop();
    else navigate('/');
  };

  return (
    <footer className="bg-[#EDEDED] dark:bg-[#050505] text-[#1b1b1b] dark:text-white py-16 px-6 md:px-12 border-t border-black/5 dark:border-white/5 relative transition-colors duration-300">
      
      {/* Scroll to Top */}
      <button 
        onClick={scrollToTop}
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gold hover:bg-gold/90 text-black flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:-translate-y-1"
        aria-label="Scroll to top"
      >
        <ChevronUp size={24} />
      </button>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Branding */}
        <div className="space-y-6 md:col-span-2">
          {/* El logo sigue al tema: el blanco desaparecía sobre el fondo claro.
              Mismo criterio que el navbar, que ya elegía archivo por tema. */}
          <img
            src={theme === 'dark' ? '/logo_blanco.svg' : '/logo_negro.svg'}
            alt="Offcourt Sports Group Logo"
            width="738" height="404"
            className="h-12 w-auto"
          />
          <p className="text-gray-600 dark:text-gray-400 max-w-sm text-sm leading-relaxed">
            Agencia premium de Sports Marketing especializada en pádel y en todo el ecosistema de negocios del deporte. El verdadero valor sucede fuera de la cancha.
          </p>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <h4 className="font-outfit italic text-lg uppercase font-extrabold tracking-wider text-gold">Explorar</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li><Link to="/" onClick={goHome} className="hover:text-gold transition-colors">Inicio</Link></li>
            <li><Link to="/nosotros" className="hover:text-gold transition-colors">Nosotros</Link></li>
            <li><Link to="/#soluciones" onClick={goSection('soluciones')} className="hover:text-gold transition-colors">Servicios</Link></li>
            <li><Link to="/#alianza" onClick={goSection('alianza')} className="hover:text-gold transition-colors">Proyectos</Link></li>
            <li><Link to="/#contacto" onClick={goSection('contacto')} className="hover:text-gold transition-colors">Contacto</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="font-outfit italic text-lg uppercase font-extrabold tracking-wider text-gold">Contacto</h4>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-gold" />
              <a href="mailto:contacto@offcourtsports.com.mx" className="hover:text-gold transition-colors break-all">contacto@offcourtsports.com.mx</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="text-gold mt-0.5 shrink-0" />
              <span>México</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto h-px bg-black/10 dark:bg-white/5 my-12"></div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Offcourt Sports Group. Todos los derechos reservados.</p>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Link to="/privacidad" className="hover:text-gold transition-colors">Política de Privacidad</Link>
          <Link to="/terminos" className="hover:text-gold transition-colors">Términos de Servicio</Link>
          <a href="https://inedito.digital" target="_blank" rel="noopener noreferrer" className="hover:text-[#1b1b1b] dark:hover:text-white transition-colors opacity-70 flex items-center gap-1">
            Desarrollado por Inédito Digital
          </a>
        </div>
      </div>
    </footer>
  );
};
