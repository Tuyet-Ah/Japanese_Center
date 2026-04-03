from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from education.services import CourseService
from education.serializers import CourseSerializer
from education.models import Enrollment


class CourseListView(APIView):
    def get(self, request):
        courses = CourseService.list_all_courses()
        return Response(CourseSerializer(courses, many=True).data)

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