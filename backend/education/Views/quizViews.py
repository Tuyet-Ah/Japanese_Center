from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import permissions, status

from education.services.quiz_service import QuizService
from education.serializers import QuizSubmissionSerializer, QuizSerializer, QuizListSerializer, QuestionResultSerializer, QuizSubmissionAnswerSerializer
from education.models import Quiz, QuizSubmission


def _is_admin(user):
    return user.is_authenticated and user.role == 'admin' and not user.is_admin_pending

class PracticeQuizListView(ListAPIView):
    """API cho mục Luyện thi: Liệt kê các đề thi tự do"""
    serializer_class = QuizListSerializer 
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
        duration_seconds = request.data.get('duration_seconds', 0)
        result = QuizService.submit_quiz(request.user, pk, user_answers, duration_seconds)
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


class AdminQuizListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not _is_admin(request.user):
            return Response({"error": "Không có quyền xem danh sách quiz"}, status=status.HTTP_403_FORBIDDEN)

        queryset = Quiz.objects.all().order_by('-id')
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(Q(title__icontains=search))

        level = request.query_params.get('level')
        if level:
            queryset = queryset.filter(level=level)

        quiz_type = request.query_params.get('quiz_type')
        if quiz_type:
            queryset = queryset.filter(quiz_type=quiz_type)

        serializer = QuizListSerializer(queryset, many=True)
        return Response(serializer.data)

class QuizReviewDetailView(APIView):
    """Xem lại chi tiết đáp án sau khi đã nộp bài"""
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, pk):
        quiz = Quiz.objects.prefetch_related('questions').get(id=pk)
        return Response(QuestionResultSerializer(quiz.questions.all(), many=True).data)


class QuizSubmissionDetailView(APIView):
    """Xem lại bài làm đã nộp (bao gồm đáp án đã chọn)"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        submission = QuizSubmission.objects.filter(id=pk, user=request.user).select_related('quiz').first()
        if not submission:
            return Response({"error": "Không tìm thấy bài làm"}, status=404)

        answers = submission.answers.select_related('question').all()
        serializer = QuizSubmissionAnswerSerializer(answers, many=True)
        return Response({
            "submission_id": submission.id,
            "quiz_id": submission.quiz.id,
            "quiz_name": submission.quiz.title,
            "score": submission.score,
            "correct_count": submission.correct_count,
            "total_questions": submission.total_questions,
            "duration_seconds": submission.duration_seconds,
            "submitted_at": submission.submitted_at,
            "answers": serializer.data
        })