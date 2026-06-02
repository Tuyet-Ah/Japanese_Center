from django.db import models
from .User import User

class ForumTopic(models.Model):
    CATEGORY_CHOICES = [('grammar', 'Ngữ pháp'), ('kanji', 'Kanji'), ('jlpt', 'Luyện thi'), ('other', 'Khác')]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    content = models.TextField()
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)