from django.db import models
from .Question import Question


class FIBAnswer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='fib_answers')
    acceptable_text = models.CharField(max_length=255)
    is_case_sensitive = models.BooleanField(default=False)
