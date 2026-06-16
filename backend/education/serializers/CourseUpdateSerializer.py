from django.db import transaction
from rest_framework import serializers
from education.models import Course, Chapter, Lesson


class LessonUpdateSerializer(serializers.Serializer):
    id          = serializers.IntegerField(required=False, allow_null=True)
    title       = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True, default='')
    video_url   = serializers.URLField(required=False, allow_blank=True, default='')
    order       = serializers.IntegerField(required=False, default=0)


class ChapterUpdateSerializer(serializers.Serializer):
    id      = serializers.IntegerField(required=False, allow_null=True)
    title   = serializers.CharField()
    order   = serializers.IntegerField(required=False, default=0)
    lessons = LessonUpdateSerializer(many=True, required=False, default=list)


class CourseUpdateSerializer(serializers.Serializer):
    title          = serializers.CharField(required=False)
    description    = serializers.CharField(required=False, allow_blank=True)
    level          = serializers.CharField(required=False)
    price          = serializers.DecimalField(required=False, max_digits=10, decimal_places=2)
    thumbnail      = serializers.ImageField(required=False, allow_null=True)
    content_blocks = serializers.ListField(required=False, default=list)
    chapters       = serializers.JSONField(required=False)   # nhận cả list lẫn JSON string

    def validate_chapters(self, value):
        """Parse nếu chapters được gửi dưới dạng JSON string (FormData multipart)."""
        import json
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except (ValueError, TypeError):
                raise serializers.ValidationError("chapters phải là JSON hợp lệ.")
        return value

    @transaction.atomic
    def update(self, instance, validated_data):
        chapters_data = validated_data.pop('chapters', None)

        # Cập nhật các trường cơ bản của Course
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if chapters_data is None:
            # Không gửi chapters → không thay đổi cấu trúc
            return instance

        # --- Upsert chapters & lessons (chapters_data là list of dict) ---
        # Đảm bảo mỗi phần tử là dict (phòng trường hợp JSONField trả về object lạ)
        chapters_data = [dict(c) for c in chapters_data]
        incoming_chapter_ids = [c['id'] for c in chapters_data if c.get('id')]
        # Xóa những chapter không còn trong payload
        instance.chapters.exclude(pk__in=incoming_chapter_ids).delete()

        for order_idx, chapter_data in enumerate(chapters_data, start=1):
            chapter_id    = chapter_data.pop('id', None)
            lessons_data  = chapter_data.pop('lessons', [])
            chapter_data.setdefault('order', order_idx)

            if chapter_id:
                chapter = Chapter.objects.filter(pk=chapter_id, course=instance).first()
                if chapter:
                    for attr, val in chapter_data.items():
                        setattr(chapter, attr, val)
                    chapter.save()
                else:
                    chapter = Chapter.objects.create(course=instance, **chapter_data)
            else:
                chapter = Chapter.objects.create(course=instance, **chapter_data)

            # Upsert lessons trong chapter này
            incoming_lesson_ids = [l['id'] for l in lessons_data if l.get('id')]
            chapter.lessons.exclude(pk__in=incoming_lesson_ids).delete()

            for lesson_order, lesson_data in enumerate(lessons_data, start=1):
                lesson_id = lesson_data.pop('id', None)
                lesson_data.setdefault('order', lesson_order)

                if lesson_id:
                    lesson = Lesson.objects.filter(pk=lesson_id, chapter=chapter).first()
                    if lesson:
                        for attr, val in lesson_data.items():
                            setattr(lesson, attr, val)
                        lesson.save()
                    else:
                        Lesson.objects.create(chapter=chapter, **lesson_data)
                else:
                    Lesson.objects.create(chapter=chapter, **lesson_data)

        return instance
