document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Bạn cần đăng nhập để xem trang này.');
        window.location.href = 'Login.html';
        return;
    }

    // DOM Elements
    const profileUsername = document.getElementById('profile-username');
    const profileEmail = document.getElementById('profile-email');
    const myCoursesContainer = document.querySelector('.my-courses-list');
    const btnLogout = document.querySelector('.logout-btn');

    // Fetch Profile Info
    fetch('http://127.0.0.1:8000/educations/profile/', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(response => response.json())
        .then(data => {
            if (profileUsername) profileUsername.textContent = data.username;
            if (profileEmail) profileEmail.textContent = data.email;
        })
        .catch(error => console.error('Lỗi khi tải thông tin cá nhân:', error));

    // Fetch My Learning/Enrolled Courses
    fetch('http://127.0.0.1:8000/educations/my-learning/', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(response => response.json())
        .then(data => {
            if (myCoursesContainer) {
                myCoursesContainer.innerHTML = ''; // Clear existing
                if (data && data.length > 0) {
                    data.forEach(enrollment => {
                        const course = enrollment.course;
                        const courseItem = document.createElement('div');
                        courseItem.classList.add('course-item');
                        courseItem.innerHTML = `
                        <img src="${course.thumbnail || 'default-image.jpg'}" alt="${course.title}">
                        <div class="course-details">
                            <h4>${course.title}</h4>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${enrollment.progress_percentage}%;"></div>
                            </div>
                            <span>${Math.round(enrollment.progress_percentage)}% Hoàn thành</span>
                        </div>
                        <a href="LearnOn.html?course_id=${course.id}" class="btn-continue">Tiếp tục học</a>
                    `;
                        myCoursesContainer.appendChild(courseItem);
                    });
                } else {
                    myCoursesContainer.innerHTML = '<p>Bạn chưa tham gia khóa học nào.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải các khóa học của tôi:', error);
            if (myCoursesContainer) myCoursesContainer.innerHTML = '<p>Lỗi khi tải khóa học.</p>';
        });

    // Logout Button
    if (btnLogout) {
        btnLogout.addEventListener('click', function () {
            const confirmLogout = confirm("Bạn có chắc chắn muốn đăng xuất không?");
            if (confirmLogout) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'Home.html';
            }
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

    const btnResult = document.getElementById('btn-result');
    if (btnResult) {
        btnResult.addEventListener('click', () => window.location.href = 'Result.html');
    }
});
