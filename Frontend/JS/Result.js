// Nút chuyển sang trang Thông tin cá nhân
const btnProfile = document.getElementById('btn-profile');
if (btnProfile) {
    btnProfile.addEventListener('click', function() {
        // Thay 'profile.html' bằng tên file trang cá nhân của bạn
        window.location.href = 'User.html'; 
    });
}

// Nút chuyển sang trang Khóa học đã mua
const btnCourses = document.getElementById('btn-courses');
if (btnCourses) {
    btnCourses.addEventListener('click', function() {
        // Thay 'khoahoc.html' bằng tên file trang khóa học của bạn
        window.location.href = 'Course.html'; 
    });
}

// Nút Đăng xuất
const btnLogout = document.querySelector('.logout-btn');
if (btnLogout) {
    btnLogout.addEventListener('click', function() {
        const confirmLogout = confirm("Bạn có chắc chắn muốn đăng xuất không?");
        if (confirmLogout) {
            // Thay 'login.html' bằng file đăng nhập của bạn
            window.location.href = 'Home.html'; 
        }
    });
}