import React, { useEffect, useRef, useState } from 'react';
import { cargarGsap } from '../../../lib/gsapLazy';
import { MapPin, Mail, Phone, Send, CheckCircle2 } from 'lucide-react';
import { InstagramIcon, LinkedinIcon, FacebookIcon, YoutubeIcon, TiktokIcon } from '../../../cms/RedesIconos';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useContenido } from '../../../cms/ContenidoContext';
import { Tx, marcar } from '../../../cms/Editable';

const K = 'paginas.inicio.contacto';
const KC = 'global.contacto';
const KR = 'global.redes';

export const ContactFormV3: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  // El servidor explica por qué falló (correo inválido, demasiados envíos
  // seguidos…). Mostrar ese texto en vez de uno genérico evita que alguien
  // reintente diez veces sin entender qué pasa.
  const [errorMsg, setErrorMsg] = useState('');

  const contenido = useContenido();
  const { contacto, redes } = contenido.global;

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

  const inputCls = "w-full bg-white/5 border border-white/10 focus:border-marca rounded-[16px] px-5 py-4 text-white placeholder-white/40 font-sarabun text-sm outline-none transition-colors duration-300";
  const whatsappUrl = `https://wa.me/${contacto.whatsapp}`;

  const socialCls = "w-12 h-12 rounded-[16px] bg-negro hover:bg-marca flex items-center justify-center text-white hover:text-negro transition-colors duration-300 shadow-lg";
  const sociales = [
    { clave: 'instagram', url: redes.instagram.url, Icono: InstagramIcon, titulo: 'Instagram' },
    { clave: 'linkedin', url: redes.linkedin.url, Icono: LinkedinIcon, titulo: 'LinkedIn' },
    { clave: 'facebook', url: redes.facebook.url, Icono: FacebookIcon, titulo: 'Facebook' },
    { clave: 'tiktok', url: redes.tiktok.url, Icono: TiktokIcon, titulo: 'TikTok' },
    { clave: 'youtube', url: redes.youtube.url, Icono: YoutubeIcon, titulo: 'YouTube' },
  ].filter((s) => s.url.trim() !== '');

  return (
    <section
      id="contacto"
      ref={containerRef}
      className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-white dark:bg-gris-oscuro transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

        {/* Contact Info */}
        <div className="v3-contact-item space-y-12">
          <div className="space-y-6">
            <Tx k={`${K}.antetitulo`} as="span" className="text-marca font-sarabun uppercase tracking-[0.2em] text-sm font-extrabold block" />
            <h2 data-oc={`${K}.titulo`} className="font-outfit italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase font-extrabold tracking-tight text-negro dark:text-white leading-[1.1]">
              <Tx k={`${K}.titulo`} sel={`${K}.titulo`} as="span" /><br />
              <Tx k={`${K}.tituloLinea2`} as="span" />
            </h2>
            <Tx k={`${K}.texto`} as="p" className="font-sarabun text-gris-oscuro dark:text-gris-claro text-base md:text-lg max-w-md leading-relaxed font-medium" />
          </div>

          <div className="space-y-8 font-sarabun">

            {/* Global HQ */}
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-[16px] bg-gris-claro dark:bg-negro flex items-center justify-center text-marca transition-colors duration-300 shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <Tx k={`${K}.etiquetaSede`} as="p" className="text-xs text-neutral-500 uppercase tracking-[0.2em] font-extrabold mb-1" />
                <Tx k={`${KC}.sede`} as="p" className="text-negro dark:text-white font-bold text-lg" />
              </div>
            </div>

            {/* General Contact */}
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-[16px] bg-gris-claro dark:bg-negro flex items-center justify-center text-marca transition-colors duration-300 shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <Tx k={`${K}.etiquetaCorreo`} as="p" className="text-xs text-neutral-500 uppercase tracking-[0.2em] font-extrabold mb-1" />
                <a href={`mailto:${contacto.emailGeneral}`} {...marcar(`${KC}.emailGeneral`)} className="text-negro dark:text-white font-bold text-lg hover:text-marca transition-colors">
                  <Tx k={`${KC}.emailGeneral`} sel={`${KC}.emailGeneral`} as="span" />
                </a>
              </div>
            </div>

            {/* Personas de contacto */}
            {contacto.personas.map((persona, i) => (
              <div key={i} className="flex items-center gap-6 group">
                <div className="w-14 h-14 rounded-[16px] bg-gris-claro dark:bg-negro flex items-center justify-center text-marca transition-colors duration-300 shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <Tx k={`${KC}.personas.${i}.nombre`} as="p" className="text-xs text-neutral-500 uppercase tracking-[0.2em] font-extrabold mb-1" />
                  <div className="flex flex-col">
                    <a href={`tel:${persona.telefono.replace(/[^\d+]/g, '')}`} {...marcar(`${KC}.personas.${i}.telefono`)} className="text-negro dark:text-white font-bold text-lg hover:text-marca transition-colors">
                      <Tx k={`${KC}.personas.${i}.telefono`} sel={`${KC}.personas.${i}.telefono`} as="span" />
                    </a>
                    <a href={`mailto:${persona.email}`} {...marcar(`${KC}.personas.${i}.email`)} className="text-negro dark:text-white font-medium text-sm hover:text-marca transition-colors">
                      <Tx k={`${KC}.personas.${i}.email`} sel={`${KC}.personas.${i}.email`} as="span" />
                    </a>
                  </div>
                </div>
              </div>
            ))}

          </div>

          {redes.mostrar && sociales.length > 0 && (
            <div className="pt-8 border-t border-black/10 dark:border-white/10">
              <Tx k={`${K}.tituloRedes`} as="p" className="text-xs text-neutral-500 uppercase tracking-[0.2em] font-extrabold mb-4 font-sarabun" />
              <div className="flex gap-4 flex-wrap">
                {sociales.map(({ clave, url, Icono, titulo }) => (
                  <a key={clave} href={url} target="_blank" rel="noopener noreferrer" {...marcar(`${KR}.${clave}`)} className={socialCls} title={titulo} aria-label={titulo}>
                    <Icono size={20} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Formulario de contacto */}
        <div className="v3-contact-item bg-negro dark:bg-negro rounded-[48px] p-8 md:p-12 shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-marca via-transparent to-transparent"></div>

          {status === 'ok' ? (
            <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[420px] gap-6">
              <div className="w-20 h-20 rounded-full bg-marca/15 flex items-center justify-center">
                <CheckCircle2 className="text-marca" size={40} />
              </div>
              <Tx k={`${K}.tituloExito`} as="h3" className="font-outfit italic text-3xl font-extrabold text-white uppercase tracking-tight" />
              <Tx k={`${K}.textoExito`} as="p" className="font-sarabun text-gris-claro max-w-sm" />
            </div>
          ) : (
            <div className="relative z-10">
              <Tx k={`${K}.tituloFormulario`} as="h3" className="font-outfit italic text-3xl md:text-4xl font-extrabold text-white uppercase tracking-tight mb-2" />
              <Tx k={`${K}.textoFormulario`} as="p" className="font-sarabun text-gris-claro text-sm md:text-base mb-8" />

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input type="text" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                <input type="text" name="name" required placeholder="Nombre completo" className={inputCls} />
                <input type="email" name="email" required placeholder="Correo electrónico" className={inputCls} />
                <input type="text" name="phone" placeholder="Teléfono / WhatsApp (opcional)" className={inputCls} />
                <textarea name="message" required rows={4} placeholder="¿En qué podemos ayudarte?" className={inputCls + ' resize-none'}></textarea>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  {...marcar(`${K}.botonEnviar`)}
                  className="w-full bg-marca hover:bg-marca-oscuro disabled:opacity-60 text-negro font-sarabun font-bold uppercase tracking-widest text-sm px-10 py-5 rounded-[20px] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  <Send size={16} />
                  {status === 'sending' ? 'Enviando…' : <Tx k={`${K}.botonEnviar`} sel={`${K}.botonEnviar`} as="span" />}
                </button>

                {status === 'error' && (
                  <p className="font-sarabun text-red-400 text-sm text-center">
                    {errorMsg || 'Ocurrió un error. Intenta de nuevo o escríbenos por WhatsApp.'}
                  </p>
                )}
              </form>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-sarabun text-sm text-gris-claro hover:text-marca transition-colors inline-flex items-center gap-1.5 justify-center">
                  <Tx k={`${K}.textoWhatsapp`} as="span" /> <span className="font-bold text-[#25D366] inline-flex items-center gap-1.5"><WhatsAppIcon size={16} /> WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
