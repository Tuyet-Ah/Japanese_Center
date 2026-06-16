document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  const adminHome = document.querySelector("[data-admin-home]");
  const studentHome = document.querySelector("[data-student-home]");
  const homeCtaNodes = document.querySelectorAll("[data-home-cta]");
  const user = getLoginUser();
  const tokens = getAuthTokens();
  const isAdmin = Boolean(user && user.role === "admin" && tokens && tokens.access);
  const isAuthenticated = Boolean(user && tokens && tokens.access);

  if (adminHome) adminHome.hidden = !isAdmin;
  if (studentHome) studentHome.hidden = isAdmin;
  homeCtaNodes.forEach(el => { el.hidden = isAuthenticated; });

  // ── Fetch thống kê thực từ DB ──
  loadSiteStats();

  // ── Carousel ──
  const track = document.getElementById("carouselTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (!track || !prevBtn || !nextBtn) return;

  const itemWidth = 320;
  let currentIndex = 0;

  const getMaxIndex = () => {
    const maxScroll = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
    return Math.ceil(maxScroll / itemWidth);
  };

  const updateCarousel = () => {
    const maxScroll = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
    let offset = currentIndex * itemWidth;
    if (offset > maxScroll) offset = maxScroll;
    track.style.transform = `translateX(-${offset}px)`;
  };

  prevBtn.addEventListener("click", () => {
    const maxIndex = getMaxIndex();
    currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
    updateCarousel();
  });

  nextBtn.addEventListener("click", () => {
    const maxIndex = getMaxIndex();
    currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    updateCarousel();
  });

  window.addEventListener("resize", () => {
    const maxIndex = getMaxIndex();
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    updateCarousel();
  });
});

// ── Helper: format số thêm dấu chấm ngăn cách hàng nghìn + "+" ──
function formatStatNumber(n) {
  if (n === null || n === undefined) return "—";
  if (n >= 1000) {
    return new Intl.NumberFormat("vi-VN").format(n) + "+";
  }
  return String(n) + (n > 0 ? "+" : "");
}

async function loadSiteStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/site-stats/`);
    if (!res.ok) return;
    const data = await res.json();

    // Map: data key → giá trị hiển thị
    const display = {
      total_courses: formatStatNumber(data.total_courses),
      total_students: formatStatNumber(data.total_students),
      paid_students: formatStatNumber(data.paid_students),
      avg_rating: data.avg_rating || "—",
    };

    // Cập nhật tất cả element có data-stat
    document.querySelectorAll("[data-stat]").forEach(el => {
      const key = el.getAttribute("data-stat");
      if (display[key] !== undefined) {
        el.textContent = display[key];
      }
    });

  } catch {
    // Giữ nguyên giá trị fallback nếu fetch thất bại
  }
}