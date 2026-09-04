import React from 'react';

// Safari (escritorio y iOS) tiene problemas con el visor de PDF embebido:
// se traba o no deja volver. En Safari forzamos descarga; en el resto,
// abrimos la vista previa en una pestaña nueva.
const isSafari =
  typeof navigator !== 'undefined' &&
  /^((?!chrome|android|crios|fxios|edg|opr).)*safari/i.test(navigator.userAgent);

interface PdfLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export const PdfLink: React.FC<PdfLinkProps> = ({ href, className, children }) => {
  if (isSafari) {
    return (
      <a href={href} download className={className}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
};
