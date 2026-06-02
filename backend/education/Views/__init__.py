from .authViews import RegisterView, RegisterAdminView, LoginView, ApproveAdminView, PendingAdminListView, AdminDashboardStatsView, LogoutView, ProfileView
from .authViews import ChangePasswordView
from .courseViews import ChapterCreateView, ChapterDetailView
from .lessonViews import LessonCreateView
from .courseViews import CourseListView, CourseDetailView, CourseLearningDetailView, MyCoursesProgressView, CourseSearchSuggestView, CourseReviewView
from .cartViews import CartView, CartDeleteView
from .paymentViews import CheckoutView, VnpayReturnView, VnpayIpnView
from .quizViews import QuizDetailView, QuizSubmitView, PracticeHistoryView, FinalExamHistoryView, QuizReviewDetailView, QuizLeaderboardView, PracticeQuizListView, QuizSubmissionDetailView, AdminQuizListView
from .lessonViews import LessonDetailView, MarkLessonCompleteView
from .interactionView import LessonCommentView, PersonalNoteView, LessonNoteDetailView, ForumTopicView, ForumTopicDetailView, ReplyToTopicView, GetReplyTopicView, PendingForumTopicListView, ApproveForumTopicView
from .chatbotViews import JapaneseChatbotView
from .materialViews import MaterialListView, MaterialDetailView