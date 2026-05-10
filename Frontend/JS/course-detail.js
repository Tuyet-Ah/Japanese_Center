document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  const params = new URLSearchParams(window.location.search);
  const courseId = Number(params.get("id")) || 1;
  const course = courseCatalog[courseId] || courseCatalog[1];

  const title = document.getElementById("course-title");
  const level = document.getElementById("course-level");
  const schedule = document.getElementById("course-schedule");
  const description = document.getElementById("course-description");
  const knowledge = document.getElementById("course-knowledge");
  const price = document.getElementById("course-price");
  const oldPrice = document.getElementById("course-old-price");

  if (title) title.textContent = course.name;
  if (level) level.textContent = course.level;
  if (schedule) schedule.textContent = course.schedule;
  if (description) description.textContent = course.description;
  if (knowledge) knowledge.innerHTML = course.knowledge.map((item) => `<li>${item}</li>`).join("");
  if (price) price.textContent = new Intl.NumberFormat("vi-VN").format(course.price) + "đ";
  if (oldPrice) oldPrice.textContent = course.price > 1000000 ? new Intl.NumberFormat("vi-VN").format(Math.round(course.price * 1.2)) + "đ" : "";

  const buyBtn = document.getElementById("buy-now");
  if (buyBtn) {
    buyBtn.addEventListener("click", () => {
      const cart = readCart();
      if (!cart.some((item) => item.id === course.id)) {
        cart.push(course);
        saveCart(cart);
      }
      window.location.href = "cart.html";
    });
  }

  const consultBtn = document.getElementById("consult");
  if (consultBtn) {
    consultBtn.addEventListener("click", () => {
      alert("Vui lòng liên hệ trung tâm để được tư vấn lộ trình phù hợp.");
    });
  }
});