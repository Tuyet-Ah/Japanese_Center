from django.db import models
from .ExamQuestion import ExamQuestion


class FibAnswer(models.Model):
    """Đáp án hợp lệ cho câu điền từ (Class Table: bảng con của questions)"""

    question        = models.ForeignKey(ExamQuestion, on_delete=models.CASCADE, related_name='fib_answers')
    acceptable_text = models.CharField(max_length=255, help_text='Chuỗi đáp án được chấp nhận')
    is_case_sensitive = models.BooleanField(
        default=False,
        help_text='Có phân biệt hoa/thường không? Mặc định: không phân biệt'
    )

    class Meta:
        db_table = 'fib_answers'

    def __str__(self):
        return f'"{self.acceptable_text}" (case={self.is_case_sensitive})'
