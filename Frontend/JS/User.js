const btnCourses = document.getElementById('btn-courses');
if (btnCourses) {
    btnCourses.addEventListener('click', function() {
        // Thay 'khoahoc.html' bằng tên file trang khóa học của bạn
        window.location.href = 'Course.html'; 
    });
}

const btnResult = document.getElementById('btn-result');
if (btnResult) {
    btnResult.addEventListener('click', function() {
        // Thay 'khoahoc.html' bằng tên file trang khóa học của bạn
        window.location.href = 'Result.html'; 
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
