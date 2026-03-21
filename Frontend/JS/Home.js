let currentIndex = 0;
const imagesToShow = 4; // Số lượng ảnh muốn hiển thị cùng lúc

function moveSlide(direction) {
    const track = document.querySelector('.course-wrapper');
    const items = document.querySelectorAll('.course-item');
    const totalItems = items.length;

    // Cập nhật vị trí hiện tại
    currentIndex += direction;

    // Logic vòng lặp: Nếu quá ảnh cuối thì về đầu, nếu lùi quá ảnh đầu thì tới cuối
    // Ở đây ta tính toán dựa trên nhóm 3 ảnh
    if (currentIndex > totalItems - imagesToShow) {
        currentIndex = 0; // Quay lại 3 ảnh đầu
    } else if (currentIndex < 0) {
        currentIndex = totalItems - imagesToShow; // Tới nhóm ảnh cuối
    }

    // Dịch chuyển track (mỗi bước dịch chuyển là 1/3 độ rộng container)
    const movePercentage = -(currentIndex * (100 / imagesToShow));
    track.style.transform = `translateX(${movePercentage}%)`;
}
document.addEventListener("DOMContentLoaded", () => {
    const hana = document.querySelector('.hana-chat-container');
    if (!hana) return; 

    let isDragging = false;
    let startX, startY, initialX, initialY;

    hana.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = hana.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;

        hana.style.bottom = 'auto';
        hana.style.right = 'auto';
        hana.style.left = initialX + 'px';
        hana.style.top = initialY + 'px';
        hana.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newX = initialX + dx;
        let newY = initialY + dy;

        const maxX = window.innerWidth - hana.offsetWidth;
        const maxY = window.innerHeight - hana.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        hana.style.left = newX + 'px';
        hana.style.top = newY + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        hana.style.transition = 'transform 0.3s ease';
    });
});