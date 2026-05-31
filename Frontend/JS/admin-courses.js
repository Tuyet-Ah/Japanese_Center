document.addEventListener("DOMContentLoaded", () => {
  initAdminShell();

  const tableBody = document.getElementById("coursesTableBody");
  const searchInput = document.getElementById("courseSearchInput");
  const levelFilter = document.getElementById("courseLevelFilter");
  const minPriceInput = document.getElementById("courseMinPrice");
  const maxPriceInput = document.getElementById("courseMaxPrice");
  const filterButton = document.getElementById("courseFilterBtn");
  const resetButton = document.getElementById("courseFilterReset");
  const chaptersContainer = document.getElementById("chaptersContainer");
  const addChapterBtn = document.getElementById("addChapterBtn");

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const formatPrice = (value) => {
    if (typeof formatMoney === "function") {
      return formatMoney(Number(value || 0));
    }
    return new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + " VND";
  };

  const buildQuery = () => {
    const query = {
      search: searchInput?.value.trim() || "",
      level: levelFilter?.value || "",
      min_price: minPriceInput?.value || "",
      max_price: maxPriceInput?.value || ""
    };
    Object.keys(query).forEach((key) => {
      if (!query[key]) delete query[key];
    });
    return query;
  };

  const renderCourseTable = (courses) => {
    if (!tableBody) return;
    if (!Array.isArray(courses) || courses.length === 0) {
      tableBody.innerHTML = "<tr><td colspan=\"6\">Khong co khoa hoc phu hop.</td></tr>";
      return;
    }

    tableBody.innerHTML = courses
      .map((course, index) => {
        const title = escapeHtml(course.title || "");
        const level = escapeHtml(course.level || "-");
        const price = formatPrice(course.price);
        const enrolled = Number(course.enrolled_count || 0);
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${title}</td>
            <td><span class="badge">${level}</span></td>
            <td>${price}</td>
            <td>${enrolled}</td>
            <td>
              <button class="btn btn-small">Sua</button>
              <button class="btn btn-small btn-danger">Xoa</button>
            </td>
          </tr>
        `;
      })
      .join("");
  };

  const loadCourses = async () => {
    if (!tableBody || typeof fetchCourseList !== "function") return;
    tableBody.innerHTML = "<tr><td colspan=\"6\">Dang tai khoa hoc...</td></tr>";
    try {
      const data = await fetchCourseList(buildQuery());
      renderCourseTable(data);
    } catch {
      tableBody.innerHTML = "<tr><td colspan=\"6\">Khong the tai khoa hoc.</td></tr>";
    }
  };

  filterButton?.addEventListener("click", loadCourses);
  resetButton?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (levelFilter) levelFilter.value = "";
    if (minPriceInput) minPriceInput.value = "";
    if (maxPriceInput) maxPriceInput.value = "";
    loadCourses();
  });

  searchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadCourses();
    }
  });

  loadCourses();

  const createLessonRow = () => {
    const row = document.createElement("div");
    row.className = "lesson-row";
    row.innerHTML = `
      <input type="text" class="lesson-title" placeholder="Ten bai hoc">
      <input type="url" class="lesson-video" placeholder="Video URL (tuy chon)">
      <button type="button" class="btn btn-small btn-danger" data-remove-lesson>Bo</button>
    `;
    row.querySelector("[data-remove-lesson]")?.addEventListener("click", () => {
      row.remove();
    });
    return row;
  };

  const createChapterCard = () => {
    const card = document.createElement("div");
    card.className = "chapter-card";
    card.innerHTML = `
      <div class="chapter-header">
        <input type="text" class="chapter-title" placeholder="Ten chuong">
        <button type="button" class="btn btn-small btn-danger" data-remove-chapter>Bo chuong</button>
      </div>
      <div class="lessons-container"></div>
      <div class="chapter-actions">
        <button type="button" class="btn btn-small" data-add-lesson>+ Them bai hoc</button>
      </div>
    `;

    const lessonsContainer = card.querySelector(".lessons-container");
    const addLessonBtn = card.querySelector("[data-add-lesson]");
    const removeChapterBtn = card.querySelector("[data-remove-chapter]");

    addLessonBtn?.addEventListener("click", () => {
      lessonsContainer?.appendChild(createLessonRow());
    });

    removeChapterBtn?.addEventListener("click", () => {
      card.remove();
    });

    return card;
  };

  addChapterBtn?.addEventListener("click", () => {
    if (chaptersContainer) {
      chaptersContainer.appendChild(createChapterCard());
    }
  });

  const addCourseBtn = document.getElementById("addCourseBtn");
  const section = document.getElementById("courseFormSection");
  const form = document.getElementById("courseForm");
  const cancelButton = document.getElementById("cancelFormBtn");

  addCourseBtn?.addEventListener("click", () => {
    if (section) section.style.display = "block";
    form?.reset();
    if (chaptersContainer) chaptersContainer.innerHTML = "";
  });

  cancelButton?.addEventListener("click", () => {
    if (section) section.style.display = "none";
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const tokens = typeof getAuthTokens === "function" ? getAuthTokens() : null;
    if (!tokens || !tokens.access) {
      alert("Can dang nhap admin.");
      return;
    }

    const title = document.getElementById("courseName")?.value.trim() || "";
    const level = document.getElementById("courseLevel")?.value || "";
    const price = document.getElementById("coursePrice")?.value || "";
    const description = document.getElementById("courseDesc")?.value.trim() || "";

    if (!title || !level || !price) {
      alert("Vui long nhap day du ten, cap do va gia khoa hoc.");
      return;
    }

    const chapterCards = chaptersContainer ? Array.from(chaptersContainer.querySelectorAll(".chapter-card")) : [];
    const chapters = chapterCards
      .map((card) => {
        const chapterTitle = card.querySelector(".chapter-title")?.value.trim() || "";
        if (!chapterTitle) return null;
        const lessonRows = Array.from(card.querySelectorAll(".lesson-row"));
        const lessons = lessonRows
          .map((row) => {
            const lessonTitle = row.querySelector(".lesson-title")?.value.trim() || "";
            if (!lessonTitle) return null;
            const videoUrl = row.querySelector(".lesson-video")?.value.trim() || "";
            return {
              title: lessonTitle,
              video_url: videoUrl || undefined
            };
          })
          .filter(Boolean);

        return {
          title: chapterTitle,
          lessons
        };
      })
      .filter(Boolean);

    const payload = {
      title,
      level,
      price,
      description,
      chapters
    };

    fetch(`${API_BASE_URL}/courses/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.access}`
      },
      body: JSON.stringify(payload)
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || data.detail || "Khong the tao khoa hoc.");
        }
        return response.json();
      })
      .then(() => {
        alert("✅ Khóa học đã được lưu thành công!");
        if (section) section.style.display = "none";
        form?.reset();
        if (chaptersContainer) chaptersContainer.innerHTML = "";
        loadCourses();
      })
      .catch((error) => {
        alert(error.message || "Khong the tao khoa hoc.");
      });
  });
});