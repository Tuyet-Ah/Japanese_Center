
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
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
            localStorage.setItem('token', data.access);

            // Giải mã JWT để lấy thông tin người dùng
            try {
                const payload = JSON.parse(atob(data.access.split('.')[1]));
                const user = {
                    username: payload.username, // Giả sử payload có trường 'username'
                    // Thêm các thông tin khác nếu có, ví dụ: payload.name
                };
                localStorage.setItem('user', JSON.stringify(user));
            } catch (e) {
                console.error('Không thể giải mã token:', e);
                // Nếu không giải mã được, vẫn tiếp tục nhưng không có thông tin user
            }

            // alert('Đăng nhập thành công!'); // Bỏ alert để chuyển trang ngay lập tức
            window.location.href = 'Home.html';
        } else {
            alert('Đăng nhập thất bại: ' + (data.detail || 'Thông tin không chính xác'));
        }
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        alert('Không thể kết nối đến server.');
    }
});
