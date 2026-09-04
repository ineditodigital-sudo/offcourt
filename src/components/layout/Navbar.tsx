import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';

interface NavbarProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    const element = document.getElementById('contacto');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-4 left-4 right-4 z-50">
      <div className={`max-w-7xl mx-auto rounded-none border-b border-x border-black/5 dark:border-white/10 bg-white/75 dark:bg-black/45 backdrop-blur-md px-6 py-4 flex items-center justify-between transition-shadow duration-300 ${scrolled ? 'shadow-xl' : ''}`}>
        
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <img 
            src={theme === 'dark' ? '/logo_blanco.svg' : '/logo_negro.svg'} 
            alt="Offcourt Sports Group Logo" 
            className="h-8 md:h-9 w-auto"
          />
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-bold text-xs tracking-widest uppercase">
          <a href="#expertise" onClick={(e) => scrollToSection(e, 'expertise')} className="hover:text-gold transition-colors text-black dark:text-white">Expertise</a>
          <a href="#proyectos" onClick={(e) => scrollToSection(e, 'proyectos')} className="hover:text-gold transition-colors text-black dark:text-white">Proyectos</a>
          <a href="#manifiesto" onClick={(e) => scrollToSection(e, 'manifiesto')} className="hover:text-gold transition-colors text-black dark:text-white">Manifiesto</a>
        </div>

        {/* Right side options */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="w-10 h-10 border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-black dark:text-white transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-gold" /> : <Moon size={18} />}
          </button>
          
          {/* CTA Button */}
          <a 
            href="#contacto" 
            onClick={scrollToContact}
            className="bg-black text-white hover:bg-gold hover:text-black dark:bg-white dark:text-black dark:hover:bg-gold dark:hover:text-black px-6 py-3 font-bold text-xs uppercase tracking-wider transition-colors duration-300 border border-transparent cursor-pointer"
          >
            Agenda una videollamada
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-4 md:hidden">
          <button 
            onClick={toggleTheme} 
            className="w-8 h-8 border border-black/10 dark:border-white/10 flex items-center justify-center text-black dark:text-white cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} className="text-gold" /> : <Moon size={16} />}
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-black dark:text-white cursor-pointer"
            aria-label="Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 border border-black/5 dark:border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-none p-6 shadow-2xl mx-1 flex flex-col gap-6 font-bold tracking-widest text-center uppercase oc-menu-movil text-black dark:text-white text-xs">
          <a href="#expertise" onClick={(e) => scrollToSection(e, 'expertise')} className="py-2 hover:text-gold transition-colors">Expertise</a>
          <a href="#proyectos" onClick={(e) => scrollToSection(e, 'proyectos')} className="py-2 hover:text-gold transition-colors">Proyectos</a>
          <a href="#manifiesto" onClick={(e) => scrollToSection(e, 'manifiesto')} className="py-2 hover:text-gold transition-colors">Manifiesto</a>
          
          <div className="h-px bg-black/10 dark:bg-white/15 my-2"></div>
          
          <a 
            href="#contacto" 
            onClick={scrollToContact}
            className="w-full bg-gold hover:bg-gold/90 text-black py-4 font-bold text-sm text-center shadow-lg cursor-pointer"
          >
            Agenda una videollamada
          </a>
        </div>
      )}
    </nav>
  );
};
