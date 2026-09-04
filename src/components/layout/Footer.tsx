import React from 'react';
import { Mail, MapPin, ChevronUp } from 'lucide-react';
import { InstagramIcon, LinkedinIcon, FacebookIcon, YoutubeIcon } from '../../cms/RedesIconos';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { scrollToSection, scrollToTopSmooth } from '../../lib/smoothScroll';
import { useContenido } from '../../cms/ContenidoContext';
import { Tx, marcar } from '../../cms/Editable';

const K = 'global.pie';

interface FooterProps {
  theme?: 'dark' | 'light';
}

export const Footer: React.FC<FooterProps> = ({ theme = 'dark' }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const contenido = useContenido();
  const { pie, contacto, redes, navegacion } = contenido.global;

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

  const sociales = [
    { clave: 'instagram', url: redes.instagram.url, Icono: InstagramIcon, titulo: 'Instagram' },
    { clave: 'linkedin', url: redes.linkedin.url, Icono: LinkedinIcon, titulo: 'LinkedIn' },
    { clave: 'facebook', url: redes.facebook.url, Icono: FacebookIcon, titulo: 'Facebook' },
    { clave: 'youtube', url: redes.youtube.url, Icono: YoutubeIcon, titulo: 'YouTube' },
  ].filter((s) => s.url.trim() !== '');

  return (
    <footer className="bg-[#EDEDED] dark:bg-[#050505] text-negro dark:text-white py-16 px-6 md:px-12 border-t border-black/5 dark:border-white/5 relative transition-colors duration-300">

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
          <Tx k={`${K}.descripcion`} as="p" className="text-gray-600 dark:text-gray-400 max-w-sm text-sm leading-relaxed" />

          {redes.mostrar && sociales.length > 0 && (
            <div className="flex gap-3">
              {sociales.map(({ clave, url, Icono, titulo }) => (
                <a key={clave} href={url} target="_blank" rel="noopener noreferrer" {...marcar(`global.redes.${clave}`)} title={titulo} aria-label={titulo}
                  className="w-10 h-10 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gold hover:border-gold transition-colors">
                  <Icono size={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Links */}
        <div className="space-y-4">
          <Tx k={`${K}.tituloExplorar`} as="h4" className="font-outfit italic text-lg uppercase font-extrabold tracking-wider text-gold" />
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li><Link to="/" onClick={goHome} className="hover:text-gold transition-colors">{navegacion.inicio}</Link></li>
            <li><Link to="/nosotros" className="hover:text-gold transition-colors">{navegacion.nosotros}</Link></li>
            <li><Link to="/#soluciones" onClick={goSection('soluciones')} className="hover:text-gold transition-colors"><Tx k={`${K}.enlaceServicios`} /></Link></li>
            <li><Link to="/#alianza" onClick={goSection('alianza')} className="hover:text-gold transition-colors"><Tx k={`${K}.enlaceProyectos`} /></Link></li>
            <li><Link to="/#contacto" onClick={goSection('contacto')} className="hover:text-gold transition-colors"><Tx k={`${K}.enlaceContacto`} /></Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <Tx k={`${K}.tituloContacto`} as="h4" className="font-outfit italic text-lg uppercase font-extrabold tracking-wider text-gold" />
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-gold" />
              <a href={`mailto:${contacto.emailGeneral}`} className="hover:text-gold transition-colors break-all">{contacto.emailGeneral}</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="text-gold mt-0.5 shrink-0" />
              <span>{contacto.sede}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto h-px bg-black/10 dark:bg-white/5 my-12"></div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} <Tx k={`${K}.derechos`} /></p>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Link to="/privacidad" className="hover:text-gold transition-colors"><Tx k={`${K}.privacidad`} /></Link>
          <Link to="/terminos" className="hover:text-gold transition-colors"><Tx k={`${K}.terminos`} /></Link>
          <a href={pie.creditosUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-negro dark:hover:text-white transition-colors opacity-70 flex items-center gap-1">
            <Tx k={`${K}.creditos`} />
          </a>
        </div>
      </div>
    </footer>
  );
};
