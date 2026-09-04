<?php
/**
 * Biblioteca de medios.
 *
 * Dos orígenes conviven en la galería del panel:
 *
 *   «sitio»   las fotos, logotipos y PDFs que ya venían con el diseño
 *             (/fotos/*.webp, /brochures/*.pdf, hero-poster…). Se pueden usar
 *             en cualquier campo, pero no borrar ni reemplazar: los pone el
 *             despliegue y volverían en el siguiente.
 *   «subido»  lo que la persona sube desde el panel. Vive en /media/, se
 *             optimiza al entrar (WebP, máximo 2000 px, sin metadatos EXIF) y
 *             sus datos (nombre, texto alternativo…) van en data/medios.json.
 *
 * Reemplazar un archivo genera un nombre nuevo y actualiza todas las
 * referencias en el contenido (borrador y publicado). No se reutiliza el
 * nombre porque las imágenes se cachean un mes: los visitantes seguirían
 * viendo la antigua.
 */
declare(strict_types=1);

const OC_MAX_SUBIDA = 25 * 1024 * 1024;
const OC_LADO_MAX = 2000;
const OC_AVISO_PESO = 400 * 1024;

function oc_medios_ruta_meta(): string { return OC_DATOS . '/medios.json'; }

function oc_medios_meta(): array {
    $m = oc_json_leer(oc_medios_ruta_meta(), ['items' => []]);
    if (!isset($m['items']) || !is_array($m['items'])) $m['items'] = [];
    return $m;
}

function oc_medios_meta_guardar(array $m): void {
    oc_json_escribir(oc_medios_ruta_meta(), $m);
}

function oc_tipo_por_extension(string $nombre): string {
    $ext = strtolower(pathinfo($nombre, PATHINFO_EXTENSION));
    return match ($ext) {
        'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg' => 'imagen',
        'pdf' => 'documento',
        'mp4', 'webm' => 'video',
        default => 'otro',
    };
}

/** Un elemento de la galería a partir de un archivo real del disco. */
function oc_medio_desde_archivo(string $rutaDisco, string $url, string $origen, array $meta = []): array {
    $tamano = @filesize($rutaDisco) ?: 0;
    $tipo = oc_tipo_por_extension($rutaDisco);
    $ancho = $meta['ancho'] ?? null;
    $alto = $meta['alto'] ?? null;
    if ($tipo === 'imagen' && ($ancho === null || $alto === null) && !str_ends_with(strtolower($url), '.svg')) {
        $info = @getimagesize($rutaDisco);
        if ($info) { $ancho = $info[0]; $alto = $info[1]; }
    }
    return [
        'url' => $url,
        'nombre' => $meta['nombre'] ?? pathinfo($url, PATHINFO_FILENAME),
        'alt' => $meta['alt'] ?? '',
        'tipo' => $tipo,
        'origen' => $origen,
        'tamano' => $tamano,
        'ancho' => $ancho,
        'alto' => $alto,
        'fecha' => $meta['fecha'] ?? date(DATE_ATOM, @filemtime($rutaDisco) ?: time()),
        'pesado' => $tipo === 'imagen' && $tamano > OC_AVISO_PESO,
    ];
}

/** Archivos que vienen con el diseño y se ofrecen como reutilizables. */
function oc_medios_del_sitio(): array {
    $out = [];
    foreach (glob(OC_RAIZ_WEB . '/fotos/*.{webp,jpg,jpeg,png}', GLOB_BRACE) ?: [] as $r) {
        $out[] = oc_medio_desde_archivo($r, '/fotos/' . basename($r), 'sitio');
    }
    foreach (['hero-poster.webp', 'rafa-nadal.webp', 'rafa-nadal-logo.png', 'rafa_nadal_academy.png', 'foto-pao.jpg', 'og-image.png', 'oc-icon.png', 'logo_blanco.svg', 'logo_negro.svg', 'logo_blanco_amarillo.svg', 'logo_negro_amarillo.svg'] as $n) {
        $r = OC_RAIZ_WEB . '/' . $n;
        if (is_file($r)) $out[] = oc_medio_desde_archivo($r, '/' . $n, 'sitio');
    }
    foreach (glob(OC_RAIZ_WEB . '/brochures/*.pdf') ?: [] as $r) {
        $out[] = oc_medio_desde_archivo($r, '/brochures/' . basename($r), 'sitio');
    }
    foreach (glob(OC_RAIZ_WEB . '/*.mp4') ?: [] as $r) {
        $out[] = oc_medio_desde_archivo($r, '/' . basename($r), 'sitio');
    }
    return $out;
}

function oc_medios_subidos(): array {
    $meta = oc_medios_meta()['items'];
    $out = [];
    if (!is_dir(OC_MEDIA)) return $out;
    foreach (scandir(OC_MEDIA) ?: [] as $n) {
        if ($n === '.' || $n === '..' || $n[0] === '.' || $n === 'index.html') continue;
        $r = OC_MEDIA . '/' . $n;
        if (!is_file($r)) continue;
        $url = '/media/' . $n;
        $out[] = oc_medio_desde_archivo($r, $url, 'subido', $meta[$url] ?? []);
    }
    usort($out, fn($a, $b) => strcmp($b['fecha'], $a['fecha']));
    return $out;
}

function oc_medios_listar(): void {
    oc_responder([
        'ok' => true,
        'subidos' => oc_medios_subidos(),
        'sitio' => oc_medios_del_sitio(),
        'gd' => function_exists('imagecreatetruecolor'),
        'webp' => function_exists('imagewebp'),
        'maximo' => oc_maximo_subida(),
    ]);
}

/** El menor de: nuestro tope y lo que permita el PHP del hosting. */
function oc_maximo_subida(): int {
    $aBytes = function (string $v): int {
        $v = trim($v);
        if ($v === '' || $v === '-1' || $v === '0') return PHP_INT_MAX;
        $u = strtolower(substr($v, -1));
        $n = (int) $v;
        return match ($u) { 'g' => $n << 30, 'm' => $n << 20, 'k' => $n << 10, default => $n };
    };
    return (int) min(OC_MAX_SUBIDA, $aBytes((string) ini_get('upload_max_filesize')), $aBytes((string) ini_get('post_max_size')));
}

// ------------------------------------------------------------------- subida

function oc_medios_subir(): void {
    $item = oc_procesar_subida();
    oc_responder(['ok' => true, 'item' => $item]);
}

/** Valida y guarda el archivo recibido; devuelve su ficha. */
function oc_procesar_subida(): array {
    if (empty($_FILES['archivo']) || !is_array($_FILES['archivo'])) oc_error('No llegó ningún archivo.');
    $f = $_FILES['archivo'];
    if (($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        $msg = match ((int) $f['error']) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'El archivo pesa más de lo que permite el servidor (' . round(oc_maximo_subida() / 1048576) . ' MB).',
            UPLOAD_ERR_PARTIAL => 'El archivo llegó incompleto. Inténtalo de nuevo.',
            UPLOAD_ERR_NO_FILE => 'No llegó ningún archivo.',
            default => 'No se pudo recibir el archivo.',
        };
        oc_error($msg);
    }
    if ((int) $f['size'] > oc_maximo_subida()) oc_error('El archivo pesa más de lo permitido (' . round(oc_maximo_subida() / 1048576) . ' MB).');
    if (!is_uploaded_file($f['tmp_name'])) oc_error('Archivo no válido.');

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string) $finfo->file($f['tmp_name']);
    $permitidos = [
        'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif',
        'image/svg+xml' => 'svg', 'application/pdf' => 'pdf', 'video/mp4' => 'mp4', 'video/webm' => 'webm',
    ];
    if (!isset($permitidos[$mime])) {
        oc_error('Ese tipo de archivo no se puede usar en el sitio. Vale: JPG, PNG, WebP, GIF, PDF y vídeo MP4.');
    }
    $ext = $permitidos[$mime];

    if (!is_dir(OC_MEDIA) && !@mkdir(OC_MEDIA, 0755, true)) oc_error('No se pudo crear la carpeta de medios.', 500);

    $nombreOriginal = (string) ($f['name'] ?? 'archivo');
    $base = oc_slug(pathinfo($nombreOriginal, PATHINFO_FILENAME));
    $sufijo = substr(bin2hex(random_bytes(4)), 0, 6);

    $ancho = null; $alto = null;
    $esImagenRaster = in_array($ext, ['jpg', 'png', 'webp', 'gif'], true);

    if ($esImagenRaster && function_exists('imagecreatetruecolor')) {
        [$destino, $ancho, $alto] = oc_optimizar_imagen($f['tmp_name'], $ext, $base, $sufijo);
    } else {
        if ($ext === 'svg') oc_sanear_svg($f['tmp_name']);
        $destino = OC_MEDIA . '/' . $base . '-' . $sufijo . '.' . $ext;
        if (!@move_uploaded_file($f['tmp_name'], $destino)) oc_error('No se pudo guardar el archivo en el servidor.', 500);
    }
    @chmod($destino, 0644);

    $url = '/media/' . basename($destino);
    $meta = oc_medios_meta();
    $meta['items'][$url] = [
        'nombre' => trim((string) ($_POST['nombre'] ?? '')) ?: pathinfo($nombreOriginal, PATHINFO_FILENAME),
        'alt' => trim((string) ($_POST['alt'] ?? '')),
        'fecha' => oc_ahora(),
        'ancho' => $ancho,
        'alto' => $alto,
        'original' => $nombreOriginal,
    ];
    oc_medios_meta_guardar($meta);

    return oc_medio_desde_archivo($destino, $url, 'subido', $meta['items'][$url]);
}

/**
 * Reencoda la imagen con GD: corrige la orientación EXIF, limita el lado
 * mayor, descarta los metadatos y guarda en WebP (o JPEG si el PHP del hosting
 * no trae WebP). Devuelve [ruta, ancho, alto].
 */
function oc_optimizar_imagen(string $tmp, string $ext, string $base, string $sufijo): array {
    $img = match ($ext) {
        'jpg' => @imagecreatefromjpeg($tmp),
        'png' => @imagecreatefrompng($tmp),
        'webp' => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($tmp) : false,
        'gif' => @imagecreatefromgif($tmp),
        default => false,
    };
    if ($img === false) {
        // GD no pudo con ella (WebP animado, PNG raro…): se guarda tal cual.
        $destino = OC_MEDIA . '/' . $base . '-' . $sufijo . '.' . $ext;
        if (!@move_uploaded_file($tmp, $destino)) oc_error('No se pudo guardar la imagen.', 500);
        $info = @getimagesize($destino);
        return [$destino, $info[0] ?? null, $info[1] ?? null];
    }

    // Orientación de cámara (fotos de celular giradas).
    if ($ext === 'jpg' && function_exists('exif_read_data')) {
        $exif = @exif_read_data($tmp);
        $o = (int) ($exif['Orientation'] ?? 1);
        if ($o === 3) $img = imagerotate($img, 180, 0);
        elseif ($o === 6) $img = imagerotate($img, -90, 0);
        elseif ($o === 8) $img = imagerotate($img, 90, 0);
    }

    $w = imagesx($img); $h = imagesy($img);
    $lado = max($w, $h);
    if ($lado > OC_LADO_MAX) {
        $factor = OC_LADO_MAX / $lado;
        $nw = (int) round($w * $factor); $nh = (int) round($h * $factor);
        $dst = imagecreatetruecolor($nw, $nh);
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        imagecopyresampled($dst, $img, 0, 0, 0, 0, $nw, $nh, $w, $h);
        imagedestroy($img);
        $img = $dst; $w = $nw; $h = $nh;
    }

    $conAlfa = in_array($ext, ['png', 'gif', 'webp'], true);
    if (function_exists('imagewebp')) {
        $destino = OC_MEDIA . '/' . $base . '-' . $sufijo . '.webp';
        imagealphablending($img, false);
        imagesavealpha($img, true);
        $ok = @imagewebp($img, $destino, 82);
    } elseif ($conAlfa) {
        $destino = OC_MEDIA . '/' . $base . '-' . $sufijo . '.png';
        imagesavealpha($img, true);
        $ok = @imagepng($img, $destino, 8);
    } else {
        $destino = OC_MEDIA . '/' . $base . '-' . $sufijo . '.jpg';
        $ok = @imagejpeg($img, $destino, 85);
    }
    imagedestroy($img);
    if (!$ok) oc_error('No se pudo guardar la imagen optimizada.', 500);
    return [$destino, $w, $h];
}

/** Un SVG puede llevar scripts: se rechaza si los trae. */
function oc_sanear_svg(string $ruta): void {
    $svg = (string) @file_get_contents($ruta);
    if (preg_match('/<\s*script|on[a-z]+\s*=|javascript:|<\s*foreignObject/i', $svg)) {
        oc_error('Ese SVG contiene código y no se puede usar en el sitio.');
    }
}

// --------------------------------------------------------------- referencias

/** Rutas del contenido (borrador y publicado) donde aparece una URL. */
function oc_medios_usos(string $url): array {
    $usos = [];
    foreach (['publicado' => oc_ruta_publicado(), 'borrador' => oc_ruta_borrador()] as $donde => $ruta) {
        $doc = oc_json_leer($ruta);
        if (!isset($doc['documento']['datos'])) continue;
        oc_buscar_url($doc['documento']['datos'], $url, '', $usos, $donde);
    }
    return $usos;
}

function oc_buscar_url(mixed $nodo, string $url, string $ruta, array &$usos, string $donde): void {
    if (is_string($nodo)) {
        if ($nodo === $url || str_contains($nodo, $url . '"') || str_contains($nodo, $url . ')')) {
            $usos[] = ['donde' => $donde, 'ruta' => $ruta];
        }
        return;
    }
    if (is_array($nodo)) {
        foreach ($nodo as $k => $v) oc_buscar_url($v, $url, $ruta === '' ? (string) $k : $ruta . '.' . $k, $usos, $donde);
    }
}

function oc_reemplazar_url(mixed $nodo, string $vieja, string $nueva): mixed {
    if (is_string($nodo)) return $nodo === $vieja ? $nueva : str_replace($vieja, $nueva, $nodo);
    if (is_array($nodo)) { foreach ($nodo as $k => $v) $nodo[$k] = oc_reemplazar_url($v, $vieja, $nueva); }
    return $nodo;
}

function oc_medios_reemplazar(): void {
    $vieja = (string) ($_POST['url'] ?? '');
    $rutaVieja = oc_ruta_media($vieja);
    if ($rutaVieja === null || !is_file($rutaVieja)) oc_error('Solo se pueden reemplazar los archivos subidos desde el panel.');

    $item = oc_procesar_subida();
    $nueva = $item['url'];

    $meta = oc_medios_meta();
    // El nombre y el texto alternativo se heredan si no se mandaron otros.
    $anterior = $meta['items'][$vieja] ?? [];
    if (empty($_POST['nombre']) && !empty($anterior['nombre'])) $meta['items'][$nueva]['nombre'] = $anterior['nombre'];
    if (empty($_POST['alt']) && !empty($anterior['alt'])) $meta['items'][$nueva]['alt'] = $anterior['alt'];
    unset($meta['items'][$vieja]);
    oc_medios_meta_guardar($meta);

    foreach ([oc_ruta_publicado(), oc_ruta_borrador()] as $ruta) {
        $doc = oc_json_leer($ruta);
        if ($doc === null) continue;
        $doc = oc_reemplazar_url($doc, $vieja, $nueva);
        oc_json_escribir($ruta, $doc);
    }
    @unlink($rutaVieja);

    $item = oc_medio_desde_archivo(OC_MEDIA . '/' . basename($nueva), $nueva, 'subido', $meta['items'][$nueva]);
    oc_responder(['ok' => true, 'item' => $item, 'anterior' => $vieja]);
}

function oc_medios_eliminar(): void {
    $e = oc_entrada();
    $url = (string) ($e['url'] ?? '');
    $ruta = oc_ruta_media($url);
    if ($ruta === null || !is_file($ruta)) oc_error('Solo se pueden eliminar los archivos subidos desde el panel.');
    $usos = oc_medios_usos($url);
    if ($usos && empty($e['forzar'])) {
        oc_error('Este archivo se está usando en el sitio. Cámbialo primero donde aparece, o confirma que quieres quitarlo de todos modos.', 409, ['usos' => $usos]);
    }
    @unlink($ruta);
    $meta = oc_medios_meta();
    unset($meta['items'][$url]);
    oc_medios_meta_guardar($meta);
    oc_responder(['ok' => true]);
}

function oc_medios_editar(): void {
    $e = oc_entrada();
    $url = (string) ($e['url'] ?? '');
    if (oc_ruta_media($url) === null) oc_error('Solo se pueden editar los datos de los archivos subidos desde el panel.');
    $meta = oc_medios_meta();
    $item = $meta['items'][$url] ?? ['fecha' => oc_ahora()];
    if (isset($e['nombre'])) $item['nombre'] = mb_substr(trim((string) $e['nombre']), 0, 120);
    if (isset($e['alt'])) $item['alt'] = mb_substr(trim((string) $e['alt']), 0, 250);
    $meta['items'][$url] = $item;
    oc_medios_meta_guardar($meta);
    oc_responder(['ok' => true, 'item' => oc_medio_desde_archivo(OC_MEDIA . '/' . basename($url), $url, 'subido', $item)]);
}

function oc_medios_usos_accion(): void {
    $url = (string) ($_GET['url'] ?? '');
    oc_responder(['ok' => true, 'usos' => oc_medios_usos($url)]);
}
