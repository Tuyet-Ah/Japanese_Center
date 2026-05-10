function forumAction(action, topicId) {
  if (action === "approve") {
    alert(`✅ Đã duyệt topic #${topicId}`);
  } else if (action === "reject") {
    if (confirm(`Bạn chắc chắn từ chối topic #${topicId}?`)) {
      alert(`❌ Đã từ chối topic #${topicId}`);
    }
  } else if (action === "view") {
    alert(`👁️ Xem chi tiết topic #${topicId} (sẽ mở modal chi tiết)`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initAdminShell();

  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", function () {
      document.querySelectorAll(".tab-btn").forEach((item) => item.classList.remove("active"));
      this.classList.add("active");
    });
  });
});