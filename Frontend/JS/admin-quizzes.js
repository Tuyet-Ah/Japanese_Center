document.addEventListener("DOMContentLoaded", () => {
  initAdminShell();

  const tableBody = document.getElementById("quizzesTableBody");
  const searchInput = document.getElementById("quizSearchInput");
  const levelFilter = document.getElementById("quizLevelFilter");
  const typeFilter = document.getElementById("quizTypeFilter");
  const filterButton = document.getElementById("quizFilterBtn");
  const resetButton = document.getElementById("quizFilterReset");

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const formatQuizType = (value) => {
    switch (value) {
      case "lesson":
        return "Bai tap bai hoc";
      case "chapter":
        return "Kiem tra chuong";
      case "final":
        return "Thi cuoi khoa";
      case "practice":
        return "Luyen thi";
      default:
        return "-";
    }
  };

  const buildQuery = () => {
    const query = {
      search: searchInput?.value.trim() || "",
      level: levelFilter?.value || "",
      quiz_type: typeFilter?.value || ""
    };
    Object.keys(query).forEach((key) => {
      if (!query[key]) delete query[key];
    });
    return query;
  };

  const renderQuizTable = (quizzes) => {
    if (!tableBody) return;
    if (!Array.isArray(quizzes) || quizzes.length === 0) {
      tableBody.innerHTML = "<tr><td colspan=\"8\">Khong co quiz phu hop.</td></tr>";
      return;
    }

    tableBody.innerHTML = quizzes
      .map((quiz, index) => {
        const title = escapeHtml(quiz.title || "");
        const level = escapeHtml(quiz.level || "-");
        const questionCount = Number(quiz.question_count || 0);
        const timeLimit = Number(quiz.time_limit || 0);
        const attemptCount = Number(quiz.attempt_count || 0);
        const quizType = formatQuizType(quiz.quiz_type);
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${title}</td>
            <td><span class="badge">${level}</span></td>
            <td>${questionCount}</td>
            <td>${timeLimit}</td>
            <td>${attemptCount}</td>
            <td>${quizType}</td>
            <td>
              <button class="btn btn-small">Sua</button>
              <button class="btn btn-small btn-danger">Xoa</button>
            </td>
          </tr>
        `;
      })
      .join("");
  };

  const loadQuizzes = async () => {
    if (!tableBody) return;
    const tokens = typeof getAuthTokens === "function" ? getAuthTokens() : null;
    if (!tokens || !tokens.access) {
      tableBody.innerHTML = "<tr><td colspan=\"8\">Can dang nhap admin.</td></tr>";
      return;
    }

    tableBody.innerHTML = "<tr><td colspan=\"8\">Dang tai quiz...</td></tr>";
    try {
      const query = buildQuery();
      const params = new URLSearchParams(query);
      const url = `${API_BASE_URL}/admin/quizzes/${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${tokens.access}` }
      });
      if (!response.ok) {
        tableBody.innerHTML = "<tr><td colspan=\"8\">Khong the tai quiz.</td></tr>";
        return;
      }
      const data = await response.json().catch(() => ([]));
      renderQuizTable(Array.isArray(data) ? data : []);
    } catch {
      tableBody.innerHTML = "<tr><td colspan=\"8\">Khong the tai quiz.</td></tr>";
    }
  };

  filterButton?.addEventListener("click", loadQuizzes);
  resetButton?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (levelFilter) levelFilter.value = "";
    if (typeFilter) typeFilter.value = "";
    loadQuizzes();
  });

  searchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadQuizzes();
    }
  });

  loadQuizzes();

  const addQuizBtn = document.getElementById("addQuizBtn");
  const section = document.getElementById("quizFormSection");
  const form = document.getElementById("quizForm");
  const cancelButton = document.getElementById("cancelQuizBtn");

  addQuizBtn?.addEventListener("click", () => {
    if (section) section.style.display = "block";
    form?.reset();
  });

  cancelButton?.addEventListener("click", () => {
    if (section) section.style.display = "none";
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    showAppToast("Quiz đã được lưu thành công!", "success");
    if (section) section.style.display = "none";
  });
});