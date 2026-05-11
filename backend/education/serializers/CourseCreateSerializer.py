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
    chapters = ChapterCreateSerializer(many=True, required=False)

    class Meta:
        model = Course
        fields = ['title', 'description', 'level', 'price', 'thumbnail', 'content_blocks', 'chapters']
        extra_kwargs = {
            'thumbnail': {'required': False, 'allow_null': True} # Thêm dòng này
        }

    def create(self, validated_data):
        chapters_data = validated_data.pop('chapters', [])
        with transaction.atomic():
            course = Course.objects.create(**validated_data)
            for chapter_index, chapter_data in enumerate(chapters_data, start=1):
                lessons_data = chapter_data.pop('lessons', [])
                if 'order' not in chapter_data:
                    chapter_data['order'] = chapter_index
                chapter = Chapter.objects.create(course=course, **chapter_data)

                for lesson_index, lesson_data in enumerate(lessons_data, start=1):
                    if 'order' not in lesson_data:
                        lesson_data['order'] = lesson_index
                    Lesson.objects.create(chapter=chapter, **lesson_data)
        return course
