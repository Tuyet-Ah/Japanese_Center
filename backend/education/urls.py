from django.urls import path
from .Views import (
    RegisterView, RegisterAdminView, LoginView,
    ApproveAdminView, PendingAdminListView, AdminDashboardStatsView,
    AdminListView, AdminDeactivateView, AdminReactivateView,
    ReplyToTopicView, GetReplyTopicView,
    CourseListView, CourseDetailView, CourseLearningDetailView,
    ChapterCreateView, ChapterDetailView,
    CartView, CheckoutView, CartDeleteView,
    LessonDetailView, LessonCreateView, MarkLessonCompleteView,
    ProfileView, ChangePasswordView, MyCoursesProgressView,
    LessonCommentView, PersonalNoteView, LessonNoteDetailView,
    ForumTopicView, ForumTopicDetailView,
    CourseSearchSuggestView, CourseReviewView,
    VnpayReturnView, VnpayIpnView,
    JapaneseChatbotView,
    PendingForumTopicListView, ApproveForumTopicView,
    PublicSiteStatsView,
)
from .Views import AdminExamListView, AdminExamDetailView, ExamPublicListView, ExamPublicDetailView, ExamSubmitView
from .Views import AdminActivityLogView
from .Views import ExamHistoryView, ExamSubmissionDetailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('register-admin/', RegisterAdminView.as_view(), name='register-admin'),
    path('login/', LoginView.as_view(), name='login'),

    # Thống kê
    path('site-stats/', PublicSiteStatsView.as_view(), name='site-stats'),
    path('admin/dashboard-stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),

    # Duyệt admin
    path('admin-approvals/', PendingAdminListView.as_view(), name='pending-admin-list'),
    path('admin-approvals/<int:user_id>/', ApproveAdminView.as_view(), name='approve-admin'),
    # Danh sách admin hiện có + xóa mềm
    path('admin/admins/', AdminListView.as_view(), name='admin-list'),
    path('admin/admins/<int:user_id>/deactivate/', AdminDeactivateView.as_view(), name='admin-deactivate'),
    path('admin/admins/<int:user_id>/reactivate/', AdminReactivateView.as_view(), name='admin-reactivate'),

    # Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='profile-change-password'),

    # Khóa học
    path('courses/', CourseListView.as_view(), name='course-list'),
    path('courses/<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('courses/<int:course_id>/learning/', CourseLearningDetailView.as_view(), name='course-learning-detail'),
    path('courses/<int:course_id>/chapters/', ChapterCreateView.as_view(), name='chapter-create'),
    path('chapters/<int:pk>/', ChapterDetailView.as_view(), name='chapter-detail'),
    path('courses/<int:course_id>/reviews/', CourseReviewView.as_view(), name='course-reviews'),
    path('courses/suggest/', CourseSearchSuggestView.as_view(), name='course-suggest'),

    # Thanh toán
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('vnpay/return/', VnpayReturnView.as_view(), name='vnpay-return'),
    path('vnpay/ipn/', VnpayIpnView.as_view(), name='vnpay-ipn'),
    path('cart/', CartView.as_view(), name='cart-list-create'),
    path('cart/<int:pk>/', CartDeleteView.as_view(), name='cart-destroy'),

    # Bài học
    path('lessons/<int:pk>/', LessonDetailView.as_view(), name='lesson-detail'),
    path('chapters/<int:chapter_id>/lessons/', LessonCreateView.as_view(), name='lesson-create'),
    path('lessons/<int:pk>/complete/', MarkLessonCompleteView.as_view(), name='lesson-complete'),

    # Tiến độ học
    path('my-learning/', MyCoursesProgressView.as_view(), name='my-learning'),

    # Tương tác & cộng đồng
    path('lessons/<int:lesson_id>/comments/', LessonCommentView.as_view(), name='lesson-comments'),
    path('notes/', PersonalNoteView.as_view(), name='personal-notes'),
    path('notes/<int:note_id>/', LessonNoteDetailView.as_view(), name='personal-note-detail'),
    path('forum/topics/', ForumTopicView.as_view(), name='forum-topics'),
    path('forum/topics/<int:topic_id>/', ForumTopicDetailView.as_view(), name='forum-topic-detail'),
    path('forum/topics/<int:topic_id>/reply/', ReplyToTopicView.as_view(), name='forum-reply'),
    path('forum/topics/<int:topic_id>/response/', GetReplyTopicView.as_view(), name='forum-get-response'),
    path('admin-forum-approvals/', PendingForumTopicListView.as_view(), name='pending-forum-list'),
    path('admin-forum-approvals/<int:topic_id>/', ApproveForumTopicView.as_view(), name='approve-forum'),

    # Chatbot
    path('chatbot/', JapaneseChatbotView.as_view(), name='japanese-chatbot'),

    # ── Hệ thống Thi JLPT ──
    path('admin/exams/', AdminExamListView.as_view(), name='admin-exam-list'),
    path('admin/exams/<int:pk>/', AdminExamDetailView.as_view(), name='admin-exam-detail'),
    path('exams/', ExamPublicListView.as_view(), name='exam-public-list'),
    path('exams/<int:pk>/', ExamPublicDetailView.as_view(), name='exam-public-detail'),
    path('exams/<int:pk>/submit/', ExamSubmitView.as_view(), name='exam-submit'),
    path('exam-history/', ExamHistoryView.as_view(), name='exam-history'),
    path('exam-submissions/<int:pk>/', ExamSubmissionDetailView.as_view(), name='exam-submission-detail'),

    # ── Admin tools ──
    path('admin/activity-log/', AdminActivityLogView.as_view(), name='admin-activity-log'),
]
