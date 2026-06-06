from django.db import models
from .Quiz import Quiz
from .QuestionGroup import QuestionGroup

class Question(models.Model):
    QUESTION_TYPE_CHOICES = (
        ('MULTIPLE_CHOICE', 'Trắc nghiệm'),
        ('FILL_IN_BLANK', 'Điền vào chỗ trống'),
    )

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    group = models.ForeignKey(QuestionGroup, on_delete=models.CASCADE, related_name='questions', null=True, blank=True)
    question_number = models.PositiveIntegerField(default=1)
    text = models.TextField()
    question_type = models.CharField(max_length=30, choices=QUESTION_TYPE_CHOICES, default='MULTIPLE_CHOICE')
    points = models.DecimalField(max_digits=3, decimal_places=1, default=1.0)
    opt_a = models.CharField(max_length=255, blank=True, default='')
    opt_b = models.CharField(max_length=255, blank=True, default='')
    opt_c = models.CharField(max_length=255, blank=True, default='')
    opt_d = models.CharField(max_length=255, blank=True, default='')
    correct = models.CharField(max_length=64, blank=True, default='')
    explanation = models.TextField(blank=True)
