document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    
    // Giả lập logic đăng nhập
    console.log("Đang đăng nhập với:", user);
    alert("Chức năng đăng nhập đang được xử lý!");
});