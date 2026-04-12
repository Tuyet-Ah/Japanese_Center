from django.db import models
from .Chapter import Chapter
class Lesson(models.Model):
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    video_url = models.URLField(blank=True)
    pdf_file = models.FileField(upload_to='lessons/pdfs/', blank=True)
    order = models.PositiveIntegerField(default=0)