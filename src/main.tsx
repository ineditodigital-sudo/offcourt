import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { App } from './App.tsx';

/**
 * El hero ya está pintado: index.html trae una versión estática generada desde
 * el mismo componente en tiempo de compilación, para que el contenido exista
 * antes de que llegue este bundle.
 *
 * Al montar, React vacía #root y vuelve a crear esos nodos. Como son elementos
 * nuevos, sus animaciones CSS de entrada se reproducirían por segunda vez y el
 * titular se desvanecería otra vez a la vista del usuario. Esta marca —puesta
 * ANTES del primer render— le dice al CSS que la intro ya ocurrió, así que el
 * hero de React aparece directamente en su estado final.
 */
document.documentElement.classList.add('oc-intro-hecha');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
