import React from 'react';

// Safari (escritorio y iOS) tiene problemas con el visor de PDF embebido:
// se traba o no deja volver. En Safari forzamos descarga; en el resto,
// abrimos la vista previa en una pestaña nueva.
const isSafari =
  typeof navigator !== 'undefined' &&
  /^((?!chrome|android|crios|fxios|edg|opr).)*safari/i.test(navigator.userAgent);

interface PdfLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export const PdfLink: React.FC<PdfLinkProps> = ({ href, children, ...rest }) => {
  if (isSafari) {
    return (
      <a {...rest} href={href} download>
        {children}
      </a>
    );
  }
  return (
    <a {...rest} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};
