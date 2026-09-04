import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCw, ZoomIn } from 'lucide-react';
import { Boton, Modal } from './ui';

/**
 * Recorte y encuadre de una imagen antes de subirla.
 *
 * La persona ve su foto dentro del marco con la proporción que pide ese hueco
 * del sitio (16:9 para una portada, 1:1 para un retrato…), la arrastra para
 * elegir qué parte se ve y ajusta el zoom con un deslizador. No hay números ni
 * píxeles: solo mover y acercar.
 *
 * El resultado sale por canvas como WebP (o JPEG si el navegador no puede),
 * limitado a 2000 px de lado, que es lo mismo que hace el servidor. Recortar
 * aquí evita subir 8 MB para acabar mostrando una franja.
 */

interface Props {
  archivo: File;
  /** Proporción del hueco (ancho / alto). Si no se pasa, se conserva la original. */
  proporcion?: number;
  onCancelar: () => void;
  onListo: (blob: Blob, nombre: string) => void;
}

const LADO_MAX = 2000;

export const Recorte: React.FC<Props> = ({ archivo, proporcion, onCancelar, onListo }) => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [giro, setGiro] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [procesando, setProcesando] = useState(false);
  // El tamaño del marco vive en el estado, no se lee del ref al pintar: durante
  // el primer render el ref todavía es null y la escala salía mal.
  const [marco, setMarco] = useState({ ancho: 0, alto: 0 });
  const marcoRef = useRef<HTMLDivElement>(null);
  const arrastre = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  useEffect(() => {
    const el = marcoRef.current;
    if (!el) return;
    const observador = new ResizeObserver(([entrada]) => {
      const r = entrada.contentRect;
      setMarco({ ancho: r.width, alto: r.height });
    });
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    const url = URL.createObjectURL(archivo);
    const im = new Image();
    im.onload = () => setImg(im);
    im.src = url;
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  const proporcionReal = proporcion ?? (img ? img.naturalWidth / img.naturalHeight : 16 / 9);

  // Escala mínima para que la imagen cubra el marco entero, sin huecos.
  const escalaBase = useCallback(() => {
    if (!img || marco.ancho === 0) return 1;
    const girado = giro % 180 !== 0;
    const w = girado ? img.naturalHeight : img.naturalWidth;
    const h = girado ? img.naturalWidth : img.naturalHeight;
    return Math.max(marco.ancho / w, marco.alto / h);
  }, [img, giro, marco]);

  const alBajar = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    arrastre.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
  };
  const alMover = (e: React.PointerEvent) => {
    if (!arrastre.current) return;
    setPos({ x: arrastre.current.px + (e.clientX - arrastre.current.x), y: arrastre.current.py + (e.clientY - arrastre.current.y) });
  };
  const alSoltar = () => { arrastre.current = null; };

  const generar = async () => {
    if (!img || marco.ancho === 0) return;
    setProcesando(true);
    try {
      const escala = escalaBase() * zoom;

      // Resolución de salida: los píxeles de la imagen original que caben en
      // el marco, con tope de 2000 px de lado.
      let anchoSalida = Math.round(marco.ancho / escala);
      let altoSalida = Math.round(marco.alto / escala);
      const mayor = Math.max(anchoSalida, altoSalida);
      if (mayor > LADO_MAX) {
        const f = LADO_MAX / mayor;
        anchoSalida = Math.round(anchoSalida * f);
        altoSalida = Math.round(altoSalida * f);
      }

      const lienzo = document.createElement('canvas');
      lienzo.width = anchoSalida;
      lienzo.height = altoSalida;
      const ctx = lienzo.getContext('2d');
      if (!ctx) throw new Error('sin canvas');
      ctx.imageSmoothingQuality = 'high';

      /*
       * Se repite exactamente la misma cadena de transformaciones que aplica la
       * vista previa por CSS, para que lo recortado sea lo que se veía:
       *
       *   centro del marco → desplazamiento del arrastre → giro → escala
       *
       * `factor` convierte píxeles de pantalla en píxeles del lienzo; sin él,
       * el arrastre se aplicaría con la medida equivocada y la foto saldría
       * desplazada respecto a lo que la persona encuadró.
       */
      const factor = anchoSalida / marco.ancho;
      ctx.translate(anchoSalida / 2, altoSalida / 2);
      ctx.translate(pos.x * factor, pos.y * factor);
      ctx.rotate((giro * Math.PI) / 180);
      ctx.scale(escala * factor, escala * factor);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      const blob = await new Promise<Blob | null>((r) => lienzo.toBlob(r, 'image/webp', 0.86));
      const salida = blob ?? await new Promise<Blob | null>((r) => lienzo.toBlob(r, 'image/jpeg', 0.9));
      if (!salida) throw new Error('sin blob');
      const base = archivo.name.replace(/\.[a-z0-9]+$/i, '');
      onListo(salida, `${base}.${salida.type === 'image/webp' ? 'webp' : 'jpg'}`);
    } catch {
      // Si el navegador no pudo recortar, se sube el original: el servidor lo
      // optimiza igualmente.
      onListo(archivo, archivo.name);
    } finally {
      setProcesando(false);
    }
  };

  const escala = escalaBase() * zoom;
  const girado = giro % 180 !== 0;

  return (
    <Modal
      titulo="Ajustar la imagen"
      subtitulo="Arrastra para elegir qué parte se ve y usa el deslizador para acercar."
      ancho="lg"
      onCerrar={onCancelar}
      pie={
        <>
          <Boton onClick={onCancelar}>Cancelar</Boton>
          <Boton tipo="principal" onClick={generar} cargando={procesando}>Usar esta imagen</Boton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div
          ref={marcoRef}
          onPointerDown={alBajar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerCancel={alSoltar}
          className="relative mx-auto w-full max-w-2xl cursor-grab touch-none overflow-hidden rounded-xl bg-[#111] active:cursor-grabbing"
          style={{ aspectRatio: String(proporcionReal) }}
        >
          {img && (
            <img
              src={img.src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
              style={{
                width: img.naturalWidth,
                height: img.naturalHeight,
                transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) rotate(${giro}deg) scale(${escala})`,
                transformOrigin: 'center',
              }}
            />
          )}
          {/* Guías de tercios, para encuadrar sin pensarlo */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }, (_, i) => <div key={i} className="border border-white/15" />)}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex flex-1 items-center gap-3 text-[13px] font-bold text-gris-oscuro">
            <ZoomIn size={16} className="shrink-0 text-neutral-400" />
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-black/10 accent-marca"
            />
          </label>
          <Boton tamano="sm" onClick={() => { setGiro((g) => (g + 90) % 360); setPos({ x: 0, y: 0 }); }}>
            <RotateCw size={15} /> Girar
          </Boton>
          <Boton tamano="sm" tipo="suave" onClick={() => { setZoom(1); setGiro(0); setPos({ x: 0, y: 0 }); }}>
            Restablecer
          </Boton>
        </div>

        <p className="text-[12px] leading-snug text-neutral-500">
          {girado ? 'La imagen está girada. ' : ''}
          Se guardará optimizada para que la página cargue rápido, sin que se note en la calidad.
        </p>
      </div>
    </Modal>
  );
};
