from django.db import models
from django.contrib.auth.models import AbstractUser

# QUản lý tài khoản phân quyền
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Quản trị viên'),
        ('teacher', 'Giáo viên'),
        ('student', 'Học viên'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    is_admin_pending = models.BooleanField(default=False)
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)