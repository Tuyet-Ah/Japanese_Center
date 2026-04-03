from django.urls import path
from .Views import RegisterView, LoginView, CourseListView,CourseDetailView,CartView,WebhookBankView,CheckoutView,CartDeleteView,PracticeHistoryView,FinalExamHistoryView,QuizSubmitView,QuizDetailView,LessonDetailView,MarkLessonCompleteView,ProfileView,MyCoursesProgressView,QuizLeaderboardView,QuizReviewDetailView,PracticeQuizListView

urlpatterns =[
      path('register/', RegisterView.as_view(), name='register'),
      path('login/', LoginView.as_view(), name='login'),
      # Profile
      path('profile/', ProfileView.as_view(), name='profile'),

      path('courses/', CourseListView.as_view(), name='course-list'),
      path('courses/<int:pk>/',CourseDetailView.as_view(), name='course-detail'),

      path('checkout/', CheckoutView.as_view(), name='checkout'),
      path('webhook-bank/', WebhookBankView.as_view(), name='bank-webhook'),

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
      path('lessons/<int:pk>/complete/', MarkLessonCompleteView.as_view(), name='lesson-complete'),
      # Progress & My Courses
      path('my-learning/', MyCoursesProgressView.as_view(), name='my-learning'),
      
      
            
] 