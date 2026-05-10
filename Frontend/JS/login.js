function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const toggleButton = document.querySelector("[data-toggle-password]");

  if (toggleButton) {
    toggleButton.addEventListener("click", () => togglePasswordVisibility("loginPassword"));
  }

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

    if (emailError) emailError.textContent = "";
    if (passwordError) passwordError.textContent = "";

    let isValid = true;
    if (!email || !email.value.trim()) {
      if (emailError) emailError.textContent = "Vui lòng nhập email";
      isValid = false;
    }
    if (!password || !password.value.trim()) {
      if (passwordError) passwordError.textContent = "Vui lòng nhập mật khẩu";
      isValid = false;
    }

    if (!isValid) return;

    const user = {
      email: email.value.trim(),
      name: email.value.split("@")[0],
      loginTime: new Date().toISOString()
    };

    setLoginUser(user);
    window.location.href = "Home.html";
  });
});