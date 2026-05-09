from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser,JSONParser

from education.services import CourseService
from education.serializers import (
    ChapterCreateUpdateSerializer,
    CourseCreateSerializer,
    CourseSerializer,
    CourseListSerializer,
    CourseReviewSerializer,
    CourseUpdateSerializer,
)
from education.models import Chapter, Course, Enrollment


def _is_admin(user):
    return user.is_authenticated and user.role == 'admin' and not user.is_admin_pending


class CourseListView(APIView):
    parser_classes = [JSONParser,MultiPartParser, FormParser]

    def get(self, request):
        # Lấy dữ liệu đã lọc từ Service
        courses = CourseService.filter_courses(request.query_params)
        serializer = CourseListSerializer(courses, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not _is_admin(request.user):
            return Response({"error": "Không có quyền thêm khóa học"}, status=status.HTTP_403_FORBIDDEN)

        serializer = CourseCreateSerializer(data=request.data)
        if serializer.is_valid():
            course = serializer.save()
            return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CourseDetailView(APIView):
    parser_classes = [JSONParser,MultiPartParser, FormParser]

    def get(self, request, pk):
        try:
            course = CourseService.get_course_detail(pk)
            return Response(CourseSerializer(course).data)
        except ValueError as e:
            return Response({"error": str(e)}, status=404)

    def patch(self, request, pk):
        if not _is_admin(request.user):
            return Response({"error": "Không có quyền cập nhật khóa học"}, status=status.HTTP_403_FORBIDDEN)

        try:
            course = Course.objects.get(id=pk)
        except Course.DoesNotExist:
            return Response({"error": "Khóa học không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CourseUpdateSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            course = serializer.save()
            return Response(CourseSerializer(course).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not _is_admin(request.user):
            return Response({"error": "Không có quyền xóa khóa học"}, status=status.HTTP_403_FORBIDDEN)

        try:
            course = Course.objects.get(id=pk)
        except Course.DoesNotExist:
            return Response({"error": "Khóa học không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChapterCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_id):
        if not _is_admin(request.user):
            return Response({"error": "Không có quyền thêm chương"}, status=status.HTTP_403_FORBIDDEN)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Khóa học không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ChapterCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            chapter = serializer.save(course=course)
            return Response(ChapterCreateUpdateSerializer(chapter).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChapterDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        if not _is_admin(request.user):
            return Response({"error": "Không có quyền cập nhật chương"}, status=status.HTTP_403_FORBIDDEN)

        try:
            chapter = Chapter.objects.get(id=pk)
        except Chapter.DoesNotExist:
            return Response({"error": "Chương không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ChapterCreateUpdateSerializer(chapter, data=request.data, partial=True)
        if serializer.is_valid():
            chapter = serializer.save()
            return Response(ChapterCreateUpdateSerializer(chapter).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not _is_admin(request.user):
            return Response({"error": "Không có quyền xóa chương"}, status=status.HTTP_403_FORBIDDEN)

        try:
            chapter = Chapter.objects.get(id=pk)
        except Chapter.DoesNotExist:
            return Response({"error": "Chương không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        chapter.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
class MyCoursesProgressView(APIView):
    """Lấy danh sách khóa học đã mua kèm % tiến độ"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        paid_enrollments = Enrollment.objects.filter(user=request.user, status='paid').select_related('course')
        results = []
        for enroll in paid_enrollments:
            progress = CourseService.get_course_progress(request.user, enroll.course.id)
            results.append({
                "course_id": enroll.course.id,
                "course_title": enroll.course.title,
                "thumbnail": enroll.course.thumbnail.url if enroll.course.thumbnail else None,
                **progress
            })
        return Response(results)

class CourseSearchSuggestView(APIView):
    # API này cho phép mọi người gọi (kể cả chưa đăng nhập) để tìm khóa học
    permission_classes = [permissions.AllowAny] 

    def get(self, request):
        query = request.query_params.get('q', '')
        suggestions = CourseService.suggest_courses(query)
        return Response(suggestions)

class CourseReviewView(APIView):
    # GET: Ai cũng xem được đánh giá. POST: Phải đăng nhập mới đánh giá được.
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, course_id):
        rating = request.query_params.get('rating')
        reviews = CourseService.get_course_reviews(course_id,rating=rating)
        serializer = CourseReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, course_id):
        try:
            rating = request.data.get('rating')
            comment = request.data.get('comment', '')
            
            review = CourseService.add_review(request.user, course_id, rating, comment)
            return Response(CourseReviewSerializer(review).data, status=status.HTTP_201_CREATED)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({"detail": "Đã có lỗi xảy ra"}, status=status.HTTP_400_BAD_REQUEST)