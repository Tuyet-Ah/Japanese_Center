from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import  permissions

from education.services.quiz_service import QuizService
from education.serializers import QuizSubmissionSerializer,QuizSerializer,QuestionResultSerializer
from education.models import Quiz,QuizSubmission

class PracticeQuizListView(ListAPIView):
    """API cho mục Luyện thi: Liệt kê các đề thi tự do"""
    serializer_class = QuizSerializer 
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        level = self.request.query_params.get('level')
        return QuizService.get_practice_quizzes(level)
    
class QuizDetailView(APIView):
    """Lấy đề bài để làm"""
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, pk):
        try:
            quiz = QuizService.get_quiz_details(pk)
            return Response(QuizSerializer(quiz).data)
        except Exception:
            return Response({"error": "Không thấy đề bài"}, status=404)

class QuizSubmitView(APIView):
    """Nộp bài và chấm điểm"""
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        user_answers = request.data.get('answers', [])
        result = QuizService.submit_quiz(request.user, pk, user_answers)
        return Response(result)

class PracticeHistoryView(APIView):
    """Chỉ xem lịch sử Luyện thi"""
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        history = QuizService.get_user_history(request.user, quiz_type='practice')
        return Response(QuizSubmissionSerializer(history, many=True).data)

class FinalExamHistoryView(APIView):
    """Chỉ xem lịch sử Thi cuối khóa"""
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        history = QuizService.get_user_history(request.user, quiz_type='final')
        return Response(QuizSubmissionSerializer(history, many=True).data)
    
class QuizLeaderboardView(APIView):
    def get(self, request, pk):
        submissions = QuizSubmission.objects.filter(quiz_id=pk).select_related('user').order_by('-score', 'submitted_at')[:10]
        data = [{"username": s.user.username, "score": s.score, "date": s.submitted_at} for s in submissions]
        return Response(data)

class QuizReviewDetailView(APIView):
    """Xem lại chi tiết đáp án sau khi đã nộp bài"""
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, pk):
        quiz = Quiz.objects.prefetch_related('questions').get(id=pk)
        return Response(QuestionResultSerializer(quiz.questions.all(), many=True).data)