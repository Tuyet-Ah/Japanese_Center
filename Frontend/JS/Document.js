document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Bạn cần đăng nhập để xem diễn đàn.');
        window.location.href = 'Login.html';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const userSection = document.getElementById('user-section');
    if (user && user.username && userSection) {
        userSection.innerHTML = `
            <a href="User.html" class="user-profile">
                <i class="fa-solid fa-user-circle"></i>
                <span>${user.username}</span>
            </a>
        `;
    }

    const forumList = document.querySelector('.forum-list');
    const topicForm = document.getElementById('new-topic-form');
    const topicDetail = document.querySelector('.topic-detail');
    const responseForm = document.getElementById('new-response-form');
    const backToListBtn = document.getElementById('back-to-list');

    // Hiển thị danh sách topics
    function fetchAndRenderTopics() {
        fetch('http://127.0.0.1:8000/educations/forum/topics/', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => response.json())
            .then(topics => {
                forumList.innerHTML = '';
                topics.forEach(topic => {
                    const topicEl = document.createElement('div');
                    topicEl.classList.add('forum-topic-item');
                    topicEl.dataset.topicId = topic.id;
                    topicEl.innerHTML = `
                    <h4>${topic.title}</h4>
                    <p>bởi ${topic.author.username} - ${new Date(topic.created_at).toLocaleString()}</p>
                `;
                    forumList.appendChild(topicEl);
                });
                showView('list');
            })
            .catch(error => console.error('Lỗi khi tải topics:', error));
    }

    // Hiển thị chi tiết topic và các phản hồi
    function fetchAndRenderTopicDetail(topicId) {
        // Lấy thông tin topic
        const topicInfoPromise = fetch(`http://127.0.0.1:8000/educations/forum/topics/${topicId}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());

        // Lấy các phản hồi
        const responsesPromise = fetch(`http://127.0.0.1:8000/educations/forum/topics/${topicId}/response/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());

        Promise.all([topicInfoPromise, responsesPromise])
            .then(([topic, responses]) => {
                document.getElementById('topic-title-detail').textContent = topic.title;
                document.getElementById('topic-content-detail').textContent = topic.content;
                document.getElementById('topic-author-detail').textContent = `Đăng bởi: ${topic.author.username}`;

                const responsesList = document.querySelector('.responses-list');
                responsesList.innerHTML = '';
                responses.forEach(response => {
                    const responseEl = document.createElement('div');
                    responseEl.classList.add('response-item');
                    responseEl.innerHTML = `
                    <p><strong>${response.author.username}:</strong> ${response.content}</p>
                    <span>${new Date(response.created_at).toLocaleString()}</span>
                `;
                    responsesList.appendChild(responseEl);
                });
                responseForm.dataset.topicId = topicId;
                showView('detail');
            })
            .catch(error => console.error('Lỗi khi tải chi tiết topic:', error));
    }

    // Tạo topic mới
    topicForm.addEventListener('submit', e => {
        e.preventDefault();
        const title = document.getElementById('new-topic-title').value;
        const content = document.getElementById('new-topic-content').value;
        fetch('http://127.0.0.1:8000/educations/forum/topics/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        })
            .then(response => {
                if (response.ok) {
                    topicForm.reset();
                    fetchAndRenderTopics();
                } else {
                    alert('Tạo chủ đề thất bại.');
                }
            })
            .catch(error => console.error('Lỗi khi tạo topic:', error));
    });

    // Gửi phản hồi mới
    responseForm.addEventListener('submit', e => {
        e.preventDefault();
        const topicId = responseForm.dataset.topicId;
        const content = document.getElementById('new-response-content').value;
        fetch(`http://127.0.0.1:8000/educations/forum/topics/${topicId}/reply/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        })
            .then(response => {
                if (response.ok) {
                    document.getElementById('new-response-content').value = '';
                    fetchAndRenderTopicDetail(topicId); // Tải lại chi tiết
                } else {
                    alert('Gửi phản hồi thất bại.');
                }
            })
            .catch(error => console.error('Lỗi khi gửi response:', error));
    });

    // Chuyển đổi view
    function showView(viewName) {
        if (viewName === 'list') {
            document.querySelector('.forum-list-container').style.display = 'block';
            topicDetail.style.display = 'none';
        } else {
            document.querySelector('.forum-list-container').style.display = 'none';
            topicDetail.style.display = 'block';
        }
    }

    // Event delegation để click vào topic
    forumList.addEventListener('click', e => {
        const topicItem = e.target.closest('.forum-topic-item');
        if (topicItem) {
            const topicId = topicItem.dataset.topicId;
            fetchAndRenderTopicDetail(topicId);
        }
    });

    // Nút quay lại
    backToListBtn.addEventListener('click', () => {
        fetchAndRenderTopics();
    });

    // Tải danh sách topics ban đầu
    fetchAndRenderTopics();
});