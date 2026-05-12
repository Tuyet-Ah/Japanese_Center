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

  const updateModal = document.querySelector('[data-profile-modal="update"]');
  const passwordModal = document.querySelector('[data-profile-modal="password"]');
  const updateForm = document.querySelector('[data-profile-update-form]');
  const passwordForm = document.querySelector('[data-password-form]');
  const updateMessage = document.querySelector('[data-profile-update-message]');
  const passwordMessage = document.querySelector('[data-password-message]');

  const profileName = document.querySelector('[data-profile-name]');
  const profileFullname = document.querySelector('[data-profile-fullname]');
  const profileEmail = document.querySelector('[data-profile-email]');
  const profileDob = document.querySelector('[data-profile-dob]');
  const profilePhone = document.querySelector('[data-profile-phone]');
  const profileGender = document.querySelector('[data-profile-gender]');

  const formatDateForInput = (value) => {
    if (!value) return "";
    if (value.includes("-")) return value;
    const parts = value.split("/");
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const formatDateForDisplay = (value) => {
    if (!value) return "";
    if (value.includes("/")) return value;
    const parts = value.split("-");
    if (parts.length !== 3) return value;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  const openModal = (modal) => {
    if (!modal) return;
    modal.hidden = false;
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.hidden = true;
  };

  document.querySelector('[data-open-profile-update]')?.addEventListener('click', () => {
    if (!updateForm) return;
    const user = getLoginUser() || {};
    updateForm.fullName.value = user.fullName || user.name || profileFullname?.textContent || "";
    updateForm.email.value = user.email || profileEmail?.textContent || "";
    updateForm.dob.value = formatDateForInput(user.dob || profileDob?.textContent || "");
    updateForm.phone.value = user.phone || profilePhone?.textContent || "";
    updateForm.gender.value = user.gender || profileGender?.textContent || "";
    if (updateMessage) updateMessage.textContent = "";
    openModal(updateModal);
  });

  document.querySelector('[data-open-password-change]')?.addEventListener('click', () => {
    if (!passwordForm) return;
    passwordForm.reset();
    if (passwordMessage) passwordMessage.textContent = "";
    openModal(passwordModal);
  });

  document.querySelectorAll('[data-close-profile-modal]').forEach((button) => {
    button.addEventListener('click', () => {
      closeModal(updateModal);
      closeModal(passwordModal);
    });
  });

  [updateModal, passwordModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  if (updateForm) {
    updateForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const user = getLoginUser() || {};
      const fullName = updateForm.fullName.value.trim();
      const email = updateForm.email.value.trim();
      const dobInput = updateForm.dob.value;
      const phone = updateForm.phone.value.trim();
      const gender = updateForm.gender.value;

      const updatedUser = {
        ...user,
        name: fullName || user.name,
        fullName: fullName || user.fullName,
        email: email || user.email,
        dob: dobInput || user.dob,
        phone: phone || user.phone,
        gender: gender || user.gender
      };

      setLoginUser(updatedUser);

      if (profileName) profileName.textContent = updatedUser.fullName || updatedUser.name || "";
      if (profileFullname) profileFullname.textContent = updatedUser.fullName || updatedUser.name || "";
      if (profileEmail) profileEmail.textContent = updatedUser.email || "";
      if (profileDob) profileDob.textContent = formatDateForDisplay(updatedUser.dob || "");
      if (profilePhone) profilePhone.textContent = updatedUser.phone || "";
      if (profileGender) profileGender.textContent = updatedUser.gender || "";

      if (updateMessage) updateMessage.textContent = "Đã lưu thay đổi.";
      setTimeout(() => closeModal(updateModal), 600);
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const user = getLoginUser() || {};
      const currentPassword = passwordForm.currentPassword.value;
      const newPassword = passwordForm.newPassword.value;
      const confirmPassword = passwordForm.confirmPassword.value;

      if (newPassword !== confirmPassword) {
        if (passwordMessage) passwordMessage.textContent = "Mật khẩu mới không khớp.";
        return;
      }

      if (user.password && currentPassword !== user.password) {
        if (passwordMessage) passwordMessage.textContent = "Mật khẩu hiện tại không đúng.";
        return;
      }

      setLoginUser({ ...user, password: newPassword });
      if (passwordMessage) passwordMessage.textContent = "Đổi mật khẩu thành công.";
      setTimeout(() => closeModal(passwordModal), 600);
    });
  }
});