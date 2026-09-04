<?php
/**
 * Router para probar el sitio y el panel en local, con PHP de verdad.
 *
 *   npm run build
 *   php -S localhost:8080 -t dist scripts/servidor-local.php
 *
 * Reproduce las reglas del .htaccess de producción: el panel en /admin, las
 * rutas del sitio pasando por index.php y los archivos reales servidos tal
 * cual. Sin esto, `vite preview` no ejecuta PHP y no se puede comprobar ni el
 * CMS ni la inyección del contenido publicado.
 *
 * Este archivo NO se despliega: vive en scripts/, fuera de dist/.
 */
declare(strict_types=1);

$raiz = realpath(__DIR__ . '/../dist');
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$uri = rawurldecode($uri);

// El panel: /admin y todo lo que cuelga de él se sirve sin pasar por index.php.
if ($uri === '/admin' || $uri === '/admin/') {
    readfile($raiz . '/admin/index.html');
    return true;
}

$archivoReal = $raiz . $uri;

// La API del CMS y demás PHP se ejecutan.
if (is_file($archivoReal) && str_ends_with($uri, '.php')) {
    $_SERVER['SCRIPT_FILENAME'] = $archivoReal;
    chdir(dirname($archivoReal));
    require $archivoReal;
    return true;
}

// Bloqueo de cms/data, igual que hace su .htaccess en producción.
if (str_starts_with(ltrim($uri, '/'), 'cms/data/')) {
    http_response_code(403);
    echo 'Prohibido';
    return true;
}

// Archivos reales (bundles, fotos, PDFs): que los sirva el servidor embebido.
if (is_file($archivoReal) && !str_ends_with($uri, '.html')) {
    return false;
}

// Todo el HTML del sitio pasa por index.php, que inyecta el contenido publicado.
$ruta = ltrim($uri, '/');
if ($ruta === '' || $ruta === 'index.html') {
    $archivo = 'index.html';
} elseif (str_ends_with($ruta, '.html')) {
    $archivo = $ruta;
} elseif (is_file($raiz . '/' . rtrim($ruta, '/') . '.html')) {
    $archivo = rtrim($ruta, '/') . '.html';
} else {
    $archivo = 'index.html';
}

$_GET['archivo'] = $archivo;
$_SERVER['SCRIPT_FILENAME'] = $raiz . '/index.php';
chdir($raiz);
require $raiz . '/index.php';
return true;
