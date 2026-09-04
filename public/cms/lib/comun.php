<?php
/**
 * Utilidades compartidas por el panel de administración.
 *
 * Rutas: este archivo vive en public/cms/lib/. Los datos del CMS van en
 * public/cms/data/ (protegido por su propio .htaccess: nada de ahí se sirve
 * por HTTP) y los archivos subidos en public/media/ (públicos, sin PHP).
 */
declare(strict_types=1);

define('OC_CMS', dirname(__DIR__));                 // public/cms
define('OC_DATOS', OC_CMS . '/data');              // public/cms/data
define('OC_RAIZ_WEB', dirname(OC_CMS));            // public (raíz del sitio)
define('OC_MEDIA', OC_RAIZ_WEB . '/media');        // public/media
define('OC_SITIO', 'https://offcourtsports.com.mx');

// ------------------------------------------------------------------ respuestas

function oc_responder(array $datos, int $codigo = 200): never {
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Error en lenguaje de persona: el panel lo muestra tal cual. */
function oc_error(string $mensaje, int $codigo = 400, array $extra = []): never {
    oc_responder(['ok' => false, 'mensaje' => $mensaje] + $extra, $codigo);
}

// ------------------------------------------------------------------- archivos

function oc_json_leer(string $ruta, mixed $porDefecto = null): mixed {
    if (!is_file($ruta)) return $porDefecto;
    $f = @fopen($ruta, 'r');
    if ($f === false) return $porDefecto;
    flock($f, LOCK_SH);
    $texto = stream_get_contents($f);
    flock($f, LOCK_UN);
    fclose($f);
    $datos = json_decode((string) $texto, true);
    return $datos === null ? $porDefecto : $datos;
}

/**
 * Escritura atómica: primero a un archivo temporal, luego se renombra. Así una
 * caída a medio guardar nunca deja un JSON truncado, que rompería el sitio.
 */
function oc_json_escribir(string $ruta, mixed $datos): void {
    $dir = dirname($ruta);
    if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('No se pudo crear la carpeta de datos.');
    }
    $json = json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false) throw new RuntimeException('No se pudo preparar el contenido para guardarlo.');
    $tmp = $ruta . '.tmp.' . bin2hex(random_bytes(4));
    if (@file_put_contents($tmp, $json, LOCK_EX) === false) {
        throw new RuntimeException('No se pudo escribir en la carpeta de datos. Revisa los permisos de cms/data.');
    }
    if (!@rename($tmp, $ruta)) {
        @unlink($tmp);
        throw new RuntimeException('No se pudo guardar el archivo.');
    }
}

function oc_ahora(): string {
    return (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DATE_ATOM);
}

/** Cuerpo JSON de una petición POST, como array. */
function oc_entrada(): array {
    static $cache = null;
    if ($cache !== null) return $cache;
    $crudo = file_get_contents('php://input');
    if ($crudo === false || $crudo === '') return $cache = [];
    if (strlen($crudo) > 4 * 1024 * 1024) oc_error('El contenido es demasiado grande.', 413);
    $datos = json_decode($crudo, true);
    return $cache = (is_array($datos) ? $datos : []);
}

// ------------------------------------------------------------ configuración

/** Devuelve la configuración (hash de contraseña…) o null si aún no se instaló. */
function oc_config(): ?array {
    $ruta = OC_DATOS . '/config.php';
    if (!is_file($ruta)) return null;
    $cfg = include $ruta;
    return is_array($cfg) ? $cfg : null;
}

function oc_config_guardar(array $cfg): void {
    $php = "<?php\n// Generado por el panel. No editar a mano.\nreturn " . var_export($cfg, true) . ";\n";
    $ruta = OC_DATOS . '/config.php';
    if (!is_dir(OC_DATOS)) @mkdir(OC_DATOS, 0755, true);
    $tmp = $ruta . '.tmp';
    if (@file_put_contents($tmp, $php, LOCK_EX) === false || !@rename($tmp, $ruta)) {
        @unlink($tmp);
        throw new RuntimeException('No se pudo guardar la configuración. Revisa los permisos de cms/data.');
    }
}

// ---------------------------------------------------------------------- sesión

function oc_sesion_iniciar(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
          || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_name('oc_sesion');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();

    // Caducidad por inactividad: 12 horas.
    if (isset($_SESSION['ultimo']) && time() - (int) $_SESSION['ultimo'] > 43200) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    $_SESSION['ultimo'] = time();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
}

function oc_autenticado(): bool {
    return !empty($_SESSION['auth']) && $_SESSION['auth'] === true;
}

function oc_exigir_auth(): void {
    if (!oc_autenticado()) oc_error('Tu sesión ha caducado. Vuelve a entrar.', 401, ['sesion' => false]);
}

/**
 * Protección contra peticiones falsificadas desde otros sitios. El panel es
 * del mismo origen que la API, así que exige el token de sesión en cada POST
 * y rechaza cualquier petición que el navegador marque como de otro origen.
 */
function oc_exigir_csrf(): void {
    $sitio = $_SERVER['HTTP_SEC_FETCH_SITE'] ?? '';
    if ($sitio !== '' && $sitio !== 'same-origin' && $sitio !== 'none') {
        oc_error('Petición no permitida.', 403);
    }
    $token = $_SERVER['HTTP_X_OC_CSRF'] ?? '';
    if ($token === '' || !hash_equals((string) ($_SESSION['csrf'] ?? ''), $token)) {
        oc_error('La sesión ha cambiado. Recarga la página e inténtalo de nuevo.', 403, ['csrf' => true]);
    }
}

// ------------------------------------------------------------------ visitante

/** IP real del visitante detrás de Cloudflare (REMOTE_ADDR es la del proxy). */
function oc_ip(): string {
    $cf = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '';
    if ($cf !== '' && filter_var($cf, FILTER_VALIDATE_IP)) return $cf;
    $remota = $_SERVER['REMOTE_ADDR'] ?? '';
    return filter_var($remota, FILTER_VALIDATE_IP) ? $remota : 'desconocida';
}

/**
 * Límite de intentos por clave (p. ej. «entrar:IP»). Devuelve true si se ha
 * pasado del máximo dentro de la ventana, y anota el intento si no.
 */
function oc_excede_limite(string $clave, int $maximo, int $ventana): bool {
    $dir = OC_DATOS . '/limites';
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    if (!is_dir($dir)) return false;
    $archivo = $dir . '/' . sha1($clave) . '.txt';
    $f = @fopen($archivo, 'c+');
    if ($f === false) return false;
    if (!flock($f, LOCK_EX)) { fclose($f); return false; }
    $ahora = time();
    $sellos = array_values(array_filter(
        array_map('intval', explode(',', (string) stream_get_contents($f))),
        fn($t) => $t > $ahora - $ventana
    ));
    $pasado = count($sellos) >= $maximo;
    if (!$pasado) $sellos[] = $ahora;
    ftruncate($f, 0);
    rewind($f);
    fwrite($f, implode(',', $sellos));
    fflush($f);
    flock($f, LOCK_UN);
    fclose($f);
    return $pasado;
}

// ----------------------------------------------------------------- utilidades

/** Nombre de archivo seguro a partir de un texto («Foto Pádel.JPG» → «foto-padel»). */
function oc_slug(string $texto): string {
    $t = $texto;
    if (function_exists('iconv')) {
        $c = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $t);
        if ($c !== false) $t = $c;
    }
    $t = strtolower($t);
    $t = preg_replace('/[^a-z0-9]+/', '-', $t) ?? '';
    $t = trim($t, '-');
    return $t === '' ? 'archivo' : substr($t, 0, 60);
}

/** Comprueba que una ruta pública apunta dentro de /media/ (sin escapes). */
function oc_ruta_media(string $url): ?string {
    if (!preg_match('~^/media/([A-Za-z0-9._-]+)$~', $url, $m)) return null;
    if (str_contains($m[1], '..')) return null;
    return OC_MEDIA . '/' . $m[1];
}
