const AUTH_API_BASE_URL = window.API_BASE_URL || "http://127.0.0.1:8000/educations";

function setFormMessage(node, text) {
  if (!node) return;
  node.textContent = text;
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

    if (submitButton) submitButton.disabled = true;

    try {
      console.log("[auth] login request ->", `${AUTH_API_BASE_URL}/login/`);
      const response = await fetch(`${AUTH_API_BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      console.log("[auth] login response", response.status);

      const data = await response.json().catch(() => ({}));
      console.log("[auth] login data", data);

      if (!response.ok) {
        if (response.status === 401) {
          setFormMessage(message, "Ten dang nhap hoac mat khau bi sai.");
        } else {
          setFormMessage(message, data.detail || data.error || "Dang nhap that bai.");
        }
        return;
      }

      if (typeof setAuthTokens === "function") {
        setAuthTokens({ access: data.access, refresh: data.refresh });
      } else {
        localStorage.setItem("japaneseCenterAuthTokens", JSON.stringify({ access: data.access, refresh: data.refresh }));
      }

      let profile = null;
      try {
        const profileResponse = await fetch(`${AUTH_API_BASE_URL}/profile/`, {
          headers: { Authorization: `Bearer ${data.access}` }
        });
        if (profileResponse.ok) {
          profile = await profileResponse.json();
        }
      } catch {
        profile = null;
      }

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
      window.location.href = role === "admin" ? "admin-dashboard.html" : "Home.html";
    } catch (error) {
      setFormMessage(message, "Khong the ket noi den may chu. Vui long thu lai.");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});