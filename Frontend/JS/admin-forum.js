let currentTab = "pending";
let topicsList = [];

const CATEGORIES = {
      grammar: { label: "Ngữ pháp & Từ vựng" },
      kanji: { label: "Kanji" },
      jlpt: { label: "JLPT & Luyện thi" },
      share: { label: "Chia sẻ kinh nghiệm" },
      find: { label: "Tìm bạn luyện tập" },
      qa: { label: "Hỏi đáp khóa học" },
      material: { label: "Tài liệu & Sách" },
      other: { label: "Khác" }
};

async function fetchAdminTopics() {
    const tokens = getAuthTokens();
    if (!tokens) {
        window.location.href = "login.html";
        return;
    }

    try {
        let pending = [];
        let approved = [];
        
        // Fetch pending
        const resPending = await fetch(`${API_BASE_URL}/admin-forum-approvals/`, {
            headers: { "Authorization": `Bearer ${tokens.access}` }
        });
        if (resPending.ok) {
            pending = await resPending.json();
        }

        // Fetch approved
        const resApproved = await fetch(`${API_BASE_URL}/forum/topics/`);
        if (resApproved.ok) {
            approved = await resApproved.json();
        }

        topicsList = {
            pending: pending,
            approved: approved,
            rejected: [] // The API deletes rejected, so we just have 0
        };

        updateTabCounts();
        renderAdminTopics();
    } catch (error) {
        console.error("Error fetching topics:", error);
    }
}

function updateTabCounts() {
    document.querySelector('.tab-btn[data-tab="pending"]').textContent = `Chờ Duyệt (${topicsList.pending.length})`;
    document.querySelector('.tab-btn[data-tab="approved"]').textContent = `Đã Duyệt (${topicsList.approved.length})`;
    document.querySelector('.tab-btn[data-tab="rejected"]').textContent = `Đã Từ Chối (0)`;
    document.querySelector('.header-info').textContent = `Chờ duyệt: ${topicsList.pending.length} chủ đề`;
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

function renderAdminTopics() {
    const container = document.querySelector('.forum-list');
    const topics = topicsList[currentTab] || [];

    if (topics.length === 0) {
        container.innerHTML = `<div class="forum-empty"><p style="text-align:center; padding: 20px;">Không có chủ đề nào.</p></div>`;
        return;
    }

    container.innerHTML = topics.map(topic => {
        const catLabel = CATEGORIES[topic.category]?.label || "Khác";
        const badge = currentTab === 'pending' ? '<div class="forum-badge">⏳ Chờ Duyệt</div>' : '<div class="forum-badge" style="background:#10b981">✅ Đã Duyệt</div>';
        
        let actionsHtml = '';
        if (currentTab === 'pending') {
            actionsHtml = `
                <button class="btn btn-success" onclick="forumAction('approve', ${topic.id})">✅ Duyệt</button>
                <button class="btn btn-danger" onclick="forumAction('reject', ${topic.id})">❌ Từ Chối</button>
            `;
        } else if (currentTab === 'approved') {
            actionsHtml = `
                <button class="btn btn-danger" onclick="forumAction('reject', ${topic.id})">❌ Xóa</button>
            `;
        }

        return `
            <div class="forum-item ${currentTab === 'pending' ? 'forum-pending' : ''}">
                <div class="forum-header">
                    ${badge}
                    <span class="forum-date">${timeAgo(topic.created_at)}</span>
                </div>
                <div class="forum-content">
                    <h3>${escapeHtml(topic.title)}</h3>
                    <p class="forum-meta">
                        <strong>Tác giả:</strong> ${escapeHtml(topic.user_name || 'Người dùng')}<br>
                        <strong>Danh mục:</strong> ${escapeHtml(catLabel)}
                    </p>
                    <div class="forum-preview">
                        <p>${escapeHtml(topic.content).substring(0, 150)}...</p>
                    </div>
                    <div class="forum-actions">
                        ${actionsHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function forumAction(action, topicId) {
    const tokens = getAuthTokens();
    if (!tokens) return;

    try {
        if (action === "approve") {
            const res = await fetch(`${API_BASE_URL}/admin-forum-approvals/${topicId}/`, {
                method: 'POST',
                headers: { "Authorization": `Bearer ${tokens.access}` }
            });
            if (res.ok) {
                alert(`✅ Đã duyệt topic thành công!`);
                fetchAdminTopics();
            } else {
                alert(`❌ Có lỗi xảy ra khi duyệt.`);
            }
        } else if (action === "reject") {
            if (confirm(`Bạn chắc chắn muốn từ chối/xóa topic này?`)) {
                const res = await fetch(`${API_BASE_URL}/admin-forum-approvals/${topicId}/`, {
                    method: 'DELETE',
                    headers: { "Authorization": `Bearer ${tokens.access}` }
                });
                if (res.ok) {
                    alert(`❌ Đã xóa/từ chối topic thành công.`);
                    fetchAdminTopics();
                } else {
                    alert(`❌ Có lỗi xảy ra khi xóa.`);
                }
            }
        }
    } catch(err) {
        console.error(err);
        alert('Lỗi kết nối tới máy chủ');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initAdminShell();

    document.querySelectorAll(".tab-btn").forEach((button) => {
        button.addEventListener("click", function () {
            document.querySelectorAll(".tab-btn").forEach((item) => item.classList.remove("active"));
            this.classList.add("active");
            currentTab = this.getAttribute("data-tab");
            renderAdminTopics();
        });
    });

    fetchAdminTopics();
});