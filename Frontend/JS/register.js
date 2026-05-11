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

async function loginAfterRegister(username, password) {
  const response = await fetch(`${AUTH_API_BASE_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
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
    const profileResponse = await fetch(`${AUTH_API_BASE_URL}/profile/`, {
      headers: { Authorization: `Bearer ${data.access}` }
    });
    if (profileResponse.ok) {
      profile = await profileResponse.json();
    }
  } catch {
    profile = null;
  }

  const displayName = profile && profile.username ? profile.username : username;
  const userEmail = profile && profile.email ? profile.email : "";

  persistLoginUser({
    name: displayName,
    email: userEmail,
    role: profile ? profile.role : "student",
    loginTime: new Date().toISOString()
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof initStandardHeader === "function") {
    initStandardHeader();
  }

  console.log("[auth] register.js loaded");

  const form = document.querySelector("[data-auth-form]");
  if (!form) return;

  const message = form.querySelector("[data-form-message]");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("[auth] register submit");
    setFormMessage(message, "");

    const nameInput = document.getElementById("registerName");
    const usernameInput = document.getElementById("registerUsername");
    const emailInput = document.getElementById("registerEmail");
    const phoneInput = document.getElementById("registerPhone");
    const genderInput = document.getElementById("registerGender");
    const goalInput = document.getElementById("registerGoal");
    const passwordInput = document.getElementById("registerPassword");
    const passwordConfirmInput = document.getElementById("registerPasswordConfirm");

    const name = nameInput ? nameInput.value.trim() : "";
    const username = usernameInput ? usernameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const gender = genderInput ? genderInput.value.trim() : "";
    const goal = goalInput ? goalInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";
    const passwordConfirm = passwordConfirmInput ? passwordConfirmInput.value : "";

    console.log("[auth] register payload", {
      username,
      email,
      phone,
      hasPassword: Boolean(password),
      hasConfirm: Boolean(passwordConfirm)
    });

    if (!name || !username || !email || !phone || !gender || !goal || !password) {
      setFormMessage(message, "Vui long nhap day du thong tin.");
      return;
    }

    if (password !== passwordConfirm) {
      setFormMessage(message, "Mat khau xac nhan khong khop.");
      return;
    }

    if (submitButton) submitButton.disabled = true;

    try {
      console.log("[auth] register request ->", `${AUTH_API_BASE_URL}/register/`);
      const registerResponse = await fetch(`${AUTH_API_BASE_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          email,
          phone,
          address: ""
        })
      });

      console.log("[auth] register response", registerResponse.status);

      const registerData = await registerResponse.json().catch(() => ({}));
      console.log("[auth] register data", registerData);

      if (!registerResponse.ok) {
        const errorText = registerData.error || registerData.detail || "Dang ky that bai.";
        setFormMessage(message, errorText);
        return;
      }

      await loginAfterRegister(username, password);
      setFormMessage(message, "Dang chuyen huong...");
      window.location.href = "Home.html";
    } catch (error) {
      setFormMessage(message, error.message || "Khong the ket noi den may chu.");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});