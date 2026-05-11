document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  const params = new URLSearchParams(window.location.search);
  const courseId = Number(params.get("id"));

  const title = document.getElementById("course-title");
  const level = document.getElementById("course-level");
  const schedule = document.getElementById("course-schedule");
  const description = document.getElementById("course-description");
  const knowledge = document.getElementById("course-knowledge");
  const price = document.getElementById("course-price");
  const oldPrice = document.getElementById("course-old-price");
  const chapterList = document.querySelector("[data-chapter-list]");
  const enrollmentNote = document.querySelector("[data-enrollment-note]");
  const contentContainer = document.querySelector("[data-course-content]");
  const navContainer = document.querySelector("[data-course-nav]");

  if (!courseId) {
    if (title) title.textContent = "Khong tim thay khoa hoc";
    return;
  }

  const renderChapters = (chapters, enrolled) => {
    if (!chapterList) return;

    if (!chapters.length) {
      chapterList.innerHTML = '<div class="card"><p>Chua cap nhat chuong hoc.</p></div>';
      return;
    }

    chapterList.innerHTML = chapters
      .map((chapter) => {
        const lessonItems = (chapter.lessons || [])
          .map((lesson) => `<li>${lesson.title}${enrolled ? "" : " - 🔒"}</li>`)
          .join("");

        return `
          <div class="chapter-item">
            <button type="button" class="chapter-toggle" data-chapter-toggle="${chapter.id}">
              Chuong ${chapter.order}: ${chapter.title}
            </button>
            <div class="chapter-lessons" data-chapter-lessons="${chapter.id}" hidden>
              <ul>${lessonItems || "<li>Chua co bai hoc.</li>"}</ul>
            </div>
          </div>
        `;
      })
      .join("");

    chapterList.querySelectorAll("[data-chapter-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-chapter-toggle");
        const panel = chapterList.querySelector(`[data-chapter-lessons="${targetId}"]`);
        if (!panel) return;
        panel.hidden = !panel.hidden;
        button.classList.toggle("is-open", !panel.hidden);
      });
    });
  };

  const slugify = (value, fallback) => {
    const slug = String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return slug || fallback;
  };

  const renderNav = (items) => {
    if (!navContainer) return;
    navContainer.innerHTML = "";

    items.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = item.label;
      button.addEventListener("click", () => {
        const target = document.getElementById(item.id);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      if (index === 0) {
        button.classList.add("is-active");
      }
      navContainer.appendChild(button);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const activeId = entry.target.id;
          navContainer.querySelectorAll("button").forEach((btn, idx) => {
            btn.classList.toggle("is-active", items[idx] && items[idx].id === activeId);
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0.1 }
    );

    items.forEach((item) => {
      const target = document.getElementById(item.id);
      if (target) observer.observe(target);
    });
  };

  const renderContentBlocks = (blocks) => {
    if (!contentContainer) return [];
    contentContainer.innerHTML = "";

    if (!Array.isArray(blocks) || !blocks.length) {
      return [];
    }

    const navItems = [];
    blocks.forEach((block, index) => {
      const titleText = block.title || `Muc ${index + 1}`;
      const sectionId = slugify(block.id || block.title, `block-${index + 1}`);

      const section = document.createElement("section");
      section.className = "course-block";
      section.id = sectionId;

      const heading = document.createElement("h3");
      heading.textContent = titleText;
      section.appendChild(heading);

      const items = Array.isArray(block.items) ? block.items : [];
      const paragraphs = Array.isArray(block.paragraphs) ? block.paragraphs : [];
      const content = typeof block.content === "string" ? block.content : "";

      if (items.length) {
        const list = document.createElement("ul");
        items.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          list.appendChild(li);
        });
        section.appendChild(list);
      }

      if (paragraphs.length) {
        paragraphs.forEach((text) => {
          const p = document.createElement("p");
          p.textContent = text;
          section.appendChild(p);
        });
      } else if (content) {
        const p = document.createElement("p");
        p.textContent = content;
        section.appendChild(p);
      }

      contentContainer.appendChild(section);
      navItems.push({ id: sectionId, label: titleText });
    });

    return navItems;
  };

  const renderCourse = (course, enrolled) => {
    if (title) title.textContent = course.title || course.name;
    if (level) level.textContent = course.level || "";
    if (schedule) schedule.textContent = course.schedule || "Chua cap nhat";
    if (description) description.textContent = course.description || "Chua co mo ta.";

    if (enrollmentNote) {
      enrollmentNote.textContent = enrolled
        ? "Ban da dang ky khoa hoc nay."
        : "Ban can dang ky de xem chi tiet bai hoc.";
    }

    const contentBlocks = Array.isArray(course.content_blocks) ? course.content_blocks : [];
    const goalsIndex = contentBlocks.findIndex((block) => {
      const key = String(block.id || block.type || "").toLowerCase();
      return key === "goals" || key === "outcomes" || key === "muc-tieu";
    });
    const goalsItems = goalsIndex >= 0 && Array.isArray(contentBlocks[goalsIndex].items)
      ? contentBlocks[goalsIndex].items
      : [];

    if (knowledge) {
      knowledge.innerHTML = goalsItems.length
        ? goalsItems.map((item) => `<li>${item}</li>`).join("")
        : "<li>Chua cap nhat.</li>";
    }

    const filteredBlocks = goalsIndex >= 0
      ? contentBlocks.filter((_, index) => index !== goalsIndex)
      : contentBlocks;
    const blockNavItems = renderContentBlocks(filteredBlocks);

    const chapters = Array.isArray(course.chapters) ? course.chapters : [];
    renderChapters(chapters, enrolled);

    const navItems = [
      { id: "section-intro", label: "Gioi thieu" },
      { id: "section-goals", label: "Muc tieu" },
      ...blockNavItems,
      { id: "section-outline", label: "Chuong trinh hoc" }
    ];
    renderNav(navItems);

    if (price) price.textContent = new Intl.NumberFormat("vi-VN").format(course.price || 0) + "đ";
    if (oldPrice) {
      oldPrice.textContent = course.price > 1000000
        ? new Intl.NumberFormat("vi-VN").format(Math.round(course.price * 1.2)) + "đ"
        : "";
    }

    const buyBtn = document.getElementById("buy-now");
    if (buyBtn) {
      buyBtn.addEventListener("click", () => {
        const cart = readCart();
        const cartItem = {
          id: course.id,
          name: course.title || course.name,
          level: course.level,
          schedule: course.schedule || "Chua cap nhat",
          price: Number(course.price || 0)
        };
        if (!cart.some((item) => item.id === course.id)) {
          cart.push(cartItem);
          saveCart(cart);
        }
        window.location.href = "cart.html";
      });
    }

    const consultBtn = document.getElementById("consult");
    if (consultBtn) {
      consultBtn.addEventListener("click", () => {
        alert("Vui long lien he trung tam de duoc tu van lo trinh phu hop.");
      });
    }
  };

  Promise.all([
    fetchCourseDetail(courseId),
    fetchMyLearning()
  ])
    .then(([courseData, myCourses]) => {
      const normalized = normalizeCourseDetail(courseData);
      const enrolled = Array.isArray(myCourses)
        ? myCourses.some((item) => item.course_id === normalized.id)
        : false;
      renderCourse(normalized, enrolled);
    })
    .catch(() => {
      if (title) title.textContent = "Khong the tai khoa hoc";
    });
});