from django.db import models
from .Quiz import Quiz


class Section(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=255)
    max_score = models.PositiveIntegerField(default=0)
    order_index = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order_index', 'id']
