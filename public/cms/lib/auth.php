<?php
/**
 * Acceso al panel: una sola persona administradora.
 *
 * Primera vez: no existe cms/data/config.php. El despliegue deja en
 * cms/data/codigo.txt un código de instalación que se entrega en mano; con él,
 * la persona crea su contraseña desde el propio panel y el código se destruye.
 * Si algún día olvida la contraseña, basta con borrar config.php por FTP y
 * volver a desplegar: aparece otra vez la pantalla de instalación.
 */
declare(strict_types=1);

function oc_auth_estado(): array {
    return [
        'ok' => true,
        'instalado' => oc_config() !== null,
        'autenticado' => oc_autenticado(),
        'csrf' => $_SESSION['csrf'] ?? '',
    ];
}

function oc_auth_instalar(): void {
    if (oc_config() !== null) oc_error('El panel ya está configurado.', 409);
    if (oc_excede_limite('instalar:' . oc_ip(), 8, 900)) {
        oc_error('Demasiados intentos. Espera unos minutos.', 429);
    }
    $e = oc_entrada();
    $codigo = trim((string) ($e['codigo'] ?? ''));
    $password = (string) ($e['password'] ?? '');

    $rutaCodigo = OC_DATOS . '/codigo.txt';
    $esperado = is_file($rutaCodigo) ? trim((string) file_get_contents($rutaCodigo)) : '';
    if ($esperado === '' || $codigo === '' || !hash_equals($esperado, $codigo)) {
        oc_error('El código de instalación no es correcto.', 403);
    }
    if (mb_strlen($password) < 10) {
        oc_error('La contraseña debe tener al menos 10 caracteres. Una frase fácil de recordar funciona muy bien.');
    }

    oc_config_guardar([
        'hash' => password_hash($password, PASSWORD_DEFAULT),
        'creado' => oc_ahora(),
    ]);
    @unlink($rutaCodigo);

    session_regenerate_id(true);
    $_SESSION['auth'] = true;
    oc_responder(['ok' => true, 'csrf' => $_SESSION['csrf']]);
}

function oc_auth_entrar(): void {
    $cfg = oc_config();
    if ($cfg === null) oc_error('El panel aún no está configurado.', 409, ['instalado' => false]);
    if (oc_excede_limite('entrar:' . oc_ip(), 6, 900)) {
        oc_error('Demasiados intentos seguidos. Espera 15 minutos y vuelve a probar.', 429);
    }
    $e = oc_entrada();
    $password = (string) ($e['password'] ?? '');
    if ($password === '' || !password_verify($password, (string) ($cfg['hash'] ?? ''))) {
        oc_error('La contraseña no es correcta.', 401);
    }
    if (password_needs_rehash((string) $cfg['hash'], PASSWORD_DEFAULT)) {
        $cfg['hash'] = password_hash($password, PASSWORD_DEFAULT);
        oc_config_guardar($cfg);
    }
    session_regenerate_id(true);
    $_SESSION['auth'] = true;
    oc_responder(['ok' => true, 'csrf' => $_SESSION['csrf']]);
}

function oc_auth_salir(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
    oc_responder(['ok' => true]);
}

function oc_auth_cambiar_password(): void {
    $cfg = oc_config();
    if ($cfg === null) oc_error('El panel aún no está configurado.', 409);
    $e = oc_entrada();
    $actual = (string) ($e['actual'] ?? '');
    $nueva = (string) ($e['nueva'] ?? '');
    if (!password_verify($actual, (string) ($cfg['hash'] ?? ''))) {
        oc_error('La contraseña actual no es correcta.', 403);
    }
    if (mb_strlen($nueva) < 10) {
        oc_error('La contraseña nueva debe tener al menos 10 caracteres.');
    }
    $cfg['hash'] = password_hash($nueva, PASSWORD_DEFAULT);
    $cfg['cambiado'] = oc_ahora();
    oc_config_guardar($cfg);
    oc_responder(['ok' => true]);
}
