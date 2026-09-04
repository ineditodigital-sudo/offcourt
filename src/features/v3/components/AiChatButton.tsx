import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { useContenido } from '../../../cms/ContenidoContext';
import { Tx, marcar } from '../../../cms/Editable';

const K = 'global.agenteIA';

export const AiChatButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { visible } = useContenido().global.agenteIA;

  if (!visible) return null;

  return (
    <>
      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:justify-end p-4 md:p-8"
          onClick={() => setOpen(false)}
        >
          <div className="oc-velo-sitio absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div
            className="oc-caja-esquina relative z-10 w-full max-w-sm bg-negro border border-white/10 rounded-[28px] p-7 shadow-2xl mb-24 md:mb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-marca/15 flex items-center justify-center">
                <Bot className="text-marca" size={24} />
              </div>
              <div>
                <Tx k={`${K}.titulo`} as="h3" className="font-outfit italic font-extrabold text-white uppercase text-xl leading-none" />
                <Tx k={`${K}.subtitulo`} as="span" className="text-marca text-xs font-sarabun font-bold uppercase tracking-[0.2em]" />
              </div>
            </div>

            <Tx k={`${K}.texto`} as="p" className="font-sarabun text-gris-claro text-sm leading-relaxed mb-6" />

            <div className="inline-flex items-center gap-2 bg-marca/10 border border-marca/30 rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-marca animate-pulse"></span>
              <Tx k={`${K}.etiqueta`} as="span" className="text-marca font-sarabun font-bold text-xs uppercase tracking-[0.2em]" />
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Agente IA de Offcourt (Próximamente)"
        {...marcar(`${K}.visible`)}
        className="oc-pulsable oc-crece-hover fixed bottom-5 right-5 md:bottom-6 md:right-6 z-[90] w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center cursor-pointer hover:scale-105"
      >
        <span className="oc-ai-ring"></span>
        <span className="relative z-10 w-full h-full rounded-full bg-negro border border-marca/50 flex flex-col items-center justify-center shadow-[0_8px_30px_rgba(253,162,17,0.4)]">
          <img src="/oc-icon.png" alt="Offcourt" loading="lazy" decoding="async" width="32" height="32" className="w-7 md:w-8 h-auto" />
          <span className="text-[9px] font-sarabun font-extrabold tracking-[0.15em] mt-0.5 leading-none text-marca">IA</span>
        </span>
      </button>
    </>
  );
};
