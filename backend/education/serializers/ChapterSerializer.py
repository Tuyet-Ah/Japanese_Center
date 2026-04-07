from rest_framework import serializers
from education.models import User, Course,Lesson,Chapter,CartItem,Enrollment,Question,Quiz,QuizSubmission
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .LessonSerializer import LessonSerializer
class ChapterSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    class Meta:
        model = Chapter
        fields = ['id','title','order','lessons']