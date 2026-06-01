// forum.js — Student Discussion Forum

// ===== Category Map =====
const CATEGORIES = {
      grammar: { label: "Ngữ pháp & Từ vựng", icon: "📖", cssClass: "cat-badge--grammar" },
      kanji: { label: "Kanji", icon: "🈶", cssClass: "cat-badge--material" },
      jlpt: { label: "JLPT & Luyện thi", icon: "📝", cssClass: "cat-badge--jlpt" },
      share: { label: "Chia sẻ kinh nghiệm", icon: "💬", cssClass: "cat-badge--share" },
      find: { label: "Tìm bạn luyện tập", icon: "🤝", cssClass: "cat-badge--find" },
      qa: { label: "Hỏi đáp khóa học", icon: "❓", cssClass: "cat-badge--qa" },
      material: { label: "Tài liệu & Sách", icon: "📚", cssClass: "cat-badge--material" },
      other: { label: "Khác", icon: "💬", cssClass: "cat-badge--share" }
};

// ===== State =====
let allTopics = [];
let currentFilter = "all";
let currentSearch = "";
let pendingDeleteTopicId = null;
let pendingEditTopicId = null;
let pendingCommentImage = null;

function mapUiCategoryToBackend(value) {
      if (["grammar", "kanji", "jlpt", "other"].includes(value)) return value;
      return "other";
}

function mapBackendCategoryToUi(value) {
      if (value === "grammar" || value === "kanji" || value === "jlpt" || value === "other") return value;
      return "other";
}

async function fetchTopics() {
      const response = await fetch(`${API_BASE_URL}/forum/topics/`);
      if (!response.ok) return [];
      const data = await response.json().catch(() => ([]));
      return Array.isArray(data) ? data : [];
}

async function createTopic(payload) {
      const tokens = getAuthTokens();
      if (!tokens || !tokens.access) {
            throw new Error("Vui lòng đăng nhập để tạo chủ đề.");
      }
      const response = await fetch(`${API_BASE_URL}/forum/topics/`, {
            method: "POST",
            headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${tokens.access}`
            },
            body: JSON.stringify(payload)
      });
      if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || data.detail || "Không thể tạo chủ đề.");
      }
      return response.json();
}

async function fetchTopicReplies(topicId) {
      const response = await fetch(`${API_BASE_URL}/forum/topics/${topicId}/response/`);
      if (!response.ok) return [];
      const data = await response.json().catch(() => ([]));
      return Array.isArray(data) ? data : [];
}

async function createReply(topicId, content, imageFile) {
      const tokens = getAuthTokens();
      if (!tokens || !tokens.access) {
            throw new Error("Vui lòng đăng nhập để bình luận.");
      }
      const formData = new FormData();
      if (content) formData.append("content", content);
      if (imageFile) formData.append("image_file", imageFile);
      const response = await fetch(`${API_BASE_URL}/forum/topics/${topicId}/reply/`, {
            method: "POST",
            headers: {
                  Authorization: `Bearer ${tokens.access}`
            },
            body: formData
      });
      if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || data.detail || "Không thể gửi bình luận.");
      }
      return response.json();
}

async function deleteTopic(topicId) {
      const tokens = getAuthTokens();
      if (!tokens || !tokens.access) {
            throw new Error("Vui lòng đăng nhập để xóa chủ đề.");
      }
      const response = await fetch(`${API_BASE_URL}/forum/topics/${topicId}/`, {
            method: "DELETE",
            headers: {
                  Authorization: `Bearer ${tokens.access}`
            }
      });
      if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || data.detail || "Không thể xóa chủ đề.");
      }
      return true;
}

async function updateTopic(topicId, payload) {
      const tokens = getAuthTokens();
      if (!tokens || !tokens.access) {
            throw new Error("Vui lòng đăng nhập để chỉnh sửa chủ đề.");
      }
      const response = await fetch(`${API_BASE_URL}/forum/topics/${topicId}/`, {
            method: "PATCH",
            headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${tokens.access}`
            },
            body: JSON.stringify(payload)
      });
      if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || data.detail || "Không thể cập nhật chủ đề.");
      }
      return response.json();
}

function timeAgo(dateStr) {
      const now = new Date();
      const date = new Date(dateStr);
      const diff = Math.floor((now - date) / 1000);
      if (diff < 60) return "vừa xong";
      if (diff < 3600) return Math.floor(diff / 60) + " phút trước";
      if (diff < 86400) return Math.floor(diff / 3600) + " giờ trước";
      if (diff < 2592000) return Math.floor(diff / 86400) + " ngày trước";
      return date.toLocaleDateString("vi-VN");
}

function escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
}

function buildMediaUrl(path) {
      if (!path) return "";
      if (path.startsWith("http")) return path;
      if (path.startsWith("/")) return `${API_HOST}${path}`;
      return `${API_HOST}/${path}`;
}

function normalizeTopic(topic) {
      const author = topic.user_name || "Học viên";
      const authorInit = String(author).trim().charAt(0).toUpperCase() || "H";
      return {
            id: topic.id,
            title: topic.title,
            category: mapBackendCategoryToUi(topic.category),
            content: topic.content || "",
            author,
            authorInit,
            replies: Number(topic.response_count || 0),
            views: 0,
            createdAt: topic.created_at
      };
}

// ===== Render =====
function getFilteredTopics() {
      let topics = [...allTopics];

      if (currentFilter !== "all") {
            topics = topics.filter((t) => t.category === currentFilter);
      }

      if (currentSearch.trim()) {
            const q = currentSearch.toLowerCase();
            topics = topics.filter((t) =>
                  t.title.toLowerCase().includes(q) ||
                  t.author.toLowerCase().includes(q) ||
                  t.content.toLowerCase().includes(q)
            );
      }

      topics.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return topics;
}

function getAvatarGradient(initial) {
      const colors = [
            "background:linear-gradient(135deg,#ff6b8b,#fb7185)",
            "background:linear-gradient(135deg,#6366f1,#818cf8)",
            "background:linear-gradient(135deg,#10b981,#34d399)",
            "background:linear-gradient(135deg,#f97316,#fb923c)",
            "background:linear-gradient(135deg,#8b5cf6,#a78bfa)",
            "background:linear-gradient(135deg,#ec4899,#f9a8d4)",
            "background:linear-gradient(135deg,#3b82f6,#60a5fa)",
            "background:linear-gradient(135deg,#14b8a6,#5eead4)"
      ];
      const index = (initial || "A").charCodeAt(0) % colors.length;
      return colors[index];
}

function renderTopics() {
      const tbody = document.getElementById("forum-tbody");
      const topics = getFilteredTopics();

      if (!topics.length) {
            tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="forum-empty">
            <div class="forum-empty-icon">💬</div>
            <h3>Chưa có chủ đề nào</h3>
            <p>Hãy là người đầu tiên tạo chủ đề thảo luận!</p>
          </div>
        </td>
      </tr>`;
            return;
      }

      tbody.innerHTML = topics
            .map((topic) => {
                  const cat = CATEGORIES[topic.category] || CATEGORIES.other;
                  return `
      <tr data-topic-id="${topic.id}">
        <td>
          <div class="topic-cell">
            <div class="topic-avatar" style="${getAvatarGradient(topic.authorInit)}">${escapeHtml(topic.authorInit)}</div>
            <div class="topic-info">
              <div class="topic-title">${escapeHtml(topic.title)}</div>
              <div class="topic-meta">
                <span class="topic-author">${escapeHtml(topic.author)}</span>
                <span>•</span>
                <span>${timeAgo(topic.createdAt)}</span>
              </div>
            </div>
          </div>
        </td>
        <td><span class="cat-badge ${cat.cssClass}">${cat.icon} ${cat.label}</span></td>
        <td><div class="stat-col">${topic.replies}<small>trả lời</small></div></td>
        <td><div class="stat-col">${topic.views}<small>lượt xem</small></div></td>
        <td>
          <div class="last-reply">
            <strong>${escapeHtml(topic.author)}</strong>
            ${timeAgo(topic.createdAt)}
          </div>
        </td>
      </tr>`;
            })
            .join("");

      tbody.querySelectorAll("tr[data-topic-id]").forEach((row) => {
            row.addEventListener("click", () => {
                  const id = parseInt(row.getAttribute("data-topic-id"));
                  openTopicDetail(id);
            });
      });
}

// ===== Topic Detail Modal =====
async function openTopicDetail(topicId) {
      const topic = allTopics.find((t) => t.id === topicId);
      if (!topic) return;

      const overlay = document.getElementById("topic-detail-modal");
      const cat = CATEGORIES[topic.category] || CATEGORIES.other;

      document.getElementById("detail-title").textContent = topic.title;
      document.getElementById("detail-meta").innerHTML = `
    <div class="topic-avatar" style="${getAvatarGradient(topic.authorInit)};width:32px;height:32px;font-size:0.8rem">${escapeHtml(topic.authorInit)}</div>
    <strong>${escapeHtml(topic.author)}</strong>
    <span>•</span>
    <span>${timeAgo(topic.createdAt)}</span>
    <span>•</span>
    <span class="cat-badge ${cat.cssClass}">${cat.icon} ${cat.label}</span>
  `;
      document.getElementById("detail-content").innerHTML = escapeHtml(topic.content).replace(/\n/g, "<br>");

      const deleteBtn = document.getElementById("delete-topic");
      const editBtn = document.getElementById("edit-topic");
      const user = getLoginUser();
      const userName = user?.username || user?.name || user?.full_name || user?.email || "";
      const canManage = Boolean(user && (user.role === 'admin' || (userName && userName === topic.author)));
      if (deleteBtn) {
            deleteBtn.hidden = !canManage;
            deleteBtn.onclick = () => {
                  pendingDeleteTopicId = topicId;
                  openDeleteTopicModal();
            };
      }
      if (editBtn) {
            editBtn.hidden = !canManage;
            editBtn.onclick = () => {
                  pendingEditTopicId = topicId;
                  openEditTopicModal(topic);
            };
      }

      const replies = await fetchTopicReplies(topicId);
      renderComments(replies);

      overlay.classList.add("is-open");
      overlay.setAttribute("data-current-topic", topicId);
}

function closeTopicDetail() {
      document.getElementById("topic-detail-modal").classList.remove("is-open");
}

function openDeleteTopicModal() {
      document.getElementById("delete-topic-modal").classList.add("is-open");
}

function closeDeleteTopicModal() {
      document.getElementById("delete-topic-modal").classList.remove("is-open");
}

function openImageViewer(src) {
      const overlay = document.getElementById("image-viewer");
      const img = document.getElementById("image-viewer-img");
      if (!overlay || !img) return;
      img.src = src;
      overlay.classList.add("is-open");
}

function closeImageViewer() {
      const overlay = document.getElementById("image-viewer");
      const img = document.getElementById("image-viewer-img");
      if (img) img.src = "";
      overlay?.classList.remove("is-open");
}

function openEditTopicModal(topic) {
      const titleInput = document.getElementById("edit-topic-title");
      const contentInput = document.getElementById("edit-topic-content");
      if (titleInput) titleInput.value = topic.title || "";
      if (contentInput) contentInput.value = topic.content || "";
      document.getElementById("edit-topic-modal").classList.add("is-open");
}

function closeEditTopicModal() {
      document.getElementById("edit-topic-modal").classList.remove("is-open");
}

function renderComments(comments) {
      const container = document.getElementById("comments-list");
      const countEl = document.getElementById("comments-count");

      countEl.textContent = comments.length;

      if (!comments.length) {
            container.innerHTML = '<p style="color:var(--muted);font-size:0.9rem;">Chưa có bình luận. Hãy là người đầu tiên trả lời!</p>';
            return;
      }

      container.innerHTML = comments
            .map((c) => {
                  const author = c.user_name || "Học viên";
                  const init = author.trim().charAt(0).toUpperCase() || "H";
                  const textHtml = escapeHtml(c.content || '').replace(/\n/g, "<br>");
                  const imageUrl = buildMediaUrl(c.image_file || "");
                  const imageHtml = imageUrl
                        ? `
                              <button class="comment-image-link" type="button" data-image-src="${escapeHtml(imageUrl)}">
                                    <img class="comment-image" src="${escapeHtml(imageUrl)}" alt="comment image">
                              </button>
                        `
                        : '';
                  const linkHtml = c.link_url
                        ? `<a class="comment-link" href="${escapeHtml(c.link_url)}" target="_blank" rel="noopener">${escapeHtml(c.link_url)}</a>`
                        : '';
                  return `
    <div class="comment-item">
      <div class="comment-avatar" style="${getAvatarGradient(init)}">${escapeHtml(init)}</div>
      <div class="comment-body">
        <div class="comment-header">
          <span class="comment-author">${escapeHtml(author)}</span>
          <span class="comment-time">${timeAgo(c.created_at)}</span>
        </div>
                        <div class="comment-text">${textHtml}</div>
                        <div class="comment-media">${imageHtml}${linkHtml}</div>
      </div>
    </div>`;
            })
            .join("");

      container.querySelectorAll(".comment-image-link").forEach((button) => {
            button.addEventListener("click", () => {
                  const src = button.getAttribute("data-image-src");
                  if (src) openImageViewer(src);
            });
      });
}

async function submitComment() {
      const user = getLoginUser();
      if (!user) {
            alert("Vui lòng đăng nhập để bình luận!");
            return;
      }

      const textarea = document.getElementById("comment-input");
      const text = textarea.value.trim();
      if (!text && !pendingCommentImage) {
            alert("Vui lòng nhập nội dung hoặc đính kèm ảnh.");
            return;
      }

      const overlay = document.getElementById("topic-detail-modal");
      const topicId = parseInt(overlay.getAttribute("data-current-topic"));

      try {
            await createReply(topicId, text, pendingCommentImage);
            textarea.value = "";
            clearCommentImage();
            const replies = await fetchTopicReplies(topicId);
            renderComments(replies);
            await refreshTopics();
      } catch (error) {
            alert(error.message || "Không thể gửi bình luận.");
      }
}

// ===== New Topic Modal =====
function openNewTopicModal() {
      const user = getLoginUser();
      if (!user) {
            alert("Vui lòng đăng nhập để tạo chủ đề mới!");
            window.location.href = "login.html";
            return;
      }
      document.getElementById("new-topic-modal").classList.add("is-open");
}

function closeNewTopicModal() {
      document.getElementById("new-topic-modal").classList.remove("is-open");
}

function submitNewTopic() {
      const user = getLoginUser();
      if (!user) return;

      const titleInput = document.getElementById("new-topic-title");
      const catSelect = document.getElementById("new-topic-category");
      const contentInput = document.getElementById("new-topic-content");

      const title = titleInput.value.trim();
      const category = mapUiCategoryToBackend(catSelect.value);
      const content = contentInput.value.trim();

      if (!title || !content) {
            alert("Vui lòng nhập tiêu đề và nội dung!");
            return;
      }

      createTopic({ title, category, content })
            .then(async () => {
                  titleInput.value = "";
                  contentInput.value = "";
                  catSelect.value = "grammar";
                  closeNewTopicModal();
                  await refreshTopics();
            })
            .catch((error) => {
                  alert(error.message || "Không thể tạo chủ đề.");
            });
}

async function refreshTopics() {
      const topics = await fetchTopics();
      allTopics = topics.map(normalizeTopic);
      renderTopics();
}

// ===== Event Listeners =====
document.addEventListener("DOMContentLoaded", () => {
      initStandardHeader();

      refreshTopics();

      const searchInput = document.getElementById("forum-search");
      if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                  currentSearch = e.target.value;
                  renderTopics();
            });
      }

      const filterSelect = document.getElementById("forum-filter");
      if (filterSelect) {
            filterSelect.addEventListener("change", (e) => {
                  currentFilter = e.target.value;
                  document.querySelectorAll(".forum-cat-btn").forEach((btn) => {
                        btn.classList.toggle("active", btn.getAttribute("data-cat") === currentFilter);
                  });
                  renderTopics();
            });
      }

      document.querySelectorAll(".forum-cat-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                  currentFilter = btn.getAttribute("data-cat");
                  document.querySelectorAll(".forum-cat-btn").forEach((b) => b.classList.remove("active"));
                  btn.classList.add("active");
                  if (filterSelect) filterSelect.value = currentFilter;
                  renderTopics();
            });
      });

      document.getElementById("btn-new-topic")?.addEventListener("click", openNewTopicModal);
      document.getElementById("close-new-topic")?.addEventListener("click", closeNewTopicModal);
      document.getElementById("submit-new-topic")?.addEventListener("click", submitNewTopic);

      document.getElementById("close-topic-detail")?.addEventListener("click", closeTopicDetail);
      document.getElementById("submit-comment")?.addEventListener("click", submitComment);

      document.getElementById("close-edit-topic")?.addEventListener("click", closeEditTopicModal);
      document.getElementById("cancel-edit-topic")?.addEventListener("click", closeEditTopicModal);
      document.getElementById("submit-edit-topic")?.addEventListener("click", async () => {
            if (!pendingEditTopicId) return;
            const titleInput = document.getElementById("edit-topic-title");
            const contentInput = document.getElementById("edit-topic-content");
            const title = titleInput?.value.trim();
            const content = contentInput?.value.trim();
            if (!title || !content) {
                  alert("Vui lòng nhập tiêu đề và nội dung!");
                  return;
            }
            try {
                  await updateTopic(pendingEditTopicId, { title, content });
                  closeEditTopicModal();
                  closeTopicDetail();
                  pendingEditTopicId = null;
                  await refreshTopics();
            } catch (error) {
                  alert(error.message || "Không thể cập nhật chủ đề.");
            }
      });

      document.getElementById("close-delete-topic")?.addEventListener("click", closeDeleteTopicModal);
      document.getElementById("cancel-delete-topic")?.addEventListener("click", closeDeleteTopicModal);
      document.getElementById("confirm-delete-topic")?.addEventListener("click", async () => {
            if (!pendingDeleteTopicId) return;
            try {
                  await deleteTopic(pendingDeleteTopicId);
                  closeDeleteTopicModal();
                  closeTopicDetail();
                  pendingDeleteTopicId = null;
                  await refreshTopics();
            } catch (error) {
                  alert(error.message || "Không thể xóa chủ đề.");
            }
      });

      document.querySelectorAll(".forum-modal-overlay").forEach((overlay) => {
            overlay.addEventListener("click", (e) => {
                  if (e.target === overlay) {
                        overlay.classList.remove("is-open");
                  }
            });
      });

      document.getElementById("close-image-viewer")?.addEventListener("click", closeImageViewer);
      document.getElementById("image-viewer")?.addEventListener("click", (e) => {
            if (e.target.id === "image-viewer") {
                  closeImageViewer();
            }
      });

      document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                  document.querySelectorAll(".forum-modal-overlay.is-open").forEach((overlay) => {
                        overlay.classList.remove("is-open");
                  });
                  closeImageViewer();
            }
      });

      const commentForm = document.getElementById("comment-form-area");
      if (commentForm) {
            const user = getLoginUser();
            if (!user) {
                  commentForm.innerHTML = `
        <div class="login-prompt">
          <p>Đăng nhập để tham gia thảo luận</p>
          <a href="login.html" class="btn btn-primary">Đăng nhập</a>
        </div>`;
            }
      }

      const commentInput = document.getElementById("comment-input");
      const imageInput = document.getElementById("comment-image-input");
      const attachBtn = document.getElementById("comment-attach-btn");
      const removeBtn = document.getElementById("comment-image-remove");

      attachBtn?.addEventListener("click", () => imageInput?.click());
      imageInput?.addEventListener("change", (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) {
                  alert("Vui lòng chọn file ảnh hợp lệ.");
                  return;
            }
            setCommentImage(file);
      });

      removeBtn?.addEventListener("click", clearCommentImage);

      commentInput?.addEventListener("paste", (event) => {
            const items = event.clipboardData?.items || [];
            const imageItem = Array.from(items).find((item) => item.type.startsWith("image/"));
            if (!imageItem) return;
            const file = imageItem.getAsFile();
            if (!file) return;
            event.preventDefault();
            setCommentImage(file);
      });
});

function setCommentImage(file) {
      pendingCommentImage = file;
      const previewWrap = document.getElementById("comment-image-preview");
      const previewImg = document.getElementById("comment-image-preview-img");
      if (previewWrap && previewImg) {
            previewImg.src = URL.createObjectURL(file);
            previewWrap.hidden = false;
      }
}

function clearCommentImage() {
      pendingCommentImage = null;
      const imageInput = document.getElementById("comment-image-input");
      const previewWrap = document.getElementById("comment-image-preview");
      const previewImg = document.getElementById("comment-image-preview-img");
      if (imageInput) imageInput.value = "";
      if (previewImg) previewImg.src = "";
      if (previewWrap) previewWrap.hidden = true;
}
