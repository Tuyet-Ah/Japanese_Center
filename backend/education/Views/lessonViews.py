from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from education.services import CourseService
from education.serializers import LessonSerializer
from education.models import Lesson

class LessonDetailView(APIView):
    """API xem nội dung video/tài liệu của bài học"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            lesson = CourseService.get_lesson_detail(request.user, pk)
            serializer = LessonSerializer(lesson)
            return Response(serializer.data)
        except PermissionError as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Lesson.DoesNotExist:
            return Response({"error": "Bài học không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

class MarkLessonCompleteView(APIView):
    """API để Frontend gọi khi học viên xem hết video"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            CourseService.mark_lesson_as_completed(request.user, pk)
            return Response({"status": "success", "message": "Đã ghi nhận hoàn thành bài học"})
        except Exception as e:
            return Response({"error": str(e)}, status=400)