const selectedAnswers = new Map();
const flaggedQuestions = new Set();
let currentExam = null;
let isSubmitted = false;
let reviewSubmissionId = null;
let examStartTime = null;
let timerInterval = null;
let remainingSeconds = 0;

function buildExamFromApi(quiz) {
  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
  const questionCount = questions.length;
  const levelLabel = quiz.level ? `JLPT ${quiz.level}` : "JLPT";

  return {
    id: quiz.id,
    title: quiz.title,
    level: levelLabel,
    subtitle: quiz.quiz_type === "practice" ? "Đề thi luyện tập" : "Bài kiểm tra",
    duration: `${quiz.time_limit} phút`,
    questionCount: `${questionCount} câu hỏi`,
    points: `${questionCount * 10} điểm`,
    tip: "Đọc kỹ câu hỏi, loại trừ đáp án sai trước khi chọn đáp án đúng.",
    intro: "Bài thi gồm các câu hỏi trắc nghiệm. Hãy tập trung vào từng câu và kiểm tra lại trước khi nộp bài.",
    questions: questions.map((question) => ({
      id: question.id,
      text: question.text,
      options: [question.opt_a, question.opt_b, question.opt_c, question.opt_d]
    }))
  };
}

async function loadExamFromApi() {
  const examId = new URLSearchParams(window.location.search).get("exam");
  if (!examId) return null;

  const tokens = typeof getAuthTokens === "function" ? getAuthTokens() : null;
  if (!tokens || !tokens.access) return null;

  const response = await fetch(`${API_BASE_URL}/quizzes/${examId}/`, {
    headers: { Authorization: `Bearer ${tokens.access}` }
  });

  if (!response.ok) return null;
  const data = await response.json();
  return buildExamFromApi(data);
}

function getReviewParams() {
  const params = new URLSearchParams(window.location.search);
  const review = params.get("review") === "1";
  const submissionId = params.get("submission");
  return { review, submissionId };
}

function getStoredSubmission(submissionId) {
  if (!submissionId) return null;
  try {
    const raw = localStorage.getItem(`quizSubmission:${submissionId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function renderExam() {
  const exam = currentExam;
  if (!exam) return;
  const levelTag = document.getElementById("examLevelTag");
  const title = document.getElementById("examTitle");
  const subtitle = document.getElementById("examSubtitle");
  const durationElement = document.querySelector("#examDurationStatic strong");
  const questionCount = document.getElementById("examQuestionCount");
  const points = document.getElementById("examPoints");
  const intro = document.getElementById("examIntro");
  const tip = document.getElementById("examTip");

  if (levelTag) levelTag.textContent = exam.level;
  if (title) title.textContent = exam.title;
  if (subtitle) subtitle.textContent = exam.subtitle;
  if (durationElement) durationElement.textContent = exam.duration;
  if (questionCount) questionCount.textContent = exam.questionCount;
  if (points) points.textContent = exam.points;
  if (intro) intro.textContent = exam.intro;
  if (tip) tip.textContent = exam.tip;

  const questionList = document.getElementById("questionList");
  if (questionList) {
    questionList.innerHTML = exam.questions
      .map(
        (question, index) => `
          <article class="question-card" id="question-${index}">
            <div class="question-head">
              <div class="question-number">Câu ${index + 1}</div>
              <div class="question-actions">
                <button type="button" class="review-toggle" data-flag-btn="${index}">Đánh dấu phân vân</button>
              </div>
            </div>
            <div class="question-text">${question.text}</div>
            <div class="option-list">
              ${question.options
            .map(
              (option, optionIndex) => {
                const letter = String.fromCharCode(65 + optionIndex);
                return `
                    <label class="option-item" data-question-id="${question.id}" data-option-letter="${letter}">
                      <input type="radio" name="question-${question.id}" value="${letter}">
                      <span>${letter}. ${option}</span>
                    </label>
                  `;
              }
            )
            .join("")}
            </div>
          </article>
        `
      )
      .join("");
  }

  const questionNav = document.getElementById("questionNav");
  if (questionNav) {
    questionNav.innerHTML = exam.questions.map((_, index) => `<button type="button" data-jump="${index}">${index + 1}</button>`).join("");
  }

  bindExamEvents();
  updateFlagUI();
  updateProgress();
  examStartTime = Date.now();
  startTimer();
}

function startTimer() {
  if (isSubmitted || reviewSubmissionId) return;
  if (!currentExam || !currentExam.duration) return;

  // Parse duration from "20 phút" format to get minutes
  const match = currentExam.duration.match(/(\d+)/);
  if (!match) return;

  const totalMinutes = parseInt(match[1], 10);
  remainingSeconds = totalMinutes * 60;

  const timerContainer = document.getElementById("timerContainer");
  const examDurationStatic = document.getElementById("examDurationStatic");
  if (timerContainer) timerContainer.style.display = "inline-block";
  if (examDurationStatic) examDurationStatic.style.display = "none";

  updateTimerDisplay();

  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateTimerDisplay();

    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      autoSubmitExam();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerElement = document.getElementById("examTimer");
  if (!timerElement) return;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  timerElement.textContent = timeStr;

  // Update warning/danger states
  timerElement.classList.remove("warning", "danger");
  if (remainingSeconds <= 60) {
    timerElement.classList.add("danger");
  } else if (remainingSeconds <= 300) {
    timerElement.classList.add("warning");
  }
}

async function autoSubmitExam() {
  if (isSubmitted) return;
  await submitExam();
}

function bindExamEvents() {
  document.querySelectorAll("[data-flag-btn]").forEach((button) => {
    button.addEventListener("click", () => {
      if (isSubmitted) return;
      const index = Number(button.getAttribute("data-flag-btn"));
      if (flaggedQuestions.has(index)) {
        flaggedQuestions.delete(index);
      } else {
        flaggedQuestions.add(index);
      }
      updateFlagUI();
    });
  });

  document.querySelectorAll('.question-card input[type="radio"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (isSubmitted) return;
      const questionId = Number(input.name.replace("question-", ""));
      const answer = input.value;
      selectedAnswers.set(questionId, answer);
      updateProgress();
      updateNavState();
    });
  });

  document.querySelectorAll("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.getAttribute("data-jump"));
      document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const submitButton = document.getElementById("submitExamBtn");
  if (submitButton) {
    submitButton.addEventListener("click", async () => {
      if (isSubmitted) return;
      await submitExam();
    });
  }
}

function updateFlagUI() {
  const flagList = document.getElementById("flagList");
  const flagCount = document.getElementById("flagCount");
  if (flagCount) flagCount.textContent = String(flaggedQuestions.size);

  if (flagList) {
    if (!flaggedQuestions.size) {
      flagList.innerHTML = '<span class="flag-chip">Chưa có câu nào</span>';
    } else {
      flagList.innerHTML = Array.from(flaggedQuestions)
        .sort((a, b) => a - b)
        .map((index) => `<button type="button" class="flag-chip" data-flag-jump="${index}">Câu ${index + 1}</button>`)
        .join("");

      document.querySelectorAll("[data-flag-jump]").forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.getAttribute("data-flag-jump"));
          document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }
  }

  document.querySelectorAll("[data-flag-btn]").forEach((button) => {
    const index = Number(button.getAttribute("data-flag-btn"));
    const active = flaggedQuestions.has(index);
    button.classList.toggle("active", active);
    button.textContent = active ? "Bỏ đánh dấu" : "Đánh dấu phân vân";
    document.getElementById(`question-${index}`)?.classList.toggle("flagged", active);
  });

  updateNavState();
}

function updateProgress() {
  const progressText = document.getElementById("examProgressText");
  if (progressText && currentExam) {
    progressText.textContent = `${selectedAnswers.size} / ${currentExam.questions.length} câu đã chọn`;
  }
}

function updateNavState() {
  document.querySelectorAll("[data-jump]").forEach((button) => {
    const index = Number(button.getAttribute("data-jump"));
    const questionId = currentExam ? currentExam.questions[index]?.id : null;
    const answered = questionId ? selectedAnswers.has(questionId) : false;
    button.classList.toggle("active", answered);
    button.classList.toggle("flagged", flaggedQuestions.has(index));
  });
}

function ensureBackButtonTop() {
  const heroTop = document.querySelector(".exam-hero-top");
  if (!heroTop || document.getElementById("backToExamsTop")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.id = "backToExamsTop";
  button.className = "btn btn-outline exam-back-top";
  button.textContent = "Quay lại";
  button.addEventListener("click", () => window.history.back());
  heroTop.appendChild(button);
}

async function submitExam() {
  if (!currentExam) return;

  // Clear timer
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const tokens = typeof getAuthTokens === "function" ? getAuthTokens() : null;
  if (!tokens || !tokens.access) {
    renderSubmitMessage("Vui lòng đăng nhập để nộp bài.", "error");
    return;
  }

  const durationSeconds = examStartTime ? Math.round((Date.now() - examStartTime) / 1000) : 0;
  const answers = Array.from(selectedAnswers.entries()).map(([questionId, choice]) => ({
    question_id: questionId,
    choice
  }));

  const response = await fetch(`${API_BASE_URL}/quizzes/${currentExam.id}/submit/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.access}`
    },
    body: JSON.stringify({ answers, duration_seconds: durationSeconds })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    renderSubmitMessage(data.error || data.detail || "Không thể nộp bài.", "error");
    return;
  }

  isSubmitted = true;
  storeSubmission(data);
  renderResultBar(data);
  applyAnswerHighlights(data.details || []);
  lockExamInputs();
}

function storeSubmission(result) {
  if (!result || !result.submission_id) return;
  const answers = Array.from(selectedAnswers.entries()).map(([questionId, choice]) => ({
    question_id: questionId,
    choice
  }));

  const payload = {
    quiz_id: currentExam ? currentExam.id : null,
    result,
    answers
  };

  try {
    localStorage.setItem(`quizSubmission:${result.submission_id}`, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
}

function renderResultBar(result) {
  const toolbar = document.querySelector(".exam-toolbar");
  if (!toolbar) return;

  let bar = document.getElementById("examResultBar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "examResultBar";
    bar.className = "exam-result-bar";
    toolbar.insertAdjacentElement("afterend", bar);
  }

  const durationText = result.duration_seconds ? `${Math.round(result.duration_seconds / 60)} phút` : "";
  bar.innerHTML = `
    <div><strong>Điểm số:</strong> ${result.score}</div>
    <div><strong>Đúng:</strong> ${result.correct_count} / ${result.total}</div>
    ${durationText ? `<div><strong>Thời gian:</strong> ${durationText}</div>` : ""}
  `;
  bar.classList.remove("exam-result-error");
}

function renderSubmitMessage(message, type = "error") {
  const toolbar = document.querySelector(".exam-toolbar");
  if (!toolbar) return;

  let bar = document.getElementById("examResultBar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "examResultBar";
    bar.className = "exam-result-bar";
    toolbar.insertAdjacentElement("afterend", bar);
  }

  bar.textContent = message;
  bar.classList.toggle("exam-result-error", type === "error");
}

function applyAnswerHighlights(details) {
  const detailMap = new Map(details.map((item) => [item.question_id, item]));

  document.querySelectorAll(".question-card").forEach((card) => {
    const index = Number(card.id.replace("question-", ""));
    const question = currentExam ? currentExam.questions[index] : null;
    if (!question) return;

    const detail = detailMap.get(question.id);
    const correctLetter = detail ? detail.correct_answer : null;
    const selectedLetter = selectedAnswers.get(question.id);

    card.querySelectorAll(".option-item").forEach((option) => {
      const letter = option.getAttribute("data-option-letter");
      option.classList.remove("is-correct", "is-wrong");

      if (correctLetter && letter === correctLetter) {
        option.classList.add("is-correct");
      }

      if (selectedLetter && selectedLetter === letter && selectedLetter !== correctLetter) {
        option.classList.add("is-wrong");
      }
    });

    renderExplanation(card, detail?.explanation);
  });
}

function renderExplanation(card, explanation) {
  if (!card) return;
  let block = card.querySelector(".answer-explanation");
  if (!explanation) {
    if (block) block.remove();
    return;
  }

  if (!block) {
    block = document.createElement("div");
    block.className = "answer-explanation";
    card.appendChild(block);
  }
  block.textContent = `Giải thích: ${explanation}`;
}

function lockExamInputs() {
  document.querySelectorAll('.question-card input[type="radio"]').forEach((input) => {
    input.disabled = true;
  });
  document.querySelectorAll("[data-flag-btn]").forEach((button) => {
    button.disabled = true;
  });
  const submitButton = document.getElementById("submitExamBtn");
  if (submitButton) submitButton.disabled = true;
}

document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();
  ensureBackButtonTop();

  const reviewParams = getReviewParams();
  reviewSubmissionId = reviewParams.submissionId;

  loadExamFromApi().then((exam) => {
    if (!exam) {
      const title = document.getElementById("examTitle");
      const intro = document.getElementById("examIntro");
      if (title) title.textContent = "Không tải được đề thi";
      if (intro) intro.textContent = "Vui lòng đăng nhập và thử lại.";
      return;
    }

    currentExam = exam;
    renderExam();

    if (reviewParams.review && reviewSubmissionId) {
      const stored = getStoredSubmission(reviewSubmissionId);
      if (stored && stored.result) {
        isSubmitted = true;
        renderResultBar(stored.result);

        const detailList = Array.isArray(stored.result.details) ? stored.result.details : [];
        if (Array.isArray(stored.answers)) {
          stored.answers.forEach((answer) => {
            selectedAnswers.set(answer.question_id, answer.choice);
          });
        }
        applyAnswerHighlights(detailList);
        lockExamInputs();

        // Hide timer in review mode
        const timerContainer = document.getElementById("timerContainer");
        const examDurationStatic = document.getElementById("examDurationStatic");
        if (timerContainer) timerContainer.style.display = "none";
        if (examDurationStatic) examDurationStatic.style.display = "inline-block";
        return;
      }

      fetchSubmissionDetail(reviewSubmissionId);
    }
  });

  document.getElementById("backToExamsBtn")?.addEventListener("click", () => {
    // Clear timer on back
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    window.history.back();
  });
});

async function fetchSubmissionDetail(submissionId) {
  if (!currentExam || !submissionId) return;
  const tokens = typeof getAuthTokens === "function" ? getAuthTokens() : null;
  if (!tokens || !tokens.access) return;

  const response = await fetch(`${API_BASE_URL}/quiz-submissions/${submissionId}/`, {
    headers: { Authorization: `Bearer ${tokens.access}` }
  });
  if (!response.ok) return;
  const data = await response.json();
  if (!data || !Array.isArray(data.answers)) return;

  data.answers.forEach((answer) => {
    if (answer.question_id && answer.selected_choice) {
      selectedAnswers.set(answer.question_id, answer.selected_choice);
    }
  });

  const details = data.answers.map((answer) => ({
    question_id: answer.question_id,
    correct_answer: answer.correct,
    explanation: answer.explanation
  }));

  isSubmitted = true;
  renderResultBar({
    score: data.score,
    correct_count: data.correct_count,
    total: data.total_questions,
    duration_seconds: data.duration_seconds
  });
  applyAnswerHighlights(details);
  lockExamInputs();
}