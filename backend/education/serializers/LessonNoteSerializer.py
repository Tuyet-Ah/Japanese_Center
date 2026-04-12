from rest_framework import serializers
from education.models import LessonNote
class LessonNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonNote
        fields = ['id', 'lesson', 'content', 'video_timestamp', 'created_at']