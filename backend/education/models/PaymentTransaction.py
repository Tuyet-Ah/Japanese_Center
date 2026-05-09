from django.db import models
from .User import User


class PaymentTransaction(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    vnp_txn_ref = models.CharField(max_length=64, unique=True)
    order_info = models.CharField(max_length=255)
    vnp_response_code = models.CharField(max_length=8, blank=True)
    vnp_transaction_status = models.CharField(max_length=8, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
