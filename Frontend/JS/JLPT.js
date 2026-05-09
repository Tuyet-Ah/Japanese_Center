document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const userSection = document.getElementById('user-section');
    const quizListContainer = document.querySelector('.test-list');
    const levelItems = document.querySelectorAll('.level-item');

    if (user && user.username && userSection) {
        userSection.innerHTML = `
            <a href="User.html" class="user-profile">
                <i class="fa-solid fa-user-circle"></i>
                <span>${user.username}</span>
            </a>
        `;
    }

    function fetchAndRenderQuizzes(level = 'all') {
        let url = 'http://127.0.0.1:8000/educations/quizzes/?quiz_type=final_exam'; // Chỉ lấy final exam
        if (level !== 'all') {
            url += `&level=${level}`;
        }

        fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => response.json())
            .then(quizzes => {
                quizListContainer.innerHTML = '';
                if (quizzes && quizzes.length > 0) {
                    quizzes.forEach(quiz => {
                        const quizItem = document.createElement('div');
                        quizItem.classList.add('test-item');
                        quizItem.innerHTML = `
                        <div class="test-info">
                            <h4>${quiz.title}</h4>
                            <p>Trình độ: ${quiz.level} | Thời gian: ${quiz.duration} phút</p>
                        </div>
                        <a href="Exam.html?quiz_id=${quiz.id}" class="btn-detail">Chi tiết</a>
                    `;
                        quizListContainer.appendChild(quizItem);
                    });
                } else {
                    quizListContainer.innerHTML = '<p>Không có bài thi nào cho trình độ này.</p>';
                }
            })
            .catch(error => {
                console.error('Lỗi khi tải danh sách bài thi:', error);
                quizListContainer.innerHTML = '<p>Lỗi tải danh sách bài thi.</p>';
            });
    }

    // Xử lý sự kiện click trên thanh lọc trình độ
    levelItems.forEach(item => {
        item.addEventListener('click', function () {
            levelItems.forEach(li => li.classList.remove('active'));
            this.classList.add('active');
            const selectedLevel = this.getAttribute('data-level');
            fetchAndRenderQuizzes(selectedLevel);
        });
    });

    // Tải tất cả bài thi khi trang được load lần đầu
    fetchAndRenderQuizzes();
});