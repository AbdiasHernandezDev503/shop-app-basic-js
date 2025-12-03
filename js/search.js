import { db } from "../js/firebase-loader.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const query = params.get("query")?.toLowerCase() || "";

document.getElementById(
  "resultsTitle"
).textContent = `Resultados para “${query}”`;

const resultCount = document.getElementById("resultCount");
const grid = document.getElementById("resultGrid");

async function cargarResultados() {
  try {
    const librosRef = ref(db, "libros");
    const snapshot = await get(librosRef);

    if (!snapshot.exists()) {
      grid.innerHTML = "<p>No hay libros disponibles.</p>";
      return;
    }

    const libros = snapshot.val();

    // FILTRAR LIBROS POR query (titulo y autor y categoria)
    const resultados = Object.entries(libros)
      .filter(
        ([id, libro]) =>
          libro.titulo.toLowerCase().includes(query) ||
          libro.autor.toLowerCase().includes(query) ||
          libro.categoria.toLowerCase().includes(query)
      )
      .map(([id, libro]) => ({ id, ...libro }));

    // Mostrar conteo
    resultCount.textContent = `Mostrando ${resultados.length} resultado(s)`;

    // Limpiar grid
    grid.innerHTML = "";
    resultados.forEach((libro) => {
      const card = `
        <div class="bg-white border rounded-xl shadow p-4 w-64 flex flex-col items-center">

          <img src="${libro.imagen_url}"
               class="w-44 h-64 object-cover rounded" />

          <p class="text-center font-semibold mt-3">${libro.titulo}</p>
          <p class="text-sm text-gray-600">Autor: ${libro.autor}</p>

          <p class="font-bold mt-2">$${libro.precio.toFixed(2)}</p>

          <button
            class="mt-4 bg-green-700 text-white px-6 py-2 rounded-lg shadow hover:bg-green-800"
            onclick="openDetailModal('${libro.id}')"
          >
            Detalles
          </button>

        </div>
      `;

      grid.innerHTML += card;
    });

    // Si no hay resultados
    if (resultados.length === 0) {
      grid.innerHTML = `
        <p class="text-red-600 font-semibold mt-6">
          No se encontraron coincidencias.
        </p>`;
    }
  } catch (error) {
    console.error("Error cargando resultados:", error);
    grid.innerHTML = "<p class='text-red-500'>Error al cargar resultados.</p>";
  }
}

window.openDetailModal = async function (idLibro) {
  const overlay = document.getElementById("detailModalOverlay");
  const content = document.getElementById("detailModalContent");

  content.innerHTML = "<p class='text-white'>Cargando...</p>";
  overlay.classList.remove("hidden");

  try {
    const libroRef = ref(db, "libros/" + idLibro);
    const snapshot = await get(libroRef);

    if (!snapshot.exists()) {
      content.innerHTML = "<p class='text-red-500'>Libro no encontrado.</p>";
      return;
    }

    const libro = snapshot.val();

    content.innerHTML = `
      <div class="bg-white w-[85%] max-w-md rounded-xl shadow-xl p-6 relative">

        <button
          class="absolute top-3 right-3 text-2xl text-gray-500 hover:text-black"
          onclick="document.getElementById('detailModalOverlay').classList.add('hidden')"
        >
          &times;
        </button>

        <div class="flex flex-col items-center text-center">
          <img src="${
            libro.imagen_url
          }" class="w-48 h-64 object-cover rounded shadow mb-4"/>

          <h2 class="text-xl font-semibold mb-1">${libro.titulo}</h2>
          <p class="text-sm text-gray-600 mb-4">Autor: ${libro.autor}</p>

          <p class="text-gray-700 text-sm px-3 leading-relaxed mb-4">${
            libro.descripcion
          }</p>

          <p class="font-bold text-lg mb-4">$${libro.precio.toFixed(2)}</p>

          <button class="bg-green-700 text-white px-6 py-2 rounded-lg shadow hover:bg-green-800">
            Agregar al carrito
          </button>
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = "<p>Error al cargar detalles.</p>";
  }
};

// Ejecutar
cargarResultados();
