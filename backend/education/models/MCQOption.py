from django.db import models
from .Question import Question


class MCQOption(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='mcq_options')
    content = models.TextField()
    is_correct = models.BooleanField(default=False)
    order_index = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order_index', 'id']
