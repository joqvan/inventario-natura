const apiUrl = 'http://localhost:5000/productos';

// ========================
// SUBMIT DEL FORMULARIO
// ========================
document.getElementById('agregarForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const producto = {
    codigo_barra: document.getElementById('codigo_barra').value,
    nombre: document.getElementById('nombre').value,
    descripcion: document.getElementById('descripcion').value,
    stock: parseInt(document.getElementById('stock').value) || 0
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
    // vuelve a enfocar para el siguiente escaneo
    document.getElementById('codigo_barra').focus();
  } else {
    resultado.textContent = `❌ Error: ${data.error}`;
    resultado.className = 'mensaje error';
  }

  setTimeout(() => {
    resultado.textContent = "";
    resultado.className = "mensaje";
  }, 4000);
});

// ========================
// CAPTURA DE ESCÁNER (USB)
// ========================
//
// Muchos lectores USB actúan como teclado:
// - teclean MUY rápido (<= 30ms entre teclas)
// - finalizan con Enter
//
// Este capturador detecta esa velocidad, reúne el texto
// y lo inyecta en #codigo_barra, sin importar dónde esté el foco.
//

(() => {
  const CODE_INPUT_ID = 'codigo_barra';
  const AUTO_SUBMIT_AFTER_SCAN = false; // cambia a true si quieres enviar el form al escanear

  let buffer = '';
  let lastTime = 0;
  let timer = null;

  const RESET_DELAY = 80;   // ms sin teclear => se considera que terminó una “ráfaga”
  const SPEED_THRESHOLD = 30; // ms entre teclas para considerarlo “escáner”

  function resetBuffer() {
    buffer = '';
    lastTime = 0;
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function handleChar(ch, now) {
    // Si venimos muy rápido, es escáner
    const fast = lastTime && (now - lastTime) <= SPEED_THRESHOLD;
    lastTime = now;

    buffer += ch;

    // reinicia temporizador para delimitar la ráfaga
    if (timer) clearTimeout(timer);
    timer = setTimeout(resetBuffer, RESET_DELAY);

    return fast;
  }

  document.addEventListener('keydown', (e) => {
    const inputCodigo = document.getElementById(CODE_INPUT_ID);
    if (!inputCodigo) return;

    // Ignorar modificadores
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    const now = e.timeStamp || Date.now();

    // ENTER marca fin de lectura
    if (e.key === 'Enter') {
      // si parece una lectura de escáner (rápida y razonable en longitud)
      if (buffer.length >= 6) {
        inputCodigo.value = buffer;
        inputCodigo.focus();
        inputCodigo.select(); // opcional: selecciona el texto

        if (AUTO_SUBMIT_AFTER_SCAN) {
          document.getElementById('agregarForm').requestSubmit();
        }

        e.preventDefault(); // evita que “Enter” haga submit en otro campo
        resetBuffer();
      } else {
        // no era escáner; limpiar por si quedó basura
        resetBuffer();
      }
      return;
    }

    // Solo consideramos caracteres imprimibles de una sola letra
    if (e.key.length === 1) {
      const fast = handleChar(e.key, now);

      // Si el foco NO está en #codigo_barra y estamos en una ráfaga rápida,
      // prevenimos que esas teclas “caigan” en otros campos y las redirigimos.
      if (document.activeElement !== inputCodigo && (fast || buffer.length > 1)) {
        e.preventDefault();
      }
    } else {
      // tecla no imprimible => no se acumula; posible fin de secuencia
      resetBuffer();
    }
  });

  // Conveniencia: enfocar código al cargar y al volver a la pestaña
  window.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById(CODE_INPUT_ID);
    if (el) el.focus();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const el = document.getElementById(CODE_INPUT_ID);
      if (el) el.focus();
    }
  });
})();
