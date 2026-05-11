document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();
  handleAuthForms();

  // Additional login-specific validation
  const form = document.getElementById("loginForm");
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