document.addEventListener("DOMContentLoaded", function() {
    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", function(event) {
        // Ngăn chặn trình duyệt load lại trang khi bấm submit
        event.preventDefault(); 

        // Lấy dữ liệu từ các ô input
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Xử lý logic kiểm tra cơ bản
        if (password !== confirmPassword) {
            alert("Mật khẩu nhập lại không khớp! Vui lòng kiểm tra lại.");
            return;
        }

        // Nếu mọi thông tin hợp lệ (Bạn có thể thêm fetch API đẩy dữ liệu lên Database ở đây)
        alert(`Đăng ký thành công tài khoản: ${username}!\nChào mừng bạn đến với JSMART!`);
        
        // Làm trống form sau khi thành công
        registerForm.reset();
    });
});