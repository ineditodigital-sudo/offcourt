import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, Send, CheckCircle } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ContactFormV2: React.FC = () => {
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
      gsap.fromTo('.contact-item-v2', 
        { opacity: 0, y: 30 }, 
        { 
          opacity: 1, 
          y: 0, 
          stagger: 0.15, 
          duration: 1, 
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
        name: '', email: '', phone: '', interest: 'sports-marketing', message: ''
      });
    }, 4000);
  };

  return (
    <section 
      id="contacto" 
      ref={sectionRef}
      className="py-16 md:py-48 px-6 md:px-12 lg:px-24 bg-[#FAFAFA] dark:bg-[#111111] text-black dark:text-white transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-none overflow-hidden flex flex-col lg:flex-row transition-colors duration-300">
          
          {/* Info Side */}
          <div className="lg:w-5/12 p-6 md:p-16 bg-[#F4F4F4] dark:bg-black transition-colors duration-300">
            <div className="space-y-6 contact-item-v2">
              <span className="btn-pill bg-white dark:bg-[#1A1A1A] text-xs font-bold uppercase tracking-widest text-gold px-4 py-2 shadow-sm inline-block">
                Agenda una reunión
              </span>
              <h2 className="font-oswald text-5xl md:text-6xl font-bold tracking-tight uppercase">
                LLEVEMOS TU PROYECTO AL SIGUIENTE NIVEL
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 font-inter text-base leading-relaxed">
                Conectemos y exploremos cómo Offcourt Sports Group puede escalar tu marca, representar comercialmente tus intereses o diseñar tu próximo gran hito deportivo.
              </p>
            </div>

            <div className="space-y-6 mt-16 contact-item-v2">
              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1A1A1A] flex items-center justify-center text-black dark:text-white group-hover:text-gold transition-colors duration-300 shadow-sm">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 font-plus font-bold mb-1">Llámanos</p>
                  <a href="tel:+525512345678" className="font-plus font-medium text-lg hover:text-gold transition-colors">+52 55 1234 5678</a>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1A1A1A] flex items-center justify-center text-black dark:text-white group-hover:text-gold transition-colors duration-300 shadow-sm">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 font-plus font-bold mb-1">Escríbenos</p>
                  <a href="mailto:contacto@offcourtsports.com.mx" className="font-plus font-medium text-lg hover:text-gold transition-colors">contacto@offcourtsports.com.mx</a>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:w-7/12 p-6 md:p-16 contact-item-v2">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-fade-in-up">
                <div className="w-20 h-20 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                  <CheckCircle size={40} />
                </div>
                <h3 className="font-oswald text-3xl uppercase font-bold tracking-widest text-black dark:text-white">¡Solicitud Recibida!</h3>
                <p className="text-neutral-500 font-inter max-w-sm">
                  Nuestro equipo directivo analizará tu perfil y se pondrá en contacto a la brevedad.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold font-plus text-neutral-500 mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full bg-[#F4F4F4] dark:bg-black border border-transparent focus:border-gold outline-none px-4 py-4 rounded-[16px] text-black dark:text-white font-inter transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold font-plus text-neutral-500 mb-2">Correo Electrónico</label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full bg-[#F4F4F4] dark:bg-black border border-transparent focus:border-gold outline-none px-4 py-4 rounded-[16px] text-black dark:text-white font-inter transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold font-plus text-neutral-500 mb-2">Teléfono de Contacto</label>
                    <input
                      type="tel"
                      id="phone"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      className="w-full bg-[#F4F4F4] dark:bg-black border border-transparent focus:border-gold outline-none px-4 py-4 rounded-[16px] text-black dark:text-white font-inter transition-colors"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="interest" className="block text-xs font-bold font-plus text-neutral-500 mb-2">Área de Interés</label>
                  <select
                    id="interest"
                    value={formState.interest}
                    onChange={(e) => setFormState({ ...formState, interest: e.target.value })}
                    className="w-full bg-[#F4F4F4] dark:bg-black border border-transparent focus:border-gold outline-none px-4 py-4 rounded-[16px] text-black dark:text-white font-inter transition-colors appearance-none"
                  >
                    <option value="sports-marketing">Sports Marketing</option>
                    <option value="clinics-camps">Clínicas Internacionales</option>
                    <option value="corporate-experiences">Experiencias Corporativas</option>
                    <option value="athlete-representation">Representación Comercial</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-bold font-plus text-neutral-500 mb-2">Mensaje / Objetivos</label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full bg-[#F4F4F4] dark:bg-black border border-transparent focus:border-gold outline-none px-4 py-4 rounded-[16px] text-black dark:text-white font-inter transition-colors resize-none"
                    placeholder="Cuéntanos sobre tu marca o proyecto..."
                  ></textarea>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="btn-pill w-full bg-black dark:bg-white hover:bg-gold dark:hover:bg-gold text-white dark:text-black font-plus font-bold text-sm py-4 transition-colors duration-300 flex items-center justify-center gap-3 shadow-md uppercase tracking-widest"
                  >
                    <Send size={18} />
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
