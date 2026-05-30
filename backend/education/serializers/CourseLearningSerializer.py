from rest_framework import serializers
from education.models import Course, Chapter, Lesson


class LessonLearningSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ["id", "title", "description", "video_url", "pdf_file", "order", "is_completed"]

    def get_is_completed(self, obj):
        completed_ids = self.context.get("completed_ids", set())
        return obj.id in completed_ids


class ChapterLearningSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Chapter
        fields = ["id", "title", "order", "lessons"]

    def get_lessons(self, obj):
        lessons = obj.lessons.order_by("order", "id")
        return LessonLearningSerializer(lessons, many=True, context=self.context).data


class CourseLearningSerializer(serializers.ModelSerializer):
    chapters = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ["id", "title", "description", "chapters"]

    def get_chapters(self, obj):
        chapters = obj.chapters.order_by("order", "id")
        return ChapterLearningSerializer(chapters, many=True, context=self.context).data
