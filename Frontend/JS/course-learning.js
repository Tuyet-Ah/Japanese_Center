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

let currentLearningCourse = null;
let currentLearningLesson = null;

function buildStaticCourseCourseKey(title) {
  const normalized = String(title || '').toLowerCase();
  if (normalized.includes('n5')) return 'n5-beginner';
  if (normalized.includes('n4')) return 'n4-communication';
  if (normalized.includes('kanji')) return 'kanji-intensive';
  return 'n5-beginner';
}

function convertYoutubeToEmbed(url) {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  return url;
}

function normalizeBackendCourse(course, progressPercentage) {
  const chapters = Array.isArray(course.chapters) ? course.chapters : [];
  const sections = chapters.map((chapter) => ({
    title: chapter.title ? `Chương ${chapter.order || ''}: ${chapter.title}`.replace('Chương :', 'Chương') : 'Chương học',
    lessons: Array.isArray(chapter.lessons)
      ? chapter.lessons.map((lesson, index) => ({
        id: String(lesson.id),
        title: lesson.title || `Bài ${index + 1}`,
        duration: 'Xem trực tiếp',
        done: false,
        videoUrl: lesson.video_url || '',
        pdfFile: lesson.pdf_file || ''
      }))
      : []
  }));

  return {
    id: course.id,
    title: course.title,
    teacher: 'Giáo viên của khóa học',
    progress: Number(progressPercentage || 0),
    sections,
    description: course.description || '',
    source: 'backend'
  };
}

function renderLearningCourse(course) {
  if (!course) return;

  currentLearningCourse = course;
  currentLearningLesson = null;

  document.title = `JSMART | ${course.title}`;
  document.getElementById('sidebarCourseTitle').textContent = course.title;
  document.getElementById('progressPct').textContent = `${Math.round(course.progress || 0)}%`;
  document.getElementById('progressFill').style.width = `${Math.round(course.progress || 0)}%`;

  const syllabusEl = document.getElementById('syllabus');
  syllabusEl.innerHTML = '';

  (course.sections || []).forEach((section) => {
    const sectionEl = document.createElement('div');
    sectionEl.className = 'syllabus-section';

    const header = document.createElement('div');
    header.className = 'syllabus-section-header';
    header.innerHTML = `<span>${section.title}</span><span class="chevron">▾</span>`;

    const lessonsList = document.createElement('ul');
    lessonsList.className = 'syllabus-lessons';

    (section.lessons || []).forEach((lesson, index) => {
      const item = document.createElement('li');
      item.className = `syllabus-lesson${lesson.done ? ' done' : ''}`;
      item.dataset.lessonId = lesson.id;
      item.innerHTML = `
        <span class="lesson-check">${lesson.done ? '✅' : '▶'}</span>
        <span class="lesson-name">${lesson.title}</span>
        <span class="lesson-duration">${lesson.duration || ''}</span>
      `;
      item.addEventListener('click', () => loadLesson(lesson, item));
      lessonsList.appendChild(item);

      if (!currentLearningLesson && index === 0) {
        currentLearningLesson = lesson;
      }
    });

    header.addEventListener('click', () => {
      lessonsList.classList.toggle('hidden');
      header.classList.toggle('collapsed');
    });

    sectionEl.appendChild(header);
    sectionEl.appendChild(lessonsList);
    syllabusEl.appendChild(sectionEl);
  });

  const firstLesson = currentLearningLesson || (course.sections && course.sections[0] && course.sections[0].lessons && course.sections[0].lessons[0]);
  if (firstLesson) {
    const firstNode = document.querySelector(`.syllabus-lesson[data-lesson-id="${firstLesson.id}"]`);
    if (firstNode) {
      loadLesson(firstLesson, firstNode);
    }
  }

  const lessonDesc = document.getElementById('lessonDesc');
  if (lessonDesc && course.description) {
    lessonDesc.textContent = course.description;
  }
}

async function loadBackendCourseLearning(courseId) {
  if (typeof fetchCourseDetail !== 'function') return null;

  const [course, myLearning] = await Promise.all([
    fetchCourseDetail(courseId),
    typeof fetchMyLearning === 'function' ? fetchMyLearning() : Promise.resolve(null)
  ]);

  const learningEntry = Array.isArray(myLearning)
    ? myLearning.find((item) => Number(item.course_id) === Number(courseId))
    : null;

  return normalizeBackendCourse(course, learningEntry ? learningEntry.progress_percentage : 0);
}

async function loadCourseLearningPage() {
  const params = new URLSearchParams(window.location.search);
  const courseParam = params.get('course') || 'n5-beginner';

  const staticCourse = COURSES[courseParam] || COURSES[buildStaticCourseCourseKey(courseParam)] || null;
  if (staticCourse && !/^\d+$/.test(courseParam)) {
    renderLearningCourse(staticCourse);
    return;
  }

  if (/^\d+$/.test(courseParam)) {
    try {
      const backendCourse = await loadBackendCourseLearning(Number(courseParam));
      if (backendCourse) {
        renderLearningCourse(backendCourse);
        return;
      }
    } catch (error) {
      console.error('Failed to load backend course learning page', error);
    }
  }

  renderLearningCourse(staticCourse || COURSES['n5-beginner']);
}

document.addEventListener('DOMContentLoaded', async () => {
  initStandardHeader();

  await loadCourseLearningPage();

  const tabBtns = document.querySelectorAll('.lesson-tab-btn');
  const tabPanels = document.querySelectorAll('.lesson-tab-panel');
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('ltab-' + btn.dataset.ltab).classList.add('active');
    });
  });

  document.querySelector('.save-notes-btn')?.addEventListener('click', () => {
    alert('Đã lưu ghi chú!');
  });
});

function loadLesson(lesson, itemEl) {
  document.querySelectorAll('.syllabus-lesson').forEach((node) => node.classList.remove('active'));
  if (itemEl) itemEl.classList.add('active');

  currentLearningLesson = lesson;

  document.getElementById('lessonTitle').textContent = lesson.title;
  document.getElementById('lessonMeta').textContent = lesson.duration ? `⏱ ${lesson.duration}` : 'Bài học trực tuyến';

  const placeholder = document.getElementById('videoPlaceholder');
  const frame = document.getElementById('videoFrame');
  const rawVideoUrl = lesson.videoUrl || lesson.video_url || '';
  const videoSrc = rawVideoUrl
    ? convertYoutubeToEmbed(rawVideoUrl)
    : (lesson.videoId ? `https://www.youtube.com/embed/${lesson.videoId}` : '');

  if (placeholder) placeholder.style.display = 'none';
  if (frame) {
    frame.style.display = 'block';
    frame.src = videoSrc || lesson.videoUrl || lesson.video_url || '';
  }

  const desc = document.getElementById('lessonDesc');
  if (desc) {
    desc.textContent = `Bài giảng: ${lesson.title}. Hãy theo dõi toàn bộ video và làm bài tập kèm theo để nắm vững kiến thức.`;
  }
}

window.loadLesson = loadLesson;
