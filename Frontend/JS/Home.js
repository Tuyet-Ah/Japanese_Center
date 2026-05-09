document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('user'));
    const userSection = document.getElementById('user-section');
    const courseWrapper = document.querySelector('.course-wrapper');

    if (user && user.username && userSection) {
        // Nếu có thông tin người dùng, thay đổi nội dung của user-section
        userSection.innerHTML = `
            <a href="User.html" class="user-profile">
                <i class="fa-solid fa-user-circle" style="font-size: 24px;"></i>
                <span>${user.username}</span>
            </a>
        `;
    }
    // Nếu không có thông tin người dùng, nó sẽ giữ nguyên nút "Học online" mặc định trong HTML.

    // Fetch featured courses
    fetch('http://127.0.0.1:8000/educations/courses/?ordering=-average_rating&limit=10') // Lấy 10 khóa học nổi bật nhất
        .then(response => response.json())
        .then(data => {
            if (courseWrapper) {
                courseWrapper.innerHTML = ''; // Xóa nội dung cũ
                if (data.results && data.results.length > 0) {
                    data.results.forEach(course => {
                        const courseItem = document.createElement('div');
                        courseItem.classList.add('course-item');
                        courseItem.innerHTML = `
                            <img src="${course.thumbnail || 'default-image.jpg'}" alt="${course.title}">
                            <h4>${course.title}</h4>
                            <p>Trình độ: ${course.level}</p>
                            <div class="price-tag">¥${course.price}</div>
                            <a href="LearnOn.html?course_id=${course.id}" class="btn-detail">Xem thêm</a>
                        `;
                        courseWrapper.appendChild(courseItem);
                    });
                    // Khởi tạo lại slider sau khi thêm item
                    moveSlide(0);
                } else {
                    courseWrapper.innerHTML = '<p>Chưa có khóa học nào để hiển thị.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải khóa học nổi bật:', error);
            if (courseWrapper) {
                courseWrapper.innerHTML = '<p>Lỗi tải khóa học.</p>';
            }
        });
});

let currentIndex = 0;
const imagesToShow = 4; // Số lượng ảnh muốn hiển thị cùng lúc

function moveSlide(direction) {
    const track = document.querySelector('.course-wrapper');
    if (!track) return;
    const items = document.querySelectorAll('.course-item');
    const totalItems = items.length;

    if (totalItems <= imagesToShow) return; // Không cần slide nếu ít item

    currentIndex += direction;

    if (currentIndex > totalItems - imagesToShow) {
        currentIndex = 0;
    } else if (currentIndex < 0) {
        currentIndex = totalItems - imagesToShow;
    }

    const movePercentage = -(currentIndex * (100 / imagesToShow));
    track.style.transform = `translateX(${movePercentage}%)`;
}

document.addEventListener("DOMContentLoaded", () => {
    const hana = document.querySelector('.hana-chat-container');
    if (!hana) return;

    let isDragging = false;
    let startX, startY, initialX, initialY;

    hana.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const rect = hana.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;

        hana.style.bottom = 'auto';
        hana.style.right = 'auto';
        hana.style.left = initialX + 'px';
        hana.style.top = initialY + 'px';
        hana.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newX = initialX + dx;
        let newY = initialY + dy;

        const maxX = window.innerWidth - hana.offsetWidth;
        const maxY = window.innerHeight - hana.offsetHeight;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        hana.style.left = newX + 'px';
        hana.style.top = newY + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        hana.style.transition = 'transform 0.3s ease';
    });
});