import {
  grupo, lista, texto, textoLargo, html, imagen, archivo, boton, enlace, booleano,
  color, opcion, orden, oculto, valoresPorDefecto, type Valores,
} from './dsl';
import { OPCIONES_ICONO } from './iconos';
import { META } from '../lib/metaRutas';

/**
 * TODO el contenido editable del sitio, con sus valores por defecto.
 *
 * Es la única fuente de verdad: de aquí salen los textos con los que se compila
 * el sitio, los formularios del panel y los tipos. Las etiquetas y ayudas están
 * escritas para la persona que administra el sitio, sin jerga: es lo único que
 * ella ve.
 *
 * Reglas al ampliar esto:
 *  - Cada sección empieza por `visible`, para poder ocultarla desde el panel.
 *  - Las listas con `agregar: false` son de tamaño fijo porque el diseño
 *    depende de cuántas hay (los siete mosaicos de clientes, las tres tarjetas
 *    del ADN). Las demás dejan añadir y quitar.
 *  - Nada de HTML libre: el tipo `html` solo admite formato básico y pasa por
 *    el saneador antes de pintarse.
 */

const seo = (valores: { title: string; description: string }) =>
  grupo('Cómo se ve en Google y al compartir', {
    titulo: texto('Título en Google y en redes', valores.title,
      'Es lo que aparece como título del resultado en Google y en la tarjeta al compartir el enlace por WhatsApp o LinkedIn. Lo ideal: menos de 60 letras.', 70),
    descripcion: textoLargo('Descripción corta', valores.description,
      'El texto gris que acompaña al título en Google y en la tarjeta al compartir. Lo ideal: entre 120 y 160 letras.', 200),
    imagen: imagen('Imagen al compartir', { src: '/og-image.png', alt: 'Offcourt Sports Group' },
      'La imagen grande que sale al pegar el enlace en WhatsApp, LinkedIn o Facebook. Funciona mejor si es horizontal (1200 × 630).', 1200 / 630),
  }, 'Estos textos no se ven dentro de la página: son los que usan Google y las redes sociales.');

const OPCIONES_FUENTE = [
  { valor: 'outfit', etiqueta: 'Outfit (la de los títulos)' },
  { valor: 'sarabun', etiqueta: 'Sarabun (la del texto)' },
  { valor: 'georgia', etiqueta: 'Georgia (clásica, con serifas)' },
  { valor: 'arial', etiqueta: 'Arial (neutra)' },
];

export const definicion = grupo('Sitio', {

  // ========================================================== DATOS GENERALES
  global: grupo('Datos generales', {

    contacto: grupo('Datos de contacto', {
      emailGeneral: texto('Correo general', 'contacto@offcourtsports.com.mx', 'Aparece en la sección de contacto y en el pie de página.'),
      whatsapp: texto('Número de WhatsApp', '523314825847',
        'Solo dígitos, con la lada del país y sin espacios ni signos: 52 + lada + número. Todos los botones de WhatsApp del sitio abren este número.'),
      sede: texto('Sede', 'México', 'Se muestra bajo «Global HQ» en la sección de contacto y en el pie.'),
      personas: lista('Personas de contacto', {
        nombre: texto('Nombre', ''),
        telefono: texto('Teléfono (como se muestra)', '', 'Con espacios, tal como quieres que se lea. Ej.: +52 33 14 82 58 47'),
        email: texto('Correo', ''),
      }, [
        { nombre: 'Gustavo Moreda', telefono: '+52 33 14 82 58 47', email: 'gmoreda@offcourtsports.com.mx' },
        { nombre: 'Jorge Valdéz', telefono: '+52 449 105 92 07', email: 'jvaldez@offcourtsports.com.mx' },
      ], { nombreItem: 'Persona', campoTitulo: 'nombre', max: 4 }),
    }),

    redes: grupo('Redes sociales', {
      mostrar: booleano('Mostrar las redes en el sitio', false, 'Enciéndelo cuando tengas los enlaces oficiales. Mientras esté apagado, los iconos no aparecen.'),
      instagram: enlace('Instagram', { url: '', nuevaPestana: true }, 'Pega la dirección completa, p. ej. https://www.instagram.com/tu-cuenta'),
      linkedin: enlace('LinkedIn', { url: '', nuevaPestana: true }),
      facebook: enlace('Facebook', { url: '', nuevaPestana: true }),
      tiktok: enlace('TikTok', { url: '', nuevaPestana: true }),
      youtube: enlace('YouTube', { url: '', nuevaPestana: true }),
    }),

    navegacion: grupo('Menú superior', {
      inicio: texto('Inicio', 'Inicio'),
      nosotros: texto('Nosotros', 'Nosotros'),
      soluciones: texto('Soluciones', 'Soluciones'),
      proyectos: texto('Proyectos', 'Proyectos'),
      whatsapp: texto('Botón de WhatsApp', 'WhatsApp'),
    }, 'Solo se cambian los nombres; el orden y los destinos del menú son fijos.'),

    pie: grupo('Pie de página', {
      descripcion: textoLargo('Descripción de la empresa', 'Agencia premium de Sports Marketing especializada en pádel y en todo el ecosistema de negocios del deporte. El verdadero valor sucede fuera de la cancha.'),
      tituloExplorar: texto('Título de la lista de enlaces', 'Explorar'),
      enlaceServicios: texto('Nombre del enlace a servicios', 'Servicios'),
      enlaceProyectos: texto('Nombre del enlace a proyectos', 'Proyectos'),
      enlaceContacto: texto('Nombre del enlace a contacto', 'Contacto'),
      tituloContacto: texto('Título del bloque de contacto', 'Contacto'),
      derechos: texto('Texto de derechos', 'Offcourt Sports Group. Todos los derechos reservados.', 'El año se pone solo delante de este texto.'),
      privacidad: texto('Nombre del enlace a privacidad', 'Política de Privacidad'),
      terminos: texto('Nombre del enlace a términos', 'Términos de Servicio'),
      creditos: texto('Créditos', 'Desarrollado por Inédito Digital'),
      creditosUrl: texto('Enlace de los créditos', 'https://inedito.digital'),
    }),

    agenteIA: grupo('Botón flotante de agente IA', {
      visible: booleano('Mostrar el botón flotante', true),
      titulo: texto('Título', 'Agente IA'),
      subtitulo: texto('Subtítulo', 'Offcourt Sports Group'),
      texto: textoLargo('Mensaje', 'Muy pronto podrás chatear aquí con nuestro asistente inteligente para resolver dudas, recibir información y agendar una videollamada al instante.'),
      etiqueta: texto('Etiqueta de estado', 'Próximamente'),
    }),

    integraciones: grupo('Mediciones y seguimiento', {
      ga4: texto('Google Analytics (ID de medición)', '',
        'Empieza por «G-». Lo encuentras en Google Analytics → Administrar → Flujos de datos. Con solo pegarlo aquí, el sitio empieza a medir visitas.'),
      metaPixel: texto('Meta Pixel (ID)', '',
        'Solo números. Lo encuentras en el Administrador de eventos de Meta. Sirve para medir campañas de Facebook e Instagram.'),
    }, 'No hace falta tocar código: pega el identificador que te da cada herramienta y listo. Déjalo vacío para no medir.'),

    tema: grupo('Colores y tipografías', {
      naranja: color('Color de marca (naranja)', '#fda211', 'El color de acento: botones, títulos destacados, iconos.'),
      naranjaOscuro: color('Naranja al pasar el ratón', '#e5920f', 'Un poco más oscuro que el de marca; se usa en los botones al pasar por encima.'),
      negro: color('Negro de marca', '#1b1b1b', 'Fondo del modo oscuro y del pie; texto principal en modo claro.'),
      grisOscuro: color('Gris oscuro', '#2e2f30'),
      grisClaro: color('Gris claro', '#e4e4e4', 'Fondo del modo claro y texto suave en modo oscuro.'),
      fuenteTitulos: opcion('Tipografía de los títulos', 'outfit', OPCIONES_FUENTE),
      fuenteTexto: opcion('Tipografía del texto', 'sarabun', OPCIONES_FUENTE),
    }, 'Cambia el aspecto de todo el sitio a la vez. Los elementos a los que hayas dado un color propio conservan el suyo.'),
  }),

  // ================================================================= PÁGINAS
  paginas: grupo('Páginas', {

    // ------------------------------------------------------------- INICIO
    inicio: grupo('Inicio', {
      seo: seo(META.home),

      orden: orden('Orden de las secciones', ['adn', 'clientes', 'soluciones', 'manifiesto', 'alianza', 'contacto'], [
        { valor: 'adn', etiqueta: 'El problema / la solución / nuestro ADN' },
        { valor: 'clientes', etiqueta: '¿A quiénes ayudamos?' },
        { valor: 'soluciones', etiqueta: 'Soluciones (las 7 verticales)' },
        { valor: 'manifiesto', etiqueta: 'Manifiesto' },
        { valor: 'alianza', etiqueta: 'Alianza Rafa Nadal Academy' },
        { valor: 'contacto', etiqueta: 'Contacto' },
      ], 'La portada siempre va primero. Arrastra o usa las flechas para mover el resto.'),

      hero: grupo('Portada', {
        antetitulo: texto('Frase pequeña de arriba', 'PRIMERA AGENCIA PREMIUM DE PÁDEL EN MÉXICO', undefined, 60),
        titulo: texto('Título principal (primera línea)', 'EL VERDADERO VALOR DEL DEPORTE', undefined, 60),
        tituloDestacado: texto('Título principal (línea en naranja)', 'SUCEDE FUERA DE LA CANCHA.', undefined, 60),
        bajada: textoLargo('Texto bajo el título', 'Agencia Premium de Sports Marketing especializada en desarrollar oportunidades de negocio y conectar atletas, marcas e instituciones mediante estrategias, experiencias y alianzas de alto valor.', undefined, 300),
        botonWhatsapp: boton('Botón principal', { texto: 'Hablar por WhatsApp', url: 'whatsapp', nuevaPestana: true },
          'Escribe «whatsapp» como destino para que abra el número de WhatsApp de Datos de contacto.'),
        botonServicios: boton('Botón secundario', { texto: 'Nuestros Servicios', url: '#soluciones', nuevaPestana: false },
          'Un destino que empiece por # baja hasta esa sección de la portada: #soluciones, #alianza, #contacto, #manifiesto.'),
        imagenFondo: imagen('Imagen de fondo', { src: '/hero-poster.webp', alt: '' },
          'Es la imagen que se ve al abrir el sitio. En computadora, encima de ella se reproduce el vídeo de portada; en celular solo se ve esta imagen.', 16 / 9),
      }),

      adn: grupo('El problema / la solución / nuestro ADN', {
        visible: booleano('Mostrar esta sección', true),
        tarjetas: lista('Tarjetas', {
          icono: opcion('Icono', 'alerta', OPCIONES_ICONO),
          titulo: texto('Título', ''),
          texto: textoLargo('Texto', ''),
        }, [
          { icono: 'alerta', titulo: 'EL PROBLEMA', texto: 'El negocio del deporte está fragmentado. El talento sobra; la estructura para convertirlo en negocio, no.' },
          { icono: 'objetivo', titulo: 'LA SOLUCIÓN', texto: 'Un solo aliado para todo el ecosistema. Estrategia, marca, experiencias, medios y alianzas bajo un mismo techo. Tú compites; nosotros hacemos el negocio.' },
          { icono: 'rayo', titulo: 'NUESTRO ADN', texto: 'La primera agencia premium de pádel en México, abierta a todo el deporte. El valor real sucede fuera de la cancha.' },
        ], { agregar: false, nombreItem: 'Tarjeta', campoTitulo: 'titulo' }),
      }),

      clientes: grupo('¿A quiénes ayudamos?', {
        visible: booleano('Mostrar esta sección', true),
        antetitulo: texto('Frase pequeña de arriba', 'NUESTROS CLIENTES'),
        titulo: texto('Título (primera línea)', '¿A QUIÉNES'),
        tituloLinea2: texto('Título (segunda línea)', 'AYUDAMOS?'),
        items: lista('Mosaicos', {
          icono: opcion('Icono', 'trofeo', OPCIONES_ICONO),
          titulo: texto('Título', ''),
          texto: textoLargo('Texto (aparece al pasar el ratón)', ''),
          imagen: imagen('Fotografía de fondo', { src: '', alt: '' }),
        }, [
          { icono: 'trofeo', titulo: 'ATLETAS PROFESIONALES Y EMERGENTES', texto: 'Convertimos tu talento en una marca personal rentable y atractiva para patrocinadores.', imagen: { src: '/fotos/IMG_008.webp', alt: '' } },
          { icono: 'avion', titulo: 'FAMILIAS Y AFICIONADOS', texto: 'Turismo deportivo de élite: clínicas y campamentos internacionales de pádel, tenis y más.', imagen: { src: '/fotos/IMG_021.webp', alt: '' } },
          { icono: 'birrete', titulo: 'PADRES CON HIJOS DEPORTISTAS', texto: 'Acompañamiento estratégico para aspirar a becas deportivas en el extranjero.', imagen: { src: '/fotos/IMG_O10.webp', alt: '' } },
          { icono: 'megafono', titulo: 'MARCAS Y PATROCINADORES', texto: 'Conectamos tu marca con el ecosistema deportivo, con presencia y retorno real.', imagen: { src: '/fotos/IMG_003.webp', alt: '' } },
          { icono: 'edificio', titulo: 'CLUBES Y ACADEMIAS', texto: 'Potenciamos el modelo de negocio y el posicionamiento de tu club.', imagen: { src: '/fotos/IMG_024.webp', alt: '' } },
          { icono: 'institucion', titulo: 'GOBIERNOS E INSTITUCIONES', texto: 'Estrategias deportivas de impacto social, turístico y económico.', imagen: { src: '/fotos/IMG_017.webp', alt: '' } },
          { icono: 'calendario', titulo: 'EVENTOS Y CORPORATIVOS', texto: 'Eventos de alto impacto y el deporte como plataforma de networking premium.', imagen: { src: '/fotos/IMG_016.webp', alt: '' } },
        ], { agregar: false, nombreItem: 'Mosaico', campoTitulo: 'titulo', ayuda: 'Son siete mosaicos de tamaños distintos: el primero es el grande. Puedes cambiar lo que dice cada uno, pero no cuántos hay.' }),
      }),

      soluciones: grupo('Soluciones', {
        visible: booleano('Mostrar esta sección', true),
        antetitulo: texto('Frase pequeña de arriba', 'NUESTRAS VERTICALES'),
        titulo: texto('Título', 'SOLUCIONES'),
        texto: textoLargo('Texto de la derecha', 'Funcionamos como un Hub Integral para cubrir todas las necesidades comerciales del ecosistema deportivo bajo un mismo techo.'),
        datos: lista('Cifras destacadas', {
          icono: opcion('Icono', 'crecimiento', OPCIONES_ICONO),
          cifra: texto('Cifra', ''),
          texto: texto('Texto', ''),
        }, [
          { icono: 'crecimiento', cifra: '7', texto: 'Verticales Estratégicas' },
          { icono: 'personas', cifra: '100%', texto: 'Enfoque Deportivo' },
          { icono: 'objetivo', cifra: '360°', texto: 'Estrategia Integral' },
        ], { agregar: false, nombreItem: 'Cifra', campoTitulo: 'cifra' }),
      }, 'Las siete tarjetas de esta sección son las verticales: se editan en «Servicios».'),

      manifiesto: grupo('Manifiesto', {
        visible: booleano('Mostrar esta sección', true),
        antetitulo: texto('Frase pequeña de arriba', 'NUESTRO MANIFIESTO'),
        titulo: texto('Título (parte en blanco)', 'EL VERDADERO VALOR DEL DEPORTE'),
        tituloDestacado: texto('Título (parte en naranja)', 'SUCEDE FUERA DE LA CANCHA'),
        texto: textoLargo('Texto', 'El marcador se olvida; el legado permanece. Los contratos, las alianzas y las decisiones que definen una carrera se juegan lejos de los reflectores.'),
        textoDestacado: textoLargo('Texto destacado (en negrita)', 'Ahí jugamos nosotros —junto a las marcas, los clubes y los atletas que quieren ganar también fuera de la cancha.'),
        imagenFondo: imagen('Fotografía de fondo', { src: '/fotos/IMG_014.webp', alt: '' }, undefined, 16 / 9),
      }),

      alianza: grupo('Alianza Rafa Nadal Academy', {
        visible: booleano('Mostrar esta sección', true),
        etiqueta: texto('Etiqueta pequeña', 'GLOBAL PARTNERSHIP'),
        logo: imagen('Logotipo del aliado', { src: '/rafa-nadal-logo.png', alt: 'Rafa Nadal Academy Logo' }, 'Se muestra en blanco sobre fondo oscuro y en negro sobre fondo claro de forma automática.'),
        titulo: texto('Título', 'ALIANZA ESTRATÉGICA INTERNACIONAL'),
        texto: textoLargo('Texto', 'Nuestra solidez institucional nos permite ser aliados estratégicos y promotores oficiales. Operamos como el puente directo hacia las clínicas élite y campamentos de alto rendimiento en las sedes de Mallorca y Kuwait, garantizando acceso y gestión premium.'),
        botonContacto: boton('Botón', { texto: 'Contacto', url: '#contacto', nuevaPestana: false }),
        tituloPresentaciones: texto('Título de las descargas', 'Presentaciones comerciales'),
        presentaciones: lista('Documentos descargables', {
          texto: texto('Nombre del botón', ''),
          archivo: archivo('Documento (PDF)', { src: '', nombre: '' }),
        }, [
          { texto: 'Tennis Camp Junior', archivo: { src: '/brochures/RNA_Tennis_Camp_Junior_2026.pdf', nombre: 'RNA Tennis Camp Junior 2026' } },
          { texto: 'Pádel Camp Adult', archivo: { src: '/brochures/RNA_Padel_Camp_Adult_2026.pdf', nombre: 'RNA Pádel Camp Adult 2026' } },
        ], { nombreItem: 'Documento', campoTitulo: 'texto', max: 4 }),
        imagen: imagen('Fotografía grande', { src: '/rafa-nadal.webp', alt: 'Rafa Nadal Academy' }, undefined, 4 / 5),
        video: archivo('Vídeo (se abre al pulsar «Ver video»)', { src: '/rna-camps-2024.mp4', nombre: 'RNA Camps 2024' }),
        textoVideo: texto('Texto del botón de vídeo', 'Ver video'),
      }),

      contacto: grupo('Contacto', {
        visible: booleano('Mostrar esta sección', true),
        antetitulo: texto('Frase pequeña de arriba', 'START NOW'),
        titulo: texto('Título (primera línea)', 'AGENDAR SESIÓN'),
        tituloLinea2: texto('Título (segunda línea)', 'ESTRATÉGICA'),
        texto: textoLargo('Texto', 'Ya sea que busques conectar tu marca con el ecosistema deportivo o potenciar tu legado como atleta élite, hablemos de negocios.'),
        etiquetaSede: texto('Etiqueta de la sede', 'Global HQ'),
        etiquetaCorreo: texto('Etiqueta del correo', 'Atención General'),
        tituloFormulario: texto('Título del formulario', 'Cuéntanos tu proyecto'),
        textoFormulario: textoLargo('Texto del formulario', 'Déjanos tus datos y te contactamos para agendar una videollamada.'),
        botonEnviar: texto('Botón de enviar', 'Enviar mensaje'),
        tituloExito: texto('Título al enviar con éxito', '¡Mensaje enviado!'),
        textoExito: textoLargo('Texto al enviar con éxito', 'Gracias por escribirnos. Nuestro equipo te contactará muy pronto.'),
        textoWhatsapp: texto('Texto junto al enlace de WhatsApp', 'o escríbenos por'),
        tituloRedes: texto('Título de las redes', 'Síguenos'),
      }),
    }),

    // ----------------------------------------------------------- NOSOTROS
    nosotros: grupo('Nosotros', {
      seo: seo(META.nosotros),
      hero: grupo('Cabecera', {
        antetitulo: texto('Frase pequeña de arriba', 'NUESTRA IDENTIDAD'),
        titulo: texto('Título (primera línea)', 'ESTRATEGAS'),
        tituloLinea2: texto('Título (segunda línea)', 'FUERA DE LA CANCHA.'),
        texto: textoLargo('Texto', 'No somos el típico consultor que habla con clichés deportivos. Somos el director general que entra a tu oficina con la estrategia, los números y las conexiones para multiplicar el valor comercial de tu marca o perfil deportivo. El verdadero juego, el que dicta el éxito a largo plazo, se juega en las salas de juntas.'),
        imagenFondo: imagen('Fotografía de fondo', { src: '/fotos/IMG_007.webp', alt: 'Offcourt Corporate' }, undefined, 16 / 9),
      }),
      filosofia: grupo('Filosofía Off Court', {
        visible: booleano('Mostrar esta sección', true),
        etiqueta: texto('Etiqueta', 'FILOSOFÍA'),
        titulo: texto('Título grande', 'OFF COURT'),
        texto: textoLargo('Texto', 'Creemos que el verdadero valor del deporte sucede'),
        textoDestacado: texto('Parte en negrita', '"Fuera de la cancha"'),
        textoFinal: textoLargo('Texto después de la parte en negrita', ': en las relaciones, la narrativa, la comunidad, el networking y las experiencias que construyen marcas memorables.'),
        items: lista('Tarjetas', {
          titulo: texto('Título', ''),
          texto: textoLargo('Texto', ''),
          imagen: imagen('Fotografía', { src: '', alt: '' }),
        }, [
          { titulo: 'DEPORTE COMO PLATAFORMA DE NEGOCIO', texto: 'Cada torneo, clínica, atleta o contenido puede convertirse en una oportunidad comercial inteligente y sostenible.', imagen: { src: '/fotos/IMG_008.webp', alt: '' } },
          { titulo: 'BRANDING CON IDENTIDAD', texto: 'No construimos solo eventos o campañas; construimos percepción, prestigio y posicionamiento.', imagen: { src: '/fotos/IMG_011.webp', alt: '' } },
          { titulo: 'EXPERIENCIAS PREMIUM', texto: 'Buscamos que cada activación, torneo o alianza genere emociones, exclusividad y alto valor percibido.', imagen: { src: '/fotos/IMG_012.webp', alt: '' } },
          { titulo: 'RELACIONES A LARGO PLAZO', texto: 'El networking estratégico y la confianza son activos más importantes que cualquier venta inmediata.', imagen: { src: '/fotos/IMG_018.webp', alt: '' } },
          { titulo: 'CULTURA & CONTENIDO', texto: 'Las nuevas audiencias conectan con historias, personalidad y autenticidad. El contenido es parte central del crecimiento deportivo moderno.', imagen: { src: '/fotos/IMG_021.webp', alt: '' } },
        ], { nombreItem: 'Tarjeta', campoTitulo: 'titulo', max: 6 }),
      }),
      mvv: grupo('Visión, valores y misión', {
        visible: booleano('Mostrar esta sección', true),
        visionTitulo: texto('Título del bloque de visión', 'VISIÓN'),
        visionTexto: textoLargo('Texto de visión', 'Desarrollar oportunidades de negocio, BRANDING Y POSICIONAMIENTO dentro del ecosistema deportivo, conectando atletas, academias, instituciones y marcas mediante experiencias, alianzas estratégicas y proyectos de alto impacto.'),
        visionImagen: imagen('Fotografía del bloque de visión', { src: '/fotos/IMG_015.webp', alt: '' }),
        valoresTitulo: texto('Título del bloque de valores', 'VALORES'),
        valores: lista('Valores', { texto: texto('Valor', '') }, [
          { texto: 'Excelencia' }, { texto: 'Innovación' }, { texto: 'Integridad' },
          { texto: 'Pasión por el deporte' }, { texto: 'Experiencias Premium' }, { texto: 'Autenticidad' },
        ], { nombreItem: 'Valor', campoTitulo: 'texto', max: 8 }),
        valoresImagen: imagen('Fotografía del bloque de valores', { src: '/fotos/IMG_025.webp', alt: '' }),
        eslogan: textoLargo('Eslogan del cuadro naranja', 'Again\nAgain\nAgain\nA Gain.', 'Cada línea va en un renglón.'),
        imagenLibre: imagen('Fotografía suelta', { src: '/fotos/IMG_018.webp', alt: '' }),
        misionTitulo: texto('Título del bloque de misión', 'MISIÓN'),
        misionTexto: textoLargo('Texto de misión', 'Convertirnos en la agencia líder de sports marketing y experiencias deportivas en Latinoamérica, conectando el mundo del pádel y otras disciplinas con marcas, atletas e instituciones a través de proyectos que impulsen negocio, posicionamiento y crecimiento global.'),
      }),
      mostrarClientes: booleano('Mostrar «¿A quiénes ayudamos?» también en esta página', true),
      mostrarContacto: booleano('Mostrar el formulario de contacto al final', true),
    }),

    // ---------------------------------------------------------- SERVICIOS
    servicios: grupo('Servicios (las 7 verticales)', {
      seo: seo(META.serviciosGenerico),
      textos: grupo('Textos comunes a todas las verticales', {
        volver: texto('Enlace para volver', 'Volver'),
        contexto: texto('Título del primer bloque', 'El Contexto'),
        desafio: texto('Etiqueta del reto', 'El Desafío'),
        entregables: texto('Título de la lista de entregables', 'Entregables'),
        firma: texto('Firma bajo la frase', 'Offcourt Sports Group'),
        botonCta: boton('Botón final', { texto: 'Iniciemos un Proyecto', url: '#contacto', nuevaPestana: false }),
        noEncontrado: texto('Mensaje si la vertical no existe', 'Servicio no encontrado'),
        volverInicio: texto('Enlace para volver al inicio', 'Volver al inicio'),
      }),
      items: lista('Verticales', {
        id: oculto(''),
        visible: booleano('Mostrar esta vertical', true, 'Si la apagas, desaparece del menú y de la portada.'),
        icono: opcion('Icono', 'objetivo', OPCIONES_ICONO),
        titulo: texto('Nombre', ''),
        subtitulo: texto('Subtítulo', ''),
        entregablesCorto: texto('Resumen en dos palabras (tarjeta de la portada)', '', 'Ej.: Consultoría • Modelos de Negocio'),
        resumen: textoLargo('Resumen corto (tarjeta de la portada)', ''),
        imagenPortada: imagen('Fotografía de la tarjeta en la portada', { src: '', alt: '' }, undefined, 3 / 4),
        descripcion: textoLargo('Descripción (bloque «El Contexto»)', ''),
        reto: textoLargo('El reto que resuelve', ''),
        datoCifra: texto('Dato clave: cifra', ''),
        datoTexto: texto('Dato clave: texto', ''),
        beneficios: lista('Entregables', { texto: texto('Entregable', '') }, [], { nombreItem: 'Entregable', campoTitulo: 'texto', max: 6 }),
        frase: textoLargo('Frase de cierre (va entre comillas)', ''),
        imagen: imagen('Fotografía de la cabecera', { src: '', alt: '' }, undefined, 16 / 9),
        galeria1: imagen('Fotografía 1 del mosaico', { src: '', alt: '' }),
        galeria2: imagen('Fotografía 2 del mosaico', { src: '', alt: '' }),
      }, [
        {
          id: 'consulting', visible: true, icono: 'objetivo',
          titulo: 'OFF COURT CONSULTING', subtitulo: 'Estrategia y Desarrollo de Negocio',
          entregablesCorto: 'Consultoría • Modelos de Negocio',
          resumen: 'Auditamos, estructuramos y ejecutamos el plan que convierte tu proyecto deportivo en un activo rentable. Estrategia de sala de juntas, no de tribuna.',
          imagenPortada: { src: '/fotos/IMG_008.webp', alt: '' },
          descripcion: 'Auditamos, estructuramos y ejecutamos el plan que convierte tu proyecto deportivo en un activo rentable y escalable. Estrategia de sala de juntas, respaldada por datos.',
          reto: 'Las decisiones en la industria deportiva suelen basarse en la pasión y no en datos o modelos financieros robustos.',
          datoCifra: '360°', datoTexto: 'Visión y Auditoría Corporativa',
          beneficios: [{ texto: 'Modelaje financiero y proyecciones de ROI' }, { texto: 'Estudios de viabilidad para nuevos mercados' }, { texto: 'Consultoría para instituciones deportivas' }, { texto: 'Auditoría comercial y operativa' }],
          frase: 'El deporte es pasión, pero también es un negocio. Asegura la rentabilidad y escalabilidad de tu proyecto con una estrategia blindada.',
          imagen: { src: '/fotos/IMG_015.webp', alt: 'OFF COURT CONSULTING' },
          galeria1: { src: '/fotos/IMG_025.webp', alt: '' }, galeria2: { src: '/fotos/IMG_005.webp', alt: '' },
        },
        {
          id: 'experiences', visible: true, icono: 'medalla',
          titulo: 'OFF COURT EXPERIENCES', subtitulo: 'Eventos, Clínicas y Camps Premium',
          entregablesCorto: 'Rafa Nadal Academy • Clínicas Internacionales',
          resumen: 'Experiencias y campamentos de alto rendimiento con metodologías de clase mundial —como la Rafa Nadal Academy— operados de forma directa, sin intermediarios.',
          imagenPortada: { src: '/rafa-nadal.webp', alt: '' },
          descripcion: 'Diseñamos y operamos experiencias de primer nivel con metodologías de clase mundial —incluida nuestra colaboración directa con la Rafa Nadal Academy— para dar acceso a formación de élite.',
          reto: 'El mercado está saturado de eventos genéricos que no logran fidelizar ni brindar valor real a las marcas patrocinadoras o asistentes.',
          datoCifra: 'VIP', datoTexto: 'Experiencias de Formación Internacional',
          beneficios: [{ texto: 'Alianzas con la Rafa Nadal Academy' }, { texto: 'Operación de clínicas y campamentos' }, { texto: 'Activaciones VIP para corporativos' }, { texto: 'Networking de alto nivel en entornos deportivos' }],
          frase: 'Asocia tu marca o capacita a tu talento con metodologías mundiales. Creamos espacios donde el deporte y los negocios se encuentran.',
          imagen: { src: '/fotos/IMG_024.webp', alt: 'OFF COURT EXPERIENCES' },
          galeria1: { src: '/rafa_nadal_academy.png', alt: '' }, galeria2: { src: '/fotos/IMG_017.webp', alt: '' },
        },
        {
          id: 'marketing', visible: true, icono: 'megafono',
          titulo: 'OFF COURT MARKETING', subtitulo: 'Branding Deportivo, Contenido y Patrocinios',
          entregablesCorto: 'Brand Identity • Sponsorships',
          resumen: 'Construimos identidad, narrativa y alianzas que convierten a marcas y atletas en referentes. Patrocinios que se sienten, no que solo se ven.',
          imagenPortada: { src: '/fotos/IMG_O10.webp', alt: '' },
          descripcion: 'Conectamos marcas con las audiencias más apasionadas mediante patrocinios inteligentes y una identidad que se siente. Impacto real, retorno medible.',
          reto: 'Las marcas gastan millones en patrocinio pasivo y logotipos invisibles sin un retorno claro.',
          datoCifra: 'ROI', datoTexto: 'Generación de Valor y Exposición',
          beneficios: [{ texto: 'Desarrollo de manual de identidad' }, { texto: 'Activaciones y patrocinios estratégicos' }, { texto: 'Contenido digital y storytelling' }, { texto: 'Auditoría de percepción de marca' }],
          frase: 'Deja de comprar espacios publicitarios vacíos y comienza a ser parte de la cultura deportiva. Domina la conversación.',
          imagen: { src: '/fotos/IMG_003.webp', alt: 'OFF COURT MARKETING' },
          galeria1: { src: '/fotos/IMG_008.webp', alt: '' }, galeria2: { src: '/fotos/IMG_021.webp', alt: '' },
        },
        {
          id: 'athletes', visible: true, icono: 'personas',
          titulo: 'OFF COURT ATHLETES', subtitulo: 'Representación Comercial, Marca Personal y Protección Financiera',
          entregablesCorto: 'Sponsorships • Protección Financiera',
          resumen: 'Convertimos tu talento en una marca personal sólida y rentable, atractiva para patrocinadores y blindada con protección financiera para tu legado.',
          imagenPortada: { src: '/fotos/IMG_019.webp', alt: '' },
          descripcion: 'Somos el brazo corporativo del atleta: gestionamos su imagen, construimos su marca personal, atraemos patrocinios y blindamos su futuro financiero.',
          reto: 'La carrera deportiva es corta, y la mayoría de los atletas no estructuran un portafolio o marca para cuando esta termine.',
          datoCifra: '100%', datoTexto: 'Enfoque en el Legado del Atleta',
          beneficios: [{ texto: 'Representación comercial exclusiva' }, { texto: 'Estructuración de marca personal' }, { texto: 'Estrategia de patrocinios y PR' }, { texto: 'Asesoría en protección patrimonial' }],
          frase: 'Tu talento en la cancha está demostrado. Es momento de capitalizarlo fuera de ella y blindar tu futuro financiero.',
          imagen: { src: '/fotos/IMG_023.webp', alt: 'OFF COURT ATHLETES' },
          galeria1: { src: '/fotos/IMG_018.webp', alt: '' }, galeria2: { src: '/fotos/IMG_001.webp', alt: '' },
        },
        {
          id: 'creators', visible: true, icono: 'crecimiento',
          titulo: 'OFF COURT CREATORS', subtitulo: 'Creadores de Contenido Deportivo',
          entregablesCorto: 'Digital Creators • Media Strategy',
          resumen: 'Profesionalizamos, gestionamos y monetizamos a las nuevas voces del deporte, conectándolas con las marcas correctas.',
          imagenPortada: { src: '/fotos/IMG_012.webp', alt: '' },
          descripcion: 'Impulsamos a las nuevas voces del deporte: estructuramos alianzas, optimizamos su monetización y profesionalizamos su imagen para convertirlas en referentes.',
          reto: 'Muchos creadores tienen la audiencia, pero carecen de la estructura comercial para monetizar y crecer sostenidamente.',
          datoCifra: 'Top', datoTexto: 'Posicionamiento y Monetización',
          beneficios: [{ texto: 'Gestión comercial de canales' }, { texto: 'Alianzas y brand deals' }, { texto: 'Desarrollo de mercancía y productos' }, { texto: 'Asesoría en crecimiento orgánico' }],
          frase: 'Convierte tus vistas en ingresos reales. Te ayudamos a profesionalizar tu contenido y conectarlo con las marcas más grandes.',
          imagen: { src: '/fotos/IMG_016.webp', alt: 'OFF COURT CREATORS' },
          galeria1: { src: '/fotos/IMG_014.webp', alt: '' }, galeria2: { src: '/fotos/IMG_020.webp', alt: '' },
        },
        {
          id: 'media', visible: true, icono: 'video',
          titulo: 'OFF COURT MEDIA', subtitulo: 'Producción, Streaming y Medios de Comunicación',
          entregablesCorto: 'Broadcasting • Content Production',
          resumen: 'Casa productora y medio propio: streaming de eventos, contenido original y distribución para escalar tu narrativa deportiva.',
          imagenPortada: { src: '/fotos/IMG_011.webp', alt: '' },
          descripcion: 'Casa productora especializada en deporte: streaming de eventos, contenido original y un medio propio que da alcance mediático a nuestros partners.',
          reto: 'La atención digital está fragmentada; producir contenido de alta calidad en tiempo real es complejo y costoso.',
          datoCifra: 'LIVE', datoTexto: 'Producción y Alcance Global',
          beneficios: [{ texto: 'Transmisión y streaming de torneos' }, { texto: 'Producción de contenido original' }, { texto: 'Distribución en medios propios y externos' }, { texto: 'Cobertura de eventos deportivos' }],
          frase: 'Domina la pantalla. Nosotros producimos y distribuimos el contenido para que tu evento o marca sea visto en todo el mundo.',
          imagen: { src: '/fotos/IMG_007.webp', alt: 'OFF COURT MEDIA' },
          galeria1: { src: '/fotos/IMG_015.webp', alt: '' }, galeria2: { src: '/fotos/IMG_025.webp', alt: '' },
        },
        {
          id: 'ventures', visible: true, icono: 'cohete',
          titulo: 'OFF COURT VENTURES', subtitulo: 'Organización de Eventos, Nuevos Proyectos y Alianzas Estratégicas',
          entregablesCorto: 'Event Organization • Strategic Partnerships',
          resumen: 'Organizamos eventos, incubamos proyectos y estructuramos alianzas estratégicas para llevar ideas disruptivas del deporte al mercado.',
          imagenPortada: { src: '/fotos/IMG_025.webp', alt: '' },
          descripcion: 'Exploramos, incubamos y lanzamos nuevos proyectos deportivos —de franquicias internacionales a torneos disruptivos y SportsTech.',
          reto: 'Las nuevas ideas deportivas requieren capital, red de contactos y una estructuración impecable para penetrar el mercado.',
          datoCifra: 'Global', datoTexto: 'Innovación y Escalabilidad',
          beneficios: [{ texto: 'Incubación de proyectos deportivos' }, { texto: 'Búsqueda de capital y alianzas' }, { texto: 'Gestión de franquicias internacionales' }, { texto: 'Inversiones en SportsTech' }],
          frase: 'Si tienes una visión disruptiva para la industria deportiva, nosotros tenemos la estructura y las alianzas para hacerla realidad.',
          imagen: { src: '/fotos/PADEL.webp', alt: 'OFF COURT VENTURES' },
          galeria1: { src: '/fotos/IMG_004.webp', alt: '' }, galeria2: { src: '/fotos/IMG_021.webp', alt: '' },
        },
      ], { agregar: false, nombreItem: 'Vertical', campoTitulo: 'titulo', ayuda: 'Cada vertical tiene su propia página en el sitio. Puedes ocultar las que no quieras mostrar.' }),

      creadora: grupo('Creadora destacada (solo en OFF COURT Creators)', {
        visible: booleano('Mostrar este bloque', true),
        etiqueta: texto('Etiqueta pequeña', 'Creadora destacada'),
        insignia: texto('Insignia', 'Creadora de contenido deportivo'),
        nombre: texto('Nombre', 'Paola Rincón'),
        usuario: texto('Usuario de Instagram (con @)', '@paofifas23'),
        instagram: enlace('Enlace a su Instagram', { url: 'https://www.instagram.com/paofifas23', nuevaPestana: true }),
        texto: textoLargo('Texto', 'Conoce su alcance, audiencia y propuesta de valor. Descarga su media kit o visita su Instagram.'),
        foto: imagen('Fotografía', { src: '/foto-pao.jpg', alt: 'Paola Rincón' }, undefined, 1),
        mediaKit: archivo('Media kit (PDF)', { src: '/brochures/Paola_Rincon_Media_Kit_2026.pdf', nombre: 'Paola Rincón · Media Kit 2026' }),
        botonMediaKit: texto('Texto del botón del media kit', 'Ver Media Kit'),
        botonInstagram: texto('Texto del botón de Instagram', 'Ver fotos en Instagram'),
      }),
    }),

    // ---------------------------------------------------------- PRIVACIDAD
    privacidad: grupo('Política de privacidad', {
      seo: seo(META.privacidad),
      titulo: texto('Título', 'Política de Privacidad'),
      actualizacion: texto('Fecha de última actualización', 'septiembre de 2026'),
      cuerpo: html('Texto de la política', [
        '<h2>1. Introducción</h2>',
        '<p>En Offcourt Sports Group ("nosotros", "nuestro"), respetamos su privacidad y estamos comprometidos a proteger los datos personales que pueda compartir con nosotros a través de nuestro sitio web.</p>',
        '<h2>2. Información que recopilamos</h2>',
        '<p>Podemos recopilar información personal que usted nos proporcione directamente, como su nombre, dirección de correo electrónico, y número de teléfono cuando se comunica con nosotros a través de formularios de contacto.</p>',
        '<h2>3. Uso de la información</h2>',
        '<p>Utilizamos la información recopilada para:</p>',
        '<ul><li>Responder a sus consultas y proporcionar servicio al cliente.</li><li>Enviarle información sobre nuestros servicios de marketing y representación deportiva.</li><li>Mejorar nuestro sitio web y analizar el uso de nuestros servicios.</li></ul>',
        '<h2>4. Compartir información</h2>',
        '<p>No vendemos ni alquilamos su información personal a terceros. Podemos compartir su información con proveedores de servicios de confianza que nos asisten en la operación de nuestro sitio web y negocio, siempre bajo estrictos acuerdos de confidencialidad.</p>',
        '<h2>5. Seguridad</h2>',
        '<p>Implementamos medidas de seguridad razonables para proteger su información personal contra acceso no autorizado, alteración o destrucción.</p>',
        '<h2>6. Sus Derechos</h2>',
        '<p>Usted tiene derecho a acceder, corregir o solicitar la eliminación de su información personal. Para ejercer estos derechos, contáctenos en contacto@offcourtsports.com.mx.</p>',
        '<h2>7. Contacto</h2>',
        '<p>Si tiene preguntas sobre esta Política de Privacidad, puede contactarnos en:</p>',
        '<p>Email: <a href="mailto:contacto@offcourtsports.com.mx">contacto@offcourtsports.com.mx</a></p>',
      ].join('\n')),
    }),

    // ------------------------------------------------------------ TÉRMINOS
    terminos: grupo('Términos de servicio', {
      seo: seo(META.terminos),
      titulo: texto('Título', 'Términos de Servicio'),
      actualizacion: texto('Fecha de última actualización', 'septiembre de 2026'),
      cuerpo: html('Texto de los términos', [
        '<h2>1. Aceptación de los Términos</h2>',
        '<p>Al acceder y utilizar el sitio web de Offcourt Sports Group, usted acepta estar sujeto a estos Términos de Servicio y a todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder a este sitio.</p>',
        '<h2>2. Uso de Licencia</h2>',
        '<p>Se concede permiso para descargar temporalmente una copia de los materiales (información o software) en el sitio web de Offcourt Sports Group solo para visualización transitoria personal y no comercial. Esta es la concesión de una licencia, no una transferencia de título.</p>',
        '<h2>3. Servicios Proporcionados</h2>',
        '<p>Offcourt Sports Group proporciona servicios de marketing deportivo, representación de atletas, desarrollo de alianzas y relaciones públicas. Las descripciones de los servicios en el sitio web son informativas y no constituyen una oferta vinculante hasta la firma de un contrato formal.</p>',
        '<h2>4. Limitaciones</h2>',
        '<p>En ningún caso Offcourt Sports Group o sus proveedores serán responsables de ningún daño (incluyendo, sin limitación, daños por pérdida de datos o beneficios, o debido a la interrupción del negocio) que surja del uso o la incapacidad de usar los materiales en el sitio web.</p>',
        '<h2>5. Precisión de los Materiales</h2>',
        '<p>Los materiales que aparecen en el sitio web de Offcourt Sports Group podrían incluir errores técnicos, tipográficos o fotográficos. Offcourt Sports Group no garantiza que ninguno de los materiales en su sitio web sea preciso, completo o actual. Podemos realizar cambios en los materiales en cualquier momento sin previo aviso.</p>',
        '<h2>6. Modificaciones</h2>',
        '<p>Offcourt Sports Group puede revisar estos términos de servicio para su sitio web en cualquier momento sin previo aviso. Al utilizar este sitio web, usted acepta estar sujeto a la versión actual de estos términos de servicio.</p>',
        '<h2>7. Ley Aplicable</h2>',
        '<p>Estos términos y condiciones se rigen e interpretan de acuerdo con las leyes y usted se somete irrevocablemente a la jurisdicción exclusiva de los tribunales en esa ubicación.</p>',
      ].join('\n')),
    }),
  }),
});

export type Contenido = Valores<typeof definicion>;

/** Estilo propio de un elemento, elegido desde el panel. Todo opcional. */
export interface EstiloElemento {
  /** Pasos de tamaño respecto al original: -2 … +2. */
  tamano?: number;
  peso?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  fuente?: 'outfit' | 'sarabun';
  cursiva?: boolean;
  color?: string;
  fondo?: string;
  alineacion?: 'left' | 'center' | 'right';
  espacio?: 'menos' | 'normal' | 'mas';
}

export type Estilos = Record<string, EstiloElemento>;

/** Lo que se guarda en el servidor y viaja al navegador. */
export interface Documento {
  version: 1;
  datos: Contenido;
  estilos: Estilos;
}

export const CONTENIDO_BASE: Contenido = valoresPorDefecto(definicion);

export const DOCUMENTO_BASE: Documento = { version: 1, datos: CONTENIDO_BASE, estilos: {} };

/** Secciones de la portada que se pueden ordenar y ocultar, con su etiqueta. */
export const SECCIONES_INICIO = definicion.campos.paginas.campos.inicio.campos.orden.opciones!;
