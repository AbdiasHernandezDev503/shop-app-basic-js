document.addEventListener("DOMContentLoaded", () => {
  const bannerImg = document.getElementById("bannerSlider");
  const dots = document.querySelectorAll("[data-banner-index]");

  const banners = [
    "../images/banner.png",
    "../images/banner2.jpg",
    "../images/banner3.png",
  ];

  let currentIndex = 0;

  function renderSlide() {
    if (!bannerImg) return;
    bannerImg.src = banners[currentIndex];

    dots.forEach((dot) => {
      const idx = Number(dot.dataset.bannerIndex);
      if (idx === currentIndex) {
        dot.classList.remove("bg-gray-400");
        dot.classList.add("bg-gray-700");
      } else {
        dot.classList.remove("bg-gray-700");
        dot.classList.add("bg-gray-400");
      }
    });
  }

  function goToSlide(index) {
    const total = banners.length;
    currentIndex = ((index % total) + total) % total;
    renderSlide();
  }

  // Cambiar al hacer clic en el banner
  if (bannerImg) {
    bannerImg.addEventListener("click", () => {
      goToSlide(currentIndex + 1);
    });
  }

  // Cambiar al hacer clic en cada dot
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.dataset.bannerIndex);
      goToSlide(idx);
    });
  });

  // Inicial
  renderSlide();
});
