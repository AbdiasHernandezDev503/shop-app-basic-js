import { db } from "../js/firebase-loader.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));

if (!usuario) {
  Swal.fire({
    icon: "warning",
    title: "Inicia sesión",
    text: "Debes estar autenticado para ver tus favoritos",
  }).then(() => {
    window.location.href = "./login.html";
  });
}

async function cargarFavoritos() {
  const contenedor = document.getElementById("favorites-grid");
  contenedor.innerHTML = `<p class="text-gray-700">Cargando favoritos...</p>`;

  try {
    const favRef = ref(db, `usuarios/${usuario.id}/favoritos`);
    const snapFav = await get(favRef);

    if (!snapFav.exists()) {
      contenedor.innerHTML = `
        <p class="text-gray-600 font-semibold mt-6">
          No tienes libros en favoritos ❤️
        </p>`;
      return;
    }

    const favoritos = snapFav.val();
    const idsFavoritos = Object.keys(favoritos);

    const librosRef = ref(db, "libros");
    const snapLibros = await get(librosRef);

    if (!snapLibros.exists()) {
      contenedor.innerHTML = "<p>No hay libros disponibles.</p>";
      return;
    }

    const libros = snapLibros.val();

    
    const resultados = idsFavoritos
      .map((id) => ({ id, ...libros[id] }))
      .filter((l) => l.titulo);

    document.querySelector("header p span").textContent = resultados.length;

    contenedor.innerHTML = "";

    resultados.forEach((libro) => {
      const card = `
        <article
          class="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 hover:-translate-y-2 flex flex-col"
        >
          <div class="p-4 pb-0">
            <div
              class="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center h-64"
            >
              <img
                src="${libro.imagen_url}"
                alt="${libro.titulo}"
                class="h-full w-auto object-contain"
              />
            </div>
          </div>

          <div class="p-4 flex flex-col flex-1">
            <h2 class="text-sm font-semibold mb-1 line-clamp-2">
              ${libro.titulo}
            </h2>

            <p class="text-xs text-gray-600 mb-3">
              Autor: <span class="font-medium">${libro.autor}</span>
            </p>

            <div class="mt-auto">
              <p class="font-bold text-sm mb-3">$${libro.precio.toFixed(2)}</p>

              <button
                class="w-full bg-[#355B3E] text-white text-sm py-2 rounded-full font-semibold hover:bg-[#26402B] transition"
                onclick="openDetailModal('${libro.id}')"
              >
                Detalles
              </button>
            </div>
          </div>
        </article>
      `;

      contenedor.innerHTML += card;
    });
  } catch (error) {
    console.error("Error cargando favoritos:", error);
    contenedor.innerHTML =
      "<p class='text-red-500'>Error al cargar favoritos.</p>";
  }
}

window.openDetailModal = function (idLibro) {
  console.warn("Llamando modal de detalles desde favoritos:", idLibro);
};


cargarFavoritos();
