"""
examViews.py — CRUD API cho hệ thống Thi Online (JLPT & Điền từ).

Endpoints:
  GET    /educations/admin/exams/          → Danh sách đề thi (lọc theo level, status, search)
  POST   /educations/admin/exams/          → Tạo đề thi nguyên khối (Deep Insert)
  GET    /educations/admin/exams/<pk>/     → Lấy chi tiết đề thi kèm toàn bộ cây con
  PATCH  /educations/admin/exams/<pk>/     → Cập nhật đề thi (Upsert cây con)
  DELETE /educations/admin/exams/<pk>/     → Xoá đề thi (Cascade)
  POST   /educations/exams/<pk>/submit/    → Nộp bài + chấm điểm
  GET    /educations/exams/                → Danh sách đề thi công bố (người dùng)
  GET    /educations/exams/<pk>/           → Lấy đề để làm bài (người dùng)
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from education.models import Exam, ExamSubmission
from education.serializers import (
    ExamSerializer, ExamListSerializer, ExamWriteSerializer,
)
from education.services import ExamService
from education.services.activity_log_service import log_admin_action


def _is_admin(user):
    return user.is_authenticated and user.role == 'admin' and not user.is_admin_pending


# ─────────────────────────────────────────────
# Admin Views
# ─────────────────────────────────────────────

class AdminExamListView(APIView):
    """
    GET  — Danh sách tất cả đề thi (hỗ trợ lọc theo level, status, search)
    POST — Tạo đề thi mới với Deep Insert
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not _is_admin(request.user):
            return Response({'error': 'Không có quyền.'}, status=status.HTTP_403_FORBIDDEN)

        exams = ExamService.list_exams(request.query_params)
        serializer = ExamListSerializer(exams, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not _is_admin(request.user):
            return Response({'error': 'Không có quyền.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ExamWriteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            exam = ExamService.create_exam(serializer.validated_data)
            log_admin_action(request.user, 'create_exam', f'[{exam.level}] {exam.title}')
            return Response(ExamSerializer(exam).data, status=status.HTTP_201_CREATED)
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class AdminExamDetailView(APIView):
    """
    GET    — Lấy chi tiết đề thi kèm toàn bộ câu hỏi
    PATCH  — Cập nhật đề thi (Upsert cây con)
    DELETE — Xoá đề thi và toàn bộ dữ liệu liên quan
    """
    permission_classes = [permissions.IsAuthenticated]

    def _get_exam(self, pk):
        try:
            return Exam.objects.get(pk=pk)
        except Exam.DoesNotExist:
            return None

    def get(self, request, pk):
        if not _is_admin(request.user):
            return Response({'error': 'Không có quyền.'}, status=status.HTTP_403_FORBIDDEN)

        exam = self._get_exam(pk)
        if not exam:
            return Response({'error': 'Không tìm thấy đề thi.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(ExamSerializer(ExamService.get_exam_detail(pk)).data)

    def patch(self, request, pk):
        if not _is_admin(request.user):
            return Response({'error': 'Không có quyền.'}, status=status.HTTP_403_FORBIDDEN)

        exam = self._get_exam(pk)
        if not exam:
            return Response({'error': 'Không tìm thấy đề thi.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ExamWriteSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            updated = ExamService.update_exam(exam, serializer.validated_data)
            log_admin_action(request.user, 'update_exam', f'[{updated.level}] {updated.title}')
            return Response(ExamSerializer(updated).data)
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not _is_admin(request.user):
            return Response({'error': 'Không có quyền.'}, status=status.HTTP_403_FORBIDDEN)

        exam = self._get_exam(pk)
        if not exam:
            return Response({'error': 'Không tìm thấy đề thi.'}, status=status.HTTP_404_NOT_FOUND)

        title = f'[{exam.level}] {exam.title}'
        ExamService.delete_exam(exam)
        log_admin_action(request.user, 'delete_exam', title)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────
# Public / Student Views
# ─────────────────────────────────────────────

class ExamPublicListView(APIView):
    """GET — Danh sách đề thi đã công bố (dành cho học viên)"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filters = dict(request.query_params)
        filters['status'] = 'published'
        exams = ExamService.list_exams(filters)
        return Response(ExamListSerializer(exams, many=True).data)


class ExamPublicDetailView(APIView):
    """GET — Lấy đề thi để làm bài (chỉ đề đã công bố)"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            exam = ExamService.get_exam_detail(pk)
        except Exam.DoesNotExist:
            return Response({'error': 'Không tìm thấy đề thi.'}, status=status.HTTP_404_NOT_FOUND)

        if exam.status != 'published':
            return Response({'error': 'Đề thi chưa được công bố.'}, status=status.HTTP_403_FORBIDDEN)

        return Response(ExamSerializer(exam).data)


class ExamSubmitView(APIView):
    """POST — Nộp bài, chấm điểm và lưu kết quả vào DB"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            exam = Exam.objects.get(pk=pk, status='published')
        except Exam.DoesNotExist:
            return Response({'error': 'Không tìm thấy đề thi.'}, status=status.HTTP_404_NOT_FOUND)

        user_answers = request.data.get('answers', [])
        duration_seconds = int(request.data.get('duration_seconds', 0))

        if not isinstance(user_answers, list):
            return Response({'error': 'answers phải là một danh sách.'}, status=status.HTTP_400_BAD_REQUEST)

        result = ExamService.grade_submission(pk, user_answers)

        # Lưu kết quả vào DB
        submission = ExamSubmission.objects.create(
            user=request.user,
            exam=exam,
            total_score=result['total_score'],
            max_score=result['max_score'],
            correct_count=result['correct_count'],
            total_questions=result['total_questions'],
            duration_seconds=duration_seconds,
            details_json=result['details'],
        )

        return Response({**result, 'submission_id': submission.pk})


class ExamHistoryView(APIView):
    """GET — Lịch sử làm bài thi JLPT của học viên đang đăng nhập"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        submissions = (
            ExamSubmission.objects
            .filter(user=request.user)
            .select_related('exam')
            .order_by('-submitted_at')[:50]
        )
        data = [
            {
                'submission_id':   s.pk,
                'exam_id':         s.exam_id,
                'exam_title':      s.exam.title,
                'exam_level':      s.exam.level,
                'total_score':     s.total_score,
                'max_score':       s.max_score,
                'score_percent':   s.score_percent,
                'correct_count':   s.correct_count,
                'total_questions': s.total_questions,
                'duration_seconds': s.duration_seconds,
                'submitted_at':    s.submitted_at.strftime('%d/%m/%Y %H:%M'),
            }
            for s in submissions
        ]
        return Response(data)


class ExamSubmissionDetailView(APIView):
    """GET — Chi tiết một lần làm bài (để xem lại đáp án)"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            submission = ExamSubmission.objects.select_related('exam').get(pk=pk, user=request.user)
        except ExamSubmission.DoesNotExist:
            return Response({'error': 'Không tìm thấy bài làm.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'submission_id':   submission.pk,
            'exam_id':         submission.exam_id,
            'exam_title':      submission.exam.title,
            'exam_level':      submission.exam.level,
            'total_score':     submission.total_score,
            'max_score':       submission.max_score,
            'score_percent':   submission.score_percent,
            'correct_count':   submission.correct_count,
            'total_questions': submission.total_questions,
            'duration_seconds': submission.duration_seconds,
            'submitted_at':    submission.submitted_at.strftime('%d/%m/%Y %H:%M'),
            'details':         submission.details_json,
        })
