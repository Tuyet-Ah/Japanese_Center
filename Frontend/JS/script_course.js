// script_course.js — populate course-detail.html from query param
(function () {
  function qs(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const id = Number(qs('id')) || null;
    const course = window.courseCatalog ? window.courseCatalog[id] : null;

    const title = document.getElementById('course-title');
    const level = document.getElementById('course-level');
    const schedule = document.getElementById('course-schedule');
    const desc = document.getElementById('course-description');
    const knowledge = document.getElementById('course-knowledge');
    const price = document.getElementById('course-price');
    const oldPrice = document.getElementById('course-old-price');

    if (!course) {
      if (title) title.textContent = 'Khóa học không tìm thấy';
      if (desc) desc.textContent = 'Không tìm thấy thông tin cho khóa học này.';
      return;
    }

    if (title) title.textContent = course.name;
    if (level) level.textContent = course.level;
    if (schedule) schedule.textContent = course.schedule;
    if (desc) desc.textContent = course.description;
    if (knowledge) knowledge.innerHTML = course.knowledge.map(k => `<li>${k}</li>`).join('');
    if (price) price.textContent = new Intl.NumberFormat('vi-VN').format(course.price) + 'đ';

    // Example old price (optional)
    if (oldPrice) oldPrice.textContent = course.price > 1000000 ? new Intl.NumberFormat('vi-VN').format(Math.round(course.price * 1.2)) + 'đ' : '';

    const buyBtn = document.getElementById('buy-now');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        // Add to cart and redirect to cart page
        try {
          const cartKey = 'japaneseCenterCart';
          const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
          if (!cart.some(c => c.id === course.id)) {
            cart.push(course);
            localStorage.setItem(cartKey, JSON.stringify(cart));
          }
        } catch (e) {}
        window.location.href = 'cart.html';
      });
    }

    const consultBtn = document.getElementById('consult');
    if (consultBtn) {
      consultBtn.addEventListener('click', () => {
        window.location.href = 'contact.html';
      })
    }
  });
})();
