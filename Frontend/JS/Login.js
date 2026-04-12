
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Ngăn trang web load lại

    // 1. Lấy dữ liệu từ form
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // 2. Gửi request đến Backend (đường dẫn /api/login/ tùy vào cấu hình urls.py tổng)
        const response = await fetch('http://127.0.0.1:8000/educations/login/', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // 3. Lưu JWT Token vào LocalStorage hoặc Cookie
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            
            alert('Đăng nhập thành công!');
            
            // 4. Chuyển hướng người dùng sang trang chủ hoặc trang cá nhân
            window.location.href = 'Home.html'; 
        } else {
            // Hiển thị lỗi từ backend (vd: "Sai mật khẩu")
            alert('Đăng nhập thất bại: ' + (data.detail || 'Thông tin không chính xác'));
        }
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        alert('Không thể kết nối đến server.');
    }
});
