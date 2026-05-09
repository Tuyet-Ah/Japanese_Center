document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course_id');
    const lessonId = urlParams.get('lesson_id'); // Có thể có hoặc không

    if (!token) {
        alert('Bạn cần đăng nhập để học.');
        window.location.href = 'Login.html';
        return;
    }
    if (!courseId) {
        alert('Không tìm thấy ID khóa học.');
        window.location.href = 'Course.html';
        return;
    }

    // DOM Elements
    const courseTitleEl = document.getElementById('course-title');
    const lessonTitleEl = document.getElementById('lesson-title');
    const lessonContentEl = document.getElementById('lesson-content');
    const chapterListEl = document.querySelector('.chapter-list');
    const commentsContainer = document.querySelector('.comments-list');
    const commentForm = document.getElementById('comment-form');
    const noteTextarea = document.getElementById('personal-note');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const markCompleteBtn = document.getElementById('mark-complete-btn');
    const userSection = document.getElementById('user-section');

    // Fetch Course Details (để lấy cấu trúc chương và bài học)
    fetch(`http://127.0.0.1:8000/educations/courses/${courseId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(response => response.json())
        .then(course => {
            courseTitleEl.textContent = course.title;
            renderChapters(course.chapters);

            // Nếu không có lesson_id trong URL, mặc định mở bài học đầu tiên
            let targetLessonId = lessonId;
            if (!targetLessonId && course.chapters && course.chapters.length > 0 && course.chapters[0].lessons && course.chapters[0].lessons.length > 0) {
                targetLessonId = course.chapters[0].lessons[0].id;
            }

            if (targetLessonId) {
                fetchLessonDetails(targetLessonId);
            } else {
                lessonTitleEl.textContent = "Khóa học chưa có bài giảng";
                lessonContentEl.innerHTML = "<p>Vui lòng quay lại sau.</p>";
            }
        })
        .catch(error => console.error('Lỗi khi tải chi tiết khóa học:', error));

    function renderChapters(chapters) {
        chapterListEl.innerHTML = '';
        chapters.forEach(chapter => {
            const chapterEl = document.createElement('div');
            chapterEl.classList.add('chapter');
            let lessonsHtml = chapter.lessons.map(lesson =>
                `<li><a href="LearnOn.html?course_id=${courseId}&lesson_id=${lesson.id}" class="${lesson.id == (lessonId || -1) ? 'active' : ''}">${lesson.title}</a></li>`
            ).join('');

            chapterEl.innerHTML = `
                <h4 class="chapter-title">${chapter.title}</h4>
                <ul class="lesson-list">${lessonsHtml}</ul>
            `;
            chapterListEl.appendChild(chapterEl);
        });
    }

    // Fetch Lesson Details
    function fetchLessonDetails(currentLessonId) {
        fetch(`http://127.0.0.1:8000/educations/lessons/${currentLessonId}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => response.json())
            .then(lesson => {
                lessonTitleEl.textContent = lesson.title;
                // Giả sử content là HTML, nếu là text thuần thì dùng .textContent
                lessonContentEl.innerHTML = lesson.content;

                // Fetch comments và notes cho bài học này
                fetchComments(currentLessonId);
                fetchNote(currentLessonId);

                // Cập nhật trạng thái nút "Hoàn thành"
                markCompleteBtn.dataset.lessonId = currentLessonId;
                if (lesson.is_completed) {
                    markCompleteBtn.textContent = "Đã hoàn thành";
                    markCompleteBtn.disabled = true;
                } else {
                    markCompleteBtn.textContent = "Đánh dấu đã hoàn thành";
                    markCompleteBtn.disabled = false;
                }
            })
            .catch(error => console.error('Lỗi khi tải bài học:', error));
    }

    // Fetch Comments
    function fetchComments(lessonIdForComment) {
        fetch(`http://127.0.0.1:8000/educations/lessons/${lessonIdForComment}/comments/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => response.json())
            .then(comments => renderComments(comments))
            .catch(error => console.error('Lỗi khi tải bình luận:', error));
    }

    function renderComments(comments) {
        commentsContainer.innerHTML = '';
        if (comments && comments.length > 0) {
            comments.forEach(comment => {
                const commentEl = document.createElement('div');
                commentEl.classList.add('comment');
                commentEl.innerHTML = `
                    <p><strong>${comment.user.username}</strong>: ${comment.content}</p>
                `;
                commentsContainer.appendChild(commentEl);
            });
        } else {
            commentsContainer.innerHTML = '<p>Chưa có bình luận nào.</p>';
        }
    }

    // Post a new comment
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = document.getElementById('comment-text').value;
        const currentLessonId = lessonId || (new URLSearchParams(window.location.search)).get('lesson_id');
        if (!content.trim() || !currentLessonId) return;

        fetch(`http://127.0.0.1:8000/educations/lessons/${currentLessonId}/comments/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: content })
        })
            .then(response => response.json())
            .then(() => {
                document.getElementById('comment-text').value = '';
                fetchComments(currentLessonId); // Tải lại bình luận
            })
            .catch(error => console.error('Lỗi khi gửi bình luận:', error));
    });

    // Fetch, Save Personal Note
    function fetchNote(lessonIdForNote) {
        fetch(`http://127.0.0.1:8000/educations/notes/?lesson_id=${lessonIdForNote}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => response.json())
            .then(notes => {
                if (notes && notes.length > 0) {
                    noteTextarea.value = notes[0].content;
                } else {
                    noteTextarea.value = '';
                }
            })
            .catch(error => console.error('Lỗi khi tải ghi chú:', error));
    }

    saveNoteBtn.addEventListener('click', () => {
        const content = noteTextarea.value;
        const currentLessonId = lessonId || (new URLSearchParams(window.location.search)).get('lesson_id');
        if (!currentLessonId) return;

        fetch(`http://127.0.0.1:8000/educations/notes/`, {
            method: 'POST', // API của bạn có thể dùng POST để tạo/cập nhật
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lesson: currentLessonId, content: content })
        })
            .then(response => response.json())
            .then(() => alert('Đã lưu ghi chú!'))
            .catch(error => console.error('Lỗi khi lưu ghi chú:', error));
    });

    // Mark lesson as complete
    markCompleteBtn.addEventListener('click', function () {
        const lessonIdToComplete = this.dataset.lessonId;
        if (!lessonIdToComplete) return;

        fetch(`http://127.0.0.1:8000/educations/lessons/${lessonIdToComplete}/complete/`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                if (response.ok) {
                    this.textContent = "Đã hoàn thành";
                    this.disabled = true;
                    alert('Chúc mừng bạn đã hoàn thành bài học!');
                } else {
                    alert('Không thể đánh dấu hoàn thành.');
                }
            })
            .catch(error => console.error('Lỗi khi đánh dấu hoàn thành:', error));
    });

    // 1. Xử lý đóng/mở Dropdown thanh lọc
    const filterToggle = document.getElementById('filter-toggle');
    const levelList = document.getElementById('level-list');

    if (filterToggle && levelList) {
        filterToggle.addEventListener('click', () => {
            // Bật/tắt class 'show' để xổ danh sách xuống
            levelList.classList.toggle('show');
            // Bật/tắt class 'open' để xoay mũi tên
            filterToggle.classList.toggle('open');
        });
    }

    // 2. Xử lý khi chọn một trình độ cụ thể
    const levelItems = document.querySelectorAll('.level-item');

    levelItems.forEach(item => {
        item.addEventListener('click', function () {
            // Xóa active khỏi tất cả
            levelItems.forEach(li => li.classList.remove('active'));
            // Thêm active vào thẻ được bấm
            this.classList.add('active');

            const selectedLevel = this.getAttribute('data-level');
            console.log('Đang lọc:', selectedLevel);

            // Tùy chọn: Tự động đóng dropdown sau khi chọn xong
            // levelList.classList.remove('show');
            // filterToggle.classList.remove('open');
        });
    });
});