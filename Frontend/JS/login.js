const API_BASE_URL = "http://127.0.0.1:8000/educations";

function setFormMessage(node, text) {
  if (!node) return;
  node.textContent = text;
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

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!email || !password) {
      setFormMessage(message, "Vui long nhap day du email va mat khau.");
      return;
    }

    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFormMessage(message, data.detail || data.error || "Dang nhap that bai.");
        return;
      }

      if (typeof setAuthTokens === "function") {
        setAuthTokens({ access: data.access, refresh: data.refresh });
      } else {
        localStorage.setItem("japaneseCenterAuthTokens", JSON.stringify({ access: data.access, refresh: data.refresh }));
      }

      let profile = null;
      try {
        const profileResponse = await fetch(`${API_BASE_URL}/profile/`, {
          headers: { Authorization: `Bearer ${data.access}` }
        });
        if (profileResponse.ok) {
          profile = await profileResponse.json();
        }
      } catch {
        profile = null;
      }

      const username = profile && profile.username ? profile.username : email.split("@")[0];
      const userEmail = profile && profile.email ? profile.email : email;

      setLoginUser({
        name: username,
        email: userEmail,
        role: profile ? profile.role : "student",
        loginTime: new Date().toISOString()
      });

      window.location.href = "Home.html";
    } catch (error) {
      setFormMessage(message, "Khong the ket noi den may chu. Vui long thu lai.");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});