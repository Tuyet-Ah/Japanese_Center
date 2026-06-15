/**
 * exam-detail.js — Trang làm bài thi JLPT chuẩn mới
 *
 * Cấu trúc dữ liệu: Exam → Sections → QuestionGroups → Questions (MCQ / FIB)
 * URL params:
 *   ?exam=<id>                      → làm bài mới
 *   ?exam=<id>&review=1&submission=<sid> → xem lại bài đã làm
 */

// ── State ──
const selectedAnswers = new Map();   // question_id → { selected_option_id? | text_answer? }
const flaggedQuestions = new Set();
let currentExam = null;           // object đề thi đầy đủ từ API
let allQuestions = [];             // flat list ExamQuestion
let isSubmitted = false;
let examStartTime = null;
let timerInterval = null;
let remainingSeconds = 0;
let reviewMode = false;
let reviewSubmissionId = null;

// ── Helpers ──
function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function flattenQuestions(exam) {
  const list = [];
  (exam.sections || []).forEach(sec => {
    (sec.question_groups || []).forEach(grp => {
      (grp.questions || []).forEach(q => {
        list.push({ ...q, _section: sec, _group: grp });
      });
    });
  });
  return list.sort((a, b) => a.question_number - b.question_number);
}

// ── Render đề thi ──
function renderExam() {
  const exam = currentExam;
  if (!exam) return;

  document.getElementById('examLevelTag')?.setAttribute('data-text', `JLPT ${exam.level}`);
  const levelTag = document.getElementById('examLevelTag');
  if (levelTag) levelTag.textContent = `JLPT ${exam.level}`;
  const titleEl = document.getElementById('examTitle');
  if (titleEl) titleEl.textContent = exam.title;
  const subtitleEl = document.getElementById('examSubtitle');
  if (subtitleEl) subtitleEl.textContent = `${exam.total_score} điểm tối đa · ${allQuestions.length} câu hỏi`;

  const durationEl = document.querySelector('#examDurationStatic strong');
  if (durationEl) durationEl.textContent = `${exam.duration} phút`;
  const qCountEl = document.getElementById('examQuestionCount');
  if (qCountEl) qCountEl.textContent = `${allQuestions.length} câu hỏi`;
  const pointsEl = document.getElementById('examPoints');
  if (pointsEl) pointsEl.textContent = `${exam.total_score} điểm`;

  renderAllSections();
  renderQuestionNav();
  updateProgress();

  if (!reviewMode) {
    examStartTime = Date.now();
    startTimer();
  }
}

// ── Render các phần (Section) và nhóm câu (QuestionGroup) ──
function renderAllSections() {
  const container = document.getElementById('questionList');
  if (!container) return;
  container.innerHTML = '';

  let questionIndex = 0;
  (currentExam.sections || []).forEach(sec => {
    // Tiêu đề Section
    const secHeader = document.createElement('div');
    secHeader.className = 'exam-section-header';
    secHeader.innerHTML = `<h2 class="section-title">${escHtml(sec.name)}</h2>`;
    container.appendChild(secHeader);

    (sec.question_groups || []).forEach(grp => {
      // Context ngữ liệu (passage / audio)
      if (grp.passage_text || grp.audio_url || grp.instruction) {
        const ctx = document.createElement('div');
        ctx.className = 'question-context-box';
        let html = '';
        if (grp.instruction) html += `<p class="ctx-instruction">${escHtml(grp.instruction)}</p>`;
        if (grp.audio_url) {
          html += `<div class="ctx-audio"><audio controls src="${escHtml(grp.audio_url)}"></audio></div>`;
        }
        if (grp.passage_text) {
          html += `<div class="ctx-passage">${escHtml(grp.passage_text)}</div>`;
        }
        ctx.innerHTML = html;
        container.appendChild(ctx);
      }

      // Câu hỏi trong nhóm
      (grp.questions || []).forEach(q => {
        const idx = questionIndex++;
        container.appendChild(renderQuestionCard(q, idx));
      });
    });
  });

  bindQuestionEvents();
  updateFlagUI();
}

function renderQuestionCard(q, idx) {
  const card = document.createElement('article');
  card.className = 'question-card';
  card.id = `question-${idx}`;
  card.dataset.questionId = q.id;
  card.dataset.questionType = q.question_type;

  let optionsHtml = '';
  if (q.question_type === 'MULTIPLE_CHOICE') {
    const opts = (q.mcq_options || []).sort((a, b) => a.order_index - b.order_index);
    optionsHtml = `<div class="option-list">
      ${opts.map(opt => `
        <label class="option-item" data-question-id="${q.id}" data-option-id="${opt.id}">
          <input type="radio" name="q-${q.id}" value="${opt.id}">
          <span>${escHtml(opt.content)}</span>
        </label>`).join('')}
    </div>`;
  } else if (q.question_type === 'FILL_IN_BLANK') {
    optionsHtml = `<div class="fib-input-wrap">
      <input type="text" class="fib-input" data-question-id="${q.id}"
        placeholder="Nhập câu trả lời của bạn..." autocomplete="off">
    </div>`;
  }

  card.innerHTML = `
    <div class="question-head">
      <div class="question-number">Câu ${q.question_number}</div>
      <div class="question-actions">
        <button type="button" class="review-toggle" data-flag-btn="${idx}">Đánh dấu phân vân</button>
      </div>
    </div>
    <div class="question-text">${escHtml(q.content)}</div>
    ${optionsHtml}
  `;
  return card;
}

// ── Timer ──
function startTimer() {
  if (!currentExam) return;
  const totalMinutes = parseInt(currentExam.duration, 10);
  if (!totalMinutes) return;
  remainingSeconds = totalMinutes * 60;

  const timerContainer = document.getElementById('timerContainer');
  const durationStatic = document.getElementById('examDurationStatic');
  if (timerContainer) timerContainer.style.display = 'inline-block';
  if (durationStatic) durationStatic.style.display = 'none';

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
  const el = document.getElementById('examTimer');
  if (!el) return;
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  el.classList.remove('warning', 'danger');
  if (remainingSeconds <= 60) el.classList.add('danger');
  else if (remainingSeconds <= 300) el.classList.add('warning');
}

async function autoSubmitExam() {
  if (isSubmitted) return;
  await submitExam();
}

// ── Events ──
function bindQuestionEvents() {
  // MCQ radio
  document.querySelectorAll('.question-card input[type="radio"]').forEach(input => {
    input.addEventListener('change', () => {
      if (isSubmitted) return;
      const qId = parseInt(input.name.replace('q-', ''));
      const optId = parseInt(input.value);
      selectedAnswers.set(qId, { selected_option_id: optId });
      updateProgress();
      updateNavState();
    });
  });

  // FIB text input
  document.querySelectorAll('.fib-input').forEach(input => {
    input.addEventListener('input', () => {
      if (isSubmitted) return;
      const qId = parseInt(input.getAttribute('data-question-id'));
      selectedAnswers.set(qId, { text_answer: input.value });
      updateProgress();
      updateNavState();
    });
  });

  // Flag buttons
  document.querySelectorAll('[data-flag-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (isSubmitted) return;
      const idx = Number(btn.getAttribute('data-flag-btn'));
      if (flaggedQuestions.has(idx)) flaggedQuestions.delete(idx);
      else flaggedQuestions.add(idx);
      updateFlagUI();
    });
  });

  // Jump nav
  document.querySelectorAll('[data-jump]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-jump'));
      document.getElementById(`question-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Submit button
  document.getElementById('submitExamBtn')?.addEventListener('click', async () => {
    if (isSubmitted) return;
    await submitExam();
  });
}

function renderQuestionNav() {
  const nav = document.getElementById('questionNav');
  if (!nav) return;
  nav.innerHTML = allQuestions.map((_, i) =>
    `<button type="button" data-jump="${i}">${i + 1}</button>`
  ).join('');
  // Bind after render
  nav.querySelectorAll('[data-jump]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-jump'));
      document.getElementById(`question-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function updateFlagUI() {
  const flagList = document.getElementById('flagList');
  const flagCount = document.getElementById('flagCount');
  if (flagCount) flagCount.textContent = String(flaggedQuestions.size);

  if (flagList) {
    if (!flaggedQuestions.size) {
      flagList.innerHTML = '<span class="flag-chip">Chưa có câu nào</span>';
    } else {
      flagList.innerHTML = Array.from(flaggedQuestions).sort((a, b) => a - b)
        .map(i => `<button type="button" class="flag-chip" data-flag-jump="${i}">Câu ${i + 1}</button>`)
        .join('');
      flagList.querySelectorAll('[data-flag-jump]').forEach(b => {
        b.addEventListener('click', () => {
          document.getElementById(`question-${b.getAttribute('data-flag-jump')}`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }
  }

  document.querySelectorAll('[data-flag-btn]').forEach(btn => {
    const idx = Number(btn.getAttribute('data-flag-btn'));
    const active = flaggedQuestions.has(idx);
    btn.classList.toggle('active', active);
    btn.textContent = active ? 'Bỏ đánh dấu' : 'Đánh dấu phân vân';
    document.getElementById(`question-${idx}`)?.classList.toggle('flagged', active);
  });

  updateNavState();
}

function updateProgress() {
  const el = document.getElementById('examProgressText');
  if (el && currentExam) {
    el.textContent = `${selectedAnswers.size} / ${allQuestions.length} câu đã chọn`;
  }
}

function updateNavState() {
  document.querySelectorAll('[data-jump]').forEach(btn => {
    const idx = Number(btn.getAttribute('data-jump'));
    const q = allQuestions[idx];
    const answered = q ? selectedAnswers.has(q.id) : false;
    btn.classList.toggle('active', answered);
    btn.classList.toggle('flagged', flaggedQuestions.has(idx));
  });
}

// ── Submit ──
async function submitExam() {
  if (!currentExam) return;
  clearInterval(timerInterval);
  timerInterval = null;

  const tokens = typeof getAuthTokens === 'function' ? getAuthTokens() : null;
  if (!tokens?.access) { showResultBar('Vui lòng đăng nhập để nộp bài.', true); return; }

  const durationSeconds = examStartTime ? Math.round((Date.now() - examStartTime) / 1000) : 0;

  const answers = allQuestions.map(q => {
    const ans = selectedAnswers.get(q.id) || {};
    return { question_id: q.id, ...ans };
  });

  const res = await fetch(`${API_BASE_URL}/exams/${currentExam.id}/submit/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.access}` },
    body: JSON.stringify({ answers, duration_seconds: durationSeconds })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) { showResultBar(data.error || 'Không thể nộp bài.', true); return; }

  isSubmitted = true;
  showResultBar(data, false);
  applyAnswerHighlights(data.details || []);
  lockExamInputs();
}

// ── Hiển thị kết quả ──
function showResultBar(dataOrMsg, isError) {
  const toolbar = document.querySelector('.exam-toolbar');
  if (!toolbar) return;

  let bar = document.getElementById('examResultBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'examResultBar';
    bar.className = 'exam-result-bar';
    toolbar.insertAdjacentElement('afterend', bar);
  }

  if (isError) {
    bar.className = 'exam-result-bar exam-result-error';
    bar.textContent = String(dataOrMsg);
    return;
  }

  const d = dataOrMsg;
  const pct = d.max_score ? Math.round(d.total_score / d.max_score * 100) : 0;
  const dur = d.duration_seconds ? `${Math.round(d.duration_seconds / 60)} phút` : '';
  bar.className = 'exam-result-bar';
  bar.innerHTML = `
    <div class="result-bar-inner">
      <div class="result-bar-score">
        <strong>${d.total_score}/${d.max_score}</strong> điểm
        <span class="result-pct">${pct}%</span>
      </div>
      <div>Đúng: <strong>${d.correct_count}/${d.total_questions}</strong> câu</div>
      ${dur ? `<div>Thời gian: <strong>${dur}</strong></div>` : ''}
      ${d.submission_id ? `
        <a href="exams.html" class="btn btn-outline" style="font-size:0.85rem;">Về danh sách đề</a>
        <a href="exam-detail.html?exam=${currentExam.id}&review=1&submission=${d.submission_id}"
           class="btn btn-primary" style="font-size:0.85rem;">Xem lại bài làm</a>` : ''}
    </div>`;
}

// ── Highlight đáp án sau khi nộp ──
function applyAnswerHighlights(details) {
  const detailMap = new Map(details.map(d => [d.question_id, d]));

  document.querySelectorAll('.question-card').forEach(card => {
    const qId = parseInt(card.dataset.questionId);
    const qType = card.dataset.questionType;
    const detail = detailMap.get(qId);
    if (!detail) return;

    if (qType === 'MULTIPLE_CHOICE') {
      card.querySelectorAll('.option-item').forEach(opt => {
        const optId = parseInt(opt.getAttribute('data-option-id'));
        const userAns = selectedAnswers.get(qId);
        opt.classList.remove('is-correct', 'is-wrong');

        // Highlight đáp án đúng bằng content match với correct_answer string
        const thisContent = opt.querySelector('span')?.textContent?.trim();
        if (thisContent && detail.correct_answer && thisContent === detail.correct_answer) {
          opt.classList.add('is-correct');
        }
        // Tick radio + highlight đỏ nếu user chọn option này mà sai
        if (userAns?.selected_option_id === optId) {
          const radio = opt.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
          if (!detail.is_correct) opt.classList.add('is-wrong');
        }
      });
    } else if (qType === 'FILL_IN_BLANK') {
      const fibInput = card.querySelector('.fib-input');
      if (fibInput) {
        fibInput.classList.remove('fib-correct', 'fib-wrong');
        fibInput.classList.add(detail.is_correct ? 'fib-correct' : 'fib-wrong');
        fibInput.readOnly = true;
        if (!detail.is_correct && detail.correct_answer) {
          let hint = card.querySelector('.fib-correct-hint');
          if (!hint) {
            hint = document.createElement('div');
            hint.className = 'fib-correct-hint';
            fibInput.parentElement?.appendChild(hint);
          }
          hint.textContent = `Đáp án đúng: ${detail.correct_answer}`;
        }
      }
    }

    // Giải thích
    if (detail.explain_text ?? detail.correct_answer) {
      let exp = card.querySelector('.answer-explanation');
      if (!exp) {
        exp = document.createElement('div');
        exp.className = 'answer-explanation';
        card.appendChild(exp);
      }
      const explain = detail.explain_text || `Đáp án đúng: ${detail.correct_answer}`;
      exp.textContent = `Giải thích: ${explain}`;
    }
  });
}

function lockExamInputs() {
  document.querySelectorAll('.question-card input').forEach(i => { i.disabled = true; });
  document.querySelectorAll('[data-flag-btn]').forEach(b => { b.disabled = true; });
  const submitBtn = document.getElementById('submitExamBtn');
  if (submitBtn) submitBtn.disabled = true;
}

// ── Load đề thi từ API ──
async function loadExam() {
  const params = new URLSearchParams(window.location.search);
  const examId = params.get('exam');
  reviewMode = params.get('review') === '1';
  reviewSubmissionId = params.get('submission') || null;

  if (!examId) return null;

  const tokens = typeof getAuthTokens === 'function' ? getAuthTokens() : null;
  if (!tokens?.access) return null;

  const res = await fetch(`${API_BASE_URL}/exams/${examId}/`, {
    headers: { Authorization: `Bearer ${tokens.access}` }
  });
  if (!res.ok) return null;
  return res.json();
}

// ── Load bài đã làm để xem lại ──
async function loadReview(submissionId) {
  const tokens = typeof getAuthTokens === 'function' ? getAuthTokens() : null;
  if (!tokens?.access || !submissionId) return;

  const res = await fetch(`${API_BASE_URL}/exam-submissions/${submissionId}/`, {
    headers: { Authorization: `Bearer ${tokens.access}` }
  });
  if (!res.ok) return;
  const data = await res.json();

  // Điền lại đáp án MCQ từ details
  (data.details || []).forEach(d => {
    if (d.selected_option_id != null) {
      selectedAnswers.set(d.question_id, { selected_option_id: d.selected_option_id });
    }
    if (d.user_text_answer != null) {
      selectedAnswers.set(d.question_id, { text_answer: d.user_text_answer });
    }
  });

  // Điền giá trị FIB vào DOM (phải làm sau khi renderExam đã chạy)
  (data.details || []).forEach(d => {
    if (d.user_text_answer != null) {
      const card = document.querySelector(`[data-question-id="${d.question_id}"]`);
      const input = card?.querySelector('.fib-input');
      if (input) input.value = d.user_text_answer;
    }
  });

  isSubmitted = true;
  showResultBar(data, false);
  applyAnswerHighlights(data.details || []);
  lockExamInputs();

  // Ẩn timer ở chế độ review
  const timerContainer = document.getElementById('timerContainer');
  const durationStatic = document.getElementById('examDurationStatic');
  if (timerContainer) timerContainer.style.display = 'none';
  if (durationStatic) durationStatic.style.display = 'inline-block';
}

// ── Gắn nút quay lại ──
function ensureBackButton() {
  const heroTop = document.querySelector('.exam-hero-top');
  if (!heroTop || document.getElementById('backToExamsTop')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'backToExamsTop';
  btn.className = 'btn btn-outline exam-back-top';
  btn.textContent = 'Quay lại';
  btn.addEventListener('click', () => { clearInterval(timerInterval); window.history.back(); });
  heroTop.appendChild(btn);
}

// ── DOMContentLoaded ──
document.addEventListener('DOMContentLoaded', async () => {
  initStandardHeader();
  ensureBackButton();

  const exam = await loadExam();
  if (!exam) {
    const titleEl = document.getElementById('examTitle');
    if (titleEl) titleEl.textContent = 'Không tải được đề thi. Vui lòng đăng nhập và thử lại.';
    return;
  }

  currentExam = exam;
  allQuestions = flattenQuestions(exam);
  renderExam();

  if (reviewMode && reviewSubmissionId) {
    await loadReview(reviewSubmissionId);
  }

  document.getElementById('backToExamsBtn')?.addEventListener('click', () => {
    clearInterval(timerInterval);
    window.history.back();
  });
});
