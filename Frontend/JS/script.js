const cartKey = "japaneseCenterCart";
const loginKey = "japaneseCenterUser";
const adminKey = "japaneseCenterAdmin";

const demoCourses = [
  {
    id: 1,
    name: "N5 Beginner Journey",
    level: "N5",
    schedule: "T2-T5",
    price: 2400000,
    description: "Khóa nền tảng giúp bạn làm quen với hiragana, katakana, từ vựng cơ bản và mẫu câu chào hỏi.",
    knowledge: ["Hiragana, katakana", "Từ vựng sinh hoạt hằng ngày", "Mẫu câu giới thiệu bản thân"],
    videos: ["Video 1: Chữ cái và phát âm", "Video 2: Giới thiệu bản thân", "Video 3: Trợ từ cơ bản"],
    exercises: ["Bài tập viết chữ cái", "Quiz từ vựng 20 câu", "Luyện hội thoại ngắn"]
  },
  {
    id: 2,
    name: "N4 Communication Boost",
    level: "N4",
    schedule: "T3-T7",
    price: 2900000,
    description: "Khóa luyện giao tiếp trung cấp giúp tăng khả năng nói, nghe và phản xạ trong tình huống thực tế.",
    knowledge: ["Mở rộng ngữ pháp N4", "Giao tiếp nơi công việc", "Nghe hiểu hội thoại ngắn"],
    videos: ["Video 1: Giao tiếp tại lớp học", "Video 2: Đặt câu hỏi", "Video 3: Tình huống công sở"],
    exercises: ["Viết đoạn tự giới thiệu", "Làm bài nghe ngắn", "Bài tập ngữ pháp 30 câu"]
  },
  {
    id: 3,
    name: "Business Japanese Starter",
    level: "N3+",
    schedule: "Cuối tuần",
    price: 3500000,
    description: "Khóa học tiếng Nhật ứng dụng cho môi trường doanh nghiệp, thư từ và họp hành cơ bản.",
    knowledge: ["Keigo cơ bản", "Email công việc", "Hội thoại trong văn phòng"],
    videos: ["Video 1: Mẫu email", "Video 2: Chào hỏi công ty", "Video 3: Họp và báo cáo"],
    exercises: ["Soạn email mẫu", "Role-play cuộc họp", "Quiz từ vựng doanh nghiệp"]
  },
  {
    id: 4,
    name: "Kanji Intensive Lab",
    level: "N5-N3",
    schedule: "Tối 2-4-6",
    price: 1800000,
    description: "Luyện kanji theo từng nhóm chủ đề, kết hợp viết, nhớ nghĩa và cách đọc.",
    knowledge: ["Radical cơ bản", "Cách đọc on-kun", "Nhận diện kanji theo ngữ cảnh"],
    videos: ["Video 1: Kanji nền tảng", "Video 2: Ghi nhớ theo hình ảnh", "Video 3: Kanji thực hành"],
    exercises: ["Luyện viết 50 chữ", "Bài tập đọc kanji", "Ôn tập flashcard"]
  }
];

const courseCatalog = Object.fromEntries(demoCourses.map((course) => [course.id, course]));

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
    if (authActions) authActions.style.display = "none";
    if (userActions) userActions.style.display = "flex";
    if (profileLink) profileLink.hidden = false;
    if (cartLink) cartLink.hidden = false;
    document.querySelectorAll("[data-username]").forEach((element) => {
      element.textContent = user.name;
    });
  } else {
    if (authActions) authActions.style.display = "flex";
    if (userActions) userActions.style.display = "none";
    if (profileLink) profileLink.hidden = true;
    if (cartLink) cartLink.hidden = true;
  }

  updateCartCount();
}

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

function renderCourses() {
  const list = document.querySelector("[data-course-list]");
  if (!list) return;

  list.innerHTML = demoCourses
    .map(
      (course) => `
        <article class="card">
          <span class="badge">${course.level}</span>
          <h3>${course.name}</h3>
          <p>${course.description || `Lịch học: ${course.schedule}. Học trực tiếp với giáo viên, có lộ trình rõ ràng và tài liệu đi kèm.`}</p>
          <div class="meta">
            <span class="price">${formatMoney(course.price)}</span>
            <div class="actions" style="gap: 8px;">
              <a class="btn btn-outline" href="course-detail.html?id=${course.id}">Xem chi tiết</a>
              <button class="btn btn-primary" data-add-course="${course.id}">Thêm vào giỏ</button>
            </div>
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

function openCourseDetail(courseId) {
  const modal = document.querySelector("[data-course-modal]");
  const course = courseCatalog[courseId];
  if (!modal || !course) return;

  modal.hidden = false;
  document.body.style.overflow = "hidden";

  const title = modal.querySelector("[data-course-title]");
  const level = modal.querySelector("[data-course-level]");
  const schedule = modal.querySelector("[data-course-schedule]");
  const description = modal.querySelector("[data-course-description]");
  const knowledgeList = modal.querySelector("[data-course-knowledge]");
  const videoList = modal.querySelector("[data-course-videos]");
  const exerciseList = modal.querySelector("[data-course-exercises]");

  if (title) title.textContent = course.name;
  if (level) level.textContent = course.level;
  if (schedule) schedule.textContent = course.schedule;
  if (description) description.textContent = course.description;
  if (knowledgeList) knowledgeList.innerHTML = course.knowledge.map((item) => `<li>${item}</li>`).join("");
  if (videoList) videoList.innerHTML = course.videos.map((item) => `<li>${item}</li>`).join("");
  if (exerciseList) exerciseList.innerHTML = course.exercises.map((item) => `<li>${item}</li>`).join("");
}

function closeCourseDetail() {
  const modal = document.querySelector("[data-course-modal]");
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = "";
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

function handleAuthForms() {
  document.querySelectorAll("[data-auth-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = form.querySelector("[data-form-message]");
      const isLoginForm = form.closest("[data-login-panel]") !== null;

      if (isLoginForm) {
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value : "user@email.com";
        setLoginUser({
          email,
          name: email.split("@")[0],
          loginTime: new Date().toISOString()
        });

        if (message) message.textContent = "Đăng nhập thành công!";
      } else {
        const nameInput = form.querySelector('input[type="text"]');
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value : "user@email.com";
        const name = nameInput ? nameInput.value : email.split("@")[0];

        setLoginUser({
          email,
          name,
          loginTime: new Date().toISOString()
        });

        if (message) message.textContent = "Đăng ký và đăng nhập thành công!";
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

  showRegister.addEventListener("click", () => {
    loginPanel.hidden = true;
    registerPanel.hidden = false;
  });

  showLogin.addEventListener("click", () => {
    registerPanel.hidden = true;
    loginPanel.hidden = false;
  });
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
  const currentPage = window.location.pathname.split("/").pop().toLowerCase();
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.classList.remove("active");
    const href = item.getAttribute("href") || "";
    if (href.toLowerCase().includes(currentPage)) {
      item.classList.add("active");
    }
  });
}

function initStandardHeader() {
  updateUIBasedOnLogin();
  initNavState();

  const logoutButton = document.querySelector("[data-logout-btn]");
  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }
}

function initAdminShell() {
  const admin = getAdminUser();
  if (!admin) {
    window.location.href = "admin-login.html";
    return null;
  }

  const username = document.getElementById("adminUsername");
  if (username) {
    username.textContent = admin.name;
  }

  initAdminNav();

  const logoutButton = document.getElementById("adminLogout");
  if (logoutButton) {
    logoutButton.addEventListener("click", logoutAdmin);
  }

  return admin;
}

window.demoCourses = demoCourses;
window.courseCatalog = courseCatalog;
window.getLoginUser = getLoginUser;
window.setLoginUser = setLoginUser;
window.logout = logout;
window.updateUIBasedOnLogin = updateUIBasedOnLogin;
window.formatMoney = formatMoney;
window.readCart = readCart;
window.saveCart = saveCart;
window.updateCartCount = updateCartCount;
window.renderCourses = renderCourses;
window.openCourseDetail = openCourseDetail;
window.closeCourseDetail = closeCourseDetail;
window.renderCart = renderCart;
window.handleAuthForms = handleAuthForms;
window.initAuthToggle = initAuthToggle;
window.initNavState = initNavState;
window.getAdminUser = getAdminUser;
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.initAdminNav = initAdminNav;
window.initStandardHeader = initStandardHeader;
window.initAdminShell = initAdminShell;
