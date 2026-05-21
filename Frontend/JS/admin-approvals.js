function formatRelativeTime(value) {
  const parsed = new Date(value);
  if (!value || Number.isNaN(parsed.getTime())) return "Vua gui";

  const diffMs = Date.now() - parsed.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Vua gui";
  if (diffMinutes < 60) return `${diffMinutes} phut truoc`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} gio truoc`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ngay truoc`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} thang truoc`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} nam truoc`;
}

function formatAdminCard(admin) {
  const username = escapeHtml(admin.username || "");
  const email = escapeHtml(admin.email || "");
  const phone = escapeHtml(admin.phone || "");
  const address = escapeHtml(admin.address || "");
  const id = admin.id;
  const submittedAgo = formatRelativeTime(admin.date_joined);
  return `
    <div class="approval-card approval-admin" data-admin-id="${id}">
      <div class="approval-header">
        <div class="approval-badge">⚙️ Admin</div>
        <span class="approval-date">Gui: ${submittedAgo}</span>
      </div>
      <div class="approval-content">
        <h3>${username || "(Khong co username)"}</h3>
        <div class="approval-details">
          <p><strong>Email:</strong> ${email || "-"}</p>
          <p><strong>So dien thoai:</strong> ${phone || "-"}</p>
          <p><strong>Dia chi:</strong> ${address || "-"}</p>
        </div>
        <div class="approval-actions">
          <button class="btn btn-success" data-approve-id="${id}">✅ Duyet</button>
          <button class="btn btn-danger" data-delete-id="${id}">🗑️ Xoa</button>
        </div>
      </div>
    </div>
  `;
}

async function approveAdmin(userId) {
  const tokens = typeof getAuthTokens === "function" ? getAuthTokens() : null;
  if (!tokens || !tokens.access) {
    alert("Can dang nhap admin.");
    return false;
  }

  const response = await fetch(`${API_BASE_URL}/admin-approvals/${userId}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.access}`
    }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    alert(data.error || "Khong the duyet tai khoan.");
    return false;
  }
  return true;
}

async function deleteAdmin(userId) {
  const tokens = typeof getAuthTokens === "function" ? getAuthTokens() : null;
  if (!tokens || !tokens.access) {
    alert("Can dang nhap admin.");
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
    alert(data.error || "Khong the xoa tai khoan.");
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  initAdminShell();

  const listNode = document.getElementById("pendingAdminsList");
  const countNode = document.getElementById("pendingAdminsCount");
  const modal = document.getElementById("confirmModal");
  const modalTitle = document.getElementById("confirmModalTitle");
  const modalMessage = document.getElementById("confirmModalMessage");
  const modalCancel = document.getElementById("confirmModalCancel");
  const modalOk = document.getElementById("confirmModalOk");
  let onConfirm = null;

  const openConfirmModal = ({ title, message, confirmLabel, confirmClass, action }) => {
    if (!modal || !modalTitle || !modalMessage || !modalOk) return;
    modalTitle.textContent = title || "Xac nhan";
    modalMessage.textContent = message || "Ban chac chan?";
    modalOk.textContent = confirmLabel || "Dong y";
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

  const renderList = (admins) => {
    if (!listNode) return;
    if (!Array.isArray(admins) || admins.length === 0) {
      listNode.innerHTML = '<p class="pending-empty">Khong co tai khoan admin cho duyet.</p>';
      if (countNode) countNode.textContent = "0";
      return;
    }
    listNode.innerHTML = admins.map(formatAdminCard).join("");
    if (countNode) countNode.textContent = String(admins.length);

    listNode.querySelectorAll("[data-approve-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.getAttribute("data-approve-id");
        if (!id) return;
        openConfirmModal({
          title: "Xac nhan duyet",
          message: "Ban xac nhan duyet tai khoan admin nay?",
          confirmLabel: "Duyet",
          confirmClass: "btn-success",
          action: async () => {
            button.disabled = true;
            const ok = await approveAdmin(id);
            if (ok) {
              const card = listNode.querySelector(`[data-admin-id="${id}"]`);
              if (card) card.remove();
              const remaining = listNode.querySelectorAll(".approval-card").length;
              if (countNode) countNode.textContent = String(remaining);
              if (remaining === 0) {
                listNode.innerHTML = '<p class="pending-empty">Khong co tai khoan admin cho duyet.</p>';
              }
            } else {
              button.disabled = false;
            }
          }
        });
      });
    });

    listNode.querySelectorAll("[data-delete-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.getAttribute("data-delete-id");
        if (!id) return;
        openConfirmModal({
          title: "Xac nhan xoa",
          message: "Ban xac nhan xoa tai khoan admin nay?",
          confirmLabel: "Xoa",
          confirmClass: "btn-danger",
          action: async () => {
            button.disabled = true;
            const ok = await deleteAdmin(id);
            if (ok) {
              const card = listNode.querySelector(`[data-admin-id="${id}"]`);
              if (card) card.remove();
              const remaining = listNode.querySelectorAll(".approval-card").length;
              if (countNode) countNode.textContent = String(remaining);
              if (remaining === 0) {
                listNode.innerHTML = '<p class="pending-empty">Khong co tai khoan admin cho duyet.</p>';
              }
            } else {
              button.disabled = false;
            }
          }
        });
      });
    });
  };

  if (typeof fetchPendingAdmins === "function") {
    fetchPendingAdmins().then(renderList).catch(() => renderList([]));
  } else {
    renderList([]);
  }
});