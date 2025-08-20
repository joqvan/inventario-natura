document.addEventListener('DOMContentLoaded', () => {
  // Stock Modal
  const modalStock = document.getElementById('modalStock');
  const inputStock = document.getElementById('inputCantidadStock');
  let codigoStock = "";
  let operacion = "";

  window.abrirModalStock = (codigo, tipo) => {
    modalStock.classList.remove('oculto');
    codigoStock = codigo;
    operacion = tipo;
    document.getElementById('stockProductoInfo').textContent = `Producto: ${codigo}`;
    inputStock.value = '';
  };

  document.getElementById('confirmarStock').onclick = async () => {
  const cantidad = parseInt(inputStock.value);
  const msg = document.getElementById("mensajeStock");

  if (!cantidad || cantidad <= 0) {
    msg.textContent = "⚠️ Ingresa una cantidad válida.";
    msg.className = "mensaje error";
    return;
  }

  const endpoint = operacion === "sumar" ? "sumar" : "restar";

  const res = await fetch(`http://localhost:5000/productos/${codigoStock}/${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cantidad })
  });

  const data = await res.json();

  if (res.ok) {
    const celda = document.getElementById(`stock-${codigoStock}`);
    if (celda) celda.innerHTML = stockBadge(data.nuevo_stock);
    modalStock.classList.add('oculto');
    msg.textContent = `✅ Stock ${operacion === 'sumar' ? 'aumentado' : 'reducido'} correctamente`;
    msg.className = "mensaje exito";
  } else {
    msg.textContent = `❌ ${data.error}`;
    msg.className = "mensaje error";
  }

  setTimeout(() => {
    msg.textContent = "";
    msg.className = "mensaje";
  }, 4000);
};

  document.getElementById('cancelarStock').onclick = () => {
    modalStock.classList.add('oculto');
  };

  // Eliminar Modal
  const modalEliminar = document.getElementById('modalEliminar');
  let codigoEliminar = "";

  window.abrirModalEliminar = (codigo) => {
    codigoEliminar = codigo;
    modalEliminar.classList.remove('oculto');
  };

  document.getElementById('confirmarEliminar').onclick = async () => {
  const res = await fetch(`http://localhost:5000/productos/${codigoEliminar}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    const fila = document.querySelector(`tr[data-codigo="${codigoEliminar}"]`);
    if (fila) fila.remove();  // evita error si no se encuentra
    modalEliminar.classList.add('oculto');
  } else {
    alert("❌ No se pudo eliminar");
  }

  const msg = document.getElementById("mensajeEliminar");
msg.textContent = "✅ Producto eliminado correctamente";
msg.className = "mensaje exito";

setTimeout(() => {
  msg.textContent = "";
  msg.className = "mensaje";
}, 4000);

};

  document.getElementById('cancelarEliminar').onclick = () => {
    modalEliminar.classList.add('oculto');
  };
});

// helper para pintar el badge de stock
function stockBadge(n) {
  n = Number(n) || 0;
  const nivel = n <= 0 ? 'danger' : (n < 10 ? 'warning' : 'success');
  return `<span class="badge badge-${nivel}">${n}</span>`;
}

