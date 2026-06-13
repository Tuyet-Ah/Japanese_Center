from django.db import models
from .ExamQuestion import ExamQuestion


class McqOption(models.Model):
    """Lựa chọn trắc nghiệm (Class Table: bảng con của questions)"""

    question    = models.ForeignKey(ExamQuestion, on_delete=models.CASCADE, related_name='mcq_options')
    content     = models.CharField(max_length=512)
    is_correct  = models.BooleanField(default=False)
    order_index = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = 'mcq_options'
        ordering = ['order_index']

    def __str__(self):
        marker = '✓' if self.is_correct else ' '
        return f'[{marker}] {self.content[:60]}'
