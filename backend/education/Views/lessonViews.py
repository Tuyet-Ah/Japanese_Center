from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser,JSONParser

from education.services import CourseService
from education.serializers import LessonCreateUpdateSerializer, LessonSerializer
from education.models import Chapter, Lesson


def _is_admin(user):
    return user.is_authenticated and user.role == 'admin' and not user.is_admin_pending

class LessonDetailView(APIView):
    """API xem nội dung video/tài liệu của bài học"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser,MultiPartParser, FormParser]

    def get(self, request, pk):
        try:
            lesson = CourseService.get_lesson_detail(request.user, pk)
            serializer = LessonSerializer(lesson)
            return Response(serializer.data)
        except PermissionError as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Lesson.DoesNotExist:
            return Response({"error": "Bài học không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        if not _is_admin(request.user):
            return Response({"error": "Không có quyền cập nhật bài học"}, status=status.HTTP_403_FORBIDDEN)

        try:
            lesson = Lesson.objects.get(id=pk)
        except Lesson.DoesNotExist:
            return Response({"error": "Bài học không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        serializer = LessonCreateUpdateSerializer(lesson, data=request.data, partial=True)
        if serializer.is_valid():
            lesson = serializer.save()
            return Response(LessonSerializer(lesson).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not _is_admin(request.user):
            return Response({"error": "Không có quyền xóa bài học"}, status=status.HTTP_403_FORBIDDEN)

        try:
            lesson = Lesson.objects.get(id=pk)
        except Lesson.DoesNotExist:
            return Response({"error": "Bài học không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        lesson.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MarkLessonCompleteView(APIView):
    """API để Frontend gọi khi học viên xem hết video"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            CourseService.mark_lesson_as_completed(request.user, pk)
            return Response({"status": "success", "message": "Đã ghi nhận hoàn thành bài học"})
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class LessonCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser,MultiPartParser, FormParser]

    def post(self, request, chapter_id):
        if not _is_admin(request.user):
            return Response({"error": "Không có quyền thêm bài học"}, status=status.HTTP_403_FORBIDDEN)

        try:
            chapter = Chapter.objects.get(id=chapter_id)
        except Chapter.DoesNotExist:
            return Response({"error": "Chương không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        serializer = LessonCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            lesson = serializer.save(chapter=chapter)
            return Response(LessonSerializer(lesson).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)