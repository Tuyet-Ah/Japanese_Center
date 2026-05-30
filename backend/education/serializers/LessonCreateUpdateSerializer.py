from rest_framework import serializers
from education.models import Lesson


class LessonCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['title', 'description', 'video_url', 'pdf_file', 'order']
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'video_url': {'required': False, 'allow_blank': True},
            'pdf_file': {'required': False, 'allow_null': True},
            'order': {'required': False},
        }
