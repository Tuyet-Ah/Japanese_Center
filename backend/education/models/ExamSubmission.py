from django.db import models
from .User import User
from .Exam import Exam


class ExamSubmission(models.Model):
    """Lưu kết quả mỗi lần học viên nộp bài thi JLPT."""

    user            = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_submissions')
    exam            = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='submissions')
    total_score     = models.FloatField(default=0)
    max_score       = models.PositiveIntegerField(default=0)
    correct_count   = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    duration_seconds = models.PositiveIntegerField(default=0)
    # Lưu chi tiết đáp án dưới dạng JSON để xem lại
    details_json    = models.JSONField(default=list, blank=True,
                                       help_text='List các chi tiết chấm điểm từng câu')
    submitted_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'exam_submissions'
        ordering = ['-submitted_at']

    @property
    def score_percent(self):
        if not self.max_score:
            return 0
        return round(self.total_score / self.max_score * 100, 1)

    def __str__(self):
        return f'{self.user.username} — {self.exam.title} — {self.total_score}/{self.max_score}'
