from rest_framework import serializers
from education.models import Chapter
from .LessonSerializer import LessonSerializer


class ChapterSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Chapter
        fields = ['id', 'title', 'order', 'lessons']