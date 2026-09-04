<?php
/**
 * Bandeja de mensajes del formulario de contacto.
 *
 * sendmail.php sigue enviando el correo como siempre, pero además deja una
 * copia aquí (data/mensajes.json). Así, si un correo se pierde o acaba en
 * spam, el mensaje sigue en el panel.
 */
declare(strict_types=1);

const OC_MAX_MENSAJES = 500;

function oc_mensajes_ruta(): string { return OC_DATOS . '/mensajes.json'; }

function oc_mensajes_leer(): array {
    $m = oc_json_leer(oc_mensajes_ruta(), ['items' => []]);
    if (!isset($m['items']) || !is_array($m['items'])) $m['items'] = [];
    return $m;
}

/** Lo llama sendmail.php. Nunca lanza: registrar no debe impedir el envío. */
function oc_mensaje_registrar(array $datos): void {
    try {
        $m = oc_mensajes_leer();
        array_unshift($m['items'], [
            'id' => bin2hex(random_bytes(6)),
            'fecha' => oc_ahora(),
            'nombre' => mb_substr((string) ($datos['nombre'] ?? ''), 0, 200),
            'email' => mb_substr((string) ($datos['email'] ?? ''), 0, 200),
            'telefono' => mb_substr((string) ($datos['telefono'] ?? ''), 0, 60),
            'mensaje' => mb_substr((string) ($datos['mensaje'] ?? ''), 0, 5000),
            'leido' => false,
        ]);
        $m['items'] = array_slice($m['items'], 0, OC_MAX_MENSAJES);
        oc_json_escribir(oc_mensajes_ruta(), $m);
    } catch (Throwable) {
        // Se ignora a propósito: el correo ya salió o va a salir.
    }
}

function oc_mensajes_listar(): void {
    $m = oc_mensajes_leer();
    $noLeidos = count(array_filter($m['items'], fn($x) => empty($x['leido'])));
    oc_responder(['ok' => true, 'mensajes' => $m['items'], 'noLeidos' => $noLeidos]);
}

function oc_mensajes_marcar(): void {
    $e = oc_entrada();
    $id = (string) ($e['id'] ?? '');
    $leido = !empty($e['leido']);
    $m = oc_mensajes_leer();
    foreach ($m['items'] as &$x) {
        if (($x['id'] ?? '') === $id) $x['leido'] = $leido;
    }
    unset($x);
    oc_json_escribir(oc_mensajes_ruta(), $m);
    oc_responder(['ok' => true]);
}

function oc_mensajes_eliminar(): void {
    $e = oc_entrada();
    $id = (string) ($e['id'] ?? '');
    $m = oc_mensajes_leer();
    $m['items'] = array_values(array_filter($m['items'], fn($x) => ($x['id'] ?? '') !== $id));
    oc_json_escribir(oc_mensajes_ruta(), $m);
    oc_responder(['ok' => true]);
}

/** Exportación a CSV (se abre en Excel). */
function oc_mensajes_csv(): never {
    $m = oc_mensajes_leer();
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="mensajes-offcourt-' . date('Y-m-d') . '.csv"');
    header('Cache-Control: no-store');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF"); // BOM: para que Excel lea bien las tildes
    fputcsv($out, ['Fecha', 'Nombre', 'Correo', 'Teléfono', 'Mensaje', 'Leído'], ';');
    foreach ($m['items'] as $x) {
        fputcsv($out, [
            $x['fecha'] ?? '', $x['nombre'] ?? '', $x['email'] ?? '', $x['telefono'] ?? '',
            $x['mensaje'] ?? '', !empty($x['leido']) ? 'Sí' : 'No',
        ], ';');
    }
    fclose($out);
    exit;
}
