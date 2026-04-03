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
    LEVEL_CHOICES = [('N5','N5'), ('N4','N4'), ('N3','N3'), ('N2','N2'), ('N1','N1')]
    title = models.CharField(max_length=255)
    description = models.TextField()
    level = models.CharField(max_length=2, choices=LEVEL_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    thumbnail = models.ImageField(upload_to='courses/')
    created_at = models.DateTimeField(auto_now_add=True)

class Chapter(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

class Lesson(models.Model):
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    video_url = models.URLField(blank=True)
    pdf_file = models.FileField(upload_to='lessons/pdfs/', blank=True)
    order = models.PositiveIntegerField(default=0)

# 3. Giỏ hàng và Đăng ký
class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

class Enrollment(models.Model):
    STATUS_CHOICES = (('pending', 'Pending'), ('paid', 'Paid'), ('rejected', 'Rejected'))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    payment_proof = models.ImageField(upload_to='proofs/', null=True, blank=True)
    enrolled_at = models.DateTimeField(auto_now_add=True)

# 4. Hệ thống Quiz & Question
class Quiz(models.Model):
    TYPE_CHOICES = (
        ('lesson', 'Bài tập bài học'),
        ('chapter', 'Kiểm tra chương'),
        ('final', 'Thi cuối khóa'),
        ('practice', 'Luyện thi tự do'),
    )
    quiz_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='lesson')
    title = models.CharField(max_length=255)
    time_limit = models.PositiveIntegerField(default=30) # minutes

    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='quiz', null=True, blank=True)
    chapter = models.OneToOneField(Chapter, on_delete=models.CASCADE, related_name='chapter_quiz', null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='course_quizzes', null=True, blank=True)
    level = models.CharField(max_length=2, choices=Course.LEVEL_CHOICES, null=True, blank=True)

   # def __str__(self):
   #     return f"[{self.get_quiz_type_display()}] {self.title}"
class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    opt_a = models.CharField(max_length=255)
    opt_b = models.CharField(max_length=255)
    opt_c = models.CharField(max_length=255)
    opt_d = models.CharField(max_length=255)
    correct = models.CharField(max_length=1, choices=[('A','A'),('B','B'),('C','C'),('D','D')])
    explanation = models.TextField(blank=True)

# 5. Theo dõi tiến độ & Điểm số (AI Data Source)
class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

class QuizSubmission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.FloatField()
    submitted_at = models.DateTimeField(auto_now_add=True)

