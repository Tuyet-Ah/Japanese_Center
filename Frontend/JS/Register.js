document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", function (event) {
        // Ngăn chặn trình duyệt load lại trang khi bấm submit
        event.preventDefault();

        // Lấy dữ liệu từ các ô input
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Xử lý logic kiểm tra cơ bản
        if (password !== confirmPassword) {
            alert("Mật khẩu nhập lại không khớp! Vui lòng kiểm tra lại.");
            return;
        }

        // Chuẩn bị dữ liệu để gửi đi
        const formData = {
            username: username,
            email: email,
            phone: phone,
            password: password
        };

        // Gửi yêu cầu POST đến API
        fetch('http://127.0.0.1:8000/educations/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
            .then(response => {
                if (!response.ok) {
                    // Nếu có lỗi từ server, phân tích và hiển thị
                    return response.json().then(data => {
                        let errorMessage = "Đăng ký không thành công. Vui lòng thử lại.\n";
                        for (const key in data) {
                            errorMessage += `${key}: ${data[key].join(', ')}\n`;
                        }
                        throw new Error(errorMessage);
                    });
                }
                return response.json();
            })
            .then(data => {
                // Xử lý khi đăng ký thành công
                alert(`Đăng ký thành công tài khoản: ${data.username}!\nChào mừng bạn đến với JSMART!`);
                // Chuyển hướng đến trang đăng nhập
                window.location.href = 'Login.html';
                registerForm.reset();
            })
            .catch(error => {
                // Xử lý khi có lỗi xảy ra
                console.error('Lỗi:', error);
                alert(error.message);
            });
    });
});