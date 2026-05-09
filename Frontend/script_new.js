const cartKey = "japaneseCenterCart";
const loginKey = "japaneseCenterUser";
const adminKey = "japaneseCenterAdmin";

const demoCourses = [
  { id: 1, name: "N5 Beginner Journey", level: "N5", schedule: "T2-T5", price: 2400000 },
  { id: 2, name: "N4 Communication Boost", level: "N4", schedule: "T3-T7", price: 2900000 },
  { id: 3, name: "Business Japanese Starter", level: "N3+", schedule: "Cuối tuần", price: 3500000 },
  { id: 4, name: "Kanji Intensive Lab", level: "N5-N3", schedule: "Tối 2-4-6", price: 1800000 }
];

// ========== USER LOGIN SYSTEM ==========
function getLoginUser() {
  try {
    return JSON.parse(localStorage.getItem(loginKey)) || null;
  } catch {
    return null;
  }
}

function setLoginUser(userData) {
  localStorage.setItem(loginKey, JSON.stringify(userData));
  updateUIBasedOnLogin();
}

function logout() {
  localStorage.removeItem(loginKey);
  updateUIBasedOnLogin();
  window.location.href = "Home.html";
}

function updateUIBasedOnLogin() {
  const user = getLoginUser();
  const authActions = document.querySelector("[data-auth-actions]");
  const userActions = document.querySelector("[data-user-actions]");
  const profileLink = document.querySelector("[data-profile-link]");
  const cartLink = document.querySelector("[data-cart-link]");

  if (user) {
    // Đã login
    if (authActions) authActions.style.display = "none";
    if (userActions) userActions.style.display = "flex";
    if (profileLink) profileLink.hidden = false;
    if (cartLink) cartLink.hidden = false;
    document.querySelectorAll("[data-username]").forEach(el => {
      el.textContent = user.name;
    });
  } else {
    // Chưa login
    if (authActions) authActions.style.display = "flex";
    if (userActions) userActions.style.display = "none";
    if (profileLink) profileLink.hidden = true;
    if (cartLink) cartLink.hidden = true;
  }
  updateCartCount();
}

// ========== ADMIN LOGIN SYSTEM ==========
function getAdminUser() {
  try {
    return JSON.parse(localStorage.getItem(adminKey)) || null;
  } catch {
    return null;
  }
}

function loginAdmin(adminData) {
  localStorage.setItem(adminKey, JSON.stringify(adminData));
}

function logoutAdmin() {
  localStorage.removeItem(adminKey);
  window.location.href = "Home.html";
}

function initAdminNav() {
  const currentPage = window.location.pathname.split('/').pop().toLowerCase();
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
    const href = item.getAttribute('href') || '';
    if (href.toLowerCase().includes(currentPage)) {
      item.classList.add('active');
    }
  });
}

// ========== MONEY & CART UTILITIES ==========
function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + " VND";
}

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(cartKey)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = readCart().length;
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = count;
  });
}

// ========== COURSES & CART RENDERING ==========
function renderCourses() {
  const list = document.querySelector("[data-course-list]");
  if (!list) return;

  list.innerHTML = demoCourses
    .map(
      (course) => `
        <article class="card">
          <span class="badge">${course.level}</span>
          <h3>${course.name}</h3>
          <p>Lịch học: ${course.schedule}. Học trực tiếp với giáo viên, có lộ trình rõ ràng và tài liệu đi kèm.</p>
          <div class="meta">
            <span class="price">${formatMoney(course.price)}</span>
            <button class="btn btn-primary" data-add-course="${course.id}">Thêm vào giỏ</button>
          </div>
        </article>
      `
    )
    .join("");

  list.querySelectorAll("[data-add-course]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.getAttribute("data-add-course"));
      const course = demoCourses.find((item) => item.id === id);
      if (!course) return;

      const cart = readCart();
      if (!cart.some((item) => item.id === course.id)) {
        cart.push(course);
        saveCart(cart);
      }
      button.textContent = "Đã thêm";
      button.disabled = true;
    });
  });
}

function renderCart() {
  const list = document.querySelector("[data-cart-list]");
  const totalNode = document.querySelector("[data-cart-total]");
  if (!list || !totalNode) return;

  const cart = readCart();
  if (!cart.length) {
    list.innerHTML = '<div class="card"><h3>Giỏ hàng đang trống</h3><p>Hãy quay lại trang khóa học để chọn lớp phù hợp.</p></div>';
    totalNode.textContent = formatMoney(0);
    return;
  }

  list.innerHTML = cart
    .map(
      (course) => `
        <div class="item">
          <div>
            <h3 class="item-title">${course.name}</h3>
            <p>${course.level} • ${course.schedule}</p>
          </div>
          <strong class="price">${formatMoney(course.price)}</strong>
        </div>
      `
    )
    .join("");

  const total = cart.reduce((sum, course) => sum + course.price, 0);
  totalNode.textContent = formatMoney(total);
}

// ========== FORM HANDLING ==========
function handleAuthForms() {
  document.querySelectorAll("[data-auth-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = form.querySelector("[data-form-message]");
      
      // Kiểm tra xem form này là đăng nhập hay đăng ký
      const isLoginForm = form.closest("[data-login-panel]") !== null;
      
      if (isLoginForm) {
        // Lưu login info
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value : "user@email.com";
        const userData = {
          email: email,
          name: email.split("@")[0],
          loginTime: new Date().toISOString()
        };
        setLoginUser(userData);
        
        if (message) {
          message.textContent = "Đăng nhập thành công!";
        }
      } else {
        // Đăng ký - lưu và hiển thị thành công
        const nameInput = form.querySelector('input[type="text"]');
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value : "user@email.com";
        const name = nameInput ? nameInput.value : email.split("@")[0];
        
        const userData = {
          email: email,
          name: name,
          loginTime: new Date().toISOString()
        };
        setLoginUser(userData);
        
        if (message) {
          message.textContent = "Đăng ký và đăng nhập thành công!";
        }
      }
      
      form.reset();
    });
  });
}

function initAuthToggle() {
  const loginPanel = document.querySelector("[data-login-panel]");
  const registerPanel = document.querySelector("[data-register-panel]");
  const showRegister = document.querySelector("[data-show-register]");
  const showLogin = document.querySelector("[data-show-login]");

  if (!loginPanel || !registerPanel || !showRegister || !showLogin) return;

  const openRegister = () => {
    loginPanel.hidden = true;
    registerPanel.hidden = false;
  };

  const openLogin = () => {
    registerPanel.hidden = true;
    loginPanel.hidden = false;
  };

  showRegister.addEventListener("click", openRegister);
  showLogin.addEventListener("click", openLogin);
}

function initNavState() {
  const path = window.location.pathname.split("/").pop().toLowerCase();
  document.querySelectorAll(".nav a").forEach((link) => {
    const href = (link.getAttribute("href") || "").toLowerCase();
    if (href === path || (!path && href === "home.html") || (path === "" && href === "home.html")) {
      link.classList.add("active");
    }
  });
}

// ========== INITIALIZATION ==========
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCourses();
  renderCart();
  handleAuthForms();
  initAuthToggle();
  initNavState();
  updateUIBasedOnLogin();

  const clearCartButton = document.querySelector("[data-clear-cart]");
  if (clearCartButton) {
    clearCartButton.addEventListener("click", () => {
      saveCart([]);
      renderCart();
    });
  }

  const logoutButton = document.querySelector("[data-logout-btn]");
  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }
});
