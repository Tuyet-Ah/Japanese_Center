const API_BASE_URL = "http://127.0.0.1:8000/educations";

function setFormMessage(node, text) {
  if (!node) return;
  node.textContent = text;
}

async function loginAfterRegister(email, password) {
  const response = await fetch(`${API_BASE_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.error || "Dang nhap that bai.");
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

    const nameInput = document.getElementById("registerName");
    const emailInput = document.getElementById("registerEmail");
    const phoneInput = document.getElementById("registerPhone");
    const genderInput = document.getElementById("registerGender");
    const goalInput = document.getElementById("registerGoal");
    const passwordInput = document.getElementById("registerPassword");
    const passwordConfirmInput = document.getElementById("registerPasswordConfirm");

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const gender = genderInput ? genderInput.value.trim() : "";
    const goal = goalInput ? goalInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";
    const passwordConfirm = passwordConfirmInput ? passwordConfirmInput.value : "";

    if (!name || !email || !phone || !gender || !goal || !password) {
      setFormMessage(message, "Vui long nhap day du thong tin.");
      return;
    }

    if (password !== passwordConfirm) {
      setFormMessage(message, "Mat khau xac nhan khong khop.");
      return;
    }

    if (submitButton) submitButton.disabled = true;

    try {
      const registerResponse = await fetch(`${API_BASE_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          password,
          email,
          phone,
          address: ""
        })
      });

      const registerData = await registerResponse.json().catch(() => ({}));

      if (!registerResponse.ok) {
        setFormMessage(message, registerData.error || registerData.detail || "Dang ky that bai.");
        return;
      }

      await loginAfterRegister(email, password);
      window.location.href = "Home.html";
    } catch (error) {
      setFormMessage(message, error.message || "Khong the ket noi den may chu.");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});