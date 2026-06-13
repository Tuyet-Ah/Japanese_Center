from django.db import models


class Exam(models.Model):
    """Đề thi tổng quan (JLPT & Điền từ)"""

    LEVEL_CHOICES = [
        ('N5', 'N5'), ('N4', 'N4'), ('N3', 'N3'), ('N2', 'N2'), ('N1', 'N1'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Nháp'),
        ('published', 'Công bố'),
        ('hidden', 'Ẩn'),
    ]

    title        = models.CharField(max_length=255)
    level        = models.CharField(max_length=2, choices=LEVEL_CHOICES)
    duration     = models.PositiveIntegerField(help_text='Thời lượng làm bài (phút)')
    total_score  = models.PositiveIntegerField(default=100)
    status       = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'exams'
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.level}] {self.title}'
