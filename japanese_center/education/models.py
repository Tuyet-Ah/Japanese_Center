from django.db import models

class Course(models.Model):
    LEVELS = [('N5', 'N5'), ('N4', 'N4'), ('N3', 'N3'), ('N2', 'N2'), ('N1', 'N1')]
    title = models.CharField(max_length=255)
    level = models.CharField(max_length=2, choices=LEVELS)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='courses/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.level}] {self.title}"

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    video_url = models.URLField(blank=True)
    content = models.TextField() # Chứa bài tập hoặc nội dung bài giảng
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order']