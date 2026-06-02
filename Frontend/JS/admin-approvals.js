function formatRelativeTime(value) {
  const parsed = new Date(value);
  if (!value || Number.isNaN(parsed.getTime())) return "Vừa tham gia";

  const diffMs = Date.now() - parsed.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Vừa tham gia";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ngày trước`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} tháng trước`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} năm trước`;
}

function getRoleBadge(role) {
  const roles = {
    admin: { emoji: "⚙️", label: "Admin", cls: "role-admin" },
    teacher: { emoji: "👨‍🏫", label: "Giáo viên", cls: "role-teacher" },
    student: { emoji: "🎓", label: "Học viên", cls: "role-student" },
  };
  return roles[role] || { emoji: "👤", label: role || "Khác", cls: "role-other" };
}

function formatUserCard(user) {
  const username = escapeHtml(user.username || "");
  const email = escapeHtml(user.email || "");
  const phone = escapeHtml(user.phone || "");
  const address = escapeHtml(user.address || "");
  const id = user.id;
  const joinedAgo = formatRelativeTime(user.date_joined);
  const roleBadge = getRoleBadge(user.role);

  return `
    <div class="approval-card" data-admin-id="${id}">
      <div class="approval-header">
        <div class="approval-badge ${roleBadge.cls}">${roleBadge.emoji} ${roleBadge.label}</div>
        <span class="approval-date">Tham gia: ${joinedAgo}</span>
      </div>
      <div class="approval-content">
        <h3>${username || "(Không có username)"}</h3>
        <div class="approval-details">
          <p><strong>Email:</strong> ${email || "-"}</p>
          <p><strong>Số điện thoại:</strong> ${phone || "-"}</p>
          <p><strong>Địa chỉ:</strong> ${address || "-"}</p>
        </div>
        <div class="approval-actions">
          <button class="btn btn-danger" data-delete-id="${id}">🗑️ Xóa</button>
        </div>
      </div>
    </div>
  `;
}

async function deleteUser(userId) {
  const tokens = typeof getAuthTokens === "function" ? getAuthTokens() : null;
  if (!tokens || !tokens.access) {
    alert("Cần đăng nhập admin.");
    return false;
  }

  const response = await fetch(`${API_BASE_URL}/admin-approvals/${userId}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.access}`
    }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    alert(data.error || "Không thể xóa tài khoản.");
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  initAdminShell();

  const listNode = document.getElementById("pendingAdminsList");
  const countNode = document.getElementById("pendingAdminsCount");
  const searchInput = document.getElementById("searchInput");
  const roleFilter = document.getElementById("roleFilter");
  const modal = document.getElementById("confirmModal");
  const modalTitle = document.getElementById("confirmModalTitle");
  const modalMessage = document.getElementById("confirmModalMessage");
  const modalCancel = document.getElementById("confirmModalCancel");
  const modalOk = document.getElementById("confirmModalOk");
  let onConfirm = null;
  let allUsers = [];

  const openConfirmModal = ({ title, message, confirmLabel, confirmClass, action }) => {
    if (!modal || !modalTitle || !modalMessage || !modalOk) return;
    modalTitle.textContent = title || "Xác nhận";
    modalMessage.textContent = message || "Bạn chắc chắn?";
    modalOk.textContent = confirmLabel || "Đồng ý";
    modalOk.className = "btn " + (confirmClass || "btn-danger");
    onConfirm = action;
    modal.hidden = false;
  };

  const closeConfirmModal = () => {
    if (!modal) return;
    modal.hidden = true;
    onConfirm = null;
  };

  modalCancel?.addEventListener("click", closeConfirmModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeConfirmModal();
  });
  modalOk?.addEventListener("click", async () => {
    if (typeof onConfirm === "function") {
      await onConfirm();
    }
    closeConfirmModal();
  });

  const getFilteredUsers = () => {
    const searchTerm = (searchInput?.value || "").toLowerCase().trim();
    const roleValue = roleFilter?.value || "all";

    return allUsers.filter((user) => {
      const matchRole = roleValue === "all" || user.role === roleValue;
      const matchSearch =
        !searchTerm ||
        (user.username || "").toLowerCase().includes(searchTerm) ||
        (user.email || "").toLowerCase().includes(searchTerm) ||
        (user.phone || "").toLowerCase().includes(searchTerm);
      return matchRole && matchSearch;
    });
  };

  const renderList = (users) => {
    if (!listNode) return;
    if (!Array.isArray(users) || users.length === 0) {
      listNode.innerHTML = '<p class="pending-empty">Không có tài khoản nào.</p>';
      if (countNode) countNode.textContent = "0";
      return;
    }
    listNode.innerHTML = users.map(formatUserCard).join("");
    if (countNode) countNode.textContent = String(users.length);

    // Bind delete buttons
    listNode.querySelectorAll("[data-delete-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.getAttribute("data-delete-id");
        if (!id) return;
        openConfirmModal({
          title: "Xác nhận xóa",
          message: "Bạn xác nhận xóa tài khoản này? Hành động này không thể hoàn tác.",
          confirmLabel: "Xóa",
          confirmClass: "btn-danger",
          action: async () => {
            button.disabled = true;
            const ok = await deleteUser(id);
            if (ok) {
              // Remove from allUsers array
              allUsers = allUsers.filter((u) => String(u.id) !== String(id));
              renderList(getFilteredUsers());
            } else {
              button.disabled = false;
            }
          }
        });
      });
    });
  };

  // Search & filter handlers
  searchInput?.addEventListener("input", () => {
    renderList(getFilteredUsers());
  });

  roleFilter?.addEventListener("change", () => {
    renderList(getFilteredUsers());
  });

  // Initial load
  if (typeof fetchPendingAdmins === "function") {
    fetchPendingAdmins()
      .then((users) => {
        allUsers = Array.isArray(users) ? users : [];
        renderList(allUsers);
      })
      .catch(() => renderList([]));
  } else {
    renderList([]);
  }
});