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
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

class Course(models.Model):
    LEVELS = [('N5', 'N5'), ('N4', 'N4'), ('N3', 'N3'), ('N2', 'N2'), ('N1', 'N1')]
    title = models.CharField(max_length=255)
    level = models.CharField(max_length=2, choices=LEVELS)
    description = models.TextField()
    duration_weeks = models.IntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=0)
    thumbnail = models.ImageField(upload_to='courses/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.level}] {self.title}"

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255, verbose_name = "Tên bài học")
    video_url = models.URLField(blank=True, help_text = "Link video bài giảng")
    content = models.TextField(blank = True, verbose_name = "Nội dung") # Chứa bài tập hoặc nội dung bài giảng
    order = models.IntegerField(default=1)
    attachment = models.FileField(upload_to='lessons/files/', blank=True, null=True, verbose_name="Tài liệu đính kèm")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        unique_together = ('course','order')
    
    def __str__(self):
        return f"{self.course.title} - Bài {self.order}: {self.title}"
#lớp học hiện đang hoạt động
class JapaneseClass(models.Model):
    class_name = models.CharField(max_length=100)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'teacher'})
    start_date = models.DateField()
    status = models.CharField(max_length=20, default='pending')
#  Đăng ký  
class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    japanese_class = models.ForeignKey(JapaneseClass, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)
# Điểm danh
class Attendance(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE)
    date = models.DateField()
    is_present = models.BooleanField(default=True)