from django.db import models
from .QuestionGroup import QuestionGroup


class ExamQuestion(models.Model):
    """Câu hỏi chi tiết — thực thể cha trong Class Table Inheritance"""

    QUESTION_TYPE_CHOICES = [
        ('MULTIPLE_CHOICE', 'Trắc nghiệm'),
        ('FILL_IN_BLANK',   'Điền từ'),
    ]

    group           = models.ForeignKey(QuestionGroup, on_delete=models.CASCADE, related_name='questions')
    question_number = models.PositiveSmallIntegerField(default=1)
    content         = models.TextField(help_text='Nội dung câu hỏi')
    question_type   = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES)
    points          = models.PositiveSmallIntegerField(default=1)
    explain_text    = models.TextField(blank=True, help_text='Giải thích đáp án sau khi nộp bài')

    class Meta:
        db_table = 'questions'
        ordering = ['question_number']

    def __str__(self):
        return f'Q{self.question_number}: {self.content[:50]}'
