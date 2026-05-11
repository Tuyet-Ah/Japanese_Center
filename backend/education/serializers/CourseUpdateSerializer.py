from rest_framework import serializers
from education.models import Course


class CourseUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['title', 'description', 'level', 'price', 'thumbnail', 'content_blocks']
