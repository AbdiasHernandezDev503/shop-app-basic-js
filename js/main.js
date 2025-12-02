// ----------------- MODAL DEL CARRITO -----------------
async function openModal() {
  const res = await fetch("../views/modal-carrito.html");
  const html = await res.text();

  document.getElementById("modalContent").innerHTML = html;
  document.getElementById("modalOverlay").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
  document.getElementById("modalContent").innerHTML = "";
}


// ----------------- MODAL DE DETALLES -----------------
async function openDetailModal() {
  const res = await fetch("../pages/detail-modal.html");
  const html = await res.text();

  document.getElementById("detailModalContent").innerHTML = html;
  document
    .getElementById("detailModalOverlay")
    .classList.remove("hidden");
}

function closeDetailModal() {
  document
    .getElementById("detailModalOverlay")
    .classList.add("hidden");
  document.getElementById("detailModalContent").innerHTML = "";
}

function openMenu() {
  document.getElementById("menuOverlay").classList.remove("hidden");
  document.getElementById("sideMenu").classList.remove("-translate-x-full");
}

function closeMenu() {
  document.getElementById("menuOverlay").classList.add("hidden");
  document.getElementById("sideMenu").classList.add("-translate-x-full");
}

function handleSearch(event) {
  if (event.key === "Enter") {
    const query = document.getElementById("searchInput").value.trim();

    if (query.length > 0) {
      // Redirigir a la página de resultados
      window.location.href = `../pages/search.html?query=${encodeURIComponent(query)}`;
    }
  }
}


