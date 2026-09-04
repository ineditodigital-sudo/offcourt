import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { WhatsAppIcon } from './WhatsAppIcon';
import { scrollToSection } from '../../../lib/smoothScroll';
import { useContenido } from '../../../cms/ContenidoContext';
import { Tx } from '../../../cms/Editable';

const KN = 'global.navegacion';

interface NavbarV3Props {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const NavbarV3: React.FC<NavbarV3Props> = ({ theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const contenido = useContenido();
  const whatsappUrl = `https://wa.me/${contenido.global.contacto.whatsapp}`;
  const verticales = contenido.paginas.servicios.items
    .map((item, indice) => ({ item, indice }))
    .filter(({ item }) => item.visible);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    // passive: el navegador no tiene que esperar a ver si cancelamos el gesto
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionClick = (e: React.MouseEvent, id: string) => {
    setIsOpen(false);
    // Desde otra página dejamos que el router navegue a /#seccion; el
    // ScrollManager de App.tsx se encarga del desplazamiento al montar.
    if (location.pathname !== '/' && location.pathname !== '//') {
      return;
    }
    e.preventDefault();
    scrollToSection(id);
  };

  const enlaceCls = 'hover:text-marca transition-colors text-gris-oscuro dark:text-gris-claro';

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 px-4 md:px-8">
      {/* El cristal esmerilado solo en escritorio: en móvil, un backdrop-blur en
          barra fija obliga a recomponer toda la pantalla en cada fotograma de
          scroll y es de las mayores causas de tirones. Ahí va casi opaco. */}
      <div className={`max-w-7xl mx-auto rounded-[32px] border border-black/10 dark:border-white/10 bg-white/95 dark:bg-negro/95 md:bg-white/80 md:dark:bg-negro/80 md:backdrop-blur-xl px-6 py-4 flex items-center justify-between transition-shadow duration-300 ${scrolled ? 'shadow-[0_8px_32px_rgba(0,0,0,0.1)]' : ''}`}>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-transparent flex items-center justify-center">
            <img
              src={theme === 'dark' ? '/logo_blanco.svg' : '/logo_negro.svg'}
              alt="Offcourt Logo"
              width="738" height="404"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-sarabun font-semibold text-sm uppercase tracking-wider">
          <Link to="/" onClick={(e) => handleSectionClick(e, 'hero')} className={enlaceCls}><Tx k={`${KN}.inicio`} /></Link>
          <Link to="/nosotros" className={enlaceCls}><Tx k={`${KN}.nosotros`} /></Link>

          <div className="relative group">
            <Link to="/#soluciones" onClick={(e) => handleSectionClick(e, 'soluciones')} className={`${enlaceCls} flex items-center gap-1 cursor-pointer`}>
              <Tx k={`${KN}.soluciones`} />
            </Link>

            <div className="oc-desplegable-nav absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible">
              <div className="bg-white dark:bg-negro border border-black/10 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden min-w-[280px] py-2 flex flex-col font-sarabun text-sm font-semibold normal-case tracking-normal">
                {verticales.map(({ item, indice }) => (
                  <Link key={item.id} to={`/servicios/${item.id}`} className="px-6 py-3 hover:bg-black/5 dark:hover:bg-white/5 text-gris-oscuro dark:text-gris-claro transition-colors">
                    <Tx k={`paginas.servicios.items.${indice}.titulo`} sel={`paginas.servicios.items.${indice}.titulo`} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link to="/#alianza" onClick={(e) => handleSectionClick(e, 'alianza')} className={enlaceCls}><Tx k={`${KN}.proyectos`} /></Link>
        </div>

        {/* Right side options */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-negro dark:text-white transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-marca" /> : <Moon size={18} />}
          </button>

          {/* CTA Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-marca text-negro hover:bg-marca-oscuro px-6 py-3 rounded-[20px] font-sarabun font-bold text-sm uppercase tracking-wider transition-colors duration-300 cursor-pointer shadow-lg shadow-marca/20 inline-flex items-center gap-2"
          >
            <WhatsAppIcon size={18} /> <Tx k={`${KN}.whatsapp`} />
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-negro dark:text-white cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} className="text-marca" /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-negro dark:text-white cursor-pointer"
            aria-label="Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-24 left-4 right-4 border border-black/5 dark:border-white/10 bg-white/95 dark:bg-negro/95 backdrop-blur-xl rounded-[24px] p-3 shadow-2xl flex flex-col font-sarabun oc-menu-movil text-negro dark:text-white">
          <Link to="/" onClick={(e) => handleSectionClick(e, 'hero')} className="px-4 py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-black/5 dark:hover:bg-white/5 hover:text-marca transition-colors">{contenido.global.navegacion.inicio}</Link>
          <Link to="/nosotros" onClick={() => setIsOpen(false)} className="px-4 py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-black/5 dark:hover:bg-white/5 hover:text-marca transition-colors">{contenido.global.navegacion.nosotros}</Link>

          <div>
            <Link to="/#soluciones" onClick={(e) => handleSectionClick(e, 'soluciones')} className="block px-4 py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-black/5 dark:hover:bg-white/5 hover:text-marca transition-colors">{contenido.global.navegacion.soluciones}</Link>
            <div className="flex flex-col mt-0.5 mb-1">
              {verticales.map(({ item }) => (
                <Link key={item.id} to={`/servicios/${item.id}`} onClick={() => setIsOpen(false)} className="px-4 pl-9 py-2.5 text-sm font-medium text-gris-oscuro/70 dark:text-white/60 hover:text-marca transition-colors">{item.titulo}</Link>
              ))}
            </div>
          </div>

          <Link to="/#alianza" onClick={(e) => handleSectionClick(e, 'alianza')} className="px-4 py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-black/5 dark:hover:bg-white/5 hover:text-marca transition-colors">{contenido.global.navegacion.proyectos}</Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full bg-marca hover:bg-marca-oscuro text-negro py-4 rounded-[16px] font-bold text-sm shadow-lg shadow-marca/20 cursor-pointer flex items-center justify-center gap-2.5"
          >
            <WhatsAppIcon size={20} /> {contenido.global.navegacion.whatsapp}
          </a>
        </div>
      )}
    </nav>
  );
};
