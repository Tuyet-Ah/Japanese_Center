from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from education.services import CourseService
from education.serializers import CourseSerializer,CourseListSerializer,CourseReviewSerializer
from education.models import Enrollment


class CourseListView(APIView):
    def get(self, request):
        # Lấy dữ liệu đã lọc từ Service
        courses = CourseService.filter_courses(request.query_params)
        serializer = CourseListSerializer(courses, many=True)
        return Response(serializer.data)

class CourseDetailView(APIView):
    def get(self, request, pk):
        try:
            course = CourseService.get_course_detail(pk)
            return Response(CourseSerializer(course).data)
        except ValueError as e:
            return Response({"error": str(e)}, status=404)
        
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
        reviews = CourseService.get_course_reviews(course_id)
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