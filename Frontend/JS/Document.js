document.addEventListener('DOMContentLoaded', () => {
    // Lấy tất cả các vùng chứa thanh trượt (carousel)
    const carousels = document.querySelectorAll('.carousel-wrapper');

    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const prevBtn = carousel.querySelector('.prev-btn');
        const nextBtn = carousel.querySelector('.next-btn');

        // Bỏ qua nếu section không có nút (ví dụ section Luyện viết đang code dở)
        if (!prevBtn || !nextBtn) return;

        // Tính khoảng cách cần cuộn (chiều rộng 1 card + khoảng cách gap)
        // Ở đây card width là 220px + gap 20px = 240px
        const scrollAmount = 240; 

        // Xử lý sự kiện click nút Next (Phải)
        nextBtn.addEventListener('click', () => {
            track.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

        // Xử lý sự kiện click nút Prev (Trái)
        prevBtn.addEventListener('click', () => {
            track.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });
    });
});