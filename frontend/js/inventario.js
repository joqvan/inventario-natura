// =========================
// Config y estado
// =========================
const API = "http://localhost:5000/productos";
let PRODUCTOS = [];

// =========================
// Helpers visuales
// =========================
function stockBadge(n) {
  const nivel = n <= 0 ? "danger" : (n < 10 ? "warning" : "success");
  return `<span class="badge badge-${nivel}">${n}</span>`;
}

// =========================
// Render de la tabla
// =========================
function renderTablaProductos(data) {
  const contenedor = document.getElementById("tablaInventario");
  if (!contenedor) return;

  if (!data || data.length === 0) {
    contenedor.innerHTML = `
      <div class="empty-state">
        <span>🗂️</span>
        <p>No hay productos en el inventario.</p>
      </div>`;
    return;
  }

  let html = `
    <table class="tabla-inventario">
      <thead>
        <tr>
          <th style="width: 18%">Código</th>
          <th style="width: 24%">Nombre</th>
          <th style="width: 36%">Descripción</th>
          <th style="width: 10%">Stock</th>
          <th style="width: 12%">Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach(p => {
    const codigo = p.codigo_barra || "";
    const nombre = p.nombre || "—";
    const descripcion = p.descripcion || "—";
    const stock = Number(p.stock) || 0;

    html += `
      <tr data-codigo="${codigo}">
        <td data-label="Código" class="td-code" title="${codigo}">
          <span class="mono">${codigo}</span>
        </td>
        <td data-label="Nombre" class="td-text" title="${nombre}">
          <div class="truncate">${nombre}</div>
        </td>
        <td data-label="Descripción" class="td-text" title="${descripcion}">
          <div class="truncate-2">${descripcion}</div>
        </td>
        <td data-label="Stock" id="stock-${codigo}" class="td-stock">
          ${stockBadge(stock)}
        </td>
        <td data-label="Acciones" class="acciones">
          <button class="btn-icon" title="Sumar stock" onclick="abrirModalStock('${codigo}', 'sumar')">➕</button>
          <button class="btn-icon" title="Restar stock" onclick="abrirModalStock('${codigo}', 'restar')">➖</button>
          <button class="btn-icon btn-danger" title="Eliminar" onclick="abrirModalEliminar('${codigo}')">🗑️</button>
        </td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  contenedor.innerHTML = html;
}

// =========================
// Carga inicial desde API
// =========================
async function cargarProductos() {
  const contenedor = document.getElementById("tablaInventario");
  try {
    const res = await fetch(`${API}/`);
    if (!res.ok) throw new Error("No se pudo obtener productos");
    PRODUCTOS = await res.json();
    renderTablaProductos(PRODUCTOS);
  } catch (e) {
    if (contenedor) {
      contenedor.innerHTML = `
        <div class="empty-state">
          <span>⚠️</span>
          <p>No se pudo cargar el inventario.<br><small>${e.message}</small></p>
        </div>`;
    }
    console.error(e);
  }
}

// =========================
// Filtro (tu input ya tiene oninput="cargarInventario()")
// =========================
function cargarInventario() {
  const q = (document.getElementById("filtroTabla")?.value || "").trim().toLowerCase();
  const filtrados = PRODUCTOS.filter(p =>
    (p.codigo_barra || "").toLowerCase().includes(q) ||
    (p.nombre || "").toLowerCase().includes(q) ||
    (p.descripcion || "").toLowerCase().includes(q)
  );
  renderTablaProductos(filtrados);
}

// =========================
// Boot
// =========================
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();

  // Si prefieres sin oninput en HTML, descomenta esto:
  // const filtro = document.getElementById("filtroTabla");
  // if (filtro) filtro.addEventListener("input", cargarInventario);
});

// =========================
// Se asume que ya existen:
// - function abrirModalStock(codigo, operacion) { ... }
// - function abrirModalEliminar(codigo) { ... }
// =========================
