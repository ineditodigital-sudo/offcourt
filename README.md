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
npm run build        # compila el sitio y el panel, pre-renderiza y genera el HTML de cada ruta
npm run servir       # sirve dist/ con PHP en http://localhost:8080 (sitio + panel + CMS)
npm run preview      # sirve dist/ sin PHP: solo el sitio, sin CMS
npm run lint
```

`npm run servir` es el que hay que usar para probar de verdad: `vite preview` no
ejecuta PHP, así que ni el panel ni la inyección del contenido publicado
funcionan ahí.

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

## El panel de administración

El sitio se administra desde **`/admin`**, sin tocar código y sin recompilar:
textos, fotos, PDFs, colores, tipografías, orden de las secciones, SEO por
página, datos de contacto y los identificadores de Google Analytics o Meta Pixel.

La primera vez, el despliegue imprime un **código de instalación** de un solo
uso; con él se crea la contraseña desde el propio panel. Si algún día se pierde
el acceso, basta con borrar `cms/data/config.php` por FTP y volver a desplegar.

**Cómo funciona**

- El contenido vive como datos (`cms/data/publicado.json` en el servidor), nunca
  mezclado con el diseño. Editarlo no puede tocar el marcado ni el layout.
- La estructura editable está descrita una sola vez en
  [`src/cms/definicion.ts`](src/cms/definicion.ts): de ese árbol salen a la vez
  los valores por defecto del sitio, los formularios del panel y los tipos.
  Añadir un campo es añadirlo ahí.
- Los componentes pintan con `<Tx>`, `<Im>`, `<Btn>` y `<Rico>`
  ([`src/cms/Editable.tsx`](src/cms/Editable.tsx)), que además marcan cada
  elemento en el DOM para que se pueda seleccionar haciendo clic en la vista
  previa.
- `index.php` sirve cada página inyectando el contenido publicado: reescribe el
  `<head>` de SEO, sustituye los textos del hero pre-renderizado, incrusta el
  JSON que React lee al arrancar y escribe las variables de color. Sin petición
  extra y sin parpadeo.
- Publicar es instantáneo: **no hace falta recompilar** para cambiar contenido.
  Solo se recompila cuando cambia el código.

**Límites de diseño, a propósito**

Los ajustes de aspecto son acotados: el tamaño se mueve en pasos dentro de la
escala responsiva (ver [`src/cms/estilos.ts`](src/cms/estilos.ts)), los pesos y
colores salen de listas cerradas, y el texto con formato pasa por un saneador
([`src/cms/sanitizar.ts`](src/cms/sanitizar.ts)) que solo deja negrita, cursiva,
listas, títulos y enlaces. No hay forma de escribir HTML ni CSS desde el panel.

Las clases que esos ajustes pueden generar están declaradas en `@source inline`
dentro de [`src/index.css`](src/index.css). **Si se amplían los controles de
estilo, hay que ampliar esa lista**: Tailwind solo compila las clases que ve
escritas, y una clase que no esté ahí simplemente no existirá en producción.

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
  cms/                Capa de contenido del sitio
    definicion.ts     TODO lo editable, con sus valores por defecto
    dsl.ts            Mini-lenguaje del árbol (defaults + esquema + tipos)
    Editable.tsx      Tx, Im, Btn, Rico: los componentes que pintan contenido
    estilos.ts        Traduce los ajustes de aspecto a clases de Tailwind
    sanitizar.ts      Limpia el HTML del texto con formato
    puente.ts         postMessage con el panel (solo dentro del iframe)
  admin/              El panel (segunda aplicación, se compila a dist/admin/)
  hooks/useSeo.ts     Título, descripción, Open Graph y canónica en runtime
  lib/metaRutas.ts    Textos SEO de cada ruta — fuente única de verdad
  lib/gsapLazy.ts     Carga diferida de GSAP + ScrollTrigger
  lib/smoothScroll.ts Acceso a la instancia única de Lenis
  prerender/          Entrada SSR del build: hero estático y tabla de rutas
scripts/
  generar-paginas.mjs Cierre del build (ver abajo)
  servidor-local.php  Router para probar con PHP en local
admin/index.html      Punto de entrada del panel
public/               Estáticos: fotos, fuentes, vídeos, brochures, .htaccess,
                      robots.txt, sitemap.xml
  index.php           Sirve cada página con el contenido publicado inyectado
  sendmail.php        Formulario de contacto (correo + copia en el panel)
  cms/                Backend del panel: api.php y lib/*.php
  cms/data/           Contenido, contraseña, mensajes. Solo en el servidor.
  media/              Archivos subidos desde el panel. Solo en el servidor.
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
- **El contenido lo inyecta PHP, no una petición del navegador.** Pedirlo por
  `fetch` al arrancar añadiría un salto a la red antes de poder pintar y
  devolvería el parpadeo que costó tanto quitar.
- **`deploy.cjs` nunca toca `cms/data/` ni `media/`**: son el estado que solo
  existe en el servidor. Un despliegue que los borrara dejaría el sitio sin sus
  textos y sin las fotos que subió el cliente.

## Pendientes de información del cliente

- **Agente comercial de IA**: el botón flotante dice «Próximamente» y los CTA
  apuntan a WhatsApp. Falta la URL del agente.
- **Redes sociales**: los iconos existen pero están ocultos tras la constante
  `SHOW_SOCIAL` en `ContactFormV3`. Faltan los perfiles oficiales.
- **Analítica**: ya se puede activar sola desde el panel (Todo el sitio →
  Mediciones) pegando el identificador de Google Analytics o Meta Pixel. Falta
  que el cliente cree la propiedad y facilite el ID.

Ver [`COPY WEB - Offcourt Sports Group.md`](COPY%20WEB%20-%20Offcourt%20Sports%20Group.md)
para el copy aprobado y sus pendientes.
