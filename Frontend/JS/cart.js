document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();
  renderCart();

  const clearCartButton = document.querySelector("[data-clear-cart]");
  if (clearCartButton) {
    clearCartButton.addEventListener("click", () => {
      saveCart([]);
      renderCart();
    });
  }
});