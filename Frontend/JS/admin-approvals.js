function approveUser(userId) {
  alert(`✅ Đã duyệt: ${userId}`);
}

function requestInfo(userId) {
  alert(`❓ Đã gửi yêu cầu thêm thông tin cho ${userId}`);
}

function rejectUser(userId) {
  if (confirm(`Bạn chắc chắn muốn từ chối ${userId}?`)) {
    alert(`❌ Đã từ chối: ${userId}`);
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