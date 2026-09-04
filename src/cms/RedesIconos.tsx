import React from 'react';

/**
 * Iconos de redes sociales. lucide-react dejó de incluir marcas registradas,
 * así que van como SVG propios, trazados a 24×24 para casar con el resto.
 */

interface Props { size?: number; className?: string }

const base = (size: number, className?: string) => ({
  width: size, height: size, viewBox: '0 0 24 24', className, 'aria-hidden': true as const,
});

export const InstagramIcon: React.FC<Props> = ({ size = 20, className }) => (
  <svg {...base(size, className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export const LinkedinIcon: React.FC<Props> = ({ size = 20, className }) => (
  <svg {...base(size, className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const FacebookIcon: React.FC<Props> = ({ size = 20, className }) => (
  <svg {...base(size, className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const YoutubeIcon: React.FC<Props> = ({ size = 20, className }) => (
  <svg {...base(size, className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export const TiktokIcon: React.FC<Props> = ({ size = 20, className }) => (
  <svg {...base(size, className)} fill="currentColor">
    <path d="M16.5 3c.4 2.3 1.9 3.9 4.3 4.1v3.1c-1.6 0-3-.5-4.3-1.4v6.4c0 3.3-2.7 5.9-6 5.9S4.5 18.5 4.5 15.2c0-3.3 2.7-5.9 6-5.9.3 0 .6 0 .9.1v3.2c-.3-.1-.6-.2-.9-.2-1.5 0-2.8 1.2-2.8 2.8s1.3 2.8 2.8 2.8 2.8-1.2 2.8-2.8V3h3.2z" />
  </svg>
);
