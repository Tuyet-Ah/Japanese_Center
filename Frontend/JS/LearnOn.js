document.addEventListener('DOMContentLoaded', () => {
    // 1. Xử lý đóng/mở Dropdown thanh lọc
    const filterToggle = document.getElementById('filter-toggle');
    const levelList = document.getElementById('level-list');

    filterToggle.addEventListener('click', () => {
        // Bật/tắt class 'show' để xổ danh sách xuống
        levelList.classList.toggle('show');
        // Bật/tắt class 'open' để xoay mũi tên
        filterToggle.classList.toggle('open');
    });

    // 2. Xử lý khi chọn một trình độ cụ thể
    const levelItems = document.querySelectorAll('.level-item');

    levelItems.forEach(item => {
        item.addEventListener('click', function() {
            // Xóa active khỏi tất cả
            levelItems.forEach(li => li.classList.remove('active'));
            // Thêm active vào thẻ được bấm
            this.classList.add('active');

            const selectedLevel = this.getAttribute('data-level');
            console.log('Đang lọc:', selectedLevel);

            // Tùy chọn: Tự động đóng dropdown sau khi chọn xong
            // levelList.classList.remove('show');
            // filterToggle.classList.remove('open');
        });
    });
});