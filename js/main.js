import { db } from "./firebase-loader.js";
import {
  ref,
  get,
  set,
  remove,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

async function cargarLibros() {
  const contenedor = document.getElementById("productosContainer");
  contenedor.innerHTML = "<p class='text-gray-600'>Cargando libros...</p>";

  try {
    const librosRef = ref(db, "libros");
    const snapshot = await get(librosRef);

    if (!snapshot.exists()) {
      contenedor.innerHTML =
        "<p class='text-red-500'>No se encontraron libros.</p>";
      return;
    }

    const libros = snapshot.val();
    contenedor.innerHTML = ""; // limpiar

    Object.keys(libros).forEach((id) => {
      const libro = libros[id];

      const cardHTML = `
        <div class="bg-white border rounded-xl shadow p-4 w-64 flex flex-col items-center">

          <img src="${
            libro.imagen_url
          }" class="w-44 h-64 object-cover rounded" />

          <p class="text-center font-semibold mt-3">${libro.titulo}</p>

          <p class="text-sm text-gray-600">Autor: ${libro.autor}</p>

          <p class="font-bold mt-2">$${libro.precio.toFixed(2)}</p>

          <button
            class="mt-4 bg-green-700 text-white px-6 py-2 rounded-lg shadow hover:bg-green-800"
            onclick="openDetailModal('${id}')"
          >
            Detalles
          </button>

          <i class="fa-regular fa-heart text-xl mt-3 text-gray-700"></i>
        </div>
      `;

      contenedor.innerHTML += cardHTML;
    });
  } catch (error) {
    console.error("Error cargando libros:", error);
    contenedor.innerHTML =
      "<p class='text-red-500'>Error al cargar libros.</p>";
  }
}

// Ejecutar cuando cargue la página
window.onload = cargarLibros;

// ----------------- MODAL DEL CARRITO -----------------
async function openModal() {
  const res = await fetch("../pages/modal-carrito.html");
  const html = await res.text();

  document.getElementById("modalContent").innerHTML = html;
  document.getElementById("modalOverlay").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
  document.getElementById("modalContent").innerHTML = "";
}

window.openDetailModal = async function (idLibro) {
  const overlay = document.getElementById("detailModalOverlay");
  const content = document.getElementById("detailModalContent");

  // Limpiar contenido previo
  content.innerHTML = `
    <div class="text-white">Cargando...</div>
  `;
  overlay.classList.remove("hidden");

  // Buscar el libro en la base de datps (osea Firbase)
  try {
    const libroRef = ref(db, "libros/" + idLibro);
    const snapshot = await get(libroRef);

    if (!snapshot.exists()) {
      content.innerHTML = `<p class="text-red-500">No se encontró el libro</p>`;
      return;
    }

    const libro = snapshot.val();
    content.innerHTML = `
      <div class="bg-white w-[85%] max-w-md rounded-xl shadow-xl p-6 relative">

        <button
          class="absolute top-3 right-3 text-2xl text-gray-500 hover:text-black"
          onclick="closeDetailModal()"
        >
          &times;
        </button>

        <div class="flex flex-col items-center text-center">

          <img
            src="${libro.imagen_url}"
            class="w-48 h-64 object-cover rounded shadow mb-4"
            alt="Imagen del libro"
          />

          <h2 class="text-xl font-semibold mb-1">${libro.titulo}</h2>

          <p class="text-sm text-gray-600 mb-4">Autor: ${libro.autor}</p>

          <p class="text-gray-700 text-sm px-3 leading-relaxed mb-4">
            ${libro.descripcion}
          </p>

          <p class="font-bold text-lg mb-4">$${libro.precio.toFixed(2)}</p>

          <div class="flex justify-between w-full px-4 mt-4">

            <button
              class="border border-orange-400 text-orange-700 px-6 py-2 rounded-lg font-semibold hover:bg-orange-100"
              onclick="closeDetailModal()"
            >
              Cerrar
            </button>

            <button
              class="bg-green-700 text-white px-6 py-2 rounded-lg shadow hover:bg-green-800"
              onclick="agregarAlCarrito('${idLibro}')"
            >
              Agregar
            </button>

          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error cargando el libro:", error);
    content.innerHTML = `<p class="text-red-500">Error al cargar detalle.</p>`;
  }
};

window.closeDetailModal = function () {
  document.getElementById("detailModalOverlay").classList.add("hidden");
};

// MODAL DEL CARRITO
window.openModal = async function () {
  // 1. Obtener la modal y cargar el HTML dentro
  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalContent");

  const res = await fetch("../pages/modal-carrito.html");
  const html = await res.text();

  // Insertar HTML de la modal
  content.innerHTML = html;

  // Mostrar modal
  overlay.classList.remove("hidden");

  // 2. Obtener usuario activo
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));

  if (!usuario) {
    console.warn("No hay usuario activo");
    return;
  }

  // 3. Esperar a que el HTML se renderice
  setTimeout(async () => {
    // Ahora SÍ existen cartBody y cartTotal
    const cartBody = document.getElementById("cartBody");
    const cartTotal = document.getElementById("cartTotal");

    const cartRef = ref(db, `usuarios/${usuario.id}/carrito`);
    const snapshot = await get(cartRef);

    cartBody.innerHTML = "";
    let total = 0;

    if (!snapshot.exists()) {
      cartBody.innerHTML = `
        <tr>
          <td colspan="4" class="py-4 text-center text-gray-500">
            No hay productos en el carrito.
          </td>
        </tr>`;
      cartTotal.textContent = "$0.00";
      return;
    }

    const carrito = snapshot.val();

    Object.entries(carrito).forEach(([key, item]) => {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;

      cartBody.innerHTML += `
    <tr class="border-t border-orange-200">
      <td class="py-3 px-4 flex items-center justify-between">
        ${item.titulo}
      </td>
      <td class="py-3 px-4">$${item.precio.toFixed(2)}</td>
      <td class="py-3 px-4">${item.cantidad}</td>
      <td class="py-3 px-4">$${subtotal.toFixed(2)}</td>
    </tr>
  `;
    });

    cartTotal.textContent = `$${total.toFixed(2)}`;
  }, 50);
};

// Eliminar productos del carrito
window.eliminarItem = async function (itemId) {
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuario) return;

  const itemRef = ref(db, `usuarios/${usuario.id}/carrito/${itemId}`);

  await remove(itemRef);

  Swal.fire({
    icon: "success",
    title: "Eliminado",
    text: "El producto fue eliminado del carrito.",
    confirmButtonColor: "#556B5A",
  });

  // Recargar modal
  openModal();
};

// uncion para vaciar el carrito
window.vaciarCarrito = async function () {
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuario) return;

  const cartRef = ref(db, `usuarios/${usuario.id}/carrito`);

  await remove(cartRef);

  Swal.fire({
    icon: "success",
    title: "Carrito vacío",
    text: "Todos los productos han sido eliminados.",
    confirmButtonColor: "#556B5A",
  });

  openModal(); // recargar modal vacía
};

window.closeModal = function () {
  document.getElementById("modalOverlay").classList.add("hidden");
  document.getElementById("modalContent").innerHTML = "";
};

window.openMenu = function () {
  document.getElementById("menuOverlay").classList.remove("hidden");
  document.getElementById("sideMenu").classList.remove("-translate-x-full");
};

window.closeMenu = function () {
  document.getElementById("menuOverlay").classList.add("hidden");
  document.getElementById("sideMenu").classList.add("-translate-x-full");
};

window.handleSearch = function (event) {
  if (event.key === "Enter") {
    const query = document
      .getElementById("searchInput")
      .value.trim()
      .toLowerCase();

    if (query.length === 0) return;

    // Redirigir a la página de resultados con el parámetro
    window.location.href = `../pages/search.html?query=${encodeURIComponent(
      query
    )}`;
  }
};

window.agregarAlCarrito = async function (idLibro) {
  // obtener usuario activo
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuario || !usuario.id) {
    Swal.fire({
      icon: "warning",
      title: "Debes iniciar sesión",
      text: "Para agregar productos al carrito debes iniciar sesión.",
    });
    return;
  }

  try {
    // Obtener datos del libro
    const libroRef = ref(db, "libros/" + idLibro);
    const snap = await get(libroRef);

    if (!snap.exists()) {
      Swal.fire("Error", "El libro no existe.", "error");
      return;
    }

    const libro = snap.val();

    // Ruta del carrito del usuario
    const itemCarritoRef = ref(db, `usuarios/${usuario.id}/carrito/${idLibro}`);

    // Ver si ya existe ese libro en el carrito
    const existenteSnap = await get(itemCarritoRef);

    let nuevoItem = {
      titulo: libro.titulo,
      precio: libro.precio,
      cantidad: 1,
      imagen_url: libro.imagen_url,
      autor: libro.autor,
      categoria: libro.categoria,
    };

    // Si ya existe, aumenta la cantidad
    if (existenteSnap.exists()) {
      const actual = existenteSnap.val();
      nuevoItem.cantidad = actual.cantidad + 1;
    }

    // Guardar en Firebase
    await set(itemCarritoRef, nuevoItem);

    Swal.fire({
      icon: "success",
      title: "Agregado al carrito",
      text: `${libro.titulo} fue agregado.`,
      confirmButtonColor: "#556B5A",
    });
  } catch (error) {
    console.error("Error agregando al carrito:", error);
    Swal.fire("Error", "No se pudo agregar al carrito.", "error");
  }
};

// ------ Cargar información del usuario activo ------
function cargarUsuarioNavbar() {
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));

  // Si no hay usuario logueado mostramos "Invitado"
  if (!usuario) {
    document.getElementById("userName").textContent = "Invitado";
    document.getElementById("sideUserName").textContent = "Invitado";
    return;
  }

  // Mostrar el nombre del usuario logueado
  document.getElementById("userName").textContent = usuario.nombre;
  document.getElementById("sideUserName").textContent = usuario.nombre;
}

// Ejecutar al cargar la página
cargarUsuarioNavbar();
