document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  const navBtns = document.querySelectorAll(".profile-nav-btn");
  const tabs = document.querySelectorAll(".profile-tab");

  navBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetTab = btn.getAttribute("data-tab");

      // Toggle active on buttons
      navBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Toggle active on tab panels
      tabs.forEach(tab => {
        tab.classList.toggle("active", tab.id === "tab-" + targetTab);
      });
    });
  });

  const avatarUpload = document.getElementById("avatarUpload");
  if (avatarUpload) {
    avatarUpload.addEventListener("change", function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const newSrc = e.target.result;
          const sidebarAvatar = document.getElementById("sidebarAvatar");
          const largeAvatar = document.getElementById("largeAvatar");
          if (sidebarAvatar) sidebarAvatar.src = newSrc;
          if (largeAvatar) largeAvatar.src = newSrc;
        }
        reader.readAsDataURL(file);
      }
    });
  }
});