from django.db import models
from .User import User


class AdminActivityLog(models.Model):
    """Ghi nhật ký mọi thao tác của admin trên hệ thống."""

    ACTION_CHOICES = [
        # Tài khoản
        ('approve_user',    'Duyệt tài khoản'),
        ('reject_user',     'Từ chối tài khoản'),
        # Khóa học
        ('create_course',   'Thêm khóa học'),
        ('update_course',   'Sửa khóa học'),
        ('delete_course',   'Xóa khóa học'),
        ('create_chapter',  'Thêm chương'),
        ('update_chapter',  'Sửa chương'),
        ('delete_chapter',  'Xóa chương'),
        # Đề thi JLPT
        ('create_exam',     'Thêm đề thi'),
        ('update_exam',     'Sửa đề thi'),
        ('delete_exam',     'Xóa đề thi'),
        # Forum
        ('approve_topic',   'Duyệt bài thảo luận'),
        ('reject_topic',    'Từ chối bài thảo luận'),
    ]

    STATUS_CHOICES = [
        ('success', 'Thành công'),
        ('failed',  'Thất bại'),
    ]

    admin             = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    action_type       = models.CharField(max_length=30, choices=ACTION_CHOICES)
    target_description = models.CharField(max_length=255, blank=True, help_text='Tên đối tượng bị tác động')
    status            = models.CharField(max_length=10, choices=STATUS_CHOICES, default='success')
    timestamp         = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'admin_activity_logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f'[{self.admin.username}] {self.action_type} — {self.target_description}'
