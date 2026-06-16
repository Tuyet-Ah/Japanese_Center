from django.db import transaction
from rest_framework import serializers

from education.models import Chapter, Course, Lesson


class LessonCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['title', 'video_url', 'pdf_file', 'order']
        extra_kwargs = {
            'video_url': {'required': False, 'allow_blank': True},
            'pdf_file': {'required': False, 'allow_null': True},
            'order': {'required': False},
        }


class ChapterCreateSerializer(serializers.ModelSerializer):
    lessons = LessonCreateSerializer(many=True, required=False)

    class Meta:
        model = Chapter
        fields = ['title', 'order', 'lessons']
        extra_kwargs = {
            'order': {'required': False},
        }


class CourseCreateSerializer(serializers.ModelSerializer):
    chapters = serializers.JSONField(required=False, default=list)

    class Meta:
        model = Course
        fields = ['title', 'description', 'level', 'price', 'thumbnail', 'content_blocks', 'chapters']
        extra_kwargs = {
            'thumbnail': {'required': False, 'allow_null': True}
        }

    def validate_chapters(self, value):
        """Parse nếu chapters gửi dưới dạng JSON string từ FormData."""
        import json
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except (ValueError, TypeError):
                raise serializers.ValidationError("chapters phải là JSON hợp lệ.")
        return value

    def create(self, validated_data):
        chapters_data = validated_data.pop('chapters', [])
        with transaction.atomic():
            course = Course.objects.create(**validated_data)
            for chapter_index, chapter_data in enumerate(chapters_data, start=1):
                # chapter_data là raw dict từ JSONField
                chapter_data = dict(chapter_data)
                lessons_data = chapter_data.pop('lessons', [])
                if 'order' not in chapter_data:
                    chapter_data['order'] = chapter_index
                # Loại bỏ id nếu có (khi tạo mới không cần)
                chapter_data.pop('id', None)
                chapter = Chapter.objects.create(course=course, **chapter_data)

                for lesson_index, lesson_data in enumerate(lessons_data, start=1):
                    lesson_data = dict(lesson_data)
                    lesson_data.pop('id', None)
                    if 'order' not in lesson_data:
                        lesson_data['order'] = lesson_index
                    Lesson.objects.create(chapter=chapter, **lesson_data)
        return course
