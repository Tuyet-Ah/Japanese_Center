function startExam(examId) {
  window.location.href = `exam-detail.html?exam=${encodeURIComponent(examId)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  // Auto-open exam from URL parameter (e.g. from profile results page)
  const params = new URLSearchParams(window.location.search);
  const examFromUrl = params.get("exam");
  if (examFromUrl) {
    // Small timeout to let page render first
    setTimeout(() => startExam(examFromUrl), 400);
  }

  const levelSelect = document.getElementById("levelFilter");
  const examsGrid = document.getElementById("examsGrid");
  const resultsList = document.getElementById("examResults");
  const totalExamsNode = document.getElementById("totalExams");
  const avgScoreNode = document.getElementById("avgScore");
  const bestScoreNode = document.getElementById("bestScore");

  const renderExamCards = (items) => {
    if (!examsGrid) return;
    if (!items.length) {
      examsGrid.innerHTML = '<div class="exam-card"><h3>Chưa có đề thi phù hợp.</h3></div>';
      return;
    }

    examsGrid.innerHTML = items
      .map((exam, index) => {
        const level = exam.level || "";
        const questionCount = Number(exam.question_count || 0);
        const timeLimit = Number(exam.time_limit || 0);
        const btnClass = index % 2 === 0 ? "btn-primary-exam" : "btn-outline-exam";

        return `
          <div class="exam-card" data-exam-level="${level}" data-exam-id="${exam.id}">
            <h3>${exam.title}</h3>
            <div class="exam-meta">
              <span><i class="time-icon">⏱</i> ${timeLimit} phút |</span>
              <span>${questionCount}</span>
            </div>
            <div class="exam-meta-secondary">
              1 phần thi | ${questionCount} câu hỏi
            </div>
            <button class="btn btn-exam-detail ${btnClass}" type="button">Chi tiết</button>
          </div>
        `;
      })
      .join("");

    examsGrid.querySelectorAll(".exam-card").forEach((card) => {
      const examId = card.getAttribute("data-exam-id");
      const button = card.querySelector(".btn-exam-detail");

      card.style.cursor = "pointer";
      card.addEventListener("click", (event) => {
        if (event.target.closest(".btn-exam-detail")) return;
        if (examId) startExam(examId);
      });

      button?.addEventListener("click", () => {
        if (examId) startExam(examId);
      });
    });
  };

  const renderAuthMessage = () => {
    if (!examsGrid) return;
    examsGrid.innerHTML = '<div class="exam-card"><h3>Vui lòng đăng nhập để xem đề thi.</h3></div>';
  };

  const renderHistoryEmpty = () => {
    if (!resultsList) return;
    resultsList.innerHTML = '<p style="color: var(--muted); text-align: center;">Bạn chưa làm bài kiểm tra nào. Hãy bắt đầu ngay!</p>';
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("vi-VN");
  };

  const renderHistory = (items) => {
    if (!resultsList) return;
    if (!items.length) {
      renderHistoryEmpty();
      return;
    }

    resultsList.innerHTML = items
      .map((item) => {
        const scorePercent = Math.round(Number(item.score || 0) * 10);
        const correctText = item.total_questions ? `${item.correct_count}/${item.total_questions}` : "";
        const durationText = item.duration_seconds ? `${Math.round(item.duration_seconds / 60)} phút` : "";
        return `
          <div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
            <div>
              <strong>${item.quiz_name}</strong>
              <div style="color: var(--muted); font-size: 0.9rem;">${formatDate(item.submitted_at)}</div>
              <div style="color: var(--muted); font-size: 0.9rem;">${correctText}${durationText ? ` • ${durationText}` : ""}</div>
            </div>
            <div style="text-align:right;">
              <div><strong>${scorePercent}%</strong></div>
              <button class="btn btn-outline" type="button" data-review-quiz="${item.quiz_id}" data-review-submission="${item.id}">Xem lại</button>
            </div>
          </div>
        `;
      })
      .join("");

    resultsList.querySelectorAll("[data-review-quiz]").forEach((button) => {
      button.addEventListener("click", () => {
        const quizId = button.getAttribute("data-review-quiz");
        const submissionId = button.getAttribute("data-review-submission");
        if (!quizId) return;
        window.location.href = `exam-detail.html?exam=${encodeURIComponent(quizId)}&review=1&submission=${encodeURIComponent(submissionId || "")}`;
      });
    });
  };

  const renderStats = (items) => {
    if (!totalExamsNode || !avgScoreNode || !bestScoreNode) return;
    if (!items.length) {
      totalExamsNode.textContent = "0";
      avgScoreNode.textContent = "0%";
      bestScoreNode.textContent = "0%";
      return;
    }

    const scores = items.map((item) => Number(item.score || 0));
    const avg = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    const best = Math.max(...scores);
    totalExamsNode.textContent = String(items.length);
    avgScoreNode.textContent = `${Math.round(avg * 10)}%`;
    bestScoreNode.textContent = `${Math.round(best * 10)}%`;
  };

  const fetchPracticeQuizzes = async (level) => {
    const tokens = typeof getAuthTokens === "function" ? getAuthTokens() : null;
    if (!tokens || !tokens.access) return null;

    const params = new URLSearchParams();
    if (level) params.set("level", level);
    const url = params.toString()
      ? `${API_BASE_URL}/quizzes/practice/?${params.toString()}`
      : `${API_BASE_URL}/quizzes/practice/`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${tokens.access}` }
    });
    if (!response.ok) return [];
    return response.json();
  };

  const fetchPracticeHistory = async () => {
    const tokens = typeof getAuthTokens === "function" ? getAuthTokens() : null;
    if (!tokens || !tokens.access) return null;

    const response = await fetch(`${API_BASE_URL}/quiz-history/practice/`, {
      headers: { Authorization: `Bearer ${tokens.access}` }
    });
    if (!response.ok) return [];
    return response.json();
  };

  const loadExams = async (level) => {
    const data = await fetchPracticeQuizzes(level);
    if (data === null) {
      renderAuthMessage();
      return;
    }
    renderExamCards(Array.isArray(data) ? data : []);
  };

  if (levelSelect) {
    levelSelect.addEventListener('change', () => {
      loadExams(levelSelect.value);
    });
  }

  loadExams(levelSelect?.value || "");

  const loadHistory = async () => {
    const data = await fetchPracticeHistory();
    if (data === null) {
      renderHistoryEmpty();
      renderStats([]);
      return;
    }
    const list = Array.isArray(data) ? data : [];
    renderHistory(list);
    renderStats(list);
  };

  loadHistory();

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