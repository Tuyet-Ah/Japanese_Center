document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  const adminHome = document.querySelector("[data-admin-home]");
  const studentHome = document.querySelector("[data-student-home]");
  const homeCta = document.querySelector("[data-home-cta]");
  const homeCtaLink = document.querySelector("[data-home-cta-link]");
  const homeHeroLink = document.querySelector("[data-home-hero-link]");
  const user = getLoginUser();
  const tokens = getAuthTokens();
  const isAdmin = Boolean(user && user.role === "admin" && tokens && tokens.access);
  const isAuthenticated = Boolean(user && tokens && tokens.access);

  if (adminHome) adminHome.hidden = !isAdmin;
  if (studentHome) studentHome.hidden = isAdmin;
  if (homeCta) homeCta.hidden = false;
  if (homeCtaLink) {
    if (isAuthenticated) {
      homeCtaLink.href = "exams.html";
      homeCtaLink.textContent = "Đề thi";
    } else {
      homeCtaLink.href = "register.html";
      homeCtaLink.textContent = "Đăng ký miễn phí";
    }
  }

  if (homeHeroLink) {
    if (isAuthenticated) {
      homeHeroLink.href = "exams.html";
      homeHeroLink.textContent = "Đề thi";
    } else {
      homeHeroLink.href = "register.html";
      homeHeroLink.textContent = "Đăng ký miễn phí";
    }
  }

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