const AUTH_API_BASE_URL = window.API_BASE_URL || "http://127.0.0.1:8000/educations";

const LOGIN_API_URL = "http://127.0.0.1:8000/educations/login/";
const PROFILE_API_URL = "http://127.0.0.1:8000/educations/profile/";


function setFormMessage(node, text, isError = true) {
  if (!node) return;
  node.textContent = text;
  node.style.color = isError ? "#dc2626" : "#16a34a";
}

function persistLoginUser(user) {
  if (typeof setLoginUser === "function") {
    setLoginUser(user);
  } else {
    localStorage.setItem("japaneseCenterUser", JSON.stringify(user));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof initStandardHeader === "function") {
    initStandardHeader();
  }

  console.log("[auth] login.js loaded");

  const form = document.querySelector("[data-auth-form]");
  if (!form) return;

  const message = form.querySelector("[data-form-message]");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("[auth] login submit");
    setFormMessage(message, "");

    const usernameInput = form.querySelector('input[name="loginUsername"]');
    const passwordInput = form.querySelector('input[name="loginPassword"]');
    const roleSelect = form.querySelector('[data-login-role]');

    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";
    const selectedRole = roleSelect ? roleSelect.value : "student";

    console.log("[auth] login payload", { username, role: selectedRole, hasPassword: Boolean(password) });

    if (!username || !password) {
      setFormMessage(message, "Vui long nhap day du ten dang nhap va mat khau.");
      return;
    }

    // ── STUDENT LOGIN (thử API trước, fallback demo) ──────────────────────────
    if (submitButton) submitButton.disabled = true;
    setFormMessage(message, "Đang xử lý...", false);

    try {
      console.log("[auth] login request ->", `${AUTH_API_BASE_URL}/login/`);
      const response = await fetch(`${AUTH_API_BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role: selectedRole })
      });

      console.log("[auth] login response", response.status);

      const data = await response.json().catch(() => ({}));
      console.log("[auth] login data", data);

      if (!response.ok) {
        if (response.status === 401) {
          setFormMessage(message, "Ten dang nhap hoac mat khau bi sai.");
        } else if (String(data.detail || "").toLowerCase().includes("cho duyet")) {
          setFormMessage(message, "Tai khoan admin dang cho duyet.");
        } else {
          setFormMessage(message, data.detail || data.error || "Dang nhap that bai.");
        }
        return;
      }

      // Lưu tokens
      if (typeof setAuthTokens === "function") {
        setAuthTokens({ access: data.access, refresh: data.refresh });
      }

      // Lấy thông tin profile
      let profile = null;
      try {
        const profileResponse = await fetch(`${AUTH_API_BASE_URL}/profile/`, {
          headers: { Authorization: `Bearer ${data.access}` }
        });
        if (profileResponse.ok) profile = await profileResponse.json();
      } catch { /* ignore */ }

      const displayName = profile?.full_name || profile?.username || username;
      const userEmail = profile?.email || "";
      const role = profile?.role || selectedRole;

      persistLoginUser({
        ...(profile || {}),
        name: displayName,
        full_name: displayName,
        email: userEmail,
        role,
        loginTime: new Date().toISOString()
      });
      setFormMessage(message, "Dang chuyen huong...");
      window.location.href = role === "admin" ? "admin-home.html" : "Home.html";
    } catch (error) {
      setFormMessage(message, "Khong the ket noi den may chu. Vui long thu lai.");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});