document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  const adminHome = document.querySelector("[data-admin-home]");
  const studentHome = document.querySelector("[data-student-home]");
  const user = getLoginUser();
  const isAdmin = user && user.role === "admin";

  if (adminHome) adminHome.hidden = !isAdmin;
  if (studentHome) studentHome.hidden = isAdmin;

  const track = document.getElementById("carouselTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (!track || !prevBtn || !nextBtn) return;

  const itemWidth = 320; // 300px width + 20px gap
  let currentIndex = 0;

  const getMaxIndex = () => {
    const maxScroll = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
    return Math.ceil(maxScroll / itemWidth);
  };

  const updateCarousel = () => {
    const maxScroll = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
    let offset = currentIndex * itemWidth;
    if (offset > maxScroll) {
      offset = maxScroll;
    }
    track.style.transform = `translateX(-${offset}px)`;
  };

  const refreshItems = () => {
    items = Array.from(track.querySelectorAll(".carousel-item"));
    currentIndex = 0;
    updateCarousel();
  };

  prevBtn.addEventListener("click", () => {
    const maxIndex = getMaxIndex();
    if (currentIndex <= 0) {
      currentIndex = maxIndex;
    } else {
      currentIndex--;
    }
    updateCarousel();
  });

  nextBtn.addEventListener("click", () => {
    const maxIndex = getMaxIndex();
    if (currentIndex >= maxIndex) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    updateCarousel();
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    const maxIndex = getMaxIndex();
    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }
    updateCarousel();
  });
});