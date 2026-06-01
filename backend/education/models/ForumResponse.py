from django.db import models
from .User import User
from .ForumTopic import ForumTopic

class ForumResponse(models.Model):
    topic = models.ForeignKey(ForumTopic, on_delete=models.CASCADE, related_name='responses')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(blank=True, default="")
    image_file = models.ImageField(upload_to='forum_responses/images/', blank=True, null=True)
    image_url = models.URLField(blank=True, default="")
    link_url = models.URLField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)