const cartKey = "japaneseCenterCart";
const loginKey = "japaneseCenterUser";
const adminKey = "japaneseCenterAdmin";
const authTokenKey = "japaneseCenterAuthTokens";
const sessionStartKey = "japaneseCenterSessionStart";
const SESSION_TTL_MS = 3 * 60 * 60 * 1000;
const authStorage = sessionStorage;
const API_HOST = "http://127.0.0.1:8000";
const API_BASE_URL = `${API_HOST}/educations`;
const CHATBOT_API_URL = `${API_BASE_URL}/chatbot/`;

let courseCatalog = {};

(function () {
  function ensureAlertModal() {
    if (document.getElementById('jsmart-alert-overlay')) return;

    const style = document.createElement('style');
    style.textContent = `
      #jsmart-alert-overlay {
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(15,23,42,0.45);
        backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
        padding: 20px;
        opacity: 0; pointer-events: none;
        transition: opacity 0.22s ease;
      }
      #jsmart-alert-overlay.is-open { opacity: 1; pointer-events: auto; }
      #jsmart-alert-box {
        background: #fff;
        border-radius: 20px;
        box-shadow: 0 32px 80px rgba(15,23,42,0.22);
        width: min(400px, 100%);
        padding: 36px 32px 28px;
        text-align: center;
        transform: translateY(16px) scale(0.97);
        transition: transform 0.22s ease;
      }
      #jsmart-alert-overlay.is-open #jsmart-alert-box {
        transform: translateY(0) scale(1);
      }
      #jsmart-alert-icon {
        font-size: 2.8rem;
        line-height: 1;
        margin-bottom: 14px;
      }
      #jsmart-alert-msg {
        font-size: 1rem;
        line-height: 1.6;
        color: #1e293b;
        margin: 0 0 24px;
        white-space: pre-wrap;
      }
      #jsmart-alert-msg.is-error { color: #dc2626; }
      #jsmart-alert-ok {
        border: 0;
        border-radius: 999px;
        padding: 12px 40px;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        background: linear-gradient(135deg, #ffabc7, #fb7185);
        color: #fff;
        box-shadow: 0 10px 24px rgba(255,107,139,0.28);
        transition: transform 0.15s, box-shadow 0.15s;
        font-family: inherit;
      }
      #jsmart-alert-ok:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 30px rgba(255,107,139,0.38);
      }
      #jsmart-alert-ok.is-error {
        background: linear-gradient(135deg, #f87171, #dc2626);
        box-shadow: 0 10px 24px rgba(220,38,38,0.24);
      }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'jsmart-alert-overlay';
    overlay.innerHTML = `
      <div id="jsmart-alert-box" role="dialog" aria-modal="true" aria-labelledby="jsmart-alert-msg">
        <div id="jsmart-alert-icon">✅</div>
        <p id="jsmart-alert-msg"></p>
        <button id="jsmart-alert-ok" type="button">OK</button>
      </div>`;
    document.body.appendChild(overlay);

    document.getElementById('jsmart-alert-ok').addEventListener('click', closeAlert);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAlert();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        const ov = document.getElementById('jsmart-alert-overlay');
        if (ov && ov.classList.contains('is-open')) closeAlert();
      }
    });
  }

  function closeAlert() {
    const overlay = document.getElementById('jsmart-alert-overlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    const resolver = overlay._resolve;
    if (typeof resolver === 'function') { overlay._resolve = null; resolver(); }
  }

  // Hàm public — có thể gọi trực tiếp: showAlert('message', 'success'|'error'|'warning')
  window.showAlert = function (message, type = 'success') {
    return new Promise((resolve) => {
      if (!document.body) { window._nativeAlert(message); resolve(); return; }
      ensureAlertModal();

      const overlay = document.getElementById('jsmart-alert-overlay');
      const msgEl = document.getElementById('jsmart-alert-msg');
      const iconEl = document.getElementById('jsmart-alert-icon');
      const okBtn = document.getElementById('jsmart-alert-ok');

      const isError = type === 'error' || /^(❌|lỗi|không thể|error)/i.test(message);
      const isWarning = type === 'warning' || /^(⚠️|vui lòng|vui long)/i.test(message);

      // Xác định icon + màu dựa trên nội dung
      let icon = '✅';
      if (isError) icon = '❌';
      else if (isWarning) icon = '⚠️';
      else if (/đã xóa|xóa thành công/i.test(message)) icon = '🗑️';
      else if (/cập nhật|sửa/i.test(message)) icon = '✏️';
      else if (/tạo|thêm|thành công/i.test(message)) icon = '✅';

      iconEl.textContent = icon;
      msgEl.textContent = message.replace(/^[✅❌⚠️🗑️✏️]\s*/u, '').trim();
      msgEl.classList.toggle('is-error', isError);
      okBtn.classList.toggle('is-error', isError);

      overlay._resolve = resolve;
      overlay.classList.add('is-open');
      setTimeout(() => document.getElementById('jsmart-alert-ok')?.focus(), 50);
    });
  };

  // Override window.alert để tất cả alert() cũ tự động dùng modal mới
  window._nativeAlert = window.alert.bind(window);
  window.alert = function (message) {
    // Nếu DOM chưa sẵn sàng, fallback về native
    if (!document.body) { window._nativeAlert(message); return; }
    showAlert(String(message ?? ''));
  };
})();

function getLoginUser() {
  try {
    return JSON.parse(authStorage.getItem(loginKey)) || null;
  } catch {
    return null;
  }
}

function setLoginUser(userData) {
  authStorage.setItem(loginKey, JSON.stringify(userData));
  updateUIBasedOnLogin();
}

function getAuthTokens() {
  try {
    return JSON.parse(authStorage.getItem(authTokenKey)) || null;
  } catch {
    return null;
  }
}

function setAuthTokens(tokens) {
  authStorage.setItem(authTokenKey, JSON.stringify(tokens));
  if (tokens?.access) {
    authStorage.setItem(sessionStartKey, String(Date.now()));
  }
}

function clearAuthTokens() {
  authStorage.removeItem(authTokenKey);
  authStorage.removeItem(sessionStartKey);
}

function isSessionExpired() {
  const startedAt = Number(authStorage.getItem(sessionStartKey));
  if (!startedAt) return false;
  return Date.now() - startedAt >= SESSION_TTL_MS;
}

function getJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padding = payload.length % 4;
    if (padding) {
      payload += "=".repeat(4 - padding);
    }
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = getJwtPayload(token);
  if (!payload || !payload.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return now >= payload.exp;
}

function logout() {
  authStorage.removeItem(loginKey);
  authStorage.removeItem(adminKey);
  authStorage.removeItem(authTokenKey);
  authStorage.removeItem(sessionStartKey);
  clearAuthTokens();
  updateUIBasedOnLogin();
  window.location.href = "Home.html";
}

function updateUIBasedOnLogin() {
  const user = getLoginUser();
  const tokens = getAuthTokens();
  if (tokens?.access && (isTokenExpired(tokens.access) || isSessionExpired())) {
    logout();
    return;
  }
  const isAuthenticated = Boolean(user && tokens && tokens.access);
  const authActions = document.querySelector("[data-auth-actions]");
  const userActions = document.querySelector("[data-user-actions]");
  const profileLink = document.querySelector("[data-profile-link]");
  const cartLink = document.querySelector("[data-cart-link]");
  const homeCtaNodes = document.querySelectorAll("[data-home-cta]");

  if (isAuthenticated) {
    if (authActions) authActions.style.display = "none";
    if (userActions) userActions.style.display = "flex";
    if (profileLink) profileLink.hidden = false;
    if (cartLink) cartLink.hidden = false;
    document.querySelectorAll("[data-username]").forEach((element) => {
      element.textContent = user.full_name || user.fullName || user.name || user.username || user.email || "Học viên";
    });
  } else {
    if (authActions) authActions.style.display = "flex";
    if (userActions) userActions.style.display = "none";
    if (profileLink) profileLink.hidden = true;
    if (cartLink) cartLink.hidden = true;
  }

  homeCtaNodes.forEach(el => { el.hidden = isAuthenticated; });

  updateCartCount();
}

async function validateAuthSession() {
  const user = getLoginUser();
  const tokens = getAuthTokens();
  if (!user || !tokens?.access) return;
  if (isTokenExpired(tokens.access) || isSessionExpired()) {
    logout();
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/profile/`, {
      headers: { Authorization: `Bearer ${tokens.access}` }
    });
    if (!response.ok) {
      logout();
    }
  } catch {
    logout();
  }
}

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + " VND";
}

function buildThumbnailUrl(thumbnail) {
  if (!thumbnail) return "";
  if (thumbnail.startsWith("http")) return thumbnail;
  if (thumbnail.startsWith("/")) return `${API_HOST}${thumbnail}`;
  return `${API_HOST}/${thumbnail}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeCourseListItem(course) {
  return {
    id: course.id,
    name: course.title,
    title: course.title,
    level: course.level,
    schedule: "Chua cap nhat",
    price: Number(course.price || 0),
    description: course.description || "",
    thumbnail: buildThumbnailUrl(course.thumbnail)
  };
}

function normalizeCourseDetail(course) {
  const normalized = normalizeCourseListItem(course);
  normalized.description = course.description || "";
  normalized.chapters = Array.isArray(course.chapters) ? course.chapters : [];
  normalized.content_blocks = Array.isArray(course.content_blocks) ? course.content_blocks : [];
  return normalized;
}

async function fetchCourseList(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  const queryString = searchParams.toString();
  const url = queryString ? `${API_BASE_URL}/courses/?${queryString}` : `${API_BASE_URL}/courses/`;

  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.detail || "Fetch courses failed");
  }
  return data;
}

async function fetchCourseDetail(courseId) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.detail || "Fetch course failed");
  }
  return data;
}

async function fetchMyLearning() {
  const tokens = getAuthTokens();
  if (!tokens || !tokens.access) return null;

  const response = await fetch(`${API_BASE_URL}/my-learning/`, {
    headers: { Authorization: `Bearer ${tokens.access}` }
  });
  if (!response.ok) {
    return null;
  }
  return response.json();
}

async function fetchProfile() {
  const tokens = getAuthTokens();
  if (!tokens || !tokens.access) return null;

  const response = await fetch(`${API_BASE_URL}/profile/`, {
    headers: { Authorization: `Bearer ${tokens.access}` }
  });
  if (!response.ok) return null;
  return response.json();
}

async function fetchPendingAdmins() {
  const tokens = getAuthTokens();
  if (!tokens || !tokens.access) return [];

  try {
    const response = await fetch(`${API_BASE_URL}/admin-approvals/`, {
      headers: { Authorization: `Bearer ${tokens.access}` }
    });
    if (!response.ok) return [];
    const data = await response.json().catch(() => ([]));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function renderPendingAdminList(listNode, admins, countNode) {
  if (!listNode) return;
  if (!Array.isArray(admins) || admins.length === 0) {
    listNode.innerHTML = '<p class="pending-empty">Khong co tai khoan admin cho duyet.</p>';
    if (countNode) countNode.textContent = "0";
    return;
  }

  listNode.innerHTML = admins
    .map((admin) => {
      const username = escapeHtml(admin.username || "");
      const email = escapeHtml(admin.email || "");
      const phone = escapeHtml(admin.phone || "");
      const address = escapeHtml(admin.address || "");
      return `
        <div class="pending-admin-item">
          <div>
            <strong>${username || "(Khong co username)"}</strong>
            <div class="pending-admin-meta">Email: ${email || "-"}</div>
            <div class="pending-admin-meta">So dien thoai: ${phone || "-"}</div>
            <div class="pending-admin-meta">Dia chi: ${address || "-"}</div>
          </div>
          <a class="btn btn-small" href="admin-approvals.html">Duyet</a>
        </div>
      `;
    })
    .join("");

  if (countNode) countNode.textContent = String(admins.length);
}

async function updateProfileBackend(formData) {
  const tokens = getAuthTokens();
  if (!tokens || !tokens.access) return null;

  const response = await fetch(`${API_BASE_URL}/profile/`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokens.access}` },
    body: formData
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.detail || "Không thể cập nhật thông tin.");
  }
  return data;
}

async function changePasswordBackend(currentPassword, newPassword) {
  const tokens = getAuthTokens();
  if (!tokens || !tokens.access) return null;

  const response = await fetch(`${API_BASE_URL}/profile/change-password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.access}`
    },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.detail || "Không thể đổi mật khẩu.");
  }
  return data;
}

async function fetchCartItems() {
  const tokens = getAuthTokens();
  if (!tokens || !tokens.access) return [];

  try {
    const response = await fetch(`${API_BASE_URL}/cart/`, {
      headers: { Authorization: `Bearer ${tokens.access}` }
    });
    if (!response.ok) return [];
    const data = await response.json().catch(() => ({}));
    return Array.isArray(data.cart_items) ? data.cart_items : [];
  } catch {
    return [];
  }
}

async function addToCartBackend(courseId) {
  const tokens = getAuthTokens();
  if (!tokens || !tokens.access) {
    window.location.href = "login.html";
    return { ok: false, error: "Vui lòng đăng nhập để thêm khóa học." };
  }

  const response = await fetch(`${API_BASE_URL}/cart/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.access}`
    },
    body: JSON.stringify({ course_id: courseId })
  });
  const data = await response.json().catch(() => ({}));
  return {
    ok: response.ok,
    status: response.status,
    error: data.error || data.detail || "Không thể thêm vào giỏ hàng."
  };
}

async function removeCartItemBackend(cartItemId) {
  const tokens = getAuthTokens();
  if (!tokens || !tokens.access) return false;
  const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${tokens.access}` }
  });
  return response.ok;
}

async function clearCartBackend() {
  const items = await fetchCartItems();
  await Promise.all(items.map((item) => removeCartItemBackend(item.id)));
}

async function updateCartCount() {
  const items = await fetchCartItems();
  const count = items.length;
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = count;
  });
}

async function renderCourses(options = {}) {
  const list = document.querySelector("[data-course-list]");
  if (!list) return;

  list.innerHTML = '<div class="card"><h3>Dang tai khoa hoc...</h3></div>';

  try {
    const data = await fetchCourseList(options.queryParams || {});
    const courses = data.map(normalizeCourseListItem);

    // enrolledIds: Set<number> — các course_id đã đăng ký (paid)
    const enrolledIds = options.enrolledIds instanceof Set
      ? options.enrolledIds
      : new Set(
        options.progressByCourseId
          ? Object.keys(options.progressByCourseId).map(Number)
          : []
      );

    // Lọc theo trạng thái đăng ký
    let filteredCourses = courses;
    const enrollmentFilter = options.enrollmentFilter || options.status || "all";
    if (enrollmentFilter === "enrolled") {
      filteredCourses = courses.filter((c) => enrolledIds.has(c.id));
    } else if (enrollmentFilter === "not-enrolled") {
      filteredCourses = courses.filter((c) => !enrolledIds.has(c.id));
    }
    // "all" → giữ nguyên

    courseCatalog = Object.fromEntries(filteredCourses.map((course) => [course.id, course]));

    if (!filteredCourses.length) {
      list.innerHTML = '<div class="card"><h3>Không có khóa học phù hợp.</h3></div>';
      return;
    }

    list.innerHTML = filteredCourses
      .map((course) => {
        const enrolled = enrolledIds.has(course.id);
        const thumbClass = course.thumbnail ? "course-thumb" : "course-thumb is-empty";
        const thumbStyle = course.thumbnail ? `style="background-image: url('${course.thumbnail}');"` : "";
        const actionHtml = enrolled
          ? `
              <a class="btn btn-primary" href="course-learning.html?course=${course.id}">Vào học</a>
              <span class="badge" style="align-self:center;">Đã đăng ký</span>
            `
          : `<button class="btn btn-primary" data-add-course="${course.id}">Thêm vào giỏ</button>`;
        return `
          <article class="card">
            <div class="${thumbClass}" ${thumbStyle}>JSMART</div>
            <span class="badge">${course.level}</span>
            <h3>${course.name}</h3>
            <p>${course.description || "Chưa có mô tả."}</p>
            <div class="meta">
              <span class="price">${formatMoney(course.price)}</span>
              <div class="actions" style="gap: 8px;">
                <a class="btn btn-outline" href="course-detail.html?id=${course.id}">Xem chi tiết</a>
                ${actionHtml}
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    list.innerHTML = '<div class="card"><h3>Không thể tải khóa học.</h3><p>Vui lòng thử lại sau.</p></div>';
    return;
  }

  list.querySelectorAll("[data-add-course]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = Number(button.getAttribute("data-add-course"));
      if (!id) return;

      button.disabled = true;
      const result = await addToCartBackend(id);
      if (result.ok) {
        button.textContent = "Đã thêm";
        updateCartCount();
      } else {
        alert(result.error || "Không thể thêm vào giỏ hàng.");
        button.disabled = false;
      }
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
  if (description) description.textContent = course.description || "Chua co mo ta.";

  if (knowledgeList) {
    const chapters = Array.isArray(course.chapters) ? course.chapters : [];
    knowledgeList.innerHTML = chapters.length
      ? chapters.map((chapter) => `<li>Chuong ${chapter.order}: ${chapter.title}</li>`).join("")
      : "<li>Chua cap nhat.</li>";
  }

  if (videoList) {
    const lessons = Array.isArray(course.chapters)
      ? course.chapters.flatMap((chapter) => (chapter.lessons || []))
      : [];
    videoList.innerHTML = lessons.length
      ? lessons.map((lesson) => `<div class="course-video-card"><strong>${lesson.title}</strong></div>`).join("")
      : "<div class=\"course-video-card\"><strong>Chua co bai hoc.</strong></div>";
  }

  if (exerciseList) {
    exerciseList.innerHTML = "<div class=\"course-exercise-card\"><strong>Chua cap nhat bai tap.</strong></div>";
  }
}

function closeCourseDetail() {
  const modal = document.querySelector("[data-course-modal]");
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = "";
}

let currentDiscount = 0;

function calculateCartTotal() {
  const checkboxes = document.querySelectorAll(".cart-checkbox");
  const totalNode = document.querySelector("[data-cart-total]");
  const discountAmountNode = document.getElementById("discountAmount");
  let subtotal = 0;

  checkboxes.forEach(cb => {
    if (cb.checked) {
      subtotal += parseFloat(cb.getAttribute("data-price"));
    }
  });

  let total = subtotal - currentDiscount;
  if (total < 0) total = 0;

  if (totalNode) totalNode.textContent = formatMoney(total);
  if (discountAmountNode) discountAmountNode.textContent = "-" + formatMoney(currentDiscount);
}

function applyDiscountCode() {
  const input = document.getElementById("discountInput");
  const messageNode = document.getElementById("discountMessage");
  if (!input || !messageNode) return;

  const code = input.value.trim().toUpperCase();

  if (code === "JSMART10") {
    const checkboxes = document.querySelectorAll(".cart-checkbox");
    let subtotal = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) subtotal += parseFloat(cb.getAttribute("data-price"));
    });
    currentDiscount = subtotal * 0.1;
    messageNode.textContent = "Áp dụng thành công mã giảm 10%!";
    messageNode.style.color = "green";
  } else if (code === "JSMART500K") {
    currentDiscount = 500000;
    messageNode.textContent = "Áp dụng thành công mã giảm 500.000 VNĐ!";
    messageNode.style.color = "green";
  } else if (code === "") {
    currentDiscount = 0;
    messageNode.textContent = "";
  } else {
    currentDiscount = 0;
    messageNode.textContent = "Mã giảm giá không hợp lệ.";
    messageNode.style.color = "red";
  }

  calculateCartTotal();
}

async function renderCart() {
  const list = document.querySelector("[data-cart-list]");
  const totalNode = document.querySelector("[data-cart-total]");
  if (!list || !totalNode) return;

  const items = await fetchCartItems();
  if (!items.length) {
    list.innerHTML = '<div class="card"><h3>Giỏ hàng đang trống</h3><p>Hãy quay lại trang khóa học để chọn lớp phù hợp.</p></div>';
    totalNode.textContent = formatMoney(0);
    return;
  }

  list.innerHTML = items
    .map(
      (item, index) => `
        <div class="item">
          <div class="item-checkbox-wrapper">
            <input type="checkbox" id="cart-item-${index}" class="cart-checkbox" data-price="${item.course_details.price}" data-course-id="${item.course_id}" data-cart-item-id="${item.id}" checked onchange="calculateCartTotal()">
          </div>
          <div class="item-details">
            <h3 class="item-title">${item.course_details.title}</h3>
            <p>${item.course_details.level}</p>
          </div>
          <strong class="price">${formatMoney(item.course_details.price)}</strong>
        </div>
      `
    )
    .join("");

  calculateCartTotal();
}

function handleAuthForms() {
  document.querySelectorAll("[data-auth-form]").forEach((form) => {
    if (form.hasAttribute("data-api-auth")) {
      return;
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = form.querySelector("[data-form-message]");

      const isLoginForm = form.closest("[data-login-panel]") !== null;
      const isRegisterForm = form.closest("[data-register-panel]") !== null;
      const isAuthForm = isLoginForm || isRegisterForm;

      if (isLoginForm) {
        const identityInput = form.querySelector('input[name="loginIdentity"]');
        const passwordInput = form.querySelector('input[name="loginPassword"]');
        const roleSelect = form.querySelector('[data-login-role]');
        const adminCodeInput = form.querySelector('input[name="adminCode"]');

        const identity = identityInput ? identityInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value.trim() : "";
        const role = roleSelect ? roleSelect.value : "student";

        if (!identity || !password) {
          if (message) message.textContent = "Vui lòng nhập đầy đủ thông tin đăng nhập.";
          return;
        }

        if (role === "admin") {
          if (message) {
            message.textContent = "Vui long dang nhap bang he thong chinh de vao trang admin.";
          }
          return;
        }

        const username = identity.includes("@") ? identity.split("@")[0] : identity;
        setLoginUser({
          email: identity.includes("@") ? identity : username + "@jsmart.vn",
          name: username,
          loginTime: new Date().toISOString()
        });

        if (message) message.textContent = "Đăng nhập thành công! Đang chuyển hướng...";
      } else if (isRegisterForm) {
        const nameInput = form.querySelector('input[type="text"]');
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value : "user@email.com";
        const name = nameInput ? nameInput.value : email.split("@")[0];

        setLoginUser({
          email,
          name,
          loginTime: new Date().toISOString()
        });

        if (message) message.textContent = "Đăng ký thành công! Đang chuyển hướng...";
      } else {
        if (message) message.textContent = "Đã lưu thay đổi thành công!";
      }

      if (isAuthForm) {
        const roleSelect = form.querySelector('[data-login-role]');
        const role = roleSelect ? roleSelect.value : "student";
        if (isLoginForm && role === "admin") {
          return;
        }
        setTimeout(() => {
          window.location.href = "profile.html";
        }, 800);
      } else {
        form.reset();
      }
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

function initLoginRoleToggle() {
  const roleSelect = document.querySelector('[data-login-role]');
  const adminCodeWrap = document.querySelector('[data-admin-code-wrap]');
  if (!roleSelect || !adminCodeWrap) return;

  const updateVisibility = () => {
    const isAdmin = roleSelect.value === "admin";
    adminCodeWrap.hidden = !isAdmin;
  };

  roleSelect.addEventListener('change', updateVisibility);
  updateVisibility();
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

function initMobileMenu() {
  const topbarInner = document.querySelector('.topbar-inner');
  const nav = document.querySelector('.nav');
  if (!topbarInner || !nav) return;

  if (!document.querySelector('.mobile-menu-btn')) {
    const btn = document.createElement('button');
    btn.className = 'mobile-menu-btn';
    btn.innerHTML = '☰';
    btn.setAttribute('aria-label', 'Toggle mobile menu');

    const actions = document.querySelector('.actions');
    if (actions) {
      topbarInner.insertBefore(btn, actions);
    } else {
      topbarInner.appendChild(btn);
    }

    btn.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }
}

function getAdminUser() {
  const user = getLoginUser();
  if (!user) return null;
  return user.role === "admin" ? user : null;
}

function loginAdmin(adminData) {
  setLoginUser(adminData);
}

function logoutAdmin() {
  logout();
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

function initFloatingChatWidget() {
  const currentPage = window.location.pathname.split('/').pop().toLowerCase();
  if (currentPage === 'chatbot.html' || document.getElementById('jsmart-chat-widget')) {
    return;
  }
  if (!document.body) {
    return;
  }
  if (!document.getElementById('jsmart-chat-widget-style')) {
    // Ensure Inter font is loaded for the chatbot
    if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Inter"]')) {
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Noto+Sans+Vietnamese:wght@400;500;700&display=swap';
      document.head.appendChild(fontLink);
    }
    const style = document.createElement('style');
    style.id = 'jsmart-chat-widget-style';
    style.textContent = `
      /* ── Launcher button (góc dưới trái, có thể kéo thả) ── */
      .jsmart-chat-launcher {
        position:fixed; left:20px; bottom:20px;
        width:62px; height:62px; border:0; border-radius:999px;
        background:linear-gradient(135deg,#ff6b8b,#fb7185);
        color:#fff; box-shadow:0 18px 40px rgba(255,107,139,0.35);
        cursor:grab; z-index:9999; display:grid; place-items:center;
        user-select:none; touch-action:none;
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .jsmart-chat-launcher:active { cursor:grabbing; transform:scale(0.95); }
      .jsmart-chat-launcher.is-dragging { box-shadow:0 24px 56px rgba(255,107,139,0.5); cursor:grabbing; }
      /* Vòng pulse xung quanh */
      .jsmart-chat-launcher::before {
        content:''; position:absolute; inset:-9px; border-radius:inherit;
        border:2px solid rgba(251,113,133,0.4);
        animation:jsmartChatPulse 1.8s infinite;
      }
      /* Icon bên trong */
      .jsmart-chat-launcher-inner {
        position:relative; display:flex; flex-direction:column;
        align-items:center; justify-content:center; gap:1px; pointer-events:none;
      }
      .jsmart-chat-launcher-icon {
        font-size:26px; animation:jsmartChatBob 2s ease-in-out infinite; line-height:1;
      }
      .jsmart-chat-launcher-label {
        font-size:9px; font-weight:700; letter-spacing:0.04em;
        opacity:0.92; line-height:1; text-transform:uppercase;
      }

      /* ── Chat panel ── */
      .jsmart-chat-panel {
        position:fixed; left:20px; bottom:96px;
        width:min(380px,calc(100vw - 28px)); height:min(560px,calc(100vh - 120px));
        background:rgba(255,255,255,0.98);
        border:1px solid rgba(15,23,42,0.08); border-radius:24px;
        box-shadow:0 30px 70px rgba(15,23,42,0.18);
        overflow:hidden; z-index:9998; display:flex; flex-direction:column;
        opacity:0; transform:translateY(12px) scale(0.97); pointer-events:none;
        transition:opacity 0.22s ease,transform 0.22s ease;
        font-family:"Inter","Noto Sans Vietnamese",-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;
      }
      .jsmart-chat-panel.is-open { opacity:1; transform:translateY(0) scale(1); pointer-events:auto; }

      /* Header */
      .jsmart-chat-header { padding:14px 16px; background:linear-gradient(135deg,#ff6b8b,#fb7185); color:#fff; display:flex; justify-content:space-between; align-items:center; gap:12px; }
      .jsmart-chat-header strong { display:block; font-size:0.98rem; }
      .jsmart-chat-header small { opacity:0.9; }
      .jsmart-chat-close { width:32px;height:32px;border:0;border-radius:999px;background:rgba(255,255,255,0.18);color:#fff;font-size:18px;cursor:pointer; }

      /* Messages */
      .jsmart-chat-messages { flex:1;overflow-y:auto;padding:16px;display:grid;gap:12px;background:linear-gradient(rgba(253,242,248,.96),rgba(253,242,248,.96)); }
      .jsmart-chat-message { max-width:86%;padding:12px 14px;border-radius:16px;line-height:1.65;font-size:0.95rem; }
      .jsmart-chat-message.user { margin-left:auto;background:linear-gradient(135deg,#ff6b8b,#fb7185);color:#fff;border-top-right-radius:6px; }
      .jsmart-chat-message.bot { background:#fff;color:#0f172a;border:1px solid rgba(15,23,42,0.08);border-top-left-radius:6px; }
      .jsmart-chat-message h3,.jsmart-chat-message p { margin:0 0 0.55em; }
      .jsmart-chat-message ul { margin:0.45em 0 0.45em 1.2em; }

      /* Composer */
      .jsmart-chat-composer { border-top:1px solid rgba(15,23,42,0.08);padding:12px;background:#fff; }
      .jsmart-chat-quick { display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px; }
      .jsmart-chat-chip { border:1px solid rgba(255,107,139,0.2);background:rgba(255,107,139,0.08);color:#d65172;border-radius:999px;padding:8px 10px;cursor:pointer;font-size:0.85rem; }
      .jsmart-chat-input { width:100%;min-height:72px;border:1px solid rgba(15,23,42,0.12);border-radius:14px;padding:12px;resize:vertical;font:inherit; }
      .jsmart-chat-actions { display:flex;gap:10px;margin-top:10px; }
      .jsmart-chat-send { flex:1;border:0;border-radius:14px;background:linear-gradient(135deg,#ff6b8b,#fb7185);color:#fff;padding:12px 14px;font-weight:700;cursor:pointer; }
      .jsmart-chat-send:disabled { opacity:0.7;cursor:not-allowed; }

      /* Typing dots */
      .jsmart-chat-typing { display:inline-flex;gap:6px;align-items:center; }
      .jsmart-chat-typing span { width:8px;height:8px;border-radius:50%;background:#fb7185;animation:jsmartChatBounce 0.9s infinite ease-in-out; }
      .jsmart-chat-typing span:nth-child(2) { animation-delay:0.12s; }
      .jsmart-chat-typing span:nth-child(3) { animation-delay:0.24s; }

      /* Keyframes */
      @keyframes jsmartChatPulse { 0%{transform:scale(0.94);opacity:0.8}70%{transform:scale(1.15);opacity:0}100%{transform:scale(1.15);opacity:0} }
      @keyframes jsmartChatBob { 0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)} }
      @keyframes jsmartChatBounce { 0%,80%,100%{transform:scale(0.7);opacity:0.45}40%{transform:scale(1);opacity:1} }

      @media(max-width:640px){
        .jsmart-chat-panel{ left:10px; right:10px; bottom:86px; width:auto; height:min(72vh,560px); }
      }
    `;
    document.head.appendChild(style);
  }

  const widget = document.createElement('div');
  widget.id = 'jsmart-chat-widget';
  widget.innerHTML = `
    <button type="button" class="jsmart-chat-launcher" aria-label="Mở chatbot JSMART" title="Kéo để di chuyển • Click để mở">
      <div class="jsmart-chat-launcher-inner">
        <span class="jsmart-chat-launcher-icon">💬</span>
      </div>
    </button>
    <section class="jsmart-chat-panel" aria-hidden="true">
      <div class="jsmart-chat-header">
        <div>
          <strong>JSMART Sensei AI</strong>
          <small>Hỏi ngữ pháp, Kanji, từ vựng và phân tích câu</small>
        </div>
        <button type="button" class="jsmart-chat-close" aria-label="Đóng chatbot">×</button>
      </div>
      <div class="jsmart-chat-messages"></div>
      <div class="jsmart-chat-composer">
        <div class="jsmart-chat-quick">
          <button type="button" class="jsmart-chat-chip" data-prompt="Giải thích ngữ pháp 〜ように và cho 2 ví dụ">〜ように</button>
          <button type="button" class="jsmart-chat-chip" data-prompt="Phân tích câu: 日本へ行くために日本語を勉強しています。">Phân tích câu</button>
          <button type="button" class="jsmart-chat-chip" data-prompt="Giải thích từ vựng 勉強, gồm nghĩa, cách đọc, ví dụ và sắc thái">Từ vựng 勉強</button>
        </div>
        <textarea class="jsmart-chat-input" rows="3" placeholder="Nhập câu hỏi bằng tiếng Việt hoặc tiếng Nhật..."></textarea>
        <div class="jsmart-chat-actions">
          <button type="button" class="jsmart-chat-send">Gửi</button>
        </div>
      </div>
    </section>
  `;
  document.body.appendChild(widget);

  const launcher = widget.querySelector('.jsmart-chat-launcher');
  const panel = widget.querySelector('.jsmart-chat-panel');
  const closeButton = widget.querySelector('.jsmart-chat-close');
  const messages = widget.querySelector('.jsmart-chat-messages');
  const input = widget.querySelector('.jsmart-chat-input');
  const sendButton = widget.querySelector('.jsmart-chat-send');
  const promptButtons = widget.querySelectorAll('[data-prompt]');
  const history = [];

  function escapeHtml(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function markdownToHtml(markdown) {
    const escaped = escapeHtml(markdown);
    const lines = escaped.split(/\r?\n/);
    let html = '';
    let inList = false;
    const flushList = () => { if (inList) { html += '</ul>'; inList = false; } };
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) { flushList(); continue; }
      if (trimmed.startsWith('### ')) { flushList(); html += '<h3>' + trimmed.slice(4) + '</h3>'; continue; }
      if (trimmed.startsWith('## ')) { flushList(); html += '<h2>' + trimmed.slice(3) + '</h2>'; continue; }
      if (trimmed.startsWith('# ')) { flushList(); html += '<h1>' + trimmed.slice(2) + '</h1>'; continue; }
      if (trimmed.startsWith('- ')) { if (!inList) { html += '<ul>'; inList = true; } html += '<li>' + trimmed.slice(2) + '</li>'; continue; }
      flushList();
      html += '<p>' + trimmed + '</p>';
    }
    flushList();
    return html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\`(.+?)\`/g, '<code>$1</code>');
  }

  function appendMessage(role, content, isMarkdown) {
    const wrapper = document.createElement('div');
    wrapper.className = 'jsmart-chat-message ' + role;
    wrapper.innerHTML = isMarkdown ? markdownToHtml(content) : '<p>' + escapeHtml(content).replace(/\n/g, '<br>') + '</p>';
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  }

  function appendTyping() {
    const el = document.createElement('div');
    el.className = 'jsmart-chat-message bot';
    el.innerHTML = '<div class="jsmart-chat-typing"><span></span><span></span><span></span></div>';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function renderWelcome() {
    messages.innerHTML = '<div class="jsmart-chat-message bot"><h3>Xin chào, mình là JSMART Sensei AI.</h3><p>Bạn có thể hỏi:</p><ul><li>「〜ように」 và 「〜ために」 khác nhau thế nào?</li><li>Giải thích câu: <strong>日本へ行くために日本語を勉強しています。</strong></li><li>Kanji 「勉強」 có nghĩa gì, cách nhớ ra sao?</li></ul></div>';
  }

  async function sendMessage(rawText) {
    const text = rawText.trim();
    if (!text) return;
    appendMessage('user', text);
    history.push({ role: 'user', content: text });
    input.value = '';
    sendButton.disabled = true;
    const typing = appendTyping();
    try {
      const response = await fetch(CHATBOT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, mode: 'general', history: history.slice(-8) })
      });
      const data = await response.json();
      typing.remove();
      if (!response.ok) {
        appendMessage('bot', '**Lỗi:** ' + (data.error || 'Không thể tạo phản hồi lúc này.'));
        return;
      }
      const reply = data.reply || 'Không nhận được phản hồi từ Gemini.';
      appendMessage('bot', reply, true);
      history.push({ role: 'assistant', content: reply });
    } catch (error) {
      typing.remove();
      appendMessage('bot', '**Lỗi kết nối:** ' + error.message);
    } finally {
      sendButton.disabled = false;
    }
  }

  // ── Drag-to-move logic ──
  // Phân biệt click thường vs kéo: nếu di chuyển > 5px thì coi là drag, không toggle panel
  let dragStartX = 0, dragStartY = 0;
  let isDragging = false;
  let launcherLeft = 20, launcherBottom = 20; // vị trí hiện tại (px từ cạnh left/bottom)

  function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

  // Cập nhật vị trí panel chat theo launcher
  function updatePanelPosition() {
    const panelH = panel.offsetHeight || 560;
    const panelW = panel.offsetWidth || 380;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const launcherSize = 62;

    // Panel mở phía trên launcher, căn theo trái
    let pLeft = launcherLeft;
    let pBottom = launcherBottom + launcherSize + 12;

    // Tránh tràn phải
    if (pLeft + panelW > vpW - 10) pLeft = vpW - panelW - 10;
    // Tránh tràn trên
    if (vpH - pBottom - panelH < 10) pBottom = vpH - panelH - 10;

    panel.style.left = pLeft + 'px';
    panel.style.bottom = pBottom + 'px';
    panel.style.right = 'auto';
    panel.style.top = 'auto';
  }

  // Mouse drag
  launcher.addEventListener('mousedown', (e) => {
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    isDragging = false;
    launcher.classList.add('is-dragging');

    const startLeft = launcher.getBoundingClientRect().left;
    const startBottom = window.innerHeight - launcher.getBoundingClientRect().bottom;

    function onMouseMove(ev) {
      const dx = ev.clientX - dragStartX;
      const dy = ev.clientY - dragStartY;
      if (!isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) isDragging = true;
      if (!isDragging) return;

      const newLeft = clamp(startLeft + dx, 0, window.innerWidth - 62);
      const newBottom = clamp(startBottom - dy, 0, window.innerHeight - 62);
      launcherLeft = newLeft;
      launcherBottom = newBottom;
      launcher.style.left = newLeft + 'px';
      launcher.style.bottom = newBottom + 'px';
      launcher.style.right = 'auto';
      if (panel.classList.contains('is-open')) updatePanelPosition();
    }

    function onMouseUp() {
      launcher.classList.remove('is-dragging');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // Touch drag
  launcher.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    dragStartX = t.clientX;
    dragStartY = t.clientY;
    isDragging = false;
    launcher.classList.add('is-dragging');

    const startLeft = launcher.getBoundingClientRect().left;
    const startBottom = window.innerHeight - launcher.getBoundingClientRect().bottom;

    function onTouchMove(ev) {
      const touch = ev.touches[0];
      const dx = touch.clientX - dragStartX;
      const dy = touch.clientY - dragStartY;
      if (!isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) isDragging = true;
      if (!isDragging) return;
      ev.preventDefault();

      const newLeft = clamp(startLeft + dx, 0, window.innerWidth - 62);
      const newBottom = clamp(startBottom - dy, 0, window.innerHeight - 62);
      launcherLeft = newLeft;
      launcherBottom = newBottom;
      launcher.style.left = newLeft + 'px';
      launcher.style.bottom = newBottom + 'px';
      launcher.style.right = 'auto';
      if (panel.classList.contains('is-open')) updatePanelPosition();
    }

    function onTouchEnd() {
      launcher.classList.remove('is-dragging');
      launcher.removeEventListener('touchmove', onTouchMove);
      launcher.removeEventListener('touchend', onTouchEnd);
    }

    launcher.addEventListener('touchmove', onTouchMove, { passive: false });
    launcher.addEventListener('touchend', onTouchEnd);
  }, { passive: true });

  // Click để toggle (chỉ khi không phải drag)
  launcher.addEventListener('click', () => {
    if (isDragging) return; // bỏ qua nếu vừa kéo xong
    const isOpen = panel.classList.toggle('is-open');
    panel.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen) {
      updatePanelPosition();
      input.focus();
    }
  });

  closeButton.addEventListener('click', () => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
  });
  sendButton.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(input.value); }
  });
  promptButtons.forEach((button) => {
    button.addEventListener('click', () => { input.value = button.getAttribute('data-prompt') || ''; input.focus(); });
  });
  renderWelcome();
}

function initStandardHeader() {
  updateUIBasedOnLogin();
  initNavState();

  const logoutButtons = document.querySelectorAll("[data-logout-btn]");
  logoutButtons.forEach((button) => {
    button.addEventListener("click", logout);
  });
}

function initAdminShell() {
  const admin = getAdminUser();
  if (!admin) {
    window.location.href = "login.html";
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

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop().toLowerCase();
  const user = getLoginUser();
  const adminUser = getAdminUser();
  const tokens = getAuthTokens();
  const isAuthenticated = Boolean(user && tokens && tokens.access);

  // If already logged in as admin and trying to access login/register → go to admin-home
  if ((adminUser || (isAuthenticated && user.role === 'admin')) && (path === 'login.html' || path === 'register.html')) {
    window.location.href = "admin-home.html";
    return;
  }

  // If already logged in as student and trying to access login/register → go to profile
  if (isAuthenticated && !user.role && (path === 'login.html' || path === 'register.html')) {
    window.location.href = "profile.html";
    return;
  }

  updateCartCount();

  const hasCoursePageHandlers = typeof refreshCourseList === "function";
  if (!hasCoursePageHandlers) {
    renderCourses();

    const searchInput = document.getElementById('course-search-input');
    const searchBtn = document.getElementById('course-search-btn');
    const statusFilter = document.getElementById('course-status-filter');
    const levelFilter = document.getElementById('course-level-filter');

    const getCourseFilters = () => ({
      searchTerm: searchInput?.value || "",
      status: statusFilter?.value || "all",
      level: levelFilter?.value || "all"
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderCourses({ ...getCourseFilters(), searchTerm: e.target.value });
      });

      if (searchBtn) {
        searchBtn.addEventListener('click', () => {
          renderCourses(getCourseFilters());
        });
      }
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        renderCourses(getCourseFilters());
      });
    }

    if (levelFilter) {
      levelFilter.addEventListener('change', () => {
        renderCourses(getCourseFilters());
      });
    }
  }

  renderCart();
  handleAuthForms();
  initAuthToggle();
  initLoginRoleToggle();
  initNavState();
  initMobileMenu();
  updateUIBasedOnLogin();
  validateAuthSession();
  initFloatingChatWidget();

  const clearCartButton = document.querySelector("[data-clear-cart]");
  if (clearCartButton) {
    clearCartButton.addEventListener("click", async () => {
      await clearCartBackend();
      renderCart();
    });
  }

  const logoutButtons = document.querySelectorAll("[data-logout-btn]");
  logoutButtons.forEach((button) => {
    button.addEventListener("click", logout);
  });
});



window.courseCatalog = courseCatalog;
window.getLoginUser = getLoginUser;
window.setLoginUser = setLoginUser;
window.logout = logout;
window.updateUIBasedOnLogin = updateUIBasedOnLogin;
window.getAuthTokens = getAuthTokens;
window.setAuthTokens = setAuthTokens;
window.clearAuthTokens = clearAuthTokens;
window.formatMoney = formatMoney;
window.updateCartCount = updateCartCount;
window.renderCourses = renderCourses;
window.openCourseDetail = openCourseDetail;
window.closeCourseDetail = closeCourseDetail;
window.renderCart = renderCart;
window.fetchCartItems = fetchCartItems;
window.addToCartBackend = addToCartBackend;
window.removeCartItemBackend = removeCartItemBackend;
window.clearCartBackend = clearCartBackend;
window.handleAuthForms = handleAuthForms;
window.initAuthToggle = initAuthToggle;
window.initNavState = initNavState;
window.initMobileMenu = initMobileMenu;
window.getAdminUser = getAdminUser;
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.initAdminNav = initAdminNav;
window.initStandardHeader = initStandardHeader;
window.initAdminShell = initAdminShell;
window.fetchCourseList = fetchCourseList;
window.fetchCourseDetail = fetchCourseDetail;
window.normalizeCourseDetail = normalizeCourseDetail;
window.fetchMyLearning = fetchMyLearning;
window.fetchPendingAdmins = fetchPendingAdmins;
window.renderPendingAdminList = renderPendingAdminList;
