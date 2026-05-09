document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const urlParams = new URLSearchParams(window.location.search);
    const submissionId = urlParams.get('submission_id');

    if (!token) {
        alert('Bạn cần đăng nhập để xem kết quả.');
        window.location.href = 'Login.html';
        return;
    }
    if (!submissionId) {
        alert('Không tìm thấy ID bài nộp.');
        window.location.href = 'JLPT.html'; // Hoặc trang lịch sử thi
        return;
    }

    // DOM Elements
    const scoreEl = document.getElementById('score');
    const correctAnswersEl = document.getElementById('correct-answers');
    const totalQuestionsEl = document.getElementById('total-questions');
    const reviewContainer = document.getElementById('review-container');

    // Lấy dữ liệu từ API review
    fetch(`http://127.0.0.1:8000/educations/quizzes/${submissionId}/review/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(response => response.json())
        .then(data => {
            // Hiển thị điểm số tổng quan
            scoreEl.textContent = data.score;
            correctAnswersEl.textContent = data.correct_answers_count;
            totalQuestionsEl.textContent = data.total_questions;

            // Hiển thị chi tiết từng câu hỏi
            renderReviewDetails(data.results);
        })
        .catch(error => {
            console.error('Lỗi khi tải kết quả chi tiết:', error);
            reviewContainer.innerHTML = '<p>Không thể tải chi tiết bài làm. Vui lòng thử lại.</p>';
        });

    function renderReviewDetails(results) {
        reviewContainer.innerHTML = '';
        results.forEach((result, index) => {
            const question = result.question;
            const questionEl = document.createElement('div');
            questionEl.classList.add('question-review');
            if (result.is_correct) {
                questionEl.classList.add('correct');
            } else {
                questionEl.classList.add('incorrect');
            }

            let optionsHtml = Object.entries(question.options).map(([key, value]) => {
                let className = '';
                if (key === result.selected_option) {
                    className = result.is_correct ? 'user-correct' : 'user-incorrect';
                } else if (key === question.correct_option) {
                    className = 'actual-correct';
                }
                return `<li class="${className}">${key}. ${value}</li>`;
            }).join('');

            questionEl.innerHTML = `
                <h4>Câu ${index + 1}: ${question.text}</h4>
                <ul>${optionsHtml}</ul>
                <p>Bạn đã chọn: ${result.selected_option || 'Không trả lời'}. Đáp án đúng: ${question.correct_option}</p>
            `;
            reviewContainer.appendChild(questionEl);
        });
    }

    // Navigation buttons
    const btnProfile = document.getElementById('btn-profile');
    if (btnProfile) {
        btnProfile.addEventListener('click', () => window.location.href = 'User.html');
    }
    const btnCourses = document.getElementById('btn-courses');
    if (btnCourses) {
        btnCourses.addEventListener('click', () => window.location.href = 'Course.html');
    }
    const btnLogout = document.querySelector('.logout-btn');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'Home.html';
            }
        });
    }
});