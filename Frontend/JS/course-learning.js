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
    desc: 'Video bài giảng chi tiết với giải thích rõ ràng từng bước. Hãy xem toàn bộ video và làm bài tập đi kèm để nắm vững kiến thức.'
  }
};

let currentLearningCourse = null;
let currentLearningLesson = null;
let ytPlayer = null;
let ytPlayerReady = false;
let youtubeApiPromise = null;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderLessonDescription(rawText) {
  const text = String(rawText || '').trim();
  if (!text) return '';

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const hasList = lines.some((line) => /^[-*•]/.test(line));

  if (!hasList) {
    return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('');
  }

  const items = [];
  const paragraphs = [];
  lines.forEach((line) => {
    if (/^[-*•]/.test(line)) {
      items.push(`<li>${escapeHtml(line.replace(/^[-*•]\s*/, ''))}</li>`);
    } else {
      paragraphs.push(`<p>${escapeHtml(line)}</p>`);
    }
  });

  const listHtml = items.length ? `<ul>${items.join('')}</ul>` : '';
  return `${paragraphs.join('')}${listHtml}`;
}

function buildMediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `${API_HOST}${path}`;
  return `${API_HOST}/${path}`;
}

function buildStaticCourseCourseKey(title) {
  const normalized = String(title || '').toLowerCase();
  if (normalized.includes('n5')) return 'n5-beginner';
  if (normalized.includes('n4')) return 'n4-communication';
  if (normalized.includes('kanji')) return 'kanji-intensive';
  return 'n5-beginner';
}

function getYoutubeId(url) {
  if (!url) return '';
  if (url.includes('/embed/')) {
    const embedMatch = url.match(/\/embed\/([^?&/]+)/);
    return embedMatch ? embedMatch[1] : '';
  }
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^?&/]+)/);
  if (shortMatch) return shortMatch[1];
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&/]+)/);
  if (shortsMatch) return shortsMatch[1];
  return '';
}

function convertYoutubeToEmbed(url) {
  if (!url) return '';
  const origin = encodeURIComponent(window.location.origin);
  const baseParams = `rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${origin}`;
  const videoId = getYoutubeId(url);
  if (videoId) return `https://www.youtube.com/embed/${videoId}?${baseParams}`;
  if (url.includes('youtube.com') || url.includes('youtu.be')) return '';
  return url;
}

function ensureYoutubeApiLoaded() {
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise((resolve) => {
    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.id = 'youtube-iframe-api';
      document.head.appendChild(tag);
    }
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReady === 'function') previousReady();
      resolve();
    };
  });
  return youtubeApiPromise;
}

function setupYoutubePlayer(videoId) {
  if (!videoId) {
    if (ytPlayer && typeof ytPlayer.destroy === 'function') {
      ytPlayer.destroy();
    }
    ytPlayer = null;
    ytPlayerReady = false;
    return;
  }

  ensureYoutubeApiLoaded().then(() => {
    if (ytPlayer) {
      ytPlayer.loadVideoById(videoId);
      return;
    }
    ytPlayer = new YT.Player('videoFrame', {
      videoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
        playsinline: 1
      },
      events: {
        onReady: () => {
          ytPlayerReady = true;
        }
      }
    });
  });
}

function getCurrentVideoTime() {
  if (ytPlayer && ytPlayerReady && typeof ytPlayer.getCurrentTime === 'function') {
    return Math.floor(ytPlayer.getCurrentTime());
  }
  return 0;
}

function seekToTimestamp(seconds) {
  if (ytPlayer && ytPlayerReady && typeof ytPlayer.seekTo === 'function') {
    ytPlayer.seekTo(seconds, true);
    if (typeof ytPlayer.playVideo === 'function') {
      ytPlayer.playVideo();
    }
    return;
  }

  const frame = document.getElementById('videoFrame');
  const rawVideoUrl = currentLearningLesson?.videoUrl || currentLearningLesson?.video_url || '';
  if (frame && rawVideoUrl && getYoutubeId(rawVideoUrl)) {
    const base = convertYoutubeToEmbed(rawVideoUrl);
    const separator = base.includes('?') ? '&' : '?';
    frame.src = `${base}${separator}start=${seconds}`;
    return;
  }

  showAppToast('Video này không hỗ trợ tua theo ghi chú.', 'warning');
}

function formatTimestamp(seconds) {
  const total = Math.max(0, Number(seconds || 0));
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = Math.floor(total % 60);
  const pad = (value) => String(value).padStart(2, '0');
  if (hrs > 0) return `${hrs}:${pad(mins)}:${pad(secs)}`;
  return `${pad(mins)}:${pad(secs)}`;
}

async function fetchLessonNotes(lessonId) {
  const tokens = typeof getAuthTokens === 'function' ? getAuthTokens() : null;
  if (!tokens || !tokens.access) return [];
  const response = await fetch(`${API_BASE_URL}/notes/?lesson_id=${lessonId}`, {
    headers: { Authorization: `Bearer ${tokens.access}` }
  });
  if (!response.ok) return [];
  const data = await response.json().catch(() => ([]));
  return Array.isArray(data) ? data : [];
}

async function createLessonNote(lessonId, content, timestamp) {
  const tokens = typeof getAuthTokens === 'function' ? getAuthTokens() : null;
  if (!tokens || !tokens.access) return null;
  const response = await fetch(`${API_BASE_URL}/notes/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.access}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      lesson_id: lessonId,
      content,
      video_timestamp: timestamp
    })
  });
  if (!response.ok) return null;
  return response.json().catch(() => null);
}

async function deleteLessonNote(noteId) {
  const tokens = typeof getAuthTokens === 'function' ? getAuthTokens() : null;
  if (!tokens || !tokens.access) return false;
  const response = await fetch(`${API_BASE_URL}/notes/${noteId}/`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokens.access}` }
  });
  return response.ok;
}

function renderLessonNotes(notes) {
  const list = document.getElementById('lessonNotesList');
  if (!list) return;
  if (!Array.isArray(notes) || notes.length === 0) {
    list.innerHTML = '<p class="note-empty">Chưa có ghi chú cho bài học này.</p>';
    return;
  }
  list.innerHTML = notes
    .sort((a, b) => (a.video_timestamp ?? 0) - (b.video_timestamp ?? 0))
    .map((note) => {
      const time = formatTimestamp(note.video_timestamp || 0);
      const created = note.created_at ? new Date(note.created_at).toLocaleString('vi-VN') : '';
      return `
        <div class="note-item" data-note-id="${note.id}" data-note-time="${note.video_timestamp || 0}">
          <button class="note-time" type="button">⏱ ${time}</button>
          <div class="note-body">
            <div class="note-text">${escapeHtml(note.content || '')}</div>
            <div class="note-meta">${escapeHtml(created)}</div>
          </div>
          <button class="note-delete" type="button" title="Xóa ghi chú">✕</button>
        </div>
      `;
    })
    .join('');

  list.querySelectorAll('.note-time').forEach((button) => {
    button.addEventListener('click', () => {
      const parent = button.closest('.note-item');
      if (!parent) return;
      const seconds = Number(parent.dataset.noteTime || 0);
      seekToTimestamp(seconds);
    });
  });

  list.querySelectorAll('.note-delete').forEach((button) => {
    button.addEventListener('click', async () => {
      const parent = button.closest('.note-item');
      const noteId = parent?.dataset.noteId;
      if (!noteId) return;
      const ok = await deleteLessonNote(noteId);
      if (ok) {
        const updated = await fetchLessonNotes(currentLearningLesson?.id);
        renderLessonNotes(updated);
      }
    });
  });
}

function normalizeBackendCourse(course, progressPercentage) {
  const chapters = Array.isArray(course.chapters) ? course.chapters : [];
  const sections = chapters.map((chapter) => ({
    title: chapter.title ? `Chương ${chapter.order || ''}: ${chapter.title}`.replace('Chương :', 'Chương') : 'Chương học',
    lessons: Array.isArray(chapter.lessons)
      ? chapter.lessons.map((lesson, index) => ({
        id: String(lesson.id),
        title: lesson.title || `Bài ${index + 1}`,
        description: lesson.description || '',
        duration: 'Xem trực tiếp',
        done: Boolean(lesson.is_completed),
        videoUrl: lesson.video_url || '',
        pdfFile: lesson.pdf_file || ''
      }))
      : []
  }));

  return {
    id: course.id,
    title: course.title,
    teacher: 'Giáo viên của khóa học',
    progress: Number(course.progress_percentage ?? progressPercentage ?? 0),
    sections,
    description: course.description || '',
    source: 'backend'
  };
}

function applyLessonLocks(course) {
  const ordered = [];
  (course.sections || []).forEach((section) => {
    (section.lessons || []).forEach((lesson) => ordered.push(lesson));
  });

  let lastCompletedIndex = -1;
  ordered.forEach((lesson, index) => {
    if (lesson.done) lastCompletedIndex = index;
  });

  const unlockIndex = Math.min(lastCompletedIndex + 1, Math.max(ordered.length - 1, 0));
  ordered.forEach((lesson, index) => {
    lesson.isLocked = index > unlockIndex;
  });
}

function renderLearningCourse(course, preferredLessonId) {
  if (!course) return;

  currentLearningCourse = course;
  currentLearningLesson = null;

  applyLessonLocks(course);

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
      item.className = `syllabus-lesson${lesson.done ? ' done' : ''}${lesson.isLocked ? ' locked' : ''}`;
      item.dataset.lessonId = lesson.id;
      const statusIcon = lesson.isLocked ? '🔒' : (lesson.done ? '✅' : '▶');
      item.innerHTML = `
        <span class="lesson-check">${statusIcon}</span>
        <span class="lesson-name">${lesson.title}</span>
        <span class="lesson-duration">${lesson.duration || ''}</span>
      `;
      item.addEventListener('click', () => {
        if (lesson.isLocked) {
          showAppToast('Bạn cần hoàn thành bài trước để mở khóa bài này.', 'warning');
          return;
        }
        loadLesson(lesson, item);
      });
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

  const preferredLesson = preferredLessonId
    ? (course.sections || []).flatMap((section) => section.lessons || []).find((lesson) => lesson.id === preferredLessonId)
    : null;
  const firstLesson = preferredLesson && !preferredLesson.isLocked
    ? preferredLesson
    : (course.sections && course.sections[0] && course.sections[0].lessons && course.sections[0].lessons[0]);
  if (firstLesson && !firstLesson.isLocked) {
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
  const tokens = typeof getAuthTokens === 'function' ? getAuthTokens() : null;
  if (!tokens || !tokens.access) return null;

  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/learning/`, {
    headers: { Authorization: `Bearer ${tokens.access}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.detail || 'Không thể tải tiến độ khóa học');
  }
  return normalizeBackendCourse(data, data.progress_percentage || 0);
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

async function markLessonCompleted(lessonId) {
  const tokens = typeof getAuthTokens === 'function' ? getAuthTokens() : null;
  if (!tokens || !tokens.access) {
    showAppToast('Bạn cần đăng nhập để hoàn thành bài học.', 'error');
    return false;
  }

  const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/complete/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.access}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    showAppToast(data.error || data.detail || 'Không thể cập nhật tiến độ.', 'error');
    return false;
  }
  return true;
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
    const area = document.querySelector('.notes-area');
    const content = area?.value?.trim();
    if (!content) {
      showAppToast('Vui lòng nhập ghi chú trước khi lưu.', 'warning');
      return;
    }
    if (!currentLearningLesson || !/^\d+$/.test(String(currentLearningLesson.id))) {
      showAppToast('Ghi chú chỉ khả dụng cho bài học từ hệ thống.', 'warning');
      return;
    }
    const timestamp = getCurrentVideoTime();
    createLessonNote(Number(currentLearningLesson.id), content, timestamp)
      .then(async () => {
        if (area) area.value = '';
        const notes = await fetchLessonNotes(Number(currentLearningLesson.id));
        renderLessonNotes(notes);
      })
      .catch(() => showAppToast('Không thể lưu ghi chú lúc này.', 'error'));
  });

  document.getElementById('completeLessonBtn')?.addEventListener('click', async () => {
    if (!currentLearningLesson || !currentLearningCourse) return;
    const ok = await markLessonCompleted(currentLearningLesson.id);
    if (!ok) return;
    const refreshed = await loadBackendCourseLearning(currentLearningCourse.id);
    if (refreshed) {
      renderLearningCourse(refreshed, String(currentLearningLesson.id));
    }
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
  const completeBtn = document.getElementById('completeLessonBtn');
  const rawVideoUrl = lesson.videoUrl || lesson.video_url || '';
  const videoId = rawVideoUrl ? getYoutubeId(rawVideoUrl) : (lesson.videoId || '');
  const videoSrc = rawVideoUrl
    ? convertYoutubeToEmbed(rawVideoUrl)
    : (lesson.videoId ? `https://www.youtube.com/embed/${lesson.videoId}?rel=0&modestbranding=1&playsinline=1` : '');

  if (placeholder) placeholder.style.display = videoSrc ? 'none' : 'flex';
  if (frame) {
    frame.style.display = videoSrc ? 'block' : 'none';
    frame.src = videoSrc || '';
  }
  if (completeBtn) {
    completeBtn.disabled = Boolean(lesson.isLocked || lesson.done);
  }

  const desc = document.getElementById('lessonDesc');
  if (desc) {
    const fallbackDesc = `Bài giảng: ${lesson.title}. Hãy theo dõi toàn bộ video và làm bài tập kèm theo để nắm vững kiến thức.`;
    const rawDesc = lesson.description || lesson.desc || LESSON_DETAILS.default?.desc || fallbackDesc;
    desc.innerHTML = renderLessonDescription(rawDesc) || `<p>${escapeHtml(fallbackDesc)}</p>`;
  }

  const resources = document.getElementById('lessonResources');
  if (resources) {
    const pdfUrl = buildMediaUrl(lesson.pdfFile || lesson.pdf_file || '');
    if (pdfUrl) {
      const fileName = pdfUrl.split('/').pop() || 'Tai lieu PDF';
      resources.innerHTML = `
        <a href="${pdfUrl}" class="resource-item" target="_blank" rel="noopener">
          <span class="resource-icon">📄</span>
          <div class="resource-info">
            <div class="resource-name">${escapeHtml(fileName)}</div>
          </div>
          <span class="resource-download">⬇</span>
        </a>
      `;
    } else {
      resources.innerHTML = '<p>Chưa có tài nguyên cho bài học này.</p>';
    }
  }

  if (videoId) {
    setupYoutubePlayer(videoId);
  } else {
    setupYoutubePlayer('');
  }

  if (currentLearningLesson && /^\d+$/.test(String(currentLearningLesson.id))) {
    fetchLessonNotes(Number(currentLearningLesson.id)).then(renderLessonNotes);
  } else {
    renderLessonNotes([]);
  }
}

window.loadLesson = loadLesson;
