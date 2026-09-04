# Offcourt Sports Group — sitio web

Sitio de [offcourtsports.com.mx](https://offcourtsports.com.mx). SPA en React 19 +
TypeScript + Vite 8 + Tailwind v4, desplegada por FTP a un hosting cPanel detrás
de Cloudflare.

## Puesta en marcha

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run build        # compila, pre-renderiza y genera el HTML de cada ruta
npm run preview      # sirve dist/ tal como quedará en producción
npm run lint
```

## Despliegue

```bash
node deploy.cjs --dry-run   # muestra qué subiría y qué borraría, sin tocar nada
node deploy.cjs             # despliegue real
```

Requiere un `.env` en la raíz con las credenciales FTP —copia `.env.example` y
rellénalo—. **Ese archivo nunca debe subirse al repositorio**, que es público.

El despliegue es incremental y seguro: respalda los archivos de servidor
(`.htaccess`, `*.php`), sube antes de borrar, respeta lo que gestiona cPanel
(`php.ini`, `.user.ini`) y aborta si `dist/` parece un build incompleto. Al
terminar comprueba por HTTP que el sitio responde y sirve el bundle nuevo.

## Estructura

```
src/
  features/v3/        Diseño en producción. Todo lo que se ve hoy.
    components/       Secciones de la portada, navbar, formulario
    pages/            HomeV3, NosotrosV3, ServicePageV3, PrivacyV3, TermsV3
  features/v2/        Diseño anterior, servido en /v2 (noindex)
  features/landing/   Diseño original, servido en /v1 (noindex)
  features/legacy/    Envoltorios de esas dos versiones
  components/layout/  Navbar, Footer y formularios compartidos
  hooks/useSeo.ts     Título, descripción, Open Graph y canónica en runtime
  lib/metaRutas.ts    Textos SEO de cada ruta — fuente única de verdad
  lib/gsapLazy.ts     Carga diferida de GSAP + ScrollTrigger
  lib/smoothScroll.ts Acceso a la instancia única de Lenis
  prerender/          Entrada SSR del build: hero estático y tabla de rutas
scripts/
  generar-paginas.mjs Cierre del build (ver abajo)
public/               Estáticos: fotos, fuentes, vídeos, brochures, .htaccess,
                      sendmail.php, robots.txt, sitemap.xml
```

## Cómo se compila

`npm run build` hace tres pasadas:

1. `tsc -b` — comprobación de tipos.
2. `vite build` — bundle del cliente en `dist/`.
3. `npm run prerender` — build SSR de `src/prerender/heroEstatico.tsx` y luego
   `scripts/generar-paginas.mjs`, que sobre `dist/`:
   - incrusta el hero pre-renderizado dentro de `<div id="root">` de la portada,
     para que haya contenido pintado antes de que llegue el JavaScript;
   - escribe un HTML por ruta (`nosotros.html`, `servicios/athletes.html`, …)
     con su `<title>`, descripción, Open Graph y canónica ya en el `<head>`.

Lo segundo existe porque `useSeo` pone esas etiquetas con JavaScript, y los
rastreadores de WhatsApp, LinkedIn y Facebook no lo ejecutan: sin esos archivos,
cualquier enlace interno compartido mostraba la ficha de la portada. El
`.htaccess` mapea `/nosotros → nosotros.html` antes del salto a `index.html`, y
si esos archivos faltaran la regla no casa y todo vuelve al comportamiento de
SPA de siempre.

Al añadir o quitar rutas hay que tocar tres sitios: el `<Route>` en
[`src/App.tsx`](src/App.tsx), los textos en
[`src/lib/metaRutas.ts`](src/lib/metaRutas.ts) y la lista de
[`public/sitemap.xml`](public/sitemap.xml).

## Decisiones que conviene no deshacer

El código lleva comentarios explicando el porqué de cada una; en resumen:

- **El CSS se deja bloqueante.** Diferirlo mejoraba FCP en 1 punto y hundía el
  Total Blocking Time en 15. Ver la nota en [`vite.config.ts`](vite.config.ts).
- **GSAP se carga bajo demanda** (`lib/gsapLazy.ts`): son 44 kB y todo lo que
  anima está bajo el pliegue.
- **Las fuentes están alojadas en el propio dominio**, con los subconjuntos
  recortados y solo dos precargadas: las del elemento LCP.
- **La pantalla de arranque va en `index.html`** con el logo SVG incrustado y
  animada por CSS, no por React: pinta en cuanto llega el HTML.
- **Lenis se crea una sola vez** en toda la vida de la app. Recrearlo por ruta
  dejaba un `requestAnimationFrame` huérfano por cada navegación.
- **El vídeo del hero no se descarga en móvil** ni con ahorro de datos: pesa
  10 MB y ahí basta el póster WebP de 31 kB.

## Pendientes de información del cliente

- **Agente comercial de IA**: el botón flotante dice «Próximamente» y los CTA
  apuntan a WhatsApp. Falta la URL del agente.
- **Redes sociales**: los iconos existen pero están ocultos tras la constante
  `SHOW_SOCIAL` en `ContactFormV3`. Faltan los perfiles oficiales.
- **Analítica**: el sitio no tiene GA4, GTM ni ningún otro medidor instalado.

Ver [`COPY WEB - Offcourt Sports Group.md`](COPY%20WEB%20-%20Offcourt%20Sports%20Group.md)
para el copy aprobado y sus pendientes.
