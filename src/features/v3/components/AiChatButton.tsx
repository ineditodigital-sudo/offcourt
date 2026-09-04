import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';

export const AiChatButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:justify-end p-4 md:p-8"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div
            className="relative z-10 w-full max-w-sm bg-[#1b1b1b] border border-white/10 rounded-[28px] p-7 shadow-2xl mb-24 md:mb-8"
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
              <div className="w-12 h-12 rounded-2xl bg-[#fda211]/15 flex items-center justify-center">
                <Bot className="text-[#fda211]" size={24} />
              </div>
              <div>
                <h3 className="font-outfit italic font-extrabold text-white uppercase text-xl leading-none">Agente IA</h3>
                <span className="text-[#fda211] text-xs font-sarabun font-bold uppercase tracking-[0.2em]">Offcourt Sports Group</span>
              </div>
            </div>

            <p className="font-sarabun text-[#e4e4e4] text-sm leading-relaxed mb-6">
              Muy pronto podrás chatear aquí con nuestro asistente inteligente para resolver dudas, recibir información y agendar una videollamada al instante.
            </p>

            <div className="inline-flex items-center gap-2 bg-[#fda211]/10 border border-[#fda211]/30 rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-[#fda211] animate-pulse"></span>
              <span className="text-[#fda211] font-sarabun font-bold text-xs uppercase tracking-[0.2em]">Próximamente</span>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Agente IA de Offcourt (Próximamente)"
        className="fixed bottom-5 right-5 md:bottom-6 md:right-6 z-[90] w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
      >
        <span className="oc-ai-ring"></span>
        <span className="relative z-10 w-full h-full rounded-full bg-[#1b1b1b] border border-[#fda211]/50 flex flex-col items-center justify-center shadow-[0_8px_30px_rgba(253,162,17,0.4)]">
          <img src="/oc-icon.png" alt="Offcourt" loading="lazy" decoding="async" width="32" height="32" className="w-7 md:w-8 h-auto" />
          <span className="text-[9px] font-sarabun font-extrabold tracking-[0.15em] mt-0.5 leading-none text-[#fda211]">IA</span>
        </span>
      </button>
    </>
  );
};
