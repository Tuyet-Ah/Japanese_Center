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

from education.models import Exam
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
    """POST — Nộp bài và nhận kết quả chấm điểm"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            Exam.objects.get(pk=pk, status='published')
        except Exam.DoesNotExist:
            return Response({'error': 'Không tìm thấy đề thi.'}, status=status.HTTP_404_NOT_FOUND)

        user_answers = request.data.get('answers', [])
        if not isinstance(user_answers, list):
            return Response({'error': 'answers phải là một danh sách.'}, status=status.HTTP_400_BAD_REQUEST)

        result = ExamService.grade_submission(pk, user_answers)
        return Response(result)
