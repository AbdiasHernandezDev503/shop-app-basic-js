import { db } from "../js/firebase-loader.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Leer parámetros de búsqueda
const params = new URLSearchParams(window.location.search);
const queryTexto = params.get("query")?.toLowerCase() || "";
const queryCategoria = params.get("categoria")?.toLowerCase() || "";

// Elementos HTML
const title = document.getElementById("resultsTitle");
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

    const libros = Object.entries(snapshot.val()).map(([id, libro]) => ({
      id,
      ...libro,
    }));

    let resultados = [];

    // --- 1. Búsqueda por categoría ---
    if (queryCategoria) {
      title.textContent = `Categoría: ${queryCategoria}`;
      resultados = libros.filter(
        (l) => l.categoria?.toLowerCase() === queryCategoria
      );
    }

    // --- 2. Búsqueda por texto ---
    else if (queryTexto) {
      title.textContent = `Resultados para “${queryTexto}”`;
      resultados = libros.filter(
        (l) =>
          l.titulo.toLowerCase().includes(queryTexto) ||
          l.autor.toLowerCase().includes(queryTexto) ||
          l.categoria.toLowerCase().includes(queryTexto)
      );
    }

    // Renderizar
    renderResultados(resultados);

  } catch (error) {
    console.error("Error cargando resultados:", error);
    grid.innerHTML = "<p class='text-red-500'>Error al cargar resultados.</p>";
  }
}

function renderResultados(resultados) {
  resultCount.textContent = `Mostrando ${resultados.length} resultado(s)`;
  grid.innerHTML = "";

  if (resultados.length === 0) {
    grid.innerHTML = `
      <p class="text-red-600 font-semibold mt-6">
        No se encontraron coincidencias.
      </p>`;
    return;
  }

  resultados.forEach((libro) => {
    grid.innerHTML += `
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
  });
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
          <img src="${libro.imagen_url}" class="w-48 h-64 object-cover rounded shadow mb-4"/>

          <h2 class="text-xl font-semibold mb-1">${libro.titulo}</h2>
          <p class="text-sm text-gray-600 mb-4">Autor: ${libro.autor}</p>

          <p class="text-gray-700 text-sm px-3 leading-relaxed mb-4">
            ${libro.descripcion}
          </p>

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

// Iniciar carga
cargarResultados();
