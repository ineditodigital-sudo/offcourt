import React, { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link2, Heading2, Heading3, Quote, Undo2 } from 'lucide-react';
import { sanitizarHtml } from '../cms/sanitizar';

/**
 * Editor de texto con formato, deliberadamente corto de opciones.
 *
 * Solo negrita, cursiva, subrayado, dos niveles de título, listas, cita y
 * enlaces: lo justo para redactar una política de privacidad sin poder tocar
 * el diseño. Lo que sale de aquí pasa por el saneador antes de guardarse, y
 * otra vez antes de pintarse en el sitio, así que ni pegando desde Word entra
 * nada raro.
 *
 * Usa contenteditable con execCommand. Está marcado como obsoleto, pero sigue
 * siendo lo único que funciona en todos los navegadores sin traerse una
 * librería entera de 100 KB para cinco botones.
 */

interface Props {
  valor: string;
  onCambio: (html: string) => void;
}

const BOTONES: { comando: string; valor?: string; Icono: React.ElementType; titulo: string }[] = [
  { comando: 'bold', Icono: Bold, titulo: 'Negrita' },
  { comando: 'italic', Icono: Italic, titulo: 'Cursiva' },
  { comando: 'underline', Icono: Underline, titulo: 'Subrayado' },
  { comando: 'formatBlock', valor: 'h2', Icono: Heading2, titulo: 'Título' },
  { comando: 'formatBlock', valor: 'h3', Icono: Heading3, titulo: 'Subtítulo' },
  { comando: 'insertUnorderedList', Icono: List, titulo: 'Lista con puntos' },
  { comando: 'insertOrderedList', Icono: ListOrdered, titulo: 'Lista numerada' },
  { comando: 'formatBlock', valor: 'blockquote', Icono: Quote, titulo: 'Cita' },
];

export const EditorTexto: React.FC<Props> = ({ valor, onCambio }) => {
  const ref = useRef<HTMLDivElement>(null);
  const ultimoEmitido = useRef(valor);
  const [enlaceAbierto, setEnlaceAbierto] = useState(false);
  const [urlEnlace, setUrlEnlace] = useState('');
  const seleccionGuardada = useRef<Range | null>(null);

  // El contenido solo se reescribe cuando el cambio viene de fuera (deshacer,
  // restaurar una versión). Si se reescribiera en cada tecla, el cursor
  // saltaría al principio.
  useEffect(() => {
    if (!ref.current) return;
    if (valor === ultimoEmitido.current) return;
    ref.current.innerHTML = sanitizarHtml(valor);
    ultimoEmitido.current = valor;
  }, [valor]);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML === '') {
      ref.current.innerHTML = sanitizarHtml(valor);
    }
  }, [valor]);

  const emitir = () => {
    if (!ref.current) return;
    const limpio = sanitizarHtml(ref.current.innerHTML);
    ultimoEmitido.current = limpio;
    onCambio(limpio);
  };

  const ejecutar = (comando: string, valorCmd?: string) => {
    ref.current?.focus();
    document.execCommand(comando, false, valorCmd);
    emitir();
  };

  const abrirEnlace = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) seleccionGuardada.current = sel.getRangeAt(0).cloneRange();
    setUrlEnlace('');
    setEnlaceAbierto(true);
  };

  const aplicarEnlace = () => {
    const url = urlEnlace.trim();
    setEnlaceAbierto(false);
    if (!url) return;
    const destino = /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url) ? url : 'https://' + url;
    ref.current?.focus();
    if (seleccionGuardada.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(seleccionGuardada.current);
    }
    document.execCommand('createLink', false, destino);
    emitir();
  };

  // Pegar siempre como texto plano: es la vía por la que entra el HTML de Word.
  const alPegar = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const texto = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, texto);
    emitir();
  };

  return (
    <div className="rounded-xl border border-black/10 bg-white focus-within:border-marca focus-within:ring-4 focus-within:ring-marca/15">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-black/8 px-2 py-1.5">
        {BOTONES.map(({ comando, valor: v, Icono, titulo }) => (
          <button
            key={titulo}
            type="button"
            title={titulo}
            aria-label={titulo}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => ejecutar(comando, v)}
            className="rounded-lg p-1.5 text-gris-oscuro transition-colors hover:bg-black/[0.07]"
          >
            <Icono size={16} />
          </button>
        ))}
        <button
          type="button"
          title="Enlace"
          aria-label="Enlace"
          onMouseDown={(e) => e.preventDefault()}
          onClick={abrirEnlace}
          className="rounded-lg p-1.5 text-gris-oscuro transition-colors hover:bg-black/[0.07]"
        >
          <Link2 size={16} />
        </button>
        <span className="mx-1 h-4 w-px bg-black/10" />
        <button
          type="button"
          title="Quitar formato"
          aria-label="Quitar formato"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => ejecutar('removeFormat')}
          className="rounded-lg p-1.5 text-gris-oscuro transition-colors hover:bg-black/[0.07]"
        >
          <Undo2 size={16} />
        </button>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emitir}
        onBlur={emitir}
        onPaste={alPegar}
        className="oc-editor-html oc-scroll max-h-[26rem] overflow-y-auto px-3.5 py-3 text-[14px] leading-relaxed text-negro"
      />

      {enlaceAbierto && (
        <div className="border-t border-black/8 bg-[#fafaf9] px-3 py-2.5">
          <label className="oc-etiqueta">Dirección del enlace</label>
          <div className="flex gap-2">
            <input
              autoFocus
              value={urlEnlace}
              onChange={(e) => setUrlEnlace(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); aplicarEnlace(); } }}
              placeholder="https://ejemplo.com  ·  correo@dominio.com  ·  /nosotros"
              className="oc-campo"
            />
            <button type="button" onClick={aplicarEnlace} className="shrink-0 rounded-xl bg-marca px-4 text-sm font-bold text-negro hover:bg-marca-oscuro">
              Poner
            </button>
            <button type="button" onClick={() => setEnlaceAbierto(false)} className="shrink-0 rounded-xl px-3 text-sm font-semibold text-neutral-500 hover:bg-black/5">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
