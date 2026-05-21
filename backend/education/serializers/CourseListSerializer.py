from rest_framework import serializers
from education.models import Course, Enrollment
from education.services import CourseService
class CourseListSerializer(serializers.ModelSerializer):
    """Dùng cho danh sách tìm kiếm (Gọn nhẹ)"""
    average_rating = serializers.SerializerMethodField()
    enrolled_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'level', 'price', 'thumbnail', 'average_rating', 'enrolled_count']

    def get_average_rating(self, obj):
        return CourseService.get_course_rating(obj.id)

    def get_enrolled_count(self, obj):
        return Enrollment.objects.filter(course=obj, status='paid').count()