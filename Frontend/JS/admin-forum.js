let forumToastTimer = null;
let forumConfirmAction = null;

function showForumToast(message, type = "success") {
  const toast = document.getElementById("forumToast");
  if (!toast) return;

  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add("is-visible");

  if (forumToastTimer) {
    clearTimeout(forumToastTimer);
  }

  forumToastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function openForumConfirmModal({ title, message, confirmLabel, confirmClass, action }) {
  const modal = document.getElementById("forumConfirmModal");
  const modalTitle = document.getElementById("forumConfirmModalTitle");
  const modalMessage = document.getElementById("forumConfirmModalMessage");
  const modalOk = document.getElementById("forumConfirmModalOk");

  if (!modal || !modalTitle || !modalMessage || !modalOk) return;

  modalTitle.textContent = title || "Xác nhận";
  modalMessage.textContent = message || "Bạn chắc chắn?";
  modalOk.textContent = confirmLabel || "Đồng ý";
  modalOk.className = `btn ${confirmClass || "btn-danger"}`;
  forumConfirmAction = action;
  modal.hidden = false;
}

function closeForumConfirmModal() {
  const modal = document.getElementById("forumConfirmModal");
  if (!modal) return;

  modal.hidden = true;
  forumConfirmAction = null;
}

function forumAction(action, topicId) {
  if (action === "approve") {
    showForumToast(`Đã duyệt topic #${topicId}`, "success");
  } else if (action === "reject") {
    openForumConfirmModal({
      title: "Xác nhận từ chối",
      message: `Bạn chắc chắn từ chối topic #${topicId}?`,
      confirmLabel: "Từ chối",
      confirmClass: "btn-danger",
      action: () => {
        showForumToast(`Đã từ chối topic #${topicId}`, "danger");
      },
    });
  } else if (action === "view") {
    showForumToast(`Xem chi tiết topic #${topicId} (sẽ mở modal chi tiết)`, "info");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initAdminShell();

  const modal = document.getElementById("forumConfirmModal");
  const modalCancel = document.getElementById("forumConfirmModalCancel");
  const modalOk = document.getElementById("forumConfirmModalOk");

  modalCancel?.addEventListener("click", closeForumConfirmModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeForumConfirmModal();
  });
  modalOk?.addEventListener("click", async () => {
    if (typeof forumConfirmAction === "function") {
      await forumConfirmAction();
    }
    closeForumConfirmModal();
  });

  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", function () {
      document.querySelectorAll(".tab-btn").forEach((item) => item.classList.remove("active"));
      this.classList.add("active");
    });
  });
});