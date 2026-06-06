from django.db import models
from .User import User

class ForumTopic(models.Model):
    CATEGORY_CHOICES = [
        ('grammar', 'Ngữ pháp & Từ vựng'),
        ('jlpt', 'JLPT & Luyện thi'),
        ('share', 'Chia sẻ kinh nghiệm'),
        ('find', 'Tìm bạn luyện tập'),
        ('qa', 'Hỏi đáp khóa học'),
        ('material', 'Tài liệu & Sách'),
        ('other', 'Khác'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    content = models.TextField()
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)