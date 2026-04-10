document.addEventListener('DOMContentLoaded', () => {
    // Xử lý sự kiện click trên thanh lọc trình độ
    const levelItems = document.querySelectorAll('.level-item');

    levelItems.forEach(item => {
        item.addEventListener('click', function() {
            // Xóa class active khỏi tất cả các item
            levelItems.forEach(li => li.classList.remove('active'));
            
            // Thêm class active vào item vừa được click
            this.classList.add('active');

            // (Dành cho việc tích hợp Backend sau này)
            // Lấy giá trị trình độ để gọi API (ví dụ: N1, N2)
            const selectedLevel = this.getAttribute('data-level');
            console.log('Đang lọc các bài test trình độ:', selectedLevel);
            
            // TODO: Gắn API fetch dữ liệu từ Django tại đây khi bạn chuyển sang React
        });
    });

    // Thêm hiệu ứng hover bằng JS cho các nút "Chi tiết" (Tùy chọn, vì CSS đã lo phần này)
    const detailButtons = document.querySelectorAll('.btn-detail');
    detailButtons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.classList.add('active');
        });
        btn.addEventListener('mouseleave', () => {
            btn.classList.remove('active');
        });
    });
});