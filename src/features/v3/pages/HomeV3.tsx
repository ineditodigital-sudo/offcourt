import React, { Fragment } from 'react';
import { useSeo } from '../../../hooks/useSeo';
import { useContenido } from '../../../cms/ContenidoContext';
import { HeroV3 } from '../components/HeroV3';
import { AdnOffcourtV3 } from '../components/AdnOffcourtV3';
import { IdealClientV3 } from '../components/IdealClientV3';
import { ProjectsScrollV3 } from '../components/ProjectsScrollV3';
import { TextManifestoV3 } from '../components/TextManifestoV3';
import { ManifestoV3 } from '../components/ManifestoV3';
import { ContactFormV3 } from '../components/ContactFormV3';

export const HomeV3: React.FC = () => {
  const { inicio } = useContenido().paginas;
  useSeo(inicio.seo.titulo, inicio.seo.descripcion, inicio.seo.imagen.src);

  // La portada va siempre primero. El resto se pinta en el orden que la
  // persona eligió en el panel, saltando las secciones que apagó. Si el código
  // añade una sección que aún no está en ese orden, va al final.
  const bloques: Record<string, { visible: boolean; nodo: React.ReactNode }> = {
    adn: { visible: inicio.adn.visible, nodo: <AdnOffcourtV3 /> },
    clientes: { visible: inicio.clientes.visible, nodo: <IdealClientV3 /> },
    soluciones: { visible: inicio.soluciones.visible, nodo: <ProjectsScrollV3 /> },
    manifiesto: { visible: inicio.manifiesto.visible, nodo: <TextManifestoV3 /> },
    alianza: { visible: inicio.alianza.visible, nodo: <ManifestoV3 /> },
    contacto: { visible: inicio.contacto.visible, nodo: <ContactFormV3 /> },
  };
  const orden = [...inicio.orden, ...Object.keys(bloques).filter((id) => !inicio.orden.includes(id))];

  return (
    <>
      <HeroV3 />
      {orden.map((id) => {
        const bloque = bloques[id];
        if (!bloque || !bloque.visible) return null;
        return <Fragment key={id}>{bloque.nodo}</Fragment>;
      })}
    </>
  );
};
