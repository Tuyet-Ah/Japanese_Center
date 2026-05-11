document.addEventListener("DOMContentLoaded", () => {
  initStandardHeader();

  const prevButtons = document.querySelectorAll('.btn-prev');
  const nextButtons = document.querySelectorAll('.btn-next');

  // Scroll amount per click
  const scrollAmount = 300;

  prevButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const track = btn.parentElement.querySelector('.carousel-track');
      if (track) {
        if (track.scrollLeft <= 10) {
          // Reached the beginning, scroll to end
          const maxScrollLeft = track.scrollWidth - track.clientWidth;
          track.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
        } else {
          track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      }
    });
  });

  nextButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const track = btn.parentElement.querySelector('.carousel-track');
      if (track) {
        const maxScrollLeft = track.scrollWidth - track.clientWidth;
        // If we're at the end (or very close to it), scroll back to start
        if (track.scrollLeft >= maxScrollLeft - 10) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    });
  });
});