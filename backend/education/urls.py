from django.urls import path
from .Views import RegisterView, RegisterAdminView, LoginView, ApproveAdminView, PendingAdminListView, AdminDashboardStatsView, ReplyToTopicView, GetReplyTopicView, CourseListView, CourseDetailView, CourseLearningDetailView, ChapterCreateView, ChapterDetailView, CartView, CheckoutView, CartDeleteView, PracticeHistoryView, FinalExamHistoryView, QuizSubmitView, QuizDetailView, LessonDetailView, LessonCreateView, MarkLessonCompleteView, ProfileView, ChangePasswordView, MyCoursesProgressView, QuizLeaderboardView, QuizReviewDetailView, LessonCommentView, PersonalNoteView, LessonNoteDetailView, ForumTopicView, ForumTopicDetailView, CourseSearchSuggestView, CourseReviewView, VnpayReturnView, VnpayIpnView, JapaneseChatbotView, PracticeQuizListView, QuizSubmissionDetailView, AdminQuizListView, MaterialListView, MaterialDetailView, PendingForumTopicListView, ApproveForumTopicView, PublicSiteStatsView
from .Views import AdminExamListView, AdminExamDetailView, ExamPublicListView, ExamPublicDetailView, ExamSubmitView
from .Views import AdminActivityLogView

urlpatterns =[
      path('register/', RegisterView.as_view(), name='register'),
      path('register-admin/', RegisterAdminView.as_view(), name='register-admin'),
      path('login/', LoginView.as_view(), name='login'),
      # Thống kê công khai cho trang Home học viên
      path('site-stats/', PublicSiteStatsView.as_view(), name='site-stats'),
      path('admin/dashboard-stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
      path('admin-approvals/', PendingAdminListView.as_view(), name='pending-admin-list'),
      path('admin-approvals/<int:user_id>/', ApproveAdminView.as_view(), name='approve-admin'),
      # Profile
      path('profile/', ProfileView.as_view(), name='profile'),
      path('profile/change-password/', ChangePasswordView.as_view(), name='profile-change-password'),
      # 1. Danh sách khóa học (Tích hợp Tìm kiếm & Lọc)
      # URL này sẽ xử lý các query params như ?search=, ?level=, ?min_price=
      path('courses/', CourseListView.as_view(), name='course-list'),
      path('courses/<int:pk>/',CourseDetailView.as_view(), name='course-detail'),
      path('courses/<int:course_id>/learning/', CourseLearningDetailView.as_view(), name='course-learning-detail'),
      path('courses/<int:course_id>/chapters/', ChapterCreateView.as_view(), name='chapter-create'),
      path('chapters/<int:pk>/', ChapterDetailView.as_view(), name='chapter-detail'),
      # 2. Đánh giá khóa học (Xem danh sách review và Gửi review mới)
      path('courses/<int:course_id>/reviews/', CourseReviewView.as_view(), name='course-reviews'),
      # 3. Gợi ý tìm kiếm nhanh (Search Suggestion - Option)
      path('courses/suggest/', CourseSearchSuggestView.as_view(), name='course-suggest'),
      path('checkout/', CheckoutView.as_view(), name='checkout'),
      path('vnpay/return/', VnpayReturnView.as_view(), name='vnpay-return'),
      path('vnpay/ipn/', VnpayIpnView.as_view(), name='vnpay-ipn'),

      path('cart/',CartView.as_view(),name='cart-list-create'),
      path('cart/<int:pk>/',CartDeleteView.as_view(),name='cart-destroy'),

      
      path('quizzes/<int:pk>/', QuizDetailView.as_view(), name='quiz-detail'),
      path('quizzes/practice/', PracticeQuizListView.as_view(), name='practice-quiz-list'),
      path('quizzes/<int:pk>/submit/', QuizSubmitView.as_view(), name='quiz-submit'),
      path('quiz-history/practice/', PracticeHistoryView.as_view()),
      path('quiz-history/final/', FinalExamHistoryView.as_view()),
      # Quiz Analytics
      path('quizzes/<int:pk>/leaderboard/', QuizLeaderboardView.as_view(), name='quiz-leaderboard'),
      path('quizzes/<int:pk>/review/', QuizReviewDetailView.as_view(), name='quiz-review'),
      path('quiz-submissions/<int:pk>/', QuizSubmissionDetailView.as_view(), name='quiz-submission-detail'),
      path('admin/quizzes/', AdminQuizListView.as_view(), name='admin-quiz-list'),
      path('lessons/<int:pk>/', LessonDetailView.as_view(), name='lesson-detail'),
      path('chapters/<int:chapter_id>/lessons/', LessonCreateView.as_view(), name='lesson-create'),
      path('lessons/<int:pk>/complete/', MarkLessonCompleteView.as_view(), name='lesson-complete'),
      # Progress & My Courses
      path('my-learning/', MyCoursesProgressView.as_view(), name='my-learning'),
      
      # Tương tác và công đồng
      path('lessons/<int:lesson_id>/comments/', LessonCommentView.as_view(), name='lesson-comments'),
      path('notes/', PersonalNoteView.as_view(), name='personal-notes'),
      path('notes/<int:note_id>/', LessonNoteDetailView.as_view(), name='personal-note-detail'),
      path('forum/topics/', ForumTopicView.as_view(), name='forum-topics'),
      path('forum/topics/<int:topic_id>/', ForumTopicDetailView.as_view(), name='forum-topic-detail'),
      path('forum/topics/<int:topic_id>/reply/', ReplyToTopicView.as_view(), name='forum-reply'),
      path('forum/topics/<int:topic_id>/response/', GetReplyTopicView.as_view(), name='forum-get-response'),
      path('chatbot/', JapaneseChatbotView.as_view(), name='japanese-chatbot'),
      path('materials/', MaterialListView.as_view(), name='material-list'),
      path('materials/<int:pk>/', MaterialDetailView.as_view(), name='material-detail'),
      path('admin-forum-approvals/', PendingForumTopicListView.as_view(), name='pending-forum-list'),
      path('admin-forum-approvals/<int:topic_id>/', ApproveForumTopicView.as_view(), name='approve-forum'),

      # ── Hệ thống Thi Online (JLPT & Điền từ) ──
      # Admin CRUD
      path('admin/exams/', AdminExamListView.as_view(), name='admin-exam-list'),
      path('admin/exams/<int:pk>/', AdminExamDetailView.as_view(), name='admin-exam-detail'),
      # Public (học viên)
      path('exams/', ExamPublicListView.as_view(), name='exam-public-list'),
      path('exams/<int:pk>/', ExamPublicDetailView.as_view(), name='exam-public-detail'),
      path('exams/<int:pk>/submit/', ExamSubmitView.as_view(), name='exam-submit'),

      # ── Lịch sử hoạt động Admin ──
      path('admin/activity-log/', AdminActivityLogView.as_view(), name='admin-activity-log'),
]