const docNotesKey = "jsmartDocNotes";
const docAnswersKey = "jsmartDocAnswers";

const materialDocs = {
  "tu-vung-nguoi-moi": {
    title: "Từ vựng cho người mới bắt đầu",
    subtitle: "Từ vựng cơ bản, chủ đề chào hỏi và sinh hoạt hằng ngày.",
    category: "Bộ từ vựng",
    level: "N5",
    duration: "15 phut",
    pdfUrl: "assets/pdfs/tu-vung-nguoi-moi.pdf",
    sections: [
      {
        heading: "Mục tiêu học",
        text: "Làm quen 30 từ vựng nền tảng và biết cách dùng trong câu chào hỏi cơ bản."
      },
      {
        heading: "Từ vựng chính",
        bullets: ["ohayou gozaimasu - chào buổi sáng", "konnichiwa - xin chào", "arigatou - cảm ơn", "sumimasen - xin lỗi" ]
      },
      {
        heading: "Ví dụ câu",
        bullets: ["Konnichiwa. Watashi wa Linh desu.", "Sumimasen, onegaishimasu."]
      }
    ]
  },
  "kanji-lam-quen": {
    title: "Học và làm quen với chữ Kanji cho người học tiếng Nhật",
    subtitle: "Giới thiệu kanji thông dụng và cách ghi nhớ theo bộ thủ.",
    category: "Bộ từ vựng",
    level: "N5-N4",
    duration: "20 phut",
    pdfUrl: "assets/pdfs/kanji-lam-quen.pdf",
    sections: [
      {
        heading: "Tổng quan",
        text: "Kanji là chữ Hán tự. Nên học theo bộ thủ và ngữ cảnh để nhớ lâu."
      },
      {
        heading: "Bộ thủ nền tảng",
        bullets: ["nhân - người", "nước", "mộc - cây", "hoa - hoa"]
      },
      {
        heading: "Mẹo học",
        bullets: ["Viết lại mỗi kanji 5 lần", "Ghép kanji vào từ vựng", "Dùng flashcard"]
      }
    ]
  },
  "tu-vung-n3-chuong-1-1": {
    title: "Từ vựng N3: Chương 1.1 - các từ thông dụng",
    subtitle: "Bộ từ vựng N3 cơ bản để tăng tốc độ đọc hiểu.",
    category: "Bộ từ vựng",
    level: "N3",
    duration: "25 phut",
    pdfUrl: "assets/pdfs/tu-vung-n3-chuong-1-1.pdf",
    sections: [
      {
        heading: "Nhóm từ theo chủ đề",
        bullets: ["công việc - shigoto", "kinh tế - keizai", "thời gian - jikan"]
      },
      {
        heading: "Ứng dụng",
        text: "Ghép từ vựng vào đoạn văn ngắn, tập đọc thành tiếng lớn."
      }
    ]
  },
  "kanji-n2-n1": {
    title: "Kanji N2 - N1",
    subtitle: "Tổng hợp kanji nâng cao và cách phân biệt nghĩa.",
    category: "Bộ từ vựng",
    level: "N2-N1",
    duration: "35 phut",
    pdfUrl: "assets/pdfs/kanji-n2-n1.pdf",
    sections: [
      {
        heading: "Chủ đề kinh doanh",
        bullets: ["keiei - quản lý", "shisan - tài sản", "kessan - quyết toán"]
      },
      {
        heading: "Chủ đề xã hội",
        bullets: ["shakai - xã hội", "seisaku - chính sách", "saigai - thảm họa"]
      }
    ]
  },
  "tu-vung-giao-tiep": {
    title: "Từ vựng giao tiếp thực tế",
    subtitle: "Từ vựng dùng trong tình huống mua sắm, hỏi đường, nhà hàng.",
    category: "Bộ từ vựng",
    level: "N4-N3",
    duration: "20 phut",
    pdfUrl: "assets/pdfs/tu-vung-giao-tiep.pdf",
    sections: [
      {
        heading: "Tình huống mua sắm",
        bullets: ["kore wa ikura desu ka", "motto yasuku narimasu ka"]
      },
      {
        heading: "Tình huống nhà hàng",
        bullets: ["menu o misete kudasai", "osusume wa nan desu ka"]
      }
    ]
  },
  "nghe-co-ban": {
    title: "Luyện nghe cho người mới học tiếng Nhật",
    subtitle: "Bài nghe ngắn, tốc độ chậm, tập trung từ vựng cơ bản.",
    category: "Luyện nghe",
    level: "N5",
    duration: "15 phut",
    pdfUrl: "assets/pdfs/nghe-co-ban.pdf",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    questionCount: 31,
    sections: [
      {
        heading: "Bước 1",
        text: "Nghe lần 1 để lấy ý chính, không dừng để ghi chép."
      },
      {
        heading: "Bước 2",
        text: "Nghe lần 2 và ghi lại từ khóa quan trọng."
      }
    ]
  },
  "giao-tiep-doi-thuong": {
    title: "Tiếng Nhật trong giao tiếp đời thường",
    subtitle: "Mẫu câu giao tiếp tại nhà, trường học, công việc.",
    category: "Luyện nghe",
    level: "N4",
    duration: "18 phut",
    pdfUrl: "assets/pdfs/giao-tiep-doi-thuong.pdf",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    questionCount: 20,
    sections: [
      {
        heading: "Mẫu câu",
        bullets: ["ima hima desu ka", "chotto matte kudasai", "daijoubu desu"]
      }
    ]
  },
  "always-with-me": {
    title: "Luyện nghe qua bài hát Always with me",
    subtitle: "Nghe bài hát và học từ vựng theo chủ đề kỷ niệm.",
    category: "Luyện nghe",
    level: "All",
    duration: "12 phut",
    pdfUrl: "assets/pdfs/always-with-me.pdf",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    questionCount: 15,
    sections: [
      {
        heading: "Từ vựng nổi bật",
        bullets: ["omoide - kỷ niệm", "yasashisa - sự ấm", "nagareboshi - sao băng"]
      }
    ]
  },
  "doraemon": {
    title: "Luyện nghe qua hoạt hình Doraemon",
    subtitle: "Hội thoại đơn giản, dễ hiểu, nhiều tình huống đời thường.",
    category: "Luyện nghe",
    level: "N5-N4",
    duration: "20 phut",
    pdfUrl: "assets/pdfs/doraemon.pdf",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    questionCount: 25,
    sections: [
      {
        heading: "Gợi ý học",
        bullets: ["Bật phụ đề tiếng Nhật", "Nghe theo từng đoạn 30 giây", "Lặp lại câu nói quan trọng"]
      }
    ]
  },
  "hiragana": {
    title: "Bảng chữ cái Hiragana",
    subtitle: "Hướng dẫn viết và đọc Hiragana đúng thứ tự nét.",
    category: "Luyện viết",
    level: "N5",
    duration: "25 phut",
    pdfUrl: "assets/pdfs/hiragana.pdf",
    sections: [
      {
        heading: "Hàng a ka sa ta na",
        text: "Tập viết theo nhóm hàng, mỗi chữ viết 5 lần."
      },
      {
        heading: "Mẹo học",
        bullets: ["Đọc thành tiếng lớn", "Viết kết hợp từ vựng ngắn", "Sử dụng vở kẻ ô ly"]
      }
    ]
  },
  "katakana": {
    title: "Bảng chữ cái Katakana",
    subtitle: "Chữ thường dùng cho từ mượn và tên riêng.",
    category: "Luyện viết",
    level: "N5",
    duration: "25 phut",
    pdfUrl: "assets/pdfs/katakana.pdf",
    sections: [
      {
        heading: "Hàng a ka sa ta na",
        text: "Mỗi ngày học 5 chữ, ghi lại và đọc to."
      }
    ]
  },
  "ngu-phap-viet-cau": {
    title: "Ngữ pháp và viết câu cơ bản",
    subtitle: "Tập đặt câu với mẫu ngữ pháp thông dụng.",
    category: "Luyện viết",
    level: "N4",
    duration: "22 phut",
    pdfUrl: "assets/pdfs/ngu-phap-viet-cau.pdf",
    sections: [
      {
        heading: "Mẫu câu cơ bản",
        bullets: ["A wa B desu", "A wa B ga suki desu", "A wa B o shimasu"]
      },
      {
        heading: "Lưu ý",
        text: "Dùng chữ cái đúng thứ tự nét và kiểm tra trợ từ."
      }
    ]
  }
};

const getDocFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("doc");
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

document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  const docId = getDocFromUrl();
  const doc = docId ? materialDocs[docId] : null;

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

  if (!doc) {
    if (titleNode) titleNode.textContent = "Không tìm thấy tài liệu";
    if (subtitleNode) subtitleNode.textContent = "Tài liệu không tồn tại hoặc đã bị xóa.";
    if (contentNode) contentNode.innerHTML = "<p>Vui lòng quay lại trang tài liệu và chọn mục khác.</p>";
    if (videoSection) videoSection.hidden = true;
    if (notesInput) notesInput.disabled = true;
    if (saveButton) saveButton.disabled = true;
    return;
  }

  if (titleNode) titleNode.textContent = doc.title;
  if (subtitleNode) subtitleNode.textContent = doc.subtitle;
  if (categoryNode) categoryNode.textContent = doc.category;

  if (contentNode) {
    contentNode.innerHTML = "";
    doc.sections.forEach((section) => {
      contentNode.appendChild(buildSection(section));
    });
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

  if (contentNode && doc.pdfUrl) {
    const pdfInline = document.createElement("div");
    pdfInline.className = "reader-pdf-inline";
    pdfInline.innerHTML = `PDF: <a href="${doc.pdfUrl}" target="_blank" rel="noopener">Mở tệp</a>`;
    contentNode.prepend(pdfInline);
  }

  if (doc.videoUrl && videoSection && videoPlayer && questionList && answerInput) {
    const questions = doc.questions && doc.questions.length
      ? doc.questions
      : Array.from({ length: doc.questionCount || 10 }, (_, index) => ({
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
      videoPlayer.src = doc.videoUrl;
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
