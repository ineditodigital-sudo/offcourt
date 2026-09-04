<?php
/**
 * Contenido del sitio: borrador, publicado, versiones y respaldos.
 *
 *   data/borrador.json    lo que la persona está editando (autoguardado)
 *   data/publicado.json   lo que ven los visitantes (lo inyecta index.php)
 *   data/versiones/*.json  copia del publicado anterior en cada publicación
 *
 * El servidor no interpreta el contenido: guarda el documento que envía el
 * panel tras comprobar que tiene la forma esperada. Quien sabe qué campos
 * existen es src/cms/definicion.ts, en el sitio y en el panel; al pintar, el
 * sitio fusiona lo guardado con esa definición, así que un JSON viejo o
 * incompleto nunca rompe la página.
 */
declare(strict_types=1);

const OC_MAX_VERSIONES = 30;

function oc_ruta_borrador(): string { return OC_DATOS . '/borrador.json'; }
function oc_ruta_publicado(): string { return OC_DATOS . '/publicado.json'; }
function oc_dir_versiones(): string { return OC_DATOS . '/versiones'; }

/** Forma mínima que debe tener un documento para aceptarlo. */
function oc_documento_valido(mixed $doc): bool {
    return is_array($doc)
        && isset($doc['datos']) && is_array($doc['datos'])
        && isset($doc['datos']['global'], $doc['datos']['paginas'])
        && (!isset($doc['estilos']) || is_array($doc['estilos']));
}

function oc_documento_normalizar(array $doc): array {
    return [
        'version' => 1,
        'datos' => $doc['datos'],
        'estilos' => is_array($doc['estilos'] ?? null) ? $doc['estilos'] : [],
    ];
}

function oc_contenido_borrador(): void {
    $borrador = oc_json_leer(oc_ruta_borrador());
    $publicado = oc_json_leer(oc_ruta_publicado());
    oc_responder([
        'ok' => true,
        // Si no hay borrador, se edita a partir de lo publicado; si tampoco hay
        // nada publicado, el panel arranca con los valores por defecto.
        'documento' => $borrador['documento'] ?? $publicado['documento'] ?? null,
        'hayBorrador' => $borrador !== null,
        'borradorEn' => $borrador['guardadoEn'] ?? null,
        'publicadoEn' => $publicado['publicadoEn'] ?? null,
    ]);
}

function oc_contenido_publicado(): void {
    $publicado = oc_json_leer(oc_ruta_publicado());
    oc_responder([
        'ok' => true,
        'documento' => $publicado['documento'] ?? null,
        'publicadoEn' => $publicado['publicadoEn'] ?? null,
    ]);
}

function oc_contenido_guardar_borrador(): void {
    $e = oc_entrada();
    $doc = $e['documento'] ?? null;
    if (!oc_documento_valido($doc)) oc_error('El contenido recibido no tiene la forma esperada.');
    $ahora = oc_ahora();
    oc_json_escribir(oc_ruta_borrador(), ['guardadoEn' => $ahora, 'documento' => oc_documento_normalizar($doc)]);
    oc_responder(['ok' => true, 'guardadoEn' => $ahora]);
}

function oc_contenido_publicar(): void {
    $e = oc_entrada();
    $doc = $e['documento'] ?? null;
    if (!oc_documento_valido($doc)) oc_error('El contenido recibido no tiene la forma esperada.');

    // Lo que estaba publicado pasa al historial antes de sobrescribirlo.
    $anterior = oc_json_leer(oc_ruta_publicado());
    if ($anterior !== null) {
        $dir = oc_dir_versiones();
        if (!is_dir($dir)) @mkdir($dir, 0755, true);
        $id = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('Ymd-His');
        oc_json_escribir($dir . '/' . $id . '.json', $anterior);
        oc_versiones_podar();
    }

    $ahora = oc_ahora();
    oc_json_escribir(oc_ruta_publicado(), ['publicadoEn' => $ahora, 'documento' => oc_documento_normalizar($doc)]);
    @unlink(oc_ruta_borrador());
    oc_responder(['ok' => true, 'publicadoEn' => $ahora]);
}

function oc_contenido_descartar(): void {
    @unlink(oc_ruta_borrador());
    $publicado = oc_json_leer(oc_ruta_publicado());
    oc_responder(['ok' => true, 'documento' => $publicado['documento'] ?? null]);
}

/** Lista de versiones anteriores, de la más reciente a la más antigua. */
function oc_versiones_listar(): array {
    $dir = oc_dir_versiones();
    if (!is_dir($dir)) return [];
    $out = [];
    foreach (glob($dir . '/*.json') ?: [] as $ruta) {
        $id = basename($ruta, '.json');
        $datos = oc_json_leer($ruta);
        $out[] = [
            'id' => $id,
            'fecha' => $datos['publicadoEn'] ?? null,
            'tamano' => filesize($ruta) ?: 0,
        ];
    }
    usort($out, fn($a, $b) => strcmp($b['id'], $a['id']));
    return $out;
}

function oc_versiones_podar(): void {
    $lista = oc_versiones_listar();
    foreach (array_slice($lista, OC_MAX_VERSIONES) as $v) {
        @unlink(oc_dir_versiones() . '/' . $v['id'] . '.json');
    }
}

function oc_contenido_versiones(): void {
    oc_responder(['ok' => true, 'versiones' => oc_versiones_listar()]);
}

function oc_version_ruta(string $id): string {
    if (!preg_match('/^\d{8}-\d{6}$/', $id)) oc_error('Versión no válida.');
    $ruta = oc_dir_versiones() . '/' . $id . '.json';
    if (!is_file($ruta)) oc_error('Esa versión ya no existe.', 404);
    return $ruta;
}

function oc_contenido_version(): void {
    $id = (string) ($_GET['id'] ?? '');
    $datos = oc_json_leer(oc_version_ruta($id));
    oc_responder(['ok' => true, 'id' => $id, 'fecha' => $datos['publicadoEn'] ?? null, 'documento' => $datos['documento'] ?? null]);
}

/** Recupera una versión como borrador: la persona la revisa y decide si publicar. */
function oc_contenido_restaurar(): void {
    $e = oc_entrada();
    $id = (string) ($e['id'] ?? '');
    $datos = oc_json_leer(oc_version_ruta($id));
    if (!oc_documento_valido($datos['documento'] ?? null)) oc_error('Esa versión está dañada y no se puede recuperar.');
    $ahora = oc_ahora();
    oc_json_escribir(oc_ruta_borrador(), ['guardadoEn' => $ahora, 'documento' => oc_documento_normalizar($datos['documento'])]);
    oc_responder(['ok' => true, 'documento' => $datos['documento'], 'guardadoEn' => $ahora]);
}

/** Respaldo completo, como descarga. */
function oc_contenido_exportar(): never {
    $respaldo = [
        'sitio' => OC_SITIO,
        'exportadoEn' => oc_ahora(),
        'publicado' => oc_json_leer(oc_ruta_publicado()),
        'borrador' => oc_json_leer(oc_ruta_borrador()),
        'medios' => oc_json_leer(OC_DATOS . '/medios.json'),
    ];
    $nombre = 'offcourt-respaldo-' . date('Y-m-d') . '.json';
    header('Content-Type: application/json; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $nombre . '"');
    header('Cache-Control: no-store');
    echo json_encode($respaldo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}

/** Importa un respaldo COMO BORRADOR: nunca se publica nada sin revisarlo. */
function oc_contenido_importar(): void {
    $e = oc_entrada();
    $respaldo = $e['respaldo'] ?? null;
    $doc = null;
    if (is_array($respaldo)) {
        $doc = $respaldo['publicado']['documento'] ?? $respaldo['borrador']['documento'] ?? $respaldo['documento'] ?? null;
    }
    if (!oc_documento_valido($doc)) oc_error('Ese archivo no parece un respaldo del sitio.');
    $ahora = oc_ahora();
    oc_json_escribir(oc_ruta_borrador(), ['guardadoEn' => $ahora, 'documento' => oc_documento_normalizar($doc)]);
    if (is_array($respaldo['medios'] ?? null) && !is_file(OC_DATOS . '/medios.json')) {
        oc_json_escribir(OC_DATOS . '/medios.json', $respaldo['medios']);
    }
    oc_responder(['ok' => true, 'documento' => $doc, 'guardadoEn' => $ahora]);
}
