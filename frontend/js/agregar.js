// ========================
// CONFIG
// ========================
const apiUrl = 'http://localhost:5000/productos';
const CODE_INPUT_ID = 'codigoBarra'; // <-- coincide con nuevo.html

// ========================
// SUBMIT DEL FORMULARIO
// ========================
document.getElementById('agregarForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const codigo = document.getElementById(CODE_INPUT_ID).value.trim();
  const nombre = document.getElementById('nombre').value.trim();
  const descripcion = document.getElementById('descripcion').value.trim();
  const stock = parseInt(document.getElementById('stock').value, 10) || 0;

  const producto = {
    codigo_barra: codigo, // backend espera "codigo_barra"
    nombre,
    descripcion,
    stock
  };

  const res = await fetch(`${apiUrl}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto)
  });

  const data = await res.json();
  const resultado = document.getElementById("agregarResultado");

  if (res.ok) {
    resultado.textContent = '✅ Producto agregado correctamente';
    resultado.className = 'mensaje exito';
    document.getElementById('agregarForm').reset();
    // Listo para el siguiente escaneo
    const $codigo = document.getElementById(CODE_INPUT_ID);
    $codigo.focus();
    $codigo.select();
  } else {
    resultado.textContent = `❌ Error: ${data.error || 'No se pudo agregar'}`;
    resultado.className = 'mensaje error';
  }

  setTimeout(() => {
    resultado.textContent = "";
    resultado.className = "mensaje";
  }, 4000);
});

// ========================
// MANEJO DIRECTO DEL SCANNER EN EL INPUT
// (Modo A: el lector escribe en el input y termina con Enter)
// ========================
(() => {
  const $codigo = document.getElementById(CODE_INPUT_ID);
  if (!$codigo) return;

  // Al cargar, enfocar
  window.addEventListener('DOMContentLoaded', () => $codigo.focus());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') $codigo.focus();
  });

  // Cuando el lector (o el usuario) presiona Enter en el campo, procesamos
  $codigo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = $codigo.value.trim();
      if (!code) return;
      // En este flujo, simplemente enviamos el formulario
      document.getElementById('agregarForm').requestSubmit();
    }
  });
})();

// ========================
// (Opcional) CAPTURA GLOBAL SI EL INPUT NO TIENE FOCO
// Detecta ráfagas de tecleo típicas de un scanner y rellena el input
// ========================
(() => {
  const THRESHOLD_MS = 35;   // <= a esto se considera "ráfaga" de scanner
  const RESET_MS = 200;      // pausa entre teclas que resetea el buffer
  const MIN_LEN = 6;         // largo mínimo razonable
  let buf = '';
  let last = 0;
  let resetTimer = null;

  function reset() {
    buf = '';
    last = 0;
    if (resetTimer) { clearTimeout(resetTimer); resetTimer = null; }
  }

  document.addEventListener('keydown', (e) => {
    const $codigo = document.getElementById(CODE_INPUT_ID);
    if (!$codigo) return;

    // Si el usuario está escribiendo en un campo, no interceptar
    const t = e.target;
    const inField = t && (
      t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable
    );
    if (inField) return;

    // Ignorar modificadores
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    const now = performance.now();
    const delta = now - last;
    last = now;

    if (e.key === 'Enter') {
      if (buf.length >= MIN_LEN) {
        // Vertemos lo leído al input y disparamos submit
        $codigo.value = buf;
        $codigo.focus();
        $codigo.select();
        document.getElementById('agregarForm').requestSubmit();
        e.preventDefault();
      }
      reset();
      return;
    }

    // Reinicio por pausa larga
    if (delta > RESET_MS) buf = '';

    // Acumular caracteres imprimibles de 1 símbolo
    if (e.key.length === 1) {
      buf += e.key;

      // Mientras vamos en ráfaga, prevenimos que caiga en otro lado
      if (delta <= THRESHOLD_MS || buf.length > 1) {
        e.preventDefault();
      }

      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(reset, RESET_MS);
    }
  }, true);
})();
