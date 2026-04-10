
const btnLogout = document.querySelector('.logout-btn');
if (btnLogout) {
    btnLogout.addEventListener('click', function() {
        const confirmLogout = confirm("Bạn có chắc chắn muốn đăng xuất không?");
        if (confirmLogout) {
            // Chuyển về trang đăng nhập
            window.location.href = 'Home.html'; 
        }
    });
}
const btnProfile = document.getElementById('btn-profile');
if (btnProfile) {
    btnProfile.addEventListener('click', function() {
        // Chuyển về trang Thông tin cá nhân
        // LƯU Ý: Thay 'profile.html' bằng đúng tên file HTML trang thông tin cá nhân của bạn
        window.location.href = 'User.html'; 
    });
}
const btnResult = document.getElementById('btn-result');
if (btnResult) {
    btnResult.addEventListener('click', function() {
        // Thay 'khoahoc.html' bằng tên file trang khóa học của bạn
        window.location.href = 'Result.html'; 
    });
}
