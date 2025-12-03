import { db } from "./firebase-loader.js";
import {
  ref,
  get,
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

window.closeDetailModal = function() {
  document.getElementById("detailModalOverlay").classList.add("hidden");
};

// MODAL DEL CARRITO
window.openModal = async function () {
  try {
    const res = await fetch("../pages/modal-carrito.html");
    const html = await res.text();

    document.getElementById("modalContent").innerHTML = html;
    document.getElementById("modalOverlay").classList.remove("hidden");

  } catch (error) {
    console.error("Error al cargar el modal del carrito:", error);
  }
};

window.closeModal = function () {
  document.getElementById("modalOverlay").classList.add("hidden");
  document.getElementById("modalContent").innerHTML = "";
};

window.openMenu = function () {
  document.getElementById("menuOverlay").classList.remove("hidden");
  document.getElementById("sideMenu").classList.remove("-translate-x-full");
}

window.closeMenu = function () {
  document.getElementById("menuOverlay").classList.add("hidden");
  document.getElementById("sideMenu").classList.add("-translate-x-full");
}

window.handleSearch = function (event) {
  if (event.key === "Enter") {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();

    if (query.length === 0) return;

    // Redirigir a la página de resultados con el parámetro
    window.location.href = `../pages/search.html?query=${encodeURIComponent(query)}`;
  }
}
