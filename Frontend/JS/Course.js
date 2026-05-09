const btnLogout = document.querySelector('.logout-btn');
if (btnLogout) {
    btnLogout.addEventListener('click', function () {
        const confirmLogout = confirm("Bạn có chắc chắn muốn đăng xuất không?");
        if (confirmLogout) {
            // Chuyển về trang đăng nhập
            window.location.href = 'Home.html';
        }
    });
}
const btnProfile = document.getElementById('btn-profile');
if (btnProfile) {
    btnProfile.addEventListener('click', function () {
        // Chuyển về trang Thông tin cá nhân
        // LƯU Ý: Thay 'profile.html' bằng đúng tên file HTML trang thông tin cá nhân của bạn
        window.location.href = 'User.html';
    });
}
const btnResult = document.getElementById('btn-result');
if (btnResult) {
    btnResult.addEventListener('click', function () {
        // Thay 'khoahoc.html' bằng tên file trang khóa học của bạn
        window.location.href = 'Result.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userSection = document.getElementById('user-section');
    const courseListContainer = document.querySelector('.course-list');
    const levelItems = document.querySelectorAll('.level-item');
    const searchInput = document.getElementById('search-input');

    if (user && user.username && userSection) {
        userSection.innerHTML = `
            <a href="User.html" class="user-profile">
                <i class="fa-solid fa-user-circle"></i>
                <span>${user.username}</span>
            </a>
        `;
    }

    // 1. Xử lý đóng/mở Dropdown thanh lọc
    const filterToggle = document.getElementById('filter-toggle');
    const levelList = document.getElementById('level-list');

    if (filterToggle && levelList) {
        filterToggle.addEventListener('click', () => {
            levelList.classList.toggle('show');
            filterToggle.classList.toggle('open');
        });
    }

    // Hàm để fetch và render khóa học
    function fetchAndRenderCourses(url = 'http://127.0.0.1:8000/educations/courses/') {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                courseListContainer.innerHTML = ''; // Xóa nội dung cũ
                if (data.results && data.results.length > 0) {
                    data.results.forEach(course => {
                        const courseCard = document.createElement('div');
                        courseCard.classList.add('course-card');
                        courseCard.innerHTML = `
                            <img src="${course.thumbnail || 'default-image.jpg'}" alt="${course.title}">
                            <div class="course-info">
                                <h3>${course.title}</h3>
                                <p class="course-level">Trình độ: ${course.level}</p>
                                <p class="course-price">Giá: ¥${course.price}</p>
                                <div class="course-rating">
                                    <span>${course.average_rating || 'Chưa có đánh giá'}</span>
                                    <div class="stars">
                                        ${getStarRating(course.average_rating)}
                                    </div>
                                </div>
                                <a href="LearnOn.html?course_id=${course.id}" class="btn-view-detail">Xem chi tiết</a>
                            </div>
                        `;
                        courseListContainer.appendChild(courseCard);
                    });
                } else {
                    courseListContainer.innerHTML = '<p>Không tìm thấy khóa học nào.</p>';
                }
            })
            .catch(error => {
                console.error('Lỗi khi tải khóa học:', error);
                courseListContainer.innerHTML = '<p>Đã xảy ra lỗi khi tải danh sách khóa học.</p>';
            });
    }

    // Hàm tạo rating sao
    function getStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 !== 0;
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fa-solid fa-star"></i>';
        }
        if (halfStar) {
            stars += '<i class="fa-solid fa-star-half-alt"></i>';
        }
        for (let i = 0; i < 5 - Math.ceil(rating); i++) {
            stars += '<i class="fa-regular fa-star"></i>';
        }
        return stars;
    }

    // 2. Xử lý khi chọn một trình độ cụ thể (lọc)
    levelItems.forEach(item => {
        item.addEventListener('click', function () {
            levelItems.forEach(li => li.classList.remove('active'));
            this.classList.add('active');
            const selectedLevel = this.getAttribute('data-level');
            let url = 'http://127.0.0.1:8000/educations/courses/';
            if (selectedLevel !== 'all') {
                url += `?level=${selectedLevel}`;
            }
            fetchAndRenderCourses(url);
        });
    });

    // 3. Xử lý tìm kiếm
    searchInput.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            const searchTerm = this.value;
            const url = `http://127.0.0.1:8000/educations/courses/?search=${searchTerm}`;
            fetchAndRenderCourses(url);
        }
    });


    // Tải tất cả khóa học khi trang được load lần đầu
    fetchAndRenderCourses();
});
