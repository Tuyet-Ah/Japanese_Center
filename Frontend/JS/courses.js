document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();
  renderCourses();
  renderMyCourses();

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

async function renderMyCourses() {
  const list = document.querySelector("[data-my-courses-list]");
  if (!list) return;

  list.innerHTML = '<div class="card"><h3>Dang tai khoa hoc cua ban...</h3></div>';

  try {
    const data = await fetchMyLearning();
    if (!data) {
      list.innerHTML = '<div class="card"><h3>Vui long dang nhap de xem khoa hoc da dang ky.</h3></div>';
      return;
    }

    if (!data.length) {
      list.innerHTML = '<div class="card"><h3>Ban chua dang ky khoa hoc nao.</h3></div>';
      return;
    }

    list.innerHTML = data
      .map((course) => {
        const thumbStyle = course.thumbnail
          ? `style="background-image: url('${course.thumbnail}');"`
          : "";
        const thumbClass = course.thumbnail ? "course-thumb" : "course-thumb is-empty";
        const progress = Number(course.progress || 0);
        return `
          <article class="card">
            <div class="${thumbClass}" ${thumbStyle}>JSMART</div>
            <h3>${course.course_title}</h3>
            <p>Da hoan thanh: ${progress}%</p>
            <div class="meta">
              <div class="actions" style="gap: 8px;">
                <a class="btn btn-primary" href="course-detail.html?id=${course.course_id}">Vao hoc</a>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    list.innerHTML = '<div class="card"><h3>Khong the tai khoa hoc cua ban.</h3></div>';
  }
}