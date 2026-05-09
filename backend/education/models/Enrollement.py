from django.db import models
from .User import User
from .Course import Course

class Enrollment(models.Model):
    STATUS_CHOICES = (('pending', 'Pending'), ('paid', 'Paid'), ('rejected', 'Rejected'))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    payment_proof = models.ImageField(upload_to='proofs/', null=True, blank=True)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'course'], name='uniq_enrollment_user_course')
        ]
        indexes = [
            models.Index(fields=['user', 'status'], name='idx_enrollment_user_status')
        ]