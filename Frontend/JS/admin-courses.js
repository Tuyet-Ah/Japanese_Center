document.addEventListener("DOMContentLoaded", () => {
  initAdminShell();

  const addCourseBtn = document.getElementById("addCourseBtn");
  const section = document.getElementById("courseFormSection");
  const form = document.getElementById("courseForm");
  const cancelButton = document.getElementById("cancelFormBtn");

  addCourseBtn?.addEventListener("click", () => {
    if (section) section.style.display = "block";
    form?.reset();
  });

  cancelButton?.addEventListener("click", () => {
    if (section) section.style.display = "none";
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    alert("✅ Khóa học đã được lưu thành công!");
    if (section) section.style.display = "none";
  });
});