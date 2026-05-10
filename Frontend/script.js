const cartKey = "jsmartCart";
const loginKey = "jsmartUser";
const CHATBOT_API_URL = "http://127.0.0.1:8000/educations/chatbot/";

const demoCourses = [
  {
    id: 1,
    name: "N5 Beginner Journey",
    level: "N5",
    schedule: "T2-T5",
    price: 2400000,
    description: "Khóa nền tảng giúp bạn làm quen với hiragana, katakana, từ vựng cơ bản và mẫu câu chào hỏi.",
    knowledge: ["Hiragana, katakana", "Từ vựng sinh hoạt hằng ngày", "Mẫu câu giới thiệu bản thân"],
    videos: ["Video 1: Chữ cái và phát âm", "Video 2: Giới thiệu bản thân", "Video 3: Trợ từ cơ bản"],
    exercises: ["Bài tập viết chữ cái", "Quiz từ vựng 20 câu", "Luyện hội thoại ngắn"]
  },
  {
    id: 2,
    name: "N4 Communication Boost",
    level: "N4",
    schedule: "T3-T7",
    price: 2900000,
    description: "Khóa luyện giao tiếp trung cấp giúp tăng khả năng nói, nghe và phản xạ trong tình huống thực tế.",
    knowledge: ["Mở rộng ngữ pháp N4", "Giao tiếp nơi công việc", "Nghe hiểu hội thoại ngắn"],
    videos: ["Video 1: Giao tiếp tại lớp học", "Video 2: Đặt câu hỏi", "Video 3: Tình huống công sở"],
    exercises: ["Viết đoạn tự giới thiệu", "Làm bài nghe ngắn", "Bài tập ngữ pháp 30 câu"]
  },
  {
    id: 3,
    name: "Business Japanese Starter",
    level: "N3+",
    schedule: "Cuối tuần",
    price: 3500000,
    description: "Khóa học tiếng Nhật ứng dụng cho môi trường doanh nghiệp, thư từ và họp hành cơ bản.",
    knowledge: ["Keigo cơ bản", "Email công việc", "Hội thoại trong văn phòng"],
    videos: ["Video 1: Mẫu email", "Video 2: Chào hỏi công ty", "Video 3: Họp và báo cáo"],
    exercises: ["Soạn email mẫu", "Role-play cuộc họp", "Quiz từ vựng doanh nghiệp"]
  },
  {
    id: 4,
    name: "Kanji Intensive Lab",
    level: "N5-N3",
    schedule: "Tối 2-4-6",
    price: 1800000,
    description: "Luyện kanji theo từng nhóm chủ đề, kết hợp viết, nhớ nghĩa và cách đọc.",
    knowledge: ["Radical cơ bản", "Cách đọc on-kun", "Nhận diện kanji theo ngữ cảnh"],
    videos: ["Video 1: Kanji nền tảng", "Video 2: Ghi nhớ theo hình ảnh", "Video 3: Kanji thực hành"],
    exercises: ["Luyện viết 50 chữ", "Bài tập đọc kanji", "Ôn tập flashcard"]
  }
];

const courseCatalog = Object.fromEntries(demoCourses.map((course) => [course.id, course]));

// Hệ thống login
function getLoginUser() {
  try {
    return JSON.parse(localStorage.getItem(loginKey)) || null;
  } catch {
    return null;
  }
}

function setLoginUser(userData) {
  localStorage.setItem(loginKey, JSON.stringify(userData));
  updateUIBasedOnLogin();
}

function logout() {
  localStorage.removeItem(loginKey);
  updateUIBasedOnLogin();
  window.location.href = "Home.html";
}

function updateUIBasedOnLogin() {
  const user = getLoginUser();
  const authActions = document.querySelector("[data-auth-actions]");
  const userActions = document.querySelector("[data-user-actions]");
  const profileLink = document.querySelector("[data-profile-link]");
  const cartLink = document.querySelector("[data-cart-link]");

  if (user) {
    // Đã login
    if (authActions) authActions.style.display = "none";
    if (userActions) userActions.style.display = "flex";
    if (profileLink) profileLink.hidden = false;
    if (cartLink) cartLink.hidden = false;
    document.querySelectorAll("[data-username]").forEach(el => {
      el.textContent = user.name;
    });
  } else {
    // Chưa login
    if (authActions) authActions.style.display = "flex";
    if (userActions) userActions.style.display = "none";
    if (profileLink) profileLink.hidden = true;
    if (cartLink) cartLink.hidden = true;
  }
  updateCartCount();
}

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + " VND";
}

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(cartKey)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = readCart().length;
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = count;
  });
}

function renderCourses() {
  const list = document.querySelector("[data-course-list]");
  if (!list) return;

  list.innerHTML = demoCourses
    .map(
      (course) => `
        <article class="card">
          <span class="badge">${course.level}</span>
          <h3>${course.name}</h3>
          <p>${course.description || `Lịch học: ${course.schedule}. Học trực tiếp với giáo viên, có lộ trình rõ ràng và tài liệu đi kèm.`}</p>
          <div class="meta">
            <span class="price">${formatMoney(course.price)}</span>
            <div class="actions" style="gap: 8px;">
              <button class="btn btn-outline" data-open-course="${course.id}">Xem chi tiết</button>
              <button class="btn btn-primary" data-add-course="${course.id}">Thêm vào giỏ</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  list.querySelectorAll("[data-add-course]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.getAttribute("data-add-course"));
      const course = demoCourses.find((item) => item.id === id);
      if (!course) return;

      const cart = readCart();
      if (!cart.some((item) => item.id === course.id)) {
        cart.push(course);
        saveCart(cart);
      }
      button.textContent = "Đã thêm";
      button.disabled = true;
    });
  });

  list.querySelectorAll("[data-open-course]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.getAttribute("data-open-course"));
      openCourseDetail(id);
    });
  });
}

function openCourseDetail(courseId) {
  const modal = document.querySelector("[data-course-modal]");
  const course = courseCatalog[courseId];
  if (!modal || !course) return;

  modal.hidden = false;
  document.body.style.overflow = "hidden";

  const title = modal.querySelector("[data-course-title]");
  const level = modal.querySelector("[data-course-level]");
  const schedule = modal.querySelector("[data-course-schedule]");
  const description = modal.querySelector("[data-course-description]");
  const knowledgeList = modal.querySelector("[data-course-knowledge]");
  const videoList = modal.querySelector("[data-course-videos]");
  const exerciseList = modal.querySelector("[data-course-exercises]");

  if (title) title.textContent = course.name;
  if (level) level.textContent = course.level;
  if (schedule) schedule.textContent = course.schedule;
  if (description) description.textContent = course.description;
  if (knowledgeList) {
    knowledgeList.innerHTML = course.knowledge.map((item) => `<li>${item}</li>`).join("");
  }
  if (videoList) {
    videoList.innerHTML = course.videos.map((item) => `<li>${item}</li>`).join("");
  }
  if (exerciseList) {
    exerciseList.innerHTML = course.exercises.map((item) => `<li>${item}</li>`).join("");
  }
}

function closeCourseDetail() {
  const modal = document.querySelector("[data-course-modal]");
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = "";
}

function renderCart() {
  const list = document.querySelector("[data-cart-list]");
  const totalNode = document.querySelector("[data-cart-total]");
  if (!list || !totalNode) return;

  const cart = readCart();
  if (!cart.length) {
    list.innerHTML = '<div class="card"><h3>Giỏ hàng đang trống</h3><p>Hãy quay lại trang khóa học để chọn lớp phù hợp.</p></div>';
    totalNode.textContent = formatMoney(0);
    return;
  }

  list.innerHTML = cart
    .map(
      (course) => `
        <div class="item">
          <div>
            <h3 class="item-title">${course.name}</h3>
            <p>${course.level} • ${course.schedule}</p>
          </div>
          <strong class="price">${formatMoney(course.price)}</strong>
        </div>
      `
    )
    .join("");

  const total = cart.reduce((sum, course) => sum + course.price, 0);
  totalNode.textContent = formatMoney(total);
}

function handleAuthForms() {
  document.querySelectorAll("[data-auth-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = form.querySelector("[data-form-message]");

      // Kiểm tra xem form này là đăng nhập hay đăng ký
      const isLoginForm = form.closest("[data-login-panel]") !== null;

      if (isLoginForm) {
        // Lưu login info
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value : "user@email.com";
        const userData = {
          email: email,
          name: email.split("@")[0],
          loginTime: new Date().toISOString()
        };
        setLoginUser(userData);

        if (message) {
          message.textContent = "Đăng nhập thành công!";
        }
      } else {
        // Đăng ký - lưu và hiển thị thành công
        const nameInput = form.querySelector('input[type="text"]');
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value : "user@email.com";
        const name = nameInput ? nameInput.value : email.split("@")[0];

        const userData = {
          email: email,
          name: name,
          loginTime: new Date().toISOString()
        };
        setLoginUser(userData);

        if (message) {
          message.textContent = "Đăng ký và đăng nhập thành công!";
        }
      }

      form.reset();
    });
  });
}

function initAuthToggle() {
  const loginPanel = document.querySelector("[data-login-panel]");
  const registerPanel = document.querySelector("[data-register-panel]");
  const showRegister = document.querySelector("[data-show-register]");
  const showLogin = document.querySelector("[data-show-login]");

  if (!loginPanel || !registerPanel || !showRegister || !showLogin) return;

  const openRegister = () => {
    loginPanel.hidden = true;
    registerPanel.hidden = false;
  };

  const openLogin = () => {
    registerPanel.hidden = true;
    loginPanel.hidden = false;
  };

  showRegister.addEventListener("click", openRegister);
  showLogin.addEventListener("click", openLogin);
}

function initNavState() {
  const path = window.location.pathname.split("/").pop().toLowerCase();
  document.querySelectorAll(".nav a").forEach((link) => {
    const href = (link.getAttribute("href") || "").toLowerCase();
    if (href === path || (!path && href === "home.html") || (path === "" && href === "home.html")) {
      link.classList.add("active");
    }
  });
}

function getAdminUser() {
  try {
    return JSON.parse(localStorage.getItem("jsmartAdmin")) || null;
  } catch {
    return null;
  }
}

function loginAdmin(adminData) {
  localStorage.setItem("jsmartAdmin", JSON.stringify(adminData));
}

function logoutAdmin() {
  localStorage.removeItem("jsmartAdmin");
  window.location.href = "Home.html";
}

function initAdminNav() {
  const currentPage = window.location.pathname.split('/').pop().toLowerCase();
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
    const href = item.getAttribute('href') || '';
    if (href.toLowerCase().includes(currentPage)) {
      item.classList.add('active');
    }
  });
}

function initFloatingChatWidget() {
  const currentPage = window.location.pathname.split('/').pop().toLowerCase();
  if (currentPage === 'chatbot.html' || document.getElementById('jsmart-chat-widget')) {
    return;
  }

  if (!document.body) {
    return;
  }

  if (!document.getElementById('jsmart-chat-widget-style')) {
    const style = document.createElement('style');
    style.id = 'jsmart-chat-widget-style';
    style.textContent = `
      .jsmart-chat-launcher {
        position: fixed;
        right: 20px;
        bottom: 20px;
        width: 60px;
        height: 60px;
        border: 0;
        border-radius: 999px;
        background: linear-gradient(135deg, #0f766e, #1d9e96);
        color: #fff;
        box-shadow: 0 18px 40px rgba(15, 118, 110, 0.3);
        cursor: pointer;
        z-index: 9999;
        display: grid;
        place-items: center;
      }

      .jsmart-chat-launcher::before {
        content: '';
        position: absolute;
        inset: -8px;
        border-radius: inherit;
        border: 2px solid rgba(29, 158, 150, 0.35);
        animation: jsmartChatPulse 1.8s infinite;
      }

      .jsmart-chat-launcher span {
        position: relative;
        font-size: 26px;
        animation: jsmartChatBob 1.8s ease-in-out infinite;
      }

      .jsmart-chat-panel {
        position: fixed;
        right: 20px;
        bottom: 92px;
        width: min(380px, calc(100vw - 28px));
        height: min(560px, calc(100vh - 120px));
        background: rgba(255, 255, 255, 0.98);
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 24px;
        box-shadow: 0 30px 70px rgba(15, 23, 42, 0.18);
        overflow: hidden;
        z-index: 9998;
        display: flex;
        flex-direction: column;
        opacity: 0;
        transform: translateY(10px) scale(0.98);
        pointer-events: none;
        transition: opacity 0.22s ease, transform 0.22s ease;
      }

      .jsmart-chat-panel.is-open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      .jsmart-chat-header {
        padding: 14px 16px;
        background: linear-gradient(135deg, #0f766e, #1d9e96);
        color: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }

      .jsmart-chat-header strong { display: block; font-size: 0.98rem; }
      .jsmart-chat-header small { opacity: 0.9; }

      .jsmart-chat-close {
        width: 32px;
        height: 32px;
        border: 0;
        border-radius: 999px;
        background: rgba(255,255,255,0.18);
        color: #fff;
        font-size: 18px;
        cursor: pointer;
      }

      .jsmart-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: grid;
        gap: 12px;
        background: linear-gradient(rgba(244,247,251,.96), rgba(244,247,251,.96));
      }

      .jsmart-chat-message {
        max-width: 86%;
        padding: 12px 14px;
        border-radius: 16px;
        line-height: 1.65;
        font-size: 0.95rem;
      }

      .jsmart-chat-message.user {
        margin-left: auto;
        background: #0f766e;
        color: #fff;
        border-top-right-radius: 6px;
      }

      .jsmart-chat-message.bot {
        background: #fff;
        color: #0f172a;
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-top-left-radius: 6px;
      }

      .jsmart-chat-message h3,
      .jsmart-chat-message p { margin: 0 0 0.55em; }
      .jsmart-chat-message ul { margin: 0.45em 0 0.45em 1.2em; }

      .jsmart-chat-composer {
        border-top: 1px solid rgba(15, 23, 42, 0.08);
        padding: 12px;
        background: #fff;
      }

      .jsmart-chat-quick {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 10px;
      }

      .jsmart-chat-chip {
        border: 1px solid rgba(15, 118, 110, 0.16);
        background: rgba(15, 118, 110, 0.06);
        color: #0f766e;
        border-radius: 999px;
        padding: 8px 10px;
        cursor: pointer;
        font-size: 0.85rem;
      }

      .jsmart-chat-input {
        width: 100%;
        min-height: 72px;
        border: 1px solid rgba(15, 23, 42, 0.12);
        border-radius: 14px;
        padding: 12px;
        resize: vertical;
        font: inherit;
      }

      .jsmart-chat-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
      }

      .jsmart-chat-send {
        flex: 1;
        border: 0;
        border-radius: 14px;
        background: linear-gradient(135deg, #0f766e, #1d9e96);
        color: #fff;
        padding: 12px 14px;
        font-weight: 700;
        cursor: pointer;
      }

      .jsmart-chat-send:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .jsmart-chat-typing {
        display: inline-flex;
        gap: 6px;
        align-items: center;
      }

      .jsmart-chat-typing span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #0f766e;
        animation: jsmartChatBounce 0.9s infinite ease-in-out;
      }

      .jsmart-chat-typing span:nth-child(2) { animation-delay: 0.12s; }
      .jsmart-chat-typing span:nth-child(3) { animation-delay: 0.24s; }

      @keyframes jsmartChatPulse {
        0% { transform: scale(0.94); opacity: 0.8; }
        70% { transform: scale(1.15); opacity: 0; }
        100% { transform: scale(1.15); opacity: 0; }
      }

      @keyframes jsmartChatBob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-1px); }
      }

      @keyframes jsmartChatBounce {
        0%, 80%, 100% { transform: scale(0.7); opacity: 0.45; }
        40% { transform: scale(1); opacity: 1; }
      }

      @media (max-width: 640px) {
        .jsmart-chat-panel {
          right: 12px;
          left: 12px;
          bottom: 86px;
          width: auto;
          height: min(72vh, 560px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  const widget = document.createElement('div');
  widget.id = 'jsmart-chat-widget';
  widget.innerHTML = `
    <button type="button" class="jsmart-chat-launcher" aria-label="Mở chatbot JSMART" title="Mở chatbot JSMART"><span>💬</span></button>
    <section class="jsmart-chat-panel" aria-hidden="true">
      <div class="jsmart-chat-header">
        <div>
          <strong>JSMART Sensei AI</strong>
          <small>Hỏi ngữ pháp, Kanji, từ vựng và phân tích câu</small>
        </div>
        <button type="button" class="jsmart-chat-close" aria-label="Đóng chatbot">×</button>
      </div>
      <div class="jsmart-chat-messages"></div>
      <div class="jsmart-chat-composer">
        <div class="jsmart-chat-quick">
          <button type="button" class="jsmart-chat-chip" data-prompt="Giải thích ngữ pháp 〜ように và cho 2 ví dụ">〜ように</button>
          <button type="button" class="jsmart-chat-chip" data-prompt="Phân tích câu: 日本へ行くために日本語を勉強しています。">Phân tích câu</button>
          <button type="button" class="jsmart-chat-chip" data-prompt="Giải thích từ vựng 勉強, gồm nghĩa, cách đọc, ví dụ và sắc thái">Từ vựng 勉強</button>
        </div>
        <textarea class="jsmart-chat-input" rows="3" placeholder="Nhập câu hỏi bằng tiếng Việt hoặc tiếng Nhật..."></textarea>
        <div class="jsmart-chat-actions">
          <button type="button" class="jsmart-chat-send">Gửi</button>
        </div>
      </div>
    </section>
  `;
  document.body.appendChild(widget);

  const launcher = widget.querySelector('.jsmart-chat-launcher');
  const panel = widget.querySelector('.jsmart-chat-panel');
  const closeButton = widget.querySelector('.jsmart-chat-close');
  const messages = widget.querySelector('.jsmart-chat-messages');
  const input = widget.querySelector('.jsmart-chat-input');
  const sendButton = widget.querySelector('.jsmart-chat-send');
  const promptButtons = widget.querySelectorAll('[data-prompt]');
  const history = [];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function markdownToHtml(markdown) {
    const escaped = escapeHtml(markdown);
    const lines = escaped.split(/\r?\n/);
    let html = '';
    let inList = false;

    const flushList = () => {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList();
        continue;
      }
      if (trimmed.startsWith('### ')) {
        flushList();
        html += `<h3>${trimmed.slice(4)}</h3>`;
        continue;
      }
      if (trimmed.startsWith('## ')) {
        flushList();
        html += `<h2>${trimmed.slice(3)}</h2>`;
        continue;
      }
      if (trimmed.startsWith('# ')) {
        flushList();
        html += `<h1>${trimmed.slice(2)}</h1>`;
        continue;
      }
      if (trimmed.startsWith('- ')) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${trimmed.slice(2)}</li>`;
        continue;
      }
      flushList();
      html += `<p>${trimmed}</p>`;
    }

    flushList();
    return html
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code>$1</code>');
  }

  function appendMessage(role, content, isMarkdown = false) {
    const wrapper = document.createElement('div');
    wrapper.className = `jsmart-chat-message ${role}`;
    wrapper.innerHTML = isMarkdown ? markdownToHtml(content) : `<p>${escapeHtml(content).replace(/\n/g, '<br>')}</p>`;
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  }

  function appendTyping() {
    const el = document.createElement('div');
    el.className = 'jsmart-chat-message bot';
    el.innerHTML = '<div class="jsmart-chat-typing"><span></span><span></span><span></span></div>';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function renderWelcome() {
    messages.innerHTML = `
      <div class="jsmart-chat-message bot">
        <h3>Xin chào, mình là JSMART Sensei AI.</h3>
        <p>Bạn có thể hỏi:</p>
        <ul>
          <li>「〜ように」 và 「〜ために」 khác nhau thế nào?</li>
          <li>Giải thích câu: <strong>日本へ行くために日本語を勉強しています。</strong></li>
          <li>Kanji 「勉強」 có nghĩa gì, cách nhớ ra sao?</li>
        </ul>
      </div>
    `;
  }

  async function sendMessage(rawText) {
    const text = rawText.trim();
    if (!text) return;

    appendMessage('user', text);
    history.push({ role: 'user', content: text });
    input.value = '';
    sendButton.disabled = true;

    const typing = appendTyping();

    try {
      const response = await fetch(CHATBOT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          mode: 'general',
          history: history.slice(-8),
        }),
      });

      const data = await response.json();
      typing.remove();

      if (!response.ok) {
        const errorMessage = data.error || 'Không thể tạo phản hồi lúc này.';
        appendMessage('bot', `**Lỗi:** ${errorMessage}`);
        return;
      }

      const reply = data.reply || 'Không nhận được phản hồi từ Gemini.';
      appendMessage('bot', reply, true);
      history.push({ role: 'assistant', content: reply });
    } catch (error) {
      typing.remove();
      appendMessage('bot', `**Lỗi kết nối:** ${error.message}`);
    } finally {
      sendButton.disabled = false;
    }
  }

  launcher.addEventListener('click', () => {
    panel.classList.toggle('is-open');
    panel.setAttribute('aria-hidden', String(!panel.classList.contains('is-open')));
    if (panel.classList.contains('is-open')) {
      input.focus();
    }
  });

  closeButton.addEventListener('click', () => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
  });

  sendButton.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input.value);
    }
  });

  promptButtons.forEach((button) => {
    button.addEventListener('click', () => {
      input.value = button.getAttribute('data-prompt') || '';
      input.focus();
    });
  });

  renderWelcome();
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCourses();
  renderCart();
  handleAuthForms();
  initAuthToggle();
  initNavState();
  updateUIBasedOnLogin();
  initFloatingChatWidget();

  const clearCartButton = document.querySelector("[data-clear-cart]");
  if (clearCartButton) {
    clearCartButton.addEventListener("click", () => {
      saveCart([]);
      renderCart();
    });
  }

  const logoutButton = document.querySelector("[data-logout-btn]");
  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }

  // Admin System
  const adminKey = "jsmartAdmin";

  function getAdminUser() {
    try {
      return JSON.parse(localStorage.getItem(adminKey)) || null;
    } catch {
      return null;
    }
  }

  function loginAdmin(adminData) {
    localStorage.setItem(adminKey, JSON.stringify(adminData));
  }

  function logoutAdmin() {
    localStorage.removeItem(adminKey);
    window.location.href = "Home.html";
  }

  function initAdminNav() {
    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
      const href = item.getAttribute('href') || '';
      if (href.toLowerCase().includes(currentPage)) {
        item.classList.add('active');
      }
    });
  }
});
