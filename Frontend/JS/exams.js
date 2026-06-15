/**
 * exams.js — Trang danh sách đề thi JLPT (học viên)
 * Gọi API mới: GET /educations/exams/ và GET /educations/exam-history/
 */

function startExam(examId) {
  window.location.href = `exam-detail.html?exam=${encodeURIComponent(examId)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  // Nếu URL có ?exam=<id> thì chuyển thẳng vào làm bài
  const urlParams = new URLSearchParams(window.location.search);
  const examFromUrl = urlParams.get("exam");
  if (examFromUrl) {
    startExam(examFromUrl);
    return;
  }

  const levelSelect = document.getElementById("levelFilter");
  const examsGrid = document.getElementById("examsGrid");
  const resultsList = document.getElementById("examResults");
  const totalExamsNode = document.getElementById("totalExams");
  const avgScoreNode = document.getElementById("avgScore");
  const bestScoreNode = document.getElementById("bestScore");
  const streakNode = document.getElementById("studyStreak");

  // ── Helpers ──
  const esc = (v) => String(v ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const gradeLabel = (pct) => {
    if (pct >= 90) return { text: "Xuất sắc", cls: "grade-a" };
    if (pct >= 75) return { text: "Giỏi", cls: "grade-b" };
    if (pct >= 60) return { text: "Khá", cls: "grade-c" };
    return { text: "Cần cố gắng", cls: "grade-d" };
  };

  // ── Render danh sách đề thi ──
  const renderExamCards = (items) => {
    if (!examsGrid) return;
    if (!items.length) {
      examsGrid.innerHTML = `
        <div class="exam-card" style="grid-column:1/-1;text-align:center;">
          <h3>Chưa có đề thi nào được công bố.</h3>
          <p style="color:var(--muted)">Vui lòng quay lại sau.</p>
        </div>`;
      return;
    }

    examsGrid.innerHTML = items.map((exam, i) => {
      const level = esc(exam.level || "");
      const qCount = Number(exam.question_count || 0);
      const duration = Number(exam.duration || 0);
      const btnClass = i % 2 === 0 ? "btn-primary-exam" : "btn-outline-exam";
      return `
        <div class="exam-card" data-exam-id="${exam.id}">
          <div class="exam-level-badge">${level}</div>
          <h3>${esc(exam.title)}</h3>
          <div class="exam-meta">
            <span>⏱ ${duration} phút</span>
            <span>📝 ${qCount} câu</span>
          </div>
          <div class="exam-meta-secondary">${exam.total_score} điểm tối đa</div>
          <button class="btn btn-exam-detail ${btnClass}" type="button">Vào thi</button>
        </div>`;
    }).join("");

    examsGrid.querySelectorAll(".exam-card").forEach((card) => {
      const id = card.getAttribute("data-exam-id");
      if (!id) return;
      card.style.cursor = "pointer";
      card.addEventListener("click", (e) => {
        if (e.target.closest(".btn-exam-detail")) return;
        startExam(id);
      });
      card.querySelector(".btn-exam-detail")
        ?.addEventListener("click", () => startExam(id));
    });
  };

  // ── Render lịch sử ──
  const renderHistory = (items) => {
    if (!resultsList) return;
    if (!items.length) {
      resultsList.innerHTML = `
        <p style="color:var(--muted);text-align:center;padding:20px 0">
          Bạn chưa làm bài kiểm tra nào. Hãy bắt đầu ngay!
        </p>`;
      return;
    }

    resultsList.innerHTML = items.map((item) => {
      const pct = Number(item.score_percent || 0);
      const grade = gradeLabel(pct);
      const dur = item.duration_seconds
        ? `${Math.round(item.duration_seconds / 60)} phút` : "";
      return `
        <div class="card" style="display:flex;justify-content:space-between;
             align-items:center;gap:12px;margin-bottom:10px;padding:14px 18px;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span class="badge">${esc(item.exam_level)}</span>
              <strong>${esc(item.exam_title)}</strong>
            </div>
            <div style="color:var(--muted);font-size:0.85rem;">
              ${esc(item.submitted_at)}
              ${dur ? ` · ${dur}` : ""}
              · ${item.correct_count}/${item.total_questions} câu đúng
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
            <div style="font-size:1.15rem;font-weight:800;color:var(--primary-dark);">${pct}%</div>
            <span class="grade-badge ${grade.cls}">${grade.text}</span>
            <button class="btn btn-outline" style="font-size:0.8rem;padding:5px 12px;"
              data-review-exam="${item.exam_id}"
              data-review-sub="${item.submission_id}">Xem lại</button>
          </div>
        </div>`;
    }).join("");

    resultsList.querySelectorAll("[data-review-exam]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const eId = btn.getAttribute("data-review-exam");
        const sId = btn.getAttribute("data-review-sub");
        window.location.href =
          `exam-detail.html?exam=${encodeURIComponent(eId)}&review=1&submission=${encodeURIComponent(sId)}`;
      });
    });
  };

  // ── Render thống kê ──
  const renderStats = (items) => {
    const safe = (el, v) => { if (el) el.textContent = v; };
    if (!items.length) {
      safe(totalExamsNode, "0"); safe(avgScoreNode, "0%");
      safe(bestScoreNode, "0%"); safe(streakNode, "0");
      return;
    }
    const pcts = items.map((i) => Number(i.score_percent || 0));
    const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length;
    const best = Math.max(...pcts);
    const uniq = new Set(items.map((i) => i.exam_id)).size;
    safe(totalExamsNode, String(items.length));
    safe(avgScoreNode, `${Math.round(avg)}%`);
    safe(bestScoreNode, `${Math.round(best)}%`);
    safe(streakNode, String(uniq));
  };

  // ── API ──
  const authHeaders = () => {
    const t = typeof getAuthTokens === "function" ? getAuthTokens() : null;
    return t?.access ? { Authorization: `Bearer ${t.access}` } : null;
  };

  const fetchExams = async (level) => {
    const headers = authHeaders();
    if (!headers) return null;                         // chưa đăng nhập
    const qs = level ? `?level=${encodeURIComponent(level)}` : "";
    const res = await fetch(`${API_BASE_URL}/exams/${qs}`, { headers });
    return res.ok ? res.json() : [];
  };

  const fetchHistory = async () => {
    const headers = authHeaders();
    if (!headers) return null;
    const res = await fetch(`${API_BASE_URL}/exam-history/`, { headers });
    return res.ok ? res.json() : [];
  };

  // ── Load ──
  const loadExams = async (level) => {
    if (examsGrid) {
      examsGrid.innerHTML = `
        <div class="exam-card" style="grid-column:1/-1;text-align:center;color:var(--muted);">
          Đang tải đề thi...
        </div>`;
    }
    const data = await fetchExams(level);
    if (data === null) {
      if (examsGrid) examsGrid.innerHTML = `
        <div class="exam-card" style="grid-column:1/-1;text-align:center;">
          <h3 style="margin-bottom:12px;">Vui lòng đăng nhập để xem đề thi</h3>
          <a href="login.html" class="btn btn-primary">Đăng nhập</a>
        </div>`;
      if (resultsList) resultsList.innerHTML =
        `<p style="color:var(--muted);text-align:center;">
           Đăng nhập để xem lịch sử làm bài.
         </p>`;
      return;
    }
    renderExamCards(Array.isArray(data) ? data : []);
  };

  levelSelect?.addEventListener("change", () => loadExams(levelSelect.value));
  loadExams(levelSelect?.value || "");

  fetchHistory().then((data) => {
    if (data === null) return;          // chưa đăng nhập, đã xử lý ở loadExams
    const list = Array.isArray(data) ? data : [];
    renderHistory(list);
    renderStats(list);
  });
});
