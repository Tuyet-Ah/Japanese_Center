// ===== JSMART Login Handler =====
// Hỗ trợ: admin demo (offline) + student demo (offline) + API backend (khi BE sẵn sàng)

const LOGIN_API_URL = "http://127.0.0.1:8000/educations/login/";
const PROFILE_API_URL = "http://127.0.0.1:8000/educations/profile/";

// Demo admin credentials (tạm, sẽ thay bằng BE sau)
const DEMO_ADMIN = {
  email: "admin@demo.com",
  password: "admin123",
  adminCode: "ADMIN2026"
};

function setFormMessage(node, text, isError = true) {
  if (!node) return;
  node.textContent = text;
  node.style.color = isError ? "#dc2626" : "#16a34a";
}

document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  const form = document.querySelector("[data-auth-form]");
  if (!form) return;

  const message = form.querySelector("[data-form-message]");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormMessage(message, "");

    // Lấy giá trị từ form (dùng name attribute)
    const identityInput = form.querySelector('input[name="loginIdentity"]');
    const passwordInput = form.querySelector('input[name="loginPassword"]');
    const roleSelect    = form.querySelector('[data-login-role]');
    const adminCodeInput = form.querySelector('input[name="adminCode"]');

    const identity  = identityInput  ? identityInput.value.trim()  : "";
    const password  = passwordInput  ? passwordInput.value.trim()  : "";
    const role      = roleSelect     ? roleSelect.value             : "student";
    const adminCode = adminCodeInput ? adminCodeInput.value.trim()  : "";

    if (!identity || !password) {
      setFormMessage(message, "Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    // ── ADMIN LOGIN (demo offline) ────────────────────────────────────────────
    if (role === "admin") {
      const isValidAdmin =
        identity  === DEMO_ADMIN.email &&
        password  === DEMO_ADMIN.password &&
        adminCode === DEMO_ADMIN.adminCode;

      if (!isValidAdmin) {
        setFormMessage(message, "Thông tin admin hoặc mã quản trị không đúng.");
        return;
      }

      const adminData = {
        email:     identity,
        name:      "Admin",
        role:      "admin",
        loginTime: new Date().toISOString()
      };

      // Lưu cả 2 store để guard trên các trang admin hoạt động
      loginAdmin(adminData);
      setLoginUser(adminData);

      setFormMessage(message, "✅ Đăng nhập quản trị thành công! Đang chuyển trang...", false);
      setTimeout(() => { window.location.href = "admin-home.html"; }, 700);
      return;
    }

    // ── STUDENT LOGIN (thử API trước, fallback demo) ──────────────────────────
    if (submitButton) submitButton.disabled = true;
    setFormMessage(message, "Đang xử lý...", false);

    try {
      const response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: identity, password })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFormMessage(message, data.detail || data.error || "Đăng nhập thất bại. Kiểm tra lại thông tin.");
        return;
      }

      // Lưu tokens
      if (typeof setAuthTokens === "function") {
        setAuthTokens({ access: data.access, refresh: data.refresh });
      }

      // Lấy thông tin profile
      let profile = null;
      try {
        const profileResponse = await fetch(PROFILE_API_URL, {
          headers: { Authorization: `Bearer ${data.access}` }
        });
        if (profileResponse.ok) profile = await profileResponse.json();
      } catch { /* ignore */ }

      const username  = profile?.username  || identity.split("@")[0];
      const userEmail = profile?.email     || identity;
      const userRole  = profile?.role      || "student";

      setLoginUser({
        name:      username,
        email:     userEmail,
        role:      userRole,
        loginTime: new Date().toISOString()
      });

      setFormMessage(message, "✅ Đăng nhập thành công! Đang chuyển trang...", false);
      setTimeout(() => {
        window.location.href = userRole === "admin" ? "admin-home.html" : "profile.html";
      }, 700);

    } catch {
      // Backend chưa kết nối → đăng nhập demo student
      const username = identity.includes("@") ? identity.split("@")[0] : identity;
      setLoginUser({
        email:     identity.includes("@") ? identity : username + "@jsmart.vn",
        name:      username,
        role:      "student",
        loginTime: new Date().toISOString()
      });
      setFormMessage(message, "✅ Đăng nhập thành công (chế độ demo)! Đang chuyển trang...", false);
      setTimeout(() => { window.location.href = "profile.html"; }, 700);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});