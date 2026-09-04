/**
 * Despliegue incremental por FTP a offcourtsports.com.mx
 *
 * Reemplaza al script anterior, que hacía `clearWorkingDir()` sobre /public_html
 * ANTES de subir: si la conexión se caía a media transferencia, el sitio quedaba
 * vacío o a medias. Y volvía a subir los 117 MB completos cada vez.
 *
 * Estrategia aquí:
 *   1. Respaldar los archivos de servidor del remoto (.htaccess, *.php).
 *   2. Comparar local contra remoto y subir SOLO lo que cambió (nombre + tamaño).
 *   3. Recién entonces borrar del remoto lo que ya no existe en local.
 *   4. Verificar por HTTP que el sitio responde y sirve el bundle nuevo.
 *
 * El sitio nunca queda sin archivos: primero se añade, después se limpia.
 *
 * Uso:
 *   node deploy.cjs            despliegue normal
 *   node deploy.cjs --dry-run  muestra qué haría, sin tocar el servidor
 */

const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const https = require('https');

const LOCAL = 'dist';
const SECO = process.argv.includes('--dry-run');

// ---------------------------------------------------------------- credenciales

function cargarEnv() {
  const p = path.join(__dirname, '.env');
  if (!fs.existsSync(p)) {
    throw new Error('Falta el archivo .env con las credenciales del FTP.');
  }
  const env = {};
  for (const linea of fs.readFileSync(p, 'utf8').split('\n')) {
    const l = linea.trim();
    if (!l || l.startsWith('#')) continue;
    const i = l.indexOf('=');
    if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim();
  }
  for (const k of ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD', 'FTP_REMOTE_DIR']) {
    if (!env[k]) throw new Error('Falta ' + k + ' en .env');
  }
  return env;
}

// ---------------------------------------------------------------------- utiles

const kb = (n) => (n / 1024).toFixed(0).padStart(6) + ' KB';
const log = (...a) => console.log(...a);

/** Recorre dist/ y devuelve { 'ruta/relativa': { size, fecha } } */
function inventarioLocal(dir, base = dir, acc = {}) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) inventarioLocal(p, base, acc);
    else {
      const st = fs.statSync(p);
      acc[path.relative(base, p).split(path.sep).join('/')] = { size: st.size, fecha: st.mtimeMs };
    }
  }
  return acc;
}

/** Lo mismo contra el servidor. */
async function inventarioRemoto(client, dir, prefijo = '', acc = {}) {
  let entradas;
  try {
    entradas = await client.list(dir);
  } catch {
    return acc; // el directorio no existe todavía
  }
  for (const e of entradas) {
    if (e.name === '.' || e.name === '..') continue;
    const rel = prefijo ? prefijo + '/' + e.name : e.name;
    if (e.isDirectory) await inventarioRemoto(client, dir + '/' + e.name, rel, acc);
    // Guardamos tamaño Y fecha: comparar solo por tamaño dejaba fuera cualquier
    // cambio que no alterase el número de bytes (un texto corregido, un color
    // hexadecimal distinto, una fecha en el sitemap). Esos archivos no se
    // volvían a subir nunca y el servidor se quedaba con la versión vieja.
    else acc[rel] = { size: e.size, fecha: e.modifiedAt ? e.modifiedAt.getTime() : 0 };
  }
  return acc;
}

function verificar(url) {
  return new Promise((resolve) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0 offcourt-deploy' } }, (res) => {
        let cuerpo = '';
        res.on('data', (c) => (cuerpo += c));
        res.on('end', () => resolve({ status: res.statusCode, cuerpo }));
      })
      .on('error', (e) => resolve({ status: 0, error: e.message }));
  });
}

// ----------------------------------------------------------------------- deploy

async function main() {
  const env = cargarEnv();
  const REMOTO = env.FTP_REMOTE_DIR;

  if (!fs.existsSync(LOCAL) || !fs.existsSync(path.join(LOCAL, 'index.html'))) {
    throw new Error('No existe dist/index.html. Ejecuta `npm run build` primero.');
  }

  const locales = inventarioLocal(LOCAL);
  const nLocal = Object.keys(locales).length;
  // Salvaguarda: si el build salió incompleto, no queremos que el paso de
  // limpieza arrase con el sitio entero.
  if (nLocal < 30) {
    throw new Error('dist/ solo tiene ' + nLocal + ' archivos. Parece un build incompleto; aborto.');
  }

  log('Local : ' + nLocal + ' archivos, ' +
      (Object.values(locales).reduce((a, f) => a + f.size, 0) / 1024 / 1024).toFixed(1) + ' MB');

  const client = new ftp.Client(60000);
  client.ftp.verbose = false;

  try {
    await client.access({
      host: env.FTP_HOST,
      user: env.FTP_USER,
      password: env.FTP_PASSWORD,
      secure: false,
    });
    log('Conectado a ' + env.FTP_HOST);

    const remotos = await inventarioRemoto(client, REMOTO);
    log('Remoto: ' + Object.keys(remotos).length + ' archivos\n');

    // --- 1. Respaldo de los archivos de servidor -----------------------------
    // Son los únicos que no se pueden regenerar desde el código.
    const críticos = ['.htaccess', 'sendmail.php', 'index.php'];
    const dirBackup = path.join(__dirname, '.deploy-backup');
    if (!SECO) fs.mkdirSync(dirBackup, { recursive: true });
    for (const f of críticos) {
      if (!remotos[f]) continue;
      if (SECO) { log('  [seco] respaldaría ' + f); continue; }
      try {
        await client.downloadTo(path.join(dirBackup, f), REMOTO + '/' + f);
        log('  respaldado  ' + f);
      } catch (e) {
        log('  aviso: no se pudo respaldar ' + f + ' (' + e.message + ')');
      }
    }

    // --- 2. Subir lo nuevo y lo cambiado ------------------------------------
    // Un archivo se sube si es nuevo, si cambió de tamaño, o si en local es más
    // reciente que en el servidor. Lo último es lo que atrapa las ediciones que
    // dejan el mismo número de bytes, que antes se colaban sin desplegarse.
    // El margen de dos minutos absorbe el desfase de reloj entre las dos
    // máquinas y la resolución de minutos que tiene la fecha por FTP.
    const MARGEN_RELOJ = 2 * 60 * 1000;

    // Los bundles de Vite llevan el hash del contenido en el nombre
    // (index-DGGg4oek.js). Mismo nombre y mismo tamaño solo puede significar
    // mismo contenido, así que ahí la fecha no dice nada: Vite los reescribe en
    // cada build aunque no cambien, y compararlos por fecha reenviaba GSAP
    // entero cada vez. Es la misma familia de archivos que el .htaccess marca
    // como `immutable`.
    const conHash = (rel) => /-[A-Za-z0-9_-]{8,}\.(js|css)$/.test(rel);

    const subir = [];
    for (const [rel, local] of Object.entries(locales)) {
      const remoto = remotos[rel];
      if (remoto === undefined) subir.push({ rel, size: local.size, motivo: 'nuevo' });
      else if (remoto.size !== local.size) subir.push({ rel, size: local.size, motivo: 'cambió' });
      else if (conHash(rel)) continue;
      else if (remoto.fecha && local.fecha > remoto.fecha + MARGEN_RELOJ) {
        subir.push({ rel, size: local.size, motivo: 'más nuevo' });
      }
    }

    const bytes = subir.reduce((a, f) => a + f.size, 0);
    log('\nA subir: ' + subir.length + ' archivos (' + (bytes / 1024 / 1024).toFixed(1) + ' MB)');
    log('Sin cambios: ' + (nLocal - subir.length) + ' archivos, no se retransmiten\n');

    let i = 0;
    for (const f of subir) {
      i++;
      const etiqueta = '  [' + String(i).padStart(3) + '/' + subir.length + '] ' +
                       kb(f.size) + '  ' + f.motivo.padEnd(9) + ' ' + f.rel;
      if (SECO) { log('  [seco]' + etiqueta); continue; }
      const dirRemoto = REMOTO + '/' + path.dirname(f.rel);
      if (path.dirname(f.rel) !== '.') await client.ensureDir(dirRemoto);
      await client.uploadFrom(path.join(LOCAL, f.rel), REMOTO + '/' + f.rel);
      log(etiqueta);
    }

    // --- 3. Solo ahora, retirar lo que ya no existe -------------------------
    // Nunca tocamos lo que administra el hosting: php.ini y .user.ini los genera
    // cPanel y de ellos depende que PHP (y por tanto sendmail.php) funcione.
    // El script viejo, con su clearWorkingDir(), los arrasaba en cada despliegue.
    const INTOCABLES = [
      /^php\.ini$/i,
      /^\.user\.ini$/i,
      /^\.well-known\//i,
      /^cgi-bin\//i,
      /^error_log$/i,
      /^\.ftpquota$/i,
      /^cpanel/i,
    ];
    const protegido = (r) => INTOCABLES.some((re) => re.test(r));

    const huérfanos = Object.keys(remotos)
      .filter((r) => locales[r] === undefined)
      .filter((r) => {
        if (protegido(r)) { log('  conservado (lo gestiona el hosting)  ' + r); return false; }
        return true;
      });
    if (huérfanos.length) {
      log('\nRetirando ' + huérfanos.length + ' archivos que ya no forman parte del sitio:');
      for (const r of huérfanos) {
        if (SECO) { log('  [seco] borraría ' + r); continue; }
        try {
          await client.remove(REMOTO + '/' + r);
          log('  borrado  ' + r);
        } catch (e) {
          log('  aviso: no se pudo borrar ' + r + ' (' + e.message + ')');
        }
      }
    } else {
      log('\nNo hay archivos obsoletos que retirar.');
    }

    client.close();

    // --- 4. Comprobar que el sitio quedó sano -------------------------------
    if (SECO) { log('\n[seco] Fin de la simulación. No se tocó el servidor.'); return; }

    log('\nVerificando el sitio...');
    const html = fs.readFileSync(path.join(LOCAL, 'index.html'), 'utf8');
    const bundle = (html.match(/assets\/index-[A-Za-z0-9_-]+\.js/) || [])[0];

    const home = await verificar(env.SITE_URL + '/');
    log('  /                    HTTP ' + home.status);
    if (bundle) {
      log('  bundle esperado      ' + bundle);
      log('  servido por el sitio ' + (home.cuerpo && home.cuerpo.includes(bundle) ? 'SÍ' : 'NO (puede ser caché de Cloudflare)'));
    }
    const rutas = ['/nosotros', '/sendmail.php', '/hero-poster.webp'];
    for (const r of rutas) {
      const res = await verificar(env.SITE_URL + r);
      log('  ' + r.padEnd(20) + ' HTTP ' + res.status);
    }
    log('\nDespliegue terminado.');
  } catch (err) {
    client.close();
    console.error('\nFALLÓ EL DESPLIEGUE: ' + err.message);
    console.error('El sitio sigue en pie: este script sube antes de borrar, ' +
                  'así que un fallo a media subida no deja /public_html vacío.');
    process.exitCode = 1;
  }
}

main();
