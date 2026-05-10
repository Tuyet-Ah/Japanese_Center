from django.urls import path
from .Views import RegisterView, RegisterAdminView, LoginView, ApproveAdminView, ReplyToTopicView, GetReplyTopicView, CourseListView, CourseDetailView, ChapterCreateView, ChapterDetailView, CartView, CheckoutView, CartDeleteView, PracticeHistoryView, FinalExamHistoryView, QuizSubmitView, QuizDetailView, LessonDetailView, LessonCreateView, MarkLessonCompleteView, ProfileView, MyCoursesProgressView, QuizLeaderboardView, QuizReviewDetailView, LessonCommentView, PersonalNoteView, ForumTopicView, CourseSearchSuggestView, CourseReviewView, VnpayReturnView, VnpayIpnView, JapaneseChatbotView

urlpatterns =[
      path('register/', RegisterView.as_view(), name='register'),
      path('register-admin/', RegisterAdminView.as_view(), name='register-admin'),
      path('login/', LoginView.as_view(), name='login'),
      path('admin-approvals/<int:user_id>/', ApproveAdminView.as_view(), name='approve-admin'),
      # Profile
      path('profile/', ProfileView.as_view(), name='profile'),
      # 1. Danh sách khóa học (Tích hợp Tìm kiếm & Lọc)
      # URL này sẽ xử lý các query params như ?search=, ?level=, ?min_price=
      path('courses/', CourseListView.as_view(), name='course-list'),
      path('courses/<int:pk>/',CourseDetailView.as_view(), name='course-detail'),
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
      path('quizzes/<int:pk>/submit/', QuizSubmitView.as_view(), name='quiz-submit'),
      path('quiz-history/practice/', PracticeHistoryView.as_view()),
      path('quiz-history/final/', FinalExamHistoryView.as_view()),
      # Quiz Analytics
      path('quizzes/<int:pk>/leaderboard/', QuizLeaderboardView.as_view(), name='quiz-leaderboard'),
      path('quizzes/<int:pk>/review/', QuizReviewDetailView.as_view(), name='quiz-review'),
      path('lessons/<int:pk>/', LessonDetailView.as_view(), name='lesson-detail'),
      path('chapters/<int:chapter_id>/lessons/', LessonCreateView.as_view(), name='lesson-create'),
      path('lessons/<int:pk>/complete/', MarkLessonCompleteView.as_view(), name='lesson-complete'),
      # Progress & My Courses
      path('my-learning/', MyCoursesProgressView.as_view(), name='my-learning'),
      
      # Tương tác và công đồng
      path('lessons/<int:lesson_id>/comments/', LessonCommentView.as_view(), name='lesson-comments'),
      path('notes/', PersonalNoteView.as_view(), name='personal-notes'),
      path('forum/topics/', ForumTopicView.as_view(), name='forum-topics'),
      path('forum/topics/<int:topic_id>/reply/', ReplyToTopicView.as_view(), name='forum-reply'),
      path('forum/topics/<int:topic_id>/response/', GetReplyTopicView.as_view(), name='forum-get-response'),
      path('chatbot/', JapaneseChatbotView.as_view(), name='japanese-chatbot'),
] 