// Simulación temporal (luego lo conectaremmos a Firebase / JSON)
const libros = [
  {
    titulo: "EL MAGO DE OZ -TD",
    autor: "L. Frank Baum",
    precio: "$13.45",
    categoria: "Fantasía",
    imagen: "../images/libro-oz.png"
  },
  {
    titulo: "WAX & WAYNE 4",
    autor: "Brandon Sanderson",
    precio: "$26.00",
    categoria: "Fantasía",
    imagen: "../images/libro-metal.png"
  },
  {
    titulo: "UNA CORTE DE ROSAS Y ESPINAS",
    autor: "Sarah J. Maas",
    precio: "$24.95",
    categoria: "Fantasía",
    imagen: "../images/libro-rosas.png"
  }
];

const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get("query")?.toLowerCase() || "";

// Mostrar títulos
document.getElementById("resultsTitle").textContent = `Resultados para “${query}”`;

// Filtrar libros
const resultados = libros.filter(l =>
  l.titulo.toLowerCase().includes(query) ||
  l.autor.toLowerCase().includes(query) ||
  l.categoria.toLowerCase().includes(query)
);

// Contador
document.getElementById("resultCount").textContent =
  `Mostrando ${resultados.length} resultados`;

// Renderizar tarjetas
const grid = document.getElementById("resultGrid");

resultados.forEach(libro => {
  const card = `
    <div class="bg-white border rounded-xl shadow p-4 w-64 flex flex-col items-center">
      <img src="${libro.imagen}" class="w-44 h-64 object-cover rounded" />
      <p class="text-center font-semibold mt-3">${libro.titulo}</p>
      <p class="text-sm text-gray-600">Autor: ${libro.autor}</p>
      <p class="font-bold mt-2">${libro.precio}</p>
      <button class="mt-4 bg-green-700 text-white px-6 py-2 rounded-lg shadow hover:bg-green-800">
        Detalles
      </button>
    </div>
  `;
  grid.innerHTML += card;
});
