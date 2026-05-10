document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();
  renderCourses();

  const modal = document.querySelector("[data-course-modal]");
  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeCourseDetail();
      }
    });
  }

  document.querySelector("[data-close-course-modal]")?.addEventListener("click", () => {
    closeCourseDetail();
  });
});