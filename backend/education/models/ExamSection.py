from django.db import models
from .Exam import Exam


class ExamSection(models.Model):
    """Phần thi lớn trong một đề thi (VD: Từ vựng, Ngữ pháp, Đọc hiểu)"""

    exam        = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='sections')
    name        = models.CharField(max_length=255)
    max_score   = models.PositiveIntegerField(default=0)
    order_index = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = 'sections'
        ordering = ['order_index']

    def __str__(self):
        return f'{self.exam.title} — {self.name}'
