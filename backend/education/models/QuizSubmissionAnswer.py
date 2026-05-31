from django.db import models
from .QuizAubmission import QuizSubmission
from .Question import Question


class QuizSubmissionAnswer(models.Model):
    submission = models.ForeignKey(QuizSubmission, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='submission_answers')
    selected_choice = models.CharField(max_length=1)
    is_correct = models.BooleanField(default=False)

    class Meta:
        unique_together = ('submission', 'question')
        indexes = [
            models.Index(fields=['submission'], name='idx_submission_answer')
        ]
