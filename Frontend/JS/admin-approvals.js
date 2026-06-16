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

// ─────────────────────────────────────────────
// Danh sách Admin hiện có + Xóa mềm / Kích hoạt lại
// ─────────────────────────────────────────────

async function fetchAdminList() {
  const tokens = typeof getAuthTokens === 'function' ? getAuthTokens() : null;
  if (!tokens?.access) return [];
  const res = await fetch(`${API_BASE_URL}/admin/admins/`, {
    headers: { Authorization: `Bearer ${tokens.access}` }
  });
  if (!res.ok) return [];
  return res.json().catch(() => []);
}

async function deactivateAdmin(userId) {
  const tokens = typeof getAuthTokens === 'function' ? getAuthTokens() : null;
  if (!tokens?.access) return false;
  const res = await fetch(`${API_BASE_URL}/admin/admins/${userId}/deactivate/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.access}` }
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    alert(d.error || 'Không thể vô hiệu hóa tài khoản.');
    return false;
  }
  return true;
}

async function reactivateAdmin(userId) {
  const tokens = typeof getAuthTokens === 'function' ? getAuthTokens() : null;
  if (!tokens?.access) return false;
  const res = await fetch(`${API_BASE_URL}/admin/admins/${userId}/reactivate/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.access}` }
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    alert(d.error || 'Không thể kích hoạt lại tài khoản.');
    return false;
  }
  return true;
}

function formatJoinDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('vi-VN');
}

function renderAdminTable(admins) {
  const tbody = document.getElementById('adminListTableBody');
  if (!tbody) return;
  if (!Array.isArray(admins) || !admins.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted)">Chưa có admin nào.</td></tr>';
    return;
  }

  // Lấy id của admin đang đăng nhập để không cho tự xóa mình
  const me = typeof getLoginUser === 'function' ? getLoginUser() : null;

  tbody.innerHTML = admins.map((a, i) => {
    const isSelf = me && (me.id === a.id || me.username === a.username);
    const isActive = a.is_active !== false; // mặc định true
    const statusBadge = isActive
      ? '<span class="status-badge published">Hoạt động</span>'
      : '<span class="status-badge hidden">Vô hiệu</span>';

    const actionBtn = isSelf
      ? '<span style="color:var(--muted);font-size:0.85rem;">(Bạn)</span>'
      : isActive
        ? `<button class="btn btn-small btn-danger" data-deactivate-id="${a.id}">🚫 Vô hiệu hóa</button>`
        : `<button class="btn btn-small btn-outline" data-reactivate-id="${a.id}" style="color:#16a34a;border-color:#4ade80;">✅ Kích hoạt lại</button>`;

    return `
      <tr data-admin-row="${a.id}">
        <td>${i + 1}</td>
        <td><strong>${escapeHtml(a.username || '')}</strong></td>
        <td>${escapeHtml(a.email || '—')}</td>
        <td>${escapeHtml(a.phone || '—')}</td>
        <td>${statusBadge}</td>
        <td>${formatJoinDate(a.date_joined)}</td>
        <td>${actionBtn}</td>
      </tr>`;
  }).join('');

  // Bind deactivate
  tbody.querySelectorAll('[data-deactivate-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-deactivate-id'));
      const name = btn.closest('tr')?.querySelector('strong')?.textContent || `#${id}`;
      openAdminActionModal({
        title: 'Vô hiệu hóa tài khoản',
        message: `Bạn xác nhận vô hiệu hóa tài khoản "${name}"? Admin này sẽ không thể đăng nhập cho đến khi được kích hoạt lại.`,
        confirmLabel: '🚫 Vô hiệu hóa',
        confirmClass: 'btn-danger',
        action: async () => {
          const ok = await deactivateAdmin(id);
          if (ok) loadAdminList();
        }
      });
    });
  });

  // Bind reactivate
  tbody.querySelectorAll('[data-reactivate-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-reactivate-id'));
      const name = btn.closest('tr')?.querySelector('strong')?.textContent || `#${id}`;
      openAdminActionModal({
        title: 'Kích hoạt lại tài khoản',
        message: `Bạn xác nhận kích hoạt lại tài khoản "${name}"?`,
        confirmLabel: '✅ Kích hoạt',
        confirmClass: 'btn-success',
        action: async () => {
          const ok = await reactivateAdmin(id);
          if (ok) loadAdminList();
        }
      });
    });
  });
}

async function loadAdminList() {
  const tbody = document.getElementById('adminListTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted)">Đang tải...</td></tr>';
  try {
    const admins = await fetchAdminList();
    renderAdminTable(admins);
  } catch {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#dc2626">Không thể tải danh sách admin.</td></tr>';
  }
}

// ── Modal riêng cho admin actions ──
let onAdminActionConfirm = null;

function openAdminActionModal({ title, message, confirmLabel, confirmClass, action }) {
  const modal = document.getElementById('adminActionModal');
  const titleEl = document.getElementById('adminActionTitle');
  const msgEl = document.getElementById('adminActionMessage');
  const okBtn = document.getElementById('adminActionOk');
  if (!modal) return;
  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;
  if (okBtn) {
    okBtn.textContent = confirmLabel || 'Xác nhận';
    okBtn.className = 'btn ' + (confirmClass || 'btn-danger');
  }
  onAdminActionConfirm = action;
  modal.hidden = false;
}

document.addEventListener('DOMContentLoaded', () => {
  // Khởi động modal admin action
  const modal = document.getElementById('adminActionModal');
  const cancelBtn = document.getElementById('adminActionCancel');
  const okBtn = document.getElementById('adminActionOk');

  const closeModal = () => {
    if (modal) modal.hidden = true;
    onAdminActionConfirm = null;
  };

  cancelBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  okBtn?.addEventListener('click', async () => {
    if (typeof onAdminActionConfirm === 'function') {
      okBtn.disabled = true;
      await onAdminActionConfirm();
      okBtn.disabled = false;
    }
    closeModal();
  });

  // Load danh sách admin
  loadAdminList();
});
