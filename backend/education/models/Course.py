from django.db import models
from .User import User
class Course(models.Model):
    LEVEL_CHOICES = [('N5','N5'), ('N4','N4'), ('N3','N3'), ('N2','N2'), ('N1','N1')]
    title = models.CharField(max_length=255)
    description = models.TextField()
    level = models.CharField(max_length=2, choices=LEVEL_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    thumbnail = models.ImageField(upload_to='courses/')
    created_at = models.DateTimeField(auto_now_add=True)

class CourseReview(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(default=5) # 1 -> 5 sao
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'course') # Một người chỉ đánh giá 1 khóa học 1 lần