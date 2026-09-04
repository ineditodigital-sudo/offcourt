<?php
/**
 * Sirve el HTML de cada página con el contenido publicado desde el panel.
 *
 * El .htaccess manda aquí todas las rutas del sitio (/, /nosotros,
 * /servicios/athletes…) con el nombre del archivo HTML que les corresponde.
 * Sobre ese HTML —el que generó el build— se hacen, en este orden:
 *
 *   1. Sustituir el bloque SEO (<title>, descripción, Open Graph, canónica)
 *      por lo que la persona escribió en el panel para esa página.
 *   2. Sustituir los textos del hero pre-renderizado (marcados con data-oc-t)
 *      por los publicados, para que lo primero que se pinta ya sea lo bueno.
 *   3. Inyectar el JSON publicado en <script id="oc-contenido"> para que React
 *      arranque con él, sin petición extra ni parpadeo.
 *   4. Escribir las variables de color y tipografía elegidas en el panel.
 *   5. Añadir Google Analytics y Meta Pixel si se pegó su identificador.
 *
 * Si no hay nada publicado aún, o cualquier paso falla, se sirve el HTML tal
 * cual: el sitio nunca se queda en blanco por culpa del CMS.
 */
declare(strict_types=1);

header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache, must-revalidate');

$archivo = (string) ($_GET['archivo'] ?? 'index.html');
if (!preg_match('~^[a-z0-9-]+(?:/[a-z0-9-]+)?\.html$~', $archivo) || str_starts_with($archivo, 'admin')) {
    $archivo = 'index.html';
}
$ruta = __DIR__ . '/' . $archivo;
if (!is_file($ruta)) { $archivo = 'index.html'; $ruta = __DIR__ . '/index.html'; }

$html = (string) file_get_contents($ruta);

try {
    $publicado = oc_leer_publicado(__DIR__ . '/cms/data/publicado.json');
    if ($publicado !== null) $html = oc_inyectar($html, $publicado, $archivo);
} catch (Throwable $e) {
    error_log('[index.php] ' . $e->getMessage());
}

echo $html;
exit;

// ---------------------------------------------------------------------------

function oc_leer_publicado(string $ruta): ?array {
    if (!is_file($ruta)) return null;
    $json = json_decode((string) file_get_contents($ruta), true);
    $doc = $json['documento'] ?? null;
    return is_array($doc) && isset($doc['datos']['global'], $doc['datos']['paginas']) ? $doc : null;
}

function oc_inyectar(string $html, array $doc, string $archivo): string {
    $datos = $doc['datos'];
    $sitio = 'https://offcourtsports.com.mx';

    // 1. SEO de la página ----------------------------------------------------
    $seo = oc_seo_de($datos, $archivo);
    if ($seo !== null) {
        $ini = strpos($html, '<!-- SEO:INICIO');
        $fin = strpos($html, '<!-- SEO:FIN -->');
        if ($ini !== false && $fin !== false && $fin > $ini) {
            $html = substr($html, 0, $ini) . oc_bloque_seo($seo, $sitio) . substr($html, $fin + strlen('<!-- SEO:FIN -->'));
        }
    }

    // 2. Textos del hero pre-renderizado -------------------------------------
    if ($archivo === 'index.html') {
        $html = preg_replace_callback(
            '~<(\w+)([^>]*\sdata-oc-t="([^"]+)"[^>]*)>(.*?)</\1>~s',
            function (array $m) use ($datos): string {
                $valor = oc_valor($datos, $m[3]);
                if (!is_string($valor)) return $m[0];
                return '<' . $m[1] . $m[2] . '>' . htmlspecialchars($valor, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</' . $m[1] . '>';
            },
            $html
        ) ?? $html;

        // La imagen de fondo del hero también va pre-renderizada.
        $fondo = oc_valor($datos, 'paginas.inicio.hero.imagenFondo.src');
        if (is_string($fondo) && $fondo !== '' && preg_match('~^/[A-Za-z0-9/._-]+$~', $fondo)) {
            $html = preg_replace(
                '~(<img\b[^>]*\bdata-oc="paginas\.inicio\.hero\.imagenFondo"[^>]*\bsrc=")[^"]*(")~',
                '$1' . htmlspecialchars($fondo, ENT_QUOTES, 'UTF-8') . '$2',
                $html, 1
            ) ?? $html;
            $html = preg_replace(
                '~(<link\b[^>]*\brel="preload"[^>]*\bas="image"[^>]*\bhref=")[^"]*(")~',
                '$1' . htmlspecialchars($fondo, ENT_QUOTES, 'UTF-8') . '$2',
                $html, 1
            ) ?? $html;
        }
    }

    // 3. + 4. + 5. Cabecera: contenido, tema, mediciones ---------------------
    $cabecera = '';

    $json = json_encode($doc, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json !== false) {
        // «</» dentro del JSON cerraría el <script>; se escapa a «<\/».
        $json = str_replace(['</', '<!--'], ['<\/', '<\!--'], $json);
        $cabecera .= "\n    <script id=\"oc-contenido\" type=\"application/json\">" . $json . "</script>";
    }

    $cabecera .= "\n    " . oc_estilo_tema($datos['global']['tema'] ?? []);
    $cabecera .= oc_mediciones($datos['global']['integraciones'] ?? []);

    $pos = strpos($html, '</head>');
    if ($pos !== false) $html = substr($html, 0, $pos) . $cabecera . "\n  " . substr($html, $pos);

    $pixel = (string) ($datos['global']['integraciones']['metaPixel'] ?? '');
    if (preg_match('/^\d{5,20}$/', $pixel)) {
        $noscript = '<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=' . $pixel . '&ev=PageView&noscript=1" /></noscript>';
        $pos = strpos($html, '<body>');
        if ($pos !== false) $html = substr($html, 0, $pos + 6) . "\n    " . $noscript . substr($html, $pos + 6);
    }

    return $html;
}

/**
 * Título, descripción, imagen y ruta de la página que se sirve.
 *
 * Devuelve null cuando el contenido publicado no tiene datos para esta página
 * —porque es más antiguo que la página, o llegó incompleto—. Quien llama
 * entonces deja el <head> que generó el build, que siempre es válido. Antes se
 * escribía un <title> vacío, que es peor que no tocar nada.
 */
function oc_seo_de(array $datos, string $archivo): ?array {
    $p = $datos['paginas'] ?? [];
    $marca = 'Offcourt Sports Group';
    $de = function (array $seo, string $ruta): ?array {
        $titulo = trim((string) ($seo['titulo'] ?? ''));
        if ($titulo === '') return null;
        return [
            'titulo' => $titulo,
            'descripcion' => (string) ($seo['descripcion'] ?? ''),
            'imagen' => (string) ($seo['imagen']['src'] ?? '/og-image.png'),
            'ruta' => $ruta,
        ];
    };
    if ($archivo === 'index.html') return $de($p['inicio']['seo'] ?? [], '/');
    if ($archivo === 'nosotros.html') return $de($p['nosotros']['seo'] ?? [], '/nosotros');
    if ($archivo === 'privacidad.html') return $de($p['privacidad']['seo'] ?? [], '/privacidad');
    if ($archivo === 'terminos.html') return $de($p['terminos']['seo'] ?? [], '/terminos');
    if (preg_match('~^servicios/([a-z0-9-]+)\.html$~', $archivo, $m)) {
        foreach ($p['servicios']['items'] ?? [] as $item) {
            if (($item['id'] ?? '') === $m[1] && !empty($item['visible'])) {
                $nombre = trim((string) ($item['titulo'] ?? ''));
                if ($nombre === '') break;
                return [
                    'titulo' => $nombre . ' | ' . $marca,
                    'descripcion' => (string) ($item['descripcion'] ?? ''),
                    'imagen' => (string) ($p['servicios']['seo']['imagen']['src'] ?? '/og-image.png'),
                    'ruta' => '/servicios/' . $m[1],
                ];
            }
        }
        return $de($p['servicios']['seo'] ?? [], '/servicios/' . $m[1]);
    }
    return null; // v1 / v2: se quedan como salieron del build (noindex)
}

function oc_bloque_seo(array $seo, string $sitio): string {
    $a = fn(string $s) => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $url = $sitio . ($seo['ruta'] === '/' ? '' : $seo['ruta']);
    $img = $seo['imagen'];
    if (!preg_match('~^https?://~i', $img)) $img = $sitio . (str_starts_with($img, '/') ? $img : '/' . $img);
    $t = $a($seo['titulo']); $d = $a($seo['descripcion']); $i = $a($img); $u = $a($url);
    return implode("\n    ", [
        '<!-- SEO:INICIO (publicado desde el panel) -->',
        "<title>{$t}</title>",
        "<meta name=\"description\" content=\"{$d}\" />",
        "<meta property=\"og:title\" content=\"{$t}\" />",
        "<meta property=\"og:description\" content=\"{$d}\" />",
        '<meta property="og:type" content="website" />',
        '<meta property="og:site_name" content="Offcourt Sports Group" />',
        '<meta property="og:locale" content="es_MX" />',
        "<meta property=\"og:image\" content=\"{$i}\" />",
        "<meta property=\"og:url\" content=\"{$u}\" />",
        '<meta name="twitter:card" content="summary_large_image" />',
        "<meta name=\"twitter:title\" content=\"{$t}\" />",
        "<meta name=\"twitter:description\" content=\"{$d}\" />",
        "<meta name=\"twitter:image\" content=\"{$i}\" />",
        "<link rel=\"canonical\" href=\"{$u}\" />",
        '<!-- SEO:FIN -->',
    ]);
}

/** Variables CSS del tema. Solo pasan colores hex válidos y fuentes conocidas. */
function oc_estilo_tema(array $tema): string {
    $color = fn(string $k, string $def) => preg_match('/^#[0-9a-fA-F]{6}$/', (string) ($tema[$k] ?? '')) ? $tema[$k] : $def;
    $fuentes = [
        'outfit' => "'Outfit', sans-serif",
        'sarabun' => "'Sarabun', sans-serif",
        'georgia' => "Georgia, 'Times New Roman', serif",
        'arial' => 'Arial, Helvetica, sans-serif',
    ];
    $ft = $fuentes[$tema['fuenteTitulos'] ?? ''] ?? $fuentes['outfit'];
    $fx = $fuentes[$tema['fuenteTexto'] ?? ''] ?? $fuentes['sarabun'];
    return '<style id="oc-tema">:root{'
        . '--color-marca:' . $color('naranja', '#fda211') . ';'
        . '--color-marca-oscuro:' . $color('naranjaOscuro', '#e5920f') . ';'
        . '--color-negro:' . $color('negro', '#1b1b1b') . ';'
        . '--color-gris-oscuro:' . $color('grisOscuro', '#2e2f30') . ';'
        . '--color-gris-claro:' . $color('grisClaro', '#e4e4e4') . ';'
        . '--fuente-titulos:' . $ft . ';'
        . '--fuente-texto:' . $fx . ';'
        . '}</style>';
}

/** Google Analytics 4 y Meta Pixel, solo si el identificador tiene la forma correcta. */
function oc_mediciones(array $integ): string {
    $out = '';
    $ga = (string) ($integ['ga4'] ?? '');
    if (preg_match('/^G-[A-Z0-9]{4,20}$/', $ga)) {
        $out .= "\n    <script async src=\"https://www.googletagmanager.com/gtag/js?id={$ga}\"></script>"
              . "\n    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','{$ga}');</script>";
    }
    $px = (string) ($integ['metaPixel'] ?? '');
    if (preg_match('/^\d{5,20}$/', $px)) {
        $out .= "\n    <script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','{$px}');fbq('track','PageView');</script>";
    }
    return $out;
}

/** Lee un valor por ruta con puntos («paginas.inicio.hero.titulo»). */
function oc_valor(array $datos, string $ruta): mixed {
    $actual = $datos;
    foreach (explode('.', $ruta) as $parte) {
        if (!is_array($actual) || !array_key_exists($parte, $actual)) return null;
        $actual = $actual[$parte];
    }
    return $actual;
}
