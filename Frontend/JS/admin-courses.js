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

  let currentEditCourseId = null;
  let pendingDeleteCourseId = null;

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
              <button class="btn btn-small" onclick="editCourse(${course.id})">Sua</button>
              <button class="btn btn-small btn-danger" onclick="confirmDeleteCourse(${course.id})">Xoa</button>
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

  const createLessonRow = (initialData = {}) => {
    const row = document.createElement("div");
    row.className = "lesson-row";
    row.innerHTML = `
      <input type="text" class="lesson-title" placeholder="Ten bai hoc" value="${escapeHtml(initialData.title || '')}">
      <input type="url" class="lesson-video" placeholder="Video URL (tuy chon)" value="${escapeHtml(initialData.video_url || '')}">
      <button type="button" class="btn btn-small btn-danger" data-remove-lesson>Bo</button>
    `;
    row.querySelector("[data-remove-lesson]")?.addEventListener("click", () => {
      row.remove();
    });
    return row;
  };

  const createChapterCard = (initialData = {}) => {
    const card = document.createElement("div");
    card.className = "chapter-card";
    card.innerHTML = `
      <div class="chapter-header">
        <input type="text" class="chapter-title" placeholder="Ten chuong" value="${escapeHtml(initialData.title || '')}">
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

    if (initialData.lessons && Array.isArray(initialData.lessons)) {
        initialData.lessons.forEach(lesson => {
            lessonsContainer?.appendChild(createLessonRow(lesson));
        });
    }

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
    currentEditCourseId = null;
    section.querySelector("h2").textContent = "Thêm Khóa Học";
    if (section) section.style.display = "block";
    form?.reset();
    if (chaptersContainer) chaptersContainer.innerHTML = "";
    section.scrollIntoView({ behavior: 'smooth' });
  });

  cancelButton?.addEventListener("click", () => {
    currentEditCourseId = null;
    if (section) section.style.display = "none";
  });

  window.editCourse = async (id) => {
      const tokens = typeof getAuthTokens === "function" ? getAuthTokens() : null;
      if (!tokens || !tokens.access) {
          alert("Can dang nhap admin.");
          return;
      }
      try {
          const response = await fetch(`${API_BASE_URL}/courses/${id}/`, {
              headers: { Authorization: `Bearer ${tokens.access}` }
          });
          if (!response.ok) throw new Error("Khong the lay thong tin khoa hoc");
          const course = await response.json();
          
          currentEditCourseId = course.id;
          section.querySelector("h2").textContent = "Sửa Khóa Học (Lưu ý: Không thể sửa chương/bài học tại đây)";
          
          document.getElementById("courseName").value = course.title || "";
          document.getElementById("courseLevel").value = course.level || "";
          document.getElementById("coursePrice").value = course.price || "";
          document.getElementById("courseDesc").value = course.description || "";
          
          if (chaptersContainer) {
              chaptersContainer.innerHTML = "";
              if (course.chapters && Array.isArray(course.chapters)) {
                  course.chapters.forEach(chapter => {
                      chaptersContainer.appendChild(createChapterCard(chapter));
                  });
              }
          }
          
          if (section) section.style.display = "block";
          section.scrollIntoView({ behavior: 'smooth' });
      } catch (error) {
          alert(error.message);
      }
  };

  window.confirmDeleteCourse = (id) => {
      pendingDeleteCourseId = id;
      const modal = document.getElementById("confirm-delete-modal");
      if (modal) modal.classList.add("is-open");
  };

  document.getElementById("close-delete-modal")?.addEventListener("click", () => {
      document.getElementById("confirm-delete-modal")?.classList.remove("is-open");
      pendingDeleteCourseId = null;
  });

  document.getElementById("cancel-delete-modal")?.addEventListener("click", () => {
      document.getElementById("confirm-delete-modal")?.classList.remove("is-open");
      pendingDeleteCourseId = null;
  });

  document.getElementById("submit-delete-modal")?.addEventListener("click", async () => {
      if (!pendingDeleteCourseId) return;
      const tokens = typeof getAuthTokens === "function" ? getAuthTokens() : null;
      if (!tokens || !tokens.access) return;

      try {
          const response = await fetch(`${API_BASE_URL}/courses/${pendingDeleteCourseId}/`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${tokens.access}` }
          });
          if (!response.ok) throw new Error("Khong the xoa khoa hoc.");
          
          document.getElementById("confirm-delete-modal")?.classList.remove("is-open");
          alert("✅ Đã xóa khóa học thành công!");
          loadCourses();
      } catch (error) {
          alert(error.message);
      } finally {
          pendingDeleteCourseId = null;
      }
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



    const method = currentEditCourseId ? "PATCH" : "POST";
    const url = currentEditCourseId 
        ? `${API_BASE_URL}/courses/${currentEditCourseId}/` 
        : `${API_BASE_URL}/courses/`;

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.access}`
      },
      body: JSON.stringify(payload)
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || data.detail || "Khong the luu khoa hoc.");
        }
        return response.json();
      })
      .then(() => {
        alert(currentEditCourseId ? "✅ Khóa học đã được cập nhật thành công! (Lưu ý: Các thay đổi về chương/bài học có thể không được áp dụng do hạn chế của API hiện tại)" : "✅ Khóa học đã được tạo thành công!");
        if (section) section.style.display = "none";
        form?.reset();
        if (chaptersContainer) chaptersContainer.innerHTML = "";
        currentEditCourseId = null;
        loadCourses();
      })
      .catch((error) => {
        alert(error.message || "Khong the luu khoa hoc.");
      });
  });
});