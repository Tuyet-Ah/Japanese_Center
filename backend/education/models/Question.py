from django.db import models
from .Quiz import Quiz

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    opt_a = models.CharField(max_length=255)
    opt_b = models.CharField(max_length=255)
    opt_c = models.CharField(max_length=255)
    opt_d = models.CharField(max_length=255)
    correct = models.CharField(max_length=1, choices=[('A','A'),('B','B'),('C','C'),('D','D')])
    explanation = models.TextField(blank=True)