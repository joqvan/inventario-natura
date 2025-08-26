// ====== Tema oscuro con preferencia del sistema + persistencia (robusto) ======
document.addEventListener("DOMContentLoaded", () => {
  const ROOT = document.documentElement; // <html>
  const STORAGE_KEY = "theme";           // 'light' | 'dark'

  // 1) Asegurar que exista un botón (si no, lo creamos)
  let btn = document.getElementById("themeToggle");
  if (!btn) {
    const nav = document.querySelector("header nav") || document.querySelector(".header nav");
    if (nav) {
      btn = document.createElement("button");
      btn.id = "themeToggle";
      btn.type = "button";
      btn.className = "theme-toggle";
      nav.appendChild(btn);
    }
  }

  // 2) Estado inicial: localStorage > sistema
  const saved = localStorage.getItem(STORAGE_KEY);
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = saved || (systemPrefersDark ? "dark" : "light");
  ROOT.setAttribute("data-theme", initial);
  updateButtonLabel(initial);

  // 3) Escuchar cambios del sistema si no hay preferencia guardada
  if (!saved) {
    try {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener?.("change", (e) => {
        const next = e.matches ? "dark" : "light";
        ROOT.setAttribute("data-theme", next);
        updateButtonLabel(next);
      });
    } catch (_) { /* Safari antiguos */ }
  }

  // 4) Click para alternar y persistir
  if (btn) {
    btn.addEventListener("click", () => {
      const current = ROOT.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      ROOT.setAttribute("data-theme", next);
      localStorage.setItem(STORAGE_KEY, next);
      updateButtonLabel(next);
    });
  }

  function updateButtonLabel(theme) {
    if (!btn) return;
    btn.textContent = theme === "dark" ? "☀️ Modo claro" : "🌙 Modo oscuro";
  }
});

// ==================
// BOTÓN SALIR
// ==================
document.getElementById('btnSalir')?.addEventListener('click', async () => {
  const url = 'http://127.0.0.1:5000/__shutdown';

  // Asegura enviar el request aunque la pestaña cambie o se cierre
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob(['bye'], { type: 'text/plain' }));
    } else {
      await fetch(url, { method: 'POST', keepalive: true, mode: 'no-cors' });
    }
  } catch (_) {}

  // En pestañas normales no se puede forzar cierre: mostramos mensaje claro
  try {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Inter,system-ui,Segoe UI,Arial">
        <div style="text-align:center;max-width:600px">
          <h2>Aplicación cerrada</h2>
          <p>El servidor se ha detenido. Puede cerrar esta pestaña con seguridad.</p>
        </div>
      </div>`;
  } catch (_) {}
});

