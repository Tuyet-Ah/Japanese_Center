from django.db import models
from .ExamSection import ExamSection


class QuestionGroup(models.Model):
    """Nhóm câu hỏi — chứa đoạn văn hoặc audio dùng chung cho nhiều câu"""

    GROUP_TYPE_CHOICES = [
        ('text', 'Đoạn văn bản'),
        ('audio', 'File nghe'),
        ('none', 'Không có ngữ liệu'),
    ]

    section      = models.ForeignKey(ExamSection, on_delete=models.CASCADE, related_name='question_groups')
    instruction  = models.TextField(blank=True, help_text='Hướng dẫn cho nhóm câu hỏi')
    passage_text = models.TextField(blank=True, help_text='Đoạn văn đọc hiểu')
    audio_url    = models.URLField(blank=True, null=True, help_text='URL file audio nghe')
    group_type   = models.CharField(max_length=10, choices=GROUP_TYPE_CHOICES, default='none')
    order_index  = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = 'question_groups'
        ordering = ['order_index']

    def __str__(self):
        return f'Group #{self.pk} — {self.section.name}'
