from django.db import models
from .User import User
from .Lesson import Lesson

class LessonNote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    content = models.TextField()
    video_timestamp = models.PositiveIntegerField(default=0) # Giây thứ bao nhiêu trong video
    created_at = models.DateTimeField(auto_now_add=True)