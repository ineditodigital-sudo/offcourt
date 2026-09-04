import { createElement, type FC } from 'react';
import {
  Target, Users, Megaphone, TrendingUp, Award, Trophy, Plane, GraduationCap,
  Building2, Landmark, CalendarDays, Star, Handshake, Globe, Video, Mic, Rocket,
  Briefcase, Heart, Zap, AlertCircle, Lightbulb, Shield, Camera, BarChart3,
  type LucideIcon, type LucideProps,
} from 'lucide-react';
import type { Opcion } from './dsl';

/**
 * Iconos que el panel ofrece a la persona que edita, con un nombre en español.
 * La lista es corta a propósito: son los que casan con el tono del sitio.
 * El valor guardado es la clave (p. ej. "trofeo"), nunca el nombre técnico.
 */
export const ICONOS: Record<string, { icono: LucideIcon; etiqueta: string }> = {
  objetivo: { icono: Target, etiqueta: 'Diana' },
  personas: { icono: Users, etiqueta: 'Personas' },
  megafono: { icono: Megaphone, etiqueta: 'Megáfono' },
  crecimiento: { icono: TrendingUp, etiqueta: 'Crecimiento' },
  medalla: { icono: Award, etiqueta: 'Medalla' },
  trofeo: { icono: Trophy, etiqueta: 'Trofeo' },
  avion: { icono: Plane, etiqueta: 'Avión' },
  birrete: { icono: GraduationCap, etiqueta: 'Birrete' },
  edificio: { icono: Building2, etiqueta: 'Edificio' },
  institucion: { icono: Landmark, etiqueta: 'Institución' },
  calendario: { icono: CalendarDays, etiqueta: 'Calendario' },
  estrella: { icono: Star, etiqueta: 'Estrella' },
  apreton: { icono: Handshake, etiqueta: 'Apretón de manos' },
  mundo: { icono: Globe, etiqueta: 'Mundo' },
  video: { icono: Video, etiqueta: 'Vídeo' },
  microfono: { icono: Mic, etiqueta: 'Micrófono' },
  cohete: { icono: Rocket, etiqueta: 'Cohete' },
  maletin: { icono: Briefcase, etiqueta: 'Maletín' },
  corazon: { icono: Heart, etiqueta: 'Corazón' },
  rayo: { icono: Zap, etiqueta: 'Rayo' },
  alerta: { icono: AlertCircle, etiqueta: 'Alerta' },
  idea: { icono: Lightbulb, etiqueta: 'Idea' },
  escudo: { icono: Shield, etiqueta: 'Escudo' },
  camara: { icono: Camera, etiqueta: 'Cámara' },
  grafica: { icono: BarChart3, etiqueta: 'Gráfica' },
};

export const OPCIONES_ICONO: Opcion[] = Object.entries(ICONOS).map(([valor, { etiqueta }]) => ({ valor, etiqueta }));

/** Componente de icono por clave; si la clave no existe, cae en «objetivo». */
export function iconoPorClave(clave: string): LucideIcon {
  return (ICONOS[clave] ?? ICONOS.objetivo).icono;
}

/**
 * Pinta el icono cuya clave viene del contenido. Va por createElement y no
 * por JSX a propósito: elegir el componente dentro del render de otro
 * componente es justo lo que la regla react-hooks/static-components detecta
 * como «componente creado durante el render», aunque aquí sea una referencia
 * estable de la tabla de arriba.
 */
export const Icono: FC<{ clave: string } & LucideProps> = ({ clave, ...props }) =>
  createElement(iconoPorClave(clave), props);
