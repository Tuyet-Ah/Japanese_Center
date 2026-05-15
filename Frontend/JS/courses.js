document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();
  setupCourseFilters();
  refreshCourseList();
  renderMyCourses();

  const modal = document.querySelector("[data-course-modal]");
  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeCourseDetail();
      }
    });
  }

  document.querySelector("[data-close-course-modal]")?.addEventListener("click", () => {
    closeCourseDetail();
  });
});

let myLearningCachePromise = null;

function setupCourseFilters() {
  const searchButton = document.getElementById("course-search-btn");
  const searchInput = document.getElementById("course-search-input");
  const statusFilter = document.getElementById("course-status-filter");
  const levelFilter = document.getElementById("course-level-filter");
  const searchWrap = document.querySelector(".search-input-wrap");
  const suggestionBox = searchWrap ? ensureSuggestionBox(searchWrap) : null;
  let debounceId = null;

  if (searchButton) {
    searchButton.addEventListener("click", () => {
      refreshCourseList();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        refreshCourseList();
        hideSuggestions(suggestionBox);
      }
    });

    searchInput.addEventListener("input", () => {
      if (!suggestionBox) return;

      window.clearTimeout(debounceId);
      debounceId = window.setTimeout(async () => {
        const keyword = searchInput.value.trim();
        if (!keyword) {
          hideSuggestions(suggestionBox);
          return;
        }

        try {
          const suggestions = await fetchCourseSuggestions(keyword);
          renderSuggestions(suggestionBox, suggestions, searchInput);
        } catch (error) {
          hideSuggestions(suggestionBox);
        }
      }, 250);
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", () => {
      refreshCourseList();
    });
  }

  if (levelFilter) {
    levelFilter.addEventListener("change", () => {
      refreshCourseList();
    });
  }

  document.addEventListener("click", (event) => {
    if (!suggestionBox) return;
    if (searchWrap && searchWrap.contains(event.target)) return;
    hideSuggestions(suggestionBox);
  });
}

function ensureSuggestionBox(wrapper) {
  const existing = wrapper.querySelector("[data-course-suggest]");
  if (existing) return existing;

  const box = document.createElement("div");
  box.className = "course-suggest";
  box.setAttribute("data-course-suggest", "true");
  box.hidden = true;
  wrapper.appendChild(box);
  return box;
}

function hideSuggestions(box) {
  if (!box) return;
  box.hidden = true;
  box.innerHTML = "";
}

function renderSuggestions(box, suggestions, input) {
  if (!box) return;

  const safeItems = Array.isArray(suggestions) ? suggestions : [];
  if (!safeItems.length) {
    hideSuggestions(box);
    return;
  }

  box.innerHTML = safeItems
    .map((item) => {
      const title = item.title || "";
      return `
        <button type="button" class="course-suggest-item" data-suggest-title="${title}">
          ${title}
        </button>
      `;
    })
    .join("");

  box.querySelectorAll(".course-suggest-item").forEach((button) => {
    button.addEventListener("click", () => {
      const title = button.getAttribute("data-suggest-title") || "";
      input.value = title;
      hideSuggestions(box);
      refreshCourseList();
    });
  });

  box.hidden = false;
}

async function fetchCourseSuggestions(keyword) {
  const response = await fetch(`${API_BASE_URL}/courses/suggest/?q=${encodeURIComponent(keyword)}`);
  if (!response.ok) return [];
  return response.json();
}

function getCurrentCourseFilters() {
  const searchInput = document.getElementById("course-search-input");
  const statusFilter = document.getElementById("course-status-filter");
  const levelFilter = document.getElementById("course-level-filter");

  const search = searchInput ? searchInput.value.trim() : "";
  const status = statusFilter ? statusFilter.value : "all";
  const level = levelFilter ? levelFilter.value : "all";

  return { search, status, level };
}

async function getMyLearningCache() {
  if (!myLearningCachePromise) {
    myLearningCachePromise = fetchMyLearning()
      .then((data) => (Array.isArray(data) ? data : null))
      .catch(() => null);
  }
  return myLearningCachePromise;
}

function buildProgressMap(data) {
  if (!Array.isArray(data)) return null;

  const map = {};
  data.forEach((course) => {
    const progress = Number(course.progress_percentage ?? course.progress ?? 0);
    map[course.course_id] = progress;
  });
  return map;
}

async function refreshCourseList() {
  const filters = getCurrentCourseFilters();
  const myLearning = await getMyLearningCache();
  const progressByCourseId = buildProgressMap(myLearning);

  await renderCourses({
    queryParams: {
      search: filters.search,
      level: filters.level === "all" ? "" : filters.level
    },
    status: filters.status,
    progressByCourseId
  });
}

async function renderMyCourses() {
  const list = document.querySelector("[data-my-courses-list]");
  if (!list) return;

  list.innerHTML = '<div class="card"><h3>Dang tai khoa hoc cua ban...</h3></div>';

  try {
    const data = await getMyLearningCache();
    if (!data) {
      list.innerHTML = '<div class="card"><h3>Vui long dang nhap de xem khoa hoc da dang ky.</h3></div>';
      return;
    }

    if (!data.length) {
      list.innerHTML = '<div class="card"><h3>Ban chua dang ky khoa hoc nao.</h3></div>';
      return;
    }

    list.innerHTML = data
      .map((course) => {
        const thumbStyle = course.thumbnail
          ? `style="background-image: url('${course.thumbnail}');"`
          : "";
        const thumbClass = course.thumbnail ? "course-thumb" : "course-thumb is-empty";
        const progress = Number(course.progress_percentage ?? course.progress ?? 0);
        return `
          <article class="card">
            <div class="${thumbClass}" ${thumbStyle}>JSMART</div>
            <h3>${course.course_title}</h3>
            <p>Da hoan thanh: ${progress}%</p>
            <div class="meta">
              <div class="actions" style="gap: 8px;">
                <a class="btn btn-primary" href="course-detail.html?id=${course.course_id}">Vao hoc</a>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    list.innerHTML = '<div class="card"><h3>Khong the tai khoa hoc cua ban.</h3></div>';
  }
}