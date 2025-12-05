import { db } from "./firebase-loader.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Usuario activo
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuario || !usuario.id) {
    // Si no hay sesión, mandamos al inicio / login
    window.location.href = "../index.html";
    return;
  }

  const listaOrdenesEl = document.getElementById("listaOrdenes");
  const sinOrdenesEl = document.getElementById("historialSinOrdenes");
  const mensajeSinDetalleEl = document.getElementById("mensajeSinDetalle");
  const panelDetalleEl = document.getElementById("panelDetalle");
  const detalleNumeroEl = document.getElementById("detalleNumero");
  const detalleFechaEl = document.getElementById("detalleFecha");
  const detalleSucursalEl = document.getElementById("detalleSucursal");
  const detalleEstadoEl = document.getElementById("detalleEstado");
  const detalleMetodoPagoEl = document.getElementById("detalleMetodoPago");
  const detalleTotalEl = document.getElementById("detalleTotal");
  const detalleItemsBodyEl = document.getElementById("detalleItemsBody");

  let ordenes = [];

  // 2. Leer todas las órdenes del usuario desde Firebase
  try {
    const ordenesRef = ref(db, `usuarios/${usuario.id}/ordenes`);
    const snap = await get(ordenesRef);

    if (!snap.exists()) {
      // No hay órdenes
      if (sinOrdenesEl) sinOrdenesEl.classList.remove("hidden");
      return;
    }

    const ordenesObj = snap.val(); // {ORD-123: {...}, ORD-456: {...}}

    ordenes = Object.entries(ordenesObj).map(([key, value]) => {
      return {
        ...value,
        id: value.id || key,
      };
    });

    // Ordenar por fecha descendente (más reciente primero)
    ordenes.sort((a, b) => {
      const fa = new Date(a.fecha || a.fecha_formateada || 0);
      const fb = new Date(b.fecha || b.fecha_formateada || 0);
      return fb - fa;
    });

    if (ordenes.length === 0) {
      if (sinOrdenesEl) sinOrdenesEl.classList.remove("hidden");
      return;
    }

    if (sinOrdenesEl) sinOrdenesEl.classList.add("hidden");

    // 3. Renderizar listado de órdenes
    renderListaOrdenes(ordenes);

    // 4. Seleccionar la primera orden por defecto
    if (ordenes[0]) {
      seleccionarOrden(ordenes[0].id);
    }
  } catch (error) {
    console.error("Error cargando historial de compras:", error);
    if (sinOrdenesEl) {
      sinOrdenesEl.textContent =
        "Ocurrió un error al cargar el historial. Intenta nuevamente.";
      sinOrdenesEl.classList.remove("hidden");
    }
  }

  function renderListaOrdenes(lista) {
    if (!listaOrdenesEl) return;
    listaOrdenesEl.innerHTML = "";

    lista.forEach((orden) => {
      const referencia = orden.referencia || orden.id || "-----";
      const fecha = getFechaCorta(orden);
      const totalNum = Number(orden.total) || 0;
      const totalTexto = `$${totalNum.toFixed(2)}`;

      const card = document.createElement("button");
      card.type = "button";
      card.dataset.orderId = orden.id;
      card.className =
        "w-full text-left border border-transparent rounded-lg px-3 py-2 bg-[#F7F1EA] hover:border-[#C5573E] flex flex-col gap-1";

      card.innerHTML = `
        <div class="flex items-center justify-between gap-3">
          <span class="text-sm font-semibold text-[#3D3D3D]">
            Pedido #${referencia}
          </span>
          <span class="text-sm font-bold text-[#7B3A24]">
            ${totalTexto}
          </span>
        </div>
        <div class="flex items-center justify-between gap-3 text-xs text-[#6C6C6C]">
          <span>${fecha}</span>
          <span>${orden.estado || "PAGADO"}</span>
        </div>
      `;

      card.addEventListener("click", () => {
        seleccionarOrden(orden.id);
      });

      listaOrdenesEl.appendChild(card);
    });
  }

  function getFechaCorta(orden) {
    if (orden.fecha_formateada) {
      // si ya tienes fecha formateada, la usamos tal cual
      return orden.fecha_formateada;
    }

    if (orden.fecha) {
      const f = new Date(orden.fecha);
      return f.toLocaleString("es-SV", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }

    return "--";
  }

  function seleccionarOrden(orderId) {
    const orden = ordenes.find((o) => o.id === orderId);
    if (!orden) return;

    // Quitar selección anterior
    document.querySelectorAll("[data-order-id]").forEach((el) => {
      el.classList.remove("border-[#C5573E]");
      el.classList.add("border-transparent");
    });

    // Marcar card activa
    const cardActiva = document.querySelector(
      `[data-order-id="${orderId}"]`
    );
    if (cardActiva) {
      cardActiva.classList.remove("border-transparent");
      cardActiva.classList.add("border-[#C5573E]");
    }

    // Mostrar panel de detalle
    if (mensajeSinDetalleEl) mensajeSinDetalleEl.classList.add("hidden");
    if (panelDetalleEl) panelDetalleEl.classList.remove("hidden");

    // Rellenar info general
    const referenciaMostrar = orden.referencia || orden.id || "-----";
    if (detalleNumeroEl) detalleNumeroEl.textContent = `#${referenciaMostrar}`;

    if (detalleFechaEl) {
      detalleFechaEl.textContent = getFechaCorta(orden);
    }

    if (detalleSucursalEl) {
      if (orden.sucursal && orden.sucursal.titulo) {
        detalleSucursalEl.textContent = orden.sucursal.titulo;
      } else {
        detalleSucursalEl.textContent = "Sucursal no disponible";
      }
    }

    if (detalleEstadoEl) {
      detalleEstadoEl.textContent = orden.estado || "PAGADO";
    }

    if (detalleMetodoPagoEl) {
      detalleMetodoPagoEl.textContent = orden.metodoPago || "Tarjeta";
    }

    const totalNum = Number(orden.total) || 0;
    const totalFormateado = `$${totalNum.toFixed(2)}`;
    if (detalleTotalEl) {
      detalleTotalEl.textContent = totalFormateado;
    }

    // Rellenar tabla de productos
    if (detalleItemsBodyEl) {
      detalleItemsBodyEl.innerHTML = "";

      if (Array.isArray(orden.items) && orden.items.length > 0) {
        orden.items.forEach((item) => {
          const cantidad = Number(item.cantidad) || 0;
          const precio = Number(item.precio) || 0;
          const subtotal =
            typeof item.subtotal === "number"
              ? item.subtotal
              : precio * cantidad;

          const tr = document.createElement("tr");
          tr.className = "border-b border-[#E2CBB7]";

          tr.innerHTML = `
            <td class="py-2 px-4 border-r border-[#E2CBB7]">
              ${item.titulo}
            </td>
            <td class="py-2 px-4 text-center border-r border-[#E2CBB7]">
              ${cantidad}
            </td>
            <td class="py-2 px-4 text-right">
              $${subtotal.toFixed(2)}
            </td>
          `;

          detalleItemsBodyEl.appendChild(tr);
        });
      } else {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="py-2 px-4 border-r border-[#E2CBB7]" colspan="3">
            No se encontraron productos en esta orden.
          </td>
        `;
        detalleItemsBodyEl.appendChild(tr);
      }
    }
  }
});
