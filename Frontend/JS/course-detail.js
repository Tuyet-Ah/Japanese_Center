document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  const params = new URLSearchParams(window.location.search);
  const courseId = Number(params.get("id"));

  const title = document.getElementById("course-title");
  const level = document.getElementById("course-level");
  const schedule = document.getElementById("course-schedule");
  const description = document.getElementById("course-description");
  const knowledge = document.getElementById("course-knowledge");
  const price = document.getElementById("course-price");
  const oldPrice = document.getElementById("course-old-price");

  if (!courseId) {
    if (title) title.textContent = "Khong tim thay khoa hoc";
    return;
  }

  const renderCourse = (course) => {
    if (title) title.textContent = course.title || course.name;
    if (level) level.textContent = course.level || "";
    if (schedule) schedule.textContent = course.schedule || "Chua cap nhat";
    if (description) description.textContent = course.description || "Chua co mo ta.";

    if (knowledge) {
      const chapters = Array.isArray(course.chapters) ? course.chapters : [];
      knowledge.innerHTML = chapters.length
        ? chapters.map((chapter) => `<li>Chuong ${chapter.order}: ${chapter.title}</li>`).join("")
        : "<li>Chua cap nhat.</li>";
    }

    if (price) price.textContent = new Intl.NumberFormat("vi-VN").format(course.price || 0) + "đ";
    if (oldPrice) {
      oldPrice.textContent = course.price > 1000000
        ? new Intl.NumberFormat("vi-VN").format(Math.round(course.price * 1.2)) + "đ"
        : "";
    }

    const buyBtn = document.getElementById("buy-now");
    if (buyBtn) {
      buyBtn.addEventListener("click", () => {
        const cart = readCart();
        const cartItem = {
          id: course.id,
          name: course.title || course.name,
          level: course.level,
          schedule: course.schedule || "Chua cap nhat",
          price: Number(course.price || 0)
        };
        if (!cart.some((item) => item.id === course.id)) {
          cart.push(cartItem);
          saveCart(cart);
        }
        window.location.href = "cart.html";
      });
    }

    const consultBtn = document.getElementById("consult");
    if (consultBtn) {
      consultBtn.addEventListener("click", () => {
        alert("Vui long lien he trung tam de duoc tu van lo trinh phu hop.");
      });
    }
  };

  fetchCourseDetail(courseId)
    .then((data) => renderCourse(normalizeCourseDetail(data)))
    .catch(() => {
      if (title) title.textContent = "Khong the tai khoa hoc";
    });
});