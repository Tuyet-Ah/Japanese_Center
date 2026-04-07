from django.db import models
from .User import User
from .ForumTopic import ForumTopic

class ForumResponse(models.Model):
    topic = models.ForeignKey(ForumTopic, on_delete=models.CASCADE, related_name='responses')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)