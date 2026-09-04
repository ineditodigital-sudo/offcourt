import React, { useEffect, useRef, useState } from 'react';
import { cargarGsap } from '../../../lib/gsapLazy';
import { MapPin, Mail, Phone, Send, CheckCircle2 } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

// Ocultas hasta que el cliente proporcione las URLs oficiales. Poner en true para reactivar.
const SHOW_SOCIAL = false;

export const ContactFormV3: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  // El servidor explica por qué falló (correo inválido, demasiados envíos
  // seguidos…). Mostrar ese texto en vez de uno genérico evita que alguien
  // reintente diez veces sin entender qué pasa.
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelado = false;

    // GSAP viaja en su propio chunk. Esta sección queda bajo el pliegue,
    // así que para cuando el visitante la alcanza la librería ya llegó y la
    // animación se ve igual que antes.
    cargarGsap().then(({ gsap }) => {
      if (cancelado) return;
      ctx = gsap.context(() => {
        gsap.fromTo('.v3-contact-item',
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 75%',
            }
          }
        );
      }, containerRef);
    });

    return () => { cancelado = true; ctx?.revert(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('sending');
    const formData = new FormData(form);
    try {
      const res = await fetch('/sendmail.php', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setStatus('ok');
        form.reset();
      } else {
        setErrorMsg(typeof data.message === 'string' ? data.message : '');
        setStatus('error');
      }
    } catch {
      setErrorMsg('');
      setStatus('error');
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 focus:border-[#fda211] rounded-[16px] px-5 py-4 text-white placeholder-white/40 font-sarabun text-sm outline-none transition-colors duration-300";

  return (
    <section 
      id="contacto"
      ref={containerRef}
      className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-white dark:bg-[#2e2f30] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* Contact Info */}
        <div className="v3-contact-item space-y-12">
          <div className="space-y-6">
            <span className="text-[#fda211] font-sarabun uppercase tracking-[0.2em] text-sm font-extrabold block">
              START NOW
            </span>
            <h2 className="font-outfit italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase font-extrabold tracking-tight text-[#1b1b1b] dark:text-white leading-[1.1]">
              AGENDAR SESIÓN<br/>ESTRATÉGICA
            </h2>
            <p className="font-sarabun text-[#2e2f30] dark:text-[#e4e4e4] text-base md:text-lg max-w-md leading-relaxed font-medium">
              Ya sea que busques conectar tu marca con el ecosistema deportivo o potenciar tu legado como atleta élite, hablemos de negocios.
            </p>
          </div>

          <div className="space-y-8 font-sarabun">
            
            {/* Global HQ */}
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-[16px] bg-[#e4e4e4] dark:bg-[#1b1b1b] flex items-center justify-center text-[#fda211] transition-colors duration-300 shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-[0.2em] font-extrabold mb-1">Global HQ</p>
                <p className="text-[#1b1b1b] dark:text-white font-bold text-lg">México</p>
              </div>
            </div>

            {/* General Contact */}
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-[16px] bg-[#e4e4e4] dark:bg-[#1b1b1b] flex items-center justify-center text-[#fda211] transition-colors duration-300 shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-[0.2em] font-extrabold mb-1">Atención General</p>
                <a href="mailto:contacto@offcourtsports.com.mx" className="text-[#1b1b1b] dark:text-white font-bold text-lg hover:text-[#fda211] transition-colors">contacto@offcourtsports.com.mx</a>
              </div>
            </div>

            {/* Gustavo Moreda */}
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-[16px] bg-[#e4e4e4] dark:bg-[#1b1b1b] flex items-center justify-center text-[#fda211] transition-colors duration-300 shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-[0.2em] font-extrabold mb-1">Gustavo Moreda</p>
                <div className="flex flex-col">
                  <a href="tel:+523314825847" className="text-[#1b1b1b] dark:text-white font-bold text-lg hover:text-[#fda211] transition-colors">+52 33 14 82 58 47</a>
                  <a href="mailto:gmoreda@offcourtsports.com.mx" className="text-[#1b1b1b] dark:text-white font-medium text-sm hover:text-[#fda211] transition-colors">gmoreda@offcourtsports.com.mx</a>
                </div>
              </div>
            </div>

            {/* Jorge Valdez */}
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-[16px] bg-[#e4e4e4] dark:bg-[#1b1b1b] flex items-center justify-center text-[#fda211] transition-colors duration-300 shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-[0.2em] font-extrabold mb-1">Jorge Valdéz</p>
                <div className="flex flex-col">
                  <a href="tel:+524491059207" className="text-[#1b1b1b] dark:text-white font-bold text-lg hover:text-[#fda211] transition-colors">+52 449 105 92 07</a>
                  <a href="mailto:jvaldez@offcourtsports.com.mx" className="text-[#1b1b1b] dark:text-white font-medium text-sm hover:text-[#fda211] transition-colors">jvaldez@offcourtsports.com.mx</a>
                </div>
              </div>
            </div>

          </div>

          {SHOW_SOCIAL && (
          <div className="pt-8 border-t border-black/10 dark:border-white/10">
            <p className="text-xs text-neutral-500 uppercase tracking-[0.2em] font-extrabold mb-4 font-sarabun">Síguenos</p>
            <div className="flex gap-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-[16px] bg-[#1b1b1b] hover:bg-[#fda211] flex items-center justify-center text-white hover:text-[#1b1b1b] transition-colors duration-300 shadow-lg" title="B2B & Alianzas">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-[16px] bg-[#1b1b1b] hover:bg-[#fda211] flex items-center justify-center text-white hover:text-[#1b1b1b] transition-colors duration-300 shadow-lg" title="Estilo de Vida & Experiencias">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>
          )}
        </div>

        {/* Formulario de contacto */}
        <div className="v3-contact-item bg-[#1b1b1b] dark:bg-[#1b1b1b] rounded-[48px] p-8 md:p-12 shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#fda211] via-transparent to-transparent"></div>

          {status === 'ok' ? (
            <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[420px] gap-6">
              <div className="w-20 h-20 rounded-full bg-[#fda211]/15 flex items-center justify-center">
                <CheckCircle2 className="text-[#fda211]" size={40} />
              </div>
              <h3 className="font-outfit italic text-3xl font-extrabold text-white uppercase tracking-tight">¡Mensaje enviado!</h3>
              <p className="font-sarabun text-[#e4e4e4] max-w-sm">Gracias por escribirnos. Nuestro equipo te contactará muy pronto.</p>
            </div>
          ) : (
            <div className="relative z-10">
              <h3 className="font-outfit italic text-3xl md:text-4xl font-extrabold text-white uppercase tracking-tight mb-2">
                Cuéntanos tu proyecto
              </h3>
              <p className="font-sarabun text-[#e4e4e4] text-sm md:text-base mb-8">
                Déjanos tus datos y te contactamos para agendar una videollamada.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input type="text" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                <input type="text" name="name" required placeholder="Nombre completo" className={inputCls} />
                <input type="email" name="email" required placeholder="Correo electrónico" className={inputCls} />
                <input type="text" name="phone" placeholder="Teléfono / WhatsApp (opcional)" className={inputCls} />
                <textarea name="message" required rows={4} placeholder="¿En qué podemos ayudarte?" className={inputCls + ' resize-none'}></textarea>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-[#fda211] hover:bg-[#e5920f] disabled:opacity-60 text-[#1b1b1b] font-sarabun font-bold uppercase tracking-widest text-sm px-10 py-5 rounded-[20px] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  <Send size={16} />
                  {status === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
                </button>

                {status === 'error' && (
                  <p className="font-sarabun text-red-400 text-sm text-center">
                    {errorMsg || 'Ocurrió un error. Intenta de nuevo o escríbenos por WhatsApp.'}
                  </p>
                )}
              </form>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <a href="https://wa.me/523314825847" target="_blank" rel="noopener noreferrer" className="font-sarabun text-sm text-[#e4e4e4] hover:text-[#fda211] transition-colors inline-flex items-center gap-1.5 justify-center">
                  o escríbenos por <span className="font-bold text-[#25D366] inline-flex items-center gap-1.5"><WhatsAppIcon size={16} /> WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
