import { db } from "./firebase-loader.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Usuario activo
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuario || !usuario.id) {
    window.location.href = "../index.html";
    return;
  }

  // 2. Intentar obtener el id de la última orden desde localStorage
  let orderId = null;
  const ultimaOrdenJSON = localStorage.getItem("ultimaOrden");

  if (ultimaOrdenJSON) {
    try {
      const ultimaOrden = JSON.parse(ultimaOrdenJSON);
      if (ultimaOrden && ultimaOrden.id) {
        orderId = ultimaOrden.id;
      }
    } catch (e) {
      console.warn("Error parseando ultimaOrden en localStorage:", e);
    }
  }

  let orden = null;

  try {
    // 3A. Si tenemos orderId, leer esa orden puntual desde Firebase
    if (orderId) {
      const ordenRef = ref(db, `usuarios/${usuario.id}/ordenes/${orderId}`);
      const snap = await get(ordenRef);
      if (snap.exists()) {
        orden = snap.val();
      } else {
        console.warn("La orden indicada por ultimaOrden no existe en Firebase");
      }
    }

    // 3B. Si no hay orderId válido o no se encontró, tomar la última orden del usuario
    if (!orden) {
      const ordenesRef = ref(db, `usuarios/${usuario.id}/ordenes`);
      const snapOrdenes = await get(ordenesRef);

      if (snapOrdenes.exists()) {
        const ordenesObj = snapOrdenes.val(); // { ORD-...: {...}, ORD-...: {...} }

        let ultima = null;

        Object.values(ordenesObj).forEach((o) => {
          // Comparamos por fecha (ISO) si está, si no, dejamos la primera
          if (!ultima) {
            ultima = o;
          } else {
            const f1 = new Date(ultima.fecha || ultima.fecha_formateada || 0);
            const f2 = new Date(o.fecha || o.fecha_formateada || 0);
            if (f2 > f1) {
              ultima = o;
            }
          }
        });

        orden = ultima;
      }
    }
  } catch (error) {
    console.error("Error leyendo orden/es desde Firebase:", error);
  }

  // 4. Si aún no tenemos orden, redirigir
  if (!orden) {
    console.warn("No se encontró ninguna orden para mostrar en el resumen");
    window.location.href = "inicio.html";
    return;
  }

  // 5. Rellenar textos de la parte izquierda
  const tituloH1 = document.getElementById("resumenTitulo");
  const numeroSpan = document.getElementById("resumenNumeroOrden");
  const fechaSpan = document.getElementById("resumenFecha");
  const sucursalSpan = document.getElementById("resumenSucursal");
  const totalTextoSpan = document.getElementById("resumenTotalTexto");

  if (tituloH1) {
    const nombre = usuario.nombre || "tu compra";
    tituloH1.textContent = `¡Gracias por tu compra, ${nombre}!`;
  }

  const referenciaMostrar = orden.referencia || orden.id || "-----";
  if (numeroSpan) {
    numeroSpan.textContent = " #" + referenciaMostrar;
  }

  if (fechaSpan) {
    if (orden.fecha_formateada) {
      fechaSpan.textContent = orden.fecha_formateada;
    } else if (orden.fecha) {
      const f = new Date(orden.fecha);
      fechaSpan.textContent = f.toLocaleString("es-SV", {
        dateStyle: "long",
        timeStyle: "short",
      });
    } else {
      fechaSpan.textContent = "--";
    }
  }

  if (sucursalSpan) {
    if (orden.sucursal && orden.sucursal.titulo) {
      sucursalSpan.textContent = orden.sucursal.titulo;
    } else {
      sucursalSpan.textContent = "Sucursal no disponible";
    }
  }

  const totalNum = Number(orden.total) || 0;
  const totalFormateado = `$${totalNum.toFixed(2)}`;
  if (totalTextoSpan) totalTextoSpan.textContent = totalFormateado;

  // 6. Rellenar la tabla de productos (comprobante)
  const tbody = document.getElementById("resumenOrderItems");
  const totalTablaSpan = document.getElementById("resumenTotalTabla");

  if (tbody) {
    tbody.innerHTML = "";

    if (Array.isArray(orden.items)) {
      orden.items.forEach((item) => {
        const tr = document.createElement("tr");
        tr.className = "border-b border-[#E2CBB7]";

        const cantidad = Number(item.cantidad) || 0;
        const precio = Number(item.precio) || 0;
        const subtotal =
          typeof item.subtotal === "number"
            ? item.subtotal
            : precio * cantidad;

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

        tbody.appendChild(tr);
      });
    } else {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="py-2 px-4 border-r border-[#E2CBB7]" colspan="3">
          No se encontraron productos en la orden.
        </td>
      `;
      tbody.appendChild(tr);
    }
  }

  if (totalTablaSpan) {
    totalTablaSpan.textContent = totalFormateado;
  }
});
