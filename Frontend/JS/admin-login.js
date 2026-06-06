document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminLoginForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("adminEmail")?.value.trim();
    const password = document.getElementById("adminPassword")?.value.trim();
    const code = document.getElementById("adminCode")?.value.trim();

    if (email === "admin@demo.com" && password === "admin123" && code === "ADMIN2026") {
      loginAdmin({
        email,
        name: "Admin",
        role: "admin",
        loginTime: new Date().toISOString()
      });
      window.location.href = "admin-home.html";
      return;
    }

    showAppToast("Email, mật khẩu hoặc mã admin không đúng!", "error");
  });
});