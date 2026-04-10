document.getElementById('loginForm').addEventListener('submit', function(event) {
    // 1. Ngăn chặn hành vi reload trang mặc định của form khi ấn Enter/Submit
    event.preventDefault();

    // 2. Lấy giá trị người dùng nhập vào
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;


    // 4. Chuyển hướng sang trang chính
    window.location.href = 'User.html';
});