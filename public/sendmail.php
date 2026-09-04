<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Honeypot anti-spam
if (!empty($_POST['botcheck'] ?? '')) {
    echo json_encode(['success' => true]);
    exit;
}

/**
 * Límite de envíos por IP.
 *
 * El honeypot de arriba solo detiene a los bots que rellenan todos los campos.
 * Un script que envíe POST directamente lo esquiva sin esfuerzo y podía disparar
 * mail() sin freno: buzón inundado y, peor, el dominio marcado como emisor de
 * spam, que es lo que arruina la entrega de TODO el correo de la empresa.
 *
 * La IP se lee de CF-Connecting-IP, no de REMOTE_ADDR: el sitio va detrás de
 * Cloudflare y REMOTE_ADDR es siempre la del proxy, la misma para todos los
 * visitantes. Limitar por ella dejaría fuera a gente legítima en cuanto
 * cualquier otro visitante enviara un mensaje.
 */
function ip_visitante(): string {
    // Solo confiamos en la cabecera de Cloudflare, que es quien está delante.
    // X-Forwarded-For la puede escribir el cliente y sería trivial de falsear.
    $cf = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '';
    if ($cf !== '' && filter_var($cf, FILTER_VALIDATE_IP)) return $cf;
    $remota = $_SERVER['REMOTE_ADDR'] ?? '';
    return filter_var($remota, FILTER_VALIDATE_IP) ? $remota : 'desconocida';
}

function excede_limite(string $ip, int $maximo = 5, int $ventana = 3600): bool {
    $dir = sys_get_temp_dir() . '/oc-envios';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    if (!is_dir($dir)) return false; // sin sitio donde anotar, no bloqueamos a nadie

    $archivo = $dir . '/' . sha1($ip) . '.txt';
    $f = @fopen($archivo, 'c+');
    if ($f === false) return false;

    // Bloqueo exclusivo: dos peticiones simultáneas no deben pisarse el conteo.
    if (!flock($f, LOCK_EX)) { fclose($f); return false; }

    $ahora  = time();
    $sellos = array_filter(
        array_map('intval', explode(',', (string) stream_get_contents($f))),
        fn($t) => $t > $ahora - $ventana
    );

    $pasado = count($sellos) >= $maximo;
    if (!$pasado) $sellos[] = $ahora;

    ftruncate($f, 0);
    rewind($f);
    fwrite($f, implode(',', $sellos));
    fflush($f);
    flock($f, LOCK_UN);
    fclose($f);

    // Limpieza ocasional para que /tmp no acumule archivos indefinidamente.
    if (random_int(1, 50) === 1) {
        foreach (glob($dir . '/*.txt') ?: [] as $viejo) {
            if (@filemtime($viejo) < $ahora - 86400) @unlink($viejo);
        }
    }

    return $pasado;
}

if (excede_limite(ip_visitante())) {
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'message' => 'Has enviado varios mensajes seguidos. Inténtalo más tarde o escríbenos por WhatsApp.',
    ]);
    exit;
}

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos o correo inválido']);
    exit;
}

// Evitar inyección de cabeceras
$nameHdr   = str_replace(["\r", "\n"], ' ', $name);
$emailSafe = str_replace(["\r", "\n"], '', $email);

// Escapar para HTML
$hName    = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$hEmail   = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$hPhone   = htmlspecialchars($phone !== '' ? $phone : 'No proporcionado', ENT_QUOTES, 'UTF-8');
$hMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));

$to      = 'contacto@offcourtsports.com.mx';
$subject = 'Nuevo mensaje del sitio web';

function field($label, $value) {
    return '<div style="margin-bottom:18px;">'
         . '<div style="color:#8a8a8a;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:bold;margin-bottom:4px;">' . $label . '</div>'
         . '<div style="color:#1b1b1b;font-size:16px;font-weight:600;">' . $value . '</div>'
         . '</div>';
}

$plain = "Nuevo mensaje del formulario de contacto:\n\n"
       . "Nombre:   $name\n"
       . "Correo:   $email\n"
       . "Telefono: " . ($phone !== '' ? $phone : 'No proporcionado') . "\n\n"
       . "Mensaje:\n$message\n";

$html = '<!doctype html><html><head><meta charset="utf-8"></head>'
  . '<body style="margin:0;padding:0;background:#e4e4e4;font-family:Arial,Helvetica,sans-serif;">'
  . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e4e4e4;padding:28px 12px;"><tr><td align="center">'
  . '<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.10);">'
  . '<tr><td style="background:#1b1b1b;padding:30px 34px;">'
  . '<img src="https://offcourtsports.com.mx/oc-icon.png" alt="Offcourt" width="48" style="display:block;margin-bottom:14px;">'
  . '<div style="color:#fda211;font-size:12px;letter-spacing:3px;font-weight:bold;text-transform:uppercase;">Offcourt Sports Group</div>'
  . '<div style="color:#ffffff;font-size:23px;font-weight:bold;margin-top:5px;">Nuevo mensaje de contacto</div>'
  . '</td></tr>'
  . '<tr><td style="padding:34px;">'
  . field('Nombre', $hName)
  . field('Correo', '<a href="mailto:' . $hEmail . '" style="color:#c98a10;text-decoration:none;">' . $hEmail . '</a>')
  . field('Teléfono', $hPhone)
  . '<div style="margin-top:22px;">'
  . '<div style="color:#8a8a8a;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:bold;margin-bottom:8px;">Mensaje</div>'
  . '<div style="background:#f5f5f5;border-left:4px solid #fda211;border-radius:10px;padding:18px;color:#2e2f30;font-size:15px;line-height:1.65;">' . $hMessage . '</div>'
  . '</div>'
  . '</td></tr>'
  . '<tr><td style="background:#1b1b1b;padding:18px 34px;text-align:center;">'
  . '<div style="color:#8a8a8a;font-size:12px;">Enviado desde <span style="color:#fda211;">offcourtsports.com.mx</span></div>'
  . '</td></tr>'
  . '</table></td></tr></table></body></html>';

$boundary = 'oc_' . md5(uniqid('', true));
$headers  = "From: Offcourt Sports Group <no-reply@offcourtsports.com.mx>\r\n";
$headers .= "Reply-To: $nameHdr <$emailSafe>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";

$mime  = "--$boundary\r\n";
$mime .= "Content-Type: text/plain; charset=UTF-8\r\n";
$mime .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$mime .= $plain . "\r\n\r\n";
$mime .= "--$boundary\r\n";
$mime .= "Content-Type: text/html; charset=UTF-8\r\n";
$mime .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$mime .= $html . "\r\n\r\n";
$mime .= "--$boundary--";

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

if (@mail($to, $encodedSubject, $mime, $headers)) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'No se pudo enviar el mensaje']);
}
