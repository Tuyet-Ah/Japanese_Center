document.addEventListener("DOMContentLoaded", () => {
  initAdminShell();

  const addQuizBtn = document.getElementById("addQuizBtn");
  const section = document.getElementById("quizFormSection");
  const form = document.getElementById("quizForm");
  const cancelButton = document.getElementById("cancelQuizBtn");

  addQuizBtn?.addEventListener("click", () => {
    if (section) section.style.display = "block";
    form?.reset();
  });

  cancelButton?.addEventListener("click", () => {
    if (section) section.style.display = "none";
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    alert("✅ Quiz đã được lưu thành công!");
    if (section) section.style.display = "none";
  });
});