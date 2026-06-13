/**
 * admin-exams.js — Quản lý Đề Thi JLPT (CRUD + Dynamic Form)
 *
 * Kiến trúc cây: Exam → Section → QuestionGroup → Question → MCQ Options / FIB Answers
 *
 * Phụ thuộc: script.js (getAuthTokens, API_BASE_URL, initAdminShell, escapeHtml)
 */

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
let currentEditExamId = null;
let pendingDeleteExamId = null;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const esc = (v) =>
      String(v ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function authHeaders() {
      const tokens = typeof getAuthTokens === 'function' ? getAuthTokens() : null;
      if (!tokens?.access) return null;
      return { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.access}` };
}

function statusLabel(s) {
      const map = { draft: 'Nháp', published: 'Công bố', hidden: 'Ẩn' };
      return map[s] ?? s;
}

// ─────────────────────────────────────────────
// API calls
// ─────────────────────────────────────────────
async function fetchExams(params = {}) {
      const headers = authHeaders();
      if (!headers) throw new Error('Chưa đăng nhập.');
      const qs = new URLSearchParams(
            Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
      ).toString();
      const url = `${API_BASE_URL}/admin/exams/${qs ? `?${qs}` : ''}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error('Không thể tải danh sách đề thi.');
      return res.json();
}

async function fetchExamDetail(id) {
      const headers = authHeaders();
      if (!headers) throw new Error('Chưa đăng nhập.');
      const res = await fetch(`${API_BASE_URL}/admin/exams/${id}/`, { headers });
      if (!res.ok) throw new Error('Không thể tải chi tiết đề thi.');
      return res.json();
}

async function saveExam(payload, id = null) {
      const headers = authHeaders();
      if (!headers) throw new Error('Chưa đăng nhập.');
      const url = id ? `${API_BASE_URL}/admin/exams/${id}/` : `${API_BASE_URL}/admin/exams/`;
      const res = await fetch(url, {
            method: id ? 'PATCH' : 'POST',
            headers,
            body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.detail || 'Lỗi khi lưu đề thi.');
      return data;
}

async function deleteExam(id) {
      const headers = authHeaders();
      if (!headers) throw new Error('Chưa đăng nhập.');
      const res = await fetch(`${API_BASE_URL}/admin/exams/${id}/`, { method: 'DELETE', headers });
      if (!res.ok && res.status !== 204) throw new Error('Không thể xóa đề thi.');
}

// ─────────────────────────────────────────────
// Table Rendering
// ─────────────────────────────────────────────
function renderExamTable(exams) {
      const tbody = document.getElementById('examsTableBody');
      if (!tbody) return;
      if (!Array.isArray(exams) || exams.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8">Không có đề thi phù hợp.</td></tr>';
            return;
      }
      tbody.innerHTML = exams.map((exam, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(exam.title)}</td>
      <td><span class="badge">${esc(exam.level)}</span></td>
      <td>${exam.duration} phút</td>
      <td>${exam.total_score}</td>
      <td>${exam.question_count ?? 0}</td>
      <td><span class="status-badge ${esc(exam.status)}">${statusLabel(exam.status)}</span></td>
      <td>
        <button class="btn btn-small" onclick="openEditExam(${exam.id})">Sửa</button>
        <button class="btn btn-small btn-danger" onclick="confirmDeleteExam(${exam.id})">Xóa</button>
      </td>
    </tr>
  `).join('');
}

async function loadExams() {
      const tbody = document.getElementById('examsTableBody');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="8">Đang tải...</td></tr>';
      try {
            const params = {
                  search: document.getElementById('examSearchInput')?.value.trim() || '',
                  level: document.getElementById('examLevelFilter')?.value || '',
                  status: document.getElementById('examStatusFilter')?.value || '',
            };
            const data = await fetchExams(params);
            renderExamTable(data);
      } catch (err) {
            tbody.innerHTML = `<tr><td colspan="8">Lỗi: ${esc(err.message)}</td></tr>`;
      }
}

// ─────────────────────────────────────────────
// ── DYNAMIC FORM BUILDER ──
// ─────────────────────────────────────────────

// ─── Question ───────────────────────────────

function createMcqOptionRow(opt = {}) {
      const row = document.createElement('div');
      row.className = 'mcq-option-row' + (opt.is_correct ? ' is-correct' : '');
      row.dataset.optionId = opt.id ?? '';

      row.innerHTML = `
    <input type="radio" name="placeholder" title="Đáp án đúng" ${opt.is_correct ? 'checked' : ''} />
    <input class="opt-content" type="text" placeholder="Nội dung lựa chọn" value="${esc(opt.content ?? '')}" />
    <input class="opt-order" type="number" min="0" value="${opt.order_index ?? 0}" title="Thứ tự" />
    <button type="button" class="btn-remove-opt" title="Xóa lựa chọn">✕</button>
  `;

      // Mark correct when radio is clicked
      row.querySelector('input[type="radio"]').addEventListener('change', () => {
            const container = row.closest('.mcq-options-container');
            container?.querySelectorAll('.mcq-option-row').forEach((r) => r.classList.remove('is-correct'));
            row.classList.add('is-correct');
      });

      row.querySelector('.btn-remove-opt').addEventListener('click', () => row.remove());
      return row;
}

function createFibAnswerRow(ans = {}) {
      const row = document.createElement('div');
      row.className = 'fib-answer-row';
      row.dataset.answerId = ans.id ?? '';

      row.innerHTML = `
    <input class="fib-text" type="text" placeholder="Đáp án hợp lệ (VD: 東京)" value="${esc(ans.acceptable_text ?? '')}" />
    <label class="fib-case-label">
      <input type="checkbox" class="fib-case" ${ans.is_case_sensitive ? 'checked' : ''} />
      Phân biệt hoa/thường
    </label>
    <button type="button" class="btn-remove-fib" title="Xóa đáp án">✕</button>
  `;

      row.querySelector('.btn-remove-fib').addEventListener('click', () => row.remove());
      return row;
}

function createQuestionCard(q = {}, qIndex = 0) {
      const card = document.createElement('div');
      card.className = 'question-card';
      card.dataset.questionId = q.id ?? '';

      const typeLabel = q.question_type === 'FILL_IN_BLANK'
            ? '<span class="question-type-badge fib">Điền từ</span>'
            : '<span class="question-type-badge mcq">Trắc nghiệm</span>';

      card.innerHTML = `
    <div class="question-header">
      <div class="question-num-badge">${qIndex + 1}</div>
      <span class="question-header-title">${esc(q.content?.slice(0, 40) ?? 'Câu hỏi mới')}</span>
      ${typeLabel}
      <span class="question-toggle">▼</span>
      <button type="button" class="btn btn-small btn-danger q-delete-btn" title="Xóa câu hỏi">✕</button>
    </div>
    <div class="question-body">
      <!-- Số thứ tự, loại, điểm -->
      <div class="question-top-row">
        <div class="form-group">
          <label>Câu số</label>
          <input class="q-num" type="number" min="1" value="${q.question_number ?? qIndex + 1}" />
        </div>
        <div class="form-group" style="grid-column:2">
          <label>Loại câu hỏi</label>
          <select class="q-type">
            <option value="MULTIPLE_CHOICE" ${q.question_type === 'MULTIPLE_CHOICE' ? 'selected' : ''}>Trắc nghiệm (MCQ)</option>
            <option value="FILL_IN_BLANK"   ${q.question_type === 'FILL_IN_BLANK' ? 'selected' : ''}>Điền từ (FIB)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Điểm</label>
          <input class="q-points" type="number" min="0" value="${q.points ?? 1}" />
        </div>
      </div>

      <!-- Nội dung câu hỏi -->
      <div class="q-content-row">
        <label>Nội dung câu hỏi <span class="required">*</span></label>
        <textarea class="q-content" rows="3" placeholder="Nhập nội dung câu hỏi...">${esc(q.content ?? '')}</textarea>
      </div>

      <!-- Giải thích -->
      <div class="q-explain-row">
        <label>Giải thích đáp án (hiển thị sau khi nộp bài)</label>
        <textarea class="q-explain" rows="2" placeholder="Ví dụ: Đáp án đúng vì...">${esc(q.explain_text ?? '')}</textarea>
      </div>

      <!-- MCQ Options -->
      <div class="mcq-section">
        <div class="mcq-options-label">📝 Các lựa chọn (chọn radio để đánh dấu đáp án đúng)</div>
        <div class="mcq-options-container"></div>
        <button type="button" class="btn btn-small btn-outline btn-add-option">+ Thêm lựa chọn</button>
      </div>

      <!-- FIB Answers -->
      <div class="fib-section">
        <div class="fib-answers-label">✏️ Các đáp án hợp lệ</div>
        <div class="fib-answers-container"></div>
        <button type="button" class="btn btn-small btn-outline btn-add-fib">+ Thêm đáp án</button>
      </div>
    </div>
  `;

      // Populate MCQ options if editing
      const mcqContainer = card.querySelector('.mcq-options-container');
      if (Array.isArray(q.mcq_options)) {
            q.mcq_options.forEach((opt) => mcqContainer.appendChild(createMcqOptionRow(opt)));
      }
      // Set radio group name unique per card
      const questionRadioGroup = `q_${Date.now()}_${Math.random()}`;

      // Populate FIB answers if editing
      const fibContainer = card.querySelector('.fib-answers-container');
      if (Array.isArray(q.fib_answers)) {
            q.fib_answers.forEach((ans) => fibContainer.appendChild(createFibAnswerRow(ans)));
      }

      // Sync radio name attribute (needed for single-select within a group)
      function syncRadioNames() {
            mcqContainer.querySelectorAll('input[type="radio"]').forEach((r) => {
                  r.name = questionRadioGroup;
            });
      }
      syncRadioNames();

      // Toggle collapse
      card.querySelector('.question-header').addEventListener('click', (e) => {
            if (e.target.closest('.q-delete-btn')) return;
            card.classList.toggle('is-collapsed');
      });

      // Delete card
      card.querySelector('.q-delete-btn').addEventListener('click', () => card.remove());

      // Add MCQ option
      card.querySelector('.btn-add-option').addEventListener('click', () => {
            mcqContainer.appendChild(createMcqOptionRow());
            syncRadioNames();
      });

      // Add FIB answer
      card.querySelector('.btn-add-fib').addEventListener('click', () => {
            fibContainer.appendChild(createFibAnswerRow());
      });

      // Switch question type → show/hide MCQ / FIB sections
      const qTypeSelect = card.querySelector('.q-type');
      const mcqSection = card.querySelector('.mcq-section');
      const fibSection = card.querySelector('.fib-section');
      const typeBadge = card.querySelector('.question-type-badge');

      function updateTypeSections() {
            const isMCQ = qTypeSelect.value === 'MULTIPLE_CHOICE';
            mcqSection.style.display = isMCQ ? '' : 'none';
            fibSection.style.display = isMCQ ? 'none' : '';
            typeBadge.textContent = isMCQ ? 'Trắc nghiệm' : 'Điền từ';
            typeBadge.className = `question-type-badge ${isMCQ ? 'mcq' : 'fib'}`;
      }
      qTypeSelect.addEventListener('change', updateTypeSections);
      updateTypeSections(); // initial

      // Update header title on content change
      card.querySelector('.q-content').addEventListener('input', (e) => {
            card.querySelector('.question-header-title').textContent = e.target.value.slice(0, 40) || 'Câu hỏi mới';
      });

      return card;
}

// ─── Question Group ──────────────────────────

function createQuestionGroupCard(grp = {}) {
      const card = document.createElement('div');
      card.className = 'qgroup-card';
      card.dataset.groupId = grp.id ?? '';

      card.innerHTML = `
    <div class="qgroup-header">
      <span class="qgroup-toggle">▼</span>
      <input class="qgroup-instruction" type="text" placeholder="Hướng dẫn nhóm câu hỏi (VD: Đọc đoạn văn sau và trả lời...)" value="${esc(grp.instruction ?? '')}" />
      <button type="button" class="btn btn-small btn-danger qgroup-delete-btn" title="Xóa nhóm">✕</button>
    </div>
    <div class="qgroup-body">
      <!-- Extras: passage / audio / group_type / order -->
      <div class="qgroup-extras">
        <div class="form-group">
          <label>Loại ngữ liệu</label>
          <select class="grp-type">
            <option value="none"  ${(grp.group_type ?? 'none') === 'none' ? 'selected' : ''}>Không có</option>
            <option value="text"  ${grp.group_type === 'text' ? 'selected' : ''}>Đoạn văn bản</option>
            <option value="audio" ${grp.group_type === 'audio' ? 'selected' : ''}>File nghe (Audio)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Thứ tự</label>
          <input class="grp-order" type="number" min="0" value="${grp.order_index ?? 0}" />
        </div>
        <textarea class="grp-passage" placeholder="Đoạn văn đọc hiểu (để trống nếu không có)" rows="4">${esc(grp.passage_text ?? '')}</textarea>
        <div class="form-group" style="grid-column:1/-1">
          <label>URL Audio (nếu loại ngữ liệu là Audio)</label>
          <input class="grp-audio" type="url" placeholder="https://..." value="${esc(grp.audio_url ?? '')}" />
        </div>
      </div>

      <!-- Questions container -->
      <div class="questions-container"></div>
      <div class="qgroup-actions">
        <button type="button" class="btn btn-small btn-outline btn-add-question">+ Thêm Câu Hỏi</button>
      </div>
    </div>
  `;

      // Populate questions
      const questionsContainer = card.querySelector('.questions-container');
      if (Array.isArray(grp.questions)) {
            grp.questions.forEach((q, i) => questionsContainer.appendChild(createQuestionCard(q, i)));
      }

      // Toggle collapse
      card.querySelector('.qgroup-header').addEventListener('click', (e) => {
            if (e.target.closest('.qgroup-delete-btn') || e.target.closest('.qgroup-instruction')) return;
            card.classList.toggle('is-collapsed');
      });

      // Delete group
      card.querySelector('.qgroup-delete-btn').addEventListener('click', () => card.remove());

      // Add question
      card.querySelector('.btn-add-question').addEventListener('click', () => {
            const count = questionsContainer.querySelectorAll('.question-card').length;
            questionsContainer.appendChild(createQuestionCard({}, count));
      });

      return card;
}

// ─── Section ─────────────────────────────────

function createSectionCard(sec = {}) {
      const card = document.createElement('div');
      card.className = 'section-card';
      card.dataset.sectionId = sec.id ?? '';

      card.innerHTML = `
    <div class="section-header">
      <span class="section-toggle">▼</span>
      <input class="section-name" type="text" placeholder="Tên phần thi (VD: Phần 1 – Từ vựng)" value="${esc(sec.name ?? '')}" />
      <div class="section-meta">
        <label>Điểm tối đa</label>
        <input class="sec-max-score" type="number" min="0" value="${sec.max_score ?? 0}" />
        <label>Thứ tự</label>
        <input class="sec-order" type="number" min="0" value="${sec.order_index ?? 0}" />
      </div>
      <button type="button" class="btn btn-small btn-danger sec-delete-btn" title="Xóa section">✕</button>
    </div>
    <div class="section-body">
      <div class="qgroups-container"></div>
      <div class="section-actions">
        <button type="button" class="btn btn-small btn-outline btn-add-group">+ Thêm Nhóm Câu Hỏi</button>
      </div>
    </div>
  `;

      // Populate groups
      const groupsContainer = card.querySelector('.qgroups-container');
      if (Array.isArray(sec.question_groups)) {
            sec.question_groups.forEach((grp) => groupsContainer.appendChild(createQuestionGroupCard(grp)));
      }

      // Toggle collapse
      card.querySelector('.section-header').addEventListener('click', (e) => {
            if (e.target.closest('.sec-delete-btn') || e.target.matches('input')) return;
            card.classList.toggle('is-collapsed');
      });

      // Delete section
      card.querySelector('.sec-delete-btn').addEventListener('click', () => card.remove());

      // Add group
      card.querySelector('.btn-add-group').addEventListener('click', () => {
            groupsContainer.appendChild(createQuestionGroupCard());
      });

      return card;
}

// ─────────────────────────────────────────────
// ── Read form back into JSON payload ──
// ─────────────────────────────────────────────

function readQuestionCard(card) {
      const qId = card.dataset.questionId ? parseInt(card.dataset.questionId) : null;
      const qType = card.querySelector('.q-type').value;

      const mcq_options = [];
      if (qType === 'MULTIPLE_CHOICE') {
            card.querySelectorAll('.mcq-option-row').forEach((row, idx) => {
                  mcq_options.push({
                        id: row.dataset.optionId ? parseInt(row.dataset.optionId) : null,
                        content: row.querySelector('.opt-content').value.trim(),
                        is_correct: row.classList.contains('is-correct'),
                        order_index: parseInt(row.querySelector('.opt-order').value) || idx,
                  });
            });
      }

      const fib_answers = [];
      if (qType === 'FILL_IN_BLANK') {
            card.querySelectorAll('.fib-answer-row').forEach((row) => {
                  fib_answers.push({
                        id: row.dataset.answerId ? parseInt(row.dataset.answerId) : null,
                        acceptable_text: row.querySelector('.fib-text').value.trim(),
                        is_case_sensitive: row.querySelector('.fib-case').checked,
                  });
            });
      }

      const q = {
            question_number: parseInt(card.querySelector('.q-num').value) || 1,
            content: card.querySelector('.q-content').value.trim(),
            question_type: qType,
            points: parseInt(card.querySelector('.q-points').value) || 1,
            explain_text: card.querySelector('.q-explain').value.trim(),
            mcq_options,
            fib_answers,
      };
      if (qId) q.id = qId;
      return q;
}

function readGroupCard(card) {
      const grpId = card.dataset.groupId ? parseInt(card.dataset.groupId) : null;
      const questions = Array.from(card.querySelectorAll(':scope > .qgroup-body > .questions-container > .question-card'))
            .map(readQuestionCard);

      const grp = {
            instruction: card.querySelector('.qgroup-instruction').value.trim(),
            passage_text: card.querySelector('.grp-passage').value.trim(),
            audio_url: card.querySelector('.grp-audio').value.trim() || null,
            group_type: card.querySelector('.grp-type').value,
            order_index: parseInt(card.querySelector('.grp-order').value) || 0,
            questions,
      };
      if (grpId) grp.id = grpId;
      return grp;
}

function readSectionCard(card) {
      const secId = card.dataset.sectionId ? parseInt(card.dataset.sectionId) : null;
      const question_groups = Array.from(
            card.querySelectorAll(':scope > .section-body > .qgroups-container > .qgroup-card')
      ).map(readGroupCard);

      const sec = {
            name: card.querySelector('.section-name').value.trim(),
            max_score: parseInt(card.querySelector('.sec-max-score').value) || 0,
            order_index: parseInt(card.querySelector('.sec-order').value) || 0,
            question_groups,
      };
      if (secId) sec.id = secId;
      return sec;
}

function buildPayload() {
      const sections = Array.from(
            document.querySelectorAll('#sectionsContainer > .section-card')
      ).map(readSectionCard);

      return {
            title: document.getElementById('examTitle').value.trim(),
            level: document.getElementById('examLevel').value,
            duration: parseInt(document.getElementById('examDuration').value) || 0,
            total_score: parseInt(document.getElementById('examTotalScore').value) || 100,
            status: document.getElementById('examStatus').value,
            sections,
      };
}

// ─────────────────────────────────────────────
// ── Modal open/close ──
// ─────────────────────────────────────────────

function openExamModal(exam = null) {
      currentEditExamId = exam?.id ?? null;

      document.getElementById('examModalTitle').textContent =
            exam ? 'Sửa Đề Thi' : 'Thêm Đề Thi Mới';

      // Reset meta fields
      document.getElementById('examTitle').value = exam?.title ?? '';
      document.getElementById('examLevel').value = exam?.level ?? '';
      document.getElementById('examDuration').value = exam?.duration ?? '';
      document.getElementById('examTotalScore').value = exam?.total_score ?? 180;
      document.getElementById('examStatus').value = exam?.status ?? 'draft';

      // Rebuild sections tree
      const container = document.getElementById('sectionsContainer');
      container.innerHTML = '';
      if (Array.isArray(exam?.sections)) {
            exam.sections.forEach((sec) => container.appendChild(createSectionCard(sec)));
      }

      document.getElementById('examBuilderOverlay').classList.add('is-open');
      document.body.style.overflow = 'hidden';
}

function closeExamModal() {
      document.getElementById('examBuilderOverlay').classList.remove('is-open');
      document.body.style.overflow = '';
      currentEditExamId = null;
}

// ─────────────────────────────────────────────
// ── Edit (load detail first) ──
// ─────────────────────────────────────────────
window.openEditExam = async function (id) {
      try {
            const exam = await fetchExamDetail(id);
            openExamModal(exam);
      } catch (err) {
            alert('Lỗi: ' + err.message);
      }
};

// ─────────────────────────────────────────────
// ── Delete ──
// ─────────────────────────────────────────────
window.confirmDeleteExam = function (id) {
      pendingDeleteExamId = id;
      document.getElementById('confirmDeleteModal').classList.add('is-open');
};

// ─────────────────────────────────────────────
// ── Form Validation ──
// ─────────────────────────────────────────────
function validatePayload(payload) {
      if (!payload.title) return 'Vui lòng nhập tên đề thi.';
      if (!payload.level) return 'Vui lòng chọn cấp độ.';
      if (!payload.duration || payload.duration < 1) return 'Thời gian làm bài phải lớn hơn 0.';

      for (const sec of payload.sections) {
            if (!sec.name) return 'Tên phần thi (Section) không được để trống.';
            for (const grp of sec.question_groups) {
                  for (const q of grp.questions) {
                        if (!q.content) return 'Nội dung câu hỏi không được để trống.';
                        if (q.question_type === 'MULTIPLE_CHOICE') {
                              if (!q.mcq_options.length) return 'Câu trắc nghiệm phải có ít nhất 1 lựa chọn.';
                              const hasCorrect = q.mcq_options.some((o) => o.is_correct);
                              if (!hasCorrect) return `Câu ${q.question_number}: chưa chọn đáp án đúng.`;
                        }
                        if (q.question_type === 'FILL_IN_BLANK') {
                              if (!q.fib_answers.length) return 'Câu điền từ phải có ít nhất 1 đáp án hợp lệ.';
                              const hasEmpty = q.fib_answers.some((a) => !a.acceptable_text);
                              if (hasEmpty) return `Câu ${q.question_number}: có đáp án FIB để trống.`;
                        }
                  }
            }
      }
      return null; // OK
}

// ─────────────────────────────────────────────
// ── SAVE ──
// ─────────────────────────────────────────────
async function handleSaveExam() {
      const payload = buildPayload();
      const err = validatePayload(payload);
      if (err) { alert('⚠️ ' + err); return; }

      const saveBtn = document.getElementById('saveExamBtn');
      saveBtn.disabled = true;
      saveBtn.textContent = '⏳ Đang lưu...';

      try {
            await saveExam(payload, currentEditExamId);
            alert(currentEditExamId ? '✅ Đề thi đã được cập nhật!' : '✅ Đề thi đã được tạo thành công!');
            closeExamModal();
            loadExams();
      } catch (err) {
            alert('Lỗi: ' + err.message);
      } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = '💾 Lưu Đề Thi';
      }
}

// ─────────────────────────────────────────────
// ── DOMContentLoaded ──
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
      initAdminShell();

      // Initial load
      loadExams();

      // Filter
      document.getElementById('examFilterBtn')?.addEventListener('click', loadExams);
      document.getElementById('examFilterReset')?.addEventListener('click', () => {
            document.getElementById('examSearchInput').value = '';
            document.getElementById('examLevelFilter').value = '';
            document.getElementById('examStatusFilter').value = '';
            loadExams();
      });
      document.getElementById('examSearchInput')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') loadExams();
      });

      // Open "add" modal
      document.getElementById('addExamBtn')?.addEventListener('click', () => openExamModal());

      // Close modal buttons
      document.getElementById('closeExamModal')?.addEventListener('click', closeExamModal);
      document.getElementById('cancelExamModal')?.addEventListener('click', closeExamModal);

      // Close overlay on backdrop click
      document.getElementById('examBuilderOverlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeExamModal();
      });

      // Save exam
      document.getElementById('saveExamBtn')?.addEventListener('click', handleSaveExam);

      // Add section button inside modal
      document.getElementById('addSectionBtn')?.addEventListener('click', () => {
            document.getElementById('sectionsContainer').appendChild(createSectionCard());
      });

      // Delete modal
      document.getElementById('closeDeleteModal')?.addEventListener('click', () => {
            document.getElementById('confirmDeleteModal').classList.remove('is-open');
            pendingDeleteExamId = null;
      });
      document.getElementById('cancelDeleteModal')?.addEventListener('click', () => {
            document.getElementById('confirmDeleteModal').classList.remove('is-open');
            pendingDeleteExamId = null;
      });
      document.getElementById('submitDeleteModal')?.addEventListener('click', async () => {
            if (!pendingDeleteExamId) return;
            try {
                  await deleteExam(pendingDeleteExamId);
                  document.getElementById('confirmDeleteModal').classList.remove('is-open');
                  alert('✅ Đã xóa đề thi thành công!');
                  loadExams();
            } catch (err) {
                  alert('Lỗi: ' + err.message);
            } finally {
                  pendingDeleteExamId = null;
            }
      });
});
