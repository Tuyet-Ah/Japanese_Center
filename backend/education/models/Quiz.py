from django.db import models
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

