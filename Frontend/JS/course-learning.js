// Course data by ID
const COURSES = {
  'n5-beginner': {
    title: 'N5 Beginner Journey',
    teacher: 'Nguyễn Thị Lan',
    progress: 65,
    sections: [
      {
        title: 'Chương 1: Bảng chữ cái & Phát âm',
        lessons: [
          { id: 'n5-1-1', title: 'Giới thiệu Hiragana - Hàng A, I, U, E, O', duration: '12:30', done: true, videoId: 'dQw4w9WgXcQ' },
          { id: 'n5-1-2', title: 'Hiragana hàng Ka, Ki, Ku, Ke, Ko', duration: '14:20', done: true, videoId: 'dQw4w9WgXcQ' },
          { id: 'n5-1-3', title: 'Hiragana hàng Sa, Si, Su, Se, So', duration: '11:45', done: true, videoId: 'dQw4w9WgXcQ' },
          { id: 'n5-1-4', title: 'Luyện tập đọc Hiragana tổng hợp', duration: '18:00', done: false, videoId: 'dQw4w9WgXcQ' },
        ]
      },
      {
        title: 'Chương 2: Từ vựng cơ bản N5',
        lessons: [
          { id: 'n5-2-1', title: 'Từ vựng về gia đình (家族)', duration: '15:10', done: true, videoId: 'dQw4w9WgXcQ' },
          { id: 'n5-2-2', title: 'Từ vựng về màu sắc (色)', duration: '10:30', done: false, videoId: 'dQw4w9WgXcQ' },
          { id: 'n5-2-3', title: 'Từ vựng về số đếm (数字)', duration: '13:50', done: false, videoId: 'dQw4w9WgXcQ' },
          { id: 'n5-2-4', title: 'Bài tập từ vựng tổng hợp', duration: '09:20', done: false, videoId: 'dQw4w9WgXcQ' },
        ]
      },
      {
        title: 'Chương 3: Ngữ pháp N5',
        lessons: [
          { id: 'n5-3-1', title: 'Mẫu câu 〜は〜です (A là B)', duration: '16:40', done: false, videoId: 'dQw4w9WgXcQ' },
          { id: 'n5-3-2', title: 'Mẫu câu 〜が〜います/あります', duration: '14:15', done: false, videoId: 'dQw4w9WgXcQ' },
          { id: 'n5-3-3', title: 'Mẫu câu 〜てください (Hãy làm...)', duration: '12:00', done: false, videoId: 'dQw4w9WgXcQ' },
        ]
      }
    ]
  },
  'n4-communication': {
    title: 'N4 Communication Boost',
    teacher: 'Trần Văn Minh',
    progress: 30,
    sections: [
      {
        title: 'Chương 1: Ôn tập N5 nâng cao',
        lessons: [
          { id: 'n4-1-1', title: 'Ôn tập ngữ pháp N5 cần biết', duration: '20:00', done: true, videoId: 'dQw4w9WgXcQ' },
          { id: 'n4-1-2', title: 'Từ vựng N5 nâng cao', duration: '18:30', done: true, videoId: 'dQw4w9WgXcQ' },
        ]
      },
      {
        title: 'Chương 2: Giao tiếp thực tế',
        lessons: [
          { id: 'n4-2-1', title: 'Hội thoại tại cửa hàng', duration: '22:10', done: false, videoId: 'dQw4w9WgXcQ' },
          { id: 'n4-2-2', title: 'Hội thoại tại bệnh viện', duration: '19:45', done: false, videoId: 'dQw4w9WgXcQ' },
          { id: 'n4-2-3', title: 'Hội thoại tại nhà hàng', duration: '17:30', done: false, videoId: 'dQw4w9WgXcQ' },
        ]
      },
      {
        title: 'Chương 3: Ngữ pháp N4',
        lessons: [
          { id: 'n4-3-1', title: 'Thể て và các cách dùng', duration: '25:00', done: false, videoId: 'dQw4w9WgXcQ' },
          { id: 'n4-3-2', title: 'Thể た và quá khứ', duration: '22:00', done: false, videoId: 'dQw4w9WgXcQ' },
          { id: 'n4-3-3', title: 'Câu điều kiện 〜たら/〜ば', duration: '28:15', done: false, videoId: 'dQw4w9WgXcQ' },
        ]
      }
    ]
  },
  'kanji-intensive': {
    title: 'Kanji Intensive Lab',
    teacher: 'Lê Thị Hoa',
    progress: 100,
    sections: [
      {
        title: 'Chương 1: Kanji cơ bản N5 (80 kanji)',
        lessons: [
          { id: 'kj-1-1', title: 'Kanji hàng người, thiên nhiên', duration: '20:00', done: true, videoId: 'dQw4w9WgXcQ' },
          { id: 'kj-1-2', title: 'Kanji số đếm, thời gian', duration: '18:00', done: true, videoId: 'dQw4w9WgXcQ' },
          { id: 'kj-1-3', title: 'Kanji về địa điểm, phương hướng', duration: '16:30', done: true, videoId: 'dQw4w9WgXcQ' },
        ]
      },
      {
        title: 'Chương 2: Kanji N4 (166 kanji)',
        lessons: [
          { id: 'kj-2-1', title: 'Kanji về hoạt động hàng ngày', duration: '24:00', done: true, videoId: 'dQw4w9WgXcQ' },
          { id: 'kj-2-2', title: 'Kanji về nghề nghiệp', duration: '21:00', done: true, videoId: 'dQw4w9WgXcQ' },
        ]
      }
    ]
  }
};

const LESSON_DETAILS = {
  default: {
    desc: 'Video bài giảng chi tiết với giải thích rõ ràng từng bước. Hãy xem toàn bộ video và làm bài tập đi kèm để nắm vững kiến thức.',
    goals: [
      'Hiểu được nội dung chính của bài',
      'Nắm vững từ vựng và cấu trúc ngữ pháp mới',
      'Áp dụng vào bài tập thực hành',
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initStandardHeader();

  // Determine which course to load
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('course') || 'n5-beginner';
  const course = COURSES[courseId] || COURSES['n5-beginner'];

  // Set title and progress
  document.title = `JSMART | ${course.title}`;
  document.getElementById('sidebarCourseTitle').textContent = course.title;
  document.getElementById('progressPct').textContent = course.progress + '%';
  document.getElementById('progressFill').style.width = course.progress + '%';

  // Render syllabus
  const syllabusEl = document.getElementById('syllabus');
  course.sections.forEach((section, si) => {
    const sectionEl = document.createElement('div');
    sectionEl.className = 'syllabus-section';

    const header = document.createElement('div');
    header.className = 'syllabus-section-header';
    header.innerHTML = `<span>${section.title}</span><span class="chevron">▾</span>`;

    const lessonsList = document.createElement('ul');
    lessonsList.className = 'syllabus-lessons';

    section.lessons.forEach((lesson, li) => {
      const item = document.createElement('li');
      item.className = `syllabus-lesson${lesson.done ? ' done' : ''}`;
      item.dataset.lessonId = lesson.id;
      item.innerHTML = `
        <span class="lesson-check">${lesson.done ? '✅' : '▶'}</span>
        <span class="lesson-name">${lesson.title}</span>
        <span class="lesson-duration">${lesson.duration}</span>
      `;
      item.addEventListener('click', () => loadLesson(lesson, item));
      lessonsList.appendChild(item);
    });

    header.addEventListener('click', () => {
      lessonsList.classList.toggle('hidden');
      header.classList.toggle('collapsed');
    });

    sectionEl.appendChild(header);
    sectionEl.appendChild(lessonsList);
    syllabusEl.appendChild(sectionEl);
  });

  // Tab switching (lesson tabs)
  const tabBtns = document.querySelectorAll('.lesson-tab-btn');
  const tabPanels = document.querySelectorAll('.lesson-tab-panel');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('ltab-' + btn.dataset.ltab).classList.add('active');
    });
  });

  // Save notes
  document.querySelector('.save-notes-btn')?.addEventListener('click', () => {
    alert('Đã lưu ghi chú!');
  });
});

function loadLesson(lesson, itemEl) {
  // Highlight active lesson
  document.querySelectorAll('.syllabus-lesson').forEach(l => l.classList.remove('active'));
  itemEl.classList.add('active');

  // Update lesson info
  document.getElementById('lessonTitle').textContent = lesson.title;
  document.getElementById('lessonMeta').textContent = `⏱ ${lesson.duration}`;

  // Show video
  const placeholder = document.getElementById('videoPlaceholder');
  const frame = document.getElementById('videoFrame');

  placeholder.style.display = 'none';
  frame.style.display = 'block';
  frame.src = `https://www.youtube.com/embed/${lesson.videoId}?autoplay=1`;

  // Update description
  document.getElementById('lessonDesc').textContent =
    'Bài giảng: ' + lesson.title + '. Hãy theo dõi toàn bộ video và làm bài tập kèm theo để nắm vững kiến thức.';
}

window.loadLesson = loadLesson;
