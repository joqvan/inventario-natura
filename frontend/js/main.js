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
