from .authViews import RegisterView, RegisterAdminView, LoginView, ApproveAdminView, LogoutView, ProfileView
from .courseViews import ChapterCreateView, ChapterDetailView
from .lessonViews import LessonCreateView
from .courseViews import CourseListView, CourseDetailView,MyCoursesProgressView,CourseSearchSuggestView,CourseReviewView
from .cartViews import CartView, CartDeleteView
from .paymentViews import CheckoutView, VnpayReturnView, VnpayIpnView
from .quizViews import QuizDetailView, QuizSubmitView,PracticeHistoryView,FinalExamHistoryView,QuizReviewDetailView,QuizLeaderboardView,PracticeQuizListView
from .lessonViews import LessonDetailView, MarkLessonCompleteView
from .interactionView import LessonCommentView,PersonalNoteView,ForumTopicView,ReplyToTopicView,GetReplyTopicView
from .chatbotViews import JapaneseChatbotView