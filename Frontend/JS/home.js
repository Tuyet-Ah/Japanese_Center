document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  const track = document.getElementById("carouselTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (!track || !prevBtn || !nextBtn) return;

  const items = track.querySelectorAll(".carousel-item");
  const itemWidth = 340;
  let currentIndex = 0;

  const updateCarousel = () => {
    track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
  };

  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    updateCarousel();
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % items.length;
    updateCarousel();
  });
});