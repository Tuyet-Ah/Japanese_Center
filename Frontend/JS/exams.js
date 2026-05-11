function startExam(examId) {
  window.location.href = `exam-detail.html?exam=${encodeURIComponent(examId)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  const levelItems = document.querySelectorAll("#levelFilter li");
  const examCards = Array.from(document.querySelectorAll(".exam-card"));

  const applyFilters = (selectedLevel) => {
    examCards.forEach((card) => {
      const cardLevel = card.getAttribute("data-exam-level") || "";
      const matchesLevel = !selectedLevel || cardLevel === selectedLevel;
      card.style.display = matchesLevel ? "" : "none";
    });
  };

  levelItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all
      levelItems.forEach(li => li.style.backgroundColor = "");
      
      // Add active style to clicked item
      item.style.backgroundColor = "#f0f4f8";
      
      const level = item.getAttribute("data-level");
      applyFilters(level);
    });
  });

  examCards.forEach((card) => {
    const button = card.querySelector(".btn-exam-detail");
    const examIdMatch = button?.getAttribute("onclick")?.match(/startExam\('([^']+)'\)/);
    const examId = examIdMatch ? examIdMatch[1] : null;

    card.style.cursor = "pointer";
    card.addEventListener("click", (event) => {
      if (event.target.closest(".btn-exam-detail")) return;
      if (examId) startExam(examId);
    });
  });

  const aiChatToggle = document.getElementById("aiChatToggle");
  const aiChatPanel = document.getElementById("aiChatPanel");
  const aiChatForm = document.getElementById("aiChatForm");
  const aiChatInput = document.getElementById("aiChatInput");
  const aiChatMessages = document.getElementById("aiChatMessages");

  const appendChatBubble = (text, type) => {
    if (!aiChatMessages) return;
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${type}`;
    bubble.textContent = text;
    aiChatMessages.appendChild(bubble);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  };

  const respondToUser = (message) => {
    const text = message.toLowerCase();
    if (text.includes("ngữ pháp")) return "Với ngữ pháp, bạn nên chia nhỏ thành mẫu câu, ví dụ và bài tập áp dụng.";
    if (text.includes("từ vựng")) return "Từ vựng nhớ nhanh nhất khi học theo chủ đề và ôn lại bằng flashcard.";
    if (text.includes("nghe")) return "Khi luyện nghe, hãy nghe 2 lần: lần 1 lấy ý chính, lần 2 bắt từ khóa.";
    if (text.includes("jlpt")) return "JLPT nên học theo lộ trình: từ vựng, ngữ pháp, đọc hiểu, rồi làm đề mẫu.";
    return "Mình có thể giúp bạn tóm tắt đề, giải thích câu hỏi hoặc gợi ý cách ôn tập nhanh.";
  };

  aiChatToggle?.addEventListener("click", () => {
    if (!aiChatPanel) return;
    aiChatPanel.hidden = !aiChatPanel.hidden;
    if (!aiChatPanel.hidden) aiChatInput?.focus();
  });

  aiChatForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!aiChatInput) return;
    const value = aiChatInput.value.trim();
    if (!value) return;
    appendChatBubble(value, "user");
    aiChatInput.value = "";
    window.setTimeout(() => appendChatBubble(respondToUser(value), "bot"), 300);
  });

  document.querySelectorAll("[data-close-exam-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      const modal = document.getElementById("examModal");
      if (modal) {
        modal.hidden = true;
        document.body.style.overflow = "";
      }
    });
  });
});