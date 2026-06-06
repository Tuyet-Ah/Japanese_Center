const docNotesKey = "jsmartDocNotes";
const docAnswersKey = "jsmartDocAnswers";

const getDocFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

const fetchMaterialDetail = async (materialId) => {
  const response = await fetch(`${API_BASE_URL}/materials/${materialId}/`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.detail || "Không thể tải tài liệu");
  }
  return data;
};

const buildSection = (section) => {
  const wrapper = document.createElement("section");
  const heading = document.createElement("h3");
  heading.textContent = section.heading;
  wrapper.appendChild(heading);

  if (section.text) {
    const paragraph = document.createElement("p");
    paragraph.textContent = section.text;
    wrapper.appendChild(paragraph);
  }

  if (section.bullets) {
    const list = document.createElement("ul");
    section.bullets.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    wrapper.appendChild(list);
  }

  return wrapper;
};

const readNotesStore = () => {
  try {
    return JSON.parse(localStorage.getItem(docNotesKey)) || {};
  } catch {
    return {};
  }
};

const saveNotesStore = (store) => {
  localStorage.setItem(docNotesKey, JSON.stringify(store));
};

const readAnswersStore = () => {
  try {
    return JSON.parse(localStorage.getItem(docAnswersKey)) || {};
  } catch {
    return {};
  }
};

const saveAnswersStore = (store) => {
  localStorage.setItem(docAnswersKey, JSON.stringify(store));
};

document.addEventListener("DOMContentLoaded", async () => {
  initStandardHeader();

  const docId = getDocFromUrl();

  const titleNode = document.querySelector("[data-doc-title]");
  const subtitleNode = document.querySelector("[data-doc-subtitle]");
  const categoryNode = document.querySelector("[data-doc-category]");
  const contentNode = document.querySelector("[data-doc-content]");
  const videoSection = document.querySelector("[data-doc-video]");
  const videoPlayer = document.querySelector("[data-video-player]");
  const questionList = document.querySelector("[data-video-question-list]");
  const questionTitle = document.querySelector("[data-video-question-title]");
  const questionMeta = document.querySelector("[data-video-question-meta]");
  const answerInput = document.querySelector("[data-video-answer]");
  const navToggle = document.querySelector("[data-video-nav-toggle]");
  const readerPrimary = document.querySelector(".reader-primary");
  const notesInput = document.querySelector("[data-notes-input]");
  const notesStatus = document.querySelector("[data-notes-status]");
  const saveButton = document.querySelector("[data-notes-save]");

  if (!docId) {
    if (titleNode) titleNode.textContent = "Không tìm thấy tài liệu";
    if (subtitleNode) subtitleNode.textContent = "Thiếu mã tài liệu trên đường dẫn.";
    if (contentNode) contentNode.innerHTML = "<p>Vui lòng quay lại trang tài liệu và chọn mục khác.</p>";
    if (videoSection) videoSection.hidden = true;
    if (notesInput) notesInput.disabled = true;
    if (saveButton) saveButton.disabled = true;
    return;
  }

  let doc = null;
  try {
    doc = await fetchMaterialDetail(docId);
  } catch (error) {
    if (titleNode) titleNode.textContent = "Không tìm thấy tài liệu";
    if (subtitleNode) subtitleNode.textContent = error.message || "Tài liệu không tồn tại hoặc đã bị xóa.";
    if (contentNode) contentNode.innerHTML = "<p>Vui lòng quay lại trang tài liệu và chọn mục khác.</p>";
    if (videoSection) videoSection.hidden = true;
    if (notesInput) notesInput.disabled = true;
    if (saveButton) saveButton.disabled = true;
    return;
  }

  if (titleNode) titleNode.textContent = doc.title || "Tài liệu";
  if (subtitleNode) subtitleNode.textContent = doc.subtitle || "Mô tả tài liệu";
  if (categoryNode) categoryNode.textContent = doc.category_label || doc.category || "Tài liệu";

  if (contentNode) {
    contentNode.innerHTML = "";
    const sections = Array.isArray(doc.sections) ? doc.sections : [];
    if (!sections.length) {
      contentNode.innerHTML = "<p>Tài liệu chưa có nội dung chi tiết.</p>";
    } else {
      sections.forEach((section) => {
        contentNode.appendChild(buildSection(section));
      });
    }
  }

  const store = readNotesStore();
  if (notesInput) {
    notesInput.value = store[docId] || "";
  }

  let saveTimeout = null;
  const markSaved = () => {
    if (notesStatus) notesStatus.textContent = "Đã lưu";
  };

  const markDirty = () => {
    if (notesStatus) notesStatus.textContent = "Chưa lưu";
  };

  const persistNotes = () => {
    if (!notesInput) return;
    const latestStore = readNotesStore();
    latestStore[docId] = notesInput.value;
    saveNotesStore(latestStore);
    markSaved();
  };

  if (notesInput) {
    notesInput.addEventListener("input", () => {
      markDirty();
      if (saveTimeout) window.clearTimeout(saveTimeout);
      saveTimeout = window.setTimeout(persistNotes, 600);
    });
  }

  if (saveButton) {
    saveButton.addEventListener("click", () => {
      persistNotes();
    });
  }

  const pdfUrl = doc.pdf_url || buildThumbnailUrl(doc.pdf_file);
  const exerciseUrl = doc.exercise_url || buildThumbnailUrl(doc.exercise_file);
  
  if (contentNode) {
    const metaContainer = document.createElement("div");
    metaContainer.style.marginBottom = "2rem";

    if (pdfUrl) {
      const pdfInline = document.createElement("div");
      pdfInline.className = "reader-pdf-inline";
      pdfInline.style.marginBottom = "1rem";
      pdfInline.innerHTML = `<strong>PDF:</strong> <a href="${pdfUrl}" target="_blank" rel="noopener">Mở tệp</a>`;
      metaContainer.appendChild(pdfInline);
    }

    if (exerciseUrl) {
      const exInline = document.createElement("div");
      exInline.style.marginBottom = "1rem";
      exInline.innerHTML = `<strong>Bài tập luyện tập:</strong> <a href="${exerciseUrl}" target="_blank" rel="noopener">Tải xuống / Mở tệp</a>`;
      metaContainer.appendChild(exInline);
    }

    if (doc.objective) {
      const objSec = document.createElement("div");
      objSec.style.marginBottom = "1.5rem";
      objSec.innerHTML = `<h3 style="color: var(--primary); margin-bottom: 0.5rem;">Mục tiêu</h3>`;
      doc.objective.split('\n').forEach(line => {
        if (!line.trim()) return;
        const p = document.createElement("p");
        p.textContent = line;
        p.style.marginBottom = "0.5rem";
        objSec.appendChild(p);
      });
      metaContainer.appendChild(objSec);
    }

    if (doc.vocab_examples) {
      const vocSec = document.createElement("div");
      vocSec.style.marginBottom = "1.5rem";
      vocSec.innerHTML = `<h3 style="color: var(--primary); margin-bottom: 0.5rem;">Ví dụ từ vựng</h3>`;
      doc.vocab_examples.split('\n').forEach(line => {
        if (!line.trim()) return;
        const p = document.createElement("p");
        p.textContent = line;
        p.style.marginBottom = "0.5rem";
        vocSec.appendChild(p);
      });
      metaContainer.appendChild(vocSec);
    }

    if (metaContainer.children.length > 0) {
      contentNode.prepend(metaContainer);
    }
  }

  if (doc.video_url && videoSection && videoPlayer && questionList && answerInput) {
    const questions = doc.questions && doc.questions.length
      ? doc.questions
      : Array.from({ length: doc.question_count || 10 }, (_, index) => ({
        id: index + 1,
        meta: `${12 + (index % 6)} từ`
      }));

    const answersStore = readAnswersStore();
    const docAnswers = answersStore[docId] || {};
    let activeIndex = 0;

    const renderQuestionButtons = () => {
      questionList.innerHTML = "";
      questions.forEach((question, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "video-question-btn" + (index === activeIndex ? " is-active" : "");
        button.textContent = question.id || index + 1;
        button.addEventListener("click", () => {
          activeIndex = index;
          updateQuestionView();
          renderQuestionButtons();
        });
        questionList.appendChild(button);
      });
    };

    const updateQuestionView = () => {
      const total = questions.length;
      const current = questions[activeIndex];
      if (questionTitle) {
        questionTitle.textContent = `Câu ${activeIndex + 1}/${total}`;
      }
      if (questionMeta) {
        questionMeta.textContent = current.meta || `${12 + (activeIndex % 6)} từ`;
      }
      answerInput.value = docAnswers[activeIndex] || "";
    };

    const persistAnswer = () => {
      const latestStore = readAnswersStore();
      if (!latestStore[docId]) latestStore[docId] = {};
      latestStore[docId][activeIndex] = answerInput.value;
      saveAnswersStore(latestStore);
    };

    answerInput.addEventListener("input", persistAnswer);

    if (navToggle && questionList) {
      navToggle.addEventListener("click", () => {
        const isHidden = questionList.style.display === "none";
        questionList.style.display = isHidden ? "grid" : "none";
        navToggle.textContent = isHidden ? "Ẩn danh sách câu hỏi" : "Hiện danh sách câu hỏi";
      });
    }

    if (videoPlayer) {
      videoPlayer.src = doc.video_url;
    }

    renderQuestionButtons();
    updateQuestionView();
    videoSection.hidden = false;
    if (contentNode) contentNode.style.display = "none";
    if (readerPrimary) readerPrimary.style.gap = "0";
  } else if (videoSection) {
    videoSection.hidden = true;
    if (contentNode) contentNode.style.display = "block";
  }

  markSaved();
});
