const selectedAnswers = new Map();
const flaggedQuestions = new Set();
let currentExam = null;
let isSubmitted = false;
let reviewSubmissionId = null;
let examStartTime = null;
let timerInterval = null;
let remainingSeconds = 0;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeExamQuestion(question) {
  const options = Array.isArray(question.options) ? question.options : [];
  const answers = Array.isArray(question.answers) ? question.answers : [];

  return {
    id: Number(question.id),
    questionNumber: Number(question.question_number || 0),
    content: question.content || question.text || "",
    questionType: question.question_type || (answers.length ? "FILL_IN_BLANK" : "MULTIPLE_CHOICE"),
    points: Number(question.points || 1),
    groupId: question.group || null,
    options: options.map((option, index) => ({
      id: option.id ?? `legacy-${index + 1}`,
      content: option.content || "",
      orderIndex: Number(option.order_index || index + 1),
    })),
    answers: answers.map((answer, index) => ({
      id: answer.id ?? index + 1,
      acceptable_text: answer.acceptable_text || "",
      is_case_sensitive: Boolean(answer.is_case_sensitive),
    })),
    explainText: question.explain_text || question.explanation || "",
    legacyOptions: [question.opt_a, question.opt_b, question.opt_c, question.opt_d].filter(Boolean),
  };
}

function normalizeQuestionGroup(group) {
  const questions = Array.isArray(group.questions) ? group.questions : [];
  return {
    id: Number(group.id),
    instruction: group.instruction || "",
    passageText: group.passage_text || "",
    audioUrl: group.audio_url || "",
    groupType: group.group_type || "other",
    orderIndex: Number(group.order_index || 0),
    questions: questions.map(normalizeExamQuestion),
  };
}

function normalizeSection(section) {
  const groups = Array.isArray(section.question_groups) ? section.question_groups : [];
  return {
    id: Number(section.id),
    name: section.name || "Phần thi",
    maxScore: Number(section.max_score || 0),
    orderIndex: Number(section.order_index || 0),
    questionGroups: groups.map(normalizeQuestionGroup),
  };
}

function flattenQuestionsFromSections(sections) {
  const flat = [];
  sections.forEach((section) => {
    section.questionGroups.forEach((group) => {
      group.questions.forEach((question) => {
        flat.push({
          ...question,
          sectionId: section.id,
          sectionName: section.name,
          groupInstruction: group.instruction,
          passageText: group.passageText,
          audioUrl: group.audioUrl,
          groupType: group.groupType,
        });
      });
    });
  });
  return flat.sort((left, right) => {
    const leftNumber = left.questionNumber || 0;
    const rightNumber = right.questionNumber || 0;
    return leftNumber - rightNumber || left.id - right.id;
  });
}

function buildLegacyQuestions(questions) {
  return questions.map((question, index) => {
    const normalized = normalizeExamQuestion(question);
    return {
      ...normalized,
      questionNumber: normalized.questionNumber || index + 1,
      sectionId: null,
      sectionName: "Đề thi",
      groupInstruction: "",
      passageText: "",
      audioUrl: "",
      groupType: "other",
    };
  });
}

function buildExamFromApi(quiz) {
  const sections = Array.isArray(quiz.sections) ? quiz.sections.map(normalizeSection) : [];
  const fallbackQuestions = Array.isArray(quiz.questions) ? buildLegacyQuestions(quiz.questions) : [];
  const questions = sections.length ? flattenQuestionsFromSections(sections) : fallbackQuestions;
  const totalScore = Number(quiz.total_score || 0) || Math.max(questions.reduce((sum, question) => sum + Number(question.points || 1), 0), questions.length);

  return {
    id: quiz.id,
    title: quiz.title,
    level: quiz.level ? `JLPT ${quiz.level}` : "JLPT",
    subtitle: quiz.quiz_type === "practice" ? "Đề thi luyện tập" : "Bài kiểm tra",
    duration: `${quiz.time_limit} phút`,
    questionCount: `${questions.length} câu hỏi`,
    points: `${totalScore} điểm`,
    tip: "Đọc kỹ yêu cầu từng nhóm câu hỏi, rồi chọn hoặc nhập đáp án phù hợp.",
    intro: "Bài thi gồm câu trắc nghiệm và câu điền từ. Một số đoạn văn hoặc audio dùng chung cho nhiều câu trong cùng nhóm.",
    sections,
    questions,
  };
}

function getQuestionSelection(questionId) {
  return selectedAnswers.get(questionId) || {};
}

function hasSelection(answer) {
  if (!answer) return false;
  const choice = String(answer.choice_id || answer.choice || "").trim();
  const text = String(answer.text || answer.selected_text || "").trim();
  return Boolean(choice || text);
}

function setQuestionSelection(questionId, answer) {
  if (hasSelection(answer)) {
    selectedAnswers.set(questionId, answer);
  } else {
    selectedAnswers.delete(questionId);
  }
  updateProgress();
  updateNavState();
}

function getQuestionIndex(questionId) {
  if (!currentExam) return -1;
  return currentExam.questions.findIndex((question) => Number(question.id) === Number(questionId));
}

function getQuestionLabel(questionId) {
  const index = getQuestionIndex(questionId);
  return index >= 0 ? index + 1 : questionId;
}

function renderQuestionOption(question, option, optionIndex, selectedChoiceId) {
  const optionId = String(option.id);
  const checked = selectedChoiceId && String(selectedChoiceId) === optionId ? "checked" : "";
  const letter = String.fromCharCode(65 + optionIndex);
  return `
    <label class="option-item" data-option-id="${escapeHtml(optionId)}">
      <input type="radio" name="question-${question.id}" value="${escapeHtml(optionId)}" data-answer-choice ${checked}>
      <span>${letter}. ${escapeHtml(option.content)}</span>
    </label>
  `;
}

function renderQuestionCard(question) {
  const selected = getQuestionSelection(question.id);
  const selectedChoiceId = selected.choice_id || selected.choice || selected.selected_choice || "";
  const selectedText = selected.text || selected.selected_text || "";
  const isFillBlank = question.questionType === "FILL_IN_BLANK";

  return `
    <article class="question-card" id="question-${question.id}" data-question-id="${question.id}" data-question-type="${escapeHtml(question.questionType)}">
      <div class="question-head">
        <div class="question-number">Câu ${getQuestionLabel(question.id)}</div>
        <div class="question-actions">
          <button type="button" class="review-toggle ${flaggedQuestions.has(question.id) ? "active" : ""}" data-flag-btn="${question.id}">${flaggedQuestions.has(question.id) ? "Bỏ đánh dấu" : "Đánh dấu phân vân"}</button>
        </div>
      </div>
      <div class="question-text">${escapeHtml(question.content)}</div>
      ${isFillBlank ? `
        <div class="fib-answer-wrap">
          <input type="text" class="fib-answer-input" data-answer-text data-question-id="${question.id}" value="${escapeHtml(selectedText)}" placeholder="Nhập đáp án của bạn">
        </div>
      ` : `
        <div class="option-list">
          ${(question.options.length ? question.options : question.legacyOptions.map((content, index) => ({ id: String.fromCharCode(65 + index), content })))
            .map((option, index) => renderQuestionOption(question, option, index, selectedChoiceId))
            .join("")}
        </div>
      `}
    </article>
  `;
}

function renderQuestionGroup(group) {
  const passageHtml = group.passageText
    ? `<div class="passage-box">${escapeHtml(group.passageText).replace(/\n/g, "<br>")}</div>`
    : "";
  const audioHtml = group.audioUrl
    ? `<div class="group-audio"><audio controls src="${escapeHtml(group.audioUrl)}"></audio></div>`
    : "";

  return `
    <section class="question-group">
      <div class="question-group-header">
        <div>
          <h3>${escapeHtml(group.instruction)}</h3>
          <span class="group-tag">${escapeHtml(group.groupType)}</span>
        </div>
      </div>
      ${passageHtml}
      ${audioHtml}
      <div class="question-stack">
        ${group.questions.map((question) => renderQuestionCard(question)).join("")}
      </div>
    </section>
  `;
}

function renderSection(section) {
  return `
    <section class="exam-section">
      <div class="exam-section-header">
        <h2>${escapeHtml(section.name)}</h2>
        <span>${section.maxScore ? `${section.maxScore} điểm` : ""}</span>
      </div>
      ${section.questionGroups.map((group) => renderQuestionGroup(group)).join("")}
    </section>
  `;
}

function renderFallbackSection() {
  if (!currentExam) return "";
  return `
    <section class="exam-section">
      <div class="exam-section-header">
        <h2>Đề thi</h2>
        <span>${currentExam.questions.length ? `${currentExam.questions.length} câu` : ""}</span>
      </div>
      <div class="question-stack">
        ${currentExam.questions.map((question) => renderQuestionCard(question)).join("")}
      </div>
    </section>
  `;
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
  const questionList = document.getElementById("questionList");
  const questionNav = document.getElementById("questionNav");

  if (levelTag) levelTag.textContent = exam.level;
  if (title) title.textContent = exam.title;
  if (subtitle) subtitle.textContent = exam.subtitle;
  if (durationElement) durationElement.textContent = exam.duration;
  if (questionCount) questionCount.textContent = exam.questionCount;
  if (points) points.textContent = exam.points;
  if (intro) intro.textContent = exam.intro;
  if (tip) tip.textContent = exam.tip;

  if (questionList) {
    questionList.innerHTML = exam.sections.length ? exam.sections.map(renderSection).join("") : renderFallbackSection();
  }

  if (questionNav) {
    questionNav.innerHTML = exam.questions
      .map((question, index) => `<button type="button" data-jump-question-id="${question.id}">${question.questionNumber || index + 1}</button>`)
      .join("");
  }

  bindExamEvents();
  updateFlagUI();
  updateProgress();
  updateNavState();

  if (!isSubmitted && !reviewSubmissionId && !timerInterval) {
    examStartTime = Date.now();
    startTimer();
  }
}

function startTimer() {
  if (isSubmitted || reviewSubmissionId) return;
  if (!currentExam || !currentExam.duration) return;

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
      timerInterval = null;
      autoSubmitExam();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerElement = document.getElementById("examTimer");
  if (!timerElement) return;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  timerElement.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

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
  const questionList = document.getElementById("questionList");
  if (!questionList) return;

  questionList.querySelectorAll("[data-flag-btn]").forEach((button) => {
    button.addEventListener("click", () => {
      if (isSubmitted) return;
      const questionId = Number(button.getAttribute("data-flag-btn"));
      if (flaggedQuestions.has(questionId)) {
        flaggedQuestions.delete(questionId);
      } else {
        flaggedQuestions.add(questionId);
      }
      updateFlagUI();
    });
  });

  questionList.querySelectorAll('input[data-answer-choice]').forEach((input) => {
    input.addEventListener("change", () => {
      if (isSubmitted) return;
      const questionId = Number(input.name.replace("question-", ""));
      setQuestionSelection(questionId, {
        type: "MULTIPLE_CHOICE",
        choice_id: String(input.value),
      });
    });
  });

  questionList.querySelectorAll("input[data-answer-text]").forEach((input) => {
    input.addEventListener("input", () => {
      if (isSubmitted) return;
      const questionId = Number(input.getAttribute("data-question-id"));
      setQuestionSelection(questionId, {
        type: "FILL_IN_BLANK",
        text: input.value,
      });
    });
  });

  const questionNav = document.getElementById("questionNav");
  questionNav?.querySelectorAll("[data-jump-question-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const questionId = Number(button.getAttribute("data-jump-question-id"));
      document.getElementById(`question-${questionId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        .map((questionId) => {
          const label = getQuestionLabel(questionId);
          return `<button type="button" class="flag-chip" data-flag-jump="${questionId}">Câu ${label}</button>`;
        })
        .join("");

      flagList.querySelectorAll("[data-flag-jump]").forEach((button) => {
        button.addEventListener("click", () => {
          const questionId = Number(button.getAttribute("data-flag-jump"));
          document.getElementById(`question-${questionId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }
  }

  document.querySelectorAll("[data-flag-btn]").forEach((button) => {
    const questionId = Number(button.getAttribute("data-flag-btn"));
    const active = flaggedQuestions.has(questionId);
    button.classList.toggle("active", active);
    button.textContent = active ? "Bỏ đánh dấu" : "Đánh dấu phân vân";
    document.getElementById(`question-${questionId}`)?.classList.toggle("flagged", active);
  });
}

function updateProgress() {
  const progressText = document.getElementById("examProgressText");
  if (!progressText || !currentExam) return;

  const answeredCount = Array.from(selectedAnswers.values()).filter(hasSelection).length;
  progressText.textContent = `${answeredCount} / ${currentExam.questions.length} câu đã chọn`;
}

function updateNavState() {
  document.querySelectorAll("[data-jump-question-id]").forEach((button) => {
    const questionId = Number(button.getAttribute("data-jump-question-id"));
    const answered = selectedAnswers.has(questionId);
    button.classList.toggle("active", answered);
    button.classList.toggle("flagged", flaggedQuestions.has(questionId));
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
  const answers = Array.from(selectedAnswers.entries())
    .filter(([, answer]) => hasSelection(answer))
    .map(([questionId, answer]) => ({
      question_id: questionId,
      choice: answer.choice_id || answer.choice || "",
      text: answer.text || answer.selected_text || "",
    }));

  const response = await fetch(`${API_BASE_URL}/quizzes/${currentExam.id}/submit/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.access}`,
    },
    body: JSON.stringify({ answers, duration_seconds: durationSeconds }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    renderSubmitMessage(data.error || data.detail || "Không thể nộp bài.", "error");
    return;
  }

  isSubmitted = true;
  storeSubmission(data, answers);
  renderResultBar(data);
  applyAnswerHighlights(Array.isArray(data.details) ? data.details : []);
  lockExamInputs();
}

function storeSubmission(result, answers) {
  if (!result || !result.submission_id) return;

  const payload = {
    quiz_id: currentExam ? currentExam.id : null,
    result,
    answers: answers || Array.from(selectedAnswers.entries()).map(([questionId, answer]) => ({
      question_id: questionId,
      choice: answer.choice_id || answer.choice || "",
      text: answer.text || answer.selected_text || "",
    })),
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

  const totalValue = result.total ?? result.total_questions ?? 0;
  const durationText = result.duration_seconds ? `${Math.round(result.duration_seconds / 60)} phút` : "";
  bar.innerHTML = `
    <div><strong>Điểm số:</strong> ${result.score}</div>
    <div><strong>Đúng:</strong> ${result.correct_count} / ${totalValue}</div>
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

function renderExplanation(card, explanation, correctSummary) {
  if (!card) return;
  let block = card.querySelector(".answer-explanation");
  const parts = [];
  if (correctSummary) parts.push(correctSummary);
  if (explanation) parts.push(`Giải thích: ${explanation}`);

  if (!parts.length) {
    if (block) block.remove();
    return;
  }

  if (!block) {
    block = document.createElement("div");
    block.className = "answer-explanation";
    card.appendChild(block);
  }
  block.textContent = parts.join(" • ");
}

function applyAnswerHighlights(details) {
  const detailMap = new Map(details.map((item) => [Number(item.question_id), item]));

  document.querySelectorAll(".question-card").forEach((card) => {
    const questionId = Number(card.getAttribute("data-question-id"));
    const question = currentExam ? currentExam.questions.find((item) => Number(item.id) === questionId) : null;
    if (!question) return;

    const detail = detailMap.get(questionId);
    if (!detail) return;

    if (question.questionType === "MULTIPLE_CHOICE") {
      const correctChoiceId = detail.correct_answer && typeof detail.correct_answer === "object"
        ? String(detail.correct_answer.choice_id || "")
        : String(detail.correct_answer || "");
      const selectedChoiceId = String(detail.selected_choice || getQuestionSelection(questionId).choice_id || getQuestionSelection(questionId).choice || "");

      card.querySelectorAll("[data-option-id]").forEach((option) => {
        const optionId = String(option.getAttribute("data-option-id") || "");
        option.classList.remove("is-correct", "is-wrong");

        if (correctChoiceId && optionId === correctChoiceId) {
          option.classList.add("is-correct");
        }

        if (selectedChoiceId && selectedChoiceId === optionId && selectedChoiceId !== correctChoiceId) {
          option.classList.add("is-wrong");
        }
      });

      const correctSummary = detail.correct_answer && typeof detail.correct_answer === "object" && detail.correct_answer.content
        ? `Đáp án đúng: ${detail.correct_answer.content}`
        : correctChoiceId
          ? `Đáp án đúng: ${correctChoiceId}`
          : "";
      renderExplanation(card, detail.explain_text || detail.explanation || question.explainText || "", correctSummary);
      return;
    }

    const input = card.querySelector("[data-answer-text]");
    if (input) {
      input.classList.remove("is-correct", "is-wrong");
      input.classList.toggle("is-correct", Boolean(detail.is_correct));
      input.classList.toggle("is-wrong", !detail.is_correct && Boolean((detail.selected_text || "").trim()));
    }

    const correctSummary = Array.isArray(detail.correct_texts) && detail.correct_texts.length
      ? `Đáp án chấp nhận: ${detail.correct_texts.map((item) => item.acceptable_text).join(", ")}`
      : "";
    renderExplanation(card, detail.explain_text || detail.explanation || question.explainText || "", correctSummary);
  });
}

function lockExamInputs() {
  document.querySelectorAll('input[type="radio"][data-answer-choice]').forEach((input) => {
    input.disabled = true;
  });
  document.querySelectorAll('[data-answer-text]').forEach((input) => {
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

    if (reviewParams.review && reviewSubmissionId) {
      const stored = getStoredSubmission(reviewSubmissionId);
      if (stored && stored.result) {
        isSubmitted = true;
        if (Array.isArray(stored.answers)) {
          stored.answers.forEach((answer) => {
            if (answer.choice || answer.text) {
              selectedAnswers.set(answer.question_id, {
                choice_id: answer.choice || "",
                text: answer.text || "",
              });
            }
          });
        }
        renderExam();
        renderResultBar(stored.result);
        applyAnswerHighlights(Array.isArray(stored.result.details) ? stored.result.details : []);
        lockExamInputs();

        const timerContainer = document.getElementById("timerContainer");
        const examDurationStatic = document.getElementById("examDurationStatic");
        if (timerContainer) timerContainer.style.display = "none";
        if (examDurationStatic) examDurationStatic.style.display = "inline-block";
        return;
      }

      fetchSubmissionDetail(reviewSubmissionId);
      return;
    }

    renderExam();
  });

  document.getElementById("backToExamsBtn")?.addEventListener("click", () => {
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
    headers: { Authorization: `Bearer ${tokens.access}` },
  });
  if (!response.ok) return;

  const data = await response.json();
  if (!data || !Array.isArray(data.answers)) return;

  selectedAnswers.clear();
  data.answers.forEach((answer) => {
    if (!answer.question_id) return;
    selectedAnswers.set(Number(answer.question_id), {
      choice_id: answer.selected_choice || "",
      text: answer.selected_text || "",
    });
  });

  isSubmitted = true;
  renderExam();
  renderResultBar({
    score: data.score,
    correct_count: data.correct_count,
    total: data.total_questions,
    duration_seconds: data.duration_seconds,
  });
  applyAnswerHighlights(data.answers.map((answer) => ({
    question_id: answer.question_id,
    question_type: answer.question_type,
    selected_choice: answer.selected_choice,
    selected_text: answer.selected_text,
    correct_answer: answer.correct_answer,
    correct_texts: answer.correct_texts,
    is_correct: answer.is_correct,
    explain_text: answer.explain_text,
  })));
  lockExamInputs();

  const timerContainer = document.getElementById("timerContainer");
  const examDurationStatic = document.getElementById("examDurationStatic");
  if (timerContainer) timerContainer.style.display = "none";
  if (examDurationStatic) examDurationStatic.style.display = "inline-block";
}
