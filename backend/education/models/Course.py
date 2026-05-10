from django.db import models
class Course(models.Model):
    LEVEL_CHOICES = [('N5','N5'), ('N4','N4'), ('N3','N3'), ('N2','N2'), ('N1','N1')]
    title = models.CharField(max_length=255)
    description = models.TextField()
    level = models.CharField(max_length=2, choices=LEVEL_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    thumbnail = models.ImageField(upload_to='courses/',null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

