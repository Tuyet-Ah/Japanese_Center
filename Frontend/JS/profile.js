document.addEventListener("DOMContentLoaded", async () => {
  initStandardHeader();

  const navBtns = document.querySelectorAll(".profile-nav-btn");
  const tabs = document.querySelectorAll(".profile-tab");
  const updateModal = document.querySelector('[data-profile-modal="update"]');
  const passwordModal = document.querySelector('[data-profile-modal="password"]');
  const updateForm = document.querySelector('[data-profile-update-form]');
  const passwordForm = document.querySelector('[data-password-form]');
  const updateMessage = document.querySelector('[data-profile-update-message]');
  const passwordMessage = document.querySelector('[data-password-message]');

  const profileName = document.querySelector('[data-profile-name]');
  const profileUsernameNodes = document.querySelectorAll('[data-profile-username]');
  const profileUserId = document.querySelector('[data-profile-user-id]');
  const profileFullname = document.querySelector('[data-profile-fullname]');
  const profileEmail = document.querySelector('[data-profile-email]');
  const profilePhone = document.querySelector('[data-profile-phone]');
  const profileAddress = document.querySelector('[data-profile-address]');
  const profileRole = document.querySelector('[data-profile-role]');
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const largeAvatar = document.getElementById('largeAvatar');
  const avatarUpload = document.getElementById("avatarUpload");
  const courseList = document.querySelector('[data-profile-courses-list]');

  let currentProfile = null;

  const openModal = (modal) => {
    if (!modal) return;
    modal.hidden = false;
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.hidden = true;
  };

  const normalizeProfile = (profile) => ({
    ...profile,
    name: profile?.full_name || profile?.username || profile?.name || "Học viên",
    full_name: profile?.full_name || profile?.username || profile?.name || "Học viên",
    role_label: profile?.role === 'admin' ? 'Quản trị viên' : profile?.role === 'teacher' ? 'Giáo viên' : 'Học viên'
  });

  const renderProfile = (profile) => {
    if (!profile) return;
    currentProfile = normalizeProfile(profile);
    setLoginUser({ ...(getLoginUser() || {}), ...currentProfile });

    if (profileName) profileName.textContent = currentProfile.full_name;
    profileUsernameNodes.forEach((node) => {
      node.textContent = currentProfile.username || "--";
    });
    if (profileUserId) profileUserId.textContent = `ID: ${currentProfile.id || currentProfile.username || '--'}`;
    if (profileFullname) profileFullname.textContent = currentProfile.full_name;
    if (profileEmail) profileEmail.textContent = currentProfile.email || "Chưa cập nhật";
    if (profilePhone) profilePhone.textContent = currentProfile.phone || "Chưa cập nhật";
    if (profileAddress) profileAddress.textContent = currentProfile.address || "Chưa cập nhật";
    if (profileRole) profileRole.textContent = currentProfile.role_label;

    const avatarSrc = currentProfile.avatar_url || "assets/icon.png";
    if (sidebarAvatar) sidebarAvatar.src = avatarSrc;
    if (largeAvatar) largeAvatar.src = avatarSrc;
  };

  const renderMyCourses = (data) => {
    if (!courseList) return;
    if (!Array.isArray(data) || !data.length) {
      courseList.innerHTML = '<div class="purchased-card">Bạn chưa đăng ký khóa học nào.</div>';
      return;
    }

    courseList.innerHTML = data
      .map((course) => {
        const progress = Number(course.progress_percentage ?? 0);
        const badge = progress >= 100 ? 'Hoàn thành' : progress > 0 ? 'Đang học' : 'Chưa bắt đầu';
        const progressClass = progress >= 100 ? 'status-done' : 'status-active';
        const progressStyle = progress >= 100 ? 'background: #86efac;' : '';
        const thumbUrl = typeof buildThumbnailUrl === 'function' ? buildThumbnailUrl(course.thumbnail) : (course.thumbnail || '');
        const thumbnailStyle = thumbUrl ? `style="background-image:url('${thumbUrl}');"` : '';
        return `
          <a href="course-learning.html?course=${course.course_id}" class="purchased-card">
            <div class="purchased-card-badge">${(course.course_title || '').split(' ')[0] || 'KH'}</div>
            <div class="purchased-card-info">
              <h3>${course.course_title}</h3>
              <div class="progress-bar-wrap">
                <div class="progress-label"><span>Tiến độ</span><span>${progress}%</span></div>
                <div class="progress-bar"><div class="progress-fill" style="width:${progress}%; ${progressStyle}"></div></div>
              </div>
            </div>
            <span class="purchased-status ${progressClass}">${badge}</span>
          </a>
        `;
      })
      .join('');
  };

  const loadBackendData = async () => {
    const profile = typeof fetchProfile === 'function' ? await fetchProfile() : null;
    if (profile) {
      renderProfile(profile);
    } else {
      const stored = getLoginUser();
      if (stored) {
        renderProfile({
          username: stored.username || stored.name || 'hocvien',
          full_name: stored.full_name || stored.fullName || stored.name || 'Học viên',
          email: stored.email || '',
          phone: stored.phone || '',
          address: stored.address || '',
          role: stored.role || 'student',
          avatar_url: stored.avatar_url || ''
        });
      }
    }

    const myLearning = typeof fetchMyLearning === 'function' ? await fetchMyLearning() : null;
    renderMyCourses(myLearning);
  };

  navBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetTab = btn.getAttribute("data-tab");
      navBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      tabs.forEach((tab) => {
        tab.classList.toggle("active", tab.id === "tab-" + targetTab);
      });
    });
  });

  if (avatarUpload) {
    avatarUpload.addEventListener("change", async function () {
      const file = this.files && this.files[0];
      if (!file) return;

      const preview = URL.createObjectURL(file);
      if (sidebarAvatar) sidebarAvatar.src = preview;
      if (largeAvatar) largeAvatar.src = preview;

      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const updated = await updateProfileBackend(formData);
        renderProfile(updated);
      } catch (error) {
        showAppToast(error.message || 'Không thể cập nhật avatar.', 'error');
      }
    });
  }

  document.querySelector('[data-open-profile-update]')?.addEventListener('click', () => {
    if (!updateForm) return;
    const profile = currentProfile || getLoginUser() || {};
    updateForm.fullName.value = profile.full_name || profile.fullName || profile.name || '';
    updateForm.email.value = profile.email || '';
    updateForm.phone.value = profile.phone || '';
    updateForm.address.value = profile.address || '';
    if (updateMessage) updateMessage.textContent = '';
    openModal(updateModal);
  });

  document.querySelector('[data-open-password-change]')?.addEventListener('click', () => {
    if (!passwordForm) return;
    passwordForm.reset();
    if (passwordMessage) passwordMessage.textContent = '';
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
      if (event.target === modal) closeModal(modal);
    });
  });

  if (updateForm) {
    updateForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (updateMessage) updateMessage.textContent = '';

      const formData = new FormData();
      formData.append('full_name', updateForm.fullName.value.trim());
      formData.append('email', updateForm.email.value.trim());
      formData.append('phone', updateForm.phone.value.trim());
      formData.append('address', updateForm.address.value.trim());

      try {
        const updated = await updateProfileBackend(formData);
        renderProfile(updated);
        if (updateMessage) updateMessage.textContent = 'Đã lưu thay đổi.';
        setTimeout(() => closeModal(updateModal), 500);
      } catch (error) {
        if (updateMessage) updateMessage.textContent = error.message || 'Không thể cập nhật thông tin.';
      }
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (passwordMessage) passwordMessage.textContent = '';

      const currentPassword = passwordForm.currentPassword.value;
      const newPassword = passwordForm.newPassword.value;
      const confirmPassword = passwordForm.confirmPassword.value;

      if (newPassword !== confirmPassword) {
        if (passwordMessage) passwordMessage.textContent = 'Mật khẩu mới không khớp.';
        return;
      }

      try {
        await changePasswordBackend(currentPassword, newPassword);
        if (passwordMessage) passwordMessage.textContent = 'Đổi mật khẩu thành công.';
        passwordForm.reset();
        setTimeout(() => closeModal(passwordModal), 500);
      } catch (error) {
        if (passwordMessage) passwordMessage.textContent = error.message || 'Không thể đổi mật khẩu.';
      }
    });
  }

  await loadBackendData();
});