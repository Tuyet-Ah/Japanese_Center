from rest_framework import serializers
from education.models import  Course
from .ChapterSerializer import ChapterSerializer
class CourseSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True) 
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'level', 'price', 'thumbnail', 'content_blocks', 'chapters']
