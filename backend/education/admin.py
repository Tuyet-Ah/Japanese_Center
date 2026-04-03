from django.contrib import admin
from .models import User, Course, Chapter, Lesson, Enrollment, CartItem,Question,Quiz,QuizSubmission,UserProgress

# Cho phép tạo Lesson ngay trong trang Chapter
class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1

class ChapterAdmin(admin.ModelAdmin):
    inlines = [LessonInline]

# Đăng ký các bảng vào trang Admin
admin.site.register(User)
admin.site.register(Course)
admin.site.register(Chapter, ChapterAdmin)
admin.site.register(Lesson)
admin.site.register(Enrollment)
admin.site.register(CartItem)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(QuizSubmission)
admin.site.register(UserProgress)