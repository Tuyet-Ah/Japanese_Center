// forum.js — Student Discussion Forum

const FORUM_STORAGE_KEY = "jsmartForumTopics";
const FORUM_COMMENTS_KEY = "jsmartForumComments";

// ===== Category Map =====
const CATEGORIES = {
  grammar:  { label: "Ngữ pháp & Từ vựng", icon: "📖", cssClass: "cat-badge--grammar" },
  jlpt:     { label: "JLPT & Luyện thi",    icon: "📝", cssClass: "cat-badge--jlpt" },
  share:    { label: "Chia sẻ kinh nghiệm",  icon: "💬", cssClass: "cat-badge--share" },
  find:     { label: "Tìm bạn luyện tập",    icon: "🤝", cssClass: "cat-badge--find" },
  qa:       { label: "Hỏi đáp khóa học",     icon: "❓", cssClass: "cat-badge--qa" },
  material: { label: "Tài liệu & Sách",      icon: "📚", cssClass: "cat-badge--material" }
};

// ===== Sample Data =====
const SAMPLE_TOPICS = [
  {
    id: 1, pinned: true,
    title: "Quy tắc thảo luận — Vui lòng đọc trước khi đăng bài",
    author: "Admin JSMART", authorInit: "A",
    category: "qa",
    content: "Chào mừng các bạn đến với diễn đàn thảo luận JSMART!\n\nĐây là nơi để các học viên trao đổi, hỗ trợ nhau trong quá trình học tiếng Nhật. Để duy trì môi trường thảo luận lành mạnh, xin các bạn tuân thủ những quy tắc sau:\n\n1. Tôn trọng mọi người — Không xúc phạm, phân biệt.\n2. Đặt câu hỏi rõ ràng — Nêu cụ thể vấn đề bạn gặp.\n3. Không spam — Tránh đăng bài trùng lặp.\n4. Không quảng cáo — Không đăng nội dung quảng cáo cá nhân.\n5. Chia sẻ tích cực — Hãy chia sẻ kinh nghiệm học tập của bạn!",
    replies: 12, views: 458, createdAt: "2025-01-15T08:00:00",
    lastReplyAuthor: "Admin JSMART", lastReplyTime: "2025-05-28T10:30:00"
  },
  {
    id: 2, pinned: false,
    title: "Mẹo phân biệt 「は」 và 「が」 cho người mới học",
    author: "Trần Minh Anh", authorInit: "A",
    category: "grammar",
    content: "Chào mọi người!\n\nMình học tiếng Nhật được 3 tháng rồi nhưng vẫn hay nhầm lẫn giữa は và が. Sau khi đọc nhiều tài liệu và hỏi giáo viên, mình tổng hợp lại một số mẹo như sau:\n\n▪ は (wa) — Dùng khi nói về chủ đề đã biết, thông tin cũ\n▪ が (ga) — Dùng khi giới thiệu thông tin mới, nhấn mạnh chủ ngữ\n\nVí dụ:\n- 私は学生です。(Tôi là sinh viên — giới thiệu bản thân)\n- 誰が来ましたか。田中さんが来ました。(Ai đến? Tanaka đến — nhấn mạnh người đến)\n\nCác bạn có mẹo nào khác không? Chia sẻ nhé!",
    replies: 8, views: 234, createdAt: "2025-05-25T14:30:00",
    lastReplyAuthor: "Lê Thị Hoa", lastReplyTime: "2025-05-30T09:15:00"
  },
  {
    id: 3, pinned: false,
    title: "Chia sẻ lộ trình ôn thi JLPT N3 trong 3 tháng — Đạt 142/180",
    author: "Phạm Thị Dung", authorInit: "D",
    category: "jlpt",
    content: "Xin chào các bạn!\n\nMình vừa thi JLPT N3 kỳ tháng 12 và đạt 142/180 điểm. Mình muốn chia sẻ lộ trình ôn 3 tháng:\n\n📅 Tháng 1: Từ vựng + Kanji\n- Mỗi ngày học 20 từ mới bằng Anki\n- Ôn 10 Kanji mới + 10 Kanji cũ\n\n📅 Tháng 2: Ngữ pháp + Đọc hiểu\n- Học 3-5 mẫu ngữ pháp mới mỗi ngày\n- Đọc NHK News Easy mỗi tối\n\n📅 Tháng 3: Luyện đề + Nghe\n- Làm 2 bộ đề mỗi tuần\n- Nghe podcast tiếng Nhật 30 phút/ngày\n\nHy vọng giúp ích cho mọi người! Có gì hỏi mình nhé 😊",
    replies: 15, views: 567, createdAt: "2025-05-20T10:00:00",
    lastReplyAuthor: "Nguyễn Hoàng", lastReplyTime: "2025-05-31T08:00:00"
  },
  {
    id: 4, pinned: false,
    title: "Tìm bạn luyện nói tiếng Nhật online — Trình độ N4/N5",
    author: "Lê Thị Hà", authorInit: "H",
    category: "find",
    content: "Mình là học viên N5 đang học tại JSMART.\n\nMình muốn tìm bạn để luyện nói tiếng Nhật cơ bản qua Zoom/Discord, khoảng 2-3 buổi/tuần vào tối. Mình ở HCM nhưng online là chính.\n\nNếu bạn nào cũng đang cần partner luyện tập thì comment bên dưới nhé! Mình sẽ lập group Discord để tiện liên lạc.\n\nよろしくお願いします！🌸",
    replies: 21, views: 389, createdAt: "2025-05-22T16:45:00",
    lastReplyAuthor: "Trần Văn Khải", lastReplyTime: "2025-05-30T20:10:00"
  },
  {
    id: 5, pinned: false,
    title: "Hỏi về cách dùng 〜てもらう / 〜てくれる / 〜てあげる",
    author: "Nguyễn Hoàng Nam", authorInit: "N",
    category: "grammar",
    content: "Các bạn ơi, mình đang học bài てform với các mẫu cho nhận nhưng rất hay nhầm.\n\nMình hiểu sơ sơ là:\n- 〜てあげる: Tôi làm cho ai đó\n- 〜てくれる: Ai đó làm cho tôi\n- 〜てもらう: Tôi nhờ/được ai đó làm cho\n\nNhưng khi đặt câu cụ thể thì mình vẫn hay sai. Bạn nào có thể cho thêm ví dụ và giải thích rõ hơn không?\n\nCảm ơn mọi người!",
    replies: 6, views: 178, createdAt: "2025-05-28T09:20:00",
    lastReplyAuthor: "Cô Tanaka", lastReplyTime: "2025-05-29T14:30:00"
  },
  {
    id: 6, pinned: false,
    title: "Review sách Minna no Nihongo vs Genki — Nên chọn quyển nào?",
    author: "Hoàng Thị Linh", authorInit: "L",
    category: "material",
    content: "Mình vừa mới bắt đầu học tiếng Nhật và phân vân giữa 2 bộ sách:\n\n📕 Minna no Nihongo:\n- Ưu: Được sử dụng rộng rãi ở VN, nhiều tài liệu bổ trợ\n- Nhược: Toàn bộ tiếng Nhật, cần mua thêm bản dịch\n\n📘 Genki:\n- Ưu: Song ngữ Nhật-Anh, dễ tự học\n- Nhược: Ít phổ biến ở VN, ít tài liệu bổ trợ tiếng Việt\n\nCác bạn đã dùng quyển nào và thấy thế nào? Chia sẻ giúp mình nhé!",
    replies: 11, views: 312, createdAt: "2025-05-18T11:30:00",
    lastReplyAuthor: "Phạm Minh Tuấn", lastReplyTime: "2025-05-27T16:45:00"
  },
  {
    id: 7, pinned: false,
    title: "Khóa N4 Communication Boost có khó không ạ?",
    author: "Trịnh Tuyết Anh", authorInit: "T",
    category: "qa",
    content: "Mình mới hoàn thành khóa N5 ở JSMART và đang muốn đăng ký tiếp khóa N4 Communication Boost.\n\nMình muốn hỏi:\n1. Khóa này có yêu cầu phải đạt điểm tối thiểu N5 không?\n2. Nội dung có nặng lý thuyết hay chủ yếu thực hành?\n3. Có bạn nào đã học rồi cho mình xin review không?\n\nCảm ơn mọi người! 🙏",
    replies: 4, views: 145, createdAt: "2025-05-29T20:00:00",
    lastReplyAuthor: "Trần Văn Minh", lastReplyTime: "2025-05-30T11:20:00"
  },
  {
    id: 8, pinned: false,
    title: "Kinh nghiệm thi JLPT N2 lần đầu — Những sai lầm cần tránh",
    author: "Lê Mai Phương", authorInit: "P",
    category: "share",
    content: "Mình xin chia sẻ kinh nghiệm thi N2 lần đầu (đã rớt) và lần 2 (đã đậu):\n\n❌ Lần 1 — Sai lầm:\n- Ôn quá nhiều ngữ pháp mà ít luyện đề\n- Không luyện nghe đủ, chỉ đọc\n- Quản lý thời gian thi kém\n\n✅ Lần 2 — Cải thiện:\n- Luyện đề mỗi tuần, tính giờ chuẩn\n- Nghe shadowing 1 tiếng/ngày\n- Đọc báo NHK + sách nhỏ tiếng Nhật hàng ngày\n- Tham gia nhóm học của JSMART để trao đổi\n\nĐừng nản nếu rớt lần đầu nhé! 💪",
    replies: 9, views: 423, createdAt: "2025-05-15T08:45:00",
    lastReplyAuthor: "Nguyễn Minh Châu", lastReplyTime: "2025-05-28T19:30:00"
  }
];

const SAMPLE_COMMENTS = {
  1: [
    { id: 101, author: "Trần Minh Anh", authorInit: "A", text: "Cảm ơn Admin! Mình sẽ tuân thủ quy tắc ạ 🙏", time: "2025-01-16T10:00:00" },
    { id: 102, author: "Phạm Thị Dung", authorInit: "D", text: "Rất rõ ràng, cảm ơn đã tạo forum này cho học viên!", time: "2025-01-17T14:20:00" }
  ],
  2: [
    { id: 201, author: "Lê Thị Hoa", authorInit: "H", text: "Bổ sung thêm: は cũng dùng khi so sánh, ví dụ 「魚は好きですが、肉は好きじゃないです」", time: "2025-05-26T08:30:00" },
    { id: 202, author: "Nguyễn Hoàng Nam", authorInit: "N", text: "Hay quá! Mình cũng hay nhầm, cảm ơn bạn đã chia sẻ!", time: "2025-05-27T11:00:00" },
    { id: 203, author: "Cô Tanaka", authorInit: "T", text: "Rất tốt! Thêm một mẹo: trong câu trả lời cho câu hỏi bằng 「だれが」thì luôn dùng が nhé các bạn.", time: "2025-05-28T09:45:00" }
  ],
  3: [
    { id: 301, author: "Nguyễn Hoàng", authorInit: "H", text: "Lộ trình rất chi tiết! Bạn dùng app Anki nào vậy? Cho mình xin link deck từ vựng N3 được không?", time: "2025-05-21T09:00:00" },
    { id: 302, author: "Phạm Thị Dung", authorInit: "D", text: "Mình dùng Anki PC bản miễn phí, deck mình tự tạo từ sách Soumatome N3 nhé! Mình sẽ share link sau.", time: "2025-05-21T14:00:00" }
  ],
  4: [
    { id: 401, author: "Trần Văn Khải", authorInit: "K", text: "Mình cũng đang N5, muốn join! Discord của bạn tên gì vậy?", time: "2025-05-23T08:15:00" },
    { id: 402, author: "Lê Thị Hà", authorInit: "H", text: "Mình tạo server rồi nhé, link: discord.gg/jsmart-study. Các bạn vào nha!", time: "2025-05-23T10:30:00" },
    { id: 403, author: "Hoàng Thị Linh", authorInit: "L", text: "Đã join! Mong được học cùng mọi người ❤️", time: "2025-05-24T19:00:00" }
  ],
  5: [
    { id: 501, author: "Cô Tanaka", authorInit: "T", text: "Ví dụ:\n• 友達に本を買ってあげました (Tôi mua sách cho bạn)\n• 母が料理を作ってくれました (Mẹ nấu cơm cho tôi)\n• 先生に教えてもらいました (Tôi được thầy dạy)\n\nĐiểm chính: くれる — người khác CHỦ ĐỘNG làm cho tôi. もらう — tôi là người NHẬN/NHỜ.", time: "2025-05-29T14:30:00" }
  ]
};

// ===== State =====
let allTopics = [];
let currentFilter = "all";
let currentSearch = "";
let nextTopicId = 100;
let nextCommentId = 1000;

// ===== Helpers =====
function loadTopics() {
  const stored = localStorage.getItem(FORUM_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch { /* fall through */ }
  }
  // First load — use sample data
  localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(SAMPLE_TOPICS));
  return [...SAMPLE_TOPICS];
}

function saveTopics(topics) {
  localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(topics));
}

function loadComments() {
  const stored = localStorage.getItem(FORUM_COMMENTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch { /* fall through */ }
  }
  localStorage.setItem(FORUM_COMMENTS_KEY, JSON.stringify(SAMPLE_COMMENTS));
  return JSON.parse(JSON.stringify(SAMPLE_COMMENTS));
}

function saveComments(comments) {
  localStorage.setItem(FORUM_COMMENTS_KEY, JSON.stringify(comments));
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

// ===== Render =====
function getFilteredTopics() {
  let topics = [...allTopics];

  // Filter by category
  if (currentFilter !== "all") {
    topics = topics.filter(t => t.category === currentFilter);
  }

  // Filter by search
  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase();
    topics = topics.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.author.toLowerCase().includes(q) ||
      t.content.toLowerCase().includes(q)
    );
  }

  // Sort: pinned first, then newest
  topics.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return topics;
}

function renderStats() {
  const totalTopics = allTopics.length;
  const totalReplies = allTopics.reduce((sum, t) => sum + (t.replies || 0), 0);
  const totalViews = allTopics.reduce((sum, t) => sum + (t.views || 0), 0);
  const totalMembers = new Set(allTopics.map(t => t.author)).size;

  document.getElementById("stat-topics").textContent = totalTopics;
  document.getElementById("stat-replies").textContent = totalReplies;
  document.getElementById("stat-views").textContent = totalViews >= 1000 ? (totalViews / 1000).toFixed(1) + "K" : totalViews;
  document.getElementById("stat-members").textContent = totalMembers;
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

  tbody.innerHTML = topics.map(topic => {
    const cat = CATEGORIES[topic.category] || CATEGORIES.qa;
    return `
      <tr class="${topic.pinned ? 'pinned' : ''}" data-topic-id="${topic.id}">
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
            <strong>${escapeHtml(topic.lastReplyAuthor || topic.author)}</strong>
            ${timeAgo(topic.lastReplyTime || topic.createdAt)}
          </div>
        </td>
      </tr>`;
  }).join("");

  // Attach click events
  tbody.querySelectorAll("tr[data-topic-id]").forEach(row => {
    row.addEventListener("click", () => {
      const id = parseInt(row.getAttribute("data-topic-id"));
      openTopicDetail(id);
    });
  });
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

// ===== Topic Detail Modal =====
function openTopicDetail(topicId) {
  const topic = allTopics.find(t => t.id === topicId);
  if (!topic) return;

  // Increment views
  topic.views = (topic.views || 0) + 1;
  saveTopics(allTopics);
  renderTopics();
  renderStats();

  const overlay = document.getElementById("topic-detail-modal");
  const cat = CATEGORIES[topic.category] || CATEGORIES.qa;

  document.getElementById("detail-title").textContent = topic.title;
  document.getElementById("detail-meta").innerHTML = `
    <div class="topic-avatar" style="${getAvatarGradient(topic.authorInit)};width:32px;height:32px;font-size:0.8rem">${escapeHtml(topic.authorInit)}</div>
    <strong>${escapeHtml(topic.author)}</strong>
    <span>•</span>
    <span>${timeAgo(topic.createdAt)}</span>
    <span>•</span>
    <span class="cat-badge ${cat.cssClass}">${cat.icon} ${cat.label}</span>
  `;
  document.getElementById("detail-content").textContent = topic.content;

  // Render comments
  renderComments(topicId);

  overlay.classList.add("is-open");
  overlay.setAttribute("data-current-topic", topicId);
}

function closeTopicDetail() {
  document.getElementById("topic-detail-modal").classList.remove("is-open");
}

function renderComments(topicId) {
  const allComments = loadComments();
  const comments = allComments[topicId] || [];
  const container = document.getElementById("comments-list");
  const countEl = document.getElementById("comments-count");

  countEl.textContent = comments.length;

  if (!comments.length) {
    container.innerHTML = '<p style="color:var(--muted);font-size:0.9rem;">Chưa có bình luận. Hãy là người đầu tiên trả lời!</p>';
    return;
  }

  container.innerHTML = comments.map(c => `
    <div class="comment-item">
      <div class="comment-avatar" style="${getAvatarGradient(c.authorInit)}">${escapeHtml(c.authorInit)}</div>
      <div class="comment-body">
        <div class="comment-header">
          <span class="comment-author">${escapeHtml(c.author)}</span>
          <span class="comment-time">${timeAgo(c.time)}</span>
        </div>
        <div class="comment-text">${escapeHtml(c.text).replace(/\n/g, "<br>")}</div>
      </div>
    </div>
  `).join("");
}

function submitComment() {
  const user = getLoginUser();
  if (!user) {
    alert("Vui lòng đăng nhập để bình luận!");
    return;
  }

  const textarea = document.getElementById("comment-input");
  const text = textarea.value.trim();
  if (!text) return;

  const overlay = document.getElementById("topic-detail-modal");
  const topicId = parseInt(overlay.getAttribute("data-current-topic"));

  const allComments = loadComments();
  if (!allComments[topicId]) allComments[topicId] = [];

  const newComment = {
    id: nextCommentId++,
    author: user.name || "Học viên",
    authorInit: (user.name || "H").charAt(0).toUpperCase(),
    text: text,
    time: new Date().toISOString()
  };

  allComments[topicId].push(newComment);
  saveComments(allComments);

  // Update topic reply count
  const topic = allTopics.find(t => t.id === topicId);
  if (topic) {
    topic.replies = (topic.replies || 0) + 1;
    topic.lastReplyAuthor = newComment.author;
    topic.lastReplyTime = newComment.time;
    saveTopics(allTopics);
    renderTopics();
    renderStats();
  }

  textarea.value = "";
  renderComments(topicId);
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
  const category = catSelect.value;
  const content = contentInput.value.trim();

  if (!title || !content) {
    alert("Vui lòng nhập tiêu đề và nội dung!");
    return;
  }

  const newTopic = {
    id: nextTopicId++,
    pinned: false,
    title: title,
    author: user.name || "Học viên",
    authorInit: (user.name || "H").charAt(0).toUpperCase(),
    category: category,
    content: content,
    replies: 0,
    views: 0,
    createdAt: new Date().toISOString(),
    lastReplyAuthor: null,
    lastReplyTime: null
  };

  allTopics.push(newTopic);
  saveTopics(allTopics);

  titleInput.value = "";
  contentInput.value = "";
  catSelect.value = "grammar";

  closeNewTopicModal();
  renderTopics();
  renderStats();
}

// ===== Event Listeners =====
document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  // Load data
  allTopics = loadTopics();
  nextTopicId = Math.max(...allTopics.map(t => t.id), 99) + 1;

  // Initial render
  renderStats();
  renderTopics();

  // Search
  const searchInput = document.getElementById("forum-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value;
      renderTopics();
    });
  }

  // Category filter select
  const filterSelect = document.getElementById("forum-filter");
  if (filterSelect) {
    filterSelect.addEventListener("change", (e) => {
      currentFilter = e.target.value;
      // Sync category buttons
      document.querySelectorAll(".forum-cat-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-cat") === currentFilter);
      });
      renderTopics();
    });
  }

  // Category buttons
  document.querySelectorAll(".forum-cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentFilter = btn.getAttribute("data-cat");
      document.querySelectorAll(".forum-cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      // Sync select
      if (filterSelect) filterSelect.value = currentFilter;
      renderTopics();
    });
  });

  // New topic
  document.getElementById("btn-new-topic")?.addEventListener("click", openNewTopicModal);
  document.getElementById("close-new-topic")?.addEventListener("click", closeNewTopicModal);
  document.getElementById("submit-new-topic")?.addEventListener("click", submitNewTopic);

  // Topic detail modal
  document.getElementById("close-topic-detail")?.addEventListener("click", closeTopicDetail);
  document.getElementById("submit-comment")?.addEventListener("click", submitComment);

  // Close modals on overlay click
  document.querySelectorAll(".forum-modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("is-open");
      }
    });
  });

  // Close modals on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".forum-modal-overlay.is-open").forEach(overlay => {
        overlay.classList.remove("is-open");
      });
    }
  });

  // Comment form — login check
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
});
