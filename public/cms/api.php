<?php
/**
 * Punto de entrada de la API del panel: /cms/api.php?accion=…
 *
 * Todo devuelve JSON. Las acciones públicas son las tres que hacen falta antes
 * de tener sesión (estado, instalar, entrar); el resto exige haber entrado. Los
 * POST exigen además el token de sesión (ver oc_exigir_csrf).
 */
declare(strict_types=1);

require __DIR__ . '/lib/comun.php';
require __DIR__ . '/lib/auth.php';
require __DIR__ . '/lib/contenido.php';
require __DIR__ . '/lib/medios.php';
require __DIR__ . '/lib/mensajes.php';

set_exception_handler(function (Throwable $e) {
    error_log('[cms] ' . $e->getMessage());
    oc_error('Algo falló en el servidor: ' . $e->getMessage(), 500);
});

oc_sesion_iniciar();

$accion = (string) ($_GET['accion'] ?? $_POST['accion'] ?? '');
$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$publicas = ['estado', 'instalar', 'entrar'];
if (!in_array($accion, $publicas, true)) oc_exigir_auth();
if ($metodo === 'POST') oc_exigir_csrf();

$soloPost = fn() => $metodo === 'POST' ?: oc_error('Método no permitido.', 405);

switch ($accion) {
    // --- acceso
    case 'estado':            oc_responder(oc_auth_estado());
    case 'instalar':          $soloPost(); oc_auth_instalar();
    case 'entrar':            $soloPost(); oc_auth_entrar();
    case 'salir':             $soloPost(); oc_auth_salir();
    case 'cambiar-password':  $soloPost(); oc_auth_cambiar_password();

    // --- contenido
    case 'borrador':          oc_contenido_borrador();
    case 'publicado':         oc_contenido_publicado();
    case 'guardar-borrador':  $soloPost(); oc_contenido_guardar_borrador();
    case 'publicar':          $soloPost(); oc_contenido_publicar();
    case 'descartar':         $soloPost(); oc_contenido_descartar();
    case 'versiones':         oc_contenido_versiones();
    case 'version':           oc_contenido_version();
    case 'restaurar':         $soloPost(); oc_contenido_restaurar();
    case 'exportar':          oc_contenido_exportar();
    case 'importar':          $soloPost(); oc_contenido_importar();

    // --- medios
    case 'medios':            oc_medios_listar();
    case 'subir':             $soloPost(); oc_medios_subir();
    case 'reemplazar':        $soloPost(); oc_medios_reemplazar();
    case 'eliminar-medio':    $soloPost(); oc_medios_eliminar();
    case 'editar-medio':      $soloPost(); oc_medios_editar();
    case 'usos':              oc_medios_usos_accion();

    // --- mensajes
    case 'mensajes':          oc_mensajes_listar();
    case 'mensaje-leido':     $soloPost(); oc_mensajes_marcar();
    case 'mensaje-eliminar':  $soloPost(); oc_mensajes_eliminar();
    case 'mensajes-csv':      oc_mensajes_csv();

    default:
        oc_error('Acción desconocida.', 404);
}
