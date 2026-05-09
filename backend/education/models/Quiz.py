from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Q
from .Course import Course
from .Chapter import Chapter
from .Lesson import Lesson

class Quiz(models.Model):
    TYPE_CHOICES = (
        ('lesson', 'Bài tập bài học'),
        ('chapter', 'Kiểm tra chương'),
        ('final', 'Thi cuối khóa'),
        ('practice', 'Luyện thi tự do'),
    )
    quiz_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='lesson')
    title = models.CharField(max_length=255)
    time_limit = models.PositiveIntegerField(default=30) # minutes

    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='quiz', null=True, blank=True)
    chapter = models.OneToOneField(Chapter, on_delete=models.CASCADE, related_name='chapter_quiz', null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='course_quizzes', null=True, blank=True)
    level = models.CharField(max_length=2, choices=Course.LEVEL_CHOICES, null=True, blank=True)

    def clean(self):
        set_count = sum(
            1 for field in [self.lesson_id, self.chapter_id, self.course_id] if field is not None
        )
        if set_count != 1:
            raise ValidationError('Quiz must have exactly one of lesson, chapter, or course set.')

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    (Q(lesson__isnull=False) & Q(chapter__isnull=True) & Q(course__isnull=True)) |
                    (Q(lesson__isnull=True) & Q(chapter__isnull=False) & Q(course__isnull=True)) |
                    (Q(lesson__isnull=True) & Q(chapter__isnull=True) & Q(course__isnull=False))
                ),
                name='quiz_exactly_one_fk'
            )
        ]

