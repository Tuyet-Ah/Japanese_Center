document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  const track = document.getElementById("carouselTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (!track || !prevBtn || !nextBtn) return;

  let items = Array.from(track.querySelectorAll(".carousel-item"));
  const itemWidth = 340;
  let currentIndex = 0;

  const updateCarousel = () => {
    if (!items.length) return;
    track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
  };

  const refreshItems = () => {
    items = Array.from(track.querySelectorAll(".carousel-item"));
    currentIndex = 0;
    updateCarousel();
  };

  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    updateCarousel();
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % items.length;
    updateCarousel();
  });

  if (typeof fetchCourseList === "function") {
    fetchCourseList()
      .then((data) => {
        const courses = data.map(normalizeCourseDetail).slice(0, 6);
        if (!courses.length) return;

        track.innerHTML = courses
          .map((course) => {
            const thumbStyle = course.thumbnail
              ? `style="background-image: url('${course.thumbnail}'); background-size: cover; background-position: center;"`
              : `style="background: linear-gradient(135deg, #0f766e, #1d9e96);"`;

            return `
              <div class="carousel-item">
                <div class="carousel-item-img" ${thumbStyle}></div>
                <p>${course.title}</p>
              </div>
            `;
          })
          .join("");

        refreshItems();
      })
      .catch(() => {
        refreshItems();
      });
  }
});