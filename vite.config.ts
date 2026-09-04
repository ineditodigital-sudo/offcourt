import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

/**
 * NOTA sobre el CSS y por qué se dejó bloqueante.
 *
 * Se probó cargarlo de forma no bloqueante (rel="preload" + swap a stylesheet).
 * Mejoró FCP y Speed Index, pero hundió el Total Blocking Time de 0 a 610 ms y
 * multiplicó las tareas largas de 2 a 17: aplicar una hoja de ~100 KB sobre un
 * DOM de 543 elementos YA renderizado obliga a recalcular estilo y layout de
 * toda la página de una sola vez, y eso es una tarea larga enorme.
 *
 * En puntos: ganaba 1 en FCP y 1 en Speed Index, y perdía 15 en TBT.
 *
 * Si algún día se quiere retomar, el camino correcto es extraer el CSS crítico
 * del hero e incrustarlo en el <head>, y solo entonces diferir el resto: así el
 * primer render ya sale con sus estilos y la hoja que llega después apenas
 * añade reglas de lo que está bajo el pliegue.
 */

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      /*
       * Dos aplicaciones en el mismo proyecto:
       *
       *   index.html        el sitio público
       *   admin/index.html  el panel de administración (dist/admin/)
       *
       * Comparten React, los tipos del contenido (src/cms) y las tipografías,
       * pero son bundles separados: quien visita el sitio no descarga ni un
       * byte del panel.
       */
      input: {
        sitio: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
      },
    },
  },
})
