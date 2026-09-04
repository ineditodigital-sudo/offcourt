import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, Calendar, Send, CheckCircle } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ContactForm: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'sports-marketing',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.contact-item', 
        { opacity: 0, x: -30 }, 
        { 
          opacity: 1, 
          x: 0, 
          stagger: 0.15, 
          duration: 1.2, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%'
          }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormState({
        name: '',
        email: '',
        phone: '',
        interest: 'sports-marketing',
        message: ''
      });
    }, 4000);
  };

  return (
    <section 
      id="contacto" 
      ref={sectionRef}
      className="py-16 md:py-48 px-6 md:px-12 lg:px-24 bg-white dark:bg-[#050505] text-black dark:text-white relative transition-colors duration-300"
    >
      {/* Tactical Blueprint Grid Lines */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute left-[10%] lg:left-[12%] top-0 w-[1px] h-full bg-black/5 dark:bg-white/5 transition-colors"></div>
        <div className="absolute right-[10%] lg:right-[12%] top-0 w-[1px] h-full bg-black/5 dark:bg-white/5 transition-colors"></div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 relative z-10 pl-0 lg:pl-[12%]">
        
        {/* Text/Info Side */}
        <div className="space-y-12 contact-item">
          <div className="space-y-6">
            <span className="text-gold uppercase tracking-[0.3em] text-xs font-black block">AGENDA UNA REUNIÓN</span>
            <h2 className="font-oswald text-5xl md:text-7xl lg:text-7xl uppercase font-bold tracking-tighter leading-[0.9]">
              LLEVEMOS TU PROYECTO AL SIGUIENTE NIVEL
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 font-inter text-sm md:text-base leading-relaxed max-w-lg transition-colors">
              Conectemos y exploremos cómo Offcourt Sports Group puede escalar tu marca, representar comercialmente tus intereses o diseñar tu próximo gran hito deportivo.
            </p>
          </div>

          <div className="space-y-8 pt-8 border-t border-black/10 dark:border-white/10 transition-colors">
            <div className="flex items-center gap-6 group">
              <div className="w-12 h-12 border border-black/20 dark:border-white/10 flex items-center justify-center text-black dark:text-white group-hover:border-gold dark:group-hover:border-gold transition-colors duration-300">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold mb-1">Llámanos</p>
                <a href="tel:+525512345678" className="font-oswald text-xl hover:text-gold transition-colors tracking-wide">+52 55 1234 5678</a>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="w-12 h-12 border border-black/20 dark:border-white/10 flex items-center justify-center text-black dark:text-white group-hover:border-gold dark:group-hover:border-gold transition-colors duration-300">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold mb-1">Escríbenos</p>
                <a href="mailto:contacto@offcourtsports.com.mx" className="font-oswald text-xl hover:text-gold transition-colors tracking-wide uppercase">contacto@offcourtsports.com.mx</a>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="w-12 h-12 border border-black/20 dark:border-white/10 flex items-center justify-center text-black dark:text-white group-hover:border-gold dark:group-hover:border-gold transition-colors duration-300">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold mb-1">Horario de Atención</p>
                <p className="font-oswald text-xl tracking-wide uppercase">Lunes a Viernes / 9:00 - 18:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side - Tactical styling */}
        <div className="relative contact-item">
          <div className="relative border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-black p-8 md:p-12 shadow-2xl transition-colors duration-300">
            {submitted ? (
              <div className="py-24 text-center space-y-6 animate-pulse">
                <div className="w-16 h-16 border-2 border-gold text-gold flex items-center justify-center mx-auto">
                  <CheckCircle size={32} />
                </div>
                <h3 className="font-oswald text-3xl uppercase font-bold tracking-widest text-black dark:text-white">¡Solicitud Recibida!</h3>
                <p className="text-neutral-500 dark:text-neutral-400 font-inter text-sm max-w-sm mx-auto">
                  Nuestro equipo directivo analizará tu perfil y se pondrá en contacto a la brevedad.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label htmlFor="name" className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gold mb-3">Nombre Completo</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full bg-transparent border-b border-black/20 dark:border-white/20 focus:border-gold outline-none px-0 py-2 text-black dark:text-white font-inter transition-colors rounded-none placeholder-neutral-400 dark:placeholder-white/40"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="email" className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gold mb-3">Correo Electrónico</label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full bg-transparent border-b border-black/20 dark:border-white/20 focus:border-gold outline-none px-0 py-2 text-black dark:text-white font-inter transition-colors rounded-none placeholder-neutral-400 dark:placeholder-white/40"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gold mb-3">Teléfono de Contacto</label>
                    <input
                      type="tel"
                      id="phone"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      className="w-full bg-transparent border-b border-black/20 dark:border-white/20 focus:border-gold outline-none px-0 py-2 text-black dark:text-white font-inter transition-colors rounded-none placeholder-neutral-400 dark:placeholder-white/40"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="interest" className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gold mb-3">Área de Interés</label>
                  <select
                    id="interest"
                    value={formState.interest}
                    onChange={(e) => setFormState({ ...formState, interest: e.target.value })}
                    className="w-full bg-transparent border-b border-black/20 dark:border-white/20 focus:border-gold outline-none px-0 py-2 text-black dark:text-white font-inter transition-colors rounded-none appearance-none"
                  >
                    <option value="sports-marketing">Sports Marketing</option>
                    <option value="clinics-camps">Clínicas Internacionales</option>
                    <option value="corporate-experiences">Experiencias Corporativas</option>
                    <option value="athlete-representation">Representación Comercial</option>
                    <option value="sports-branding">Branding Deportivo</option>
                    <option value="projects-development">Desarrollo de Proyectos</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gold mb-3">Mensaje / Objetivos</label>
                  <textarea
                    id="message"
                    rows={3}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full bg-transparent border-b border-black/20 dark:border-white/20 focus:border-gold outline-none px-0 py-2 text-black dark:text-white font-inter transition-colors resize-none rounded-none placeholder-neutral-400 dark:placeholder-white/40"
                    placeholder="Cuéntanos sobre tu marca o proyecto..."
                  ></textarea>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-black dark:bg-white hover:bg-gold dark:hover:bg-gold text-white dark:text-black font-bold uppercase tracking-widest text-xs py-5 transition-colors duration-300 flex items-center justify-center gap-3 cursor-pointer rounded-none"
                  >
                    <Send size={16} />
                    Enviar Solicitud
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
