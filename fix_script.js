const fs = require('fs');

const fileContent = fs.readFileSync('Frontend/JS/script.js', 'utf8');

const replacement = `function initFloatingChatWidget() {
  const currentPage = window.location.pathname.split('/').pop().toLowerCase();
  if (currentPage === 'chatbot.html' || document.getElementById('jsmart-chat-widget')) {
    return;
  }
  if (!document.body) {
    return;
  }
  if (!document.getElementById('jsmart-chat-widget-style')) {
    // Ensure Inter font is loaded for the chatbot
    if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Inter"]')) {
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Noto+Sans+Vietnamese:wght@400;500;700&display=swap';
      document.head.appendChild(fontLink);
    }
    const style = document.createElement('style');
    style.id = 'jsmart-chat-widget-style';
    style.textContent = \\\`
      .jsmart-chat-launcher { position:fixed;right:20px;bottom:20px;width:60px;height:60px;border:0;border-radius:999px;background:linear-gradient(135deg,#0f766e,#1d9e96);color:#fff;box-shadow:0 18px 40px rgba(15,118,110,0.3);cursor:pointer;z-index:9999;display:grid;place-items:center; }
      .jsmart-chat-launcher::before { content:'';position:absolute;inset:-8px;border-radius:inherit;border:2px solid rgba(29,158,150,0.35);animation:jsmartChatPulse 1.8s infinite; }
      .jsmart-chat-launcher span { position:relative;font-size:26px;animation:jsmartChatBob 1.8s ease-in-out infinite; }
      .jsmart-chat-panel { position:fixed;right:20px;bottom:92px;width:min(380px,calc(100vw - 28px));height:min(560px,calc(100vh - 120px));background:rgba(255,255,255,0.98);border:1px solid rgba(15,23,42,0.08);border-radius:24px;box-shadow:0 30px 70px rgba(15,23,42,0.18);overflow:hidden;z-index:9998;display:flex;flex-direction:column;opacity:0;transform:translateY(10px) scale(0.98);pointer-events:none;transition:opacity 0.22s ease,transform 0.22s ease;font-family:"Inter", "Noto Sans Vietnamese", -apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,sans-serif; }
      .jsmart-chat-panel.is-open { opacity:1;transform:translateY(0) scale(1);pointer-events:auto; }
      .jsmart-chat-header { padding:14px 16px;background:linear-gradient(135deg,#0f766e,#1d9e96);color:#fff;display:flex;justify-content:space-between;align-items:center;gap:12px; }
      .jsmart-chat-header strong { display:block;font-size:0.98rem; }
      .jsmart-chat-header small { opacity:0.9; }
      .jsmart-chat-close { width:32px;height:32px;border:0;border-radius:999px;background:rgba(255,255,255,0.18);color:#fff;font-size:18px;cursor:pointer; }
      .jsmart-chat-messages { flex:1;overflow-y:auto;padding:16px;display:grid;gap:12px;background:linear-gradient(rgba(244,247,251,.96),rgba(244,247,251,.96)); }
      .jsmart-chat-message { max-width:86%;padding:12px 14px;border-radius:16px;line-height:1.65;font-size:0.95rem; }
      .jsmart-chat-message.user { margin-left:auto;background:#0f766e;color:#fff;border-top-right-radius:6px; }
      .jsmart-chat-message.bot { background:#fff;color:#0f172a;border:1px solid rgba(15,23,42,0.08);border-top-left-radius:6px; }
      .jsmart-chat-message h3,.jsmart-chat-message p { margin:0 0 0.55em; }
      .jsmart-chat-message ul { margin:0.45em 0 0.45em 1.2em; }
      .jsmart-chat-composer { border-top:1px solid rgba(15,23,42,0.08);padding:12px;background:#fff; }
      .jsmart-chat-quick { display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px; }
      .jsmart-chat-chip { border:1px solid rgba(15,118,110,0.16);background:rgba(15,118,110,0.06);color:#0f766e;border-radius:999px;padding:8px 10px;cursor:pointer;font-size:0.85rem; }
      .jsmart-chat-input { width:100%;min-height:72px;border:1px solid rgba(15,23,42,0.12);border-radius:14px;padding:12px;resize:vertical;font:inherit; }
      .jsmart-chat-actions { display:flex;gap:10px;margin-top:10px; }
      .jsmart-chat-send { flex:1;border:0;border-radius:14px;background:linear-gradient(135deg,#0f766e,#1d9e96);color:#fff;padding:12px 14px;font-weight:700;cursor:pointer; }
      .jsmart-chat-send:disabled { opacity:0.7;cursor:not-allowed; }
      .jsmart-chat-typing { display:inline-flex;gap:6px;align-items:center; }
      .jsmart-chat-typing span { width:8px;height:8px;border-radius:50%;background:#0f766e;animation:jsmartChatBounce 0.9s infinite ease-in-out; }
      .jsmart-chat-typing span:nth-child(2) { animation-delay:0.12s; }
      .jsmart-chat-typing span:nth-child(3) { animation-delay:0.24s; }
      @keyframes jsmartChatPulse { 0%{transform:scale(0.94);opacity:0.8}70%{transform:scale(1.15);opacity:0}100%{transform:scale(1.15);opacity:0} }
      @keyframes jsmartChatBob { 0%,100%{transform:translateY(0)}50%{transform:translateY(-1px)} }
      @keyframes jsmartChatBounce { 0%,80%,100%{transform:scale(0.7);opacity:0.45}40%{transform:scale(1);opacity:1} }
      @media(max-width:640px){.jsmart-chat-panel{right:12px;left:12px;bottom:86px;width:auto;height:min(72vh,560px);}}
    \\\`;
    document.head.appendChild(style);
  }

  const widget = document.createElement('div');
  widget.id = 'jsmart-chat-widget';
  widget.innerHTML = \\\`
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
  \\\`;
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
    return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function markdownToHtml(markdown) {
    const escaped = escapeHtml(markdown);
    const lines = escaped.split(/\\r?\\n/);
    let html = '';
    let inList = false;
    const flushList = () => { if (inList) { html += '</ul>'; inList = false; } };
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) { flushList(); continue; }
      if (trimmed.startsWith('### ')) { flushList(); html += '<h3>' + trimmed.slice(4) + '</h3>'; continue; }
      if (trimmed.startsWith('## ')) { flushList(); html += '<h2>' + trimmed.slice(3) + '</h2>'; continue; }
      if (trimmed.startsWith('# ')) { flushList(); html += '<h1>' + trimmed.slice(2) + '</h1>'; continue; }
      if (trimmed.startsWith('- ')) { if (!inList) { html += '<ul>'; inList = true; } html += '<li>' + trimmed.slice(2) + '</li>'; continue; }
      flushList();
      html += '<p>' + trimmed + '</p>';
    }
    flushList();
    return html.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>').replace(/\\\`(.+?)\\\`/g, '<code>$1</code>');
  }

  function appendMessage(role, content, isMarkdown) {
    const wrapper = document.createElement('div');
    wrapper.className = 'jsmart-chat-message ' + role;
    wrapper.innerHTML = isMarkdown ? markdownToHtml(content) : '<p>' + escapeHtml(content).replace(/\\n/g, '<br>') + '</p>';
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
    messages.innerHTML = '<div class="jsmart-chat-message bot"><h3>Xin chào, mình là JSMART Sensei AI.</h3><p>Bạn có thể hỏi:</p><ul><li>「〜ように」 và 「〜ために」 khác nhau thế nào?</li><li>Giải thích câu: <strong>日本へ行くために日本語を勉強しています。</strong></li><li>Kanji 「勉強」 có nghĩa gì, cách nhớ ra sao?</li></ul></div>';
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
        body: JSON.stringify({ message: text, mode: 'general', history: history.slice(-8) })
      });
      const data = await response.json();
      typing.remove();
      if (!response.ok) {
        appendMessage('bot', '**Lỗi:** ' + (data.error || 'Không thể tạo phản hồi lúc này.'));
        return;
      }
      const reply = data.reply || 'Không nhận được phản hồi từ Gemini.';
      appendMessage('bot', reply, true);
      history.push({ role: 'assistant', content: reply });
    } catch (error) {
      typing.remove();
      appendMessage('bot', '**Lỗi kết nối:** ' + error.message);
    } finally {
      sendButton.disabled = false;
    }
  }

  launcher.addEventListener('click', () => {
    panel.classList.toggle('is-open');
    panel.setAttribute('aria-hidden', String(!panel.classList.contains('is-open')));
    if (panel.classList.contains('is-open')) { input.focus(); }
  });
  closeButton.addEventListener('click', () => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
  });
  sendButton.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(input.value); }
  });
  promptButtons.forEach((button) => {
    button.addEventListener('click', () => { input.value = button.getAttribute('data-prompt') || ''; input.focus(); });
  });
  renderWelcome();
}`;

const startIndex = fileContent.indexOf('function initFloatingChatWidget() {');
const endIndex = fileContent.indexOf('function initStandardHeader() {');

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = fileContent.substring(0, startIndex) + replacement + '\n\n' + fileContent.substring(endIndex);
  fs.writeFileSync('Frontend/JS/script.js', newContent, 'utf8');
  console.log('Successfully updated the function.');
} else {
  console.log('Could not find start or end index.');
}
