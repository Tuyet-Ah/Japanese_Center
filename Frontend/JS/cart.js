document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();
  renderCart();

  const checkoutButton = document.querySelector("[data-checkout-btn]");
  const checkoutMessage = document.querySelector("[data-checkout-message]");

  const setCheckoutMessage = (text, isError) => {
    if (!checkoutMessage) return;
    checkoutMessage.textContent = text;
    checkoutMessage.style.color = isError ? "#dc2626" : "#16a34a";
  };

  const handleCheckout = async () => {
    const tokens = getAuthTokens();
    if (!tokens || !tokens.access) {
      window.location.href = "login.html";
      return;
    }

    const checkedItems = Array.from(document.querySelectorAll(".cart-checkbox"))
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => Number(checkbox.getAttribute("data-course-id")))
      .filter((id) => Number.isFinite(id));

    const courseIds = checkedItems.length ? checkedItems : [];
    if (!courseIds.length) {
      setCheckoutMessage("Gio hang dang trong.", true);
      return;
    }

    if (checkoutButton) checkoutButton.disabled = true;
    setCheckoutMessage("Dang khoi tao thanh toan...", false);

    try {
      const response = await fetch(`${API_BASE_URL}/checkout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.access}`
        },
        body: JSON.stringify({ course_ids: courseIds })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.payment_url) {
        setCheckoutMessage(data.error || data.detail || "Khong the tao thanh toan.", true);
        return;
      }

      window.location.href = data.payment_url;
    } catch (error) {
      setCheckoutMessage("Khong the ket noi may chu.", true);
    } finally {
      if (checkoutButton) checkoutButton.disabled = false;
    }
  };

  if (checkoutButton) {
    checkoutButton.addEventListener("click", handleCheckout);
  }

  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");
  if (status === "success") {
    renderCart();
    setCheckoutMessage("Thanh toan thanh cong. Gio hang da duoc cap nhat.", false);
  } else if (status === "failed") {
    setCheckoutMessage("Thanh toan that bai. Vui long thu lai.", true);
  }

  const clearCartButton = document.querySelector("[data-clear-cart]");
  if (clearCartButton) {
    clearCartButton.addEventListener("click", async () => {
      await clearCartBackend();
      renderCart();
    });
  }
});