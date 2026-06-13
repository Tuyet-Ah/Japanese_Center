document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  const checkoutButton = document.querySelector("[data-checkout-btn]");
  const checkoutMessage = document.querySelector("[data-checkout-message]");
  const resultBanner = document.getElementById("paymentResultBanner");
  const bannerInner = document.getElementById("paymentBannerInner");

  const setCheckoutMessage = (text, isError) => {
    if (!checkoutMessage) return;
    checkoutMessage.textContent = text;
    checkoutMessage.style.color = isError ? "#dc2626" : "#16a34a";
  };

  const showPaymentBanner = (type) => {
    // type: 'success' | 'failed'
    if (!resultBanner || !bannerInner) return;
    if (type === "success") {
      bannerInner.innerHTML = `
        <div class="payment-banner success">
          <span class="banner-icon">✅</span>
          <div class="banner-text">
            <strong>Thanh toán thành công!</strong>
            Khóa học đã được thêm vào tài khoản của bạn. Giỏ hàng đã được cập nhật.
          </div>
        </div>`;
    } else {
      bannerInner.innerHTML = `
        <div class="payment-banner failed">
          <span class="banner-icon">❌</span>
          <div class="banner-text">
            <strong>Thanh toán thất bại.</strong>
            Đơn hàng chưa được xử lý. Vui lòng thử lại hoặc chọn phương thức khác.
          </div>
        </div>`;
    }
    resultBanner.style.display = "block";
  };

  // ── Xử lý redirect từ VNPay ──
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");

  if (status === "success") {
    showPaymentBanner("success");
    // Render lại giỏ hàng dùng token hiện tại — server đã xóa items đã thanh toán
    // nên giỏ sẽ hiện đúng trạng thái mới (trống hoặc còn items chưa thanh toán)
    renderCart();
    updateCartCount();
    // Xóa query param khỏi URL để không hiện lại khi user refresh
    window.history.replaceState({}, document.title, window.location.pathname);
  } else if (status === "failed") {
    showPaymentBanner("failed");
    renderCart();
    window.history.replaceState({}, document.title, window.location.pathname);
  } else {
    // Không có status → vào giỏ hàng bình thường
    renderCart();
  }

  // ── Checkout handler ──
  const handleCheckout = async () => {
    const tokens = getAuthTokens();
    if (!tokens || !tokens.access) {
      window.location.href = "login.html";
      return;
    }

    const checkedItems = Array.from(document.querySelectorAll(".cart-checkbox"))
      .filter((cb) => cb.checked)
      .map((cb) => Number(cb.getAttribute("data-course-id")))
      .filter((id) => Number.isFinite(id));

    if (!checkedItems.length) {
      setCheckoutMessage("Vui lòng chọn ít nhất một khóa học.", true);
      return;
    }

    if (checkoutButton) checkoutButton.disabled = true;
    setCheckoutMessage("Đang khởi tạo thanh toán...", false);

    try {
      const response = await fetch(`${API_BASE_URL}/checkout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.access}`
        },
        body: JSON.stringify({ course_ids: checkedItems })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.payment_url) {
        setCheckoutMessage(data.error || data.detail || "Không thể tạo thanh toán.", true);
        return;
      }

      // Chuyển sang trang VNPay
      window.location.href = data.payment_url;
    } catch {
      setCheckoutMessage("Không thể kết nối máy chủ.", true);
    } finally {
      if (checkoutButton) checkoutButton.disabled = false;
    }
  };

  checkoutButton?.addEventListener("click", handleCheckout);

  // ── Xóa toàn bộ giỏ ──
  document.querySelector("[data-clear-cart]")?.addEventListener("click", async () => {
    await clearCartBackend();
    renderCart();
  });
});