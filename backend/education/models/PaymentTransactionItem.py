from django.db import models
from .Course import Course
from .PaymentTransaction import PaymentTransaction


class PaymentTransactionItem(models.Model):
    payment = models.ForeignKey(
        PaymentTransaction,
        on_delete=models.CASCADE,
        related_name='items'
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
